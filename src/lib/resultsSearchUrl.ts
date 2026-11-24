/**
 * Single entry point for every internal link into /results.
 * Keeps query param names aligned with {@link buildStaySearchParams} / the results page.
 */

import { getEventStayWindow, type Event } from "@/data/events";
import { buildStaySearchParams, type Party } from "@/lib/occupancy";
import { getDefaultStayWindow, type StayWindow } from "@/lib/stayDates";

export const DEFAULT_RESULTS_PARTY: Party = { adults: 1, childAges: [] };

export type BuildResultsPathOpts = {
  placeId?: string | null;
  aiSearch?: string | null;
  stay?: StayWindow;
  party?: Party;
  rooms?: number;
  hotelId?: string | null;
  offerId?: string | null;
};

export function buildResultsPath(opts: BuildResultsPathOpts): string {
  const stay = opts.stay ?? getDefaultStayWindow();
  const party = opts.party ?? DEFAULT_RESULTS_PARTY;
  const qs = buildStaySearchParams({
    checkin: stay.checkin,
    checkout: stay.checkout,
    party,
    rooms: opts.rooms,
    placeId: opts.placeId,
    aiSearch: opts.aiSearch,
    hotelId: opts.hotelId,
    offerId: opts.offerId,
  });
  return `/results?${qs.toString()}`;
}

export function buildResultsPathForEvent(
  event: Pick<Event, "startDate" | "endDate" | "aiSearchTemplate">,
  target: { placeId?: string | null; aiSearch?: string | null },
): string {
  const stay = getEventStayWindow(event) ?? getDefaultStayWindow();
  const placeId = target.placeId?.trim() || undefined;
  const aiSearch = placeId ? undefined : (target.aiSearch?.trim() || event.aiSearchTemplate);
  return buildResultsPath({ placeId, aiSearch, stay });
}

/**
 * Blog / markdown links that omit dates get a rolling stay window at click time.
 * Does not rewrite external URLs or links that already carry check-in/out.
 */
export function enrichResultsHref(href: string | undefined | null): string | undefined {
  if (!href) return undefined;
  if (!href.startsWith("/results")) return href;

  try {
    const url = new URL(href, "https://yesicantravel.com");
    if (url.pathname !== "/results") return href;

    const hasDates = url.searchParams.has("checkin") && url.searchParams.has("checkout");
    if (hasDates) return href;

    const stay = getDefaultStayWindow();
    url.searchParams.set("checkin", stay.checkin);
    url.searchParams.set("checkout", stay.checkout);
    if (!url.searchParams.has("adults") && !url.searchParams.has("guests")) {
      url.searchParams.set("adults", "1");
    }
    return `${url.pathname}?${url.searchParams.toString()}`;
  } catch {
    return href;
  }
}