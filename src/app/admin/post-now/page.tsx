import type { Metadata } from "next";
import Link from "next/link";
import { SOCIAL_BIO_URL } from "@/lib/reelsThisWeek";
import { CAROUSEL_NO_FILM_PACKAGE, READY_CAROUSEL_SLIDES } from "@/lib/carouselNoFilmPackage";
import { READY_PINS, PINS_ZIP_PATH, pinDestinationUrl } from "@/lib/readyPins";
import { REEL_POST_PACKAGES } from "@/lib/reelPostPackages";

export const metadata: Metadata = {
  title: "Post now — growth",
  robots: { index: false, follow: false },
};

/**
 * One-screen posting pack for the 90-day lead goal.
 * Bio → carousel/pins → Reels. Nothing else.
 */
export default function PostNowPage() {
  const reel1 = REEL_POST_PACKAGES[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
        90-day growth · do today
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Post now</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Without bio + at least one post, lead count stays flat. Do these in order.
      </p>

      <ol className="mt-8 space-y-8">
        <li className="rounded-card border border-coral/40 bg-coral-soft/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-coral">Step 1</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            Set Instagram + TikTok bio
          </h2>
          <p className="mt-3 break-all rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-ink">
            {SOCIAL_BIO_URL}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            /bio already has the checklist signup form.
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
          <p className="mt-2 text-xs text-ink-muted">
            First comment: {CAROUSEL_NO_FILM_PACKAGE.firstComment}
          </p>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 3</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">Pinterest pins</h2>
          <a
            href={PINS_ZIP_PATH}
            download
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-control bg-coral px-4 text-sm font-semibold text-white hover:bg-coral-hover"
          >
            Download {READY_PINS.length} pins (ZIP)
          </a>
          <ul className="mt-4 space-y-2 text-xs text-ink-muted">
            {READY_PINS.map((pin) => (
              <li key={pin.id}>
                <span className="font-medium text-ink">{pin.title}</span>
                <br />
                <span className="break-all font-mono">{pinDestinationUrl(pin)}</span>
              </li>
            ))}
          </ul>
        </li>

        <li className="rounded-card border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal">Step 4</p>
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
