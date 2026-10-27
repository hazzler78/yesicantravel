"use client";

import { useEffect, useState } from "react";
import {
  EMAIL_CAPTURE_SUBSCRIBED_EVENT,
  readEmailCaptureSubscribed,
} from "@/lib/emailCapture";

/**
 * @param listenForUpdates When true, hide siblings after subscribe on the same page (e.g. newsletter box).
 *   Capture shells that should keep showing a success state use false (initial read only).
 */
export function useEmailCaptureSubscribed(listenForUpdates = false): boolean {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const sync = () => setSubscribed(readEmailCaptureSubscribed());
    sync();

    if (!listenForUpdates) return;

    window.addEventListener(EMAIL_CAPTURE_SUBSCRIBED_EVENT, sync);
    return () => window.removeEventListener(EMAIL_CAPTURE_SUBSCRIBED_EVENT, sync);
  }, [listenForUpdates]);

  return subscribed;
}
