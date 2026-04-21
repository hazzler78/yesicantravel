import type { NextConfig } from "next";
import { destinationToEventRedirects } from "./src/lib/legacyRedirects";

const nextConfig: NextConfig = {
  async redirects() {
    const destinationRedirects = Object.entries(destinationToEventRedirects).map(
      ([from, to]) => ({
        source: `/destinations/${from}`,
        destination: `/events/${to}`,
        permanent: true,
      }),
    );

    // Note: apex-vs-www canonicalization is handled at the Vercel domain
    // level (www.yesicantravel.com → 308 → yesicantravel.com). Do NOT
    // add a conflicting redirect here — apex is canonical.
    return [...destinationRedirects];
  },
};

export default nextConfig;
