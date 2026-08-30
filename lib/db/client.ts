import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Cloudflare Workers with nodejs_compat populates process.env from the
// Worker's own env bindings (wrangler secrets in production, .dev.vars locally).
//
// Deliberately not memoized: workerd forbids reusing a socket (or a promise
// tied to one) across different request contexts within the same isolate,
// so a module-level cached client throws "promise resolved in a different
// request context" on the second request. Create a fresh client per call —
// Hyperdrive (or any pooling proxy in front of DATABASE_URL) absorbs the cost.
export function getDb(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  const client = postgres(databaseUrl, { prepare: false });
  return drizzle(client, { schema });
}
