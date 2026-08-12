import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLinkableDestinations } from "@/data/destinations";
import { Card } from "@/components/ui/Card";

const BASE_URL = "https://yesicantravel.com";

export const metadata: Metadata = {
  title: "Destination guides – Safe stays for women travelling solo",
  description:
    "City guides written for women travelling alone: which neighbourhoods work as a base, how to get in from the airport, and what to watch for after dark.",
  openGraph: {
    title: "Destination guides for women travelling solo",
    description:
      "Neighbourhood-by-neighbourhood guidance, airport logistics and practical safety notes for each city.",
    url: `${BASE_URL}/destinations`,
  },
  alternates: { canonical: `${BASE_URL}/destinations` },
};

/**
 * Hub for the destination guides.
 *
 * These pages had no internal links pointing at them from anywhere on the
 * site — they existed only in the sitemap, which is the classic recipe for
 * "Discovered – currently not indexed".
 */
export default function DestinationsPage() {
  const destinations = getLinkableDestinations();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Destinations", item: `${BASE_URL}/destinations` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Destination guides",
    itemListElement: destinations.map((destination, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${destination.city}, ${destination.country}`,
      url: `${BASE_URL}/destinations/${destination.slug}`,
    })),
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
          <span className="text-ink">Destinations</span>
        </nav>

        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            City guides
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Destination guides
          </h1>
          <p className="mt-3 text-[0.9375rem] text-ink-muted md:text-base">
            Which neighbourhoods work as a base, how to get in from the airport without a stressful
            first hour, and where the streets thin out after dark. Written for travelling alone, not
            for a group.
          </p>
        </header>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <li key={destination.slug}>
              <Card as="article" className="flex h-full flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  {destination.country}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {destination.city}
                  </Link>
                </h2>
                {destination.neighbourhoods && destination.neighbourhoods.length > 0 && (
                  <p className="mt-2 text-[0.8125rem] text-ink-muted">
                    {destination.neighbourhoods.length} neighbourhoods reviewed
                  </p>
                )}
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {destination.subheadline}
                </p>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
                >
                  Read the {destination.city} guide
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[0.9375rem] text-ink-muted">
          Looking for a specific date instead?{" "}
          <Link href="/events" className="font-semibold text-teal hover:underline">
            Browse peak dates
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
