export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}