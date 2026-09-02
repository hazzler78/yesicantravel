import type { Metadata } from "next";
import Link from "next/link";
import {
  BROLL_CATEGORIES,
  PINTEREST_PINS,
  SOCIAL_POSTING_CADENCE,
  VIDEO_TEMPLATES,
} from "@/lib/socialPlaybook";
import { BIO_LINKS, bioLinkHref } from "@/lib/socialUtm";

export const metadata: Metadata = {
  title: "Social playbook",
  robots: { index: false, follow: false },
};

export default function SocialPlaybookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">90-day social playbook</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        Internal reference — posting cadence, video templates, Pinterest pins, and UTM links.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">Posting cadence</h2>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">
          Was: {SOCIAL_POSTING_CADENCE.previousCadence}. Target:{" "}
          <strong className="text-ink">{SOCIAL_POSTING_CADENCE.corePostsPerWeek} core videos/week</strong>.
        </p>
        <ul className="mt-3 space-y-1 text-[0.9375rem] text-ink-muted">
          <li>TikTok &amp; Reels: {SOCIAL_POSTING_CADENCE.targetCadence.tiktok.postsPerWeek}×/week</li>
          <li>Pinterest: {SOCIAL_POSTING_CADENCE.targetCadence.pinterest.pinsPerWeek} pins/week</li>
          <li>Facebook: {SOCIAL_POSTING_CADENCE.targetCadence.facebook.postsPerWeek}×/week (repurpose)</li>
        </ul>
        <p className="mt-2 text-sm text-ink-muted">{SOCIAL_POSTING_CADENCE.batchingTip}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Video templates</h2>
        <div className="mt-4 space-y-4">
          {VIDEO_TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-card border border-border bg-surface p-4">
              <p className="font-semibold text-ink">{t.title}</p>
              <p className="mt-1 text-sm text-ink-muted">Hook: &ldquo;{t.hook}&rdquo;</p>
              <p className="text-sm text-ink-muted">
                {t.durationSeconds}s · {t.musicStyle} · CTA: {t.ctaLabel}
              </p>
              <p className="mt-1 text-xs text-ink-muted">B-roll: {t.brollCategories.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">B-roll shot list</h2>
        <ul className="mt-3 space-y-2">
          {BROLL_CATEGORIES.map((c) => (
            <li key={c.id} className="text-[0.9375rem] text-ink-muted">
              <strong className="text-ink">{c.label}:</strong> {c.shots}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Pinterest pins (Canva 1000×1500)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="pb-2 pr-4 font-medium">Pin headline</th>
                <th className="pb-2 pr-4 font-medium">Target</th>
                <th className="pb-2 font-medium">UTM campaign</th>
              </tr>
            </thead>
            <tbody>
              {PINTEREST_PINS.map((pin) => (
                <tr key={pin.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-ink">{pin.headlineOnPin}</td>
                  <td className="py-2 pr-4">
                    <Link href={pin.targetPath} className="text-teal hover:underline">
                      {pin.targetPath}
                    </Link>
                  </td>
                  <td className="py-2 font-mono text-xs text-ink-muted">{pin.utmCampaign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Bio / Linktree UTM links</h2>
        <ul className="mt-3 space-y-2 font-mono text-xs text-ink-muted">
          {BIO_LINKS.map((link) => (
            <li key={link.id}>
              {link.label}: {bioLinkHref(link, "instagram")}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Public bio page:{" "}
          <Link href="/bio" className="text-teal hover:underline">
            /bio
          </Link>
        </p>
      </section>
    </div>
  );
}
