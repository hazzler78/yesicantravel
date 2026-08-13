"use client";

import dynamic from "next/dynamic";
import { ExternalLink, MapPin, Navigation, TrainFront } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { extractLatLng, externalMapLinks } from "@/lib/geo";
import { formatDistance, type NearestTransit } from "@/lib/staySignals";

const StayMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[16rem] items-center justify-center bg-surface-muted text-[0.9375rem] text-ink-muted">
      Loading map…
    </div>
  ),
});

type HotelLocationCardProps = {
  name: string;
  address?: string;
  city?: string;
  location?: unknown;
  nearestTransit?: NearestTransit;
  className?: string;
};

const mapLinkClassName =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-border bg-surface px-3 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-border-strong hover:bg-surface-muted";

export function HotelLocationCard({
  name,
  address,
  city,
  location,
  nearestTransit,
  className = "",
}: HotelLocationCardProps) {
  const coords = extractLatLng(location);
  const query = [name, address, city].filter(Boolean).join(", ");
  const links = externalMapLinks({
    lat: coords?.lat,
    lng: coords?.lng,
    name,
    address,
    query: coords ? undefined : query,
  });

  if (!coords && !address) return null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-5">
        <h2 className="font-display text-base font-semibold text-ink">Where you&apos;ll stay</h2>
        {address && (
          <p className="mt-2 flex items-start gap-1.5 text-[0.9375rem] text-ink">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            <span>
              {address}
              {city && !address.toLowerCase().includes(city.toLowerCase()) ? `, ${city}` : ""}
            </span>
          </p>
        )}
        {nearestTransit && (
          <p className="mt-2 flex items-start gap-1.5 text-[0.9375rem] text-ink-muted">
            <TrainFront className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            <span>
              <span className="tnum font-medium text-ink">{formatDistance(nearestTransit.distanceKm)}</span> to{" "}
              {nearestTransit.name}
            </span>
          </p>
        )}
        <p className="mt-2 text-xs text-ink-muted">
          Pin is the address the property publishes. Open it in your maps app to check the walk from the station
          and how the street looks after dark.
        </p>
      </div>

      {coords ? (
        <div className="relative h-64 w-full overflow-hidden bg-surface-muted sm:h-80">
          <StayMap
            variant="stay"
            placeDetails={{ location: { latitude: coords.lat, longitude: coords.lng } }}
            hotels={[
              {
                id: "stay",
                name,
                lat: coords.lat,
                lng: coords.lng,
                address,
              },
            ]}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <div className="mx-5 mb-5 rounded-control bg-surface-muted px-4 py-6 text-center text-[0.9375rem] text-ink-muted">
          We don&apos;t have a map pin for this stay yet. Use the address above in Google or Apple Maps.
        </div>
      )}

      {links && (
        <div className="flex flex-wrap gap-2 border-t border-border p-5">
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            className={mapLinkClassName}
            aria-label="Open this stay in Google Maps (opens in a new tab)"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Google Maps
          </a>
          <a
            href={links.apple}
            target="_blank"
            rel="noopener noreferrer"
            className={mapLinkClassName}
            aria-label="Open this stay in Apple Maps (opens in a new tab)"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Apple Maps
          </a>
          <a
            href={links.directions}
            target="_blank"
            rel="noopener noreferrer"
            className={mapLinkClassName}
            aria-label="Get directions to this stay (opens in a new tab)"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            Directions
          </a>
        </div>
      )}
    </Card>
  );
}
