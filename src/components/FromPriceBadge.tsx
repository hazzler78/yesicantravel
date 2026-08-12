"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/components/currency/CurrencyControl";
import { formatHeadlinePrice } from "@/lib/formatStayPrice";

type FromPriceBadgeProps = {
  /** Path without query, e.g. /api/destinations/london/min-price */
  endpoint: string;
  detail?: string;
};

/**
 * Client "from" price. Currency can change in the header without a navigation,
 * so this has to refetch — the page itself stays a Server Component.
 */
export function FromPriceBadge({ endpoint, detail }: FromPriceBadgeProps) {
  const currency = useCurrency();
  const [data, setData] = useState<{
    minPrice: number | null;
    currency: string;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    fetch(`${endpoint}?currency=${encodeURIComponent(currency)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("min-price failed"))))
      .then((json: { error?: string; minPrice?: number | null; currency?: string }) => {
        if (cancelled) return;
        if (json.error && json.minPrice == null) {
          setError(true);
          return;
        }
        setData({
          minPrice: json.minPrice ?? null,
          currency: json.currency ?? currency,
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, currency]);

  if (error) return null;
  if (!data) {
    return (
      <p
        className="mt-3 h-10 w-72 max-w-full rounded-control bg-teal-soft/60"
        aria-hidden
      />
    );
  }
  if (data.minPrice == null) return null;

  const formatted = formatHeadlinePrice(data.minPrice, data.currency || currency);

  return (
    <p
      className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-control bg-teal-soft px-3 py-2 text-[0.9375rem] text-ink"
      aria-live="polite"
    >
      <span className="tnum font-semibold">From {formatted} per night</span>
      {detail ? <span className="text-ink-muted">{detail}</span> : null}
    </p>
  );
}
