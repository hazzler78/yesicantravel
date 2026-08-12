"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularCities } from "@/data/popularCities";
import { SectionHeading } from "@/components/ui/Card";

type MinPrice = { minPrice: number | null; currency: string };

function defaultSearchParams() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 14);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 2);
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

function formatPrice(price: MinPrice | undefined) {
  if (!price || price.minPrice == null) return null;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: price.currency || "EUR",
      maximumFractionDigits: 0,
    }).format(price.minPrice);
  } catch {
    return `${price.minPrice} ${price.currency}`;
  }
}

export function PopularCitiesStrip() {
  const [minPrices, setMinPrices] = useState<Record<string, MinPrice> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/popular-cities/min-prices")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("min-prices failed"))))
      .then((data: Record<string, MinPrice>) => {
        if (!cancelled) setMinPrices(data);
      })
      .catch(() => {
        if (!cancelled) setMinPrices({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { checkin, checkout } = defaultSearchParams();

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <SectionHeading
          eyebrow="Start here"
          title="Cities women ask us about most"
          description="Pre-filtered searches for well-connected, central areas. Dates default to a two-night trip a couple of weeks out — change them any time."
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => {
            const href = `/results?${new URLSearchParams({
              aiSearch: city.aiSearch,
              checkin,
              checkout,
              adults: "1",
            })}`;
            const price = formatPrice(minPrices?.[city.slug]);

            return (
              <li key={city.slug}>
                <Link
                  href={href}
                  className="group flex h-full items-center justify-between gap-4 rounded-card border border-border bg-surface px-4 py-3.5 transition-colors hover:border-border-strong hover:bg-surface-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-semibold text-ink">
                      {city.city}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-muted">
                      {price ? (
                        <>
                          {city.country} · from <span className="tnum font-semibold text-ink">{price}</span> per night
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
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
