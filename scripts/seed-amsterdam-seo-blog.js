/**
 * Seed Amsterdam SEO post targeting GSC queries:
 * "amsterdam safe at night", "female friendly amsterdam"
 *
 * Usage: DATABASE_URL=... node scripts/seed-amsterdam-seo-blog.js
 */

const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "amsterdam-safe-solo-women-night";

const BODY = `## Is Amsterdam safe for solo women at night?

Yes — with the usual city awareness. Amsterdam is compact, well-lit in the centre, and the tram/metro network runs late. The bigger risks are pickpocketing and bike traffic, not personal violence on busy streets.

This guide is for women planning a first or early solo trip. Practical, not fear-based. You decide what feels right.

## What "safe at night" actually means here

When people search **Amsterdam safe at night**, they usually want three answers:

1. Can I walk back to my hotel after dinner?
2. Are the canals / Red Light District areas comfortable alone?
3. What should I filter for before I book?

On Yes I Can Travel, **safest first** is the default sort. Prioritise:

- **24/7 staffed reception** — especially if your train or flight lands after 22:00
- **Well-lit street access** — check the map pin, not just the neighbourhood name
- **Free cancellation** — plans change; flexibility buys peace of mind
- **Walkable distance** to Centraal, Jordaan, or De Pijp depending on your evenings

## Neighbourhoods that work for solo women

### Jordaan (recommended)

Canal houses, cafés, and busy evenings without feeling chaotic. Walkable after dark on main streets. Quiet side alleys can feel empty late — stick to lit routes.

### De Pijp (recommended)

Food, nightlife, and a younger crowd. Well connected on metro/tram. Good if you want evenings out without a long late walk.

### Centrum / near Centraal (recommended with awareness)

Maximum convenience for arrivals. Busier and noisier. Fine for solo travellers who want short walks to transport — choose a hotel on a main street with 24/7 reception.

### Red Light District (caution after dark)

Fine to pass through in a group early evening; less comfortable alone late at night on quieter side streets. If your hotel is nearby, plan a lit main-street route or a short taxi/Uber.

## Female-friendly booking checklist (Amsterdam)

1. Save your hotel address offline before you leave Wi‑Fi.
2. Screenshot the walking route from Centraal or your metro stop.
3. Share your itinerary with one trusted contact.
4. Prefer trams/metro over unmarked taxis late; official taxis and apps work well.
5. Keep your phone and bag zipped on busy tourist stretches — pickpocketing is the main annoyance.

Want the full solo safety checklist? [Get it free here](/lead-magnet).

## Find safer stays in Amsterdam

Compare live availability with safety signals shown up front — reception hours, location, and cancellation terms.

[Search safe stays in Amsterdam →](/popular-cities)

Or open the [Amsterdam destination guide](/destinations/amsterdam) for neighbourhood detail, then book when it feels right.

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
    where: { keyword: "amsterdam safe at night solo women" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "amsterdam safe at night solo women",
        cluster: "Amsterdam",
        intent: "informational",
        priority: 90,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Amsterdam safe at night for solo women: practical neighbourhood guide",
    excerpt:
      "Is Amsterdam safe for solo women at night? Neighbourhood tips, hotel filters, and a female-friendly checklist — without scare tactics.",
    bodyMarkdown: BODY,
    seoTitle: "Amsterdam safe at night for solo women | Yes I Can Travel",
    seoDescription:
      "Female-friendly Amsterdam guide: safe neighbourhoods at night, 24/7 reception filters, and a practical solo travel checklist.",
    targetKeyword: "amsterdam safe at night",
    destination: "Amsterdam",
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
