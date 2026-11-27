"use client";

import { useEffect } from "react";
import { startPlausible } from "@/lib/plausible";

/** Cookieless Plausible pageviews, including App Router navigations. */
export default function PlausibleAnalytics() {
  useEffect(() => {
    startPlausible();
  }, []);

  return null;
}
