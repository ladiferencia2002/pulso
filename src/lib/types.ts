import type { CustomCfg, HabitId } from "./habits";

export type DayLog = Partial<Record<HabitId, number>>;

export type AppData = {
  goals: Record<HabitId, number>;
  custom: CustomCfg;
  // Clave: "YYYY-MM-DD". Un día solo existe si tiene al menos un hábito registrado.
  logs: Record<string, DayLog>;
  // Meses ("YYYY-MM") cuyo PDF ya se descargó.
  exportedMonths: string[];
};
