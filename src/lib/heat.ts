import type { HabitDef } from "./habits";

export type HeatLevel = { label: string; color: string };

const RED = "#f0524f";
const DARK = "#2f7f62";
const GREEN = "#2dbf73";
const BRIGHT = "#6ff2a5";
const ORANGE = "#f2a33a";

export type HeatScale = { levels: HeatLevel[]; indexOf: (value: number) => number };

// Sueño: los mismos tramos del ejemplo (<6 h, 6 h, 7 h, 8 h, 9 h+).
function sleepScale(): HeatScale {
  return {
    levels: [
      { label: "<6 h", color: RED },
      { label: "6 h", color: DARK },
      { label: "7 h", color: GREEN },
      { label: "8 h", color: BRIGHT },
      { label: "9 h+", color: ORANGE },
    ],
    indexOf: (v) => (v < 6 ? 0 : v < 7 ? 1 : v < 8 ? 2 : v < 9 ? 3 : 4),
  };
}

// Escala 1-10: un color por valor, de rojo (1) a verde (10).
function scaleScale(): HeatScale {
  return {
    levels: Array.from({ length: 10 }, (_, i) => ({
      label: String(i + 1),
      color: `hsl(${Math.round((i / 9) * 135)} 68% ${i < 5 ? 55 : 52}%)`,
    })),
    indexOf: (v) => Math.min(9, Math.max(0, Math.round(v) - 1)),
  };
}

// Contadores: se colorea según el avance hacia la meta (<50 %, <75 %, <100 %, meta cumplida).
function countScale(def: HabitDef): HeatScale {
  const goal = Math.max(1, def.goal);
  const palette = [RED, DARK, GREEN, BRIGHT];
  const tier = (v: number) => {
    const r = v / goal;
    return r < 0.5 ? 0 : r < 0.75 ? 1 : r < 1 ? 2 : 3;
  };

  const groups: { start: number; end: number; tier: number }[] = [];
  for (let v = 0; v <= def.max; v++) {
    const t = tier(v);
    const last = groups[groups.length - 1];
    if (last && last.tier === t) last.end = v;
    else groups.push({ start: v, end: v, tier: t });
  }

  const levels = groups.map((g, i) => ({
    label: i === groups.length - 1 ? `${g.start}+` : g.end > g.start ? `${g.start}–${g.end}` : String(g.start),
    color: palette[g.tier],
  }));
  const indexOf = (v: number) => {
    const t = tier(v);
    const i = groups.findIndex((g) => g.tier === t);
    return i === -1 ? 0 : i;
  };
  return { levels, indexOf };
}

function checkScale(): HeatScale {
  return {
    levels: [
      { label: "No", color: RED },
      { label: "Sí", color: BRIGHT },
    ],
    indexOf: (v) => (v >= 1 ? 1 : 0),
  };
}

export function heatScale(def: HabitDef): HeatScale {
  switch (def.kind) {
    case "hours":
      return sleepScale();
    case "scale":
      return scaleScale();
    case "check":
      return checkScale();
    default:
      return countScale(def);
  }
}

export function heatTitle(def: HabitDef): string {
  switch (def.kind) {
    case "hours":
      return "Horas dormidas";
    case "scale":
      return `${def.name} (1–10)`;
    case "check":
      return def.name;
    default:
      return def.unit ? `${def.name} (${def.unit})` : def.name;
  }
}
