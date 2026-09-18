"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { Check, ImageOff, Lock, MapPin, TriangleAlert } from "lucide-react";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { trackFunnelEvent } from "@/lib/funnelEvents";
import { normalizeFacilityNames, deriveSafetyBadges } from "@/lib/safetyBadges";
import {
  deriveStaySignals,
  type PointOfInterest,
} from "@/lib/staySignals";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { HotelGallery } from "@/components/hotel/HotelGallery";
import { BackToResultsLink } from "@/components/hotel/BackToResultsLink";
import { RoomPhotoStrip } from "@/components/hotel/RoomPhotoStrip";
import {
  AboutStayCard,
  FacilitiesCard,
  GuestReviewsSection,
  PeaceOfMindCard,
} from "@/components/hotel/HotelTrustSections";
import { HotelLocationCard } from "@/components/HotelLocationCard";
import { Card } from "@/components/ui/Card";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
import { useCurrency } from "@/components/currency/CurrencyControl";
import { guestNationalityForCurrency } from "@/lib/currency";
import {
  appendOccupancyParams,
  buildStaySearchParams,
  occupanciesForRequest,
  occupancySummary,
  parsePartyFromSearchParams,
  requestedRoomsFromSearchParams,
} from "@/lib/occupancy";

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
  photos: string[];
  rates: Rate[];
}

interface Facility {
  facilityId?: number;
  name?: string;
  groupId?: number;
  group?: string;
}

interface SentimentAnalysis {
  pros?: string[];
  cons?: string[];
  categories?: Array<{ name?: string; rating?: number; description?: string }>;
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
  location?: { latitude?: number; longitude?: number; lat?: number; lng?: number };
  rooms?: Array<{ id: number; roomName: string; photos?: Array<{ url: string }> }>;
  poi?: PointOfInterest[] | null;
  checkinCheckoutTimes?: {
    checkin_start?: string | null;
    checkin_end?: string | null;
  } | null;
  sentiment_analysis?: SentimentAnalysis | null;
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
  const currency = useCurrency();
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
  const party = parsePartyFromSearchParams(searchParams);
  const requestedRooms = requestedRoomsFromSearchParams(searchParams);
  const occupancies = occupanciesForRequest(party, requestedRooms);
  const occupancyKey = `${party.adults}|${party.childAges.join(",")}|${requestedRooms}`;

  useEffect(() => {
    if (!hotelId) return;
    trackFunnelEvent("HotelClick", {
      hotelId,
      checkin,
      checkout,
      adults: party.adults,
      children: party.childAges.length,
      rooms: requestedRooms,
    });
  }, [hotelId, checkin, checkout, occupancyKey, party.adults, party.childAges.length, requestedRooms]);

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
        if (sent) setSentiment(sent);
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
        setLoading(true);
        setError(null);
        const [hotelRes, ratesRes] = await Promise.all([
          fetch(`/api/hotel?hotelId=${encodeURIComponent(hotelId)}`),
          fetch("/api/rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelIds: [hotelId],
              checkin,
              checkout,
              adults: occupancies[0]?.adults ?? party.adults,
              children: party.childAges,
              occupancies,
              maxRatesPerHotel: 50,
              currency,
              guestNationality: guestNationalityForCurrency(currency),
            }),
          }),
        ]);

        const hotelJson = await hotelRes.json();
        const ratesJson = await ratesRes.json();

        if (!hotelRes.ok) throw new Error(hotelJson.error ?? "Hotel fetch failed");
        if (!ratesRes.ok) throw new Error(ratesJson.error ?? "Rates fetch failed");

        const hotelData = (hotelJson.data ?? hotelJson) as HotelDetail;
        setHotel(hotelData);
        // Hotel payload often already includes AI sentiment — show it before reviews return.
        if (hotelData.sentiment_analysis) {
          setSentiment((current) => current ?? hotelData.sentiment_analysis ?? null);
        }

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
              offerId: r.offerId ?? rt.offerId,
            });
          }
        }

        const roomMap = new Map<number, Record<string, unknown>>();
        for (const r of hotelData.rooms ?? []) {
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
          const roomInfo = roomMap.get(mappedRoomId) as
            | { roomName?: string; photos?: Array<{ url: string }> }
            | undefined;
          const roomName =
            rates[0]?.name ?? roomInfo?.roomName ?? `Room ${mappedRoomId}`;
          const photos = (roomInfo?.photos ?? [])
            .map((photo) => photo.url)
            .filter((url, index, all): url is string => Boolean(url) && all.indexOf(url) === index);
          groups.push({
            mappedRoomId,
            roomName,
            photos,
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
  }, [hotelId, checkin, checkout, occupancyKey, currency]);

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
      adults: party.adults,
    });
    const eventId = generateMetaEventId("init_checkout");
    const metaData = {
      content_ids: [hotelId],
      content_type: "product",
      value: total?.amount,
      currency: total?.currency,
      checkin,
      checkout,
      adults: party.adults,
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
    });
    appendOccupancyParams(q, party, { rooms: requestedRooms });
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
      ? `/results?${buildStaySearchParams({
          checkin,
          checkout,
          party,
          rooms: requestedRooms,
          placeId: searchParams.get("placeId"),
          aiSearch: searchParams.get("aiSearch"),
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
  const reviewScores = reviews
    .map((r) => r.averageScore)
    .filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
  const reviewAvg =
    reviewScores.length > 0
      ? reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length
      : null;
  const guestScore =
    typeof hotel.rating === "number" && hotel.rating > 0 ? hotel.rating : reviewAvg;

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
        <BackToResultsLink
          href={backHref}
          label={`Back to ${searchParams.get("placeId") || searchParams.get("aiSearch") ? "results" : "search"}`}
        />

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
                  <a
                    href="#stay-location"
                    className="hover:text-teal hover:underline hover:underline-offset-4"
                  >
                    {hotel.address}
                  </a>
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

            {/* Trust before rooms — the conversion-critical order. */}
            <PeaceOfMindCard
              stay={stay}
              safetyBadges={safetyBadges}
              hasFreeCancellation={hasFreeCancellation}
            />

            <GuestReviewsSection
              guestScore={guestScore}
              reviewCount={hotel.reviewCount}
              sentiment={sentiment}
              reviews={reviews}
              loading={reviewsLoading}
            />

            <AboutStayCard description={description} />

            <div id="stay-location" className="mt-4 scroll-mt-24">
              <HotelLocationCard
                name={hotel.name}
                address={hotel.address}
                city={hotel.city}
                location={hotel.location ?? hotel}
                nearestTransit={stay.nearestTransit}
              />
            </div>

            <h2
              id="rooms"
              className="mt-8 font-display text-xl font-semibold tracking-tight text-ink"
            >
              Choose your room
            </h2>
            <p className="mt-1 text-[0.9375rem] text-ink-muted">
              Swipe room photos to see the space — then pick a rate that fits your dates.
            </p>
            <div className="mt-4 space-y-4">
              {roomGroups.map((group) => (
                <Card key={group.mappedRoomId} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <RoomPhotoStrip roomName={group.roomName} photos={group.photos} />
                    <div className="min-w-0 flex-1 p-4">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {group.roomName}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {group.rates.map((rate, index) => {
                          const total = rate.retailRate?.total?.[0];
                          const amount = total?.amount ?? 0;
                          const rateCurrency = total?.currency ?? "EUR";
                          const refundable =
                            rate.cancellationPolicies?.refundableTag === "RFN";
                          return (
                            <div
                              key={`${rate.offerId}-${index}`}
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
                                    {formatStayTotal(amount, rateCurrency)}
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
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                    <ImageOff className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-[0.9375rem] text-ink-muted">
                    No rooms available for {occupancySummary(party, requestedRooms)}. Hotels quote
                    room occupancy, not a headcount — four adults in one room is not the same as two
                    adults and two children.
                  </p>
                </Card>
              )}
            </div>

            <FacilitiesCard facilities={facilityNames} />
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
                {nights} {nights === 1 ? "night" : "nights"} ·{" "}
                {occupancySummary(party, requestedRooms)}
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
                {safetyBadges.slice(0, 3).map((badge) => (
                  <li key={badge} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                    {badge}
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Card details handled by Stripe, never stored by us
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
