import { describe, expect, it } from "vitest";
import { getPromiseBySlug, type PromiseHeaderRow, type PromiseBackerRow } from "../lib/promises/get-promise";

const header: PromiseHeaderRow = { achieverName: "Jason", title: "Run my first half marathon", deadline: new Date("2027-06-30T23:59:59Z"), targetValue: 21.1, targetUnit: "km", state: "active" };
const backerRows: PromiseBackerRow[] = [
  { backerName: "Matthew", amountMinor: 25000, currency: "USD", message: "Go get it.", createdAt: new Date("2026-08-01T00:00:00Z"), state: "released" },
  { backerName: "Sarah", amountMinor: 5000, currency: "USD", message: null, createdAt: new Date("2026-08-10T00:00:00Z"), state: "payable" },
];

describe("getPromiseBySlug", () => {
  it("returns null when the Promise doesn't exist", async () => {
    const result = await getPromiseBySlug("nope", { promises: { findHeaderBySlug: async () => null, listVisibleBackersBySlug: async () => [] } });
    expect(result).toBeNull();
  });
  it("sums total backing and formats the target label", async () => {
    const result = await getPromiseBySlug("jason-first-half", { promises: { findHeaderBySlug: async () => header, listVisibleBackersBySlug: async () => backerRows } });
    expect(result).toMatchObject({ achieverName: "Jason", totalAmountMinor: 30000, currency: "USD", targetLabel: "21.1 km" });
    expect(result?.backers).toHaveLength(2);
    expect(result?.backers[0]).toMatchObject({ name: "Matthew", amountMinor: 25000, message: "Go get it." });
  });
  it("omits the target label when the Promise has no structured target", async () => {
    const result = await getPromiseBySlug("custom-goal", { promises: { findHeaderBySlug: async () => ({ ...header, targetValue: null, targetUnit: null }), listVisibleBackersBySlug: async () => [] } });
    expect(result?.targetLabel).toBeNull();
    expect(result?.totalAmountMinor).toBe(0);
  });
  it("reports backing as not fully released while any Back is still only payable", async () => {
    const result = await getPromiseBySlug("jason-first-half", { promises: { findHeaderBySlug: async () => header, listVisibleBackersBySlug: async () => backerRows } });
    expect(result?.allBackingReleased).toBe(false);
  });
  it("reports backing as released only once every visible Back has actually been released", async () => {
    const allReleased = backerRows.map((row) => ({ ...row, state: "released" }));
    const result = await getPromiseBySlug("jason-first-half", { promises: { findHeaderBySlug: async () => header, listVisibleBackersBySlug: async () => allReleased } });
    expect(result?.allBackingReleased).toBe(true);
  });
  it("does not claim backing is released when there are no visible Backers", async () => {
    const result = await getPromiseBySlug("jason-first-half", { promises: { findHeaderBySlug: async () => header, listVisibleBackersBySlug: async () => [] } });
    expect(result?.allBackingReleased).toBe(false);
  });
});
