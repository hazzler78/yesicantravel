/**
 * Dates we pre-fill into a search.
 *
 * Hard-coded check-in dates rot: every destination page still pointed at a
 * March 2026 stay in August, and the rates API cannot quote a date in the
 * past. Anything that pre-fills a search should derive its dates here.
 */

export type StayWindow = { checkin: string; checkout: string; nights: number };

/** Far enough out that inventory and prices look normal, close enough to feel real. */
export const DEFAULT_LEAD_DAYS = 14;
export const DEFAULT_NIGHTS = 2;
/** Nobody books a 53-night stay because a tulip season runs that long. */
export const MAX_PREFILLED_NIGHTS = 3;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(from: string, to: string): number {
  const diff = new Date(to + "T12:00:00Z").getTime() - new Date(from + "T12:00:00Z").getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** A plain upcoming stay, for pages that aren't tied to a specific date. */
export function getDefaultStayWindow(today = todayIso()): StayWindow {
  const checkin = addDays(today, DEFAULT_LEAD_DAYS);
  return { checkin, checkout: addDays(checkin, DEFAULT_NIGHTS), nights: DEFAULT_NIGHTS };
}

/**
 * A representative stay inside a dated season: never starting in the past,
 * never longer than MAX_PREFILLED_NIGHTS, never running past the end.
 */
export function getSeasonStayWindow(
  startDate: string,
  endDate: string,
  today = todayIso(),
): StayWindow | null {
  if (endDate < today) return null;

  const earliest = addDays(today, 1);
  const checkin = startDate > earliest ? startDate : earliest;
  const available = nightsBetween(checkin, addDays(endDate, 1));
  if (available < 1) return null;

  const nights = Math.min(available, MAX_PREFILLED_NIGHTS);
  return { checkin, checkout: addDays(checkin, nights), nights };
}

/** "26 Aug – 28 Aug · 2 nights" */
export function formatStayWindow({ checkin, checkout, nights }: StayWindow): string {
  const day = (iso: string) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  return `${day(checkin)} – ${day(checkout)} · ${nights} ${nights === 1 ? "night" : "nights"}`;
}
