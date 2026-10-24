/**
 * Shared rate-reading rules so the "from" price advertised on a city card and
 * the prices rendered on /results can never drift apart.
 */

export type RateLine = {
  retailRate?: { total?: Array<{ amount: number; currency?: string }> };
  cancellationPolicies?: { refundableTag?: string };
};

export type RateOffer = {
  hotelId: string;
  roomTypes?: Array<{
    rates?: RateLine[];
  }>;
};

export type Money = { amount: number; currency: string };

export type HotelRateSummary = {
  lowest: Money | null;
  lowestRefundable: Money | null;
  hasFreeCancellation: boolean;
};

/**
 * The results page enriches only the first slice of hotel ids, so any price we
 * quote elsewhere has to be drawn from the same slice to be reachable.
 */
export const RESULTS_HOTEL_LIMIT = 20;

/** How many rate plans we ask LiteAPI for per hotel on /results (balance speed vs cancellation visibility). */
export const RESULTS_MAX_RATES_PER_HOTEL = 12;

function moneyFromRate(rate: RateLine, fallbackCurrency: string): Money | null {
  const total = rate.retailRate?.total?.[0];
  if (typeof total?.amount !== "number") return null;
  return { amount: total.amount, currency: total.currency ?? fallbackCurrency };
}

function ratesForOffer(offer: RateOffer): RateLine[] {
  return (offer.roomTypes ?? []).flatMap((roomType) => roomType.rates ?? []);
}

/** Cheapest total and cheapest refundable total per hotel from all returned rates. */
export function summarizeRatesByHotel(
  offers: RateOffer[],
  fallbackCurrency = "EUR",
): Record<string, HotelRateSummary> {
  const byHotel: Record<string, HotelRateSummary> = {};
  for (const offer of offers) {
    let lowest: Money | null = null;
    let lowestRefundable: Money | null = null;
    for (const rate of ratesForOffer(offer)) {
      const money = moneyFromRate(rate, fallbackCurrency);
      if (!money) continue;
      if (!lowest || money.amount < lowest.amount) lowest = money;
      if (rate.cancellationPolicies?.refundableTag === "RFN") {
        if (!lowestRefundable || money.amount < lowestRefundable.amount) {
          lowestRefundable = money;
        }
      }
    }
    byHotel[offer.hotelId] = {
      lowest,
      lowestRefundable,
      hasFreeCancellation: lowestRefundable != null,
    };
  }
  return byHotel;
}

/** The first priced rate per hotel — legacy helper for destination min-price quotes. */
export function firstRateTotalByHotel(offers: RateOffer[]): Record<string, Money> {
  const byHotel: Record<string, Money> = {};
  for (const offer of offers) {
    if (byHotel[offer.hotelId]) continue;
    const summary = summarizeRatesByHotel([offer])[offer.hotelId];
    if (summary?.lowest) byHotel[offer.hotelId] = summary.lowest;
  }
  return byHotel;
}

/** Cheapest stay total among the hotels /results will actually render. */
export function cheapestVisibleTotal(offers: RateOffer[]): Money | null {
  const byHotel = summarizeRatesByHotel(offers);
  const visibleIds = [...new Set(offers.map((offer) => offer.hotelId))].slice(
    0,
    RESULTS_HOTEL_LIMIT,
  );
  let cheapest: Money | null = null;
  for (const id of visibleIds) {
    const total = byHotel[id]?.lowest;
    if (!total) continue;
    if (!cheapest || total.amount < cheapest.amount) cheapest = total;
  }
  return cheapest;
}

/** Rounded up, so a headline price is never lower than anything bookable. */
export function perNight(total: Money, nights: number): Money {
  return { amount: Math.ceil(total.amount / Math.max(1, nights)), currency: total.currency };
}
