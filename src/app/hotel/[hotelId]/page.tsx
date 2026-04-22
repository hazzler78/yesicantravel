"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { trackFunnelEvent } from "@/lib/funnelEvents";

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

interface Facility {
  facilityId?: number;
  name?: string;
  groupId?: number;
  group?: string;
}

interface HotelDetail {
  id: string;
  name: string;
  main_photo?: string;
  hotelImages?: Array<{ url: string }>;
  address?: string;
  city?: string;
  starRating?: number;
  hotelDescription?: string;
  facilities?: Facility[];
  hotelFacilities?: string[];
  rooms?: Array<{ id: number; roomName: string; photos?: Array<{ url: string }> }>;
}

interface ReviewItem {
  name?: string;
  averageScore?: number;
  country?: string;
  date?: string;
  headline?: string;
  language?: string;
  pros?: string;
  cons?: string;
}

interface ReviewsPayload {
  data?: ReviewItem[] | { reviews?: ReviewItem[]; sentimentAnalysis?: SentimentAnalysis };
  sentimentAnalysis?: SentimentAnalysis;
}

interface SentimentAnalysis {
  pros?: string[];
  cons?: string[];
  categories?: Array<{ name?: string; rating?: number; description?: string }>;
}

// Map raw facility strings to user-facing safety badges. Conservative — only fire a badge
// when we're confident the facility actually exists. Keyword match is case-insensitive.
const SAFETY_BADGE_RULES: Array<{ label: string; keywords: string[] }> = [
  { label: "24/7 reception", keywords: ["24-hour front desk", "24 hour front desk", "24/7 front desk", "24-hour reception", "24 hour reception"] },
  { label: "Security on site", keywords: ["security", "cctv", "surveillance cameras", "24-hour security"] },
  { label: "In-room safe", keywords: ["safety deposit box", "in-room safe", " safe "] },
  { label: "Lift access", keywords: ["elevator", "lift"] },
  { label: "Well-lit entrance", keywords: ["illuminated parking", "lit parking"] },
  { label: "Non-smoking property", keywords: ["non-smoking"] },
  { label: "Free WiFi", keywords: ["free wifi", "wi-fi", "wifi"] },
];

function deriveSafetyBadges(facilityNames: string[]): string[] {
  const lower = facilityNames.map((f) => f.toLowerCase());
  const hits = new Set<string>();
  for (const rule of SAFETY_BADGE_RULES) {
    if (rule.keywords.some((k) => lower.some((f) => f.includes(k.toLowerCase())))) {
      hits.add(rule.label);
    }
  }
  return Array.from(hits);
}

function normalizeFacilityNames(hotel: HotelDetail | null): string[] {
  if (!hotel) return [];
  const fromObjects = (hotel.facilities ?? [])
    .map((f) => f.name)
    .filter((n): n is string => Boolean(n));
  const fromStrings = hotel.hotelFacilities ?? [];
  const combined = [...fromObjects, ...fromStrings];
  return Array.from(new Set(combined.map((s) => s.trim()).filter(Boolean)));
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "2";

  useEffect(() => {
    if (!hotelId) return;
    trackFunnelEvent("HotelClick", { hotelId, checkin, checkout, adults });
  }, [hotelId, checkin, checkout, adults]);

  // Fetch reviews in parallel with the main hotel/rates call — they're non-blocking social proof.
  // LiteAPI review response shape varies; be defensive.
  useEffect(() => {
    if (!hotelId) return;
    let cancelled = false;
    setReviewsLoading(true);
    fetch(`/api/reviews?hotelId=${encodeURIComponent(hotelId)}&limit=20&getSentiment=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ReviewsPayload | null) => {
        if (cancelled || !json) return;
        let items: ReviewItem[] = [];
        let sent: SentimentAnalysis | null = null;
        if (Array.isArray(json.data)) {
          items = json.data;
        } else if (json.data && typeof json.data === "object") {
          const d = json.data as { reviews?: ReviewItem[]; sentimentAnalysis?: SentimentAnalysis };
          items = d.reviews ?? [];
          sent = d.sentimentAnalysis ?? null;
        }
        if (!sent && json.sentimentAnalysis) sent = json.sentimentAnalysis;
        setReviews(items);
        setSentiment(sent);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

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
              maxRatesPerHotel: 50,
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
              // Prebook must use the bookable id: prefer per-rate offerId when the API sends it, else roomType offerId (LiteAPI default).
              offerId: r.offerId ?? rt.offerId,
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
    const total = roomGroups
      .flatMap((g) => g.rates)
      .find((r) => r.offerId === offerId)?.retailRate?.total?.[0];
    track("select_room", {
      hotelId,
      offerId,
      amount: total?.amount,
      currency: total?.currency,
      checkin,
      checkout,
      adults,
    });
    const eventId = generateMetaEventId("init_checkout");
    const metaData = {
      content_ids: [hotelId],
      content_type: "product",
      value: total?.amount,
      currency: total?.currency,
      checkin,
      checkout,
      adults,
    };
    fbqTrack("InitiateCheckout", metaData, { eventId });
    void sendMetaCapiEvent({
      eventName: "InitiateCheckout",
      eventId,
      eventSourceUrl: window.location.href,
      customData: metaData,
    });
    const q = new URLSearchParams({
      offerId,
      hotelId,
      checkin: checkin!,
      checkout: checkout!,
      adults: adults!,
    });
    const pid = searchParams.get("placeId");
    const ai = searchParams.get("aiSearch");
    if (pid) q.set("placeId", pid);
    if (ai) q.set("aiSearch", ai);
    if (total?.amount != null && Number.isFinite(total.amount)) {
      q.set("totalAmount", String(total.amount));
    }
    if (total?.currency) q.set("totalCurrency", total.currency);
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
  const facilityNames = normalizeFacilityNames(hotel);
  const safetyBadges = deriveSafetyBadges(facilityNames);
  const description = hotel.hotelDescription ? stripHtml(hotel.hotelDescription) : "";
  const descriptionShort = description.length > 420 ? `${description.slice(0, 420).trim()}…` : description;
  const reviewScores = reviews.map((r) => r.averageScore).filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
  const reviewAvg = reviewScores.length > 0 ? reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length : null;
  const reviewsToShow = reviews.filter((r) => (r.pros && r.pros.trim()) || (r.cons && r.cons.trim())).slice(0, 5);

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
              {reviewAvg != null && (
                <span className="inline-flex items-center rounded-full bg-[var(--ocean-teal)]/15 px-3 py-1 text-xs font-medium text-[var(--ocean-teal)]">
                  {reviewAvg.toFixed(1)}/10 · {reviews.length} guest review{reviews.length === 1 ? "" : "s"}
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

            {safetyBadges.length > 0 && (
              <div className="mt-4 border-t border-[var(--navy)]/10 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--navy-light)]">
                  Safety & comfort signals
                </p>
                <div className="flex flex-wrap gap-2">
                  {safetyBadges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ocean-teal)]/[0.08] px-3 py-1 text-xs font-medium text-[var(--ocean-teal)] ring-1 ring-[var(--ocean-teal)]/20"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--navy-light)]">
                  Derived from the hotel&apos;s listed facilities. We don&apos;t inspect properties in person.
                </p>
              </div>
            )}
          </div>
        </div>

        {descriptionShort && (
          <section className="mb-8 rounded-xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">About this stay</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--navy)]">{descriptionShort}</p>
          </section>
        )}

        {(sentiment?.pros?.length || sentiment?.cons?.length || reviewsToShow.length > 0 || reviewsLoading) && (
          <section className="mb-8 rounded-xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--navy)]">What guests say</h2>
              {reviewAvg != null && (
                <span className="text-sm text-[var(--navy-light)]">
                  <span className="font-semibold text-[var(--ocean-teal)]">{reviewAvg.toFixed(1)}/10</span>
                  {" · "}based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {reviewsLoading && reviewsToShow.length === 0 && (
              <p className="text-sm text-[var(--navy-light)]">Loading reviews…</p>
            )}

            {(sentiment?.pros?.length ?? 0) > 0 || (sentiment?.cons?.length ?? 0) > 0 ? (
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                {(sentiment?.pros?.length ?? 0) > 0 && (
                  <div className="rounded-lg border border-[var(--ocean-teal)]/20 bg-[var(--ocean-teal)]/[0.06] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ocean-teal)]">
                      Guests loved
                    </p>
                    <ul className="space-y-1.5 text-sm text-[var(--navy)]">
                      {sentiment!.pros!.slice(0, 4).map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span aria-hidden>✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(sentiment?.cons?.length ?? 0) > 0 && (
                  <div className="rounded-lg border border-[var(--navy)]/15 bg-[var(--sand)]/50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--navy-light)]">
                      Things to note
                    </p>
                    <ul className="space-y-1.5 text-sm text-[var(--navy)]">
                      {sentiment!.cons!.slice(0, 4).map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span aria-hidden>·</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {reviewsToShow.length > 0 && (
              <div className="space-y-4">
                {reviewsToShow.map((r, i) => (
                  <div key={i} className="border-t border-[var(--navy)]/10 pt-4 first:border-t-0 first:pt-0">
                    <div className="mb-1 flex items-center gap-2 text-xs text-[var(--navy-light)]">
                      {r.name && <span className="font-medium text-[var(--navy)]">{r.name}</span>}
                      {r.country && <span>· {r.country}</span>}
                      {typeof r.averageScore === "number" && (
                        <span className="ml-auto rounded bg-[var(--ocean-teal)]/10 px-2 py-0.5 font-semibold text-[var(--ocean-teal)]">
                          {r.averageScore.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                    {r.headline && <p className="mb-1 text-sm font-medium text-[var(--navy)]">{r.headline}</p>}
                    {r.pros && (
                      <p className="text-sm text-[var(--navy)]">
                        <span className="font-semibold text-[var(--ocean-teal)]">+ </span>
                        {r.pros}
                      </p>
                    )}
                    {r.cons && (
                      <p className="mt-1 text-sm text-[var(--navy-light)]">
                        <span className="font-semibold">− </span>
                        {r.cons}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!reviewsLoading && reviewsToShow.length === 0 && !sentiment?.pros?.length && !sentiment?.cons?.length && (
              <p className="text-sm text-[var(--navy-light)]">
                No reviews yet for this property — be among the first to stay.
              </p>
            )}
          </section>
        )}

        {facilityNames.length > 0 && (
          <section className="mb-8 rounded-xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Facilities</h2>
            <ul className="grid gap-x-6 gap-y-2 text-sm text-[var(--navy)] sm:grid-cols-2 lg:grid-cols-3">
              {facilityNames.slice(0, 30).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ocean-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {facilityNames.length > 30 && (
              <p className="mt-3 text-xs text-[var(--navy-light)]">
                +{facilityNames.length - 30} more facilities listed by the hotel.
              </p>
            )}
          </section>
        )}

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
