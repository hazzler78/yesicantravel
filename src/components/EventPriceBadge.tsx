"use client";

import { useEffect, useState } from "react";

interface EventPriceBadgeProps {
  slug: string;
  eventShortName: string;
  venueNotes?: string;
}

export default function EventPriceBadge({ slug, eventShortName, venueNotes }: EventPriceBadgeProps) {
  const [data, setData] = useState<{
    minPrice: number | null;
    currency: string;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${encodeURIComponent(slug)}/min-price`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error && json.minPrice == null) {
          setError(true);
          return;
        }
        setData({
          minPrice: json.minPrice ?? null,
          currency: json.currency ?? "EUR",
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error || !data) return null;
  if (data.minPrice == null) return null;

  const symbol = data.currency === "EUR" ? "€" : data.currency === "USD" ? "$" : data.currency + " ";

  return (
    <p className="mb-4 rounded-lg bg-[var(--ocean-teal)]/10 px-4 py-3 text-lg font-bold text-[var(--navy)]">
      Hotels from {symbol}
      {data.minPrice.toLocaleString()}/night
      {venueNotes ? ` near ${venueNotes}` : ""} – limited availability for {eventShortName}!
    </p>
  );
}
