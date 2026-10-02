/**
 * Ready-to-upload Pinterest pins (PNG 1000×1500 in /public/pins).
 */

export type ReadyPin = {
  id: string;
  title: string;
  filePath: string;
  publicUrl: string;
  destinationPath: string;
  utmCampaign: string;
  pinDescription: string;
};

const ORIGIN = "https://yesicantravel.com";

export const READY_PINS: ReadyPin[] = [
  {
    id: "pin-lead-magnet",
    title: "Free solo female safety checklist",
    filePath: "/pins/pin-lead-magnet.png",
    publicUrl: `${ORIGIN}/pins/pin-lead-magnet.png`,
    destinationPath: "/lead-magnet",
    utmCampaign: "pin_lead_magnet",
    pinDescription:
      "Free practical checklist for women travelling solo — reception hours, map checks, arriving after dark. No scare tactics.",
  },
  {
    id: "pin-amsterdam-night",
    title: "Amsterdam safe at night for solo women",
    filePath: "/pins/pin-amsterdam-night.png",
    publicUrl: `${ORIGIN}/pins/pin-amsterdam-night.png`,
    destinationPath: "/blog/amsterdam-safe-solo-women-night",
    utmCampaign: "pin_amsterdam_night",
    pinDescription:
      "Is Amsterdam safe for solo women at night? Neighbourhood tips + hotel filters. Practical guide.",
  },
  {
    id: "pin-berlin-marathon",
    title: "Berlin Marathon 2026 solo women hotels",
    filePath: "/pins/pin-berlin-marathon.png",
    publicUrl: `${ORIGIN}/pins/pin-berlin-marathon.png`,
    destinationPath: "/blog/berlin-marathon-2026-solo-women-hotels",
    utmCampaign: "pin_berlin_marathon",
    pinDescription:
      "BMW Berlin Marathon 2026 — safer stays for solo women runners. Pre-filled dates + safety filters.",
  },
  {
    id: "pin-milan-safe",
    title: "Is Milan safe for solo female travellers?",
    filePath: "/pins/pin-milan-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-milan-safe.png`,
    destinationPath: "/blog/is-milan-safe-for-solo-female-travellers",
    utmCampaign: "pin_milan_safe",
    pinDescription:
      "Is Milan safe for solo female travellers? Brera, Porta Nuova, metro nights — practical guide.",
  },
  {
    id: "pin-web-summit-lisbon",
    title: "Web Summit Lisbon safer solo hotels",
    filePath: "/pins/pin-web-summit-lisbon.png",
    publicUrl: `${ORIGIN}/pins/pin-web-summit-lisbon.png`,
    destinationPath: "/blog/web-summit-lisbon-2026-solo-women-hotels",
    utmCampaign: "pin_lisbon_web_summit",
    pinDescription:
      "Web Summit Lisbon 2026: red metro line hotels and Parque das Nações for women attending alone.",
  },
  {
    id: "pin-rock-en-seine",
    title: "Rock en Seine solo women hotels",
    filePath: "/pins/pin-rock-en-seine.png",
    publicUrl: `${ORIGIN}/pins/pin-rock-en-seine.png`,
    destinationPath: "/blog/rock-en-seine-paris-solo-women-hotels",
    utmCampaign: "pin_paris_rock_en_seine",
    pinDescription:
      "Rock en Seine Paris: metro line 10, Boulogne, late returns — solo women stay guide.",
  },
  {
    id: "pin-london-safe",
    title: "Is London safe for solo female travellers?",
    filePath: "/pins/pin-london-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-london-safe.png`,
    destinationPath: "/blog/is-london-safe-for-solo-female-travellers",
    utmCampaign: "pin_london_safe",
    pinDescription:
      "Is London safe for solo female travellers? Night Tube, licensed taxis, stay areas — practical guide.",
  },
  {
    id: "pin-paris-safe",
    title: "Is Paris safe for solo female travellers?",
    filePath: "/pins/pin-paris-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-paris-safe.png`,
    destinationPath: "/blog/is-paris-safe-for-solo-female-travellers",
    utmCampaign: "pin_paris_safe",
    pinDescription:
      "Is Paris safe for solo female travellers? Marais, metro nights, scams to ignore — practical guide.",
  },
  {
    id: "pin-berlin-safe",
    title: "Is Berlin safe for solo female travellers?",
    filePath: "/pins/pin-berlin-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-berlin-safe.png`,
    destinationPath: "/blog/is-berlin-safe-for-solo-female-travellers",
    utmCampaign: "pin_berlin_safe",
    pinDescription:
      "Is Berlin safe for women at night? 24h weekend U-Bahn, calm districts — practical guide.",
  },
  {
    id: "pin-barcelona-safe",
    title: "Is Barcelona safe for solo female travellers?",
    filePath: "/pins/pin-barcelona-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-barcelona-safe.png`,
    destinationPath: "/blog/is-barcelona-safe-for-solo-female-travellers",
    utmCampaign: "pin_barcelona_safe",
    pinDescription:
      "Is Barcelona safe for solo women? Eixample vs Raval, metro nights, pickpocket tips — practical guide.",
  },
  {
    id: "pin-ade-2026",
    title: "Amsterdam Dance Event 2026 solo women hotels",
    filePath: "/pins/pin-ade-2026.png",
    publicUrl: `${ORIGIN}/pins/pin-ade-2026.png`,
    destinationPath: "/blog/amsterdam-dance-event-2026-solo-women-hotels",
    utmCampaign: "pin_ade_2026",
    pinDescription:
      "ADE 2026 (21–25 Oct): safer solo hotels in Amsterdam — centre bases, late nights, 24/7 reception.",
  },
  {
    id: "pin-okinawa-safe",
    title: "Is Okinawa safe for solo female travellers?",
    filePath: "/pins/pin-okinawa-safe.png",
    publicUrl: `${ORIGIN}/pins/pin-okinawa-safe.png`,
    destinationPath: "/blog/is-okinawa-safe-for-solo-female-travellers",
    utmCampaign: "pin_okinawa_safe",
    pinDescription:
      "Is Okinawa safe for solo women? Naha vs west-coast resorts, Yui Rail until 23:30 — practical guide.",
  },
  {
    id: "pin-safest-cities",
    title: "Safest cities in Europe for solo female travellers",
    filePath: "/pins/pin-safest-cities.png",
    publicUrl: `${ORIGIN}/pins/pin-safest-cities.png`,
    destinationPath: "/blog/safest-cities-europe-solo-female-travellers",
    utmCampaign: "pin_safest_cities",
    pinDescription:
      "Safest European cities for solo women: Amsterdam, Berlin, Milan, Barcelona, London, Paris — plus free checklist.",
  },
];

export const PINS_ZIP_PATH = "/pins/yesicantravel-pins.zip";

export function pinDestinationUrl(pin: ReadyPin): string {
  const url = new URL(pin.destinationPath, ORIGIN);
  url.searchParams.set("utm_source", "pinterest");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", pin.utmCampaign);
  return url.toString();
}

/** Absolute OG/Pinterest image for a blog path, if we have a matching pin. */
export function ogImageForPath(path: string): string | undefined {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const pin = READY_PINS.find((p) => p.destinationPath === normalized);
  return pin?.publicUrl;
}
