type Tone = "default" | "inverse";

type LogoMarkProps = {
  tone?: Tone;
  className?: string;
};

/**
 * Original brand mark: plane flying over a heart.
 * Kept as the raster asset in /public/logo.png — the redesign briefly
 * replaced it with a simplified vector redraw that didn't match.
 */
export function LogoMark({ className = "h-9 w-9" }: LogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- brand asset; next/image adds little at this size
    <img
      src="/logo.png"
      alt=""
      width={36}
      height={36}
      className={`object-contain ${className}`}
      decoding="async"
    />
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
      <LogoMark className="h-9 w-9 shrink-0" />
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
