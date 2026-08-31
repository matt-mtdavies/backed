# ADR-0012: Alpha release records provider event, not custody

**Date:** 2026-08-31
**Status:** Accepted

## Context

ADR-0011 made approved Proof create payable Backs and payable PaymentEvents.
The next Alpha step adds an internal Release action. The Master Spec allows a
future payment provider architecture, but also says Alpha must not imply BACKED
has custody of money or quietly collapse financial states.

## Decision

Release starts only from a `payable` Back. The Release service calls the
`PaymentProvider.release()` abstraction, transitions the Back
`payable -> released`, marks the BackingCommitment released, and appends a
`PaymentEvent` with type `released`.

In Alpha, the provider is still `AlphaMockPaymentProvider`. UI copy must call
that out as an Alpha/mock release event and must not imply real money was held,
transferred, or settled by BACKED.

## Alternatives considered

- **Release directly from Proof approval.** Rejected in ADR-0011; keeping a
  separate Release action preserves the audit boundary between eligibility and
  provider action.
- **Skip provider abstraction because Alpha is mocked.** Rejected: payment
  semantics must stay behind `PaymentProvider` from the beginning so the real
  provider path can replace the mock without changing product state semantics.
- **Only update the Back state without a PaymentEvent.** Rejected: financial
  state changes must be append-only and auditable.

## Consequences

Future real-payment work must replace the mock provider implementation and
preserve the service boundary. Do not describe Alpha Release as custody,
escrow, settlement, or a real transfer.
