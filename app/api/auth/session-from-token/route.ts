import { createSupabaseAuthClient } from "@/lib/auth/supabase-client";
import { establishSession } from "@/lib/auth/establish-session";

// Consumes the access token Supabase hands back in the URL fragment after
// the user clicks the confirmation link in their email — the fragment never
// reaches the server, so app/auth/callback/page.tsx reads it client-side and
// posts it here to actually establish the session cookie.
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return Response.json({ error: "Sign-in is not configured." }, { status: 500 });

  const { accessToken } = await request.json().catch(() => ({})) as { accessToken?: string };
  if (!accessToken) return Response.json({ error: "That link didn't work. Request a new one." }, { status: 422 });

  const authUser = await createSupabaseAuthClient(url, anonKey).getUser(accessToken);
  if (!authUser) return Response.json({ error: "That link didn't work. Request a new one." }, { status: 401 });

  const session = await establishSession(accessToken, authUser);
  if (!session) return Response.json({ error: "That link didn't work. Request a new one." }, { status: 401 });

  return Response.json({ userId: session.userId }, { status: 200, headers: { "set-cookie": session.setCookie } });
}
