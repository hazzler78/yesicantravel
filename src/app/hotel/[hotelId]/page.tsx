"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@vercel/analytics";
import {
  ArrowLeft,
  Check,
  Clock,
  ImageOff,
  Info,
  Lock,
  MapPin,
  ThumbsUp,
  TrainFront,
  TriangleAlert,
  Venus,
} from "lucide-react";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { trackFunnelEvent } from "@/lib/funnelEvents";
import { normalizeFacilityNames, deriveSafetyBadges } from "@/lib/safetyBadges";
import { deriveStaySignals, formatDistance } from "@/lib/staySignals";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { HotelGallery } from "@/components/hotel/HotelGallery";
import { Card } from "@/components/ui/Card";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SafetyBadge, SafetyBadgeList } from "@/components/ui/SafetyBadge";
import { SecondaryLink } from "@/components/ui/SecondaryButton";

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
  rating?: number;
  reviewCount?: number;
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

function nightsBetween(checkin: string | null, checkout: string | null) {
  if (!checkin || !checkout) return 1;
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

function formatStayDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
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
  const adults = searchParams.get("adults") ?? "1";

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

  const backHref =
    searchParams.get("placeId") || searchParams.get("aiSearch")
      ? `/results?${new URLSearchParams({
          ...(searchParams.get("placeId") && { placeId: searchParams.get("placeId")! }),
          ...(searchParams.get("aiSearch") && { aiSearch: searchParams.get("aiSearch")! }),
          checkin: checkin ?? "",
          checkout: checkout ?? "",
          adults: adults ?? "1",
        })}`
      : "/";

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-56 rounded-card bg-surface-muted sm:h-[340px]" />
        <div className="mt-6 h-8 w-2/3 rounded bg-surface-muted" />
        <div className="mt-3 h-4 w-1/3 rounded bg-surface-muted" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="h-32 rounded-card bg-surface-muted" />
            <div className="h-48 rounded-card bg-surface-muted" />
          </div>
          <div className="h-56 rounded-card bg-surface-muted" />
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-coral-soft text-coral">
            <TriangleAlert className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">
            We couldn&apos;t load this stay
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-muted">
            {error ?? "This property is no longer available for your dates."}
          </p>
          <div className="mt-6 flex justify-center">
            <SecondaryLink href={backHref}>Back to results</SecondaryLink>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = [
    ...(hotel.main_photo ? [hotel.main_photo] : []),
    ...(hotel.hotelImages ?? []).map((image) => image.url),
  ].filter((url, index, all) => url && all.indexOf(url) === index);
  const facilityNames = normalizeFacilityNames(hotel);
  const safetyBadges = deriveSafetyBadges(facilityNames);
  const stay = deriveStaySignals({
    ...hotel,
    rateNames: roomGroups.flatMap((group) => group.rates.map((rate) => rate.name)),
  });
  const description = hotel.hotelDescription ? stripHtml(hotel.hotelDescription) : "";
  const descriptionShort = description.length > 420 ? `${description.slice(0, 420).trim()}…` : description;
  const reviewScores = reviews.map((r) => r.averageScore).filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
  const reviewAvg = reviewScores.length > 0 ? reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length : null;
  // The property's own aggregate is more representative than the sampled reviews.
  const guestScore = typeof hotel.rating === "number" && hotel.rating > 0 ? hotel.rating : reviewAvg;
  const reviewsToShow = reviews.filter((r) => (r.pros && r.pros.trim()) || (r.cons && r.cons.trim())).slice(0, 5);

  const allRates = roomGroups.flatMap((group) => group.rates);
  const cheapest = allRates.reduce<{ amount: number; currency: string } | null>((lowest, rate) => {
    const total = rate.retailRate?.total?.[0];
    if (!total || typeof total.amount !== "number") return lowest;
    if (!lowest || total.amount < lowest.amount) {
      return { amount: total.amount, currency: total.currency ?? "EUR" };
    }
    return lowest;
  }, null);
  const nights = nightsBetween(checkin, checkout);

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to {searchParams.get("placeId") || searchParams.get("aiSearch") ? "results" : "search"}
        </Link>

        <HotelGallery name={hotel.name} images={galleryImages} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {hotel.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {hotel.address && (
                <p className="flex items-center gap-1.5 text-[0.9375rem] text-ink-muted">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {hotel.address}
                </p>
              )}
              {hotel.starRating != null && (
                <span className="text-[0.9375rem] text-ink-muted">
                  {hotel.starRating}-star property
                </span>
              )}
            </div>
            {guestScore != null && (
              <div className="mt-3">
                <RatingBadge rating={guestScore} reviewCount={hotel.reviewCount} />
              </div>
            )}

            {(safetyBadges.length > 0 || stay.nearestTransit || stay.latestCheckIn) && (
              <Card className="mt-5 p-5">
                <h2 className="font-display text-base font-semibold text-ink">
                  Getting in and getting around
                </h2>

                {(stay.nearestTransit || stay.latestCheckIn) && (
                  <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink">
                    {stay.nearestTransit && (
                      <li className="flex items-start gap-2">
                        <TrainFront className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
                        <span>
                          <span className="tnum font-semibold">
                            {formatDistance(stay.nearestTransit.distanceKm)}
                          </span>{" "}
                          to {stay.nearestTransit.name}
                        </span>
                      </li>
                    )}
                    {stay.latestCheckIn && (
                      <li className="flex items-start gap-2">
                        <Clock className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
                        <span>
                          Check-in until{" "}
                          <span className="tnum font-semibold">{stay.latestCheckIn}</span>
                          {stay.roundTheClockReception && " — reception is staffed around the clock"}
                        </span>
                      </li>
                    )}
                  </ul>
                )}

                {(safetyBadges.length > 0 || stay.matches.includes("womenOnlyRoom")) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {stay.matches.includes("womenOnlyRoom") && (
                      <SafetyBadge label="Women-only room" tone="positive" icon={Venus} />
                    )}
                    <SafetyBadgeList badges={safetyBadges} max={8} />
                  </div>
                )}

                <p className="mt-3 text-xs text-ink-muted">
                  Taken from what this property publishes. We don&apos;t inspect properties in
                  person.
                </p>
              </Card>
            )}

            {descriptionShort && (
              <Card className="mt-4 p-5">
                <h2 className="font-display text-base font-semibold text-ink">About this stay</h2>
                <p className="mt-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-muted">
                  {descriptionShort}
                </p>
              </Card>
            )}

            {(sentiment?.pros?.length || sentiment?.cons?.length || reviewsToShow.length > 0 || reviewsLoading) && (
              <Card className="mt-4 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-base font-semibold text-ink">What guests say</h2>
                  {guestScore != null && (
                    <span className="text-[0.8125rem] text-ink-muted">
                      <span className="tnum font-semibold text-ink">{guestScore.toFixed(1)}/10</span>
                      {hotel.reviewCount != null && hotel.reviewCount > 0 && (
                        <> · {hotel.reviewCount.toLocaleString("en-GB")} reviews</>
                      )}
                    </span>
                  )}
                </div>

                {reviewsLoading && reviewsToShow.length === 0 && (
                  <p className="mt-3 text-[0.9375rem] text-ink-muted">Loading reviews…</p>
                )}

                {((sentiment?.pros?.length ?? 0) > 0 || (sentiment?.cons?.length ?? 0) > 0) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(sentiment?.pros?.length ?? 0) > 0 && (
                      <div className="rounded-control bg-positive-soft p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-positive">
                          Guests liked
                        </p>
                        <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-ink">
                          {sentiment!.pros!.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <ThumbsUp className="mt-1 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(sentiment?.cons?.length ?? 0) > 0 && (
                      <div className="rounded-control bg-surface-muted p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                          Worth knowing
                        </p>
                        <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-ink">
                          {sentiment!.cons!.slice(0, 4).map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {reviewsToShow.length > 0 && (
                  <div className="mt-5 space-y-4">
                    {reviewsToShow.map((review, index) => (
                      <div
                        key={index}
                        className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          {review.name && <span className="font-semibold text-ink">{review.name}</span>}
                          {review.country && <span>· {review.country}</span>}
                          {typeof review.averageScore === "number" && (
                            <span className="tnum ml-auto rounded bg-teal-soft px-2 py-0.5 font-semibold text-teal">
                              {review.averageScore.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                        {review.headline && (
                          <p className="mt-1.5 text-[0.9375rem] font-semibold text-ink">
                            {review.headline}
                          </p>
                        )}
                        {review.pros && (
                          <p className="mt-1 flex gap-2 text-[0.9375rem] text-ink">
                            <ThumbsUp className="mt-1 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden />
                            <span>{review.pros}</span>
                          </p>
                        )}
                        {review.cons && (
                          <p className="mt-1 flex gap-2 text-[0.9375rem] text-ink-muted">
                            <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span>{review.cons}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!reviewsLoading &&
                  reviewsToShow.length === 0 &&
                  !sentiment?.pros?.length &&
                  !sentiment?.cons?.length && (
                    <p className="mt-3 text-[0.9375rem] text-ink-muted">
                      No reviews yet for this property.
                    </p>
                  )}
              </Card>
            )}

            {facilityNames.length > 0 && (
              <Card className="mt-4 p-5">
                <h2 className="font-display text-base font-semibold text-ink">Facilities</h2>
                <ul className="mt-3 grid gap-x-6 gap-y-2 text-[0.9375rem] text-ink sm:grid-cols-2">
                  {facilityNames.slice(0, 30).map((facility) => (
                    <li key={facility} className="flex items-start gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                      <span>{facility}</span>
                    </li>
                  ))}
                </ul>
                {facilityNames.length > 30 && (
                  <p className="mt-3 text-xs text-ink-muted">
                    +{facilityNames.length - 30} more listed by the hotel.
                  </p>
                )}
              </Card>
            )}

            <h2 id="rooms" className="mt-8 font-display text-xl font-semibold tracking-tight text-ink">
              Choose your room
            </h2>
            <div className="mt-4 space-y-4">
              {roomGroups.map((group) => (
                <Card key={group.mappedRoomId} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="aspect-[4/3] w-full shrink-0 bg-surface-muted sm:aspect-auto sm:w-44">
                      {group.firstImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={group.firstImage}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-muted">
                          <ImageOff className="h-5 w-5" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 p-4">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {group.roomName}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {group.rates.map((rate, index) => {
                          const total = rate.retailRate?.total?.[0];
                          const amount = total?.amount ?? 0;
                          const currency = total?.currency ?? "EUR";
                          const refundable = rate.cancellationPolicies?.refundableTag === "RFN";
                          return (
                            <div
                              key={index}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface-muted/60 p-3"
                            >
                              <div className="min-w-0">
                                <p className="text-[0.9375rem] font-medium text-ink">
                                  {rate.boardName}
                                </p>
                                {rate.cancellationPolicies?.refundableTag && (
                                  <p
                                    className={`mt-0.5 text-[0.8125rem] font-medium ${
                                      refundable ? "text-positive" : "text-ink-muted"
                                    }`}
                                  >
                                    {refundable ? "Free cancellation" : "Non-refundable"}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="tnum font-display text-lg font-semibold text-ink">
                                    {formatStayTotal(amount, currency)}
                                  </p>
                                  <p className="text-xs text-ink-muted">
                                    total · {nights} {nights === 1 ? "night" : "nights"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleBook(rate.offerId)}
                                  className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-coral px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-coral-hover"
                                >
                                  Reserve
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {roomGroups.length === 0 && (
                <Card className="p-6 text-center">
                  <p className="text-[0.9375rem] text-ink-muted">
                    No rooms available for these dates. Try shifting your stay by a night.
                  </p>
                </Card>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Your stay
              </p>
              <p className="tnum mt-1.5 text-[0.9375rem] font-medium text-ink">
                {formatStayDate(checkin)} – {formatStayDate(checkout)}
              </p>
              <p className="text-[0.9375rem] text-ink-muted">
                {nights} {nights === 1 ? "night" : "nights"} · {adults}{" "}
                {Number(adults) === 1 ? "traveller" : "travellers"}
              </p>

              {cheapest && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-ink-muted">From</p>
                  <p className="tnum font-display text-2xl font-semibold text-ink">
                    {formatStayTotal(cheapest.amount, cheapest.currency)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    total for the stay, taxes and fees included
                  </p>
                </div>
              )}

              <a
                href="#rooms"
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-control bg-coral px-4 text-base font-semibold text-white transition-colors hover:bg-coral-hover"
              >
                See room options
              </a>

              <ul className="mt-4 space-y-2 text-[0.8125rem] text-ink-muted">
                {hasFreeCancellation && (
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden />
                    Free cancellation available on some rates
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Card details handled by Stripe, never stored by us
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden />
                  Booking confirmed directly with the property
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6">
          <div className="h-56 rounded-card bg-surface-muted sm:h-[340px]" />
        </div>
      }
    >
      <HotelContent />
    </Suspense>
  );
}
