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
2. **A 6-digit email OTP code, entered on our own page — plus a clickable
   magic-link as a fallback, since the code alone turned out not to be
   enough.** Originally this shipped as code-only, deferring the link (see
   "Alternatives considered" below, kept for the record). Live testing
   against the real project surfaced why that wasn't optional: Supabase's
   default email templates (used automatically whenever a project hasn't
   configured its own custom SMTP sender) cannot be edited at all —
   the dashboard's template editor is read-only until custom SMTP is set
   up — and the default "Confirm signup"/"Magic Link" templates don't
   include `{{ .Token }}`, only the link. A closed alpha isn't going to
   require every tester to set up SMTP first, so the link has to work.
   `requestOtp` now accepts an optional `redirect_to`, `/api/auth/request-code`
   points it at `${origin}/auth/callback`, and that route (`AuthCallback`,
   a client component — the token arrives in the URL fragment, which never
   reaches the server) posts the token to `/api/auth/session-from-token` to
   establish the same session cookie the code-entry path builds. Both paths
   now share `lib/auth/establish-session.ts`. The code-entry UI stays as
   the primary flow (still faster when a project's template *is* customized
   to show the code); the link is what actually works today, out of the box,
   against this project's real, live configuration.
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
- **Full magic-link (click, no code entry) as the *only* flow, dropping
  code entry entirely.** Matches `BACKED_MASTER_SPEC.md` §20's literal
  wording ("magic-link/email-friendly onboarding") most directly. Not
  taken — code entry stays valuable as the faster path once a project's
  email templates are customized (custom SMTP), and keeping both means
  neither path is a single point of failure against a dashboard setting
  this codebase can't see or control.

## Consequences

The actual send-and-verify round trip has **not** been verified live from
this session for either path — this session's sandbox cannot reach
`supabase.co` at all. Everything up to that boundary has been verified for
real, for both paths: real Postgres (user creation, linking an existing
seeded row by email, the account-hijack-prevention check that a second
identity can't relink an already-linked account, all shared now through
`establishSession`); real rendering against a real `vinext build` +
`vinext start` production server per ADR-0009, not just `vinext dev`
(the login form and its graceful failure state, the `/auth/callback` page's
three real states — no token, an `error_description` from an
expired/invalid link, and a token that fails verification — each checked
with a real page load, not a mocked component); the `/api/auth/*` routes
each hit their real Supabase-network boundary and degrade to a clean error
response rather than crashing, exactly like the rest of this integration.

One more live-only finding, since this REST API isn't fully documented for
every field placement: GoTrue's `/auth/v1/otp` reads `redirect_to` as a URL
**query parameter**, not a JSON body field — putting it in the body (the
first attempt) is silently ignored, and GoTrue falls back to the project's
Site URL every time, indistinguishable from a Redirect-URL allow-list
problem until you've ruled that out. `createSupabaseAuthClient` sends it as
`?redirect_to=` now.

What is now confirmed, live, against the real project: the code-entry path
is genuinely blocked for a brand-new project on Supabase's shared/default
email sender — its "Confirm signup" template is not editable without
custom SMTP configured, and doesn't include `{{ .Token }}`. The link path
added in this same change doesn't have that dependency; it only needs the
project's Site URL / Redirect URLs allow-list to include this app's origin,
which is ordinary Supabase dashboard configuration, not a template edit.
The actual click-the-link-and-land-on-`/me` round trip still has to happen
against a PR's Cloudflare preview deployment, which does have real internet
access. That is not optional follow-up; until it happens, this integration
is unverified in the one way that actually matters.

This PR only builds the sign-in primitive and one consuming page (`/me`).
No existing mutation route (`create-promise`, `create-back`, `submit-proof`,
etc.) has been touched — those still trust `backerName` as ADR-0005
describes. Migrating them to real sessions is separate, follow-up work, not
bundled in here.
