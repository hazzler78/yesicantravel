"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import {
  getMapTileLayerConfig,
  OSM_TILE_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/mapTiles";

/** Switch to OSM after a few broken tiles (MapTiler 403 without Referer, proxy blocks, etc.). */
const TILE_ERROR_THRESHOLD = 2;

/**
 * Primary map tiles with automatic fallback to keyless OpenStreetMap when the
 * configured provider fails at load time.
 */
export function ResilientMapTileLayer() {
  const map = useMap();
  const primary = getMapTileLayerConfig();
  const primaryIsOsm = primary.url === OSM_TILE_URL;
  const [useOsmFallback, setUseOsmFallback] = useState(false);
  const errorCount = useRef(0);

  const onTileError = useCallback(() => {
    if (primaryIsOsm || useOsmFallback) return;
    errorCount.current += 1;
    if (errorCount.current >= TILE_ERROR_THRESHOLD) {
      setUseOsmFallback(true);
    }
  }, [primaryIsOsm, useOsmFallback]);

  useEffect(() => {
    if (!useOsmFallback) return;
    map.invalidateSize({ animate: false });
  }, [map, useOsmFallback]);

  const url = useOsmFallback ? OSM_TILE_URL : primary.url;
  const attribution = useOsmFallback ? OSM_TILE_ATTRIBUTION : primary.attribution;

  return (
    <TileLayer
      key={url}
      attribution={attribution}
      url={url}
      eventHandlers={{ tileerror: onTileError }}
    />
  );
}
