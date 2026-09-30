"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Hoy", emoji: "✅" },
  { href: "/mes", label: "Mes", emoji: "📈" },
  { href: "/comparar", label: "Comparar", emoji: "⚖️" },
  { href: "/ajustes", label: "Ajustes", emoji: "⚙️" },
] as const;

function useActivePath(): string {
  const pathname = usePathname();
  return pathname.replace(/\/$/, "") || "/";
}

export function TopNavLinks() {
  const path = useActivePath();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            path === item.href ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNavLinks() {
  const path = useActivePath();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-950/95 backdrop-blur sm:hidden">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
            path === item.href ? "text-teal-400" : "text-slate-500"
          }`}
        >
          <span className="text-lg leading-none">{item.emoji}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
