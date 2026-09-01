import type { SupportedCurrency } from "@/lib/money/currency";
import type { PromiseState } from "@/lib/state-machines/promise";

export type PromiseBacker = {
  name: string;
  amountMinor: number;
  message: string | null;
  createdAt: string;
};

export type PromiseView = {
  achieverName: string;
  title: string;
  deadline: string;
  targetLabel: string | null;
  state: PromiseState;
  totalAmountMinor: number;
  currency: SupportedCurrency;
  backers: PromiseBacker[];
  // Proof approval completes the Promise; releasing each Back's backing is a
  // separate, later admin action (ADR-0011), so this is only true once every
  // visible Back has actually been released — never assumed from completion.
  allBackingReleased: boolean;
};

export type PromiseHeaderRow = {
  achieverName: string;
  title: string;
  deadline: Date;
  targetValue: number | null;
  targetUnit: string | null;
  state: PromiseState;
};

export type PromiseBackerRow = {
  backerName: string;
  amountMinor: number;
  currency: string;
  message: string | null;
  createdAt: Date;
  state: string;
};

export interface PromiseViewRepository {
  findHeaderBySlug(slug: string): Promise<PromiseHeaderRow | null>;
  listVisibleBackersBySlug(slug: string): Promise<PromiseBackerRow[]>;
}

export async function getPromiseBySlug(slug: string, deps: { promises: PromiseViewRepository }): Promise<PromiseView | null> {
  const header = await deps.promises.findHeaderBySlug(slug);
  if (!header) return null;

  const backerRows = await deps.promises.listVisibleBackersBySlug(slug);
  const currency = (backerRows[0]?.currency ?? "USD") as SupportedCurrency;
  const totalAmountMinor = backerRows.reduce((sum, row) => sum + row.amountMinor, 0);
  const backers: PromiseBacker[] = backerRows.map((row) => ({
    name: row.backerName,
    amountMinor: row.amountMinor,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    achieverName: header.achieverName,
    title: header.title,
    deadline: header.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    targetLabel: header.targetValue && header.targetUnit ? `${header.targetValue} ${header.targetUnit}` : null,
    state: header.state,
    totalAmountMinor,
    currency,
    backers,
    allBackingReleased: backerRows.length > 0 && backerRows.every((row) => row.state === "released"),
  };
}
