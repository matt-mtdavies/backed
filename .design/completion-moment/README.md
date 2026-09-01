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

Geist is embedded in each artboard as a base64 `woff2` data URI (the latin
subset lifted from the app's own build output, variable weight 100–900) rather
than linked from `fonts.googleapis.com`. This is not a stylistic choice: a
render-blocking external stylesheet gates the artboard's mount inside its
sandboxed iframe, and the canvas hung on "Loading artboard…" until it resolved
— measured at 17.8s with the link versus 4.9s without. Keep webfonts embedded
here; don't reintroduce a `<link>`.

Values are lifted from `app/globals.css` rather than re-invented — the
`.portrait` tones, the moment anatomy shared by `.acceptMoment` /
`.proofSubmitted`, the `.button` metrics, Geist, and the traced `BackedMark`
and `Arrow` SVGs. Content uses the real `db/seed.sql` demo scenario (Jason,
$1,100, five named backers); the finish-time detail in the backer view is
placeholder copy, and totals beyond five backers are extrapolated to drive
the crowd-size lever.

One deliberate departure from `.portrait`: the crowd here is overlapping
circular portraits, not the live Wall of Belief's domed-rectangle pillars.
Tried matching `.portrait` first and it read as a row of headstones — the
domed top on a straight-sided slab standing in a row, independent of the
flat-bottom/rounded-bottom question (the base is hidden under the scrim
either way). Circles, depth-ordered and overlapping, don't have that
problem. The live `.portrait` shape (`components/wall/WallOfBelief.tsx`,
`app/globals.css`) has the same silhouette and hasn't been touched — that's
shipped product code, a separate decision from this canvas.
