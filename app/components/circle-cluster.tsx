"use client";

import { useEffect, useRef } from "react";
import { separateCircles } from "./circle-collisions";
import { createCircleField, type FieldCircle } from "./circle-layout";

const reach = 47;
const maxNudge = 69.825;

export function CircleCluster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvasRef.current;
    const drawingContext = element?.getContext("2d");
    if (!element || !drawingContext) return;
    const canvas: HTMLCanvasElement = element;
    const context: CanvasRenderingContext2D = drawingContext;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const styles = getComputedStyle(canvas);
    let groups: { fill: string; circles: FieldCircle[] }[] = [];
    let circles: FieldCircle[] = [];
    let pointer: { x: number; y: number } | undefined;
    let frame = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 0;

    function draw() {
      context.clearRect(0, 0, width, height);
      for (const group of groups) {
        context.fillStyle = group.fill;
        context.beginPath();
        for (const { x, y, radius, offsetX, offsetY } of group.circles) {
          context.moveTo(x + offsetX + radius, y + offsetY);
          context.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
        }
        context.fill();
      }
    }

    function requestMotion() {
      if (!frame && !reducedMotion.matches) {
        previousTime = 0;
        frame = requestAnimationFrame(animate);
      }
    }

    function animate(time: number) {
      const elapsed = previousTime ? Math.min(time - previousTime, 32) : 16;
      const blend = 1 - Math.exp(-elapsed / 85);
      previousTime = time;
      let hasChanges = false;

      for (const circle of circles) {
        let targetX = 0;
        let targetY = 0;
        if (pointer) {
          const dx = circle.x - pointer.x;
          const dy = circle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const edgeDistance = Math.max(0, distance - circle.radius);
          if (edgeDistance < reach) {
            const sizeFactor = 1 / (1 + circle.radius / 12);
            const nudge = maxNudge * sizeFactor * (1 - edgeDistance / reach) ** 2;
            const angle = distance < 1 ? -Math.PI / 2 : Math.atan2(dy, dx);
            targetX = Math.cos(angle) * nudge;
            targetY = Math.sin(angle) * nudge;
          }
        }

        circle.nextX = circle.offsetX + (targetX - circle.offsetX) * blend;
        circle.nextY = circle.offsetY + (targetY - circle.offsetY) * blend;
        if (Math.hypot(targetX - circle.nextX, targetY - circle.nextY) < .08) {
          circle.nextX = targetX;
          circle.nextY = targetY;
        }
        hasChanges ||= circle.nextX !== circle.offsetX || circle.nextY !== circle.offsetY;
      }

      if (!hasChanges || !separateCircles(circles, width, height)) {
        frame = 0;
        return;
      }

      let moving = false;
      for (const circle of circles) {
        moving ||= Math.hypot(circle.nextX - circle.offsetX, circle.nextY - circle.offsetY) > .005;
        circle.offsetX = circle.nextX;
        circle.offsetY = circle.nextY;
      }

      draw();
      frame = moving ? requestAnimationFrame(animate) : 0;
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      // Limit backing resolution on high-DPI displays and large monitors.
      const ratio = Math.min(devicePixelRatio, 2, Math.sqrt(5_000_000 / (bounds.width * bounds.height)));
      if (bounds.width === width && bounds.height === height && ratio === pixelRatio) return;

      width = bounds.width;
      height = bounds.height;
      pixelRatio = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      circles = createCircleField(width, height);
      const byColor = new Map<FieldCircle["color"], FieldCircle[]>();
      for (const circle of circles) {
        const bucket = byColor.get(circle.color) ?? [];
        bucket.push(circle);
        byColor.set(circle.color, bucket);
      }
      groups = Array.from(byColor, ([color, circles]) => ({
        fill: styles.getPropertyValue(`--color-${color}`).trim(),
        circles,
      }));
      draw();
    }

    function clearPointer() {
      pointer = undefined;
      requestMotion();
    }

    function movePointer(event: PointerEvent) {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientY >= bounds.bottom) {
        clearPointer();
        return;
      }
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      requestMotion();
    }

    function resetMotion() {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = undefined;
      for (const circle of circles) {
        circle.offsetX = 0;
        circle.offsetY = 0;
      }
      draw();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const listener = new AbortController();
    const options = { signal: listener.signal };
    window.addEventListener("pointermove", movePointer, options);
    document.documentElement.addEventListener("pointerleave", clearPointer, options);
    window.addEventListener("pointercancel", clearPointer, options);
    window.addEventListener("blur", clearPointer, options);
    window.addEventListener("resize", resize, options);
    reducedMotion.addEventListener("change", resetMotion, options);

    return () => {
      listener.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" aria-hidden="true" />;
}
