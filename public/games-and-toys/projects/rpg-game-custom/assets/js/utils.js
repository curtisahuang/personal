export function int(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export function clamp(n, a, b) {
  return Math.min(Math.max(n, a), b);
}

export function randInt(min, max) {
  return (Math.random() * (max - min + 1) | 0) + min;
}

export function keyToDir(key) {
  if (key === 'ArrowUp') return { x: 0, y: -1 };
  if (key === 'ArrowDown') return { x: 0, y: 1 };
  if (key === 'ArrowLeft') return { x: -1, y: 0 };
  if (key === 'ArrowRight') return { x: 1, y: 0 };
  return null;
}

// Simple deterministic-ish noise from coordinates
export function noise2d(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}