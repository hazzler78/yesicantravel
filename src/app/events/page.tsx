import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getUpcomingEvents } from "@/data/events";
import { Card } from "@/components/ui/Card";

const BASE_URL = "https://yesicantravel.com";

export const metadata: Metadata = {
  title: "Peak travel dates in Europe – Safe stays for women travelling solo",
  description:
    "Festivals, markets and big weekends across Europe, each with the dates already filled in and stays filtered for reception hours, lighting and location.",
  openGraph: {
    title: "Peak travel dates in Europe",
    description:
      "Festivals, markets and big weekends across Europe, with dates pre-filled and safety signals on every stay.",
    url: `${BASE_URL}/events`,
  },
  alternates: { canonical: `${BASE_URL}/events` },
};

// The list is date-filtered, so a page built once would slowly go stale.
export const revalidate = 3600;

function monthLabel(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Hub for the event pages.
 *
 * Without it the only route to an event was the homepage strip, which shows
 * eight — so everything past the eighth had no internal link at all and sat in
 * Search Console as "Discovered – currently not indexed".
 */
export default function EventsPage() {
  const events = getUpcomingEvents();

  const byMonth = events.reduce<Record<string, typeof events>>((acc, event) => {
    const key = monthLabel(event.startDate);
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Peak travel dates in Europe",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${event.eventName}, ${event.city}`,
      url: `${BASE_URL}/events/${event.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Peak dates", item: `${BASE_URL}/events` },
    ],
  };

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-5 text-[0.8125rem] text-ink-muted">
          <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Peak dates</span>
        </nav>

        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            Peak dates
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Travelling for something specific?
          </h1>
          <p className="mt-3 text-[0.9375rem] text-ink-muted md:text-base">
            Rooms go fast and prices climb around big events. Each page opens a search set to the
            right city and dates, with reception hours, distance to transport and cancellation
            terms shown on every stay. Dates that have passed drop off this list automatically.
          </p>
        </header>

        {events.length === 0 ? (
          <Card className="mt-8 p-6">
            <p className="text-[0.9375rem] text-ink-muted">
              Nothing dated is coming up right now.{" "}
              <Link href="/popular-cities" className="font-semibold text-teal hover:underline">
                Browse popular cities
              </Link>{" "}
              instead.
            </p>
          </Card>
        ) : (
          <div className="mt-10 space-y-10">
            {Object.entries(byMonth).map(([month, monthEvents]) => (
              <section key={month} aria-labelledby={`month-${month.replace(/\s/g, "-")}`}>
                <h2
                  id={`month-${month.replace(/\s/g, "-")}`}
                  className="flex items-center gap-2 font-display text-lg font-semibold text-ink"
                >
                  <CalendarDays className="h-4 w-4 text-ink-muted" aria-hidden />
                  {month}
                </h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {monthEvents.map((event) => (
                    <li key={event.slug}>
                      <Card as="article" className="flex h-full flex-col p-5">
                        <p className="tnum text-xs font-semibold uppercase tracking-[0.08em] text-teal">
                          {event.dateRange}
                        </p>
                        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
                          <Link
                            href={`/events/${event.slug}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {event.eventName}
                          </Link>
                        </h3>
                        <p className="mt-1 text-[0.8125rem] text-ink-muted">
                          {event.city}, {event.country}
                        </p>
                        {event.whyNow && (
                          <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                            {event.whyNow.length > 150
                              ? `${event.whyNow.slice(0, 150).trim()}…`
                              : event.whyNow}
                          </p>
                        )}
                        <Link
                          href={`/events/${event.slug}`}
                          className="group mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
                        >
                          Stays for {event.eventShortName}
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </Link>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
