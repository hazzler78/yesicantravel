export interface Destination {
  slug: string;
  city: string;
  country: string;
  headline: string;
  subheadline: string;
  /** Bold display date range, e.g. "March 6–15, 2026" */
  eventDateRange: string;
  /** Short event name for badges/CTAs, e.g. "Paralympic Winter Games" */
  eventShortName: string;
  whyDemand: string;
  events: string;
  metaTitle: string;
  metaDescription: string;
  /** aiSearch query for results page */
  aiSearch: string;
  checkin: string;
  checkout: string;
}

export const destinations: Destination[] = [
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    headline: "Witness Paralympic History",
    subheadline:
      "In Milan during the Paralympic Winter Games (March 6–15). Safer stays near venues pre-filled for these peak dates—24/7 reception, well-lit areas, and neighbourhood tips.",
    eventDateRange: "March 6–15, 2026",
    eventShortName: "Paralympic Winter Games",
    whyDemand:
      "Post-Winter Olympics buzz plus Paralympics (6–15 Mar). Italy is the top luxury booking destination 2026.",
    events: "Paralympic Winter Games, 6–15 March 2026",
    metaTitle: "Milan Paralympics 2026 – Safer Stays for Women Solo Travellers",
    metaDescription:
      "Book safer hotels in Milan during the Paralympic Winter Games (6–15 Mar). Safety-first stays with 24/7 reception, well-lit areas & free cancellation. Find your place with confidence.",
    aiSearch: "central safe hotel Milan near Paralympic venues well-lit",
    checkin: "2026-03-06",
    checkout: "2026-03-16",
  },
  {
    slug: "cancun",
    city: "Cancún",
    country: "Mexico",
    headline: "Spring Break Cancún – Your Way",
    subheadline:
      "Peak spring-break dates pre-filled. #1 international spring-break search meets perfect beach weather—24/7 staff, safe access and free cancellation.",
    eventDateRange: "March 7–14, 2026",
    eventShortName: "Spring Break",
    whyDemand:
      "#1 international spring-break search (Upgraded Points/Google Trends). Perfect beach weather and peak season.",
    events: "Peak spring-break season (early–mid March)",
    metaTitle: "Cancún Spring Break 2026 – Safer Beach Hotels for Women Solo Travellers",
    metaDescription:
      "Safer beachfront stays in Cancún for spring break 2026. Filter by 24/7 reception, well-lit areas and neighbourhood safety. Book with free cancellation.",
    aiSearch: "beachfront safe hotel Cancún Mexico well-lit central",
    checkin: "2026-03-07",
    checkout: "2026-03-14",
  },
  {
    slug: "austin",
    city: "Austin",
    country: "Texas",
    headline: "SXSW",
    subheadline:
      "In Austin. Music, tech and your stay—event dates pre-filled. Safer hotels near venues with 24/7 reception and neighbourhood tips.",
    eventDateRange: "March 12–18, 2026",
    eventShortName: "SXSW",
    whyDemand: "SXSW hype (12–18 Mar) plus US spring travel surge.",
    events: "SXSW 2026, 12–18 March",
    metaTitle: "Austin SXSW 2026 – Safer Stays for Women Solo Travellers",
    metaDescription:
      "Safer hotels in Austin during SXSW (12–18 Mar). Filter by 24/7 reception, well-lit areas and neighbourhood safety. Book before rates rise.",
    aiSearch: "downtown safe hotel Austin Texas near SXSW venues well-lit",
    checkin: "2026-03-12",
    checkout: "2026-03-19",
  },
  {
    slug: "miami",
    city: "Miami",
    country: "Florida",
    headline: "Miami Spring Break + Miami Open",
    subheadline:
      "Oceanfront stays with 24/7 staff, free cancellation and neighbourhood safety—dates pre-filled so you can enjoy the vibe.",
    eventDateRange: "March 14–21, 2026",
    eventShortName: "Miami Open & Spring Break",
    whyDemand: "Top US spring-break destination plus Miami Open (starts mid-Mar).",
    events: "Miami Open (mid–late March) + spring-break season",
    metaTitle: "Miami Spring Break 2026 – Safer Oceanfront Hotels for Women Solo",
    metaDescription:
      "Safer oceanfront stays in Miami for spring break and Miami Open 2026. 24/7 reception, well-lit areas, free cancellation. Book with confidence.",
    aiSearch: "oceanfront safe hotel Miami Florida well-lit central",
    checkin: "2026-03-14",
    checkout: "2026-03-21",
  },
  {
    slug: "key-west",
    city: "Key West",
    country: "Florida",
    headline: "Key West Paradise",
    subheadline:
      "Top-searched spring-break spot in 18 US states. Peak dates pre-filled—safer stays with 24/7 reception and neighbourhood tips.",
    eventDateRange: "March 7–14, 2026",
    eventShortName: "Spring Break",
    whyDemand: "#1 domestic spring-break search in 18 US states. Ongoing spring-break festivities.",
    events: "Ongoing spring-break season (early–mid March)",
    metaTitle: "Key West Spring Break 2026 – Safer Stays for Women Solo Travellers",
    metaDescription:
      "Safer hotels in Key West for spring break 2026. Filter by 24/7 reception, well-lit areas and neighbourhood safety. Book your slice of paradise.",
    aiSearch: "safe hotel Key West Florida well-lit central",
    checkin: "2026-03-07",
    checkout: "2026-03-14",
  },
  {
    slug: "las-vegas",
    city: "Las Vegas",
    country: "Nevada",
    headline: "Vegas 2026",
    subheadline:
      "Limited spring rates. Amex Trending Destinations—safer stays with 24/7 staff, well-lit access and neighbourhood tips. Dates pre-filled.",
    eventDateRange: "March 14–21, 2026",
    eventShortName: "Spring 2026",
    whyDemand: "Amex Trending Destinations. Year-round high demand, steady occupancy.",
    events: "Steady high demand (no major event spike)",
    metaTitle: "Las Vegas 2026 – Safer Luxury Stays for Women Solo Travellers",
    metaDescription:
      "Safer luxury hotels in Las Vegas 2026. Filter by 24/7 reception, well-lit areas and neighbourhood safety. Limited spring rates available.",
    aiSearch: "strip safe luxury hotel Las Vegas Nevada well-lit",
    checkin: "2026-03-14",
    checkout: "2026-03-21",
  },
  {
    slug: "okinawa",
    city: "Okinawa",
    country: "Japan",
    headline: "Okinawa 2026",
    subheadline:
      "Early sakura season. Japan's best-kept secret—safer stays with 24/7 reception, well-lit areas and neighbourhood guidance. Dates pre-filled.",
    eventDateRange: "March 1–8, 2026",
    eventShortName: "Early Sakura",
    whyDemand: "Amex & Expedia top trending destination. Early sakura planning, quiet luxury.",
    events: "Early sakura planning, trending luxury escapes",
    metaTitle: "Okinawa 2026 – Safer Luxury Stays for Women Solo Travellers",
    metaDescription:
      "Safer luxury hotels in Okinawa 2026. Japan's trending escape—filter by 24/7 reception, well-lit areas and neighbourhood safety. Book at real prices.",
    aiSearch: "safe luxury hotel Okinawa Japan beach well-lit",
    checkin: "2026-03-01",
    checkout: "2026-03-08",
  },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getAllDestinationSlugs(): string[] {
  return destinations.map((d) => d.slug);
}
