"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Map as MapIcon, SearchX, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { type StayFilterId, type StaySignals } from "@/lib/staySignals";
import {
  RESULTS_HOTEL_LIMIT,
  RESULTS_MAX_RATES_PER_HOTEL,
  type RateOffer,
} from "@/lib/resultsPricing";
import { buildResultsHotelRow, pricingForResults } from "@/lib/resultsHotelMerge";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/fetchWithTimeout";
import { ResultsSearchBar } from "@/components/results/ResultsSearchBar";
import { HotelCard, HotelCardSkeleton, type HotelCardData } from "@/components/results/HotelCard";
import { ResultsFilters, type ResultsFilterState } from "@/components/results/ResultsFilters";
import { EmailCaptureResultsSlot } from "@/components/EmailCaptureResultsSlot";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
import { useCurrency } from "@/components/currency/CurrencyControl";
import { guestNationalityForCurrency } from "@/lib/currency";
import {
  appendOccupancyParams,
  buildSplitOccupancies,
  DEFAULT_CHILD_AGE,
  occupanciesForRequest,
  partyFromSearchParams,
  partyLabel,
  travellersSummary,
} from "@/lib/occupancy";
import { extractLatLng } from "@/lib/geo";
import { parseStayType, STAY_TYPE_ORDER, STAY_TYPES, type StayType } from "@/lib/stayTypes";
import {
  buildResultsSearchKey,
  cacheResultsList,
  consumeResultsReturn,
  hotelCardDomId,
  peekResultsReturn,
  readResultsListCache,
  rememberResultsReturn,
} from "@/lib/resultsReturnState";
import { formatIsoDateShort, nightsBetween as nightsBetweenIso } from "@/lib/stayDates";
import { shouldClientQuietRetryThinResults } from "@/lib/ratesSearchOrchestration";
import {
  buildInitialResultsHotels,
  countUniqueHotelsFromRatesPayload,
} from "@/lib/resultsRatesResponse";
import {
  isGeoDestinationSearch,
  pickResultsThinSearchCopy,
  shouldShowFarDateThinNotice,
} from "@/lib/resultsThinSearchUi";
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
  loading: () => <p className="p-4 text-center text-[0.9375rem] text-ink-muted">Loading map…</p>,
});

interface HotelBasic {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  hotelImages?: Array<{ url?: string; thumbnailUrl?: string; defaultImage?: boolean }>;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

interface HotelListItem extends HotelBasic, HotelCardData {
  price?: number;
  currency?: string;
  hasFreeCancellation?: boolean;
  refundableFromPrice?: number;
  lat?: number;
  lng?: number;
  safetyBadges?: string[];
  signals?: StaySignals;
}

type SearchAnalyticsOutcome = {
  apiRateCount: number;
  apiHotelCount: number;
  uniqueHotelCount: number;
  enrichedHotelCount: number;
  sampleHotels: Array<{
    id?: string;
    name?: string;
    rating?: number;
    price?: number;
    currency?: string;
  }>;
};

const SEARCH_SESSION_STORAGE_KEY = "yict_search_session_id";

const DEFAULT_FILTERS: ResultsFilterState = {
  // Deliberately no rating floor. Sorting already puts the best-reviewed stays
  // first, and a hidden floor made the "from" price on the homepage
  // unreachable when the cheapest stay scored below it.
  minRating: null,
  maxPrice: null,
  onlyFreeCancellation: false,
  signals: [],
};

const SIGNAL_IDS: StayFilterId[] = [
  "nearTransit",
  "securityOnSite",
  "privateCheckIn",
  "womenOnlyRoom",
];

/**
 * Guest scores arrive on a 10-point scale, star ratings on a 5-point one.
 * Normalising to 10 keeps the badge and the rating filter meaning one thing.
 */
function normaliseRating(rating?: number, starRating?: number) {
  if (typeof rating === "number" && rating > 0) return rating;
  if (typeof starRating === "number" && starRating > 0) return starRating * 2;
  return undefined;
}

function getSearchSessionId() {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(SEARCH_SESSION_STORAGE_KEY);
    if (existing) return existing;
    const next =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SEARCH_SESSION_STORAGE_KEY, next);
    return next;
  } catch {
    return undefined;
  }
}

function sendSearchAnalyticsEvent(payload: Record<string, unknown>) {
  fetch("/api/search-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt browsing results.
  });
}

function nightsBetween(checkin: string | null, checkout: string | null) {
  if (!checkin || !checkout) return 1;
  return Math.max(1, nightsBetweenIso(checkin, checkout));
}

function formatDate(iso: string | null) {
  return formatIsoDateShort(iso);
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stay = parseStayType(searchParams.get("stay"));
  const currency = useCurrency();
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResultsFilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [placeDetails, setPlaceDetails] = useState<{
    location: { latitude: number; longitude: number };
    viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
  } | null>(null);
  const [placeDetailsError, setPlaceDetailsError] = useState(false);
  const [placeLabel, setPlaceLabel] = useState("");
  const [searchAnalyticsOutcome, setSearchAnalyticsOutcome] = useState<SearchAnalyticsOutcome | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [usedSplitRooms, setUsedSplitRooms] = useState(false);
  const [pairAvailable, setPairAvailable] = useState(false);
  const [quietRetrying, setQuietRetrying] = useState(false);
  const [thinRescanNonce, setThinRescanNonce] = useState(0);
  const lastSearchEventSignature = useRef<string | null>(null);
  const clientQuietRetryDoneRef = useRef(false);
  const quietRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { minRating, maxPrice, onlyFreeCancellation, signals } = filters;

  const updateFilters = useCallback((patch: Partial<ResultsFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ minRating: null, maxPrice: null, onlyFreeCancellation: false, signals: [] });
  }, []);

  const previousCurrency = useRef(currency);
  useEffect(() => {
    if (previousCurrency.current === currency) return;
    previousCurrency.current = currency;
    setFilters((current) => (current.maxPrice == null ? current : { ...current, maxPrice: null }));
  }, [currency]);

  const searchKey = buildResultsSearchKey({
    placeId: searchParams.get("placeId"),
    aiSearch: searchParams.get("aiSearch"),
    checkin: searchParams.get("checkin"),
    checkout: searchParams.get("checkout"),
    adults: searchParams.get("adults") ?? "1",
    children: searchParams.get("children"),
    childAges: searchParams.get("childAges"),
    rooms: searchParams.get("rooms"),
    currency,
    stay,
  });

  const rememberHotelNavigation = useCallback(
    (hotelId: string) => {
      rememberResultsReturn({
        searchKey,
        hotelId,
        scrollY: window.scrollY,
        filters,
        sortBy,
      });
    },
    [searchKey, filters, sortBy]
  );

  useEffect(() => {
    const placeId = searchParams.get("placeId");
    const aiSearch = searchParams.get("aiSearch");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults") ?? "1";

    if ((!placeId && !aiSearch) || !checkin || !checkout) {
      sendSearchAnalyticsEvent({
        mode: aiSearch ? "vibe" : "destination",
        placeId,
        aiSearch,
        checkin,
        checkout,
        adults: Number(adults),
        sessionId: getSearchSessionId(),
        pageUrl: window.location.href,
        emptyReason: "missing_params",
        context: { source: "results_page" },
      });
      setError("Missing search parameters.");
      setLoading(false);
      return;
    }

    const returning = peekResultsReturn(searchKey);
    if (returning) {
      setFilters(returning.filters);
      setSortBy(returning.sortBy);
    }

    const cached = readResultsListCache(searchKey);
    if (cached && Array.isArray(cached.hotels) && cached.hotels.length > 0) {
      setHotels(cached.hotels as HotelListItem[]);
      if (cached.placeLabel) setPlaceLabel(cached.placeLabel);
      setLoading(false);
      setError(null);
      // Returning visitors keep the list they were browsing — no skeleton restart.
      return;
    }

    let cancelled = false;
    clientQuietRetryDoneRef.current = false;
    if (quietRetryTimerRef.current) {
      clearTimeout(quietRetryTimerRef.current);
      quietRetryTimerRef.current = null;
    }

    async function run() {
      try {
        setLoading(true);
        setEnriching(false);
        setError(null);
        setSearchAnalyticsOutcome(null);
        setUsedSplitRooms(false);
        setPairAvailable(false);
        const party = partyFromSearchParams({
          adults,
          children: searchParams.get("children"),
          childAges: searchParams.get("childAges"),
        });
        const requestedRooms = Number(searchParams.get("rooms") ?? 1) >= 2 ? 2 : 1;

        const requestRates = async (occupancies: Array<{ adults: number; children?: number[] }>) => {
          const res = await fetchWithTimeout("/api/rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            timeoutMs: 45_000,
            body: JSON.stringify({
              checkin: checkin!,
              checkout: checkout!,
              adults: party.adults,
              children: party.childAges,
              occupancies,
              currency,
              guestNationality: guestNationalityForCurrency(currency),
              maxRatesPerHotel: RESULTS_MAX_RATES_PER_HOTEL,
              stay,
              ...(placeId ? { placeId } : {}),
              ...(aiSearch ? { aiSearch } : {}),
            }),
          });
          const payload = await res.json();
          const message =
            typeof payload.error === "string" ? payload.error : payload.error?.message;
          if (!res.ok && payload?.error?.code !== 2001) {
            throw new Error(message ?? "Search failed");
          }
          return payload;
        };

        let json = await requestRates(occupanciesForRequest(party, requestedRooms));
        let split = requestedRooms >= 2;
        const primaryCount = (json.data ?? json.hotels ?? []).length;
        if (primaryCount === 0 && requestedRooms < 2) {
          const splitOccupancies = buildSplitOccupancies(party);
          if (splitOccupancies && splitOccupancies.length > 1) {
            const retry = await requestRates(splitOccupancies);
            if ((retry.data ?? retry.hotels ?? []).length > 0) {
              json = retry;
              split = true;
            }
          }
        }
        if ((json.data ?? json.hotels ?? []).length === 0 && party.adults + party.childAges.length >= 3) {
          const probe = await requestRates([{ adults: 2 }]);
          if ((probe.data ?? probe.hotels ?? []).length > 0) setPairAvailable(true);
        }
        setUsedSplitRooms(split);
        if (cancelled) return;

        const built = buildInitialResultsHotels({
          json,
          aiSearch,
          currency,
          normaliseRating,
        });
        const { hotels: initial, uniqueHotelCount, apiRateCount, apiHotelCount } = built;
        const ids = initial.map((h) => h.id);

        setHotels(initial);
        cacheResultsList({
          searchKey,
          hotels: initial,
          placeLabel: undefined,
        });
        setSearchAnalyticsOutcome({
          apiRateCount,
          apiHotelCount,
          uniqueHotelCount,
          enrichedHotelCount: initial.length,
          sampleHotels: initial.slice(0, 5).map((h) => ({
            id: h.id,
            name: h.name,
            rating: h.rating,
            price: h.price,
            currency: h.currency,
          })),
        });
        setLoading(false);

        const scheduleQuietRetryIfNeeded = (count: number) => {
          if (cancelled || clientQuietRetryDoneRef.current) return;
          if (
            !shouldClientQuietRetryThinResults(checkin!, count, {
              isGeoSearch: isGeoDestinationSearch(placeId, aiSearch),
            })
          ) {
            return;
          }
          clientQuietRetryDoneRef.current = true;
          setQuietRetrying(true);
          quietRetryTimerRef.current = setTimeout(async () => {
            if (cancelled) return;
            try {
              const retryJson = await requestRates(occupanciesForRequest(party, requestedRooms));
              const retryCount = countUniqueHotelsFromRatesPayload(retryJson);
              if (retryCount <= count) return;
              const retryBuilt = buildInitialResultsHotels({
                json: retryJson,
                aiSearch,
                currency,
                normaliseRating,
              });
              setHotels(retryBuilt.hotels);
              cacheResultsList({
                searchKey,
                hotels: retryBuilt.hotels,
                placeLabel: undefined,
              });
              setSearchAnalyticsOutcome({
                apiRateCount: retryBuilt.apiRateCount,
                apiHotelCount: retryBuilt.apiHotelCount,
                uniqueHotelCount: retryBuilt.uniqueHotelCount,
                enrichedHotelCount: retryBuilt.hotels.length,
                sampleHotels: retryBuilt.hotels.slice(0, 5).map((h) => ({
                  id: h.id,
                  name: h.name,
                  rating: h.rating,
                  price: h.price,
                  currency: h.currency,
                })),
              });
              setEnriching(true);
              const enrichIds = retryBuilt.hotels.map((h) => h.id);
              const details = await Promise.all(
                enrichIds.map(async (id) => {
                  try {
                    const r = await fetchWithTimeout(`/api/hotel?hotelId=${encodeURIComponent(id)}`, {
                      timeoutMs: 12_000,
                    });
                    const j = await r.json();
                    return j.data ?? j;
                  } catch {
                    return null;
                  }
                }),
              );
              if (cancelled) return;
              const data = retryJson.data ?? [];
              const pricing = pricingForResults(data as RateOffer[], currency);
              const hotelsFromApi = (retryJson.hotels ?? []) as HotelBasic[];
              const apiHotelByKey = new Map(
                hotelsFromApi.filter((h) => h?.id).map((h) => [h.id, h]),
              );
              const enriched = enrichIds.map((id, index) =>
                buildResultsHotelRow({
                  id,
                  offers: data as RateOffer[],
                  pricing,
                  apiHotel: apiHotelByKey.get(id),
                  detail: details[index],
                  currency,
                  normaliseRating,
                  starRating: (details[index] as { starRating?: number } | undefined)?.starRating,
                }),
              );
              setHotels(enriched);
              cacheResultsList({ searchKey, hotels: enriched, placeLabel: undefined });
            } catch {
              // Quiet retry must not surface errors.
            } finally {
              if (!cancelled) {
                setQuietRetrying(false);
                setEnriching(false);
              }
            }
          }, 6_000);
        };

        setEnriching(true);
        const enrichIds = ids.slice(0, RESULTS_HOTEL_LIMIT);
        const details = await Promise.all(
          enrichIds.map(async (id) => {
            try {
              const r = await fetchWithTimeout(`/api/hotel?hotelId=${encodeURIComponent(id)}`, {
                timeoutMs: 12_000,
              });
              const j = await r.json();
              return j.data ?? j;
            } catch {
              return null;
            }
          }),
        );
        if (cancelled) return;
        setEnriching(false);

        const data = (json.data ?? []) as RateOffer[];
        const pricing = pricingForResults(data, currency);
        const hotelsFromApi = (json.hotels ?? []) as HotelBasic[];
        const apiHotelByKey = new Map(hotelsFromApi.filter((h) => h?.id).map((h) => [h.id, h]));
        const enriched = enrichIds.map((id, index) =>
          buildResultsHotelRow({
            id,
            offers: data,
            pricing,
            apiHotel: apiHotelByKey.get(id),
            detail: details[index],
            currency,
            normaliseRating,
            starRating: (details[index] as { starRating?: number } | undefined)?.starRating,
          }),
        );
        setHotels(enriched);
        cacheResultsList({
          searchKey,
          hotels: enriched,
          placeLabel: undefined,
        });
        scheduleQuietRetryIfNeeded(uniqueHotelCount);
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof FetchTimeoutError
            ? "Search is taking longer than usual. Try again or narrow your dates."
            : (e as Error).message;
        sendSearchAnalyticsEvent({
          mode: aiSearch ? "vibe" : "destination",
          placeId,
          aiSearch,
          checkin,
          checkout,
          adults: Number(adults),
          sessionId: getSearchSessionId(),
          pageUrl: window.location.href,
          liteApiError: message,
          context: { source: "results_page_error" },
        });
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setEnriching(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
      if (quietRetryTimerRef.current) {
        clearTimeout(quietRetryTimerRef.current);
        quietRetryTimerRef.current = null;
      }
    };
  }, [searchParams, currency, searchKey, thinRescanNonce]);

  // Land back on the hotel the visitor just left — not the top of the list.
  useEffect(() => {
    if (loading || hotels.length === 0) return;
    const returning = peekResultsReturn(searchKey);
    if (!returning) return;

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        const card = document.getElementById(hotelCardDomId(returning.hotelId));
        if (card) {
          card.scrollIntoView({ block: "start" });
        } else {
          window.scrollTo({ top: returning.scrollY, behavior: "auto" });
        }
        consumeResultsReturn(searchKey);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [loading, hotels, searchKey, filters, sortBy]);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "1";
  const placeId = searchParams.get("placeId");
  const aiSearch = searchParams.get("aiSearch");
  const party = partyFromSearchParams({
    adults,
    children: searchParams.get("children"),
    childAges: searchParams.get("childAges"),
  });
  const roomsInSearch = Number(searchParams.get("rooms") ?? 1) >= 2 || usedSplitRooms ? 2 : 1;

  const changeStayType = useCallback(
    (id: StayType) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id === "all") next.delete("stay");
      else next.set("stay", id);
      router.replace(`/results?${next.toString()}`);
    },
    [router, searchParams]
  );

  const occupancyHref = (next: { adults?: number; childAges?: number[]; rooms?: number }) => {
    const qs = new URLSearchParams();
    if (placeId) qs.set("placeId", placeId);
    if (aiSearch) qs.set("aiSearch", aiSearch);
    if (stay !== "all") qs.set("stay", stay);
    if (checkin) qs.set("checkin", checkin);
    if (checkout) qs.set("checkout", checkout);
    appendOccupancyParams(
      qs,
      { adults: next.adults ?? party.adults, childAges: next.childAges ?? party.childAges },
      { rooms: next.rooms },
    );
    return `/results?${qs.toString()}`;
  };

  const nights = nightsBetween(checkin, checkout);
  const stayPrices = useMemo(
    () => hotels.map((hotel) => hotel.price).filter((price): price is number => typeof price === "number" && price > 0),
    [hotels],
  );
  const isFiltered =
    minRating !== null || maxPrice !== null || onlyFreeCancellation || signals.length > 0;

  /** Everything except the signal checkboxes, so their counts reflect a real next step. */
  const baseFilteredHotels = useMemo(
    () =>
      hotels.filter((h) => {
        if (minRating != null && (h.rating ?? 0) < minRating) return false;
        if (maxPrice != null && (h.price ?? Number.MAX_SAFE_INTEGER) > maxPrice) return false;
        if (onlyFreeCancellation && !h.hasFreeCancellation) return false;
        return true;
      }),
    [hotels, minRating, maxPrice, onlyFreeCancellation]
  );

  const signalCounts = useMemo(() => {
    const counts = Object.fromEntries(SIGNAL_IDS.map((id) => [id, 0])) as Record<
      StayFilterId,
      number
    >;
    for (const hotel of baseFilteredHotels) {
      for (const id of hotel.signals?.matches ?? []) counts[id] += 1;
    }
    return counts;
  }, [baseFilteredHotels]);

  const filteredAndSortedHotels = useMemo(() => {
    const filtered = baseFilteredHotels.filter((h) => {
      const matches = h.signals?.matches ?? [];
      return signals.every((id) => matches.includes(id));
    });
    if (sortBy === "price") {
      return [...filtered].sort((a, b) => {
        const pa = a.price ?? Number.MAX_SAFE_INTEGER;
        const pb = b.price ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    }
    // Default: highest rating first (safest first)
    return [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [baseFilteredHotels, signals, sortBy]);

  // Fetch place details server-side (avoids CORS with LiteAPI whitelabel) for map when searching by destination.
  useEffect(() => {
    if (!placeId?.trim()) {
      setPlaceDetails(null);
      setPlaceDetailsError(false);
      setPlaceLabel("");
      return;
    }
    setPlaceDetails(null);
    setPlaceDetailsError(false);
    fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
      .then((r) => {
        if (!r.ok) return r.json().then((j) => Promise.reject(new Error(j?.error ?? `Place details failed: ${r.status}`)));
        return r.json();
      })
      .then((json) => {
        const data = json.data ?? json;
        const loc = extractLatLng(data);
        if (typeof data?.displayName === "string") setPlaceLabel(data.displayName);
        if (loc) {
          setPlaceDetails({
            location: { latitude: loc.lat, longitude: loc.lng },
            viewport: data.viewport,
          });
        } else {
          setPlaceDetailsError(true);
        }
      })
      .catch(() => setPlaceDetailsError(true));
  }, [placeId]);

  const hotelsWithCoords = useMemo(
    () =>
      filteredAndSortedHotels.filter(
        (h): h is HotelListItem & { lat: number; lng: number } =>
          typeof h.lat === "number" && typeof h.lng === "number"
      ),
    [filteredAndSortedHotels]
  );

  useEffect(() => {
    if (!searchAnalyticsOutcome || loading) return;

    const payload = {
      mode: aiSearch ? "vibe" : "destination",
      placeId,
      aiSearch,
      checkin,
      checkout,
      adults: Number(adults),
      sessionId: getSearchSessionId(),
      pageUrl: window.location.href,
      ...searchAnalyticsOutcome,
      filteredHotelCount: filteredAndSortedHotels.length,
      hotelsWithCoordsCount: hotelsWithCoords.length,
      filters: { minRating, maxPrice, onlyFreeCancellation, signals, sortBy },
      context: { source: "results_page" },
    };
    const signature = JSON.stringify(payload);
    if (signature === lastSearchEventSignature.current) return;
    lastSearchEventSignature.current = signature;
    sendSearchAnalyticsEvent(payload);
  }, [
    adults,
    aiSearch,
    checkin,
    checkout,
    filteredAndSortedHotels.length,
    hotelsWithCoords.length,
    loading,
    maxPrice,
    minRating,
    onlyFreeCancellation,
    placeId,
    searchAnalyticsOutcome,
    signals,
    sortBy,
  ]);

  const derivedPlaceFromHotels = useMemo(() => {
    if (hotelsWithCoords.length === 0) return null;
    const lats = hotelsWithCoords.map((h) => h.lat);
    const lngs = hotelsWithCoords.map((h) => h.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      location: { latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2 },
      viewport: {
        high: { latitude: maxLat, longitude: maxLng },
        low: { latitude: minLat, longitude: minLng },
      },
    };
  }, [hotelsWithCoords]);

  const effectivePlaceForMap = placeDetails ?? derivedPlaceFromHotels;

  const searchSummary = [
    placeLabel || aiSearch || "Your search",
    `${formatDate(checkin)} – ${formatDate(checkout)}`,
    travellersSummary(party),
  ].join(" · ");

  const newsletterCity = placeLabel || aiSearch || undefined;
  const thinSearchCopy = pickResultsThinSearchCopy({ currency });
  const showFarDateThinNotice =
    !loading &&
    Boolean(checkin) &&
    shouldShowFarDateThinNotice(checkin!, hotels.length);
  const showThinSearchActions =
    !loading &&
    Boolean(checkin) &&
    shouldClientQuietRetryThinResults(checkin!, hotels.length, {
      isGeoSearch: isGeoDestinationSearch(placeId, aiSearch),
    });

  const rerunThinSearch = useCallback(() => {
    clientQuietRetryDoneRef.current = false;
    setThinRescanNonce((n) => n + 1);
  }, []);

  const hotelHref = (id: string) => {
    const qs = new URLSearchParams({
      checkin: checkin ?? "",
      checkout: checkout ?? "",
    });
    appendOccupancyParams(qs, party, { rooms: roomsInSearch });
    if (placeId) qs.set("placeId", placeId);
    if (aiSearch) qs.set("aiSearch", aiSearch);
    if (stay !== "all") qs.set("stay", stay);
    return `/hotel/${id}?${qs.toString()}`;
  };

  const mapHotels = useMemo(
    () =>
      hotelsWithCoords.map((h) => ({
        id: h.id,
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        address: h.address,
        rating: h.rating,
        price: h.price,
        currency: h.currency,
        href: hotelHref(h.id),
      })),
    [aiSearch, checkin, checkout, hotelsWithCoords, party, placeId, roomsInSearch],
  );

  const showHotelOnMap = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setMapOpen(true);
    window.setTimeout(() => {
      document.getElementById("yict-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-coral-soft text-coral">
            <TriangleAlert className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">
            We couldn&apos;t load these stays
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-muted">{error}</p>
          <div className="mt-6 flex justify-center">
            <SecondaryLink href="/">Start a new search</SecondaryLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas">
      {/* Search stays editable in place — changing dates shouldn't mean going back. */}
      <div className="sticky top-16 z-30 border-b border-border bg-surface-muted/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ResultsSearchBar
            key={`${party.adults}-${party.childAges.join(",")}-${roomsInSearch}`}
            summary={searchSummary}
            variant="compact"
            initialMode={aiSearch ? "vibe" : "destination"}
            initialDestination={placeLabel}
            initialPlaceId={placeId ?? ""}
            initialVibe={aiSearch ?? ""}
            initialCheckin={checkin ?? undefined}
            initialCheckout={checkout ?? undefined}
            initialAdults={party.adults}
            initialChildAges={party.childAges}
            initialStay={stay}
            onStayChange={changeStayType}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {loading
                ? "Finding stays…"
                : enriching
                  ? `Showing ${filteredAndSortedHotels.length} stays — loading details…`
                  : `${filteredAndSortedHotels.length} stays for your dates`}
            </h1>
            <p className="mt-1 text-[0.9375rem] text-ink-muted">
              {formatDate(checkin)} – {formatDate(checkout)} · {nights}{" "}
              {nights === 1 ? "night" : "nights"} · {partyLabel(party, roomsInSearch)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Type of stay">
              {STAY_TYPE_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => changeStayType(id)}
                  className={`min-h-[32px] rounded-full px-3 text-[0.8125rem] font-medium ${
                    stay === id
                      ? "bg-ink text-white"
                      : "border border-border bg-surface text-ink-muted hover:text-ink"
                  }`}
                >
                  {STAY_TYPES[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-[0.8125rem] text-ink-muted">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "rating" | "price")}
              className="min-h-[40px] w-auto rounded-control border border-border bg-surface px-3 text-[0.9375rem] font-medium text-ink"
            >
              <option value="rating">Highest rated</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-border bg-surface text-[0.9375rem] font-semibold text-ink"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
          <button
            type="button"
            onClick={() => setMapOpen((open) => !open)}
            aria-expanded={mapOpen}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-border bg-surface text-[0.9375rem] font-semibold text-ink"
          >
            <MapIcon className="h-4 w-4" aria-hidden />
            {mapOpen ? "Hide map" : "Map"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)] lg:gap-8">
          <aside className={`lg:sticky lg:top-36 lg:h-fit ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <ResultsFilters
              minRating={minRating}
              maxPrice={maxPrice}
              onlyFreeCancellation={onlyFreeCancellation}
              signals={signals}
              signalCounts={signalCounts}
              onChange={updateFilters}
              onReset={resetFilters}
              isFiltered={isFiltered}
              currency={currency}
              nights={nights}
              stayPrices={stayPrices}
            />
          </aside>

          <div className="min-w-0 space-y-4">
            <div
              id="yict-map"
              role="region"
              className={`relative h-72 w-full overflow-hidden rounded-card border border-border bg-surface-muted sm:h-80 ${
                mapOpen ? "block" : "hidden lg:block"
              }`}
              aria-label="Map of stays in this area"
            >
              {!effectivePlaceForMap && !placeId ? (
                <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.9375rem] text-ink-muted">
                  The map appears once stays include location data, or when you search by destination.
                </p>
              ) : placeDetailsError && !derivedPlaceFromHotels ? (
                <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.9375rem] text-ink-muted">
                  The map couldn&apos;t load. You can still browse the list below.
                </p>
              ) : !effectivePlaceForMap ? (
                <p className="absolute inset-0 flex items-center justify-center text-[0.9375rem] text-ink-muted">
                  Loading map…
                </p>
              ) : (
                <ResultsMap
                  placeDetails={effectivePlaceForMap}
                  hotels={mapHotels}
                  selectedHotelId={selectedHotelId ?? undefined}
                  onHotelNavigate={rememberHotelNavigation}
                  className="absolute inset-0 h-full w-full"
                />
              )}
            </div>

            {usedSplitRooms && !loading && hotels.length > 0 && (
              <div className="rounded-card border border-border bg-teal-soft/40 px-4 py-3 text-[0.9375rem] text-ink">
                Few properties sell a single room for {travellersSummary(party)}. These prices are
                for two rooms.
              </div>
            )}

            {quietRetrying && (
              <p className="rounded-card border border-border bg-surface-muted/80 px-4 py-3 text-[0.9375rem] text-ink-muted">
                {thinSearchCopy.fetchingMore}
              </p>
            )}

            {showFarDateThinNotice && (
              <p className="rounded-card border border-border bg-surface-muted/80 px-4 py-3 text-[0.9375rem] text-ink-muted">
                {thinSearchCopy.farDateThin}
              </p>
            )}

            {showThinSearchActions && !quietRetrying && (
              <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-muted/60 px-4 py-3 text-[0.9375rem] text-ink-muted">
                <span>Fewer hotels than usual showed up for these dates.</span>
                <button
                  type="button"
                  onClick={rerunThinSearch}
                  className="inline-flex min-h-[36px] items-center rounded-control border border-border bg-surface px-3 text-[0.875rem] font-semibold text-ink hover:bg-surface-muted"
                >
                  {thinSearchCopy.searchAgain}
                </button>
              </div>
            )}

            {loading &&
              Array.from({ length: 4 }).map((_, index) => <HotelCardSkeleton key={index} />)}

            {!loading &&
              filteredAndSortedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  signals={hotel.signals}
                  href={hotelHref(hotel.id)}
                  nights={nights}
                  onShowOnMap={
                    typeof hotel.lat === "number" && typeof hotel.lng === "number"
                      ? () => showHotelOnMap(hotel.id)
                      : undefined
                  }
                  onSelect={() => {
                    rememberHotelNavigation(hotel.id);
                    track("Rates Viewed", { hotelId: hotel.id });
                  }}
                />
              ))}

            {/* Once per page, after the list — not interleaved with hotels */}
            {!loading && filteredAndSortedHotels.length > 0 && (
              <EmailCaptureResultsSlot city={newsletterCity} />
            )}

            {!loading && filteredAndSortedHotels.length === 0 && (
              <div className="rounded-card border border-border bg-surface p-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                  <SearchX className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                  {hotels.length === 0 ? "No stays for this party" : "Nothing matches these filters"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-muted">
                  {hotels.length === 0
                    ? pairAvailable
                      ? `Hotels here are quoting rooms for two adults, not ${travellersSummary(party)} in one room. That usually means doubles — not that the town is full.`
                      : "Try shifting your dates by a day or two, searching nearby, or splitting adults and children."
                    : "Loosen the rating or budget filter to see more of what's available."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {hotels.length > 0 && isFiltered && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-teal px-4 text-[0.9375rem] font-semibold text-white hover:bg-teal-hover"
                    >
                      Clear filters
                    </button>
                  )}
                  {hotels.length === 0 && party.adults >= 3 && party.childAges.length === 0 && (
                    <SecondaryLink
                      href={occupancyHref({
                        adults: 2,
                        childAges: Array.from({ length: Math.min(2, party.adults - 2) }, () => DEFAULT_CHILD_AGE),
                      })}
                    >
                      Try 2 adults and children
                    </SecondaryLink>
                  )}
                  {hotels.length === 0 && party.adults + party.childAges.length >= 3 && (
                    <SecondaryLink href={occupancyHref({ adults: 2, childAges: [] })}>
                      Search 2 adults
                    </SecondaryLink>
                  )}
                  {hotels.length === 0 && party.adults + party.childAges.length >= 3 && roomsInSearch < 2 && (
                    <SecondaryLink href={occupancyHref({ rooms: 2 })}>Search two rooms</SecondaryLink>
                  )}
                  <SecondaryLink href="/">New search</SecondaryLink>
                </div>
              </div>
            )}

            {!loading && filteredAndSortedHotels.length > 0 && (
              <p className="pt-2 text-center text-[0.8125rem] text-ink-muted">
                Prices are totals for your dates, including taxes and fees.{" "}
                <Link href="/popular-cities" className="text-teal underline-offset-4 hover:underline">
                  Browse other cities
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <HotelCardSkeleton key={index} />
            ))}
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
