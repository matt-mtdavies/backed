import { demoPromise } from "@/lib/demo";
import { submitProof, ProofSubmissionValidationError } from "@/lib/proofs/submit-proof";
import { getDb } from "@/lib/db/client";
import { createPromiseLookupRepository } from "@/lib/db/promise-lookup-repositories";
import { createProofPromiseRepository, createProofSubmissionRepository } from "@/lib/db/submit-proof-repositories";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = (await request.json()) as { proofUrl?: string; resultUrl?: string; note?: string };

  try {
    if (slug === demoPromise.slug) {
      const result = await submitProof(
        { promiseId: demoPromise.slug, promiseState: "active", submittedBy: "alpha-jason", proofUrl: body.proofUrl, resultUrl: body.resultUrl, note: body.note },
        {
          proofs: { create: async () => {} },
          promises: { setProofPending: async () => {} },
          capture: async () => {},
          id: () => crypto.randomUUID(),
          now: () => new Date(),
        },
      );
      return Response.json(result, { status: 201 });
    }

    if (!process.env.DATABASE_URL) return Response.json({ error: "This Promise could not be found." }, { status: 404 });

    const db = getDb();
    const promise = await createPromiseLookupRepository(db).findBySlug(slug);
    if (!promise) return Response.json({ error: "This Promise could not be found." }, { status: 404 });

    const result = await db.transaction((tx) =>
      submitProof(
        { promiseId: promise.id, promiseState: promise.state, submittedBy: promise.achieverUserId, proofUrl: body.proofUrl, resultUrl: body.resultUrl, note: body.note },
        {
          proofs: createProofSubmissionRepository(tx),
          promises: createProofPromiseRepository(tx),
          capture: async () => {},
          id: () => crypto.randomUUID(),
          now: () => new Date(),
        },
      )
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ProofSubmissionValidationError) return Response.json({ error: error.message }, { status: 422 });
    return Response.json({ error: "We could not submit proof. Try again." }, { status: 400 });
  }
}
