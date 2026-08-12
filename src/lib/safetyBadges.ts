/**
 * Map raw facility strings to user-facing safety badges.
 * Conservative — only fire a badge when we're confident the facility exists.
 */

export const SAFETY_BADGE_RULES: Array<{ label: string; keywords: string[] }> = [
  {
    label: "24/7 reception",
    keywords: [
      "24-hour front desk",
      "24 hour front desk",
      "24/7 front desk",
      "24-hour reception",
      "24 hour reception",
    ],
  },
  {
    label: "Security on site",
    keywords: ["security", "cctv", "surveillance cameras", "24-hour security"],
  },
  {
    label: "In-room safe",
    keywords: ["safety deposit box", "in-room safe", " safe "],
  },
  {
    label: "Lift access",
    keywords: ["elevator", "lift"],
  },
  {
    // The real facility string. "Illuminated parking" used to stand in for it,
    // which is a different thing and produced a badge nobody could rely on.
    label: "Well-lit entrance",
    keywords: ["well-lit path to entrance"],
  },
  {
    label: "Private check-in",
    keywords: ["private check-in"],
  },
  {
    label: "Contactless check-in",
    keywords: ["contactless check-in"],
  },
  {
    label: "Non-smoking property",
    keywords: ["non-smoking"],
  },
  {
    label: "Free WiFi",
    keywords: ["free wifi", "wi-fi", "wifi"],
  },
];

export function deriveSafetyBadges(facilityNames: string[]): string[] {
  const lower = facilityNames.map((f) => f.toLowerCase());
  const hits = new Set<string>();
  for (const rule of SAFETY_BADGE_RULES) {
    if (rule.keywords.some((k) => lower.some((f) => f.includes(k.toLowerCase())))) {
      hits.add(rule.label);
    }
  }
  return Array.from(hits);
}

/** Normalize facility lists from LiteAPI hotel detail payloads. */
export function normalizeFacilityNames(hotel: {
  facilities?: Array<{ name?: string } | null> | null;
  hotelFacilities?: string[] | null;
} | null): string[] {
  if (!hotel) return [];
  const fromObjects = (hotel.facilities ?? [])
    .map((f) => f?.name)
    .filter((n): n is string => Boolean(n));
  const fromStrings = hotel.hotelFacilities ?? [];
  const combined = [...fromObjects, ...fromStrings];
  return Array.from(new Set(combined.map((s) => s.trim()).filter(Boolean)));
}

export function safetyBadgesFromHotel(hotel: {
  facilities?: Array<{ name?: string } | null> | null;
  hotelFacilities?: string[] | null;
} | null): string[] {
  return deriveSafetyBadges(normalizeFacilityNames(hotel));
}
