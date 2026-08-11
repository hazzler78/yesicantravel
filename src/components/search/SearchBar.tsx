"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, Sparkles, Users } from "lucide-react";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { trackFunnelEvent } from "@/lib/funnelEvents";

type Place = { placeId: string; displayName: string; formattedAddress?: string };

type SearchMode = "destination" | "vibe";

export type SearchBarProps = {
  /** "hero" is the large homepage bar; "compact" sits in the results sub-header. */
  variant?: "hero" | "compact";
  initialMode?: SearchMode;
  initialDestination?: string;
  initialPlaceId?: string;
  initialVibe?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  initialGuests?: number;
  /** Lightens the helper text below the bar when it sits on the dark hero band. */
  onDark?: boolean;
  className?: string;
};

function isoDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextDay(iso: string) {
  return new Date(new Date(iso).getTime() + 86_400_000).toISOString().slice(0, 10);
}

/** How far ahead properties will quote. Also caps the native date picker's year field. */
const BOOKING_WINDOW_DAYS = 730;

function isBookableDate(iso: string, earliest: string, latest: string) {
  const time = new Date(iso).getTime();
  return (
    Number.isFinite(time) &&
    time >= new Date(earliest).getTime() &&
    time <= new Date(latest).getTime()
  );
}

export function SearchBar({
  variant = "hero",
  initialMode = "destination",
  initialDestination = "",
  initialPlaceId = "",
  initialVibe = "",
  initialCheckin,
  initialCheckout,
  initialGuests = 1,
  onDark = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const reactId = useId();
  const listboxId = `${reactId}-places`;

  const [mode, setMode] = useState<SearchMode>(initialMode);
  // Null until typed, so a destination label that resolves after mount still shows.
  const [typedDestination, setTypedDestination] = useState<string | null>(
    initialDestination || null
  );
  const destination = typedDestination ?? initialDestination;
  const setDestination = setTypedDestination;
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [vibe, setVibe] = useState(initialVibe);
  const [checkin, setCheckin] = useState(initialCheckin ?? isoDaysFromNow(14));
  const [checkout, setCheckout] = useState(initialCheckout ?? isoDaysFromNow(16));
  const [guests, setGuests] = useState(initialGuests);

  const [places, setPlaces] = useState<Place[]>([]);
  const [showPlaces, setShowPlaces] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const minCheckin = isoDaysFromNow(0);
  const maxDate = isoDaysFromNow(BOOKING_WINDOW_DAYS);
  const minCheckout = checkin ? nextDay(checkin) : minCheckin;

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Close the suggestion list when focus or a click lands outside the bar.
  useEffect(() => {
    if (!showPlaces) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setShowPlaces(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showPlaces]);

  const queryPlaces = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setPlaces([]);
      setShowPlaces(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(value)}`);
        if (!res.ok) return;
        const json = await res.json();
        setPlaces((json.data ?? []) as Place[]);
        setShowPlaces(true);
        setActiveIndex(-1);
      } catch {
        // Autocomplete is a convenience; searching by typed text still works.
      }
    }, 250);
  };

  const selectPlace = (place: Place) => {
    setPlaceId(place.placeId);
    setDestination(place.displayName);
    setShowPlaces(false);
    setActiveIndex(-1);
    setFormError(null);
  };

  const onDestinationKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPlaces || places.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % places.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? places.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectPlace(places[activeIndex]);
    } else if (event.key === "Escape") {
      setShowPlaces(false);
      setActiveIndex(-1);
    }
  };

  const submit = async () => {
    setFormError(null);
    if (!checkin || !checkout) {
      setFormError("Please choose your check-in and check-out dates.");
      return;
    }
    // Typing straight into a native date field can produce a year like 12026,
    // which sorts before a four-digit year and would slip past a string compare.
    if (!isBookableDate(checkin, minCheckin, maxDate) || !isBookableDate(checkout, minCheckin, maxDate)) {
      setFormError("Please pick dates within the next two years.");
      return;
    }
    if (new Date(checkout).getTime() <= new Date(checkin).getTime()) {
      setFormError("Check-out has to be after check-in.");
      return;
    }

    let resolvedPlaceId = placeId;
    if (mode === "destination" && !resolvedPlaceId) {
      // The visitor typed a city but never clicked a suggestion — resolve the top hit.
      if (places.length > 0) {
        selectPlace(places[0]);
        resolvedPlaceId = places[0].placeId;
      } else if (destination.trim()) {
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(destination.trim())}`);
          const json = await res.json();
          const first = (json.data ?? [])[0] as Place | undefined;
          if (first?.placeId) {
            selectPlace(first);
            resolvedPlaceId = first.placeId;
          }
        } catch {
          // Falls through to the validation message below.
        }
      }
    }

    if (mode === "destination" && !resolvedPlaceId) {
      setFormError("Pick a destination from the suggestions, or describe your ideal stay instead.");
      return;
    }
    if (mode === "vibe" && !vibe.trim()) {
      setFormError("Describe the stay you're looking for, e.g. central and well-lit.");
      return;
    }

    trackFunnelEvent("Search", {
      mode,
      hasPlaceId: Boolean(resolvedPlaceId),
      hasVibeQuery: Boolean(vibe.trim()),
    });
    const eventId = generateMetaEventId("search");
    const metaSearchData = {
      search_mode: mode,
      destination_set: Boolean(resolvedPlaceId),
      has_vibe_query: Boolean(vibe.trim()),
    };
    fbqTrack("Search", metaSearchData, { eventId });
    void sendMetaCapiEvent({
      eventName: "Search",
      eventId,
      eventSourceUrl: window.location.href,
      customData: metaSearchData,
    });

    setLoading(true);
    const params = new URLSearchParams({ checkin, checkout, adults: String(guests) });
    if (mode === "destination") {
      params.set("placeId", resolvedPlaceId);
    } else {
      params.set("aiSearch", vibe.trim());
    }
    router.push(`/results?${params}`);
    setLoading(false);
  };

  const compact = variant === "compact";
  const fieldPadding = compact ? "px-3 py-2" : "px-4 py-3";
  const inputClass =
    "w-full min-w-0 border-0 bg-transparent p-0 text-[0.9375rem] font-medium text-ink placeholder-ink-muted/70 focus:outline-none focus:ring-0";
  const labelClass = "flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted";


  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <div
        className={`flex flex-col overflow-visible rounded-card border border-border bg-surface md:flex-row md:items-stretch ${
          compact ? "shadow-card" : "shadow-pop"
        }`}
      >
        <div className={`relative min-w-0 flex-1 border-b border-border md:border-b-0 md:border-r ${fieldPadding}`}>
          <label htmlFor={`${reactId}-where`} className={labelClass}>
            {mode === "destination" ? (
              <MapPin className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            )}
            {mode === "destination" ? "Where to" : "Your ideal stay"}
          </label>
          {mode === "destination" ? (
            <input
              id={`${reactId}-where`}
              type="text"
              role="combobox"
              aria-expanded={showPlaces && places.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
              autoComplete="off"
              value={destination}
              placeholder="City, region or landmark"
              className={`${inputClass} mt-1`}
              onChange={(event) => {
                setDestination(event.target.value);
                setPlaceId("");
                setFormError(null);
                queryPlaces(event.target.value);
              }}
              onFocus={() => places.length > 0 && setShowPlaces(true)}
              onKeyDown={onDestinationKeyDown}
            />
          ) : (
            <input
              id={`${reactId}-where`}
              type="text"
              value={vibe}
              placeholder="Central, well-lit, quiet street"
              className={`${inputClass} mt-1`}
              onChange={(event) => {
                setVibe(event.target.value);
                setFormError(null);
              }}
            />
          )}

          {mode === "destination" && showPlaces && places.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Destination suggestions"
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-card border border-border bg-surface py-1 shadow-pop"
            >
              {places.map((place, index) => (
                <li
                  key={place.placeId}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectPlace(place)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left ${
                      index === activeIndex ? "bg-surface-muted" : ""
                    }`}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.9375rem] font-medium text-ink">
                        {place.displayName}
                      </span>
                      {place.formattedAddress && (
                        <span className="block truncate text-[0.8125rem] text-ink-muted">
                          {place.formattedAddress}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`min-w-0 border-b border-border md:w-40 md:border-b-0 md:border-r ${fieldPadding}`}>
          <label htmlFor={`${reactId}-checkin`} className={labelClass}>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Check-in
          </label>
          <input
            id={`${reactId}-checkin`}
            type="date"
            value={checkin}
            min={minCheckin}
            max={maxDate}
            className={`${inputClass} tnum mt-1`}
            onChange={(event) => {
              setCheckin(event.target.value);
              setFormError(null);
              if (checkout && event.target.value && checkout <= event.target.value) {
                setCheckout(nextDay(event.target.value));
              }
            }}
          />
        </div>

        <div className={`min-w-0 border-b border-border md:w-40 md:border-b-0 md:border-r ${fieldPadding}`}>
          <label htmlFor={`${reactId}-checkout`} className={labelClass}>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Check-out
          </label>
          <input
            id={`${reactId}-checkout`}
            type="date"
            value={checkout}
            min={minCheckout}
            max={maxDate}
            className={`${inputClass} tnum mt-1`}
            onChange={(event) => {
              setCheckout(event.target.value);
              setFormError(null);
            }}
          />
        </div>

        <div className={`min-w-0 border-b border-border md:w-36 md:border-b-0 md:border-r ${fieldPadding}`}>
          <label htmlFor={`${reactId}-guests`} className={labelClass}>
            <Users className="h-3.5 w-3.5" aria-hidden />
            Travellers
          </label>
          <select
            id={`${reactId}-guests`}
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className={`${inputClass} mt-1 cursor-pointer appearance-none`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "traveller" : "travellers"}
              </option>
            ))}
          </select>
        </div>

        <div className={compact ? "p-2" : "p-2.5"}>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-control bg-coral font-semibold text-white transition-colors hover:bg-coral-hover disabled:opacity-70 md:w-auto ${
              compact ? "h-10 px-4 text-[0.9375rem]" : "h-full min-h-[48px] px-6 text-base"
            }`}
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "destination" ? "vibe" : "destination"));
            setFormError(null);
            setShowPlaces(false);
          }}
          className={`inline-flex items-center gap-1.5 text-[0.8125rem] font-medium underline-offset-4 hover:underline ${
            onDark ? "text-ink-inverse/70 hover:text-ink-inverse" : "text-ink-muted hover:text-ink"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {mode === "destination" ? "Or describe your ideal stay" : "Search by destination instead"}
        </button>
        {formError && (
          <p
            role="alert"
            className={`text-[0.8125rem] font-medium ${onDark ? "text-coral-soft" : "text-coral"}`}
          >
            {formError}
          </p>
        )}
      </div>
    </div>
  );
}
