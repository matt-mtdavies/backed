# ADR-0004: Adopt `BACKED_MASTER_SPEC.md` as the constitution, supersede `BACKED_ALPHA_SPEC.md`

**Date:** 2026-08-30
**Status:** Accepted

## Context

`BACKED_ALPHA_SPEC.md` was a checked-in pointer stating the real spec was
"maintained outside the repository." `AGENTS.md` named
`BACKED_ALPHA_SPEC.md` itself as the product source of truth. The founder
supplied the full product/brand/engineering spec directly (product thesis,
terminology, brand system, data model, state machines, multi-agent
collaboration rules, acceptance criteria) with an explicit instruction that
it become the project's checked-in constitution, per its own §45 bootstrap
instructions (`Place this file at repository root as BACKED_MASTER_SPEC.md`).

## Decision

The full spec is checked in as `BACKED_MASTER_SPEC.md` at repository root,
reformatted into clean Markdown with its content otherwise unchanged.
`AGENTS.md`'s opening line now names `BACKED_MASTER_SPEC.md` as the source
of truth. `BACKED_ALPHA_SPEC.md` is rewritten as a one-line pointer to
`BACKED_MASTER_SPEC.md` rather than deleted, since other tooling or
conversations may still reference the filename.

`BACKED_MASTER_SPEC.md` §28.1 sets the authority hierarchy for future
conflicts: explicit human instruction, then the Master Spec, then
`AGENTS.md`, then accepted ADRs (this directory), then existing
implementation/tests, then agent preference.

## Alternatives considered

None seriously — this was an explicit, direct instruction to store the
supplied document as the constitution. The only judgment calls were (a)
reformatting to Markdown rather than pasting verbatim as an unstructured
block, and (b) whether to also fix the two files whose wording the new spec
immediately contradicted (done — see Decision) versus leaving a
self-contradictory repo.

## Consequences

The Master Spec's own content diverges from the current implementation in
several concrete, known ways — Supabase (ADR-0002), `owner_user_id`/
`recipient_user_id` naming (fixed, see ADR-0006), and some data-model field
shapes (`target_type`/`value`/`unit`, partially adopted — see ADR-0007).
Adding this file did not itself reconcile those; each divergence gets its
own ADR rather than being silently resolved or silently ignored, per §44's
own instruction: "If a requested implementation conflicts with the spec or
requires a material architecture decision, surface the conflict and
document an ADR rather than silently changing direction."
