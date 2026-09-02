import { buildClearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  return Response.json({ ok: true }, { status: 200, headers: { "set-cookie": buildClearSessionCookie() } });
}
