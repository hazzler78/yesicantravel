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
  prague: {
    src: "/cities/prague.webp",
    alt: "Prague skyline across the Vltava with historic spires at dusk",
  },
  strasbourg: {
    src: "/cities/strasbourg.webp",
    alt: "Strasbourg Cathedral and half-timbered old town roofs",
  },
  edinburgh: {
    src: "/cities/edinburgh.webp",
    alt: "Edinburgh Old Town and castle from Calton Hill",
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
  prague: "prague",
  strasbourg: "strasbourg",
  edinburgh: "edinburgh",
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

function foldDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function getCityPhotoByCityName(city: string | null | undefined): CityPhoto | undefined {
  if (!city) return undefined;
  const normalized = foldDiacritics(city.trim().toLowerCase());
  const slug = CITY_NAME_TO_SLUG[normalized];
  return slug ? BY_SLUG[slug] : undefined;
}

export const DEFAULT_DISCOVERY_CARD_PHOTO: CityPhoto = ATMOSPHERE_PHOTOS.evening;

/**
 * Best local city photo for discovery cards (homepage, events, blogs).
 * Never returns undefined — uses {@link DEFAULT_DISCOVERY_CARD_PHOTO} when unknown.
 */
export function resolveDiscoveryCardPhoto(opts: {
  city?: string | null;
  destinationSlug?: string | null;
  eventSlug?: string | null;
}): CityPhoto {
  if (opts.destinationSlug) {
    const fromSlug = getCityPhotoBySlug(opts.destinationSlug);
    if (fromSlug) return fromSlug;
  }

  if (opts.eventSlug) {
    const prefix = opts.eventSlug.split("-")[0];
    const fromEventSlug = getCityPhotoBySlug(prefix);
    if (fromEventSlug) return fromEventSlug;
  }

  if (opts.city) {
    const direct = getCityPhotoByCityName(opts.city);
    if (direct) return direct;

    const nearMatch = opts.city.match(/near\s+([A-Za-zÀ-ÿ\s]+)\)/i);
    if (nearMatch) {
      const near = getCityPhotoByCityName(nearMatch[1].trim());
      if (near) return near;
    }

    for (const part of opts.city.split("/").map((p) => p.trim())) {
      const stripped = part.replace(/\s*\([^)]*\)/g, "").trim();
      const fromPart = getCityPhotoByCityName(stripped);
      if (fromPart) return fromPart;
    }
  }

  return DEFAULT_DISCOVERY_CARD_PHOTO;
}
