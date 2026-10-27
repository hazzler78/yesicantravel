import {
  shouldShowFarDateThinNotice,
} from "@/lib/ratesSearchOrchestration";
import { RATES_THIN_RESULT_THRESHOLD } from "@/lib/ratesSearchReliability";

export { shouldShowFarDateThinNotice };

export type ResultsThinSearchCopy = {
  fetchingMore: string;
  searchAgain: string;
  farDateThin: string;
};

const COPY: { sv: ResultsThinSearchCopy; en: ResultsThinSearchCopy } = {
  sv: {
    fetchingMore: "Vi hämtar fler hotell…",
    searchAgain: "Sök igen",
    farDateThin:
      "Fler hotell släpper priser närmare datumet – prova igen om några veckor.",
  },
  en: {
    fetchingMore: "Fetching more hotels…",
    searchAgain: "Search again",
    farDateThin: "More hotels usually publish rates closer to your dates — try again in a few weeks.",
  },
};

/** Swedish when the visitor uses SEK or a Swedish browser language. */
export function pickResultsThinSearchCopy(input?: {
  currency?: string;
  languages?: readonly string[];
}): ResultsThinSearchCopy {
  const langs =
    input?.languages ??
    (typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : ["en"]);
  const swedish =
    input?.currency === "SEK" ||
    langs.some((lang) => String(lang).toLowerCase().startsWith("sv"));
  return swedish ? COPY.sv : COPY.en;
}

export function isGeoDestinationSearch(placeId: string | null, aiSearch: string | null): boolean {
  return Boolean(placeId?.trim() || aiSearch?.trim());
}

export { RATES_THIN_RESULT_THRESHOLD };
