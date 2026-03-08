import { NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { popularCities } from "@/data/popularCities";

/** Default check-in 14 days from now, checkout +2 nights – same as homepage links */
function getDefaultDates() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 14);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 2);
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

export type MinPriceEntry = { minPrice: number | null; currency: string };

/**
 * GET /api/popular-cities/min-prices
 * Returns lowest price per night per popular city for default dates.
 * Cached 1h to limit LiteAPI calls.
 */
export async function GET() {
  try {
    const { checkin, checkout } = getDefaultDates();
    const nights = 2;

    const results = await Promise.all(
      popularCities.map(async (city): Promise<{ slug: string } & MinPriceEntry> => {
        try {
          const data = await searchRates({
            aiSearch: city.aiSearch,
            checkin,
            checkout,
            adults: 1,
            currency: "EUR",
            maxRatesPerHotel: 3,
          });

          const rateData = (data?.data ?? []) as Array<{
            roomTypes?: Array<{
              rates?: Array<{
                retailRate?: { total?: Array<{ amount: number; currency?: string }> };
              }>;
            }>;
          }>;

          let minAmount: number | null = null;
          let currency = "EUR";

          for (const hotel of rateData) {
            const allRates = hotel.roomTypes?.flatMap((rt) => rt.rates ?? []) ?? [];
            for (const rate of allRates) {
              const total = rate.retailRate?.total?.[0];
              if (total?.amount != null) {
                if (minAmount === null || total.amount < minAmount) {
                  minAmount = total.amount;
                  currency = total.currency ?? "EUR";
                }
              }
            }
          }

          const minPerNight =
            minAmount != null ? Math.round(minAmount / nights) : null;

          return {
            slug: city.slug,
            minPrice: minPerNight,
            currency,
          };
        } catch {
          return { slug: city.slug, minPrice: null, currency: "EUR" };
        }
      })
    );

    const bySlug: Record<string, MinPriceEntry> = {};
    for (const r of results) {
      bySlug[r.slug] = { minPrice: r.minPrice, currency: r.currency };
    }

    return NextResponse.json(bySlug, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (e) {
    console.error("[popular-cities/min-prices]", e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
