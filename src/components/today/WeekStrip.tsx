import { addDays, weekdayInitial } from "@/lib/dates";
import { HABIT_IDS } from "@/lib/habits";
import { loggedCount } from "@/lib/stats";
import type { AppData } from "@/lib/types";

export function WeekStrip({
  data,
  today,
  selected,
  onSelect,
}: {
  data: AppData;
  today: string;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <div className="flex justify-between gap-1">
      {days.map((date) => {
        const count = loggedCount(data, date);
        const complete = count === HABIT_IDS.length;
        const isSelected = date === selected;
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-label={`${date}: ${count} de ${HABIT_IDS.length} hábitos`}
            aria-pressed={isSelected}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors ${
              isSelected ? "bg-slate-800" : "hover:bg-slate-900"
            }`}
          >
            <span className="text-xs text-slate-500">{weekdayInitial(date)}</span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                complete
                  ? "border-teal-400 bg-teal-400 text-slate-950"
                  : count > 0
                    ? "border-teal-400/60 text-teal-300"
                    : "border-slate-700 text-slate-600"
              }`}
            >
              {complete ? "✓" : count > 0 ? count : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
