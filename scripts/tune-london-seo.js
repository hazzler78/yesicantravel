const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const london = await p.contentItem.updateMany({
    where: { slug: "is-london-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is London Safe for Solo Female Travellers? (Honest 2026 Guide)",
      seoDescription:
        "Is London safe for solo female travellers? Night Tube, licensed taxis, stay areas, and 24/7 reception filters — plus free checklist.",
    },
  });
  console.log(JSON.stringify({ london: london.count }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
