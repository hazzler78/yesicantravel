/**
 * Ready-to-shoot Reels scripts for the current week.
 * Post the same video on TikTok + Instagram Reels.
 * Bio CTA: yesicantravel.com/bio → Free checklist.
 */

export type ReelShootScript = {
  id: string;
  dayLabel: string;
  title: string;
  durationSeconds: string;
  hookOnScreen: string;
  voiceoverOrText: string[];
  /** CapCut text overlays — paste one per beat, large white + navy shadow */
  capCutOverlays: string[];
  brollShots: string[];
  caption: string;
  hashtags: string[];
  /** Relative path with UTM — paste in bio or first comment */
  ctaUrlPath: string;
  ctaSpoken: string;
};

export const THIS_WEEK_REELS: ReelShootScript[] = [
  {
    id: "week-reel-1-filters",
    dayLabel: "Mon / Wed",
    title: "Safety-first vs price-first",
    durationSeconds: "22–28",
    hookOnScreen: "Booking apps sort by price. We sort by safety.",
    voiceoverOrText: [
      "When I travel solo, I don't want the cheapest hotel.",
      "I want 24/7 reception, a well-lit entrance, and free cancellation.",
      "Yes I Can Travel shows those signals first — so you decide with clarity.",
      "Free checklist in bio.",
    ],
    capCutOverlays: [
      "Price first? Think again.",
      "24/7 reception",
      "Well-lit entrance",
      "Free cancellation",
      "Checklist in bio →",
    ],
    brollShots: [
      "Phone scroll on a hotel list (blurred competitor UI OK)",
      "Well-lit hotel entrance at dusk",
      "Reception desk / key card",
      "Map pin on a European city",
      "End card: yesicantravel.com/bio",
    ],
    caption:
      "Price is easy. Clarity is harder. We surface reception hours, lighting, and free cancellation before you book — so you travel with confidence. Free solo safety checklist in bio →",
    hashtags: [
      "#solofemaletravel",
      "#travelsafely",
      "#womensolotravel",
      "#europetravel",
      "#yesicantravel",
    ],
    ctaUrlPath: "/lead-magnet?utm_source=instagram&utm_medium=social&utm_campaign=reel_safety_first_filters",
    ctaSpoken: "Checklist in bio",
  },
  {
    id: "week-reel-2-three-things",
    dayLabel: "Wed / Fri",
    title: "3 things before I book",
    durationSeconds: "30–40",
    hookOnScreen: "3 things I never skip as a solo woman",
    voiceoverOrText: [
      "One: Is reception open when I arrive?",
      "Two: Does the map pin match a walkable, lit street?",
      "Three: Can I cancel if plans change?",
      "Save this. Then grab the full checklist in bio.",
    ],
    capCutOverlays: [
      "3 things before I book",
      "1 · Reception hours",
      "2 · Map pin truth",
      "3 · Free cancellation",
      "Save + checklist in bio",
    ],
    brollShots: [
      "Text overlay 1 / 2 / 3 with cuts",
      "Airport arrival / suitcase",
      "Street at night (well-lit)",
      "Calendar / free cancellation badge mock",
      "End: Free checklist",
    ],
    caption:
      "Save this before your next solo trip. Reception hours · map truth · free cancellation. Full checklist free in bio.",
    hashtags: [
      "#solotravel",
      "#solofemaletraveler",
      "#traveltips",
      "#safetravel",
      "#yesicantravel",
    ],
    ctaUrlPath: "/lead-magnet?utm_source=tiktok&utm_medium=social&utm_campaign=reel_three_things",
    ctaSpoken: "Full checklist in bio",
  },
  {
    id: "week-reel-3-packlist",
    dayLabel: "Fri / Sat",
    title: "What everyone forgets to pack",
    durationSeconds: "45–55",
    hookOnScreen: "Solo travel packing: the stuff you forget",
    voiceoverOrText: [
      "Not another aesthetic packing cube video.",
      "Screenshot of hotel address offline.",
      "Portable charger + one trusted contact who has your itinerary.",
      "And yes — check 24/7 reception before you book late arrivals.",
      "Free safety checklist linked in bio.",
    ],
    capCutOverlays: [
      "Not the aesthetic pack list",
      "Offline hotel address",
      "Charger + one trusted contact",
      "Check 24/7 reception",
      "Free checklist in bio",
    ],
    brollShots: [
      "Packing bag flat lay (passport, charger, phone)",
      "Screenshot / offline maps gesture",
      "Texting a friend",
      "Hotel booking confirmation on phone",
      "CTA end card",
    ],
    caption:
      "The unglamorous packing list that actually helps. Offline address · charger · one trusted contact · reception hours. Free checklist in bio.",
    hashtags: [
      "#packinglist",
      "#solofemaletravel",
      "#traveltok",
      "#europeancities",
      "#yesicantravel",
    ],
    ctaUrlPath: "/lead-magnet?utm_source=instagram&utm_medium=social&utm_campaign=reel_packlist",
    ctaSpoken: "Checklist in bio",
  },
];

/** Copy-paste bio / profile links by platform. */
export const SOCIAL_BIO_URL = "https://yesicantravel.com/bio";

/** Pinterest profile "Website" field — not /bio (Pinterest rejects link-hub / noindex pages). */
export const PINTEREST_PROFILE_URL = "https://yesicantravel.com/lead-magnet";

/** Fallback brand homepage if claim/verification needs the root domain. */
export const PINTEREST_PROFILE_URL_FALLBACK = "https://yesicantravel.com";

export const CAPCUT_STYLE_NOTES = [
  "Aspect: 9:16",
  "Font: bold sans (Montserrat / CapCut Bold)",
  "Text: white fill, soft navy (#1a2332) shadow or stroke",
  "Safe margins: keep overlays in centre third",
  "Music: trending calm beat, duck under VO if any",
  "End card 2s: yesicantravel.com/bio",
] as const;
