import { ImageResponse } from "next/og";

// iOS "Add to Home Screen" icon (apple-touch-icon). iOS ignores SVG favicons,
// so this generates a 180x180 PNG: gold R on navy, matching icon.svg.
// iOS applies its own rounded-corner mask, so we use a full navy square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#162839",
          color: "#B8860B",
          fontSize: 132,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
