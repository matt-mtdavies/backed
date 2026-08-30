import { createBack, type BackRecord, type InviteRecord } from "@/lib/backs/create-back";
import type { CreateBackInput } from "@/lib/backs/model";
import { AlphaMockPaymentProvider } from "@/lib/payments/provider";
import { CreateBackValidationError } from "@/lib/validation/create-back";

const backs: BackRecord[] = [];
const invites: InviteRecord[] = [];
const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

export async function POST(request: Request) {
  try {
    const input = await request.json() as CreateBackInput;
    const result = await createBack(input, {
      backs: { insert: async (record) => { backs.push(record); } },
      invites: { insert: async (record) => { invites.push(record); } },
      payments: new AlphaMockPaymentProvider(),
      analytics: { capture: async () => {} },
      id: () => crypto.randomUUID(),
      token: () => `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", ""),
      hash: async (value) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value))),
      now: () => new Date(),
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreateBackValidationError) return Response.json({ errors: error.errors }, { status: 422 });
    return Response.json({ error: "We couldn’t create this Back. Try again." }, { status: 500 });
  }
}
