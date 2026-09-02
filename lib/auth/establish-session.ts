import type { SupabaseAuthUser } from "@/lib/auth/supabase-client";
import { syncUserForAuthId, type UserSyncRepository } from "@/lib/auth/sync-user";
import { buildSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { createUserSyncRepository } from "@/lib/db/auth-repositories";

const noopUserSyncRepository: UserSyncRepository = {
  findByAuthUserId: async () => null,
  findByEmail: async () => null,
  insert: async () => {},
  linkAuthUserId: async () => {},
  ensureProfile: async () => {},
};

// Shared by every route that ends up holding a verified Supabase access
// token (OTP-code entry, and the email-link callback) — syncs our own
// `users`/`profiles` rows and returns the Set-Cookie header value.
export async function establishSession(accessToken: string, user: SupabaseAuthUser): Promise<{ userId: string; setCookie: string } | null> {
  if (!user.email) return null;

  const { userId } = await syncUserForAuthId(
    { authUserId: user.id, email: user.email },
    {
      users: process.env.DATABASE_URL ? createUserSyncRepository(getDb()) : noopUserSyncRepository,
      id: () => crypto.randomUUID(),
    }
  );

  return { userId, setCookie: buildSessionCookie(accessToken) };
}
