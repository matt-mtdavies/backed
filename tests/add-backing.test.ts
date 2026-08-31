import { describe, expect, it, vi } from "vitest";
import { addBacking, PromiseNotFoundError, PromiseNotBackableError, type BackablePromise } from "../lib/backs/add-backing";
import type { AddBackingInput, NewBackRecord } from "../lib/backs/model";
import { AlphaMockPaymentProvider } from "../lib/payments/provider";
import { AddBackingValidationError } from "../lib/validation/add-backing";

const validInput: AddBackingInput = { backerName: "Sarah", amountMinor: 5000, currency: "USD", message: "See you at the finish line." };
const activePromise: BackablePromise = { id: "promise-1", achieverUserId: "achiever-1", state: "active" };

function makeDeps(promise: BackablePromise | null) {
  const backs: NewBackRecord[] = [];
  const capture = vi.fn();
  return {
    backs, capture,
    deps: {
      promises: { findBackableBySlug: async () => promise },
      backs: { insert: async (record: NewBackRecord) => { backs.push(record) } },
      payments: new AlphaMockPaymentProvider(),
      analytics: { capture: async (event: string, properties: Record<string, unknown>) => { capture(event, properties) } },
      id: () => "back-2",
      now: () => new Date("2026-08-30T12:00:00Z"),
    },
  };
}

describe("addBacking", () => {
  it("creates an active Back against an existing active Promise", async () => {
    const { backs, capture, deps } = makeDeps(activePromise);
    const result = await addBacking("jason-first-half", validInput, deps);
    expect(result).toEqual({ backId: "back-2", commitmentReference: "alpha_back-2", state: "active" });
    expect(backs[0]).toMatchObject({ id: "back-2", promiseId: "promise-1", achieverUserId: "achiever-1", backerName: "Sarah", state: "active" });
    expect(capture).toHaveBeenCalledWith("backing_completed", expect.objectContaining({ back_id: "back-2" }));
  });
  it("rejects a slug that doesn't match any Promise", async () => {
    const { deps } = makeDeps(null);
    await expect(addBacking("no-such-promise", validInput, deps)).rejects.toThrow(PromiseNotFoundError);
  });
  it("rejects backing a Promise that isn't active yet", async () => {
    const { deps } = makeDeps({ ...activePromise, state: "proposed" });
    await expect(addBacking("jason-first-half", validInput, deps)).rejects.toThrow(PromiseNotBackableError);
  });
  it("validates the input before touching the repository", async () => {
    const { backs, deps } = makeDeps(activePromise);
    await expect(addBacking("jason-first-half", { ...validInput, backerName: "" }, deps)).rejects.toThrow(AddBackingValidationError);
    expect(backs).toHaveLength(0);
  });
});
