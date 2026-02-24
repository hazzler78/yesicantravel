"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(4);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onlyFreeCancellation, setOnlyFreeCancellation] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<{
    location: { latitude: number; longitude: number };
    viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
  } | null>(null);
  const [placeDetailsError, setPlaceDetailsError] = useState(false);

  useEffect(() => {
    const placeId = searchParams.get("placeId");
    const aiSearch = searchParams.get("aiSearch");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults") ?? "2";

    if ((!placeId && !aiSearch) || !checkin || !checkout) {
      setError("Missing search parameters.");
      setLoading(false);
      return;
    }

    async function run() {
      try {
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
        const hotelsFromApi = (json.hotels ?? []) as HotelBasic[];

        if (aiSearch && hotelsFromApi.length > 0) {
          const merged = hotelsFromApi.map((h) => {
            const rateData = data.find((d) => d.hotelId === h.id);
            const allRates = rateData?.roomTypes?.flatMap((rt) => rt.rates ?? []) ?? [];
            const firstRate = allRates[0];
            const freeCancellation = allRates.some((r) => r.cancellationPolicies?.refundableTag === "RFN");
            return {
              ...h,
              price: firstRate?.retailRate?.total?.[0]?.amount,
              currency: firstRate?.retailRate?.total?.[0]?.currency ?? "USD",
              hasFreeCancellation: freeCancellation,
            };
          });
          setHotels(merged);
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
            rating: h.starRating,
            price: rateByHotel[h.id]?.amount,
            currency: rateByHotel[h.id]?.currency ?? "USD",
            hasFreeCancellation: rateByHotel[h.id]?.hasFreeCancellation ?? false,
            lat: h.location?.latitude,
            lng: h.location?.longitude,
          }));
          setHotels(merged);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [searchParams]);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "2";

  const filteredAndSortedHotels = useMemo(() => {
    const filtered = hotels.filter((h) => {
      if (minRating != null && (h.rating ?? 0) < minRating) return false;
      if (maxPrice != null && (h.price ?? Number.MAX_SAFE_INTEGER) > maxPrice) return false;
      if (onlyFreeCancellation && !h.hasFreeCancellation) return false;
      return true;
    });
    // Proxy for "safest first": higher-rated stays first when available
    return [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [hotels, minRating, maxPrice, onlyFreeCancellation]);

  const placeId = searchParams.get("placeId");

  // Fetch place details server-side (avoids CORS with LiteAPI whitelabel) for map.
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

  const hasMapData = filteredAndSortedHotels.some((h) => typeof h.lat === "number" && typeof h.lng === "number");

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
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-[var(--navy)]">Safer stays for your trip</h1>
            <p className="text-[var(--navy-light)]">Filter by safety, budget, and rating to stay in control.</p>
          </div>
          <p className="text-sm text-[var(--navy-light)]">
            Showing <span className="font-semibold text-[var(--navy)]">{filteredAndSortedHotels.length}</span>{" "}
            {filteredAndSortedHotels.length === 1 ? "place" : "places"}
          </p>
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
                <p className="mt-1 text-xs text-[var(--navy-light)]">
                  Future versions will let you filter by women-only options, neighbourhood safety and lighting.
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div
              id="yict-map"
              className="h-72 w-full overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-[var(--sand)] flex items-center justify-center"
              aria-label="Map of safer stays in this area"
            >
              {!placeId ? (
                <p className="text-center text-[var(--navy-light)] px-4">
                  Map available when you search by destination.
                </p>
              ) : placeDetailsError ? (
                <p className="text-center text-[var(--navy-light)] px-4">
                  Map couldn&apos;t load. You can still browse the list below.
                </p>
              ) : !placeDetails ? (
                <p className="text-center text-[var(--navy-light)]">Loading map…</p>
              ) : (
                <ResultsMap
                  placeDetails={placeDetails}
                  hotels={filteredAndSortedHotels
                    .filter(
                      (h): h is HotelListItem & { lat: number; lng: number } =>
                        typeof h.lat === "number" && typeof h.lng === "number"
                    )
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
            {filteredAndSortedHotels.map((h) => (
            <Link
              key={h.id}
              href={`/hotel/${h.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}${searchParams.get("placeId") ? `&placeId=${searchParams.get("placeId")}` : ""}${searchParams.get("aiSearch") ? `&aiSearch=${encodeURIComponent(searchParams.get("aiSearch")!)}` : ""}`}
              className="block overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-sm transition-colors hover:border-[var(--ocean-teal)]/40"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-48 w-full shrink-0 bg-[var(--sand)] sm:h-40 sm:w-48">
                  {h.main_photo ? (
                    <img src={h.main_photo} alt={h.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--navy-light)]">No image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--navy)]">{h.name}</h2>
                    {h.address && <p className="mt-1 text-[var(--navy-light)]">{h.address}</p>}
                    {h.rating != null && (
                      <p className="mt-1 text-[var(--ocean-teal)]">★ {h.rating}</p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {h.price != null && (
                      <p className="text-lg font-semibold text-[var(--ocean-teal)]">
                        {h.currency} {h.price.toFixed(2)}
                        <span className="text-base font-normal text-[var(--navy-light)]"> / total stay</span>
                      </p>
                    )}
                    {h.hasFreeCancellation && (
                      <span className="inline-flex items-center rounded-full bg-[var(--ocean-teal)]/10 px-3 py-1 text-xs font-medium text-[var(--ocean-teal)]">
                        Free cancellation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            ))}
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
