import { describe, expect, it, vi } from "vitest";
import { AlphaMockPaymentProvider } from "@/lib/payments/provider";
import { releaseBacking } from "@/lib/releases/release-backing";

describe("releaseBacking", () => {
  it("releases a payable Back through the payment provider and appends a release event", async () => {
    const backs = { findPayableById: vi.fn(async () => ({ backId: "back-1", state: "payable" as const, amountMinor: 25000, currency: "USD", commitmentReference: "alpha_back-1" })), setReleased: vi.fn(async () => {}) };
    const commitments = { markReleased: vi.fn(async () => {}) };
    const paymentEvents = { create: vi.fn(async () => {}) };
    const capture = vi.fn(async () => {});

    const result = await releaseBacking("back-1", {
      backs,
      commitments,
      paymentEvents,
      payments: new AlphaMockPaymentProvider(),
      capture,
      id: () => "event-1",
      now: () => new Date("2026-08-31T12:00:00Z"),
    });

    expect(result).toEqual({ backId: "back-1", state: "released", providerReference: "alpha_back-1", releasedAt: "2026-08-31T12:00:00.000Z" });
    expect(backs.setReleased).toHaveBeenCalledWith({ backId: "back-1", state: "released" });
    expect(commitments.markReleased).toHaveBeenCalledWith({ backId: "back-1", releasedAt: "2026-08-31T12:00:00.000Z" });
    expect(paymentEvents.create).toHaveBeenCalledWith(expect.objectContaining({ id: "event-1", backId: "back-1", type: "released", providerEventId: "alpha_back-1", amountMinor: 25000 }));
    expect(capture).toHaveBeenCalledWith("backing_released", { back_id: "back-1", amount_minor: 25000 });
  });

  it("rejects a Back that is not payable", async () => {
    await expect(releaseBacking("back-1", {
      backs: { findPayableById: vi.fn(async () => null), setReleased: vi.fn() },
      commitments: { markReleased: vi.fn() },
      paymentEvents: { create: vi.fn() },
      payments: new AlphaMockPaymentProvider(),
      capture: vi.fn(),
      id: () => "event-1",
      now: () => new Date(),
    })).rejects.toThrow("not payable");
  });
});
