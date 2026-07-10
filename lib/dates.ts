// Date math for "days until expiry".
//
// The #1 bug source (plan §9): never compare raw timestamps to count calendar
// days — that's off-by-one around midnight. Instead we resolve "today" as a
// calendar date IN THE USER'S TIMEZONE (users.timezone, default Asia/Kolkata),
// then diff pure dates at UTC midnight. Intl handles the tz conversion, so no
// date library is needed and DST can't bite (pure-date diff is exact).

/** Today's calendar date (yyyy-mm-dd) in the given IANA timezone. */
export function todayInTz(tz: string): string {
  // en-CA formats as yyyy-mm-dd
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Whole calendar days from today (in tz) until an ISO date. Negative = past. */
export function daysUntil(expiry: string, tz: string): number {
  const [ty, tm, td] = todayInTz(tz).split("-").map(Number);
  const [ey, em, ed] = expiry.split("-").map(Number);
  return Math.round(
    (Date.UTC(ey, em - 1, ed) - Date.UTC(ty, tm - 1, td)) / 86_400_000,
  );
}

/** Compact human label for a daysUntil() value. */
export function daysLeftLabel(n: number): string {
  if (n < 0) return n === -1 ? "Expired yesterday" : `Expired ${-n}d ago`;
  if (n === 0) return "Expires today";
  if (n === 1) return "1 day left";
  return `${n} days left`;
}

/** Pure-date arithmetic on ISO strings (Date.UTC normalizes overflow). */
export function isoAddDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export type Urgency = "expired" | "critical" | "soon" | "normal";

/** Urgency bands (plan §Phase 4): expired=red, ≤3d=amber, ≤7d=yellow. */
export function urgencyOf(daysLeft: number): Urgency {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 3) return "critical";
  if (daysLeft <= 7) return "soon";
  return "normal";
}

/** "12 Aug 2026" — renders the calendar date faithfully regardless of server tz. */
export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
