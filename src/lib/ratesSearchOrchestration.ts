import {
  buildRatesRetryBody,
  countDistinctRateHotels,
  LITEAPI_RATES_TIMEOUT_SECONDS,
  mergeRatesPayloads,
  RATES_THIN_RESULT_THRESHOLD,
  shouldRetryThinRatesSearch,
  type GeoRatesBody,
  type RatesSearchPayload,
} from "@/lib/ratesSearchReliability";
import { nightsBetween, todayIso } from "@/lib/stayDates";

/** Beyond this lead time LiteAPI rarely returns full inventory (supplier window). */
export const RATES_NEAR_TERM_RETRY_MAX_DAYS_AHEAD = 85;

/** Far-date stays with fewer hotels than this get an explanatory notice on results. */
export const RATES_FAR_DATE_THIN_NOTICE_THRESHOLD = 5;

export const RATES_DELAYED_RETRY_DELAYS_MS = [2_000, 4_000] as const;

/** Keep delayed attempts short so /api/rates stays under the browser timeout. */
export const LITEAPI_RATES_DELAYED_RETRY_TIMEOUT_SECONDS = 10;

export type RatesSearchRetryMeta = {
  initialCount: number;
  delayedAttempts: number;
  finalCount: number;
  daysAhead: number;
  nights: number;
  usedImmediateRetry: boolean;
};

export function daysAheadUntilCheckin(checkin: string, today = todayIso()): number {
  return nightsBetween(today, checkin);
}

export function isCheckinWithinNearTermRetryWindow(
  checkin: string,
  today = todayIso(),
): boolean {
  return daysAheadUntilCheckin(checkin, today) <= RATES_NEAR_TERM_RETRY_MAX_DAYS_AHEAD;
}

export function isSingleHotelRatesSearch(body: GeoRatesBody): boolean {
  return (body.hotelIds?.length ?? 0) === 1;
}

export function shouldRunImmediateThinRatesRetry(
  payload: RatesSearchPayload,
  body: GeoRatesBody,
  checkin: string,
  today = todayIso(),
): boolean {
  if (isSingleHotelRatesSearch(body)) return false;
  if (!shouldRetryThinRatesSearch(payload, body)) return false;
  return !isCheckinWithinNearTermRetryWindow(checkin, today);
}

export function shouldRunDelayedThinRatesRetries(
  payload: RatesSearchPayload,
  body: GeoRatesBody,
  checkin: string,
  today = todayIso(),
): boolean {
  if (isSingleHotelRatesSearch(body)) return false;
  if (!isCheckinWithinNearTermRetryWindow(checkin, today)) return false;
  return countDistinctRateHotels(payload) < RATES_THIN_RESULT_THRESHOLD;
}

export function shouldShowFarDateThinNotice(
  checkin: string,
  hotelCount: number,
  today = todayIso(),
): boolean {
  if (hotelCount >= RATES_FAR_DATE_THIN_NOTICE_THRESHOLD) return false;
  return daysAheadUntilCheckin(checkin, today) > RATES_NEAR_TERM_RETRY_MAX_DAYS_AHEAD;
}

export function shouldClientQuietRetryThinResults(
  checkin: string,
  hotelCount: number,
  opts: { isGeoSearch: boolean; today?: string },
): boolean {
  if (!opts.isGeoSearch) return false;
  if (!isCheckinWithinNearTermRetryWindow(checkin, opts.today)) return false;
  return hotelCount < RATES_THIN_RESULT_THRESHOLD;
}

type PostRatesFn = (body: Record<string, unknown>) => Promise<RatesSearchPayload>;
type SleepFn = (ms: number) => Promise<void>;

const defaultSleep: SleepFn = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function buildDelayedRetryBody(body: Record<string, unknown>): Record<string, unknown> {
  return {
    ...buildRatesRetryBody(body),
    timeout: LITEAPI_RATES_DELAYED_RETRY_TIMEOUT_SECONDS,
  };
}

/**
 * Runs LiteAPI /hotels/rates with near-term delayed retries for thin geo searches.
 * Far-date thin searches keep the legacy immediate long-timeout retry only.
 */
export async function runRatesSearchWithRetries(
  body: Record<string, unknown>,
  checkin: string,
  checkout: string,
  postRates: PostRatesFn,
  opts?: { sleep?: SleepFn; today?: string },
): Promise<{ data: RatesSearchPayload; meta: RatesSearchRetryMeta }> {
  const sleep = opts?.sleep ?? defaultSleep;
  const today = opts?.today ?? todayIso();
  const geoBody = body as GeoRatesBody;
  const nights = nightsBetween(checkin, checkout);

  let data = await postRates(body);
  const initialCount = countDistinctRateHotels(data);
  let delayedAttempts = 0;
  let usedImmediateRetry = false;

  if (shouldRunImmediateThinRatesRetry(data, geoBody, checkin, today)) {
    usedImmediateRetry = true;
    try {
      const retryData = await postRates(buildRatesRetryBody(body));
      data = mergeRatesPayloads(data, retryData);
    } catch {
      // Keep the first response if the retry fails.
    }
  }

  if (shouldRunDelayedThinRatesRetries(data, geoBody, checkin, today)) {
    for (const delayMs of RATES_DELAYED_RETRY_DELAYS_MS) {
      if (!shouldRunDelayedThinRatesRetries(data, geoBody, checkin, today)) break;
      await sleep(delayMs);
      delayedAttempts += 1;
      try {
        const retryData = await postRates(buildDelayedRetryBody(body));
        data = mergeRatesPayloads(data, retryData);
      } catch {
        // Keep the best response so far.
      }
    }
  }

  const finalCount = countDistinctRateHotels(data);

  return {
    data,
    meta: {
      initialCount,
      delayedAttempts,
      finalCount,
      daysAhead: daysAheadUntilCheckin(checkin, today),
      nights,
      usedImmediateRetry,
    },
  };
}

export function buildThinRatesSearchLogPayload(input: {
  placeId?: string;
  checkin: string;
  checkout: string;
  meta: RatesSearchRetryMeta;
}): Record<string, unknown> {
  return {
    kind: "thin_rates_search",
    placeId: input.placeId ?? null,
    checkin: input.checkin,
    checkout: input.checkout,
    nights: input.meta.nights,
    daysAhead: input.meta.daysAhead,
    hotelCountInitial: input.meta.initialCount,
    delayedRetryAttempts: input.meta.delayedAttempts,
    usedImmediateRetry: input.meta.usedImmediateRetry,
    hotelCountFinal: input.meta.finalCount,
    timestamp: new Date().toISOString(),
  };
}
