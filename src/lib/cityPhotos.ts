/**
 * Local city / atmosphere photos under /public/cities (real photography,
 * resized WebP). Used by popular cities, destination guides, and events.
 */

export type CityPhoto = {
  src: string;
  alt: string;
};

const BY_SLUG: Record<string, CityPhoto> = {
  paris: {
    src: "/cities/paris.webp",
    alt: "Pont Alexandre III in Paris at dusk with street lamps lit",
  },
  berlin: {
    src: "/cities/berlin.webp",
    alt: "Brandenburg Gate and the open plaza in Berlin on a bright day",
  },
  amsterdam: {
    src: "/cities/amsterdam.webp",
    alt: "Canal houses and boats along an Amsterdam canal",
  },
  barcelona: {
    src: "/cities/barcelona.webp",
    alt: "Sagrada Família rising above Barcelona’s Eixample grid",
  },
  milan: {
    src: "/cities/milan.webp",
    alt: "Navigli canal in Milan at evening with lights on the water",
  },
  london: {
    src: "/cities/london.webp",
    alt: "Tower Bridge and the Thames looking toward Canary Wharf",
  },
  "las-vegas": {
    src: "/cities/las-vegas.webp",
    alt: "Welcome to Fabulous Las Vegas sign under a clear blue sky",
  },
  okinawa: {
    src: "/cities/okinawa.webp",
    alt: "Turquoise water and a white-sand beach framed by palms",
  },
  lisbon: {
    src: "/cities/lisbon.webp",
    alt: "Yellow Lisbon tram on a wet cobbled street in the evening",
  },
  vienna: {
    src: "/cities/vienna.webp",
    alt: "St. Stephen’s Cathedral rising above Vienna rooftops at dusk",
  },
  venice: {
    src: "/cities/venice.webp",
    alt: "Venetian canal with historic buildings and boats",
  },
  miami: {
    src: "/cities/miami.webp",
    alt: "Miami waterfront and skyline in warm daylight",
  },
  austin: {
    src: "/cities/austin.webp",
    alt: "Austin city skyline under a clear sky",
  },
  cancun: {
    src: "/cities/cancun.webp",
    alt: "Turquoise Caribbean water meeting a sandy beach",
  },
  "key-west": {
    src: "/cities/key-west.webp",
    alt: "Coastal water and boats in the Florida Keys",
  },
};

/** Non-city photos for checklist / lead-magnet surfaces. */
export const ATMOSPHERE_PHOTOS = {
  evening: {
    src: "/cities/atmosphere-evening.webp",
    alt: "Well-lit city street after dark — the kind of arrival you can plan for",
  },
  arrival: {
    src: "/cities/atmosphere-arrival.webp",
    alt: "A calm, well-lit hotel room ready for check-in",
  },
} as const satisfies Record<string, CityPhoto>;

const CITY_NAME_TO_SLUG: Record<string, string> = {
  paris: "paris",
  berlin: "berlin",
  amsterdam: "amsterdam",
  barcelona: "barcelona",
  milan: "milan",
  london: "london",
  "las vegas": "las-vegas",
  okinawa: "okinawa",
  lisbon: "lisbon",
  vienna: "vienna",
  venice: "venice",
  miami: "miami",
  austin: "austin",
  cancun: "cancun",
  "key west": "key-west",
};

export function getCityPhotoBySlug(slug: string | null | undefined): CityPhoto | undefined {
  if (!slug) return undefined;
  return BY_SLUG[slug];
}

export function getCityPhotoByCityName(city: string | null | undefined): CityPhoto | undefined {
  if (!city) return undefined;
  const slug = CITY_NAME_TO_SLUG[city.trim().toLowerCase()];
  return slug ? BY_SLUG[slug] : undefined;
}
