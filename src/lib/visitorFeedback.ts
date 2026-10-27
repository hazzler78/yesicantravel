export const VISITOR_FEEDBACK_STORAGE_KEY = "yict_visitor_feedback_snooze";

export const VISITOR_FEEDBACK_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export type VisitorFeedbackSnoozeRecord = {
  /** ms since epoch — answered (yes/no) or dismissed without answering */
  until: number;
};

export function readVisitorFeedbackSnooze(): VisitorFeedbackSnoozeRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VISITOR_FEEDBACK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorFeedbackSnoozeRecord;
    if (typeof parsed?.until !== "number" || !Number.isFinite(parsed.until)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeVisitorFeedbackSnooze(nowMs: number): void {
  if (typeof window === "undefined") return;
  const record: VisitorFeedbackSnoozeRecord = {
    until: nowMs + VISITOR_FEEDBACK_SNOOZE_MS,
  };
  try {
    window.localStorage.setItem(VISITOR_FEEDBACK_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // quota / private mode
  }
}

/** True when the widget may be shown (not snoozed / dismissed / answered recently). */
export function canShowVisitorFeedback(nowMs: number, snooze: VisitorFeedbackSnoozeRecord | null): boolean {
  if (!snooze) return true;
  return nowMs >= snooze.until;
}
