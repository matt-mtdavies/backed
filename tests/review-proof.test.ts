import { describe, expect, it, vi } from "vitest";
import { approveProof } from "@/lib/proofs/review-proof";

describe("approveProof", () => {
  it("approves pending Proof, completes the Promise, and makes active Backs payable", async () => {
    const proofs = { findPendingById: vi.fn(async () => ({ proofId: "proof-1", promiseId: "promise-1", promiseState: "proof_pending" as const })), markReviewed: vi.fn(async () => {}) };
    const promises = { setVerified: vi.fn(async () => {}), setCompleted: vi.fn(async () => {}) };
    const backs = { listActiveByPromiseId: vi.fn(async () => [{ backId: "back-1", state: "active" as const, amountMinor: 25000, currency: "USD" }]), setPayable: vi.fn(async () => {}) };
    const verifications = { create: vi.fn(async () => {}) };
    const paymentEvents = { create: vi.fn(async () => {}) };
    const capture = vi.fn(async () => {});
    let id = 0;

    const result = await approveProof("proof-1", { reviewerUserId: "admin-1", note: "Approved." }, {
      proofs,
      promises,
      backs,
      verifications,
      paymentEvents,
      capture,
      id: () => `id-${++id}`,
      now: () => new Date("2026-08-31T12:00:00Z"),
    });

    expect(result).toEqual({ proofId: "proof-1", promiseId: "promise-1", state: "completed", payableBacks: 1, reviewedAt: "2026-08-31T12:00:00.000Z" });
    expect(promises.setVerified).toHaveBeenCalledWith({ promiseId: "promise-1", state: "verified", verifiedAt: "2026-08-31T12:00:00.000Z" });
    expect(promises.setCompleted).toHaveBeenCalledWith({ promiseId: "promise-1", state: "completed", completedAt: "2026-08-31T12:00:00.000Z" });
    expect(backs.setPayable).toHaveBeenCalledWith({ backId: "back-1", state: "payable" });
    expect(paymentEvents.create).toHaveBeenCalledWith(expect.objectContaining({ backId: "back-1", type: "payable", amountMinor: 25000, payloadJson: { proof_id: "proof-1" } }));
    expect(paymentEvents.create).not.toHaveBeenCalledWith(expect.objectContaining({ type: "released" }));
    expect(capture).toHaveBeenCalledWith("proof_approved", { proof_id: "proof-1", promise_id: "promise-1", payable_backs: 1 });
    expect(capture).toHaveBeenCalledWith("promise_completed", { promise_id: "promise-1", proof_id: "proof-1" });
  });

  it("rejects approval before Proof is pending", async () => {
    await expect(approveProof("proof-1", { reviewerUserId: "admin-1" }, {
      proofs: { findPendingById: vi.fn(async () => ({ proofId: "proof-1", promiseId: "promise-1", promiseState: "active" as const })), markReviewed: vi.fn() },
      promises: { setVerified: vi.fn(), setCompleted: vi.fn() },
      backs: { listActiveByPromiseId: vi.fn(), setPayable: vi.fn() },
      verifications: { create: vi.fn() },
      paymentEvents: { create: vi.fn() },
      capture: vi.fn(),
      id: () => "id-1",
      now: () => new Date(),
    })).rejects.toThrow("Invalid promise transition");
  });
});
