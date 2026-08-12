/**
 * Scalable event-driven landing pages.
 * Add entries here (or later: import from Google Sheet / PredictHQ).
 * Sitemap and /events/[slug] are generated from this array.
 */

import { getSeasonStayWindow, todayIso, type StayWindow } from "@/lib/stayDates";

export { getDefaultStayWindow, type StayWindow } from "@/lib/stayDates";

/** See comment on Destination.neighbourhoods for editorial policy. */
export interface EventNeighbourhood {
  name: string;
  description: string;
  verdict: "recommended" | "caution";
}

export interface EventFAQ {
  question: string;
  answer: string;
}

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
  /** Optional: override for hero/CTA (e.g. "April 10–12 & 17–19, 2026" when two weekends). */
  displayDateRange?: string;
  /** Optional: use destination search instead of aiSearch (e.g. "Brussels, Belgium") when aiSearch returns no hotels. */
  placeQuery?: string;
  /**
   * Slug of the next edition. Once this one is over, the page points here
   * instead of quietly advertising dates that have already passed.
   */
  supersededBy?: string;

  // ---- Optional rich-content fields (see Destination for rationale). ----

  /** Short list of things the host city is known for. 3–5 items. */
  knownFor?: string[];
  /** 2–5 neighbourhoods with specific, fact-checked solo-female guidance. */
  neighbourhoods?: EventNeighbourhood[];
  /** Event-specific solo-female safety tips. 4–6 concrete items. */
  safetyTips?: string[];
  /** Airport/station → hotel logistics, 1 short paragraph. */
  gettingAround?: string;
  /** FAQ items rendered as FAQPage JSON-LD. */
  faqs?: EventFAQ[];
  /** True once content above has been reviewed by a human editor. */
  contentVerified?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format ISO dates as "March 6–15, 2026", or "September 27, 2026" for one-day events. */
export function formatEventDateRange(startDate: string, endDate: string): string {
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const smonth = MONTHS[sm - 1];
  const emonth = MONTHS[em - 1];
  if (startDate === endDate) {
    return `${smonth} ${sd}, ${sy}`;
  }
  if (sy === ey && sm === em) {
    return `${smonth} ${sd}–${ed}, ${sy}`;
  }
  if (sy === ey) {
    return `${smonth} ${sd} – ${emonth} ${ed}, ${sy}`;
  }
  return `${smonth} ${sd}, ${sy} – ${emonth} ${ed}, ${ey}`;
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
    venueNotes: "PalaItalia Santa Giulia in Milan; opening ceremony at Arena di Verona; mountain events in Cortina and Val di Fiemme",
    placeQuery: "Milan, Italy",
    whyNow:
      "Ice hockey was at PalaItalia Santa Giulia, a new arena in the south-east. The opening ceremony was in Verona, not Milan — so a central Milan stay only helps the ice events, not the first night.",
    knownFor: [
      "The Duomo and Galleria Vittorio Emanuele II",
      "La Scala opera house",
      "Design and fashion districts (Brera, Quadrilatero della Moda)",
      "Navigli canal-side nightlife",
    ],
    neighbourhoods: [
      {
        name: "Brera",
        description:
          "Just north of the centre, with narrow streets, galleries and restaurants that stay busy through the evening. One of the more pleasant parts of Milan to walk after dinner. M2 stops at Lanza, and it is a ten-minute walk to the Duomo.",
        verdict: "recommended",
      },
      {
        name: "Porta Nuova / Isola",
        description:
          "The modern district around Porta Garibaldi: wide pavements, bright lighting, and a major interchange on M2 and M5. For PalaItalia Santa Giulia you change at Zara onto M3 (yellow) south to Rogoredo — it is not a direct M5 ride.",
        verdict: "recommended",
      },
      {
        name: "Navigli",
        description:
          "The canal district and the centre of Milan's evening drinking. Excellent for an aperitivo, crowded and loud late, and a fair distance from Santa Giulia. Worth visiting; consider whether you want to sleep there.",
        verdict: "caution",
      },
      {
        name: "Around Stazione Centrale",
        description:
          "Convenient for trains and well supplied with cheap hotels, but the station and the streets immediately east of it are busy at all hours in a way that many solo travellers find uncomfortable late at night. If you book here, favour a hotel on the main avenues with a staffed lobby.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Pickpocketing concentrates on M1 and M3 around the Duomo, at Stazione Centrale, and on the historic tram 1. A zipped bag worn in front covers most of it.",
      "The metro closes early by European standards: last trains from the terminals around 00:30 on M1–M4, and closer to midnight on M5. NM1–NM4 night buses then follow the metro routes; the standard €2.20 urban ticket is valid on them.",
      "Use FreeNow, itTaxi, or the official white taxis at ranks. Do not accept rides from drivers soliciting at Milano Centrale.",
      "Buy ATM tickets in the app or at a machine before you board — an unvalidated ticket counts as no ticket, and inspectors check regularly.",
      "A coperto (cover charge) of a few euros is often already on the bill. Check before adding a tip.",
      "Italy's 1522 anti-violence and stalking line is free, staffed 24/7 and answers in several languages. 112 is the emergency number.",
    ],
    gettingAround:
      "From Malpensa, the Malpensa Express runs every 30 minutes to Milano Cadorna (about 40 minutes) and Milano Centrale (about 50 minutes). From Linate, metro line M4 runs into the centre in about 15 minutes on a standard urban ticket. PalaItalia Santa Giulia is in the south-east: take M3 (yellow) to Rogoredo, then the venue shuttle or a 25-minute walk. M5 does not go there — it runs from Bignami to San Siro.",
    faqs: [
      {
        question: "When were the Milan Paralympics 2026?",
        answer:
          "The Milano Cortina 2026 Paralympic Winter Games ran from 6 to 15 March 2026. The opening ceremony was at the Arena di Verona, Para ice hockey was at PalaItalia Santa Giulia in Milan, mountain events were in Cortina d'Ampezzo and Val di Fiemme, and the closing ceremony was in Cortina.",
      },
      {
        question: "Is Milan safe for solo female travellers?",
        answer:
          "Milan is a large working city: busy and businesslike by day, quieter in the centre at night than Rome or Naples. Violent crime against visitors is rare; pickpocketing on the metro and around the Duomo is common. Stay central (Brera, Porta Nuova, Duomo), use a zipped bag, and plan the last metro — it stops around 00:30.",
      },
      {
        question: "Where should I stay for PalaItalia Santa Giulia?",
        answer:
          "Anywhere on the M3 (yellow) line keeps the journey to a single ride to Rogoredo, which is the station for the arena. Duomo, Repubblica (Porta Nuova) and Centrale are all on it. Brera is a short walk from Lanza on M2. The opening ceremony was in Verona, not at San Siro, so an M5 hotel only helps if you also want San Siro itself.",
      },
      {
        question: "How do I get from Malpensa Airport to central Milan safely?",
        answer:
          "Take the Malpensa Express. It runs every 30 minutes from Terminal 1 and Terminal 2: about 40 minutes to Cadorna, about 50 minutes to Centrale, both staffed stations with taxi ranks outside. Avoid unofficial drivers offering rides in arrivals.",
      },
      {
        question: "Do I need to speak Italian?",
        answer:
          "English is widely spoken at Milan hotels, major restaurants and transit information counters. Learning a few basics (buongiorno, grazie, scusi) is appreciated but not required.",
      },
    ],
    contentVerified: true,
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
    id: "coachella-2026",
    slug: "coachella-2026",
    city: "Indio",
    country: "USA",
    eventName: "Coachella Valley Music and Arts Festival",
    eventShortName: "Coachella",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    displayDateRange: "April 10–12 & 17–19, 2026",
    category: "festival",
    aiSearchTemplate: "safe hotels near Empire Polo Club Coachella Indio",
    venueNotes: "Empire Polo Club, Indio – shuttles to Palm Springs/La Quinta",
    whyNow: "Passes sold out – safe stays near venue fill fast! Pre-filled for both weekends.",
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
    aiSearchTemplate: "safe hotels near Augusta National Masters golf well-lit",
    venueNotes: "Augusta National Golf Club, Augusta, GA",
    whyNow: "Golf fans book early; one of the most sought-after sports events. Safe stays near the course fill fast.",
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
    placeQuery: "Puerto Vallarta, Mexico",
    whyNow:
      "A long-standing Pacific-coast favourite for solo women and LGBTQ+ travellers, with a walkable old town and staffed resort strip. Jalisco as a whole carries a US 'reconsider travel' advisory; Puerto Vallarta itself is listed with no travel restrictions — check the current advisory before you book.",
    knownFor: [
      "The Malecón boardwalk and old-town Zona Romántica",
      "LGBTQ+-welcoming atmosphere (one of Mexico's most inclusive beach towns)",
      "Bay of Banderas beaches, whale watching and snorkelling",
      "Marietas Islands day trips and cobbled mountain villages inland",
    ],
    neighbourhoods: [
      {
        name: "Zona Romántica (Old Town)",
        description:
          "Puerto Vallarta's walkable heart: cobbled streets, cafés, galleries and the Playa Los Muertos pier. One of the most welcoming areas in Mexico for solo female and LGBTQ+ travellers, with plenty of staffed boutique hotels within a few blocks of the beach.",
        verdict: "recommended",
      },
      {
        name: "Marina Vallarta",
        description:
          "A planned resort district around a working marina, north of downtown. Gated resorts, 24/7 security, and quiet compared to the Zona Romántica — a good pick if you want a secure, resort-style base and don't mind a short taxi to the old town for evenings out.",
        verdict: "recommended",
      },
      {
        name: "Hotel Zone (Zona Hotelera)",
        description:
          "The stretch of mid-to-high-rise beach resorts north of downtown. All-inclusives here have 24/7 reception, bracelet-access beaches and shuttle services. Nightlife happens on-property or in the old town — stay inside the resort grounds after dark or take Uber or DiDi into Zona Romántica.",
        verdict: "recommended",
      },
      {
        name: "Centro / north of the Cuale River",
        description:
          "The commercial centre north of Río Cuale is fine during the day but much quieter once shops close. Stick to the Malecón waterfront rather than inland streets at night, or rideshare home.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "The US State Department currently advises reconsidering travel to Jalisco as a whole, while listing no restrictions on Puerto Vallarta itself (including neighbouring Riviera Nayarit). Check the advisory before you book — levels change.",
      "Use Uber or DiDi in the city — both are authorised in Puerto Vallarta. Confirm the plate and the photo before you get in. Do not hail a taxi on the street.",
      "For the airport, buy an authorised taxi voucher inside the terminal before you exit. App pickups are on the public road outside airport property, not at the curb, which is a worse arrival with bags.",
      "Drink bottled or filtered water; avoid ice in small street stalls. Resorts typically filter their own.",
      "Stick to busy, lit beach stretches (Los Muertos, Hotel Zone) for daytime solo sun. Don't leave valuables on the sand; use a hotel beach locker.",
      "If you join spring-break pool or boat parties, pre-agree a check-in text with a friend or your hotel reception — and never leave a drink unattended.",
      "ATMs inside bank lobbies (BBVA, Banorte, Santander) are the safer option; avoid standalone machines on the Malecón.",
    ],
    gettingAround:
      "Licenciado Gustavo Díaz Ordaz International Airport (PVR) is 10–25 minutes from most hotels. Inside the terminal, buy an authorised taxi voucher — prices are fixed by zone and you pay upfront. Uber and DiDi operate in the city, but airport pickups are on the public road outside the terminal, not at the curb. City buses cost around 11 to 14 pesos and are generally fine during the day; most solo travellers use Uber or DiDi at night.",
    faqs: [
      {
        question: "Is Puerto Vallarta safe for solo female travellers during spring break?",
        answer:
          "Puerto Vallarta's tourist zone is a long-standing favourite for solo women and LGBTQ+ travellers, and the US government lists no travel restrictions on the town itself. Jalisco as a state is a different picture — currently 'reconsider travel' — so read the current advisory rather than treating the whole state as interchangeable. In town, the Zona Romántica and Hotel Zone are busy, staffed and well-lit; use Uber or DiDi at night and keep an eye on your drink at parties.",
      },
      {
        question: "Where should a solo woman stay in Puerto Vallarta?",
        answer:
          "Zona Romántica (old town) is the top pick for a walkable, welcoming base with boutique hotels, cafés and the beach within blocks. If you prefer a resort with 24/7 security and controlled grounds, the Hotel Zone or Marina Vallarta are strong alternatives — pair them with Uber or DiDi into Zona Romántica for dinner and live music.",
      },
      {
        question: "Is it safe to go out at night in Puerto Vallarta?",
        answer:
          "The Malecón, Playa Los Muertos pier area and the main bar streets in Zona Romántica are busy, lit and full of other visitors well into the evening. Avoid inland streets in Centro after closing time, stick to licensed bars, and take Uber or DiDi back to your hotel rather than walking long distances at night.",
      },
      {
        question: "How do I get from Puerto Vallarta airport to my hotel safely?",
        answer:
          "Inside the terminal, buy an authorised taxi voucher at one of the counters before you exit — prices are fixed by zone and you pay upfront. Uber and DiDi work in the city but cannot pick up at the terminal curb; you would have to walk out to the public road. Ignore drivers offering rides at the curb, and if you do use an app later, confirm the driver name and plate before getting in.",
      },
      {
        question: "Do I need to speak Spanish?",
        answer:
          "Basic English is widely spoken at hotels, restaurants and taxi stands in Puerto Vallarta's tourist zones. A handful of phrases (hola, gracias, la cuenta por favor) go a long way, and Google Translate covers most gaps outside the tourist core.",
      },
    ],
    contentVerified: true,
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
    id: "primavera-sound-barcelona-2026",
    slug: "primavera-sound-barcelona-2026",
    city: "Barcelona",
    country: "Spain",
    eventName: "Primavera Sound Barcelona",
    eventShortName: "Primavera Barcelona",
    startDate: "2026-06-03",
    endDate: "2026-06-07",
    category: "festival",
    aiSearchTemplate: "safe central hotels Barcelona near Primavera Sound Parc del Forum beach city well-lit",
    venueNotes: "Parc del Fòrum, Barcelona",
    whyNow: "Indie, electronic and pop giants with a huge international crowd; sells out months in advance.",
    supersededBy: "barcelona-primavera-sound-2027",
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
    whyNow: "Boutique indie festival in a beautiful fjord setting; extremely safe and walkable, easy to meet people.",
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
    placeQuery: "Paris, France",
    venueNotes: "Domaine national de Saint-Cloud, at the western edge of Paris",
    whyNow:
      "Five days at the Domaine national de Saint-Cloud, just outside the Périphérique. The festival schedules every set to finish before the metro stops, so where you stay decides whether the night ends with a twenty-minute ride or a €40 taxi.",
    knownFor: [
      "Five days of headliners in the grounds of a former royal estate",
      "Sets timed to end before the last metro",
      "Boulogne-Billancourt and the 16th on the doorstep",
      "Central Paris twenty minutes away on line 10",
    ],
    neighbourhoods: [
      {
        name: "Along metro line 10 (5th, 6th, 7th, 15th)",
        description:
          "Line 10 runs from Gare d'Austerlitz straight to the festival terminus at Boulogne–Pont de Saint-Cloud, so anywhere on it turns the journey into one ride with no changes at midnight. The Latin Quarter and Saint-Germain ends are busy and well lit late; the 15th is quieter and cheaper for the same line.",
        verdict: "recommended",
      },
      {
        name: "Boulogne-Billancourt",
        description:
          "The suburb immediately across the bridge from the festival, residential and unglamorous, with the shortest walk back of anywhere. Fifteen minutes from the entrance on foot and still on the metro for the rest of Paris. The trade-off is that it goes quiet early and it is not where you would spend a non-festival evening.",
        verdict: "recommended",
      },
      {
        name: "Montmartre and the 9th",
        description:
          "A proper Paris base with plenty going on late, but it is across the city from Saint-Cloud and needs at least one change. Fine if the festival is one part of a longer trip; frustrating if you are going out to the site five nights running.",
        verdict: "recommended",
      },
      {
        name: "Around Gare du Nord and Barbès",
        description:
          "The cheapest central beds and the busiest transport links, and the streets immediately around both stations are the ones Parisians most often warn visitors about after dark — crowded, heavily worked by pickpockets, and uncomfortable rather than dangerous. If you book here, take the metro to the door rather than walking the last stretch.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Metro line 10 to its terminus at Boulogne–Pont de Saint-Cloud, then a ten to fifteen minute walk across the bridge, is the simplest way in. Tram T2 to Parc de Saint-Cloud is the alternative and drops you closer.",
      "Concerts are deliberately scheduled to finish before the metro and tram stop — around 00:30 on Friday and Saturday and 23:30 on the other nights. That only helps if you leave with the crowd rather than after it.",
      "Leaving fifteen or twenty minutes before the last act finishes turns a slow crush over the bridge into a walk. It is the single most useful thing to know about this festival.",
      "If you do miss the last metro, Noctilien night buses N12 and N61 stop at Pont de Sèvres, a short distance from the site. All exits are final — if you leave the site, you cannot come back in.",
      "Parking around the Domaine is very limited and the roads clog after headliners. Do not plan to drive, and if someone is collecting you, arrange it at the metro station rather than at the gates.",
      "Pickpocketing in Paris concentrates on crowded metro lines and station concourses, not on the festival site. Keep your phone out of an open back pocket on line 10 and at Châtelet.",
    ],
    gettingAround:
      "Charles de Gaulle connects to the centre on the RER B in about 35 minutes; Orly is closer and now on metro line 14, which runs late. For the festival itself, line 10 is the direct route — Boulogne–Pont de Saint-Cloud is the terminus, then you cross the Pont de Saint-Cloud on foot. Tram T2 stops at Parc de Saint-Cloud, a five to twelve minute walk from the entrance, and buses 52, 72 and 126 stop nearby. Transilien trains from Saint-Lazare also reach Saint-Cloud station, about ten minutes from the gates.",
    faqs: [
      {
        question: "When is Rock en Seine 2026?",
        answer:
          "Rock en Seine 2026 runs from Wednesday 26 to Sunday 30 August at the Domaine national de Saint-Cloud, on the western edge of Paris. Doors open at 16:00 on Wednesday, 15:30 on Thursday, 14:30 on Friday and Saturday, and 13:00 on Sunday; concerts start about 45 minutes later.",
      },
      {
        question: "How do I get to the festival from central Paris?",
        answer:
          "Take metro line 10 to its terminus, Boulogne–Pont de Saint-Cloud, then walk across the Pont de Saint-Cloud — around ten to fifteen minutes to the main entrance at Place Georges Clemenceau. Tram T2 to Parc de Saint-Cloud is slightly closer to the gates. Driving is a bad idea: parking around the Domaine is very limited.",
      },
      {
        question: "Will I be able to get back after the last set?",
        answer:
          "Yes — the festival schedules sets to end before public transport closes, roughly 00:30 on Friday and Saturday and 23:30 on the other nights. The crush is at the bridge and on the platform right after the headliner, so leaving fifteen minutes early makes a real difference. Noctilien buses N12 and N61 at Pont de Sèvres cover you if you miss it.",
      },
      {
        question: "Where should I stay for Rock en Seine?",
        answer:
          "Anywhere on metro line 10 keeps the journey to a single ride with no changes late at night, which is the thing that matters most here. Boulogne-Billancourt is the closest base of all. Staying in eastern or northern Paris means at least one change each way, five nights running.",
      },
      {
        question: "Is Paris safe for a woman going to a festival alone?",
        answer:
          "The site itself is stewarded and busy, and the realistic Paris risk is pickpocketing on crowded metro lines rather than anything at the festival. The part worth planning is the return journey: know your line, leave before the final crush, and if you are staying near Gare du Nord or Barbès take the metro to the door rather than walking the last few streets.",
      },
    ],
    contentVerified: true,
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
    whyNow: "Mainstream and indie acts with ocean views; relaxed, safe and very popular with solo and group travellers.",
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
    whyNow: "Eco-conscious music and food festival in a green park; very female-skewed, calming and empowering vibe.",
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
    whyNow: "One of Europe’s biggest festivals with strong lineups and an activist side; mega but safe, with city and camping options.",
    supersededBy: "roskilde-festival-2027",
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
    whyNow: "US-style big lineup in Berlin; close to home for many in Germany, with empowering female acts and an international crowd.",
  },
  {
    id: "tomorrowland-2026",
    slug: "tomorrowland-2026",
    city: "Boom",
    country: "Belgium",
    eventName: "Tomorrowland",
    eventShortName: "Tomorrowland",
    startDate: "2026-07-17",
    endDate: "2026-07-19",
    displayDateRange: "July 17–19 & 24–26, 2026",
    category: "festival",
    aiSearchTemplate: "safe hotels Brussels Belgium well-lit central",
    placeQuery: "Brussels, Belgium",
    venueNotes: "Boom, Belgium (stay in Brussels or Antwerp – shuttles to festival)",
    whyNow: "EDM mega-festival with 400k+ visitors; two weekends. Most visitors stay in Brussels or Antwerp – safe stays there fill fast.",
  },

  // ---------------------------------------------------------------------
  // Europe, September 2026 onwards. Dates below were each checked against
  // the organiser's own site; anything only "expected" (Tomorrowland 2027,
  // for one) is deliberately left out until the organiser publishes it.
  // ---------------------------------------------------------------------
  {
    id: "oktoberfest-munich-2026",
    slug: "munich-oktoberfest-2026",
    city: "Munich",
    country: "Germany",
    eventName: "Oktoberfest",
    eventShortName: "Oktoberfest",
    startDate: "2026-09-19",
    endDate: "2026-10-04",
    category: "festival",
    aiSearchTemplate: "safe central hotels Munich near Theresienwiese well-lit",
    placeQuery: "Munich, Germany",
    venueNotes: "Theresienwiese, Munich",
    whyNow:
      "The 191st Wiesn runs 16 days and fills Munich's hotels city-wide. Rooms near the Hauptbahnhof and Theresienwiese are the first to go, and prices roughly double against a normal September week.",
    knownFor: [
      "Sixteen days of tents on the Theresienwiese, free to enter",
      "The Oide Wiesn, the quieter traditional corner of the festival",
      "Marienplatz, the Viktualienmarkt and the English Garden",
      "Day trips to Neuschwanstein and the Bavarian lakes",
    ],
    neighbourhoods: [
      {
        name: "Ludwigsvorstadt / Theresienwiese",
        description:
          "The streets immediately around the festival grounds. Unbeatable for stumbling home in ten minutes rather than queueing for a U-Bahn, and priced accordingly. Note that a traffic cordon closes the ring of streets around the Theresienwiese for the duration — only residents, staff and hotel guests inside the zone get access, so arrive by train and confirm your hotel's entry instructions.",
        verdict: "recommended",
      },
      {
        name: "Glockenbachviertel and Isarvorstadt",
        description:
          "South of the centre, a walkable district of bars, cafés and Munich's LGBTQ+ scene, with the Isar riverbank on the doorstep. Two U-Bahn stops from the Wiesn on the U3/U6 via Goetheplatz or Poccistraße, and considerably calmer than the festival streets when you want to sleep.",
        verdict: "recommended",
      },
      {
        name: "Altstadt (Marienplatz and around)",
        description:
          "The old town puts you on the U3/U6 with a short ride to Goetheplatz and leaves you somewhere worth being on a non-festival morning. Busy and well-lit late; the trade-off is price and the volume of dirndl-clad groups passing through in the evening.",
        verdict: "recommended",
      },
      {
        name: "Around the Hauptbahnhof",
        description:
          "The cheapest beds within walking distance of the Wiesn, and the most mixed streets in central Munich. The station itself is staffed and busy, but the blocks immediately north and west of it feel transient after dark. If you book here for the price, pick a hotel with a staffed reception and take the short tram or U-Bahn hop rather than walking back at 1am.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "The Wiesn has a free Safe Space for women and girls, run by the Sichere Wiesn campaign since 2003. It sits in the Servicezentrum behind the Schottenhamel tent at the \"Erste Hilfe\" entrance, next to the police post. Open daily 18:00–01:00, and from 15:30 on Fridays, Saturdays, Sundays and 2–3 October. Staff will give you somewhere calm to wait, help you get home, walk you to a taxi, and go with you to the police if you want that.",
      "Save the Safe Space number before you go: +49 89 890 57 45 188, staffed during the festival. Emergency numbers are 112 for ambulance and 110 for police.",
      "Skip the Theresienwiese U-Bahn station at peak times — it gets crowded enough that staff sometimes close it. Schwanthalerhöhe (U4/U5), Goetheplatz or Poccistraße (U3/U6) are each about ten minutes' walk and far calmer, as is the S-Bahn to Hackerbrücke.",
      "Tents stop serving around 22:30 and close about 23:30, which produces one enormous simultaneous exit. Leaving half an hour early is the difference between a walk and a crush. (Käfer and the Weinzelt stay open until 01:00, with last orders at 00:30.)",
      "A Maß is a full litre of beer at roughly 6% — stronger than most people expect, and served faster than you can pace. Order water between rounds; every tent serves it.",
      "Since 2023 you can request a fixed fare when booking a Munich taxi by phone or app, which removes the haggling at the ranks.",
      "Agree a meeting point with anyone you arrive with before you go in. Phone signal on the grounds is unreliable at peak times and tents are far too loud for calls.",
    ],
    gettingAround:
      "Munich Airport (MUC) is 40 kilometres out; the S1 and S8 both run into the centre in about 45 minutes and are the cheapest and most predictable option. Memmingen (FMM), sold as \"Munich West\", is really an hour and a half away by coach. In the city, the U-Bahn runs until roughly 01:30 at ten-minute intervals during the festival, and all lines run through the night at 30-minute intervals from Friday to Sunday. Driving is not worth attempting: a large cordon closes the streets around the Theresienwiese and there is no parking at the grounds.",
    faqs: [
      {
        question: "When is Oktoberfest 2026?",
        answer:
          "The 191st Oktoberfest runs from Saturday 19 September to Sunday 4 October 2026 on the Theresienwiese in Munich, sixteen days in total. It opens at noon on the 19th when the Lord Mayor taps the first keg in the Schottenhamel tent; no beer is served before that.",
      },
      {
        question: "Is Oktoberfest safe for a woman on her own?",
        answer:
          "Plenty of women go alone and have a good time. The realistic risks are pickpocketing, drinking more than you planned because a Maß is a full litre, and unwanted attention in crowded tents late in the evening. The festival runs a dedicated free Safe Space for women and girls in the Servicezentrum behind the Schottenhamel tent, staffed by trained women who can help you get home safely — worth knowing where it is before you need it.",
      },
      {
        question: "Do I need a tent reservation?",
        answer:
          "Entry to the grounds and to the tents is free, and there is no ticket for Oktoberfest itself. Tables are a different matter: much of the seating is reserved, and tents close their doors when they fill, particularly on evenings and weekends. Arriving before noon on a weekday gives you a realistic chance of a table without a booking.",
      },
      {
        question: "Where should I stay for Oktoberfest?",
        answer:
          "Anywhere on the U3/U6 or U4/U5 puts you a few minutes from the grounds without paying festival-adjacent prices. Glockenbachviertel and the Altstadt are the easiest bases for a solo trip — central, walkable and lively enough late that you are not the only person on the street. Book early: the whole city fills, not just the streets by the Theresienwiese.",
      },
      {
        question: "How late does public transport run during Oktoberfest?",
        answer:
          "The U-Bahn runs until about 01:30 every night at ten-minute intervals, and every line runs right through the night at 30-minute intervals from Friday to Sunday. Since the tents empty around 23:30, you have time — but the platforms are at their worst in the half hour after closing.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "berlin-marathon-2026",
    slug: "berlin-marathon-2026",
    city: "Berlin",
    country: "Germany",
    eventName: "BMW Berlin Marathon",
    eventShortName: "Berlin Marathon",
    startDate: "2026-09-27",
    endDate: "2026-09-27",
    category: "sports",
    aiSearchTemplate: "safe hotels Berlin near Brandenburg Gate well-lit central",
    placeQuery: "Berlin, Germany",
    venueNotes: "Start and finish at Straße des 17. Juni, Brandenburg Gate",
    whyNow:
      "Around 45,000 runners plus supporters, with an early start time — staying inside the S-Bahn ring near the Tiergarten saves a stressful pre-dawn journey.",
  },
  {
    id: "amsterdam-dance-event-2026",
    slug: "amsterdam-dance-event-2026",
    city: "Amsterdam",
    country: "Netherlands",
    eventName: "Amsterdam Dance Event",
    eventShortName: "ADE",
    startDate: "2026-10-21",
    endDate: "2026-10-25",
    category: "festival",
    aiSearchTemplate: "safe central hotels Amsterdam near canal ring well-lit 24 hour reception",
    placeQuery: "Amsterdam, Netherlands",
    venueNotes: "300+ venues across the city",
    whyNow:
      "ADE's 30th anniversary turns the whole city into the venue for five days and nights. Because events run until the early hours, a central stay with a staffed reception matters more here than the usual city break.",
    knownFor: [
      "Five days of club nights across 300-plus venues",
      "Paradiso and Melkweg, both a short walk from Leidseplein",
      "Warehouse programmes at Westergasfabriek and NDSM Wharf",
      "The canal ring, walkable end to end in under an hour",
    ],
    neighbourhoods: [
      {
        name: "De Pijp",
        description:
          "Dense with restaurants and small bars, dominated by locals rather than stag parties, and on the Noord-Zuidlijn metro. The walk back through residential streets is lit and populated at any hour, which is why it is one of the most commonly recommended bases for women travelling alone. Night buses from Centraal cover the area after the metro stops.",
        verdict: "recommended",
      },
      {
        name: "Jordaan and the canal ring",
        description:
          "The postcard Amsterdam: narrow streets, brown cafés, quiet by midnight. Central enough to walk home from most ADE venues in the centre, calm enough to sleep when you get there. Expensive, and worth it if you want the city rather than the party outside your window.",
        verdict: "recommended",
      },
      {
        name: "Oud-West",
        description:
          "Residential, well connected by tram, and cheaper than the canal ring for the same short distances. De Foodhallen and the Vondelpark are on the doorstep. Night buses from Centraal run out this way after midnight.",
        verdict: "recommended",
      },
      {
        name: "De Wallen (Red Light District) and around Centraal",
        description:
          "Well policed and not dangerous, but between roughly 23:00 and 02:00 the combination of stag groups, narrow bottlenecked streets and heavy drinking makes it the part of central Amsterdam solo travellers most often say they would rather not walk through. The blocks immediately around Centraal Station are the other spot worth avoiding overnight.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Trams and the metro stop around 00:30 — which is roughly when ADE gets going. Plan the way back before you go out: GVB night buses run from 00:30 to 07:30, all starting and ending at Centraal, roughly hourly. A standard one-hour GVB ticket is not valid on them; tap a contactless card or use a day pass.",
      "Night buses are pay-as-you-board by contactless card or phone, tapped at the front of the bus. Drivers do not sell the daytime one-hour ticket, so don't rely on cash or on a ticket you already have.",
      "If you are heading to a party at NDSM in Amsterdam Noord, check the ferry: the NDSM ferry (F4) is not a 24-hour service. Last boats are typically around 02:00 on weeknights and later on Friday and Saturday — confirm in the GVB app before you go out. Missing it means a night bus, a taxi, or the Buiksloterweg ferry (F3), which does run all night but lands you a bike ride or a long walk from NDSM.",
      "Pickpocketing is the realistic risk here, not violence — crowded trams, Centraal Station and busy venue entrances. A zipped bag worn in front covers most of it.",
      "Uber, Bolt and licensed TCA taxis all operate; a central late-night ride is usually in the region of €15 to €25. Book in the app rather than accepting an offer on the street.",
      "Cycling home at 3am is completely normal here, but only if you are sober and confident in traffic. Amsterdam's junctions are unforgiving of hesitation, and bike theft is the city's highest-volume crime.",
    ],
    gettingAround:
      "Schiphol is fifteen to twenty minutes from Centraal by train, running through the night, which makes a late arrival straightforward. In the city, ADE venues are spread across four clusters: the centre (Paradiso, Melkweg, near Leidseplein), Amsterdam West (Westergasfabriek), Noord (NDSM, reached by ferry from behind Centraal) and Zuidoost (the Arena area, on the metro). Staying central keeps you within walking or night-bus distance of most of it; staying in Noord means depending on a ferry that does not run all night.",
    faqs: [
      {
        question: "When is Amsterdam Dance Event 2026?",
        answer:
          "ADE 2026 runs from Wednesday 21 to Sunday 25 October, its 30th anniversary edition. The ADE Pro conference runs Wednesday to Saturday; the festival programme runs across all five days and nights in venues throughout the city.",
      },
      {
        question: "Is there one ticket for ADE?",
        answer:
          "No. ADE is not a single festival with one wristband — individual club nights and concerts are ticketed separately by the venues, and many sell out well in advance. The ADE Pro Pass covers the conference plus access to festival and arts events, which is the closest thing to an all-in ticket.",
      },
      {
        question: "Is Amsterdam safe for a solo woman during ADE?",
        answer:
          "Amsterdam has low violent crime and comparatively little street harassment, and central neighbourhoods stay populated late. The two things that catch people out during ADE are transport and pace: trams stop at 00:30 when the night is just starting, and events run to 6am. Decide how you are getting back before you go out, and keep an eye on your drink in crowded venues as you would anywhere.",
      },
      {
        question: "Where should I stay for ADE?",
        answer:
          "De Pijp, Oud-West and the canal ring are the practical picks: central, residential, well lit, and served by night buses from Centraal. Staying in Noord looks cheap until you realise the NDSM ferry does not run all night. If you want to sleep at all, avoid the streets immediately around Leidseplein and Rembrandtplein.",
      },
      {
        question: "How do I get back to my hotel after 1am?",
        answer:
          "Night buses cover the whole city from 00:30 to 07:30, all of them running from Centraal, and they are CCTV-equipped and busy with people doing exactly what you are doing. Leidseplein and Rembrandtplein are the two main pick-up points besides Centraal, both with taxi ranks. Uber and Bolt work well and are cheap for central journeys.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "web-summit-lisbon-2026",
    slug: "lisbon-web-summit-2026",
    city: "Lisbon",
    country: "Portugal",
    eventName: "Web Summit",
    eventShortName: "Web Summit",
    startDate: "2026-11-09",
    endDate: "2026-11-12",
    category: "other",
    aiSearchTemplate: "safe hotels Lisbon near Parque das Nacoes well-lit metro",
    placeQuery: "Lisbon, Portugal",
    venueNotes: "MEO Arena and FIL, Parque das Nações",
    whyNow:
      "More than 70,000 attendees arrive in one week and Lisbon's hotel stock is small for that. Staying on the red metro line keeps you a direct ride from the venue and out of late-night taxi queues.",
    knownFor: [
      "Parque das Nações, the riverfront district built for Expo '98",
      "Alfama's fado houses and the miradouro viewpoints",
      "Tram 28 through the old city — iconic and heavily pickpocketed",
      "Night Summit events spread across bars in the centre",
    ],
    neighbourhoods: [
      {
        name: "Parque das Nações",
        description:
          "The venue district itself: modern, wide, well lit, and three metro stops from the airport. You trade old-Lisbon atmosphere for walking to the conference in ten minutes and never queueing for a taxi. A sensible pick if your days start early and the evenings are the point.",
        verdict: "recommended",
      },
      {
        name: "Chiado",
        description:
          "Central, upmarket and walkable, with cafés that are comfortable to sit in alone and a metro connection that reaches the venue with one change. The most frequently recommended first-time base in Lisbon for women travelling solo, and quiet enough to sleep while still being somewhere.",
        verdict: "recommended",
      },
      {
        name: "Príncipe Real",
        description:
          "Gentrified, leafy and on a hill above Bairro Alto — close enough to walk down into the nightlife, far enough up that the noise doesn't follow you home. One of the calmer central evening neighbourhoods.",
        verdict: "recommended",
      },
      {
        name: "Bairro Alto and Cais do Sodré",
        description:
          "Where Lisbon drinks. The bar grid is busy and policed until around 3am at weekends and the street-drinking culture keeps people moving through it, so it is rarely empty — but it is loud, crowded and full of bar promoters, and the quieter side streets off it are where petty crime concentrates. Good for a night out, difficult for a night's sleep.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Pickpocketing is Lisbon's one real tourist risk, and Tram 28 is the single most targeted route in the city. Ride it early in the day if you ride it at all, and keep your bag zipped and in front of you.",
      "The metro closes around 01:00. After that, Bolt and Uber are cheap — usually €5 to €10 for a central journey — and both give you a named driver and a fixed fare in the app.",
      "Lisbon is built on hills and cobbles that turn slippery in November rain. Shoes you can walk down a wet calçada in matter more than they sound like they do.",
      "Use ATMs inside bank branches rather than standalone machines on quiet streets; card skimming is the more common financial scam here.",
      "In restaurants, the bread, olives and butter placed on your table are the couvert and will be charged for unless you wave them away. Not a scam, just worth knowing.",
      "Around Intendente and the deeper end of Martim Moniz, the metro station surroundings are the most commonly reported spots for hassle after dark. Fine by day, worth a Bolt at night.",
    ],
    gettingAround:
      "Humberto Delgado Airport sits inside the city, three red-line metro stops from Oriente and the conference — about ten minutes, step-free at both ends, and the simplest airport transfer of any European capital hosting an event this size. For the historic centre, stay on the red line and change at Alameda for the green line or São Sebastião for the blue. The metro runs until around 01:00; after that Bolt and Uber are cheap and plentiful, which matters because Web Summit's Night Summit programme runs in bars across the centre, well away from the venue.",
    faqs: [
      {
        question: "When is Web Summit Lisbon 2026?",
        answer:
          "Web Summit runs from 9 to 12 November 2026 at the MEO Arena and the FIL exhibition centre in Parque das Nações.",
      },
      {
        question: "Where should I stay for Web Summit?",
        answer:
          "Parque das Nações puts you within walking distance of the venue and three metro stops from the airport, which is worth a lot during a week when 70,000 other people are trying to get to the same place. If you would rather be in the old city, stay anywhere on the red line or one change from it — Chiado and Príncipe Real are the easiest central bases for a solo trip.",
      },
      {
        question: "Is Lisbon safe for solo female travellers?",
        answer:
          "Lisbon consistently ranks among the safer European capitals for women travelling alone, with low violent crime and mild street harassment by regional standards. The genuine risk is pickpocketing in crowded tourist spots, and Tram 28 in particular. Central districts stay busy and lit in the evening; the areas worth more care are the quieter side streets off Bairro Alto and around Intendente late at night.",
      },
      {
        question: "How do I get from the airport to the venue?",
        answer:
          "Take the red metro line from Aeroporto to Oriente — three stops, roughly ten minutes, with lifts at both ends. Oriente exits directly into the Vasco da Gama centre and the Parque das Nações esplanade. A taxi or Bolt for the same journey is a few euros and useful with heavy luggage.",
      },
      {
        question: "Do Web Summit hotels sell out?",
        answer:
          "Yes, and earlier than people expect. Lisbon's hotel stock is small relative to a 70,000-person conference, and prices in the surrounding week rise sharply. Booking something with free cancellation as soon as your dates are fixed is the cheap insurance here.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "vienna-christmas-markets-2026",
    slug: "vienna-christmas-markets-2026",
    city: "Vienna",
    country: "Austria",
    eventName: "Vienna Christmas Markets",
    eventShortName: "Vienna Christmas",
    startDate: "2026-11-13",
    endDate: "2026-12-26",
    displayDateRange: "November 13 – December 26, 2026",
    category: "season",
    aiSearchTemplate: "safe central hotels Vienna near Rathausplatz well-lit",
    placeQuery: "Vienna, Austria",
    venueNotes: "Rathausplatz, Spittelberg, Schönbrunn and more",
    whyNow:
      "The Rathausplatz Christkindlmarkt runs from 13 November, with Schönbrunn open into January. Weekends in December are the busiest and priciest — midweek stays inside the Ringstraße are both cheaper and easier to walk home from.",
    knownFor: [
      "The Christkindlmarkt on Rathausplatz, one of Europe's largest",
      "Spittelberg's craft market through the lanes of the 7th district",
      "The Schönbrunn Palace market, open into January",
      "Coffee houses built for sitting alone for two hours",
    ],
    neighbourhoods: [
      {
        name: "Innere Stadt (1st district)",
        description:
          "Inside the Ringstraße, walking distance to Rathausplatz, Stephansplatz and the Freyung market. Expensive, and the reason to pay it is that after a market closes you are ten minutes from your room on lit, busy streets rather than working out a tram. Comfortable to walk at any hour.",
        verdict: "recommended",
      },
      {
        name: "Neubau (7th district)",
        description:
          "The Spittelberg market runs through this district's lanes, surrounded by independent shops and small restaurants along Mariahilfer Straße. Central without Innere Stadt prices, well connected on the U3, and residential enough to be quiet by midnight.",
        verdict: "recommended",
      },
      {
        name: "Wieden and Margareten (4th and 5th)",
        description:
          "South of the centre around the Naschmarkt and Karlsplatz, on the U1, U2 and U4. A short ride to every market, cheaper beds, and streets that stay populated in the evening. A good compromise if the first district is beyond budget.",
        verdict: "recommended",
      },
      {
        name: "Around Praterstern and Westbahnhof",
        description:
          "Both are major interchanges with cheap hotels attached, and both have a visible street-drinking and drug scene at the station entrances that has drawn sustained police attention. The trains and the stations themselves are fine; it is the immediate surroundings late at night that most solo travellers would rather skip.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Vienna's U-Bahn is one of Europe's safest and runs all night on Fridays, Saturdays and before public holidays; on other nights it stops around 00:30 and night buses take over. Markets close well before that, so the timing rarely bites.",
      "Pickpocketing is the one real risk and it concentrates exactly where you are going: crowded market stalls, Stephansplatz, Karlsplatz and the U1 and U3 through the tourist stations. Bag zipped, worn in front, phone out of your back pocket.",
      "Glühwein is served in a real mug with a deposit of a few euros, refunded when you return it. Nobody is trying to overcharge you — the deposit is standard at every market.",
      "Validate a paper transit ticket before you board. Vienna runs proof-of-payment with no barriers and the fine for travelling without a validated ticket is €135 if you pay on the spot.",
      "Ignore the costumed Mozart ticket sellers outside the Staatsoper and Stephansdom. The concerts are real but overpriced; book directly with the venue if you want to go.",
      "December afternoons get dark before 16:00 and the markets run into the evening, so most of your visit happens after sunset. Staying inside the Ringstraße or one U-Bahn stop from it turns the walk home into a non-event.",
    ],
    gettingAround:
      "Vienna International (VIE) is 18 kilometres east. The S7 city train takes about 25 minutes to Wien Mitte for a few euros, and the City Airport Train covers the same route faster for several times the price — check ÖBB before you travel. A regulated taxi to the centre runs €40 to €50, and Bolt and Uber are similar. Once you are in the city there is no reason to use anything but the U-Bahn and trams: the network reaches every market, runs every few minutes, and is clean and visibly staffed.",
    faqs: [
      {
        question: "When do Vienna's Christmas markets open in 2026?",
        answer:
          "The flagship Christkindlmarkt on Rathausplatz runs from 13 November to 26 December 2026, daily from 10:00 to 22:00 (until 18:30 on 24 December). Spittelberg runs 13 November to 23 December, the Freyung market 14 November to 23 December, and Schönbrunn Palace opens earliest and stays latest — 6 November 2026 to 6 January 2027.",
      },
      {
        question: "Which market should I go to if I only have one evening?",
        answer:
          "Rathausplatz is the big one and the one that photographs, but it is also the most crowded. Spittelberg, threaded through the lanes of the 7th district, is the one people tend to prefer once they have seen both: smaller stalls, more craft than tat, and easier to move through. They are fifteen minutes apart on foot.",
      },
      {
        question: "Is Vienna safe for a solo woman in December?",
        answer:
          "Vienna is among the safest large cities in Europe and regularly tops liveability rankings; violent crime against visitors is rare and street harassment is minimal. The realistic risk is pickpocketing in market crowds. Because it gets dark by four, most of a December visit happens after sunset — which is normal here, and the central districts stay busy and well lit.",
      },
      {
        question: "Where should I stay for the Christmas markets?",
        answer:
          "Inside the Ringstraße puts every central market within walking distance, which is worth more in December than it sounds. Neubau near Spittelberg is the best-value central alternative. Weekends in December are both the busiest and the most expensive — a midweek stay costs less and lets you actually reach a stall.",
      },
      {
        question: "How much cash should I bring?",
        answer:
          "Cards are accepted widely in Vienna, but individual market stalls are more mixed, and the Glühwein mug deposit is usually a cash transaction. Carrying twenty or thirty euros in small notes saves hunting for an ATM in the cold.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "amsterdam-light-festival-2026",
    slug: "amsterdam-light-festival-2026",
    city: "Amsterdam",
    country: "Netherlands",
    eventName: "Amsterdam Light Festival",
    eventShortName: "Light Festival",
    startDate: "2026-11-26",
    endDate: "2027-01-17",
    displayDateRange: "November 26, 2026 – January 17, 2027",
    category: "season",
    aiSearchTemplate: "safe central hotels Amsterdam canal ring well-lit",
    placeQuery: "Amsterdam, Netherlands",
    venueNotes: "Along the canal ring, free to walk",
    whyNow:
      "The 15th edition lights the canals for 53 nights on a brand-new route. The artworks are free to walk, which makes this one of the few winter city breaks where the main attraction costs nothing.",
    knownFor: [
      "Light installations along the canal ring, free to walk",
      "Canal cruises and guided walks through the route",
      "The Rijksmuseum, Van Gogh Museum and Anne Frank House",
      "Brown cafés built for a long evening indoors",
    ],
    neighbourhoods: [
      {
        name: "Canal ring (Grachtengordel)",
        description:
          "The route runs through it, so staying here means the festival is the walk home rather than an outing. Quiet after midnight, lit, and the most central base you can pick. Expensive in the way canal-front Amsterdam always is.",
        verdict: "recommended",
      },
      {
        name: "Jordaan",
        description:
          "A few minutes west of the canal ring and calmer than anywhere else this central. Brown cafés with a fire on, a village feel, and streets that stay comfortable to walk in the evening. Good if you want to see the lights and then be somewhere warm and quiet.",
        verdict: "recommended",
      },
      {
        name: "De Pijp",
        description:
          "Twenty minutes' walk or one metro stop from the southern end of the canal ring, with the city's best concentration of restaurants and a locals-first feel. Well lit and busy on the way back, and cheaper than staying on the water.",
        verdict: "recommended",
      },
      {
        name: "Around Centraal Station",
        description:
          "Convenient for arriving and for the ferries, and the least pleasant part of central Amsterdam to be walking through late at night. If you book here, it is worth knowing that the walk south into the canal ring improves within two or three streets.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "It is dark by half four in December, which is the point — but it also means a whole evening of walking in the cold. Waterproof shoes and gloves matter more than they sound like they do; the canals funnel wind.",
      "The artworks are free and outdoors, so there is no ticket to lose and no queue. Paid cruises and walking tours go on sale in October and the good slots go early.",
      "Canal edges in Amsterdam have no railings. That is normal here and fine sober; it is the one genuine hazard of walking the route after a few Glühwein equivalents.",
      "Trams and the metro stop around 00:30, with GVB night buses from 00:30 to 07:30 running from Centraal. The lights go off well before that, so timing is rarely a problem.",
      "Pickpocketing is the realistic risk in viewing crowds and on busy trams. Bag zipped and worn in front covers it.",
      "The lights are switched off on New Year's Eve, and Amsterdam's amateur fireworks that night are genuinely chaotic at street level. Plan somewhere indoors if you are there on the 31st.",
    ],
    gettingAround:
      "Schiphol is fifteen to twenty minutes from Centraal by train, running through the night. Once you are here, the festival route is designed to be walked: the canal ring is compact enough to cross on foot in under an hour, and the lit sections are exactly the streets you would want to be walking anyway. Trams cover the longer hops until about 00:30 and night buses take over after that, all running from Centraal.",
    faqs: [
      {
        question: "When is the Amsterdam Light Festival 2026/27?",
        answer:
          "The 15th edition runs from 26 November 2026 to 17 January 2027 — 53 nights, on a brand-new route through the city to mark the anniversary. The lights typically come on around 17:00 and stay on until 22:00 or 23:00 depending on the night; confirm closer to the date, as the 2026/27 hours have not been published yet.",
      },
      {
        question: "Is it free?",
        answer:
          "The light artworks are free and publicly accessible; you can walk the whole route without paying anything. Canal cruises, bike tours and guided walks are ticketed and are how the non-profit behind the festival funds it. Tickets go on sale on 1 October 2026.",
      },
      {
        question: "Is Amsterdam safe to walk at night in winter?",
        answer:
          "Yes — central Amsterdam has low violent crime and streets that stay populated, and walking the canal ring in the evening is a thing thousands of people do every night of this festival. Pickpocketing in crowds is the realistic risk. The one physical hazard worth naming is that Amsterdam's canals have no railings.",
      },
      {
        question: "Where should I stay to walk the route?",
        answer:
          "Anywhere in or immediately around the canal ring — Grachtengordel itself, the Jordaan just west of it, or De Pijp to the south. All three put the route on your doorstep and give you a lit, populated walk home afterwards.",
      },
      {
        question: "Is it worth going in January rather than December?",
        answer:
          "January is cheaper, quieter and colder. The route is identical and runs to 17 January, so if you would rather see the artworks without December crowds and December hotel prices, the first two weeks of January are the better trip.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "venice-carnival-2027",
    slug: "venice-carnival-2027",
    city: "Venice",
    country: "Italy",
    eventName: "Carnevale di Venezia",
    eventShortName: "Venice Carnival",
    startDate: "2027-01-23",
    endDate: "2027-02-09",
    displayDateRange: "January 23 – February 9, 2027",
    category: "festival",
    aiSearchTemplate: "safe hotels Venice near San Marco well-lit central",
    placeQuery: "Venice, Italy",
    venueNotes: "Piazza San Marco and across the sestieri",
    whyNow:
      "Carnival runs for two and a half weeks, and the final weekend before Shrove Tuesday is the most crowded of the Venetian year. Booking a stay on the main islands avoids the last vaporetto problem after evening events.",
  },
  {
    id: "vienna-opera-ball-2027",
    slug: "vienna-opera-ball-2027",
    city: "Vienna",
    country: "Austria",
    eventName: "Vienna Opera Ball",
    eventShortName: "Opera Ball",
    startDate: "2027-02-04",
    endDate: "2027-02-04",
    category: "other",
    aiSearchTemplate: "safe hotels Vienna near Staatsoper Kärntner Ring well-lit",
    placeQuery: "Vienna, Austria",
    venueNotes: "Wiener Staatsoper, Kärntner Ring",
    whyNow:
      "The 69th Opera Ball ends at 5am, so a hotel within walking distance of the Staatsoper is worth more than the room itself. It is also the peak of Vienna's ball season, when the whole first district books out.",
    knownFor: [
      "The Staatsoper turned into a ballroom for one night",
      "A season of several hundred Viennese balls from January to March",
      "Formal dress: floor-length gown or white tie, strictly enforced",
      "The city's coffee houses and museums the morning after",
    ],
    neighbourhoods: [
      {
        name: "Innere Stadt, around the Staatsoper",
        description:
          "The reason to stay here is the walk home at five in the morning in a floor-length gown and February temperatures. Kärntner Straße, the Ring and the streets behind the opera house are lit and patrolled all night, and you can be in your room in ten minutes rather than negotiating a taxi rank with several hundred other people.",
        verdict: "recommended",
      },
      {
        name: "Wieden (4th district)",
        description:
          "Immediately south of the Ring around Karlsplatz and the Naschmarkt, on the U1, U2 and U4. Ten minutes from the Staatsoper, noticeably cheaper than the first district, and busy enough in the evening to be comfortable.",
        verdict: "recommended",
      },
      {
        name: "Neubau (7th district)",
        description:
          "The Museumsquartier end of the 7th is a short tram ride or twenty-minute walk from the opera house, with independent restaurants and a residential feel. Good value if you want somewhere to be during the day as well as a bed after the ball.",
        verdict: "recommended",
      },
      {
        name: "Around Westbahnhof",
        description:
          "Cheap hotels attached to a major interchange, and a station forecourt with a visible street-drinking scene late at night. The U3 and U6 will get you back at any hour, but the last two hundred metres are the part solo travellers tend to regret booking.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "The ball runs from 20:15 to 05:00 and the dress code is absolute: floor-length gown, or white tie for men. People are turned away. Vienna has a well-established gown rental trade if buying one for a single night makes no sense.",
      "Tickets are sold through the Vienna State Opera directly. Anything offered elsewhere at short notice is worth treating with suspicion, as is the costumed Mozart ticket seller outside the Staatsoper — that is a different, permanent hustle aimed at tourists.",
      "The U-Bahn runs all night on Fridays and Saturdays, and 4 February 2027 is a Thursday — so the network stops around 00:30 and night buses take over long before the ball ends. Either walk, or arrange a taxi in advance rather than joining the 5am rank.",
      "February in Vienna sits around freezing. A gown, a cloakroom and a five-minute walk is manageable; a gown and a twenty-minute wait for a car is not. Cloakroom queues at the end are long.",
      "Pickpocketing in Vienna concentrates on the U1 and U3 through Stephansplatz and Karlsplatz. It is low by European standards but the tourist stations are where it happens.",
      "Validate a paper transit ticket before boarding — Vienna runs proof-of-payment with no barriers and the fine is €135 if you pay on the spot.",
    ],
    gettingAround:
      "Vienna International (VIE) is 18 kilometres east: the S7 city train reaches Wien Mitte in about 25 minutes for a few euros, and the City Airport Train does it faster for several times the price. Check ÖBB before travelling. In the city, the Staatsoper sits on the Ring at Karlsplatz, served by the U1, U2 and U4 and by several tram lines — but on a Thursday night the U-Bahn stops around 00:30, hours before the ball does, so plan the journey back rather than assuming it.",
    faqs: [
      {
        question: "When is the Vienna Opera Ball 2027?",
        answer:
          "The 69th Vienna Opera Ball is on Thursday 4 February 2027 at the Wiener Staatsoper. Doors open at 20:15, the opening ceremony begins at 22:00 with the debutantes and the Blue Danube waltz, and the ball officially ends at 05:00.",
      },
      {
        question: "What is the dress code?",
        answer:
          "Floor-length evening gown for women, white tie for men. It is enforced at the door, not treated as a suggestion. Renting is completely normal — Vienna has a long-established trade in ball gowns and tails precisely because of this season.",
      },
      {
        question: "Can I go to the Opera Ball alone?",
        answer:
          "Yes. It is a ball rather than a paired event, and plenty of people attend solo or in small groups. The practical considerations are the same ones everyone faces: the dress code, the cloakroom queue at the end, and getting home at five in the morning in February — all of which are easier if you are staying within walking distance.",
      },
      {
        question: "Where should I stay for the Opera Ball?",
        answer:
          "Inside the Ring, as close to the Staatsoper as your budget allows. The first district is expensive and this is the one night where it pays for itself: a ten-minute walk home beats a taxi rank shared with several thousand people at 5am. Wieden, just south of Karlsplatz, is the best-value alternative.",
      },
      {
        question: "Is Vienna safe to walk in at night?",
        answer:
          "Vienna is one of the safest large cities in Europe, and the first district is lit, populated and patrolled at all hours — including at five in the morning during ball season, when you will not be the only person in evening dress on the street. The areas worth avoiding late are the immediate surroundings of Praterstern and Westbahnhof.",
      },
    ],
    contentVerified: true,
  },
  {
    id: "keukenhof-2027",
    slug: "keukenhof-tulips-2027",
    city: "Amsterdam",
    country: "Netherlands",
    eventName: "Keukenhof Tulip Season",
    eventShortName: "Keukenhof tulips",
    startDate: "2027-03-18",
    endDate: "2027-05-09",
    displayDateRange: "March 18 – May 9, 2027",
    category: "season",
    aiSearchTemplate: "safe hotels Amsterdam and Leiden near tulip fields well-lit central",
    placeQuery: "Amsterdam, Netherlands",
    venueNotes: "Keukenhof, Lisse — around 40 minutes from Amsterdam",
    whyNow:
      "The gardens open for only 53 days and mid-April is peak bloom, which is also when Amsterdam hotel prices spike. Timed tickets sell out on the busiest dates, so fix the room and the entry slot together.",
  },
  {
    id: "feria-de-abril-seville-2027",
    slug: "seville-feria-de-abril-2027",
    city: "Seville",
    country: "Spain",
    eventName: "Feria de Abril",
    eventShortName: "Feria de Abril",
    startDate: "2027-04-12",
    endDate: "2027-04-18",
    category: "festival",
    aiSearchTemplate: "safe hotels Seville near Los Remedios and city centre well-lit",
    placeQuery: "Seville, Spain",
    venueNotes: "Real de la Feria, Los Remedios",
    whyNow:
      "The 2027 fair falls early, from Lunes de Pescaíto on 12 April to the closing fireworks on the 18th. Seville sells out for the week, and the fairground runs late into the night — staying across the river in Triana or the centre keeps the walk home short.",
  },
  {
    id: "milan-design-week-2027",
    slug: "milan-design-week-2027",
    city: "Milan",
    country: "Italy",
    eventName: "Milan Design Week (Salone del Mobile)",
    eventShortName: "Milan Design Week",
    startDate: "2027-04-13",
    endDate: "2027-04-18",
    category: "other",
    aiSearchTemplate: "safe central hotels Milan near Brera and Porta Nuova well-lit",
    placeQuery: "Milan, Italy",
    venueNotes: "Fiera Milano Rho plus Fuorisalone across the city",
    whyNow:
      "The 65th Salone plus the city-wide Fuorisalone is Milan's most expensive hotel week of the year. Booking early, and near an M1 or M5 stop, is the difference between a 20-minute ride to Rho and an hour each way.",
  },
  {
    id: "primavera-sound-barcelona-2027",
    slug: "barcelona-primavera-sound-2027",
    city: "Barcelona",
    country: "Spain",
    eventName: "Primavera Sound Barcelona",
    eventShortName: "Primavera Barcelona",
    startDate: "2027-06-03",
    endDate: "2027-06-05",
    category: "festival",
    aiSearchTemplate: "safe central hotels Barcelona near Parc del Forum beach well-lit",
    placeQuery: "Barcelona, Spain",
    venueNotes: "Parc del Fòrum, Barcelona",
    whyNow:
      "The 25th edition, with sets running past 3am. Staying on the yellow metro line or in Poblenou means you are not depending on a night bus at the end of it.",
  },
  {
    id: "roskilde-festival-2027",
    slug: "roskilde-festival-2027",
    city: "Copenhagen",
    country: "Denmark",
    eventName: "Roskilde Festival",
    eventShortName: "Roskilde",
    startDate: "2027-06-26",
    endDate: "2027-07-03",
    category: "festival",
    aiSearchTemplate: "safe hotels Copenhagen and Roskilde near festival well-lit central",
    placeQuery: "Copenhagen, Denmark",
    venueNotes: "Roskilde, a 25-minute train from Copenhagen",
    whyNow:
      "A week-long festival where plenty of people skip the campsite and commute in by train. Copenhagen hotels near the Hovedbanegården make that realistic — and give you a locked door at the end of the night.",
  },
  {
    id: "way-out-west-gothenburg-2026",
    slug: "gothenburg-way-out-west-2026",
    city: "Gothenburg",
    country: "Sweden",
    eventName: "Way Out West",
    eventShortName: "Way Out West",
    startDate: "2026-08-13",
    endDate: "2026-08-15",
    category: "festival",
    aiSearchTemplate: "safe central hotels Gothenburg near Slottsskogen Linne well-lit",
    placeQuery: "Gothenburg, Sweden",
    venueNotes: "Slottsskogen, with Stay Out West club nights across the city",
    whyNow:
      "Three days in Slottsskogen followed by club nights around the centre. Staying near Linnéplatsen or Järntorget puts you within walking distance of both, which beats waiting for a night tram.",
  },
];

/** Events whose last day has passed are hidden from the site automatically. */
export function isEventPast(event: Pick<Event, "endDate">, today = todayIso()): boolean {
  return event.endDate < today;
}

/**
 * Dates to pre-fill for a given event: a representative stay rather than the
 * whole run, and never a check-in the rates API can't quote.
 */
export function getEventStayWindow(
  event: Pick<Event, "startDate" | "endDate">,
  today = todayIso(),
): StayWindow | null {
  return getSeasonStayWindow(event.startDate, event.endDate, today);
}

export function getEventBySlug(slug: string): (Event & { dateRange: string }) | undefined {
  const event = events.find((e) => e.slug === slug);
  if (!event) return undefined;
  return {
    ...event,
    dateRange: event.displayDateRange ?? formatEventDateRange(event.startDate, event.endDate),
  };
}

/** Every slug, including finished editions — their pages still resolve. */
export function getAllEventSlugs(): string[] {
  return events.map((e) => e.slug);
}

/** Slugs worth submitting to Google: the ones a visitor can still book for. */
export function getIndexableEventSlugs(today = todayIso()): string[] {
  return events.filter((e) => !isEventPast(e, today)).map((e) => e.slug);
}

function withDateRange(event: Event): Event & { dateRange: string } {
  return {
    ...event,
    dateRange: event.displayDateRange ?? formatEventDateRange(event.startDate, event.endDate),
  };
}

/** Upcoming events, soonest first. */
export function getUpcomingEvents(today = todayIso()): (Event & { dateRange: string })[] {
  return events
    .filter((e) => !isEventPast(e, today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(withDateRange);
}

/**
 * Return up to `limit` upcoming events other than `slug`.
 * Priority order: same city first, then same category, then soonest.
 */
export function getRelatedEvents(
  slug: string,
  limit = 3,
  today = todayIso(),
): (Event & { dateRange: string })[] {
  const current = events.find((e) => e.slug === slug);
  const others = getUpcomingEvents(today).filter((e) => e.slug !== slug);
  const scored = others.map((e) => {
    let score = 0;
    if (current && e.city === current.city) score += 2;
    if (current && e.category === current.category) score += 1;
    return { e, score };
  });
  scored.sort((a, b) => b.score - a.score || a.e.startDate.localeCompare(b.e.startDate));
  return scored.slice(0, limit).map(({ e }) => e);
}

/**
 * Upcoming events whose host city matches `city`, soonest first.
 *
 * Matched loosely because some events sit outside the city they're sold on
 * ("Ferropolis (near Berlin)", "Roskilde / Copenhagen"). City guides use this
 * to link event pages, which is currently their only route to a crawler that
 * has already found the guide.
 */
export function getUpcomingEventsInCity(
  city: string,
  limit = 4,
  today = todayIso(),
): (Event & { dateRange: string })[] {
  const needle = city.trim().toLowerCase();
  if (!needle) return [];
  return getUpcomingEvents(today)
    .filter((e) => e.city.toLowerCase().includes(needle))
    .slice(0, limit);
}

/**
 * For the homepage "Peak dates" block. Only events a visitor can still travel
 * to — a finished event advertises dates the search can't even quote.
 */
export function getEventsForHomepage(limit = 8, today = todayIso()): (Event & { dateRange: string })[] {
  return getUpcomingEvents(today).slice(0, limit);
}

