"use client";

import { useState } from "react";
import { monthLabel } from "@/lib/dates";

export function MonthEndBanner({
  month,
  closing,
  onDownload,
}: {
  month: string;
  closing: boolean;
  onDownload: () => void;
}) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-200">
        {closing
          ? `Hoy cierra ${monthLabel(month)}. Descarga tu resumen completo en PDF.`
          : `Tu resumen de ${monthLabel(month)} está listo para descargar.`}
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-300"
        >
          📄 Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="rounded-xl px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
