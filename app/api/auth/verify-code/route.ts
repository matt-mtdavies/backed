import { createSupabaseAuthClient, SupabaseAuthError } from "@/lib/auth/supabase-client";
import { syncUserForAuthId } from "@/lib/auth/sync-user";
import { buildSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { createUserSyncRepository } from "@/lib/db/auth-repositories";

export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return Response.json({ error: "Sign-in is not configured." }, { status: 500 });

  const { email, code } = await request.json().catch(() => ({})) as { email?: string; code?: string };
  if (!email || !code) return Response.json({ error: "Enter the code from your email." }, { status: 422 });

  try {
    const { accessToken, user } = await createSupabaseAuthClient(url, anonKey).verifyOtp(email, code);
    if (!user.email) return Response.json({ error: "That code didn't work. Check it and try again." }, { status: 401 });

    const { userId } = process.env.DATABASE_URL
      ? await syncUserForAuthId({ authUserId: user.id, email: user.email }, { users: createUserSyncRepository(getDb()), id: () => crypto.randomUUID() })
      : await syncUserForAuthId({ authUserId: user.id, email: user.email }, {
          users: {
            findByAuthUserId: async () => null,
            findByEmail: async () => null,
            insert: async () => {},
            linkAuthUserId: async () => {},
            ensureProfile: async () => {},
          },
          id: () => crypto.randomUUID(),
        });

    return Response.json({ userId }, { status: 200, headers: { "set-cookie": buildSessionCookie(accessToken) } });
  } catch (error) {
    if (error instanceof SupabaseAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: "That code didn't work. Check it and try again." }, { status: 500 });
  }
}
