import Image from "next/image";

type CityCardPhotoProps = {
  src: string;
  alt: string;
  /** Taller crop on the dedicated cities page; compact on the homepage strip. */
  size?: "card" | "strip";
  priority?: boolean;
  className?: string;
};

/**
 * Place-first city photography for discovery cards.
 * Files live in /public/cities as optimized WebP (~50–140KB).
 */
export function CityCardPhoto({
  src,
  alt,
  size = "card",
  priority = false,
  className = "",
}: CityCardPhotoProps) {
  const heightClass = size === "strip" ? "h-16 w-20 sm:h-[4.5rem] sm:w-[5.5rem]" : "aspect-[3/2] w-full";

  return (
    <span
      className={`relative block shrink-0 overflow-hidden bg-surface-muted ${heightClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={
          size === "strip"
            ? "88px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        className="object-cover"
        priority={priority}
      />
    </span>
  );
}
