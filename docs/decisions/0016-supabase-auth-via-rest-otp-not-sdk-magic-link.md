# ADR-0016: Supabase Auth via plain REST + email OTP, not the SDK or a clickable magic-link

**Date:** 2026-09-02
**Status:** Accepted

## Context

ADR-0002 flagged adopting Supabase Auth as its own scoped decision and named
the real risk: "Supabase Auth on Cloudflare Workers is not as turnkey as on
Vercel/Node — its client and helpers lean Node-oriented." ADR-0005 built
`backerName` as an explicit, temporary bridge specifically because this
hadn't been built yet.

Building it this session hit an environment constraint worth recording: this
session's sandbox blocks all outbound network access to `supabase.co` at the
egress-policy level (a `403`/policy denial, not a transient failure — not
something to retry or route around). That means the actual magic-link
send-and-click round trip, and any live check of the project's configured
JWT signing behavior, cannot be verified from this session at all. The
deployed Cloudflare Worker (production, and every PR's preview deployment)
has ordinary internet access and is not affected — this is a constraint on
verifying the integration from here, not on the integration itself.

## Decision

1. **Plain REST calls (`fetch` against `/auth/v1/otp`, `/auth/v1/verify`,
   `/auth/v1/user`), not `@supabase/supabase-js`.** Sidesteps the
   Node-leaning-SDK risk ADR-0002 already named entirely — a `fetch`-only
   client behaves identically under workerd, needs no compatibility
   verification, and is trivial to fake behind an interface in tests
   (`SupabaseAuthClient` in `lib/auth/supabase-client.ts`).
2. **A 6-digit email OTP code, entered on our own page, not a clickable
   magic-link.** A link depends on the project's configured Site URL and
   redirect handling — exactly the kind of project-specific configuration
   this session cannot inspect or test live given the network block. The
   OTP-verify endpoint is a plain, documented request/response with no
   redirect-handling ambiguity. Revisit once a link flow can actually be
   click-tested against this project.
3. **Session verification round-trips to `/auth/v1/user`, rather than
   verifying a JWT's signature locally.** This works correctly regardless of
   which signing algorithm the project uses (this session could not check),
   needs no signing key or JWKS-caching logic in this app at all, and the
   extra network round trip is a page-load-frequency cost, not a
   per-domain-service one. `getUser` treats any failure — including the
   network being unreachable — as "not signed in" rather than throwing, so a
   flaky or temporarily-unreachable auth server degrades a page to logged-out
   instead of crashing it.
4. **`profiles` stays a separate table from `users`**, exactly as ADR-0002's
   Consequences section anticipated — Supabase's own `auth.users` table
   doesn't take arbitrary columns, so the split was already the right shape.
   `users.auth_user_id` (ADR before this one) links the two.

## Alternatives considered

- **`@supabase/supabase-js`.** More "supported," but adds a dependency this
  session cannot verify works under workerd, solving a problem (nicer
  ergonomics) that isn't the actual blocker.
- **Local JWT verification via JWKS.** More efficient once working (no
  per-check network round trip), but requires knowing the project's signing
  algorithm and correctly implementing key fetching/caching/rotation —
  real complexity to get right *unverified*. Revisit once this can be
  checked live against the real project; the `SupabaseAuthClient` interface
  this ADR establishes makes that swap a single new implementation, not a
  rewrite of anything that calls it.
- **Full magic-link (click, no code entry).** Better UX, matches
  `BACKED_MASTER_SPEC.md` §20's literal wording ("magic-link/email-friendly
  onboarding"). Deferred, not rejected — needs a live click-through this
  session cannot perform, and this project's redirect/Site-URL
  configuration cannot be inspected from here either.

## Consequences

The actual magic-link-email send-and-verify round trip has **not** been
verified live from this session — everything up to that boundary has (real
Postgres: user creation, linking an existing seeded row by email, the
account-hijack-prevention check that a second identity can't relink an
already-linked account; real rendering: the login form, its graceful
failure state, the `/me` redirect-when-signed-out). The live pass has to
happen against a PR's Cloudflare preview deployment, which does have real
internet access — request a code on the preview URL, check the email,
confirm sign-in actually lands on `/me`. That is not optional follow-up;
until it happens, this integration is unverified in the one way that
actually matters.

This PR only builds the sign-in primitive and one consuming page (`/me`).
No existing mutation route (`create-promise`, `create-back`, `submit-proof`,
etc.) has been touched — those still trust `backerName` as ADR-0005
describes. Migrating them to real sessions is separate, follow-up work, not
bundled in here.
