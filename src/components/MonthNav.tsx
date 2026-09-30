import { currentMonthId, monthLabel } from "@/lib/dates";

export function MonthNav({
  monthId,
  onPrev,
  onNext,
  onToday,
}: {
  monthId: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const isCurrent = monthId >= currentMonthId();
  const arrow =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition-colors hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={onPrev} aria-label="Mes anterior" className={arrow}>
        ←
      </button>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-white">{monthLabel(monthId)}</h1>
        {!isCurrent && (
          <button type="button" onClick={onToday} className="text-xs text-slate-500 hover:underline">
            Volver al mes actual
          </button>
        )}
      </div>
      <button type="button" onClick={onNext} disabled={isCurrent} aria-label="Mes siguiente" className={arrow}>
        →
      </button>
    </div>
  );
}
