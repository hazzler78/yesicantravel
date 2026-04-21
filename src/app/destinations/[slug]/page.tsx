import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDestinationBySlug,
  getAllDestinationSlugs,
  getRelatedDestinations,
} from "@/data/destinations";

const BASE_URL = "https://yesicantravel.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };

  return {
    title: dest.metaTitle,
    description: dest.metaDescription,
    openGraph: {
      title: dest.metaTitle,
      description: dest.metaDescription,
      url: `${BASE_URL}/destinations/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dest.metaTitle,
      description: dest.metaDescription,
    },
    alternates: { canonical: `${BASE_URL}/destinations/${slug}` },
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

  const canonicalUrl = `${BASE_URL}/destinations/${slug}`;
  const related = getRelatedDestinations(slug, 3);

  // JSON-LD: BreadcrumbList + TouristDestination. Helps Google understand
  // topical relevance of thin templated pages while we build out richer copy.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: `${BASE_URL}/popular-cities`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dest.city,
        item: canonicalUrl,
      },
    ],
  };

  const destinationJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${dest.city} – ${dest.eventShortName}`,
    description: dest.metaDescription,
    url: canonicalUrl,
    touristType: "Solo female travellers",
    address: {
      "@type": "PostalAddress",
      addressLocality: dest.city,
      addressCountry: dest.country,
    },
  };

  // FAQPage JSON-LD is only valid when there's at least one FAQ.
  const faqJsonLd =
    dest.faqs && dest.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: dest.faqs.map((f) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationJsonLd) }}
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
          <Link href="/popular-cities" className="hover:underline">Destinations</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--navy)]">{dest.city}</span>
        </nav>
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

        {dest.knownFor && dest.knownFor.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              What {dest.city} is known for
            </h2>
            <ul className="space-y-2 text-[var(--navy-light)]">
              {dest.knownFor.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[var(--ocean-teal)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {dest.neighbourhoods && dest.neighbourhoods.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Where to stay – neighbourhood guide
            </h2>
            <div className="space-y-5">
              {dest.neighbourhoods.map((n) => (
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

        {dest.safetyTips && dest.safetyTips.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              Solo female safety tips for {dest.city}
            </h2>
            <ul className="space-y-2 text-[var(--navy-light)]">
              {dest.safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--ocean-teal)]">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {dest.gettingAround && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">
              Getting around safely
            </h2>
            <p className="text-sm text-[var(--navy-light)]">{dest.gettingAround}</p>
          </section>
        )}

        {dest.faqs && dest.faqs.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Frequently asked questions
            </h2>
            <dl className="space-y-5">
              {dest.faqs.map((f) => (
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

        {related.length > 0 && (
          <section className="mt-12 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
              Other safer stays for solo women
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/destinations/${r.slug}`}
                    className="block rounded-lg border border-[var(--sand)] p-4 transition-colors hover:border-[var(--ocean-teal)]"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--ocean-teal)]">
                      {r.country}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--navy)]">
                      {r.city} – {r.eventShortName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--navy-light)]">
                      {r.eventDateRange}
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
