const PLANE_PATH =
  "M30 0c0-1.6-1.3-3-3-3H10L-8-20h-8L-6-3h-12l-6-7h-5l3 8c-.4.6-.4 1.4 0 2l-3 8h5l6-7h12L-16 20h8L10 3h17c1.7 0 3-1.4 3-3Z";

const HEART_PATH =
  "M32 58S6 41.2 6 22.8C6 13.5 13 7 21.4 7c4.9 0 9 2.4 10.6 6 1.6-3.6 5.7-6 10.6-6C51 7 58 13.5 58 22.8 58 41.2 32 58 32 58Z";

type Tone = "default" | "inverse";

type LogoMarkProps = {
  tone?: Tone;
  className?: string;
};

/**
 * The heart-and-plane mark, drawn as vector so it stays crisp at favicon size
 * and can sit on any background. The plane carries a thick stroke in the
 * background colour, which is what creates the gap between it and the heart.
 */
export function LogoMark({ tone = "default", className = "h-9 w-9" }: LogoMarkProps) {
  const planeFill = tone === "inverse" ? "#f7f4f1" : "#16233c";
  const gap = tone === "inverse" ? "#16233c" : "#ffffff";

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <path d={HEART_PATH} fill="#c9462f" />
      <g transform="translate(32 33) rotate(-40) scale(0.88)">
        <path d={PLANE_PATH} fill="none" stroke={gap} strokeWidth={5.5} strokeLinejoin="round" />
        <path d={PLANE_PATH} fill={planeFill} />
      </g>
    </svg>
  );
}

type LogoProps = {
  tone?: Tone;
  /** Hide the wordmark on small screens where horizontal space is tight. */
  responsiveWordmark?: boolean;
  className?: string;
};

export function Logo({ tone = "default", responsiveWordmark = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} className="h-9 w-9 shrink-0" />
      <span
        className={`font-display text-[1.0625rem] font-semibold leading-none tracking-tight ${
          tone === "inverse" ? "text-ink-inverse" : "text-ink"
        } ${responsiveWordmark ? "hidden sm:inline" : ""}`}
      >
        Yes I Can Travel
      </span>
    </span>
  );
}
