import { extractLatLng } from "@/lib/geo";
import { pickListHotelPhoto } from "@/lib/hotelImages";
import { repairLiteApiText } from "@/lib/repairLiteApiText";
import {
  summarizeRatesByHotel,
  type RateOffer,
  type HotelRateSummary,
} from "@/lib/resultsPricing";
import { safetyBadgesFromHotel } from "@/lib/safetyBadges";
import { deriveStaySignals, type StaySignals } from "@/lib/staySignals";
import type { CurrencyCode } from "@/lib/currency";

export type ResultsHotelBasic = {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  hotelImages?: Array<{ url?: string; thumbnailUrl?: string; defaultImage?: boolean }>;
  address?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  location?: { latitude?: number; longitude?: number };
};

export type ResultsHotelRow = ResultsHotelBasic & {
  price?: number;
  currency?: string;
  refundableFromPrice?: number;
  hasFreeCancellation?: boolean;
  lat?: number;
  lng?: number;
  safetyBadges?: string[];
  signals?: StaySignals;
};

function coordsForHotel(
  detail: ResultsHotelBasic | null | undefined,
  apiHotel: ResultsHotelBasic | undefined,
) {
  return (
    extractLatLng(detail) ??
    extractLatLng(apiHotel) ?? {
      lat: apiHotel?.latitude ?? detail?.latitude,
      lng: apiHotel?.longitude ?? detail?.longitude,
    }
  );
}

export function pricingForResults(
  offers: RateOffer[],
  currency: CurrencyCode,
): Record<string, HotelRateSummary> {
  return summarizeRatesByHotel(offers, currency);
}

export function buildResultsHotelRow(params: {
  id: string;
  offers: RateOffer[];
  pricing: Record<string, HotelRateSummary>;
  apiHotel?: ResultsHotelBasic;
  detail?: ResultsHotelBasic | null;
  rateNames?: string[];
  currency: CurrencyCode;
  normaliseRating: (rating?: number, starRating?: number) => number | undefined;
  starRating?: number;
}): ResultsHotelRow {
  const { id, pricing, apiHotel, detail, rateNames, currency, normaliseRating } = params;
  const summary = pricing[id];
  const source = detail ?? apiHotel;
  const coords = coordsForHotel(detail, apiHotel);
  const hotelForSignals = detail ?? apiHotel;

  return {
    id,
    name: source?.name ?? apiHotel?.name ?? "Stay",
    main_photo: pickListHotelPhoto({
      thumbnail: apiHotel?.thumbnail,
      main_photo: detail?.main_photo ?? apiHotel?.main_photo,
      hotelImages: detail?.hotelImages ?? apiHotel?.hotelImages,
    }),
    address: repairLiteApiText(detail?.address ?? apiHotel?.address),
    rating:
      normaliseRating(detail?.rating, params.starRating) ??
      normaliseRating(apiHotel?.rating),
    reviewCount: typeof detail?.reviewCount === "number" ? detail.reviewCount : undefined,
    price: summary?.lowest?.amount,
    currency: summary?.lowest?.currency ?? currency,
    refundableFromPrice: summary?.lowestRefundable?.amount,
    hasFreeCancellation: summary?.hasFreeCancellation ?? false,
    lat: coords?.lat,
    lng: coords?.lng,
    safetyBadges: hotelForSignals
      ? safetyBadgesFromHotel(hotelForSignals as Parameters<typeof safetyBadgesFromHotel>[0])
      : [],
    signals: hotelForSignals
      ? deriveStaySignals({
          ...(hotelForSignals as Record<string, unknown>),
          rateNames,
        })
      : undefined,
  };
}
