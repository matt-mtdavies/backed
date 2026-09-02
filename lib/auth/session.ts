const COOKIE_NAME = "backed_session";
// Supabase access tokens are short-lived (1 hour by default); this cookie's
// own lifetime just bounds how long a stale, expired token sits in the
// browser. Signing back in is the whole flow for now — refresh-token
// rotation is a deliberate fast-follow, not implemented here yet.
const MAX_AGE_SECONDS = 60 * 60;

export function buildSessionCookie(accessToken: string): string {
  return `${COOKIE_NAME}=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function buildClearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === COOKIE_NAME) return rest.join("=") || null;
  }
  return null;
}
