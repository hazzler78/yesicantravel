/**
 * Popular safe cities for the /popular-cities landing page.
 * Each links to /results with aiSearch + default dates.
 */

export interface PopularCity {
  slug: string;
  city: string;
  country: string;
  /** Short line for card */
  description: string;
  /** Query for results page aiSearch param */
  aiSearch: string;
  /** Optional image path (public). Omit for placeholder. */
  image?: string;
}

export const popularCities: PopularCity[] = [
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    description: "Central, well-lit neighbourhoods and 24/7 reception stays.",
    aiSearch: "central safe hotel Paris France well-lit",
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    description: "Safe solo-friendly hotels near transport and busy areas.",
    aiSearch: "central safe hotel Berlin Germany well-lit",
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    description: "Women-rated stays in safe, well-connected areas.",
    aiSearch: "central safe hotel Amsterdam Netherlands well-lit",
  },
  {
    slug: "barcelona",
    city: "Barcelona",
    country: "Spain",
    description: "24/7 reception and well-lit neighbourhoods.",
    aiSearch: "central safe hotel Barcelona Spain well-lit",
  },
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    description: "Solo-friendly stays with safety filters.",
    aiSearch: "central safe hotel Milan Italy well-lit",
  },
  {
    slug: "london",
    city: "London",
    country: "UK",
    description: "Reviewed by women travellers, central options.",
    aiSearch: "central safe hotel London UK well-lit",
  },
];

export function getPopularCityBySlug(slug: string): PopularCity | undefined {
  return popularCities.find((c) => c.slug === slug);
}
