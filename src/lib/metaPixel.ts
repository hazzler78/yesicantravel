export function generateMetaEventId(prefix = "evt"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function fbqTrack(
  event: string,
  data?: Record<string, unknown>,
  options?: { eventId?: string; custom?: boolean }
) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (!w.fbq) return;
  try {
    const method = options?.custom ? "trackCustom" : "track";
    const eventIdOptions = options?.eventId ? { eventID: options.eventId } : undefined;
    if (data) {
      if (eventIdOptions) {
        w.fbq(method, event, data, eventIdOptions);
      } else {
        w.fbq(method, event, data);
      }
    } else {
      if (eventIdOptions) {
        w.fbq(method, event, undefined, eventIdOptions);
      } else {
        w.fbq(method, event);
      }
    }
  } catch {
    // ignore pixel errors
  }
}

