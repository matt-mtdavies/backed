// Applies each db/migrations/*.sql file once, in order. Not idempotent and untracked —
// re-running against a database that already has these objects will fail on the first
// CREATE. Intended for bootstrapping a fresh database, not repeat deploys.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const migrationsDir = path.join(import.meta.dirname, "..", "db", "migrations");
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

const sql = postgres(databaseUrl, { max: 1 });
try {
  for (const file of files) {
    console.log(`Applying ${file}`);
    const statement = await readFile(path.join(migrationsDir, file), "utf8");
    await sql.unsafe(statement);
  }
  console.log(`Applied ${files.length} migration file(s).`);
} finally {
  await sql.end();
}
