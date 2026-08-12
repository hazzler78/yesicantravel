"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Map as MapIcon, SearchX, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { safetyBadgesFromHotel } from "@/lib/safetyBadges";
import { deriveStaySignals, type StayFilterId, type StaySignals } from "@/lib/staySignals";
import {
  firstRateTotalByHotel,
  RESULTS_HOTEL_LIMIT,
  type RateOffer,
} from "@/lib/resultsPricing";
import { ResultsSearchBar } from "@/components/results/ResultsSearchBar";
import { HotelCard, HotelCardSkeleton, type HotelCardData } from "@/components/results/HotelCard";
import { ResultsFilters, type ResultsFilterState } from "@/components/results/ResultsFilters";
import { SecondaryLink } from "@/components/ui/SecondaryButton";

const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
  loading: () => <p className="p-4 text-center text-[0.9375rem] text-ink-muted">Loading map…</p>,
});

interface HotelBasic {
  id: string;
  name: string;
  main_photo?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

interface HotelListItem extends HotelBasic, HotelCardData {
  price?: number;
  currency?: string;
  hasFreeCancellation?: boolean;
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
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  const lastSearchEventSignature = useRef<string | null>(null);

  const { minRating, maxPrice, onlyFreeCancellation, signals } = filters;

  const updateFilters = useCallback((patch: Partial<ResultsFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ minRating: null, maxPrice: null, onlyFreeCancellation: false, signals: [] });
  }, []);

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

    async function run() {
      try {
        setSearchAnalyticsOutcome(null);
        const body: Record<string, string | number> = {
          checkin: checkin!,
          checkout: checkout!,
          adults: Number(adults),
        };
        if (placeId) body.placeId = placeId;
        if (aiSearch) body.aiSearch = aiSearch;

        const res = await fetch("/api/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Search failed");

        const data = (json.data ?? []) as Array<{
          hotelId: string;
          roomTypes?: Array<{
            rates?: Array<{
              name?: string;
              retailRate?: { total?: Array<{ amount: number; currency?: string }> };
              cancellationPolicies?: { refundableTag: string };
            }>;
          }>;
        }>;
        // Room names are where a women-only dorm shows up, when it shows up at all.
        const rateNamesByHotel: Record<string, string[]> = {};
        for (const offer of data) {
          const names = (offer.roomTypes ?? [])
            .flatMap((rt) => rt.rates ?? [])
            .map((rate) => rate.name)
            .filter((name): name is string => Boolean(name));
          if (names.length) rateNamesByHotel[offer.hotelId] = names;
        }
        const hotelsFromApi = (json.hotels ?? []) as (HotelBasic & {
          location?: { latitude?: number; longitude?: number };
          rating?: number; // guest review rating, when present
        })[];
        const uniqueHotelIds = [
          ...new Set([...data.map((d) => d.hotelId), ...hotelsFromApi.map((h) => h.id)].filter(Boolean)),
        ];

        if (aiSearch && hotelsFromApi.length > 0) {
          // For vibe/AI search, enrich basic hotel data with full details (including coordinates)
          const details = await Promise.all(
            hotelsFromApi.slice(0, RESULTS_HOTEL_LIMIT).map(async (h) => {
              try {
                const r = await fetch(`/api/hotel?hotelId=${encodeURIComponent(h.id)}`);
                const j = await r.json();
                return j.data ?? j;
              } catch {
                return null;
              }
            })
          );
          const byHotelId: Record<
            string,
            {
              address?: string;
              rating?: number;
              reviewCount?: number;
              lat?: number;
              lng?: number;
              safetyBadges?: string[];
              signals?: StaySignals;
            }
          > = {};
          for (const d of details) {
            if (!d?.id) continue;
            const loc = d.location;
            byHotelId[d.id] = {
              address: d.address,
              rating: normaliseRating(d.rating, d.starRating),
              reviewCount: typeof d.reviewCount === "number" ? d.reviewCount : undefined,
              lat: typeof loc?.latitude === "number" ? loc.latitude : undefined,
              lng: typeof loc?.longitude === "number" ? loc.longitude : undefined,
              safetyBadges: safetyBadgesFromHotel(d),
              signals: deriveStaySignals({
                ...d,
                rateNames: rateNamesByHotel[d.id],
              }),
            };
          }

          const merged = hotelsFromApi.map((h) => {
            const rateData = data.find((d) => d.hotelId === h.id);
            const allRates = rateData?.roomTypes?.flatMap((rt) => rt.rates ?? []) ?? [];
            const firstRate = allRates[0];
            const freeCancellation = allRates.some((r) => r.cancellationPolicies?.refundableTag === "RFN");
            const extra = byHotelId[h.id] ?? {};
            return {
              ...h,
              address: extra.address ?? h.address,
              rating: extra.rating ?? normaliseRating(h.rating),
              reviewCount: extra.reviewCount,
              price: firstRate?.retailRate?.total?.[0]?.amount,
              currency: firstRate?.retailRate?.total?.[0]?.currency ?? "USD",
              hasFreeCancellation: freeCancellation,
              lat: extra.lat,
              lng: extra.lng,
              safetyBadges: extra.safetyBadges ?? [],
              signals: extra.signals,
            };
          });
          setHotels(merged);
          setSearchAnalyticsOutcome({
            apiRateCount: data.length,
            apiHotelCount: hotelsFromApi.length,
            uniqueHotelCount: uniqueHotelIds.length,
            enrichedHotelCount: merged.length,
            sampleHotels: merged.slice(0, 5).map((h) => ({
              id: h.id,
              name: h.name,
              rating: h.rating,
              price: h.price,
              currency: h.currency,
            })),
          });
        } else {
          const ids: string[] = [...new Set(data.map((d) => d.hotelId))];
          const details = await Promise.all(
            ids.slice(0, RESULTS_HOTEL_LIMIT).map(async (id) => {
              const r = await fetch(`/api/hotel?hotelId=${encodeURIComponent(id)}`);
              const j = await r.json();
              return j.data ?? j;
            })
          );
          const totalByHotel = firstRateTotalByHotel(data as RateOffer[]);
          const freeCancellationByHotel: Record<string, boolean> = {};
          for (const d of data) {
            if (freeCancellationByHotel[d.hotelId]) continue;
            freeCancellationByHotel[d.hotelId] = (d.roomTypes ?? [])
              .flatMap((rt) => rt.rates ?? [])
              .some((r) => r.cancellationPolicies?.refundableTag === "RFN");
          }
          const merged = details.filter(Boolean).map((h) => ({
            id: h.id,
            name: h.name,
            main_photo: h.main_photo ?? h.hotelImages?.[0]?.url,
            address: h.address,
            rating: normaliseRating(h.rating, h.starRating),
            reviewCount: typeof h.reviewCount === "number" ? h.reviewCount : undefined,
            price: totalByHotel[h.id]?.amount,
            currency: totalByHotel[h.id]?.currency ?? "EUR",
            hasFreeCancellation: freeCancellationByHotel[h.id] ?? false,
            lat: h.location?.latitude,
            lng: h.location?.longitude,
            safetyBadges: safetyBadgesFromHotel(h),
            signals: deriveStaySignals({ ...h, rateNames: rateNamesByHotel[h.id] }),
          }));
          setHotels(merged);
          setSearchAnalyticsOutcome({
            apiRateCount: data.length,
            apiHotelCount: hotelsFromApi.length,
            uniqueHotelCount: uniqueHotelIds.length,
            enrichedHotelCount: merged.length,
            sampleHotels: merged.slice(0, 5).map((h) => ({
              id: h.id,
              name: h.name,
              rating: h.rating,
              price: h.price,
              currency: h.currency,
            })),
          });
        }
      } catch (e) {
        const message = (e as Error).message;
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
        setLoading(false);
      }
    }
    run();
  }, [searchParams]);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "1";
  const placeId = searchParams.get("placeId");
  const aiSearch = searchParams.get("aiSearch");

  const nights = nightsBetween(checkin, checkout);
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
        const loc = data?.location;
        if (typeof data?.displayName === "string") setPlaceLabel(data.displayName);
        if (loc && typeof loc.latitude === "number" && typeof loc.longitude === "number") {
          setPlaceDetails({
            location: { latitude: loc.latitude, longitude: loc.longitude },
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
    `${adults} ${Number(adults) === 1 ? "traveller" : "travellers"}`,
  ].join(" · ");

  const hotelHref = (id: string) =>
    `/hotel/${id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${
      placeId ? `&placeId=${placeId}` : ""
    }${aiSearch ? `&aiSearch=${encodeURIComponent(aiSearch)}` : ""}`;

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
            summary={searchSummary}
            variant="compact"
            initialMode={aiSearch ? "vibe" : "destination"}
            initialDestination={placeLabel}
            initialPlaceId={placeId ?? ""}
            initialVibe={aiSearch ?? ""}
            initialCheckin={checkin ?? undefined}
            initialCheckout={checkout ?? undefined}
            initialGuests={Number(adults) || 1}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {loading ? "Finding stays…" : `${filteredAndSortedHotels.length} stays for your dates`}
            </h1>
            <p className="mt-1 text-[0.9375rem] text-ink-muted">
              {formatDate(checkin)} – {formatDate(checkout)} · {nights}{" "}
              {nights === 1 ? "night" : "nights"} · {adults}{" "}
              {Number(adults) === 1 ? "traveller" : "travellers"}
            </p>
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
            />
          </aside>

          <div className="min-w-0 space-y-4">
            <div
              id="yict-map"
              className={`h-64 w-full overflow-hidden rounded-card border border-border bg-surface-muted ${
                mapOpen ? "flex items-center justify-center" : "hidden lg:flex lg:items-center lg:justify-center"
              }`}
              aria-label="Map of stays in this area"
            >
              {!effectivePlaceForMap && !placeId ? (
                <p className="px-4 text-center text-[0.9375rem] text-ink-muted">
                  The map appears once stays include location data, or when you search by destination.
                </p>
              ) : placeDetailsError && !derivedPlaceFromHotels ? (
                <p className="px-4 text-center text-[0.9375rem] text-ink-muted">
                  The map couldn&apos;t load. You can still browse the list below.
                </p>
              ) : !effectivePlaceForMap ? (
                <p className="text-[0.9375rem] text-ink-muted">Loading map…</p>
              ) : (
                <ResultsMap
                  placeDetails={effectivePlaceForMap}
                  hotels={hotelsWithCoords.map((h) => ({
                    id: h.id,
                    name: h.name,
                    lat: h.lat,
                    lng: h.lng,
                    address: h.address,
                    rating: h.rating,
                    price: h.price,
                    currency: h.currency,
                    href: hotelHref(h.id),
                  }))}
                  className="h-full w-full"
                />
              )}
            </div>

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
                  onSelect={() => track("Rates Viewed", { hotelId: hotel.id })}
                />
              ))}

            {!loading && filteredAndSortedHotels.length === 0 && (
              <div className="rounded-card border border-border bg-surface p-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                  <SearchX className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                  {hotels.length === 0 ? "No stays for these dates" : "Nothing matches these filters"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-muted">
                  {hotels.length === 0
                    ? "Try shifting your dates by a day or two, or search a nearby city."
                    : "Loosen the rating or budget filter to see more of what's available."}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  {hotels.length > 0 && isFiltered && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-teal px-4 text-[0.9375rem] font-semibold text-white hover:bg-teal-hover"
                    >
                      Clear filters
                    </button>
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
