"use client";

import { useEffect, useRef } from "react";

type PageVisitTrackerProps = {
  path: string;
};

const SESSION_KEY = "yict_page_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Fire-and-forget page visit for bio/social attribution metrics. */
export default function PageVisitTracker({ path }: PageVisitTrackerProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    void fetch("/api/analytics/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, sessionId: getSessionId() }),
      keepalive: true,
    });
  }, [path]);

  return null;
}
