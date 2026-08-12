import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEventsForHomepage } from "@/data/events";
import { SectionHeading } from "@/components/ui/Card";

export function TrendingEvents() {
  const events = getEventsForHomepage(8);
  if (events.length === 0) return null;

  return (
    <section id="trending-events" className="bg-canvas" aria-labelledby="trending-events-heading">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <SectionHeading
          id="trending-events-heading"
          eyebrow="Peak dates"
          title="Travelling for something specific?"
          description="Rooms go fast and prices climb around big events. These searches are already set to the right city and dates."
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <li key={event.slug}>
              <Link
                href={`/events/${event.slug}`}
                className="group flex h-full flex-col rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-muted"
              >
                <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-teal tnum">
                  {event.dateRange}
                </span>
                <span className="mt-1.5 font-display text-base font-semibold leading-snug text-ink">
                  {event.eventShortName}
                </span>
                <span className="mt-auto pt-3 text-[0.8125rem] text-ink-muted">
                  {event.city}, {event.country}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6">
          <Link
            href="/popular-cities"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
          >
            Browse popular cities instead
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
