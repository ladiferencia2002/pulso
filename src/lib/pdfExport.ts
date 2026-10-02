import jsPDF from "jspdf";
import { yAxisSpec } from "./chartSpec";
import { daysInMonth, monthLabel, previousMonth } from "./dates";
import { buildHabits, formatNumber, formatValue, type HabitDef } from "./habits";
import { monthOverview, monthSeries, summarize, type SeriesPoint } from "./stats";
import type { AppData } from "./types";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BLOCK_H = 55;

// Las fuentes estándar de PDF solo cubren Latin-1: fuera emojis y símbolos.
const clean = (s: string) => s.replace(/[^\x20-\xFF]/g, "").trim();

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function signed(n: number): string {
  return `${n > 0 ? "+" : ""}${formatNumber(n)}`;
}

function drawChart(doc: jsPDF, x: number, y: number, w: number, h: number, series: SeriesPoint[], def: HabitDef) {
  const n = series.length;
  const values = series.map((p) => p.value).filter((v): v is number => v !== null);
  const { domain, ticks } = yAxisSpec(def, values.length ? Math.max(...values) : 0);
  const [lo, hi] = domain;

  const left = x + 8;
  const plotW = w - 10;
  const top = y + 2;
  const plotH = h - 9;
  const px = (day: number) => left + ((day - 0.5) / n) * plotW;
  const py = (v: number) => top + plotH - ((v - lo) / (hi - lo)) * plotH;

  // rejilla y etiquetas del eje Y
  doc.setLineWidth(0.15);
  doc.setFontSize(7);
  doc.setTextColor(120);
  for (const v of ticks) {
    const yy = py(v);
    doc.setDrawColor(225);
    doc.line(left, yy, left + plotW, yy);
    const label = def.kind === "check" ? (v ? "Sí" : "No") : formatNumber(v);
    doc.text(label, left - 1.5, yy + 1, { align: "right" });
  }

  // etiquetas del eje X
  for (let d = 1; d <= n; d++) {
    if (d === 1 || d % 5 === 0) doc.text(String(d), px(d), top + plotH + 4, { align: "center" });
  }

  // línea de meta
  const goalY = py(Math.min(Math.max(def.goal, lo), hi));
  doc.setDrawColor(150);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(left, goalY, left + plotW, goalY);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(6.5);
  doc.text("meta", left + plotW, goalY - 0.8, { align: "right" });

  const [r, g, b] = hexToRgb(def.color);
  doc.setDrawColor(r, g, b);
  doc.setFillColor(r, g, b);

  const logged = series.filter((p): p is SeriesPoint & { value: number } => p.value !== null);
  if (def.kind === "count" || def.kind === "check") {
    const bw = Math.max(0.8, (plotW / n) * 0.6);
    for (const p of logged) {
      const base = py(lo);
      const top2 = py(p.value);
      if (base - top2 > 0) doc.rect(px(p.day) - bw / 2, top2, bw, base - top2, "F");
    }
  } else {
    doc.setLineWidth(0.5);
    for (let i = 1; i < logged.length; i++) {
      doc.line(px(logged[i - 1].day), py(logged[i - 1].value), px(logged[i].day), py(logged[i].value));
    }
    for (const p of logged) doc.circle(px(p.day), py(p.value), 0.9, "F");
  }
  doc.setTextColor(0);
}

function drawHabitBlock(doc: jsPDF, y: number, def: HabitDef, series: SeriesPoint[], prevSeries: SeriesPoint[], prevLabel: string) {
  const s = summarize(def, series);
  const prev = summarize(def, prevSeries);
  const [r, g, b] = hexToRgb(def.color);

  doc.setFillColor(r, g, b);
  doc.rect(MARGIN, y, 2.2, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text(clean(def.name), MARGIN + 5, y + 4.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70);

  if (s.logged === 0) {
    doc.text("Sin registros este mes.", MARGIN + 5, y + 12);
    return;
  }

  const goalText = def.kind === "check" ? "cumplido" : `meta: ${formatValue(def, def.goal)} o más`;
  doc.text(
    `Promedio ${formatValue(def, s.avg!)}  |  Mejor ${formatValue(def, s.max!)}  |  Peor ${formatValue(def, s.min!)}  |  Registrados ${s.logged}/${series.length}`,
    MARGIN + 5,
    y + 11
  );
  doc.text(`Cumple la meta (${goalText}) en ${s.metGoal} de ${s.logged} días (${s.compliance}%)`, MARGIN + 5, y + 16);

  if (prev.avg === null) {
    doc.text(`Sin datos de ${prevLabel} para comparar.`, MARGIN + 5, y + 21);
  } else {
    const diff = s.avg! - prev.avg;
    const unit = def.kind === "hours" ? " h" : def.kind === "scale" ? " pts" : def.unit ? ` ${def.unit}` : "";
    doc.text(
      `Frente a ${prevLabel}: ${signed(Math.round(diff * 10) / 10)}${unit} de promedio (antes ${formatValue(def, prev.avg)})`,
      MARGIN + 5,
      y + 21
    );
  }

  const hint = def.hint;
  if (hint && (hint.low || hint.high)) {
    doc.setFontSize(8);
    doc.setTextColor(110);
    const text = [hint.low && `1 = ${clean(hint.low)}`, hint.high && `10 = ${clean(hint.high)}`].filter(Boolean).join("   |   ");
    const lines = doc.splitTextToSize(text, CONTENT_W - 5) as string[];
    doc.text(lines.slice(0, 2), MARGIN + 5, y + 25);
    drawChart(doc, MARGIN, y + 31, CONTENT_W, 23, series, def);
  } else {
    drawChart(doc, MARGIN, y + 24, CONTENT_W, 30, series, def);
  }
}

function drawTable(doc: jsPDF, startY: number, defs: HabitDef[], seriesList: SeriesPoint[][], monthId: string) {
  const colW = [18, ...defs.map(() => (CONTENT_W - 18) / defs.length)];
  const rowH = 5.4;
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Registro diario", MARGIN, y);
  y += 5;

  const header = ["Día", ...defs.map((d) => clean(d.name))];
  doc.setFillColor(235, 235, 235);
  doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
  doc.setFontSize(8);
  let cx = MARGIN;
  header.forEach((label, i) => {
    doc.text(label, cx + 2, y + 3.8);
    cx += colW[i];
  });
  y += rowH;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  for (let day = 1; day <= daysInMonth(monthId); day++) {
    if (day % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
    }
    cx = MARGIN;
    const cells = [String(day), ...defs.map((d, i) => {
      const v = seriesList[i][day - 1].value;
      return v === null ? "-" : clean(formatValue(d, v));
    })];
    cells.forEach((text, i) => {
      doc.text(text, cx + 2, y + 3.8);
      cx += colW[i];
    });
    y += rowH;
  }
}

export function generateMonthlyPDF(data: AppData, monthId: string): void {
  const defs = buildHabits(data.goals, data.custom);
  const prevId = previousMonth(monthId);
  const prevLabel = monthLabel(prevId);
  const overview = monthOverview(data, monthId);
  const seriesList = defs.map((d) => monthSeries(data, monthId, d.id));
  const prevSeriesList = defs.map((d) => monthSeries(data, prevId, d.id));

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text("Pulso - Resumen mensual", MARGIN, 22);
  doc.setFontSize(15);
  doc.setTextColor(60);
  doc.text(monthLabel(monthId), MARGIN, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado el ${new Date().toLocaleDateString("es")}`, MARGIN, 35.5);

  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(MARGIN, 40, CONTENT_W, 14, 2, 2, "FD");
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(
    `Días con registro: ${overview.daysWithData} de ${overview.totalDays}   |   Días completos (los 4 hábitos): ${overview.completeDays}`,
    MARGIN + 4,
    48.5
  );

  let y = 58;
  defs.forEach((def, i) => {
    if (y + BLOCK_H > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
    drawHabitBlock(doc, y, def, seriesList[i], prevSeriesList[i], prevLabel);
    y += BLOCK_H;
  });

  if (y + 8 + 5.4 * 32 > PAGE_H - MARGIN) {
    doc.addPage();
    y = MARGIN + 4;
  } else {
    y += 4;
  }
  drawTable(doc, y, defs, seriesList, monthId);

  doc.save(`pulso-${monthId}.pdf`);
}
