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

  const formatted = (() => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: data.currency || "EUR",
        maximumFractionDigits: 0,
      }).format(data.minPrice);
    } catch {
      return `${data.minPrice} ${data.currency}`;
    }
  })();

  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-control bg-teal-soft px-3 py-2 text-[0.9375rem] text-ink">
      <span className="tnum font-semibold">From {formatted} per night</span>
      <span className="text-ink-muted">
        during {eventShortName}
        {venueNotes ? ` · near ${venueNotes}` : ""}
      </span>
    </p>
  );
}
