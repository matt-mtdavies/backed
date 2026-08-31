import { eq } from "drizzle-orm";
import { promises } from "@/db/schema";
import type { PromiseState } from "@/lib/state-machines/promise";
import type { DbOrTx } from "./tx";

export type PromiseLookup = { id: string; state: PromiseState; achieverUserId: string };

export interface PromiseLookupRepository {
  findBySlug(slug: string): Promise<PromiseLookup | null>;
}

export function createPromiseLookupRepository(db: DbOrTx): PromiseLookupRepository {
  return {
    async findBySlug(slug) {
      const [row] = await db
        .select({ id: promises.id, state: promises.state, achieverUserId: promises.achieverUserId })
        .from(promises)
        .where(eq(promises.slug, slug))
        .limit(1);
      return row ?? null;
    },
  };
}
