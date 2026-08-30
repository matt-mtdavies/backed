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

The two lobes are equal size — an explicit human correction mid-session
overrode an earlier version that read the board's visual proportions as
"upper form more compact," per the master spec's own prose (§13.2). Trust
the direct instruction over an inference from the board on this point.

**The per-lobe shape geometry went through three attempts before it was
right, and two of the three were wrong because they were eyeballed instead
of measured:**
1. First pass: estimated from the screenshot by eye — width:height ≈ 1.1:1
   (too square/tall).
2. Second pass, after the human flagged it as "too short": cross-checked
   against the *original* CSS bar dimensions
   (`.brandMark i{width:22px;height:9px}` ≈ 2.4:1) and trusted that instead
   — wrong in the other direction (too flat/wide), also called out as a
   miss.
3. Third pass: stopped eyeballing entirely. Used `sharp` to load the actual
   board PNG and scan raw pixel data for the dark-on-cream mark in the
   "PRIMARY MARK" panel — the panel the spec itself names as the geometry
   source of truth — to get the real bounding boxes: each lobe measured
   **118×79px and 120×77px** (≈1.5:1 width:height), left-corner radius
   ≈15px (≈19% of lobe height), gap between lobes ≈7px (≈9% of lobe
   height). Rebuilt the path from those ratios (`150×100` per lobe, left
   radius 19, gap 9, scaled into a `0 0 150 209` viewBox) and confirmed by
   compositing a screenshot of the rendered result next to a crop of the
   reference panel — both shapes, side by side, not sequential guesses.
   Container widths in `app/globals.css` (`.brandMark`, `.brandMark.big`,
   `.acceptMark`, plus their mobile overrides) were rescaled from their old
   values to preserve the same rendered height under the corrected aspect
   ratio, since those pixel widths were tuned against the wrong shape.

A secondary mockup (the "Payment Badge" application further down the same
board) was also measured and gave a different ratio (≈2.06:1) — treated as
noise, not a second data point to reconcile, since it's a small secondary
application of the mark rather than the panel the spec names as the
geometry source of truth.

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

**Process lesson, not just a mark-geometry one:** when a reference image is
supplied as "the visual source of truth for geometry" (§13.2's own words),
measure it — don't eyeball proportions off a rendered screenshot, and don't
trust an existing implementation's numbers as a proxy for the reference
just because they're already in the codebase (the old CSS bars were
themselves an unverified approximation, not ground truth). A short script
loading the actual image file and scanning pixel data is more reliable than
visual estimation and took less total time than the two wrong eyeballed
attempts it replaced.
