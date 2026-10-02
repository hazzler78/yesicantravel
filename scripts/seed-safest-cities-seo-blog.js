/**
 * Seed "safest cities Europe solo female" SEO post — listicle → checklist.
 * Usage: DATABASE_URL=... node scripts/seed-safest-cities-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "safest-cities-europe-solo-female-travellers";

const BODY = `## Safest cities in Europe for solo female travellers

There is no city where risk is zero — and that is not the useful frame. What matters is **workable nights**, **staffed reception**, and neighbourhoods that stay populated after dark.

This shortlist prioritises places where late transport, walkable centres, and 24/7 desks are easy to find. Pair it with the free [solo safety checklist](/lead-magnet) before you book.

## How we pick "safer"

1. Night transport exists (metro, tram, or reliable taxis)
2. Hotels with **24/7 reception** are common in the centre
3. We already publish an honest area guide you can read before you search

On Yes I Can Travel, **safest first** is the default sort — not cheapest.

## Strong starting cities

### Amsterdam
Canal-belt bases, late trams, and a clear night plan. → [Amsterdam night guide](/blog/amsterdam-safe-solo-women-night) · [destination](/destinations/amsterdam)

### Berlin
Weekend 24h U-Bahn, calm districts like Prenzlauer Berg. → [Berlin safety guide](/blog/is-berlin-safe-for-solo-female-travellers) · [destination](/destinations/berlin)

### Milan
Working city with early metro end (~00:30) — know the night buses. → [Milan safety guide](/blog/is-milan-safe-for-solo-female-travellers) · [destination](/destinations/milan)

### Barcelona
Busy late; plan for pickpocketing more than violence. → [Barcelona safety guide](/blog/is-barcelona-safe-for-solo-female-travellers) · [destination](/destinations/barcelona)

### London
Night Tube on some lines; licensed taxis over random minicabs. → [London safety guide](/blog/is-london-safe-for-solo-female-travellers) · [destination](/destinations/london)

### Paris
Dense centre; know your arrondissement and last metro. → [Paris safety guide](/blog/is-paris-safe-for-solo-female-travellers) · [destination](/destinations/paris)

## Before you book any city

- Keep **24/7 reception** on
- Check the **map pin** for the last walk from transit
- Prefer **free cancellation** until plans lock
- Use the [checklist](/lead-magnet) — reception hours, late arrival, what to verify

## Next step

Browse [popular cities](/popular-cities) with safety filters, or open a [peak-date event](/events) if your trip is tied to a festival or race.

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
    where: { keyword: "safest cities europe solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "safest cities europe solo female travellers",
        cluster: "Europe",
        intent: "informational",
        priority: 92,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Safest cities in Europe for solo female travellers",
    excerpt:
      "A practical shortlist — Amsterdam, Berlin, Milan, Barcelona, London, Paris — with honest guides and a free checklist before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Safest Cities in Europe for Solo Female Travellers (2026)",
    seoDescription:
      "Safest cities in Europe for women travelling alone: Amsterdam, Berlin, Milan, Barcelona, London, Paris — night transport, 24/7 reception, free checklist.",
    targetKeyword: "safest cities europe solo female travellers",
    destination: "Europe",
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
