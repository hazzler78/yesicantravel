/**
 * Turn natural-language destination queries (e.g. "hotell i Göteborg", "hotell i Eidsvoll")
 * into LiteAPI place searches that resolve to a city/locality, not a single hotel.
 */

export type DestinationPlace = {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
  types?: string[];
};

const LODGING_LEADING =
  /^(?:hotell(?:et)?|hotels?|hotel)\s+(?:i|in|på|at|near|nära)\s+/iu;
const LODGING_LEADING_BARE = /^(?:hotell(?:et)?|hotels?|hotel)\s+/iu;

/** Fold Scandinavian letters for alias lookup (ä→a, ö→o, å→a, æ→ae, ø→o). */
export function foldNordic(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[øö]/gu, "o")
    .replace(/[æä]/gu, (ch) => (ch === "æ" ? "ae" : "a"))
    .replace(/å/gu, "a");
}

function stripLodgingPhrases(query: string): string {
  let q = query.trim();
  let prev = "";
  while (prev !== q) {
    prev = q;
    q = q.replace(LODGING_LEADING, "").replace(LODGING_LEADING_BARE, "").trim();
  }
  return q;
}

/** Normalize free-text before calling LiteAPI /data/places. */
export function normalizeDestinationQuery(raw: string): string {
  const trimmed = raw.normalize("NFC").trim();
  if (!trimmed) return "";

  const stripped = stripLodgingPhrases(trimmed);
  if (!stripped) return trimmed;

  return stripped;
}

/** Build distinct textQuery strings to try against LiteAPI (original + normalized). */
export function destinationPlaceSearchQueries(raw: string): string[] {
  const queries: string[] = [];
  const add = (value: string) => {
    const t = value.trim();
    if (t && !queries.includes(t)) queries.push(t);
  };
  add(raw);
  const normalized = normalizeDestinationQuery(raw);
  add(normalized);
  return queries;
}

function scoreDestinationPlace(place: DestinationPlace): number {
  const types = new Set((place.types ?? []).map((t) => t.toLowerCase()));
  let score = 0;

  if (types.has("locality")) score += 100;
  if (types.has("political")) score += 85;
  if (types.has("administrative_area_level_2")) score += 75;
  if (types.has("administrative_area_level_3")) score += 65;
  if (types.has("geocode")) score += 20;

  if (types.has("lodging") || types.has("hotel")) score -= 300;
  if (types.has("international_airport")) score -= 45;
  if (types.has("route")) score -= 35;
  if (types.has("establishment") && !types.has("locality")) score -= 40;

  const addr = place.formattedAddress ?? "";
  if (addr && !addr.includes(",") && addr.length <= 40) score += 30;

  return score;
}

/** Prefer city/locality rows over a named hotel when LiteAPI returns both. */
export function rankDestinationPlaces(places: DestinationPlace[]): DestinationPlace[] {
  return [...places].sort(
    (a, b) => scoreDestinationPlace(b) - scoreDestinationPlace(a),
  );
}

type PlacesSearchResult = { data?: DestinationPlace[] };

/**
 * Resolve a visitor destination string to ranked place suggestions.
 * Merges results from the raw and normalized queries.
 */
export async function resolveDestinationPlaces(
  rawQuery: string,
  searchPlaces: (textQuery: string) => Promise<PlacesSearchResult>,
): Promise<DestinationPlace[]> {
  const byId = new Map<string, DestinationPlace>();

  for (const textQuery of destinationPlaceSearchQueries(rawQuery)) {
    try {
      const result = await searchPlaces(textQuery);
      for (const place of result.data ?? []) {
        if (place?.placeId) byId.set(place.placeId, place);
      }
    } catch {
      // Autocomplete should degrade gracefully; try remaining candidates.
    }
  }

  return rankDestinationPlaces([...byId.values()]);
}
