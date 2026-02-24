"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface PlaceDetails {
  location: { latitude: number; longitude: number };
  viewport?: { high: { latitude: number; longitude: number }; low: { latitude: number; longitude: number } };
}

interface HotelMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  price?: number;
  currency?: string;
}

interface ResultsMapProps {
  placeDetails: PlaceDetails;
  hotels: HotelMarker[];
  className?: string;
}

function FitBounds({ placeDetails, hotels }: { placeDetails: PlaceDetails; hotels: HotelMarker[] }) {
  const map = useMap();
  useEffect(() => {
    const pad = 0.02;
    const { location, viewport } = placeDetails;
    const lat = location.latitude;
    const lon = location.longitude;

    const points: L.LatLngExpression[] = [[lat, lon]];
    hotels.forEach((h) => points.push([h.lat, h.lng]));

    if (viewport?.high && viewport?.low) {
      points.push([viewport.high.latitude, viewport.high.longitude]);
      points.push([viewport.low.latitude, viewport.low.longitude]);
    }

    const bounds = L.latLngBounds(points).pad(pad);
    map.fitBounds(bounds, { maxZoom: 14, padding: [24, 24] });
  }, [map, placeDetails, hotels]);
  return null;
}

export default function ResultsMap({ placeDetails, hotels, className = "" }: ResultsMapProps) {
  const { location } = placeDetails;
  const center: [number, number] = [location.latitude, location.longitude];
  const hotelsWithCoords = hotels.filter((h): h is HotelMarker => typeof h.lat === "number" && typeof h.lng === "number");

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: 280 }}
        className="rounded-xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} title="Destination">
          <Popup>Destination</Popup>
        </Marker>
        {hotelsWithCoords.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} title={h.name}>
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-semibold text-[var(--navy)]">{h.name}</p>
                {h.address && <p className="text-sm text-[var(--navy-light)]">{h.address}</p>}
                {h.rating != null && <p className="text-[var(--ocean-teal)]">★ {h.rating}</p>}
                {h.price != null && (
                  <p className="text-sm font-medium text-[var(--ocean-teal)]">
                    {h.currency ?? "USD"} {h.price.toFixed(2)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {hotelsWithCoords.length > 0 && <FitBounds placeDetails={placeDetails} hotels={hotelsWithCoords} />}
      </MapContainer>
    </div>
  );
}
