/** Keyless OpenStreetMap raster tiles (default). */
export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type MapTileLayerConfig = {
  url: string;
  attribution: string;
};

/**
 * Tile layer for Leaflet maps. Uses OSM by default (no API key).
 * Set `NEXT_PUBLIC_MAP_TILE_URL` (and optionally `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`)
 * to use a keyed provider such as CARTO.
 */
export function getMapTileLayerConfig(): MapTileLayerConfig {
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
