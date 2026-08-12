import { NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { popularCities } from "@/data/popularCities";
import { cheapestVisibleTotal, perNight, type RateOffer } from "@/lib/resultsPricing";

const NIGHTS = 2;
const ADULTS = 1;
const DAYS_AHEAD = 14;

/** Default check-in 14 days from now – identical to the links on the city cards. */
function getDefaultDates() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + DAYS_AHEAD);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + NIGHTS);
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

export type CityPrice = { perNight: number | null; currency: string };

export type MinPricesResponse = {
  checkin: string;
  checkout: string;
  nights: number;
  adults: number;
  cities: Record<string, CityPrice>;
};

/**
 * GET /api/popular-cities/min-prices
 *
 * The lowest nightly price a visitor will actually find after clicking a city
 * card, for the exact dates that card links to.
 *
 * This deliberately searches by `placeId` and reads rates the same way
 * /results does. The previous version searched by free-text `aiSearch`, which
 * returns a different handful of hotels on every call, so the advertised price
 * matched neither the city's real minimum nor the page it linked to.
 *
 * Cached 1h to limit upstream calls.
 */
export async function GET() {
  try {
    const { checkin, checkout } = getDefaultDates();

    const results = await Promise.all(
      popularCities.map(async (city): Promise<{ slug: string } & CityPrice> => {
        try {
          const data = await searchRates({
            placeId: city.placeId,
            checkin,
            checkout,
            adults: ADULTS,
            currency: "EUR",
          });
          const cheapest = cheapestVisibleTotal((data?.data ?? []) as RateOffer[]);
          if (!cheapest) return { slug: city.slug, perNight: null, currency: "EUR" };
          const nightly = perNight(cheapest, NIGHTS);
          return { slug: city.slug, perNight: nightly.amount, currency: nightly.currency };
        } catch {
          return { slug: city.slug, perNight: null, currency: "EUR" };
        }
      })
    );

    const cities: Record<string, CityPrice> = {};
    for (const result of results) {
      cities[result.slug] = { perNight: result.perNight, currency: result.currency };
    }

    const body: MinPricesResponse = {
      checkin,
      checkout,
      nights: NIGHTS,
      adults: ADULTS,
      cities,
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (e) {
    console.error("[popular-cities/min-prices]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
