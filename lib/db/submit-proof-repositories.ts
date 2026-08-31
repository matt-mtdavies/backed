import { eq } from "drizzle-orm";
import { proofSubmissions, promises } from "@/db/schema";
import type { ProofPromiseRepository, ProofSubmissionRepository } from "@/lib/proofs/submit-proof";
import type { DbOrTx } from "./tx";

export function createProofSubmissionRepository(db: DbOrTx): ProofSubmissionRepository {
  return {
    async create(record) {
      await db.insert(proofSubmissions).values({
        id: record.id,
        promiseId: record.promiseId,
        submittedBy: record.submittedBy,
        proofUrl: record.proofUrl,
        resultUrl: record.resultUrl,
        note: record.note,
        state: record.state,
      });
    },
  };
}

export function createProofPromiseRepository(db: DbOrTx): ProofPromiseRepository {
  return {
    async setProofPending({ promiseId, proofSubmittedAt, state }) {
      await db.update(promises).set({ state, proofSubmittedAt: new Date(proofSubmittedAt), updatedAt: new Date() }).where(eq(promises.id, promiseId));
    },
  };
}
