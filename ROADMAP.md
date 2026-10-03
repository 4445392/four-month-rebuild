# Roadmap: from claude.ai artifact to your own app

Each phase is one Claude Code session. Start each one with:

> Do Phase N from ROADMAP.md. Plan first and show me the plan before you change any files.

Read the plan. Once you like it, switch the permission mode to **Accept edits** and let it build. When it's finished, go through the **Done when** list yourself, then type:

> Commit this phase with a clear message and push it.

If a phase goes wrong, type: *"Undo everything since the last commit."*

---

## Phase 0 — Set up (you, about 30 minutes)

1. **Install Git for Windows** from https://git-scm.com/downloads/win (the default options are fine). You need it for GitHub, and Claude Code uses Git Bash.
2. **Install Node.js LTS** from https://nodejs.org. You'll need it for tests and small tools later.
3. **Create the GitHub repository.** On GitHub, make a new **public** repository called `four-month-rebuild`, completely empty (no README). Free GitHub Pages hosting needs a public repo. Only the course goes there — your personal data never leaves your device.
4. **Unzip this kit** to a folder, for example `C:\Users\<you>\four-month-rebuild`.
5. **Open the folder in Claude Code.** In the Claude desktop app: **Code** tab → **Local** → **Select folder** → choose that folder.
6. **Send the first prompt:**
   > Read CLAUDE.md and ROADMAP.md. Initialise git, commit the starter kit, add the remote https://github.com/YOUR-USERNAME/four-month-rebuild.git and push to main. Then start a local server and open the app in the browser pane.

**Done when:** the app opens at http://localhost:8080 showing the countdown to 1 December, and the code is on GitHub.

## Phase 1 — Stand on its own (nothing from claude.ai)

Goal: no code path depends on `window.claude`; your data can be saved to a file and restored; no CDN is needed.

1. **Add a platform layer.** Create `js/platform.js` and load it first. It exposes `window.PLATFORM` with:
   - `storage` (localStorage for now)
   - `download(filename, text)` (Blob + `<a download>`)
   - `pickFile()` for imports
   - `ai = null` and `sync = null`
2. **Change `99-boot.js`.** Stop calling `window.claude` and read capabilities from `PLATFORM`. Keep the `APP.cap.*` names so the rest of the code is untouched.
3. **Saving and restoring (Record → Settings).**
   - "Download my data" saves a real file.
   - Add "Restore from a backup file": it validates the file, shows counts, asks for confirmation, then replaces your data.
   - It must accept the old claude.ai export (`{exported, state, trades, writing}`).
4. **Remove claude.ai wording.**
   - "Saved to your private cloud" becomes "Saved on this device".
   - The review page should say "copy this and paste it into Claude", not that Claude can read it.
   - The tutor footer must stop saying it runs on Claude usage.
5. **Self-host the fonts.** Put Bitter, Source Sans 3 and IBM Plex Mono (all OFL-licensed) in `/fonts` as woff2 with `@font-face`, and remove the Google Fonts link.
6. **Tutor without a key.** Where the tutor would appear, say it needs an API key (that comes in Phase 4) and that self-marking works in the meantime.

**Done when:**
- DevTools → Network shows no requests to other websites.
- Download → clear site data → restore brings everything back.
- No console errors on any page.

## Phase 2 — Make it an installable app (PWA)

1. **Manifest.** Create `manifest.webmanifest`:
   - name "The Four-Month Rebuild", short_name "Rebuild"
   - `start_url` and `scope` both `./`
   - `display: standalone`
   - colours taken from the CSS tokens
   - icons at 192, 512, and a 512 maskable
2. **Icons.** Make one SVG master that's still clear at 48px, in the brass/ink palette. Export PNGs at 180 (apple-touch-icon), 192, 512 and 512 maskable.
3. **Service worker (`sw.js`).**
   - Versioned precache of every app file (index, css, js, fonts, icons).
   - Cache-first for same-origin GET requests.
   - Delete old caches on activate.
   - Use relative paths only — the site will live under `/four-month-rebuild/`.
4. **Updates.** When a new version is waiting, show a toast "Update ready — reload". Never reload in the middle of an exam attempt.
5. **Install help.**
   - Android and desktop Chrome: catch `beforeinstallprompt` and show an "Install the app" button in Settings.
   - iPhone: show "Share → Add to Home Screen" instructions.

**Done when:**
- DevTools → Application shows the manifest with no errors and an activated service worker.
- After one load, airplane mode + reload still works.

## Phase 3 — Protect your data

1. **Move to IndexedDB.** Use a tiny wrapper, not a big library. Migrate the `rebuild.v3.*` keys once, and keep the `APP.*` maps in memory as they are now.
2. **Persistent storage.** Call `navigator.storage.persist()` and show the result in Settings.
3. **Weekly backup.** Add a "Download this week's backup" button on the Sunday review, and show "last backup: …" in Record.
4. **Floor CSV imports** (up to 6,000 rows) move to IndexedDB too, so they no longer hit localStorage's ~5 MB limit.

**Done when:** the restore round-trip still works, Settings shows storage as persisted, and a large CSV imports without errors.

## Phase 4 — The tutor, on your own API key

Your own Anthropic API key powers it, the same way your life-coach PWA works. **It bills your Anthropic API account, separately from your Claude subscription.** Set a monthly spend limit in the Anthropic Console before you start.

1. **Settings → Tutor:**
   - an API key field (masked, stored only in IndexedDB on this device, never in the repo)
   - a model picker
   - a "Test key" button
   - this month's usage, counted from the API's usage numbers
2. **Create `js/ai-anthropic.js`.** It implements the sampler contract in CLAUDE.md using the Messages API:
   - streaming (SSE) for `onText`
   - `AbortController` for the Stop button
   - a tool-use loop for the four tutor tools (`get_lesson`, `search_course`, `get_my_journal`, `get_my_progress`)
   - JSON replies for grading
   - Browser calls need the header `anthropic-dangerous-direct-browser-access: true` — check the current docs.
3. **Error codes.** Map API errors to the existing codes so `TUTOR.errorText` keeps working: 401 → bad key, 429 → `rate_limited`, 529/5xx → overloaded.
4. **No key, no problem.** Tutor buttons say "Add your key in Settings", and explain-backs and written answers stay self-marked.

**Done when:**
- An explain-back gets RIGHT / PARTIAL / BROKE feedback.
- A tutor answer streams in and Stop works.
- Gate written answers get marked.
- Removing the key breaks nothing.

## Phase 5 — Put it online and on your phone

1. **Turn on GitHub Pages.** Repo **Settings → Pages → Deploy from a branch → main / (root)**. The app goes live at `https://YOUR-USERNAME.github.io/four-month-rebuild/`.
2. **Install it.**
   - Android (Chrome): open the link → menu → **Install app**.
   - iPhone (Safari): **Share → Add to Home Screen**.
3. **Move your data.** In the claude.ai version: Record → **Download my data**. In the app: Record → **Restore from a backup file**. Data lives on each device separately, so do this on every device you use.

**Done when:** the installed app opens with no internet.

## Phase 6 — A safety net (tests and automatic checks)

1. **Tests.** Set up an npm project with Playwright and a smoke test that:
   - opens every route at fixed dates (2 Oct 2026, 1 Dec, 25 Dec, 14 Mar, 28 Mar)
   - fails on any console error

   Also run `plan-check.mjs` as a test, and add unit tests for the journal statistics.
2. **Automation.** Add a GitHub Action that runs the tests on every push.

**Done when:** `npm test` passes locally and the Action is green on GitHub.

## Phase 7 — Improvements (one per session, in this order)

1. **Calendar export.** An `.ics` file of all 121 days — each day's two hours in a 2-hour block at the time you choose. Import it into Google Calendar for reminders. This is the single biggest help with consistency.
2. **"Copy for Claude" buttons.** The Sunday message, or a question about a lesson with its context, ready to paste into the Claude app.
3. **Speed.** Load lesson content per module, only when it's needed.
4. **Polish.** Accessibility and mobile (focus order, contrast, tap targets), plus a light/dark switch.
5. **Optional sync** between phone and laptop, only if you really need it — for example, a free hosted database with a login. Otherwise keep using backup files.

## Fitting it around 1 December

- **Before 1 Dec:** Phases 0–3 and 5 — the app works on its own, your data is safe, and it's on your phone.
- **Week 1–2:** Phase 4. The tutor can wait, because orientation week works fine with self-marking.
- **Later:** Phases 6–7.
