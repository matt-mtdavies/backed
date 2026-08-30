import { ImageResponse } from "next/og";
import { demoPromise } from "@/lib/demo";
import { getPromiseBySlug } from "@/lib/promises/get-promise";
import { getDb } from "@/lib/db/client";
import { createPromiseViewRepository } from "@/lib/db/get-promise-repositories";
import { currencySymbol } from "@/lib/money/currency";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BACKED — see who's behind this Promise";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const card = slug === demoPromise.slug
    ? { achieverName: demoPromise.owner, title: demoPromise.title, backerCount: demoPromise.backers.length, amountLabel: `$${demoPromise.total.toLocaleString()}` }
    : await (async () => {
        const promise = await getPromiseBySlug(slug, { promises: createPromiseViewRepository(getDb()) });
        if (!promise) return null;
        return { achieverName: promise.achieverName, title: promise.title, backerCount: promise.backers.length, amountLabel: `${currencySymbol(promise.currency)}${(promise.totalAmountMinor / 100).toLocaleString()}` };
      })();

  if (!card) {
    return new ImageResponse(
      (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0C0B", color: "#F4F3ED", fontSize: 48, fontFamily: "sans-serif" }}>BACKED</div>),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#0A0C0B", color: "#F4F3ED", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ width: 26, height: 20, borderRadius: "6px 26px 26px 6px", background: "#F4F3ED" }} />
            <div style={{ width: 26, height: 20, borderRadius: "6px 26px 26px 6px", background: "#F4F3ED" }} />
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>
            BACKED<span style={{ color: "#C8FF32" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#A5AAA4" }}>{card.achieverName}</div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>{card.title}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#C8FF32", letterSpacing: -3 }}>{card.amountLabel}</div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>{card.backerCount} {card.backerCount === 1 ? "person" : "people"} behind {card.achieverName}.</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
