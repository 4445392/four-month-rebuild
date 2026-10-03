/* ============================================================
   EXPORT — the student's data in forms Claude (or anyone) can read
   later, without the app:
   - EXPORT.describe(): added to every JSON backup — a plain-English
     guide to every field, lookup tables that turn ids (w03b, c2, g1…)
     into names, and readable SAST dates. The data itself is unchanged,
     so a backup still restores.
   - EXPORT.markdown(): "Download for Claude" — one readable report of
     progress, explain-backs, reviews, gates, measured numbers and
     every trade, to upload to a Claude chat or Project.
   ============================================================ */
(function () {
  "use strict";
  const FORMAT = "four-month-rebuild-backup", VERSION = 2;

  /* Times are stored as epoch milliseconds; South Africa is UTC+2 all year. */
  const sast = function (ms) { return ms && isFinite(ms) ? new Date(Number(ms) + 2 * 3600e3).toISOString().slice(0, 16).replace("T", " ") + " SAST" : ""; };
  const sastDate = function (ms) { return ms && isFinite(ms) ? new Date(Number(ms) + 2 * 3600e3).toISOString().slice(0, 10) : ""; };
  const S = function () { return APP.state; };
  const allLessons = function () { const out = COURSE.ORIENTATION.slice(); COURSE.weeks.forEach(function (w) { w.L.forEach(function (l) { out.push(l); }); }); return out; };

  const ABOUT = [
    "This is a backup from The Four-Month Rebuild, a personal two-hours-a-day trading course app (Tue 1 Dec 2026 to Sun 28 Mar 2027). It is written to be readable by people and AI assistants such as Claude. To restore it, open the app: Record → Settings → Restore from a backup file.",
    "Sections: 'state' (progress), 'trades' (the trade journal), 'writing' (explain-backs, Sunday reviews, written gate answers), 'threads' (tutor conversations from the earlier claude.ai version), 'catalog' (names for every id used below).",
    "Times: fields named at, done, started, createdAt, updatedAt, passedAt, the 's' and 'e' of a lesson, and the entries of practicals[n].sessions are milliseconds since 1970-01-01 UTC. Add 2 hours for South African time (SAST, no daylight saving). Dates written as YYYY-MM-DD are SAST calendar dates; times as HH:MM are SAST.",
    "R: a trade's result in multiples of its planned risk. 1R = the amount lost if the stop is hit; +2R = won twice the risk; -1R = a full loss.",
    "state.lessons[lessonId]: s = when Simplify was done, e = when Expand was done, x = explain-back mark {verdict RIGHT | PARTIAL | BROKE, score 0-5, self: true when self-marked}, d = drill {answers, correct, score, at}, done = lesson completed. Lesson ids: o1-o6 orientation, w<unit><a|b|c> for the three lessons of each unit (see catalog.lessons).",
    "state.practicals[unit]: the 'apply' hour of each unit — sessions = completion time of each of its 3 days, notes = his note for each day, num = numbers he measured from charts, keyed as in catalog.units[unit].numbers.",
    "state.reviews['c<N>']: the Sunday review of calendar week N (c0 = orientation week; see catalog.weeks) — right = one thing done right, wrong = one thing done wrong, q = his question, cons = consistency self-score 1-5, done = when submitted.",
    "state.exams[gateId]: gates g1-g5 and the final (see catalog.exams) — attempts, best = best score %, last = latest attempt {pct, parts, written}, passedAt, override = {at, reason} when he chose to move on without passing (logged honestly).",
    "state.tasks[taskId]: special-day tasks (see catalog.tasks) — done, note. state.admission: the admission questionnaire. state.activity: SAST date → number of things done that day. state.sim: Trading Floor sessions and bars replayed. state.settings: his preferences (tutor mode, Floor unit risk, pre-trade checklist, calendar study time).",
    "trades[id]: src = bt (TradingView backtest) | bt-sim (Floor backtest on real data) | demo | live | sim (Floor, synthetic market); set = test-set tag; date/tin = entry date/time, date2/tout = exit; pair; tf = signal timeframe; sess = market session (Asia, London, Overlap, New York, Off-hours); setup = setup name; dir = L long | S short; entry, stop, target, exit = prices; risk = % of account risked; lots; R = result; rules = Y followed every rule | N broke one; broke = which rule; grade = A clean | B minor deviation | C rule broken; eb, ed, ea = emotion before/during/after, 1 calm to 5 wired; watched = W watched the chart in the trade | U unwatched; shot = screenshot link; note = what it taught him; week = course unit.",
    "writing[id]: 'x-<lessonId>' = explain-back (text, verdict, score, fb = feedback); 'rv-c<N>' = the submitted Sunday review message; 'ex-<question>-<time>' = a written gate answer (text, marks, of).",
    "threads[id]: old tutor conversations — msgs[] with r = 'u' (him) or 'a' (the tutor) and t = text.",
    "Course rules worth knowing when reading this: risk at most 1% of the account at the stop; demo trading only after Gate 4, live only after Gate 5; nobody — the tutor included — gives trade signals; ESMA (2018): 74-89% of retail CFD accounts lose money."
  ];

  function catalog() {
    const units = {}, lessons = {}, exams = {}, tasks = {}, weeks = {};
    COURSE.weeks.forEach(function (w) {
      const nums = {}; w.P.num.forEach(function (f) { nums[f.k] = f.l; });
      units[w.n] = { title: w.t, module: (P.module(w.mod) || {}).code || w.mod, numbers: nums, sundayDeliverable: w.R };
    });
    allLessons().forEach(function (l) { lessons[l.id] = { title: l.t, unit: l.week || null, lesson: l.week ? l.k + 1 : null, module: (P.module(l.mod) || {}).code || l.mod, bigIdea: l.big }; });
    Object.keys(COURSE.exams).forEach(function (id) { const e = COURSE.exams[id], d = P.examDayOf(id); exams[id] = { title: e.title, passMark: e.pass, date: d ? d.date : null }; });
    Object.keys(COURSE.TASKS).forEach(function (id) { tasks[id] = { title: COURSE.TASKS[id].t, group: COURSE.TASKS[id].group }; });
    const maxW = COURSE.PLAN.days[COURSE.PLAN.days.length - 1].cw;
    for (let cw = 0; cw <= maxW; cw++) { const days = COURSE.PLAN.weekDays(cw); weeks["c" + cw] = { name: P.weekName(cw), from: days[0].date, to: days[days.length - 1].date }; }
    return {
      plan: { start: COURSE.PLAN.start, week1: COURSE.PLAN.week1, finalDay: COURSE.PLAN.finalDay, end: COURSE.PLAN.end, days: COURSE.PLAN.days.length },
      modules: COURSE.MODULES.map(function (m) { return { key: m.key, code: m.code, title: m.title, gate: m.gate || null }; }),
      units: units, lessons: lessons, exams: exams, tasks: tasks, weeks: weeks
    };
  }

  /* Extra fields for a JSON backup (restore ignores them). */
  function describe() {
    const now = Date.now();
    return { format: FORMAT, formatVersion: VERSION, exportedSAST: sast(now), about: ABOUT, catalog: catalog() };
  }

  /* ---------- Markdown: one readable report ---------- */
  const cell = function (v) { return v === null || v === undefined || v === "" ? "—" : String(v).replace(/\|/g, "\\|").replace(/\r?\n/g, " "); };
  const table = function (head, rows) { return ["| " + head.join(" | ") + " |", "|" + head.map(function () { return "---"; }).join("|") + "|"].concat(rows.map(function (r) { return "| " + r.map(cell).join(" | ") + " |"; })).join("\n"); };
  const quote = function (t) { return String(t || "").trim().split(/\r?\n/).map(function (l) { return "> " + l; }).join("\n"); };
  const lessonState = function (id) { return S().lessons[id] || {}; };

  function markdown() {
    const s = S(), cnt = P.counts(), pace = P.pace(), nx = P.next(), out = [];
    const push = function () { for (let i = 0; i < arguments.length; i++) out.push(arguments[i]); };
    push("# The Four-Month Rebuild — " + (s.name || "my") + "'s record", "",
      "Exported " + sast(Date.now()) + " from my course app. It runs from Tue 1 Dec 2026 to Sun 28 Mar 2027: Monday to Saturday, hour 1 is a lesson (SEED: Simplify → Expand → Explain back → Drill) and hour 2 applies it; Sundays are a review, plus a gate exam when one is due.", "",
      "**How to read this:** R = a trade's result in multiples of its planned risk (1R = the loss if the stop is hit). Times are South African (SAST, UTC+2). Explain-back verdicts: RIGHT, PARTIAL or BROKE. Marks are self-marked unless noted. Nobody gives trade signals in this course — please don't either.", "");

    push("## Standing and pace", "",
      "- Standing: " + P.rank().name,
      "- Hours done: " + cnt.done + " of " + cnt.total + " · streak " + P.streak() + " day(s)",
      "- Pace: " + (!pace.started ? "starts " + U.longDate(COURSE.PLAN.start) + " (" + pace.toStart + " days away)" : pace.finished ? "finished" : pace.behind ? pace.behind + " study day(s) behind the calendar" : pace.ahead ? pace.ahead + " study day(s) ahead" : "on pace"),
      "- Next: " + (nx ? P.itemLabel(nx) + " (planned " + U.longDate(nx.date) + ")" : "programme complete"),
      "- Trading Floor: " + (s.sim.sessions || 0) + " session(s), " + (s.sim.bars || 0) + " bars replayed", "");
    if (s.admission && s.admission.done) push("- Admission questionnaire: done " + sast(s.admission.at) + (s.admission.score !== null && s.admission.score !== undefined ? " · score " + s.admission.score : ""), "");

    push("## Gates", "", table(["Gate", "Date", "Pass mark", "Attempts", "Best", "Passed", "Override"], ["g1", "g2", "g3", "g4", "g5", "final"].filter(function (g) { return COURSE.exams[g]; }).map(function (g) {
      const e = COURSE.exams[g], r = s.exams[g] || {}, d = P.examDayOf(g);
      return [e.title, d ? d.date : "", e.pass + "%", r.attempts || 0, r.best !== undefined ? r.best + "%" : "", r.passedAt ? sastDate(r.passedAt) : "", r.override ? "yes — " + r.override.reason : ""];
    })), "");

    push("## Lessons and units", "");
    const lessonRow = function (l) {
      const st = lessonState(l.id), x = st.x || {}, d = st.d || {};
      return [l.id, l.t, st.done ? sastDate(st.done) : st.s ? "started" : "", x.verdict ? x.verdict + (x.self ? " (self)" : "") : "", d.at ? (d.score || 0) + "/" + (l.q || []).length : ""];
    };
    const started = function (ls) { return ls.some(function (l) { const st = lessonState(l.id); return st.s || st.done || st.x; }); };
    push("### Orientation", "", table(["Id", "Lesson", "Done", "Explain-back", "Drill"], COURSE.ORIENTATION.map(lessonRow)), "");
    const untouched = [];
    COURSE.weeks.forEach(function (w) {
      const pr = s.practicals[w.n] || {}, sessions = (pr.sessions || []).filter(Boolean).length;
      const nums = w.P.num.map(function (f) { return pr.num && pr.num[f.k] !== undefined && pr.num[f.k] !== "" ? "  - " + f.l + ": " + pr.num[f.k] : null; }).filter(Boolean);
      if (!started(w.L) && !sessions && !nums.length) { untouched.push(w.n); return; }
      push("### Unit " + w.n + " · " + w.t + " (" + ((P.module(w.mod) || {}).code || "") + ")", "", table(["Id", "Lesson", "Done", "Explain-back", "Drill"], w.L.map(lessonRow)), "",
        "- Apply hours done: " + sessions + " of 3");
      if (nums.length) push("- Numbers measured:", nums.join("\n"));
      (pr.notes || []).forEach(function (t, k) { if (t) push("- Apply note, day " + (k + 1) + ": " + String(t).replace(/\r?\n/g, " ")); });
      push("");
    });
    if (untouched.length) push("Not started yet: Unit" + (untouched.length > 1 ? "s " : " ") + untouched.join(", ") + ".", "");

    const explains = Object.keys(APP.writing).map(function (k) { return APP.writing[k]; }).filter(function (w) { return w && w.text && (w.kind === "explain" || (!w.kind && /^x-/.test(w.id || ""))); }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    if (explains.length) {
      push("## Explain-backs (in my own words)", "");
      explains.forEach(function (w) {
        const ref = w.ref || String(w.id).slice(2), l = P.lesson(ref), fb = w.fb || {};
        push("### " + (l ? l.t : ref) + " — " + (w.verdict || "unmarked") + (w.self ? " (self-marked)" : "") + " · " + sastDate(w.at), "", quote(w.text), "");
        if (fb.broke) push("- Where it broke: " + fb.broke);
        if (fb.fix) push("- The fix: " + fb.fix);
        if (fb.followUp) push("- Follow-up question: " + fb.followUp);
        if (fb.broke || fb.fix || fb.followUp) push("");
      });
    }

    const reviewWeeks = Object.keys(s.reviews).filter(function (k) { return /^c\d+$/.test(k) && s.reviews[k] && s.reviews[k].done; }).map(function (k) { return Number(k.slice(1)); }).sort(function (a, b) { return a - b; });
    if (reviewWeeks.length) {
      push("## Sunday reviews", "");
      reviewWeeks.forEach(function (cw) {
        const w = APP.writing["rv-c" + cw];
        push("### " + P.weekName(cw) + " — submitted " + sast(s.reviews["c" + cw].done), "", "```text", (w && w.text) || REPORT.text(cw), "```", "");
      });
    }

    const written = Object.keys(APP.writing).map(function (k) { return APP.writing[k]; }).filter(function (w) { return w && (w.kind === "exam" || (!w.kind && /^ex-/.test(w.id || ""))); }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    if (written.length) {
      push("## Written gate answers", "");
      written.forEach(function (w) {
        const parts = String(w.ref || "").split(":"), ex = COURSE.exams[parts[0]], sec = ex && ex.sections.filter(function (x) { return x.kind === "written"; })[0];
        const q = sec && sec.q.filter(function (x) { return x.id === parts[1]; })[0];
        push("### " + (ex ? ex.title : parts[0]) + " — " + (w.marks !== undefined ? w.marks + "/" + w.of + " (self-marked)" : "") + " · " + sastDate(w.at), "", "**Question:** " + (q ? q.q : parts[1]), "", quote(w.text || "(no answer)"), "");
      });
    }

    const tasks = Object.keys(s.tasks).filter(function (id) { return s.tasks[id] && (s.tasks[id].done || s.tasks[id].note) && COURSE.TASKS[id]; });
    if (tasks.length) push("## Tasks", "", table(["Task", "Done", "Note"], tasks.map(function (id) { return [COURSE.TASKS[id].t, s.tasks[id].done ? sastDate(s.tasks[id].done) || "yes" : "", s.tasks[id].note || ""]; })), "");

    const trades = JOURNAL.list({});
    push("## Trade journal", "");
    if (!trades.length) push("No trades logged yet.", "");
    else {
      push("**Summary:**", "", "```text", JOURNAL.summaryForTutor(), "```", "");
      const srcName = { bt: "Backtest (TradingView)", "bt-sim": "Backtest (Floor, real data)", demo: "Demo", live: "Live", sim: "Floor (synthetic)" };
      push(table(["Date", "Time", "Source", "Set", "Pair", "TF", "Session", "Setup", "Dir", "Entry", "Stop", "Exit", "Risk %", "R", "Rules", "Broke", "Grade", "Emotion b/d/a", "Watched", "Note"], trades.map(function (t) {
        return [t.date, t.tin, srcName[t.src] || t.src, t.set, t.pair, t.tf, t.sess, t.setup, t.dir === "S" ? "Short" : t.dir === "L" ? "Long" : t.dir, t.entry, t.stop, t.exit, t.risk, isFinite(t.R) ? Number(t.R).toFixed(2) : "", t.rules, t.broke, t.grade,
          [t.eb, t.ed, t.ea].map(function (v) { return v || "–"; }).join("/"), t.watched === "W" ? "watched" : t.watched === "U" ? "unwatched" : "", t.note];
      })), "");
    }

    const days = Object.keys(s.activity).filter(function (d) { return s.activity[d] > 0; }).sort();
    push("## Consistency", "", days.length ? "Active on " + days.length + " day(s), first " + days[0] + ", last " + days[days.length - 1] + ". Days with activity: " + days.join(", ") + "." : "No activity recorded yet.", "");

    const threads = Object.keys(APP.threads).map(function (k) { return APP.threads[k]; }).filter(function (t) { return t && t.msgs && t.msgs.length; });
    if (threads.length) {
      push("## Earlier tutor conversations", "");
      threads.sort(function (a, b) { return (a.at || 0) - (b.at || 0); }).forEach(function (t) {
        push("### " + (t.title || "Conversation") + " · " + sastDate(t.updatedAt || t.at), "");
        t.msgs.forEach(function (m) { push("**" + (m.r === "u" ? "Me" : "Tutor") + ":** " + String(m.t || "").trim(), ""); });
      });
    }
    push("---", "", "Settings: name " + (s.name || "") + "; Floor unit risk " + (s.settings.unitRisk * 100) + "% per N; calendar study time " + (s.settings.studyTime || "18:00") + " SAST.", "Pre-trade checklist:", s.settings.checklist.map(function (c) { return "- " + c; }).join("\n"), "");
    return out.join("\n");
  }

  window.EXPORT = { FORMAT: FORMAT, VERSION: VERSION, about: ABOUT, catalog: catalog, describe: describe, markdown: markdown, sast: sast };
  ACT.exportClaude = function () {
    PLATFORM.download("four-month-rebuild-for-claude-" + U.today() + ".md", markdown(), "text/markdown");
    U.toast("Downloaded — upload it to a Claude chat or Project.");
  };
})();
