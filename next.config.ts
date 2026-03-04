import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/destinations/milan", destination: "/events/milan-paralympics-2026", permanent: true },
      { source: "/destinations/cancun", destination: "/events/cancun-spring-break-2026", permanent: true },
      { source: "/destinations/austin", destination: "/events/austin-sxsw-2026", permanent: true },
      { source: "/destinations/miami", destination: "/events/miami-spring-break-2026", permanent: true },
      { source: "/destinations/key-west", destination: "/events/key-west-spring-break-2026", permanent: true },
    ];
  },
};

export default nextConfig;
