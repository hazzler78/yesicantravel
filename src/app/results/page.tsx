"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface HotelBasic {
  id: string;
  name: string;
  main_photo?: string;
  address?: string;
  rating?: number;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Array<HotelBasic & { price?: number; currency?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const data = (json.data ?? []) as Array<{ hotelId: string; roomTypes?: Array<{ rates?: Array<{ retailRate?: { total?: Array<{ amount: number; currency?: string }> } }> }> }>;
        const hotelsFromApi = (json.hotels ?? []) as HotelBasic[];

        if (aiSearch && hotelsFromApi.length > 0) {
          const merged = hotelsFromApi.map((h: HotelBasic) => {
            const rateData = data.find((d: { hotelId: string }) => d.hotelId === h.id);
            const rate = rateData?.roomTypes?.[0]?.rates?.[0];
            return {
              ...h,
              price: rate?.retailRate?.total?.[0]?.amount,
              currency: rate?.retailRate?.total?.[0]?.currency ?? "USD",
            };
          });
          setHotels(merged);
        } else {
          const ids: string[] = [...new Set(data.map((d) => d.hotelId))];
          const details = await Promise.all(
            ids.slice(0, 20).map(async (id) => {
              const r = await fetch(`/api/hotel?hotelId=${encodeURIComponent(id)}`);
              const j = await r.json();
              return j.data;
            })
          );
          const rateByHotel: Record<string, { amount: number; currency?: string }> = {};
          for (const d of data) {
            const rate = d.roomTypes?.[0]?.rates?.[0];
            const total = rate?.retailRate?.total?.[0];
            if (total && !rateByHotel[d.hotelId]) {
              rateByHotel[d.hotelId] = { amount: total.amount, currency: total.currency ?? "USD" };
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
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block text-[var(--ocean-teal)] font-medium hover:underline">← Back to search</Link>
        <h1 className="mb-2 text-2xl font-bold text-[var(--navy)]">Safer stays for your trip</h1>
        <p className="mb-6 text-[var(--navy-light)]">Select a stay to view rooms and book.</p>
        <div className="space-y-6">
          {hotels.map((h) => (
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
                  {h.price != null && (
                    <p className="mt-2 text-lg font-semibold text-[var(--ocean-teal)]">
                      {h.currency} {h.price.toFixed(2)}
                      <span className="text-base font-normal text-[var(--navy-light)]"> / total stay</span>
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {hotels.length === 0 && (
          <p className="text-[var(--navy-light)]">No stays found. Try different dates or destination.</p>
        )}
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
