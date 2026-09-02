import { eq, sql } from "drizzle-orm";
import { users, profiles } from "@/db/schema";
import type { UserSyncRepository } from "@/lib/auth/sync-user";
import type { CurrentUserRepository } from "@/lib/auth/current-user";
import type { DbOrTx } from "./tx";

export function createUserSyncRepository(db: DbOrTx): UserSyncRepository {
  return {
    async findByAuthUserId(authUserId) {
      const [row] = await db.select({ id: users.id }).from(users).where(eq(users.authUserId, authUserId)).limit(1);
      return row ?? null;
    },
    async findByEmail(email) {
      const [row] = await db
        .select({ id: users.id, authUserId: users.authUserId })
        .from(users)
        .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
        .limit(1);
      return row ?? null;
    },
    async insert(input) {
      await db.insert(users).values({ id: input.id, email: input.email, authUserId: input.authUserId });
    },
    async linkAuthUserId(userId, authUserId) {
      await db.update(users).set({ authUserId }).where(eq(users.id, userId));
    },
    async ensureProfile(input) {
      await db.insert(profiles).values({ userId: input.userId, firstName: input.displayName, displayName: input.displayName, slug: input.slug }).onConflictDoNothing();
    },
  };
}

export function createCurrentUserRepository(db: DbOrTx): CurrentUserRepository {
  return {
    async findByAuthUserId(authUserId) {
      const [row] = await db
        .select({ id: users.id, displayName: profiles.displayName, slug: profiles.slug })
        .from(users)
        .innerJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.authUserId, authUserId))
        .limit(1);
      return row ?? null;
    },
  };
}
