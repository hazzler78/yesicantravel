/**
 * Single source of truth for permanent destination→event redirects.
 *
 * Consumed by:
 *   - next.config.ts  (to emit 301 redirects at the edge)
 *   - src/app/sitemap.ts  (to exclude these slugs so we don't ask Google
 *     to crawl URLs that immediately 301)
 *
 * If you add a new destination→event redirect, add it here only.
 */
export const destinationToEventRedirects: Record<string, string> = {
  // Milan is no longer here: /destinations/milan is a year-round city guide now,
  // which serves the standing "safe hotels in Milan" demand that a redirect to a
  // single 2027 event could not.
  cancun: "cancun-spring-break-2026",
  austin: "austin-sxsw-2026",
  miami: "miami-spring-break-2026",
  "key-west": "key-west-spring-break-2026",
};

export const redirectedDestinationSlugs = new Set(
  Object.keys(destinationToEventRedirects),
);
