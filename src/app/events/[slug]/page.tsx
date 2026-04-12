import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEventBySlug,
  getAllEventSlugs,
  getCheckoutDate,
} from "@/data/events";
import { searchPlaces } from "@/lib/liteapi";
import EventPriceBadge from "@/components/EventPriceBadge";

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
  const eventUrl = `https://www.yesicantravel.com/events/${event.slug}`;

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

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
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
