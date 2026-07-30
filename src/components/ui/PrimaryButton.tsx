import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  variant?: "coral" | "teal";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
};

const variantClasses = {
  coral:
    "border-2 border-white bg-[var(--coral)] hover:bg-[var(--coral-light)] [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] shadow-2xl",
  teal: "bg-[var(--ocean-teal)] hover:bg-[var(--ocean-teal-light)] shadow-md",
};

export function PrimaryButton({
  children,
  variant = "teal",
  className = "",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-lg px-4 py-3.5 text-lg font-semibold text-white transition-colors disabled:opacity-60 sm:px-6 sm:py-4 sm:text-xl ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
