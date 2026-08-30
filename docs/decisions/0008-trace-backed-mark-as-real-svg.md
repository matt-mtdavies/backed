# ADR-0008: Trace the primary B mark as a real SVG component, not CSS bars

**Date:** 2026-08-30
**Status:** Accepted

## Context

`BACKED_MASTER_SPEC.md` §13.2 describes the approved primary mark (two
stacked rounded forms, flat left edges, rounded right ends) and §45 step 5
explicitly instructs: "Implement the approved B as a dedicated vector
component from the supplied reference; do not approximate it with text
glyphs." The existing implementation was two `<i>` divs styled with CSS
`border-radius` (`.brandMark i{border-radius:2px 9px 9px 2px}`) — not a
vector traced from the reference, and using two *identical*-sized bars,
whereas the actual per-shape geometry only became decidable once the
founder supplied the reference image directly.

`public/favicon.svg` was a separate, unrelated B glyph entirely (a
traditional single-stem, two-bowl serif-style B with a small Signal-square
badge) — not the stacked-forms mark at all, predating the approved brand
board.

## Decision

Added `components/brand/BackedMark.tsx`: a real SVG with two identical
rounded-form `<path>`s (flat left edge, small left-corner radius, full
semicircular right end), `fill="currentColor"` so it inherits color from
context exactly like the old bars did. Replaced all three usages of the old
`<i/><i/>` pattern (`BackedLogo`, `CreateBackFlow`'s success screen,
`ReceiveBack`'s accepted screen) with `<BackedMark/>`. Rewrote
`public/favicon.svg` to use the same path geometry (via an SVG `<g>`
transform, not re-derived numbers) on a black rounded-square background,
matching the board's "APP ICON" treatment (lime B on black).

The two lobes are equal size. An earlier version of this component made the
upper lobe smaller than the lower one, reading the reference board's visual
proportions literally — overridden by explicit human instruction mid-session
to make them equal. Trust the direct instruction over a visual inference
from the board on this point.

CSS regression caught during this change, not before it shipped: removing
`.brandMark{color:inherit!important}`'s `!important` (it looked like
unnecessary defensiveness) broke the mark's color, because
`.wordmark span{color:var(--lime)}` — written for the unrelated plain-text
period span on the marketing landing page's own inline wordmark — has
higher specificity than a bare `.brandMark` class and collides with it,
since `.brandMark`'s root element is also a `<span>`. Restored the
`!important`. Caught only by actually rendering the page with Playwright
and inspecting computed color, not by any static check.

## Alternatives considered

- **Keep the CSS-bar approximation, just fix the proportions.** Rejected —
  the master spec's own instruction is specific about this being a vector
  component "from the supplied reference," not a refined CSS approximation.
- **Scope the favicon fix to a separate task.** Rejected — the existing
  favicon was actively wrong (a completely different B construction), and
  fixing it is a direct, low-effort application of the same traced
  geometry via one `<g transform>`, not new design work.

## Consequences

Any future change to the mark's geometry should edit
`components/brand/BackedMark.tsx`'s two path `d` strings and update
`public/favicon.svg`'s two paths to match (same `d` values, wrapped in a
`<g transform="translate(...) scale(...)">` sized for the icon's viewBox) —
these are not otherwise kept in sync automatically. Don't remove
`!important` from `.brandMark{color:inherit}` without first checking
whether `.wordmark span{...}` (or any future similarly generic descendant
selector) still exists and still collides.
