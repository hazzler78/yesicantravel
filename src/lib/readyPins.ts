/**
 * Ready-to-upload Pinterest pins (SVG 1000×1500 in /public/pins).
 * Upload SVG or export PNG from browser; link with UTM from socialPlaybook.
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
    filePath: "/pins/pin-lead-magnet.svg",
    publicUrl: `${ORIGIN}/pins/pin-lead-magnet.svg`,
    destinationPath: "/lead-magnet",
    utmCampaign: "pin_lead_magnet",
    pinDescription:
      "Free practical checklist for women travelling solo — reception hours, map checks, arriving after dark. No scare tactics.",
  },
  {
    id: "pin-amsterdam-night",
    title: "Amsterdam safe at night for solo women",
    filePath: "/pins/pin-amsterdam-night.svg",
    publicUrl: `${ORIGIN}/pins/pin-amsterdam-night.svg`,
    destinationPath: "/blog/amsterdam-safe-solo-women-night",
    utmCampaign: "pin_amsterdam_night",
    pinDescription:
      "Is Amsterdam safe for solo women at night? Neighbourhood tips + hotel filters. Practical guide.",
  },
  {
    id: "pin-berlin-marathon",
    title: "Berlin Marathon 2026 solo women hotels",
    filePath: "/pins/pin-berlin-marathon.svg",
    publicUrl: `${ORIGIN}/pins/pin-berlin-marathon.svg`,
    destinationPath: "/events/berlin-marathon-2026",
    utmCampaign: "pin_berlin_marathon",
    pinDescription:
      "BMW Berlin Marathon 2026 — safer stays for solo women runners. Pre-filled dates + safety filters.",
  },
];

export function pinDestinationUrl(pin: ReadyPin): string {
  const url = new URL(pin.destinationPath, ORIGIN);
  url.searchParams.set("utm_source", "pinterest");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", pin.utmCampaign);
  return url.toString();
}
