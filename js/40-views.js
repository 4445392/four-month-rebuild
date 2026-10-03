/* ============================================================
   VIEWS — Today, Course, Lesson (SEED), Admission, Practical,
   Review, Exam, Record.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const S = function () { return APP.state; };

  /* ---------- shared bits ---------- */
  const chip = function (text, kind) { return "<span class='chip " + (kind || "") + "'>" + esc(text) + "</span>"; };
  const modChip = function (key) { const m = P.module(key); return m ? "<span class='code'>" + esc(m.code) + "</span>" : ""; };
  const tutorBtn = function (label, preset, ctx) {
    return "<button class='btn ghost sm' data-act='tutorAsk' data-preset='" + esc(preset) + "' data-ctx='" + esc(ctx || "") + "'>" + esc(label) + "</button>";
  };
  const statusOf = function (it) { return P.isDone(it) ? "done" : P.isLocked(it) ? "locked" : "open"; };
  window.VIEWUTIL = { chip: chip, modChip: modChip };

  const CLOCKS = {
    lesson: [["0–10", "Simplify: read the big idea and the plain-English picture. Watch one video if you want it in your ear."], ["10–30", "Expand: read the detail slowly. Ask the tutor anything that doesn't click."], ["30–45", "Explain back: write it for someone who's never traded. Get it checked."], ["45–60", "Drill: answer the questions. Read every explanation, including the ones you got right."]],
    practical: [["0–5", "Re-read today's big idea — the one you just learned."], ["5–50", "Do today's apply step. Log as you go."], ["50–60", "Notes: what the data said, and what surprised you."]],
    review: [["0–20", "Compile the week: lessons, apply steps, numbers, trades."], ["20–40", "Write one thing right, one thing wrong, and your question."], ["40–60", "Pre-review with the tutor, submit, and send it to Claude."]],
    exam: [["0–60", "Sit the gate calmly. 80% to pass. Take the full hour if you need it."]]
  };
  const clockHTML = function (type) { return "<ul class='clock'>" + (CLOCKS[type] || []).map(function (r) { return "<li><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>"; }).join("") + "</ul>"; };

  /* ================= TODAY ================= */
  VIEWS.today = {
    render: function () {
      const pace = P.pace(), nx = P.next(), cnt = P.counts(), rank = P.rank();
      let h = "<div class='page'>";
      if (!pace.started) {
        h += countdownHTML(pace);
        h += "<div class='label'>Your first day</div>" + dayCard(COURSE.PLAN.days[0], {});
      } else if (!nx) {
        h += "<section class='hero'><div class='eyebrow'>Programme complete</div><h1>You've finished the Four-Month Rebuild.</h1><p class='lede'>Your record is in the Record tab. What comes next starts from your scaling plan — bring it to Claude.</p></section>";
      } else {
        h += dayCard(COURSE.PLAN.days[nx.d], { pace: paceHTML(pace, nx) });
      }
      h += "<section class='tiles'>" +
        "<div class='tile'><div class='label'>Standing</div><div class='val'>" + esc(rank.name) + "</div><div class='sub'>" + esc(rank.need) + "</div></div>" +
        "<div class='tile'><div class='label'>Progress</div><div class='val'>" + cnt.done + " <small>/ " + cnt.total + " hours</small></div><div class='meter'><span style='width:" + (100 * cnt.done / cnt.total).toFixed(1) + "%'></span></div></div>" +
        "<div class='tile'><div class='label'>Consistency streak</div><div class='val'>" + P.streak() + " <small>day" + (P.streak() === 1 ? "" : "s") + "</small></div><div class='sub'>Days in a row with finished work</div></div>" +
        "<div class='tile'><div class='label'>Next gate</div><div class='val'>" + esc(nextGateLabel()) + "</div><div class='sub'>80% to pass · overrides are logged</div></div></section>";
      const cw = nx ? nx.cw : (pace.started ? COURSE.PLAN.days[pace.ti].cw : 0);
      h += weekStrip(cw, true);
      h += recentTrades();
      h += "</div>";
      return h;
    }
  };
  function paceHTML(pace, nx) {
    const today = pace.today;
    if (pace.afterEnd && pace.behind) return "<p class='pace behind'>The calendar has ended, and " + pace.behind + " study day" + (pace.behind === 1 ? " is" : "s are") + " still open. No restart — finish them in order, starting here.</p>";
    if (pace.behind > 0) {
      const inBuffer = pace.finish && pace.finish <= COURSE.PLAN.end;
      return "<p class='pace behind'>The calendar says " + esc(P.weekName(today.cw) + ", " + U.longDate(today.date)) + ". You're " + pace.behind + " study day" + (pace.behind === 1 ? "" : "s") + " behind — no restart, no skipping. Resume right here." +
        (pace.finish ? " At this pace the Final moves to " + esc(U.longDate(pace.finish)) + (inBuffer ? " — still inside your buffer days." : ".") : "") + "</p>";
    }
    if (pace.doneToday && today.kind === "rest") return "<p class='pace ok'>Today is a rest day (" + esc(today.label) + "). Nothing is due — the work below is for the next study day.</p>";
    if (pace.doneToday && pace.ahead > 0) return "<p class='pace ahead'>You're " + pace.ahead + " study day" + (pace.ahead === 1 ? "" : "s") + " ahead of the calendar. Depth beats speed — don't rush the drills.</p>";
    if (pace.doneToday) return "<p class='pace ok'>Today's two hours are done. This is the next study day's work — rest is part of the plan.</p>";
    return "<p class='pace ok'>On pace — this is today.</p>";
  }
  function countdownHTML(pace) {
    const ex = function (id) { const d = P.examDayOf(id); return d ? U.niceDate(d.date) : "—"; };
    return "<section class='hero'><div class='eyebrow'>Starts " + esc(U.longDate(COURSE.PLAN.start)) + " 2026</div><h1>" + pace.toStart + " day" + (pace.toStart === 1 ? "" : "s") + " to go</h1>" +
      "<p class='lede'>Two hours a day from 1 December to 28 March. Hour 1 is a lesson; hour 2 applies that same lesson the same day. Sundays are for your review — and a gate when one is due.</p>" +
      "<div class='kv'><div><span>Orientation</span><b>" + esc(U.niceDate(COURSE.PLAN.start)) + "</b></div><div><span>Week 1</span><b>" + esc(U.niceDate(COURSE.PLAN.week1)) + "</b></div><div><span>Gate 1</span><b>" + ex("g1") + "</b></div><div><span>Gate 2</span><b>" + ex("g2") + "</b></div>" +
      "<div><span>Gate 3</span><b>" + ex("g3") + "</b></div><div><span>Gate 4 · demo unlocks</span><b>" + ex("g4") + "</b></div><div><span>Gate 5</span><b>" + ex("g5") + "</b></div><div><span>Final</span><b>" + ex("final") + "</b></div></div>" +
      "<div><div class='label'>Before 1 December</div><ul class='blist'><li>Nothing is required. Finish your exams first.</li><li>Optional: open a free TradingView account, and pick the broker you'll demo with.</li><li>Optional: look around the Trading Floor — the Autopilot is a safe place to start.</li></ul></div>" +
      "<div class='row wrap'><a class='btn primary' href='#/plan'>See the whole plan</a><a class='btn ghost' href='#/lesson/o1'>Read Day 1 early</a></div></section>";
  }
  function nextGateLabel() {
    const order = ["g1", "g2", "g3", "g4", "g5", "final"];
    for (let k = 0; k < order.length; k++) if (!P.passed(order[k])) { const e = COURSE.exams[order[k]], d = P.examDayOf(order[k]); return e.title.split(" — ")[0] + " · " + (d ? U.niceDate(d.date) : ""); }
    return "All passed";
  }
  function recentTrades() {
    if (!window.JOURNAL) return "";
    const st = JOURNAL.stats(JOURNAL.list({ real: true }));
    if (!st.n) return "";
    return "<section class='panel'><div class='sec-head'><span class='code'>JOURNAL</span><h2>Your real-data trades so far</h2></div><div class='kv'>" +
      "<div><span>Trades</span><b>" + st.n + "</b></div><div><span>Expectancy</span><b>" + U.fmtR(st.expectancy) + "</b></div><div><span>Win rate</span><b>" + U.pct(st.winRate) + "</b></div><div><span>Adherence</span><b>" + (st.adherence === null ? "—" : U.pct(st.adherence)) + "</b></div></div>" +
      "<a class='btn ghost sm' href='#/journal'>Open the Journal</a></section>";
  }

  /* ---------- the day card: one plan day, both hours ---------- */
  const KIND = { lesson: "Lesson", practical: "Apply it", task: "Task", admission: "Admission", review: "Review", exam: "Gate exam" };
  function dayLede(day) {
    if (day.unit) { const w = P.week(day.unit); return modChip(w.mod) + " <b>Unit " + day.unit + " · " + esc(w.t) + "</b> — day " + (day.k + 1) + " of 3. " + esc(w.aim); }
    if (day.kind === "sunday") return "Look back before you go on: compile the week, name one thing right and one thing wrong, and send it to Claude." + (day.h2 ? " Then sit the gate." : "");
    if (day.kind === "rest") return "Nothing is due today. Rest is part of the plan — the next study day picks up exactly where you left off.";
    if (day.kind === "spare") return "No new work. Behind? Use today to catch up. On track? Rest — then write what April looks like.";
    if (day.cw === 0) return modChip("100") + " Orientation — the Turtle bet this programme is modelled on, and getting your desk ready.";
    const t = day.h1 && day.h1.type === "task" ? COURSE.TASKS[day.h1.id] : null;
    if (t) return modChip(t.mod) + " " + esc({ "Holiday practice": "A lighter holiday day: practise what you've learned and catch up.", "Gate 2 prep": "Three days to get ready for the gate that matters most.", "Backtest day": "Pure backtesting — volume and honesty before Gate 4.", "Revision week": "Retrieval practice across the whole course, then the Final on Sunday." }[t.group] || t.group);
    return "";
  }
  function hourHTML(it) {
    const st = statusOf(it);
    let title = P.itemLabel(it), body = "", act = "";
    const go = function (label) { return "<a class='btn " + (st === "done" ? "ghost" : "primary") + "' href='" + P.itemHref(it) + "'>" + esc(label) + "</a>"; };
    if (it.type === "lesson") {
      const l = P.lesson(it.id);
      title = l.t;
      body = "<p class='small muted'>" + (l.week ? "Lesson " + (l.k + 1) + " of 3 · " : "") + "Simplify → Expand → Explain back → Drill</p><p>" + U.inline(l.big) + "</p>";
      act = go(st === "done" ? "Open the lesson again" : "Start the lesson");
    } else if (it.type === "practical") {
      const w = P.week(it.week);
      title = w.P.task;
      body = "<p>" + U.inline(w.P.steps[it.session]) + "</p><div class='row wrap'>" + toolLinks(w.P.tools) + "</div>";
      act = go(st === "done" ? "Open your notes" : "Open the apply step");
    } else if (it.type === "task") {
      const t = COURSE.TASKS[it.id], ts = S().tasks[it.id] || {};
      title = t.t;
      body = "<p>" + U.inline(t.text) + "</p>" + ((t.tools.length || t.tutor) ? "<div class='row wrap'>" + toolLinks(t.tools) + (t.tutor && TUTOR.available() ? "<button class='btn ghost' data-act='taskTutor' data-id='" + it.id + "'>Do it with the tutor</button>" : "") + "</div>" : "") +
        "<textarea id='tn-" + it.id + "' class='notes' rows='2' data-chg='taskNote' data-id='" + it.id + "' placeholder='Notes: what you did, and what you found'" + (P.isLocked(it) ? " disabled" : "") + ">" + esc(ts.note || "") + "</textarea>";
      act = st === "done" ? "<button class='btn ghost sm' data-act='taskUndo' data-id='" + it.id + "'>Mark not done</button>" : "<button class='btn primary' data-act='taskDone' data-id='" + it.id + "'" + (P.isLocked(it) ? " disabled" : "") + ">Mark done</button>";
    } else if (it.type === "admission") {
      body = "<p>Twelve true-or-false statements about trading. No pass mark — your answers map the beliefs the course is built to replace.</p>";
      act = go(st === "done" ? "See your answers" : "Answer the questionnaire");
    } else if (it.type === "review") {
      body = "<p>Compile the week, write one thing right and one thing wrong, then send it to Claude. About an hour.</p>";
      act = go(st === "done" ? "Open your review" : "Write the review");
    } else if (it.type === "exam") {
      const e = COURSE.exams[it.id];
      body = "<p>" + esc(e.intro) + "</p>";
      act = go(st === "done" ? "See your result" : "Go to the gate");
    }
    return "<article class='hourcard " + st + "'><div class='hc-head'><span class='label'>Hour " + it.hour + " · " + esc(KIND[it.type]) + "</span>" + (st === "done" ? chip("Done", "good") : st === "locked" ? chip("Locked", "locked") : "") + "</div><h3>" + esc(title) + "</h3>" + body + "<div class='row wrap'>" + act + "</div></article>";
  }
  function dayCard(day, opts) {
    opts = opts || {};
    const its = P.dayItems(day.i);
    let h = "<section class='hero" + (day.kind === "rest" || day.kind === "spare" ? " quiet" : "") + "'><div class='eyebrow'>" + esc(P.dayEyebrow(day)) + "</div><h1>" + esc(P.dayTitle(day)) + "</h1>";
    const lede = dayLede(day);
    if (lede) h += "<p class='lede'>" + lede + "</p>";
    if (opts.pace) h += opts.pace;
    if (its.length) {
      h += "<div class='hours'>" + its.map(hourHTML).join("") + (day.kind === "sunday" && its.length === 1 ? "<article class='hourcard free'><div class='hc-head'><span class='label'>Hour 2 · Free</span></div><h3>Rest, or catch up</h3><p>No gate this week. Finish anything still open — or take the hour off.</p></article>" : "") + "</div>";
      if (its.some(function (it) { return it.type === "lesson" && it.week === 0; }) || day.unit) h += "<details class='clockbox'><summary>How to spend the two hours</summary><div class='hours slim'><div><div class='label'>Hour 1</div>" + clockHTML("lesson") + "</div><div><div class='label'>Hour 2</div>" + clockHTML("practical") + "</div></div></details>";
    }
    h += "<nav class='pager'>" + (day.i > 0 ? "<a href='#/day/" + (day.i - 1) + "'>← " + esc(U.niceDate(COURSE.PLAN.days[day.i - 1].date)) + "</a>" : "<span></span>") + "<a href='#/plan'>The whole plan</a>" + (day.i < COURSE.PLAN.days.length - 1 ? "<a href='#/day/" + (day.i + 1) + "'>" + esc(U.niceDate(COURSE.PLAN.days[day.i + 1].date)) + " →</a>" : "<span></span>") + "</nav>";
    return h + "</section>";
  }
  function cellHTML(day) {
    const st = P.dayStatus(day), isToday = day.date === U.today();
    const exam = day.kind === "sunday" && day.h2;
    const stTxt = { done: "Done", part: "Half done", open: "Open", locked: "Locked", rest: "Rest", spare: "Buffer" }[st];
    return "<a class='cell " + st + (isToday ? " today" : "") + (exam ? " gatecell" : "") + "' href='#/day/" + day.i + "'" + (isToday ? " aria-current='date'" : "") + "><span class='d'>" + esc(P.DAYS[day.dow] + " " + U.shortDate(day.date)) + "</span><span class='t'>" + esc(P.dayShort(day)) + "</span><span class='s'>" + esc(isToday ? "Today · " + stTxt : stTxt) + "</span></a>";
  }
  function weekStrip(cw, withHead) {
    const days = COURSE.PLAN.weekDays(cw); if (!days.length) return "";
    const first = days[0], last = days[days.length - 1];
    const units = []; days.forEach(function (d) { if (d.unit && units.indexOf(d.unit) < 0) units.push(d.unit); });
    let h = "<section class='panel'><div class='sec-head'><span class='code'>" + esc(P.weekName(cw).toUpperCase()) + "</span><h2>" + esc(U.niceDate(first.date) + " – " + U.niceDate(last.date)) + "</h2>" +
      (units.length ? "<span class='muted small'>" + units.map(function (n) { return "Unit " + n + " · " + esc(P.week(n).t); }).join(" &nbsp;·&nbsp; ") + "</span>" : "") + "</div><div class='weekgrid'>";
    for (let dow = 0; dow < 7; dow++) { const d = days.filter(function (x) { return x.dow === dow; })[0]; h += d ? cellHTML(d) : "<span class='cell blank' aria-hidden='true'></span>"; }
    h += "</div>" + (withHead ? "<a class='btn ghost sm' href='#/plan'>See all 17 weeks</a>" : "") + "</section>";
    return h;
  }
  window.PLANUI = { cellHTML: cellHTML, weekStrip: weekStrip, dayCard: dayCard };

  /* ---------- task actions ---------- */
  const taskState = function (id) { return (S().tasks[id] = S().tasks[id] || {}); };
  ACT.taskDone = function (el) { const t = taskState(el.dataset.id); const n = U.$("#tn-" + el.dataset.id); if (n) t.note = n.value; t.done = Date.now(); STORE.commit(true); U.toast("Done: " + COURSE.TASKS[el.dataset.id].t); render(false); };
  ACT.taskUndo = function (el) { const t = taskState(el.dataset.id); delete t.done; STORE.commit(false); render(false); };
  ACT.taskNote = function (el) { taskState(el.dataset.id).note = el.value; STORE.commit(false); };
  ACT.taskTutor = function (el) { const t = COURSE.TASKS[el.dataset.id]; TUTOR.open({ fresh: true, ctx: "task:" + el.dataset.id, mode: t.tutor.mode, text: t.tutor.prompt }); };

  /* ================= DAY ================= */
  VIEWS.day = {
    render: function (p) {
      const day = COURSE.PLAN.days[Number(p.id)];
      if (!day) return "<div class='page'><p>That day isn't in the plan. <a href='#/plan'>Open the plan</a></p></div>";
      return "<div class='page'>" + dayCard(day, {}) + weekStrip(day.cw, true) + "</div>";
    }
  };

  /* ================= PLAN ================= */
  VIEWS.plan = {
    render: function () {
      const pl = COURSE.PLAN, cnt = P.counts();
      const study = pl.days.filter(function (d) { return d.kind === "study"; }).length;
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>The calendar</div><h1>The Plan</h1><p class='lede'>Tue 1 Dec 2026 → Sun 28 Mar 2027 · " + study + " study days and " + pl.days.filter(function (d) { return d.kind === "sunday"; }).length + " Sundays, two hours each. Monday to Saturday, hour 1 is a lesson and hour 2 applies it. Sundays are for review — and a gate when one is due. Rest on 25 Dec and 1 Jan; three buffer days at the end.</p></header>";
      h += DIAG.render("fourMonths");
      h += "<div class='legend plan-legend'><span><i class='sw lg-done'></i>Done</span><span><i class='sw lg-part'></i>Half done</span><span><i class='sw lg-open'></i>Open</span><span><i class='sw lg-locked'></i>Locked</span><span><i class='sw lg-gate'></i>Gate Sunday</span><span><i class='sw lg-rest'></i>Rest or buffer</span><span class='muted'>" + cnt.done + " of " + cnt.total + " hours done</span></div>";
      const maxW = pl.days[pl.days.length - 1].cw;
      for (let cw = 0; cw <= maxW; cw++) h += weekStrip(cw, false);
      return h + "</div>";
    }
  };

  /* ================= COURSE ================= */
  VIEWS.course = {
    render: function () {
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Programme of study</div><h1>The Course</h1><p class='lede'>Nine modules, 26 units, about 220 hours from 1 December to 28 March. Each unit is three days: a lesson in hour 1, then that lesson applied in hour 2. Read ahead freely; the interactive work unlocks module by module as you pass each gate.</p><div class='row wrap'><a class='btn ghost sm' href='#/plan'>See it as a calendar</a></div></header>";
      COURSE.MODULES.forEach(function (m) {
        const unlocked = P.moduleUnlocked(m.key);
        const ls = P.moduleLessons(m.key);
        const done = ls.filter(function (id) { return S().lessons[id] && S().lessons[id].done; }).length;
        let status = unlocked ? (done === ls.length ? chip("Lessons complete", "good") : chip("Open", "open")) : chip("Locked", "locked");
        if (m.gate) status += " " + (P.passed(m.gate) ? (S().exams[m.gate].override ? chip("Gate: override", "bad") : chip("Gate passed", "good")) : chip(COURSE.exams[m.gate].title.split(" — ")[0] + " · " + U.niceDate(P.examDayOf(m.gate).date), "gate"));
        h += "<section class='module" + (unlocked ? "" : " is-locked") + "'><div class='modhead'><span class='code big'>" + esc(m.code) + "</span><div><h2>" + esc(m.title) + "</h2><p class='muted'>" + esc(m.blurb) + "</p><div class='row wrap'>" + status + " <span class='muted small'>" + m.credits + " credits" + (m.prereq ? " · prerequisite: " + esc(m.prereq) : "") + " · lessons " + done + "/" + ls.length + "</span></div></div></div>";
        if (m.key === "100") {
          h += "<div class='weekrows'><div class='weekrow'><div class='wn'>00</div><div><h3>Orientation week</h3><p class='muted small'>Tue 1 – Sun 6 Dec</p><div class='items'>";
          COURSE.ORIENTATION.forEach(function (o) { const d = P.lessonDayOf(o.id); h += itemLink({ type: "lesson", id: o.id, week: 0, mod: "100" }, (d ? U.niceDate(d.date) + " · " : "") + o.t); });
          h += itemLink({ type: "admission", week: 0, mod: "100" }, (COURSE.PLAN.admissionDay !== undefined ? U.niceDate(COURSE.PLAN.days[COURSE.PLAN.admissionDay].date) + " · " : "") + "Admission questionnaire") + "</div></div></div></div>";
        }
        m.weeks.forEach(function (n) {
          if (!n) return;
          const w = P.week(n), d0 = P.unitDayOf(n, 0), d2 = P.unitDayOf(n, 2), rcw = P.unitReviewWeek(n);
          h += "<div class='weekrows'><div class='weekrow'><div class='wn'>" + (n < 10 ? "0" : "") + n + "</div><div><h3>Unit " + n + " · " + esc(w.t) + "</h3><p class='muted small'>" + esc(U.niceDate(d0.date) + " – " + U.niceDate(d2.date)) + " · " + esc(w.aim) + "</p><div class='items'>";
          w.L.forEach(function (l, k) { const d = P.unitDayOf(n, k); h += itemLink({ type: "lesson", id: l.id, week: n, mod: w.mod }, "Day " + (k + 1) + " · " + U.niceDate(d.date) + " · " + l.t); });
          h += itemLink({ type: "practical", week: n, session: 0, mod: w.mod }, "Apply it · hour 2 of each day");
          h += "<a class='item " + (S().reviews["c" + rcw] && S().reviews["c" + rcw].done ? "done" : "open") + "' href='#/review/" + rcw + "'><span class='dot'></span>" + esc("Sunday deliverable · Week " + rcw + " review") + "</a>";
          if (w.gate || (m.gate && n === m.weeks[m.weeks.length - 1])) { const g = m.gate; h += itemLink({ type: "exam", id: g, mod: COURSE.exams[g].mod }, COURSE.exams[g].title + " · " + U.niceDate(P.examDayOf(g).date)); }
          h += "</div></div></div></div>";
        });
        h += "</section>";
      });
      return h + "</div>";
    }
  };
  function itemLink(it, label) {
    let st = statusOf(it);
    if (it.type === "practical") { const p = S().practicals[it.week]; const n = p && p.sessions ? p.sessions.filter(Boolean).length : 0; st = n === 3 ? "done" : P.isLocked(it) ? "locked" : "open"; label += " (" + n + "/3)"; }
    return "<a class='item " + st + (it.type === "exam" ? " exam" : "") + "' href='" + (it.type === "practical" ? "#/practical/" + it.week : P.itemHref(it)) + "'><span class='dot'></span>" + esc(label) + "</a>";
  }

  /* ================= LESSON (SEED) ================= */
  const STEPS = [["s", "Simplify"], ["e", "Expand"], ["x", "Explain back"], ["d", "Drill"]];
  VIEWS.lesson = {
    render: function (p) {
      const l = P.lesson(p.id);
      if (!l) return "<div class='page'><p>Lesson not found. <a href='#/course'>Back to the course</a></p></div>";
      const st = S().lessons[l.id] || {};
      const step = p.sub || APP.ui["step-" + l.id] || (st.done ? "d" : !st.s ? "s" : !st.e ? "e" : !st.x ? "x" : "d");
      const locked = !P.moduleUnlocked(l.mod);
      const w = l.week ? P.week(l.week) : null, pd = P.lessonDayOf(l.id);
      let h = "<div class='page lesson'><header class='pagehead'><div class='crumbs'>" + modChip(l.mod) + " <span>" + (l.week ? "Unit " + l.week + " · lesson " + (l.k + 1) + " of 3" : "Orientation") + (pd ? " · " + esc(P.weekName(pd.cw) + ", " + U.niceDate(pd.date)) : "") + "</span>" + (w ? " <span class='muted'>· " + esc(w.t) + "</span>" : "") + "</div>" +
        "<h1>" + esc(l.t) + "</h1><div class='srcs'>" + U.srcTags(l.src) + "</div></header>";
      if (locked) h += "<div class='banner locked'>Preview only — this module unlocks when you pass " + esc(lockReason(l.mod)) + ". You can read Simplify and Expand now; Explain back and Drill open after the gate.</div>";
      h += "<nav class='seed' aria-label='SEED steps'>" + STEPS.map(function (sp, k) {
        const done = sp[0] === "s" ? st.s : sp[0] === "e" ? st.e : sp[0] === "x" ? !!st.x : !!(st.d && st.d.at);
        return "<button class='seedstep" + (step === sp[0] ? " on" : "") + (done ? " done" : "") + "' data-act='lessonStep' data-id='" + l.id + "' data-step='" + sp[0] + "'><span class='n'>" + (k + 1) + "</span>" + sp[1] + "</button>";
      }).join("") + "</nav>";
      h += "<section class='stepbody'>" + stepHTML(l, step, st, locked) + "</section>";
      h += applyPanel(l);
      h += lessonNav(l);
      return h + "</div>";
    },
    after: function () { autosizeAll(); }
  };
  function lockReason(mod) {
    if (mod === "101" || mod === "102") return "Orientation and admission";
    const g = P.gateFor(mod);
    return COURSE.exams[g] ? COURSE.exams[g].title.split(" — ")[0] : "the previous gate";
  }
  function applyPanel(l) {
    const pd = P.lessonDayOf(l.id); if (!pd) return "";
    const it = P.dayItems(pd.i).filter(function (x) { return x.hour === 2; })[0]; if (!it) return "";
    let title = "", text = "";
    if (it.type === "practical") { const w = P.week(it.week); title = "Apply it: " + w.P.task; text = w.P.steps[it.session]; }
    else if (it.type === "task") { const t = COURSE.TASKS[it.id]; title = t.t; text = t.text; }
    else return "";
    const lessonDone = !!(S().lessons[l.id] && S().lessons[l.id].done);
    return "<section class='panel accent'><div class='sec-head'><span class='code'>HOUR 2</span><h2>" + esc(title) + "</h2>" + (P.isDone(it) ? chip("Done", "good") : "") + "</div><p>" + U.inline(text) + "</p><div class='row'><a class='btn " + (lessonDone && !P.isDone(it) ? "primary" : "ghost") + "' href='" + P.itemHref(it) + "'>" + (lessonDone ? "Go to hour 2" : "Preview hour 2") + "</a></div></section>";
  }
  function stepHTML(l, step, st, locked) {
    if (step === "s") {
      let h = "<div class='bigidea'><div class='label'>The big idea</div><p>" + U.inline(l.big) + "</p></div>";
      h += "<div class='plain'><div class='label'>In plain English</div><p>" + U.inline(l.plain) + "</p></div>";
      if (l.dia) [].concat(l.dia).forEach(function (k) { h += DIAG.render(k); });
      if (l.yt && l.yt.length) h += "<div class='watch'><div class='label'>Watch (opens YouTube search)</div>" + l.yt.map(function (q) { return "<a class='btn ghost sm' target='_blank' rel='noopener' href='https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "'>" + esc(q) + "</a>"; }).join("") + "</div>";
      h += "<div class='row'><button class='btn primary' data-act='lessonNext' data-id='" + l.id + "' data-from='s'>I've got the big idea → Expand</button>" + tutorBtn("Explain it another way", "another", "lesson:" + l.id) + "</div>";
      return h;
    }
    if (step === "e") {
      let h = "<div class='prose'>" + U.body(l.body) + "</div>";
      h += "<div class='askrow'><span class='label'>Ask the tutor</span>" + tutorBtn("Go deeper", "deeper", "lesson:" + l.id) + tutorBtn("Another analogy", "analogy", "lesson:" + l.id) + tutorBtn("Worked example", "example", "lesson:" + l.id) + tutorBtn("Quiz me on this", "quiz", "lesson:" + l.id) + "</div>";
      h += "<div class='row'><button class='btn primary' data-act='lessonNext' data-id='" + l.id + "' data-from='e'>Ready to explain it back →</button></div>";
      return h;
    }
    if (locked) return "<div class='banner locked'>Explain back and Drill unlock with the module.</div>";
    if (step === "x") {
      const wr = APP.writing["x-" + l.id];
      const draft = APP.ui["draft-" + l.id] !== undefined ? APP.ui["draft-" + l.id] : (wr ? wr.text : "");
      let h = "<div class='prompt'><div class='label'>Explain it back</div><p>" + U.inline(l.ex.p) + "</p><p class='muted small'>Write it for a friend who has never traded. Plain words first; use numbers where they help. " + (TUTOR.available() ? "The tutor marks it RIGHT, PARTIAL or BROKE and shows the first place your reasoning slipped." : "Then compare it with the model answer and mark it yourself: RIGHT, PARTIAL or BROKE. " + esc(TUTOR.noKeyText)) + "</p></div>";
      h += "<textarea id='xb-" + l.id + "' class='essay' rows='7' data-inp='draftX' data-id='" + l.id + "' placeholder='In my own words…'>" + esc(draft) + "</textarea>";
      h += "<div class='row wrap'>" + (TUTOR.available() ? "<button class='btn primary' data-act='checkExplain' data-id='" + l.id + "'>Check my explanation</button>" : "") +
        "<button class='btn " + (TUTOR.available() ? "ghost" : "primary") + "' data-act='selfMark' data-id='" + l.id + "'>" + (TUTOR.available() ? "Self-mark instead" : "Show the model answer and self-mark") + "</button></div>";
      h += "<div id='xfb-" + l.id + "'>" + (st.x ? feedbackHTML(st.x, wr, l) : "") + "</div>";
      if (APP.ui["selfmark-" + l.id]) h += selfMarkHTML(l);
      if (st.x) h += "<div class='row'><button class='btn primary' data-act='lessonStep' data-id='" + l.id + "' data-step='d'>On to the Drill →</button></div>";
      return h;
    }
    const d = st.d || { answers: {}, correct: {} };
    let h = "<div class='drill'>";
    l.q.forEach(function (q, i) { h += questionHTML(l.id, q, i, d); });
    const answered = Object.keys(d.correct || {}).length;
    h += "</div><div class='row wrap'><span class='score'>" + (answered ? "Score: " + (d.score || 0) + " / " + l.q.length : "Answer all " + l.q.length + " questions") + "</span>" +
      (TUTOR.available() ? "<button class='btn ghost' data-act='moreDrills' data-id='" + l.id + "'>Three more from the tutor</button>" : "") + "</div>";
    const extra = APP.ui["extra-" + l.id];
    if (extra && extra.length) { h += "<div class='drill extra'><div class='label'>Extra practice (not scored)</div>"; extra.forEach(function (q, i) { h += questionHTML(l.id, q, "x" + i, APP.ui["extraAns-" + l.id] || { answers: {}, correct: {} }, true); }); h += "</div>"; }
    if (answered === l.q.length) {
      h += st.done ? "<div class='banner good'>Lesson complete. " + (d.score < l.q.length ? "Re-read the explanations for anything you missed — tomorrow builds on it." : "Clean sweep.") + "</div>" : "<div class='row'><button class='btn primary' data-act='finishLesson' data-id='" + l.id + "'>Finish lesson</button></div>";
    }
    return h;
  }
  function questionHTML(lid, q, i, d, extra) {
    const ans = d.answers ? d.answers[i] : undefined, ok = d.correct ? d.correct[i] : undefined;
    const answered = ok !== undefined;
    const id = "q-" + lid + "-" + i;
    let h = "<div class='q" + (answered ? (ok ? " right" : " wrong") : "") + "'><div class='qq'><span class='qn'>" + (extra ? "+" : "Q" + (Number(i) + 1)) + "</span>" + U.inline(q.q) + "</div>";
    if (q.k === "mcq") {
      h += "<div class='opts'>" + q.o.map(function (o, k) {
        const cls = answered ? (k === q.a ? " correct" : (k === ans ? " chosen" : "")) : "";
        return "<button class='opt" + cls + "' data-act='answer' data-lid='" + lid + "' data-i='" + i + "' data-v='" + k + "'" + (extra ? " data-extra='1'" : "") + (answered ? " disabled" : "") + ">" + U.inline(o) + "</button>";
      }).join("") + "</div>";
    } else {
      h += "<div class='row'><input id='" + id + "' class='numin' type='number' step='any' inputmode='decimal' value='" + (ans !== undefined ? esc(ans) : "") + "'" + (answered ? " disabled" : "") + " aria-label='Your answer'>" + (q.u ? "<span class='unit'>" + esc(q.u) + "</span>" : "") +
        (answered ? "" : "<button class='btn sm' data-act='answerNum' data-lid='" + lid + "' data-i='" + i + "'" + (extra ? " data-extra='1'" : "") + ">Check</button>") + "</div>";
      if (answered) h += "<div class='muted small'>Answer: " + esc(q.a) + (q.u ? " " + esc(q.u) : "") + "</div>";
    }
    if (answered) h += "<div class='why'>" + (ok ? "<b>Right.</b> " : "<b>Not quite.</b> ") + U.inline(q.w || "") + "</div>";
    return h + "</div>";
  }
  function feedbackHTML(x, wr, l) {
    const fb = (wr && wr.fb) || x.fb || {};
    const v = x.verdict || "PARTIAL";
    let h = "<div class='feedback " + v.toLowerCase() + "'><div class='verdict'>" + esc(v) + (x.score !== undefined ? " <small>" + esc(x.score) + "/5</small>" : "") + (x.self ? " <small>· self-marked</small>" : "") + "</div>";
    if (fb.right && fb.right.length) h += "<div><div class='label'>What's right</div><ul>" + fb.right.map(function (r) { return "<li>" + U.inline(r) + "</li>"; }).join("") + "</ul></div>";
    if (fb.broke) h += "<div><div class='label'>Where it broke</div><p>" + U.inline(fb.broke) + "</p></div>";
    if (fb.fix) h += "<div><div class='label'>The fix</div><p>" + U.inline(fb.fix) + "</p></div>";
    if (fb.followUp) h += "<div><div class='label'>Check yourself</div><p>" + U.inline(fb.followUp) + "</p>" + tutorBtn("Answer this with the tutor", "followup", "lesson:" + l.id) + "</div>";
    if (x.self) h += "<div><div class='label'>Model explanation</div><p>" + U.inline(l.ex.m) + "</p></div>";
    return h + "</div>";
  }
  function selfMarkHTML(l) {
    return "<div class='panel selfmark'><div class='label'>Model explanation</div><p>" + U.inline(l.ex.m) + "</p><div class='label'>Tick every point your explanation actually covered</div>" +
      l.ex.r.map(function (r, k) { return "<label class='check'><input type='checkbox' id='sm-" + l.id + "-" + k + "'> <span>" + U.inline(r) + "</span></label>"; }).join("") +
      "<div class='row'><button class='btn primary' data-act='saveSelfMark' data-id='" + l.id + "'>Save my self-mark</button></div></div>";
  }
  function lessonNav(l) {
    const all = COURSE.ORIENTATION.map(function (o) { return o.id; });
    COURSE.weeks.forEach(function (w) { w.L.forEach(function (x) { all.push(x.id); }); });
    const k = all.indexOf(l.id);
    const prev = k > 0 ? P.lesson(all[k - 1]) : null, next = k < all.length - 1 ? P.lesson(all[k + 1]) : null;
    return "<nav class='pager'>" + (prev ? "<a href='#/lesson/" + prev.id + "'>← " + esc(prev.t) + "</a>" : "<span></span>") + (next ? "<a href='#/lesson/" + next.id + "'>" + esc(next.t) + " →</a>" : "<span></span>") + "</nav>";
  }
  function autosizeAll() { U.$$("textarea.essay").forEach(function (t) { t.style.height = "auto"; t.style.height = Math.max(150, t.scrollHeight + 4) + "px"; }); }

  const lessonState = function (id) { return (S().lessons[id] = S().lessons[id] || {}); };
  ACT.lessonStep = function (el) { APP.ui["step-" + el.dataset.id] = el.dataset.step; go("lesson", el.dataset.id, el.dataset.step); };
  ACT.lessonNext = function (el) {
    const st = lessonState(el.dataset.id);
    if (el.dataset.from === "s") { st.s = Date.now(); STORE.commit(true); go("lesson", el.dataset.id, "e"); }
    else { st.e = Date.now(); STORE.commit(true); go("lesson", el.dataset.id, P.moduleUnlocked(P.lesson(el.dataset.id).mod) ? "x" : "e"); }
  };
  ACT.draftX = function (el) { APP.ui["draft-" + el.dataset.id] = el.value; el.style.height = "auto"; el.style.height = Math.max(150, el.scrollHeight + 4) + "px"; };
  ACT.checkExplain = async function (el) {
    const id = el.dataset.id, l = P.lesson(id);
    const text = (U.$("#xb-" + id).value || "").trim();
    if (text.length < 40) { U.toast("Write at least a few sentences first.", "bad"); return; }
    const box = U.$("#xfb-" + id);
    el.disabled = true; box.innerHTML = "<div class='thinking'>The tutor is reading your explanation…</div>";
    try {
      const fb = await TUTOR.gradeExplain(l, text);
      const st = lessonState(id);
      st.x = { verdict: fb.verdict, score: fb.score, at: Date.now() };
      STORE.saveWriting({ id: "x-" + id, kind: "explain", ref: id, text: text, verdict: fb.verdict, score: fb.score, fb: fb, at: Date.now() });
      delete APP.ui["draft-" + id];
      STORE.commit(true);
      render(false);
    } catch (e) {
      el.disabled = false;
      box.innerHTML = "<div class='banner bad'>" + esc(TUTOR.errorText(e)) + " You can self-mark instead.</div>";
    }
  };
  ACT.selfMark = function (el) { APP.ui["selfmark-" + el.dataset.id] = true; const t = U.$("#xb-" + el.dataset.id); if (t) APP.ui["draft-" + el.dataset.id] = t.value; render(false); };
  ACT.saveSelfMark = function (el) {
    const id = el.dataset.id, l = P.lesson(id);
    const text = (U.$("#xb-" + id) ? U.$("#xb-" + id).value : APP.ui["draft-" + id] || "").trim();
    const ticks = l.ex.r.map(function (r, k) { const c = U.$("#sm-" + id + "-" + k); return !!(c && c.checked); });
    const n = ticks.filter(Boolean).length, frac = n / l.ex.r.length;
    const verdict = frac >= 0.75 ? "RIGHT" : frac >= 0.4 ? "PARTIAL" : "BROKE";
    const score = Math.round(frac * 5);
    const fb = { right: l.ex.r.filter(function (r, k) { return ticks[k]; }), broke: n < l.ex.r.length ? "Missing: " + l.ex.r.filter(function (r, k) { return !ticks[k]; }).join("; ") : "", fix: "", followUp: "" };
    const st = lessonState(id);
    st.x = { verdict: verdict, score: score, at: Date.now(), self: true };
    STORE.saveWriting({ id: "x-" + id, kind: "explain", ref: id, text: text, verdict: verdict, score: score, fb: fb, self: true, at: Date.now() });
    APP.ui["selfmark-" + id] = false; delete APP.ui["draft-" + id];
    STORE.commit(true);
    render(false);
  };
  const checkQ = function (q, v) {
    if (q.k === "mcq") return Number(v) === q.a;
    const x = parseFloat(v); if (!isFinite(x)) return null;
    const tol = q.tol !== undefined ? q.tol : Math.abs(q.a) * 0.01 + 1e-9;
    return Math.abs(x - q.a) <= tol + 1e-9;
  };
  const recordAnswer = function (lid, i, v, extra) {
    const l = P.lesson(lid);
    if (extra) {
      const qs = APP.ui["extra-" + lid] || []; const q = qs[Number(String(i).slice(1))]; if (!q) return;
      const ok = checkQ(q, v); if (ok === null) { U.toast("Enter a number.", "bad"); return; }
      const d = APP.ui["extraAns-" + lid] = APP.ui["extraAns-" + lid] || { answers: {}, correct: {} };
      d.answers[i] = v; d.correct[i] = ok; render(false); return;
    }
    const q = l.q[i]; const ok = checkQ(q, v);
    if (ok === null) { U.toast("Enter a number.", "bad"); return; }
    const st = lessonState(lid);
    st.d = st.d || { answers: {}, correct: {} };
    st.d.answers[i] = v; st.d.correct[i] = ok;
    st.d.score = Object.keys(st.d.correct).filter(function (k) { return st.d.correct[k]; }).length;
    if (Object.keys(st.d.correct).length === l.q.length) st.d.at = Date.now();
    STORE.commit(false);
    render(false);
  };
  ACT.answer = function (el) { recordAnswer(el.dataset.lid, el.dataset.extra ? el.dataset.i : Number(el.dataset.i), el.dataset.v, !!el.dataset.extra); };
  ACT.answerNum = function (el) { const inp = U.$("#q-" + el.dataset.lid + "-" + el.dataset.i); recordAnswer(el.dataset.lid, el.dataset.extra ? el.dataset.i : Number(el.dataset.i), inp ? inp.value : "", !!el.dataset.extra); };
  ACT.finishLesson = function (el) {
    const st = lessonState(el.dataset.id);
    if (!st.x) { U.toast("Explain it back first — that's the E in SEED.", "bad"); go("lesson", el.dataset.id, "x"); return; }
    st.done = Date.now(); st.s = st.s || Date.now(); st.e = st.e || Date.now();
    STORE.commit(true);
    U.toast("Lesson complete.");
    const nx = P.next();
    if (nx) location.hash = P.itemHref(nx).slice(1); else render(false);
  };
  ACT.moreDrills = async function (el) {
    const id = el.dataset.id; el.disabled = true; el.textContent = "Writing questions…";
    try { APP.ui["extra-" + id] = await TUTOR.genDrills(P.lesson(id)); APP.ui["extraAns-" + id] = { answers: {}, correct: {} }; }
    catch (e) { U.toast(TUTOR.errorText(e), "bad"); }
    render(false);
  };

  /* ================= ADMISSION ================= */
  VIEWS.admission = {
    render: function () {
      const a = S().admission;
      const orientDone = COURSE.ORIENTATION.every(function (o) { return S().lessons[o.id] && S().lessons[o.id].done; });
      let h = "<div class='page'><header class='pagehead'><div class='crumbs'>" + modChip("100") + " <span>Orientation week" + (COURSE.PLAN.admissionDay !== undefined ? " · " + esc(U.longDate(COURSE.PLAN.days[COURSE.PLAN.admissionDay].date)) : "") + "</span></div><h1>Admission Questionnaire</h1>" +
        "<p class='lede'>In the spirit of the Turtle application: twelve true-or-false statements about trading. There's no pass mark — your answers map the beliefs you'll unlearn, and which module unlearns each one.</p></header>";
      if (!orientDone) h += "<div class='banner locked'>Finish the three orientation lessons first — then come back here.</div>";
      h += "<div class='drill'>";
      COURSE.ADMISSION.forEach(function (q, i) {
        const ans = a.answers[i], answered = ans !== undefined, ok = answered && ans === q.a;
        h += "<div class='q" + (answered ? (ok ? " right" : " wrong") : "") + "'><div class='qq'><span class='qn'>" + (i + 1) + "</span>" + esc(q.s) + "</div><div class='opts two'>" +
          ["True", "False"].map(function (t, k) { const v = k === 0; const cls = answered ? (v === q.a ? " correct" : (v === ans ? " chosen" : "")) : ""; return "<button class='opt" + cls + "' data-act='admit' data-i='" + i + "' data-v='" + (v ? 1 : 0) + "'" + (answered || !orientDone ? " disabled" : "") + ">" + t + "</button>"; }).join("") + "</div>" +
          (answered ? "<div class='why'><b>" + (q.a ? "True." : "False.") + "</b> " + esc(q.w) + " <span class='muted'>Fixed in: " + esc(q.fix) + "</span></div>" : "") + "</div>";
      });
      h += "</div>";
      const n = Object.keys(a.answers).length;
      if (n === COURSE.ADMISSION.length) {
        const sc = COURSE.ADMISSION.filter(function (q, i) { return a.answers[i] === q.a; }).length;
        h += "<section class='panel accent'><h2>" + sc + " of 12 matched the evidence</h2><p>Each 'wrong' answer is a belief the programme is built to replace. Keep this list — you'll re-take the questionnaire at graduation and compare.</p>" +
          (a.done ? "<div class='banner good'>Admitted. Your standing is now Trainee.</div>" : "<label class='check'><input type='checkbox' id='pledge'> <span>I understand the gates are hard, overrides are logged in red, and my journal — not my feelings — is the evidence.</span></label><div class='row'><button class='btn primary' data-act='admitDone'>Complete admission</button></div>") + "</section>";
      }
      return h + "</div>";
    }
  };
  ACT.admit = function (el) { S().admission.answers[el.dataset.i] = el.dataset.v === "1"; STORE.commit(false); render(false); };
  ACT.admitDone = function () {
    if (!U.$("#pledge") || !U.$("#pledge").checked) { U.toast("Tick the pledge first.", "bad"); return; }
    const a = S().admission; a.done = true; a.at = Date.now();
    a.score = COURSE.ADMISSION.filter(function (q, i) { return a.answers[i] === q.a; }).length;
    STORE.commit(true); U.toast("Admitted. Welcome, Trainee."); render(false);
  };

  /* ================= PRACTICAL (the apply hours) ================= */
  VIEWS.practical = {
    render: function (p) {
      const n = Number(p.id), w = P.week(n);
      if (!w) return "<div class='page'><p>Unit not found.</p></div>";
      const focus = p.sub ? Number(p.sub) - 1 : -1;
      const locked = !P.moduleUnlocked(w.mod);
      const pr = S().practicals[n] || { sessions: [], notes: [], num: {} };
      const rcw = P.unitReviewWeek(n), rday = P.reviewDayOf(rcw);
      let h = "<div class='page'><header class='pagehead'><div class='crumbs'>" + modChip(w.mod) + " <span>Unit " + n + " · hour 2 of each day</span> <span class='muted'>· " + esc(w.t) + "</span></div><h1>Apply it — " + esc(w.t) + "</h1><p class='lede'>" + esc(w.P.task) + "</p></header>";
      if (locked) h += "<div class='banner locked'>Preview only — unlocks with the module.</div>";
      h += "<div class='sessions'>";
      w.P.steps.forEach(function (stp, k) {
        const done = pr.sessions && pr.sessions[k];
        const d = P.unitDayOf(n, k), l = w.L[k];
        h += "<section class='session" + (done ? " done" : "") + (k === focus ? " focus" : "") + "' id='ses-" + k + "'><div class='sh'><span class='code'>DAY " + (k + 1) + " · " + esc(d ? U.niceDate(d.date).toUpperCase() : "") + "</span>" + (done ? chip("Done", "good") : "") + "</div>" +
          "<p class='small muted'>After hour 1: <a href='#/lesson/" + l.id + "'>" + esc(l.t) + "</a></p><p>" + U.inline(stp) + "</p>" +
          "<textarea id='pn-" + n + "-" + k + "' class='notes' rows='3' data-chg='pracNote' data-w='" + n + "' data-k='" + k + "' placeholder='Notes: what you did, what the data said, what surprised you'" + (locked ? " disabled" : "") + ">" + esc((pr.notes && pr.notes[k]) || "") + "</textarea>" +
          (done ? "" : "<button class='btn " + (k === (focus >= 0 ? focus : firstOpenSession(pr)) ? "primary" : "") + "' data-act='pracDone' data-w='" + n + "' data-k='" + k + "'" + (locked ? " disabled" : "") + ">Mark day " + (k + 1) + " done</button>") + "</section>";
      });
      h += "</div>";
      if (n === 18) h += "<section class='panel'><div class='sec-head'><span class='code'>PLUS</span><h2>Three backtest days before Gate 4</h2></div><p>Thursday to Saturday this week are pure backtesting: finish v1-A, run v2-B on a different period, and write where your system loses. Then Gate 4 on Sunday.</p><div class='row wrap'>" +
        ["b1a", "b2a", "b3a"].map(function (id) { const di = COURSE.PLAN.taskDay[id]; return "<a class='btn ghost sm' href='#/day/" + di + "'>" + esc(U.niceDate(COURSE.PLAN.days[di].date)) + "</a>"; }).join("") + "</div></section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>TOOLS</span><h2>For this unit</h2></div><div class='row wrap'>" + toolLinks(w.P.tools) + "</div></section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>ALMANAC</span><h2>Your numbers</h2></div><p class='muted small'>These go into your Almanac — the record of what you have measured about markets. They save as you type.</p><div class='form'>";
      w.P.num.forEach(function (f) {
        h += "<label class='field'><span>" + esc(f.l) + "</span><input id='num-" + n + "-" + f.k + "' type='" + (f.t === "number" ? "number" : "text") + "' step='any' value='" + esc(pr.num && pr.num[f.k] !== undefined ? pr.num[f.k] : "") + "' data-chg='pracNum' data-w='" + n + "' data-k='" + esc(f.k) + "'" + (locked ? " disabled" : "") + "></label>";
      });
      h += "</div></section><section class='panel'><div class='sec-head'><span class='code'>SUNDAY</span><h2>What you'll send" + (rday ? " on " + esc(U.longDate(rday.date)) : "") + "</h2></div><p>" + U.inline(w.R) + "</p><a class='btn ghost' href='#/review/" + rcw + "'>Go to the " + esc(P.weekName(rcw)) + " review</a></section>";
      return h + "</div>";
    },
    after: function (p) { if (p.sub) { const el = U.$("#ses-" + (Number(p.sub) - 1)); if (el && el.scrollIntoView) try { el.scrollIntoView({ block: "center" }); } catch (e) { /* ignore */ } } }
  };
  function firstOpenSession(pr) { for (let k = 0; k < 3; k++) if (!(pr.sessions && pr.sessions[k])) return k; return -1; }
  function toolLinks(tools) {
    const map = { "lab:size": ["Position Size lab", "#/labs/size"], "lab:expectancy": ["Expectancy lab", "#/labs/expectancy"], "lab:recovery": ["Recovery lab", "#/labs/recovery"], "lab:streaks": ["Streaks lab", "#/labs/streaks"], "lab:mc": ["Monte Carlo lab", "#/labs/mc"], "lab:drills": ["Math Drills", "#/labs/drills"], "floor": ["Trading Floor", "#/floor"], "floor:auto": ["Turtle Autopilot", "#/floor/auto"], "journal": ["Journal", "#/journal"], "admission": ["Your admission answers", "#/admission"], "gate:g4": ["Gate 4", "#/exam/g4"] };
    return (tools || []).map(function (t) {
      if (t === "tv") return "<a class='btn ghost' target='_blank' rel='noopener' href='https://www.tradingview.com/chart/'>TradingView (Bar Replay)</a>";
      if (t === "turtlepdf") return "<a class='btn ghost' target='_blank' rel='noopener' href='https://oxfordstrat.com/coasdfASD32/uploads/2016/01/turtle-rules.pdf'>The original Turtle rules (PDF)</a>";
      const m = map[t]; return m ? "<a class='btn ghost' href='" + m[1] + "'>" + esc(m[0]) + "</a>" : "";
    }).join("");
  }
  const pracState = function (n) { const p = S().practicals[n] = S().practicals[n] || { sessions: [], notes: [], num: {} }; p.sessions = p.sessions || []; p.notes = p.notes || []; p.num = p.num || {}; return p; };
  ACT.pracDone = function (el) {
    const p = pracState(el.dataset.w); const t = U.$("#pn-" + el.dataset.w + "-" + el.dataset.k); if (t) p.notes[el.dataset.k] = t.value; p.sessions[el.dataset.k] = Date.now(); STORE.commit(true);
    U.toast("Day " + (Number(el.dataset.k) + 1) + " applied — today's two hours are done.");
    render(false);
  };
  ACT.pracNote = function (el) { const p = pracState(el.dataset.w); p.notes[el.dataset.k] = el.value; STORE.commit(false); };
  ACT.pracNum = function (el) { const p = pracState(el.dataset.w); const v = el.type === "number" ? (el.value === "" ? undefined : parseFloat(el.value)) : el.value; if (v === undefined || v === "") delete p.num[el.dataset.k]; else p.num[el.dataset.k] = v; STORE.commit(false); U.toast("Saved to your Almanac."); };

  /* ================= REVIEW (one per calendar week) ================= */
  VIEWS.review = {
    render: function (p) {
      const cw = Number(p.id), rday = P.reviewDayOf(cw);
      if (!rday) return "<div class='page'><p>That week isn't in the plan.</p></div>";
      const rv = S().reviews["c" + cw] || {};
      const sum = weekSummary(cw);
      let h = "<div class='page'><header class='pagehead'><div class='crumbs'><span class='code'>SUNDAY</span> <span>" + esc(U.longDate(rday.date)) + "</span></div><h1>" + esc(P.weekName(cw)) + " review</h1>" +
        "<p class='lede'>" + (sum.units.length ? "This week: " + sum.units.map(function (n) { return "Unit " + n + " · " + esc(P.week(n).t); }).join(" and ") + "." : esc(P.dayTitle(COURSE.PLAN.weekDays(cw)[0])) + ".") + " Compile it, be honest about it, and send it to Claude.</p></header>";
      if (sum.dueUnits.length) h += "<section class='panel'><div class='sec-head'><span class='code'>DUE</span><h2>What this review must contain</h2></div>" + sum.dueUnits.map(function (n) { return "<p><b>Unit " + n + ":</b> " + U.inline(P.week(n).R) + "</p>"; }).join("") + "</section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>THE WEEK</span><h2>Compiled for you</h2></div><div class='kv'>" +
        "<div><span>Hours done</span><b>" + sum.done + " / " + sum.planned + "</b></div><div><span>Lessons</span><b>" + sum.lessons + " / " + sum.lessonsPlanned + "</b></div><div><span>Numbers recorded</span><b>" + sum.nums + " / " + sum.numsPlanned + "</b></div>" +
        "<div><span>Trades logged</span><b>" + sum.stats.n + "</b></div><div><span>Expectancy</span><b>" + (sum.stats.n ? U.fmtR(sum.stats.expectancy) : "—") + "</b></div><div><span>Adherence</span><b>" + (sum.stats.adherence === null ? "—" : U.pct(sum.stats.adherence)) + "</b></div></div>" +
        (sum.verdicts.length ? "<p class='small muted'>Explain-backs: " + sum.verdicts.map(function (v) { return esc(v); }).join(" · ") + "</p>" : "") + "</section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>YOU</span><h2>Your honest account</h2></div><div class='form'>" +
        field("rv-right", "One thing I did right this week", rv.right, cw) + field("rv-wrong", "One thing I did wrong (mandatory — 'nothing' means you weren't looking)", rv.wrong, cw) +
        field("rv-q", "The question I want answered", rv.q, cw) +
        "<label class='field'><span>How consistent was I this week? (1 = barely showed up, 5 = both hours, every day, on time)</span><input id='rv-cons' type='number' min='1' max='5' value='" + esc(rv.cons || "") + "' data-chg='rvField' data-w='" + cw + "' data-k='cons'></label></div>" +
        "<div class='row wrap'>" + (TUTOR.available() ? "<button class='btn' data-act='preReview' data-w='" + cw + "'>Pre-review with the tutor</button>" : "") +
        "<button class='btn primary' data-act='submitReview' data-w='" + cw + "'>" + (rv.done ? "Update my review" : "Submit my review") + "</button></div>" +
        (rv.done ? "<div class='banner good'>Submitted " + esc(new Date(rv.done).toLocaleString("en-ZA")) + ". Copy your Sunday message below and paste it into Claude.</div>" : "") + "</section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>FOR CLAUDE</span><h2>Your Sunday message</h2></div><textarea id='rv-out' class='report' rows='12' readonly>" + esc(reportText(cw)) + "</textarea><div class='row'><button class='btn ghost' data-act='copyReport'>Copy</button></div></section>";
      if (rday.h2 && rday.h2.type === "exam") { const ex = COURSE.exams[rday.h2.id]; h += "<section class='panel gate'><div class='sec-head'><span class='code'>HOUR 2 · GATE</span><h2>" + esc(ex.title) + "</h2></div><p>" + esc(ex.intro) + "</p><a class='btn primary' href='#/exam/" + ex.id + "'>Go to the gate</a></section>"; }
      return h + "</div>";
    }
  };
  function field(id, label, val, cw) { return "<label class='field'><span>" + esc(label) + "</span><textarea id='" + id + "' rows='2' data-chg='rvField' data-w='" + cw + "' data-k='" + id.replace("rv-", "") + "'>" + esc(val || "") + "</textarea></label>"; }
  function weekRange(cw) {
    const days = COURSE.PLAN.weekDays(cw);
    const a = U.parseISO(days[0].date), b = U.parseISO(days[days.length - 1].date); b.setDate(b.getDate() + 1);
    if (days[0].dow > 0) a.setDate(a.getDate() - days[0].dow);
    return [a.getTime(), b.getTime()];
  }
  function weekSummary(cw) {
    const s = S(), days = COURSE.PLAN.weekDays(cw);
    let planned = 0, done = 0, lessons = 0, lessonsPlanned = 0;
    const units = [], verdicts = [];
    days.forEach(function (d) {
      P.dayItems(d.i).forEach(function (it) {
        if (it.type === "review") return;
        planned++; if (P.isDone(it)) done++;
        if (it.type === "lesson") { lessonsPlanned++; if (P.isDone(it)) lessons++; const x = s.lessons[it.id] && s.lessons[it.id].x; if (x) verdicts.push(it.id + " " + x.verdict); }
      });
      if (d.unit && units.indexOf(d.unit) < 0) units.push(d.unit);
    });
    const dueUnits = units.filter(function (n) { return P.unitReviewWeek(n) === cw; });
    let nums = 0, numsPlanned = 0;
    dueUnits.forEach(function (n) { const pn = (s.practicals[n] || {}).num || {}; P.week(n).P.num.forEach(function (f) { numsPlanned++; if (pn[f.k] !== undefined && pn[f.k] !== "") nums++; }); });
    const rg = weekRange(cw);
    const trades = window.JOURNAL ? JOURNAL.all().filter(function (t) { const c = t.createdAt || t.updatedAt || 0; return c >= rg[0] && c < rg[1]; }) : [];
    const stats = window.JOURNAL ? JOURNAL.stats(trades) : { n: 0, adherence: null };
    const tasks = [];
    days.forEach(function (d) { P.dayItems(d.i).forEach(function (it) { if (it.type === "task") { const ts = s.tasks[it.id] || {}; tasks.push({ id: it.id, t: COURSE.TASKS[it.id].t, done: !!ts.done, note: ts.note || "" }); } }); });
    return { planned: planned, done: done, lessons: lessons, lessonsPlanned: lessonsPlanned, units: units, dueUnits: dueUnits, nums: nums, numsPlanned: numsPlanned, stats: stats, trades: trades, verdicts: verdicts, tasks: tasks };
  }
  function reportText(cw) {
    const s = S(), rv = s.reviews["c" + cw] || {}, sum = weekSummary(cw), cnt = P.counts(), rday = P.reviewDayOf(cw), pace = P.pace();
    const lines = [];
    lines.push("THE FOUR-MONTH REBUILD — " + P.weekName(cw) + " review (" + (rday ? U.longDate(rday.date) : "") + ")");
    lines.push("Standing: " + P.rank().name + " · Progress " + cnt.done + "/" + cnt.total + " hours · " + (pace.started ? (pace.behind ? pace.behind + " study day(s) behind the calendar" : pace.ahead ? pace.ahead + " study day(s) ahead" : "on pace") : "not started"));
    if (sum.units.length) lines.push("This week: " + sum.units.map(function (n) { return "Unit " + n + " " + P.week(n).t; }).join("; "));
    lines.push("Hours done " + sum.done + "/" + sum.planned + " · Lessons " + sum.lessons + "/" + sum.lessonsPlanned + " · Consistency self-score: " + (rv.cons || "—") + "/5");
    if (sum.verdicts.length) lines.push("Explain-back verdicts: " + sum.verdicts.join(", "));
    sum.dueUnits.forEach(function (n) {
      const w = P.week(n), pr = s.practicals[n] || {};
      const numLines = w.P.num.map(function (f) { return pr.num && pr.num[f.k] !== undefined && pr.num[f.k] !== "" ? "  • " + f.l + ": " + pr.num[f.k] : null; }).filter(Boolean);
      lines.push("Unit " + n + " numbers:" + (numLines.length ? "\n" + numLines.join("\n") : " (none recorded)"));
      const notes = (pr.notes || []).map(function (t, k) { return t ? "  • Day " + (k + 1) + ": " + t : null; }).filter(Boolean);
      if (notes.length) lines.push("Unit " + n + " apply notes:\n" + notes.join("\n"));
    });
    const tn = sum.tasks.filter(function (t) { return t.note || t.done; }).map(function (t) { return "  • " + t.t + (t.done ? " (done)" : " (open)") + (t.note ? ": " + t.note : ""); });
    if (tn.length) lines.push("Tasks:\n" + tn.join("\n"));
    const st = sum.stats;
    lines.push("Trades logged this week: " + st.n + (st.n ? " · expectancy " + U.fmtR(st.expectancy) + " · win rate " + U.pct(st.winRate) + " · adherence " + (st.adherence === null ? "—" : U.pct(st.adherence)) + " · grades A/B/C " + st.grades.A + "/" + st.grades.B + "/" + st.grades.C : ""));
    lines.push("One thing right: " + (rv.right || "—"));
    lines.push("One thing wrong: " + (rv.wrong || "—"));
    lines.push("My question: " + (rv.q || "—"));
    return lines.join("\n");
  }
  window.REPORT = { text: reportText, weekSummary: weekSummary };
  const rvState = function (cw) { return (S().reviews["c" + cw] = S().reviews["c" + cw] || {}); };
  ACT.rvField = function (el) { const r = rvState(el.dataset.w); r[el.dataset.k] = el.value; STORE.commit(false); const o = U.$("#rv-out"); if (o) o.value = reportText(Number(el.dataset.w)); };
  ACT.submitReview = function (el) {
    const cw = Number(el.dataset.w), r = rvState(cw);
    ["right", "wrong", "q"].forEach(function (k) { const t = U.$("#rv-" + k); if (t) r[k] = t.value; });
    const c = U.$("#rv-cons"); if (c) r.cons = c.value;
    if (!r.right || !r.wrong) { U.toast("Both 'right' and 'wrong' are mandatory.", "bad"); return; }
    r.done = Date.now();
    STORE.saveWriting({ id: "rv-c" + cw, kind: "review", ref: "week-" + cw, text: reportText(cw), at: Date.now() });
    STORE.commit(true); U.toast("Review submitted."); render(false);
  };
  ACT.preReview = function (el) { const cw = Number(el.dataset.w); ["right", "wrong", "q"].forEach(function (k) { const t = U.$("#rv-" + k); if (t) rvState(cw)[k] = t.value; }); TUTOR.open({ ctx: "review:" + cw, preset: "prereview", mode: "coach" }); };
  ACT.copyReport = function () { const t = U.$("#rv-out") || U.$("#rec-out"); if (!t) return; t.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; } if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(function () { U.toast("Copied."); }, function () { U.toast(ok ? "Copied." : "Selected — press Ctrl/Cmd+C to copy."); }); else U.toast(ok ? "Copied." : "Selected — press Ctrl/Cmd+C to copy."); };

  /* ================= EXAM ================= */
  VIEWS.exam = {
    noSoft: true,
    render: function (p) {
      const ex = COURSE.exams[p.id];
      if (!ex) return "<div class='page'><p>Exam not found.</p></div>";
      const rec = S().exams[ex.id] || {};
      const avail = P.examAvailable(ex.id);
      const at = APP.ui.attempt && APP.ui.attempt.id === ex.id ? APP.ui.attempt : null;
      const xd = P.examDayOf(ex.id);
      let h = "<div class='page exam'><header class='pagehead'><div class='crumbs'>" + modChip(ex.mod) + " <span>" + (xd ? esc(P.weekName(xd.cw) + " · " + U.longDate(xd.date)) + " · " : "") + "Gate</span></div><h1>" + esc(ex.title) + "</h1><p class='lede'>" + esc(ex.intro) + "</p>" +
        "<div class='row wrap'>" + chip("Pass mark " + ex.pass + "%", "gate") + (rec.best !== undefined ? chip("Best " + rec.best + "%", rec.best >= ex.pass ? "good" : "") : "") + (rec.attempts ? chip(rec.attempts + " attempt" + (rec.attempts === 1 ? "" : "s"), "") : "") +
        (rec.passedAt ? chip("Passed", "good") : "") + (rec.override ? chip("Override logged", "bad") : "") + "</div></header>";
      if (!avail && !at) {
        h += "<div class='banner locked'>Available once every lesson in " + esc(P.module(ex.mod).code) + " is complete" + (P.moduleUnlocked(ex.mod) ? "" : " (and the module itself is unlocked)") + ".</div>";
        const miss = P.moduleLessons(ex.mod).filter(function (id) { return !(S().lessons[id] && S().lessons[id].done); });
        if (miss.length) h += "<div class='panel'><div class='label'>Still to finish</div><div class='items'>" + miss.map(function (id) { return "<a class='item open' href='#/lesson/" + id + "'><span class='dot'></span>" + esc(P.lesson(id).t) + "</a>"; }).join("") + "</div></div>";
      }
      if (!at) {
        if (rec.last) h += lastResultHTML(ex, rec.last);
        h += "<div class='row wrap'>" + (avail ? "<button class='btn primary lg' data-act='startExam' data-id='" + ex.id + "'>" + (rec.attempts ? "Start a fresh attempt" : "Start the exam") + "</button>" : "") +
          (!rec.passedAt && !rec.override ? "<button class='btn ghost' data-act='overrideOpen' data-id='" + ex.id + "'>Honest override…</button>" : "") + "</div>";
        if (APP.ui.overrideOpen === ex.id) h += "<section class='panel gate'><h3>Override " + esc(ex.title.split(" — ")[0]) + "</h3><p>This unlocks the next module without passing. It is recorded on your transcript, in red, permanently, with your reason. Use it only if you truly understand the material and can't sit the exam for a practical reason.</p><textarea id='ovr' rows='3' placeholder='Why are you overriding this gate?'></textarea><div class='row'><button class='btn danger' data-act='overrideDo' data-id='" + ex.id + "'>Log the override</button><button class='btn ghost' data-act='overrideCancel'>Cancel</button></div></section>";
        return h + "</div>";
      }
      h += attemptHTML(ex, at);
      return h + "</div>";
    },
    after: function (p) { if (APP.ui.attempt && APP.ui.attempt.id === p.id) mountExamCharts(APP.ui.attempt); },
    leave: function () { if (APP.ui.examCharts) { APP.ui.examCharts.forEach(function (c) { c.destroy(); }); APP.ui.examCharts = null; } }
  };
  function lastResultHTML(ex, last) {
    let h = "<section class='panel " + (last.pct >= ex.pass ? "good" : "bad") + "'><div class='sec-head'><span class='code'>LAST ATTEMPT</span><h2>" + last.pct + "% — " + (last.pct >= ex.pass ? "passed" : "not yet") + "</h2></div>";
    if (last.parts) h += "<div class='kv'>" + last.parts.map(function (p) { return "<div><span>" + esc(p.label) + "</span><b>" + p.got + " / " + p.of + "</b></div>"; }).join("") + "</div>";
    if (last.written) last.written.forEach(function (w) { h += "<div class='wfb'><div class='label'>" + esc(w.label) + " — " + w.marks + "/" + w.of + "</div>" + (w.comment ? "<p>" + U.inline(w.comment) + "</p>" : "") + (w.missed && w.missed.length ? "<p class='small'><b>Missed:</b> " + w.missed.map(esc).join("; ") + "</p>" : "") + "</div>"; });
    return h + "</section>";
  }
  ACT.overrideOpen = function (el) { APP.ui.overrideOpen = el.dataset.id; render(false); };
  ACT.overrideCancel = function () { APP.ui.overrideOpen = null; render(false); };
  ACT.overrideDo = function (el) {
    const r = (U.$("#ovr").value || "").trim(); if (r.length < 10) { U.toast("Write a real reason.", "bad"); return; }
    const rec = S().exams[el.dataset.id] = S().exams[el.dataset.id] || {};
    rec.override = { at: Date.now(), reason: r }; APP.ui.overrideOpen = null; STORE.commit(true); U.toast("Override logged."); render(false);
  };

  /* ----- attempt building ----- */
  ACT.startExam = function (el) {
    const ex = COURSE.exams[el.dataset.id];
    const at = { id: ex.id, started: Date.now(), charts: [], gen: [], answers: {}, written: {}, submitted: false };
    ex.sections.forEach(function (sec) {
      if (sec.kind === "chart") {
        for (let k = 0; k < sec.n; k++) at.charts.push(makeChartQuestion());
      }
      if (sec.kind === "gen") at.gen = sec.items.map(function (key) { return COURSE.GEN[key](); });
    });
    APP.ui.attempt = at;
    render(true);
  };
  function makeChartQuestion() {
    for (let tries = 0; tries < 40; tries++) {
      const spec = ENGINE.SPECS[Math.floor(Math.random() * ENGINE.SPECS.length)];
      const seed = Math.floor(Math.random() * 1e9);
      const M = ENGINE.genMarket(spec, seed, 700);
      const end = 200 + Math.floor(Math.random() * 450);
      const an = ENGINE.analyzeStructure(M, end, 100);
      if (!an || an.h2.i < end - 60 || an.l2.i < end - 60) continue;
      const want = ["Uptrend", "Downtrend", "Range"][Math.floor(Math.random() * 3)];
      if (tries < 30 && an.state !== want) continue;
      const N = ENGINE.indicators(M).N[end];
      const opts = U.shuffle([an.h2, an.l2, an.h1, an.l1].map(function (s) { return { px: s.px, key: s === an.h2 ? "h2" : s === an.l2 ? "l2" : s === an.h1 ? "h1" : "l1" }; }));
      opts.push({ px: null, key: "none" });
      return { specId: spec.id, seed: seed, end: end, n: 700, state: an.state, h2: an.h2.px, l2: an.l2.px, h1: an.h1.px, l1: an.l1.px, choch: an.choch ? (an.state === "Uptrend" ? "l2" : "h2") : "none", N: N, pip: spec.pip, opts: opts };
    }
    return null;
  }
  const chartMarket = function (c) { const spec = ENGINE.SPECS.filter(function (s) { return s.id === c.specId; })[0]; return ENGINE.genMarket(spec, c.seed, c.n); };
  function attemptHTML(ex, at) {
    let h = "<form class='attempt' onsubmit='return false'>", qn = 0;
    ex.sections.forEach(function (sec, si) {
      if (sec.kind === "chart") {
        h += "<section class='panel'><div class='sec-head'><span class='code'>PART " + (si + 1) + "</span><h2>Read these charts cold</h2></div><p class='muted small'>No indicators. Swings use N = 3 and must be confirmed. Hover to read prices; use 'Pick on chart' then click the chart to answer a level.</p>";
        at.charts.forEach(function (c, k) {
          if (!c) return;
          const a = at.answers["c" + k] || {};
          h += "<div class='chartq'><div class='label'>Chart " + (k + 1) + "</div><div class='chartbox'><canvas id='xc-" + k + "' class='pricecanvas' height='300'></canvas></div>";
          h += "<div class='qq'>1. State by the swing definition:</div><div class='opts three'>" + ["Uptrend", "Downtrend", "Range"].map(function (s) { return "<button class='opt" + (a.state === s ? " picked" : "") + (at.submitted ? (s === c.state ? " correct" : (a.state === s ? " chosen" : "")) : "") + "' data-act='exAns' data-k='" + k + "' data-f='state' data-v='" + s + "'" + (at.submitted ? " disabled" : "") + ">" + s + "</button>"; }).join("") + "</div>";
          ["h2", "l2"].forEach(function (f, j) {
            h += "<div class='qq'>" + (j + 2) + ". Most recent confirmed swing " + (f === "h2" ? "HIGH" : "LOW") + ":</div><div class='row wrap'><button class='btn sm' data-act='exPick' data-k='" + k + "' data-f='" + f + "'" + (at.submitted ? " disabled" : "") + ">Pick on chart</button><span class='mono'>" + (a[f] !== undefined ? U.px(a[f], c.pip) : "not picked") + "</span>" +
              (at.submitted ? " <span class='" + (Math.abs((a[f] || 0) - c[f]) <= 0.35 * c.N ? "okt" : "badt") + "'>answer " + U.px(c[f], c.pip) + "</span>" : "") + "</div>";
          });
          h += "<div class='qq'>4. A close beyond which level would be a change of character?</div><div class='opts'>" + c.opts.map(function (o) {
            const lab = o.key === "none" ? "None — it's a range, so there's no trend to change" : U.px(o.px, c.pip);
            return "<button class='opt" + (a.choch === o.key ? " picked" : "") + (at.submitted ? (o.key === c.choch ? " correct" : (a.choch === o.key ? " chosen" : "")) : "") + "' data-act='exAns' data-k='" + k + "' data-f='choch' data-v='" + o.key + "'" + (at.submitted ? " disabled" : "") + ">" + esc(lab) + "</button>";
          }).join("") + "</div>";
          if (at.submitted) h += "<div class='why'><b>Answer key:</b> " + esc(c.state) + " · last swing high " + U.px(c.h2, c.pip) + " · last swing low " + U.px(c.l2, c.pip) + " · " + (c.choch === "none" ? "no CHoCH level (range)" : "CHoCH on a close beyond " + U.px(c[c.choch], c.pip)) + ". The chart now shows the confirmed swings.</div>";
          h += "</div>";
        });
        h += "</section>";
      }
      if (sec.kind === "gen") {
        h += "<section class='panel'><div class='sec-head'><span class='code'>PART " + (si + 1) + "</span><h2>Calculations</h2></div>";
        at.gen.forEach(function (q, k) {
          qn++;
          const v = at.answers["g" + k];
          const ok = at.submitted ? Math.abs(parseFloat(v) - q.a) <= q.tol + 1e-9 : null;
          h += "<div class='q" + (at.submitted ? (ok ? " right" : " wrong") : "") + "'><div class='qq'><span class='qn'>" + esc(q.t) + "</span>" + esc(q.q) + "</div><div class='row'><input id='gq-" + k + "' class='numin' type='number' step='any' value='" + esc(v === undefined ? "" : v) + "' data-chg='exGen' data-k='" + k + "'" + (at.submitted ? " disabled" : "") + " aria-label='Answer'>" + (q.u ? "<span class='unit'>" + esc(q.u) + "</span>" : "") + "</div>" +
            (at.submitted ? "<div class='why'><b>" + (ok ? "Right." : "Answer: " + q.a) + "</b> " + esc(q.w) + "</div>" : "") + "</div>";
        });
        h += "</section>";
      }
      if (sec.kind === "mcq") {
        h += "<section class='panel'><div class='sec-head'><span class='code'>PART " + (si + 1) + "</span><h2>Concepts</h2></div>";
        sec.q.forEach(function (q, k) {
          const key = "m" + si + "-" + k, v = at.answers[key];
          h += "<div class='q" + (at.submitted ? (v === q.a ? " right" : " wrong") : "") + "'><div class='qq'>" + esc(q.q) + "</div><div class='opts'>" + q.o.map(function (o, j) {
            return "<button class='opt" + (v === j ? " picked" : "") + (at.submitted ? (j === q.a ? " correct" : (v === j ? " chosen" : "")) : "") + "' data-act='exMcq' data-key='" + key + "' data-v='" + j + "'" + (at.submitted ? " disabled" : "") + ">" + esc(o) + "</button>";
          }).join("") + "</div>" + (at.submitted ? "<div class='why'>" + esc(q.w) + "</div>" : "") + "</div>";
        });
        h += "</section>";
      }
      if (sec.kind === "evidence") {
        h += "<section class='panel'><div class='sec-head'><span class='code'>PART " + (si + 1) + "</span><h2>Evidence from your Journal</h2></div><p class='muted small'>Checked automatically. Log trades in the Journal to change these.</p>";
        sec.checks.forEach(function (c) { const r = JOURNAL.evidence(c); h += "<div class='evi " + (r.ok ? "ok" : "no") + "'><span class='mark'>" + (r.ok ? "✓" : "✗") + "</span><span>" + esc(c.label) + "</span><b>" + esc(r.value) + "</b><small>" + c.marks + " marks</small></div>"; });
        h += "</section>";
      }
      if (sec.kind === "written") {
        h += "<section class='panel'><div class='sec-head'><span class='code'>PART " + (si + 1) + "</span><h2>Written" + (TUTOR.available() ? " — marked by the tutor" : " — self-marked") + "</h2></div>" + (TUTOR.available() ? "" : "<p class='small muted'>" + esc(TUTOR.noKeyText) + "</p>");
        sec.q.forEach(function (q) {
          const v = at.written[q.id] || "";
          h += "<div class='q'><div class='qq'><span class='qn'>" + q.marks + " marks</span>" + esc(q.q) + "</div>";
          if (q.usesNumbers) { const pn = (S().practicals[q.usesNumbers] || {}).num || {}; const lines = P.week(q.usesNumbers).P.num.map(function (f) { return pn[f.k] !== undefined ? f.l + ": " + pn[f.k] : null; }).filter(Boolean); h += "<div class='muted small'>Your recorded numbers (Unit " + q.usesNumbers + "): " + (lines.length ? esc(lines.join(" · ")) : "none recorded — run the Monte Carlo lab first") + "</div>"; }
          if (q.withStats && window.JOURNAL) h += "<div class='muted small'>" + esc(JOURNAL.auditLine()) + "</div>";
          h += "<textarea id='wq-" + q.id + "' class='essay' rows='8' data-chg='exWritten' data-q='" + q.id + "'" + (at.submitted ? " disabled" : "") + ">" + esc(v) + "</textarea>";
          if (at.submitted && at.wres && at.wres[q.id]) { const r = at.wres[q.id]; h += "<div class='feedback " + (r.marks / q.marks >= 0.75 ? "right" : r.marks / q.marks >= 0.4 ? "partial" : "broke") + "'><div class='verdict'>" + r.marks + " / " + q.marks + "</div>" + (r.comment ? "<p>" + U.inline(r.comment) + "</p>" : "") + (r.missed && r.missed.length ? "<div class='label'>Missed</div><ul>" + r.missed.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>" : "") + "</div>"; }
          if (!TUTOR.available() && !at.submitted) h += "<div class='selfmark'><div class='label'>Self-mark: tick each point your answer covers</div>" + q.rubric.map(function (r, k) { return "<label class='check'><input type='checkbox' id='wr-" + q.id + "-" + k + "'> <span>" + esc(r) + "</span></label>"; }).join("") + "</div>";
          h += "</div>";
        });
        h += "</section>";
      }
    });
    if (!at.submitted) h += "<div class='row wrap'><button class='btn primary lg' data-act='submitExam' data-id='" + ex.id + "' id='submitExamBtn'>Submit the exam</button><button class='btn ghost' data-act='abandonExam'>Abandon attempt</button></div>";
    else h += "<div class='row wrap'><a class='btn primary' href='" + (at.result && at.result.pct >= ex.pass ? "#/today" : "#/exam/" + ex.id) + "' data-act='closeAttempt'>" + (at.result && at.result.pct >= ex.pass ? "Continue" : "Close and review") + "</a></div>";
    if (at.result) h = "<section class='panel " + (at.result.pct >= ex.pass ? "good" : "bad") + "'><h2>" + at.result.pct + "% — " + (at.result.pct >= ex.pass ? "Gate passed." : "Not yet. " + ex.pass + "% is the bar.") + "</h2><div class='kv'>" + at.result.parts.map(function (p) { return "<div><span>" + esc(p.label) + "</span><b>" + p.got + " / " + p.of + "</b></div>"; }).join("") + "</div></section>" + h;
    return h + "</form>";
  }
  function mountExamCharts(at) {
    VIEWS.exam.leave();
    APP.ui.examCharts = [];
    at.charts.forEach(function (c, k) {
      if (!c) return;
      const cv = U.$("#xc-" + k); if (!cv || !window.PriceChart) return;
      const M = chartMarket(c);
      const ch = new PriceChart(cv, { span: 110 });
      const a = at.answers["c" + k] || {};
      const marks = [];
      if (a.h2 !== undefined) marks.push({ px: a.h2, label: "your high", cls: "pick" });
      if (a.l2 !== undefined) marks.push({ px: a.l2, label: "your low", cls: "pick" });
      if (at.submitted) { marks.push({ px: c.h2, label: "swing high", cls: "key" }); marks.push({ px: c.l2, label: "swing low", cls: "key" }); }
      ch.set({ M: M, end: c.end, blind: true, overlays: { swings: at.submitted }, marks: marks, readout: true });
      APP.ui.examCharts.push(ch);
    });
  }
  ACT.exAns = function (el) { const at = APP.ui.attempt; const k = "c" + el.dataset.k; at.answers[k] = at.answers[k] || {}; at.answers[k][el.dataset.f] = el.dataset.v; render(false); };
  ACT.exPick = function (el) {
    const at = APP.ui.attempt, k = Number(el.dataset.k), f = el.dataset.f;
    const ch = APP.ui.examCharts && APP.ui.examCharts[k]; if (!ch) return;
    U.toast("Click the chart at the " + (f === "h2" ? "swing high" : "swing low") + ".");
    ch.pick(function (px) { at.answers["c" + k] = at.answers["c" + k] || {}; at.answers["c" + k][f] = px; render(false); });
  };
  ACT.exGen = function (el) { APP.ui.attempt.answers["g" + el.dataset.k] = el.value; };
  ACT.exMcq = function (el) { APP.ui.attempt.answers[el.dataset.key] = Number(el.dataset.v); render(false); };
  ACT.exWritten = function (el) { APP.ui.attempt.written[el.dataset.q] = el.value; };
  ACT.abandonExam = function () { if (!confirmTwice("abandon")) return; APP.ui.attempt = null; render(true); };
  ACT.closeAttempt = function () { APP.ui.attempt = null; render(true); };
  function confirmTwice(key) { if (APP.ui["confirm-" + key] && Date.now() - APP.ui["confirm-" + key] < 4000) { APP.ui["confirm-" + key] = 0; return true; } APP.ui["confirm-" + key] = Date.now(); U.toast("Press again to confirm."); return false; }
  window.confirmTwice = confirmTwice;

  ACT.submitExam = async function (el) {
    const ex = COURSE.exams[el.dataset.id], at = APP.ui.attempt;
    U.$$("textarea[data-q]").forEach(function (t) { at.written[t.dataset.q] = t.value; });
    U.$$("input[data-chg='exGen']").forEach(function (i) { at.answers["g" + i.dataset.k] = i.value; });
    const parts = []; let got = 0, of = 0;
    const selfTicks = {};
    ex.sections.forEach(function (sec) { if (sec.kind === "written") sec.q.forEach(function (q) { selfTicks[q.id] = q.rubric.map(function (r, k) { const c = U.$("#wr-" + q.id + "-" + k); return !!(c && c.checked); }); }); });
    ex.sections.forEach(function (sec, si) {
      if (sec.kind === "chart") {
        let g = 0, o = 0;
        at.charts.forEach(function (c, k) { if (!c) return; const a = at.answers["c" + k] || {}; o += 4;
          if (a.state === c.state) g++;
          if (a.h2 !== undefined && Math.abs(a.h2 - c.h2) <= 0.35 * c.N) g++;
          if (a.l2 !== undefined && Math.abs(a.l2 - c.l2) <= 0.35 * c.N) g++;
          if (a.choch === c.choch) g++; });
        parts.push({ label: "Chart reading", got: g, of: o }); got += g; of += o;
      }
      if (sec.kind === "gen") { let g = 0; at.gen.forEach(function (q, k) { if (Math.abs(parseFloat(at.answers["g" + k]) - q.a) <= q.tol + 1e-9) g++; }); parts.push({ label: "Calculations", got: g, of: at.gen.length }); got += g; of += at.gen.length; }
      if (sec.kind === "mcq") { let g = 0; sec.q.forEach(function (q, k) { if (at.answers["m" + si + "-" + k] === q.a) g++; }); parts.push({ label: "Concepts", got: g, of: sec.q.length }); got += g; of += sec.q.length; }
      if (sec.kind === "evidence") { let g = 0, o = 0; sec.checks.forEach(function (c) { o += c.marks; if (JOURNAL.evidence(c).ok) g += c.marks; }); parts.push({ label: "Journal evidence", got: g, of: o }); got += g; of += o; }
    });
    const written = [];
    const wsec = ex.sections.filter(function (s) { return s.kind === "written"; })[0];
    if (wsec) {
      el.disabled = true; el.textContent = "The tutor is marking your written answers…";
      at.wres = {};
      for (let k = 0; k < wsec.q.length; k++) {
        const q = wsec.q[k], text = (at.written[q.id] || "").trim();
        let r;
        if (!text) r = { marks: 0, missed: q.rubric, comment: "No answer." };
        else if (TUTOR.available()) {
          try { r = await TUTOR.gradeWritten(q, text, examKey(ex, q, at)); }
          catch (e) { const t = selfTicks[q.id] || []; r = { marks: Math.round(q.marks * t.filter(Boolean).length / q.rubric.length), missed: q.rubric.filter(function (x, j) { return !t[j]; }), comment: "Tutor unavailable (" + TUTOR.errorText(e) + ") — marked from your self-mark ticks." }; }
        } else { const t = selfTicks[q.id] || []; r = { marks: Math.round(q.marks * t.filter(Boolean).length / q.rubric.length), missed: q.rubric.filter(function (x, j) { return !t[j]; }), comment: "Self-marked against the rubric." }; }
        r.marks = Math.max(0, Math.min(q.marks, Math.round(Number(r.marks) || 0)));
        at.wres[q.id] = r;
        written.push({ label: "Written " + (k + 1), marks: r.marks, of: q.marks, comment: r.comment, missed: r.missed });
        got += r.marks; of += q.marks;
        STORE.saveWriting({ id: "ex-" + q.id + "-" + at.started, kind: "exam", ref: ex.id + ":" + q.id, text: text, marks: r.marks, of: q.marks, fb: r, at: Date.now() });
      }
      parts.push({ label: "Written", got: written.reduce(function (a, b) { return a + b.marks; }, 0), of: written.reduce(function (a, b) { return a + b.of; }, 0) });
    }
    const pct = of ? Math.round(100 * got / of) : 0;
    at.submitted = true; at.result = { pct: pct, parts: parts };
    const rec = S().exams[ex.id] = S().exams[ex.id] || {};
    rec.attempts = (rec.attempts || 0) + 1;
    rec.best = Math.max(rec.best || 0, pct);
    rec.last = { pct: pct, parts: parts, written: written, at: Date.now() };
    if (pct >= ex.pass && !rec.passedAt) rec.passedAt = Date.now();
    STORE.commit(true);
    if (pct >= ex.pass) U.toast(ex.title.split(" — ")[0] + " passed.");
    render(true);
  };
  function examKey(ex, q, at) {
    if (q.chartRef !== undefined && at.charts[q.chartRef]) {
      const c = at.charts[q.chartRef];
      return "Answer key for Chart 1 (computed from the mechanical definition): state = " + c.state + "; most recent confirmed swing high = " + U.px(c.h2, c.pip) + " (buy-side liquidity just above it); most recent confirmed swing low = " + U.px(c.l2, c.pip) + " (sell-side liquidity just below it); change of character = " + (c.choch === "none" ? "none applies because the market is ranging" : "a close beyond " + U.px(c[c.choch], c.pip)) + ". Accept prices within about a third of a daily range of these.";
    }
    if (q.usesNumbers) { const pn = (S().practicals[q.usesNumbers] || {}).num || {}; return "The student's own recorded numbers: " + JSON.stringify(pn) + ". Model answer: " + q.model; }
    if (q.withStats && window.JOURNAL) return "Journal summary: " + JOURNAL.auditLine();
    return q.model ? "Model answer: " + q.model : "";
  }

  /* ================= RECORD ================= */
  VIEWS.record = {
    render: function () {
      const s = S(), rank = P.rank(), cnt = P.counts();
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Academic record</div><h1>Your Record</h1><p class='lede'>Standing, transcript, the Almanac of everything you've measured, your consistency, and your settings.</p></header>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>STANDING</span><h2>" + esc(rank.name) + "</h2></div><div class='ranks'>" + COURSE.RANKS.map(function (r) { return "<div class='rk" + (r.key === rank.key ? " on" : "") + "'>" + esc(r.name) + "</div>"; }).join("") + "</div>" +
        "<p class='muted small'>Trading Floor allocation at this standing: " + U.money(P.simAccount()) + " (simulated). In this programme allocation follows adherence, not profit.</p></section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>TRANSCRIPT</span><h2>Modules</h2></div><div class='tablewrap'><table class='tbl'><thead><tr><th>Code</th><th>Module</th><th>Credits</th><th>Lessons</th><th>Gate</th><th>Status</th></tr></thead><tbody>";
      COURSE.MODULES.forEach(function (m) {
        const ls = P.moduleLessons(m.key), d = ls.filter(function (id) { return s.lessons[id] && s.lessons[id].done; }).length;
        const e = m.gate ? s.exams[m.gate] || {} : null;
        let status = !P.moduleUnlocked(m.key) ? "Locked" : d < ls.length ? "In progress" : m.gate && !P.passed(m.gate) ? "Awaiting gate" : "Complete";
        if (e && e.override) status = "Override";
        h += "<tr class='" + (e && e.override ? "ovr" : "") + "'><td class='mono'>" + esc(m.code) + "</td><td>" + esc(m.title) + "</td><td class='num'>" + m.credits + "</td><td class='num'>" + d + "/" + ls.length + "</td><td class='num'>" + (m.gate ? (e.best !== undefined ? e.best + "%" : "—") : "n/a") + "</td><td>" + esc(status) + (e && e.override ? "<div class='small'>" + esc(e.override.reason) + "</div>" : "") + "</td></tr>";
      });
      h += "</tbody></table></div></section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>ALMANAC</span><h2>What you have measured</h2></div>" + almanacHTML() + "</section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>CONSISTENCY</span><h2>" + cnt.done + " of " + cnt.total + " hours · streak " + P.streak() + "</h2></div>" + gridHTML() + "</section>";
      h += settingsHTML();
      return h + "</div>";
    }
  };
  function almanacHTML() {
    const rows = [];
    COURSE.weeks.forEach(function (w) { const pn = (S().practicals[w.n] || {}).num || {}; w.P.num.forEach(function (f) { if (pn[f.k] !== undefined && pn[f.k] !== "") rows.push([w.n, w.t, f.l, pn[f.k]]); }); });
    if (!rows.length) return "<p class='muted'>Nothing yet. Every unit ends with a number — the first arrives in Unit 1.</p>";
    return "<div class='tablewrap'><table class='tbl'><thead><tr><th>Unit</th><th>Practical</th><th>Measure</th><th>Your value</th></tr></thead><tbody>" + rows.map(function (r) { return "<tr><td class='num'>" + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td class='mono'>" + esc(r[3]) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function gridHTML() {
    const pl = COURSE.PLAN, maxW = pl.days[pl.days.length - 1].cw;
    let h = "<div class='grid26'><div class='gh'></div>" + P.DAYS.map(function (d) { return "<div class='gh'>" + d.charAt(0) + "</div>"; }).join("");
    for (let cw = 0; cw <= maxW; cw++) {
      h += "<div class='gh wk'>" + (cw === 0 ? "O" : cw >= 17 ? "B" : cw) + "</div>";
      for (let dow = 0; dow < 7; dow++) {
        const d = pl.days.filter(function (x) { return x.cw === cw && x.dow === dow; })[0];
        if (!d) { h += "<span class='gc none'></span>"; continue; }
        const st = P.dayStatus(d);
        h += "<a class='gc " + st + (d.date === U.today() ? " today" : "") + "' href='#/day/" + d.i + "' title='" + esc(P.weekName(cw) + " · " + U.niceDate(d.date) + ": " + P.dayShort(d)) + "'></a>";
      }
    }
    return h + "</div><p class='muted small'>Each square is one day of the plan (O = orientation week, B = buffer days). Full = both hours done, half = one of two, outlined = today.</p>";
  }
  function settingsHTML() {
    const s = S();
    const dbLine = APP.cap.dbMode === "synced" ? "Saved on this device and synced." : APP.cap.dbMode === "connecting" ? "Connecting…" : "Saved on this device only, in this browser" + (APP.cap.dbError ? " (" + esc(APP.cap.dbError) + ")" : "") + ". Clearing the browser's data would erase it, so download a backup now and then.";
    return "<section class='panel'><div class='sec-head'><span class='code'>SETTINGS</span><h2>Settings and data</h2></div><div class='form'>" +
      "<label class='field'><span>What the tutor calls you</span><input id='set-name' type='text' value='" + esc(s.name) + "' data-chg='setName'></label>" +
      "<div class='field'><span>Your plan</span><p class='small'>Orientation " + esc(U.longDate(COURSE.PLAN.start)) + " 2026 · Week 1 " + esc(U.longDate(COURSE.PLAN.week1)) + " · Final " + esc(U.longDate(COURSE.PLAN.finalDay)) + " 2027 · buffer to " + esc(U.longDate(COURSE.PLAN.end)) + ". The calendar only measures pace — it never locks you out. To move the dates, ask Claude to re-plan.</p></div>" +
      "<label class='field'><span>Turtle unit size on the Trading Floor</span><select id='set-unit' data-chg='setUnit'><option value='0.005'" + (s.settings.unitRisk === 0.005 ? " selected" : "") + ">0.5% per N — course default (1% at the 2N stop)</option><option value='0.01'" + (s.settings.unitRisk === 0.01 ? " selected" : "") + ">1% per N — the original Turtle unit</option></select></label>" +
      "<label class='field'><span>Your pre-trade checklist (one item per line)</span><textarea id='set-check' rows='7' data-chg='setChecklist'>" + esc(s.settings.checklist.join("\n")) + "</textarea></label></div>" +
      "<p class='small'><b>Storage:</b> " + dbLine + "</p>" +
      "<div class='row wrap'><button class='btn ghost' data-act='exportData'>Download my data (JSON)</button><button class='btn ghost' data-act='restoreData'>Restore from a backup file…</button><button class='btn danger' data-act='resetAll'>Reset all progress…</button></div>" +
      "<p class='small muted'>A backup downloaded from the claude.ai version restores here too.</p>" + restoreHTML() + "</section>";
  }
  function restoreHTML() {
    const r = APP.ui.restore; if (!r) return "";
    const c = r.counts, when = c.exported && !isNaN(new Date(c.exported)) ? new Date(c.exported).toLocaleString("en-ZA") : "an unknown date";
    const rows = [["Lessons done", c.lessons], ["Apply sessions done", c.practicals], ["Reviews submitted", c.reviews], ["Gates attempted", c.exams], ["Trades", c.trades], ["Written answers", c.writing], ["Tutor conversations", c.threads]];
    return "<div class='banner bad restore' id='restore-confirm'><p><b>Restore " + esc(r.name) + "?</b> It was saved on " + esc(when) + " and contains:</p>" +
      "<div class='kv'>" + rows.map(function (x) { return "<div><span>" + esc(x[0]) + "</span><b>" + x[1] + "</b></div>"; }).join("") + "</div>" +
      "<p>This <b>replaces everything on this device</b> — progress, journal, writing and tutor conversations. If you might want your current data back, download it first.</p>" +
      "<div class='row wrap'><button class='btn danger' data-act='restoreConfirm'>Replace my data with this backup</button><button class='btn ghost' data-act='exportData'>Download my current data first</button><button class='btn ghost' data-act='restoreCancel'>Cancel</button></div></div>";
  }
  ACT.setName = function (el) { S().name = el.value.trim() || "Sfundo"; STORE.commit(false); };
  ACT.setUnit = function (el) { S().settings.unitRisk = parseFloat(el.value); STORE.commit(false); };
  ACT.setChecklist = function (el) { const lines = el.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); S().settings.checklist = lines.length ? lines : STORE.DEFAULT_CHECKLIST.slice(); STORE.commit(false); U.toast("Checklist saved."); };
  ACT.exportData = async function () {
    const data = STORE.backupText();
    if (APP.cap.downloads) { try { await APP.cap.downloads.save({ filename: "four-month-rebuild-" + U.today() + ".json", data: data }); U.toast("Backup downloaded."); return; } catch (e) { /* fall through */ } }
    U.toast("This browser wouldn't save the file. Your data is still saved on this device.", "bad");
  };
  ACT.restoreData = async function () {
    let f;
    try { f = await PLATFORM.pickFile({ accept: ".json,application/json" }); } catch (e) { U.toast("That file couldn't be read.", "bad"); return; }
    if (!f) return;
    try { const r = STORE.checkBackup(f.text); APP.ui.restore = { name: f.name, data: r.data, counts: r.counts }; }
    catch (e) { APP.ui.restore = null; U.toast(e.message, "bad"); render(false); return; }
    render(false);
    const box = U.$("#restore-confirm"); if (box) box.scrollIntoView({ block: "center" });
  };
  ACT.restoreCancel = function () { APP.ui.restore = null; render(false); };
  ACT.restoreConfirm = function () {
    const r = APP.ui.restore; if (!r) return;
    try { STORE.restore(r.data); } catch (e) { U.toast(e.message, "bad"); return; }
    APP.ui = {}; TUTOR.cur = null;
    render(true); U.toast("Backup restored.");
  };
  ACT.resetAll = function () {
    if (!confirmTwice("reset")) return;
    const keepName = S().name;
    APP.state = JSON.parse(JSON.stringify({ v: 3 })); STORE.load();
    APP.state.lessons = {}; APP.state.practicals = {}; APP.state.reviews = {}; APP.state.exams = {}; APP.state.admission = { done: false, answers: {}, at: null, score: null };
    APP.state.tasks = {}; APP.state.name = keepName; APP.state.startDate = COURSE.PLAN.start; APP.state.legacy = { reset: Date.now() };
    STORE.commit(false); U.toast("Progress reset. Journal entries were kept."); go("today");
  };
})();
