export const promiseTemplates = [
  { key: "first_5k", label: "Run my first 5K", category: "running" },
  { key: "first_10k", label: "Run my first 10K", category: "running" },
  { key: "first_half", label: "Run my first half marathon", category: "running" },
  { key: "first_marathon", label: "Run my first marathon", category: "running" },
  { key: "custom", label: "Something else", category: "general" },
] as const;

import type { SupportedCurrency } from "@/lib/money/currency";
export type CreateBackInput = {
  recipientFirstName: string;
  recipientLastName?: string;
  recipientContact: string;
  templateKey: (typeof promiseTemplates)[number]["key"];
  promiseTitle: string;
  deadline: string;
  successCriteria: string;
  verificationMethod: string;
  amountMinor: number;
  currency: SupportedCurrency;
  message?: string;
};

export type CreateBackResult = {
  backId: string;
  inviteId: string;
  inviteToken: string;
  commitmentReference: string;
  state: "proposed";
  requiresManualReview: boolean;
};

export type NewUserRecord = {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName?: string;
  displayName: string;
};

export type NewPromiseRecord = {
  id: string;
  ownerUserId: string;
  creatorUserId: string | null;
  title: string;
  category: string;
  templateKey: string;
  deadline: string;
  successCriteria: string;
  verificationMethod: string;
  slug: string;
  state: "proposed";
  createdAt: string;
};

export type NewBackRecord = {
  id: string;
  promiseId: string;
  backerUserId: string | null;
  recipientUserId: string;
  amountMinor: number;
  currency: SupportedCurrency;
  message?: string;
  state: "proposed";
  createdAt: string;
};

export type NewInviteRecord = {
  id: string;
  backId: string;
  promiseId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};
