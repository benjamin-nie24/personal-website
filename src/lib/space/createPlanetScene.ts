import { DESTINATIONS } from "./destinations";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

const FLIGHT_DURATION_MS = 650;
const INTERRUPTED_FLIGHT_DURATION_MS = 120;
const ARRIVAL_PROGRESS = 0.91;
const ROTATION_PER_MS = 0.000008;
const MAX_FRAME_DELTA_MS = 100;
const FULLSCREEN_VERTICES = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1,
]);

export type FlightPhase = "flight" | "orbit";

export interface FlightState {
  phase: FlightPhase;
  from: number;
  to: number;
}

interface SceneCallbacks {
  onPhaseChange: (state: FlightState) => void;
  onFlightProgress: (progress: number) => void;
}

export interface PlanetSceneController {
  navigate: (destination: number) => void;
  dispose: () => void;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not allocate a planet shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? "Planet shader compilation failed.");
  }

  return shader;
}

/** Owns GPU resources and the animation loop; React only supplies a destination. */
export function createPlanetScene(
  canvas: HTMLCanvasElement,
  initialDestination: number,
  callbacks: SceneCallbacks,
): PlanetSceneController | null {
  const context = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const shaders: WebGLShader[] = [];
  const textures: WebGLTexture[] = [];
  const pendingImages: HTMLImageElement[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();

  function releaseResources() {
    pendingImages.forEach((image) => {
      image.onload = null;
      image.onerror = null;
    });
    textures.forEach((texture) => gl.deleteTexture(texture));
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  }

  try {
    if (!program || !buffer) throw new Error("Could not allocate planet resources.");

    shaders.push(compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    shaders.push(compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Could not link planet shaders.");
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_VERTICES, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) {
    console.error("Planet scene initialization failed:", error);
    releaseResources();
    return null;
  }

  const uniforms = {
    resolution: gl.getUniformLocation(program!, "resolution"),
    pixelRatio: gl.getUniformLocation(program!, "pixelRatio"),
    time: gl.getUniformLocation(program!, "time"),
    spin: gl.getUniformLocation(program!, "spin"),
    previousPlanet: gl.getUniformLocation(program!, "previousPlanet"),
    planet: gl.getUniformLocation(program!, "planet"),
    progress: gl.getUniformLocation(program!, "progress"),
  };
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  let frameId = 0;
  let lastFrameTime = 0;
  let elapsedSeconds = 0;
  let rotation = 0;
  let pixelRatio = 1;
  let activeDestination = initialDestination;
  let previousDestination = initialDestination;
  let requestedDestination = initialDestination;
  let progress = 1;
  let flightPhase: FlightPhase = "orbit";
  let disposed = false;
  let ready = false;

  function updatePhase(nextPhase: FlightPhase, force = false) {
    if (flightPhase === nextPhase && !force) return;
    flightPhase = nextPhase;
    callbacks.onPhaseChange({
      phase: nextPhase,
      from: previousDestination,
      to: activeDestination,
    });
  }

  function scheduleFrame() {
    if (!frameId && !disposed && !document.hidden) {
      frameId = requestAnimationFrame(paint);
    }
  }

  function paint(now: number) {
    frameId = 0;
    if (disposed || !ready) return;

    // Cap resume delays so switching back to the tab cannot jump the camera.
    const delta = lastFrameTime
      ? Math.min(MAX_FRAME_DELTA_MS, now - lastFrameTime)
      : 0;
    lastFrameTime = now;
    const reducedMotion = motionPreference.matches;

    // Finish an interrupted departure quickly, then visit only the latest request.
    // This preserves camera continuity without queuing long flights on rapid clicks.
    if (requestedDestination !== activeDestination && (progress === 1 || reducedMotion)) {
      previousDestination = activeDestination;
      activeDestination = requestedDestination;
      progress = reducedMotion ? 1 : 0;
      if (!reducedMotion) updatePhase("flight", true);
    }

    const duration = requestedDestination === activeDestination
      ? FLIGHT_DURATION_MS
      : INTERRUPTED_FLIGHT_DURATION_MS;
    progress = reducedMotion ? 1 : Math.min(1, progress + delta / duration);
    if (progress >= ARRIVAL_PROGRESS && requestedDestination === activeDestination) {
      updatePhase("orbit");
    }
    if (flightPhase === "flight") callbacks.onFlightProgress(progress);

    if (!reducedMotion) {
      elapsedSeconds += delta / 1_000;
      rotation += delta * ROTATION_PER_MS;
    }

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.pixelRatio, pixelRatio);
    gl.uniform1f(uniforms.time, elapsedSeconds);
    gl.uniform1f(uniforms.spin, rotation);
    gl.uniform1f(uniforms.previousPlanet, previousDestination);
    gl.uniform1f(uniforms.planet, activeDestination);
    gl.uniform1f(uniforms.progress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Reduced motion is rendered on demand rather than running a hidden loop.
    if (!reducedMotion) scheduleFrame();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    scheduleFrame();
  }

  function onVisibilityChange() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrameTime = 0;
    if (!document.hidden) scheduleFrame();
  }

  function loadTexture(destination: (typeof DESTINATIONS)[number], unit: number) {
    return new Promise<void>((resolve) => {
      const texture = gl.createTexture();
      if (!texture) {
        resolve();
        return;
      }
      textures.push(texture);

      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([70, 85, 80, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const samplerName = `${destination.planet.toLowerCase()}Map`;
      gl.uniform1i(gl.getUniformLocation(program!, samplerName), unit);

      const image = new Image();
      pendingImages.push(image);
      image.decoding = "async";
      image.fetchPriority = unit === initialDestination ? "high" : "low";
      image.onload = () => {
        if (!disposed) {
          // Native PNG uploads retain detail; no resizing or mipmap blur is introduced.
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          // Reduced-motion scenes also need a refresh if a map finishes after navigation.
          if (ready) scheduleFrame();
        }
        resolve();
      };
      image.onerror = () => {
        if (!disposed) console.error(`Could not load ${destination.planet}'s surface.`);
        resolve();
      };
      image.src = destination.texture;
    });
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", onVisibilityChange);
  motionPreference.addEventListener("change", scheduleFrame);

  // Prepare every sampler, but show the first planet as soon as its own map loads.
  // Other destinations warm the cache without blocking the initial render.
  const textureLoads = DESTINATIONS.map(loadTexture);
  textureLoads[initialDestination].then(() => {
    if (disposed) return;
    ready = true;
    canvas.classList.add("is-ready");
    resize();
  });

  return {
    navigate(destination) {
      requestedDestination = Math.max(0, Math.min(DESTINATIONS.length - 1, destination));
      scheduleFrame();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", scheduleFrame);
      canvas.classList.remove("is-ready");
      releaseResources();
    },
  };
}
