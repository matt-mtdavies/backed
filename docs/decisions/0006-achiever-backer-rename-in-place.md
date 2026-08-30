# ADR-0006: Achiever/Backer terminology rename, applied in-place to migrations 0001–0002

**Date:** 2026-08-30
**Status:** Accepted

## Context

`BACKED_MASTER_SPEC.md` §2 defines canonical role names — **Achiever** (the
person attempting a Promise) and **Backer** (the person backing them) — and
§18's data model uses `achiever_user_id`, `created_by_user_id`. The existing
schema instead used `owner_user_id` / `creator_user_id` on `promises` and
`recipient_user_id` on `backs` — generic CRUD naming that predates the
Master Spec being checked in and doesn't teach a reader anything about the
domain the way "Achiever" does.

`AGENTS.md` already required this discipline in prose ("Use `Promise`,
`Back`, `BackingCommitment`, `PaymentEvent`, and `Proof` consistently") but
had never named the *person* roles, so the code had drifted from the
product language everywhere except column names.

## Decision

Renamed throughout schema, migrations, and code:
- `promises.owner_user_id` → `achiever_user_id`
- `promises.creator_user_id` → `created_by_user_id` (matching the spec's own
  field name exactly)
- `backs.recipient_user_id` → `achiever_user_id`
- `CreateBackInput.recipientFirstName/LastName/Contact` →
  `achieverFirstName/LastName/Contact`

Edited `db/migrations/0001_alpha_foundation.sql` and `0002_invites.sql` **in
place** rather than adding a new `0003_rename.sql` migration. This
deliberately reads as an exception to the general "migrations are
forward-only, never edit an applied migration" rule in `AGENTS.md` — the
reasoning: nothing has ever applied these migrations against a real,
non-scratch database (no production database is provisioned — see
`README.md`; the only Postgres these migrations have run against was a
throwaway local instance created and destroyed within this same session
for verification). There is no "applied migration" to protect yet. Adding
a rename migration one commit after the table it renames was first created,
before anyone has run either, would be pure migration-history noise, not
safety.

## Alternatives considered

- **Add `0003_achiever_terminology.sql` with `ALTER TABLE ... RENAME
  COLUMN`.** The procedurally "safe" default, and the right call once any
  real database has run 0001/0002. Rejected for now on the reasoning above;
  should be the pattern for any *future* rename, once a real database
  exists.
- **Leave the columns as `owner_user_id`/`recipient_user_id` and only rename
  in TypeScript.** Rejected — this is exactly the kind of code/product
  language drift the rename exists to close. A column name is documentation
  every future agent reads before the prose.

## Consequences

Any agent adding a migration from here forward should assume 0001/0002 are
final and use the standard rename-migration pattern (`ALTER TABLE ... RENAME
COLUMN`) for any further renames — this in-place edit was a one-time,
justified exception tied to the specific fact that no real database existed
yet, not a precedent for casually rewriting shipped migrations.
