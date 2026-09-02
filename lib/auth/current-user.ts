import type { SupabaseAuthClient } from "@/lib/auth/supabase-client";

export type CurrentUser = { userId: string; email: string | null; displayName: string; slug: string | null };

export interface CurrentUserRepository {
  findByAuthUserId(authUserId: string): Promise<{ id: string; displayName: string; slug: string | null } | null>;
}

// Takes the raw session token, not a Request — a Route Handler reads one via
// readSessionToken(request), a Server Component via next/headers's cookies(),
// and this stays usable from either without depending on the request shape.
//
// Verifies it by round-tripping to Supabase rather than checking a JWT
// signature locally — see ADR-0016 for why: it's correct regardless of the
// project's signing algorithm, needs no key material in this app at all, and
// this call happens once per page render, not per domain-service invocation.
export async function getCurrentUser(
  token: string | null,
  deps: { auth: SupabaseAuthClient; users: CurrentUserRepository }
): Promise<CurrentUser | null> {
  if (!token) return null;

  const authUser = await deps.auth.getUser(token);
  if (!authUser) return null;

  const user = await deps.users.findByAuthUserId(authUser.id);
  if (!user) return null;

  return { userId: user.id, email: authUser.email, displayName: user.displayName, slug: user.slug };
}
