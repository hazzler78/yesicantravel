/** Keyless OpenStreetMap raster tiles (default). */
export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" rel="noopener noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type MapTileLayerConfig = {
  url: string;
  attribution: string;
};

/** True when the value is a Leaflet-style raster URL template (not a bare API key). */
export function looksLikeTileUrlTemplate(value: string): boolean {
  return /^https?:\/\//i.test(value) && value.includes("{z}");
}

export function mapTilerTileLayerConfig(apiKey: string): MapTileLayerConfig {
  const key = apiKey.trim();
  return {
    url: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`,
    attribution: MAPTILER_ATTRIBUTION,
  };
}

function resolveMapTilerApiKey(
  maptilerKeyEnv: string | undefined,
  mapTileUrlEnv: string | undefined,
): string | undefined {
  const dedicated = maptilerKeyEnv?.trim();
  if (dedicated) return dedicated;

  const tileUrl = mapTileUrlEnv?.trim();
  if (tileUrl && !looksLikeTileUrlTemplate(tileUrl)) {
    return tileUrl;
  }
  return undefined;
}

/**
 * Tile layer for Leaflet maps. Uses OSM by default (no API key).
 *
 * MapTiler: set `NEXT_PUBLIC_MAPTILER_KEY`, or put the API key alone in
 * `NEXT_PUBLIC_MAP_TILE_URL` (a common misconfiguration).
 *
 * Other providers: set `NEXT_PUBLIC_MAP_TILE_URL` to a full `{z}/{x}/{y}` template
 * (and optionally `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`).
 */
export function getMapTileLayerConfig(): MapTileLayerConfig {
  const mapTilerKey = resolveMapTilerApiKey(
    process.env.NEXT_PUBLIC_MAPTILER_KEY,
    process.env.NEXT_PUBLIC_MAP_TILE_URL,
  );
  if (mapTilerKey) {
    return mapTilerTileLayerConfig(mapTilerKey);
  }

  const customUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim();
  if (customUrl) {
    const customAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION?.trim();
    return {
      url: customUrl,
      attribution: customAttribution ?? OSM_TILE_ATTRIBUTION,
    };
  }

  return {
    url: OSM_TILE_URL,
    attribution: OSM_TILE_ATTRIBUTION,
  };
}
