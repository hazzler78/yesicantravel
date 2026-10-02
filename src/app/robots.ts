import type { MetadataRoute } from "next";

const BASE_URL = "https://yesicantravel.com";

const DISALLOW_PRIVATE = ["/results", "/checkout", "/confirmation", "/admin"];

/** AI assistants already send traffic (ChatGPT → London lead). Keep them welcome. */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
] as const;

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
        disallow: DISALLOW_PRIVATE,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/" as const,
        disallow: DISALLOW_PRIVATE,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: "yesicantravel.com",
  };
}
