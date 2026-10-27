import { formatNewsletterCityName } from "@/lib/newsletterCopy";

export const EMAIL_CAPTURE_SUBSCRIBED_KEY = "yict_email_capture_subscribed";
export const EMAIL_CAPTURE_SUBSCRIBED_EVENT = "yict-email-capture-subscribed";

export type EmailCaptureKind = "city-list" | "checklist";

/** Which single capture to show when a page could offer both funnel variants. */
export function preferredEmailCaptureKind(city?: string | null): EmailCaptureKind {
  return formatNewsletterCityName(city) ? "city-list" : "checklist";
}

export function readEmailCaptureSubscribed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(EMAIL_CAPTURE_SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markEmailCaptureSubscribed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EMAIL_CAPTURE_SUBSCRIBED_KEY, "1");
    window.dispatchEvent(new Event(EMAIL_CAPTURE_SUBSCRIBED_EVENT));
  } catch {
    // ignore quota / private mode
  }
}
