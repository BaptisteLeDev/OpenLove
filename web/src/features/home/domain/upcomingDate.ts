export type SpecialDate = { label: string; date: string };
export type UpcomingDate = { label: string; date: string; inDays: number };

const DAY_MS = 86_400_000;

const utc = (y: number, m: number, d: number) => Date.UTC(y, m, d);

const daysInMonth = (y: number, m: number) => new Date(utc(y, m + 1, 0)).getUTCDate();

// Feb 29 -> Feb 28 in non-leap years (Date.UTC rolls to Mar 1).
const occurrence = (year: number, m: number, d: number) =>
  utc(year, m, Math.min(d, daysInMonth(year, m)));

export function upcomingDate(
  dates: SpecialDate[],
  today: string,
  windowDays = 30,
): UpcomingDate | null {
  const [ty = 0, tm = 1, td = 1] = today.split("-").map(Number);
  const todayMs = utc(ty, tm - 1, td);
  let best: UpcomingDate | null = null;

  for (const { label, date } of dates) {
    const [, m = 1, d = 1] = date.split("-").map(Number);
    let at = occurrence(ty, m - 1, d);
    if (at < todayMs) at = occurrence(ty + 1, m - 1, d);
    const inDays = Math.round((at - todayMs) / DAY_MS);
    if (inDays > windowDays) continue;
    const isBetter =
      !best ||
      inDays < best.inDays ||
      (inDays === best.inDays && label.localeCompare(best.label) < 0);
    if (isBetter) {
      const iso = new Date(at).toISOString().slice(0, 10);
      best = { label, date: iso, inDays };
    }
  }
  return best;
}
