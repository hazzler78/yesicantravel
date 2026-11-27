import type { NextConfig } from "next";
import {
  destinationHubRedirects,
  destinationToEventRedirects,
} from "./src/lib/legacyRedirects";
import { PLAUSIBLE_EVENT_PATH } from "./src/lib/plausiblePrivacy";

const nextConfig: NextConfig = {
  async redirects() {
    const hubRedirects = [...destinationHubRedirects].map((slug) => ({
      source: `/destinations/${slug}`,
      destination: "/destinations",
      permanent: true,
    }));

    const eventRedirects = Object.entries(destinationToEventRedirects).map(
      ([from, to]) => ({
        source: `/destinations/${from}`,
        destination: `/events/${to}`,
        permanent: true,
      }),
    );

    const blogRedirects = [
      {
        source: "/blog/safe-solo-hotels-barcelona-women-1776070666045",
        destination: "/blog/is-barcelona-safe-for-solo-female-travellers",
        permanent: true,
      },
      {
        source: "/blog/is-amsterdam-safe-for-solo-female-travellers",
        destination: "/blog/amsterdam-safe-solo-women-night",
        permanent: true,
      },
    ];

    // Note: apex-vs-www canonicalization is handled at the Vercel domain
    // level (www.yesicantravel.com → 308 → yesicantravel.com). Do NOT
    // add a conflicting redirect here — apex is canonical.
    return [...hubRedirects, ...eventRedirects, ...blogRedirects];
  },
  async rewrites() {
    // Some AI crawlers look for the briefing under /.well-known/
    // Plausible events are proxied as a first-party POST so the visitor IP
    // stays on the CDN (Vercel sets X-Forwarded-For). The path avoids the
    // words blockers filter on.
    return [
      { source: "/.well-known/llms.txt", destination: "/llms.txt" },
      { source: PLAUSIBLE_EVENT_PATH, destination: "https://plausible.io/api/event" },
    ];
  },
};

export default nextConfig;
