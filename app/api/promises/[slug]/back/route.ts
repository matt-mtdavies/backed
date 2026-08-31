import { addBacking, PromiseNotFoundError, PromiseNotBackableError } from "@/lib/backs/add-backing";
import type { AddBackingInput } from "@/lib/backs/model";
import { AddBackingValidationError } from "@/lib/validation/add-backing";
import { AlphaMockPaymentProvider } from "@/lib/payments/provider";
import { getDb } from "@/lib/db/client";
import { createPromiseLookupRepository } from "@/lib/db/add-backing-repositories";
import { createBackRepository, createCommitmentRepository } from "@/lib/db/create-back-repositories";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const input = await request.json() as AddBackingInput;
    const db = getDb();
    const result = await db.transaction((tx) =>
      addBacking(slug, input, {
        promises: createPromiseLookupRepository(tx),
        backs: createBackRepository(tx),
        commitments: createCommitmentRepository(tx),
        payments: new AlphaMockPaymentProvider(),
        analytics: { capture: async () => {} },
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      })
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AddBackingValidationError) return Response.json({ errors: error.errors }, { status: 422 });
    if (error instanceof PromiseNotFoundError) return Response.json({ error: "This Promise couldn’t be found." }, { status: 404 });
    if (error instanceof PromiseNotBackableError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: "We couldn’t add your backing. Try again." }, { status: 500 });
  }
}
