import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "coral" | "teal";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  coral: "bg-coral text-white hover:bg-coral-hover",
  teal: "bg-teal text-white hover:bg-teal-hover",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-[44px] px-4 text-[0.9375rem]",
  lg: "min-h-[52px] px-6 text-base",
};

function buttonClassName(variant: Variant, size: Size, fullWidth: boolean, className: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type PrimaryButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function PrimaryButton({
  children,
  variant = "teal",
  size = "lg",
  fullWidth = true,
  className = "",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button type={type} className={buttonClassName(variant, size, fullWidth, className)} {...props}>
      {children}
    </button>
  );
}

type PrimaryLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function PrimaryLink({
  href,
  children,
  variant = "teal",
  size = "lg",
  fullWidth = true,
  className = "",
  ...props
}: PrimaryLinkProps) {
  return (
    <Link href={href} className={buttonClassName(variant, size, fullWidth, className)} {...props}>
      {children}
    </Link>
  );
}
