/**
 * Remembers where the visitor left the results list so "Back" lands on the
 * same hotel instead of the top of a freshly reloaded page.
 */

import type { ResultsFilterState } from "@/components/results/ResultsFilters";

export const RESULTS_RETURN_STORAGE_KEY = "yict_results_return";
export const RESULTS_CACHE_STORAGE_KEY = "yict_results_cache";

export type ResultsReturnState = {
  searchKey: string;
  hotelId: string;
  scrollY: number;
  filters: ResultsFilterState;
  sortBy: "rating" | "price";
  savedAt: number;
};

export type ResultsListCache = {
  searchKey: string;
  hotels: unknown[];
  placeLabel?: string;
  savedAt: number;
};

const MAX_AGE_MS = 1000 * 60 * 30; // 30 minutes — long enough to compare a few stays

export function buildResultsSearchKey(parts: {
  placeId?: string | null;
  aiSearch?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  adults?: string | null;
  children?: string | null;
  childAges?: string | null;
  rooms?: string | null;
  currency?: string | null;
}): string {
  return [
    parts.placeId ?? "",
    parts.aiSearch ?? "",
    parts.checkin ?? "",
    parts.checkout ?? "",
    parts.adults ?? "1",
    parts.children ?? "",
    parts.childAges ?? "",
    parts.rooms ?? "1",
    parts.currency ?? "EUR",
  ].join("|");
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota / private mode — scroll restore just won't persist.
  }
}

export function rememberResultsReturn(state: Omit<ResultsReturnState, "savedAt">) {
  writeJson(RESULTS_RETURN_STORAGE_KEY, { ...state, savedAt: Date.now() });
}

export function peekResultsReturn(searchKey: string): ResultsReturnState | null {
  const state = readJson<ResultsReturnState>(RESULTS_RETURN_STORAGE_KEY);
  if (!state || state.searchKey !== searchKey) return null;
  if (Date.now() - state.savedAt > MAX_AGE_MS) return null;
  return state;
}

/** Consume so a later fresh visit to the same search doesn't jump mid-list. */
export function consumeResultsReturn(searchKey: string): ResultsReturnState | null {
  const state = peekResultsReturn(searchKey);
  if (!state) return null;
  try {
    sessionStorage.removeItem(RESULTS_RETURN_STORAGE_KEY);
  } catch {
    // ignore
  }
  return state;
}

export function cacheResultsList(cache: Omit<ResultsListCache, "savedAt">) {
  writeJson(RESULTS_CACHE_STORAGE_KEY, { ...cache, savedAt: Date.now() });
}

export function readResultsListCache(searchKey: string): ResultsListCache | null {
  const cache = readJson<ResultsListCache>(RESULTS_CACHE_STORAGE_KEY);
  if (!cache || cache.searchKey !== searchKey) return null;
  if (Date.now() - cache.savedAt > MAX_AGE_MS) return null;
  return cache;
}

export function hotelCardDomId(hotelId: string): string {
  return `hotel-card-${hotelId}`;
}
