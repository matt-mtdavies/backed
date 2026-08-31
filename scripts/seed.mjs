// Loads db/seed.sql into DATABASE_URL. Not idempotent -- intended for a
// freshly migrated database (CI, or local dev bootstrap). Re-running against
// already-seeded data will fail on the first duplicate-key INSERT.
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const seedFile = path.join(import.meta.dirname, "..", "db", "seed.sql");
const sql = postgres(databaseUrl, { max: 1 });
try {
  const statement = await readFile(seedFile, "utf8");
  await sql.unsafe(statement);
  console.log("Applied db/seed.sql.");
} finally {
  await sql.end();
}
