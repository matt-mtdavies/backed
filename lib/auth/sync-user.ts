export interface UserSyncRepository {
  findByAuthUserId(authUserId: string): Promise<{ id: string } | null>;
  findByEmail(email: string): Promise<{ id: string; authUserId: string | null } | null>;
  insert(input: { id: string; authUserId: string; email: string }): Promise<void>;
  linkAuthUserId(userId: string, authUserId: string): Promise<void>;
  ensureProfile(input: { userId: string; displayName: string; slug: string }): Promise<void>;
}

export function buildProfileSlug(email: string, userId: string): string {
  const base = email.split("@")[0]!.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "member";
  return `${base}-${userId.replace(/-/g, "").slice(0, 8)}`;
}

// Finds the users row for an already-verified Supabase identity, or creates
// one. A users row can pre-exist without a linked identity (seed data, or
// anyone created through a flow that predates auth — see ADR-0005) — that
// gets linked in place rather than duplicated.
export async function syncUserForAuthId(
  input: { authUserId: string; email: string },
  deps: { users: UserSyncRepository; id: () => string }
): Promise<{ userId: string }> {
  const existing = await deps.users.findByAuthUserId(input.authUserId);
  if (existing) return { userId: existing.id };

  const byEmail = await deps.users.findByEmail(input.email);
  if (byEmail) {
    if (!byEmail.authUserId) await deps.users.linkAuthUserId(byEmail.id, input.authUserId);
    return { userId: byEmail.id };
  }

  const userId = deps.id();
  await deps.users.insert({ id: userId, authUserId: input.authUserId, email: input.email });
  await deps.users.ensureProfile({
    userId,
    displayName: input.email.split("@")[0]!,
    slug: buildProfileSlug(input.email, userId),
  });
  return { userId };
}
