import { transitionPromise, type PromiseState } from "@/lib/state-machines/promise";
import { transitionBack, type BackState } from "@/lib/state-machines/back";

export class InvalidInviteError extends Error {}
export class InviteExpiredError extends Error {}

export type ActiveInvite = {
  inviteId: string;
  backId: string;
  promiseId: string;
  promiseState: PromiseState;
  backState: BackState;
  expiresAt: string;
  acceptedAt: string | null;
};

export interface InviteLookupRepository {
  findActiveByTokenHash(tokenHash: string): Promise<ActiveInvite | null>;
  markAccepted(inviteId: string, acceptedAt: string): Promise<void>;
}
export interface PromiseAcceptanceRepository {
  setState(input: { promiseId: string; state: PromiseState; acceptedAt: string; activatedAt: string }): Promise<void>;
}
export interface BackActivationRepository {
  setState(input: { backId: string; state: BackState }): Promise<void>;
}

type Dependencies = {
  hash: (token: string) => Promise<string>;
  invites: InviteLookupRepository;
  promises: PromiseAcceptanceRepository;
  backs: BackActivationRepository;
  capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
  now: () => Date;
};

export async function acceptPromise(inviteToken: string, deps: Dependencies) {
  if (inviteToken.length < 8) throw new InvalidInviteError("Invalid invite token");

  const tokenHash = await deps.hash(inviteToken);
  const invite = await deps.invites.findActiveByTokenHash(tokenHash);
  if (!invite) throw new InvalidInviteError("Invalid invite token");

  const now = deps.now();
  if (invite.acceptedAt) return { state: invite.promiseState, acceptedAt: invite.acceptedAt };
  if (new Date(invite.expiresAt) <= now) throw new InviteExpiredError("This invite has expired");

  const accepted = transitionPromise(invite.promiseState, "accepted");
  const active = transitionPromise(accepted, "active");
  const committed = transitionBack(invite.backState, "committed");
  const activeBack = transitionBack(committed, "active");
  const timestamp = now.toISOString();

  await deps.promises.setState({ promiseId: invite.promiseId, state: active, acceptedAt: timestamp, activatedAt: timestamp });
  await deps.backs.setState({ backId: invite.backId, state: activeBack });
  await deps.invites.markAccepted(invite.inviteId, timestamp);
  await deps.capture("promise_accepted", { promise_id: invite.promiseId, back_id: invite.backId });

  return { state: active, acceptedAt: timestamp };
}
