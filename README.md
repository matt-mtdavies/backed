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
