import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildDraftBody(keyword: string, destination: string) {
  return `## Why ${destination} is a smart solo destination

${destination} offers a strong combination of walkable neighborhoods, transit access, and accommodation options with 24/7 support.

## How to choose a safer hotel

- Prioritize 24/7 staffed reception and clear late-night access.
- Check recent reviews from women traveling solo.
- Prefer neighborhoods with strong lighting and easy transit.

## Practical safety checklist

1. Save your hotel address offline before arrival.
2. Share your itinerary with one trusted contact.
3. Pre-book airport/train transfer for late arrivals.

## Find stays now

Use Yes I Can Travel to compare safer options with confidence-focused filters.
`;
}

export async function generateScheduledDrafts(limit = 3) {
  const targets = await prisma.keywordTarget.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: limit,
  });

  const created = [];
  for (const target of targets) {
    const destination = target.cluster ?? "Europe";
    const slug = slugify(`${target.keyword}-${Date.now()}`);
    const title = `Safe solo travel guide: ${target.keyword}`;
    const existing = await prisma.contentItem.findFirst({
      where: { targetKeyword: target.keyword, status: { in: [ContentStatus.draft, ContentStatus.review] } },
    });
    if (existing) continue;

    const item = await prisma.contentItem.create({
      data: {
        slug,
        title,
        excerpt: `Actionable safety-first tips for ${destination} solo travelers.`,
        bodyMarkdown: buildDraftBody(target.keyword, destination),
        seoTitle: `${target.keyword} | Yes I Can Travel`,
        seoDescription: `Safety-first guide for ${target.keyword}. Hotels, neighborhoods, and practical solo travel planning tips.`,
        targetKeyword: target.keyword,
        destination,
        status: ContentStatus.review,
        draftSource: "revenue-agent-scheduled",
        keywordTargetId: target.id,
      },
    });
    created.push(item);
  }
  return created;
}
