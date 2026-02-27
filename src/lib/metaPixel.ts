export function fbqTrack(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (!w.fbq) return;
  try {
    if (data) {
      w.fbq("track", event, data);
    } else {
      w.fbq("track", event);
    }
  } catch {
    // ignore pixel errors
  }
}

