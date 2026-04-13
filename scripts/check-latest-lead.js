const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.leadProfile.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!lead) {
    console.log(JSON.stringify({ lead: null, events: [] }, null, 2));
    return;
  }

  const events = await prisma.leadEvent.findMany({
    where: { leadProfileId: lead.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(
    JSON.stringify(
      {
        lead: {
          id: lead.id,
          email: lead.email,
          firstName: lead.firstName,
          source: lead.source,
          medium: lead.medium,
          campaign: lead.campaign,
          createdAt: lead.createdAt,
        },
        events: events.map((event) => ({
          id: event.id,
          type: event.type,
          eventName: event.eventName,
          eventAt: event.eventAt,
        })),
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
