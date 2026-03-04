import type { MetadataRoute } from "next";
import { getAllDestinationSlugs } from "@/data/destinations";
import { getAllEventSlugs } from "@/data/events";

const BASE_URL = "https://www.yesicantravel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const destinations = getAllDestinationSlugs().map((slug) => ({
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
    ...destinations,
    ...eventSlugs,
    {
      url: `${BASE_URL}/confirmation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}

