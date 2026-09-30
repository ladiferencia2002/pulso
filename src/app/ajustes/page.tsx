"use client";

import { useState } from "react";
import { emptyData, sanitize } from "@/lib/clientStore";
import { todayKey } from "@/lib/dates";
import { buildHabits, type CustomKind } from "@/lib/habits";
import { replaceAll, setCustom, setGoal } from "@/lib/mutations";
import { useAppData } from "@/lib/useAppData";

const field =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500";
const card = "space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5";

const KIND_LABELS: Record<CustomKind, string> = {
  count: "Cantidad (contador)",
  scale: "Escala de 1 a 10",
  check: "Sí / No",
};

export default function SettingsPage() {
  const { data, setData, hydrated } = useAppData();
  const [status, setStatus] = useState<string | null>(null);

  if (!hydrated) return null;

  const habits = buildHabits(data.goals, data.custom);

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulso-copia-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Copia descargada.");
  }

  async function importBackup(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = sanitize(JSON.parse(await file.text()));
      const days = Object.keys(parsed.logs).length;
      if (!window.confirm(`Se reemplazarán tus datos actuales por la copia (${days} días registrados). ¿Continuar?`)) return;
      replaceAll(setData, parsed);
      setStatus(`Copia restaurada: ${days} días.`);
    } catch {
      setStatus("Ese archivo no es una copia válida de Pulso.");
    }
  }

  function resetAll() {
    if (!window.confirm("Se borrarán todos tus registros y ajustes. Esta acción no se puede deshacer. ¿Continuar?")) return;
    replaceAll(setData, emptyData());
    setStatus("Datos borrados.");
  }

  function changeKind(kind: CustomKind) {
    setCustom(setData, { kind });
    setGoal(setData, "custom", kind === "scale" ? 7 : kind === "check" ? 1 : 8);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-sm text-slate-400">Tus metas, tu cuarto hábito y tus datos.</p>
      </div>

      <section className={card}>
        <h2 className="text-sm font-semibold text-white">Metas diarias</h2>
        <p className="text-xs text-slate-500">Un día cuenta como cumplido cuando llegas a la meta o la superas.</p>
        {habits
          .filter((h) => h.kind !== "check")
          .map((h) => (
            <label key={`${h.id}-${h.kind}`} className="flex items-center justify-between gap-4 text-sm text-slate-300">
              <span>
                {h.emoji} {h.name}
              </span>
              <span className="flex items-center gap-2">
                <input
                  type="number"
                  min={h.min}
                  max={h.max}
                  step={h.step}
                  defaultValue={h.goal}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (Number.isFinite(v)) setGoal(setData, h.id, v);
                  }}
                  className="w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-right text-slate-100 outline-none focus:border-teal-500"
                />
                <span className="w-14 text-xs text-slate-500">{h.kind === "hours" ? "horas" : h.kind === "scale" ? "de 10" : h.unit}</span>
              </span>
            </label>
          ))}
      </section>

      <section className={card}>
        <h2 className="text-sm font-semibold text-white">Tu cuarto hábito</h2>
        <div className="grid grid-cols-[5rem_1fr] gap-3">
          <label className="space-y-1 text-xs text-slate-400">
            Emoji
            <input
              type="text"
              value={data.custom.emoji}
              maxLength={8}
              onChange={(e) => setCustom(setData, { emoji: e.target.value })}
              className={`${field} text-center text-lg`}
            />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            Nombre
            <input
              type="text"
              value={data.custom.name}
              maxLength={30}
              onChange={(e) => setCustom(setData, { name: e.target.value })}
              className={field}
            />
          </label>
        </div>
        <label className="block space-y-1 text-xs text-slate-400">
          Cómo lo mides
          <select value={data.custom.kind} onChange={(e) => changeKind(e.target.value as CustomKind)} className={field}>
            {(Object.keys(KIND_LABELS) as CustomKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        {data.custom.kind === "count" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs text-slate-400">
              Unidad
              <input
                type="text"
                value={data.custom.unit}
                maxLength={20}
                placeholder="vasos, pasos, páginas…"
                onChange={(e) => setCustom(setData, { unit: e.target.value })}
                className={field}
              />
            </label>
            <label className="space-y-1 text-xs text-slate-400">
              Máximo por día
              <input
                type="number"
                min={1}
                max={100}
                defaultValue={data.custom.max}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= 1 && v <= 100) setCustom(setData, { max: v });
                }}
                className={field}
              />
            </label>
          </div>
        )}
        <p className="text-xs text-slate-500">
          Si cambias cómo lo mides, los valores ya guardados se conservan pero pueden dejar de tener sentido.
        </p>
      </section>

      <section className={card}>
        <h2 className="text-sm font-semibold text-white">Copia de seguridad</h2>
        <p className="text-sm text-slate-400">
          Tus datos viven solo en este navegador. Descarga una copia de vez en cuando, o para pasarlos a otro dispositivo.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportBackup}
            className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-300"
          >
            Descargar copia
          </button>
          <label className="cursor-pointer rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500">
            Restaurar copia
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                void importBackup(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {status && (
          <p role="status" className="text-sm text-teal-300">
            {status}
          </p>
        )}
      </section>

      <section className={card}>
        <h2 className="text-sm font-semibold text-white">Instalar en el móvil</h2>
        <p className="text-sm text-slate-400">
          Android (Chrome): menú ⋮ → «Instalar app». iPhone (Safari): compartir → «Añadir a pantalla de inicio». Después
          funciona sin conexión.
        </p>
      </section>

      <button
        type="button"
        onClick={resetAll}
        className="w-full rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
      >
        Borrar todos los datos
      </button>
    </div>
  );
}
