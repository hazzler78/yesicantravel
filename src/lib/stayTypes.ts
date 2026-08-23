/** Stay-type filters for LiteAPI `hotelTypeIds`. 264 is backpacker/hostel (Bunks at Rode) — not 203. */

export const STAY_TYPES = {
  all: {
    id: "all",
    label: "All stays",
    hotelTypeIds: null as number[] | null,
  },
  hotels: {
    id: "hotels",
    label: "Hotels",
    hotelTypeIds: [204, 206],
  },
  budget: {
    id: "budget",
    label: "Budget",
    hotelTypeIds: [203, 264, 208, 216, 225],
  },
  apartments: {
    id: "apartments",
    label: "Apartments",
    hotelTypeIds: [201, 219, 220, 222, 250, 257],
  },
} as const;

export type StayType = keyof typeof STAY_TYPES;

export const STAY_TYPE_ORDER: StayType[] = ["all", "hotels", "budget", "apartments"];

/** 20 km — LiteAPI placeId is ~1 km; Nittedal-style searches need a real radius. */
export const DEFAULT_SEARCH_RADIUS_M = 20_000;

export function parseStayType(raw: unknown): StayType {
  if (raw === "hotels" || raw === "budget" || raw === "apartments" || raw === "all") {
    return raw;
  }
  return "all";
}

export function extractPlaceLatLng(raw: unknown): { latitude: number; longitude: number } | null {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!obj) return null;
  const data = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;

  const loc = data.location as Record<string, unknown> | undefined;
  if (typeof loc?.latitude === "number" && typeof loc?.longitude === "number") {
    return { latitude: loc.latitude, longitude: loc.longitude };
  }
  const geom = data.geometry as Record<string, unknown> | undefined;
  const geomLoc = geom?.location as Record<string, unknown> | undefined;
  if (typeof geomLoc?.lat === "number" && typeof geomLoc?.lng === "number") {
    return { latitude: geomLoc.lat, longitude: geomLoc.lng };
  }
  if (typeof data.lat === "number" && typeof data.lng === "number") {
    return { latitude: data.lat, longitude: data.lng };
  }
  if (typeof data.latitude === "number" && typeof data.longitude === "number") {
    return { latitude: data.latitude, longitude: data.longitude };
  }
  return null;
}
