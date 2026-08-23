import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails, searchRates } from "@/lib/liteapi";
import { normalizeCurrency, resolveRequestCurrency } from "@/lib/currency";
import { sanitizeChildAges, sanitizeOccupancies } from "@/lib/occupancy";
import {
  DEFAULT_SEARCH_RADIUS_M,
  extractPlaceLatLng,
  parseStayType,
  STAY_TYPES,
} from "@/lib/stayTypes";

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

    if (placeId) {
      try {
        const details = await getPlaceDetails(placeId);
        const coords = extractPlaceLatLng(details);
        if (coords) {
          latitude = coords.latitude;
          longitude = coords.longitude;
          radius =
            typeof body.radius === "number" && body.radius >= 1000
              ? Math.min(body.radius, 50_000)
              : DEFAULT_SEARCH_RADIUS_M;
          placeId = undefined;
        }
      } catch {
        // Fall back to LiteAPI placeId search.
      }
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
