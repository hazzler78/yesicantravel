/**
 * Shared rate-reading rules so the "from" price advertised on a city card and
 * the prices rendered on /results can never drift apart.
 */

export type RateOffer = {
  hotelId: string;
  roomTypes?: Array<{
    rates?: Array<{
      retailRate?: { total?: Array<{ amount: number; currency?: string }> };
    }>;
  }>;
};

export type Money = { amount: number; currency: string };

/**
 * The results page enriches only the first slice of hotel ids, so any price we
 * quote elsewhere has to be drawn from the same slice to be reachable.
 */
export const RESULTS_HOTEL_LIMIT = 20;

/** The first priced rate per hotel — the figure the result card shows. */
export function firstRateTotalByHotel(offers: RateOffer[]): Record<string, Money> {
  const byHotel: Record<string, Money> = {};
  for (const offer of offers) {
    if (byHotel[offer.hotelId]) continue;
    const total = (offer.roomTypes ?? [])
      .flatMap((roomType) => roomType.rates ?? [])
      .map((rate) => rate.retailRate?.total?.[0])
      .find((money) => typeof money?.amount === "number");
    if (total) {
      byHotel[offer.hotelId] = { amount: total.amount, currency: total.currency ?? "EUR" };
    }
  }
  return byHotel;
}

/** Cheapest stay total among the hotels /results will actually render. */
export function cheapestVisibleTotal(offers: RateOffer[]): Money | null {
  const byHotel = firstRateTotalByHotel(offers);
  const visibleIds = [...new Set(offers.map((offer) => offer.hotelId))].slice(
    0,
    RESULTS_HOTEL_LIMIT
  );
  let cheapest: Money | null = null;
  for (const id of visibleIds) {
    const total = byHotel[id];
    if (!total) continue;
    if (!cheapest || total.amount < cheapest.amount) cheapest = total;
  }
  return cheapest;
}

/** Rounded up, so a headline price is never lower than anything bookable. */
export function perNight(total: Money, nights: number): Money {
  return { amount: Math.ceil(total.amount / Math.max(1, nights)), currency: total.currency };
}
