"use client";

type MetaCapiPayload = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData?: {
    email?: string;
    phone?: string;
  };
};

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const key = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(key));
  return cookie ? decodeURIComponent(cookie.slice(key.length)) : undefined;
}

export async function sendMetaCapiEvent(payload: MetaCapiPayload) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        userData: {
          ...payload.userData,
          fbp: getCookieValue("_fbp"),
          fbc: getCookieValue("_fbc"),
        },
      }),
      keepalive: true,
    });
  } catch {
    // ignore CAPI errors in browser; Pixel still runs
  }
}

