const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const paris = await p.contentItem.updateMany({
    where: { slug: "is-paris-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is Paris Safe for Solo Female Travellers? Honest 2026 Guide",
      seoDescription:
        "Is Paris safe for solo female travellers? Marais & Saint-Germain, metro nights, scams to ignore, 24/7 reception — plus free checklist.",
    },
  });
  console.log(JSON.stringify({ paris: paris.count }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
