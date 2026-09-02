import type { Metadata } from "next";
import Link from "next/link";
import { BIO_LINKS, bioLinkHref } from "@/lib/socialUtm";
import { SOCIAL_POSTING_CADENCE } from "@/lib/socialPlaybook";
import { SOCIAL_LINKS } from "@/components/brand/SocialIcons";

export const metadata: Metadata = {
  title: "Links — Yes I Can Travel",
  description:
    "Free safety checklist, city guides, and event stays for women travelling solo in Europe.",
  robots: { index: false, follow: false },
};

export default function BioPage() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            Yes I Can Travel
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
            Travel confidently, solo
          </h1>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            Safety-first hotel search for women in Europe &amp; worldwide.
          </p>
        </div>

        <nav className="mt-8 space-y-3" aria-label="Featured links">
          {BIO_LINKS.map((link) => (
            <Link
              key={link.id}
              href={bioLinkHref(link, "instagram")}
              className="block rounded-card border border-border bg-surface p-4 shadow-card transition-colors hover:border-teal/40 hover:bg-teal-soft/30"
            >
              <p className="font-display text-base font-semibold text-ink">{link.label}</p>
              <p className="mt-1 text-[0.8125rem] text-ink-muted">{link.description}</p>
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex justify-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:border-teal hover:text-teal"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          {SOCIAL_POSTING_CADENCE.corePostsPerWeek} quality videos/week — not daily noise.
        </p>
      </div>
    </div>
  );
}
