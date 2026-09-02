import { createSupabaseAuthClient, SupabaseAuthError } from "@/lib/auth/supabase-client";
import { establishSession } from "@/lib/auth/establish-session";

export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return Response.json({ error: "Sign-in is not configured." }, { status: 500 });

  const { email, code } = await request.json().catch(() => ({})) as { email?: string; code?: string };
  if (!email || !code) return Response.json({ error: "Enter the code from your email." }, { status: 422 });

  try {
    const { accessToken, user } = await createSupabaseAuthClient(url, anonKey).verifyOtp(email, code);
    const session = await establishSession(accessToken, user);
    if (!session) return Response.json({ error: "That code didn't work. Check it and try again." }, { status: 401 });

    return Response.json({ userId: session.userId }, { status: 200, headers: { "set-cookie": session.setCookie } });
  } catch (error) {
    if (error instanceof SupabaseAuthError) return Response.json({ error: error.message }, { status: 401 });
    return Response.json({ error: "That code didn't work. Check it and try again." }, { status: 500 });
  }
}
