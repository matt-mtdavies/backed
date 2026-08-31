import { transitionBack, type BackState } from "@/lib/state-machines/back";
import { transitionPromise, type PromiseState } from "@/lib/state-machines/promise";

export type PendingProof = {
  proofId: string;
  promiseId: string;
  promiseState: PromiseState;
};

export type PayableBack = {
  backId: string;
  state: BackState;
  amountMinor: number;
  currency: string;
};

export interface ProofReviewLookupRepository {
  findPendingById(proofId: string): Promise<PendingProof | null>;
  markReviewed(input: { proofId: string; state: "approved" | "rejected"; reviewedAt: string }): Promise<void>;
}

export interface PromiseCompletionRepository {
  setVerified(input: { promiseId: string; verifiedAt: string; state: "verified" }): Promise<void>;
  setCompleted(input: { promiseId: string; completedAt: string; state: "completed" }): Promise<void>;
}

export interface BackPayableRepository {
  listActiveByPromiseId(promiseId: string): Promise<PayableBack[]>;
  setPayable(input: { backId: string; state: "payable" }): Promise<void>;
}

export interface VerificationRepository {
  create(input: { id: string; proofSubmissionId: string; reviewerUserId: string; decision: "approved" | "rejected"; note: string | null; createdAt: string }): Promise<void>;
}

export interface PaymentEventRepository {
  create(input: { id: string; backId: string; type: "payable"; provider: "alpha"; amountMinor: number; currency: string; payloadJson: Record<string, unknown>; createdAt: string }): Promise<void>;
}

type Dependencies = {
  proofs: ProofReviewLookupRepository;
  promises: PromiseCompletionRepository;
  backs: BackPayableRepository;
  verifications: VerificationRepository;
  paymentEvents: PaymentEventRepository;
  capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
  id: () => string;
  now: () => Date;
};

export class ProofNotFoundError extends Error {}
export class ProofNotReviewableError extends Error {}

export async function approveProof(proofId: string, input: { reviewerUserId: string; note?: string }, deps: Dependencies) {
  const proof = await deps.proofs.findPendingById(proofId);
  if (!proof) throw new ProofNotFoundError("Proof not found");

  const verified = transitionPromise(proof.promiseState, "verified");
  if (verified !== "verified") throw new ProofNotReviewableError("Proof is not ready for approval.");
  const completed = transitionPromise(verified, "completed");
  if (completed !== "completed") throw new ProofNotReviewableError("Promise could not be completed.");

  const now = deps.now().toISOString();
  await deps.verifications.create({ id: deps.id(), proofSubmissionId: proof.proofId, reviewerUserId: input.reviewerUserId, decision: "approved", note: normalize(input.note), createdAt: now });
  await deps.proofs.markReviewed({ proofId: proof.proofId, state: "approved", reviewedAt: now });
  await deps.promises.setVerified({ promiseId: proof.promiseId, state: verified, verifiedAt: now });
  await deps.promises.setCompleted({ promiseId: proof.promiseId, state: completed, completedAt: now });

  const backs = await deps.backs.listActiveByPromiseId(proof.promiseId);
  for (const back of backs) {
    const payable = transitionBack(back.state, "payable");
    if (payable !== "payable") throw new ProofNotReviewableError("Backing could not be marked payable.");
    await deps.backs.setPayable({ backId: back.backId, state: payable });
    await deps.paymentEvents.create({ id: deps.id(), backId: back.backId, type: "payable", provider: "alpha", amountMinor: back.amountMinor, currency: back.currency, payloadJson: { proof_id: proof.proofId }, createdAt: now });
  }

  await deps.capture("proof_approved", { proof_id: proof.proofId, promise_id: proof.promiseId, payable_backs: backs.length });
  await deps.capture("promise_completed", { promise_id: proof.promiseId, proof_id: proof.proofId });

  return { proofId: proof.proofId, promiseId: proof.promiseId, state: completed, payableBacks: backs.length, reviewedAt: now };
}

function normalize(value?: string) {
  const next = value?.trim();
  return next ? next : null;
}
