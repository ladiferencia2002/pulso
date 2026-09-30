"use client";

import { useState } from "react";
import { HabitChart } from "@/components/charts/HabitChart";
import { HabitStats } from "@/components/charts/HabitStats";
import { MonthNav } from "@/components/MonthNav";
import { currentMonthId, monthLabel, previousMonth, shiftMonth } from "@/lib/dates";
import { buildHabits } from "@/lib/habits";
import { markExported } from "@/lib/mutations";
import { generateMonthlyPDF } from "@/lib/pdfExport";
import { monthOverview, monthSeries, summarize } from "@/lib/stats";
import { useAppData } from "@/lib/useAppData";

export default function MonthPage() {
  const { data, setData, hydrated } = useAppData();
  const [monthId, setMonthId] = useState(() => currentMonthId());

  if (!hydrated) return null;

  const habits = buildHabits(data.goals, data.custom);
  const prevId = previousMonth(monthId);
  const overview = monthOverview(data, monthId);

  function downloadPdf() {
    generateMonthlyPDF(data, monthId);
    markExported(setData, monthId);
  }

  return (
    <div className="space-y-5">
      <MonthNav
        monthId={monthId}
        onPrev={() => setMonthId(shiftMonth(monthId, -1))}
        onNext={() => setMonthId(shiftMonth(monthId, 1))}
        onToday={() => setMonthId(currentMonthId())}
      />

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Días con registro", value: `${overview.daysWithData}/${overview.totalDays}` },
          { label: "Días completos", value: overview.completeDays },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-2xl font-bold text-white">{t.value}</p>
            <p className="mt-1 text-xs text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={downloadPdf}
        className="w-full rounded-2xl bg-teal-400 px-4 py-3 font-semibold text-slate-950 transition-colors hover:bg-teal-300"
      >
        📄 Descargar PDF de {monthLabel(monthId)}
      </button>

      {habits.map((def) => {
        const series = monthSeries(data, monthId, def.id);
        const summary = summarize(def, series);
        const previous = summarize(def, monthSeries(data, prevId, def.id));
        return (
          <section key={def.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
              <span className="h-3 w-1.5 rounded-full" style={{ backgroundColor: def.color }} />
              {def.emoji} {def.name}
            </h2>
            <HabitChart def={def} series={series} />
            <HabitStats def={def} summary={summary} total={series.length} previous={previous} previousLabel={monthLabel(prevId)} />
          </section>
        );
      })}
    </div>
  );
}
