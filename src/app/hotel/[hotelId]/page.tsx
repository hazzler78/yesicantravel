"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Rate {
  name: string;
  mappedRoomId: number;
  offerId: string;
  boardName: string;
  retailRate: {
    total: Array<{ amount: number; currency: string }>;
  };
  cancellationPolicies?: { refundableTag: string };
}

interface RoomGroup {
  mappedRoomId: number;
  roomName: string;
  firstImage?: string;
  rates: Rate[];
}

interface HotelDetail {
  id: string;
  name: string;
  main_photo?: string;
  hotelImages?: Array<{ url: string }>;
  address?: string;
  city?: string;
  starRating?: number;
  rooms?: Array<{ id: number; roomName: string; photos?: Array<{ url: string }> }>;
}

function HotelContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.hotelId as string;
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFreeCancellation, setHasFreeCancellation] = useState(false);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "2";

  useEffect(() => {
    if (!hotelId || !checkin || !checkout) {
      setError("Missing parameters");
      setLoading(false);
      return;
    }

    async function run() {
      try {
        const [hotelRes, ratesRes] = await Promise.all([
          fetch(`/api/hotel?hotelId=${encodeURIComponent(hotelId)}`),
          fetch("/api/rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelIds: [hotelId],
              checkin,
              checkout,
              adults: Number(adults),
              maxRatesPerHotel: 10,
            }),
          }),
        ]);

        const hotelJson = await hotelRes.json();
        const ratesJson = await ratesRes.json();

        if (!hotelRes.ok) throw new Error(hotelJson.error ?? "Hotel fetch failed");
        if (!ratesRes.ok) throw new Error(ratesJson.error ?? "Rates fetch failed");

        setHotel(hotelJson.data);

        const data = ratesJson.data ?? [];
        const rateData = data.find((d: { hotelId: string }) => d.hotelId === hotelId);
        const roomTypes = rateData?.roomTypes ?? [];
        const allRates: Rate[] = [];
        let freeCancellation = false;
        for (const rt of roomTypes) {
          for (const r of rt.rates ?? []) {
            if (r.cancellationPolicies?.refundableTag === "RFN") {
              freeCancellation = true;
            }
            allRates.push({
              ...r,
              offerId: rt.offerId ?? r.offerId,
            });
          }
        }

        const roomMap = new Map<number, Record<string, unknown>>();
        for (const r of hotelJson.data?.rooms ?? []) {
          roomMap.set(r.id, r);
        }

        const byRoom = new Map<number, Rate[]>();
        for (const rate of allRates) {
          const mid = rate.mappedRoomId;
          if (!byRoom.has(mid)) byRoom.set(mid, []);
          byRoom.get(mid)!.push(rate);
        }

        const groups: RoomGroup[] = [];
        byRoom.forEach((rates, mappedRoomId) => {
          const roomInfo = roomMap.get(mappedRoomId);
          const roomName = rates[0]?.name ?? (roomInfo as { roomName?: string })?.roomName ?? `Room ${mappedRoomId}`;
          const photos = (roomInfo as { photos?: Array<{ url: string }> })?.photos;
          groups.push({
            mappedRoomId,
            roomName,
            firstImage: photos?.[0]?.url,
            rates,
          });
        });
        setRoomGroups(groups);
        setHasFreeCancellation(freeCancellation);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [hotelId, checkin, checkout, adults]);

  const handleBook = (offerId: string) => {
    const q = new URLSearchParams({
      offerId,
      hotelId,
      checkin: checkin!,
      checkout: checkout!,
      adults: adults!,
    });
    window.location.href = `/checkout?${q}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)]">
        <div className="text-[var(--navy-light)]">Loading stay details...</div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sand)] text-[var(--navy)]">
        <p className="text-[var(--coral)]">{error ?? "Stay not found"}</p>
        <Link href="/" className="text-[var(--ocean-teal)] font-medium hover:underline">← Back to search</Link>
      </div>
    );
  }

  const mainImage = hotel.main_photo ?? hotel.hotelImages?.[0]?.url;

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href={
            searchParams.get("placeId") || searchParams.get("aiSearch")
              ? `/results?${new URLSearchParams({
                  ...(searchParams.get("placeId") && { placeId: searchParams.get("placeId")! }),
                  ...(searchParams.get("aiSearch") && { aiSearch: searchParams.get("aiSearch")! }),
                  checkin: checkin!,
                  checkout: checkout!,
                  adults: adults!,
                })}`
              : "/"
          }
          className="mb-6 inline-block text-[var(--ocean-teal)] font-medium hover:underline"
        >
          ← Back to {searchParams.get("placeId") || searchParams.get("aiSearch") ? "results" : "search"}
        </Link>

        <div className="mb-8 overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-sm">
          {mainImage ? (
            <img src={mainImage} alt={hotel.name} className="h-64 w-full object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center bg-[var(--sand)] text-[var(--navy-light)]">No image</div>
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[var(--navy)]">{hotel.name}</h1>
            {hotel.address && <p className="mt-1 text-[var(--navy-light)]">{hotel.address}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {hotel.starRating != null && (
                <span className="inline-flex items-center rounded-full bg-[var(--ocean-teal)]/10 px-3 py-1 text-xs font-medium text-[var(--ocean-teal)]">
                  ★ {hotel.starRating} overall rating
                </span>
              )}
              {hasFreeCancellation && (
                <span className="inline-flex items-center rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-medium text-[var(--navy)]">
                  Free cancellation options available
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-[var(--navy)]/5 px-3 py-1 text-xs font-medium text-[var(--navy-light)]">
                Secure booking via trusted provider
              </span>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold text-[var(--navy)]">Available offers by room</h2>
        <div className="space-y-8">
          {roomGroups.map((group) => (
            <div
              key={group.mappedRoomId}
              className="overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="h-40 w-full shrink-0 bg-[var(--sand)] sm:h-32 sm:w-40">
                  {group.firstImage ? (
                    <img src={group.firstImage} alt={group.roomName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--navy-light)]">No image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-[var(--navy)]">{group.roomName}</h3>
                  <div className="mt-3 space-y-3">
                    {group.rates.map((rate, idx) => {
                      const total = rate.retailRate?.total?.[0];
                      const amount = total?.amount ?? 0;
                      const currency = total?.currency ?? "USD";
                      const offerId = rate.offerId;
                      return (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--navy)]/10 bg-[var(--sand)]/50 p-3"
                        >
                          <div>
                            <span className="text-[var(--navy-light)]">{rate.boardName}</span>
                            {rate.cancellationPolicies?.refundableTag && (
                              <span
                                className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                                  rate.cancellationPolicies.refundableTag === "RFN"
                                    ? "bg-[var(--ocean-teal)]/20 text-[var(--ocean-teal)]"
                                    : "bg-[var(--coral)]/20 text-[var(--coral)]"
                                }`}
                              >
                                {rate.cancellationPolicies.refundableTag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[var(--ocean-teal)]">
                              {currency} {amount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleBook(offerId)}
                              className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ocean-teal-light)]"
                            >
                              Select & book
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {roomGroups.length === 0 && (
          <p className="text-[var(--navy-light)]">No available offers for these dates.</p>
        )}
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--sand)] text-[var(--navy-light)]">Loading...</div>}>
      <HotelContent />
    </Suspense>
  );
}
