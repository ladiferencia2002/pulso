import { formatNumber, formatValue, type HabitDef } from "@/lib/habits";
import type { Summary } from "@/lib/stats";

export function deltaUnit(def: HabitDef): string {
  if (def.kind === "hours") return " h";
  if (def.kind === "scale") return " pts";
  return def.unit ? ` ${def.unit}` : "";
}

export function DeltaText({ def, current, previous, label }: { def: HabitDef; current: Summary; previous: Summary; label: string }) {
  if (current.avg === null || previous.avg === null) {
    return <p className="text-xs text-slate-500">Sin datos de {label} para comparar.</p>;
  }
  const diff = Math.round((current.avg - previous.avg) * 10) / 10;
  const sign = diff > 0 ? "+" : "";
  const [icon, tone] = diff > 0 ? ["▲", "text-emerald-400"] : diff < 0 ? ["▼", "text-amber-400"] : ["＝", "text-slate-400"];
  return (
    <p className="text-xs text-slate-400">
      <span className={`font-semibold ${tone}`}>
        {icon} {sign}
        {formatNumber(diff)}
        {deltaUnit(def)}
      </span>{" "}
      de promedio frente a {label}
    </p>
  );
}

export function HabitStats({
  def,
  summary,
  total,
  previous,
  previousLabel,
}: {
  def: HabitDef;
  summary: Summary;
  total: number;
  previous: Summary;
  previousLabel: string;
}) {
  if (summary.logged === 0) return null;
  const tiles = [
    { label: "Promedio", value: formatValue(def, summary.avg!) },
    { label: "Mejor día", value: formatValue(def, summary.max!) },
    { label: "Registrados", value: `${summary.logged}/${total}` },
    { label: "Cumple la meta", value: `${summary.compliance}%` },
  ];
  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-slate-950/60 p-3 text-center">
            <p className="text-base font-bold text-white">{t.value}</p>
            <p className="text-xs text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>
      <DeltaText def={def} current={summary} previous={previous} label={previousLabel} />
    </div>
  );
}
