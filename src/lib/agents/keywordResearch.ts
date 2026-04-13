import { prisma } from "@/lib/prisma";

const DEFAULT_KEYWORDS = [
  { keyword: "safe solo hotels barcelona women", cluster: "Barcelona", intent: "commercial", priority: 95 },
  { keyword: "safest solo travel europe women", cluster: "Europe", intent: "informational", priority: 90 },
  { keyword: "safe hotel neighborhoods paris solo female", cluster: "Paris", intent: "commercial", priority: 88 },
  { keyword: "best women solo travel hotels lisbon", cluster: "Lisbon", intent: "commercial", priority: 85 },
];

export async function seedKeywordTargets() {
  const seeded = [];
  for (const item of DEFAULT_KEYWORDS) {
    const row = await prisma.keywordTarget.upsert({
      where: { keyword: item.keyword },
      create: item,
      update: {
        cluster: item.cluster,
        intent: item.intent,
        priority: item.priority,
        isActive: true,
      },
    });
    seeded.push(row);
  }
  return seeded;
}
