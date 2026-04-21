import type { MetadataRoute } from "next";
import { getAllDestinationSlugs } from "@/data/destinations";
import { getAllEventSlugs } from "@/data/events";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirectedDestinationSlugs } from "@/lib/legacyRedirects";

const BASE_URL = "https://yesicantravel.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Skip destination slugs that 301 to event pages — submitting them
  // causes "Page with redirect" entries in GSC Coverage and wastes crawl budget.
  const destinations = getAllDestinationSlugs()
    .filter((slug) => !redirectedDestinationSlugs.has(slug))
    .map((slug) => ({
      url: `${BASE_URL}/destinations/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const eventSlugs = getAllEventSlugs().map((slug) => ({
    url: `${BASE_URL}/events/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  let blogPosts: Array<{ slug: string }> = [];
  try {
    blogPosts = await prisma.contentItem.findMany({
      where: { status: ContentStatus.published },
      select: { slug: true },
      take: 1000,
    });
  } catch {
    blogPosts = [];
  }

  const blogUrls = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/results`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/popular-cities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/lead-magnet`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...destinations,
    ...eventSlugs,
    ...blogUrls,
  ];
}

