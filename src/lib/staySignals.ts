/**
 * Derives the practical signals a woman travelling alone actually asks about,
 * from the fields our accommodation partner really publishes.
 *
 * What the API does and does not have, measured across ~100 European
 * properties in August 2026:
 *   - Women-only rooms exist ONLY inside `rooms[].roomName` (e.g. "Bed in
 *     4-Bed Female Dormitory Room"), and only for hostels. Hostels are a
 *     rounding error in this inventory (7 across six capital cities), so the
 *     filter is real but will usually match nothing. The UI shows live counts
 *     rather than pretending otherwise.
 *   - There is no women-only facility: 0 of 814 entries in the facility
 *     vocabulary mention gender.
 *   - "24-hour front desk" is published by ~100% of properties, so it is worth
 *     showing but worthless as a filter.
 *   - 24-hour security (58%), private check-in (38%) and distance to a station
 *     (POI data, present on every property) genuinely discriminate. Broader
 *     variants do not: CCTV is at 86%, and 82% of properties are within 1 km
 *     of a station.
 *
 * Re-measure with `node scripts/audit-stay-signals.mjs` before trusting these.
 */

export type StayFilterId = "womenOnlyRoom" | "nearTransit" | "securityOnSite" | "privateCheckIn";

export type PointOfInterest = {
  name?: string;
  category?: string;
  distanceKm?: number;
  importance?: string;
};

export type StaySignalInput = {
  rooms?: Array<{ roomName?: string | null } | null> | null;
  /** Room names seen on the rate offers, which sometimes differ from `rooms`. */
  rateNames?: Array<string | null | undefined> | null;
  facilities?: Array<{ name?: string } | null> | null;
  hotelFacilities?: string[] | null;
  poi?: PointOfInterest[] | null;
  checkinCheckoutTimes?: {
    checkin_start?: string | null;
    checkin_end?: string | null;
  } | null;
};

export type NearestTransit = { name: string; distanceKm: number };

export type StaySignals = {
  matches: StayFilterId[];
  nearestTransit?: NearestTransit;
  /** Display string such as "23:30", only when the property publishes it. */
  latestCheckIn?: string;
  roundTheClockReception: boolean;
};

/**
 * 500 m is a short, well-trodden walk, and it is the point where the filter
 * actually narrows: 82% of city-centre properties sit within 1 km of a
 * station, but only 42% within 500 m.
 */
export const NEAR_TRANSIT_KM = 0.5;

const TRANSIT_CATEGORIES = new Set(["train_station", "transit", "subway", "metro", "bus_station"]);

/**
 * Only room names are searched for gendered terms. Descriptions produce false
 * positives ("popular with women travellers" is marketing, not a policy).
 */
const WOMEN_ONLY_ROOM = /\b(female|women|women's|womens|ladies|ladies')\b/i;

// Deliberately narrow. CCTV in common areas is published by 86% of properties
// and a security alarm by 74%, so filtering on those excludes almost nothing;
// a staffed 24-hour security presence sits at 58% and is a real choice.
const SECURITY_ON_SITE = /24-hour security|24 hour security/i;
const PRIVATE_CHECK_IN = /private check-in/i;
const ROUND_THE_CLOCK_RECEPTION = /24-hour front desk|24 hour front desk|24-hour reception|24 hour reception/i;

export function facilityNames(input: StaySignalInput): string[] {
  const fromObjects = (input.facilities ?? [])
    .map((f) => f?.name)
    .filter((name): name is string => Boolean(name));
  const fromStrings = (input.hotelFacilities ?? []).filter(Boolean);
  return Array.from(new Set([...fromObjects, ...fromStrings].map((s) => s.trim()).filter(Boolean)));
}

function roomNames(input: StaySignalInput): string[] {
  const fromRooms = (input.rooms ?? [])
    .map((r) => r?.roomName)
    .filter((name): name is string => Boolean(name));
  const fromRates = (input.rateNames ?? []).filter((name): name is string => Boolean(name));
  return [...fromRooms, ...fromRates];
}

export function findNearestTransit(poi?: PointOfInterest[] | null): NearestTransit | undefined {
  let nearest: NearestTransit | undefined;
  for (const point of poi ?? []) {
    if (!point?.category || !TRANSIT_CATEGORIES.has(point.category)) continue;
    if (typeof point.distanceKm !== "number" || !Number.isFinite(point.distanceKm)) continue;
    if (!point.name) continue;
    if (!nearest || point.distanceKm < nearest.distanceKm) {
      nearest = { name: point.name, distanceKm: point.distanceKm };
    }
  }
  return nearest;
}

/** Turns "11:30 PM" into minutes past midnight, treating "12:00 AM" as end of day. */
function parseClockTime(value?: string | null): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3];
  if (meridiem) {
    hour %= 12;
    if (/pm/i.test(meridiem)) hour += 12;
  }
  const minutes = hour * 60 + minute;
  if (!Number.isFinite(minutes)) return null;
  return minutes === 0 ? 24 * 60 : minutes;
}

function formatClockTime(minutes: number): string {
  if (minutes >= 24 * 60) return "midnight";
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function deriveStaySignals(input: StaySignalInput | null | undefined): StaySignals {
  if (!input) return { matches: [], roundTheClockReception: false };

  const facilities = facilityNames(input).join(" | ");
  const rooms = roomNames(input).join(" | ");
  const nearestTransit = findNearestTransit(input.poi);
  const roundTheClockReception = ROUND_THE_CLOCK_RECEPTION.test(facilities);

  const matches: StayFilterId[] = [];
  if (WOMEN_ONLY_ROOM.test(rooms)) matches.push("womenOnlyRoom");
  if (nearestTransit && nearestTransit.distanceKm <= NEAR_TRANSIT_KM) matches.push("nearTransit");
  if (SECURITY_ON_SITE.test(facilities)) matches.push("securityOnSite");
  if (PRIVATE_CHECK_IN.test(facilities)) matches.push("privateCheckIn");

  const checkInEnd = parseClockTime(input.checkinCheckoutTimes?.checkin_end);

  return {
    matches,
    nearestTransit,
    // Only worth saying when it's late enough to answer "can I still get in?".
    latestCheckIn: checkInEnd != null && checkInEnd >= 21 * 60 ? formatClockTime(checkInEnd) : undefined,
    roundTheClockReception,
  };
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}
