import type { Metadata } from "next";
import Link from "next/link";
import { SOCIAL_BIO_URL, TIKTOK_BIO_URL, PINTEREST_PROFILE_URL, PINTEREST_PROFILE_URL_FALLBACK } from "@/lib/reelsThisWeek";
import { CAROUSEL_NO_FILM_PACKAGE, READY_CAROUSEL_SLIDES } from "@/lib/carouselNoFilmPackage";
import {
  READY_PINS,
  PINS_ZIP_PATH,
  pinDestinationUrl,
  pinterestCreateUrl,
} from "@/lib/readyPins";
import { REEL_POST_PACKAGES } from "@/lib/reelPostPackages";
import { CopyTextButton } from "@/components/admin/CopyTextButton";
import { AI_SOLO_PROMPT, chatgptPrefillUrl } from "@/lib/aiSharePrompt";
import {
  REDDIT_SOLO_POST,
  REDDIT_OKTOBERFEST_COMMENT,
  CHATGPT_STORY_CAPTION,
} from "@/lib/communityPosts";

export const metadata: Metadata = {
  title: "Post now — growth",
  robots: { index: false, follow: false },
};

/**
 * One-screen posting pack for the 10-lead growth sprint.
 * Bio → carousel/pins → Reels. Nothing else.
 */
export default function PostNowPage() {
  const reel1 = REEL_POST_PACKAGES[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
        10-lead sprint · do today
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Post now</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Without bio + at least one post, lead count stays flat. Do these in order.
      </p>

      <ol className="mt-8 space-y-8">
        <li className="rounded-card border border-coral/40 bg-coral-soft/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-coral">Step 1</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Set profile links (by platform)
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Instagram + TikTok use /bio. Pinterest does <strong>not</strong> — use the checklist
            page (or homepage) instead.
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Instagram
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 break-all rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-ink">
              {SOCIAL_BIO_URL}
            </p>
            <CopyTextButton text={SOCIAL_BIO_URL} label="Copy" />
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Profile already points at /bio — replace the link with this UTM version so visits
            count as Instagram in growth metrics.
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-coral">
            TikTok (@yesicantravel) — empty today
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Profile has no bio and 0 followers. Set avatar + bio link below, then post the
            carousel or Reel #1 — otherwise TikTok stays a dead channel.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 break-all rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-ink">
              {TIKTOK_BIO_URL}
            </p>
            <CopyTextButton text={TIKTOK_BIO_URL} label="Copy" />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Pinterest profile → Website
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 break-all rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-ink">
              {PINTEREST_PROFILE_URL}
            </p>
            <CopyTextButton text={PINTEREST_PROFILE_URL} label="Copy" />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            If Pinterest still rejects it, use{" "}
            <code className="text-ink">{PINTEREST_PROFILE_URL_FALLBACK}</code> and claim the domain
            under Business settings. Pin destinations are separate — use the URLs in step 3.
          </p>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 2</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Instagram carousel (no film)
          </h2>
          <a
            href="/carousel/yesicantravel-carousel.zip"
            download
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-control bg-coral px-4 text-sm font-semibold text-white hover:bg-coral-hover"
          >
            Download {READY_CAROUSEL_SLIDES.length} slides (ZIP)
          </a>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Caption
          </p>
          <pre className="mt-2 whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {CAROUSEL_NO_FILM_PACKAGE.caption}
          </pre>
          <div className="mt-2">
            <CopyTextButton text={CAROUSEL_NO_FILM_PACKAGE.caption} label="Copy caption" />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            First comment: {CAROUSEL_NO_FILM_PACKAGE.firstComment}
          </p>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 3</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Pinterest pins (destination ≠ /bio)
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Each pin links to a specific blog or checklist page — not the /bio hub. Prefer
            &quot;Create on Pinterest&quot; (prefilled) over manual ZIP upload.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-coral">
            Pin these first (one click each)
          </p>
          <ul className="mt-2 space-y-3 text-xs text-ink-muted">
            {READY_PINS.filter((pin) =>
              [
                "pin-barcelona-safe",
                "pin-ade-2026",
                "pin-okinawa-safe",
                "pin-milan-safe",
                "pin-safest-cities",
                "pin-lead-magnet",
              ].includes(pin.id)
            ).map((pin) => (
              <li
                key={pin.id}
                className="rounded-control border border-coral/30 bg-coral-soft/20 p-3"
              >
                <span className="font-medium text-ink">{pin.title}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={pinterestCreateUrl(pin)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-coral px-3 text-sm font-semibold text-white hover:bg-coral-hover"
                  >
                    Create on Pinterest
                  </a>
                  <CopyTextButton text={pinDestinationUrl(pin)} label="Copy link" />
                  <a
                    href={pin.publicUrl}
                    className="inline-flex min-h-[40px] items-center text-teal hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PNG
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-teal">
              All pins + ZIP fallback
            </summary>
            <a
              href={PINS_ZIP_PATH}
              download
              className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-control border border-border bg-surface px-3 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Download {READY_PINS.length} pins (ZIP)
            </a>
            <ul className="mt-3 space-y-2 text-xs text-ink-muted">
              {READY_PINS.map((pin) => (
                <li key={pin.id} className="rounded-control border border-border p-2">
                  <span className="font-medium text-ink">{pin.title}</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <a
                      href={pinterestCreateUrl(pin)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-teal hover:underline"
                    >
                      Create
                    </a>
                    <span className="break-all font-mono">{pinDestinationUrl(pin)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </li>

        <li className="rounded-card border border-teal/30 bg-teal-soft/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 4</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Recreate the ChatGPT lead path
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Nicolette arrived via ChatGPT → London. Share this prefilled prompt in Stories / DMs /
            comments so more people ask ChatGPT the same way.
          </p>
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {AI_SOLO_PROMPT}
          </pre>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyTextButton text={AI_SOLO_PROMPT} label="Copy AI prompt" />
            <a
              href={chatgptPrefillUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-teal px-3 text-sm font-semibold text-ink-inverse hover:bg-teal/90"
            >
              Open in ChatGPT
            </a>
          </div>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 5</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            MailerLite day-0 share (already live)
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Email 1 already includes the share CTA + button. New checklist signups get it
            automatically. Optional: send the Nicolette share draft from Gmail if you want a
            personal ask.
          </p>
          <a
            href="https://dashboard.mailerlite.com/automations/198834126848001911"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-teal hover:underline"
          >
            Open nurture automation →
          </a>
        </li>

        <li className="rounded-card border border-coral/30 bg-coral-soft/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-coral">Step 6</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Reddit / community (no film needed)
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {REDDIT_SOLO_POST.subreddit} — soft CTA, same checklist that converted Nicolette.
            Oktoberfest ends <strong>4 Oct</strong> — use the comment template while Wiesn is live.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Post title
          </p>
          <pre className="mt-1 whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {REDDIT_SOLO_POST.title}
          </pre>
          <div className="mt-2">
            <CopyTextButton text={REDDIT_SOLO_POST.title} label="Copy title" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Post body
          </p>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {REDDIT_SOLO_POST.body}
          </pre>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyTextButton text={REDDIT_SOLO_POST.body} label="Copy body" />
            <a
              href="https://www.reddit.com/r/solofemaletravel/submit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-coral px-3 text-sm font-semibold text-white hover:bg-coral-hover"
            >
              Open r/solofemaletravel submit
            </a>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            Oktoberfest comment (ends 4 Oct)
          </p>
          <pre className="mt-1 whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {REDDIT_OKTOBERFEST_COMMENT.body}
          </pre>
          <div className="mt-2">
            <CopyTextButton text={REDDIT_OKTOBERFEST_COMMENT.body} label="Copy comment" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            IG Story caption (ChatGPT prompt)
          </p>
          <pre className="mt-1 whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {CHATGPT_STORY_CAPTION}
          </pre>
          <div className="mt-2">
            <CopyTextButton text={CHATGPT_STORY_CAPTION} label="Copy Story caption" />
          </div>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 7</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Reel #1 (when you can film)
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {reel1.title} · {reel1.durationTarget}s · IG + TikTok
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
            CapCut overlays
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-xs text-ink-muted">
            {reel1.overlaysInOrder.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <pre className="mt-3 whitespace-pre-wrap rounded-card border border-border bg-canvas p-3 text-xs text-ink">
            {reel1.captionFull}
          </pre>
          <Link
            href="/admin/social-playbook"
            className="mt-3 inline-flex text-sm font-semibold text-teal hover:underline"
          >
            All 3 Reels + full playbook →
          </Link>
        </li>
      </ol>

      <p className="mt-10 text-center text-sm text-ink-muted">
        <Link href="/admin/growth" className="font-medium text-teal hover:underline">
          Growth metrics
        </Link>
        {" · "}
        <Link href="/bio" className="font-medium text-teal hover:underline">
          Preview /bio
        </Link>
      </p>
    </div>
  );
}
