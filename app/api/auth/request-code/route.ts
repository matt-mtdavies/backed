import { createSupabaseAuthClient, SupabaseAuthError } from "@/lib/auth/supabase-client";

export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return Response.json({ error: "Sign-in is not configured." }, { status: 500 });

  const { email } = await request.json().catch(() => ({})) as { email?: string };
  if (!email || !email.includes("@")) return Response.json({ error: "Enter a valid email." }, { status: 422 });

  try {
    await createSupabaseAuthClient(url, anonKey).requestOtp(email);
    return Response.json({ sent: true }, { status: 200 });
  } catch (error) {
    if (error instanceof SupabaseAuthError) return Response.json({ error: error.message }, { status: 502 });
    return Response.json({ error: "We couldn't send a sign-in code. Try again." }, { status: 500 });
  }
}
