/**
 * Scalable event-driven landing pages.
 * Add entries here (or later: import from Google Sheet / PredictHQ).
 * Sitemap and /events/[slug] are generated from this array.
 */

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
    whyNow:
      "Post-Winter Olympics buzz; Italy is a top luxury booking destination for 2026 and Milan accommodation demand is well up year-on-year as the Paralympic Winter Games arrive in the city for the first time.",
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
          "Brera is central, walkable and full of galleries, boutiques and cafés that stay lively into the evening. Streets are narrow but well-lit, police patrol visible, and the district is one of the most comfortable bases for solo female travellers on a first Milan trip.",
        verdict: "recommended",
      },
      {
        name: "Porta Nuova / Isola",
        description:
          "The modern skyscraper district around Piazza Gae Aulenti, linked to Isola. Pedestrianised, very well-lit and frequented by locals after work. Easy metro access on M5 (Garibaldi / Isola), which connects directly to the Paralympic venues at the PalaItalia in Santa Giulia.",
        verdict: "recommended",
      },
      {
        name: "Navigli",
        description:
          "The canal district is iconic for evenings out, with bars and restaurants lining Naviglio Grande. The main canal strip is busy and fine for solo travellers, but side streets a few blocks inland can feel quiet late — stick to the canal or rideshare home.",
        verdict: "recommended",
      },
      {
        name: "Milano Centrale (Central Station area)",
        description:
          "Milan's main rail hub is convenient for arrivals but the immediate streets east and north of the station feel transient and less comfortable at night. If you stay here for logistics, pick a hotel on the station's south side (Piazza Duca d'Aosta) or one block toward Porta Nuova.",
        verdict: "caution",
      },
    ],
    safetyTips: [
      "Pickpocketing is the most common issue for tourists — especially on Metro line M1/M3 and around the Duomo. Use a zipped crossbody bag worn in front in crowds.",
      "Use FreeNow, itTaxi, or the official white taxis with meters. Do not accept rides from drivers soliciting at Milano Centrale.",
      "For the Paralympic venues, buy ATM transit passes in advance via the ATM Milano app — avoid ticket-machine queues where scammers sometimes operate.",
      "Restaurants: a 10% coperto/service charge is often already included — check the bill before adding a tip.",
      "March evenings are cold (5–10°C). Well-lit routes are fine, but empty side streets feel colder and quieter — rideshare after 10pm.",
    ],
    gettingAround:
      "Milan has two main airports: Malpensa (MXP, 50 min from centre) and Linate (LIN, 15 min from centre). The Malpensa Express train runs every 30 minutes to Cadorna and Centrale stations and is the safest low-cost option. Linate is now connected to the metro via line M4, which runs directly to the city centre. Within the city, the ATM metro is clean, reliable and the safest way to reach Paralympic venues in Santa Giulia (M3 to Rogoredo or M5 to San Donato, then shuttle).",
    faqs: [
      {
        question: "When is the Milan Paralympics 2026?",
        answer:
          "The Milano Cortina 2026 Paralympic Winter Games run from March 6 to March 15, 2026, with events split between Milan (opening ceremony, ice sports at PalaItalia Santa Giulia) and the Cortina / Valtellina mountain venues. If you want to see both the opening and the mountain events, plan on a full week.",
      },
      {
        question: "Is Milan safe for solo female travellers during the Paralympics?",
        answer:
          "Milan is generally safe for solo women — the bigger risk during major events is pickpocketing in crowded areas, not violent crime. Stay central (Brera, Porta Nuova, Duomo area), use zipped bags, buy transit passes in advance, and stick to the metro or official taxis for late returns from venues.",
      },
      {
        question: "Where should I stay for the Paralympics?",
        answer:
          "For ice events at PalaItalia Santa Giulia, staying along the M3 (yellow) or M5 (lilac) metro lines — Porta Nuova, Brera, or central Duomo — puts you 20–30 minutes from the venue with reliable late-night metro service during the Games. If you're attending opening ceremony at San Siro, hotels near the M5 (Lilla line) are faster.",
      },
      {
        question: "How do I get from Malpensa Airport to central Milan safely?",
        answer:
          "Use the Malpensa Express train, which runs every 30 minutes between Malpensa Terminal 1 and both Milano Cadorna and Milano Centrale stations. Journey time is around 50 minutes, trains are well-lit and staffed, and tickets cost a fraction of airport taxi fares. Avoid unofficial drivers offering rides in arrivals.",
      },
      {
        question: "Do I need to speak Italian?",
        answer:
          "English is widely spoken at Milan hotels, major restaurants and transit information counters, and all Paralympic venues will have multilingual signage and staff. Learning a few basics (buongiorno, grazie, scusi) is appreciated but not required.",
      },
    ],
    contentVerified: false,
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
    whyNow:
      "Popular international spring-break spot with some of the best beaches on Mexico's Pacific coast and a well-developed tourism infrastructure — a safer pick than cartel-affected Mexican destinations further inland.",
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
          "The stretch of mid-to-high-rise beach resorts north of downtown. All-inclusives here have 24/7 reception, bracelet-access beaches and shuttle services. Nightlife happens on-property or in the old town — stay inside the resort grounds after dark or take an Uber into Zona Romántica.",
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
      "Check the US State Department travel advisory for Jalisco before you book — Puerto Vallarta itself is in a lower-risk coastal pocket, but advisory levels can change.",
      "Use Uber or DiDi for rides — both operate reliably in Vallarta and give you a named driver and fare in-app. For airport pickup, buy an authorised taxi voucher inside the terminal before leaving (do not accept curb offers).",
      "Drink only bottled or filtered water; avoid ice in small street stalls. Resorts typically filter their own.",
      "Stick to busy, lit beach stretches (Los Muertos, Hotel Zone) for daytime solo sun. Don't leave valuables on the sand; use a hotel beach locker.",
      "If you join spring-break pool or boat parties, pre-agree with a friend or your hotel reception about a check-in text — and never leave a drink unattended.",
      "ATMs inside bank lobbies (BBVA, Banorte, Santander) are the safest; avoid standalone machines on the Malecón.",
    ],
    gettingAround:
      "Licenciado Gustavo Díaz Ordaz International Airport (PVR) is 10–25 minutes from most hotels. Inside the terminal, buy an authorised taxi voucher or use Uber — Uber drivers meet you at the designated rideshare zone outside the terminal. Local city buses are cheap (around 10 pesos) and generally safe during the day, but can get very crowded at spring-break peak; most solo travellers use Uber at night.",
    faqs: [
      {
        question: "Is Puerto Vallarta safe for solo female travellers during spring break?",
        answer:
          "Puerto Vallarta is considered one of the safer Mexican beach destinations and is a long-standing favourite for solo women and LGBTQ+ travellers. The Zona Romántica and Hotel Zone are busy, staffed and well-lit. Standard precautions apply: use Uber or DiDi at night, stay on populated beach stretches, and keep an eye on your drink at spring-break parties.",
      },
      {
        question: "Where should a solo woman stay in Puerto Vallarta?",
        answer:
          "Zona Romántica (old town) is the top pick for a walkable, welcoming base with boutique hotels, cafés and the beach within blocks. If you prefer a resort experience with 24/7 security and controlled grounds, the Hotel Zone or Marina Vallarta are strong alternatives — pair them with Uber trips into Zona Romántica for dinner and live music.",
      },
      {
        question: "Is it safe to go out at night in Puerto Vallarta?",
        answer:
          "The Malecón, Playa Los Muertos pier area and the main bar streets in Zona Romántica are busy, lit and full of other tourists well into the evening — comfortable for solo travellers. Avoid inland streets in Centro after closing time, stick to licensed bars, and take Uber back to your hotel rather than walking long distances at night.",
      },
      {
        question: "How do I get from Puerto Vallarta airport to my hotel safely?",
        answer:
          "Inside the terminal, purchase an authorised taxi voucher at one of the counters before you exit — prices are fixed by zone and you pay upfront. Alternatively, Uber operates at PVR; walk outside the terminal to the designated rideshare pickup. Ignore drivers offering rides at the curb, and confirm the driver name and plate before getting in.",
      },
      {
        question: "Do I need to speak Spanish?",
        answer:
          "Basic English is widely spoken at hotels, restaurants and taxi stands in Puerto Vallarta's tourist zones. A handful of phrases (hola, gracias, la cuenta por favor) go a long way, and Google Translate covers most gaps outside the tourist core.",
      },
    ],
    contentVerified: false,
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
    venueNotes: "Parc de Saint-Cloud, Paris",
    whyNow: "Major outdoor festival with strong pop, rock and indie acts; chic Parisian vibe mixed with nature.",
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
];

export function getEventBySlug(slug: string): (Event & { dateRange: string }) | undefined {
  const event = events.find((e) => e.slug === slug);
  if (!event) return undefined;
  return {
    ...event,
    dateRange: event.displayDateRange ?? formatEventDateRange(event.startDate, event.endDate),
  };
}

export function getAllEventSlugs(): string[] {
  return events.map((e) => e.slug);
}

/**
 * Return up to `limit` events other than `slug`, as a list of (Event & { dateRange }).
 * Priority order: same city first, then same category, then everything else.
 */
export function getRelatedEvents(
  slug: string,
  limit = 3,
): (Event & { dateRange: string })[] {
  const current = events.find((e) => e.slug === slug);
  const others = events.filter((e) => e.slug !== slug);
  const scored = others.map((e) => {
    let score = 0;
    if (current && e.city === current.city) score += 2;
    if (current && e.category === current.category) score += 1;
    return { e, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ e }) => ({
    ...e,
    dateRange: e.displayDateRange ?? formatEventDateRange(e.startDate, e.endDate),
  }));
}

/** For homepage Trending Events block. Returns first N events (e.g. 8). */
export function getEventsForHomepage(limit = 8): (Event & { dateRange: string })[] {
  return events.slice(0, limit).map((e) => ({
    ...e,
    dateRange: e.displayDateRange ?? formatEventDateRange(e.startDate, e.endDate),
  }));
}

export function getCheckoutDate(endDate: string): string {
  return addDay(endDate);
}
