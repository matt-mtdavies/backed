# ADR-0007: Structured target fields added; progress computation deliberately deferred

**Date:** 2026-08-30
**Status:** Accepted

## Context

`promises` had no machine-readable notion of what "done" means — `title`
and `success_criteria` were free text only. This meant `progress` on the
Promise page could never be computed for real; the only place progress ever
appeared was `lib/demo.ts`'s hardcoded `progress: 68`. `BACKED_MASTER_SPEC.md`
§18 lists `target_type`/`target_value`/`target_unit` on `promises`, which
the existing schema lacked entirely.

## Decision

Added `promises.target_type` (text), `target_value` (numeric),
`target_unit` (text), all nullable. Populated automatically from the
promise template at creation time (`first_half` → `distance` / `21.1` /
`km`, etc.; `custom` → all null). The real Promise page (`/p/[slug]`)
displays the target label (e.g. "21.1 km") when present, but does **not**
compute or display a progress percentage — there is no progress-logging UI
or `progress_updates` write path yet, so any percentage shown would be
fabricated. This matches `BACKED_MASTER_SPEC.md` §40's own phasing: Phase 1
(the vertical slice just built) stops at "Wall of Belief shows Jason and
Sarah" with no progress step; progress updates are explicitly Phase 2.

## Alternatives considered

- **Skip target fields entirely until progress UI is built.** Rejected —
  the columns are cheap to add now and adding them later would mean an
  actual migration touching live promise rows; better to have the target
  captured from day one even before anything reads it for computation.
- **Fake a progress percentage on the real Promise page** (e.g. time
  elapsed toward deadline, or a static placeholder). Rejected — this
  project's stance throughout has been to show real data or an honest empty
  state, never an invented number that looks real. A fake percentage next
  to real dollar totals would be actively misleading in a way a missing
  progress ring is not.

## Consequences

`progress_updates` (schema already exists, mirroring the 0001 migration —
see ADR-0001) has no write path and nothing reads it yet. The natural next
step, whenever progress tracking is built: sum/derive a percentage from
`progress_updates` rows against `promises.target_value`, and only then add
the progress ring back to the real Promise page. Until that exists, resist
the temptation to compute a percentage from anything else (money raised,
days elapsed) — those are different concepts from achievement progress and
conflating them was a pattern this project's own demo data already fell
into (`lib/demo.ts`'s `progress: 68` is disconnected from the `total: 1100`
dollar figure on the same object, and that disconnect is correct — money
and achievement progress are not the same number).
