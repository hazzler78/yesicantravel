import { ImageResponse } from "next/og";

export const alt = "Yes I Can Travel — hotel search for women travelling solo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Typographic share card. Social previews used to fall back to a square logo
 * PNG, which cropped badly in every feed.
 */
export default function OpengraphImage() {
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
          <svg width="52" height="52" viewBox="0 0 64 64">
            <path
              fill="#c9462f"
              d="M32 58S6 41.2 6 22.8C6 13.5 13 7 21.4 7c4.9 0 9 2.4 10.6 6 1.6-3.6 5.7-6 10.6-6C51 7 58 13.5 58 22.8 58 41.2 32 58 32 58Z"
            />
            <g transform="translate(32 33) rotate(-40) scale(0.88)">
              <path
                d="M30 0c0-1.6-1.3-3-3-3H10L-8-20h-8L-6-3h-12l-6-7h-5l3 8c-.4.6-.4 1.4 0 2l-3 8h5l6-7h12L-16 20h8L10 3h17c1.7 0 3-1.4 3-3Z"
                fill="none"
                stroke="#16233c"
                strokeWidth={5.5}
                strokeLinejoin="round"
              />
              <path
                d="M30 0c0-1.6-1.3-3-3-3H10L-8-20h-8L-6-3h-12l-6-7h-5l3 8c-.4.6-.4 1.4 0 2l-3 8h5l6-7h12L-16 20h8L10 3h17c1.7 0 3-1.4 3-3Z"
                fill="#f7f4f1"
              />
            </g>
          </svg>
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
