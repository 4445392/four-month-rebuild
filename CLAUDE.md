# The Four-Month Rebuild — notes for Claude Code

## What this is
A personal trading course for one student, Sfundo (South Africa, SAST = GMT+2). It runs from **Tue 1 Dec 2026 to Sun 28 Mar 2027**, two hours a day:

- **Mon–Sat:** hour 1 is a lesson (SEED: Simplify → Expand → Explain back → Drill); hour 2 applies that same lesson (bar replay, a lab or the Trading Floor).
- **Sunday:** the weekly review, plus a gate exam when one is due.
- 26 three-day units in nine modules (TRD 100–402), five gates and a Final, a Turtle-rules bar-replay simulator (the "Trading Floor"), labs, a trade journal and a tutor (Claude, in the free Claude app).

It started life as a claude.ai artifact. **Now:** a standalone, installable, offline-first PWA on GitHub Pages — live at https://4445392.github.io/four-month-rebuild/ (Pages serves `main`, root; every push deploys). **It must stay totally free:** no paid APIs, no paid hosting, nothing that needs a card. `ROADMAP.md` lists the phases — do them in order, one per session, and plan before editing.

## The person using it (shapes copy and tutor prompts)
- Big idea first, in plain English with an everyday analogy; then detail; formulas last. Diagrams help. He wants to be able to explain each idea to someone else.
- Prefers short answers. Writes Java at university — when course content shows code (for example the position-size calculator), use Java.
- The course is built against his past failure modes: jumping between topics, signal-sellers, long boring videos, no tracking, stress while watching charts.

## Run it
There is no build step: classic scripts, no framework, no bundler.

- Serve the folder over HTTP (service workers don't work on `file://`):
  `npm start` (or `python -m http.server 8080`), then open http://localhost:8080.
- **Tests:** `npm install` once, then `npm test` — unit tests (`node --test`: plan maths via `tests/plan-check.mjs`, the sw.js stamp, journal statistics, the .ics calendar) then Playwright browser tests in `tests/e2e/` (every route at five fixed dates, every lesson and plan day, backup → clear → restore and the claude.ai export, offline reload, the free tutor's prompts (and that nothing calls a paid API)). Any console error fails a test. Locally Playwright uses the installed Edge (`PW_CHANNEL=chrome` for Chrome); GitHub Actions (`.github/workflows/test.yml`) runs everything on Chromium on every push.
- Plan maths self-check on its own: `node tests/plan-check.mjs` — it must print `NO PLAN ERRORS`.
- **After changing any app file:** `node tools/stamp-sw.mjs`. It re-hashes the files into `sw.js` `VERSION` (otherwise installed copies never update) and fails if a file in css/js/fonts/icons is missing from `FILES`. The service worker serves cached files first, so while developing either use DevTools → Application → "Update on reload", or tap the "Update ready" toast.

## Architecture
`index.html` loads `js/*.js` as `<script defer>` in **this exact order**; later files use globals from earlier ones.

| File | Globals | What it holds |
|---|---|---|
| platform.js | `PLATFORM` | device layer: `storage` (JSON get/set/remove), `download()`, `pickFile()`, `theme`, `sync` (null) |
| 20-course-meta.js | `COURSE` | modules, ranks, sources, orientation lessons, admission questionnaire; `COURSE.week()` registers units |
| 21/22/23-course-*.js | (`COURSE.weeks`) | the 26 units — 3 lessons each (`big, plain, dia, body, ex, q, yt, src`), practical `P {task, steps[3], tools, num}`, Sunday deliverable `R` |
| 24-exams.js | `COURSE.exams`, `COURSE.GEN` | gates g1–g5 and the Final; randomised calculation generators |
| 25-plan.js | `COURSE.PLAN`, `COURSE.TASKS` | the calendar: 121 days with hour-1/hour-2 items, rest days, gate Sundays, special-day tasks |
| 50-engine.js | `ENGINE` | synthetic markets (regime Markov chain, GARCH volatility, fat tails), indicators (N, Donchian), the Turtle rules, stats |
| 10-core.js | `APP, U, STORE, P, VIEWS, ACT, go, render, softRender` | state, utilities, storage (via `PLATFORM.storage`), backups (`backupText`, `checkBackup`, `restore`), (dormant) cloud sync, progress and pacing, hash router, action registry |
| 30-diagrams.js | `DIAG` | inline-SVG teaching diagrams, themed through CSS classes |
| 54-svgcharts.js | `SVGC` | small SVG charts (line with hover, bars, R histogram) |
| 55-chart.js | `PriceChart` | canvas candlestick chart (channels, swings, trades, crosshair, pan/zoom, pick-a-level) |
| 40-views.js | `VIEWS.*` | today, day, plan, course, lesson, admission, practical (apply), review, exam, record |
| 56-floor.js | `FLOOR` | the Trading Floor: bar replay, free / Turtle S1 / S2 modes, Autopilot, CSV import |
| 60-labs.js | — | labs: size, expectancy, recovery, streaks, Monte Carlo, drills |
| 65-journal.js | `JOURNAL` | trade log, stats, segments, style diagnostic, gate evidence |
| 70-tutor.js | `TUTOR` | the free tutor: drawer and page that build a briefing + question to paste into the Claude app; prompts for marking an explain-back, three more drills, feedback on written gate answers; "Copy for Claude" |
| 75-calendar.js | `CALENDAR` | the plan as an .ics file (one 2-hour block per day at `settings.studyTime`, SAST; rest days all-day); panel on the Plan page |
| 98-pwa.js | `PWA` | service-worker registration, "Update ready" toast (never reloads mid-exam), install button / iPhone instructions in Settings |
| 99-boot.js | — | navigation chrome, `APP.cap.*` from `PLATFORM`, first render |

Outside `js/`: `sw.js` (precache + cache-first), `manifest.webmanifest`, `icons/` (made by `node tools/make-icons.mjs` from one shape list), `fonts/`.

**Patterns**
- **Routing:** `#/view/id/sub` → `VIEWS[view].render(params)` returns HTML. Optional `after()`, `leave()`, `key()` and `noSoft`.
- **Actions:** elements carry `data-act` (click), `data-chg` (change) or `data-inp` (input), which call `ACT[name](el, event)`.
- `render(toTop)` redraws the view. `softRender()` redraws without stealing focus from a field being typed in.
- **Progress** is one ordered sequence, `P.items()`, built from `COURSE.PLAN`; "next" is the first unfinished item. Never key progress by date — the calendar only measures pace (`P.pace()`).

## Data (all on the device)
**Storage:** IndexedDB database `four-month-rebuild`, object store `kv`, through `PLATFORM.storage` (`js/platform.js`). Boot awaits `storage.ready()`, which loads every key into memory; after that `get()` is synchronous and `set()` writes through at once (`flush()` resolves when it's on disk). The first run moves any `rebuild.*` localStorage keys across once (marker `rebuild.meta.migrated`) and removes them. If IndexedDB is unavailable it falls back to localStorage.

**Keys:** `rebuild.v3.state`, `.trades`, `.writing`, `.threads`, `.floor` (Floor session), `.import` (CSV import, up to 6,000 bars), `.meta` (device-only: `lastBackup`). Boot also asks for persistent storage (`navigator.storage.persist()`); Settings shows the result, usage and the last backup date.

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

## Platform layer (Phase 1 — done)
Nothing calls `window.claude` any more. `99-boot.js` fills the old `APP.cap.*` names from `js/platform.js`, so the rest of the code didn't change:

- `APP.cap.downloads.save({filename, data})` → `PLATFORM.download()`.
- `APP.cap.db`/`uid` ← `PLATFORM.sync` (`{db, uid}`, null). `STORE.pushNow`, `saveDoc`, `deleteDoc`, `initDb` and `syncCollection` stay dormant while it is null.
- All saving goes through `PLATFORM.storage` (core and Floor) — IndexedDB since Phase 3.
- Record → Settings: "Download my data" writes `{exported, app, state, trades, writing, threads}`. "Restore from a backup file" runs `STORE.checkBackup()`, shows counts, and replaces data only after confirmation. It accepts the claude.ai export (no `threads`).
- Fonts are self-hosted in `/fonts` (Latin subsets, OFL licences alongside).

**The tutor is free (it runs in the Claude app).** Nothing in the app calls an AI API, so nothing can cost money:
- `TUTOR.prompt(mode, ctx, question)` = a briefing (`rules()`: course facts, honesty rules, how he learns, the mode, and `contextText(ctx)` — the lesson, review, task, Floor session or journal he's on) + his question. The drawer's **Copy for Claude** copies it; he pastes it into the Claude app (or https://claude.ai/new).
- Marks recorded in the app are always self-marks (explain-backs against the key points, written gate answers against the rubric). Claude gives a second opinion through `TUTOR.explainPrompt`, `TUTOR.drillsPrompt` and `TUTOR.writtenPrompt` (after submitting a gate).
- Old tutor conversations (`threads`) from the claude.ai version are kept, shown read-only, and still travel in backups.
- An API key saved by the short-lived paid version (`rebuild.v3.ai`) is deleted at start-up. `tests/e2e/tutor.spec.mjs` fails if anything requests `api.anthropic.com`.
- The paid API client existed briefly (commit 84f847d, removed after); don't bring it back unless the student asks for a paid option.

## Speed and accessibility (Phase 7.3 and 7.4)
- **Speed — measured, and lazy-loading lessons was not worth it.** With the CPU slowed 6× (a slow phone), compiling all three lesson files (`21/22/23-course-*.js`, ~250 KB, ~80 KB gzipped) takes ~20 ms, and blocking them entirely made no measurable difference to start-up. Start-up time goes on opening IndexedDB (~280 ms at 6× on a first visit) and the first render (~60 ms); after the first visit the service worker serves every file from cache. Re-measure before splitting the course files; splitting them would mean separating lesson metadata (titles, ids — used by the Plan, Today and Course pages) from lesson bodies.
- **Accessibility is tested** (`tests/e2e/a11y.spec.mjs`): axe-core WCAG 2.2 AA on 15 pages, light and dark, laptop and phone width, plus no sideways scrolling at 375 px. Keep it green:
  - Don't fade text with `opacity` (locked items use a dashed border instead). `--ink-soft` is `#4F5F70` light / `#91A0AD` dark: the lightest greys that pass 4.5:1 on every surface.
  - Links and buttons are at least 24 × 24 px. Scrollable boxes (`.tablewrap`, wide diagrams) get `tabindex='0'`. Every field has a label or `aria-label`.
  - Navigation moves focus to `#main`; a "Skip to content" button comes first in the tab order.
- **Theme:** Settings → Appearance (device / light / dark) sets `data-theme` on `<html>` through `PLATFORM.theme`. The choice is kept in localStorage (`fmr-theme`, deliberately not `rebuild.*`) so the inline script in `index.html` can apply it before the first paint.

## Rules
- **Offline-first:** after Phase 1 there are no runtime CDNs (fonts are self-hosted). Everything ships in the repo.
- **No secrets in git**, and no API keys anywhere: the app is free and stays free.
- **Honesty in content and tutor:**
  - Never give trade signals or predictions.
  - Never promise profit.
  - ESMA (2018): 74–89% of retail CFD accounts lose money.
  - Facts carry source tags (`COURSE.SOURCES`).
- **Already corrected:** 30% wins at 3R and 60% wins at 1R both have +0.2R expectancy — neither "beats" the other.
- **Charts:** thin 2px lines, hairline grids, legends for two or more series. Colours come from the CSS tokens (light and dark).
- **Naming:** course text says "Unit N" for content and "Week N" for the calendar. The calendar lives only in `25-plan.js`.
- **Commits:** small and reviewable.
- **Before committing:** run `node tools/stamp-sw.mjs`, then `npm test`. Click through anything the tests don't cover with the console open.
- **External APIs:** check anything about them (Anthropic Messages API, model ids, headers, pricing) against current official docs before coding it.
