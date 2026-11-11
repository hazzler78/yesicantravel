/**
 * Single source of truth for permanent destination redirects.
 *
 * Consumed by:
 *   - next.config.ts  (to emit 301 redirects at the edge)
 *   - src/app/sitemap.ts  (to exclude these slugs so we don't ask Google
 *     to crawl URLs that immediately 301)
 *
 * If you add a new destination redirect, add it here only.
 */

/**
 * Thin, event-led US stubs (no year-round guide copy). Send visitors to the
 * destinations hub instead of ended spring-2026 event pages that are noindex.
 */
export const destinationHubRedirects = new Set([
  "cancun",
  "austin",
  "miami",
  "key-west",
]);

/** @deprecated Empty — US stubs now use destinationHubRedirects. */
export const destinationToEventRedirects: Record<string, string> = {};

export const redirectedDestinationSlugs = new Set([
  ...destinationHubRedirects,
  ...Object.keys(destinationToEventRedirects),
]);

/** Published blog slugs that 301 elsewhere — omit from sitemap.xml. */
export const redirectedBlogSlugs = new Set([
  "safe-solo-hotels-barcelona-women-1776070666045",
]);
