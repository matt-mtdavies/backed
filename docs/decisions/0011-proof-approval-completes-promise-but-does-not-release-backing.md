# ADR-0011: Proof approval completes Promise but does not release backing

**Date:** 2026-08-31
**Status:** Accepted

## Context

ADR-0010 established that Proof submission only enters manual review. The next
Alpha step adds a minimal internal Proof approval path for admins. The Master
Spec requires admin/manual verification in Alpha and also requires financial
state to remain explicit and auditable.

The schema already separates `ProofSubmission`, `Verification`, `Back`, and
`PaymentEvent`. The Back state machine also separates `active -> payable` from
`payable -> released`.

## Decision

Approving Proof creates a `Verification`, marks the pending Proof approved,
transitions the Promise `proof_pending -> verified -> completed`, and marks
active Backs for that Promise as `payable`. For each Back made payable, the
service appends a `PaymentEvent` with type `payable`.

Approval does not transition Backs to `released`, does not append release
events, and does not imply money moved. Release remains a future payment-path
feature.

## Alternatives considered

- **Transition active Backs straight to released.** Rejected: the Back state
  machine intentionally separates payment eligibility from release. Skipping
  `payable` would hide a financial state change that needs its own provider
  integration and audit trail.
- **Complete the Promise without touching Backs.** Rejected: verified
  completion should make BackingCommitments eligible for release; otherwise
  the product loop reaches completion but leaves financial state stale.
- **Avoid PaymentEvents until real payments exist.** Rejected: Alpha still
  needs an auditable state history. A `payable` event is not a custody or
  release claim; it records eligibility.

## Consequences

Future release work must start from `payable` Backs and create separate
provider-backed release/capture events. Do not reuse Proof approval to imply
settlement, custody, transfer, or payment completion.
