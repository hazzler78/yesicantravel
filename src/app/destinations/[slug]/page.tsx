import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinationBySlug, getAllDestinationSlugs } from "@/data/destinations";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };

  const baseUrl = "https://www.yesicantravel.com";
  return {
    title: dest.metaTitle,
    description: dest.metaDescription,
    openGraph: {
      title: dest.metaTitle,
      description: dest.metaDescription,
      url: `${baseUrl}/destinations/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dest.metaTitle,
      description: dest.metaDescription,
    },
    alternates: { canonical: `${baseUrl}/destinations/${slug}` },
  };
}

export function generateStaticParams() {
  return getAllDestinationSlugs().map((slug) => ({ slug }));
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const searchUrl = `/results?${new URLSearchParams({
    aiSearch: dest.aiSearch,
    checkin: dest.checkin,
    checkout: dest.checkout,
    adults: "1",
  })}`;

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
            {dest.city}, {dest.country}
          </p>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-[var(--navy)] md:text-5xl">
            {dest.headline} – {dest.eventDateRange}
          </h1>
          <p className="mb-4 text-2xl font-medium text-[var(--navy)]">in {dest.city}</p>
          <p className="text-xl text-[var(--navy-light)]">{dest.subheadline}</p>
        </header>

        <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">Why now?</h2>
          <p className="mb-4 rounded-lg bg-[var(--ocean-teal)]/10 px-4 py-3 text-lg font-bold text-[var(--navy)]">
            Event Dates: {dest.eventDateRange}
          </p>
          <p className="mb-4 text-[var(--navy-light)]">{dest.whyDemand}</p>
          <p className="text-sm font-medium text-[var(--ocean-teal)]">{dest.events}</p>
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
            Your search is set for {dest.eventShortName}: {dest.eventDateRange}
          </p>
          <p className="mb-2">
            <Link href="/" className="text-sm text-[var(--navy-light)] hover:underline">
              Change dates →
            </Link>
          </p>
          <p className="mb-4 text-lg font-semibold text-[var(--navy)]">
            Ready to find your stay in {dest.city}?
          </p>
          <p className="mb-6 text-[var(--navy-light)]">
            Event dates pre-filled • Edit anytime on the results page
          </p>
          <Link
            href={searchUrl}
            className="inline-block rounded-lg bg-[var(--ocean-teal)] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[var(--ocean-teal-light)]"
          >
            Find Safer Stays in {dest.city} – {dest.eventDateRange}
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
