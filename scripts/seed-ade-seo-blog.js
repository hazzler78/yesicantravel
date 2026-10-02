/**
 * Seed ADE 2026 SEO post — GSC: "amsterdam dance event 2026".
 * Usage: DATABASE_URL=... node scripts/seed-ade-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "amsterdam-dance-event-2026-solo-women-hotels";

const BODY = `## Amsterdam Dance Event 2026: safer solo stays

**ADE 2026** runs **21–25 October** (30th anniversary). ADE Pro is Wednesday–Saturday; the festival programme runs all five days and nights across venues citywide.

If you are going alone, the useful questions are where to sleep, how late transport runs, and which hotel filters reduce unknowns — not whether ADE is "safe" in the abstract.

## Dates at a glance

- **Wed 21 – Sun 25 Oct 2026**
- Conference + club programme; venues spread across Amsterdam
- Peak demand for central rooms with 24/7 desks

## Where to base yourself as a solo woman

Prefer a **canal-belt / centre** base with a staffed reception and a short walk or tram to Dam / Centraal, rather than a quiet residential edge you will navigate alone after 03:00.

On Yes I Can Travel, sort **safest first** and keep:

- **24/7 reception**
- **Map pin near tram / metro**
- **Free cancellation** until your ADE schedule is locked

## Getting back after late sets

Amsterdam's night network is workable, but ADE nights are crowded. Screenshot your hotel address, know your last tram/metro option, and treat a licensed taxi as a normal last-mile if the walk feels empty.

Practical neighbourhood notes: [Amsterdam safety at night](/blog/amsterdam-safe-solo-women-night).

## Book stays for ADE week

→ [ADE 2026 event page](/events/amsterdam-dance-event-2026) — dates pre-filled for a safety-first hotel search.

→ [Free solo safety checklist](/lead-magnet) — reception hours, late arrival, and what to check before you book.

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
    where: { keyword: "amsterdam dance event 2026" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "amsterdam dance event 2026",
        cluster: "Amsterdam",
        intent: "commercial",
        priority: 85,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Amsterdam Dance Event 2026 solo women hotels",
    excerpt:
      "ADE 2026 (21–25 Oct): where to stay alone, late-night returns, and safety filters for festival week.",
    bodyMarkdown: BODY,
    seoTitle: "Amsterdam Dance Event 2026: solo women hotels | Yes I Can Travel",
    seoDescription:
      "Amsterdam Dance Event 2026 dates (21–25 Oct) and safer solo stays — 24/7 reception, centre bases, late returns. Practical ADE hotel guide.",
    targetKeyword: "amsterdam dance event 2026",
    destination: "Amsterdam",
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
