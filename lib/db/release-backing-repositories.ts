import { and, eq } from "drizzle-orm";
import { backingCommitments, backs, paymentEvents } from "@/db/schema";
import type { BackingCommitmentReleaseRepository, ReleasableBackRepository, ReleasePaymentEventRepository } from "@/lib/releases/release-backing";
import type { DbOrTx } from "./tx";

export function createReleasableBackRepository(db: DbOrTx): ReleasableBackRepository {
  return {
    async findPayableById(backId) {
      const [row] = await db
        .select({
          backId: backs.id,
          state: backs.state,
          amountMinor: backs.amountMinor,
          currency: backs.currency,
          commitmentReference: backingCommitments.providerCustomerRef,
        })
        .from(backs)
        .innerJoin(backingCommitments, eq(backingCommitments.backId, backs.id))
        .where(and(eq(backs.id, backId), eq(backs.state, "payable")))
        .limit(1);
      if (!row?.commitmentReference) return null;
      return { ...row, commitmentReference: row.commitmentReference };
    },
    async setReleased({ backId, state }) {
      await db.update(backs).set({ state, updatedAt: new Date() }).where(eq(backs.id, backId));
    },
  };
}

export function createBackingCommitmentReleaseRepository(db: DbOrTx): BackingCommitmentReleaseRepository {
  return {
    async markReleased({ backId, releasedAt }) {
      await db.update(backingCommitments).set({ releasedAt: new Date(releasedAt), commitmentState: "released", updatedAt: new Date() }).where(eq(backingCommitments.backId, backId));
    },
  };
}

export function createReleasePaymentEventRepository(db: DbOrTx): ReleasePaymentEventRepository {
  return {
    async create(record) {
      await db.insert(paymentEvents).values({ id: record.id, backId: record.backId, type: record.type, provider: record.provider, providerEventId: record.providerEventId, amountMinor: record.amountMinor, currency: record.currency, payloadJson: record.payloadJson, createdAt: new Date(record.createdAt) });
    },
  };
}
