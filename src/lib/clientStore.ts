import { DEFAULT_CUSTOM, DEFAULT_GOALS, HABIT_IDS, type CustomCfg, type CustomKind, type HabitId } from "./habits";
import type { AppData, DayLog } from "./types";

const STORAGE_KEY = "pulso-data-v1";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

export function emptyData(): AppData {
  return { goals: { ...DEFAULT_GOALS }, custom: { ...DEFAULT_CUSTOM }, logs: {}, exportedMonths: [] };
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// Valida cualquier JSON (almacenamiento local o copia importada) y descarta lo que no encaje.
export function sanitize(raw: unknown): AppData {
  const base = emptyData();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;

  const goals = { ...base.goals };
  if (r.goals && typeof r.goals === "object") {
    for (const id of HABIT_IDS) {
      const g = (r.goals as Record<string, unknown>)[id];
      if (isNum(g)) goals[id] = g;
    }
  }

  const custom: CustomCfg = { ...base.custom };
  if (r.custom && typeof r.custom === "object") {
    const c = r.custom as Record<string, unknown>;
    if (typeof c.name === "string") custom.name = c.name.slice(0, 30);
    if (typeof c.emoji === "string") custom.emoji = c.emoji.slice(0, 8);
    if (typeof c.unit === "string") custom.unit = c.unit.slice(0, 20);
    if (c.kind === "scale" || c.kind === "count" || c.kind === "check") custom.kind = c.kind as CustomKind;
    if (isNum(c.max) && c.max >= 1 && c.max <= 100) custom.max = Math.round(c.max);
  }

  const logs: Record<string, DayLog> = {};
  if (r.logs && typeof r.logs === "object") {
    for (const [date, day] of Object.entries(r.logs as Record<string, unknown>)) {
      if (!DATE_RE.test(date) || !day || typeof day !== "object") continue;
      const clean: DayLog = {};
      for (const id of HABIT_IDS) {
        const v = (day as Record<string, unknown>)[id];
        if (isNum(v)) clean[id as HabitId] = v;
      }
      if (Object.keys(clean).length > 0) logs[date] = clean;
    }
  }

  const exportedMonths = Array.isArray(r.exportedMonths)
    ? r.exportedMonths.filter((m): m is string => typeof m === "string" && MONTH_RE.test(m))
    : [];

  return { goals, custom, logs, exportedMonths };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, quota exceeded): state still works for this session.
  }
}
