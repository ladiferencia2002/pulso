"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatValue, type HabitDef } from "@/lib/habits";
import type { SeriesPoint } from "@/lib/stats";
import { yAxisSpec } from "@/lib/chartSpec";
import { axisTicks } from "./HabitChart";

const GRID = "#2c2c2a";
const AXIS = "#383835";
const MUTED = "#898781";
const SURFACE = "#0f172a";
const B_COLOR = "#94a3b8";

type Row = { day: number; a: number | null; b: number | null };

function Tip({
  active,
  payload,
  def,
  labelA,
  labelB,
}: {
  active?: boolean;
  payload?: { payload?: Row }[];
  def: HabitDef;
  labelA: string;
  labelB: string;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row || (row.a === null && row.b === null)) return null;
  const items = [
    { label: labelA, value: row.a, color: def.color },
    { label: labelB, value: row.b, color: B_COLOR },
  ];
  return (
    <div className="space-y-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">Día {row.day}</p>
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: it.color }} />
          <span className="font-semibold text-white">{it.value === null ? "—" : formatValue(def, it.value)}</span>
          <span className="text-slate-400">· {it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CompareChart({
  def,
  seriesA,
  seriesB,
  labelA,
  labelB,
}: {
  def: HabitDef;
  seriesA: SeriesPoint[];
  seriesB: SeriesPoint[];
  labelA: string;
  labelB: string;
}) {
  const n = Math.max(seriesA.length, seriesB.length);
  const rows: Row[] = Array.from({ length: n }, (_, i) => ({
    day: i + 1,
    a: seriesA[i]?.value ?? null,
    b: seriesB[i]?.value ?? null,
  }));
  const all = rows.flatMap((r) => [r.a, r.b]).filter((v): v is number => v !== null);

  if (all.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">Sin registros en estos meses.</p>;
  }

  const { domain, ticks } = yAxisSpec(def, Math.max(...all));

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <svg width="22" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="22" y2="3" stroke={def.color} strokeWidth="2" />
          </svg>
          {labelA}
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="22" y2="3" stroke={B_COLOR} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          {labelB}
        </span>
      </div>
      <div className="h-52 w-full" role="img" aria-label={`Comparación de ${def.name}: ${labelA} frente a ${labelB}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="day" ticks={axisTicks(n)} tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: AXIS }} tickLine={false} />
            <YAxis
              domain={domain}
              ticks={ticks}
              tickFormatter={def.kind === "check" ? (v: number) => (v ? "Sí" : "No") : undefined}
              allowDecimals={false}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={def.kind === "check" ? 32 : 28}
            />
            <Tooltip content={<Tip def={def} labelA={labelA} labelB={labelB} />} cursor={{ stroke: AXIS }} />
            {def.kind !== "check" && <ReferenceLine y={def.goal} stroke={MUTED} strokeDasharray="2 4" />}
            <Line
              type="monotone"
              dataKey="b"
              stroke={B_COLOR}
              strokeWidth={2}
              strokeDasharray="5 4"
              connectNulls
              dot={{ r: 3, fill: B_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="a"
              stroke={def.color}
              strokeWidth={2}
              connectNulls
              dot={{ r: 4, fill: def.color, stroke: SURFACE, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
