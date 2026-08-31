import { approveProof, ProofNotFoundError, ProofNotReviewableError } from "@/lib/proofs/review-proof";
import { getDb } from "@/lib/db/client";
import { createBackPayableRepository, createPaymentEventRepository, createProofReviewLookupRepository, createPromiseCompletionRepository, createVerificationRepository } from "@/lib/db/review-proof-repositories";

export async function POST(request: Request, { params }: { params: Promise<{ proofId: string }> }) {
  try {
    const { proofId } = await params;
    const body = await request.json().catch(() => ({})) as { note?: string };
    if (!process.env.DATABASE_URL) {
      const result = await approveProof(proofId, { reviewerUserId: "00000000-0000-4000-8000-000000000002", note: body.note }, {
        proofs: { findPendingById: async () => ({ proofId, promiseId: "10000000-0000-4000-8000-000000000001", promiseState: "proof_pending" }), markReviewed: async () => {} },
        promises: { setVerified: async () => {}, setCompleted: async () => {} },
        backs: { listActiveByPromiseId: async () => [{ backId: "20000000-0000-4000-8000-000000000001", state: "active", amountMinor: 25000, currency: "USD" }], setPayable: async () => {} },
        verifications: { create: async () => {} },
        paymentEvents: { create: async () => {} },
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      });
      return Response.json(result, { status: 200 });
    }
    const db = getDb();
    const result = await db.transaction((tx) =>
      approveProof(proofId, { reviewerUserId: "00000000-0000-4000-8000-000000000002", note: body.note }, {
        proofs: createProofReviewLookupRepository(tx),
        promises: createPromiseCompletionRepository(tx),
        backs: createBackPayableRepository(tx),
        verifications: createVerificationRepository(tx),
        paymentEvents: createPaymentEventRepository(tx),
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      })
    );
    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ProofNotFoundError) return Response.json({ error: "Proof not found." }, { status: 404 });
    if (error instanceof ProofNotReviewableError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: "Proof could not be approved." }, { status: 500 });
  }
}
