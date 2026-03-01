"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { fbqTrack } from "@/lib/metaPixel";

/** Simple inline icons for hero trust badges (no extra deps). */
function Icon24_7() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconReviewed() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function TrustSection() {
  return (
    <section className="bg-[var(--sand)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-wrap justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-3 text-[var(--navy)] text-base md:text-lg font-medium">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--coral)] shadow-sm">
              ✓
            </span>
            <span>Stays reviewed and rated by women travellers</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--navy)] text-base md:text-lg font-medium">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--coral)] shadow-sm">
              ☾
            </span>
            <span>Focus on well-lit areas, safe access and neighbourhood tips</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--navy)] text-base md:text-lg font-medium">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--coral)] shadow-sm">
              ★
            </span>
            <span>Handpicked places with strong guest ratings</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <div className="rounded-3xl border border-[var(--sand)] bg-[var(--background)] p-7 shadow-lg shadow-[var(--navy)]/5 transition-shadow hover:shadow-xl">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--navy)]">Safety-first filters</h2>
            <p className="text-[var(--navy-light)]">
              Filter for 24/7 staffed reception, women-friendly reviews, well-lit streets and safer neighbourhoods—so you&apos;re not guessing in a new city.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--sand)] bg-[var(--background)] p-7 shadow-lg shadow-[var(--navy)]/5 transition-shadow hover:shadow-xl">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--navy)]">Solo-friendly stays</h2>
            <p className="text-[var(--navy-light)]">
              From cosy single rooms to calm hotels near public transport, we highlight options that work especially well when you&apos;re travelling on your own.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--sand)] bg-[var(--background)] p-7 shadow-lg shadow-[var(--navy)]/5 transition-shadow hover:shadow-xl">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--navy)]">Support when you need it</h2>
            <p className="text-[var(--navy-light)]">
              Get practical guidance from our assistant about areas, routes and what to expect—so you can feel prepared before you even check in.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mx-auto max-w-3xl text-xl italic text-[var(--navy)]">
            &quot;I booked my first solo trip through Yes I Can Travel and felt calm from search to check-out. It&apos;s the first time a booking site really spoke to my safety.&quot;
          </p>
          <p className="mt-4 text-[var(--navy-light)]">– Sofia, 29, travelling alone in Spain</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"destination" | "vibe">("destination");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [vibeQuery, setVibeQuery] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [placeDisplay, setPlaceDisplay] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);
  const [places, setPlaces] = useState<Array<{ placeId: string; displayName: string; formattedAddress?: string }>>([]);
  const [showPlaces, setShowPlaces] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const debounce = useCallback((fn: () => void, ms: number) => {
    let t: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }, []);

  const fetchPlaces = useCallback(
    debounce(async () => {
      if (!destinationQuery.trim()) {
        setPlaces([]);
        return;
      }
      const res = await fetch(`/api/places?q=${encodeURIComponent(destinationQuery)}`);
      const json = await res.json();
      setPlaces(json.data ?? []);
      setShowPlaces(true);
    }, 300),
    [destinationQuery, debounce]
  );

  const selectPlace = (p: { placeId: string; displayName: string; formattedAddress?: string }) => {
    setPlaceId(p.placeId);
    setPlaceDisplay(p.displayName);
    setDestinationQuery(p.displayName);
    setShowPlaces(false);
    setFormError(null);
  };

  const handleSearch = async () => {
    setFormError(null);
    if (!checkin || !checkout) {
      setFormError("Välj in- och utcheckningsdatum för att söka.");
      return;
    }
    if (searchMode === "destination" && !placeId) {
      setFormError("Välj en destination från förslagen (t.ex. Paris, Berlin) eller byt till \"Search by vibe\".");
      return;
    }
    if (searchMode === "vibe" && !vibeQuery.trim()) {
      setFormError("Beskriv din idéella vistelse (t.ex. centralt, välbelyst område).");
      return;
    }
    track("search_submit", {
      mode: searchMode,
      hasPlaceId: Boolean(placeId),
      hasVibeQuery: Boolean(vibeQuery.trim()),
    });
    fbqTrack("Search", {
      search_mode: searchMode,
      destination_set: Boolean(placeId),
      has_vibe_query: Boolean(vibeQuery.trim()),
    });
    setLoading(true);
    const params = new URLSearchParams({
      checkin,
      checkout,
      adults: String(guests),
    });
    if (searchMode === "destination") {
      params.set("placeId", placeId);
    } else {
      params.set("aiSearch", vibeQuery.trim());
    }
    router.push(`/results?${params}`);
    setLoading(false);
  };

  const minCheckin = new Date().toISOString().slice(0, 10);
  const minCheckout = checkin ? new Date(new Date(checkin).getTime() + 86400000).toISOString().slice(0, 10) : minCheckin;

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      {/* Hero: image as background with text and form overlaid */}
      <header className="relative min-h-screen w-full overflow-hidden">
        {/* Image layer */}
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              src="/Beautiful_empty_cozy_hotel_balcony_at_soft_golden.png"
              alt=""
              role="presentation"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
        {/* Gradient scrim for readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/40 via-[var(--navy)]/10 to-[var(--navy)]/50"
          aria-hidden
        />
        {/* Logo top-left */}
        <div className="absolute left-4 top-4 z-20 md:left-6 md:top-6">
          <Link href="/" className="block" aria-label="Yes I Can Travel – startsida">
            <Image
              src="/logo.png"
              alt=""
              width={140}
              height={40}
              className="h-8 w-auto object-contain drop-shadow-md md:h-10"
              priority
            />
          </Link>
        </div>
        {/* Content overlay: on mobile use top padding so content starts below logo; on desktop center */}
        <div className="relative z-10 flex min-h-screen flex-col px-6 pt-20 pb-10 md:justify-center md:pt-6 md:py-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-6 md:mb-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white drop-shadow-md">
                Safer solo stays worldwide
              </p>
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl">
                Safer places to stay, picked for women travelling solo.
              </h1>
              <p className="mb-6 text-lg text-white/95 drop-shadow-sm md:mb-8">
                Safety-first stays across the world—so you can feel prepared, supported, and in control on every trip.
              </p>
              {/* Trust badges above the fold */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-white/95 drop-shadow-sm sm:gap-6 md:justify-start">
                <span className="flex items-center gap-2 text-sm font-medium md:text-base">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                    <Icon24_7 />
                  </span>
                  24/7 reception
                </span>
                <span className="flex items-center gap-2 text-sm font-medium md:text-base">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                    <IconReviewed />
                  </span>
                  Reviewed by women travellers
                </span>
                <span className="flex items-center gap-2 text-sm font-medium md:text-base">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                    <IconShield />
                  </span>
                  Safer neighbourhoods &amp; well-lit areas
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--navy)]/10 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setSearchMode("destination")}
              className={`rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
                searchMode === "destination"
                  ? "bg-[var(--ocean-teal)] text-white"
                  : "bg-[var(--sand)] text-[var(--navy-light)] hover:bg-[var(--sand)]/80"
              }`}
            >
              Search by destination
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("vibe")}
              className={`rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
                searchMode === "vibe"
                  ? "bg-[var(--ocean-teal)] text-white"
                  : "bg-[var(--sand)] text-[var(--navy-light)] hover:bg-[var(--sand)]/80"
              }`}
            >
              Search by vibe
            </button>
          </div>

          {searchMode === "destination" ? (
            <div className="relative mb-6">
              <label htmlFor="destination" className="mb-2 block text-base font-medium text-[var(--navy)]">
                Where to?
              </label>
              <input
                id="destination"
                type="text"
                value={destinationQuery}
                onChange={(e) => {
                  setDestinationQuery(e.target.value);
                  setPlaceId("");
                  setFormError(null);
                  fetchPlaces();
                }}
                onFocus={() => places.length > 0 && setShowPlaces(true)}
                placeholder="e.g. Paris, Berlin, Barcelona, Amsterdam..."
                aria-label="Destination"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] placeholder-[var(--navy-light)]/60 focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
              />
              {showPlaces && places.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-lg border border-[var(--navy)]/10 bg-white shadow-lg" role="listbox">
                  {places.map((p) => (
                    <li key={p.placeId} role="option">
                      <button
                        type="button"
                        onClick={() => selectPlace(p)}
                        className="block w-full px-4 py-3.5 text-left text-[var(--navy)] hover:bg-[var(--sand)]"
                      >
                        {p.displayName}
                        {p.formattedAddress && (
                          <span className="ml-2 text-[var(--navy-light)]">({p.formattedAddress})</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="vibe" className="mb-2 block text-base font-medium text-[var(--navy)]">
                Describe your ideal stay
              </label>
              <input
                id="vibe"
                type="text"
                value={vibeQuery}
                onChange={(e) => { setVibeQuery(e.target.value); setFormError(null); }}
                placeholder="e.g. central, well-lit area, quiet neighbourhood..."
                aria-label="Describe your ideal stay"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] placeholder-[var(--navy-light)]/60 focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
              />
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="checkin" className="mb-2 block text-base font-medium text-[var(--navy)]">
                Check-in
              </label>
              <input
                id="checkin"
                type="date"
                value={checkin}
                onChange={(e) => { setCheckin(e.target.value); setFormError(null); }}
                min={minCheckin}
                aria-label="Check-in date"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
              />
            </div>
            <div>
              <label htmlFor="checkout" className="mb-2 block text-base font-medium text-[var(--navy)]">
                Check-out
              </label>
              <input
                id="checkout"
                type="date"
                value={checkout}
                onChange={(e) => { setCheckout(e.target.value); setFormError(null); }}
                min={minCheckout}
                aria-label="Check-out date"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
              />
            </div>
            <div>
              <label htmlFor="guests" className="mb-2 block text-base font-medium text-[var(--navy)]">
                Travellers
              </label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                aria-label="Number of guests"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "traveller" : "travellers"}</option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
              <p className="mb-4 text-sm font-medium text-red-600" role="alert">
                {formError}
              </p>
            )}
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="w-full rounded-lg bg-[var(--coral)] px-6 py-4 text-xl font-bold text-white shadow-lg shadow-[var(--navy)]/20 transition-colors hover:bg-[var(--coral-light)] hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Searching..." : "Find Safer Stays for Women"}
          </button>
            <Link
              href="/destinations/milan"
              className="mt-4 flex w-full items-center justify-center rounded-lg border-2 border-white/80 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              See Popular Cities
            </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <TrustSection />
      </main>
    </div>
  );
}
