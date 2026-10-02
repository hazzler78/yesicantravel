/**
 * Seed Okinawa SEO post — GSC: "is okinawa safe for solo female travellers" (~pos 9.7).
 * Usage: DATABASE_URL=... node scripts/seed-okinawa-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "is-okinawa-safe-for-solo-female-travellers";

const BODY = `## Is Okinawa safe for solo female travellers?

Yes — by most measures. Violent crime against visitors is rare, hotels are used to international guests travelling alone, and official taxis are metered. The two things that actually catch people out are the **Yui Rail stopping around 23:30** and busier bar streets on weekend nights. Neither requires you to cancel the trip — only to plan the last stretch home.

This guide is practical, not fear-based.

## What the question usually means

When someone asks **is Okinawa safe for solo female travellers**, they usually want:

1. Can I base in Naha without a car?
2. What happens after the monorail stops?
3. Beach resorts vs city — which is easier alone?

On Yes I Can Travel, sort **safest first** and keep **24/7 reception** on.

## Neighbourhoods that work alone

### Naha — Kokusai-dori / Omoromachi (recommended)

The capital and the only part of the island you can do comfortably without a car. Lit streets, restaurants, Yui Rail. Best first-time solo base.

### Onna / west-coast resorts (recommended)

Large beachfront properties with 24/7 desks and shuttles. Ideal if you want the sea and a locked door — use the hotel shuttle or taxi off-property.

### American Village, Chatan (caution as a sleep base)

Fine for an evening out; a mixed nightlife scene. Know your way back rather than sleeping here on a first trip.

## Getting around after 23:30

- Yui Rail: roughly **06:00–23:30** (airport through the city)
- After that: **official taxi ranks** (metered) — do not accept a ride from someone who approaches you
- Japan needs the **1949-format** International Driving Permit if you rent a car

## Solo checklist for Okinawa

1. Stay near a Yui Rail stop if you will be out late in Naha.
2. Screenshot hotel address in Japanese + English.
3. Know typhoon-season ferry cancellations (roughly June–October).
4. Prefer 24/7 reception on beach resorts.
5. Grab the full [solo safety checklist](/lead-magnet) before you fly.

## Book safer stays in Okinawa

→ [Okinawa destination guide](/destinations/okinawa) — Naha vs west coast, monorail hours, and pre-filled search dates.

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
    where: { keyword: "is okinawa safe for solo female travellers" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "is okinawa safe for solo female travellers",
        cluster: "Okinawa",
        intent: "informational",
        priority: 88,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Is Okinawa safe for solo female travellers?",
    excerpt:
      "Honest answer for women travelling alone: Naha vs west-coast resorts, Yui Rail until 23:30, and what to filter before you book.",
    bodyMarkdown: BODY,
    seoTitle: "Is Okinawa Safe for Solo Female Travellers? (Honest Guide)",
    seoDescription:
      "Is Okinawa safe for solo women? Yes — plan for monorail hours after 23:30. Naha bases, west-coast resorts, taxis, and 24/7 reception filters.",
    targetKeyword: "is okinawa safe for solo female travellers",
    destination: "Okinawa",
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
