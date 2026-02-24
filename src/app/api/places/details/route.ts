import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/liteapi";

/** Extract latitude/longitude from various API response shapes (LiteAPI / Google-style). */
function normalizePlaceLocation(raw: unknown): {
  location: { latitude: number; longitude: number };
  viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
} | null {
  const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : null;
  if (!obj) return null;

  // Unwrap if response is { data: { ... } }
  const data = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;

  let lat: number | undefined;
  let lng: number | undefined;

  const loc = data?.location as Record<string, unknown> | undefined;
  if (loc && typeof loc.latitude === "number" && typeof loc.longitude === "number") {
    lat = loc.latitude;
    lng = loc.longitude;
  }
  const geom = data?.geometry as Record<string, unknown> | undefined;
  const geomLoc = geom?.location as Record<string, unknown> | undefined;
  if ((lat == null || lng == null) && geomLoc && typeof geomLoc.lat === "number" && typeof geomLoc.lng === "number") {
    lat = geomLoc.lat;
    lng = geomLoc.lng;
  }
  if ((lat == null || lng == null) && typeof data?.lat === "number" && typeof data?.lng === "number") {
    lat = data.lat;
    lng = data.lng;
  }

  if (lat == null || lng == null) return null;

  let viewport: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } } | undefined;
  const vp = data?.viewport as Record<string, unknown> | undefined;
  if (vp?.high && vp?.low && typeof vp.high === "object" && typeof vp.low === "object") {
    const high = vp.high as Record<string, unknown>;
    const low = vp.low as Record<string, unknown>;
    const hLat = (high.latitude ?? high.lat) as number | undefined;
    const hLng = (high.longitude ?? high.lng) as number | undefined;
    const lLat = (low.latitude ?? low.lat) as number | undefined;
    const lLng = (low.longitude ?? low.lng) as number | undefined;
    if (typeof hLat === "number" && typeof hLng === "number" && typeof lLat === "number" && typeof lLng === "number") {
      viewport = { high: { latitude: hLat, longitude: hLng }, low: { latitude: lLat, longitude: lLng } };
    }
  }

  return {
    location: { latitude: lat, longitude: lng },
    viewport,
  };
}

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId?.trim()) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }
  try {
    const raw = await getPlaceDetails(placeId.trim());
    const normalized = normalizePlaceLocation(raw);
    if (!normalized) {
      return NextResponse.json(
        { error: "Place details did not include coordinates" },
        { status: 422 }
      );
    }
    return NextResponse.json({ data: normalized });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
