import type { PaymentProvider } from "@/lib/payments/provider";
import { requiresManualReview } from "@/lib/moderation/rules";
import { assertValidCreateBack } from "@/lib/validation/create-back";
import type { CreateBackInput, CreateBackResult } from "./model";

export type BackRecord = CreateBackInput & { id: string; state: "proposed"; createdAt: string };
export type InviteRecord = { id: string; backId: string; tokenHash: string; createdAt: string };
export interface BackRepository { insert(record: BackRecord): Promise<void> }
export interface InviteRepository { insert(record: InviteRecord): Promise<void> }
export interface Analytics { capture(event: string, properties: Record<string, unknown>): Promise<void> }

type Dependencies = { backs: BackRepository; invites: InviteRepository; payments: PaymentProvider; analytics: Analytics; id: () => string; token: () => string; hash: (token: string) => Promise<string>; now: () => Date };

export async function createBack(input: CreateBackInput, deps: Dependencies): Promise<CreateBackResult> {
  assertValidCreateBack(input);
  const backId = deps.id();
  const inviteId = deps.id();
  const inviteToken = deps.token();
  const createdAt = deps.now().toISOString();
  await deps.backs.insert({ ...input, id: backId, state: "proposed", createdAt });
  const commitment = await deps.payments.createCommitment({ backId, amountMinor: input.amountMinor, currency: input.currency });
  await deps.invites.insert({ id: inviteId, backId, tokenHash: await deps.hash(inviteToken), createdAt });
  await deps.analytics.capture("invite_sent", { back_id: backId, amount_minor: input.amountMinor, template_key: input.templateKey });
  return { backId, inviteId, inviteToken, commitmentReference: commitment.providerReference, state: "proposed", requiresManualReview: requiresManualReview(input.promiseTitle, input.templateKey === "custom") };
}
