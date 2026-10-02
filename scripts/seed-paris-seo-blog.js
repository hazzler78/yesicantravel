/**
 * Seed Paris SEO post — GSC: "is paris safe for solo female travellers".
 * Usage: DATABASE_URL=... node scripts/seed-paris-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-paris-safe-for-solo-female-travellers";

const BODY = `## Is Paris safe for solo female travellers?

Yes — Paris is well suited to solo travel. The city is dense, the metro is comprehensive, and eating alone at a café is normal. The realistic problems are pickpocketing on busy lines and around major monuments, and persistent street approaches that are usually scams rather than threats. Neither is a reason to avoid the city.

This guide is practical, not fear-based. You decide what feels right.

## What this question usually means

When people ask **is Paris safe for solo female travellers**, they want:

1. Can I use the metro alone, including late?
2. Which arrondissements feel comfortable to sleep in?
3. What should I filter for before I book?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception** for late arrivals
- **Map pin in a busy, central arrondissement**
- **Free cancellation** until plans are locked
- **Official taxis or booked apps** — never someone offering a ride inside a station

## Neighbourhoods that work for solo women

### Le Marais — 3rd & 4th (recommended)

Central, walkable, busy in the evening. Strong all-round base near the river and multiple metro lines.

### Saint-Germain — 6th (recommended)

Calmer and more expensive. Quiet enough to sleep, still central.

### Latin Quarter — 5th (recommended)

Livelier and often better value. Walkable to the river; multiple metro lines.

## Metro, nights, and scams

- Last trains reach termini around 01:15 Sun–Thu and ~02:15 Fri/Sat — mid-line stations are earlier. Check your stop.
- Noctilien night buses cover the gap after the metro.
- Petition / bracelet / cup-game scams need you to stop. Keep walking; say nothing.
- 3919 (Violences Femmes Info) is free, anonymous, 24/7 for women.

## Solo checklist for Paris

1. Screenshot hotel address + metro stop offline.
2. Prefer busy carriages and well-lit exits after dark.
3. Use official ranks or booked rides only.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in Paris

→ [Paris destination guide](/destinations/paris) — arrondissements, metro notes, and pre-filled search dates.

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
    where: { keyword: "is paris safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is paris safe for solo female travellers",
        cluster: "Paris",
        intent: "informational",
        priority: 91,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is Paris safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone: arrondissements, metro nights, common scams, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is Paris safe for solo female travellers? | Yes I Can Travel",
    seoDescription:
      "Is Paris safe for solo women? Marais & Saint-Germain, metro nights, scams to ignore, and hotel filters — practical, not fear-based.",
    targetKeyword: "is paris safe for solo female travellers",
    destination: "Paris",
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
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
