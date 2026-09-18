"use client";

import { useId, useState } from "react";
import {
  CalendarCheck,
  Check,
  Clock,
  Info,
  ShieldCheck,
  ThumbsUp,
  TrainFront,
  Venus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SafetyBadge, SafetyBadgeList } from "@/components/ui/SafetyBadge";
import { formatDistance, type StaySignals } from "@/lib/staySignals";

type PeaceOfMindCardProps = {
  stay: StaySignals;
  safetyBadges: string[];
  hasFreeCancellation: boolean;
};

/** Above-the-fold trust band — answers “can I get in safely?” before room choice. */
export function PeaceOfMindCard({
  stay,
  safetyBadges,
  hasFreeCancellation,
}: PeaceOfMindCardProps) {
  const titleId = useId();
  const hasSignals =
    safetyBadges.length > 0 ||
    Boolean(stay.nearestTransit) ||
    Boolean(stay.latestCheckIn) ||
    stay.matches.includes("womenOnlyRoom") ||
    hasFreeCancellation;

  if (!hasSignals) return null;

  return (
    <Card className="mt-5 border-teal/20 bg-teal-soft/40 p-5" aria-labelledby={titleId}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-ink-inverse">
          <ShieldCheck className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-base font-semibold text-ink">
            Peace of mind signals
          </h2>
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            Pulled from what this property publishes — so you can decide with clearer context.
          </p>
        </div>
      </div>

      {(stay.nearestTransit || stay.latestCheckIn || stay.roundTheClockReception) && (
        <ul className="mt-4 space-y-2 text-[0.9375rem] text-ink">
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
                {stay.roundTheClockReception && " — reception staffed around the clock"}
              </span>
            </li>
          )}
          {!stay.latestCheckIn && stay.roundTheClockReception && (
            <li className="flex items-start gap-2">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>24/7 front desk published by the property</span>
            </li>
          )}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hasFreeCancellation && (
          <SafetyBadge
            label="Free cancellation available"
            tone="positive"
            icon={CalendarCheck}
          />
        )}
        {stay.matches.includes("womenOnlyRoom") && (
          <SafetyBadge label="Women-only room" tone="positive" icon={Venus} />
        )}
        <SafetyBadgeList badges={safetyBadges} max={8} />
      </div>

      <p className="mt-3 flex gap-2 text-xs text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        We don&apos;t inspect properties in person. Use these signals together with photos,
        reviews, and the map below.
      </p>
    </Card>
  );
}

type SentimentAnalysis = {
  pros?: string[];
  cons?: string[];
  categories?: Array<{ name?: string; rating?: number; description?: string }>;
};

type ReviewItem = {
  name?: string;
  averageScore?: number;
  country?: string;
  date?: string;
  headline?: string;
  language?: string;
  pros?: string;
  cons?: string;
};

type GuestReviewsSectionProps = {
  guestScore: number | null;
  reviewCount?: number;
  sentiment: SentimentAnalysis | null;
  reviews: ReviewItem[];
  loading: boolean;
};

export function GuestReviewsSection({
  guestScore,
  reviewCount,
  sentiment,
  reviews,
  loading,
}: GuestReviewsSectionProps) {
  const titleId = useId();
  const reviewsToShow = reviews
    .filter((r) => (r.pros && r.pros.trim()) || (r.cons && r.cons.trim()) || r.headline)
    .slice(0, 6);
  const categories = (sentiment?.categories ?? []).filter(
    (c) => c.name && typeof c.rating === "number"
  );
  const hasContent =
    loading ||
    (sentiment?.pros?.length ?? 0) > 0 ||
    (sentiment?.cons?.length ?? 0) > 0 ||
    categories.length > 0 ||
    reviewsToShow.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="mt-4 p-5" aria-labelledby={titleId}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="font-display text-base font-semibold text-ink">
          What guests say
        </h2>
        {guestScore != null && (
          <span className="text-[0.8125rem] text-ink-muted">
            <span className="tnum font-semibold text-ink">{guestScore.toFixed(1)}/10</span>
            {reviewCount != null && reviewCount > 0 && (
              <> · {reviewCount.toLocaleString("en-GB")} reviews</>
            )}
          </span>
        )}
      </div>

      {loading && reviewsToShow.length === 0 && !sentiment?.pros?.length && (
        <p className="mt-3 text-[0.9375rem] text-ink-muted">Loading reviews…</p>
      )}

      {categories.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {categories.slice(0, 6).map((category) => (
            <li
              key={category.name}
              className="rounded-control border border-border bg-surface-muted/50 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2 text-[0.8125rem]">
                <span className="font-medium text-ink">{category.name}</span>
                <span className="tnum font-semibold text-teal">
                  {category.rating!.toFixed(1)}
                </span>
              </div>
              {category.description && (
                <p className="mt-1 text-xs leading-snug text-ink-muted">
                  {category.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {((sentiment?.pros?.length ?? 0) > 0 || (sentiment?.cons?.length ?? 0) > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(sentiment?.pros?.length ?? 0) > 0 && (
            <div className="rounded-control bg-positive-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-positive">
                Guests liked
              </p>
              <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-ink">
                {sentiment!.pros!.slice(0, 5).map((item, index) => (
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
                {sentiment!.cons!.slice(0, 5).map((item, index) => (
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
              key={`${review.name ?? "guest"}-${review.date ?? index}`}
              className="border-t border-border pt-4 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                {review.name && <span className="font-semibold text-ink">{review.name}</span>}
                {review.country && <span>· {review.country.toUpperCase()}</span>}
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
    </Card>
  );
}

type AboutStayCardProps = {
  description: string;
};

export function AboutStayCard({ description }: AboutStayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 420;
  const shown = !long || expanded ? description : `${description.slice(0, 420).trim()}…`;

  if (!description) return null;

  return (
    <Card className="mt-4 p-5">
      <h2 className="font-display text-base font-semibold text-ink">About this stay</h2>
      <p className="mt-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-muted">
        {shown}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[0.8125rem] font-semibold text-teal hover:text-teal-hover"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </Card>
  );
}

type FacilitiesCardProps = {
  facilities: string[];
};

export function FacilitiesCard({ facilities }: FacilitiesCardProps) {
  if (facilities.length === 0) return null;

  return (
    <Card className="mt-4 p-5">
      <h2 className="font-display text-base font-semibold text-ink">Facilities</h2>
      <ul className="mt-3 grid gap-x-6 gap-y-2 text-[0.9375rem] text-ink sm:grid-cols-2">
        {facilities.slice(0, 36).map((facility) => (
          <li key={facility} className="flex items-start gap-2">
            <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
            <span>{facility}</span>
          </li>
        ))}
      </ul>
      {facilities.length > 36 && (
        <p className="mt-3 text-xs text-ink-muted">
          +{facilities.length - 36} more listed by the hotel.
        </p>
      )}
    </Card>
  );
}
