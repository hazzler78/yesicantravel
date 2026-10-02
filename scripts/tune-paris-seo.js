const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const paris = await p.contentItem.updateMany({
    where: { slug: "is-paris-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is Paris Safe for Solo Women? Where to Stay in 2026",
      seoDescription:
        "Is Paris safe for solo female travellers? Where to stay: Marais & Saint-Germain, metro nights, scams to ignore — plus free checklist.",
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
