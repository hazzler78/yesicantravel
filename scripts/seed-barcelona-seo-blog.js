/**
 * Seed Barcelona SEO post — GSC: "is barcelona safe for solo female travelers" (~pos 46).
 * Usage: DATABASE_URL=... node scripts/seed-barcelona-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-barcelona-safe-for-solo-female-travellers";

const BODY = `## Is Barcelona safe for solo female travellers?

Yes — Barcelona is generally comfortable for women travelling alone. The centre stays busy late, dinner runs past midnight, and you will rarely be the only person on the street. The realistic risk to plan for is **theft** (skilled pickpocketing), not everyday violence.

This guide is practical, not fear-based. You decide what feels right.

## What people usually mean by the question

When someone searches **is Barcelona safe for solo female travellers** or **safest areas to stay in Barcelona**, they usually want:

1. Which neighbourhoods feel calm to sleep in?
2. How late does the metro run — and what if I miss it?
3. What should I filter for before I book?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception**
- **Map pin near a metro entrance** (especially L2 / L3 / L4 / L5)
- **Free cancellation** until plans are locked

## Neighbourhoods that work for solo women

### Eixample (recommended)

The 19th-century grid north of Plaça Catalunya. Wide, lit avenues; hard to get lost. Highest concentration of hotels with a genuine 24-hour desk. Best first choice for most solo trips.

### Gràcia (recommended)

Former village feel, busy squares into the evening. Metro L3 (Fontana / Lesseps). Quieter sleep than the old town, still ~20 minutes on foot to Passeig de Gràcia.

### Sant Antoni / Poble-sec (recommended)

Residential, market-centred, two metro stops from the centre. Good if you want quieter streets without isolating yourself.

### El Raval (caution as a sleep base)

Central and interesting — but narrow blocks that empty after bars close. Fine to visit; decide carefully as your hotel postcode.

### La Rambla / Gothic Quarter (caution)

Highest pickpocket concentration in the city. Fine to explore; treat bags accordingly and expect noise late.

## Getting around after dark

- Mon–Thu + Sun: metro ~05:00–00:00
- Friday: until ~02:00
- Saturday: continuous overnight service
- Metered taxis are plentiful when the roof light is on — an easy last stretch

## Solo checklist for Barcelona

1. Zipped bag across the body; move it to your front on L3 and near Sagrada Família / Barceloneta.
2. Know whether your night is a Saturday (all-night metro) or a weekday.
3. Screenshot hotel address + nearest metro stop offline.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in Barcelona

→ [Barcelona destination guide](/destinations/barcelona) — neighbourhoods, metro hours, and pre-filled search dates.

Peak-date option: [Primavera Sound Barcelona](/events/primavera-sound-barcelona-2026) when festival week is your reason for the trip.

---

*Questions? Email [hello@yesicantravel.com](mailto:hello@yesicantravel.com).*
`;

async function main() {
  const existing = await prisma.contentItem.findUnique({ where: { slug: SLUG } });
  if (existing?.status === ContentStatus.published) {
    console.log(JSON.stringify({ skipped: true, slug: SLUG }, null, 2));
    return;
  }

  let keywordTarget = await prisma.keywordTarget.findFirst({
    where: { keyword: "is barcelona safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is barcelona safe for solo female travellers",
        cluster: "Barcelona",
        intent: "informational",
        priority: 90,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is Barcelona safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone: theft vs violence, Eixample vs Raval, metro nights, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is Barcelona safe for solo female travellers? | Yes I Can Travel",
    seoDescription:
      "Is Barcelona safe for solo women? Theft awareness, Eixample & Gràcia, metro until late (all night Sat), and 24/7 reception filters — practical, not fear-based.",
    targetKeyword: "is barcelona safe for solo female travellers",
    destination: "Barcelona",
    status: ContentStatus.published,
    publishedAt: new Date(),
    draftSource: "gsc-query-seed",
    keywordTargetId: keywordTarget.id,
  };

  const post = existing
    ? await prisma.contentItem.update({ where: { id: existing.id }, data })
    : await prisma.contentItem.create({ data });

  console.log(JSON.stringify({ contentId: post.id, slug: post.slug, urlPath: `/blog/${post.slug}` }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
