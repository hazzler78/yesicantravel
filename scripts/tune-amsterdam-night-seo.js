/**
 * CTR-tune Amsterdam night blog title to match near-page-one GSC queries
 * ("is amsterdam safe at night for women", "... at night").
 */
const { PrismaClient } = require("@prisma/client");

const p = new PrismaClient();

async function main() {
  const updated = await p.contentItem.updateMany({
    where: { slug: "amsterdam-safe-solo-women-night" },
    data: {
      seoTitle: "Is Amsterdam Safe at Night for Women? Solo Guide 2026",
      seoDescription:
        "Is Amsterdam safe at night for women travelling solo? Canal-belt bases, night buses after midnight, and 24/7 reception filters. Practical, not fear-based.",
      title: "Is Amsterdam safe at night for women?",
    },
  });
  console.log(JSON.stringify({ updated: updated.count }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
