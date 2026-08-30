import { eq, or, sql } from "drizzle-orm";
import { users, profiles, promises, backs, invites } from "@/db/schema";
import type { UserRepository, PromiseRepository, BackRepository, InviteRepository } from "@/lib/backs/create-back";
import type { DbOrTx } from "./tx";

export function createUserRepository(db: DbOrTx): UserRepository {
  return {
    async findByContact(contact) {
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(or(eq(sql`lower(${users.email})`, contact.toLowerCase()), eq(users.phone, contact)))
        .limit(1);
      return row ?? null;
    },
    async insert(record) {
      await db.insert(users).values({ id: record.id, email: record.email, phone: record.phone });
      await db.insert(profiles).values({ userId: record.id, firstName: record.firstName, lastName: record.lastName, displayName: record.displayName });
    },
  };
}

export function createPromiseRepository(db: DbOrTx): PromiseRepository {
  return {
    async insert(record) {
      await db.insert(promises).values({
        id: record.id,
        ownerUserId: record.ownerUserId,
        creatorUserId: record.creatorUserId,
        title: record.title,
        category: record.category,
        templateKey: record.templateKey,
        deadline: new Date(record.deadline),
        successCriteria: record.successCriteria,
        verificationMethod: record.verificationMethod,
        slug: record.slug,
        state: record.state,
      });
    },
  };
}

export function createBackRepository(db: DbOrTx): BackRepository {
  return {
    async insert(record) {
      await db.insert(backs).values({
        id: record.id,
        promiseId: record.promiseId,
        backerUserId: record.backerUserId,
        recipientUserId: record.recipientUserId,
        amountMinor: record.amountMinor,
        currency: record.currency,
        message: record.message,
        state: record.state,
      });
    },
  };
}

export function createInviteWriteRepository(db: DbOrTx): InviteRepository {
  return {
    async insert(record) {
      await db.insert(invites).values({
        id: record.id,
        backId: record.backId,
        promiseId: record.promiseId,
        tokenHash: record.tokenHash,
        expiresAt: new Date(record.expiresAt),
      });
    },
  };
}
