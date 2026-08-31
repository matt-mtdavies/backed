# ADR-0014: Exercise new routes against real Postgres before merging, not just unit tests

**Date:** 2026-08-31
**Status:** Accepted

## Context

Two routes shipped alongside the Proof/Progress/Promise work
(`POST /api/promises/[slug]/proof` and `POST /api/promises/[slug]/progress`)
were never actually wired to the database. Both always called their
domain service (`submitProof`, `createProgressUpdate`) with hardcoded
no-op repository stubs — `proofs: { create: async () => {} }`,
`progress: { create: async () => ({ id: crypto.randomUUID() }) }` — instead
of branching on `process.env.DATABASE_URL` and using real
`lib/db/*-repositories.ts` implementations the way every other mutating
route in this codebase does (`POST /api/backs`, `POST /api/promises`,
`POST /api/admin/proofs/[id]/approve`). The Proof route additionally
hard-404'd for every slug except the demo Promise.

`npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`
all passed the entire time. The unit tests for `submitProof` and
`createProgressUpdate` (`tests/submit-proof.test.ts`,
`tests/create-progress-update.test.ts`) are correct and pass — they inject
mock repositories and assert the *domain function* behaves correctly given
those mocks. Nothing in that test shape can catch "the HTTP route never
constructs a real repository at all," because the route itself was never
exercised. This was only found by manually curling the live route against
a real Promise and checking Postgres directly: `submitProof` returned a
fake success response, `SELECT * FROM proof_submissions` showed nothing
was ever inserted.

This is a distinct failure mode from ADR-0009 (`vinext dev` vs. the
bundled production build exercising different code). Here, *any* mode of
running the app would have shown the bug immediately — dev or built,
Chromium or curl — because it's not a runtime/bundling issue at all. It's
that the route was simply never connected to the database, and nothing in
the standard `npm run check` gate is capable of detecting a domain
service's HTTP route silently no-op-ing instead of calling it for real.

## Decision

Before merging any new or changed route that reads or writes the database,
exercise it directly against a real Postgres instance (`vinext dev` +
`DATABASE_URL` set, per the existing `.dev.vars` workflow) with an actual
HTTP request — `curl` or a live click-through — and confirm the expected
row exists or changed with a direct `SELECT`, not just a `200`/`201`
response. A green HTTP status only proves the route didn't throw; it does
not prove the route touched the database at all, as this incident showed.

Unit tests with mocked repositories remain necessary (they're the right
tool for validating domain logic — validation rules, state transitions,
what gets written) but are not sufficient evidence a route is wired
correctly, and should never be treated as such on their own.

## Alternatives considered

- **Add an integration test suite that runs against a real (test)
  Postgres in CI.** This is the right long-term fix — it would have caught
  this class of bug automatically — but no such CI infrastructure exists
  yet (this repo's CI has no Postgres service container; see
  `scripts/a11y-audit.mjs`'s header comment for the same gap on the
  accessibility side). Recorded here as follow-up work rather than
  solved now.
- **Trust unit tests plus a manual read-through of each route.** Rejected
  as the status quo that produced this bug: a careful reviewer reading
  `lib/proofs/submit-proof.ts` in isolation would see correct code; the
  defect was entirely in `app/api/promises/[slug]/proof/route.ts`'s wiring,
  which is easy to skim past when the service function it calls looks
  right.

## Consequences

Every new mutating route needs one real `curl` + `SELECT` verification
pass before merge, in addition to the standard `npm run check` gate. This
is manual and easy to skip under time pressure, the same caution ADR-0009
ends on — until real CI-integrated Postgres testing exists (see
Alternatives), this step is on the person or agent shipping the route, not
on the tooling.
