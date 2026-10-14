"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularCities } from "@/data/popularCities";
import { getDestinationBySlug } from "@/data/destinations";
import type { MinPricesResponse } from "@/app/api/popular-cities/min-prices/route";
import { CityCardPhoto } from "@/components/cities/CityCardPhoto";
import { SectionHeading } from "@/components/ui/Card";
import { useCurrency } from "@/components/currency/CurrencyControl";
import { getCityPhotoBySlug } from "@/lib/cityPhotos";
import { formatHeadlinePrice } from "@/lib/formatStayPrice";
import { formatIsoDateShort } from "@/lib/stayDates";

function formatDateRange(checkin: string, checkout: string) {
  return `${formatIsoDateShort(checkin)} – ${formatIsoDateShort(checkout)}`;
}

export function PopularCitiesStrip() {
  const currency = useCurrency();
  const [prices, setPrices] = useState<MinPricesResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPrices(null);
    fetch(`/api/popular-cities/min-prices?currency=${encodeURIComponent(currency)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("min-prices failed"))))
      .then((data: MinPricesResponse) => {
        if (!cancelled) setPrices(data);
      })
      .catch(() => {
        // Prices are optional; the cards still work as destination links.
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <SectionHeading
          eyebrow="Start here"
          title="Cities women ask us about most"
          description={
            prices
              ? `Lowest nightly price we can currently find for ${formatDateRange(
                  prices.checkin,
                  prices.checkout
                )}, one traveller. Change the dates on the next page.`
              : "Each card opens a search of the whole city. Change the dates on the next page."
          }
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => {
            const price = prices?.cities?.[city.slug];
            const href = prices
              ? `/results?${new URLSearchParams({
                  placeId: city.placeId,
                  checkin: prices.checkin,
                  checkout: prices.checkout,
                  adults: String(prices.adults),
                })}`
              : `/results?${new URLSearchParams({ placeId: city.placeId })}`;

            // The price card points into /results, which robots.txt disallows,
            // so it carries no crawl signal. The guide link below it is the
            // homepage's only route to the city pages.
            const guide = getDestinationBySlug(city.slug);
            const photo = getCityPhotoBySlug(city.slug);

            return (
              <li key={city.slug} className="flex flex-col">
                <Link
                  href={href}
                  className="group flex items-center gap-3 overflow-hidden rounded-card border border-border bg-surface pr-4 transition-colors hover:border-border-strong hover:bg-surface-muted"
                >
                  {photo && (
                    <CityCardPhoto
                      src={photo.src}
                      alt=""
                      size="strip"
                      className="rounded-l-[inherit]"
                    />
                  )}
                  <span className="min-w-0 flex-1 py-3">
                    <span className="block truncate font-display text-lg font-semibold text-ink">
                      {city.city}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-muted">
                      {price?.perNight != null ? (
                        <>
                          {city.country} · from{" "}
                          <span className="tnum font-semibold text-ink">
                            {formatHeadlinePrice(price.perNight, price.currency)}
                          </span>{" "}
                          a night
                        </>
                      ) : (
                        city.country
                      )}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal"
                    aria-hidden
                  />
                </Link>
                {guide && (
                  <Link
                    href={`/destinations/${guide.slug}`}
                    className="mt-1.5 self-start px-1 text-[0.8125rem] font-medium text-teal underline-offset-4 hover:underline"
                  >
                    Is {city.city} safe for solo women?
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
