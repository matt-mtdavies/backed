# BACKED engineering contract

Read this file before every change. `BACKED_ALPHA_SPEC.md` is the product source of truth, except where an explicit user request supersedes it. Hosting is Cloudflare Workers through Cloudflare’s GitHub integration; never add Vercel configuration or deploy directly from an agent.

## Product principles

People over mechanics. Belief over punishment. Money is tangible encouragement, never a wager. Sharing is the network, not a feed. Protect the emotional sequence: **Back → Accept → Share → Progress → Prove → Release**. Do not invent scope.

## Language and design

Use `Promise`, `Back`, `BackingCommitment`, `PaymentEvent`, and `Proof` consistently. Never use donor, donation, wager, bet, odds, pot, jackpot, fundraiser, win, loser, earned, influencer, or follower count. Keep BACKED Black/Bone/Graphite dominant; reserve Lime for money, primary actions, progress, and success. Mobile is first-class. Use the replaceable `BackedLogo`; the mark is not final. Meet WCAG AA, preserve visible focus, semantic structure, large tap targets, and reduced motion.

## Domain discipline

All Promise and Back state changes go through service/state-machine functions. Never write state casually in a component or add financial booleans. Keep `Back`, `BackingCommitment`, and append-only `PaymentEvent` separate. Provider-specific payment details stay behind `PaymentProvider`. Admin actions are authorized and audited. Custom goals pass moderation review. Alpha never assumes BACKED has custody of money.

## Data and migrations

PostgreSQL is authoritative. Migrations are forward-only, reviewed SQL in `db/migrations`; never edit an applied migration. Use UTC timestamps, UUID primary keys, constraints, and indexes. Production connects from Workers through a managed edge-compatible PostgreSQL provider or Cloudflare Hyperdrive; credentials remain secrets.

## Quality and delivery

TypeScript is strict. Add focused unit tests for transitions, money, validation, and moderation; integration tests for services; Playwright coverage for core flows as they become live. Run typecheck, lint, unit tests, and build before handoff. The initial bootstrap may go directly to `main`. Every later change uses feature branch → pull request → Cloudflare preview → merge to `main` → production. Never deploy directly from Codex.

## Forbidden scope

No discovery feed, leaderboards, points, streaks, badges, public reputation score, AI chatbot, sponsor marketplace, crypto, speculative payment custody, or shame/failure mechanics. Do not introduce heavy animation or WebGL for the Wall of Belief.
