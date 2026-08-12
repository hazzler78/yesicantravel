"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularCities } from "@/data/popularCities";
import { Card } from "@/components/ui/Card";

/** Default check-in 14 days from now, checkout +2 nights for result links */
function getDefaultDates() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 14);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 2);
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

export default function PopularCitiesPage() {
  const { checkin, checkout } = getDefaultDates();

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            Where women travel solo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Popular cities
          </h1>
          <p className="mt-3 text-[0.9375rem] text-ink-muted md:text-base">
            Each link opens a search already pointed at central, well-connected areas, with dates
            set to a two-night trip a couple of weeks out. Change anything from there.
          </p>
        </header>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => {
            const href = `/results?${new URLSearchParams({
              placeId: city.placeId,
              checkin,
              checkout,
              adults: "1",
            })}`;
            return (
              <li key={city.slug}>
                <Card as="article" className="flex h-full flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {city.country}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-ink">{city.city}</h2>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {city.description}
                  </p>
                  <Link
                    href={href}
                    className="group mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
                  >
                    See stays in {city.city}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
