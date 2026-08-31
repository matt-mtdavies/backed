# ADR-0009: Verify navigation and interaction against `vinext build` + `vinext start`, not just `vinext dev`

**Date:** 2026-08-31
**Status:** Accepted

## Context

A user report ("tapping the buttons does nothing") turned out to be a
site-wide production outage: every `next/link` navigation in the deployed
app was dead. Reproducing it with a real Playwright click (not
`page.goto()`) against `vinext build` + `vinext start` threw:

```
TypeError: e is not a function
    at .../link-LqQ81c4E.js:2:12449
    at e.startTransition (.../framework-*.js:1:6550)
```

Root cause, traced into the minified chunk: the production Link click
handler does `await import("./index-BVXP7Ume.js")` and destructures
`navigateClientSide` from the result. That bundled chunk did not actually
export `navigateClientSide` — only vinext's unbundled dev-mode source
(`shims/navigation.js`) did. The destructure silently resolved to
`undefined`, and calling it inside `startTransition` threw, swallowing the
click with zero visible feedback. This was a bug in `vinext@1.0.0-beta.2`'s
chunk splitting; it was already fixed somewhere in the six releases between
`beta.2` and current `beta.8` (see `package.json`).

Every prior PR this cycle (persistence/brand, visual QA, accessibility,
SEO/OG images, the arrow-icon fix) was verified exclusively against
`vinext dev`. `vinext dev` serves modules through Vite's dev pipeline, not
the bundled/rolldown production chunks — so it never exercised the code
path that was actually broken. `tsc`, `eslint`, `vitest`, and `vinext
build` all passed cleanly the entire time; nothing in the standard
`npm run check` gate would have caught this. It took an actual user tapping
an actual button on the actual deployed site to surface it.

This is the same failure shape as ADR-0003 (module-level DB client caching:
passes every static check, breaks only on a real second request against
real workerd) — but inverted. ADR-0003 was "dev mode (workerd) catches what
Node-only `vinext start` can't verify (DB access)." This is "the built,
bundled production runtime breaks what dev mode's unbundled module graph
never exercises (client-side navigation)." Both are instances of the same
underlying lesson: **`vinext dev` and `vinext build`+`vinext start` are not
interchangeable for verification — they exercise genuinely different code
paths, and a change (or a stale dependency) can be broken in one while
passing clean in the other.**

## Decision

Before merging any change that touches routing, `next/link` usage, client
components, or the framework/build toolchain itself (`vinext`, `vite`,
`@vitejs/plugin-rsc`, `@cloudflare/vite-plugin`), verify it against the
**actual production build**:

```
npm run build
npx vinext start
```

then drive it with a real Playwright **click** (`page.click(...)`), not
`page.goto()` — `goto()` bypasses the client-side Link handler entirely and
would not have caught this bug. Capture `pageerror` and console `error`
events; a silent click that doesn't navigate is the failure mode, not a
thrown exception you'd notice by eye.

`vinext dev` (real workerd, via `@cloudflare/vite-plugin`) remains
necessary and correct for anything touching the database or other
Workers-only bindings (`vinext start` is plain Node and can't run
`postgres.js`'s workerd-conditional build — see ADR-0003). Neither mode
alone is sufficient; a change that touches both routing and the database
needs both.

Also: keep `vinext` reasonably current. We were six releases behind
(`beta.2` from mid-July against `beta.8` from late August) when this song
shipped, entirely undetected because nothing in local verification ever
ran the affected code path. A stale pin on a beta-track framework is itself
a source of silent, unverified risk.

## Alternatives considered

- **Add an automated production-build click-through test to CI.** This is
  the right long-term fix and should happen, but wasn't done as part of
  this ADR — recorded here so a future agent doesn't have to rediscover
  the need. `scripts/a11y-audit.mjs` is the closest existing precedent for
  a Playwright script run against a live server; a
  `scripts/smoke-production.mjs` in the same shape (build, start, click
  through the core flows, assert URL changes) would close this gap
  permanently instead of relying on a human noticing.
- **Pin `vinext` and never upgrade mid-alpha.** Rejected: the bug that
  caused this outage was already fixed upstream by the time it was found.
  Staying pinned indefinitely trades a known, disclosed beta-track risk for
  an unknown, silent one.

## Consequences

Every future change to routing, client components, or the build toolchain
must include a production-build click-through, not just a `vinext dev`
pass and a green `npm run build`. `npm run check` (typecheck, lint, test,
build) is necessary but was proven, concretely, to be insufficient here —
it stayed green through the entire outage. Until `scripts/smoke-production.mjs`
(or equivalent CI coverage) exists, this verification step is manual and
easy to skip under time pressure; do not skip it for anything touching
navigation.
