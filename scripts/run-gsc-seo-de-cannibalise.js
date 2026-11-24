/**
 * GSC de-cannibalisation + Amsterdam safety expansion (idempotent by slug).
 * Does not write to production unless you point DATABASE_URL at prod.
 *
 * Usage: DATABASE_URL=... node scripts/run-gsc-seo-de-cannibalise.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const AMSTERDAM_SAFETY_SLUG = "amsterdam-safe-solo-women-night";

const AMSTERDAM_SAFETY_BODY = `## Is Amsterdam safe for solo female travellers?

**Yes — for most women who stay in the right neighbourhood and know how the night network works.** Amsterdam is compact, well lit in the centre, and violent crime against visitors is uncommon. What catches people out is not “danger” in the abstract but **pickpocketing**, **bike lanes you can mistake for pavements**, and **trams that stop around 00:30** just as evenings peak.

This guide answers the full question — daytime exploring and after dark — in plain language. Practical, not fear-based. You decide what feels right.

## Daytime: what feels normal

During the day, solo women move through Amsterdam the same way locals do: on foot, by tram, or by metro. The canal ring, Jordaan, De Pijp, and the museum district are busy, easy to navigate, and full of people.

The risks you should actually plan for:

- **Pickpocketing** on crowded trams (especially to Centraal), around the station, and in tight tourist queues — not assault on open streets.
- **Cycling culture** — the red asphalt is for bikes. Look both ways before you step off a tram or out of a doorway.
- **Red Light District crowds** in the early evening are packed and loud; fine to walk through with awareness, not a reason to avoid the city.

Filter hotels with **24/7 staffed reception** if you are arriving late from Schiphol or prefer a calm “home base” after sightseeing.

## Evening and after dark

Amsterdam **does not shut down early**, but **surface trams and the metro stop around 00:30**. After that, **GVB night buses** run from Centraal (roughly 00:30–07:30, about hourly). Plan the last leg before you go out — screenshot your hotel address and know whether you are walking, busing, or booking a licensed taxi.

### Jordaan (recommended)

Narrow canals, brown cafés, and a residential feel. Main streets stay lit and feel comfortable for solo walks after dinner. Quiet side alleys can feel empty very late — stick to lit routes or take a short taxi.

### De Pijp (recommended)

Food, smaller bars, and a local crowd. Well connected on the Noord-Zuidlijn metro. Strong choice if you want evenings out without depending on a long walk home.

### Centrum / near Centraal (recommended with awareness)

Maximum convenience for arrivals. Busier and noisier. Works well if you pick a hotel on a main street with **24/7 reception** and a clear walking route from the station.

### Red Light District (caution late)

Policed and not “violent,” but between roughly **23:00 and 02:00** narrow streets fill with stag groups and heavy drinking. Many solo travellers prefer not to walk through alone then — route around it or use a taxi.

## Getting home after midnight

1. **Night buses** from Centraal cover most of the city once trams stop.
2. **Uber, Bolt, and official TCA taxis** are normal for the last mile — book in the app.
3. **Do not treat red bike paths as footpaths** if you are walking home tired.

## Booking checklist for solo women

1. **24/7 reception** (especially for late Schiphol arrivals).
2. **Map pin** on a lit main street — not only the neighbourhood name.
3. **Free cancellation** until plans are locked.
4. Bag **zipped and in front** on busy trams.
5. [Free solo safety checklist](/lead-magnet) before you fly.

## Find safer stays

Compare live availability with safety signals up front — reception hours, location, and cancellation terms.

[Search safe stays in Amsterdam →](/popular-cities)

Neighbourhood detail and year-round bases: [Amsterdam destination guide](/destinations/amsterdam).

---

*Questions? Email [hello@yesicantravel.com](mailto:hello@yesicantravel.com).*
`;

const UPDATES = [
  {
    slug: AMSTERDAM_SAFETY_SLUG,
    title: "Is Amsterdam Safe for Solo Female Travellers?",
    excerpt:
      "Is Amsterdam safe for solo female travellers? Day and night, Jordaan and De Pijp, trams until 00:30, night buses, and hotels with 24/7 reception — practical, not fear-based.",
    seoTitle: "Is Amsterdam Safe for Solo Female Travellers?",
    seoDescription:
      "Is Amsterdam safe for solo female travellers? Jordaan and De Pijp, night buses after midnight, and hotels with 24/7 reception. Practical, not fear-based.",
    bodyMarkdown: AMSTERDAM_SAFETY_BODY,
    targetKeyword: "is amsterdam safe for solo female travellers",
  },
  {
    slug: "is-berlin-safe-for-solo-female-travellers",
    seoTitle: "Is Berlin Safe for Solo Female Travellers?",
    seoDescription:
      "Is Berlin safe for solo female travellers? Weekend 24-hour U-Bahn, Prenzlauer Berg and Mitte, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "is-barcelona-safe-for-solo-female-travellers",
    seoTitle: "Is Barcelona Safe for Solo Female Travellers?",
    seoDescription:
      "Is Barcelona safe for solo female travellers? Theft awareness, Eixample and Gràcia, metro until late, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "is-london-safe-for-solo-female-travellers",
    seoTitle: "Is London Safe for Solo Female Travellers?",
    seoDescription:
      "Is London safe for solo female travellers? Night Tube, licensed taxis not unbooked minicabs, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "is-paris-safe-for-solo-female-travellers",
    seoTitle: "Is Paris Safe for Solo Female Travellers?",
    seoDescription:
      "Is Paris safe for solo female travellers? Marais and Saint-Germain, last metro and night buses, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "is-vienna-safe-for-solo-female-travellers",
    seoTitle: "Is Vienna Safe for Solo Female Travellers?",
    seoDescription:
      "Is Vienna safe for solo female travellers? Innere Stadt and Neubau, weekend 24-hour U-Bahn, pickpocket plan, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "is-prague-safe-for-solo-female-travellers",
    seoTitle: "Is Prague Safe for Solo Female Travellers?",
    seoDescription:
      "Is Prague safe for solo female travellers? Old Town bases, pickpocket plan, licensed taxis, and hotels with 24/7 reception. Practical, not fear-based.",
  },
  {
    slug: "safe-solo-hotels-amsterdam-women",
    seoDescription:
      "Safe solo hotels in Amsterdam for women: Jordaan and De Pijp bases, 24/7 reception filters, and a practical booking checklist — calm, not fear-based.",
  },
  {
    slug: "amsterdam-dance-event-2026-solo-women-hotels",
    title: "Amsterdam Dance Event: solo women hotel guide",
    excerpt:
      "Going to ADE alone? Centre bases, night buses after 00:30, and safety filters — with official 2027 dates on the event page.",
    seoTitle: "Amsterdam Dance Event Solo Hotels for Women",
    seoDescription:
      "ADE solo hotel guide for women: central bases, late returns, and 24/7 reception. Official ADE 2027 is 20–24 Oct — plan on the 2027 event page.",
    bodyMarkdown: `## Amsterdam Dance Event: safer solo stays (evergreen)

Amsterdam Dance Event (ADE) is a **city-wide** festival — hundreds of venues, sets that run into the early hours, and hotel demand that spikes in the centre. If you are going **alone**, the useful questions are where to sleep, how late transport runs, and which hotel filters reduce unknowns.

**Official next edition:** [Amsterdam Dance Event 2027](/events/amsterdam-dance-event-2027) — **20–24 October 2027** (confirmed on [amsterdam-dance-event.nl](https://www.amsterdam-dance-event.nl/en/news/amsterdam-dance-event-concludes-monumental-30-year-anniversary-and-sets-dates-for-ade-2027/2967954/)).

Past year? Use the same neighbourhood and transport advice below; book dates for the edition that matches your tickets.

## Where to base yourself as a solo woman

Prefer a **canal-belt or centre** base with a **staffed reception** and a short tram or night-bus link to Centraal, rather than a quiet edge you will navigate alone after 03:00.

On Yes I Can Travel, sort **safest first** and keep:

- **24/7 reception**
- **Map pin near tram / metro / night bus**
- **Free cancellation** until your ADE schedule is locked

## Getting back after late sets

Amsterdam trams and metro stop around **00:30**. **Night buses** from Centraal cover the city until morning — plan the route before you go out. Pickpockets target crowded exits; licensed taxis and apps are normal for the last mile.

Practical neighbourhood context: [Is Amsterdam safe for solo female travellers?](/blog/amsterdam-safe-solo-women-night).

## Book with dates pre-filled

→ [ADE 2027 event page](/events/amsterdam-dance-event-2027) — official dates and a safety-first hotel search.

→ [Free solo safety checklist](/lead-magnet) — reception hours, late arrival, and what to check before you book.

---

*Questions? Email [hello@yesicantravel.com](mailto:hello@yesicantravel.com).*
`,
  },
];

async function main() {
  const results = [];
  for (const patch of UPDATES) {
    const { slug, ...data } = patch;
    const existing = await prisma.contentItem.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      results.push({ slug, updated: false, reason: "not_found" });
      continue;
    }
    await prisma.contentItem.update({
      where: { id: existing.id },
      data,
    });
    results.push({ slug, updated: true, fields: Object.keys(data) });
  }
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
