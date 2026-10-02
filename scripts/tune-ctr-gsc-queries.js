/**
 * Align blog seoTitles with exact GSC queries (solo female travellers spelling)
 * and strip "| Yes I Can Travel" so the layout template does not double the brand.
 */
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const UPDATES = [
  {
    slug: "amsterdam-safe-solo-women-night",
    seoTitle: "Is Amsterdam Safe for Solo Female Travellers at Night?",
    seoDescription:
      "Is Amsterdam safe for solo female travellers at night? Night buses after midnight, canal-belt bases, 24/7 reception — practical guide + free checklist.",
  },
  {
    slug: "is-milan-safe-for-solo-female-travellers",
    seoTitle: "Is Milan Safe for Solo Female Travellers?",
    seoDescription:
      "Is Milan safe for solo female travellers? Brera & Porta Nuova, metro nights, 24/7 reception — plus free checklist.",
  },
  {
    slug: "is-paris-safe-for-solo-female-travellers",
    seoTitle: "Is Paris Safe for Solo Female Travellers? Honest 2026 Guide",
    seoDescription:
      "Is Paris safe for solo female travellers? Marais & Saint-Germain, metro nights, scams to ignore — plus free checklist.",
  },
  {
    slug: "is-barcelona-safe-for-solo-female-travellers",
    seoTitle: "Is Barcelona Safe for Solo Female Travellers? Honest 2026 Guide",
    seoDescription:
      "Is Barcelona safe for solo female travellers? Theft awareness, Eixample & Gràcia, metro nights, 24/7 reception — practical guide.",
  },
  {
    slug: "is-berlin-safe-for-solo-female-travellers",
    seoTitle: "Is Berlin Safe for Women at Night? Solo Female Guide 2026",
    seoDescription:
      "Is Berlin safe for women at night? Weekend 24h U-Bahn, Prenzlauer Berg & Mitte, hotel filters — practical, not fear-based.",
  },
  {
    slug: "is-okinawa-safe-for-solo-female-travellers",
    seoTitle: "Is Okinawa Safe for Solo Female Travellers? Honest 2026 Guide",
    seoDescription:
      "Is Okinawa safe for solo female travellers? Yui Rail until 23:30, Naha vs west-coast resorts, taxis, 24/7 reception — plus free checklist.",
  },
];

async function main() {
  const results = [];
  for (const u of UPDATES) {
    const r = await p.contentItem.updateMany({
      where: { slug: u.slug },
      data: { seoTitle: u.seoTitle, seoDescription: u.seoDescription },
    });
    results.push({ slug: u.slug, updated: r.count });
  }
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
