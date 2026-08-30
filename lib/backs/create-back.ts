import type { PaymentProvider } from "@/lib/payments/provider";
import { requiresManualReview } from "@/lib/moderation/rules";
import { assertValidCreateBack, emailPattern } from "@/lib/validation/create-back";
import { buildPromiseSlug } from "@/lib/promises/slug";
import { promiseTemplates, type CreateBackInput, type CreateBackResult, type NewUserRecord, type NewPromiseRecord, type NewBackRecord, type NewInviteRecord } from "./model";

export interface UserRepository {
  findByContact(contact: string): Promise<{ id: string } | null>;
  insert(record: NewUserRecord): Promise<void>;
}
export interface PromiseRepository { insert(record: NewPromiseRecord): Promise<void> }
export interface BackRepository { insert(record: NewBackRecord): Promise<void> }
export interface InviteRepository { insert(record: NewInviteRecord): Promise<void> }
export interface Analytics { capture(event: string, properties: Record<string, unknown>): Promise<void> }

const INVITE_TTL_DAYS = 30;

type Dependencies = {
  users: UserRepository;
  promises: PromiseRepository;
  backs: BackRepository;
  invites: InviteRepository;
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

  const existingUser = await deps.users.findByContact(input.recipientContact);
  const recipientUserId = existingUser?.id ?? deps.id();
  if (!existingUser) {
    const isEmail = emailPattern.test(input.recipientContact);
    await deps.users.insert({
      id: recipientUserId,
      email: isEmail ? input.recipientContact : undefined,
      phone: isEmail ? undefined : input.recipientContact,
      firstName: input.recipientFirstName,
      lastName: input.recipientLastName,
      displayName: [input.recipientFirstName, input.recipientLastName].filter(Boolean).join(" "),
    });
  }

  const promiseId = deps.id();
  const category = promiseTemplates.find((item) => item.key === input.templateKey)?.category ?? "general";
  await deps.promises.insert({
    id: promiseId,
    ownerUserId: recipientUserId,
    creatorUserId: null,
    title: input.promiseTitle,
    category,
    templateKey: input.templateKey,
    deadline: `${input.deadline}T23:59:59Z`,
    successCriteria: input.successCriteria,
    verificationMethod: input.verificationMethod,
    slug: buildPromiseSlug(input.recipientFirstName, promiseId),
    state: "proposed",
    createdAt,
  });

  const backId = deps.id();
  await deps.backs.insert({
    id: backId,
    promiseId,
    backerUserId: null,
    recipientUserId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    message: input.message,
    state: "proposed",
    createdAt,
  });

  const commitment = await deps.payments.createCommitment({ backId, amountMinor: input.amountMinor, currency: input.currency });

  const inviteId = deps.id();
  const inviteToken = deps.token();
  const expiresAt = new Date(deps.now().getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await deps.invites.insert({ id: inviteId, backId, promiseId, tokenHash: await deps.hash(inviteToken), expiresAt, createdAt });

  await deps.analytics.capture("invite_sent", { back_id: backId, promise_id: promiseId, amount_minor: input.amountMinor, template_key: input.templateKey });

  return { backId, inviteId, inviteToken, commitmentReference: commitment.providerReference, state: "proposed", requiresManualReview: requiresManualReview(input.promiseTitle, input.templateKey === "custom") };
}
