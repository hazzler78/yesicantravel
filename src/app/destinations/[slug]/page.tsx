import type { Metadata } from "next";
import Link from "next/link";
import { Check, Dot } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getDestinationBySlug,
  getAllDestinationSlugs,
  getRelatedDestinations,
} from "@/data/destinations";
import { formatStayWindow, getDefaultStayWindow } from "@/lib/stayDates";

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

// Pre-filled dates roll forward with the calendar, so this can't be built once.
export const revalidate = 3600;

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  // The hard-coded checkin/checkout on each destination were March 2026 dates,
  // so every CTA here pointed at a stay in the past.
  const stay = getDefaultStayWindow();
  const searchUrl = `/results?${new URLSearchParams({
    aiSearch: dest.aiSearch,
    checkin: stay.checkin,
    checkout: stay.checkout,
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
    <div className="bg-canvas">
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-muted">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/destinations" className="hover:underline">Destinations</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{dest.city}</span>
        </nav>
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            {dest.city}, {dest.country}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
            {dest.headline}
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
            {dest.subheadline}
          </p>
        </header>

        <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Why now?</h2>
          <p className="mb-4 rounded-control bg-teal-soft px-4 py-2.5 text-[0.9375rem] font-semibold text-ink">
            Dates pre-filled: {formatStayWindow(stay)}
          </p>
          <p className="mb-4 text-ink-muted">{dest.whyDemand}</p>
          <p className="text-sm font-medium text-teal">{dest.events}</p>
        </section>

        <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">How we help</h2>
          <ul className="space-y-2 text-ink-muted">
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
              Filter for rating, budget and free cancellation; see safety signals on each stay
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
              Neighbourhood safety tips and area guidance
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
              Free cancellation options so you stay flexible
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
              Stays reviewed and rated by women travellers
            </li>
          </ul>
        </section>

        {dest.knownFor && dest.knownFor.length > 0 && (
          <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              What {dest.city} is known for
            </h2>
            <ul className="space-y-2 text-ink-muted">
              {dest.knownFor.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Dot className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {dest.neighbourhoods && dest.neighbourhoods.length > 0 && (
          <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              Where to stay – neighbourhood guide
            </h2>
            <div className="space-y-5">
              {dest.neighbourhoods.map((n) => (
                <div key={n.name}>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {n.name}
                    </h3>
                    <span
                      className={
                        n.verdict === "recommended"
                          ? "rounded-full bg-positive-soft px-2 py-0.5 text-xs font-medium text-positive"
                          : "rounded-full bg-coral-soft px-2 py-0.5 text-xs font-medium text-coral"
                      }
                    >
                      {n.verdict === "recommended" ? "Recommended" : "Extra awareness"}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">{n.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {dest.safetyTips && dest.safetyTips.length > 0 && (
          <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              Solo female safety tips for {dest.city}
            </h2>
            <ul className="space-y-2 text-ink-muted">
              {dest.safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {dest.gettingAround && (
          <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              Getting around safely
            </h2>
            <p className="text-sm text-ink-muted">{dest.gettingAround}</p>
          </section>
        )}

        {dest.faqs && dest.faqs.length > 0 && (
          <section className="mb-10 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              Frequently asked questions
            </h2>
            <dl className="space-y-5">
              {dest.faqs.map((f) => (
                <div key={f.question}>
                  <dt className="mb-1 font-semibold text-ink">{f.question}</dt>
                  <dd className="text-sm text-ink-muted">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="rounded-card bg-surface-inverse p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-soft/70">
            Dates pre-filled · {formatStayWindow(stay)}
          </p>
          <p className="mb-4 font-display text-lg font-semibold text-ink-inverse">
            Ready to find your stay in {dest.city}?
          </p>
          <p className="mb-5 text-[0.9375rem] text-ink-inverse/70">
            You can change dates, travellers and filters on the results page.
          </p>
          <Link
            href={searchUrl}
            className="inline-flex min-h-[52px] items-center justify-center rounded-control bg-coral px-6 text-base font-semibold text-white transition-colors hover:bg-coral-hover"
          >
            Find safer stays in {dest.city}
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-12 rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              Other safer stays for solo women
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/destinations/${r.slug}`}
                    className="block rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-teal">
                      {r.country}
                    </p>
                    <p className="mt-1 font-semibold text-ink">{r.city}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{r.subheadline}</p>
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
