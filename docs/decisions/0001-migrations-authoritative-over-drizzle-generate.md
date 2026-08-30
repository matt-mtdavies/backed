# ADR-0001: Hand-written SQL migrations are authoritative, not `drizzle-kit generate`

**Date:** 2026-08-30
**Status:** Accepted

## Context

`db/migrations/0001_alpha_foundation.sql` was hand-written during the initial
bootstrap and already covers six tables plus CHECK constraints and a partial
unique index (`lower(email) WHERE email IS NOT NULL`). `db/schema.ts`
(Drizzle) only declared those same six tables when persistence work began,
and there is no `db/migrations/meta/_journal.json` for `drizzle-kit generate`
to diff against. Running `drizzle-kit generate` in that state would not
extend the hand-written migration — it would emit a fresh `0000_*.sql`
covering only what `schema.ts` declares, silently dropping the CHECK
constraints, the partial index, and any table `schema.ts` doesn't happen to
mirror. The two sources of truth had already diverged at the first commit.

## Decision

Hand-written SQL in `db/migrations/` is authoritative. `db/schema.ts` is a
manually kept-in-sync typed mirror for Drizzle's query builder, not a
generator input. `drizzle-kit generate` is not used. This is stated as a
comment at the top of `schema.ts` itself, not just here.

New migrations are added as new numbered `.sql` files
(`0002_invites.sql`, etc.), written by hand, with `schema.ts` updated to
match in the same change.

## Alternatives considered

- **Make Drizzle authoritative, regenerate with a journal.** Would require
  reconstructing a journal that matches the already-hand-written 0001, and
  hand-authored CHECK constraints / partial indexes aren't things
  `drizzle-kit generate` produces from the TypeScript schema alone — they'd
  need `.sql` custom migrations bolted on regardless. Doesn't remove the dual
  source of truth, just relocates it.
- **Drop Drizzle, use raw SQL only.** Loses the typed query builder used
  throughout `lib/db/*-repositories.ts`, which is worth keeping for
  correctness (catches renamed/missing columns at compile time).

## Consequences

Never run `npm run db:generate` expecting it to extend the existing
migrations — it will not see them. A schema change means: write the `.sql`
migration by hand, then update `schema.ts` to match, in the same commit.
`db:generate`/`drizzle-kit` stay in `package.json`/`devDependencies` for now
but are not part of the actual migration workflow; `npm run db:migrate`
(`scripts/migrate.mjs`) applies the hand-written files directly.
