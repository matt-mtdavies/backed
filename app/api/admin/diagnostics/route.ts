// Temporary, unauthenticated diagnostic for the ADMIN_TOKEN mismatch reported
// live: pasting the correct value still 401s. Reveals only metadata about the
// configured secret (never the value itself) so it's safe to leave reachable
// without auth -- there's nothing here an attacker could use. Remove once the
// mismatch is confirmed and fixed; this isn't meant to be a permanent route.
export async function GET() {
  const configured = process.env.ADMIN_TOKEN;
  return Response.json({
    configured: Boolean(configured),
    length: configured?.length ?? null,
    hasLeadingOrTrailingWhitespace: configured ? configured !== configured.trim() : null,
  });
}
