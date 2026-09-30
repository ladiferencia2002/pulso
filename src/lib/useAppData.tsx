"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { emptyData, loadData, saveData } from "./clientStore";
import type { AppData } from "./types";

export type SetAppData = Dispatch<SetStateAction<AppData>>;
type Store = { data: AppData; setData: SetAppData; hydrated: boolean };

const Ctx = createContext<Store | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => emptyData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during the static prerender; hydrate once mounted
    // in the browser so the prerendered markup matches on first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

  return <Ctx.Provider value={{ data, setData, hydrated }}>{children}</Ctx.Provider>;
}

export function useAppData(): Store {
  const store = useContext(Ctx);
  if (!store) throw new Error("useAppData must be used inside <AppDataProvider>");
  return store;
}
