import { eq, or, sql } from "drizzle-orm";
import { users, profiles, promises, backs, invites, backingCommitments } from "@/db/schema";
import type { UserRepository, PromiseRepository, BackRepository, InviteRepository, CommitmentRepository } from "@/lib/backs/create-back";
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
        achieverUserId: record.achieverUserId,
        createdByUserId: record.createdByUserId,
        title: record.title,
        category: record.category,
        templateKey: record.templateKey,
        targetType: record.targetType,
        targetValue: record.targetValue,
        targetUnit: record.targetUnit,
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
        backerName: record.backerName,
        achieverUserId: record.achieverUserId,
        amountMinor: record.amountMinor,
        currency: record.currency,
        message: record.message,
        state: record.state,
      });
    },
  };
}

export function createCommitmentRepository(db: DbOrTx): CommitmentRepository {
  return {
    async insert(record) {
      await db.insert(backingCommitments).values({
        backId: record.backId,
        provider: record.provider,
        providerCustomerRef: record.providerCustomerRef,
        commitmentState: record.commitmentState,
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
