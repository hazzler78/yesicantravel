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
  "amsterdam-dance-event-2026": {
    href: "/blog/amsterdam-dance-event-2026-solo-women-hotels",
    label: "ADE 2026 solo hotels",
    blurb: "21–25 Oct dates, centre bases, and late-night returns for women going alone.",
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
  london: {
    href: "/blog/is-london-safe-for-solo-female-travellers",
    label: "Is London safe for solo female travellers?",
    blurb: "Night Tube, licensed taxis vs minicabs, and neighbourhoods that work alone.",
  },
  paris: {
    href: "/blog/is-paris-safe-for-solo-female-travellers",
    label: "Is Paris safe for solo female travellers?",
    blurb: "Marais vs Saint-Germain, metro nights, and the scams you can walk past.",
  },
  berlin: {
    href: "/blog/is-berlin-safe-for-solo-female-travellers",
    label: "Is Berlin safe for solo female travellers?",
    blurb: "24h weekend U-Bahn, calm districts, and what to filter before you book.",
  },
  barcelona: {
    href: "/blog/is-barcelona-safe-for-solo-female-travellers",
    label: "Is Barcelona safe for solo female travellers?",
    blurb: "Theft vs violence, Eixample vs Raval, metro nights, and hotel filters that help.",
  },
  okinawa: {
    href: "/blog/is-okinawa-safe-for-solo-female-travellers",
    label: "Is Okinawa safe for solo female travellers?",
    blurb: "Naha vs west-coast resorts, Yui Rail until 23:30, and what to filter before you book.",
  },
};

/** Blog slug → destination slug (reuse destination FAQs for FAQPage rich results). */
export const BLOG_TO_DESTINATION_SLUG: Record<string, string> = {
  "is-milan-safe-for-solo-female-travellers": "milan",
  "is-barcelona-safe-for-solo-female-travellers": "barcelona",
  "is-okinawa-safe-for-solo-female-travellers": "okinawa",
  "is-london-safe-for-solo-female-travellers": "london",
  "is-paris-safe-for-solo-female-travellers": "paris",
  "is-berlin-safe-for-solo-female-travellers": "berlin",
  "amsterdam-safe-solo-women-night": "amsterdam",
};
