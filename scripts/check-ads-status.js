const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.jobRun.findMany({
    where: { jobName: "ads_execute" },
    orderBy: { startedAt: "desc" },
    take: 3,
  });

  const cycle = await prisma.adBudgetCycle.findUnique({
    where: { periodMonth: "2026-04" },
  });

  console.log(
    JSON.stringify(
      {
        jobs: jobs.map((job) => ({
          id: job.id,
          status: job.status,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt,
          errorMessage: job.errorMessage,
          context: job.context,
        })),
        cycle: cycle
          ? {
              id: cycle.id,
              periodMonth: cycle.periodMonth,
              status: cycle.status,
              proposedBudget: cycle.proposedBudget,
              approvedBudget: cycle.approvedBudget,
              spentBudget: cycle.spentBudget,
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
