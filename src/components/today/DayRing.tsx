export function DayRing({ done, total }: { done: number; total: number }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - done / total);

  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${done} de ${total} hábitos registrados`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}
