/**
 * Generate Instagram carousel slides (1080×1350) as SVG + PNG.
 * Usage: node scripts/generate-carousel-slides.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "carousel");
const W = 1080;
const H = 1350;

const SLIDES = [
  {
    id: "01-hook",
    lines: ["3 things I never skip", "as a solo woman"],
    sub: "Save this before you book",
  },
  {
    id: "02-reception",
    lines: ["1 · Reception hours"],
    sub: "Will someone be at the desk when you arrive?",
  },
  {
    id: "03-map",
    lines: ["2 · Map pin truth"],
    sub: "Does the pin match a lit, walkable street?",
  },
  {
    id: "04-cancel",
    lines: ["3 · Free cancellation"],
    sub: "Plans change. Flexibility = calm.",
  },
  {
    id: "05-sort",
    lines: ["We sort safest first"],
    sub: "Not cheapest. Not most popular.",
  },
  {
    id: "06-checklist",
    lines: ["Free checklist"],
    sub: "Reception · arrival after dark · what to check",
  },
  {
    id: "07-cta",
    lines: ["Link in bio"],
    sub: "yesicantravel.com/bio",
  },
];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slideSvg({ lines, sub }) {
  const titleYs = lines.length === 1 ? [560] : [500, 600];
  const titleTexts = lines
    .map(
      (line, i) =>
        `<text x="540" y="${titleYs[i]}" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#1A2332">${escapeXml(line)}</text>`
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7F4EF"/>
      <stop offset="100%" stop-color="#E8F4F3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="48" y="48" width="${W - 96}" height="${H - 96}" rx="28" fill="#FFFFFF" stroke="#D4E8E6" stroke-width="3"/>
  <text x="540" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#0D7377" letter-spacing="4">YES I CAN TRAVEL</text>
  ${titleTexts}
  <text x="540" y="720" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" fill="#5A6570">${escapeXml(sub)}</text>
  <rect x="340" y="1100" width="400" height="72" rx="14" fill="#E07A5F"/>
  <text x="540" y="1146" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">Travel confidently</text>
</svg>
`;
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  const manifest = [];

  for (const slide of SLIDES) {
    const svgName = `carousel-${slide.id}.svg`;
    const pngName = `carousel-${slide.id}.png`;
    const svgPath = path.join(DIR, svgName);
    const pngPath = path.join(DIR, pngName);
    fs.writeFileSync(svgPath, slideSvg(slide), "utf8");
    await sharp(svgPath).resize(W, H).png().toFile(pngPath);
    console.log(`Wrote public/carousel/${pngName}`);
    manifest.push({
      id: slide.id,
      filePath: `/carousel/${pngName}`,
      publicUrl: `https://yesicantravel.com/carousel/${pngName}`,
      lines: slide.lines,
      sub: slide.sub,
    });
  }

  fs.writeFileSync(
    path.join(DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
  console.log(`Wrote ${manifest.length} slides`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
