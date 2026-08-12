import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Yes I Can Travel — hotel search for women travelling solo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Typographic share card with the original heart-and-plane mark.
 * Social previews used to fall back to a square logo PNG alone, which
 * cropped badly in every feed.
 */
export default async function OpengraphImage() {
  const logoBytes = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#16233c",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={56} height={56} alt="" style={{ borderRadius: 8 }} />
          <span style={{ color: "#f7f4f1", fontSize: 30, fontWeight: 600 }}>Yes I Can Travel</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#f7f4f1",
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Know what you&apos;re booking
          </span>
          <span
            style={{
              color: "#f7f4f1",
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            before you arrive.
          </span>
        </div>

        <span style={{ color: "rgba(247,244,241,0.7)", fontSize: 28 }}>
          Hotel search for women travelling solo
        </span>
      </div>
    ),
    size
  );
}
