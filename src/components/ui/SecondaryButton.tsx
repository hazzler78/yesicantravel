import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const baseClassName =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3 text-center text-base font-semibold leading-snug text-[var(--navy)] shadow-md transition-colors hover:border-[var(--ocean-teal)]/40 hover:bg-[var(--sand)] sm:px-6 sm:py-3.5 sm:text-lg";

type SecondaryButtonProps = {
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function SecondaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: SecondaryButtonProps) {
  return (
    <button type={type} className={`${baseClassName} ${className}`} {...props}>
      {children}
    </button>
  );
}

type SecondaryLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function SecondaryLink({ href, children, className = "", ...props }: SecondaryLinkProps) {
  return (
    <Link href={href} className={`${baseClassName} ${className}`} {...props}>
      {children}
    </Link>
  );
}
