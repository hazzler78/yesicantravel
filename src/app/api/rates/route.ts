import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { normalizeCurrency, resolveRequestCurrency } from "@/lib/currency";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currency = normalizeCurrency(
      body.currency ??
        resolveRequestCurrency({
          cookieHeader: request.headers.get("cookie"),
        })
    );
    const data = await searchRates({
      placeId: body.placeId,
      hotelIds: body.hotelIds,
      aiSearch: body.aiSearch,
      checkin: body.checkin,
      checkout: body.checkout,
      adults: body.adults ?? 1,
      currency,
      guestNationality: body.guestNationality,
      maxRatesPerHotel: body.maxRatesPerHotel,
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
