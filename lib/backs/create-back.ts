import type { PaymentProvider } from "@/lib/payments/provider";
import { requiresManualReview } from "@/lib/moderation/rules";
import { assertValidCreateBack } from "@/lib/validation/create-back";
import { emailPattern } from "@/lib/validation/shared";
import { buildPromiseSlug } from "@/lib/promises/slug";
import { promiseTemplates, type CreateBackInput, type CreateBackResult, type NewUserRecord, type NewPromiseRecord, type NewBackRecord, type NewInviteRecord } from "./model";

export interface UserRepository {
  findByContact(contact: string): Promise<{ id: string } | null>;
  insert(record: NewUserRecord): Promise<void>;
}
export interface PromiseRepository { insert(record: NewPromiseRecord): Promise<void> }
export interface BackRepository { insert(record: NewBackRecord): Promise<void> }
export interface InviteRepository { insert(record: NewInviteRecord): Promise<void> }
export interface CommitmentRepository {
  insert(record: { backId: string; provider: string; providerCustomerRef: string; commitmentState: string }): Promise<void>;
}
export interface Analytics { capture(event: string, properties: Record<string, unknown>): Promise<void> }

const INVITE_TTL_DAYS = 30;

type Dependencies = {
  users: UserRepository;
  promises: PromiseRepository;
  backs: BackRepository;
  invites: InviteRepository;
  commitments: CommitmentRepository;
  payments: PaymentProvider;
  analytics: Analytics;
  id: () => string;
  token: () => string;
  hash: (token: string) => Promise<string>;
  now: () => Date;
};

export async function createBack(input: CreateBackInput, deps: Dependencies): Promise<CreateBackResult> {
  assertValidCreateBack(input);
  const createdAt = deps.now().toISOString();

  const existingUser = await deps.users.findByContact(input.achieverContact);
  const achieverUserId = existingUser?.id ?? deps.id();
  if (!existingUser) {
    const isEmail = emailPattern.test(input.achieverContact);
    await deps.users.insert({
      id: achieverUserId,
      email: isEmail ? input.achieverContact : undefined,
      phone: isEmail ? undefined : input.achieverContact,
      firstName: input.achieverFirstName,
      lastName: input.achieverLastName,
      displayName: [input.achieverFirstName, input.achieverLastName].filter(Boolean).join(" "),
    });
  }

  const promiseId = deps.id();
  const template = promiseTemplates.find((item) => item.key === input.templateKey);
  await deps.promises.insert({
    id: promiseId,
    achieverUserId,
    createdByUserId: null,
    title: input.promiseTitle,
    category: template?.category ?? "general",
    templateKey: input.templateKey,
    targetType: template?.targetType ?? null,
    targetValue: template?.targetValue ?? null,
    targetUnit: template?.targetUnit ?? null,
    deadline: `${input.deadline}T23:59:59Z`,
    successCriteria: input.successCriteria,
    verificationMethod: input.verificationMethod,
    slug: buildPromiseSlug(input.achieverFirstName, promiseId),
    state: "proposed",
    createdAt,
  });

  const backId = deps.id();
  await deps.backs.insert({
    id: backId,
    promiseId,
    backerUserId: null,
    backerName: input.backerName,
    achieverUserId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    message: input.message,
    state: "proposed",
    createdAt,
  });

  const commitment = await deps.payments.createCommitment({ backId, amountMinor: input.amountMinor, currency: input.currency });
  await deps.commitments.insert({ backId, provider: "alpha", providerCustomerRef: commitment.providerReference, commitmentState: commitment.state });

  const inviteId = deps.id();
  const inviteToken = deps.token();
  const expiresAt = new Date(deps.now().getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await deps.invites.insert({ id: inviteId, backId, promiseId, tokenHash: await deps.hash(inviteToken), expiresAt, createdAt });

  await deps.analytics.capture("invite_sent", { back_id: backId, promise_id: promiseId, amount_minor: input.amountMinor, template_key: input.templateKey });

  return { backId, inviteId, inviteToken, commitmentReference: commitment.providerReference, state: "proposed", requiresManualReview: requiresManualReview(input.promiseTitle, input.templateKey === "custom") };
}
