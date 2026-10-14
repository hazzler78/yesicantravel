"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularCities } from "@/data/popularCities";
import { getDestinationBySlug } from "@/data/destinations";
import { Card } from "@/components/ui/Card";
import { CityCardPhoto } from "@/components/cities/CityCardPhoto";
import { LeadMagnetHomeCta } from "@/components/home/LeadMagnetHomeCta";
import { getCityPhotoBySlug } from "@/lib/cityPhotos";
import { getDefaultStayWindow } from "@/lib/stayDates";

export default function PopularCitiesPage() {
  const { checkin, checkout } = getDefaultStayWindow();

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
            Read the area guide to work out where you want to be, then open a search with dates
            set to a two-night trip a couple of weeks out. Change anything from there.
          </p>
        </header>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city, index) => {
            const href = `/results?${new URLSearchParams({
              placeId: city.placeId,
              checkin,
              checkout,
              adults: "1",
            })}`;
            // The search link lives under /results, which robots.txt disallows.
            // Without a guide link the card is a dead end for crawlers, and the
            // city page is what ranks for "safe hotels in <city>" anyway.
            const guide = getDestinationBySlug(city.slug);
            const photo = getCityPhotoBySlug(city.slug);
            return (
              <li key={city.slug}>
                <Card as="article" className="flex h-full flex-col overflow-hidden p-0">
                  {photo && (
                    <CityCardPhoto
                      src={photo.src}
                      alt={photo.alt}
                      priority={index < 3}
                      className="rounded-t-[inherit]"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {city.country}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                      {guide ? (
                        <Link
                          href={`/destinations/${guide.slug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {city.city}
                        </Link>
                      ) : (
                        city.city
                      )}
                    </h2>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                      {city.description}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      {guide && (
                        <Link
                          href={`/destinations/${guide.slug}`}
                          className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal underline-offset-4 hover:underline"
                        >
                          {city.city} safety guide
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </Link>
                      )}
                      <Link
                        href={href}
                        className="text-[0.9375rem] text-ink-muted underline-offset-4 hover:underline"
                      >
                        See stays in {city.city}
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <LeadMagnetHomeCta embedded />
      </div>
    </div>
  );
}
