/**
 * Scalable event-driven landing pages.
 * Add entries here (or later: import from Google Sheet / PredictHQ).
 * Sitemap and /events/[slug] are generated from this array.
 */

export interface Event {
  id: string;
  slug: string;
  city: string;
  country: string;
  eventName: string;
  eventShortName: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  category: "sports" | "festival" | "season" | "other";
  aiSearchTemplate: string;
  venueNotes?: string;
  /** Optional: 1–2 sentences for "Why now?" body. Falls back to generic if missing. */
  whyNow?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format ISO dates as "March 6–15, 2026". */
export function formatEventDateRange(startDate: string, endDate: string): string {
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const smonth = MONTHS[sm - 1];
  const emonth = MONTHS[em - 1];
  if (sy === ey && sm === em) {
    return `${smonth} ${sd}–${ed}, ${sy}`;
  }
  if (sy === ey) {
    return `${smonth} ${sd} – ${emonth} ${ed}, ${sy}`;
  }
  return `${smonth} ${sd}, ${sy} – ${emonth} ${ed}, ${ey}`;
}

/** Add one day to ISO date (for checkout = day after event end). */
function addDay(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export const events: Event[] = [
  {
    id: "paralympics-milan-2026",
    slug: "milan-paralympics-2026",
    city: "Milan",
    country: "Italy",
    eventName: "Paralympic Winter Games",
    eventShortName: "Paralympics",
    startDate: "2026-03-06",
    endDate: "2026-03-15",
    category: "sports",
    aiSearchTemplate: "safe hotels near Paralympic venues in Milan well-lit central",
    venueNotes: "Venues in Milan, Cortina, Verona",
    whyNow: "Post-Winter Olympics buzz; Italy is the top luxury booking destination 2026. Demand +135% YoY in Milan.",
  },
  {
    id: "sxsw-austin-2026",
    slug: "austin-sxsw-2026",
    city: "Austin",
    country: "Texas, USA",
    eventName: "South by Southwest (SXSW)",
    eventShortName: "SXSW",
    startDate: "2026-03-12",
    endDate: "2026-03-18",
    category: "festival",
    aiSearchTemplate: "hotels near SXSW venues Austin safe well-lit downtown",
  },
  {
    id: "cancun-spring-break-2026",
    slug: "cancun-spring-break-2026",
    city: "Cancún",
    country: "Mexico",
    eventName: "Spring Break",
    eventShortName: "Spring Break",
    startDate: "2026-03-07",
    endDate: "2026-03-14",
    category: "season",
    aiSearchTemplate: "beachfront safe hotel Cancún Mexico well-lit central",
    whyNow: "#1 international spring-break search. Perfect beach weather and peak season.",
  },
  {
    id: "ultra-miami-2026",
    slug: "miami-ultra-2026",
    city: "Miami",
    country: "Florida",
    eventName: "Ultra Music Festival",
    eventShortName: "Ultra Miami",
    startDate: "2026-03-27",
    endDate: "2026-03-29",
    category: "festival",
    aiSearchTemplate: "oceanfront safe hotel Miami Florida near Bayfront well-lit",
    whyNow: "Ultra Miami + spring-break and Miami Open period. High demand.",
  },
  {
    id: "coachella-2026-weekend1",
    slug: "coachella-2026-weekend-1",
    city: "Indio / Palm Springs",
    country: "California",
    eventName: "Coachella Weekend 1",
    eventShortName: "Coachella",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    category: "festival",
    aiSearchTemplate: "safe hotel near Coachella Indio Palm Springs well-lit",
    whyNow: "Passes sold out; hotel packages sell fast. Book early.",
  },
  {
    id: "coachella-2026-weekend2",
    slug: "coachella-2026-weekend-2",
    city: "Indio / Palm Springs",
    country: "California",
    eventName: "Coachella Weekend 2",
    eventShortName: "Coachella",
    startDate: "2026-04-17",
    endDate: "2026-04-19",
    category: "festival",
    aiSearchTemplate: "safe hotel near Coachella Indio Palm Springs well-lit",
    whyNow: "Passes sold out; hotel packages sell fast. Book early.",
  },
  {
    id: "masters-augusta-2026",
    slug: "augusta-masters-2026",
    city: "Augusta",
    country: "Georgia, USA",
    eventName: "The Masters",
    eventShortName: "Masters Augusta",
    startDate: "2026-04-06",
    endDate: "2026-04-12",
    category: "sports",
    aiSearchTemplate: "hotels near Augusta National Masters 2026 well-lit safe",
    whyNow: "One of the most sought-after sports events. Rooms fill early.",
  },
  {
    id: "treefort-music-fest-boise-2026",
    slug: "boise-treefort-2026",
    city: "Boise",
    country: "Idaho, USA",
    eventName: "Treefort Music Fest",
    eventShortName: "Treefort",
    startDate: "2026-03-25",
    endDate: "2026-03-29",
    category: "festival",
    aiSearchTemplate: "hotels near Treefort Music Fest Boise safe well-lit downtown",
    whyNow: "Major indie music festival. Downtown Boise fills fast.",
  },
  {
    id: "ncaa-final-four-indianapolis-2026",
    slug: "indianapolis-final-four-2026",
    city: "Indianapolis",
    country: "Indiana, USA",
    eventName: "NCAA Men's Final Four",
    eventShortName: "Final Four",
    startDate: "2026-04-03",
    endDate: "2026-04-07",
    category: "sports",
    aiSearchTemplate: "safe hotels near Lucas Oil Stadium Indianapolis Final Four well-lit",
    venueNotes: "Lucas Oil Stadium, Indianapolis",
    whyNow: "NCAA Final Four 2026. Rooms near stadium sell out early.",
  },
  {
    id: "sips-sounds-austin-2026",
    slug: "austin-sips-sounds-2026",
    city: "Austin",
    country: "Texas, USA",
    eventName: "Sips & Sounds Music Festival",
    eventShortName: "Sips & Sounds",
    startDate: "2026-03-13",
    endDate: "2026-03-14",
    category: "festival",
    aiSearchTemplate: "hotels near downtown Austin SXSW area safe well-lit",
    whyNow: "Overlaps with SXSW week. Book early for best rates.",
  },
  {
    id: "destin-spring-break-2026",
    slug: "destin-spring-break-2026",
    city: "Destin",
    country: "Florida",
    eventName: "Spring Break",
    eventShortName: "Spring Break",
    startDate: "2026-03-07",
    endDate: "2026-03-14",
    category: "season",
    aiSearchTemplate: "safe beach hotel Destin Florida well-lit central",
    whyNow: "Top spring-break beach destination. High search demand.",
  },
  {
    id: "puerto-vallarta-spring-break-2026",
    slug: "puerto-vallarta-spring-break-2026",
    city: "Puerto Vallarta",
    country: "Mexico",
    eventName: "Spring Break",
    eventShortName: "Spring Break",
    startDate: "2026-03-07",
    endDate: "2026-03-14",
    category: "season",
    aiSearchTemplate: "safe beachfront hotel Puerto Vallarta Mexico well-lit",
    whyNow: "Popular international spring-break spot. Beach + nightlife.",
  },
  {
    id: "edc-las-vegas-2026",
    slug: "las-vegas-edc-2026",
    city: "Las Vegas",
    country: "Nevada",
    eventName: "EDC Las Vegas",
    eventShortName: "EDC Vegas",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    category: "festival",
    aiSearchTemplate: "safe hotel Las Vegas Nevada near Speedway well-lit",
    venueNotes: "Las Vegas Motor Speedway",
    whyNow: "EDC 2026. Build-up demand in April; book early for May.",
  },
  {
    id: "cherry-blossom-dc-2026",
    slug: "washington-dc-cherry-blossom-2026",
    city: "Washington DC",
    country: "USA",
    eventName: "National Cherry Blossom Festival",
    eventShortName: "Cherry Blossom DC",
    startDate: "2026-03-20",
    endDate: "2026-04-14",
    category: "season",
    aiSearchTemplate: "safe hotel Washington DC near National Mall well-lit central",
    whyNow: "Peak bloom draws huge crowds. Book ahead for best rates.",
  },
  {
    id: "miami-spring-break-2026",
    slug: "miami-spring-break-2026",
    city: "Miami",
    country: "Florida",
    eventName: "Miami Open & Spring Break",
    eventShortName: "Miami Spring",
    startDate: "2026-03-14",
    endDate: "2026-03-21",
    category: "season",
    aiSearchTemplate: "oceanfront safe hotel Miami Florida well-lit central",
    whyNow: "Top US spring-break spot plus Miami Open (mid–late March).",
  },
  {
    id: "key-west-spring-break-2026",
    slug: "key-west-spring-break-2026",
    city: "Key West",
    country: "Florida",
    eventName: "Spring Break",
    eventShortName: "Spring Break",
    startDate: "2026-03-07",
    endDate: "2026-03-14",
    category: "season",
    aiSearchTemplate: "safe hotel Key West Florida well-lit central",
    whyNow: "#1 domestic spring-break search in 18 US states.",
  },
  {
    id: "hilo-spring-break-2026",
    slug: "hilo-spring-break-2026",
    city: "Hilo",
    country: "Hawaii, USA",
    eventName: "Spring Break",
    eventShortName: "Spring Break Hilo",
    startDate: "2026-03-15",
    endDate: "2026-04-05",
    category: "season",
    aiSearchTemplate: "safe hotels Hilo Hawaii spring break",
    whyNow: "Trending US spring break spot for nature-forward, calm escapes.",
  },
  {
    id: "asheville-spring-break-2026",
    slug: "asheville-spring-break-2026",
    city: "Asheville",
    country: "North Carolina, USA",
    eventName: "Spring Break",
    eventShortName: "Spring Break Asheville",
    startDate: "2026-03-15",
    endDate: "2026-04-05",
    category: "season",
    aiSearchTemplate: "safe hotels Asheville NC spring break",
    whyNow: "Trending mountain-and-culture spring escape; quieter than party beaches.",
  },
  {
    id: "sarasota-spring-break-2026",
    slug: "sarasota-spring-break-2026",
    city: "Sarasota",
    country: "Florida, USA",
    eventName: "Spring Break",
    eventShortName: "Spring Break Sarasota",
    startDate: "2026-03-07",
    endDate: "2026-03-21",
    category: "season",
    aiSearchTemplate: "safe beach hotels Sarasota Florida spring break",
    whyNow: "Family-friendly Gulf Coast spring break with strong search demand.",
  },
  {
    id: "f1-japanese-gp-suzuka-2026",
    slug: "suzuka-f1-2026",
    city: "Suzuka",
    country: "Japan",
    eventName: "Formula 1 Japanese Grand Prix",
    eventShortName: "F1 Suzuka",
    startDate: "2026-03-27",
    endDate: "2026-03-29",
    category: "sports",
    aiSearchTemplate: "safe hotels near Suzuka Circuit F1",
    venueNotes: "Suzuka Circuit, Japan",
    whyNow: "High international demand from F1 fans; nearby safe hotels book out early.",
  },
  {
    id: "primavera-sound-barcelona-2026-weekend1",
    slug: "primavera-sound-barcelona-2026-weekend-1",
    city: "Barcelona",
    country: "Spain",
    eventName: "Primavera Sound Barcelona – Weekend 1",
    eventShortName: "Primavera Barcelona",
    startDate: "2026-06-03",
    endDate: "2026-06-07",
    category: "festival",
    aiSearchTemplate: "safe central hotels Barcelona near Primavera Sound beach city well-lit",
    whyNow: "Huge indie, electronic and pop lineups with a massive international crowd; sells out months in advance.",
  },
  {
    id: "primavera-sound-barcelona-2026-weekend2",
    slug: "primavera-sound-barcelona-2026-weekend-2",
    city: "Barcelona",
    country: "Spain",
    eventName: "Primavera Sound Barcelona – Weekend 2",
    eventShortName: "Primavera Barcelona",
    startDate: "2026-06-01",
    endDate: "2026-06-07",
    category: "festival",
    aiSearchTemplate: "safe central hotels Barcelona near Primavera Sound beach city well-lit",
    whyNow: "Extra Primavera week in Barcelona (1–7 June) with city and beach energy; high demand for safer, central stays.",
  },
  {
    id: "melt-festival-2026",
    slug: "melt-festival-2026",
    city: "Ferropolis (near Berlin)",
    country: "Germany",
    eventName: "Melt Festival",
    eventShortName: "Melt",
    startDate: "2026-07-17",
    endDate: "2026-07-19",
    category: "festival",
    aiSearchTemplate: "safe hotels near Melt Festival Ferropolis and Berlin well-lit",
    venueNotes: "Ferropolis, Saxony-Anhalt (train from Berlin)",
    whyNow: "Cult electronic and hip-hop festival in an open-air industrial setting with a strong community feel.",
  },
  {
    id: "oya-festival-oslo-2026",
    slug: "oya-festival-oslo-2026",
    city: "Oslo",
    country: "Norway",
    eventName: "Øya Festival",
    eventShortName: "Øya Oslo",
    startDate: "2026-08-12",
    endDate: "2026-08-15",
    category: "festival",
    aiSearchTemplate: "safe hotels Oslo Norway near Oya Festival fjord well-lit",
    whyNow: "Boutique yet big indie festival in a beautiful fjord setting; very safe and walkable.",
  },
  {
    id: "rock-en-seine-paris-2026",
    slug: "rock-en-seine-paris-2026",
    city: "Paris",
    country: "France",
    eventName: "Rock en Seine",
    eventShortName: "Rock en Seine",
    startDate: "2026-08-26",
    endDate: "2026-08-30",
    category: "festival",
    aiSearchTemplate: "safe hotels Paris near Parc de Saint-Cloud Rock en Seine well-lit",
    venueNotes: "Parc de Saint-Cloud, Paris",
    whyNow: "Major outdoor festival with strong pop, rock and indie acts in a chic Parisian parkside setting.",
  },
  {
    id: "nos-alive-lisbon-2026",
    slug: "nos-alive-lisbon-2026",
    city: "Lisbon",
    country: "Portugal",
    eventName: "NOS Alive",
    eventShortName: "NOS Alive",
    startDate: "2026-07-09",
    endDate: "2026-07-11",
    category: "festival",
    aiSearchTemplate: "safe coastal hotels Lisbon Portugal near NOS Alive well-lit",
    whyNow: "Big mainstream and indie acts with ocean views; very sunny, social and relaxed.",
  },
  {
    id: "we-love-green-paris-2026",
    slug: "we-love-green-paris-2026",
    city: "Paris",
    country: "France",
    eventName: "We Love Green",
    eventShortName: "We Love Green",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    category: "festival",
    aiSearchTemplate: "safe hotels Paris near Bois de Vincennes We Love Green well-lit",
    venueNotes: "Bois de Vincennes, Paris",
    whyNow: "Eco-conscious music and food festival in a green park; very popular with creative, conscious crowds.",
  },
  {
    id: "roskilde-festival-2026",
    slug: "roskilde-festival-2026",
    city: "Roskilde / Copenhagen",
    country: "Denmark",
    eventName: "Roskilde Festival",
    eventShortName: "Roskilde",
    startDate: "2026-06-27",
    endDate: "2026-07-04",
    category: "festival",
    aiSearchTemplate: "safe hotels Roskilde and Copenhagen near Roskilde Festival well-lit",
    venueNotes: "Roskilde, Denmark (short train from Copenhagen)",
    whyNow: "One of Europe’s biggest festivals with strong lineups and an activist side; huge but safe with city and camping stay options.",
  },
  {
    id: "lollapalooza-berlin-2026",
    slug: "lollapalooza-berlin-2026",
    city: "Berlin",
    country: "Germany",
    eventName: "Lollapalooza Berlin",
    eventShortName: "Lolla Berlin",
    startDate: "2026-07-18",
    endDate: "2026-07-19",
    category: "festival",
    aiSearchTemplate: "safe central hotels Berlin near Lollapalooza Treptower Park well-lit",
    venueNotes: "Treptower Park, Berlin",
    whyNow: "US-style big lineup in a historic park with a very international, female-positive crowd.",
  },
];

export function getEventBySlug(slug: string): (Event & { dateRange: string }) | undefined {
  const event = events.find((e) => e.slug === slug);
  if (!event) return undefined;
  return {
    ...event,
    dateRange: formatEventDateRange(event.startDate, event.endDate),
  };
}

export function getAllEventSlugs(): string[] {
  return events.map((e) => e.slug);
}

/** For homepage Trending Events block. Returns first N events (e.g. 8). */
export function getEventsForHomepage(limit = 8): (Event & { dateRange: string })[] {
  return events.slice(0, limit).map((e) => ({
    ...e,
    dateRange: formatEventDateRange(e.startDate, e.endDate),
  }));
}

export function getCheckoutDate(endDate: string): string {
  return addDay(endDate);
}
