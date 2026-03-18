export type PinterestTrackEvent =
  | "pagevisit"
  | "checkout"
  | "addtocart"
  | "signup"
  | "lead"
  | "search"
  | "viewcategory"
  | "watchvideo"
  | "custom"
  | (string & {});

type PinterestTrackPayload = Record<string, unknown>;

type PinterestFn = ((...args: unknown[]) => void) & { queue?: unknown[] };

function getPintrk(): PinterestFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { pintrk?: PinterestFn };
  return typeof w.pintrk === "function" ? w.pintrk : null;
}

export function pinterestTrack(event: PinterestTrackEvent, payload?: PinterestTrackPayload) {
  const pintrk = getPintrk();
  if (!pintrk) return;
  if (payload && Object.keys(payload).length > 0) {
    pintrk("track", event, payload);
    return;
  }
  pintrk("track", event);
}

