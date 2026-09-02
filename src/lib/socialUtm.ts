const SITE_ORIGIN = "https://yesicantravel.com";

export type UtmParams = {
  source: string;
  medium?: string;
  campaign: string;
  content?: string;
};

/** Build a tracked URL for social bio links, Reels CTAs, and Pinterest pins. */
export function buildSocialUrl(path: string, utm: UtmParams): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalized, SITE_ORIGIN);
  url.searchParams.set("utm_source", utm.source);
  url.searchParams.set("utm_medium", utm.medium ?? "social");
  url.searchParams.set("utm_campaign", utm.campaign);
  if (utm.content) url.searchParams.set("utm_content", utm.content);
  return url.pathname + url.search;
}

export type BioLink = {
  id: string;
  label: string;
  description: string;
  path: string;
  utm: UtmParams;
  platforms: Array<"tiktok" | "instagram" | "pinterest" | "facebook">;
};

/** Curated bio links — use in Linktree or /bio page. */
export const BIO_LINKS: BioLink[] = [
  {
    id: "lead-magnet",
    label: "Free solo travel safety checklist",
    description: "Practical prep before your first solo trip",
    path: "/lead-magnet",
    utm: { source: "instagram", medium: "bio", campaign: "lead_magnet" },
    platforms: ["instagram", "tiktok", "facebook"],
  },
  {
    id: "popular-cities",
    label: "Explore safe cities in Europe",
    description: "Paris, Berlin, Barcelona & more — live prices",
    path: "/popular-cities",
    utm: { source: "instagram", medium: "bio", campaign: "popular_cities" },
    platforms: ["instagram", "tiktok", "pinterest"],
  },
  {
    id: "events",
    label: "Peak dates & festivals",
    description: "Pre-filled dates for major events",
    path: "/events",
    utm: { source: "instagram", medium: "bio", campaign: "events_hub" },
    platforms: ["instagram", "tiktok", "pinterest", "facebook"],
  },
  {
    id: "blog",
    label: "Solo travel guides",
    description: "Safety-first destination tips",
    path: "/blog",
    utm: { source: "instagram", medium: "bio", campaign: "blog" },
    platforms: ["instagram", "pinterest"],
  },
  {
    id: "barcelona-primavera",
    label: "Primavera Sound Barcelona 2026",
    description: "Safe stays near Parc del Fòrum",
    path: "/events/primavera-sound-barcelona-2026",
    utm: { source: "tiktok", medium: "bio", campaign: "reel_barcelona_primavera" },
    platforms: ["tiktok", "instagram"],
  },
  {
    id: "rock-en-seine",
    label: "Rock en Seine Paris 2026",
    description: "Metro line 10 neighbourhood guide",
    path: "/events/rock-en-seine-paris-2026",
    utm: { source: "tiktok", medium: "bio", campaign: "reel_paris_festival" },
    platforms: ["tiktok", "instagram"],
  },
];

export function bioLinkHref(link: BioLink, platform?: BioLink["platforms"][number]): string {
  const source = platform ?? link.utm.source;
  return buildSocialUrl(link.path, { ...link.utm, source });
}

/** UTM presets for video template CTAs. */
export function videoTemplateUtm(templateId: string, platform: "tiktok" | "instagram"): string {
  return buildSocialUrl(
    VIDEO_TEMPLATE_PATHS[templateId] ?? "/lead-magnet",
    {
      source: platform,
      medium: "social",
      campaign: `reel_${templateId}`,
      content: platform,
    }
  );
}

const VIDEO_TEMPLATE_PATHS: Record<string, string> = {
  "pov-first-solo": "/lead-magnet",
  "three-things-before-booking": "/events/primavera-sound-barcelona-2026",
  "city-event": "/events/milan-design-week-2027",
  "safety-first-filters": "/popular-cities",
  "neighbourhood-check": "/blog",
  "packlist-60": "/lead-magnet",
};
