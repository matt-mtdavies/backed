export const promiseTemplates = [
  { key: "first_5k", label: "Run my first 5K", category: "running", targetType: "distance", targetValue: 5, targetUnit: "km" },
  { key: "first_10k", label: "Run my first 10K", category: "running", targetType: "distance", targetValue: 10, targetUnit: "km" },
  { key: "first_half", label: "Run my first half marathon", category: "running", targetType: "distance", targetValue: 21.1, targetUnit: "km" },
  { key: "first_marathon", label: "Run my first marathon", category: "running", targetType: "distance", targetValue: 42.2, targetUnit: "km" },
  { key: "custom", label: "Something else", category: "general", targetType: null, targetValue: null, targetUnit: null },
] as const;

import type { SupportedCurrency } from "@/lib/money/currency";

export type CreateBackInput = {
  backerName: string;
  achieverFirstName: string;
  achieverLastName?: string;
  achieverContact: string;
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

export type AddBackingInput = {
  backerName: string;
  amountMinor: number;
  currency: SupportedCurrency;
  message?: string;
};

export type AddBackingResult = {
  backId: string;
  commitmentReference: string;
  state: "active";
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
  achieverUserId: string;
  createdByUserId: string | null;
  title: string;
  category: string;
  templateKey: string;
  targetType: string | null;
  targetValue: number | null;
  targetUnit: string | null;
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
  backerName: string;
  achieverUserId: string;
  amountMinor: number;
  currency: SupportedCurrency;
  message?: string;
  state: "proposed" | "active";
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
