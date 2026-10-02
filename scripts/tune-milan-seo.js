const { PrismaClient } = require("@prisma/client");

const p = new PrismaClient();

async function main() {
  const milan = await p.contentItem.updateMany({
    where: { slug: "is-milan-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is Milan Safe for Solo Female Travellers in 2026? Areas + Hotels",
      seoDescription:
        "Is Milan safe for solo female travellers? Brera & Porta Nuova, metro until ~00:30, 24/7 reception filters — plus free checklist. Honest 2026 guide.",
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
