const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const SLUG = "safe-solo-hotels-barcelona-women";

const BODY = `## Why Barcelona works for your first solo trip

Barcelona is one of Europe's most visited cities for good reason: the metro runs until midnight (and later on weekends), neighbourhoods like Eixample and Gràcia are walkable after dark, and hotels with 24/7 reception are easy to find when you know what to filter for.

This guide is for women planning a first or early solo trip — practical, not fear-based. You are capable; the goal is to reduce unknowns before you book.

## What to filter for before you book

On Yes I Can Travel, **safest first** is the default sort — not cheapest. When comparing stays in Barcelona, prioritise:

- **24/7 staffed reception** — especially if your flight lands after 22:00
- **Well-lit street access** — check the map pin; a pretty photo does not tell you about the alley at night
- **Free cancellation** — plans change; flexible rates cost a little more but buy peace of mind
- **Recent guest reviews** — look for comments about solo women, cleanliness, and late check-in

We surface safety signals from what each property publishes. We do not hand-pick or curate hotels — you compare real availability and book directly through our platform.

## Neighbourhoods that work for solo women

### Eixample (recommended)

Wide boulevards, grid streets, and busy terraces until late. Safe to walk alone after dinner in the central blocks. Well connected on metro lines L2, L3, and L5.

### Gràcia (recommended)

Village feel north of the centre. Quieter at night than the Ramblas but still lively around Plaça de la Virreina. Good if you want character without tourist chaos.

### El Born / Gothic Quarter (recommended with caution)

Beautiful and central, but narrow lanes can feel empty late at night. Stay on main arteries (Via Laietana side) and take a taxi after 23:00 if you have been out in the port area.

### Raval (caution)

Culturally rich but patchy — some blocks are fine, others are not comfortable alone after dark. If you book here, choose a hotel on a main street with 24/7 reception and plan transport at night.

## Practical safety checklist

1. Save your hotel address offline and screenshot the walking route from the metro.
2. Share your itinerary with one trusted contact — not to ask permission, but so someone knows your plan.
3. Use official taxis or Freenow/Cabify after late nights; avoid unmarked offers at port clubs.
4. Keep your phone in a front pocket on the metro — pickpocketing is the main risk, not personal violence.
5. Book accommodation with free cancellation until you have locked your flights.

## Events and peak dates in Barcelona

If you are travelling for a festival, pre-filled dates save time:

- **Primavera Sound** (June) — stay on the yellow metro line or in Poblenou
- **Mobile World Congress** (February/March) — book early; prices spike in 22@ and Eixample

See our [Primavera Sound Barcelona event page](/events/primavera-sound-barcelona-2026) for neighbourhood tips and pre-filled search dates.

## Find and book safer stays now

Search Barcelona on Yes I Can Travel with safety filters applied from the start. Compare real-time availability, read guest reviews, and book with Stripe or PayPal — taxes and fees shown upfront.

[Search safe stays in Barcelona →](/results?aiSearch=safe+central+hotels+Barcelona+well-lit+24h+reception&checkin=2026-06-03&checkout=2026-06-07&adults=1)

---

*Questions? Email [hello@yesicantravel.com](mailto:hello@yesicantravel.com) — we help solo women travel with more confidence, not less adventure.*
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
    where: { keyword: "safe solo hotels barcelona women" },
  });
  if (!keywordTarget) {
    keywordTarget = await prisma.keywordTarget.create({
      data: {
        keyword: "safe solo hotels barcelona women",
        cluster: "Barcelona",
        intent: "commercial",
        priority: 95,
        isActive: true,
      },
    });
  }

  const data = {
    slug: SLUG,
    title: "Safe solo hotels in Barcelona: a practical guide for women",
    excerpt:
      "Neighbourhood tips, hotel filters, and a safety checklist for women booking their first solo trip to Barcelona.",
    bodyMarkdown: BODY,
    seoTitle: "Safe solo hotels Barcelona for women | Yes I Can Travel",
    seoDescription:
      "Where to stay in Barcelona as a solo woman: Eixample, Gràcia, safety filters, 24/7 reception, and free cancellation. Book with confidence.",
    targetKeyword: "safe solo hotels barcelona women",
    destination: "Barcelona",
    status: ContentStatus.published,
    publishedAt: new Date(),
    draftSource: "traffic-plan-seed",
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
