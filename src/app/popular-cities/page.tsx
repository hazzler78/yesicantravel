"use client";

import Link from "next/link";
import Image from "next/image";
import { popularCities } from "@/data/popularCities";

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
  const params = new URLSearchParams({ aiSearch: "", checkin, checkout, adults: "1" });

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <Link
          href="/"
          className="mb-8 inline-block text-[var(--ocean-teal)] font-medium hover:underline"
        >
          ← Back to search
        </Link>

        <header className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--navy)] md:text-4xl">
            Popular Safe Cities
          </h1>
          <p className="text-lg text-[var(--navy-light)]">
            Stays reviewed by women travellers · 24/7 reception · Well-lit areas
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => {
            const searchParams = new URLSearchParams(params);
            searchParams.set("aiSearch", city.aiSearch);
            const href = `/results?${searchParams}`;
            return (
              <Link
                key={city.slug}
                href={href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--navy)]/10 bg-white shadow-lg shadow-[var(--navy)]/5 transition-shadow hover:shadow-xl"
              >
                <div className="relative h-40 w-full bg-gradient-to-br from-[var(--ocean-teal)]/20 to-[var(--navy)]/20">
                  <Image
                    src={city.image ?? "/Beautiful_empty_cozy_hotel_balcony_at_soft_golden.png"}
                    alt=""
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[var(--navy)]/30" />
                  <span className="absolute bottom-3 left-3 text-lg font-bold text-white drop-shadow-md">
                    {city.city}, {city.country}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="mb-3 text-[var(--navy-light)]">{city.description}</p>
                  <span className="mt-auto text-sm font-semibold text-[var(--ocean-teal)] group-hover:text-[var(--ocean-teal-light)]">
                    See safe stays →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-[var(--navy-light)]">
          <Link href="/" className="text-[var(--ocean-teal)] hover:underline">
            Yes I Can Travel
          </Link>{" "}
          – safety-first booking for women travelling solo.
        </p>
      </div>
    </div>
  );
}
