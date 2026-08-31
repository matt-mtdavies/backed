// Alpha has no real auth system yet (see ADR-0005), but admin actions here
// change money-eligibility state (proof approval, backing release) and the
// Master Spec requires admin actions to be authorized. This is a minimal,
// Alpha-appropriate gate: a single shared secret, not real per-admin
// identity or RBAC. See ADR-0013.
export const ADMIN_TOKEN_HEADER = "x-admin-token";

export function isAuthorizedAdmin(request: Request): boolean {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) return false;
  const provided = request.headers.get(ADMIN_TOKEN_HEADER);
  if (!provided) return false;
  return timingSafeEqual(configured, provided);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
