# BACKED — Master Product, Brand & Engineering Spec

**Version:** 1.0
**Status:** Source of Truth / Build Constitution
**Product:** BACKED
**Domain:** backedme.ai
**Primary deployment:** Cloudflare Workers
**Primary repository workflow:** GitHub → feature branch → PR → Cloudflare preview → review → merge to main → production
**Audience:** Codex, Claude Code, Hermes/Groq, human contributors, designers, reviewers

---

## 0. Executive Directive

Build BACKED, a premium social-financial product that lets one person put meaningful financial backing behind another person accomplishing a measurable goal.

The atomic promise is:

> **If you accomplish X by Y, I'll give you Z.**

The emotional product is:

> **I make a promise. You back me. I prove I did it. Then your backing becomes real.**

BACKED is not a betting product, gambling product, generic fundraiser, self-staking accountability app, creator tipping product, or financial investment product. A Backer receives no financial upside from an Achiever's success. Everyone is aligned toward the Achiever succeeding.

The product must feel human before financial, premium before feature-rich, motivating before gamified, and simple before clever.

The Alpha exists to prove one behavioral loop:

Back someone → they accept → they share → more people get behind them → they make progress → they prove it → backing is released → Backers back someone else.

Do not expand scope until this loop is delightful.

---

## 1. Product Thesis

### 1.1 The problem

People routinely say:

- "I believe in you."
- "You should do it."
- "I'll support you."
- "I'm proud of you."
- "You've got this."

These expressions have emotional value, but there is no simple consumer primitive for making that belief tangible, conditional, social and motivating.

Traditional crowdfunding generally funds need, projects or causes before an outcome. Betting introduces opposing incentives. Self-staking apps punish the person attempting the goal. Gift cards are unconditional. Social networks reward content rather than accomplishment.

BACKED creates a new primitive:

> **Put something real behind someone you believe in.**

### 1.2 Mission

Make belief actionable.

### 1.3 Brand idea

Belief, made tangible.

### 1.4 Master line

Don't just believe in someone. Back them.

### 1.5 Product signature

$1,250 behind you.

### 1.6 Acquisition question

Who do you believe in?

### 1.7 Completion language

You did it.
Promise kept.
Backing released.

### 1.8 Brand action

Back someone.

---

## 2. Terminology

Use these terms consistently in product, code, database naming and documentation.

**Achiever** — The person attempting a Promise.

**Backer** — A person putting money behind the Achiever.

**Promise** — A measurable commitment accepted by the Achiever.

**Back** — A Backer's act of supporting a Promise.

**Backing** — The value committed behind the Promise.

**Proof** — Evidence that the Promise was completed.

**Progress Update** — A meaningful update posted by the Achiever.

**Wall of Belief** — The visual manifestation of the people behind an Achiever.

**Signal** — The small electric-lime square used as BACKED's punctuation and brand indicator.

**Avoid** — Do not use these as primary product language: bet, wager, odds, pot, jackpot, winner, loser, donate, donation, fundraiser, investment return, stake.

---

## 3. Launch Wedge

Alpha launches around running achievements because they are:

- measurable;
- emotionally legible;
- naturally time-bound;
- easy to share;
- socially supported;
- relatively straightforward to verify.

Recommended Alpha Promise templates:

- Run my first 5K
- Run my first 10K
- Run my first half marathon
- Run my first marathon

Custom Promises may exist behind moderation but must follow safety rules.

### Explicitly excluded from Alpha

- weight loss;
- calorie/eating restriction;
- medical outcomes;
- dangerous stunts;
- illegal activity;
- self-harm;
- gambling;
- alcohol/drug consumption;
- sexual activity;
- humiliation or harassment;
- financial investment returns;
- public challenges directed at minors.

Running is the launch wedge, not the permanent category definition. The architecture and brand must support future expansion into education, creation, certifications, career, fitness, learning and other measurable human achievements.

---

## 4. Core Behavioral Model

### 4.1 Backer-first acquisition

The preferred Alpha entry point is the Backer.

Example:

1. Jason chooses Matthew.
2. Jason defines: "Run your first half marathon."
3. Jason puts $250 behind it.
4. Matthew receives: JASON BACKED YOU — Run your first half marathon — $250 is behind you — ACCEPT
5. Matthew accepts.
6. The Promise becomes active.
7. Matthew shares: Get more people behind me.
8. Other Backers join.
9. Matthew posts progress.
10. Matthew completes the Promise.
11. Proof is verified.
12. Backing becomes releasable.

This flow is strategically more important than a generic "create a goal" onboarding flow.

### 4.2 Challenge mechanic

A Backer may propose a Promise to another person:

> "I dare you. Run a half marathon before your 45th birthday. I'll put $500 behind it."

The recipient must explicitly accept. Nobody can create a public commitment on behalf of another person without acceptance.

### 4.3 Flywheel

Progress → attention → backing → motivation → progress

### 4.4 Emotional North Star

Promises Kept

Do not create a universal public "Backed Score." BACKED celebrates achievement without reducing people to a ranking or publicly shaming unsuccessful attempts.

---

## 5. Alpha Scope

### 5.1 Must ship

1. Public landing page
2. Authentication
3. Minimal user profile
4. Create a Back / challenge someone
5. Receive and accept/decline a Back
6. Promise page
7. Add Backing flow
8. Wall of Belief
9. Share flow
10. Progress updates
11. Proof submission
12. Manual verification
13. Completion experience
14. Notifications
15. Internal admin/moderation
16. Analytics instrumentation
17. Payment abstraction
18. Responsive mobile-first PWA-ready web experience

### 5.2 Explicitly deferred

- native iOS/Android apps;
- AI chatbot/coach;
- public Discover feed;
- sponsor marketplace;
- employer programs;
- automated wearable verification;
- milestone payouts;
- complex teams;
- cryptocurrency;
- universal reputation score;
- secondary markets;
- public comments at social-network scale;
- creator monetization;
- complex gamification;
- real-time chat.

---

## 6. Core User Journeys

### 6.1 Landing → Back Someone

Landing hero:

> WHO DO YOU BELIEVE IN?

Supporting: Don't just believe in someone. Back them.

Primary CTA: BACK SOMEONE
Secondary: SEE HOW IT WORKS

Flow: (1) choose recipient; (2) choose/template Promise; (3) set completion date; (4) set backing amount; (5) add human message; (6) review; (7) authenticate if needed; (8) create proposed Back; (9) send invite.

The experience should feel closer to sending a meaningful gift than completing a financial form.

### 6.2 Receive Back

The recipient page is a signature surface.

Hierarchy:

> BACKER BACKED YOU
>
> Run your first half marathon
>
> $250 is behind you.
>
> Backer message.

Primary CTA: ACCEPT THE PROMISE
Secondary: DECLINE

Explain simply: "Accept it, make it yours, and invite more people to get behind you."

### 6.3 Promise Page

This is the product's central object.

Above the fold:

- Achiever identity
- Promise title
- target/deadline
- amount behind them
- number of Backers
- progress state
- primary action based on viewer
- Wall of Belief

Example:

> MATTHEW — First Marathon
>
> $3,025 behind him.
>
> 47 people believe he'll do it.
>
> 68% there

CTA for non-owner: GET BEHIND HIM
CTA for owner: SHARE MY PROMISE

### 6.4 Add Backing

1. amount;
2. message;
3. identity/privacy choice if supported;
4. payment/commitment acknowledgement;
5. confirmation.

Prompt: Say something they'll need.

Suggested amounts may be shown, but must not manipulate or shame.

### 6.5 Progress Update

Achiever can post:

- text;
- photo;
- progress value;
- optional milestone label.

Progress should create a reason for Backers to return and share.

### 6.6 Proof

Achiever selects I DID IT.

Submit: proof image/document/link; completion details; optional note.

Alpha uses manual/admin verification.

State becomes `proof_pending`.

### 6.7 Completion

Completion must feel emotional, not transactional.

Hero: YOU DID IT.

Then: Promise kept. $3,025 backing released.

Wall of Belief transforms into a celebration composition around the Achiever.

Backers receive: MATTHEW DID IT. You were behind him.

Then: WHO WILL YOU BACK NEXT?

---

## 7. Failure / Uncompleted Promise UX

Never use: YOU FAILED, LOSER, LOST, shame/red failure visuals.

Use:

> THIS PROMISE ENDED.
>
> Supporting: You made it further than where you started.

The experience should acknowledge effort while accurately representing that the completion condition was not verified.

No Backed Signal success treatment should be used for an uncompleted Promise.

---

## 8. Privacy (Promise visibility)

Promise visibility modes:

**Private** — Only Achiever and invited Backers.

**Circle** — Accessible to invited people and via deliberate share link.

**Public** — Publicly discoverable if/when public discovery exists.

Alpha default: Circle.

A user should never need to become a public content creator to use BACKED.

---

## 9. Wall of Belief

The Wall of Belief is a signature feature, not a generic avatar row.

### 9.1 Concept

The people supporting the Achiever are visually behind them.

It should communicate:

> 47 PEOPLE
> $3,025 BEHIND HIM

### 9.2 Composition

- 1–5 Backers: intimate composition
- 6–15: small group
- 16–50: crowd
- 50+: dense field

Use responsive layered portrait tiles. No WebGL is required for Alpha.

### 9.3 Interaction

Tap/click a Backer to reveal: name; amount if privacy permits; message; date backed.

### 9.4 Completion

On completion, the visual hierarchy can shift so the crowd surrounds/celebrates the Achiever.

### 9.5 Share card

Example:

> MATTHEW
> First Marathon
> 47 PEOPLE
> $3,025 BEHIND HIM
> 68% there
>
> GET BEHIND HIM →

---

## 10. Human Messages

Backing includes a human message.

Prompt: Say something they'll need.

Alpha delivers the message at backing time.

Future capability may allow delivery: now; halfway; when struggling; near finish.

If AI is later introduced, its preferred role is to surface the right human message at the right moment, not replace human encouragement with generic generated copy.

---

## 11. Verification

**Alpha:** Manual verification by BACKED admin.

Proof record contains: submitter; submission time; evidence; reviewer; review time; outcome; reason; audit trail.

### Future verification tiers

1. device/automatic;
2. evidence;
3. social/referee;
4. self-verified.

Long-term concept: Backed Verified / Achievement Verification Network.

---

## 12. Payment & Regulatory Architecture

### 12.1 Critical principle

BACKED must not accidentally become the custodian of customer funds because the UI implies escrow.

Payment architecture must remain abstracted until legal/payment design is approved.

Two conceptual models:

**Model A — Commit now, charge later.** Backer authorizes/commits; payment is captured after verified completion.

**Model B — Fund now, release/refund later.** Psychologically powerful, but potentially creates custody, escrow, safeguarding, money-transmission and compliance complexity.

Alpha engineering must support either model without rewriting Promise logic.

### 12.2 Required separation

Never collapse these concepts:

- Back
- BackingCommitment
- PaymentEvent

Financial transitions must create immutable events.

Do not model money with casual booleans such as `paid=true`.

### 12.3 Provider abstraction

Create an interface such as:

- `createCommitment()`
- `authorize()`
- `capture()`
- `release()`
- `cancel()`
- `refund()`
- `getStatus()`
- `handleWebhook()`

Provider-specific code belongs behind an adapter.

### 12.4 Legal gate

Real-money production release requires review by qualified Canadian/U.S. fintech/crowdfunding counsel and a selected payment provider architecture.

Until approved, development environments may use a simulated provider.

---

## 13. Brand System — LOCKED

This identity is approved. Agents must implement it, not redesign it.

### 13.1 Brand name

BACKED

Domain: backedme.ai

Linguistic system:

- BACKED = company/product
- Back me = request/action
- Backed me = what happened
- Backer = supporter
- Backing = support/value
- backedme.ai = destination

### 13.2 Primary mark

The approved B mark is the stacked two-form B:

- two bold horizontal rounded forms;
- flat left edges;
- rounded right ends;
- narrow intentional negative-space separation;
- upper form visually slightly more compact than lower;
- together they unmistakably imply a capital B;
- no conventional vertical B stem beyond the aligned left geometry;
- no arrows, people, hearts, currency symbols or extra decoration.

The supplied approved brand board/reference image is the visual source of truth for geometry until a final production vector is manually traced/approved.

Agents must not improvise a different B.

### 13.3 Wordmark

Primary wordmark: **BACKED▪**

The final square is the Signal, functioning as punctuation.

Meaning: commitment made; decided; complete; BACKED.

Do not replace it with a circular period in branded lockups.

### 13.4 Palette

- BACKED Black — `#0A0C0B`
- Bone — `#F4F3ED`
- Backed Signal — `#C8FF32`
- Graphite — `#222522`

Signal is intentionally scarce. Target approximately <10% of most product surfaces.

Signal is used for: primary action; meaningful money/value emphasis; active progress; success; Signal punctuation; selective brand moments.

Do not flood screens with lime.

### 13.5 Typography

Direction: Satoshi / contemporary grotesk territory.

Before production, verify font licensing and web distribution rights.

If Satoshi cannot be legally bundled, use a metrically and aesthetically appropriate licensed/open alternative chosen deliberately — not a random system fallback.

Typography principles: confident; clean; contemporary; exceptional numerals; large display numbers; restrained tracking; strong hierarchy.

Numbers are a major brand device:

> $1,250
>
> behind you.

### 13.6 Photography

Photography shows effort, work, preparation, repetition and accomplishment.

Include a broad human-achievement world: running/training; studying; making/building; learning; graduation; practicing music; creative work; preparation; emotional completion.

Avoid: generic stock fitness; influencer posing; corporate handshake imagery; fake celebration; gambling aesthetics.

Style: natural/cinematic light; candid; tactile; emotionally grounded; diverse; aspirational without becoming glossy stock photography.

### 13.7 Iconography

Do not use a generic SaaS collection as the brand's visual language.

Create a restrained custom outline family: simple; human; consistent stroke; minimal detail; legible at small sizes.

Functional UI icons may use a proven icon library, but hero/brand storytelling should not look like an icon marketplace.

### 13.8 Motion

Principle: Movement without noise.

Motion should feel: physical; weighted; purposeful; restrained.

Approved motifs: Backer portrait settles behind Achiever; money/count increments cleanly; progress fills; Signal appears at resolution; subtle haptic confirmation.

Avoid: casino confetti; slot-machine number rolls; bouncing CTA spam; excessive particles; gratuitous parallax.

Brand mark motion concept: support → movement → resolution → Signal

---

## 14. Brand Messaging Hierarchy

These phrases have different jobs.

- **Corporate / brand proposition** — Belief, made tangible.
- **Master product line** — Don't just believe in someone. Back them.
- **Acquisition** — Who do you believe in?
- **Campaign** — Someone believes you can.
- **Product signature** — $1,250 behind you.
- **Completion** — You did it.
- **Transactional success** — Promise kept. Backing released.
- **Core action** — Back someone.

Do not mix every line on one screen.

---

## 15. UX & Visual Principles

1. Human before financial.
2. Achievement before transaction.
3. One obvious action per screen.
4. Large numbers deserve space.
5. Signal is earned.
6. No casino visual language.
7. No shame mechanics.
8. Photography and people carry emotion.
9. Mobile is first-class, not a collapsed desktop.
10. Every financial state must be explicit.
11. Every share surface should make sense without context.
12. Accessibility is a design constraint, not cleanup.

---

## 16. Responsive Design

Primary target is mobile web because acquisition will often occur through SMS, WhatsApp, Instagram, email and shared links.

Breakpoints may follow implementation conventions, but design behavior must be intentional.

**Mobile** — single-column hierarchy; thumb-friendly CTAs; sticky primary action when appropriate; large money/progress display; Wall of Belief optimized for portrait; no hover-only interaction.

**Tablet** — increased visual composition; maintain touch interaction.

**Desktop** — richer Wall of Belief composition; split layouts where useful; generous whitespace; avoid stretching mobile cards across large screens.

Minimum touch target: 44×44 CSS px where practical.

Respect reduced-motion preferences.

---

## 17. Route Map

Suggested route architecture:

- `/`
- `/how-it-works`
- `/login`
- `/signup`
- `/back`
- `/back/new`
- `/invite/[token]`
- `/p/[promiseSlug]`
- `/p/[promiseSlug]/back`
- `/p/[promiseSlug]/progress/new`
- `/p/[promiseSlug]/proof`
- `/profile/[handle]`
- `/me`
- `/me/promises`
- `/me/backing`
- `/settings`
- `/admin`
- `/admin/promises`
- `/admin/proofs`
- `/admin/users`
- `/admin/moderation`

Exact naming may evolve if a clearer routing model emerges, but public Promise URLs must remain short and shareable.

---

## 18. Data Model

Use PostgreSQL.

**users**
- id UUID PK
- email
- phone nullable
- display_name
- handle unique nullable until claimed
- avatar_url
- bio nullable
- status
- created_at
- updated_at

**promises**
- id UUID PK
- achiever_user_id FK
- created_by_user_id FK
- title
- description
- category
- target_type
- target_value nullable
- target_unit nullable
- starts_at nullable
- due_at
- visibility
- status
- slug
- accepted_at nullable
- completed_at nullable
- ended_at nullable
- created_at
- updated_at

**backs**
- id UUID PK
- promise_id FK
- backer_user_id FK
- amount_minor
- currency
- message
- status
- visibility
- created_at
- accepted_at nullable
- cancelled_at nullable
- released_at nullable

**backing_commitments**
- id UUID PK
- back_id FK
- provider
- provider_reference nullable
- amount_minor
- currency
- status
- authorization_expires_at nullable
- created_at
- updated_at

**payment_events** — Immutable append-only financial ledger/event stream.
- id UUID PK
- backing_commitment_id FK
- type
- amount_minor
- currency
- provider_reference nullable
- provider_payload_ref nullable
- idempotency_key unique
- occurred_at
- created_at

**progress_updates**
- id UUID PK
- promise_id FK
- author_user_id FK
- body
- progress_value nullable
- progress_unit nullable
- media_url nullable
- created_at
- updated_at

**proof_submissions**
- id UUID PK
- promise_id FK
- submitted_by_user_id FK
- status
- evidence_type
- evidence_url
- note nullable
- submitted_at
- reviewed_by_user_id nullable
- reviewed_at nullable
- review_reason nullable

**promise_invites**
- id UUID PK
- promise_id FK
- back_id FK nullable
- recipient_email nullable
- recipient_phone nullable
- token_hash
- status
- expires_at
- accepted_by_user_id nullable
- created_at

**notifications**
- id UUID PK
- user_id FK
- type
- channel
- payload JSONB
- status
- scheduled_at nullable
- sent_at nullable
- created_at

**moderation_events**
- id UUID PK
- actor_user_id nullable
- subject_type
- subject_id
- action
- reason
- metadata JSONB
- created_at

**audit_events**
- id UUID PK
- actor_user_id nullable
- event_type
- subject_type
- subject_id
- metadata JSONB
- created_at

Add indexes based on actual query paths. Use DB constraints for invariant protection.

---

## 19. State Machines

### 19.1 Promise

Primary: `proposed → accepted → active → proof_pending → verified → completed`

Alternate terminal/intermediate states: `declined`, `expired`, `ended_unverified`, `cancelled_by_admin`.

All transitions happen through domain services/actions, not arbitrary row updates.

### 19.2 Back

Primary: `proposed → committed → active → payable → released`

Alternates: `declined`, `cancelled`, `expired`, `returned`, `payment_failed`.

### 19.3 Proof

`draft → submitted → approved`

Alternates: `rejected`, `needs_more_information`.

### 19.4 Rules

- A Promise cannot become active before Achiever acceptance.
- A Promise cannot complete without approved Proof unless an explicit admin override is audited.
- A Back cannot release before Promise verification.
- Financial state transitions create immutable PaymentEvents.
- Webhook handling must be idempotent.
- Admin overrides require audit events.

---

## 20. Authentication & Authorization

Preferred architecture: Supabase Auth unless implementation evidence strongly favors another provider.

Requirements: magic-link/email-friendly onboarding; social auth may be added; invitation flow must preserve destination after auth; server-side authorization on every mutation; never trust role/ownership from client state; admin role stored and enforced server-side.

Row Level Security should be used where appropriate, but domain authorization must remain explicit and testable.

---

## 21. Notifications

Alpha channels: (1) email; (2) in-app.

SMS can be added selectively if economics and consent model justify it.

Key events: someone backed you; Promise invitation; Promise accepted; new Backer; meaningful progress; proof submitted; proof approved; Promise completed; payment/release status; administrative action.

Notification copy must feel human and concise.

---

## 22. Admin Console

Alpha requires an intentionally simple internal admin.

Admin can: search users; view Promises; view Backs; review Proof; approve/reject/request more evidence; moderate unsafe Promise content; suspend users; inspect payment state; inspect audit trail; perform approved overrides with reason.

No irreversible financial admin action without explicit confirmation and audit.

---

## 23. Analytics

Use a privacy-conscious product analytics provider such as PostHog, subject to final configuration/privacy review.

**North Star:** Promises Kept

### Alpha funnel events

- `landing_viewed`
- `back_started`
- `recipient_entered`
- `promise_defined`
- `backing_amount_selected`
- `back_created`
- `invite_sent`
- `invite_opened`
- `promise_accepted`
- `promise_declined`
- `promise_shared`
- `promise_viewed`
- `backing_started`
- `backing_completed`
- `progress_posted`
- `proof_started`
- `proof_submitted`
- `proof_approved`
- `promise_completed`
- `backer_back_someone_started`

Every event should have a documented schema.

Do not log secrets, raw payment data or sensitive evidence contents into analytics.

### Key metrics

- Back → Acceptance rate
- Accepted Promise → Share rate
- Share → Back conversion
- Backers per active Promise
- Backer → new "Back someone" conversion
- Gross Backing Value
- median Back
- Promise completion rate
- repeat Backer rate
- progress update frequency
- proof approval rate
- payment failure rate

---

## 24. Alpha Experiment

Initial target: 100 Achievers

Preferably most enter because someone else backed them first.

Evidence of product pull:

- 50% invitation acceptance is a strong directional target;
- accepted users share without heavy prompting;
- Promises attract multiple Backers;
- Backing amounts feel meaningful;
- Backers independently choose to back additional people;
- completion creates another sharing/backing cycle.

Do not optimize vanity signups at the expense of the core loop.

---

## 25. Technical Architecture

### 25.1 Frontend / full-stack framework

- Next.js
- React
- TypeScript strict mode
- App Router
- Server Components by default
- Client Components only where interaction requires them
- Tailwind CSS
- accessible headless primitives where helpful

### 25.2 Cloudflare runtime

Production runs on Cloudflare Workers, not Vercel and not Cloudflare Pages for the full-stack application.

Use Cloudflare's current recommended Next.js path: vinext on Workers.

The repository should preserve standard Next.js structure while using vinext/Vite/Cloudflare configuration for production runtime.

Before adopting unsupported Next.js functionality: (1) run/check vinext compatibility; (2) prefer supported web-standard/runtime APIs; (3) isolate runtime-specific code; (4) document compatibility workarounds.

Do not introduce OpenNext unless a verified vinext compatibility gap requires it and the architectural change is documented.

### 25.3 Data

Preferred: Supabase managed PostgreSQL; Supabase Auth; Supabase Storage where appropriate.

Keep application/domain code independent enough that Cloudflare is the compute/deployment layer and Supabase is the primary data/auth platform.

### 25.4 Cloudflare services

Use only where they simplify the system.

Potential: Workers; custom domains; R2 for suitable assets if preferred over Supabase Storage; KV for non-authoritative cache/config; Queues for asynchronous work later; Turnstile for abuse prevention; Images if justified.

Do not prematurely introduce Durable Objects, especially because they complicate normal preview URL behavior and are not needed for Alpha.

### 25.5 Email

Provider abstraction; Resend/Postmark-class provider acceptable.

### 25.6 Payments

Provider abstraction; provider not considered locked by this spec.

### 25.7 Testing

- Vitest
- React Testing Library
- Playwright

---

## 26. Cloudflare Deployment — LOCKED

### 26.1 Production topology

backedme.ai → Cloudflare → Cloudflare Worker → BACKED Next.js/vinext application → Supabase/services

### 26.2 Git workflow

Normal work: Agent/local work → feature branch → GitHub PR → automated tests → Cloudflare preview → human review → merge to main → Cloudflare production

`main` is production.

No agent should bypass this flow for normal feature work.

### 26.3 Initial bootstrap exception

If the repository is truly empty with no branch/commit, the initial application bootstrap may be pushed directly to `main` to establish the repository.

After that bootstrap, direct feature pushes to `main` are prohibited.

### 26.4 Cloudflare Workers Builds

Configure GitHub integration.

Production branch: `main`

Non-production branch builds: enabled

Cloudflare preview deployments must be used for visual/functional review before merge.

Build/deploy commands must follow the scripts generated/required by the repository's current vinext configuration. Do not hard-code stale commands into external settings without checking package.json and Cloudflare configuration.

### 26.5 Worker naming

The Worker project name and Wrangler configuration name must remain aligned.

### 26.6 Domain

Canonical: `https://backedme.ai`

`www.backedme.ai`: permanent redirect to apex.

Do not create circular DNS aliases.

Attach the production custom domain through the Worker/Cloudflare configuration.

### 26.7 Secrets

Never commit: Supabase service role keys; payment secrets; email secrets; webhook secrets; admin secrets.

Use Cloudflare build/runtime secrets and local `.dev.vars`/approved local secret mechanism.

Provide `.env.example` with names only.

---

## 27. Repository Structure

Recommended:

```text
/
  AGENTS.md
  BACKED_MASTER_SPEC.md
  README.md
  package.json
  wrangler.jsonc
  vite.config.ts
  next.config.*
  app/
  components/
    brand/
    ui/
    promise/
    backing/
    wall-of-belief/
  lib/
    auth/
    db/
    domain/
    payments/
    notifications/
    analytics/
    moderation/
    cloudflare/
  public/
    brand/
  styles/
  supabase/
    migrations/
    seed.*
  tests/
    unit/
    integration/
    e2e/
  docs/
    decisions/
    brand/
    product/
```

Adapt to actual generated vinext structure without creating pointless directories.

---

## 28. Multi-Agent Collaboration Constitution

BACKED will be co-built by Codex, Claude Code and potentially Hermes/Groq.

GitHub is the shared memory and source of truth.

No agent owns the codebase.

### 28.1 Authority hierarchy

When instructions conflict:

1. current explicit human instruction;
2. `BACKED_MASTER_SPEC.md`;
3. `AGENTS.md`;
4. accepted Architecture Decision Records;
5. existing implementation/tests;
6. agent preference.

Agents must not silently override a higher-level source.

### 28.2 Branch ownership

Each coherent task gets its own branch.

Suggested naming: `feat/...`, `fix/...`, `design/...`, `infra/...`, `chore/...`

Do not have multiple agents independently modify the same branch unless explicitly coordinated.

### 28.3 Handoff protocol

Before handing work to another agent:

1. commit all intended work;
2. ensure working tree is clean or clearly document uncommitted files;
3. run relevant tests;
4. write a concise PR/body or handoff note: what changed; why; files touched; tests run; known issues; decisions made; next recommended task.

### 28.4 PR policy

Every normal feature/fix should have: clear title; summary; screenshots for visual work; testing evidence; Cloudflare preview; explicit deviations from spec; migration notes if applicable.

### 28.5 Agent behavior

Agents should: read AGENTS.md and relevant spec sections first; inspect existing code before rewriting; make focused changes; preserve established patterns; add/update tests; update docs when architecture changes; use existing components/tokens; avoid dependencies without a clear reason.

Agents must not: redesign the locked brand; change payment semantics casually; weaken authorization; push normal feature work directly to main; deploy manually around GitHub; rewrite working subsystems merely for stylistic preference; introduce a new framework/database/state library without justification; expose secrets; mark tests passed without running them.

### 28.6 Architecture decisions

Meaningful irreversible decisions get an ADR under `docs/decisions/`.

Format: context; decision; alternatives; consequences; date/status.

### 28.7 Model strengths

Do not hard-code permanent model roles, but a useful operating pattern is:

**Codex** — implementation; repo-wide engineering; tests; infrastructure; refactoring; PR execution.

**Claude Code** — parallel implementation/review; UX/code critique; complex component work; adversarial review; architecture review.

**Hermes/Groq** — fast triage; repetitive checks; issue decomposition; lightweight review; operational assistance where appropriate.

Any agent can perform any role. Git, tests, preview and the spec — not model identity — determine truth.

---

## 29. AGENTS.md Requirements

Root `AGENTS.md` should be concise and operational.

It must tell every agent to:

1. read `BACKED_MASTER_SPEC.md`;
2. preserve the locked brand;
3. use feature branches/PRs;
4. never deploy around GitHub;
5. run tests/lint/typecheck;
6. use Cloudflare Workers/vinext assumptions;
7. preserve payment/domain state machines;
8. keep secrets out of git;
9. use accessible responsive patterns;
10. document deviations and ADR-worthy decisions.

Nested `AGENTS.md` files may be added only when a directory needs materially different rules.

---

## 30. Component System

Core components should include:

**Brand** — BackedMark, BackedWordmark, Signal, BrandLockup

**Promise** — PromiseHero, PromiseStatus, PromiseProgress, PromiseMeta, PromiseCard

**Backing** — BackingAmount, BackingComposer, BackerCard, BackingSummary

**Wall** — WallOfBelief, BackerPortrait, BackerDetail

**Progress** — ProgressComposer, ProgressTimeline, ProgressUpdateCard

**Proof** — ProofUploader, ProofStatus, CompletionHero

**UI** — Button, Input, Textarea, Select, Dialog, Sheet, Toast, Avatar, Badge, Card, Progress, Skeleton

Do not over-abstract before repeated patterns exist.

---

## 31. Design Tokens

Establish CSS variables/tokens rather than scattering literals.

Example semantic layer:

```css
--color-bg: #F4F3ED;
--color-fg: #0A0C0B;
--color-surface: #FFFFFF;
--color-surface-inverse: #0A0C0B;
--color-muted: #222522;
--color-signal: #C8FF32;

--radius-sm: ...;
--radius-md: ...;
--radius-lg: ...;

--space-1: ...;
--space-2: ...;
...
```

Exact spacing/radius scale should be coherent and documented.

Use semantic names in components.

---

## 32. Accessibility

Target WCAG 2.2 AA.

Requirements: semantic HTML; keyboard navigation; visible focus; adequate contrast; alt text; form labels; error announcements; reduced motion; no color-only status communication; 44px touch targets where practical; logical heading hierarchy; accessible dialogs/sheets; screen-reader-friendly money/status text.

Test core flows with keyboard and automated accessibility tooling.

---

## 33. Performance

Performance is part of premium design.

Targets: excellent Core Web Vitals on typical modern mobile; optimize hero images; lazy-load below-fold media; avoid unnecessary client JS; use Server Components where useful; cache safe public data intentionally; never cache private user data into public/shared contexts; optimize Wall of Belief for large Backer counts.

Do not sacrifice correctness for synthetic scores.

---

## 34. Security

Minimum: server-side authorization; CSRF-safe framework patterns; input validation; output escaping; rate limiting/abuse protection on sensitive endpoints; secure invitation tokens; hashed token storage; idempotent webhooks; signature verification; least-privilege service credentials; audit admin actions; no payment card storage; safe upload validation; content moderation; secure headers; dependency scanning.

Consider Cloudflare Turnstile for abuse-prone public actions.

---

## 35. Privacy (Data minimization)

Collect the minimum required.

Requirements: clear visibility semantics; no accidental public Promise exposure; private proof evidence not indexed; avoid analytics capture of sensitive content; deletion/export architecture considered; explicit consent for marketing channels; separate operational from marketing notifications.

---

## 36. SEO & Sharing

Public/shareable Promise pages should have: canonical URL; dynamic title; dynamic description; Open Graph image; social metadata; appropriate robots behavior based on visibility.

Circle/private content must not be unintentionally indexed.

OG cards are a growth surface and should use BACKED brand language.

---

## 37. Seed Demo

Development/preview environments should include a canonical seed scenario:

- Achiever: Matthew
- Promise: First Marathon
- Backing: $3,025
- Backers: 47
- Progress: 68%

Use varied Backer portraits/messages and realistic progress.

This scenario is used for: visual QA; screenshots; Wall of Belief stress testing; responsive review; social cards.

Seed data must never leak into production user records.

---

## 38. Acceptance Criteria — Alpha

Alpha is not done merely because routes exist.

**Product**
- Backer can create a proposed Back.
- Recipient can accept.
- Promise activates correctly.
- Others can add Backing.
- Achiever can share.
- Achiever can post progress.
- Achiever can submit Proof.
- Admin can review Proof.
- Completion changes domain/payment eligibility state.
- Backers receive completion notification.

**Brand**
- approved stacked B used faithfully;
- BACKED Signal punctuation implemented;
- palette exact;
- Signal restrained;
- no generic gambling/fintech visual language;
- responsive visual quality meets approved board.

**Engineering**
- strict typecheck passes;
- lint passes;
- tests pass;
- core Playwright flows pass;
- authorization tests exist;
- state transitions tested;
- webhook/payment abstraction idempotency tested;
- Cloudflare production build passes.

**Deployment**
- PR produces Cloudflare preview;
- preview reviewed;
- merge to main produces production deployment;
- backedme.ai resolves to production;
- www redirects to apex;
- secrets absent from repo.

**Accessibility**
- keyboard core flow;
- focus states;
- contrast;
- reduced motion;
- automated baseline checks.

---

## 39. Visual QA Checklist

Every major UI PR should be checked at minimum:

- 375px mobile
- 430px mobile
- tablet
- 1440px desktop

Review: typography; spacing; clipping; money formatting; Signal usage; B geometry; Wall composition; CTA hierarchy; empty states; loading; errors; long names; large Backer counts; reduced motion; dark/photographic contrast where used.

Screenshots belong in the PR for material visual changes.

---

## 40. Build Phases

**Phase 0 — Foundation**
bootstrap repo; Cloudflare/vinext; design tokens; brand assets; database; auth; tests; CI/build; seed data.

**Phase 1 — First vertical slice**

Build one beautiful end-to-end scenario:

Backer creates Back → recipient accepts → Promise page renders → second Backer joins

This must look production-quality before broadening scope.

**Phase 2 — Progress**
progress updates; notifications; sharing; Wall refinement.

**Phase 3 — Proof & Completion**
proof submission; admin review; verification; completion; payment eligibility abstraction.

**Phase 4 — Alpha hardening**
moderation; analytics; performance; accessibility; security; edge cases; production domain; legal/payment gate.

---

## 41. First Vertical Slice Definition

Build this before creating dozens of screens.

Scenario:

1. Jason creates a $250 Back for Matthew.
2. Promise: "Run your first half marathon."
3. Matthew opens invite.
4. Screen says: JASON BACKED YOU — Run your first half marathon — $250 is behind you.
5. Matthew accepts.
6. Promise page appears.
7. Matthew shares.
8. Sarah opens shared page.
9. Sarah adds $50 and a message.
10. Promise page updates: $300 behind you. 2 people believe you'll do it.
11. Wall of Belief shows Jason and Sarah.

This slice validates the core interaction model and visual language.

---

## 42. Product Principles for Agents

When uncertain, use these tests.

**Does it strengthen belief?** If not, question it.

**Does it make the transaction feel like support rather than gambling?** If not, redesign it.

**Does it help the Achiever do the thing?** If not, deprioritize it.

**Does it make the Backer feel meaningfully involved?** If not, improve it.

**Is it simpler than the alternative?** Prefer simple.

**Does Signal feel earned?** If lime is everywhere, no.

**Would this still work for a certification or book launch later?** Avoid running-specific architecture.

**Can the financial state be audited?** If not, do not ship it.

---

## 43. Non-Negotiables

1. Brand is BACKED.
2. Domain is backedme.ai.
3. Primary mark is the approved stacked two-form B.
4. Wordmark uses Signal square punctuation.
5. No agent redesigns the identity without explicit human direction.
6. Cloudflare Workers is production hosting.
7. Full-stack Next.js uses Cloudflare's vinext path unless a documented compatibility gap requires otherwise.
8. `main` is production.
9. Normal work goes through PR + Cloudflare preview.
10. No gambling framing.
11. No public shame mechanics.
12. No unsafe Alpha Promise categories.
13. Payment state is evented/auditable.
14. No custody assumptions without legal approval.
15. Backer-first acquisition is core.
16. Wall of Belief is signature.
17. Mobile web is first-class.
18. The Alpha optimizes the core loop, not feature count.

---

## 44. Codex / Claude Code / Hermes Startup Prompt

Use this at the beginning of a fresh agent session:

> You are working on BACKED. Before making changes, read `BACKED_MASTER_SPEC.md`, root `AGENTS.md`, relevant existing code/tests, and any applicable ADRs. Treat the Master Spec as the product/brand/engineering source of truth. BACKED is a Cloudflare Workers-hosted full-stack Next.js application using Cloudflare's current vinext path. The approved brand — stacked two-form B, BACKED wordmark with Signal square punctuation, Black/Bone/Signal palette — is locked and must not be redesigned. Work on a focused feature branch, preserve domain/payment state-machine invariants, run relevant lint/typecheck/tests, and prepare a PR with screenshots for visual work and a Cloudflare preview. Do not deploy around GitHub or push normal feature work directly to `main`. If a requested implementation conflicts with the spec or requires a material architecture decision, surface the conflict and document an ADR rather than silently changing direction.

---

## 45. Current Build Instruction

For the repository bootstrap:

1. Place this file at repository root as `BACKED_MASTER_SPEC.md`.
2. Create root `AGENTS.md` from Section 29.
3. Bootstrap the current recommended Cloudflare Workers/vinext Next.js application.
4. Establish design tokens and brand components first.
5. Implement the approved B as a dedicated vector component from the supplied reference; do not approximate it with text glyphs.
6. Establish Supabase schema/migrations and state-machine services.
7. Add seed demo.
8. Add tests and Playwright.
9. Build the Phase 1 vertical slice.
10. Connect through GitHub/Cloudflare workflow.
11. After the initial empty-repo bootstrap, all work uses PRs.

---

## 46. Definition of Success

BACKED succeeds when someone receives:

> JASON BACKED YOU
>
> $250 is behind you.

…and the reaction is not:

> "Interesting finance app."

It is:

> "Wow. He really believes I can do this."

Everything in the product exists to create, amplify and ultimately fulfill that feeling.

---

**END — BACKED MASTER SPEC v1.0**
