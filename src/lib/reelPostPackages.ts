/**
 * Copy-paste "post now" packages for this week's 3 Reels.
 * Same video → Instagram Reels + TikTok.
 */

import { THIS_WEEK_REELS, SOCIAL_BIO_URL, CAPCUT_STYLE_NOTES } from "@/lib/reelsThisWeek";

export type ReelPostPackage = {
  reelNumber: number;
  id: string;
  title: string;
  dayLabel: string;
  bioMustBe: string;
  beforeYouPost: string[];
  capCutStyle: typeof CAPCUT_STYLE_NOTES;
  overlaysInOrder: string[];
  captionFull: string;
  firstComment: string;
  platforms: readonly ["Instagram Reels", "TikTok"];
  durationTarget: string;
};

function buildPackage(index: number): ReelPostPackage {
  const reel = THIS_WEEK_REELS[index];
  return {
    reelNumber: index + 1,
    id: reel.id,
    title: reel.title,
    dayLabel: reel.dayLabel,
    bioMustBe: SOCIAL_BIO_URL,
    beforeYouPost: [
      `Set Instagram + TikTok bio link to ${SOCIAL_BIO_URL}`,
      `Film or assemble B-roll for: ${reel.title}`,
      "CapCut 9:16 — paste overlays in order",
    ],
    capCutStyle: CAPCUT_STYLE_NOTES,
    overlaysInOrder: reel.capCutOverlays,
    captionFull: `${reel.caption}\n\n${reel.hashtags.join(" ")}`,
    firstComment: `Free checklist: ${SOCIAL_BIO_URL}`,
    platforms: ["Instagram Reels", "TikTok"] as const,
    durationTarget: reel.durationSeconds,
  };
}

export const REEL_POST_PACKAGES: ReelPostPackage[] = THIS_WEEK_REELS.map((_, i) =>
  buildPackage(i)
);

/** @deprecated Prefer REEL_POST_PACKAGES[0] */
export const REEL_ONE_POST_PACKAGE = REEL_POST_PACKAGES[0];
