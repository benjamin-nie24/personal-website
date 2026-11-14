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
  const horizontalInset = 0.05;
  const span = 1 - 2 * horizontalInset;
  const halfBand = 0.29;
  const area = width * height * span * 2 * halfBand;
  const baseCount = Math.min(maxCount, Math.round(area / 1300));
  const scale = Math.min(1, Math.sqrt(Math.min(width * span, height * 2 * halfBand) / 600));
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
        // Follow a diagonal with a slight bend and feather both ends of the band.
        const progress = random();
        const across = random() * 2 - 1;
        const centerY = 0.68 - 0.36 * progress + 0.035 * Math.sin(progress * 2 * Math.PI);
        const edgeWeight = smoothstep((1 - Math.abs(across)) / 0.35);
        const endWeight = smoothstep(Math.min(progress, 1 - progress) / 0.15);
        const weight = edgeWeight * endWeight;
        const radius = baseRadius * (0.62 + 0.38 * weight);
        const density = 0.42 + 0.58 * weight;
        if (random() > density) continue;
        const x = width * (horizontalInset + span * progress);
        const y = height * (centerY + halfBand * across);
        if (Math.min(x, width - x, y, height - y) < radius) continue;
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
