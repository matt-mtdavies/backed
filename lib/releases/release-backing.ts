import { transitionBack, type BackState } from "@/lib/state-machines/back";
import type { PaymentProvider } from "@/lib/payments/provider";

export type ReleasableBack = {
  backId: string;
  state: BackState;
  amountMinor: number;
  currency: string;
  commitmentReference: string;
};

export interface ReleasableBackRepository {
  findPayableById(backId: string): Promise<ReleasableBack | null>;
  setReleased(input: { backId: string; state: "released" }): Promise<void>;
}

export interface BackingCommitmentReleaseRepository {
  markReleased(input: { backId: string; releasedAt: string }): Promise<void>;
}

export interface ReleasePaymentEventRepository {
  create(input: { id: string; backId: string; type: "released"; provider: "alpha"; providerEventId: string; amountMinor: number; currency: string; payloadJson: Record<string, unknown>; createdAt: string }): Promise<void>;
}

type Dependencies = {
  backs: ReleasableBackRepository;
  commitments: BackingCommitmentReleaseRepository;
  paymentEvents: ReleasePaymentEventRepository;
  payments: PaymentProvider;
  capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
  id: () => string;
  now: () => Date;
};

export class BackNotReleasableError extends Error {}

export async function releaseBacking(backId: string, deps: Dependencies) {
  const back = await deps.backs.findPayableById(backId);
  if (!back) throw new BackNotReleasableError("Back is not payable.");

  const released = transitionBack(back.state, "released");
  if (released !== "released") throw new BackNotReleasableError("Back could not be released.");

  const release = await deps.payments.release(back.commitmentReference);
  const releasedAt = deps.now().toISOString();

  await deps.backs.setReleased({ backId: back.backId, state: released });
  await deps.commitments.markReleased({ backId: back.backId, releasedAt });
  await deps.paymentEvents.create({ id: deps.id(), backId: back.backId, type: "released", provider: "alpha", providerEventId: release.providerReference, amountMinor: back.amountMinor, currency: back.currency, payloadJson: { commitment_reference: back.commitmentReference }, createdAt: releasedAt });
  await deps.capture("backing_released", { back_id: back.backId, amount_minor: back.amountMinor });

  return { backId: back.backId, state: released, providerReference: release.providerReference, releasedAt };
}
