import { type CurrencyCode, isCurrencyCode } from "@/lib/currency";
import { buildResultsHotelRow, pricingForResults } from "@/lib/resultsHotelMerge";
import { RESULTS_HOTEL_LIMIT, type RateOffer } from "@/lib/resultsPricing";

export type ResultsHotelBasic = {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  hotelImages?: Array<{ url?: string; thumbnailUrl?: string; defaultImage?: boolean }>;
  address?: string;
  rating?: number;
  reviewCount?: number;
};

export type ResultsHotelListItem = ResultsHotelBasic & {
  price?: number;
  currency?: string;
  hasFreeCancellation?: boolean;
  refundableFromPrice?: number;
  lat?: number;
  lng?: number;
  safetyBadges?: string[];
  signals?: import("@/lib/staySignals").StaySignals;
};

type NormaliseRatingFn = (rating?: number, starRating?: number) => number | undefined;

export function countUniqueHotelsFromRatesPayload(json: {
  data?: Array<{ hotelId?: string }>;
  hotels?: Array<{ id?: string }>;
}): number {
  const data = json.data ?? [];
  const hotelsFromApi = json.hotels ?? [];
  return new Set(
    [...data.map((d) => d.hotelId), ...hotelsFromApi.map((h) => h.id)].filter(Boolean),
  ).size;
}

export function buildInitialResultsHotels(input: {
  json: {
    data?: Array<{
      hotelId: string;
      roomTypes?: Array<{
        rates?: Array<{
          name?: string;
          retailRate?: { total?: Array<{ amount: number; currency?: string }> };
          cancellationPolicies?: { refundableTag: string };
        }>;
      }>;
    }>;
    hotels?: ResultsHotelBasic[];
  };
  aiSearch: string | null;
  currency: string;
  normaliseRating: NormaliseRatingFn;
}): {
  hotels: ResultsHotelListItem[];
  uniqueHotelCount: number;
  apiRateCount: number;
  apiHotelCount: number;
} {
  const { json, aiSearch, normaliseRating } = input;
  const currency: CurrencyCode = isCurrencyCode(input.currency) ? input.currency : "EUR";
  const data = json.data ?? [];
  const hotelsFromApi = (json.hotels ?? []) as (ResultsHotelBasic & {
    location?: { latitude?: number; longitude?: number };
    rating?: number;
  })[];

  const rateNamesByHotel: Record<string, string[]> = {};
  for (const offer of data) {
    const names = (offer.roomTypes ?? [])
      .flatMap((rt) => rt.rates ?? [])
      .map((rate) => rate.name)
      .filter((name): name is string => Boolean(name));
    if (names.length) rateNamesByHotel[offer.hotelId] = names;
  }

  const uniqueHotelCount = countUniqueHotelsFromRatesPayload(json);
  const pricing = pricingForResults(data as RateOffer[], currency);
  const ids: string[] = [
    ...new Set(
      aiSearch && hotelsFromApi.length > 0
        ? hotelsFromApi.map((h) => h.id)
        : data.map((d) => d.hotelId),
    ),
  ].filter(Boolean);

  const apiHotelByKey = new Map(
    hotelsFromApi
      .filter((h) => h?.id)
      .map((h) => [h.id, h as ResultsHotelBasic & { latitude?: number; longitude?: number }]),
  );

  const buildRow = (id: string, detail?: ResultsHotelBasic | null) =>
    buildResultsHotelRow({
      id,
      offers: data as RateOffer[],
      pricing,
      apiHotel: apiHotelByKey.get(id),
      detail,
      rateNames: rateNamesByHotel[id],
      currency,
      normaliseRating,
      starRating: (detail as { starRating?: number } | undefined)?.starRating,
    });

  const hotels = ids.slice(0, RESULTS_HOTEL_LIMIT).map((id) =>
    buildRow(id, apiHotelByKey.get(id)),
  );

  return {
    hotels,
    uniqueHotelCount,
    apiRateCount: data.length,
    apiHotelCount: hotelsFromApi.length,
  };
}
