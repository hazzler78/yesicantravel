import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { getDestinationBySlug } from "@/data/destinations";
import { getPlaceIdForDestinationSlug } from "@/data/popularCities";
import { redirectedDestinationSlugs } from "@/lib/legacyRedirects";
import { cheapestVisibleTotal, perNight, type RateOffer } from "@/lib/resultsPricing";
import { getDefaultStayWindow } from "@/lib/stayDates";
import { DEFAULT_CURRENCY, resolveRequestCurrency } from "@/lib/currency";

const ADULTS = 1;

/**
 * GET /api/destinations/[slug]/min-price?currency=SEK
 *
 * Lowest nightly price for the same dates and inventory the destination CTA
 * opens on /results. Uses placeId when we have one so the advertised figure
 * is actually on the next page.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const dest = getDestinationBySlug(slug);
    if (!dest || redirectedDestinationSlugs.has(slug)) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const currency = resolveRequestCurrency({
      queryCurrency: request.nextUrl.searchParams.get("currency"),
      cookieHeader: request.headers.get("cookie"),
      fallback: DEFAULT_CURRENCY,
    });

    const stay = getDefaultStayWindow();
    const placeId = getPlaceIdForDestinationSlug(slug);

    const data = await searchRates({
      ...(placeId ? { placeId } : { aiSearch: dest.aiSearch }),
      checkin: stay.checkin,
      checkout: stay.checkout,
      adults: ADULTS,
      currency,
    });

    const cheapest = cheapestVisibleTotal((data?.data ?? []) as RateOffer[]);
    if (!cheapest) {
      return NextResponse.json({ minPrice: null, currency, ...stay });
    }

    const nightly = perNight(cheapest, stay.nights);

    return NextResponse.json(
      {
        minPrice: nightly.amount,
        minTotal: cheapest.amount,
        currency: nightly.currency,
        ...stay,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          Vary: "Cookie",
        },
      }
    );
  } catch (e) {
    console.error("[destinations/min-price]", e);
    return NextResponse.json(
      { error: (e as Error).message, minPrice: null },
      { status: 500 }
    );
  }
}
