# ADR-0010: Proof submission enters manual review only

**Date:** 2026-08-31
**Status:** Accepted

## Context

`BACKED_MASTER_SPEC.md` defines the sequence as Back -> Accept -> Share ->
Progress -> Prove -> Release. The schema already had `proof_submissions`,
`verifications`, `promises.proof_submitted_at`, and the Promise state
`proof_pending`, but there was no Proof submission service or route.

The first Proof feature creates `/p/[promiseSlug]/proof` and
`/api/promises/[slug]/proof`. In Alpha, there is still no admin review UI,
no verified completion service, and no approved payment-release path.

## Decision

Submitting Proof creates a pending `ProofSubmission` and transitions the
Promise from `active` to `proof_pending`. It does not transition the Promise
to `verified` or `completed`, does not move any Back to `payable` or
`released`, and does not create `PaymentEvent` rows.

The user-facing confirmation copy must explicitly say that Proof is in manual
BACKED review and backing is not released until Proof is approved. This keeps
the Alpha honest while still making the Prove step tangible.

## Alternatives considered

- **Mark the Promise completed immediately after Proof submission.** Rejected:
  completion requires approved Proof or an audited admin override per the
  Master Spec. Treating submission as completion would collapse Prove,
  Verify, and Release into one unaudited action.
- **Create mocked release/payment events for the Alpha demo.** Rejected:
  the project already separates mocked commitment from real payment custody.
  Adding fake release events would make the financial state look more complete
  than it is.
- **Wait to build Proof until admin review exists.** Rejected: the Prove step
  is a core part of the product loop and can be useful as a pending-review
  state without implying completion.

## Consequences

Future work should add an admin Proof review service that transitions
`proof_pending -> verified -> completed`, then separately updates Back and
payment eligibility state through audited services. Do not release backing,
show completion, or append payment events from the Proof submission route.
