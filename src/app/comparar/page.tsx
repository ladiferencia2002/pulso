"use client";

import { useState } from "react";
import { CompareChart } from "@/components/charts/CompareChart";
import { DeltaText } from "@/components/charts/HabitStats";
import { currentMonthId, monthLabel, monthOf, recentMonths, shiftMonth } from "@/lib/dates";
import { buildHabits, formatValue } from "@/lib/habits";
import { monthOverview, monthSeries, summarize } from "@/lib/stats";
import { useAppData } from "@/lib/useAppData";

export default function ComparePage() {
  const { data, hydrated } = useAppData();
  const [a, setA] = useState(() => currentMonthId());
  const [b, setB] = useState(() => shiftMonth(currentMonthId(), -1));

  if (!hydrated) return null;

  const habits = buildHabits(data.goals, data.custom);
  const options = [...new Set([...recentMonths(18), ...Object.keys(data.logs).map(monthOf)])].sort().reverse();
  const labelA = monthLabel(a);
  const labelB = monthLabel(b);
  const ovA = monthOverview(data, a);
  const ovB = monthOverview(data, b);

  const select =
    "w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Comparar meses</h1>
        <p className="text-sm text-slate-400">Elige dos meses y mira cómo cambió cada hábito.</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="space-y-1 text-xs text-slate-400">
          Mes
          <select value={a} onChange={(e) => setA(e.target.value)} className={select}>
            {options.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-label="Intercambiar meses"
          onClick={() => {
            setA(b);
            setB(a);
          }}
          className="mb-0.5 h-11 w-11 rounded-xl border border-slate-700 text-slate-300 transition-colors hover:border-slate-500"
        >
          ⇄
        </button>
        <label className="space-y-1 text-xs text-slate-400">
          Contra
          <select value={b} onChange={(e) => setB(e.target.value)} className={select}>
            {options.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: labelA, ov: ovA },
          { label: labelB, ov: ovB },
        ].map((t, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-xs text-slate-500">{t.label}</p>
            <p className="mt-1 text-lg font-bold text-white">
              {t.ov.daysWithData} <span className="text-sm font-normal text-slate-400">días con registro</span>
            </p>
            <p className="text-xs text-slate-400">{t.ov.completeDays} completos</p>
          </div>
        ))}
      </div>

      {habits.map((def) => {
        const seriesA = monthSeries(data, a, def.id);
        const seriesB = monthSeries(data, b, def.id);
        const sA = summarize(def, seriesA);
        const sB = summarize(def, seriesB);
        return (
          <section key={def.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
              <span className="h-3 w-1.5 rounded-full" style={{ backgroundColor: def.color }} />
              {def.emoji} {def.name}
            </h2>
            <CompareChart def={def} seriesA={seriesA} seriesB={seriesB} labelA={labelA} labelB={labelB} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: `Promedio ${labelA}`, s: sA },
                { label: `Promedio ${labelB}`, s: sB },
              ].map((t) => (
                <div key={t.label} className="rounded-xl bg-slate-950/60 p-3 text-center">
                  <p className="text-base font-bold text-white">{t.s.avg === null ? "—" : formatValue(def, t.s.avg)}</p>
                  <p className="text-xs text-slate-500">{t.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <DeltaText def={def} current={sA} previous={sB} label={labelB} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
