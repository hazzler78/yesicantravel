/**
 * Seed Rock en Seine SEO post — GSC showed clicks on the event page.
 * Usage: DATABASE_URL=... node scripts/seed-rock-en-seine-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "rock-en-seine-paris-solo-women-hotels";

const BODY = `## Rock en Seine, Paris: safer stays for solo women

Rock en Seine sits at the Domaine national de Saint-Cloud, on the western edge of Paris. The festival times sets to end before the metro stops — so **where you sleep** decides whether the night ends with one metro ride or an expensive taxi.

This guide is for women going alone or meeting friends on site. Practical, not fear-based.

## The one filter that matters most

Stay on **metro line 10** (or in Boulogne-Billancourt). Line 10 runs to Boulogne–Pont de Saint-Cloud; from there it is a short walk across the bridge to the gates. One ride, no late changes.

On Yes I Can Travel, sort **safest first** and check:

- **24/7 reception** for late returns
- **Map pin** near line 10 or Boulogne
- **Free cancellation** until tickets and travel are locked

## Neighbourhoods that work

### Along line 10 (recommended)

Latin Quarter, Saint-Germain, 7th, 15th — busy, well-lit, and a single metro to the festival. The 15th is often quieter and better value for the same line.

### Boulogne-Billancourt (recommended)

Closest base. Shortest last mile. Good if you want to minimise late travel.

### Eastern / northern Paris (caution for this festival)

Possible, but you will change lines five nights running. Plan the last walk carefully if you stay near Gare du Nord or quieter blocks.

## Solo festival checklist

1. Screenshot the route to Boulogne–Pont de Saint-Cloud offline.
2. Leave the headliner crush 10–15 minutes early if the platform looks packed.
3. Prefer the metro to the hotel door over a dark last walk.
4. Pack a portable charger.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book stays for Rock en Seine

Pre-filled dates and safety signals:

→ [Rock en Seine Paris — safe solo stays](/events/rock-en-seine-paris-2026)

Or browse the [Paris destination guide](/destinations/paris).

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
    where: { keyword: "rock en seine solo hotels women" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "rock en seine solo hotels women",
        cluster: "Paris",
        intent: "commercial",
        priority: 88,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Rock en Seine Paris: safer hotels for solo women",
    excerpt:
      "Where to stay for Rock en Seine as a solo woman — metro line 10, Boulogne, late-night returns, and a practical checklist.",
    bodyMarkdown: BODY,
    seoTitle: "Rock en Seine hotels for solo women | Yes I Can Travel",
    seoDescription:
      "Rock en Seine stay guide for solo women: metro line 10, Boulogne-Billancourt, 24/7 reception, and safer late returns.",
    targetKeyword: "rock en seine hotels",
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
