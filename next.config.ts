import type { NextConfig } from "next";
import {
  destinationHubRedirects,
  destinationToEventRedirects,
} from "./src/lib/legacyRedirects";

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
    ];

    // Note: apex-vs-www canonicalization is handled at the Vercel domain
    // level (www.yesicantravel.com → 308 → yesicantravel.com). Do NOT
    // add a conflicting redirect here — apex is canonical.
    return [...hubRedirects, ...eventRedirects, ...blogRedirects];
  },
  async rewrites() {
    // Some AI crawlers look for the briefing under /.well-known/
    return [{ source: "/.well-known/llms.txt", destination: "/llms.txt" }];
  },
};

export default nextConfig;
