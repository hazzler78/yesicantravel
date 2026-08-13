"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatStayTotal } from "@/lib/formatStayPrice";

const CARTO_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface PlaceDetails {
  location: { latitude: number; longitude: number };
  viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
}

export interface HotelMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  price?: number;
  currency?: string;
  href?: string;
}

interface ResultsMapProps {
  placeDetails: PlaceDetails;
  hotels: HotelMarker[];
  className?: string;
  onHotelNavigate?: (hotelId: string) => void;
  selectedHotelId?: string;
  /** "area" fits all stays in view. "stay" zooms in on one hotel. */
  variant?: "area" | "stay";
}

function pinIcon(tone: "teal" | "coral" | "destination") {
  return L.divIcon({
    className: "yict-pin",
    html: `<span class="yict-pin__mark yict-pin__mark--${tone}"></span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -32],
  });
}

const TEAL_PIN = pinIcon("teal");
const CORAL_PIN = pinIcon("coral");
const DESTINATION_PIN = pinIcon("destination");

function MapTiles() {
  const [tileUrl, setTileUrl] = useState(CARTO_TILES);
  const errorCount = useRef(0);

  return (
    <TileLayer
      key={tileUrl}
      attribution={tileUrl === CARTO_TILES ? CARTO_ATTRIBUTION : OSM_ATTRIBUTION}
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

function InvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    invalidate();
    const frame = window.requestAnimationFrame(invalidate);
    const timeouts = [50, 200, 400, 800].map((ms) => window.setTimeout(invalidate, ms));
    map.whenReady(invalidate);

    const observer = new ResizeObserver(() => invalidate());
    observer.observe(container);
    if (container.parentElement) observer.observe(container.parentElement);

    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", invalidate);

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", invalidate);
    };
  }, [map]);

  return null;
}

function FitArea({ hotels, selectedHotelId }: { hotels: HotelMarker[]; selectedHotelId?: string }) {
  const map = useMap();
  const hotelsKey = hotels.map((hotel) => `${hotel.id}:${hotel.lat}:${hotel.lng}`).join("|");

  useEffect(() => {
    const selected = hotels.find((hotel) => hotel.id === selectedHotelId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), { duration: 0.45 });
      return;
    }
    if (hotels.length === 1) {
      map.setView([hotels[0].lat, hotels[0].lng], 15);
      return;
    }
    if (hotels.length > 1) {
      const bounds = L.latLngBounds(hotels.map((hotel) => [hotel.lat, hotel.lng] as L.LatLngExpression));
      map.fitBounds(bounds, { maxZoom: 15, padding: [32, 32] });
    }
    // hotelsKey is the stable identity for the markers in view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, hotelsKey, selectedHotelId]);

  return null;
}

function OpenSelectedPopup({
  selectedHotelId,
  markerRefs,
}: {
  selectedHotelId?: string;
  markerRefs: MutableRefObject<Map<string, L.Marker>>;
}) {
  useEffect(() => {
    if (!selectedHotelId) return;
    const open = () => markerRefs.current.get(selectedHotelId)?.openPopup();
    open();
    const timeout = window.setTimeout(open, 350);
    return () => window.clearTimeout(timeout);
  }, [selectedHotelId, markerRefs]);
  return null;
}

export default function ResultsMap({
  placeDetails,
  hotels,
  className = "",
  onHotelNavigate,
  selectedHotelId,
  variant = "area",
}: ResultsMapProps) {
  const { location } = placeDetails;
  const center: [number, number] = [location.latitude, location.longitude];
  const hotelsWithCoords = useMemo(
    () => hotels.filter((hotel) => Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng)),
    [hotels],
  );
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const isStay = variant === "stay";
  const initialZoom = isStay ? 15 : 13;

  return (
    <div className={`h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={initialZoom}
        scrollWheelZoom={!isStay}
        dragging
        touchZoom
        style={{ height: "100%", width: "100%", minHeight: 256 }}
        className="yict-map"
        attributionControl
      >
        <MapTiles />
        <InvalidateSize />
        {!isStay && hotelsWithCoords.length > 0 && (
          <FitArea hotels={hotelsWithCoords} selectedHotelId={selectedHotelId} />
        )}
        <OpenSelectedPopup selectedHotelId={selectedHotelId} markerRefs={markerRefs} />

        {!isStay && (
          <Marker position={center} icon={DESTINATION_PIN} title="Search area" zIndexOffset={-100}>
            <Popup>Search area</Popup>
          </Marker>
        )}

        {hotelsWithCoords.map((hotel) => (
          <Marker
            key={hotel.id}
            position={[hotel.lat, hotel.lng]}
            title={hotel.name}
            icon={hotel.id === selectedHotelId || isStay ? CORAL_PIN : TEAL_PIN}
            zIndexOffset={hotel.id === selectedHotelId || isStay ? 500 : 0}
            eventHandlers={{
              add: (event) => {
                markerRefs.current.set(hotel.id, event.target as L.Marker);
              },
              remove: () => {
                markerRefs.current.delete(hotel.id);
              },
            }}
          >
            <Popup>
              <div className="min-w-[160px] max-w-[220px]">
                <p className="font-semibold text-ink">
                  {hotel.href ? (
                    <a
                      href={hotel.href}
                      className="text-teal underline-offset-4 hover:underline"
                      onClick={() => onHotelNavigate?.(hotel.id)}
                    >
                      {hotel.name}
                    </a>
                  ) : (
                    hotel.name
                  )}
                </p>
                {hotel.address && <p className="mt-0.5 text-xs text-ink-muted">{hotel.address}</p>}
                {hotel.price != null && (
                  <p className="tnum mt-1 text-[0.8125rem] font-semibold text-ink">
                    {formatStayTotal(hotel.price, hotel.currency ?? "EUR")}
                    <span className="font-normal text-ink-muted"> total</span>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
