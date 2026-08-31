import { describe, expect, it, vi } from "vitest";
import { submitProof } from "@/lib/proofs/submit-proof";

describe("submitProof", () => {
  it("creates pending Proof and moves the Promise into proof review", async () => {
    const proofs = { create: vi.fn(async () => {}) };
    const promises = { setProofPending: vi.fn(async () => {}) };
    const capture = vi.fn(async () => {});

    const result = await submitProof(
      { promiseId: "promise-1", promiseState: "active", submittedBy: "user-1", proofUrl: "https://results.example.com/race", note: "Official result posted." },
      { proofs, promises, capture, id: () => "proof-1", now: () => new Date("2026-08-30T12:00:00Z") },
    );

    expect(result).toEqual({ proofId: "proof-1", state: "proof_pending", submittedAt: "2026-08-30T12:00:00.000Z" });
    expect(proofs.create).toHaveBeenCalledWith(expect.objectContaining({ id: "proof-1", state: "pending", proofUrl: "https://results.example.com/race" }));
    expect(promises.setProofPending).toHaveBeenCalledWith({ promiseId: "promise-1", state: "proof_pending", proofSubmittedAt: "2026-08-30T12:00:00.000Z" });
    expect(capture).toHaveBeenCalledWith("proof_submitted", { proof_id: "proof-1", promise_id: "promise-1" });
  });

  it("rejects empty Proof", async () => {
    await expect(submitProof(
      { promiseId: "promise-1", promiseState: "active", submittedBy: "user-1" },
      { proofs: { create: vi.fn() }, promises: { setProofPending: vi.fn() }, capture: vi.fn(), id: () => "proof-1", now: () => new Date() },
    )).rejects.toThrow("Add a proof link");
  });

  it("does not allow Proof submission after completion", async () => {
    await expect(submitProof(
      { promiseId: "promise-1", promiseState: "completed", submittedBy: "user-1", note: "Done" },
      { proofs: { create: vi.fn() }, promises: { setProofPending: vi.fn() }, capture: vi.fn(), id: () => "proof-1", now: () => new Date() },
    )).rejects.toThrow("Invalid promise transition");
  });
});
