"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularCities } from "@/data/popularCities";
import type { MinPricesResponse } from "@/app/api/popular-cities/min-prices/route";
import { SectionHeading } from "@/components/ui/Card";

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDateRange(checkin: string, checkout: string) {
  try {
    const from = new Date(checkin);
    const to = new Date(checkout);
    const day = (date: Date) =>
      date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${day(from)} – ${day(to)}`;
  } catch {
    return `${checkin} – ${checkout}`;
  }
}

export function PopularCitiesStrip() {
  const [prices, setPrices] = useState<MinPricesResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/popular-cities/min-prices")
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
  }, []);

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
                      {price?.perNight != null ? (
                        <>
                          {city.country} · from{" "}
                          <span className="tnum font-semibold text-ink">
                            {formatPrice(price.perNight, price.currency)}
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
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
