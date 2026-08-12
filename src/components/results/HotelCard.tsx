import Link from "next/link";
import { Clock, ImageOff, MapPin, TrainFront, Venus } from "lucide-react";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { formatDistance, type StaySignals } from "@/lib/staySignals";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SafetyBadge, SafetyBadgeList } from "@/components/ui/SafetyBadge";

export type HotelCardData = {
  id: string;
  name: string;
  main_photo?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  currency?: string;
  hasFreeCancellation?: boolean;
  safetyBadges?: string[];
};

type HotelCardProps = {
  hotel: HotelCardData;
  signals?: StaySignals;
  href: string;
  nights: number;
  onSelect?: () => void;
};

export function HotelCard({ hotel, signals, href, nights, onSelect }: HotelCardProps) {
  const hasPrice = hotel.price != null;
  const nearestTransit = signals?.nearestTransit;

  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors hover:border-border-strong">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={href}
          onClick={onSelect}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-muted sm:aspect-auto sm:h-[188px] sm:w-[248px]"
        >
          {hotel.main_photo ? (
            /* Hotel photos come from partner CDNs that aren't in next.config image hosts. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={hotel.main_photo}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-ink-muted">
              <ImageOff className="h-6 w-6" aria-hidden />
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:gap-5">
          <div className="min-w-0 flex-1">
            <h3 className="min-w-0 font-display text-lg font-semibold leading-snug text-ink">
              <Link href={href} onClick={onSelect} className="hover:text-teal">
                {hotel.name}
              </Link>
            </h3>

            {hotel.rating != null && (
              <RatingBadge
                rating={hotel.rating}
                reviewCount={hotel.reviewCount}
                className="mt-2"
              />
            )}

            {hotel.address && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] text-ink-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-2">{hotel.address}</span>
              </p>
            )}

            {nearestTransit && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] text-ink-muted">
                <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  <span className="tnum font-medium text-ink">
                    {formatDistance(nearestTransit.distanceKm)}
                  </span>{" "}
                  to {nearestTransit.name}
                </span>
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {signals?.matches.includes("womenOnlyRoom") && (
                <SafetyBadge label="Women-only room" tone="positive" icon={Venus} />
              )}
              {signals?.latestCheckIn && (
                <SafetyBadge label={`Check-in until ${signals.latestCheckIn}`} icon={Clock} />
              )}
              <SafetyBadgeList
                badges={hotel.safetyBadges ?? []}
                freeCancellation={Boolean(hotel.hasFreeCancellation)}
                max={4}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch justify-end gap-2 border-t border-border pt-3 sm:w-44 sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            {hasPrice ? (
              <div className="sm:text-right">
                <p className="tnum font-display text-xl font-semibold text-ink">
                  {formatStayTotal(hotel.price!, hotel.currency ?? "EUR")}
                </p>
                <p className="text-xs text-ink-muted">
                  total for {nights} {nights === 1 ? "night" : "nights"}
                </p>
                <p className="text-xs text-ink-muted">taxes and fees included</p>
              </div>
            ) : (
              <p className="text-[0.8125rem] text-ink-muted sm:text-right">
                Live rates on the next page
              </p>
            )}
            <Link
              href={href}
              onClick={onSelect}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-control bg-teal px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-teal-hover"
            >
              See availability
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface" aria-hidden>
      <div className="flex animate-pulse flex-col sm:flex-row">
        <div className="aspect-[4/3] w-full bg-surface-muted sm:aspect-auto sm:h-[188px] sm:w-[248px]" />
        <div className="flex-1 space-y-3 p-4">
          <div className="h-5 w-2/3 rounded bg-surface-muted" />
          <div className="h-3.5 w-1/2 rounded bg-surface-muted" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-28 rounded-full bg-surface-muted" />
            <div className="h-6 w-24 rounded-full bg-surface-muted" />
          </div>
          <div className="h-10 w-full rounded-control bg-surface-muted sm:w-40" />
        </div>
      </div>
    </div>
  );
}
