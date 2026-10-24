"use client";

import { SearchBar } from "@/components/search/SearchBar";
import { Card } from "@/components/ui/Card";
import { getDefaultStayWindow } from "@/lib/stayDates";

type ContentSearchCtaProps = {
  city: string;
  placeId?: string;
  aiSearch?: string;
  /** Funnel attribution, e.g. destination_berlin or blog_amsterdam-night. */
  trackingSource: string;
  className?: string;
};

/**
 * Embeds the main SearchBar on content pages with city + default dates prefilled.
 */
export function ContentSearchCta({
  city,
  placeId,
  aiSearch,
  trackingSource,
  className = "",
}: ContentSearchCtaProps) {
  const stay = getDefaultStayWindow();
  const useVibe = !placeId && Boolean(aiSearch);

  return (
    <Card className={`overflow-visible p-5 sm:p-6 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
        Search stays
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-ink sm:text-xl">
        Find safer stays in {city}
      </h2>
      <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
        Reception hours, cancellation terms, and safety signals — before you book. Dates are
        pre-filled; change them anytime.
      </p>
      <div className="mt-4">
        <SearchBar
          variant="compact"
          initialMode={useVibe ? "vibe" : "destination"}
          initialDestination={city}
          initialPlaceId={placeId ?? ""}
          initialVibe={aiSearch ?? ""}
          initialCheckin={stay.checkin}
          initialCheckout={stay.checkout}
          trackingSource={trackingSource}
          trackingCity={city}
        />
      </div>
    </Card>
  );
}
