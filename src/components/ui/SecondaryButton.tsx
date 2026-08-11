import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const baseClassName =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 text-center text-[0.9375rem] font-semibold leading-none text-ink transition-colors hover:border-border-strong hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60";

type SecondaryButtonProps = {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function SecondaryButton({
  children,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClassName} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type SecondaryLinkProps = {
  href: string;
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function SecondaryLink({
  href,
  children,
  fullWidth = false,
  className = "",
  ...props
}: SecondaryLinkProps) {
  return (
    <Link href={href} className={`${baseClassName} ${fullWidth ? "w-full" : ""} ${className}`} {...props}>
      {children}
    </Link>
  );
}
