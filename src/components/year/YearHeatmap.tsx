"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dateKey, formatDayShort, todayKey } from "@/lib/dates";
import { formatValue, type HabitDef } from "@/lib/habits";
import { heatScale, heatTitle } from "@/lib/heat";
import type { AppData } from "@/lib/types";

const CELL = 11;
const RADIUS = 4;
const TOP = 14;
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const EMPTY = "#1e293b";
const FUTURE = "#334155";

type Cell = { date: string; col: number; row: number; value: number | null };

export function YearHeatmap({ def, data, year }: { def: HabitDef; data: AppData; year: number }) {
  const scale = useMemo(() => heatScale(def), [def]);
  const [selected, setSelected] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const today = todayKey();

  const { cells, cols, monthCols, logged } = useMemo(() => {
    const jan1 = new Date(year, 0, 1);
    const offset = (jan1.getDay() + 6) % 7; // semana de lunes a domingo
    const total = Math.round((new Date(year + 1, 0, 1).getTime() - jan1.getTime()) / 86_400_000);
    const out: Cell[] = [];
    const firstCols: number[] = [];
    let count = 0;
    for (let i = 0; i < total; i++) {
      const d = new Date(year, 0, 1 + i);
      const date = dateKey(d);
      const value = data.logs[date]?.[def.id] ?? null;
      if (value !== null) count++;
      const pos = i + offset;
      out.push({ date, col: Math.floor(pos / 7), row: pos % 7, value });
      if (d.getDate() === 1) firstCols.push(Math.floor(pos / 7));
    }
    return { cells: out, cols: Math.ceil((total + offset) / 7), monthCols: firstCols, logged: count };
  }, [data.logs, def.id, year]);

  // Deja a la vista el día de hoy (o el final del año) al abrir en pantallas estrechas.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const target = cells.find((c) => c.date === today) ?? cells[cells.length - 1];
    el.scrollLeft = Math.max(0, target.col * CELL - el.clientWidth / 2);
  }, [cells, today]);

  const selectedCell = selected ? cells.find((c) => c.date === selected) : undefined;
  const unitWord = def.kind === "hours" ? "noches" : "días";
  const width = cols * CELL;
  const height = TOP + 7 * CELL;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-4xl font-extralight tracking-tight text-white">{year}</h2>
        <p className="text-sm text-slate-400">
          {logged} {unitWord}
        </p>
      </div>
      <p className="-mt-2 flex items-center gap-2 text-sm font-medium text-slate-200">
        <span>{def.emoji}</span> {def.name}
      </p>

      <div ref={scroller} className="overflow-x-auto pb-1 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block min-w-full"
          role="img"
          aria-label={`Calendario del año ${year} para ${def.name}: ${logged} ${unitWord} registrados`}
        >
          {monthCols.map((col, m) => (
            <text key={m} x={col * CELL} y={9} fontSize={8.5} fill="#898781">
              {MONTHS[m]}
            </text>
          ))}
          {cells.map((c) => {
            const cx = c.col * CELL + CELL / 2;
            const cy = TOP + c.row * CELL + CELL / 2;
            const isSelected = c.date === selected;
            const isFuture = c.date > today;
            const label =
              c.value === null
                ? `${formatDayShort(c.date)}: sin registro`
                : `${formatDayShort(c.date)}: ${formatValue(def, c.value)}`;
            return (
              <circle
                key={c.date}
                cx={cx}
                cy={cy}
                r={isSelected ? RADIUS + 1 : RADIUS}
                fill={c.value === null ? (isFuture ? "none" : EMPTY) : scale.levels[scale.indexOf(c.value)].color}
                stroke={isFuture && c.value === null ? FUTURE : isSelected ? "#ffffff" : "none"}
                strokeWidth={isSelected ? 1.5 : 1}
                className="cursor-pointer"
                onClick={() => setSelected(c.date === selected ? null : c.date)}
              >
                <title>{label}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <p className="min-h-5 text-sm text-slate-300" role="status">
        {selectedCell
          ? selectedCell.value === null
            ? `${formatDayShort(selectedCell.date)} ${year}: sin registro`
            : `${formatDayShort(selectedCell.date)} ${year}: ${formatValue(def, selectedCell.value)}`
          : <span className="text-slate-500">Toca un punto para ver el día.</span>}
      </p>

      <div className="space-y-2 border-t border-slate-800 pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
          <span className="text-slate-400">{heatTitle(def)}</span>
          {def.kind === "scale" ? (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">1</span>
              {scale.levels.map((l) => (
                <span key={l.label} className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} title={l.label} />
              ))}
              <span className="text-slate-400">10</span>
            </span>
          ) : (
            scale.levels.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))
          )}
        </div>

        {def.hint && (
          <div className="space-y-1 text-xs text-slate-400">
            {def.hint.about && <p>{def.hint.about}</p>}
            {def.hint.low && (
              <p>
                <span className="font-semibold text-slate-200">1 =</span> {def.hint.low}
              </p>
            )}
            {def.hint.high && (
              <p>
                <span className="font-semibold text-slate-200">10 =</span> {def.hint.high}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
