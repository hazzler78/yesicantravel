import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi";
import { fixtureRates } from "@/lib/__uiFixtures";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (process.env.YICT_UI_FIXTURES === "1") return NextResponse.json(fixtureRates());
    const data = await searchRates({
      placeId: body.placeId,
      hotelIds: body.hotelIds,
      aiSearch: body.aiSearch,
      checkin: body.checkin,
      checkout: body.checkout,
      adults: body.adults ?? 1,
      currency: body.currency,
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
