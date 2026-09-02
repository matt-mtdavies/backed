// Talks to Supabase Auth over its plain REST API, not the `@supabase/supabase-js`
// SDK — deliberately, per ADR-0016: the SDK's helpers lean Node-oriented (see
// ADR-0002's own flagged concern), and a `fetch`-only client works identically
// under workerd, is trivial to fake in tests, and has no compatibility surface
// to verify. See ADR-0016 for why this uses an OTP code rather than a
// clickable magic-link, and why session verification round-trips to Supabase
// rather than checking a JWT signature locally.
export type SupabaseAuthUser = { id: string; email: string | null };

export interface SupabaseAuthClient {
  requestOtp(email: string, redirectTo?: string): Promise<void>;
  verifyOtp(email: string, token: string): Promise<{ accessToken: string; user: SupabaseAuthUser }>;
  getUser(accessToken: string): Promise<SupabaseAuthUser | null>;
}

export class SupabaseAuthError extends Error {}

export function createSupabaseAuthClient(url: string, anonKey: string): SupabaseAuthClient {
  const base = url.replace(/\/+$/, "");

  return {
    // `redirectTo` matters even though the code-entry flow never follows a
    // link itself: Supabase's default email template can't be edited to
    // surface `{{ .Token }}` without custom SMTP configured on the project
    // (a real, hit-in-production constraint — see ADR-0016), so the
    // clickable link in the email is the only way in until that's set up.
    // That link only lands somewhere useful if this is an allow-listed
    // Redirect URL in the Supabase dashboard.
    async requestOtp(email, redirectTo) {
      const res = await fetch(`${base}/auth/v1/otp`, {
        method: "POST",
        headers: { apikey: anonKey, "content-type": "application/json" },
        body: JSON.stringify({ email, create_user: true, ...(redirectTo ? { redirect_to: redirectTo } : {}) }),
      });
      if (!res.ok) throw new SupabaseAuthError("We couldn't send a sign-in code. Try again.");
    },

    async verifyOtp(email, token) {
      const res = await fetch(`${base}/auth/v1/verify`, {
        method: "POST",
        headers: { apikey: anonKey, "content-type": "application/json" },
        body: JSON.stringify({ email, token, type: "email" }),
      });
      if (!res.ok) throw new SupabaseAuthError("That code didn't work. Check it and try again.");
      const data = await res.json() as { access_token: string; user: { id: string; email: string | null } };
      return { accessToken: data.access_token, user: { id: data.user.id, email: data.user.email } };
    },

    async getUser(accessToken) {
      // Checked on every page load for a logged-in user, not just on an
      // explicit sign-in action — an unreachable auth server degrades to
      // "not signed in" here rather than crashing the page.
      try {
        const res = await fetch(`${base}/auth/v1/user`, {
          headers: { apikey: anonKey, authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return null;
        const data = await res.json() as { id: string; email: string | null };
        return { id: data.id, email: data.email };
      } catch {
        return null;
      }
    },
  };
}
