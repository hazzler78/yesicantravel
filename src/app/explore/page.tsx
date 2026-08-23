"use client";

import dynamic from "next/dynamic";

const ExploreMap = dynamic(() => import("@/components/explore/ExploreMap").then((m) => m.ExploreMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-64px)] w-full items-center justify-center bg-[var(--color-canvas)]">
      <p className="text-[0.9375rem] text-[var(--color-ink-muted)]">Loading map…</p>
    </div>
  ),
});

export default function ExplorePage() {
  return <ExploreMap />;
}
