/**
 * Popular cities for the homepage strip and the /popular-cities page.
 *
 * Each entry links to a plain destination search on `placeId`. It used to link
 * to a free-text `aiSearch` ("central safe hotel Paris France well-lit"), which
 * returns a different, much smaller subset of the city on every call — so the
 * "from" price advertised on the card could never be reproduced by clicking it.
 *
 * Refresh a placeId with:
 *   curl -H "X-API-Key: $LITEAPI_KEY" \
 *     "https://api.liteapi.travel/v3.0/data/places?textQuery=Paris,%20France"
 */

export interface PopularCity {
  slug: string;
  city: string;
  country: string;
  /** Short line for card */
  description: string;
  /** Destination id used for both the price lookup and the search link. */
  placeId: string;
}

export const popularCities: PopularCity[] = [
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    description: "Central, well-connected neighbourhoods with staffed receptions.",
    placeId: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    description: "Solo-friendly stays near transport and busy streets.",
    placeId: "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    description: "Well-connected areas within a short walk of a station.",
    placeId: "ChIJVXealLU_xkcRja_At0z9AGY",
  },
  {
    slug: "barcelona",
    city: "Barcelona",
    country: "Spain",
    description: "Central stays with round-the-clock reception.",
    placeId: "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
  },
  {
    slug: "milan",
    city: "Milan",
    country: "Italy",
    description: "Close to the metro, with flexible cancellation options.",
    placeId: "ChIJ53USP0nBhkcRjQ50xhPN_zw",
  },
  {
    slug: "london",
    city: "London",
    country: "UK",
    description: "Central options reviewed by thousands of guests.",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
  },
];

export function getPopularCityBySlug(slug: string): PopularCity | undefined {
  return popularCities.find((c) => c.slug === slug);
}

/**
 * Place ids for year-round city guides that are not on the homepage strip.
 * Same LiteAPI lookup as the comment above.
 */
const extraDestinationPlaceIds: Record<string, string> = {
  "las-vegas": "ChIJ0X31pIK3voARo3mz1ebVzDo",
  okinawa: "ChIJ51ur7mJw9TQR79H9hnJhuzU",
};

/** Place id used for both the from-price quote and the destination CTA search. */
export function getPlaceIdForDestinationSlug(slug: string): string | undefined {
  return getPopularCityBySlug(slug)?.placeId ?? extraDestinationPlaceIds[slug];
}
