/**
 * Seed Vienna SEO post — "is vienna safe for solo female travellers".
 * Usage: DATABASE_URL=... node scripts/seed-vienna-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-vienna-safe-for-solo-female-travellers";

const BODY = `## Is Vienna safe for solo female travellers?

Yes — for most women who stay in the centre and know how the U-Bahn hours work. Vienna is formal, well lit, and used to solo travellers in cafés and at cultural events. The realistic risks are pickpocketing in crowded squares and missing the last train on a weeknight — not everyday violence on the Ring.

This guide is practical, not fear-based. You decide what feels right.

## What "safe at night" means here

When people ask **is Vienna safe for solo female travellers**, they usually want:

1. Can I walk back from a market or concert after dark?
2. Which districts feel calm to sleep in?
3. What should I filter for before I book?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception**
- **Map pin inside or just outside the Ringstraße**
- **Free cancellation** until plans are locked

## Neighbourhoods that work for solo women

### Innere Stadt (recommended)

Inside the Ring — Stephansplatz, the museums, Rathausplatz markets. Expensive, but the walk home stays on busy, lit streets.

### Neubau (recommended)

Spittelberg lanes, Mariahilfer Straße shops, U3 connections. Central without first-district prices; quieter by midnight.

### Wieden / Margareten (recommended)

Around Karlsplatz and the Naschmarkt. Residential evenings, cheaper beds, fast U-Bahn to every market.

### Praterstern / Westbahnhof (caution as a sleep base)

Fine interchange stations with visible street drinking at the entrances late. The trains are safe; the immediate pavement is what many solo travellers skip.

## Getting around after dark

- U-Bahn and trams run **all night on Fridays, Saturdays and before public holidays**.
- Other nights: last trains around **00:30**, then night buses.
- **Validate tickets** before boarding — proof-of-payment with no barriers.
- Regulated taxis and Bolt/Uber are straightforward; ignore costumed concert ticket sellers outside major churches.

## Solo checklist for Vienna

1. Screenshot hotel address + nearest U-Bahn stop offline.
2. Know whether your night is a weekend (24h trains) or weekday (night bus).
3. Keep a few euros for market mug deposits.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in Vienna

→ [Vienna destination guide](/destinations/vienna) — districts, night network, and pre-filled search dates.

Visiting in December? [Vienna Christmas Markets 2026](/events/vienna-christmas-markets-2026) dates are pre-filled on the event page.

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
    where: { keyword: "is vienna safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is vienna safe for solo female travellers",
        cluster: "Vienna",
        intent: "informational",
        priority: 90,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is Vienna safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone — Ringstraße districts, weekend U-Bahn nights, pickpocket plan, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is Vienna safe for solo female travellers? | Yes I Can Travel",
    seoDescription:
      "Is Vienna safe for solo female travellers? Innere Stadt & Neubau, weekend 24h U-Bahn, hotel filters — practical, not fear-based.",
    targetKeyword: "is vienna safe for solo female travellers",
    destination: "Vienna",
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
