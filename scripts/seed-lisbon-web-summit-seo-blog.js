/**
 * Seed Web Summit Lisbon SEO post — GSC top click page.
 * Usage: DATABASE_URL=... node scripts/seed-lisbon-web-summit-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "web-summit-lisbon-2026-solo-women-hotels";

const BODY = `## Web Summit Lisbon 2026: safer stays for solo women

Web Summit fills Lisbon with more than 70,000 attendees in one week. Hotel stock is tight, late evenings run long, and the last ride home matters as much as the keynote.

This guide is for women attending alone or meeting colleagues on site. Practical, not fear-based.

## The filter that saves the week

Stay on the **red metro line** (Linha Vermelha) toward **Parque das Nações** — the venue district around MEO Arena and FIL. One direct ride beats late taxi queues when Night Summit ends.

On Yes I Can Travel, sort **safest first** and check:

- **24/7 reception** for late returns
- **Map pin** near Oriente / Parque das Nações or a red-line stop
- **Free cancellation** until flights and badges are locked

## Neighbourhoods that work

### Parque das Nações (recommended)

Modern, wide streets, well lit, and a short walk to the venue. You trade old-Lisbon charm for ten-minute walks and no taxi roulette. Best if days start early and evenings are the point.

### Chiado (recommended)

Central, walkable, comfortable cafés to sit alone. Metro reaches the venue with one change. Strong first-time base if you want atmosphere after sessions.

### Alfama / steep old town (caution for this week)

Beautiful — and a long, tired climb after dark when you're worn out from the conference floor. Fine for a daytime wander; less ideal as your primary sleep base during Web Summit.

## Solo conference checklist

1. Screenshot the route to Oriente / Parque das Nações offline.
2. Prefer metro or a booked ride over wandering for a taxi at midnight.
3. Pack a portable charger for the venue day.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book stays for Web Summit

Pre-filled dates and safety signals:

→ [Web Summit Lisbon 2026 — safe solo stays](/events/lisbon-web-summit-2026)

Or browse the [Lisbon destination guide](/destinations/lisbon).

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
    where: { keyword: "web summit lisbon solo hotels women" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "web summit lisbon solo hotels women",
        cluster: "Lisbon",
        intent: "commercial",
        priority: 90,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Web Summit Lisbon 2026: safer hotels for solo women",
    excerpt:
      "Where to stay for Web Summit as a solo woman — red metro line, Parque das Nações, late returns, and a practical checklist.",
    bodyMarkdown: BODY,
    seoTitle: "Web Summit Lisbon hotels for solo women | Yes I Can Travel",
    seoDescription:
      "Web Summit Lisbon 2026 stay guide for solo women: red metro line, Parque das Nações, 24/7 reception, and safer late returns.",
    targetKeyword: "web summit lisbon hotels",
    destination: "Lisbon",
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
