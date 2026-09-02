/**
 * Social content playbook — posting cadence, video templates, and Pinterest pin specs.
 * Used by /bio and /admin/social-playbook for the 90-day traffic plan.
 */

export const SOCIAL_POSTING_CADENCE = {
  /** Replace daily posting with quality-first rhythm. */
  previousCadence: "1 post/day across platforms",
  targetCadence: {
    tiktok: { postsPerWeek: 3, format: "15–45s video with music" },
    instagramReels: { postsPerWeek: 3, format: "Same video as TikTok, adapted caption" },
    instagramFeed: { postsPerWeek: 1, format: "Carousel or static — only when strong" },
    pinterest: { pinsPerWeek: 5, format: "Vertical 1000×1500 → event/destination landers" },
    facebook: { postsPerWeek: 2, format: "Repurpose Reels + link to lander" },
  },
  corePostsPerWeek: 3,
  batchingTip: "One half-day shoot = ~4 weeks of Reels/TikTok content.",
} as const;

export type VideoTemplate = {
  id: string;
  title: string;
  hook: string;
  musicStyle: string;
  ctaPath: string;
  ctaLabel: string;
  brollCategories: string[];
  durationSeconds: string;
};

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: "pov-first-solo",
    title: "POV: din första soloresa",
    hook: "Du bokade inte bara ett hotell — du bokade trygghet",
    musicStyle: "Uplifting indie/pop",
    ctaPath: "/lead-magnet",
    ctaLabel: "Gratis checklista i bio",
    brollCategories: ["packning", "ankomst", "solo-empowerment"],
    durationSeconds: "20–30",
  },
  {
    id: "three-things-before-booking",
    title: "3 saker jag kollar innan jag bokar",
    hook: "Som solo-kvinna, aldrig utan dessa 3",
    musicStyle: "Trendande lugn beat",
    ctaPath: "/events/primavera-sound-barcelona-2026",
    ctaLabel: "Säkra hotell nära event",
    brollCategories: ["säkerhetssignaler", "hotell", "destinationer"],
    durationSeconds: "30–45",
  },
  {
    id: "city-event",
    title: "Stad + event",
    hook: "Ska du till Milan Design Week?",
    musicStyle: "Trend + city vibe",
    ctaPath: "/events/milan-design-week-2027",
    ctaLabel: "Förifyllda datum",
    brollCategories: ["destinationer", "ankomst", "solo-empowerment"],
    durationSeconds: "15–25",
  },
  {
    id: "safety-first-filters",
    title: "Filter som faktiskt spelar roll",
    hook: "Booking.com visar pris först. Vi visar säkerhet först.",
    musicStyle: "Kontrast/beat drop",
    ctaPath: "/popular-cities",
    ctaLabel: "Utforska städer",
    brollCategories: ["säkerhetssignaler", "hotell"],
    durationSeconds: "20–30",
  },
  {
    id: "neighbourhood-check",
    title: "Neighbourhood check",
    hook: "Så här kollar jag om området känns okej",
    musicStyle: "Educational calm",
    ctaPath: "/blog",
    ctaLabel: "Läs guiderna",
    brollCategories: ["destinationer", "säkerhetssignaler", "ankomst"],
    durationSeconds: "45–60",
  },
  {
    id: "packlist-60",
    title: "Packlista 60 sek",
    hook: "Det här glömmer alla solo-resenärer",
    musicStyle: "Snabb cut",
    ctaPath: "/lead-magnet",
    ctaLabel: "Ladda ner checklistan",
    brollCategories: ["packning", "solo-empowerment"],
    durationSeconds: "55–60",
  },
];

export const BROLL_CATEGORIES = [
  { id: "packning", label: "Packning", shots: "väska, pass, solglasögon, karta på telefon" },
  { id: "ankomst", label: "Ankomst", shots: "tågstation, flygplats, välbelyst gata" },
  { id: "hotell", label: "Hotell", shots: "reception, nyckelkort, rum" },
  { id: "solo-empowerment", label: "Solo empowerment", shots: "kvinna som går själv, café, utsikt" },
  { id: "säkerhetssignaler", label: "Säkerhetssignaler", shots: "välbelyst entré, 24/7-skylt, karta med pins" },
  { id: "destinationer", label: "Destinationer", shots: "Barcelona, Paris, Berlin, Amsterdam" },
] as const;

export type PinterestPin = {
  id: string;
  title: string;
  description: string;
  targetPath: string;
  /** Canva template: 1000×1500 vertical */
  dimensions: "1000×1500";
  headlineOnPin: string;
  utmCampaign: string;
};

/** Ten starter pins — create in Canva using brand colours (coral, sand, ocean teal, navy). */
export const PINTEREST_PINS: PinterestPin[] = [
  {
    id: "pin-barcelona-primavera",
    title: "Safe solo stays near Primavera Sound Barcelona",
    description: "Women-reviewed hotels near Parc del Fòrum. 24/7 reception filters & neighbourhood tips.",
    targetPath: "/events/primavera-sound-barcelona-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Primavera Sound 2026 · Safe solo stays",
    utmCampaign: "pin_barcelona_primavera",
  },
  {
    id: "pin-paris-rock-en-seine",
    title: "Rock en Seine 2026 — safe hotels for solo women",
    description: "Metro line 10 hotels, neighbourhood guides & safety tips for solo female travellers.",
    targetPath: "/events/rock-en-seine-paris-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Rock en Seine · Paris solo guide",
    utmCampaign: "pin_paris_rock_en_seine",
  },
  {
    id: "pin-berlin-lollapalooza",
    title: "Lollapalooza Berlin — book safer stays",
    description: "Central Berlin hotels with safety filters for women travelling solo to the festival.",
    targetPath: "/events/lollapalooza-berlin-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Lollapalooza Berlin 2026",
    utmCampaign: "pin_berlin_lolla",
  },
  {
    id: "pin-lisbon-nos-alive",
    title: "NOS Alive Lisbon — solo female travel guide",
    description: "Safe hotels near the Tagus. Pre-filled dates & 24/7 reception filters.",
    targetPath: "/events/nos-alive-lisbon-2026",
    dimensions: "1000×1500",
    headlineOnPin: "NOS Alive · Lisbon stays",
    utmCampaign: "pin_lisbon_nos_alive",
  },
  {
    id: "pin-amsterdam-ade",
    title: "Amsterdam Dance Event — safe solo stays",
    description: "Well-lit neighbourhoods & hotel safety filters for ADE week.",
    targetPath: "/events/amsterdam-dance-event-2026",
    dimensions: "1000×1500",
    headlineOnPin: "ADE 2026 · Amsterdam",
    utmCampaign: "pin_amsterdam_ade",
  },
  {
    id: "pin-munich-oktoberfest",
    title: "Oktoberfest Munich — safer hotels for women",
    description: "Neighbourhood safety tips & hotels with 24/7 reception near the Wiesn.",
    targetPath: "/events/munich-oktoberfest-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Oktoberfest · Munich guide",
    utmCampaign: "pin_munich_oktoberfest",
  },
  {
    id: "pin-rome-marathon",
    title: "Rome Marathon — safe solo hotels",
    description: "Central Rome stays for solo women runners. Safety-first booking.",
    targetPath: "/events/rome-marathon-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Rome Marathon 2026",
    utmCampaign: "pin_rome_marathon",
  },
  {
    id: "pin-stockholm-pride",
    title: "Stockholm Pride — safe stays for solo travellers",
    description: "Walkable, well-lit neighbourhoods & hotels for Pride week in Stockholm.",
    targetPath: "/events/stockholm-pride-2026",
    dimensions: "1000×1500",
    headlineOnPin: "Stockholm Pride 2026",
    utmCampaign: "pin_stockholm_pride",
  },
  {
    id: "pin-lead-magnet",
    title: "Free solo female travel safety checklist",
    description: "Download the checklist — practical tips before your first solo trip to Europe.",
    targetPath: "/lead-magnet",
    dimensions: "1000×1500",
    headlineOnPin: "Free safety checklist",
    utmCampaign: "pin_lead_magnet",
  },
  {
    id: "pin-popular-cities",
    title: "Safest cities for solo women in Europe",
    description: "Paris, Berlin, Amsterdam, Barcelona & more — compare safer stays with live prices.",
    targetPath: "/popular-cities",
    dimensions: "1000×1500",
    headlineOnPin: "Solo Europe · City guide",
    utmCampaign: "pin_popular_cities",
  },
];
