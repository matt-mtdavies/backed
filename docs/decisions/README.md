# Architecture Decision Records

Per `BACKED_MASTER_SPEC.md` §28.6: meaningful, hard-to-reverse decisions get
recorded here, not just left implicit in a diff. Copy `TEMPLATE.md` for a new
one. Read the relevant ADRs here before undoing something that looks like an
odd or inconsistent choice — it may be deliberate and explained below rather
than a mistake.

| ADR | Title |
| --- | --- |
| [0001](0001-migrations-authoritative-over-drizzle-generate.md) | Hand-written SQL migrations are authoritative, not `drizzle-kit generate` |
| [0002](0002-postgres-via-drizzle-not-supabase-yet.md) | Direct Postgres via `postgres.js` + Drizzle, not Supabase, for now |
| [0003](0003-no-cross-request-db-client-caching.md) | Never memoize the Postgres client across requests |
| [0004](0004-adopt-master-spec-as-constitution.md) | Adopt `BACKED_MASTER_SPEC.md` as the constitution, supersede `BACKED_ALPHA_SPEC.md` |
| [0005](0005-backer-name-as-identity-bridge.md) | `backerName` as a free-text identity bridge ahead of real auth |
| [0006](0006-achiever-backer-rename-in-place.md) | Achiever/Backer terminology rename, applied in-place to migrations 0001–0002 |
| [0007](0007-structured-targets-without-progress-computation.md) | Structured target fields added; progress computation deliberately deferred |
| [0008](0008-trace-backed-mark-as-real-svg.md) | Trace the primary B mark as a real SVG component, not CSS bars |
| [0009](0009-verify-against-production-build-not-just-dev.md) | Verify navigation/interaction against `vinext build` + `vinext start`, not just `vinext dev` |
