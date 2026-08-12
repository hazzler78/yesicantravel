import { redirectedDestinationSlugs } from "@/lib/legacyRedirects";

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

/**
 * An official, national support line. Listed so a traveller has a number that
 * works locally before she needs it. Verify against the operator's own page —
 * a wrong number here is worse than no number at all.
 */
export interface SupportLine {
  /** Operator name in the local language, e.g. "Veilig Thuis". */
  name: string;
  number: string;
  /** What it covers, who answers, and which languages. */
  description: string;
}

export interface Destination {
  slug: string;
  city: string;
  country: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  /** aiSearch query for results page */
  aiSearch: string;

  // ---- Event-led destinations only. A year-round city guide leaves these
  // unset and renders a planning section instead of a "Why now?" pitch.

  /**
   * Legacy fixed stay window. Unused by the page, which derives dates from
   * getDefaultStayWindow() so a CTA never points at a stay in the past.
   */
  checkin?: string;
  checkout?: string;

  /** Bold display date range, e.g. "March 6–15, 2026" */
  eventDateRange?: string;
  /** Short event name for badges/CTAs, e.g. "Paralympic Winter Games" */
  eventShortName?: string;
  whyDemand?: string;
  events?: string;

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
  /** Official national support line for the country this city is in. */
  supportLine?: SupportLine;
  /** FAQ items. Rendered as FAQPage JSON-LD for rich results eligibility. */
  faqs?: FAQ[];
  /** Marker: set to true once a human editor has verified the content above. */
  contentVerified?: boolean;
}

export const destinations: Destination[] = [
  // ---- Year-round city guides for the launch markets. These carry the
  // searches women actually make ("safe hotels in Barcelona", "is Amsterdam
  // safe for solo female travellers"), so they lead the list and supply the
  // related-links pool for everything below.
  {
    slug: "barcelona",
    city: "Barcelona",
    country: "Spain",
    headline: "Barcelona for solo female travellers",
    subheadline:
      "A walkable, late-running city where the main risk to plan around is theft, not violence. Here's which neighbourhoods put you near a staffed reception and a metro entrance, and how to get back after midnight.",
    metaTitle: "Safe Hotels in Barcelona for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Barcelona as a solo woman: neighbourhood-by-neighbourhood guidance, metro closing times, pickpocket hotspots to know, and stays with 24/7 reception.",
    aiSearch: "central safe hotel Barcelona Spain well-lit 24-hour reception",
    knownFor: [
      "Gaudí's Sagrada Família, Casa Batlló and Park Güell",
      "The Gothic Quarter's medieval street plan, right in the centre",
      "City beaches you can reach by metro in under 20 minutes",
      "Eixample's grid — wide, straight, well-lit avenues that are hard to get lost in",
      "A dinner culture that starts at 21:00 and runs late",
    ],
    neighbourhoods: [
      {
        name: "Eixample",
        verdict: "recommended",
        description:
          "The 19th-century grid north of Plaça Catalunya, and the easiest part of Barcelona to navigate alone: every block is a right angle, the avenues are wide and lit, and you can always work out which way you're facing. Metro lines L2, L3, L4 and L5 all cross it, and most of the city's hotels with a genuine 24-hour front desk are here.",
      },
      {
        name: "Gràcia",
        verdict: "recommended",
        description:
          "A former village that Barcelona grew around, just north of Eixample. Streets are narrower than the grid but the neighbourhood squares stay busy with residents well into the evening, which is the useful kind of busy. Metro L3 to Fontana or Lesseps; allow 20 minutes to walk down to Passeig de Gràcia.",
      },
      {
        name: "Sant Antoni and Poble-sec",
        verdict: "recommended",
        description:
          "Residential districts west of the centre, built around the Sant Antoni market and the bars on Carrer de Blai. Quieter than the old town, still a 15-minute walk or two metro stops from it, and served by L2 and L3 at Paral·lel.",
      },
      {
        name: "El Raval",
        verdict: "caution",
        description:
          "Central, genuinely interesting and home to the MACBA, but the street pattern is narrow and irregular and some blocks empty out sharply once the bars shut. If you stay here, it's worth knowing your route home in advance and taking a taxi rather than walking the last stretch late at night.",
      },
      {
        name: "La Rambla and the Gothic Quarter",
        verdict: "caution",
        description:
          "The highest concentration of pickpocketing in the city, by a wide margin — the crowds are exactly what makes it work for thieves. It's fine to stay here if you want to be in the middle of everything, but treat your bag accordingly and expect noise until the early hours.",
      },
    ],
    safetyTips: [
      "Theft, not assault, is the realistic risk: Barcelona's problem is skilled pickpocketing, concentrated on La Rambla, metro line L3, the approach to the Sagrada Família and Barceloneta beach. A zipped bag worn across your body and moved to your front on the metro defeats most of it.",
      "Metro hours are unusually generous and worth planning around: Monday to Thursday and Sunday 05:00–00:00, Friday until 02:00, and continuous service all the way through Saturday night. On a Saturday you can always get home underground.",
      "Never leave a bag on the back of a café chair or unattended on the sand — both are the standard set-ups for a snatch, and insurers know it.",
      "If something is stolen you need a denuncia (police report) for any insurance claim. You can file with the Mossos d'Esquadra, and 112 has English-speaking operators.",
      "Spain's 016 line covers all forms of violence against women: free, 24/7, available in 53 languages, and it does not appear on your phone bill. WhatsApp 600 000 016 works too.",
    ],
    gettingAround:
      "The Aerobús runs 24 hours a day, 365 days a year — A1 from Terminal 1 and A2 from Terminal 2 — into Plaça Catalunya via Plaça Espanya and Plaça Universitat, taking roughly 30–35 minutes. It's staffed, has a luggage hold and drops you in the middle of the city, which makes it the simplest option on a late arrival. The R2 Nord train to Sants and Passeig de Gràcia is quicker and cheaper but only serves Terminal 2 and stops before midnight. Metro line L9 Sud reaches both terminals but charges an airport supplement.",
    supportLine: {
      name: "016 – Servicio de atención a la violencia contra las mujeres",
      number: "016",
      description:
        "Free and confidential, 24 hours a day, in 53 languages including English. It leaves no trace on your phone bill and can transfer you straight to 112. Also reachable on WhatsApp at 600 000 016.",
    },
    faqs: [
      {
        question: "Is Barcelona safe for solo female travellers?",
        answer:
          "Barcelona is generally comfortable for women travelling alone — the centre is busy late, dinner runs past midnight and you will rarely be the only person on the street. The honest caveat is theft: the city has one of Europe's highest rates of pickpocketing against visitors. Plan for your bag rather than for your safety and you'll have a straightforward trip.",
      },
      {
        question: "Which area should I stay in as a solo woman?",
        answer:
          "Eixample is the easiest first choice: the grid makes navigation almost impossible to get wrong, the avenues are wide and lit, and it has the highest concentration of hotels with round-the-clock reception. Gràcia and Sant Antoni are good alternatives if you'd rather be somewhere residential and still be two metro stops from the centre.",
      },
      {
        question: "How late does the Barcelona metro run?",
        answer:
          "From Monday to Thursday and on Sundays it runs 05:00 to midnight. On Fridays and the eves of public holidays it runs until 02:00, and on Saturdays it runs continuously through the night. Those times are when the last train leaves the end of the line, so a station in the middle of a route may see it slightly later.",
      },
      {
        question: "What should I do if I'm pickpocketed?",
        answer:
          "File a denuncia with the Mossos d'Esquadra — you will need the report number for any insurance claim, and most policies want it the same day. Call 112 if you need help immediately; English-speaking operators are available. Cancel cards first, report second, unless you're hurt.",
      },
      {
        question: "Is it safe to walk back to my hotel at night?",
        answer:
          "On the main Eixample avenues and around the Gràcia squares, plenty of women do. Around El Raval and the narrower Gothic Quarter lanes the picture changes once the bars close and the streets empty. Barcelona's taxis are metered, plentiful and can be flagged down when the roof light is on, so the last stretch home is an easy thing to buy.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    headline: "Amsterdam for solo female travellers",
    subheadline:
      "Small, flat and easy to cross on foot — with two things that catch visitors out: the trams stop just after midnight, and the red asphalt is a bike road, not a pavement. Here's how to stay somewhere calm and get home after the last tram.",
    metaTitle: "Safe Hotels in Amsterdam for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Amsterdam as a solo woman: neighbourhood guidance, night bus routes from Centraal, the tram cut-off, and stays with 24/7 reception near a station.",
    aiSearch: "central safe hotel Amsterdam Netherlands well-lit near station",
    knownFor: [
      "The UNESCO-listed canal ring, walkable end to end in under an hour",
      "The Rijksmuseum, Van Gogh Museum and Anne Frank House",
      "A cycling culture that genuinely dominates the streets",
      "The Jordaan's narrow lanes and brown cafés",
      "Rail connections that make Haarlem, Utrecht and the coast easy day trips",
    ],
    neighbourhoods: [
      {
        name: "Jordaan",
        verdict: "recommended",
        description:
          "Immediately west of the centre and the neighbourhood most solo visitors end up recommending: narrow streets, canal-side cafés and a residential population that keeps it lived-in rather than touristy after dark. It's a 10–15 minute walk from Centraal — and walking is currently the reliable way in, because roadworks have taken the trams off Westermarkt until early 2027.",
      },
      {
        name: "Oud-Zuid and the Museum Quarter",
        verdict: "recommended",
        description:
          "Wide streets, generous pavements and the three big museums, about 15 minutes by tram from the centre. It's noticeably quieter at night than the canal belt, which suits some travellers and bores others. Trams 2 and 5 run through it.",
      },
      {
        name: "De Pijp",
        verdict: "recommended",
        description:
          "South of the centre around the Albert Cuyp market, and busy with residents rather than visitors — the restaurants here fill with people who live locally. The Noord/Zuidlijn metro (line 52) stops at De Pijp, putting you a few minutes from Centraal.",
      },
      {
        name: "Amsterdam-Oost",
        verdict: "recommended",
        description:
          "Residential and increasingly popular, built around the Oosterpark and Dappermarkt. Rooms cost less than in the centre and several tram lines connect you in, but you're committing to a tram ride rather than a walk home.",
      },
      {
        name: "De Wallen (Red Light District)",
        verdict: "caution",
        description:
          "Central and unavoidable if you're sightseeing, but as a place to sleep it is loud until very late, extremely crowded at weekends and heavy on stag-party drinking. Pickpockets work the crush. The city deploys street coordinators at peak times, which tells you something about the volume.",
      },
    ],
    safetyTips: [
      "Trams and metro stop running shortly after midnight. Eleven GVB night buses take over, all departing from Amsterdam Centraal roughly hourly between 00:30 and 07:30 — so if you're out late, Centraal is the point you navigate back to.",
      "A standard one-hour GVB ticket is not valid on a night bus. You need a night fare, a day or multi-day pass, or you can tap a contactless card via OVpay.",
      "The red asphalt is a road. Cyclists move fast, have priority and will not expect you to step onto it — look both ways before crossing, including when leaving a tram.",
      "Trains between Centraal and Schiphol run right through the night, roughly hourly, so a very early or very late flight never requires a taxi.",
      "Canals mostly have no railings and the water is cold and deep. It is the reason Amsterdam advises against walking canal edges after a heavy night out.",
      "Veilig Thuis on 0800-2000 is the national advice line for domestic violence and child abuse — free, 24/7, and you can stay anonymous. 112 is the emergency number.",
    ],
    gettingAround:
      "Schiphol has a railway station directly beneath the terminal, so you never go outside: trains to Amsterdam Centraal take 15–20 minutes, run four to six times an hour during the day and continue hourly through the night. Centraal itself is staffed around the clock and is the hub for every night bus, which makes it the most reliable place to arrive alone at an awkward hour. From there, most canal-ring hotels are a short tram ride or a walk of 10–20 minutes.",
    supportLine: {
      name: "Veilig Thuis",
      number: "0800-2000",
      description:
        "The Dutch national advice and reporting line for domestic violence and child abuse. Free, 24 hours a day, and you can stay anonymous.",
    },
    faqs: [
      {
        question: "Is Amsterdam safe for solo female travellers?",
        answer:
          "Yes, by most measures — the city is compact, well lit, busy into the evening and used to visitors travelling alone. The two things that actually cause visitors trouble are traffic (specifically bikes) and the crush in the Red Light District at weekends. Neither requires you to change your plans, only to know about them.",
      },
      {
        question: "Where should I stay in Amsterdam as a solo woman?",
        answer:
          "The Jordaan is the usual answer: central enough to walk everywhere, residential enough to be calm at night. De Pijp and Oud-Zuid are good if you'd rather trade a 10-minute tram ride for lower prices and more space. Staying within a short walk of a tram stop or metro station matters more here than the specific neighbourhood.",
      },
      {
        question: "How do I get around after the trams stop?",
        answer:
          "GVB runs eleven night bus lines every night. They all start from Amsterdam Centraal and run about once an hour from 00:30 until 07:30. Check the departure time before you set out — an hourly service is unforgiving if you miss one. Your standard one-hour ticket will not be valid; use a day pass or tap contactless.",
      },
      {
        question: "Is the Red Light District safe to walk through?",
        answer:
          "It's busy and heavily policed rather than dangerous, and plenty of women walk through it. The realistic risks are pickpocketing in the crowds and aggressive drunkenness at weekends. Photographing the windows is prohibited and provokes confrontation. If you want to see it, a weekday evening is a very different experience from a Saturday.",
      },
      {
        question: "Do I need to worry about the bikes?",
        answer:
          "More than you'd expect. Cyclists have right of way on the red asphalt, travel faster than they look, and often don't have lights. The most common visitor accident is stepping off a tram or out of a doorway straight into a bike lane. Look both ways, every time.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    headline: "Paris for solo female travellers",
    subheadline:
      "A city built for walking alone, with an excellent late metro and a well-rehearsed set of street scams. Here's where to base yourself, how the last train really works, and which approaches to ignore.",
    metaTitle: "Safe Hotels in Paris for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Paris as a solo woman: arrondissement-by-arrondissement guidance, last metro and Noctilien night buses, common scams, and stays with 24/7 reception.",
    aiSearch: "central safe hotel Paris France well-lit 24-hour reception",
    knownFor: [
      "The Louvre, Musée d'Orsay and a museum pass that pays for itself in two days",
      "Café terraces designed for sitting alone without anyone minding",
      "The Marais, Saint-Germain and Canal Saint-Martin for evening walking",
      "Versailles and Giverny as day trips by train",
      "A metro dense enough that you're rarely more than 500 metres from a station",
    ],
    neighbourhoods: [
      {
        name: "Le Marais (3rd and 4th)",
        verdict: "recommended",
        description:
          "Central, historic and one of the few parts of Paris that stays genuinely busy on a Sunday. The streets are narrow but populated late, and it's within walking distance of Notre-Dame, the Pompidou and the Seine. Metro lines 1, 8 and 11 all serve it.",
      },
      {
        name: "Saint-Germain-des-Prés (6th)",
        verdict: "recommended",
        description:
          "Left bank, well lit and consistently calm, with the Luxembourg Gardens at one end and the river at the other. It's more expensive than the average and quieter after midnight, which is exactly what some solo travellers want. Metro lines 4 and 10.",
      },
      {
        name: "Latin Quarter (5th)",
        verdict: "recommended",
        description:
          "Student territory around the Sorbonne, which means cheaper food, lively streets on weeknights and plenty of people about when you walk back. Good rail links via RER B and metro line 10.",
      },
      {
        name: "Canal Saint-Martin (10th)",
        verdict: "recommended",
        description:
          "Residential and popular with Parisians in the evening, particularly along the canal in summer. It's a real neighbourhood rather than a sight, and a short metro ride from the centre on lines 5 and 11.",
      },
      {
        name: "Around Gare du Nord and Barbès (18th)",
        verdict: "caution",
        description:
          "Hotel prices are low here for a reason. The area immediately around the station is busy at all hours and heavily worked by touts and pickpockets, and several surrounding streets empty out late. Convenient for Eurostar, less comfortable for a first solo trip.",
      },
    ],
    safetyTips: [
      "The last metro reaches the end of the line around 01:15 Sunday to Thursday and around 02:15 on Fridays, Saturdays and the eves of public holidays. If you board mid-route the last train passes 15 to 30 minutes earlier — aim for the second-to-last train, not the last.",
      "When the metro stops, Noctilien night buses run from 00:30 to 05:30 across 48 lines, organised around five hubs: Châtelet, Gare de l'Est, Gare de Lyon, Gare Montparnasse and Gare Saint-Lazare.",
      "Learn the three standard street approaches and you can dismiss all of them: the clipboard petition (usually near the Louvre, Sacré-Cœur or the Eiffel Tower), the friendship bracelet tied onto your wrist at the Montmartre steps, and the three-cup game. All are distraction set-ups with an accomplice.",
      "Only take taxis from an official rank or booked through an app. A Paris taxi has a roof sign and a visible meter; anyone approaching you inside a station or airport terminal offering a ride is not a licensed taxi.",
      "3919, Violences Femmes Info, is the national listening and referral line for women — free, anonymous, 24/7, and the call does not appear on the phone bill. 112 is the general emergency number and 17 reaches the police directly.",
    ],
    gettingAround:
      "From Charles de Gaulle, the RER B reaches Gare du Nord and Châtelet in 30–35 minutes and is the fastest route, though it is crowded and stops around midnight; the Roissybus to Opéra is slower but keeps your luggage with you and drops you centrally. From Orly, metro line 14 now runs directly into the middle of Paris, which has made that airport considerably simpler to arrive at alone. Within the city, walking plus the metro covers almost everything, and a Navigo Easy card saves fumbling for tickets at a machine late at night.",
    supportLine: {
      name: "Violences Femmes Info",
      number: "3919",
      description:
        "The French national listening, information and referral line for women experiencing violence. Anonymous, free, 24 hours a day, and the call does not appear on the phone bill.",
    },
    faqs: [
      {
        question: "Is Paris safe for solo female travellers?",
        answer:
          "Paris is well suited to solo travel — the city is dense, the metro is comprehensive and eating alone at a café is entirely normal. The realistic problems are pickpocketing on the busiest metro lines and around the major monuments, and persistent street approaches that are usually scams rather than threats. Neither is a reason to avoid the city.",
      },
      {
        question: "Which arrondissement should I stay in?",
        answer:
          "The Marais (3rd and 4th) is the strongest all-round choice: central, walkable and busy in the evening. Saint-Germain (6th) is calmer and more expensive; the Latin Quarter (5th) is livelier and cheaper. All three put you within walking distance of the river and on multiple metro lines, which matters more than the postcode.",
      },
      {
        question: "What time does the Paris metro stop?",
        answer:
          "The last train arrives at the terminus at about 01:15 from Sunday to Thursday, and about 02:15 on Friday and Saturday nights and before public holidays. Because those are terminus times, the last train through a mid-line station is earlier — typically 15 to 30 minutes. Check your own station rather than the headline time.",
      },
      {
        question: "How do I avoid the common Paris scams?",
        answer:
          "Keep walking and say nothing. The petition, the bracelet and the cup game all depend on you stopping and engaging, and all involve a second person working your bag while you're occupied. None of them escalate if you simply don't break stride. They cluster around the Eiffel Tower, Sacré-Cœur and the Louvre.",
      },
      {
        question: "Is it safe to use the metro alone at night?",
        answer:
          "Generally yes, and many Parisian women do it nightly. Carriages towards the middle of the train are usually busier, platforms are covered by CCTV, and the network is well used until closing. The bigger practical risk is misjudging the last train and being stranded, which is why the Noctilien network is worth knowing before you go out.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    headline: "Berlin for solo female travellers",
    subheadline:
      "Spread out, relaxed and unusually good for anyone out late — the U-Bahn and S-Bahn simply don't stop at weekends. Here's how the night network works and which districts suit a solo trip.",
    metaTitle: "Safe Hotels in Berlin for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Berlin as a solo woman: district guidance, 24-hour weekend U-Bahn and night buses, ticket rules, and stays with 24/7 reception near transport.",
    aiSearch: "central safe hotel Berlin Germany well-lit near U-Bahn",
    knownFor: [
      "The Brandenburg Gate, Reichstag dome and Museum Island",
      "East Side Gallery and the Berlin Wall Memorial on Bernauer Straße",
      "A nightlife scene that genuinely runs until morning",
      "More green space and water than almost any other European capital",
      "Distances that make the U-Bahn essential rather than optional",
    ],
    neighbourhoods: [
      {
        name: "Mitte",
        verdict: "recommended",
        description:
          "The historic centre and where most of the landmarks are. Transport is at its densest here, hotels tend to be larger with proper 24-hour front desks, and the streets around Hackescher Markt stay busy in the evening. The trade-off is that parts of Mitte are office districts that empty at night.",
      },
      {
        name: "Prenzlauer Berg",
        verdict: "recommended",
        description:
          "North-east of Mitte, largely residential, with wide leafy streets, cafés and a strong local population. It's the district visitors most often describe as feeling calm after dark. The U2 runs through it and the tram network fills the gaps.",
      },
      {
        name: "Charlottenburg",
        verdict: "recommended",
        description:
          "The old West Berlin centre, built around the Kurfürstendamm boulevard. Wide, well-lit streets, department stores, and a quieter, more established feel than the east. Well served by both U-Bahn and S-Bahn, roughly 20 minutes from Mitte.",
      },
      {
        name: "Friedrichshain and Kreuzberg",
        verdict: "caution",
        description:
          "The centre of Berlin's nightlife and genuinely enjoyable, but very busy and very drunk after dark, especially around Warschauer Straße and the Simon-Dach-Straße bars. Fine to go out in; less restful to sleep in if you want quiet.",
      },
      {
        name: "Kottbusser Tor and Görlitzer Park",
        verdict: "caution",
        description:
          "Both are well known locally for an open drug scene, which the city acknowledges and polices. You are unlikely to be targeted, but the atmosphere at night is not comfortable for everyone and it is worth choosing deliberately rather than by accident when booking.",
      },
    ],
    safetyTips: [
      "On Friday and Saturday nights and before public holidays, the U-Bahn and S-Bahn run all night — U-Bahn roughly every 15 minutes, S-Bahn every 30 (the U4 is the exception). That makes Berlin one of the easiest European cities to get home in at 04:00.",
      "From Sunday to Thursday the trains stop around 01:00 to 01:30 and night buses take over. The N-prefixed lines N1–N3 and N5–N9 follow the corresponding U-Bahn routes (there is no N4, matching the U4 which does not run at night), so the replacement is usually a bus with the same number as the line you wanted.",
      "The MetroTram runs 24 hours a day, every 30 minutes from 00:30, which covers much of the east when the trains are down.",
      "Buy and validate a ticket before you board. There are no barriers, inspections are frequent, inspectors are in plain clothes and the penalty fare is €60 with no discretion for tourists.",
      "Berlin still runs on cash to a surprising degree — plenty of bars, Spätis and smaller restaurants take no cards at all. Carry enough for a taxi home.",
      "The Hilfetelefon on 116 016 is free, staffed 24/7, and offers interpreting in a range of languages. 112 is the emergency number; 110 reaches the police.",
    ],
    gettingAround:
      "Berlin Brandenburg's railway station sits directly under Terminal 1, so the transfer is entirely indoors. The FEX airport express reaches Hauptbahnhof in about 30 minutes and runs every half hour; the S9 and S45 are slower but hit more of the city directly, and regional trains cover the same route. Note that the airport is in fare zone C, so you need an ABC ticket rather than the standard AB. Within the city, distances are long enough that walking between districts is rarely realistic — plan around the U-Bahn.",
    supportLine: {
      name: "Hilfetelefon Gewalt gegen Frauen",
      number: "116 016",
      description:
        "Germany's national violence-against-women helpline. Free, anonymous, staffed around the clock, with interpreters available in many languages.",
    },
    faqs: [
      {
        question: "Is Berlin safe for solo female travellers?",
        answer:
          "Berlin is widely considered one of the more comfortable European capitals for women travelling alone. It's tolerant, informal and used to people doing their own thing, and the transport network runs late enough that you're rarely stuck. The most common problems reported by visitors are pickpocketing at crowded stations and around Alexanderplatz, and the general unpleasantness of a few specific late-night hotspots.",
      },
      {
        question: "Which district should I stay in?",
        answer:
          "Prenzlauer Berg if you want somewhere residential and calm, Mitte if you want to walk to the landmarks, Charlottenburg if you'd prefer wide, well-lit streets and a quieter west-side feel. Friedrichshain and Kreuzberg are excellent for going out and less restful for sleeping.",
      },
      {
        question: "Does Berlin public transport run all night?",
        answer:
          "At weekends, yes. On Friday and Saturday nights and before public holidays the U-Bahn and S-Bahn run continuously, at roughly 15 and 30 minute intervals. On weeknights they stop between about 01:00 and 01:30, and night buses numbered N1–N3 and N5–N9 follow the U-Bahn routes until service resumes.",
      },
      {
        question: "Do I really need to buy a ticket if there are no barriers?",
        answer:
          "Yes. Berlin runs an honour system backed by frequent plain-clothes inspections, and the penalty fare is €60 regardless of whether you understood the system. Validate the ticket in the machine on the platform before boarding, and remember the airport is in zone C.",
      },
      {
        question: "Is it safe to go out alone at night in Berlin?",
        answer:
          "It's normal, and the all-night weekend transport makes it more practical than in most cities. The standard precautions apply in the busiest nightlife areas — keep your drink with you, keep your phone and bag secured in crowds around Warschauer Straße, and have a route home in mind before you set off rather than after.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    headline: "Milan for solo female travellers",
    subheadline:
      "A working city rather than a museum, compact in the centre and easy to cross by metro — as long as you know it shuts around 00:30. Here's where to stay and how the night network fills the gap.",
    metaTitle: "Safe Hotels in Milan for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Milan as a solo woman: neighbourhood guidance, metro closing times and night buses, airport transfers, and stays with 24/7 reception.",
    aiSearch: "central safe hotel Milan Italy well-lit near metro",
    knownFor: [
      "The Duomo and the Galleria Vittorio Emanuele II",
      "Leonardo's Last Supper, which needs booking weeks ahead",
      "Design and fashion, with Salone del Mobile taking over the city each spring",
      "Aperitivo culture, where a drink comes with enough food to be dinner",
      "Rail links that put Lake Como, Turin and Venice within a day trip",
    ],
    neighbourhoods: [
      {
        name: "Centro Storico and Duomo",
        verdict: "recommended",
        description:
          "The historic core, busy with commuters and visitors from early until late, and served by both M1 and M3 at Duomo. Staying here means you can walk to most of what you came for and always find people on the street, at the cost of higher prices and some traffic noise.",
      },
      {
        name: "Brera",
        verdict: "recommended",
        description:
          "Just north of the centre, with narrow streets, galleries and restaurants that stay busy through the evening. It's one of the more pleasant parts of Milan to walk around after dinner. M2 stops at Lanza and it's a 10-minute walk to the Duomo.",
      },
      {
        name: "Porta Nuova and Isola",
        verdict: "recommended",
        description:
          "The modern district around Porta Garibaldi station: wide pavements, bright lighting, contemporary hotels and a major transport interchange on M2 and M5. It feels different from historic Milan and is a good choice if you value clear sightlines and easy transport over character.",
      },
      {
        name: "Navigli",
        verdict: "caution",
        description:
          "The canal district and the centre of Milan's evening drinking. Excellent for an aperitivo, crowded and loud late, and a fair distance from the main sights. Worth visiting; consider whether you want to sleep there.",
      },
      {
        name: "Around Stazione Centrale",
        verdict: "caution",
        description:
          "Convenient for trains and well supplied with cheap hotels, but the station and the streets immediately east of it are busy at all hours in a way that many solo travellers find uncomfortable late at night. If you book here, favour a hotel on the main avenues with a staffed lobby.",
      },
    ],
    safetyTips: [
      "The metro closes early by European standards. The last departures from the terminals on M1, M2, M3 and M4 are around 00:30, and M5 finishes earlier, closer to midnight. Build that into your evening.",
      "After closing, ATM's night buses take over and follow the metro routes directly: NM1, NM2, NM3 and NM4 shadow the corresponding lines, and N25/N26 links Centrale with Cadorna. The standard €2.20 urban ticket is valid on them.",
      "Pickpocketing concentrates on M1 and M3 around the Duomo, at Stazione Centrale, and on the historic tram 1. The technique is usually a crowd at the doors as they close.",
      "Validate your ticket before travelling — Milan's inspectors check regularly and an unvalidated ticket counts as no ticket.",
      "Linate is inside the urban fare zone and reachable on M4 with a normal ticket; Malpensa is not, and needs the Malpensa Express or a coach.",
      "Italy's 1522 anti-violence and stalking line is free, staffed 24/7 and answers in several languages. 112 is the single emergency number.",
    ],
    gettingAround:
      "From Malpensa, the Malpensa Express train runs to Milano Centrale and Milano Cadorna in roughly 50 minutes, from about 05:30 until the last services around 00:30–00:40. From Linate, metro line M4 now runs directly into the centre — San Babila in about 15 minutes on a standard urban ticket, which is the cheapest and simplest airport transfer of any major Italian city. It runs until roughly 00:30, after which the NM4 bus covers the same route all night. In the centre itself, the area inside the ring is comfortably walkable.",
    supportLine: {
      name: "Numero Nazionale Anti Violenza e Stalking",
      number: "1522",
      description:
        "Italy's national anti-violence and anti-stalking line. Free, 24 hours a day, with support available in several languages including English.",
    },
    faqs: [
      {
        question: "Is Milan safe for solo female travellers?",
        answer:
          "Milan is a large working city and behaves like one: busy and businesslike by day, quieter in the centre at night than Rome or Naples. Violent crime against visitors is rare; pickpocketing on the metro and around the Duomo is common. Most solo travellers find it straightforward, particularly if they stay inside the ring.",
      },
      {
        question: "Where should I stay in Milan as a solo woman?",
        answer:
          "Brera and the Centro Storico put you within walking distance of most sights and keep you on well-used streets in the evening. Porta Nuova is a good alternative if you prefer modern buildings, wide pavements and a major transport interchange on the doorstep. Around Stazione Centrale is cheaper but less comfortable late.",
      },
      {
        question: "What time does the Milan metro close?",
        answer:
          "Last departures from the end of the line are around 00:30 on M1, M2, M3 and M4, and closer to midnight on M5. That's earlier than most visitors expect. The NM1 to NM4 night buses then follow the same routes through the night, and are covered by the same €2.20 urban ticket.",
      },
      {
        question: "How do I get from the airport to the city?",
        answer:
          "From Linate, take metro line M4 — it runs directly into the centre in about 15 minutes on an ordinary urban ticket. From Malpensa, the Malpensa Express train runs to Centrale or Cadorna in around 50 minutes, with last departures near 00:40. Both drop you at staffed stations with taxi ranks outside.",
      },
      {
        question: "Is Milan walkable at night?",
        answer:
          "Inside the ring, yes, and the routes between Brera, the Duomo and Porta Nuova stay populated well into the evening. Further out the city becomes low-rise and quiet quickly. Milan's taxis are metered and wait at official ranks rather than being flagged down, so plan to reach a rank or book one in advance.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "london",
    city: "London",
    country: "UK",
    headline: "London for solo female travellers",
    subheadline:
      "Enormous, well policed and staffed at every station — with one rule that genuinely matters: never get into a minicab you didn't book. Here's how the night network works and where to base yourself.",
    metaTitle: "Safe Hotels in London for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in London as a solo woman: area guidance, Night Tube lines, the licensed taxi and minicab rules, and stays with 24/7 reception near a station.",
    aiSearch: "central safe hotel London UK well-lit near tube station",
    knownFor: [
      "World-class museums with free general admission",
      "West End theatre, easy to do alone on a single seat",
      "Royal parks big enough to lose an afternoon in",
      "Markets from Borough to Broadway to Columbia Road",
      "A transport network with staff at every Tube station, first train to last",
    ],
    neighbourhoods: [
      {
        name: "South Kensington",
        verdict: "recommended",
        description:
          "Residential, well lit and built around the three big free museums. It's quiet in the evening in a genteel rather than deserted way, and the District, Circle and Piccadilly lines all stop here — the last of which runs to Heathrow.",
      },
      {
        name: "Bloomsbury",
        verdict: "recommended",
        description:
          "Central, full of garden squares and university buildings, and within walking distance of the British Museum, Covent Garden and both King's Cross and Euston. A long-standing choice for solo travellers because it's genuinely central without being nightlife territory.",
      },
      {
        name: "Marylebone",
        verdict: "recommended",
        description:
          "A village-like high street just north of Oxford Street, calm at night but two minutes from one of the busiest shopping areas in Europe. Served by the Bakerloo, Jubilee and Elizabeth lines at Bond Street and Baker Street.",
      },
      {
        name: "King's Cross",
        verdict: "recommended",
        description:
          "Comprehensively rebuilt over the last two decades into a bright, open, heavily used district. Six Tube lines plus national and international rail meet here, which makes it the single best-connected place to stay if you're arriving late or leaving early.",
      },
      {
        name: "Soho and Leicester Square",
        verdict: "caution",
        description:
          "The heart of the West End and hugely enjoyable, but crowded and drink-heavy every night of the week. Rooms are small and expensive, noise runs late, and the crush around Leicester Square is where pickpockets and unbooked minicab touts concentrate.",
      },
    ],
    safetyTips: [
      "Only black taxis — the ones with the orange 'taxi' light — can be hailed on the street or taken from a rank. Every minicab must be booked in advance through a licensed operator by app, phone or in person; an unbooked minicab is illegal and carries no passenger insurance.",
      "When a booked minicab arrives you will have a confirmation with the driver's name, licence number and registration plate. If the car or the driver doesn't match, don't get in. Touts outside clubs and stations are the specific thing this rule exists to protect you from.",
      "The Night Tube runs on Friday and Saturday nights on the Victoria, Central, Jubilee, Northern and Piccadilly lines. Night buses run 24 hours a day, every night, and all of them carry CCTV.",
      "Every Tube, Elizabeth line and London Overground station is staffed from the first train to the last, so there is always someone to approach on a platform or at a gateline.",
      "Phone snatching from the kerb — often by moped or bicycle — is a known problem in central London. Don't stand at the edge of the pavement using your phone, particularly around Oxford Street, Soho and the South Bank.",
      "999 is the emergency number (112 also works). To report something on the rail network without calling, text the British Transport Police on 61016. The National Domestic Abuse Helpline is 0808 2000 247.",
    ],
    gettingAround:
      "From Heathrow, the Piccadilly line runs directly into central London for the price of a normal fare and keeps going all night on Fridays and Saturdays; the Elizabeth line is faster to Paddington and the City. Gatwick connects to Victoria and London Bridge by Gatwick Express, Thameslink and Southern, and Stansted to Liverpool Street. All of them deposit you at a staffed station with a marked taxi rank. Within the city, tap in and out with a contactless card — it caps your daily spend automatically and there's no need to buy anything in advance.",
    supportLine: {
      name: "National Domestic Abuse Helpline",
      number: "0808 2000 247",
      description:
        "Free and confidential, run by Refuge and staffed 24 hours a day. For anything happening on the rail network, the British Transport Police also take reports by text on 61016.",
    },
    faqs: [
      {
        question: "Is London safe for solo female travellers?",
        answer:
          "London is well suited to solo travel: the transport network is staffed and monitored, the centre is busy at almost every hour, and travelling or eating alone attracts no attention. The realistic risks are opportunistic — phone snatching, pickpocketing in crowds, and unlicensed minicab drivers outside nightlife areas.",
      },
      {
        question: "Which area should I stay in?",
        answer:
          "South Kensington and Bloomsbury are the classic solo choices: central, calm in the evening and near several Tube lines. King's Cross is the best-connected option if your flights or trains are at awkward hours. Soho puts you in the middle of everything at the cost of noise, crowds and price.",
      },
      {
        question: "How do I get home safely at night?",
        answer:
          "Night buses run 24 hours a day across the whole network and all have CCTV. On Friday and Saturday nights the Victoria, Central, Jubilee, Northern and Piccadilly lines run the Night Tube. For a cab, either flag a black taxi with its orange light on, or book a minicab through an app — never accept a ride from someone approaching you on the street.",
      },
      {
        question: "What's the difference between a black cab and a minicab?",
        answer:
          "A black taxi is licensed to be hailed on the street or taken from a rank, has a meter and takes contactless payment. A minicab must be booked in advance with a licensed operator, which creates a record of your journey, your driver and the vehicle. A minicab that hasn't been booked is operating illegally and isn't insured to carry you, even if it displays a TfL sticker.",
      },
      {
        question: "Do I need to buy a travelcard in advance?",
        answer:
          "No. Tap in and out with any contactless bank card or phone and the system charges you the correct fare and caps it daily. It works on the Tube, buses, trams, the Elizabeth line, the Overground and the DLR, and it's cheaper than buying paper tickets.",
      },
    ],
    contentVerified: true,
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
    headline: "Las Vegas for solo female travellers",
    subheadline:
      "The Strip is staffed, lit and watched around the clock — and the Deuce bus runs all night, so you are never depending on a 3am taxi. Here's where to stay and how airport rideshare actually works.",
    metaTitle: "Safe Hotels in Las Vegas for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Las Vegas as a solo woman: mid-Strip vs downtown, the 24-hour Deuce bus, Monorail hours, and the official airport rideshare pickup.",
    aiSearch: "strip safe hotel Las Vegas Nevada well-lit 24-hour reception",
    knownFor: [
      "The Strip's resort-casinos, shows and pedestrian bridges",
      "The Fremont Street canopy downtown",
      "Residencies and live entertainment most nights of the year",
      "Day trips to Red Rock Canyon and Hoover Dam",
    ],
    neighbourhoods: [
      {
        name: "Mid-Strip",
        verdict: "recommended",
        description:
          "The stretch roughly between Bellagio and Park MGM is the densest cluster of large resorts with 24/7 staffed lobbies, well-lit pedestrian bridges and heavy foot traffic. For a first solo trip this is the practical base: short, lit walks between dinner, a show and your room, rather than long rideshare hops.",
      },
      {
        name: "Summerlin",
        verdict: "recommended",
        description:
          "About 20 minutes west of the Strip, a quieter planned area with newer resorts and easy access to Red Rock Canyon. A good pick if you want a calmer base and plan to rideshare in for evenings.",
      },
      {
        name: "Fremont Street / Downtown",
        verdict: "caution",
        description:
          "The Fremont Street canopy itself is busy, lit and policed. The blocks immediately off it thin out fast after dark. Stay on Fremont Street proper and rideshare the last stretch rather than walking side streets.",
      },
    ],
    safetyTips: [
      "The Deuce bus on Las Vegas Boulevard runs 24 hours a day, every day — roughly every 10–15 minutes until 01:00, then every 20 minutes through the night. It is the all-night option the Monorail is not.",
      "The Monorail runs the east side of the Strip only (MGM Grand to Sahara): 07:00–midnight on Mondays, until 02:00 Tuesday–Thursday, and until 03:00 Friday–Sunday. It does not serve the west-side resorts.",
      "Use Uber, Lyft or the official hotel taxi stand. Confirm the name, the car and the plate before you get in — never a car that approaches you on the sidewalk.",
      "Hotel lifts and room floors typically need a keycard. If someone follows you toward an elevator bank, wait for the next one.",
      "Strip blocks are longer than they look. What maps as a five-minute walk is often 15–20. After midnight, or after drinking, rideshare even short hops.",
      "SafeNest on 702-646-4981 is the local 24/7 line for domestic violence, sexual assault and trafficking, in English and Spanish. 911 is the emergency number.",
    ],
    gettingAround:
      "Harry Reid International (LAS) is 10–20 minutes from most Strip resorts. Taxis wait outside baggage claim. Uber and Lyft are authorised but do not pick up at the arrivals curb: Terminal 1 pickup is Level 2 of the parking garage (elevator near Door 2, then the pedestrian bridge); Terminal 3 pickup is the Valet Level of its garage. Follow the Ride Share signs rather than anyone offering a ride in the terminal.",
    supportLine: {
      name: "SafeNest",
      number: "702-646-4981",
      description:
        "Las Vegas 24/7 hotline for domestic violence, sexual assault and human trafficking. Free, confidential, English and Spanish. Call or text. 911 if you need the police immediately.",
    },
    faqs: [
      {
        question: "Is Las Vegas safe for solo female travellers?",
        answer:
          "The Strip and the big resort casinos are among the more controlled environments for solo travellers in the US: staffed, brightly lit and monitored around the clock. The realistic risks are drink spiking in clubs, fake rideshares, and walking into empty parking structures. Stay on the main sidewalks and bridges, use the app for cars, and you will rarely be the only woman out.",
      },
      {
        question: "Where should a solo woman stay in Vegas?",
        answer:
          "Mid-Strip resorts, roughly between Bellagio and Park MGM, are the straightforward first-time pick: 24/7 front desk, short lit walks, and the Deuce on the doorstep. Summerlin is quieter if you have a reason to be west of the city. Downtown is fine on Fremont Street itself; it is a different proposition a block off it.",
      },
      {
        question: "Is it safe to walk the Strip at night?",
        answer:
          "The main sidewalks and pedestrian bridges stay crowded and lit well into the evening, with visible police and private security. Avoid cutting through parking garages and the streets behind the resorts. After midnight, or if you have been drinking, rideshare even a couple of blocks — the Deuce is the public-transport backup.",
      },
      {
        question: "How do I get from the airport without a fake Uber?",
        answer:
          "Taxis are at the curb outside baggage claim. For Uber or Lyft, ignore anyone who approaches you in the terminal and follow signs to the official Ride Share pickup in the parking garage — Level 2 at Terminal 1, Valet Level at Terminal 3. Confirm the driver's name and the plate before you get in.",
      },
      {
        question: "Does the Monorail run all night?",
        answer:
          "No. It starts at 07:00 and finishes between midnight and 03:00 depending on the day, and it only covers the east side of the Strip. The Deuce bus is the 24-hour option, running the length of Las Vegas Boulevard including downtown.",
      },
    ],
    contentVerified: true,
  },
  {
    slug: "okinawa",
    city: "Okinawa",
    country: "Japan",
    headline: "Okinawa for solo female travellers",
    subheadline:
      "Japan's southern islands are among the easier places in Asia to travel alone — as long as you know the monorail stops around 23:30 and a car is what the rest of the island actually runs on.",
    metaTitle: "Safe Hotels in Okinawa for Solo Female Travellers | Area Guide",
    metaDescription:
      "Where to stay in Okinawa as a solo woman: Naha vs the west-coast resorts, Yui Rail hours, airport arrival, and when you actually need a car.",
    aiSearch: "safe hotel Naha Okinawa Japan well-lit near monorail",
    knownFor: [
      "Kanhizakura cherry blossom, typically late January through February — weeks before the mainland",
      "Kerama Islands beaches and the west-coast resort strip",
      "Shuri Castle and the Ryukyuan sites around Naha",
      "Okinawan food and awamori",
    ],
    neighbourhoods: [
      {
        name: "Naha (Kokusai-dori and Omoromachi)",
        verdict: "recommended",
        description:
          "The capital and the only part of the island you can do without a car. Kokusai-dori and Omoromachi stay busy into the evening, are well lit, and sit on the Yui Rail. Prefectural Office and Makishi stations put you on the shopping street; Omoromachi is a quieter modern grid a few stops north.",
      },
      {
        name: "Onna / west-coast resort strip",
        verdict: "recommended",
        description:
          "Large beachfront properties between Yomitan and Onna, with 24/7 reception, private beaches and hotel shuttles. The practical pick if you want the sea and a locked door, and you are comfortable taking a taxi or the hotel bus for anything off-property.",
      },
      {
        name: "American Village (Chatan)",
        verdict: "caution",
        description:
          "A walkable waterfront of shops and cafés next to US bases, lively on weekend nights. Fine for an evening out; a mixed nightlife scene is the reason to know your way back rather than to sleep here on a first trip.",
      },
    ],
    safetyTips: [
      "Violent crime against visitors is rare. The realistic things to plan are transport after 23:30 and drinks in bar districts — Kokusai-dori, Matsuyama and American Village on weekend nights.",
      "The Yui Rail runs from about 06:00 to 23:30, Naha Airport to Tedako-Uranishi. After that you need a taxi. Official taxis are metered and wait at ranks; do not accept a ride from someone who approaches you.",
      "Japan only accepts the 1949-format International Driving Permit. The 1968 version that some countries issue will not be valid here — arrange the right one before you fly.",
      "Typhoon season is roughly June to October. Ferries to the Keramas and other outer islands cancel; check the morning of.",
      "Seven Bank ATMs (7-Eleven) and Japan Post accept most foreign cards. 7-Eleven machines in Naha run through the night.",
      "Yorisoi Hotline 0120-279-338 is free; press 2 after the Japanese prompt for English, daily 10:00–22:00. 110 is the police emergency number.",
    ],
    gettingAround:
      "Naha Airport (OKA) is on the Yui Rail: about 15 minutes to Prefectural Office / Kokusai-dori, under 40 minutes to the end of the line. For west-coast resorts, a hotel transfer or taxi is typically 60–90 minutes. Buses exist but are infrequent outside Naha; most people heading north rent a car or book the hotel's airport shuttle in advance.",
    supportLine: {
      name: "Yorisoi Hotline",
      number: "0120-279-338",
      description:
        "Free nationwide line. Press 2 after the Japanese prompt for English and other languages, daily 10:00–22:00. Covers domestic violence, sexual violence and everyday problems. 110 is the emergency number.",
    },
    faqs: [
      {
        question: "Is Okinawa safe for solo female travellers?",
        answer:
          "Yes, by most measures — violent crime against visitors is rare, the monorail and taxis are reliable, and hotels are used to international guests travelling alone. The two things that actually catch people out are the monorail stopping at 23:30 and bar streets on weekend nights. Neither requires you to change your plans, only to know about them.",
      },
      {
        question: "Where should a solo woman stay in Okinawa?",
        answer:
          "Naha around Kokusai-dori or Omoromachi is the easiest first-time base: monorail, restaurants, a walkable evening. If you would rather wake up at the beach, pick a west-coast resort in Onna or Yomitan with 24/7 reception and a shuttle — you will need that shuttle or a taxi for anything off the grounds.",
      },
      {
        question: "When is cherry blossom season in Okinawa?",
        answer:
          "Kanhizakura blooms earlier than mainland Japan, typically late January through February. March is post-peak: still warm, quieter, and not the reason to time the trip unless you specifically want the blossoms.",
      },
      {
        question: "Do I need to rent a car in Okinawa?",
        answer:
          "Not if you stay in Naha — the Yui Rail and taxis cover the capital. For the north of the island (Churaumi Aquarium, Kouri, remote beaches) a car is the practical option, and you need a 1949-format International Driving Permit issued before you travel. Japan will not accept the 1968 permit.",
      },
      {
        question: "How late does the monorail run?",
        answer:
          "Until about 23:30, from Naha Airport through the city to Tedako-Uranishi. After that, taxis from a rank. There is no night-bus network comparable to a European capital, which is why a Naha hotel near a station matters if you are out late.",
      },
    ],
    contentVerified: true,
  },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

/** Year-round city guide for a host city, if we have one that actually renders. */
export function getDestinationByCity(city: string): Destination | undefined {
  const needle = city.trim().toLowerCase();
  if (!needle) return undefined;
  return getLinkableDestinations().find((d) => d.city.toLowerCase() === needle);
}

export function getAllDestinationSlugs(): string[] {
  return destinations.map((d) => d.slug);
}

/**
 * Destinations that render their own page. The rest 301 to an event page, so
 * linking to them from a hub would just send crawlers through a redirect.
 */
export function getLinkableDestinations(): Destination[] {
  return destinations.filter((d) => !redirectedDestinationSlugs.has(d.slug));
}

/**
 * Return up to `limit` destinations other than `slug`.
 * Prefers same-country matches first so internal links connect related regions.
 * Redirected slugs are excluded — linking to one sends the crawler through a 301.
 */
export function getRelatedDestinations(slug: string, limit = 3): Destination[] {
  const current = destinations.find((d) => d.slug === slug);
  const others = getLinkableDestinations().filter((d) => d.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameCountry = others.filter((d) => d.country === current.country);
  const rest = others.filter((d) => d.country !== current.country);
  return [...sameCountry, ...rest].slice(0, limit);
}
