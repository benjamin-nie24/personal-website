import type { CirclePosition } from "./circle-collisions";

const palette = ["blue", "rose", "brick", "lavender", "sage"] as const;
const cellSize = 32;
const gap = 7;
const maxCount = 640;

export type FieldCircle = CirclePosition & { color: (typeof palette)[number] };

function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

// Stable randomness keeps the arrangement still between pointer events.
export function createCircleField(width: number, height: number): FieldCircle[] {
  let seed = 206;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const circles: FieldCircle[] = [];
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const buckets: FieldCircle[][] = Array.from({ length: rows * columns }, () => []);
  const radiusX = width * 0.45;
  const radiusY = height * 0.435;
  const area = Math.PI * radiusX * radiusY;
  const baseCount = Math.min(maxCount, Math.round(area / 1500));
  const scale = Math.min(1, Math.sqrt(Math.min(radiusX, radiusY) / 300));
  const maxRadius = 62 * scale;
  const sizes = [
    { fraction: 0.013, min: 39, max: 62 },
    { fraction: 0.055, min: 17, max: 36 },
    { fraction: 0.23, min: 7, max: 16 },
    { fraction: 0.702, min: 3, max: 7 },
    // Fill open gaps after the larger circles and the original small circles are placed.
    { fraction: 0.33, min: 3, max: 6 },
  ];

  function fits(x: number, y: number, radius: number) {
    const reach = radius + maxRadius + gap;
    const left = Math.max(0, Math.floor((x - reach) / cellSize));
    const right = Math.min(columns - 1, Math.floor((x + reach) / cellSize));
    const top = Math.max(0, Math.floor((y - reach) / cellSize));
    const bottom = Math.min(rows - 1, Math.floor((y + reach) / cellSize));

    for (let row = top; row <= bottom; row++) {
      for (let column = left; column <= right; column++) {
        for (const other of buckets[row * columns + column]) {
          const distance = radius + other.radius + gap;
          if ((x - other.x) ** 2 + (y - other.y) ** 2 < distance ** 2) return false;
        }
      }
    }
    return true;
  }

  for (const { fraction, min, max } of sizes) {
    for (let i = 0; i < Math.round(baseCount * fraction); i++) {
      const baseRadius = (min + random() * (max - min)) * scale;

      for (let attempt = 0; attempt < 42; attempt++) {
        const angle = random() * 2 * Math.PI;
        const distance = Math.sqrt(random());
        const weight = smoothstep((1 - distance) / 0.22);
        const radius = baseRadius * (0.62 + 0.38 * weight);
        const density = 0.42 + 0.58 * weight;
        // Reserve space for the whole circle inside the oval.
        if (distance + radius / Math.min(radiusX, radiusY) > 1 || random() > density) continue;
        const x = width / 2 + Math.cos(angle) * distance * radiusX;
        const y = height / 2 + Math.sin(angle) * distance * radiusY;
        if (!fits(x, y, radius)) continue;

        const circle = {
          x, y, radius,
          color: palette[Math.floor(random() * palette.length)],
          offsetX: 0, offsetY: 0, nextX: 0, nextY: 0,
        };
        circles.push(circle);
        buckets[Math.floor(y / cellSize) * columns + Math.floor(x / cellSize)].push(circle);
        break;
      }
    }
  }
  return circles;
}
