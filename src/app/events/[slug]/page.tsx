import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEventBySlug,
  getAllEventSlugs,
  getCheckoutDate,
  getRelatedEvents,
} from "@/data/events";
import { searchPlaces } from "@/lib/liteapi";
import EventPriceBadge from "@/components/EventPriceBadge";

const BASE_URL = "https://www.yesicantravel.com";

type Props = { params: Promise<{ slug: string }> };

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

  return {
    title,
    description,
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

export function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const checkout = getCheckoutDate(event.endDate);
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
  const searchUrl = placeId
    ? `/results?${new URLSearchParams({
        placeId,
        checkin: event.startDate,
        checkout,
        adults: "1",
      })}`
    : `/results?${new URLSearchParams({
        aiSearch: event.aiSearchTemplate,
        checkin: event.startDate,
        checkout,
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
        name: "Events",
        item: `${BASE_URL}/`,
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
    eventStatus: "https://schema.org/EventScheduled",
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
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
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
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--navy-light)]">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--navy-light)]">Events</span>
          <span className="mx-2">/</span>
          <span className="text-[var(--navy)]">{event.eventName}</span>
        </nav>
        <Link
          href="/"
          className="mb-8 inline-block text-[var(--ocean-teal)] font-medium hover:underline"
        >
          ← Back to search
        </Link>

        <header className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--ocean-teal)]">
            {event.city}, {event.country}
          </p>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-[var(--navy)] md:text-5xl">
            {event.eventName} – {event.dateRange}
          </h1>
          <p className="mb-4 text-2xl font-medium text-[var(--navy)]">in {event.city}</p>
          <p className="text-xl text-[var(--navy-light)]">
            Safer stays near venues—event dates pre-filled. 24/7 reception, well-lit areas and
            neighbourhood tips. Change dates anytime on the results page.
          </p>
        </header>

        <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Why now?</h2>
          <p className="mb-4 rounded-lg bg-[var(--ocean-teal)]/10 px-4 py-3 text-lg font-bold text-[var(--navy)]">
            Event Dates: {event.dateRange}
          </p>
          <EventPriceBadge
            slug={slug}
            eventShortName={event.eventShortName}
            venueNotes={event.venueNotes}
          />
          <p className="mb-4 text-[var(--navy-light)]">{whyNowBody}</p>
          {event.venueNotes && (
            <p className="text-sm font-medium text-[var(--ocean-teal)]">{event.venueNotes}</p>
          )}
        </section>

        <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">How we help</h2>
          <ul className="space-y-2 text-[var(--navy-light)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ocean-teal)]">✓</span>
              Filter for 24/7 staffed reception and well-lit entrances
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ocean-teal)]">✓</span>
              Neighbourhood safety tips and area guidance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ocean-teal)]">✓</span>
              Free cancellation options so you stay flexible
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ocean-teal)]">✓</span>
              Stays reviewed and rated by women travellers
            </li>
          </ul>
        </section>

        {event.knownFor && event.knownFor.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              What {event.city} is known for
            </h2>
            <ul className="space-y-2 text-[var(--navy-light)]">
              {event.knownFor.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[var(--ocean-teal)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {event.neighbourhoods && event.neighbourhoods.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Where to stay – neighbourhood guide
            </h2>
            <div className="space-y-5">
              {event.neighbourhoods.map((n) => (
                <div key={n.name}>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--navy)]">
                      {n.name}
                    </h3>
                    <span
                      className={
                        n.verdict === "recommended"
                          ? "rounded-full bg-[var(--ocean-teal)]/10 px-2 py-0.5 text-xs font-medium text-[var(--ocean-teal)]"
                          : "rounded-full bg-[var(--coral)]/10 px-2 py-0.5 text-xs font-medium text-[var(--coral)]"
                      }
                    >
                      {n.verdict === "recommended" ? "Recommended" : "Extra awareness"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--navy-light)]">{n.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {event.safetyTips && event.safetyTips.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              Solo female safety tips for {event.eventName}
            </h2>
            <ul className="space-y-2 text-[var(--navy-light)]">
              {event.safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--ocean-teal)]">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {event.gettingAround && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              Getting there and around
            </h2>
            <p className="text-sm text-[var(--navy-light)]">{event.gettingAround}</p>
          </section>
        )}

        {event.faqs && event.faqs.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Frequently asked questions
            </h2>
            <dl className="space-y-5">
              {event.faqs.map((f) => (
                <div key={f.question}>
                  <dt className="mb-1 font-semibold text-[var(--navy)]">{f.question}</dt>
                  <dd className="text-sm text-[var(--navy-light)]">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="rounded-2xl border-2 border-[var(--ocean-teal)] bg-[var(--ocean-teal)]/5 p-6">
          <p className="mb-2 text-sm font-medium text-[var(--ocean-teal)]">
            Your search is set for {event.eventShortName}: {event.dateRange}
          </p>
          <p className="mb-2">
            <Link href="/" className="text-sm text-[var(--navy-light)] hover:underline">
              Change dates →
            </Link>
          </p>
          <p className="mb-4 text-lg font-semibold text-[var(--navy)]">
            Ready to find your stay in {event.city}?
          </p>
          <p className="mb-6 text-[var(--navy-light)]">
            Event dates pre-filled • Edit anytime on the results page
          </p>
          <Link
            href={searchUrl}
            className="inline-block rounded-lg bg-[var(--ocean-teal)] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[var(--ocean-teal-light)]"
          >
            Find Safer Stays in {event.city} – {event.dateRange}
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-12 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Related events & safer stays
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/events/${r.slug}`}
                    className="block rounded-lg border border-[var(--sand)] p-4 transition-colors hover:border-[var(--ocean-teal)]"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--ocean-teal)]">
                      {r.city}, {r.country}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--navy)]">
                      {r.eventName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--navy-light)]">
                      {r.dateRange}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-center text-sm text-[var(--navy-light)]">
          <Link href="/" className="text-[var(--ocean-teal)] hover:underline">
            Yes I Can Travel
          </Link>{" "}
          – safety-first booking for women travelling solo.
        </p>
      </div>
    </div>
  );
}
