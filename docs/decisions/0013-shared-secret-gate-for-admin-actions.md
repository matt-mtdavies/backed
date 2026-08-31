# ADR-0013: Gate admin actions behind a shared secret, not real auth

**Date:** 2026-08-31
**Status:** Accepted

## Context

The admin Proof-review and Release-backing routes added alongside ADR-0010–0012
(`/api/admin/proofs/[proofId]/approve`, `/api/admin/backs/[backId]/release`,
and their `/admin/proofs` / `/admin/releases` pages) shipped with **no
authentication or authorization at all**. Verified live: an unauthenticated
`curl -X POST` against either endpoint succeeded and mutated real state —
approving a Proof (completing a Promise, marking Backs payable, appending
`PaymentEvent` rows) and releasing a Back (the last, money-eligibility step
of the product's core loop) — with nothing but the URL. `robots: { index:
false }` on the admin pages keeps them out of search engines; it does
nothing to restrict access.

The Master Spec requires "Admin actions are authorized and audited"
(`AGENTS.md`, Domain discipline). There is no real auth/identity system yet
(see ADR-0005 — `backerName` is a free-text bridge, not a login), so a real
per-admin-identity authorization system is out of scope for this fix.
Leaving admin actions completely open on a live, publicly reachable Worker
in the meantime is not an acceptable gap to carry forward silently.

## Decision

Gate both admin API routes behind a single shared secret: an `ADMIN_TOKEN`
Worker secret, checked via a `x-admin-token` request header
(`lib/auth/admin.ts`, constant-time comparison). A request without a
matching header gets `401` before any domain logic runs. If `ADMIN_TOKEN`
isn't configured, every request is rejected — fail closed, not open.

The two admin pages (`AdminProofReview`, `AdminReleaseBacking`) share an
`AdminTokenGate` component: enter the token once, it's kept in
`sessionStorage` (not `localStorage` — cleared when the tab closes) and
attached to every admin `fetch` call from then on. This is a UX
convenience, not a security boundary in itself; the boundary is the server
checking the header on every request.

## Alternatives considered

- **Ship a real login/session system first.** Rejected for scope: no auth
  system exists anywhere in the app yet, and building one to gate two
  internal alpha routes would be solving a much bigger problem than the one
  at hand. Revisit when real user auth lands generally.
- **IP allowlist or Cloudflare Access in front of `/admin/*`.** A reasonable
  complementary control, but it's infrastructure configuration outside this
  repo (Cloudflare dashboard, not code) and doesn't protect the API routes
  if they're ever called from outside that perimeter. The in-app check
  stays necessary regardless; recorded here as a good addition, not a
  replacement.
- **Leave it open and just keep the URLs undocumented.** Rejected outright
  — "security through obscurity" on money-eligibility-changing endpoints on
  a live public Worker is exactly the gap this ADR exists to close.

## Consequences

`ADMIN_TOKEN` must be set as a Cloudflare Worker secret in production (and
in `.dev.vars` locally — see `.dev.vars.example`) or every admin action
will 401. This is intentionally not real authorization: it does not
identify *which* admin acted (the `reviewerUserId` passed into
`approveProof` is still the same hardcoded alpha placeholder ID as before),
so it does not yet satisfy "audited" in the Master Spec's fuller sense —
only "authorized" in a minimal way. When real auth exists, replace this
shared-secret check with per-admin identity and keep the audit trail
(`Verification.reviewerUserId`, `PaymentEvent` rows) pointed at the real
actor instead of the placeholder.
