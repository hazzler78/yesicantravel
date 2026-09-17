/**
 * Convert public/pins/*.svg → PNG (1000×1500) for Pinterest upload.
 * Usage: node scripts/convert-pins-to-png.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "pins");

async function main() {
  const svgs = fs.readdirSync(DIR).filter((f) => f.endsWith(".svg"));
  if (svgs.length === 0) {
    console.error("No SVG files in public/pins");
    process.exit(1);
  }

  for (const file of svgs) {
    const input = path.join(DIR, file);
    const output = path.join(DIR, file.replace(/\.svg$/i, ".png"));
    await sharp(input).resize(1000, 1500).png().toFile(output);
    console.log(`Wrote ${path.relative(process.cwd(), output)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
