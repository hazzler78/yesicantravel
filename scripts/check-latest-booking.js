const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const booking = await prisma.bookingEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!booking) {
    console.log(JSON.stringify({ booking: null, ledger: null }, null, 2));
    return;
  }

  const ledger = await prisma.revenueLedger.findFirst({
    where: { bookingEventId: booking.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(
    JSON.stringify(
      {
        booking: {
          id: booking.id,
          bookingId: booking.bookingId,
          leadProfileId: booking.leadProfileId,
          grossRevenue: booking.grossRevenue,
          estimatedCommission: booking.estimatedCommission,
          currency: booking.currency,
          eventAt: booking.eventAt,
        },
        ledger: ledger
          ? {
              id: ledger.id,
              periodMonth: ledger.periodMonth,
              grossRevenue: ledger.grossRevenue,
              commission: ledger.commission,
              netRevenue: ledger.netRevenue,
            }
          : null,
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
