import type { SupportedCurrency } from "@/lib/money/currency";

export type InviteView = {
  achieverName: string;
  promiseSlug: string;
  promiseTitle: string;
  deadline: string;
  amountMinor: number;
  currency: SupportedCurrency;
  message: string | null;
  backerName: string;
  accepted: boolean;
};

type InviteRow = {
  achieverName: string;
  promiseSlug: string;
  promiseTitle: string;
  deadline: Date;
  amountMinor: number;
  currency: string;
  message: string | null;
  backerName: string;
  acceptedAt: Date | null;
  expiresAt: Date;
  revokedAt: Date | null;
};

export interface InviteViewRepository {
  findByTokenHash(tokenHash: string): Promise<InviteRow | null>;
}

export async function getInviteByToken(token: string, deps: { hash: (token: string) => Promise<string>; invites: InviteViewRepository; now: () => Date }): Promise<InviteView | null> {
  const tokenHash = await deps.hash(token);
  const row = await deps.invites.findByTokenHash(tokenHash);
  if (!row || row.revokedAt) return null;
  const accepted = row.acceptedAt !== null;
  if (!accepted && row.expiresAt <= deps.now()) return null;
  return {
    achieverName: row.achieverName,
    promiseSlug: row.promiseSlug,
    promiseTitle: row.promiseTitle,
    deadline: row.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    amountMinor: row.amountMinor,
    currency: row.currency as SupportedCurrency,
    message: row.message,
    backerName: row.backerName,
    accepted,
  };
}
