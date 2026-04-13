const { PrismaClient, ContentStatus } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function main() {
  const target = await prisma.keywordTarget.findFirst({
    where: { isActive: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
  if (!target) {
    throw new Error("No keyword target found");
  }

  const slug = slugify(`${target.keyword}-${Date.now()}`);
  const draft = await prisma.contentItem.create({
    data: {
      slug,
      title: `Safe solo travel guide: ${target.keyword}`,
      excerpt: `Actionable safety-first tips for ${target.cluster || "Europe"} solo travelers.`,
      bodyMarkdown: `## Why this matters

Safety-first planning for ${target.keyword}.

## Hotel checklist

- 24/7 reception
- Well-lit access
- Strong solo women reviews

## Book with confidence

Use Yes I Can Travel filters to find safer stays.`,
      seoTitle: `${target.keyword} | Yes I Can Travel`,
      seoDescription: `Safety-first guide for ${target.keyword}.`,
      targetKeyword: target.keyword,
      destination: target.cluster || "Europe",
      status: ContentStatus.review,
      draftSource: "manual-full-cycle-test",
      keywordTargetId: target.id,
    },
  });

  const post = await prisma.contentItem.update({
    where: { id: draft.id },
    data: {
      status: ContentStatus.published,
      publishedAt: new Date(),
    },
  });

  console.log(
    JSON.stringify(
      {
        contentId: post.id,
        slug: post.slug,
        title: post.title,
        urlPath: `/blog/${post.slug}`,
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
