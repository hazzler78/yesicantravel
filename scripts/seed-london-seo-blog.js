/**
 * Seed London SEO post — ChatGPT already converted via /destinations/london;
 * GSC shows "is london safe for solo female travellers".
 * Usage: DATABASE_URL=... node scripts/seed-london-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-london-safe-for-solo-female-travellers";

const BODY = `## Is London safe for solo female travellers?

Yes — with the same big-city awareness you'd use in any capital. London is well policed, Tube stations are staffed, and millions of women move around alone every day. The risk that actually catches visitors out is **unbooked minicabs**, not walking through central areas at night.

This guide is practical, not fear-based. You decide what feels right.

## What this question usually means

When people ask **is London safe for solo female travellers**, they want:

1. Can I use the Tube / Night Tube alone?
2. Which areas feel comfortable to sleep in?
3. What should I filter for before I book a hotel?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception** — especially after late theatre or flights
- **Map pin near a Tube stop** with staffed stations
- **Free cancellation** until your plans are locked
- **Licensed Black Cab or pre-booked ride** — never a minicab you didn't book

## Neighbourhoods that work for solo women

### South Kensington (recommended)

Residential, well lit, museum district. District, Circle and Piccadilly lines — Piccadilly runs to Heathrow.

### Bloomsbury (recommended)

Central, garden squares, walkable to the British Museum and King's Cross / Euston. Busy enough without being nightlife-heavy.

### Soho / Leicester Square (caution as a sleep base)

Fine to visit. Loud late, denser crowds, more pickpocketing risk. Better as an evening destination than your hotel postcode.

## Getting around after dark

- Night Tube runs on key lines Fridays and Saturdays — check your line before you rely on it.
- Black Cabs are licensed and can be hailed; minicabs must be pre-booked through an app or operator.
- Staff are present at Tube stations from first train to last — use that if something feels off.

## Solo checklist for London

1. Screenshot hotel address + Tube stop offline.
2. Prefer a staffed station exit over a quiet back street at night.
3. Pre-book rides; skip unsolicited offers at airports and stations.
4. Tell one trusted contact your hotel name and dates.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in London

→ [London destination guide](/destinations/london) — areas, Night Tube notes, and pre-filled search dates.

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
    where: { keyword: "is london safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is london safe for solo female travellers",
        cluster: "London",
        intent: "informational",
        priority: 93,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is London safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone: Tube and Night Tube, neighbourhoods, minicab rules, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is London safe for solo female travellers? | Yes I Can Travel",
    seoDescription:
      "Is London safe for solo women? Neighbourhoods, Night Tube, licensed taxis vs minicabs, and hotel filters — practical, not fear-based.",
    targetKeyword: "is london safe for solo female travellers",
    destination: "London",
    status: ContentStatus.published,
    publishedAt: new Date(),
    draftSource: "gsc-chatgpt-funnel-seed",
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
