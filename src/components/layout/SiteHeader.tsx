"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CurrencyControl } from "@/components/currency/CurrencyControl";
import { TextSizeControl } from "./TextSizeControl";

const NAV_LINKS = [
  { href: "/popular-cities", label: "Popular cities" },
  { href: "/events", label: "Peak dates" },
  { href: "/destinations", label: "City guides" },
  { href: "/blog", label: "Guides" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return path.length > 1 && pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-control" aria-label="Yes I Can Travel — home">
          <Logo responsiveWordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-control px-3 py-2 text-[0.9375rem] font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-surface-muted text-ink"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CurrencyControl className="hidden sm:flex" />
          <TextSizeControl className="hidden lg:flex" />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-border text-ink md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="site-menu" className="border-t border-border bg-surface md:hidden">
          <nav aria-label="Main" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-control px-3 py-3 text-[0.9375rem] font-medium text-ink hover:bg-surface-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              <CurrencyControl />
              <TextSizeControl />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
