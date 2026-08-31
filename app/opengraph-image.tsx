import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BACKED — Belief, made tangible.";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#0A0C0B", color: "#F4F3ED", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: 34, height: 26, borderRadius: "8px 34px 34px 8px", background: "#F4F3ED" }} />
            <div style={{ width: 34, height: 26, borderRadius: "8px 34px 34px 8px", background: "#F4F3ED" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>
            BACKED<span style={{ color: "#C8FF32" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3 }}>Don’t just believe in someone.</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, color: "#C8FF32" }}>Back them.</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
