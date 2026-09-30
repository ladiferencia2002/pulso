"use client";

import { formatValue, goalLabel, meetsGoal, type HabitDef } from "@/lib/habits";

const HOURS_CHIPS = [6, 7, 8, 9];

function clamp(def: HabitDef, v: number): number {
  return Math.min(def.max, Math.max(def.min, Math.round(v * 10) / 10));
}

export function HabitCard({
  def,
  value,
  onChange,
}: {
  def: HabitDef;
  value: number | undefined;
  onChange: (value: number | null) => void;
}) {
  const logged = value !== undefined;
  const met = logged && meetsGoal(def, value);

  function step(direction: 1 | -1) {
    if (!logged) {
      onChange(def.kind === "hours" ? 7 : direction === 1 ? def.min + def.step : def.min);
      return;
    }
    onChange(clamp(def, value + direction * def.step));
  }

  const chipStyle = (selected: boolean) =>
    selected
      ? { backgroundColor: def.color, borderColor: def.color, color: "#020617" }
      : undefined;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${def.color}26` }}
          >
            {def.emoji}
          </span>
          <div>
            <h2 className="font-semibold text-white">{def.name}</h2>
            <p className="text-xs text-slate-500">{goalLabel(def)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{logged ? formatValue(def, value) : "—"}</p>
          {met && <p className="text-xs font-medium text-emerald-400">✓ Meta cumplida</p>}
        </div>
      </div>

      {(def.kind === "hours" || def.kind === "count") && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label={`Menos ${def.name}`}
            onClick={() => step(-1)}
            className="h-11 w-11 rounded-xl border border-slate-700 text-xl text-slate-200 transition-colors hover:border-slate-500"
          >
            −
          </button>
          <button
            type="button"
            aria-label={`Más ${def.name}`}
            onClick={() => step(1)}
            className="h-11 w-11 rounded-xl border border-slate-700 text-xl text-slate-200 transition-colors hover:border-slate-500"
          >
            +
          </button>
          {def.kind === "hours" &&
            HOURS_CHIPS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChange(h)}
                style={chipStyle(value === h)}
                className="h-11 min-w-11 rounded-xl border border-slate-700 px-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
              >
                {h} h
              </button>
            ))}
        </div>
      )}

      {def.kind === "scale" && (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={value === n}
              style={chipStyle(value === n)}
              className="h-11 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {def.kind === "check" && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Sí", v: 1 },
            { label: "No", v: 0 },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              aria-pressed={value === opt.v}
              style={chipStyle(value === opt.v)}
              className="h-11 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {logged && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-3 text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
        >
          Borrar este registro
        </button>
      )}
    </section>
  );
}
