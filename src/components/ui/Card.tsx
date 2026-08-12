import type { ElementType, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  /** "muted" drops the shadow for cards sitting on white sections. */
  tone?: "raised" | "muted";
  as?: ElementType;
  className?: string;
};

/**
 * The single card surface used across the site. Everything used to hand-roll
 * `rounded-xl border bg-white shadow-sm`, which is how five radii and four
 * shadow depths ended up on the same screen.
 */
export function Card({ children, tone = "raised", as: Tag = "div", className = "" }: CardProps) {
  return (
    <Tag
      className={`rounded-card border border-border bg-surface ${
        tone === "raised" ? "shadow-card" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

type SectionProps = {
  children: ReactNode;
  /** Alternating band colour used to separate page sections. */
  tone?: "canvas" | "muted" | "inverse";
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
};

export function Section({
  children,
  tone = "canvas",
  className = "",
  id,
  ...rest
}: SectionProps) {
  const toneClass =
    tone === "inverse"
      ? "bg-surface-inverse text-ink-inverse"
      : tone === "muted"
        ? "bg-surface-muted"
        : "bg-canvas";

  return (
    <section id={id} className={`${toneClass} ${className}`} {...rest}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "left",
  tone = "default",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p
          className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${
            tone === "inverse" ? "text-teal-soft/80" : "text-teal"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`font-display text-2xl font-semibold tracking-tight md:text-3xl ${
          tone === "inverse" ? "text-ink-inverse" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 ${tone === "inverse" ? "text-ink-inverse/75" : "text-ink-muted"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
