import type { Prisma } from "@prisma/client";
import { getAttributionFromRequest } from "@/lib/attribution";
import { prisma } from "@/lib/prisma";

export type SearchEmptyReason =
  | "missing_params"
  | "api_error"
  | "no_api_results"
  | "no_enriched_hotels"
  | "filtered_out";

type SearchFilters = {
  minRating?: number | null;
  maxPrice?: number | null;
  onlyFreeCancellation?: boolean;
  sortBy?: string;
};

type SearchSampleHotel = {
  id?: string;
  name?: string;
  rating?: number;
  price?: number;
  currency?: string;
};

export type SearchEventPayload = {
  mode?: string;
  placeId?: string | null;
  aiSearch?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number | string | null;
  currency?: string | null;
  guestNationality?: string | null;
  sessionId?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  apiRateCount?: number;
  apiHotelCount?: number;
  uniqueHotelCount?: number;
  enrichedHotelCount?: number;
  filteredHotelCount?: number;
  hotelsWithCoordsCount?: number;
  emptyReason?: SearchEmptyReason | null;
  filters?: SearchFilters | null;
  sampleHotels?: SearchSampleHotel[] | null;
  liteApiError?: string | null;
  context?: Record<string, unknown> | null;
};

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function cleanInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
  }
  return undefined;
}

function normalizeQuery(aiSearch: string | undefined, placeId: string | undefined): string | undefined {
  const source = aiSearch ?? placeId;
  return source?.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 512);
}

function toJsonValue<T>(value: T | null | undefined): Prisma.InputJsonValue | undefined {
  if (value == null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function deriveSearchEmptyReason(payload: SearchEventPayload): SearchEmptyReason | undefined {
  if (payload.emptyReason) return payload.emptyReason;
  if (payload.liteApiError) return "api_error";

  const placeId = cleanString(payload.placeId, 256);
  const aiSearch = cleanString(payload.aiSearch, 512);
  const checkin = cleanString(payload.checkin, 32);
  const checkout = cleanString(payload.checkout, 32);
  if ((!placeId && !aiSearch) || !checkin || !checkout) return "missing_params";

  const apiRateCount = cleanInt(payload.apiRateCount) ?? 0;
  const apiHotelCount = cleanInt(payload.apiHotelCount) ?? 0;
  const uniqueHotelCount = cleanInt(payload.uniqueHotelCount) ?? 0;
  const enrichedHotelCount = cleanInt(payload.enrichedHotelCount) ?? 0;
  const filteredHotelCount = cleanInt(payload.filteredHotelCount) ?? 0;

  if (apiRateCount === 0 && apiHotelCount === 0 && uniqueHotelCount === 0) return "no_api_results";
  if (uniqueHotelCount > 0 && enrichedHotelCount === 0) return "no_enriched_hotels";
  if (enrichedHotelCount > 0 && filteredHotelCount === 0) return "filtered_out";
  return undefined;
}

export async function recordSearchEvent(payload: SearchEventPayload) {
  const placeId = cleanString(payload.placeId, 256);
  const aiSearch = cleanString(payload.aiSearch, 512);
  const attribution = await getAttributionFromRequest();

  return prisma.searchEvent.create({
    data: {
      mode: cleanString(payload.mode, 32) ?? (aiSearch ? "vibe" : "destination"),
      placeId,
      aiSearch,
      normalizedQuery: normalizeQuery(aiSearch, placeId),
      checkin: cleanString(payload.checkin, 32),
      checkout: cleanString(payload.checkout, 32),
      adults: cleanInt(payload.adults),
      currency: cleanString(payload.currency, 8),
      guestNationality: cleanString(payload.guestNationality, 8),
      sessionId: cleanString(payload.sessionId, 128),
      pageUrl: cleanString(payload.pageUrl, 2048),
      referrer: cleanString(payload.referrer, 2048) ?? attribution.referrer,
      userAgent: cleanString(payload.userAgent, 512),
      apiRateCount: cleanInt(payload.apiRateCount) ?? 0,
      apiHotelCount: cleanInt(payload.apiHotelCount) ?? 0,
      uniqueHotelCount: cleanInt(payload.uniqueHotelCount) ?? 0,
      enrichedHotelCount: cleanInt(payload.enrichedHotelCount) ?? 0,
      filteredHotelCount: cleanInt(payload.filteredHotelCount) ?? 0,
      hotelsWithCoordsCount: cleanInt(payload.hotelsWithCoordsCount) ?? 0,
      emptyReason: deriveSearchEmptyReason(payload),
      filters: toJsonValue(payload.filters),
      sampleHotels: toJsonValue(payload.sampleHotels),
      attribution: toJsonValue(attribution),
      liteApiError: cleanString(payload.liteApiError, 512),
      context: toJsonValue(payload.context),
    },
  });
}
