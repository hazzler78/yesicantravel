/**
 * Generate extra Pinterest pins (1000×1500) for SEO blog funnels.
 * Usage: node scripts/generate-seo-pins.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "pins");

const PINS = [
  {
    id: "pin-milan-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is Milan safe for", "solo female travellers?"],
    bullets: ["Brera & Porta Nuova", "Metro nights explained", "Hotel filters that help"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-web-summit-lisbon",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Web Summit Lisbon", "safer solo hotels"],
    bullets: ["Red metro line", "Parque das Nacoes", "Late-night returns"],
    cta: "See stay guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-rock-en-seine",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Rock en Seine", "solo women hotels"],
    bullets: ["Metro line 10", "Boulogne base", "24/7 reception"],
    cta: "See stay guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-london-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is London safe for", "solo female travellers?"],
    bullets: ["Night Tube explained", "Licensed taxi rule", "Areas that work alone"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-paris-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is Paris safe for", "solo female travellers?"],
    bullets: ["Marais & Saint-Germain", "Metro nights", "Scams you can walk past"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-berlin-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is Berlin safe for", "solo female travellers?"],
    bullets: ["24h weekend U-Bahn", "Prenzlauer Berg & Mitte", "Night bus weekdays"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-barcelona-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is Barcelona safe for", "solo female travellers?"],
    bullets: ["Eixample & Gracia", "Metro nights explained", "Plan for pickpockets"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-ade-2026",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Amsterdam Dance Event", "2026 solo hotels"],
    bullets: ["21-25 October 2026", "Centre bases for nights out", "24/7 reception filter"],
    cta: "See stay guide",
    urlLine: "yesicantravel.com/blog",
  },
  {
    id: "pin-okinawa-safe",
    brand: "YES I CAN TRAVEL",
    titleLines: ["Is Okinawa safe for", "solo female travellers?"],
    bullets: ["Naha monorail bases", "West-coast resorts", "After 23:30 taxis"],
    cta: "Read the guide",
    urlLine: "yesicantravel.com/blog",
  },
];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pinSvg(pin) {
  const titles = pin.titleLines
    .map(
      (line, i) =>
        `<text x="500" y="${320 + i * 80}" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#1A2332">${escapeXml(line)}</text>`
    )
    .join("\n  ");

  const bullets = pin.bullets
    .map((b, i) => {
      const y = 640 + i * 100;
      return `<circle cx="220" cy="${y - 10}" r="14" fill="#0D7377"/>
  <text x="260" y="${y}" font-family="system-ui, sans-serif" font-size="30" fill="#1A2332">${escapeXml(b)}</text>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500" role="img">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7F4EF"/>
      <stop offset="100%" stop-color="#E8F4F3"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1500" fill="url(#bg)"/>
  <rect x="60" y="60" width="880" height="1380" rx="32" fill="#FFFFFF" stroke="#D4E8E6" stroke-width="3"/>
  <text x="500" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#0D7377" letter-spacing="4">${escapeXml(pin.brand)}</text>
  ${titles}
  ${bullets}
  <rect x="250" y="1120" width="500" height="88" rx="16" fill="#E07A5F"/>
  <text x="500" y="1176" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" font-weight="700" fill="#FFFFFF">${escapeXml(pin.cta)}</text>
  <text x="500" y="1320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" fill="#5A6570">${escapeXml(pin.urlLine)}</text>
</svg>
`;
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  for (const pin of PINS) {
    const svgPath = path.join(DIR, `${pin.id}.svg`);
    const pngPath = path.join(DIR, `${pin.id}.png`);
    fs.writeFileSync(svgPath, pinSvg(pin), "utf8");
    await sharp(svgPath).resize(1000, 1500).png().toFile(pngPath);
    console.log(`Wrote ${pin.id}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
