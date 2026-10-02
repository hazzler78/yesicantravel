/**
 * Notify IndexNow (Bing/Yandex/etc.) that key URLs changed.
 * Key file must be served at https://yesicantravel.com/{key}.txt
 * Usage: node scripts/ping-indexnow.js
 */

const KEY = "yesicantravel-indexnow-2026";
const HOST = "yesicantravel.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URLS = [
  "https://yesicantravel.com/blog/is-barcelona-safe-for-solo-female-travellers",
  "https://yesicantravel.com/blog/amsterdam-dance-event-2026-solo-women-hotels",
  "https://yesicantravel.com/blog/amsterdam-safe-solo-women-night",
  "https://yesicantravel.com/blog/is-milan-safe-for-solo-female-travellers",
  "https://yesicantravel.com/blog/berlin-marathon-2026-solo-women-hotels",
  "https://yesicantravel.com/lead-magnet",
  "https://yesicantravel.com/destinations",
  "https://yesicantravel.com/sitemap.xml",
];

async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: URLS,
    }),
  });
  const text = await res.text();
  console.log(JSON.stringify({ status: res.status, body: text.slice(0, 500), count: URLS.length }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
