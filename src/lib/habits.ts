export type HabitId = "sleep" | "skin" | "diet" | "custom";
export type HabitKind = "hours" | "scale" | "count" | "check";
export type CustomKind = Exclude<HabitKind, "hours">;

export type HabitDef = {
  id: HabitId;
  name: string;
  emoji: string;
  kind: HabitKind;
  unit: string;
  min: number;
  max: number;
  step: number;
  goal: number;
  color: string;
};

export type CustomCfg = {
  name: string;
  emoji: string;
  kind: CustomKind;
  unit: string;
  max: number;
};

export const HABIT_IDS: HabitId[] = ["sleep", "skin", "diet", "custom"];

export const DEFAULT_GOALS: Record<HabitId, number> = { sleep: 8, skin: 7, diet: 4, custom: 8 };
export const DEFAULT_CUSTOM: CustomCfg = { name: "Agua", emoji: "💧", kind: "count", unit: "vasos", max: 20 };

// Categorical slots 1-4 of the validated dark palette (see README).
const COLORS: Record<HabitId, string> = {
  sleep: "#3987e5",
  skin: "#d95926",
  diet: "#199e70",
  custom: "#c98500",
};

export function buildHabits(goals: Record<HabitId, number>, custom: CustomCfg): HabitDef[] {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  let customDef: Pick<HabitDef, "min" | "max" | "step" | "unit">;
  if (custom.kind === "scale") customDef = { min: 1, max: 10, step: 1, unit: "" };
  else if (custom.kind === "check") customDef = { min: 0, max: 1, step: 1, unit: "" };
  else customDef = { min: 0, max: Math.max(1, custom.max), step: 1, unit: custom.unit };

  return [
    { id: "sleep", name: "Sueño", emoji: "😴", kind: "hours", unit: "h", min: 0, max: 14, step: 0.5, goal: clamp(goals.sleep, 0, 14), color: COLORS.sleep },
    { id: "skin", name: "Piel", emoji: "✨", kind: "scale", unit: "", min: 1, max: 10, step: 1, goal: clamp(goals.skin, 1, 10), color: COLORS.skin },
    { id: "diet", name: "Dieta", emoji: "🥗", kind: "count", unit: "comidas", min: 0, max: 8, step: 1, goal: clamp(goals.diet, 0, 8), color: COLORS.diet },
    {
      id: "custom",
      name: custom.name.trim() || "Mi hábito",
      emoji: custom.emoji.trim() || "⭐",
      kind: custom.kind,
      ...customDef,
      goal: custom.kind === "check" ? 1 : clamp(goals.custom, customDef.min, customDef.max),
      color: COLORS.custom,
    },
  ];
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es", { maximumFractionDigits: 1 });
}

export function formatValue(def: HabitDef, v: number): string {
  switch (def.kind) {
    case "hours":
      return `${formatNumber(v)} h`;
    case "scale":
      return `${formatNumber(v)}/10`;
    case "check":
      return v >= 1 ? "Sí" : "No";
    default:
      return def.unit ? `${formatNumber(v)} ${def.unit}` : formatNumber(v);
  }
}

export function goalLabel(def: HabitDef): string {
  if (def.kind === "check") return "Meta: cumplirlo";
  return `Meta: ${formatValue(def, def.goal)} o más`;
}

export function meetsGoal(def: HabitDef, v: number): boolean {
  return v >= def.goal;
}
