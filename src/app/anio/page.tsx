"use client";

import { useState } from "react";
import { YearHeatmap } from "@/components/year/YearHeatmap";
import { buildHabits } from "@/lib/habits";
import { useAppData } from "@/lib/useAppData";
import { useToday } from "@/lib/useToday";

export default function YearPage() {
  const { data, hydrated } = useAppData();
  const today = useToday();
  const [year, setYear] = useState<number | null>(null);

  if (!hydrated || !today) return null;

  const currentYear = Number(today.slice(0, 4));
  const shown = year ?? currentYear;
  const habits = buildHabits(data.goals, data.custom);

  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition-colors hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" aria-label="Año anterior" onClick={() => setYear(shown - 1)} className={arrow}>
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-white">Tu año en puntos</h1>
          <p className="text-xs text-slate-500">Cada punto es un día; el color indica cómo te fue.</p>
        </div>
        <button
          type="button"
          aria-label="Año siguiente"
          disabled={shown >= currentYear}
          onClick={() => setYear(shown + 1)}
          className={arrow}
        >
          →
        </button>
      </div>

      {habits.map((def) => (
        <YearHeatmap key={`${def.id}-${def.kind}-${def.goal}`} def={def} data={data} year={shown} />
      ))}
    </div>
  );
}
