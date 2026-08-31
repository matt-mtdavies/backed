// Runs axe-core against the app's core pages and prints violations. Requires a
// running server (npm run dev / vinext start) at BASE_URL, seeded with at
// least the demo scenario (db/seed.sql). Not wired into CI yet — CI would
// need a Postgres service container and a migrated+seeded database first;
// run this locally against `npm run dev` until that infra exists.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";

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

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
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
