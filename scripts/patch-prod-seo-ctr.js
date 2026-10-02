/**
 * Patch production blog SEO titles via /api/automation/content/seo
 * Usage: node scripts/patch-prod-seo-ctr.js
 */
require("dotenv").config({ path: ".env.local" });

const ORIGIN = process.env.SITE_ORIGIN || "https://yesicantravel.com";
const TOKEN = process.env.REVENUE_AGENT_ADMIN_TOKEN;

const PATCHES = [
  {
    slug: "amsterdam-safe-solo-women-night",
    seoTitle: "Is Amsterdam Safe at Night for Women?",
    seoDescription:
      "Yes for most solo women in the canal belt — night buses after midnight, lit bases, 24/7 reception. Practical guide + free checklist.",
    targetKeyword: "is amsterdam safe at night for women",
    title: "Is Amsterdam safe at night for women?",
  },
  {
    slug: "is-milan-safe-for-solo-female-travellers",
    seoTitle: "Is Milan Safe for Solo Female Travellers?",
    seoDescription:
      "Yes — for most solo women in Brera or Porta Nuova. Metro until ~00:30, 24/7 reception hotels, free checklist.",
    targetKeyword: "is milan safe for solo female travellers",
  },
];

async function main() {
  if (!TOKEN) throw new Error("REVENUE_AGENT_ADMIN_TOKEN missing");
  for (const patch of PATCHES) {
    const res = await fetch(`${ORIGIN}/api/automation/content/seo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": TOKEN,
      },
      body: JSON.stringify(patch),
    });
    const json = await res.json().catch(() => ({}));
    console.log(patch.slug, res.status, JSON.stringify(json));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
