# ADR-0002: Direct Postgres via `postgres.js` + Drizzle, not Supabase, for now

**Date:** 2026-08-30
**Status:** Accepted (partial divergence from `BACKED_MASTER_SPEC.md` §25.3 — see below)

## Context

`BACKED_MASTER_SPEC.md` §25.3 names Supabase (managed Postgres, Auth,
Storage) as the preferred data/auth platform. At the time persistence work
started, there was no auth system at all, no provisioned database, and the
immediate task was making the Back → Invite → Accept flow write to a real
database instead of an in-memory array. Supabase Auth specifically solves a
real, currently-missing problem (there is still no way to know who is
backing whom — see ADR-0005). But Supabase Auth on Cloudflare Workers is not
as turnkey as on Vercel/Node — its client and helpers lean Node-oriented —
and adopting it is a session-sized piece of work in its own right (session
handling at the edge, cookie storage, verifying it actually works under
`vinext dev`'s workerd runtime the way the rest of this stack has been
verified).

## Decision

For now, connect directly to Postgres with the `postgres` npm package
(`drizzle-orm/postgres-js`), reading `DATABASE_URL` from `process.env`
(populated by Workers' `nodejs_compat` from the Worker's own env bindings —
see `.dev.vars` locally, a Wrangler secret in production). No Supabase
client, no Supabase Auth, no Supabase Storage.

This is a deliberate, partial divergence from §25.3, not an oversight:
nothing about *not* using Supabase's managed Postgres blocks anything today,
since the database itself is just Postgres — pointing `DATABASE_URL` at a
Supabase-hosted instance later requires zero code changes. Supabase *Auth*
is the part of §25.3 with real, current value (see ADR-0005), and adopting
it is being treated as its own scoped decision rather than bundled into a
database migration that isn't actually needed.

## Alternatives considered

- **Adopt Supabase (Postgres + Auth + Storage) now, as the spec names it.**
  Rejected for this pass: would have coupled "get persistence working" to
  "stand up a new vendor relationship and verify auth-on-Workers," a much
  larger and riskier unit of work, without being asked to solve auth yet.
- **`pg` (node-postgres) instead of `postgres.js`.** `postgres.js` is the
  driver Cloudflare/Hyperdrive documentation and the Drizzle Workers guides
  point to, and it has an explicit `workerd`-conditional export
  (`cf/src/index.js`, using `cloudflare:sockets`) that resolves correctly
  under the Cloudflare Vite plugin's actual workerd runtime — confirmed
  working in this repo (see ADR-0003 for the bug this surfaced).

## Consequences

Adopting Supabase Auth later is still open and, per this project's own
constitution, probably the right move — see the recommendation in this
session's transcript. When that happens: keep the separate `profiles` table
(don't flatten it into `users` as the spec's abbreviated §18 data model
shows) — Supabase's managed `auth.users` table doesn't allow arbitrary
columns, so a separate profile table becomes *more* necessary with Supabase
Auth, not less. `BACKED_MASTER_SPEC.md` §18 and §20 are in tension on this
point; this repo's `users`/`profiles` split anticipates Supabase Auth being
adopted eventually, even though it isn't yet.
