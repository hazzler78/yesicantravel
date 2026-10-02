/**
 * Seed Berlin SEO post — GSC: "is berlin safe for women at night" (~pos 11).
 * Usage: DATABASE_URL=... node scripts/seed-berlin-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-berlin-safe-for-solo-female-travellers";

const BODY = `## Is Berlin safe for solo female travellers?

Yes — Berlin is unusually workable for women travelling alone, especially at night. The U-Bahn and S-Bahn run **24 hours on weekends**, streets in the centre stay populated late, and the city culture is used to people out alone. The realistic risks are pickpocketing on busy lines and empty industrial stretches far from the ring — not everyday violence on the main routes.

This guide is practical, not fear-based. You decide what feels right.

## What "safe at night" means here

When people ask **is Berlin safe for women at night** or **is Berlin safe for solo female travellers**, they usually want:

1. Can I get home after 01:00 without a taxi?
2. Which districts feel calm to sleep in?
3. What should I filter for before I book?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception**
- **Map pin near U-Bahn / S-Bahn** inside or on the ring
- **Free cancellation** until plans are locked

## Neighbourhoods that work for solo women

### Mitte (recommended)

Landmarks, dense transport, larger hotels with proper desks. Hackescher Markt stays busy in the evening; some office blocks empty after work.

### Prenzlauer Berg (recommended)

Residential, leafy, cafés. Often described as calm after dark. U2 + trams.

### Charlottenburg (recommended)

Old West Berlin: wide, well-lit streets, Ku'damm. Quieter, established feel. ~20 minutes to Mitte.

### Friedrichshain / Kreuzberg (caution as a sleep base)

Great for evenings — loud, late, and uneven block-to-block. Fine to visit; decide carefully as your hotel postcode.

## Getting around after dark

- Weekends: U-Bahn / S-Bahn run all night.
- Weeknights: night buses fill the gap after the last trains — check your line.
- Validate tickets; inspectors check regularly.
- Prefer a lit, busy last walk from the station over a dark shortcut.

## Solo checklist for Berlin

1. Screenshot hotel address + nearest U-Bahn stop offline.
2. Know whether your night is a weekend (24h trains) or weekday (night bus).
3. Pack a portable charger.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in Berlin

→ [Berlin destination guide](/destinations/berlin) — districts, night network, and pre-filled search dates.

Also useful around race weekend: [Berlin Marathon 2026 solo stays](/blog/berlin-marathon-2026-solo-women-hotels).

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
    where: { keyword: "is berlin safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is berlin safe for solo female travellers",
        cluster: "Berlin",
        intent: "informational",
        priority: 90,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is Berlin safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone — including at night: 24h weekend U-Bahn, calm districts, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is Berlin safe for solo female travellers? | Yes I Can Travel",
    seoDescription:
      "Is Berlin safe for women at night? Weekend 24h U-Bahn, Prenzlauer Berg & Mitte, and hotel filters — practical, not fear-based.",
    targetKeyword: "is berlin safe for women at night",
    destination: "Berlin",
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
