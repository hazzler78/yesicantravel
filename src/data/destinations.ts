/**
 * A neighbourhood we can recommend (or caution about) for solo female travellers.
 * Copy MUST be fact-checked by a human editor before publishing — generic template
 * copy does more harm than good for a safety brand.
 */
export interface Neighbourhood {
  name: string;
  /** 2–4 sentence description. Must be specific to this neighbourhood. */
  description: string;
  /** "recommended" = good base for solo women. "caution" = extra awareness advised. */
  verdict: "recommended" | "caution";
}

export interface FAQ {
  question: string;
  answer: string;
}

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

  // ---- Optional rich-content fields. Populate per city to escape the
  // "Discovered – currently not indexed" bucket. All fields below should be
  // editor-verified before shipping.

  /** Short list of things the city is known for. 3–5 items. */
  knownFor?: string[];
  /** 2–5 neighbourhoods with specific, fact-checked solo-female guidance. */
  neighbourhoods?: Neighbourhood[];
  /** City-specific solo-female safety tips. Prefer 4–6 concrete, actionable items. */
  safetyTips?: string[];
  /** How to get from airport/station to town safely. 1 short paragraph. */
  gettingAround?: string;
  /** FAQ items. Rendered as FAQPage JSON-LD for rich results eligibility. */
  faqs?: FAQ[];
  /** Marker: set to true once a human editor has verified the content above. */
  contentVerified?: boolean;
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
    knownFor: [
      "Las Vegas Strip resort-casinos",
      "Fremont Street Experience downtown",
      "Major residencies and live shows",
      "Day trips to Red Rock Canyon and Hoover Dam",
    ],
    neighbourhoods: [
      {
        name: "Las Vegas Strip (mid-Strip)",
        description:
          "Mid-Strip between Bellagio and Park MGM is the densest cluster of large resorts with 24/7 staffed lobbies, well-lit pedestrian bridges and heavy foot traffic. For solo travellers, staying mid-Strip means short, well-lit walks between dinner, shows and your hotel instead of long rideshare trips.",
        verdict: "recommended",
      },
      {
        name: "Summerlin",
        description:
          "About 20 minutes west of the Strip, Summerlin is a quieter, residential-feel area with newer resorts and easy access to Red Rock Canyon. Good pick if you want a calmer base and plan to rideshare into the Strip for evenings.",
        verdict: "recommended",
      },
      {
        name: "Fremont Street / Downtown",
        description:
          "Historic downtown is lively with vintage casinos and the Fremont Street canopy. The core is well-policed and busy, but blocks immediately off Fremont can feel sparse at night. Stay on Fremont Street itself and take a rideshare back to your hotel rather than walking side streets.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Use Uber, Lyft or the official hotel taxi stand — do not accept rides from people soliciting you on the sidewalk.",
      "Drinks at clubs and pool parties are often strong; keep your drink in sight or order bottled water in between.",
      "Hotel room-key doors and elevators typically require a tap — if someone follows you toward an elevator bank, wait for the next one.",
      "The Strip has long blocks; what looks like a 5-minute walk on a map is often 15–20 minutes. Rideshare short hops at night.",
      "Use the hotel safe for your passport and keep a photo of your ID on your phone.",
    ],
    gettingAround:
      "Harry Reid International Airport (LAS) is 10–20 minutes from most Strip resorts. The official taxi queue and major rideshare pickup zones are signposted at Terminal 1 and Terminal 3; avoid unmarked drivers offering rides at the curb. The Strip itself is walkable mid-day — pedestrian bridges keep you out of traffic — but use rideshare after dark for anything more than a block or two.",
    faqs: [
      {
        question: "Is Las Vegas safe for solo female travellers?",
        answer:
          "The Strip and major resort casinos are heavily staffed, brightly lit and monitored around the clock, which makes them one of the more controlled environments for solo travellers in the US. Standard city-awareness rules apply: use rideshare after dark, don't carry more cash than you need, and stick to the Strip or inside Fremont Street's pedestrian core at night.",
      },
      {
        question: "Where should a solo woman stay in Vegas?",
        answer:
          "Mid-Strip resorts (roughly between Bellagio and Park MGM) are the safest pick for a first solo trip: 24/7 front desk, short well-lit walks to shows and restaurants, and plenty of staff around. Summerlin is a good quieter alternative if you have a reason to be west of the city.",
      },
      {
        question: "Is it safe to walk the Strip at night?",
        answer:
          "Yes, the main Strip sidewalks and pedestrian bridges are generally safe well into the evening — they're crowded, brightly lit and have visible police and private security. Avoid cutting through parking garages and side streets. After midnight, or if you've been drinking, rideshare even short distances.",
      },
      {
        question: "How do I handle taxis and rideshare safely?",
        answer:
          "Use Uber, Lyft, or official taxi stands at hotels. Confirm the driver's name and plate before getting in, share your ride with a friend through the app, and never get into a car that approaches you on the sidewalk. At the airport, follow signs to the rideshare pickup — don't accept offers from drivers in the terminal.",
      },
    ],
    contentVerified: false,
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
    knownFor: [
      "Early cherry-blossom (kanhizakura) season in late January–February",
      "Subtropical beaches in the Kerama Islands and northern Okinawa",
      "Ryukyuan castles and UNESCO sites around Naha",
      "Okinawan cuisine and Awamori distilleries",
    ],
    neighbourhoods: [
      {
        name: "Naha (Kokusai-dori & Omoromachi)",
        description:
          "Naha is Okinawa's capital and the island's main base for solo travellers. Kokusai-dori (the main shopping street) and the adjacent Omoromachi district are well-lit, busy into the evening and close to the monorail, which makes getting around simple without a car.",
        verdict: "recommended",
      },
      {
        name: "Onna Village / West Coast Resort Strip",
        description:
          "The West Coast between Yomitan and Onna is the resort belt — large beachfront properties with 24/7 reception, private beaches and shuttle services. A strong pick for a quieter, safer stay if you're comfortable using a taxi or rental car to reach restaurants outside the resort.",
        verdict: "recommended",
      },
      {
        name: "American Village (Chatan)",
        description:
          "Chatan's American Village is a walkable waterfront area with shops, cafés and a younger crowd. It's well-lit and lively in the evenings, but sits next to US military bases — awareness of the mixed nightlife scene is worth keeping in mind on weekend nights.",
        verdict: "recommended",
      },
    ],
    safetyTips: [
      "Japan is widely regarded as one of the safer countries for solo female travellers, but standard precautions (eyes on your drink, share your plans with someone) still apply — especially in bar districts.",
      "English signage is common in Naha and resorts, but less so in rural areas. Download offline maps and a translation app before you leave the hotel.",
      "Typhoon season runs summer to early autumn — for March trips this is not a concern, but check ferry status to outer islands if weather shifts.",
      "Use official taxis or the Yui Rail monorail in Naha. Renting a car requires an International Driving Permit arranged before you leave home.",
      "ATMs at 7-Eleven and Japan Post accept most foreign cards and are available 24/7 in Naha.",
    ],
    gettingAround:
      "Naha Airport (OKA) is a 15–20 minute monorail ride from central Naha. For the West Coast resorts, a hotel transfer or taxi is typically 60–90 minutes. Public buses connect major towns but are infrequent; most visitors heading beyond Naha either rent a car (with an International Driving Permit) or arrange hotel transfers in advance.",
    faqs: [
      {
        question: "Is Okinawa safe for solo female travellers?",
        answer:
          "Okinawa is considered one of the safer destinations in an already-safe country. Violent crime is rare, the monorail and taxis are reliable, and hotels (especially the West Coast resort strip) are used to international solo travellers. Standard solo-travel awareness still applies in nightlife areas around American Village and Matsuyama.",
      },
      {
        question: "Where should a solo woman stay in Okinawa?",
        answer:
          "Naha (around Kokusai-dori or Omoromachi) is the easiest first-time base: monorail access, walkable streets, plenty of restaurants. If you prefer quieter days at the beach, choose a West Coast resort in Onna or Yomitan with 24/7 reception and shuttle services.",
      },
      {
        question: "When is cherry blossom season in Okinawa?",
        answer:
          "Okinawa's cherry blossoms (kanhizakura) bloom earlier than mainland Japan — typically late January through February, well before the mainland sakura season. March is post-peak for blossoms but still pleasant, warm, and quieter than spring break crowds elsewhere.",
      },
      {
        question: "Do I need to rent a car in Okinawa?",
        answer:
          "Not if you're staying in Naha — the monorail and taxis cover most of what you'll want to see. If you plan to visit the northern half of the island (Churaumi Aquarium, Kouri Island, remote beaches), a rental car is the most practical option. You'll need an International Driving Permit issued in your home country before you travel.",
      },
    ],
    contentVerified: false,
  },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getAllDestinationSlugs(): string[] {
  return destinations.map((d) => d.slug);
}

/**
 * Return up to `limit` destinations other than `slug`.
 * Prefers same-country matches first so internal links connect related regions.
 */
export function getRelatedDestinations(slug: string, limit = 3): Destination[] {
  const current = destinations.find((d) => d.slug === slug);
  const others = destinations.filter((d) => d.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameCountry = others.filter((d) => d.country === current.country);
  const rest = others.filter((d) => d.country !== current.country);
  return [...sameCountry, ...rest].slice(0, limit);
}
