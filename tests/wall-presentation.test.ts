import { describe, expect, it } from "vitest";
import { toneForIndex, relativeDaysAgoLabel } from "../lib/promises/wall-presentation";

describe("toneForIndex", () => {
  it("cycles through the three tones", () => {
    expect([0, 1, 2, 3, 4].map(toneForIndex)).toEqual(["lime", "bone", "mist", "lime", "bone"]);
  });
});

describe("relativeDaysAgoLabel", () => {
  const now = new Date("2026-08-30T12:00:00Z");
  it("labels today and yesterday distinctly", () => {
    expect(relativeDaysAgoLabel("2026-08-30T01:00:00Z", now)).toBe("BACKED TODAY.");
    expect(relativeDaysAgoLabel("2026-08-29T01:00:00Z", now)).toBe("BACKED YESTERDAY.");
  });
  it("counts days for anything older", () => {
    expect(relativeDaysAgoLabel("2026-08-20T01:00:00Z", now)).toBe("BACKED 10 DAYS AGO.");
  });
});
