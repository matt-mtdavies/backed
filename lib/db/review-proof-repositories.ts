import { and, eq } from "drizzle-orm";
import { backs, paymentEvents, proofSubmissions, promises, verifications } from "@/db/schema";
import type { BackPayableRepository, PaymentEventRepository, ProofReviewLookupRepository, PromiseCompletionRepository, VerificationRepository } from "@/lib/proofs/review-proof";
import type { DbOrTx } from "./tx";

export function createProofReviewLookupRepository(db: DbOrTx): ProofReviewLookupRepository {
  return {
    async findPendingById(proofId) {
      const [row] = await db
        .select({ proofId: proofSubmissions.id, promiseId: proofSubmissions.promiseId, promiseState: promises.state })
        .from(proofSubmissions)
        .innerJoin(promises, eq(proofSubmissions.promiseId, promises.id))
        .where(and(eq(proofSubmissions.id, proofId), eq(proofSubmissions.state, "pending")))
        .limit(1);
      return row ?? null;
    },
    async markReviewed({ proofId, state }) {
      await db.update(proofSubmissions).set({ state, updatedAt: new Date() }).where(eq(proofSubmissions.id, proofId));
    },
  };
}

export function createPromiseCompletionRepository(db: DbOrTx): PromiseCompletionRepository {
  return {
    async setVerified({ promiseId, state, verifiedAt }) {
      await db.update(promises).set({ state, verifiedAt: new Date(verifiedAt), updatedAt: new Date() }).where(eq(promises.id, promiseId));
    },
    async setCompleted({ promiseId, state, completedAt }) {
      await db.update(promises).set({ state, completedAt: new Date(completedAt), updatedAt: new Date() }).where(eq(promises.id, promiseId));
    },
  };
}

export function createBackPayableRepository(db: DbOrTx): BackPayableRepository {
  return {
    async listActiveByPromiseId(promiseId) {
      const rows = await db
        .select({ backId: backs.id, state: backs.state, amountMinor: backs.amountMinor, currency: backs.currency })
        .from(backs)
        .where(and(eq(backs.promiseId, promiseId), eq(backs.state, "active")));
      return rows;
    },
    async setPayable({ backId, state }) {
      await db.update(backs).set({ state, updatedAt: new Date() }).where(eq(backs.id, backId));
    },
  };
}

export function createVerificationRepository(db: DbOrTx): VerificationRepository {
  return {
    async create(record) {
      await db.insert(verifications).values({ id: record.id, proofSubmissionId: record.proofSubmissionId, reviewerUserId: record.reviewerUserId, decision: record.decision, note: record.note, createdAt: new Date(record.createdAt) });
    },
  };
}

export function createPaymentEventRepository(db: DbOrTx): PaymentEventRepository {
  return {
    async create(record) {
      await db.insert(paymentEvents).values({ id: record.id, backId: record.backId, type: record.type, provider: record.provider, amountMinor: record.amountMinor, currency: record.currency, payloadJson: record.payloadJson, createdAt: new Date(record.createdAt) });
    },
  };
}
