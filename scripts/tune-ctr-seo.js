/**
 * CTR-focused SEO tweaks for queries already ranking ~page 1–2 in GSC.
 * Usage: DATABASE_URL=... node scripts/tune-ctr-seo.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UPDATES = [
  {
    slug: "is-milan-safe-for-solo-female-travellers",
    seoTitle: "Is Milan Safe for Solo Female Travellers? (Honest 2026 Guide)",
    seoDescription:
      "Yes — with pickpocketing awareness. Brera & Porta Nuova, metro until ~00:30, and 24/7 reception filters. Practical Milan solo guide.",
  },
  {
    slug: "berlin-marathon-2026-solo-women-hotels",
    seoTitle: "Berlin Marathon 2026 Date (27 Sept) + Solo Women Hotels",
    seoDescription:
      "BMW Berlin Marathon 2026 is Sunday 27 September. Safer solo stays near the course, 24/7 reception, and pre-filled hotel search dates.",
  },
  {
    slug: "amsterdam-safe-solo-women-night",
    seoTitle: "Is Amsterdam Safe for Solo Female Travellers? (Incl. Night)",
    seoDescription:
      "Is Amsterdam safe for solo women — including at night? Canal-belt bases, late trams, and 24/7 reception filters. Practical, not fear-based.",
  },
];

async function main() {
  for (const u of UPDATES) {
    const existing = await prisma.contentItem.findUnique({
      where: { slug: u.slug },
      select: { id: true },
    });
    if (!existing) {
      console.log(JSON.stringify({ skipped: true, reason: "missing", slug: u.slug }));
      continue;
    }
    await prisma.contentItem.update({
      where: { id: existing.id },
      data: {
        seoTitle: u.seoTitle,
        seoDescription: u.seoDescription,
      },
    });
    console.log(JSON.stringify({ updated: true, slug: u.slug, seoTitle: u.seoTitle }));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
