import type { CustomCfg, HabitId } from "./habits";
import type { AppData } from "./types";
import type { SetAppData } from "./useAppData";

export function setValue(setData: SetAppData, date: string, id: HabitId, value: number | null): void {
  setData((prev) => {
    const day = { ...prev.logs[date] };
    if (value === null) delete day[id];
    else day[id] = value;

    const logs = { ...prev.logs };
    if (Object.keys(day).length === 0) delete logs[date];
    else logs[date] = day;
    return { ...prev, logs };
  });
}

export function setGoal(setData: SetAppData, id: HabitId, goal: number): void {
  setData((prev) => ({ ...prev, goals: { ...prev.goals, [id]: goal } }));
}

export function setCustom(setData: SetAppData, patch: Partial<CustomCfg>): void {
  setData((prev) => ({ ...prev, custom: { ...prev.custom, ...patch } }));
}

export function markExported(setData: SetAppData, monthId: string): void {
  setData((prev) =>
    prev.exportedMonths.includes(monthId) ? prev : { ...prev, exportedMonths: [...prev.exportedMonths, monthId] }
  );
}

export function replaceAll(setData: SetAppData, data: AppData): void {
  setData(data);
}
