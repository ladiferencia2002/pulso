import { addDays, currentMonthId, dayKey, daysInMonth, monthOf } from "./dates";
import { HABIT_IDS, meetsGoal, type HabitDef, type HabitId } from "./habits";
import type { AppData } from "./types";

export type SeriesPoint = { day: number; date: string; value: number | null };

export type Summary = {
  logged: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  metGoal: number;
  compliance: number | null; // 0-100, sobre los días registrados
};

export function monthSeries(data: AppData, monthId: string, id: HabitId): SeriesPoint[] {
  return Array.from({ length: daysInMonth(monthId) }, (_, i) => {
    const date = dayKey(monthId, i + 1);
    return { day: i + 1, date, value: data.logs[date]?.[id] ?? null };
  });
}

export function summarize(def: HabitDef, series: SeriesPoint[]): Summary {
  const values = series.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length === 0) return { logged: 0, avg: null, min: null, max: null, metGoal: 0, compliance: null };
  const metGoal = values.filter((v) => meetsGoal(def, v)).length;
  return {
    logged: values.length,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    metGoal,
    compliance: Math.round((metGoal / values.length) * 100),
  };
}

export function loggedCount(data: AppData, date: string): number {
  return HABIT_IDS.filter((id) => data.logs[date]?.[id] !== undefined).length;
}

export function isComplete(data: AppData, date: string): boolean {
  return loggedCount(data, date) === HABIT_IDS.length;
}

// Días seguidos con los 4 hábitos registrados. Hoy no rompe la racha aunque aún esté incompleto.
export function completeStreak(data: AppData, today: string): number {
  let cursor = isComplete(data, today) ? today : addDays(today, -1);
  let streak = 0;
  while (streak < 3650 && isComplete(data, cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function monthHasData(data: AppData, monthId: string): boolean {
  return Object.keys(data.logs).some((d) => monthOf(d) === monthId);
}

export function monthOverview(data: AppData, monthId: string) {
  const days = Object.keys(data.logs).filter((d) => monthOf(d) === monthId);
  return {
    daysWithData: days.length,
    completeDays: days.filter((d) => isComplete(data, d)).length,
    totalDays: daysInMonth(monthId),
  };
}

// Mes pendiente de descargar: el actual si hoy es su último día, o el más reciente ya cerrado sin exportar.
export function pendingExportMonth(data: AppData, today: string, lastDay: boolean): { month: string; closing: boolean } | null {
  const current = currentMonthId();
  if (lastDay && monthHasData(data, current) && !data.exportedMonths.includes(current)) {
    return { month: current, closing: true };
  }
  const closed = [...new Set(Object.keys(data.logs).map(monthOf))]
    .filter((m) => m < monthOf(today) && !data.exportedMonths.includes(m))
    .sort();
  const latest = closed[closed.length - 1];
  return latest ? { month: latest, closing: false } : null;
}
