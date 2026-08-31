import type { PaymentProvider } from "@/lib/payments/provider";
import { assertValidAddBacking } from "@/lib/validation/add-backing";
import type { PromiseState } from "@/lib/state-machines/promise";
import type { AddBackingInput, AddBackingResult, NewBackRecord } from "./model";

export class PromiseNotFoundError extends Error {}
export class PromiseNotBackableError extends Error {}

export type BackablePromise = { id: string; achieverUserId: string; state: PromiseState };

export interface PromiseLookupRepository {
  findBackableBySlug(slug: string): Promise<BackablePromise | null>;
}
export interface BackRepository { insert(record: NewBackRecord): Promise<void> }
export interface CommitmentRepository {
  insert(record: { backId: string; provider: string; providerCustomerRef: string; commitmentState: string }): Promise<void>;
}
export interface Analytics { capture(event: string, properties: Record<string, unknown>): Promise<void> }

type Dependencies = {
  promises: PromiseLookupRepository;
  backs: BackRepository;
  commitments: CommitmentRepository;
  payments: PaymentProvider;
  analytics: Analytics;
  id: () => string;
  now: () => Date;
};

export async function addBacking(promiseSlug: string, input: AddBackingInput, deps: Dependencies): Promise<AddBackingResult> {
  assertValidAddBacking(input);

  const promise = await deps.promises.findBackableBySlug(promiseSlug);
  if (!promise) throw new PromiseNotFoundError("Promise not found");
  if (promise.state !== "active") throw new PromiseNotBackableError("This Promise isn’t accepting new backing right now.");

  const backId = deps.id();
  const createdAt = deps.now().toISOString();
  await deps.backs.insert({
    id: backId,
    promiseId: promise.id,
    backerUserId: null,
    backerName: input.backerName,
    achieverUserId: promise.achieverUserId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    message: input.message,
    state: "active",
    createdAt,
  });

  const commitment = await deps.payments.createCommitment({ backId, amountMinor: input.amountMinor, currency: input.currency });
  await deps.commitments.insert({ backId, provider: "alpha", providerCustomerRef: commitment.providerReference, commitmentState: commitment.state });

  await deps.analytics.capture("backing_completed", { back_id: backId, promise_id: promise.id, amount_minor: input.amountMinor });

  return { backId, commitmentReference: commitment.providerReference, state: "active" };
}
