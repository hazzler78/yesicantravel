/**
 * Location helpers for stay maps. LiteAPI (and Google-style place payloads)
 * send coordinates as numbers, numeric strings, or under several field names.
 */

export type LatLng = { lat: number; lng: number };

export type ExternalMapLinks = {
  google: string;
  apple: string;
  osm: string;
  directions: string;
};

function toCoord(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readLatLng(record: Record<string, unknown> | null | undefined): LatLng | null {
  if (!record) return null;
  const lat = toCoord(record.latitude ?? record.lat);
  const lng = toCoord(record.longitude ?? record.lng ?? record.lon);
  if (lat == null || lng == null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/**
 * Pull a usable lat/lng from a hotel, place, or nested `{ location }` object.
 */
export function extractLatLng(source: unknown): LatLng | null {
  if (!source || typeof source !== "object") return null;
  const root = source as Record<string, unknown>;
  const nested =
    root.location && typeof root.location === "object"
      ? (root.location as Record<string, unknown>)
      : null;
  return readLatLng(nested) ?? readLatLng(root);
}

function queryForMaps(opts: { name?: string; address?: string; query?: string; lat?: number; lng?: number }): string {
  const named = [opts.name, opts.address].filter(Boolean).join(", ");
  if (opts.query?.trim()) return opts.query.trim();
  if (named) return named;
  if (opts.lat != null && opts.lng != null) return `${opts.lat},${opts.lng}`;
  return "";
}

/** Deep links so guests can open the stay in the maps app they already use. */
export function externalMapLinks(opts: {
  lat?: number;
  lng?: number;
  name?: string;
  address?: string;
  query?: string;
}): ExternalMapLinks | null {
  const query = queryForMaps(opts);
  if (!query && (opts.lat == null || opts.lng == null)) return null;

  const encodedQuery = encodeURIComponent(query || `${opts.lat},${opts.lng}`);
  const hasCoords = opts.lat != null && opts.lng != null;
  const ll = hasCoords ? `${opts.lat},${opts.lng}` : encodedQuery;
  const destination = hasCoords ? encodeURIComponent(ll) : encodedQuery;

  return {
    google: hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    apple: hasCoords
      ? `https://maps.apple.com/?ll=${ll}&q=${encodedQuery}`
      : `https://maps.apple.com/?q=${encodedQuery}`,
    osm: hasCoords
      ? `https://www.openstreetmap.org/?mlat=${opts.lat}&mlon=${opts.lng}#map=17/${opts.lat}/${opts.lng}`
      : `https://www.openstreetmap.org/search?query=${encodedQuery}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  };
}
