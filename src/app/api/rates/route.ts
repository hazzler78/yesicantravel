import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { normalizeCurrency, resolveRequestCurrency } from "@/lib/currency";
import { sanitizeChildAges, sanitizeOccupancies } from "@/lib/occupancy";
import { DEFAULT_SEARCH_RADIUS_M, parseStayType, STAY_TYPES } from "@/lib/stayTypes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currency = normalizeCurrency(
      body.currency ??
        resolveRequestCurrency({
          cookieHeader: request.headers.get("cookie"),
        })
    );
    const stay = parseStayType(body.stay ?? body.stayType);
    const typeIds = STAY_TYPES[stay].hotelTypeIds;
    const hotelTypeIds = typeIds ? [...typeIds] : undefined;

    let latitude: number | undefined;
    let longitude: number | undefined;
    let radius: number | undefined;
    let placeId = typeof body.placeId === "string" ? body.placeId : undefined;

    // placeId is the primary search (LiteAPI resolves the region well).
    // Coords+radius only kick in when a caller passes them explicitly or as a fallback.
    if (
      typeof body.latitude === "number" &&
      typeof body.longitude === "number"
    ) {
      latitude = body.latitude;
      longitude = body.longitude;
      radius =
        typeof body.radius === "number" && body.radius >= 1000
          ? Math.min(body.radius, 50_000)
          : DEFAULT_SEARCH_RADIUS_M;
      placeId = undefined;
    }

    const data = await searchRates({
      placeId,
      hotelIds: body.hotelIds,
      aiSearch: body.aiSearch,
      checkin: body.checkin,
      checkout: body.checkout,
      adults: body.adults ?? 1,
      children: sanitizeChildAges(body.children),
      occupancies: sanitizeOccupancies(body.occupancies),
      currency,
      guestNationality: body.guestNationality,
      maxRatesPerHotel: body.maxRatesPerHotel,
      hotelTypeIds,
      latitude,
      longitude,
      radius,
    });
    return NextResponse.json({ ...data, stay, radius: radius ?? null });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
