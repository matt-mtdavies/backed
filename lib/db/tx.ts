import type { Database } from "./client";

// The query-builder surface (select/insert/update) that both a top-level
// Database and a transaction callback's `tx` handle share.
export type DbOrTx = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];
