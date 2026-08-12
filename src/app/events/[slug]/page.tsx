import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEventBySlug,
  getAllEventSlugs,
  getDefaultStayWindow,
  getEventStayWindow,
  getRelatedEvents,
  isEventPast,
} from "@/data/events";
import { getDestinationByCity } from "@/data/destinations";
import { ArrowRight, CalendarDays, Check, Dot, History } from "lucide-react";
import { searchPlaces } from "@/lib/liteapi";
import EventPriceBadge from "@/components/EventPriceBadge";
import { Card } from "@/components/ui/Card";
import { PrimaryLink } from "@/components/ui/PrimaryButton";

const BASE_URL = "https://yesicantravel.com";

type Props = { params: Promise<{ slug: string }> };

/** "26 Aug – 29 Aug, 3 nights" — the dates the search link actually carries. */
function formatStayWindow({ checkin, checkout, nights }: { checkin: string; checkout: string; nights: number }) {
  const day = (iso: string) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${day(checkin)} – ${day(checkout)} · ${nights} ${nights === 1 ? "night" : "nights"}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) {
    return { title: "Event Not Found | Yes I Can Travel" };
  }

  const year = event.startDate.slice(0, 4);
  const eventNameWithYear = `${event.eventName} ${year}`;

  const title = `${eventNameWithYear} – Safe Solo Stays for Women | Yes I Can Travel`;
  const description = `Safe, women-reviewed hotels near ${eventNameWithYear}. 24/7 reception, safety filters & expert tips for solo female travelers. Book confidently and feel prepared.`;
  const eventUrl = `${BASE_URL}/events/${event.slug}`;
  const past = isEventPast(event);

  return {
    title: past ? `${eventNameWithYear} has ended | Yes I Can Travel` : title,
    description,
    // Keep the URL alive for anyone who has it, but stop offering a finished
    // edition to search as if it were bookable.
    robots: past ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: eventUrl,
    },
    twitter: {
      title,
      description,
    },
    alternates: { canonical: eventUrl },
  };
}

// Whether an event has passed changes with the calendar, not with a deploy.
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const past = isEventPast(event);
  const nextEdition = event.supersededBy ? getEventBySlug(event.supersededBy) : undefined;
  const cityGuide = getDestinationByCity(event.city);

  // Long seasons get a representative stay rather than the whole run, and a
  // season already under way starts from tomorrow — the rates API can't quote
  // a date in the past.
  const stay = getEventStayWindow(event) ?? getDefaultStayWindow();

  let placeId: string | undefined;
  if (event.placeQuery) {
    try {
      const placeRes = await searchPlaces(event.placeQuery);
      const first = (placeRes as { data?: Array<{ placeId?: string }> })?.data?.[0];
      placeId = first?.placeId;
    } catch {
      // fall back to aiSearch below
    }
  }
  const searchUrl = `/results?${new URLSearchParams({
    ...(placeId ? { placeId } : { aiSearch: event.aiSearchTemplate }),
    checkin: stay.checkin,
    checkout: stay.checkout,
    adults: "1",
  })}`;

  const whyNowBody =
    event.whyNow ??
    `High demand around ${event.eventName}. Safer stays with 24/7 reception and well-lit areas—book with confidence.`;

  const canonicalUrl = `${BASE_URL}/events/${event.slug}`;
  const related = getRelatedEvents(slug, 3);

  // JSON-LD: BreadcrumbList + Event schema. Signals to Google the page
  // is a real-world, dated event with a physical location — helps escape
  // the "Discovered – currently not indexed" bucket.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Peak dates",
        item: `${BASE_URL}/events`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.eventName,
        item: canonicalUrl,
      },
    ],
  };

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.eventName,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: past ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: `${event.city}, ${event.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: event.country,
      },
    },
    description: `${event.eventName} in ${event.city}, ${event.country}. Safe, women-reviewed stays nearby — 24/7 reception, well-lit areas, and neighbourhood tips for solo female travellers.`,
    url: canonicalUrl,
  };

  const faqJsonLd =
    event.faqs && event.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: event.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-[0.8125rem] text-ink-muted">
          <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/events" className="underline-offset-4 hover:text-ink hover:underline">
            Peak dates
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{event.eventName}</span>
        </nav>

        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            {event.city}, {event.country}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
            {event.eventName}
          </h1>
          <p className="tnum mt-2 flex items-center gap-2 text-lg font-medium text-ink">
            <CalendarDays className="h-4 w-4 text-ink-muted" aria-hidden />
            {event.dateRange}
          </p>

          {past ? (
            <div className="mt-4 rounded-card border border-border bg-surface-muted p-5">
              <p className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                <History className="h-4 w-4 text-ink-muted" aria-hidden />
                This edition has finished
              </p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                {nextEdition
                  ? `The next edition runs ${nextEdition.dateRange}.`
                  : cityGuide
                    ? `We keep this page for reference. The year-round ${event.city} guide is the better starting point now.`
                    : `We keep this page for reference. You can still search ${event.city} for any dates you like.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {nextEdition && (
                  <PrimaryLink
                    href={`/events/${nextEdition.slug}`}
                    variant="coral"
                    fullWidth={false}
                  >
                    See {nextEdition.eventShortName} {nextEdition.startDate.slice(0, 4)}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </PrimaryLink>
                )}
                {cityGuide && (
                  <PrimaryLink
                    href={`/destinations/${cityGuide.slug}`}
                    variant={nextEdition ? "teal" : "coral"}
                    fullWidth={false}
                  >
                    {event.city} city guide
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </PrimaryLink>
                )}
                <Link
                  href={searchUrl}
                  className="inline-flex items-center gap-1.5 self-center text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
                >
                  Search stays in {event.city}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                Stays near the venues with the dates already filled in. Reception hours, location
                and cancellation terms are shown on every result, and you can change the dates
                whenever you like.
              </p>
              <div className="mt-5">
                <PrimaryLink href={searchUrl} variant="coral" fullWidth={false}>
                  Search stays in {event.city}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </PrimaryLink>
              </div>
            </>
          )}
        </header>

        {!past && (
          <Card className="mt-8 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Why book early</h2>
            <EventPriceBadge
              slug={slug}
              eventShortName={event.eventShortName}
              venueNotes={event.venueNotes}
            />
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{whyNowBody}</p>
            {event.venueNotes && (
              <p className="mt-3 text-[0.9375rem] font-medium text-teal">{event.venueNotes}</p>
            )}
          </Card>
        )}

        {event.knownFor && event.knownFor.length > 0 && (
          <Card className="mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              What {event.city} is known for
            </h2>
            <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink-muted">
              {event.knownFor.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Dot className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {event.neighbourhoods && event.neighbourhoods.length > 0 && (
          <Card className="mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Where to stay — neighbourhood guide
            </h2>
            <div className="mt-4 space-y-4">
              {event.neighbourhoods.map((n) => (
                <div key={n.name} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">{n.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        n.verdict === "recommended"
                          ? "bg-positive-soft text-positive"
                          : "bg-coral-soft text-coral"
                      }`}
                    >
                      {n.verdict === "recommended" ? "Recommended" : "Extra awareness"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {n.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {event.safetyTips && event.safetyTips.length > 0 && (
          <Card className="mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Practical tips for {event.city}
            </h2>
            <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink-muted">
              {event.safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {event.gettingAround && (
          <Card className="mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Getting there and around
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
              {event.gettingAround}
            </p>
          </Card>
        )}

        {event.faqs && event.faqs.length > 0 && (
          <Card className="mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Frequently asked questions
            </h2>
            <dl className="mt-4 space-y-4">
              {event.faqs.map((f) => (
                <div key={f.question} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <dt className="font-semibold text-ink">{f.question}</dt>
                  <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {f.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        {!past && (
          <div className="mt-8 rounded-card bg-surface-inverse p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-soft/70">
              Dates pre-filled · {formatStayWindow(stay)}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink-inverse md:text-2xl">
              Ready to find your stay in {event.city}?
            </h2>
            <p className="mt-2 text-[0.9375rem] text-ink-inverse/70">
              You can change dates, travellers and filters on the results page.
            </p>
            <div className="mt-5">
              <PrimaryLink href={searchUrl} variant="coral" fullWidth={false}>
                Search stays for {event.eventShortName}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </PrimaryLink>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">
              {past ? "Peak dates coming up" : "Other dated trips"}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/events/${r.slug}`}
                    className="block h-full rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <p className="tnum text-xs font-semibold uppercase tracking-[0.08em] text-teal">
                      {r.dateRange}
                    </p>
                    <p className="mt-1.5 font-display text-base font-semibold text-ink">
                      {r.eventName}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-ink-muted">
                      {r.city}, {r.country}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
