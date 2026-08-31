# ADR-0015: CI runs the accessibility audit against a real Postgres service container

**Date:** 2026-08-31
**Status:** Accepted

## Context

ADR-0014 named this repo's biggest verification gap: nothing in `npm run
check` (typecheck, lint, unit tests, build) can catch a route that's
correctly typed and unit-tested but was never actually wired to the
database, or a CSS regression on a DB-backed page. This session's review
pass found two different failure shapes, and they need two different
kinds of check. The disconnected Proof/Progress routes (ADR-0014) were
invisible to any visual or accessibility check — the form still rendered
a normal-looking success screen; the only way to catch it was querying
Postgres directly after submitting. The CSS regressions (invisible nav
link, undersized brand mark, reverted contrast fix) are the opposite: pure
rendering bugs with no API involved, exactly what an accessibility/visual
audit exists to catch, and every one of them would have failed CI
immediately had this audit been running. `scripts/a11y-audit.mjs` already
existed and already covers this ground (every core page plus several
DB-backed interactive states, through real `axe-core`), but its own
header comment said outright it wasn't wired into CI because CI had no
Postgres to run against.

## Decision

Added an `a11y` job to `.github/workflows/ci.yml`, alongside the existing
`verify` job, running on every PR and push to `main`:

1. A `postgres:16` service container (`backed`/`backed`/`backed`, matching
   the existing local-dev convention in `.dev.vars.example`).
2. `npm run db:migrate` (existing) then the new `npm run db:seed`
   (`scripts/seed.mjs`, added alongside `migrate.mjs` in the same
   plain-Node, no-`psql`-dependency style) to bring the fresh database to
   exactly the state a contributor's local `.dev.vars` + seed workflow
   already produces.
3. `npx playwright install --with-deps chromium`, then `vinext dev`
   started in the background (`nohup ... &`, matching the pattern used
   throughout this session's manual verification) with `.dev.vars`
   written from the job's `DATABASE_URL`/`ADMIN_TOKEN` env, `wait-on` for
   readiness, then `npm run a11y:audit`.

`scripts/a11y-audit.mjs` had one sandbox-specific line —
`chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`, a path
that only exists in this Claude Code environment's pre-installed browser
setup — which would have silently broken on a real GitHub Actions runner.
Fixed to use that path only when it exists (`existsSync`), falling back to
Playwright's own resolution otherwise (what `npx playwright install`
actually sets up in CI). Verified the entire pipeline end-to-end locally
against a genuinely fresh database (not the reused local dev database,
which had accumulated state across this session) before trusting it in
CI: `dropdb && createdb`, migrate, seed, start, `wait-on`, audit — all
green.

## Alternatives considered

- **A broader integration-test suite (real DB-backed API tests in
  Vitest) instead.** This is the piece that would actually catch the
  ADR-0014 failure shape (a route that silently never touches the
  database) — the accessibility audit does not and cannot, since the page
  it renders looks correct either way. It's real, separate, still-needed
  future work, not something this ADR claims to replace. Wiring up the
  audit first was chosen because it already existed, already catches a
  different and real class of regression (this session found three), and
  needed no new test-writing to start paying off immediately.
- **Run the audit only on `main` after merge, not on PRs.** Rejected:
  the entire point is catching a regression before it merges, matching
  how `verify` already gates PRs.

## Consequences

Every PR now needs the `a11y` job green, not just `verify`. A future
component or CSS change that reintroduces a rendering/contrast regression
fails CI directly, instead of requiring the kind of manual audit this
session repeatedly needed. This does not close the ADR-0014 gap — a route
that silently never persists to the database still passes both `verify`
and `a11y`, since the page it renders looks identical either way; that
still needs the manual `curl` + `SELECT` check (or the integration-test
suite from Alternatives) until one exists. `db:seed` is not idempotent
(matching `db:migrate`'s own documented behavior) — both scripts assume a
fresh database, which is exactly what the CI service container and a
from-scratch local bootstrap both provide; neither is meant for repeat
runs against an already-seeded database.
