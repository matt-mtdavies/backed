# BACKED engineering contract

Read this file before every change. `BACKED_MASTER_SPEC.md` is the product, brand and engineering source of truth, except where an explicit user request supersedes it. Hosting is Cloudflare Workers through Cloudflare’s GitHub integration; never add Vercel configuration or deploy directly from an agent.

## Product principles

People over mechanics. Belief over punishment. Money is tangible encouragement, never a wager. Sharing is the network, not a feed. Protect the emotional sequence: **Back → Accept → Share → Progress → Prove → Release**. Do not invent scope.

## Language and design

Use `Promise`, `Back`, `BackingCommitment`, `PaymentEvent`, and `Proof` consistently. Never use donor, donation, wager, bet, odds, pot, jackpot, fundraiser, win, loser, earned, influencer, or follower count. The approved board uses Black `#0A0C0B`, Bone `#F4F3ED`, Signal `#C8FF32`, and Graphite `#222522`; Signal is reserved for money, primary actions, progress, and compact punctuation. Satoshi Variable is the preferred typeface with Geist/Inter fallback. The approved primary mark is the stacked two-part B resolving into a Signal period; keep it replaceable and preserve its clear space. Mobile is first-class. Meet WCAG AA, preserve visible focus, semantic structure, large tap targets, and reduced motion.

## Domain discipline

All Promise and Back state changes go through service/state-machine functions. Never write state casually in a component or add financial booleans. Keep `Back`, `BackingCommitment`, and append-only `PaymentEvent` separate. Provider-specific payment details stay behind `PaymentProvider`. Admin actions are authorized and audited. Custom goals pass moderation review. Alpha never assumes BACKED has custody of money.

## Data and migrations

PostgreSQL is authoritative. Migrations are forward-only, reviewed SQL in `db/migrations`; never edit an applied migration. Use UTC timestamps, UUID primary keys, constraints, and indexes. Production connects from Workers through a managed edge-compatible PostgreSQL provider or Cloudflare Hyperdrive; credentials remain secrets. Before assuming a schema or naming choice is a mistake, check `docs/decisions/` — several deliberate, documented exceptions to the rules above already exist there.

## Quality and delivery

TypeScript is strict. Add focused unit tests for transitions, money, validation, and moderation; integration tests for services; Playwright coverage for core flows as they become live. Run typecheck, lint, unit tests, and build before handoff. The initial bootstrap may go directly to `main`. Every later change uses feature branch → pull request → Cloudflare preview → merge to `main` → production. Never deploy directly from Codex.

`npm run check` passing is necessary but not sufficient for anything touching routing, `next/link`, client components, or the build toolchain (`vinext`, `vite`, `@vitejs/plugin-rsc`, `@cloudflare/vite-plugin`): also run `npm run build && npx vinext start` and drive it with a real click (`page.click`, not `page.goto`) before trusting it. `vinext dev` and the bundled production build exercise genuinely different code paths — one outage already shipped and passed every static check the whole time it was live. See [ADR-0009](docs/decisions/0009-verify-against-production-build-not-just-dev.md).

Any new or changed route that reads or writes the database needs a real `curl` (or click-through) against `vinext dev` with `DATABASE_URL` set, confirmed with a direct `SELECT` — not just a passing HTTP status and green unit tests. Two routes once shipped fully wired-looking unit tests while the route itself silently never touched the database at all; see [ADR-0014](docs/decisions/0014-exercise-new-routes-against-real-postgres-before-merge.md). CI's `a11y` job (a real Postgres service container, migrated, seeded, and audited with `axe-core` on every PR) catches rendering/contrast regressions this way automatically, but not that one — a route that silently never persists still renders a normal-looking page. See [ADR-0015](docs/decisions/0015-ci-runs-a11y-audit-against-real-postgres.md).

## Forbidden scope

No discovery feed, leaderboards, points, streaks, badges, public reputation score, AI chatbot, sponsor marketplace, crypto, speculative payment custody, or shame/failure mechanics. Do not introduce heavy animation or WebGL for the Wall of Belief.
