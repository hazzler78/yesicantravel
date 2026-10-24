import { galleryHotelPhotos, shrinkHotelImageUrl } from "@/lib/hotelImages";

export type HotelRoomRate = {
  name: string;
  mappedRoomId: number;
  offerId: string;
  boardName: string;
  retailRate: {
    total: Array<{ amount: number; currency: string }>;
  };
  cancellationPolicies?: { refundableTag: string };
};

export type RoomGroup = {
  mappedRoomId: number;
  roomName: string;
  photos: string[];
  rates: HotelRoomRate[];
};

type HotelRoom = { id: number; roomName: string; photos?: Array<{ url: string }> };

type HotelForRooms = {
  rooms?: HotelRoom[];
  main_photo?: string;
  hotelImages?: Array<{ url: string; thumbnailUrl?: string; defaultImage?: boolean }>;
};

function normalizeRoomLabel(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, "")
    .trim();
}

function rateTotal(rate: HotelRoomRate): { amount: number; currency: string } | null {
  const total = rate.retailRate?.total?.[0];
  if (typeof total?.amount !== "number") return null;
  return { amount: total.amount, currency: total.currency ?? "EUR" };
}

/** Drop duplicate bookable rows (same price/board/refund/room label). */
export function dedupeHotelRates(rates: HotelRoomRate[]): HotelRoomRate[] {
  const seenOffer = new Set<string>();
  const seenSignature = new Set<string>();
  const out: HotelRoomRate[] = [];

  for (const rate of rates) {
    if (rate.offerId && seenOffer.has(rate.offerId)) continue;
    const total = rateTotal(rate);
    const signature = [
      rate.mappedRoomId,
      normalizeRoomLabel(rate.name || ""),
      rate.boardName,
      total?.amount ?? "",
      total?.currency ?? "",
      rate.cancellationPolicies?.refundableTag ?? "",
    ].join("|");
    if (seenSignature.has(signature)) continue;
    if (rate.offerId) seenOffer.add(rate.offerId);
    seenSignature.add(signature);
    out.push(rate);
  }
  return out;
}

function roomPhotos(
  roomInfo: HotelRoom | undefined,
  hotel: HotelForRooms,
): string[] {
  const fromRoom = (roomInfo?.photos ?? [])
    .map((photo) => photo.url)
    .filter((url, index, all): url is string => Boolean(url) && all.indexOf(url) === index)
    .map((url) => shrinkHotelImageUrl(url, "list"));

  if (fromRoom.length > 0) return fromRoom;

  const fallback = galleryHotelPhotos(hotel, "list").slice(0, 4);
  return fallback;
}

function findRoom(
  roomMap: Map<number, HotelRoom>,
  mappedRoomId: number,
  rateName: string,
  hotel: HotelForRooms,
): HotelRoom | undefined {
  const direct = roomMap.get(mappedRoomId);
  if (direct) return direct;
  const normalized = normalizeRoomLabel(rateName);
  if (!normalized) return undefined;
  return hotel.rooms?.find(
    (room) => normalizeRoomLabel(room.roomName) === normalized,
  );
}

/** Group LiteAPI rates into room cards with deduped rows and photo fallbacks. */
export function buildRoomGroups(hotel: HotelForRooms, allRates: HotelRoomRate[]): RoomGroup[] {
  const roomMap = new Map<number, HotelRoom>();
  for (const room of hotel.rooms ?? []) {
    roomMap.set(room.id, room);
  }

  const byRoom = new Map<number, HotelRoomRate[]>();
  for (const rate of dedupeHotelRates(allRates)) {
    const mid = rate.mappedRoomId;
    if (!byRoom.has(mid)) byRoom.set(mid, []);
    byRoom.get(mid)!.push(rate);
  }

  const groups: RoomGroup[] = [];
  byRoom.forEach((rates, mappedRoomId) => {
    const primaryName = rates[0]?.name ?? "";
    const roomInfo = findRoom(roomMap, mappedRoomId, primaryName, hotel);
    const roomName = primaryName || roomInfo?.roomName || `Room ${mappedRoomId}`;
    groups.push({
      mappedRoomId,
      roomName,
      photos: roomPhotos(roomInfo, hotel),
      rates: dedupeHotelRates(rates),
    });
  });

  return groups.sort((a, b) => {
    const aMin = rateTotal(a.rates[0])?.amount ?? Number.MAX_SAFE_INTEGER;
    const bMin = rateTotal(b.rates[0])?.amount ?? Number.MAX_SAFE_INTEGER;
    return aMin - bMin;
  });
}
