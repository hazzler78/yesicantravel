/**
 * Event/destination → published SEO blog posts (internal linking + CTR).
 * Keep in sync with seeded ContentItem slugs.
 */

export const EVENT_RELATED_GUIDES: Record<
  string,
  { href: string; label: string; blurb: string }
> = {
  "rock-en-seine-paris-2026": {
    href: "/blog/rock-en-seine-paris-solo-women-hotels",
    label: "Rock en Seine solo stay guide",
    blurb: "Metro line 10, Boulogne, and late returns — written for women travelling alone.",
  },
  "lisbon-web-summit-2026": {
    href: "/blog/web-summit-lisbon-2026-solo-women-hotels",
    label: "Web Summit Lisbon solo hotels",
    blurb: "Red metro line, Parque das Nações, and a practical conference checklist.",
  },
  "berlin-marathon-2026": {
    href: "/blog/berlin-marathon-2026-solo-women-hotels",
    label: "Berlin Marathon 2026 solo stays",
    blurb: "Race-weekend neighbourhoods, early starts, and safety filters.",
  },
};

export const DESTINATION_RELATED_GUIDES: Record<
  string,
  { href: string; label: string; blurb: string }
> = {
  milan: {
    href: "/blog/is-milan-safe-for-solo-female-travellers",
    label: "Is Milan safe for solo female travellers?",
    blurb: "Honest answer: neighbourhoods, metro nights, and what to filter before you book.",
  },
  amsterdam: {
    href: "/blog/amsterdam-safe-solo-women-night",
    label: "Amsterdam safe at night for solo women",
    blurb: "Neighbourhood tips, late trams, and hotel filters that reduce unknowns.",
  },
};
