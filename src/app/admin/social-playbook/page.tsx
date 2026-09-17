import type { Metadata } from "next";
import Link from "next/link";
import {
  BROLL_CATEGORIES,
  PINTEREST_PINS,
  SOCIAL_POSTING_CADENCE,
  VIDEO_TEMPLATES,
} from "@/lib/socialPlaybook";
import { BIO_LINKS, bioLinkHref } from "@/lib/socialUtm";
import { SOCIAL_BIO_URL, THIS_WEEK_REELS, CAPCUT_STYLE_NOTES } from "@/lib/reelsThisWeek";
import { REEL_POST_PACKAGES } from "@/lib/reelPostPackages";
import { CAROUSEL_NO_FILM_PACKAGE } from "@/lib/carouselNoFilmPackage";
import { READY_PINS, pinDestinationUrl } from "@/lib/readyPins";
import { NURTURE_EMAILS } from "@/lib/nurtureEmailCopy";

export const metadata: Metadata = {
  title: "Social playbook",
  robots: { index: false, follow: false },
};

export default function SocialPlaybookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink">90-day social playbook</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        Internal reference — this week&apos;s Reels scripts, nurture emails, UTM links, and cadence.
      </p>

      <section className="mt-8 rounded-card border border-teal/30 bg-teal-soft/40 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Do this week (traffic blockers)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] text-ink">
          <li>
            Set Instagram + TikTok bio link to{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{SOCIAL_BIO_URL}</code>
          </li>
          <li>Upload the 3 ready PNG pins below to Pinterest</li>
          <li>Post all 3 Reels (copy-paste packages below → CapCut → IG + TikTok)</li>
          <li>
            Or post the no-film carousel today if you cannot shoot video yet
          </li>
        </ol>
        <p className="mt-3 text-xs text-ink-muted">
          Nurture automation is live — signups already get email 1 and wait for day 2.
        </p>
      </section>

      <section className="mt-8 rounded-card border border-coral/40 bg-coral-soft/30 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          No-film carousel (post in 10 min)
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {CAROUSEL_NO_FILM_PACKAGE.platformNote} · {CAROUSEL_NO_FILM_PACKAGE.canvaSize}
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] text-ink">
          {CAROUSEL_NO_FILM_PACKAGE.slides.map((s) => (
            <li key={s.slide}>
              <span className="font-semibold whitespace-pre-line">{s.headline}</span>
              <span className="block text-sm text-ink-muted">{s.sub}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
          Caption (copy all)
        </p>
        <pre className="mt-2 whitespace-pre-wrap rounded-card border border-border bg-surface p-3 text-xs text-ink">
          {CAROUSEL_NO_FILM_PACKAGE.caption}
        </pre>
        <p className="mt-3 text-xs text-ink-muted">
          First comment:{" "}
          <code className="text-ink">{CAROUSEL_NO_FILM_PACKAGE.firstComment}</code>
        </p>
      </section>

      <section className="mt-8 space-y-6">
        <h2 className="font-display text-lg font-semibold text-ink">Post all 3 Reels now</h2>
        {REEL_POST_PACKAGES.map((pkg) => (
          <article
            key={pkg.id}
            className="rounded-card border border-coral/40 bg-coral-soft/30 p-5"
          >
            <h3 className="font-display text-base font-semibold text-ink">
              Reel #{pkg.reelNumber}: {pkg.title}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {pkg.dayLabel} · {pkg.durationTarget}s · same file → Instagram Reels + TikTok
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.9375rem] text-ink">
              {pkg.beforeYouPost.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
              CapCut overlays (in order)
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-xs text-ink-muted">
              {pkg.overlaysInOrder.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
              Caption (copy all)
            </p>
            <pre className="mt-2 whitespace-pre-wrap rounded-card border border-border bg-surface p-3 text-xs text-ink">
              {pkg.captionFull}
            </pre>
            <p className="mt-3 text-xs text-ink-muted">
              First comment: <code className="text-ink">{pkg.firstComment}</code>
            </p>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">This week&apos;s 3 Reels</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Shoot in one session. CapCut: text on screen + music. CTA always points to bio → checklist.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
          {CAPCUT_STYLE_NOTES.map((note) => (
            <li key={note} className="rounded-full border border-border bg-surface px-2.5 py-1">
              {note}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-6">
          {THIS_WEEK_REELS.map((reel) => (
            <article key={reel.id} className="rounded-card border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">
                {reel.dayLabel}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-ink">{reel.title}</h3>
              <p className="mt-2 text-sm text-ink">
                <strong>Hook:</strong> &ldquo;{reel.hookOnScreen}&rdquo;
              </p>
              <p className="mt-1 text-xs text-ink-muted">{reel.durationSeconds}s · Say: {reel.ctaSpoken}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
                {reel.voiceoverOrText.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs font-medium text-ink">CapCut overlays (paste in order)</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 font-mono text-xs text-ink-muted">
                {reel.capCutOverlays.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs font-medium text-ink">B-roll</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-ink-muted">
                {reel.brollShots.map((shot) => (
                  <li key={shot}>{shot}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-medium text-ink">Caption</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-ink-muted">{reel.caption}</p>
              <p className="mt-2 font-mono text-[0.65rem] text-ink-muted">
                {reel.hashtags.join(" ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Nurture emails (MailerLite)</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Already created in MailerLite. Activate the automation after a quick visual check.
        </p>
        <div className="mt-4 space-y-4">
          {NURTURE_EMAILS.map((email) => (
            <div key={email.day} className="rounded-card border border-border bg-surface p-4">
              <p className="text-xs font-semibold text-teal">Day {email.day}</p>
              <p className="mt-1 font-semibold text-ink">{email.subject}</p>
              <p className="mt-1 text-xs text-ink-muted">Preview: {email.previewText}</p>
              <p className="mt-2 text-xs text-ink-muted">
                CTA: {email.ctaLabel} → {email.ctaUrl}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
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
        <h2 className="font-display text-lg font-semibold text-ink">Video templates (library)</h2>
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
        <h2 className="font-display text-lg font-semibold text-ink">Ready Pinterest pins (upload today)</h2>
        <p className="mt-1 text-sm text-ink-muted">
          PNG 1000×1500 — download and upload to Pinterest; paste the destination URL with UTM.
        </p>
        <div className="mt-4 space-y-4">
          {READY_PINS.map((pin) => (
            <article key={pin.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex flex-wrap gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pin.filePath}
                  alt={pin.title}
                  className="h-40 w-auto rounded border border-border bg-canvas"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{pin.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{pin.pinDescription}</p>
                  <p className="mt-2 font-mono text-[0.65rem] text-ink-muted break-all">
                    Pin image: {pin.publicUrl}
                  </p>
                  <p className="mt-1 font-mono text-[0.65rem] text-ink-muted break-all">
                    Destination: {pinDestinationUrl(pin)}
                  </p>
                  <a
                    href={pin.filePath}
                    download
                    className="mt-3 inline-flex text-sm font-semibold text-teal hover:underline"
                  >
                    Download PNG →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
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
        <p className="mt-2 text-sm text-ink">
          Profile bio URL:{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">{SOCIAL_BIO_URL}</code>
        </p>
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
          {" · "}
          <Link href="/admin/growth" className="text-teal hover:underline">
            Growth metrics
          </Link>
        </p>
      </section>
    </div>
  );
}
