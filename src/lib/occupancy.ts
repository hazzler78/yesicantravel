/**
 * Party size for rate search. LiteAPI quotes a *room* occupancy, not a headcount:
 * four adults in one room is a family/quad, which most hotels (especially in
 * smaller towns) simply do not sell. Two adults + two children is a different
 * product, as is two double rooms.
 */

export const DEFAULT_CHILD_AGE = 8;
export const MIN_ADULTS = 1;
export const MAX_ADULTS = 6;
export const MAX_CHILDREN = 4;
export const MAX_CHILD_AGE = 17;

export type RoomOccupancy = {
  adults: number;
  children?: number[];
};

export type Party = {
  adults: number;
  childAges: number[];
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampAdults(value: number): number {
  return clamp(value, MIN_ADULTS, MAX_ADULTS);
}

export function clampChildAge(value: number): number {
  return clamp(value, 0, MAX_CHILD_AGE);
}

export function parseChildAges(childrenParam: string | null, childAgesParam?: string | null): number[] {
  const fromAges = (childAgesParam ?? "").trim();
  if (fromAges) {
    return fromAges
      .split(/[,\s]+/)
      .map((part) => clampChildAge(Number(part)))
      .filter((age) => Number.isFinite(age))
      .slice(0, MAX_CHILDREN);
  }

  const raw = (childrenParam ?? "").trim();
  if (!raw) return [];

  if (raw.includes(",")) {
    return raw
      .split(",")
      .map((part) => clampChildAge(Number(part)))
      .filter((age) => Number.isFinite(age))
      .slice(0, MAX_CHILDREN);
  }

  const asNumber = Number(raw);
  if (!Number.isFinite(asNumber)) return [];
  // A single 1–4 is a child *count* (ages default). 5–17 is one child of that age.
  if (asNumber >= 1 && asNumber <= MAX_CHILDREN) {
    return Array.from({ length: asNumber }, () => DEFAULT_CHILD_AGE);
  }
  if (asNumber >= 0 && asNumber <= MAX_CHILD_AGE) {
    return [clampChildAge(asNumber)];
  }
  return [];
}

export function partyFromSearchParams(params: {
  adults?: string | null;
  children?: string | null;
  childAges?: string | null;
}): Party {
  return {
    adults: clampAdults(Number(params.adults ?? 1) || 1),
    childAges: parseChildAges(params.children ?? null, params.childAges ?? null),
  };
}

export function occupancyQuery(party: Party, extra?: { rooms?: number }): Record<string, string> {
  const query: Record<string, string> = { adults: String(party.adults) };
  if (party.childAges.length > 0) {
    query.children = String(party.childAges.length);
    query.childAges = party.childAges.join(",");
  }
  if (extra?.rooms && extra.rooms > 1) query.rooms = String(extra.rooms);
  return query;
}

export function appendOccupancyParams(qs: URLSearchParams, party: Party, extra?: { rooms?: number }) {
  const query = occupancyQuery(party, extra);
  for (const [key, value] of Object.entries(query)) qs.set(key, value);
}

/** One room with the whole party — what the visitor asked for. */
export function buildPrimaryOccupancies(party: Party): RoomOccupancy[] {
  const occupancy: RoomOccupancy = { adults: party.adults };
  if (party.childAges.length > 0) occupancy.children = party.childAges;
  return [occupancy];
}

/**
 * Spread the party across rooms of at most two adults, so a family of four is
 * not quoted as a single quad. Children stay with an adult.
 */
export function buildSplitOccupancies(party: Party): RoomOccupancy[] | null {
  const people = party.adults + party.childAges.length;
  if (people <= 2) return null;

  const roomCount = Math.min(3, Math.max(2, Math.ceil(party.adults / 2)));
  const rooms: RoomOccupancy[] = Array.from({ length: roomCount }, () => ({
    adults: 0,
    children: [] as number[],
  }));

  for (let i = 0; i < party.adults; i += 1) {
    rooms[i % roomCount].adults += 1;
  }
  const withAdults = rooms.filter((room) => room.adults > 0);
  party.childAges.forEach((age, index) => {
    const target = withAdults[index % withAdults.length];
    target.children = [...(target.children ?? []), age];
  });

  return rooms
    .filter((room) => room.adults > 0)
    .map((room) =>
      room.children && room.children.length > 0
        ? room
        : { adults: room.adults },
    );
}

export function occupanciesForRequest(party: Party, rooms = 1): RoomOccupancy[] {
  if (rooms >= 2) return buildSplitOccupancies(party) ?? buildPrimaryOccupancies(party);
  return buildPrimaryOccupancies(party);
}

export function parsePartyFromSearchParams(params: URLSearchParams): Party {
  return partyFromSearchParams({
    adults: params.get("adults"),
    children: params.get("children"),
    childAges: params.get("childAges"),
  });
}

export function requestedRoomsFromSearchParams(params: URLSearchParams): number {
  const n = Number(params.get("rooms") ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(3, Math.round(n));
}

export function occupancySummary(party: Party, rooms = 1): string {
  return partyLabel(party, rooms);
}

export function sanitizeOccupancies(raw: unknown): RoomOccupancy[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const rooms: RoomOccupancy[] = [];
  for (const item of raw.slice(0, 3)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { adults?: unknown; children?: unknown };
    const adults = clampAdults(Number(rec.adults) || 1);
    const children = Array.isArray(rec.children)
      ? rec.children
          .map((age) => clampChildAge(Number(age)))
          .filter((age) => Number.isFinite(age))
          .slice(0, MAX_CHILDREN)
      : [];
    rooms.push(children.length > 0 ? { adults, children } : { adults });
  }
  return rooms.length > 0 ? rooms : undefined;
}

export function sanitizeChildAges(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const ages = raw
    .map((age) => clampChildAge(Number(age)))
    .filter((age) => Number.isFinite(age))
    .slice(0, MAX_CHILDREN);
  return ages.length > 0 ? ages : undefined;
}

/** LiteAPI books one named guest per room, not per traveller. */
export function guestsForBooking(
  occupancies: RoomOccupancy[],
  guest: { firstName: string; lastName: string; email: string },
): Array<{ occupancyNumber: number; firstName: string; lastName: string; email: string }> {
  const rooms = occupancies.length > 0 ? occupancies : [{ adults: 1 }];
  return rooms.map((_, index) => ({
    occupancyNumber: index + 1,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
  }));
}

export function buildStaySearchParams(opts: {
  checkin?: string | null;
  checkout?: string | null;
  party: Party;
  rooms?: number;
  hotelId?: string | null;
  offerId?: string | null;
  placeId?: string | null;
  aiSearch?: string | null;
}): URLSearchParams {
  const query = new URLSearchParams();
  if (opts.checkin) query.set("checkin", opts.checkin);
  if (opts.checkout) query.set("checkout", opts.checkout);
  appendOccupancyParams(query, opts.party, { rooms: opts.rooms });
  if (opts.hotelId) query.set("hotelId", opts.hotelId);
  if (opts.offerId) query.set("offerId", opts.offerId);
  if (opts.placeId) query.set("placeId", opts.placeId);
  if (opts.aiSearch) query.set("aiSearch", opts.aiSearch);
  return query;
}

export function partyLabel(party: Party, rooms = 1): string {
  const bits = [
    `${party.adults} ${party.adults === 1 ? "adult" : "adults"}`,
  ];
  if (party.childAges.length > 0) {
    bits.push(
      `${party.childAges.length} ${party.childAges.length === 1 ? "child" : "children"}`,
    );
  }
  if (rooms > 1) bits.push(`${rooms} rooms`);
  return bits.join(" · ");
}

export function travellersSummary(party: Party): string {
  if (party.childAges.length === 0) {
    return `${party.adults} ${party.adults === 1 ? "adult" : "adults"}`;
  }
  return `${party.adults} ${party.adults === 1 ? "adult" : "adults"}, ${party.childAges.length} ${
    party.childAges.length === 1 ? "child" : "children"
  }`;
}

export function liteApiOccupancies(rooms: RoomOccupancy[]): Array<{ adults: number; children?: number[] }> {
  return rooms.map((room) => {
    const occupancy: { adults: number; children?: number[] } = { adults: room.adults };
    if (room.children && room.children.length > 0) occupancy.children = room.children;
    return occupancy;
  });
}
