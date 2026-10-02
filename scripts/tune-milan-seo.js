const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const milan = await p.contentItem.updateMany({
    where: { slug: "is-milan-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is Milan Safe for Solo Women? Where to Stay in 2026",
      seoDescription:
        "Is Milan safe for solo female travellers? Where to stay: Brera & Porta Nuova, metro nights, 24/7 reception — plus free checklist.",
    },
  });
  console.log(JSON.stringify({ milan: milan.count }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
