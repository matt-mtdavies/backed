import { createPromise, CreatePromiseValidationError, type CreatePromiseInput } from "@/lib/promises/create-promise";
import { getDb } from "@/lib/db/client";
import { createPromiseRepository, createUserRepository } from "@/lib/db/create-back-repositories";

export async function POST(request: Request) {
  try {
    const input = await request.json() as CreatePromiseInput;
    if (!process.env.DATABASE_URL) {
      const result = await createPromise(input, {
        users: { findByContact: async () => null, insert: async () => {} },
        promises: { insert: async () => {} },
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      });
      return Response.json(result, { status: 201 });
    }
    const db = getDb();
    const result = await db.transaction((tx) =>
      createPromise(input, {
        users: createUserRepository(tx),
        promises: createPromiseRepository(tx),
        capture: async () => {},
        id: () => crypto.randomUUID(),
        now: () => new Date(),
      })
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreatePromiseValidationError) return Response.json({ errors: error.errors }, { status: 422 });
    return Response.json({ error: "We could not create your Promise. Try again." }, { status: 500 });
  }
}
