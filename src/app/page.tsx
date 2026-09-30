"use client";

import { useState } from "react";
import { DayRing } from "@/components/today/DayRing";
import { HabitCard } from "@/components/today/HabitCard";
import { MonthEndBanner } from "@/components/today/MonthEndBanner";
import { WeekStrip } from "@/components/today/WeekStrip";
import { addDays, formatDayLong, isLastDayOfMonth } from "@/lib/dates";
import { buildHabits, HABIT_IDS } from "@/lib/habits";
import { markExported, setValue } from "@/lib/mutations";
import { generateMonthlyPDF } from "@/lib/pdfExport";
import { completeStreak, loggedCount, pendingExportMonth } from "@/lib/stats";
import { useAppData } from "@/lib/useAppData";
import { useToday } from "@/lib/useToday";

function message(done: number, total: number): string {
  if (done === 0) return "Empieza con uno: te toma diez segundos.";
  if (done === total) return "¡Día completo! Así se construye el progreso.";
  return `Buen ritmo. Te ${total - done === 1 ? "falta 1 hábito" : `faltan ${total - done} hábitos`}.`;
}

export default function TodayPage() {
  const { data, setData, hydrated } = useAppData();
  const today = useToday();
  const [selected, setSelected] = useState<string | null>(null);

  if (!hydrated || !today) return null;

  const date = selected && selected <= today ? selected : today;
  const habits = buildHabits(data.goals, data.custom);
  const done = loggedCount(data, date);
  const streak = completeStreak(data, today);
  const pending = pendingExportMonth(data, today, isLastDayOfMonth(today));

  function downloadPending() {
    if (!pending) return;
    generateMonthlyPDF(data, pending.month);
    markExported(setData, pending.month);
  }

  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition-colors hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="space-y-5">
      {pending && <MonthEndBanner key={pending.month} month={pending.month} closing={pending.closing} onDownload={downloadPending} />}

      <div className="flex items-center justify-between gap-3">
        <button type="button" aria-label="Día anterior" onClick={() => setSelected(addDays(date, -1))} className={arrow}>
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-white">{date === today ? "Hoy" : formatDayLong(date)}</h1>
          <p className="text-xs text-slate-500">
            {date === today ? (
              formatDayLong(date)
            ) : (
              <button type="button" onClick={() => setSelected(null)} className="hover:underline">
                Volver a hoy
              </button>
            )}
          </p>
        </div>
        <button
          type="button"
          aria-label="Día siguiente"
          disabled={date >= today}
          onClick={() => setSelected(addDays(date, 1) >= today ? null : addDays(date, 1))}
          className={arrow}
        >
          →
        </button>
      </div>

      <section className="flex items-center gap-5 rounded-3xl border border-slate-800 bg-gradient-to-b from-teal-500/10 to-transparent p-5">
        <DayRing done={done} total={HABIT_IDS.length} />
        <div className="space-y-1">
          <p className="font-semibold text-white">{message(done, HABIT_IDS.length)}</p>
          {streak > 0 && (
            <p className="text-sm text-teal-300">
              🔥 {streak} {streak === 1 ? "día completo seguido" : "días completos seguidos"}
            </p>
          )}
        </div>
      </section>

      <WeekStrip data={data} today={today} selected={date} onSelect={(d) => setSelected(d === today ? null : d)} />

      <div className="space-y-3">
        {habits.map((def) => (
          <HabitCard
            key={`${def.id}-${date}-${def.kind}`}
            def={def}
            value={data.logs[date]?.[def.id]}
            onChange={(v) => setValue(setData, date, def.id, v)}
          />
        ))}
      </div>
    </div>
  );
}
