/**
 * Measures how much of the accommodation partner's data actually backs the
 * "Safety and access" filters on /results.
 *
 * The filters are only worth showing while the underlying fields stay
 * populated, and that is entirely outside our control. Re-run this when
 * results look thin or before adding a new filter:
 *
 *   LITEAPI_KEY=... node scripts/audit-stay-signals.mjs
 *   LITEAPI_KEY=... node scripts/audit-stay-signals.mjs FR:Paris DE:Berlin
 *
 * It only calls read-only /data endpoints — no rates, no bookings.
 */

const KEY = process.env.LITEAPI_KEY;
const BASE = "https://api.liteapi.travel/v3.0";

if (!KEY) {
  console.error("LITEAPI_KEY is required.");
  process.exit(1);
}

const headers = { "X-API-Key": KEY, accept: "application/json" };
const PER_CITY = 10;

const DEFAULT_CITIES = ["FR:Paris", "ES:Barcelona", "IT:Rome", "DE:Berlin", "NL:Amsterdam"];
const cities = (process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_CITIES).map((arg) => {
  const [countryCode, cityName] = arg.split(":");
  return { countryCode, cityName };
});

const TRANSIT_CATEGORIES = new Set(["train_station", "transit", "subway", "metro", "bus_station"]);

/** Mirrors NEAR_TRANSIT_KM in src/lib/staySignals.ts. */
const NEAR_TRANSIT_KM = 0.5;

/** The first two mirror the shipped filters; the rest are context for why. */
const FACILITY_SIGNALS = {
  "FILTER 24-hour security": /24-hour security|24 hour security/i,
  "FILTER private check-in": /private check-in/i,
  "context: contactless check-in": /contactless check-in/i,
  "context: security alarm": /security alarm/i,
  "context: CCTV anywhere": /cctv/i,
  "context: 24-hour front desk": /24-hour front desk|24 hour front desk/i,
  "context: in-room safe": /safety deposit box|in-room safe/i,
  "context: well-lit path to entrance": /well-lit path to entrance/i,
};

const WOMEN_ONLY_ROOM = /\b(female|women|women's|womens|ladies|ladies')\b/i;

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

const tally = {
  properties: 0,
  "FILTER women-only room": 0,
  "FILTER near transit": 0,
  "data: transit distance known": 0,
  "data: latest check-in known": 0,
  ...Object.fromEntries(Object.keys(FACILITY_SIGNALS).map((k) => [k, 0])),
};

for (const city of cities) {
  const query = new URLSearchParams({ ...city, limit: String(PER_CITY * 2) });
  const listed = (await get(`/data/hotels?${query}`)).data ?? [];
  for (const item of listed.slice(0, PER_CITY)) {
    const detail = (await get(`/data/hotel?hotelId=${encodeURIComponent(item.id)}&timeout=6`)).data;
    if (!detail) continue;
    tally.properties += 1;

    const facilities = (detail.hotelFacilities ?? [])
      .concat((detail.facilities ?? []).map((f) => f?.name).filter(Boolean))
      .join(" | ");
    for (const [label, pattern] of Object.entries(FACILITY_SIGNALS)) {
      if (pattern.test(facilities)) tally[label] += 1;
    }

    const roomNames = (detail.rooms ?? []).map((r) => r?.roomName ?? "").join(" | ");
    if (WOMEN_ONLY_ROOM.test(roomNames)) {
      tally["FILTER women-only room"] += 1;
      console.log(`  women-only room: ${detail.name} (${city.cityName})`);
    }

    const transit = (detail.poi ?? [])
      .filter((p) => TRANSIT_CATEGORIES.has(p?.category) && typeof p?.distanceKm === "number")
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
    if (transit) {
      tally["data: transit distance known"] += 1;
      if (transit.distanceKm <= NEAR_TRANSIT_KM) tally["FILTER near transit"] += 1;
    }

    if (detail.checkinCheckoutTimes?.checkin_end) tally["data: latest check-in known"] += 1;
  }
}

const { properties } = tally;
const pct = (n) => `${String(Math.round((n / properties) * 100)).padStart(3)}%`;

console.log(`\nSampled ${properties} properties across ${cities.length} cities.\n`);
for (const [label, count] of Object.entries(tally)) {
  if (label === "properties") continue;
  console.log(`  ${pct(count)}  ${String(count).padStart(3)}/${properties}  ${label}`);
}
console.log(
  "\nA filter is only worth keeping while it sits well below 100% (it has to " +
    "narrow something) and above 0% (it has to match something)."
);
