export const promiseTemplates = [
  { key: "first_5k", label: "Run my first 5K" },
  { key: "first_10k", label: "Run my first 10K" },
  { key: "first_half", label: "Run my first half marathon" },
  { key: "first_marathon", label: "Run my first marathon" },
  { key: "custom", label: "Something else" },
] as const;

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
  currency: "USD";
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
