import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SOCIAL_LINKS } from "@/components/brand/SocialIcons";

const EXPLORE_LINKS = [
  { href: "/popular-cities", label: "Popular cities" },
  { href: "/#trending-events", label: "Trending events" },
  { href: "/blog", label: "Solo travel guides" },
  { href: "/lead-magnet", label: "Free safety checklist" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.9375rem] text-ink-muted">
              Hotel search built around what women travelling solo actually need to know before
              they book — reception hours, lighting, location and cancellation terms.
            </p>
            <ul className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Yes I Can Travel on ${label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-ink">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.9375rem] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-ink">
              How booking works
            </h2>
            <p className="mt-4 text-[0.9375rem] text-ink-muted">
              Availability, prices and reservations are provided by our accommodation partner
              network. Payment is processed securely by Stripe, and your booking is confirmed
              directly with the property.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-[0.8125rem] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Yes I Can Travel</p>
          <p>
            We highlight the safety information properties publish. We can&apos;t guarantee
            safety — we help you see what you&apos;re booking.
          </p>
        </div>
      </div>
    </footer>
  );
}
