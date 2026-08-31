# BACKED

Belief made tangible. BACKED lets one person put conditional financial backing behind another person accomplishing a clearly defined Promise.

This repository contains the Cloudflare Workers Alpha foundation and the first polished vertical slice: landing → seeded Jason Promise → interactive Wall of Belief → backing confirmation. The payment interaction is explicitly mocked and collects no funds.

## Local development

Requires Node.js 22. Copy `.env.example` to `.env.local`, then:

```bash
npm install
npm run dev
```

Use `npm run check` for type checking, linting, unit tests, and the production build.

The dev server runs on the Cloudflare Workers runtime, so `DATABASE_URL` must reach it as a Worker binding, not as a Next-style env var. Copy `.dev.vars.example` to `.dev.vars` and point it at a Postgres instance to exercise the Back and Invite flows locally; without it, `/api/backs` and invite acceptance fail with "DATABASE_URL is not configured."

Run `npm run db:migrate` (`db/migrations/*.sql` applied in order via `psql "$DATABASE_URL"`) against a fresh database before using the app. Migrations are hand-written, forward-only SQL — `db/schema.ts` is a manually kept-in-sync typed mirror for Drizzle queries, not the source of truth, and `drizzle-kit generate` is not used.

## Architecture

- Next.js-compatible App Router on Cloudflare’s recommended vinext/Vite Workers architecture
- TypeScript strict mode
- PostgreSQL migration foundation in `db/migrations`
- Explicit Promise and Back state machines in `lib/state-machines`
- Provider-independent payment contract in `lib/payments`
- Cloudflare Worker configuration in `wrangler.jsonc`

Configure `DATABASE_URL` as a Worker secret and connect through an edge-compatible PostgreSQL service or Cloudflare Hyperdrive when provisioning production. No production database is provisioned by this bootstrap.

## Cloudflare GitHub integration

Do not deploy from a developer machine or Codex. In Cloudflare Workers & Pages, import `matt-mtdavies/backed` as a Worker named `backed` and use:

- Production branch: `main`
- Build command: `npm run build`
- Production deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Root directory: `/`

Enable non-production branch builds so every pull request receives a Cloudflare preview URL. Add `backedme.ai` as the Worker custom domain after DNS is ready. Runtime secrets belong in Cloudflare, never GitHub or the repository.

The first empty-repository bootstrap is the sole direct push to `main`. Afterwards use feature branch → GitHub PR → Cloudflare preview → merge to `main` → production.

Read `AGENTS.md` before changing the product. It codifies the Alpha language, safety, state-machine, migration, testing, and delivery constraints.

## Known gaps

- **`vinext dev` and `vinext build`+`vinext start` are not
  interchangeable for verification.** See
  [ADR-0009](docs/decisions/0009-verify-against-production-build-not-just-dev.md).
  A change that touches routing, `next/link`, client components, or the
  build toolchain must be click-tested against a real production build
  before it's trusted, not just `vinext dev`. This already shipped one
  outage (every navigation link dead in production, fixed by upgrading
  `vinext`) that passed `npm run check` cleanly the whole time.
- **A route can pass every static check and unit test while never
  actually touching the database.** See
  [ADR-0014](docs/decisions/0014-exercise-new-routes-against-real-postgres-before-merge.md).
  Two routes (Proof submission, Progress posting) shipped with real,
  well-tested domain services behind them but were never wired to real
  repositories in the route itself — always using no-op stubs regardless
  of `DATABASE_URL`. Fixed, but any new mutating route needs a real
  `curl` + `SELECT` check before merge, not just green tests.
- **Admin actions are gated by a shared secret, not real per-admin
  identity.** See
  [ADR-0013](docs/decisions/0013-shared-secret-gate-for-admin-actions.md).
  `/admin/proofs` and `/admin/releases` (and their APIs) require the
  `ADMIN_TOKEN` header/secret, but the actor recorded in
  `Verification.reviewerUserId` is still a fixed alpha placeholder, not
  whoever actually holds the token. Replace with real auth when it
  exists generally, not admin-specific.
