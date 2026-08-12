"use client";

import { Clock, Lamp, MessageSquareQuote } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";

const PROOF_POINTS = [
  { Icon: Clock, label: "Reception hours shown up front" },
  { Icon: Lamp, label: "Lighting and access details where properties list them" },
  { Icon: MessageSquareQuote, label: "Real guest reviews, including the critical ones" },
];

/**
 * The search bar is the hero. There is no background image on purpose: a
 * generated photo behind a dark scrim was the loudest thing on the page and
 * said nothing about the product.
 */
export function HomeHero() {
  return (
    <section className="bg-surface-inverse">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-teal-soft/70">
          For women travelling solo
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink-inverse sm:text-4xl md:text-5xl">
          Know what you&apos;re booking before you arrive.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-inverse/75 md:text-lg">
          Search hotels the way you&apos;d actually vet one: reception hours, how you get in after
          dark, where it sits in the city, and what it costs to change your mind.
        </p>

        <div className="mt-8">
          <SearchBar variant="hero" onDark />
        </div>

        <ul className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-7">
          {PROOF_POINTS.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-[0.875rem] text-ink-inverse/70">
              <Icon className="h-4 w-4 shrink-0 text-teal-soft/80" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
