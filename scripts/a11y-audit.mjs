// Runs axe-core against the app's core pages and prints violations. Requires a
// running server (npm run dev / vinext start) at BASE_URL, seeded with at
// least the demo scenario (db/seed.sql). Wired into CI (.github/workflows/ci.yml,
// the `a11y` job) against a real Postgres service container, migrated and
// seeded fresh on every run. Set ADMIN_TOKEN to also cover the admin pages.
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// vinext dev's Node HTTP listener binds to whatever `dns.lookup("localhost")`
// returns for this host, which some runners (this repo's GitHub Actions
// runner included) resolve to the IPv6 loopback [::1] only, not 127.0.0.1 —
// so default to "localhost", not the IPv4 literal, or connections are refused.
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
// Some sandboxes pre-install Chromium outside Playwright's normal cache dir.
// Use it when present; otherwise fall back to Playwright's own resolution
// (what `npx playwright install` sets up in CI).
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {};

const pages = [
  { name: "landing", path: "/" },
  { name: "back-flow-step0", path: "/back" },
  { name: "promise-demo", path: "/p/jason-first-half" },
  { name: "promise-back-sheet", path: "/p/jason-first-half/back" },
  { name: "invite-pending", path: "/invite/jason-half-demo" },
  { name: "make-a-promise", path: "/promise" },
  { name: "post-progress", path: "/p/jason-first-half/progress/new" },
  { name: "submit-proof", path: "/p/jason-first-half/proof" },
  { name: "admin-token-gate", path: "/admin/proofs" },
];

const browser = await chromium.launch(launchOptions);
const context = await browser.newContext();
const page = await context.newPage();
let totalViolations = 0;

async function report(name) {
  const results = await new AxeBuilder({ page }).analyze();
  if (results.violations.length === 0) {
    console.log(`✓ ${name} — no violations`);
    return;
  }
  totalViolations += results.violations.length;
  console.log(`✗ ${name} — ${results.violations.length} violation(s):`);
  for (const v of results.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
    for (const node of v.nodes) console.log(`    - ${node.target.join(" ")}`);
  }
}

for (const { name, path } of pages) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await report(`${name} (${path})`);
}

// Interactive states a plain page load can't reach.
await page.goto(BASE + "/back", { waitUntil: "networkidle" });
for (let i = 0; i < 4; i++) {
  await page.click('button:has-text("CONTINUE")');
  await page.waitForTimeout(200);
}
await report("back-flow-step4-review (/back, step 5)");

await page.goto(BASE + "/p/jason-first-half", { waitUntil: "networkidle" });
await page.click(".portrait");
await page.waitForTimeout(150);
await report("promise-demo-wall-detail-open (/p/jason-first-half, backer detail expanded)");

if (process.env.ADMIN_TOKEN) {
  await page.goto(BASE + "/admin/proofs", { waitUntil: "networkidle" });
  await page.fill(".adminTokenGate input", process.env.ADMIN_TOKEN);
  await page.click(".adminTokenGate button");
  await page.waitForTimeout(300);
  await report("admin-proof-review (/admin/proofs, past token gate)");
} else {
  console.log("- admin-proof-review skipped (set ADMIN_TOKEN to include it)");
}

await browser.close();
console.log(totalViolations === 0 ? "\nAll pages clean." : `\n${totalViolations} total violation(s).`);
process.exit(totalViolations === 0 ? 0 : 1);
