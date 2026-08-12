import type { MetadataRoute } from "next";
import { getAllDestinationSlugs } from "@/data/destinations";
import { getIndexableEventSlugs } from "@/data/events";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirectedDestinationSlugs } from "@/lib/legacyRedirects";

const BASE_URL = "https://yesicantravel.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Skip destination slugs that 301 to event pages — submitting them
  // causes "Page with redirect" entries in GSC Coverage and wastes crawl budget.
  const destinations = getAllDestinationSlugs()
    .filter((slug) => !redirectedDestinationSlugs.has(slug))
    .map((slug) => ({
      url: `${BASE_URL}/destinations/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Finished editions stay reachable but are left out here — asking Google to
  // crawl a page we mark noindex just burns crawl budget.
  const eventSlugs = getIndexableEventSlugs().map((slug) => ({
    url: `${BASE_URL}/events/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  let blogPosts: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    blogPosts = await prisma.contentItem.findMany({
      where: { status: ContentStatus.published },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });
  } catch {
    blogPosts = [];
  }

  // lastModified only on pages where we know a real edit date. Stamping every
  // URL with the build time teaches Google to ignore the field entirely.
  const blogUrls = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/events`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/destinations`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/popular-cities`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/lead-magnet`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...destinations,
    ...eventSlugs,
    ...blogUrls,
  ];
}
