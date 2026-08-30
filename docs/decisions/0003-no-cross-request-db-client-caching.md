# ADR-0003: Never memoize the Postgres client across requests

**Date:** 2026-08-30
**Status:** Accepted

## Context

The first implementation of `lib/db/client.ts` cached the Drizzle/`postgres.js`
client at module scope (`let cached: Database | undefined`), the obvious
thing to do to avoid opening a new connection on every request. This was not
caught by `tsc`, `eslint`, `vitest`, or `vinext build` — all passed cleanly.
It broke on the second real request when verified against a live Postgres
through `vinext dev` (actual workerd, not the Node-only `vinext start`):
`POST /api/backs` succeeded, then `GET /invite/[token]` on the very next
request failed with

> Warning: A promise was resolved or rejected from a different request
> context than the one it was created in.

workerd forbids reusing a socket — or a promise tied to one — across
different request contexts within the same isolate. A module-level
`postgres()` client is exactly that: its underlying socket was opened during
request A and touched again during request B.

## Decision

`getDb()` creates a fresh `postgres()` client and Drizzle instance on every
call, with no module-level caching. See the comment in `lib/db/client.ts`
itself, which exists specifically so a future "let's cache this for
performance" edit doesn't quietly reintroduce this bug — it will pass every
static check and only fail on a second real request against a live Worker
runtime, which is easy to not notice without deliberately testing for it
(see the general note on verification methodology below).

## Alternatives considered

- **Cache per-request via `AsyncLocalStorage`/execution context.** Would
  avoid re-opening a connection within a single request that touches the DB
  multiple times, but no current code path does that (each route handler
  makes exactly one `getDb()` call), so there's no measured problem to
  solve. Revisit if that changes.
- **Hyperdrive connection pooling.** This is the actual right long-term
  answer — Hyperdrive is built to make "create a fresh client per request"
  cheap by pooling underneath — but no Hyperdrive resource is provisioned
  yet (see `README.md`). The current code is written so that adopting
  Hyperdrive later is just pointing the connection string at it; no
  structural change needed.

## Consequences

This is a general lesson, not just a single fix: **typecheck + lint + unit
tests + a successful `vinext build` do not prove Workers-runtime
correctness.** This bug specifically required running the actual app
through `vinext dev` (workerd) against a real database and making two
sequential real requests. Any future change to `lib/db/client.ts`, or any
new module-level singleton touching request-scoped I/O (sockets, streams,
promises), should be verified the same way before being trusted — this
project already caught one instance of exactly the failure mode "passes
every static check, breaks the second real request."
