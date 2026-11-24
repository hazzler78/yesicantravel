/**
 * Dates we pre-fill into a search.
 *
 * Hard-coded check-in dates rot: every destination page still pointed at a
 * March 2026 stay in August, and the rates API cannot quote a date in the
 * past. Anything that pre-fills a search should derive its dates here.
 */

export type StayWindow = { checkin: string; checkout: string; nights: number };

/** Fri → Sun is the usual short-break shape we pre-fill everywhere. */
export const DEFAULT_NIGHTS = 2;
/** LiteAPI inventory thins out beyond ~90 days for many cities. */
export const MAX_RATES_HORIZON_DAYS = 90;
/** Nobody books a 53-night stay because a tulip season runs that long. */
export const MAX_PREFILLED_NIGHTS = 3;
/** @deprecated Legacy lead; evergreen CTAs use {@link getFridaySundayStayWindow}. */
export const DEFAULT_LEAD_DAYS = 14;

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

function utcDayOfWeek(iso: string): number {
  return new Date(iso + "T12:00:00Z").getUTCDay();
}

/**
 * Next Friday–Sunday (two nights) from at least tomorrow, with check-in
 * within {@link MAX_RATES_HORIZON_DAYS} of today.
 */
export function getFridaySundayStayWindow(today = todayIso()): StayWindow {
  const earliestCheckin = addDays(today, 1);
  const latestCheckin = addDays(today, MAX_RATES_HORIZON_DAYS - DEFAULT_NIGHTS);

  let cursor = earliestCheckin;
  for (let i = 0; i < MAX_RATES_HORIZON_DAYS + 7; i += 1) {
    if (cursor > latestCheckin) break;
    if (utcDayOfWeek(cursor) === 5) {
      const checkout = addDays(cursor, DEFAULT_NIGHTS);
      return { checkin: cursor, checkout, nights: DEFAULT_NIGHTS };
    }
    cursor = addDays(cursor, 1);
  }

  const checkin = addDays(today, DEFAULT_LEAD_DAYS);
  return { checkin, checkout: addDays(checkin, DEFAULT_NIGHTS), nights: DEFAULT_NIGHTS };
}

/** A plain upcoming stay, for pages that aren't tied to a specific date. */
export function getDefaultStayWindow(today = todayIso()): StayWindow {
  return getFridaySundayStayWindow(today);
}

/**
 * First Fri–Sun stay that fits inside a dated window (events / seasons).
 * Falls back to {@link getSeasonStayWindow} when no full weekend fits.
 */
export function getWeekendStayWindowInRange(
  startDate: string,
  endDate: string,
  today = todayIso(),
): StayWindow | null {
  if (endDate < today) return null;

  const earliestCheckin = startDate > addDays(today, 1) ? startDate : addDays(today, 1);
  const horizonCheckin = addDays(today, MAX_RATES_HORIZON_DAYS - DEFAULT_NIGHTS);
  const searchUntil = endDate < horizonCheckin ? endDate : horizonCheckin;

  let cursor = earliestCheckin;
  while (cursor <= searchUntil) {
    if (utcDayOfWeek(cursor) === 5) {
      const checkout = addDays(cursor, DEFAULT_NIGHTS);
      if (checkout <= endDate) {
        return { checkin: cursor, checkout, nights: DEFAULT_NIGHTS };
      }
    }
    cursor = addDays(cursor, 1);
  }

  return getSeasonStayWindow(startDate, endDate, today);
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

/**
 * Format a calendar date string (YYYY-MM-DD) for display.
 * Noon UTC + timeZone:UTC avoids the classic off-by-one where
 * `new Date("2026-10-28")` (midnight UTC) renders as the previous day
 * in US timezones.
 */
export function formatIsoDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

/** "26 Aug – 28 Aug · 2 nights" */
export function formatStayWindow({ checkin, checkout, nights }: StayWindow): string {
  return `${formatIsoDateShort(checkin)} – ${formatIsoDateShort(checkout)} · ${nights} ${nights === 1 ? "night" : "nights"}`;
}
