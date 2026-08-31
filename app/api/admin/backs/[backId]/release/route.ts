import { AlphaMockPaymentProvider } from "@/lib/payments/provider";
import { BackNotReleasableError, releaseBacking } from "@/lib/releases/release-backing";
import { getDb } from "@/lib/db/client";
import { createBackingCommitmentReleaseRepository, createReleasableBackRepository, createReleasePaymentEventRepository } from "@/lib/db/release-backing-repositories";
import { isAuthorizedAdmin } from "@/lib/auth/admin";

export async function POST(request: Request, { params }: { params: Promise<{ backId: string }> }) {
  if (!isAuthorizedAdmin(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { backId } = await params;
    if (!process.env.DATABASE_URL) {
      const result = await releaseBacking(backId, {
        backs: { findPayableById: async () => ({ backId, state: "payable", amountMinor: 25000, currency: "USD", commitmentReference: `alpha_${backId}` }), setReleased: async () => {} },
        commitments: { markReleased: async () => {} },
        paymentEvents: { create: async () => {} },
        payments: new AlphaMockPaymentProvider(),
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      });
      return Response.json(result, { status: 200 });
    }

    const db = getDb();
    const result = await db.transaction((tx) =>
      releaseBacking(backId, {
        backs: createReleasableBackRepository(tx),
        commitments: createBackingCommitmentReleaseRepository(tx),
        paymentEvents: createReleasePaymentEventRepository(tx),
        payments: new AlphaMockPaymentProvider(),
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      })
    );
    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackNotReleasableError) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ error: "Backing could not be released." }, { status: 500 });
  }
}
