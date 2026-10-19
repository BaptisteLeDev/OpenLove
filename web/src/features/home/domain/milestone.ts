export type Milestone = { years: number; months: number; days: number; totalDays: number };

const DAY_MS = 86_400_000;

const parse = (iso: string) => {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};

const utc = (y: number, m: number, d: number) => Date.UTC(y, m, d);

// Start date + n months, day clamped to the target month end (D13).
const addMonths = (s: { y: number; m: number; d: number }, n: number) => {
  const total = s.m + n;
  const y = s.y + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return utc(y, m, Math.min(s.d, new Date(utc(y, m + 1, 0)).getUTCDate()));
};

export function milestone(startDate: string, today: string): Milestone {
  const s = parse(startDate);
  const t = parse(today);
  const todayMs = utc(t.y, t.m, t.d);
  const totalDays = Math.round((todayMs - utc(s.y, s.m, s.d)) / DAY_MS);
  if (totalDays <= 0) return { years: 0, months: 0, days: 0, totalDays: 0 };

  let months = (t.y - s.y) * 12 + (t.m - s.m);
  if (addMonths(s, months) > todayMs) months -= 1;
  const days = Math.round((todayMs - addMonths(s, months)) / DAY_MS);
  return { years: Math.floor(months / 12), months: months % 12, days, totalDays };
}

export function todayIn(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
