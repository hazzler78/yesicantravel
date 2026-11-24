import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getHomepageWinterEvents } from "@/data/events";
import { DiscoveryCardPhoto } from "@/components/cities/DiscoveryCardPhoto";
import { SectionHeading } from "@/components/ui/Card";
import { resolveDiscoveryCardPhoto } from "@/lib/cityPhotos";

/**
 * Seasonal block for Christmas markets and Hogmanay while each event is still upcoming.
 */
export function WinterChristmasMarkets() {
  const events = getHomepageWinterEvents();
  if (events.length === 0) return null;

  return (
    <section
      id="winter-markets"
      className="border-y border-border bg-surface-muted"
      aria-labelledby="winter-markets-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <SectionHeading
          id="winter-markets-heading"
          eyebrow="Winter travels"
          title="Christmas markets & Hogmanay"
          description="Dates and neighbourhoods are already set on each page — open one, then search stays with reception hours and cancellation terms up front."
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => {
            const photo = resolveDiscoveryCardPhoto({
              city: event.city,
              eventSlug: event.slug,
            });
            return (
              <li key={event.slug}>
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-teal/40 hover:bg-surface"
                >
                  <DiscoveryCardPhoto photo={photo} className="rounded-t-[inherit]" />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-teal tnum">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {event.dateRange}
                    </span>
                    <span className="mt-1.5 font-display text-base font-semibold leading-snug text-ink">
                      {event.eventShortName}
                    </span>
                    <span className="mt-auto pt-3 text-[0.8125rem] text-ink-muted">
                      {event.city}, {event.country}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
          >
            All peak dates
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}