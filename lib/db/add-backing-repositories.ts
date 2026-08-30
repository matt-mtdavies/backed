import { eq } from "drizzle-orm";
import { promises } from "@/db/schema";
import type { PromiseLookupRepository } from "@/lib/backs/add-backing";
import type { DbOrTx } from "./tx";

export function createPromiseLookupRepository(db: DbOrTx): PromiseLookupRepository {
  return {
    async findBackableBySlug(slug) {
      const [row] = await db
        .select({ id: promises.id, achieverUserId: promises.achieverUserId, state: promises.state })
        .from(promises)
        .where(eq(promises.slug, slug))
        .limit(1);
      return row ?? null;
    },
  };
}
