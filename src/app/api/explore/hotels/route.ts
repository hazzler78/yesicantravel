import { NextRequest, NextResponse } from "next/server";
import { searchHotelsByArea } from "@/lib/liteapi";
import { parseStayType, STAY_TYPES } from "@/lib/stayTypes";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lng"));
  const radiusRaw = Number(params.get("radius") ?? 5000);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }
  const radius = Math.min(Math.max(Math.round(radiusRaw), 1000), 50_000);
  const stay = parseStayType(params.get("stay"));
  const typeIds = STAY_TYPES[stay].hotelTypeIds;

  try {
    const hotels = await searchHotelsByArea({
      latitude,
      longitude,
      radius,
      hotelTypeIds: typeIds ? [...typeIds] : undefined,
      limit: 5000,
    });
    return NextResponse.json({ data: hotels, stay, radius, count: hotels.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
