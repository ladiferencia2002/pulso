"use client";

import { useEffect, useState } from "react";
import { todayKey } from "./dates";

// Devuelve la fecha de hoy (YYYY-MM-DD) y se actualiza al cambiar de día con la app abierta.
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(todayKey());
    const tick = () => setToday(todayKey());
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  return today;
}
