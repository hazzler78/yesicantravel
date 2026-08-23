"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { STAY_TYPE_ORDER, STAY_TYPES, type StayType } from "@/lib/stayTypes";

type ExploreHotel = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hotelTypeId?: number | null;
  rating?: number;
  city?: string;
  address?: string;
};

const CARTO_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Default check-in 14 days out, 2 nights — same as the homepage search. */
function defaultDates() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 14);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 2);
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

/** Rough meters per degree of latitude/longitude at a given latitude. */
function boundsRadiusMeters(bounds: L.LatLngBounds): number {
  const center = bounds.getCenter();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latMeters = (ne.lat - sw.lat) * 111_320;
  const lngMeters = (ne.lng - sw.lng) * 111_320 * Math.cos((center.lat * Math.PI) / 180);
  return Math.max(latMeters, lngMeters) / 2;
}

/** Round to a coarse grid so panning a little reuses the same fetch. */
function cacheKeyFor(center: L.LatLng, radiusM: number): string {
  const lat = Math.round(center.lat * 20) / 20;
  const lng = Math.round(center.lng * 20) / 20;
  const radius = Math.round(radiusM / 5000) * 5000;
  return `${lat}|${lng}|${radius}`;
}

function MapTiles() {
  const [tileUrl, setTileUrl] = useState(CARTO_TILES);
  const errorCount = useRef(0);
  return (
    <TileLayer
      key={tileUrl}
      attribution={CARTO_ATTRIBUTION}
      url={tileUrl}
      eventHandlers={{
        tileerror: () => {
          errorCount.current += 1;
          if (tileUrl === CARTO_TILES && errorCount.current >= 4) {
            errorCount.current = 0;
            setTileUrl(OSM_TILES);
          }
        },
      }}
    />
  );
}

function pinIcon(selected: boolean) {
  return L.divIcon({
    className: "yict-pin",
    html: `<span class="yict-pin__mark ${selected ? "yict-pin__mark--coral" : "yict-pin__mark--teal"}"></span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -32],
  });
}

function ExploreController({
  onViewportChange,
  active,
}: {
  onViewportChange: (center: L.LatLng, radiusM: number) => void;
  active: boolean;
}) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      if (!active) return;
      onViewportChange(map.getCenter(), boundsRadiusMeters(map.getBounds()));
    },
    zoomend: () => {
      if (!active) return;
      onViewportChange(map.getCenter(), boundsRadiusMeters(map.getBounds()));
    },
  });
  return null;
}

export function ExploreMap({ initialStay = "all" }: { initialStay?: StayType }) {
  const [stay, setStay] = useState<StayType>(initialStay);
  const [hotels, setHotels] = useState<ExploreHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fetchedKeys = useRef<Set<string>>(new Set());
  const cache = useRef<Map<string, ExploreHotel[]>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState("Move the map to explore stays.");

  const hotelHref = useCallback((id: string) => {
    const { checkin, checkout } = defaultDates();
    return `/hotel/${id}?checkin=${checkin}&checkout=${checkout}&adults=1`;
  }, []);

  const fetchArea = useCallback(
    async (center: L.LatLng, radiusM: number) => {
      const key = cacheKeyFor(center, radiusM);
      if (fetchedKeys.current.has(key)) return;
      fetchedKeys.current.add(key);

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(center.lat),
          lng: String(center.lng),
          radius: String(Math.round(radiusM)),
          ...(stay !== "all" ? { stay } : {}),
        });
        const res = await fetch(`/api/explore/hotels?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load stays");
        const data = (json.data ?? []) as ExploreHotel[];
        cache.current.set(key, data);
        setHotels((prev) => {
          const seen = new Set(prev.map((h) => h.id));
          const merged = [...prev, ...data.filter((h) => !seen.has(h.id))];
          return merged;
        });
        setStatus(`${json.count} stays in this area`);
      } catch (e) {
        setError((e as Error).message);
        setStatus("Could not load stays here.");
      } finally {
        setLoading(false);
      }
    },
    [stay]
  );

  const handleViewportChange = useCallback(
    (center: L.LatLng, radiusM: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchArea(center, radiusM);
      }, 350);
    },
    [fetchArea]
  );

  // Stay-type switch: clear pins and re-fetch the visible area.
  const handleStayChange = useCallback((id: StayType) => {
    setStay(id);
    setHotels([]);
    setSelectedId(null);
    fetchedKeys.current.clear();
    cache.current.clear();
    setStatus(`Switching to ${STAY_TYPES[id].label.toLowerCase()}…`);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const markers = useMemo(
    () =>
      hotels.map((h) => (
        <Marker
          key={h.id}
          position={[h.lat, h.lng]}
          icon={pinIcon(h.id === selectedId)}
          title={h.name}
          eventHandlers={{
            click: () => setSelectedId(h.id),
          }}
        >
          <Popup>
            <div className="min-w-[180px] max-w-[240px]">
              <p className="font-semibold text-ink">
                <Link href={hotelHref(h.id)} className="text-teal underline-offset-4 hover:underline">
                  {h.name}
                </Link>
              </p>
              {h.city && <p className="mt-0.5 text-xs text-ink-muted">{h.city}</p>}
              {h.rating != null && (
                <p className="mt-0.5 text-xs text-ink-muted">Rated {h.rating.toFixed(1)}/10</p>
              )}
              <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
                See live prices for your dates →
              </p>
            </div>
          </Popup>
        </Marker>
      )),
    [hotels, selectedId, hotelHref]
  );

  return (
    <div className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-[var(--color-canvas)]">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <MapTiles />
        <ExploreController onViewportChange={handleViewportChange} active={!loading} />
        <MarkerClusterGroup chunkedLoading>{markers}</MarkerClusterGroup>
      </MapContainer>

      {/* Floating toolbar */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1000] flex flex-col gap-2 sm:left-4 sm:right-auto sm:max-w-md">
        <div className="pointer-events-auto rounded-xl border border-[var(--color-border)] bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-lg font-semibold text-ink">Explore stays</h1>
            <Link
              href="/"
              className="text-[0.8125rem] font-medium text-teal underline-offset-4 hover:underline"
            >
              ← Back to search
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Type of stay">
            {STAY_TYPE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleStayChange(id)}
                className={`min-h-[32px] rounded-full px-3 text-[0.8125rem] font-medium transition-colors ${
                  stay === id
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink-muted)] hover:text-ink"
                }`}
              >
                {STAY_TYPES[id].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
            {loading ? "Loading stays…" : status}
          </p>
          {error && <p className="mt-1 text-xs text-[var(--color-coral)]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
