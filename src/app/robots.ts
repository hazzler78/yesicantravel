import type { MetadataRoute } from "next";

const BASE_URL = "https://yesicantravel.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only the genuinely unbounded or private paths. Anything we mark
        // noindex is deliberately left crawlable: a blocked URL is never
        // fetched, so Google never sees the noindex and the URL lingers in
        // Search Console instead of being dropped.
        disallow: ["/results", "/checkout", "/confirmation", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: "yesicantravel.com",
  };
}
