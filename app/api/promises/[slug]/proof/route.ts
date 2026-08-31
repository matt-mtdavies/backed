import { demoPromise } from "@/lib/demo";
import { submitProof, ProofSubmissionValidationError } from "@/lib/proofs/submit-proof";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = (await request.json()) as { proofUrl?: string; resultUrl?: string; note?: string };

  if (slug !== demoPromise.slug) return Response.json({ error: "This Promise could not be found." }, { status: 404 });

  try {
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
  } catch (error) {
    if (error instanceof ProofSubmissionValidationError) return Response.json({ error: error.message }, { status: 422 });
    return Response.json({ error: "We could not submit proof. Try again." }, { status: 400 });
  }
}
