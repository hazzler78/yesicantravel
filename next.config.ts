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

    return [
      // Canonicalize apex domain → www to avoid duplicate indexing.
      // Google was indexing both `yesicantravel.com/...` and
      // `www.yesicantravel.com/...` as separate URLs, splitting ranking signal.
      {
        source: "/:path*",
        has: [{ type: "host", value: "yesicantravel.com" }],
        destination: "https://www.yesicantravel.com/:path*",
        permanent: true,
      },
      ...destinationRedirects,
    ];
  },
};

export default nextConfig;
