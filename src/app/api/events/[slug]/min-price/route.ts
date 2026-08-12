import { NextRequest, NextResponse } from "next/server";
import { searchRates, searchPlaces } from "@/lib/liteapi";
import { getEventBySlug, getEventStayWindow } from "@/data/events";
import { DEFAULT_CURRENCY, resolveRequestCurrency } from "@/lib/currency";

/**
 * GET /api/events/[slug]/min-price?currency=SEK
 * Returns lowest rate for the event's dates in the visitor's currency.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const currency = resolveRequestCurrency({
      queryCurrency: request.nextUrl.searchParams.get("currency"),
      cookieHeader: request.headers.get("cookie"),
      fallback: DEFAULT_CURRENCY,
    });

    // A finished event has no bookable dates to quote.
    const stay = getEventStayWindow(event);
    if (!stay) {
      return NextResponse.json({ minPrice: null, currency });
    }

    let placeId: string | undefined;
    if (event.placeQuery) {
      try {
        const placeRes = await searchPlaces(event.placeQuery);
        const first = (placeRes as { data?: Array<{ placeId?: string }> })?.data?.[0];
        placeId = first?.placeId;
      } catch {
        // fall back to aiSearch below
      }
    }

    const data = await searchRates({
      ...(placeId ? { placeId } : { aiSearch: event.aiSearchTemplate }),
      checkin: stay.checkin,
      checkout: stay.checkout,
      adults: 1,
      currency,
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
    let quoteCurrency: string = currency;

    for (const hotel of rateData) {
      const allRates = hotel.roomTypes?.flatMap((rt) => rt.rates ?? []) ?? [];
      for (const rate of allRates) {
        const total = rate.retailRate?.total?.[0];
        if (total?.amount != null) {
          if (minAmount === null || total.amount < minAmount) {
            minAmount = total.amount;
            quoteCurrency = total.currency ?? currency;
          }
        }
      }
    }

    if (minAmount === null) {
      return NextResponse.json({ minPrice: null, currency });
    }

    const minPerNight = Math.round(minAmount / stay.nights);

    return NextResponse.json(
      { minPrice: minPerNight, minTotal: minAmount, currency: quoteCurrency, nights: stay.nights },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          Vary: "Cookie",
        },
      }
    );
  } catch (e) {
    console.error("[events/min-price]", e);
    return NextResponse.json(
      { error: (e as Error).message, minPrice: null },
      { status: 500 }
    );
  }
}
