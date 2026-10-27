export type FeedbackAnswer = "yes" | "no";

export type VisitorFeedbackPayload = {
  answer: FeedbackAnswer;
  comment?: string;
  pageUrl: string;
  placeId?: string;
  city?: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  stayType?: string;
  resultCount?: number;
  language?: string;
  userAgent?: string;
};

const MAX_COMMENT = 500;
const MAX_URL = 2048;
const MAX_SHORT = 256;

export type FeedbackValidationResult =
  | { ok: true; data: VisitorFeedbackPayload }
  | { ok: false; error: string };

function trimOptional(value: unknown, maxLen: number): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

export function parseVisitorFeedbackBody(body: unknown): FeedbackValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body" };
  }
  const record = body as Record<string, unknown>;

  const answerRaw = record.answer;
  if (answerRaw !== "yes" && answerRaw !== "no") {
    return { ok: false, error: "answer must be yes or no" };
  }

  const pageUrl = trimOptional(record.pageUrl, MAX_URL);
  if (!pageUrl) {
    return { ok: false, error: "pageUrl is required" };
  }

  let comment = trimOptional(record.comment, MAX_COMMENT);
  if (typeof record.comment === "string" && record.comment.length > MAX_COMMENT) {
    return { ok: false, error: `comment must be at most ${MAX_COMMENT} characters` };
  }

  let adults: number | undefined;
  if (record.adults != null && record.adults !== "") {
    const n = Number(record.adults);
    if (!Number.isFinite(n) || n < 0 || n > 99) {
      return { ok: false, error: "adults must be a number between 0 and 99" };
    }
    adults = Math.floor(n);
  }

  let resultCount: number | undefined;
  if (record.resultCount != null && record.resultCount !== "") {
    const n = Number(record.resultCount);
    if (!Number.isFinite(n) || n < 0 || n > 10_000) {
      return { ok: false, error: "resultCount must be a non-negative number" };
    }
    resultCount = Math.floor(n);
  }

  const language = trimOptional(record.language, 16);
  const userAgent = trimOptional(record.userAgent, MAX_SHORT);

  return {
    ok: true,
    data: {
      answer: answerRaw,
      comment,
      pageUrl,
      placeId: trimOptional(record.placeId, MAX_SHORT),
      city: trimOptional(record.city, MAX_SHORT),
      checkin: trimOptional(record.checkin, 32),
      checkout: trimOptional(record.checkout, 32),
      adults,
      stayType: trimOptional(record.stayType, 64),
      resultCount,
      language,
      userAgent,
    },
  };
}

export function shortUserAgent(header: string | null): string | undefined {
  if (!header) return undefined;
  const trimmed = header.trim();
  if (!trimmed) return undefined;
  return trimmed.length > 256 ? trimmed.slice(0, 256) : trimmed;
}
