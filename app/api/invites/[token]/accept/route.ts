import { acceptPromise, InvalidInviteError, InviteExpiredError } from "@/lib/promises/accept-promise";
import { getDb } from "@/lib/db/client";
import { createInviteLookupRepository, createPromiseAcceptanceRepository, createBackActivationRepository } from "@/lib/db/accept-promise-repositories";

const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const hash = async (value: string) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  void request;
  try {
    const { token } = await params;
    const db = getDb();
    const result = await db.transaction((tx) =>
      acceptPromise(token, {
        hash,
        invites: createInviteLookupRepository(tx),
        promises: createPromiseAcceptanceRepository(tx),
        backs: createBackActivationRepository(tx),
        capture: async () => {},
        now: () => new Date(),
      })
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof InviteExpiredError) return Response.json({ error: "This invite has expired." }, { status: 410 });
    if (error instanceof InvalidInviteError) return Response.json({ error: "This invite is invalid or has expired." }, { status: 404 });
    return Response.json({ error: "This invite is invalid or has expired." }, { status: 400 });
  }
}
