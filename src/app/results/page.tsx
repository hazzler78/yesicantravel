"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { formatStayTotal } from "@/lib/formatStayPrice";

const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
  loading: () => <p className="text-center text-[var(--navy-light)]">Loading map…</p>,
});

interface HotelBasic {
  id: string;
  name: string;
  main_photo?: string;
  address?: string;
  rating?: number;
}

interface HotelListItem extends HotelBasic {
  price?: number;
  currency?: string;
  hasFreeCancellation?: boolean;
  lat?: number;
  lng?: number;
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

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(4);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onlyFreeCancellation, setOnlyFreeCancellation] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");
  const [placeDetails, setPlaceDetails] = useState<{
    location: { latitude: number; longitude: number };
    viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
  } | null>(null);
  const [placeDetailsError, setPlaceDetailsError] = useState(false);
  const [expandedHotelIds, setExpandedHotelIds] = useState<Record<string, boolean>>({});
  const [searchAnalyticsOutcome, setSearchAnalyticsOutcome] = useState<SearchAnalyticsOutcome | null>(null);
  const lastSearchEventSignature = useRef<string | null>(null);

  const toggleHotelExpanded = useCallback((hotelId: string) => {
    setExpandedHotelIds((prev) => {
      const nextOpen = !prev[hotelId];
      if (nextOpen) {
        track("Rates Viewed", { hotelId });
      }
      return { ...prev, [hotelId]: nextOpen };
    });
  }, []);

  useEffect(() => {
    const placeId = searchParams.get("placeId");
    const aiSearch = searchParams.get("aiSearch");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults") ?? "2";

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
              retailRate?: { total?: Array<{ amount: number; currency?: string }> };
              cancellationPolicies?: { refundableTag: string };
            }>;
          }>;
        }>;
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
            hotelsFromApi.slice(0, 20).map(async (h) => {
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
            { address?: string; rating?: number; lat?: number; lng?: number }
          > = {};
          for (const d of details) {
            if (!d?.id) continue;
            const loc = d.location;
            byHotelId[d.id] = {
              address: d.address,
              // Prefer guest review rating; fall back to star rating.
              rating: typeof d.rating === "number" ? d.rating : d.starRating,
              lat: typeof loc?.latitude === "number" ? loc.latitude : undefined,
              lng: typeof loc?.longitude === "number" ? loc.longitude : undefined,
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
              // Again, prefer review rating from details, then any rating on the list item.
              rating: extra.rating ?? h.rating,
              price: firstRate?.retailRate?.total?.[0]?.amount,
              currency: firstRate?.retailRate?.total?.[0]?.currency ?? "USD",
              hasFreeCancellation: freeCancellation,
              lat: extra.lat,
              lng: extra.lng,
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
            ids.slice(0, 20).map(async (id) => {
              const r = await fetch(`/api/hotel?hotelId=${encodeURIComponent(id)}`);
              const j = await r.json();
              return j.data ?? j;
            })
          );
          const rateByHotel: Record<string, { amount: number; currency?: string; hasFreeCancellation: boolean }> = {};
          for (const d of data) {
            const allRates = d.roomTypes?.flatMap((rt) => rt.rates ?? []) ?? [];
            const firstRate = allRates[0];
            const total = firstRate?.retailRate?.total?.[0];
            const freeCancellation = allRates.some((r) => r.cancellationPolicies?.refundableTag === "RFN");
            if (total && !rateByHotel[d.hotelId]) {
              rateByHotel[d.hotelId] = {
                amount: total.amount,
                currency: total.currency ?? "USD",
                hasFreeCancellation: freeCancellation,
              };
            }
          }
          const merged = details.filter(Boolean).map((h) => ({
            id: h.id,
            name: h.name,
            main_photo: h.main_photo ?? h.hotelImages?.[0]?.url,
            address: h.address,
            // Prefer guest review rating if available; fall back to star rating.
            rating: typeof h.rating === "number" ? h.rating : h.starRating,
            price: rateByHotel[h.id]?.amount,
            currency: rateByHotel[h.id]?.currency ?? "USD",
            hasFreeCancellation: rateByHotel[h.id]?.hasFreeCancellation ?? false,
            lat: h.location?.latitude,
            lng: h.location?.longitude,
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
  const adults = searchParams.get("adults") ?? "2";
  const placeId = searchParams.get("placeId");
  const aiSearch = searchParams.get("aiSearch");

  const filteredAndSortedHotels = useMemo(() => {
    const filtered = hotels.filter((h) => {
      if (minRating != null && (h.rating ?? 0) < minRating) return false;
      if (maxPrice != null && (h.price ?? Number.MAX_SAFE_INTEGER) > maxPrice) return false;
      if (onlyFreeCancellation && !h.hasFreeCancellation) return false;
      return true;
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
  }, [hotels, minRating, maxPrice, onlyFreeCancellation, sortBy]);

  // Fetch place details server-side (avoids CORS with LiteAPI whitelabel) for map when searching by destination.
  useEffect(() => {
    if (!placeId?.trim()) {
      setPlaceDetails(null);
      setPlaceDetailsError(false);
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

    const filters = {
      minRating,
      maxPrice,
      onlyFreeCancellation,
      sortBy,
    };
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
      filters,
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
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    return {
      location: { latitude: centerLat, longitude: centerLng },
      viewport: {
        high: { latitude: maxLat, longitude: maxLng },
        low: { latitude: minLat, longitude: minLng },
      },
    };
  }, [hotelsWithCoords]);

  const effectivePlaceForMap = placeDetails ?? derivedPlaceFromHotels;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)]">
        <div className="text-[var(--navy-light)]">Finding safer stays...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sand)] text-[var(--navy)]">
        <p className="text-[var(--coral)]">{error}</p>
        <Link href="/" className="text-[var(--ocean-teal)] font-medium hover:underline">← Back to search</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block text-[var(--ocean-teal)] font-medium hover:underline">
          ← Back to search
        </Link>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-[var(--navy)]">Safer stays for your trip</h1>
            <p className="text-[var(--navy-light)]">Filter by safety, budget, and rating to stay in control.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--navy-light)]">Sort:</span>
            <div className="flex rounded-lg border border-[var(--navy)]/15 p-0.5">
              <button
                type="button"
                onClick={() => setSortBy("rating")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === "rating"
                    ? "bg-[var(--ocean-teal)] text-white"
                    : "text-[var(--navy-light)] hover:bg-[var(--sand)]"
                }`}
              >
                By rating
              </button>
              <button
                type="button"
                onClick={() => setSortBy("price")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === "price"
                    ? "bg-[var(--ocean-teal)] text-white"
                    : "text-[var(--navy-light)] hover:bg-[var(--sand)]"
                }`}
              >
                Cheapest first
              </button>
            </div>
            <p className="text-sm text-[var(--navy-light)]">
              <span className="font-semibold text-[var(--navy)]">{filteredAndSortedHotels.length}</span>{" "}
              {filteredAndSortedHotels.length === 1 ? "place" : "places"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1.4fr)]">
          <aside className="h-fit rounded-xl border border-[var(--navy)]/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-[var(--navy)]">Safety & comfort filters</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 text-[var(--navy)] font-medium">Minimum rating</p>
                <div className="flex flex-wrap gap-2">
                  {[null, 3, 4, 4.5].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setMinRating(value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${
                        minRating === value
                          ? "border-[var(--ocean-teal)] bg-[var(--ocean-teal)]/10 text-[var(--ocean-teal)]"
                          : "border-[var(--navy)]/15 text-[var(--navy-light)] hover:border-[var(--ocean-teal)]/40"
                      }`}
                    >
                      {value === null ? "Any" : `★ ${value}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[var(--navy)] font-medium">Budget (per stay)</p>
                <div className="flex flex-wrap gap-2">
                  {[null, 150, 250, 400].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setMaxPrice(value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${
                        maxPrice === value
                          ? "border-[var(--ocean-teal)] bg-[var(--ocean-teal)]/10 text-[var(--ocean-teal)]"
                          : "border-[var(--navy)]/15 text-[var(--navy-light)] hover:border-[var(--ocean-teal)]/40"
                      }`}
                    >
                      {value === null ? "Any" : `Up to ${value}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-[var(--navy)]/10 pt-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={onlyFreeCancellation}
                    onChange={(e) => setOnlyFreeCancellation(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--navy)]/30 text-[var(--ocean-teal)] focus:ring-[var(--ocean-teal)]/40"
                  />
                  <span>
                    <span className="block text-[var(--navy)] font-medium">Free cancellation only</span>
                    <span className="block text-[var(--navy-light)]">
                      Prioritise flexibility in case your plans change.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div
              id="yict-map"
              className="h-72 w-full overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-[var(--sand)] flex items-center justify-center"
              aria-label="Map of safer stays in this area"
            >
              {!effectivePlaceForMap && !placeId ? (
                <p className="text-center text-[var(--navy-light)] px-4">
                  Map will appear when stays include location data or when you search by destination.
                </p>
              ) : placeDetailsError && !derivedPlaceFromHotels ? (
                <p className="text-center text-[var(--navy-light)] px-4">
                  Map couldn&apos;t load. You can still browse the list below.
                </p>
              ) : !effectivePlaceForMap ? (
                <p className="text-center text-[var(--navy-light)]">Loading map…</p>
              ) : (
                <ResultsMap
                  placeDetails={effectivePlaceForMap}
                  hotels={hotelsWithCoords
                    .map((h) => {
                      const href = `/hotel/${h.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${
                        searchParams.get("placeId") ? `&placeId=${searchParams.get("placeId")}` : ""
                      }${
                        searchParams.get("aiSearch")
                          ? `&aiSearch=${encodeURIComponent(searchParams.get("aiSearch")!)}`
                          : ""
                      }`;
                      return {
                        id: h.id,
                        name: h.name,
                        lat: h.lat!,
                        lng: h.lng!,
                        address: h.address,
                        rating: h.rating,
                        price: h.price,
                        currency: h.currency,
                        href,
                      };
                    })}
                  className="h-full w-full"
                />
              )}
            </div>
            {filteredAndSortedHotels.map((h) => {
              const hotelHref = `/hotel/${h.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${
                searchParams.get("placeId") ? `&placeId=${searchParams.get("placeId")}` : ""
              }${searchParams.get("aiSearch") ? `&aiSearch=${encodeURIComponent(searchParams.get("aiSearch")!)}` : ""}`;
              const expanded = Boolean(expandedHotelIds[h.id]);
              return (
                <div
                  key={h.id}
                  className="overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-sm transition-colors hover:border-[var(--ocean-teal)]/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                    <Link href={hotelHref} className="block h-48 w-full shrink-0 bg-[var(--sand)] sm:h-40 sm:w-48">
                      {h.main_photo ? (
                        <img src={h.main_photo} alt={h.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--navy-light)]">No image</div>
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-semibold text-[var(--navy)]">
                            <Link href={hotelHref} className="hover:text-[var(--ocean-teal)]">
                              {h.name}
                            </Link>
                          </h2>
                          {h.address && <p className="mt-1 text-[var(--navy-light)]">{h.address}</p>}
                          {h.rating != null && (
                            <p className="mt-1 text-[var(--ocean-teal)]">★ {h.rating}</p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {h.hasFreeCancellation && (
                              <span className="inline-flex items-center rounded-full bg-[var(--ocean-teal)]/10 px-3 py-1 text-xs font-medium text-[var(--ocean-teal)]">
                                Free cancellation
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleHotelExpanded(h.id)}
                          aria-expanded={expanded}
                          className="shrink-0 rounded-lg border border-[var(--navy)]/15 bg-[var(--sand)] px-3 py-2 text-xs font-semibold text-[var(--navy)] hover:border-[var(--ocean-teal)]/40 hover:bg-white sm:text-sm"
                        >
                          {expanded ? "Hide rates" : "Rates & details"}
                        </button>
                      </div>
                      {h.price != null && !expanded && (
                        <p className="text-base font-semibold text-[var(--ocean-teal)]">
                          {formatStayTotal(h.price, h.currency ?? "USD")}
                          <span className="pl-1 text-sm font-normal text-[var(--navy-light)]">total stay</span>
                        </p>
                      )}
                      {h.price == null && !expanded && (
                        <p className="text-sm text-[var(--navy-light)]">Open rates for pricing.</p>
                      )}
                      {expanded && h.price != null && (
                        <div className="shrink-0 rounded-xl border-2 border-[var(--ocean-teal)]/35 bg-[var(--ocean-teal)]/[0.08] px-4 py-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--navy-light)]">
                            Total for your stay
                          </p>
                          <p className="mt-1 text-2xl font-bold leading-tight text-[var(--ocean-teal)] sm:text-3xl">
                            {formatStayTotal(h.price, h.currency ?? "USD")}
                          </p>
                          <p className="mt-2 text-sm font-medium leading-snug text-[var(--navy)]">
                            For your entire stay — includes taxes, fees, and cleaning fee
                          </p>
                          <p className="mt-1 text-xs text-[var(--navy-light)]">
                            Choose a room on the next page, then continue to checkout.
                          </p>
                          <Link
                            href={hotelHref}
                            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--ocean-teal)] px-4 py-3 text-center text-base font-semibold text-white hover:bg-[var(--ocean-teal-light)]"
                          >
                            View rooms &amp; book
                          </Link>
                        </div>
                      )}
                      {expanded && h.price == null && (
                        <div className="rounded-xl border border-[var(--navy)]/15 bg-[var(--sand)]/80 px-4 py-4">
                          <p className="text-sm text-[var(--navy)]">See live rates and room types for your dates.</p>
                          <Link
                            href={hotelHref}
                            className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--ocean-teal)] px-4 py-3 text-center text-base font-semibold text-white hover:bg-[var(--ocean-teal-light)]"
                          >
                            View rooms &amp; book
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredAndSortedHotels.length === 0 && (
              <p className="text-[var(--navy-light)]">
                No stays match these filters. Try relaxing your rating, budget, or cancellation preferences.
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--sand)] text-[var(--navy-light)]">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
