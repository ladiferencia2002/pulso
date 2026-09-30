import type { HabitDef } from "./habits";

export function yAxisSpec(def: HabitDef, maxVal: number): { domain: [number, number]; ticks: number[] } {
  if (def.kind === "scale") return { domain: [1, 10], ticks: [1, 2, 4, 6, 8, 10] };
  if (def.kind === "check") return { domain: [0, 1], ticks: [0, 1] };
  const top = Math.max(def.kind === "hours" ? 10 : 4, Math.ceil(maxVal) + 1, def.goal + 1);
  const step = top <= 6 ? 1 : top <= 12 ? 2 : top <= 30 ? 5 : 10;
  const hi = Math.ceil(top / step) * step;
  return { domain: [0, hi], ticks: Array.from({ length: hi / step + 1 }, (_, i) => i * step) };
}
