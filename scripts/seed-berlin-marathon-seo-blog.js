/**
 * Seed Berlin Marathon SEO post — high GSC impressions (~81) at weak position.
 * Targets: "berlin marathon 2026", solo female stay angles.
 *
 * Usage: DATABASE_URL=... node scripts/seed-berlin-marathon-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "berlin-marathon-2026-solo-women-hotels";

const BODY = `## Berlin Marathon 2026: safer stays for solo women runners

The BMW Berlin Marathon draws runners from around the world. If you are travelling solo — racing or cheering — the question is less "is Berlin safe?" and more "where should I sleep so race morning and late dinners feel straightforward?"

This guide is practical. You are capable; the goal is fewer unknowns.

## Berlin Marathon 2026 dates

Confirm the official race weekend on the BMW Berlin Marathon site, then book stays with free cancellation until your registration and flights are locked.

We keep a live event page with pre-filled search dates:

→ [Berlin Marathon 2026 — safe solo stays](/events/berlin-marathon-2026)

## What to filter for near race weekend

On Yes I Can Travel, **safest first** is the default sort. For marathon week, prioritise:

- **24/7 reception** — early starts and late pasta dinners are normal
- **Map pin near S-Bahn / U-Bahn** — avoid long dark walks with luggage the night before
- **Free cancellation** — race plans change; flexibility matters
- **Quiet enough to sleep** — central but not on the loudest nightlife strip if you race

## Neighbourhoods that work for solo runners

### Mitte / near Alexanderplatz (recommended)

Transport hub, well-lit streets, easy access toward the course. Busier; choose a hotel on a main street with staffed reception.

### Prenzlauer Berg (recommended)

Residential, cafés, walkable evenings. Good if you want calmer nights before race day — check transit time to the start.

### Kreuzberg / Neukölln (recommended with awareness)

Great food and energy; some blocks feel quieter late. Stick to lit main routes and plan your last mile.

## Solo female race-weekend checklist

1. Save hotel address offline + screenshot the route to the start.
2. Share your race plan and hotel with one trusted contact.
3. Pack a portable charger for race day logistics.
4. Book a rate you can cancel if travel goes sideways.
5. Download the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays for Berlin Marathon

Compare live availability with reception hours, location, and cancellation terms shown up front.

[Open Berlin Marathon stays →](/events/berlin-marathon-2026)

Or browse the [Berlin destination guide](/destinations/berlin) for year-round neighbourhood tips.

---

*Questions? Email [hello@yesicantravel.com](mailto:hello@yesicantravel.com).*
`;

async function main() {
  const existing = await prisma.contentItem.findUnique({ where: { slug: SLUG } });
  if (existing?.status === ContentStatus.published) {
    console.log(
      JSON.stringify(
        { skipped: true, reason: "already_published", slug: SLUG, urlPath: `/blog/${SLUG}` },
        null,
        2
      )
    );
    return;
  }

  let keywordTarget = await prisma.keywordTarget.findFirst({
    where: { keyword: "berlin marathon 2026 solo hotels women" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "berlin marathon 2026 solo hotels women",
        cluster: "Berlin",
        intent: "commercial",
        priority: 92,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Berlin Marathon 2026: safer hotels for solo women runners",
    excerpt:
      "Where to stay for the BMW Berlin Marathon as a solo woman — neighbourhoods, 24/7 reception, and a race-weekend checklist.",
    bodyMarkdown: BODY,
    seoTitle: "Berlin Marathon 2026 hotels for solo women | Yes I Can Travel",
    seoDescription:
      "BMW Berlin Marathon 2026 stay guide for solo women: neighbourhoods, safety filters, free cancellation, and pre-filled hotel search dates.",
    targetKeyword: "berlin marathon 2026",
    destination: "Berlin",
    status: ContentStatus.published,
    publishedAt: new Date(),
    draftSource: "gsc-query-seed",
    keywordTargetId: keywordTarget.id,
  };

  const post = existing
    ? await prisma.contentItem.update({ where: { id: existing.id }, data })
    : await prisma.contentItem.create({ data });

  console.log(
    JSON.stringify(
      {
        contentId: post.id,
        slug: post.slug,
        title: post.title,
        urlPath: `/blog/${post.slug}`,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
