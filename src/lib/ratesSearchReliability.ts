/**
 * Guards against intermittent thin LiteAPI /hotels/rates responses (supplier cutoff
 * when `timeout` is too short or the first response is partial).
 */

export type RatesSearchPayload = {
  data?: Array<{ hotelId?: string; roomTypes?: unknown[] }>;
  hotels?: Array<{ id?: string }>;
  error?: { code?: number; message?: string; description?: string };
  guestLevel?: unknown;
};

/** Below this count, a geo city search is treated as suspiciously incomplete. */
export const RATES_THIN_RESULT_THRESHOLD = 10;

/** LiteAPI recommends 6–12s for live searches; we allow suppliers time to respond. */
export const LITEAPI_RATES_TIMEOUT_SECONDS = 12;

/** Second attempt uses a longer window and a slightly different geo box. */
export const LITEAPI_RATES_RETRY_TIMEOUT_SECONDS = 18;

const RETRY_RADIUS_NUDGE_M = 750;

export function countDistinctRateHotels(payload: RatesSearchPayload | null | undefined): number {
  if (!payload) return 0;
  const ids = new Set<string>();
  for (const row of payload.data ?? []) {
    if (row?.hotelId) ids.add(row.hotelId);
  }
  for (const hotel of payload.hotels ?? []) {
    if (hotel?.id) ids.add(hotel.id);
  }
  return ids.size;
}

export function preferRicherRatesPayload(
  primary: RatesSearchPayload,
  secondary: RatesSearchPayload,
): RatesSearchPayload {
  const a = countDistinctRateHotels(primary);
  const b = countDistinctRateHotels(secondary);
  return b > a ? secondary : primary;
}

type RateRow = NonNullable<RatesSearchPayload["data"]>[number];
type HotelRow = NonNullable<RatesSearchPayload["hotels"]>[number];

export function mergeRatesPayloads(
  primary: RatesSearchPayload,
  secondary: RatesSearchPayload,
): RatesSearchPayload {
  const dataByHotel = new Map<string, RateRow>();
  for (const row of [...(primary.data ?? []), ...(secondary.data ?? [])]) {
    if (!row?.hotelId) continue;
    const existing = dataByHotel.get(row.hotelId);
    if (!existing) {
      dataByHotel.set(row.hotelId, row);
      continue;
    }
    const existingRooms = (existing.roomTypes ?? []) as unknown[];
    const nextRooms = (row.roomTypes ?? []) as unknown[];
    if (nextRooms.length > existingRooms.length) {
      dataByHotel.set(row.hotelId, row);
    }
  }

  const hotelsById = new Map<string, HotelRow>();
  for (const hotel of [...(primary.hotels ?? []), ...(secondary.hotels ?? [])]) {
    if (hotel?.id) hotelsById.set(hotel.id, hotel);
  }

  const richer = preferRicherRatesPayload(primary, secondary);
  return {
    ...richer,
    data: [...dataByHotel.values()],
    hotels: [...hotelsById.values()],
  };
}

export type GeoRatesBody = {
  latitude?: number;
  longitude?: number;
  radius?: number;
  placeId?: string;
  hotelIds?: string[];
  aiSearch?: string;
};

export function isGeoCityRatesSearch(body: GeoRatesBody): boolean {
  if (body.hotelIds?.length || body.aiSearch) return false;
  if (typeof body.latitude === "number" && typeof body.longitude === "number") {
    const radius = body.radius ?? 0;
    return radius >= 5_000;
  }
  return Boolean(body.placeId);
}

export function shouldRetryThinRatesSearch(
  payload: RatesSearchPayload,
  body: GeoRatesBody,
  threshold = RATES_THIN_RESULT_THRESHOLD,
): boolean {
  if (!isGeoCityRatesSearch(body)) return false;
  return countDistinctRateHotels(payload) < threshold;
}

/** Slightly nudge radius (and timeout) so a retry is not served from a stale partial cache key. */
export function buildRatesRetryBody<T extends Record<string, unknown>>(body: T): T {
  const next: Record<string, unknown> = {
    ...body,
    timeout: LITEAPI_RATES_RETRY_TIMEOUT_SECONDS,
  };
  if (typeof body.latitude === "number" && typeof body.longitude === "number") {
    next.latitude = body.latitude + 0.00015;
    if (typeof body.radius === "number") {
      next.radius = Math.min(50_000, body.radius + RETRY_RADIUS_NUDGE_M);
    }
  }
  delete next.placeId;
  return next as T;
}

export function shouldPersistResultsListCache(hotelCount: number): boolean {
  return hotelCount >= RATES_THIN_RESULT_THRESHOLD;
}
