import { and, asc, eq, inArray } from "drizzle-orm";
import { promises, backs, profiles } from "@/db/schema";
import type { PromiseViewRepository } from "@/lib/promises/get-promise";
import type { DbOrTx } from "./tx";

const VISIBLE_BACK_STATES = ["active", "payable", "released"] as const;

export function createPromiseViewRepository(db: DbOrTx): PromiseViewRepository {
  return {
    async findHeaderBySlug(slug) {
      const [row] = await db
        .select({
          achieverName: profiles.displayName,
          title: promises.title,
          deadline: promises.deadline,
          targetValue: promises.targetValue,
          targetUnit: promises.targetUnit,
          state: promises.state,
        })
        .from(promises)
        .innerJoin(profiles, eq(promises.achieverUserId, profiles.userId))
        .where(eq(promises.slug, slug))
        .limit(1);
      return row ?? null;
    },
    async listVisibleBackersBySlug(slug) {
      return db
        .select({
          backerName: backs.backerName,
          amountMinor: backs.amountMinor,
          currency: backs.currency,
          message: backs.message,
          createdAt: backs.createdAt,
          state: backs.state,
        })
        .from(backs)
        .innerJoin(promises, eq(backs.promiseId, promises.id))
        .where(and(eq(promises.slug, slug), inArray(backs.state, VISIBLE_BACK_STATES)))
        .orderBy(asc(backs.createdAt));
    },
  };
}
