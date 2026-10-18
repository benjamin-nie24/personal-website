export const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0., 1.);
}
`;

export const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 resolution;
uniform float time, previousPlanet, planet, progress, spin, pixelRatio;
uniform sampler2D earthMap, marsMap, jupiterMap, saturnMap, uranusMap;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + 1.), f.x), f.y);
}

float fbm(vec2 p) {
  float n = 0., a = .5;
  for (int i = 0; i < 5; i++) {
    n += a * noise(p);
    p = mat2(.8, .6, -.6, .8) * p * 2.03 + 4.7;
    a *= .5;
  }
  return n;
}

vec3 space(vec2 uv) {
  float band = exp( -pow((uv.y - uv.x * .45 - .22 + (fbm(uv * 3.) - .5) * .2) * 5., 2.));
  float dust = fbm(uv * 7. + 12.);
  vec3 c = vec3(.004, .006, .005) + vec3(.033, .042, .032) * band * pow(dust, 2.);
  for (int i = 0; i < 3; i++) {
    float scale = 55. + float(i) * 63.;
    vec2 p = uv * scale, id = floor(p), f = fract(p) - .5;
    vec2 offset = vec2(hash(id + 7.), hash(id + 19.)) - .5;
    float d = length(f - offset * .7);
    float bright = pow(hash(id + 43.), 8.);
    float width = mix(.035, .08, bright);
    float light = exp( -d * d / (width * width)) * step(.955 - band * .04, hash(id + float(i) * 72.));
    vec3 tint = mix(vec3(.72, .82, 1.), vec3(1., .88, .69), hash(id + 91.));
    c += tint * light * (.17 + bright * 1.9) / (1. + float(i) * .5);
  }
  return c;
}

vec3 starTrails(vec2 uv, float strength) {
  vec2 p = uv - vec2(resolution.x / resolution.y * .52, .51);
  vec3 c = vec3(0.);
  for (int i = 0; i < 28; i++) {
    float seed = hash(vec2(float(i), 18.));
    float a = seed * 6.283185;
    vec2 direction = vec2(cos(a), sin(a));
    float radius = fract(hash(vec2(float(i), 72.)) + time * .43) * 1.6;
    float along = dot(p, direction), across = dot(p, vec2( -direction.y, direction.x));
    float width = .0008 + seed * .0012;
    float trail = exp( -across * across / (width * width));
    trail *= smoothstep(radius - .12 - strength * .20, radius, along) * (1. - smoothstep(radius, radius + .008, along));
    trail *= smoothstep(.08, .30, radius) * (1. - smoothstep(1.2, 1.6, radius));
    c += mix(vec3(.45, .62, .47), vec3(.78, .86, .92), seed) * trail * strength * .65;
  }
  return c;
}

vec3 mapColor(sampler2D map, vec2 uv) {
  float wrapped = fract(uv.x);
  float seam = 1. - smoothstep(0., .025, min(wrapped, 1. - wrapped));
  uv.x = wrapped;
  vec3 color = texture2D(map, uv).rgb;
  // A restrained detail pass compensates for magnifying the large, cropped globe.
  vec2 texel = vec2(1. / 1774., 1. / 887.);
  vec3 neighbors = texture2D(map, vec2(fract(uv.x + texel.x), uv.y)).rgb
 + texture2D(map, vec2(fract(uv.x - texel.x), uv.y)).rgb
 + texture2D(map, uv + vec2(0., texel.y)).rgb
 + texture2D(map, uv - vec2(0., texel.y)).rgb;
  color = clamp(color + (color - neighbors * .25) * .58, 0., 1.);
  return mix(color, texture2D(map, vec2(1. - uv.x, uv.y)).rgb, seam * .5);
}

vec3 surface(vec3 n, float kind) {
  float longitude = atan(n.x, n.z) + spin;
  float latitude = asin(clamp(n.y, -1., 1.));
  // Continuous longitude + repeat wrapping keeps the map attached to the sphere.
  vec2 uv = vec2(longitude / 6.283185 + .52, .5 - latitude / 3.141593);
  if (kind < .5)return mapColor(earthMap, uv);
  if (kind < 1.5)return mapColor(marsMap, uv);
  if (kind < 2.5)return mapColor(jupiterMap, uv);
  if (kind < 3.5)return mapColor(saturnMap, uv);
  return mapColor(uranusMap, uv);
}

vec3 scene(vec2 uv, vec3 bg, float kind, float travel, float scale) {
  float mobile = 1. - step(700., resolution.x / pixelRatio);
  float home = 1. - step(.5, kind);
  float radius = mix(.43, .48, home) * resolution.x / resolution.y;
  vec2 center = vec2(mix(1.035, 1., home) * resolution.x / resolution.y, .5);
  // Screen coordinates use height as the unit; mobile planets sit above the copy.
  radius = mix(radius, .56 * resolution.x / resolution.y, mobile);
  radius *= scale;
  center.y = mix(.5, 1. - 210. * pixelRatio / resolution.y, mobile);
  center.x += travel;
  vec2 p = (uv - center) / radius;
  float ca = cos( -.18), sa = sin( -.18);
  p = mat2(ca, -sa, sa, ca) * p;
  float flatten = kind > 1.5 ? .92 : 1.;
  vec2 sphere = vec2(p.x, p.y / flatten);
  float d = length(sphere), z = sqrt(max(0., 1. - d * d));
  vec3 light = normalize(vec3( -.65, .35, .8));
  vec3 n = vec3(sphere, z);
  vec3 c = bg;
  float rings = step(2.5, kind) * (1. - step(3.5, kind));
  float iceRings = step(3.5, kind);
  float planeZ =  - ( -p.x * .30 + p.y * .88) / .42;
  float ringRadius = length(vec3(p, planeZ));
  float ringMask = smoothstep(1.22, 1.26, ringRadius) * (1. - smoothstep(2.1, 2.14, ringRadius));
  ringMask *= smoothstep(.006, .018, abs(ringRadius - 1.72));
  // Ring density stays fixed radially; only fine particles orbit.
  float grain = .25 + .45 * noise(vec2(ringRadius * 180., 4.)) + .18 * sin(ringRadius * 910.);
  float ringAlpha = ringMask * (.3 + grain * .55) * rings;
  ringAlpha += exp( -pow((ringRadius - 1.62) / .009, 2.)) * .22 * iceRings;
  float behind = step(planeZ, z) * step(d, 1.);
  vec3 ringColor = mix(vec3(.28, .26, .21), vec3(.78, .73, .61), grain);
  vec3 ringPoint = vec3(p, planeZ);
  float b = dot(ringPoint, light);
  float blocked = step(b, 0.) * step(0., b * b - dot(ringPoint, ringPoint) + 1.);
  ringColor *= 1. - blocked * .78;
  c = mix(c, ringColor, ringAlpha * (1. - behind));
  if (d < 1.) {
    float diffuse = max(0., dot(n, light));
    vec3 albedo = surface(n, kind);
    // A stronger terminator and restrained ambient light preserve surface contrast.
    vec3 lit = albedo * (.018 + pow(diffuse, 1.12) * 1.14);
    float rim = pow(1. - z, 3.) * smoothstep( -.05, .5, dot(n, light));
    vec3 atmosphere = kind < .5 ? vec3(.10, .39, .76) : (kind > 3.5 ? vec3(.31, .62, .67) : vec3(.30, .24, .16));
    lit += atmosphere * rim * .65;
    c = mix(c, lit, 1. - smoothstep(.996, 1., d));
    if (planeZ > z)c = mix(c, ringColor, ringAlpha);
  }
  float halo = exp( -max(d - 1., 0.) * 100.) * step(1., d);
  vec3 glow = kind < .5 ? vec3(.04, .18, .35) : (kind > 3.5 ? vec3(.07, .16, .16) : vec3(.11, .09, .05));
  c += glow * halo * .4;
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.y;
  float warp = smoothstep(.10, .34, progress) * (1. - smoothstep(.64, .94, progress));
  vec2 center = vec2(resolution.x / resolution.y * .52, .51);
  vec3 bg = space((uv - center) / (1. + warp * .16) + center - vec2(.5));
  vec3 c;
  if (progress > .999) {
    c = scene(uv, bg, planet, 0., 1.);
  }
  else {
    // Skip invisible planets instead of shading both throughout the flight.
    c = bg;
    if (progress < .39) {
      float departure = smoothstep(0., .36, progress);
      vec3 departing = scene(uv, bg, previousPlanet, -departure * .48, mix(1., .07, departure));
      c = mix(bg, departing, 1. - smoothstep(.23, .39, progress));
    }
    if (progress > .54) {
      float arrival = smoothstep(.54, 1., progress);
      vec3 arriving = scene(uv, bg, planet, -(1. - arrival) * .40, mix(.045, 1., arrival));
      c = mix(c, arriving, smoothstep(.54, .73, progress));
    }
    if (warp > 0.) c += starTrails(uv, warp);
  }
  // Dim the entire scene on arrival: content can flow over any part of the planet.
  if (planet > .5) {
    float arrivalVeil = smoothstep(.78, 1., progress);
    float brightness = mix(.12, .28, smoothstep(.25, 1., gl_FragCoord.x / resolution.x));
    c *= mix(1., brightness, arrivalVeil);
  }
  c = pow(max(c, vec3(0.)), vec3(.97));
  gl_FragColor = vec4(c, 1.);
}
`;

