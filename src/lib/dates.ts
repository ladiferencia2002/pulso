const pad = (n: number) => String(n).padStart(2, "0");
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function monthOf(key: string): string {
  return key.slice(0, 7);
}

export function currentMonthId(): string {
  return monthOf(todayKey());
}

export function shiftMonth(monthId: string, n: number): string {
  const [y, m] = monthId.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function daysInMonth(monthId: string): number {
  const [y, m] = monthId.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function dayKey(monthId: string, day: number): string {
  return `${monthId}-${pad(day)}`;
}

export function isLastDayOfMonth(key: string): boolean {
  return monthOf(addDays(key, 1)) !== monthOf(key);
}

export function monthName(monthId: string): string {
  const [y, m] = monthId.split("-").map(Number);
  return capitalize(new Intl.DateTimeFormat("es", { month: "long" }).format(new Date(y, m - 1, 1)));
}

export function monthLabel(monthId: string): string {
  return `${monthName(monthId)} ${monthId.slice(0, 4)}`;
}

export function formatDayLong(key: string): string {
  return capitalize(new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(parseKey(key)));
}

export function formatDayShort(key: string): string {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(parseKey(key));
}

export function weekdayInitial(key: string): string {
  return new Intl.DateTimeFormat("es", { weekday: "narrow" }).format(parseKey(key)).toUpperCase();
}

export function recentMonths(count: number): string[] {
  const now = currentMonthId();
  return Array.from({ length: count }, (_, i) => shiftMonth(now, -i));
}

export function previousMonth(monthId: string): string {
  return shiftMonth(monthId, -1);
}
