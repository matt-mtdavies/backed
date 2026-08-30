import { and, eq, isNull } from "drizzle-orm";
import { invites, promises, backs, profiles } from "@/db/schema";
import type { InviteLookupRepository, PromiseAcceptanceRepository, BackActivationRepository } from "@/lib/promises/accept-promise";
import type { InviteViewRepository } from "@/lib/invites/get-invite";
import type { DbOrTx } from "./tx";

export function createInviteLookupRepository(db: DbOrTx): InviteLookupRepository {
  return {
    async findActiveByTokenHash(tokenHash) {
      const [row] = await db
        .select({
          inviteId: invites.id,
          backId: invites.backId,
          promiseId: invites.promiseId,
          expiresAt: invites.expiresAt,
          acceptedAt: invites.acceptedAt,
          promiseState: promises.state,
          backState: backs.state,
        })
        .from(invites)
        .innerJoin(promises, eq(invites.promiseId, promises.id))
        .innerJoin(backs, eq(invites.backId, backs.id))
        .where(and(eq(invites.tokenHash, tokenHash), isNull(invites.revokedAt)))
        .limit(1);
      if (!row) return null;
      return {
        inviteId: row.inviteId,
        backId: row.backId,
        promiseId: row.promiseId,
        promiseState: row.promiseState,
        backState: row.backState,
        expiresAt: row.expiresAt.toISOString(),
        acceptedAt: row.acceptedAt?.toISOString() ?? null,
      };
    },
    async markAccepted(inviteId, acceptedAt) {
      await db.update(invites).set({ acceptedAt: new Date(acceptedAt) }).where(eq(invites.id, inviteId));
    },
  };
}

export function createPromiseAcceptanceRepository(db: DbOrTx): PromiseAcceptanceRepository {
  return {
    async setState({ promiseId, state, acceptedAt, activatedAt }) {
      await db.update(promises).set({ state, acceptedAt: new Date(acceptedAt), activatedAt: new Date(activatedAt), updatedAt: new Date() }).where(eq(promises.id, promiseId));
    },
  };
}

export function createBackActivationRepository(db: DbOrTx): BackActivationRepository {
  return {
    async setState({ backId, state }) {
      await db.update(backs).set({ state, updatedAt: new Date() }).where(eq(backs.id, backId));
    },
  };
}

export function createInviteViewRepository(db: DbOrTx): InviteViewRepository {
  return {
    async findByTokenHash(tokenHash) {
      const [row] = await db
        .select({
          achieverName: profiles.displayName,
          promiseSlug: promises.slug,
          promiseTitle: promises.title,
          deadline: promises.deadline,
          amountMinor: backs.amountMinor,
          currency: backs.currency,
          message: backs.message,
          backerName: backs.backerName,
          acceptedAt: invites.acceptedAt,
          expiresAt: invites.expiresAt,
          revokedAt: invites.revokedAt,
        })
        .from(invites)
        .innerJoin(promises, eq(invites.promiseId, promises.id))
        .innerJoin(backs, eq(invites.backId, backs.id))
        .innerJoin(profiles, eq(promises.achieverUserId, profiles.userId))
        .where(eq(invites.tokenHash, tokenHash))
        .limit(1);
      return row ?? null;
    },
  };
}
