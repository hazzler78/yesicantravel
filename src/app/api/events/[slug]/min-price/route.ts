import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { getEventBySlug, getCheckoutDate } from "@/data/events";

/**
 * GET /api/events/[slug]/min-price
 * Returns lowest rate for the event's dates (aiSearch + startDate/checkout).
 * Used by event pages for "From X €/night" urgency. Cached by client; consider
 * adding response cache (e.g. revalidate 3600) if you want server-side caching.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const checkout = getCheckoutDate(event.endDate);
    const data = await searchRates({
      aiSearch: event.aiSearchTemplate,
      checkin: event.startDate,
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

    if (minAmount === null) {
      return NextResponse.json({ minPrice: null, currency: "EUR" });
    }

    // Per-night estimate: total stay / nights (rough; API returns total stay)
    const nights = Math.max(
      1,
      Math.ceil((new Date(checkout).getTime() - new Date(event.startDate).getTime()) / 86400000)
    );
    const minPerNight = Math.round(minAmount / nights);

    return NextResponse.json(
      { minPrice: minPerNight, minTotal: minAmount, currency, nights },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (e) {
    console.error("[events/min-price]", e);
    return NextResponse.json(
      { error: (e as Error).message, minPrice: null },
      { status: 500 }
    );
  }
}
