# Completion moment — design canvas

Design exploration for the Promise-kept payoff screen (Master Spec §6.7, and
the Wall of Belief celebration composition in §9.4), which has no
implementation yet — proof approval currently only changes database state.

Published canvas: https://claude.ai/code/artifact/2bdcde37-394c-4f96-869e-07bdfc8d635b

| File | Artboard |
| --- | --- |
| `Main.dc.html` | Achiever's moment, desktop (1440) |
| `BackerMoment.dc.html` | Backer's moment + the "who will you back next?" flywheel, desktop |
| `Mobile.dc.html` | Achiever's moment, 390 |
| `canvas.json` | Layout, titles, frame sizes |

These are Claude Design artboard sources. The published page is seeded from
them by the `design` skill's `seed-canvas.mjs`; that seeded ~2.4 MB file is
generated output and is gitignored. To change the canvas, edit these files,
re-seed, and republish to the same artifact URL.

Values are lifted from `app/globals.css` rather than re-invented — the
`.portrait` shape and tones, the moment anatomy shared by `.acceptMoment` /
`.proofSubmitted`, the `.button` metrics, Geist, and the traced `BackedMark`
and `Arrow` SVGs. Content uses the real `db/seed.sql` demo scenario (Jason,
$1,100, five named backers); the finish-time detail in the backer view is
placeholder copy, and totals beyond five backers are extrapolated to drive
the crowd-size lever.
