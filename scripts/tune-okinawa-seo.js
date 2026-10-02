const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const okinawa = await p.contentItem.updateMany({
    where: { slug: "is-okinawa-safe-for-solo-female-travellers" },
    data: {
      seoTitle: "Is Okinawa Safe for Solo Female Travellers? Honest 2026 Guide",
      seoDescription:
        "Is Okinawa safe for solo female travellers? Yui Rail until 23:30, Naha vs west-coast resorts, taxis, 24/7 reception — plus free checklist.",
    },
  });
  console.log(JSON.stringify({ okinawa: okinawa.count }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
