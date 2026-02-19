"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  };

  const handleSearch = async () => {
    if (!checkin || !checkout) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    if (searchMode === "destination" && !placeId) {
      alert("Please select a destination from the suggestions.");
      return;
    }
    if (searchMode === "vibe" && !vibeQuery.trim()) {
      alert("Please enter a search description (e.g. romantic getaway in Paris).");
      return;
    }
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
          <div className="absolute inset-0 aspect-[9/16] w-full md:aspect-auto md:h-full">
            <img
              src="/Beautiful_empty_cozy_hotel_balcony_at_soft_golden.png"
              alt=""
              role="presentation"
              className="h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          </div>
        </div>
        {/* Gradient scrim for readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/40 via-[var(--navy)]/10 to-[var(--navy)]/50"
          aria-hidden
        />
        {/* Content overlay */}
        <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-12 md:py-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-10">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white drop-shadow-md md:text-[var(--ocean-teal)] md:drop-shadow-none">
                Safer Stays
              </p>
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl md:text-[var(--navy)] md:drop-shadow-none">
                You&apos;re capable. We&apos;ve got your back.
              </h1>
              <p className="text-lg text-white/95 drop-shadow-sm md:text-[var(--navy-light)] md:drop-shadow-none">
                Safety-first stays for women travelling solo in Western &amp; Central Europe. Find reassurance and stay in control.
              </p>
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
                onChange={(e) => setVibeQuery(e.target.value)}
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
                onChange={(e) => setCheckin(e.target.value)}
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
                onChange={(e) => setCheckout(e.target.value)}
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

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="w-full rounded-lg bg-[var(--ocean-teal)] px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-[var(--ocean-teal-light)] disabled:opacity-60"
          >
            {loading ? "Searching..." : "Find safer stays"}
          </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
