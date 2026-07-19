import type { MetadataRoute } from "next";

const BASE_URL = "https://yesicantravel.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Transactional search/hotel deep links create thin parameterized URLs in GSC.
        disallow: ["/results", "/hotel/", "/checkout", "/confirmation", "/admin"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: "yesicantravel.com",
  };
}

