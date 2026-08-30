# ADR-0005: `backerName` as a free-text identity bridge ahead of real auth

**Date:** 2026-08-30
**Status:** Accepted (interim — expected to be superseded once auth lands)

## Context

Making the Promise page and Wall of Belief real (reading actual DB data
instead of the hardcoded Jason demo) hit a wall immediately: `backs` has a
nullable `backer_user_id`, but there is no auth system, so every real Back
has `backer_user_id = NULL`. The Wall of Belief is meaningless without
names — "X people believe in you" with no X. `BACKED_MASTER_SPEC.md` §6.4
(Add Backing flow) already anticipates this: its listed steps include
"identity/privacy choice if supported," not a hard requirement for a full
account.

## Decision

`backs.backer_name` is a required `text NOT NULL` column, collected as a
plain form field on both `createBack` (the founding Back, which also
proposes the Promise) and the new `addBacking` (a later Backer joining an
already-active Promise). It is not validated against any account, is not
unique, and is not used for anything beyond display (Wall of Belief,
invite-page attribution "X backed you").

This is an explicit bridge, not a replacement for real identity: it directly
unblocks the product's signature surface (the Wall of Belief) without
waiting on a full auth project.

## Alternatives considered

- **Wait for Supabase Auth (or any auth), don't build the real Promise page
  yet.** Rejected — the Promise page and Wall of Belief are the highest-
  leverage surface in the product and were fully disconnected from the real
  persistence work that had just landed; leaving them fake while auth is
  scoped and built would leave the core loop demonstrably incomplete for an
  indefinite, unscoped amount of time.
- **Leave `backerUserId` null and show "Someone" / anonymous entries on the
  Wall of Belief.** Considered and rejected as a fallback for exactly this
  reason: an anonymous Wall of Belief defeats the point of the feature (see
  `BACKED_MASTER_SPEC.md` §9 — "Wall of Belief is signature").

## Consequences

When real auth lands, `backerUserId` should be populated from the
authenticated session and `backerName` should be derived from the linked
profile rather than collected as free text — at that point `backerName`
becomes either redundant (drop it) or a display-name override (keep it,
narrower purpose). Until then: `backerName` is fully unauthenticated,
unverified user input — it must never be treated as an identity claim for
authorization, moderation attribution, or anything beyond display copy.
