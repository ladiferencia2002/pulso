"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDayShort } from "@/lib/dates";
import { yAxisSpec } from "@/lib/chartSpec";
import { formatValue, type HabitDef } from "@/lib/habits";
import type { SeriesPoint } from "@/lib/stats";

const GRID = "#2c2c2a";
const AXIS = "#383835";
const MUTED = "#898781";
const SURFACE = "#0f172a";

type Row = { day: number; date: string; value: number | null };

function Tip({ active, payload, def }: { active?: boolean; payload?: { payload?: Row }[]; def: HabitDef }) {
  const row = payload?.[0]?.payload;
  if (!active || !row || row.value === null) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: def.color }} />
        <span className="font-semibold text-white">{formatValue(def, row.value)}</span>
        <span className="text-slate-400">· {formatDayShort(row.date)}</span>
      </div>
    </div>
  );
}

export function axisTicks(n: number): number[] {
  return [1, 5, 10, 15, 20, 25, 30].filter((d) => d <= n);
}

export function HabitChart({ def, series }: { def: HabitDef; series: SeriesPoint[] }) {
  const values = series.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">Aún no hay registros este mes.</p>;
  }

  const { domain, ticks } = yAxisSpec(def, Math.max(...values));

  const commonAxes = (
    <>
      <CartesianGrid stroke={GRID} vertical={false} />
      <XAxis
        dataKey="day"
        ticks={axisTicks(series.length)}
        tick={{ fill: MUTED, fontSize: 11 }}
        axisLine={{ stroke: AXIS }}
        tickLine={false}
      />
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
      <Tooltip content={<Tip def={def} />} cursor={{ stroke: AXIS, fill: "rgba(255,255,255,0.04)" }} />
      {def.kind !== "check" && (
        <ReferenceLine
          y={def.goal}
          stroke={MUTED}
          strokeDasharray="4 4"
          label={{ value: "Meta", position: "right", fill: MUTED, fontSize: 11 }}
        />
      )}
    </>
  );

  const margin = { top: 8, right: 34, left: -8, bottom: 0 };
  const dot = { r: 4, fill: def.color, stroke: SURFACE, strokeWidth: 2 };

  return (
    <div className="h-52 w-full" role="img" aria-label={`Evolución mensual de ${def.name}`}>
      <ResponsiveContainer width="100%" height="100%">
        {def.kind === "hours" ? (
          <AreaChart data={series} margin={margin}>
            <defs>
              <linearGradient id={`fill-${def.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={def.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={def.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {commonAxes}
            <Area
              type="monotone"
              dataKey="value"
              stroke={def.color}
              strokeWidth={2}
              fill={`url(#fill-${def.id})`}
              connectNulls
              dot={dot}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        ) : def.kind === "scale" ? (
          <LineChart data={series} margin={margin}>
            {commonAxes}
            <Line type="monotone" dataKey="value" stroke={def.color} strokeWidth={2} connectNulls dot={dot} activeDot={{ r: 5 }} />
          </LineChart>
        ) : (
          <BarChart data={series} margin={margin}>
            {commonAxes}
            <Bar dataKey="value" fill={def.color} radius={[4, 4, 0, 0]} maxBarSize={12} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
