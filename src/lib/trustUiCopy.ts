import type { VisitorUiLanguage } from "@/lib/visitorLanguage";

const CHECK_IN: {
  sv: { lateUntil: (time: string) => string; earlyEnds: (time: string) => string; roundTheClock: string };
  en: { lateUntil: (time: string) => string; earlyEnds: (time: string) => string; roundTheClock: string };
} = {
  en: {
    lateUntil: (time) => `Check-in until ${time}`,
    earlyEnds: (time) => `Check-in ends ${time} — arriving late? Contact the hotel`,
    roundTheClock: " — reception staffed around the clock",
  },
  sv: {
    lateUntil: (time) => `Incheckning till ${time}`,
    earlyEnds: (time) => `Incheckning stänger ${time} — sent ankommande? Kontakta hotellet`,
    roundTheClock: " — reception bemannad dygnet runt",
  },
};

const CANCELLATION: {
  sv: {
    freeUntil: (deadline: string) => string;
    freeGeneric: string;
    nonRefundable: string;
  };
  en: {
    freeUntil: (deadline: string) => string;
    freeGeneric: string;
    nonRefundable: string;
  };
} = {
  en: {
    freeUntil: (deadline) => `Free cancellation until ${deadline}`,
    freeGeneric: "Free cancellation",
    nonRefundable: "Non-refundable",
  },
  sv: {
    freeUntil: (deadline) => `Gratis avbokning till ${deadline}`,
    freeGeneric: "Gratis avbokning",
    nonRefundable: "Ej återbetalningsbar",
  },
};

export function pickTrustUiLanguage(input?: {
  currency?: string;
  languages?: readonly string[];
}): VisitorUiLanguage {
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
  return swedish ? "sv" : "en";
}

export function checkInBadgeLabel(
  time: string,
  earlyCutoff: boolean,
  lang?: VisitorUiLanguage,
): string {
  const ui = lang ?? pickTrustUiLanguage();
  return earlyCutoff ? CHECK_IN[ui].earlyEnds(time) : CHECK_IN[ui].lateUntil(time);
}

export function checkInPeaceOfMindText(
  time: string,
  earlyCutoff: boolean,
  roundTheClockReception: boolean,
  lang?: VisitorUiLanguage,
): { text: string; earlyCutoff: boolean } {
  const ui = lang ?? pickTrustUiLanguage();
  if (earlyCutoff) {
    return { text: CHECK_IN[ui].earlyEnds(time), earlyCutoff: true };
  }
  let text = CHECK_IN[ui].lateUntil(time);
  if (roundTheClockReception) text += CHECK_IN[ui].roundTheClock;
  return { text, earlyCutoff: false };
}

export function cancellationRateLabel(
  refundable: boolean,
  deadline: string | null | undefined,
  lang?: VisitorUiLanguage,
): string {
  const ui = lang ?? pickTrustUiLanguage();
  if (!refundable) return CANCELLATION[ui].nonRefundable;
  if (deadline) return CANCELLATION[ui].freeUntil(deadline);
  return CANCELLATION[ui].freeGeneric;
}
