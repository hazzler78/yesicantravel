/**
 * One-screen "post now" package for Reel #1 this week.
 * Open CapCut → paste overlays → export → paste caption on IG + TikTok.
 */

import { THIS_WEEK_REELS, SOCIAL_BIO_URL, CAPCUT_STYLE_NOTES } from "@/lib/reelsThisWeek";

export const REEL_ONE = THIS_WEEK_REELS[0];

export const REEL_ONE_POST_PACKAGE = {
  bioMustBe: SOCIAL_BIO_URL,
  beforeYouPost: [
    `Set Instagram + TikTok bio link to ${SOCIAL_BIO_URL}`,
    "Film or assemble B-roll (phone scroll, lit entrance, reception, map pin)",
    "CapCut 9:16 — paste overlays in order",
  ],
  capCutStyle: CAPCUT_STYLE_NOTES,
  overlaysInOrder: REEL_ONE.capCutOverlays,
  captionFull: `${REEL_ONE.caption}\n\n${REEL_ONE.hashtags.join(" ")}`,
  firstComment: `Free checklist: ${SOCIAL_BIO_URL}`,
  platforms: ["Instagram Reels", "TikTok"] as const,
  durationTarget: REEL_ONE.durationSeconds,
};
