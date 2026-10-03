# The Four-Month Rebuild — notes for Claude Code

## What this is
A personal trading course for one student, Sfundo (South Africa, SAST = GMT+2). It runs from **Tue 1 Dec 2026 to Sun 28 Mar 2027**, two hours a day:

- **Mon–Sat:** hour 1 is a lesson (SEED: Simplify → Expand → Explain back → Drill); hour 2 applies that same lesson (bar replay, a lab or the Trading Floor).
- **Sunday:** the weekly review, plus a gate exam when one is due.
- 26 three-day units in nine modules (TRD 100–402), five gates and a Final, a Turtle-rules bar-replay simulator (the "Trading Floor"), labs, a trade journal and an AI tutor.

It started life as a claude.ai artifact. **The goal now:** a standalone, installable, offline-first PWA on GitHub Pages that needs nothing from claude.ai. `ROADMAP.md` lists the phases — do them in order, one per session, and plan before editing.

## The person using it (shapes copy and tutor prompts)
- Big idea first, in plain English with an everyday analogy; then detail; formulas last. Diagrams help. He wants to be able to explain each idea to someone else.
- Prefers short answers. Writes Java at university — when course content shows code (for example the position-size calculator), use Java.
- The course is built against his past failure modes: jumping between topics, signal-sellers, long boring videos, no tracking, stress while watching charts.

## Run it
There is no build step: classic scripts, no framework, no bundler.

- Serve the folder over HTTP (service workers don't work on `file://`):
  `python -m http.server 8080`, then open http://localhost:8080 (or `npx serve .`).
- Plan maths self-check: `node tests/plan-check.mjs` — it must print `NO PLAN ERRORS`.

## Architecture
`index.html` loads `js/*.js` as `<script defer>` in **this exact order**; later files use globals from earlier ones.

| File | Globals | What it holds |
|---|---|---|
| 20-course-meta.js | `COURSE` | modules, ranks, sources, orientation lessons, admission questionnaire; `COURSE.week()` registers units |
| 21/22/23-course-*.js | (`COURSE.weeks`) | the 26 units — 3 lessons each (`big, plain, dia, body, ex, q, yt, src`), practical `P {task, steps[3], tools, num}`, Sunday deliverable `R` |
| 24-exams.js | `COURSE.exams`, `COURSE.GEN` | gates g1–g5 and the Final; randomised calculation generators |
| 25-plan.js | `COURSE.PLAN`, `COURSE.TASKS` | the calendar: 121 days with hour-1/hour-2 items, rest days, gate Sundays, special-day tasks |
| 50-engine.js | `ENGINE` | synthetic markets (regime Markov chain, GARCH volatility, fat tails), indicators (N, Donchian), the Turtle rules, stats |
| 10-core.js | `APP, U, STORE, P, VIEWS, ACT, go, render, softRender` | state, utilities, storage and (dormant) cloud sync, progress and pacing, hash router, action registry |
| 30-diagrams.js | `DIAG` | inline-SVG teaching diagrams, themed through CSS classes |
| 54-svgcharts.js | `SVGC` | small SVG charts (line with hover, bars, R histogram) |
| 55-chart.js | `PriceChart` | canvas candlestick chart (channels, swings, trades, crosshair, pan/zoom, pick-a-level) |
| 40-views.js | `VIEWS.*` | today, day, plan, course, lesson, admission, practical (apply), review, exam, record |
| 56-floor.js | `FLOOR` | the Trading Floor: bar replay, free / Turtle S1 / S2 modes, Autopilot, CSV import |
| 60-labs.js | — | labs: size, expectancy, recovery, streaks, Monte Carlo, drills |
| 65-journal.js | `JOURNAL` | trade log, stats, segments, style diagnostic, gate evidence |
| 70-tutor.js | `TUTOR` | tutor drawer and page; grading of explain-backs and written exam answers; extra drills |
| 99-boot.js | — | navigation chrome, capability detection, first render |

**Patterns**
- **Routing:** `#/view/id/sub` → `VIEWS[view].render(params)` returns HTML. Optional `after()`, `leave()`, `key()` and `noSoft`.
- **Actions:** elements carry `data-act` (click), `data-chg` (change) or `data-inp` (input), which call `ACT[name](el, event)`.
- `render(toTop)` redraws the view. `softRender()` redraws without stealing focus from a field being typed in.
- **Progress** is one ordered sequence, `P.items()`, built from `COURSE.PLAN`; "next" is the first unfinished item. Never key progress by date — the calendar only measures pace (`P.pace()`).

## Data (all on the device)
**localStorage keys:** `rebuild.v3.state`, `.trades`, `.writing`, `.threads`, `.floor`, `.import`

**state (v4):**
```
{ plan, startDate, name,
  settings{tutorMode, unitRisk, checklist[]}, admission,
  lessons{id:{s,e,x,d,done}},
  practicals{unit:{sessions[3], notes[3], num{}}},
  tasks{id:{done, note}},
  reviews{"c<week>":{right, wrong, q, cons, done}},
  exams{id:{attempts, best, last, passedAt, override}},
  activity{date:n}, sim }
```

**trade:**
```
{ id, src: bt|bt-sim|demo|live|sim, set, date, tin, date2, tout, pair, tf, sess, setup,
  dir, entry, stop, target, exit, risk, lots, R, rules, broke, grade, eb, ed, ea,
  watched, shot, note, week, createdAt, updatedAt }
```

- **writing:** explain-backs, reviews and exam answers.
- **threads:** tutor conversations (at most 60).

Keep these shapes backward-compatible: the student will import his export from the claude.ai version (Record → "Download my data", shape `{exported, state, trades, writing}`).

## Claude-runtime touchpoints (Phases 1 and 4 replace these)
The artifact got four abilities from `window.claude.use(name)`. Outside claude.ai, `window.claude` is undefined and the app already falls back to local mode, but these places still assume it:

- **99-boot.js** `boot()`: `use("sample")` → `APP.cap.sample`; `use("downloads")`; `use("db")` + `use("user")` → `STORE.initDb()`.
- **10-core.js** `STORE`: `pushNow`, `saveDoc`, `deleteDoc`, `initDb` and `syncCollection` talk to `APP.cap.db` (cloud sync). They stay dormant while `APP.cap.db` is null.
- **40-views.js**: `ACT.exportData` uses `APP.cap.downloads.save()`. The settings and review screens say data is "synced" and "Claude can read it" — not true any more.
- **70-tutor.js**: `APP.cap.sample(turns, opts)`, `APP.cap.sample.json(prompt, opts)` and `.limits()`; the footer says it "runs on your Claude usage".

**Sampler contract** — keep it, so `70-tutor.js` barely changes:
```
sample(turns, { onText({text, delta}), signal,
                tools: [{name, description, inputSchema, execute(input)}] })
  → Promise<{text, truncated}>
sample.json(prompt, opts) → Promise<parsed JSON>
sample.limits() → Promise<{tools: boolean}>
```
Errors reject with `{code, message, text?}`. The UI understands the codes handled in `TUTOR.errorText` (`rate_limited`, `cancelled`, `invalid_json`, `not_granted`, …).

## Rules
- **Offline-first:** after Phase 1 there are no runtime CDNs (fonts are self-hosted). Everything ships in the repo.
- **No secrets in git.** The Anthropic API key is typed in by the user and stored only on the device.
- **Honesty in content and tutor:**
  - Never give trade signals or predictions.
  - Never promise profit.
  - ESMA (2018): 74–89% of retail CFD accounts lose money.
  - Facts carry source tags (`COURSE.SOURCES`).
- **Already corrected:** 30% wins at 3R and 60% wins at 1R both have +0.2R expectancy — neither "beats" the other.
- **Charts:** thin 2px lines, hairline grids, legends for two or more series. Colours come from the CSS tokens (light and dark).
- **Naming:** course text says "Unit N" for content and "Week N" for the calendar. The calendar lives only in `25-plan.js`.
- **Commits:** small and reviewable.
- **Before committing:** run `node tests/plan-check.mjs`, then click through Today, Plan, a lesson, an apply page, a review and the Floor with the console open.
- **External APIs:** check anything about them (Anthropic Messages API, model ids, headers, pricing) against current official docs before coding it.
