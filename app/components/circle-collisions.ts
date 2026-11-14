export type CirclePosition = {
  x: number;
  y: number;
  radius: number;
  offsetX: number;
  offsetY: number;
  nextX: number;
  nextY: number;
};

const maxPasses = 16;
const clearance = 0.15;

function keepInside(circle: CirclePosition, width: number, height: number) {
  const { x, y, radius } = circle;
  circle.nextX = Math.max(radius - x, Math.min(width - radius - x, circle.nextX));
  circle.nextY = Math.max(radius - y, Math.min(height - radius - y, circle.nextY));
}

export function separateCircles(circles: CirclePosition[], width: number, height: number) {
  for (const circle of circles) keepInside(circle, width, height);

  const ordered = [...circles];
  for (let pass = 0; pass <= maxPasses; pass++) {
    ordered.sort((a, b) => a.x + a.nextX - a.radius - (b.x + b.nextX - b.radius));
    let separated = false;

    for (let i = 0; i < ordered.length; i++) {
      const a = ordered[i];
      for (let j = i + 1; j < ordered.length; j++) {
        const b = ordered[j];
        const dx = b.x + b.nextX - (a.x + a.nextX);
        const minimum = a.radius + b.radius;
        if (dx >= minimum) break;

        const dy = b.y + b.nextY - (a.y + a.nextY);
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared >= minimum * minimum) continue;
        if (pass === maxPasses) return false;

        const distance = Math.sqrt(distanceSquared);
        const nx = distance ? dx / distance : 1;
        const ny = distance ? dy / distance : 0;
        const aPush = Math.max(0, (a.nextX - a.offsetX) * nx + (a.nextY - a.offsetY) * ny);
        const bPush = Math.max(0, -((b.nextX - b.offsetX) * nx + (b.nextY - b.offsetY) * ny));
        // A circle moving into a neighbor transfers the correction to that neighbor.
        const share = aPush + bPush > 0 ? aPush / (aPush + bPush) : 0.5;
        const correction = minimum - distance + clearance;
        a.nextX -= nx * correction * (1 - share);
        a.nextY -= ny * correction * (1 - share);
        b.nextX += nx * correction * share;
        b.nextY += ny * correction * share;
        keepInside(a, width, height);
        keepInside(b, width, height);

        // If the wall stops the neighbor, let the other circle yield instead.
        const remaining = minimum + clearance -
          ((b.x + b.nextX - a.x - a.nextX) * nx + (b.y + b.nextY - a.y - a.nextY) * ny);
        if (remaining > 0) {
          const yielding = share >= 0.5 ? a : b;
          const direction = yielding === a ? -1 : 1;
          yielding.nextX += direction * nx * remaining;
          yielding.nextY += direction * ny * remaining;
          keepInside(yielding, width, height);
        }
        separated = true;
      }
    }

    if (!separated) return true;
  }
  return false;
}
