/* ============================================================
   TUTOR — free, in the Claude app. The app writes the briefing
   (the course, where he is, how he learns, the honesty rules) and
   copies it with his question; he pastes it into the Claude app.
   Nothing here calls an API, so nothing here can cost money.
   Modes: Explain (patient lecturer), Socratic, Examiner, Coach.
   Also writes ready-to-paste prompts for marking an explain-back
   (RIGHT / PARTIAL / BROKE), extra drills, and feedback on
   written gate answers. Marks recorded in the app stay self-marks.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const CLAUDE_URL = "https://claude.ai/new";
  const MODES = {
    explain: ["Explain", "Teach patiently, like a great university lecturer who never rushes: build the intuition step by step, anticipate where he'll get confused, use one strong everyday analogy and one worked example with real numbers, then ask one check-question."],
    socratic: ["Socratic", "Don't hand over the answer. Ask ONE guiding question at a time that leads him toward it. If he's stuck twice, give a hint. When he gets there, confirm it and summarise the idea in two lines."],
    examiner: ["Examiner", "Quiz him. One question at a time, mixing concept and calculation, matched to what he has studied so far. Wait for his answer, mark it (right / partly / wrong) with a one-line reason, keep a running score, then ask the next question."],
    coach: ["Coach", "Be a demanding but fair trading coach in the spirit of Richard Dennis: process before outcomes, evidence before feelings. Use his journal numbers. Call out rule-breaking plainly and constructively, and ask about consistency — his named weaknesses are discipline, consistency, and making careless decisions while watching charts."]
  };
  const T = window.TUTOR = { cur: null };
  T.CLAUDE_URL = CLAUDE_URL;
  /* Copy a prompt, say what to do next. */
  T.copy = function (text, what) {
    return U.copy(text).then(function (ok) {
      U.toast(ok ? "Copied " + (what || "for Claude") + " — paste it into the Claude app." : "Couldn't copy here — your browser blocked the clipboard.", ok ? "" : "bad");
      return ok;
    });
  };
  T.openClaudeLink = function (cls) { return "<a class='btn " + (cls || "ghost") + "' href='" + CLAUDE_URL + "' target='_blank' rel='noopener'>Open Claude ↗</a>"; };

  /* ---------- context ---------- */
  function lessonText(l, full) {
    if (!l) return "";
    const m = P.module(l.mod);
    return "Lesson '" + l.t + "' (" + (m ? m.code : "") + ", " + (l.week ? "Unit " + l.week + ", lesson " + (l.k + 1) + " of 3" : "Orientation") + ").\nBig idea: " + l.big + "\nPlain English: " + l.plain +
      (full ? "\nDetail:\n" + l.body.join("\n") + "\nExplain-back prompt: " + l.ex.p + "\nKey points: " + l.ex.r.join("; ") : "");
  }
  function progressText() {
    const cnt = P.counts(), nx = P.next(), s = APP.state;
    const pace = P.pace();
    const lines = ["Standing: " + P.rank().name + ". Progress " + cnt.done + "/" + cnt.total + " hours. Next item: " + (nx ? P.itemLabel(nx) + " — planned for " + U.longDate(nx.date) + " (" + P.weekName(nx.cw) + ")" : "programme complete") + ".",
      "Today is " + U.longDate(U.today()) + ". Pace: " + (!pace.started ? "the programme starts " + U.longDate(COURSE.PLAN.start) + " (" + pace.toStart + " days away)" : pace.finished ? "finished" : pace.behind ? pace.behind + " study day(s) behind the calendar" : pace.ahead ? pace.ahead + " study day(s) ahead" : "on pace") + "."];
    const ex = Object.keys(s.exams).map(function (k) { const e = s.exams[k]; return k + ": best " + (e.best !== undefined ? e.best + "%" : "—") + (e.passedAt ? " passed" : "") + (e.override ? " (override)" : ""); });
    if (ex.length) lines.push("Gates: " + ex.join("; "));
    const nums = [];
    COURSE.weeks.forEach(function (w) { const pn = (s.practicals[w.n] || {}).num || {}; w.P.num.forEach(function (f) { if (pn[f.k] !== undefined && pn[f.k] !== "") nums.push("U" + w.n + " " + f.l + ": " + pn[f.k]); }); });
    if (nums.length) lines.push("His Almanac (numbers he measured): " + nums.slice(-14).join(" · "));
    return lines.join("\n");
  }
  function contextText(ctx) {
    const lines = [progressText()];
    ctx = ctx || "";
    if (ctx.indexOf("lesson:") === 0) {
      const l = P.lesson(ctx.slice(7));
      lines.push("He is working on this " + lessonText(l, true));
      const wr = APP.writing["x-" + (l && l.id)];
      if (wr) lines.push("His explain-back (" + (wr.verdict || "") + "): " + String(wr.text || "").slice(0, 1500) + (wr.fb && wr.fb.followUp ? "\nFollow-up question he was given: " + wr.fb.followUp : ""));
    } else if (ctx.indexOf("review:") === 0) {
      lines.push("His Sunday review:\n" + REPORT.text(Number(ctx.slice(7))));
      if (window.JOURNAL) lines.push("Journal summary:\n" + JOURNAL.summaryForTutor());
    } else if (ctx.indexOf("task:") === 0) {
      const t = COURSE.TASKS[ctx.slice(5)];
      if (t) {
        lines.push("He is doing this task (" + t.group + "): '" + t.t + "' — " + t.text);
        ((t.tutor && t.tutor.units) || []).forEach(function (n) { const w = P.week(n); if (w) lines.push("Unit " + n + " '" + w.t + "' lessons: " + w.L.map(function (l) { return l.id + " " + l.t + " — " + l.big; }).join(" | ")); });
      }
    } else if (ctx === "floor" && window.FLOOR && FLOOR.sess) {
      const S = FLOOR.sess, st = ENGINE.stats(S.closed);
      lines.push("He is on the Trading Floor simulator (synthetic markets with hidden regimes; " + (S.mode === "free" ? "free mode — he places the orders" : "Turtle System " + (S.mode === "s2" ? 2 : 1) + " mode — the rules place orders, his job is not to interfere") + "). This session: " + st.n + " trades, expectancy " + U.fmtR(st.expectancy) + ", overrides " + S.devs + (S.pos ? ", position open (" + (S.pos.dir > 0 ? "long" : "short") + ")" : "") + ". Do not predict the simulator's next bars.");
    } else if (window.JOURNAL && (ctx === "journal" || ctx === "coach")) {
      lines.push("Journal summary:\n" + JOURNAL.summaryForTutor());
    } else {
      const nx = P.next();
      if (nx) {
        const day = COURSE.PLAN.days[nx.d];
        lines.push("His current plan day: " + P.dayEyebrow(day) + " — " + P.dayTitle(day) + ".");
        P.dayItems(day.i).forEach(function (it) {
          if (it.type === "lesson") lines.push("Hour " + it.hour + " lesson: " + lessonText(P.lesson(it.id), false));
          else if (it.type === "practical") { const w = P.week(it.week); lines.push("Hour " + it.hour + " apply step (Unit " + it.week + " '" + w.t + "'): " + w.P.steps[it.session]); }
          else if (it.type === "task") lines.push("Hour " + it.hour + " task '" + COURSE.TASKS[it.id].t + "': " + COURSE.TASKS[it.id].text);
          else lines.push("Hour " + it.hour + ": " + P.itemLabel(it));
        });
      }
    }
    return lines.join("\n\n").slice(0, 14000);
  }
  function rules(mode, ctx) {
    const name = APP.state.name || "the student";
    return [
      "You are the Tutor for \"The Four-Month Rebuild\", a private trading programme modelled on the 1983 Turtle experiment: two hours a day from 1 December 2026 to 28 March 2027. Monday to Saturday, hour 1 is a lesson and hour 2 applies that same lesson to real price (bar replay, labs or the Trading Floor); Sunday is his weekly review, plus a gate exam when one is due. 26 units of three days each, nine modules. You are talking with " + name + ".",
      "",
      "How " + name + " learns — follow this closely:",
      "• Big idea first, in plain English, with an everyday analogy; then the detail; formulas last.",
      "• He is a visual learner: when a picture helps, draw a small text diagram in a code block, or use a compact table.",
      "• He wants to be able to explain every idea to someone else, so end teaching answers with ONE short check-question.",
      "• His own study method is SEED: Simplify → Expand → Explain back → Drill.",
      "• Short paragraphs. Warm and direct. No flattery, no filler.",
      "",
      "Course facts to respect:",
      "• Risk ceiling: 1% of the account at the stop. Everything is measured in R (1R = the planned risk on a trade).",
      "• Hard gates at 80%, sat on Sundays: " + ["g1", "g2", "g3", "g4", "g5", "final"].map(function (g) { const d = P.examDayOf(g); return COURSE.exams[g].title.split(" — ")[0] + " " + (d ? U.niceDate(d.date) : ""); }).join(", ") + ". Demo trading only after Gate 4 (from Unit 19). Live trading, if he has capital, starts at 0.25% risk in Unit 25 and only after Gate 5. Rest days 25 Dec and 1 Jan.",
      "• The Turtle rules are taught as a case study: N = 20-day smoothed true range; unit = 1% of equity per N (course default 0.5%); System 1 = 20-day breakout, skipped if the previous breakout won, with a 55-day failsafe; System 2 = 55-day breakout; add a unit every ½N up to 4; stops 2N from the newest unit; exit on the 10-day (S1) or 20-day (S2) opposite breakout; unit limits 4 per market, 6 closely correlated, 10 loosely correlated, 12 one direction; trade 20% smaller for each 10% drawdown.",
      "• Session times are in SAST (GMT+2).",
      "",
      "Honesty rules:",
      "• Never give trade signals or say what a real market will do next. If asked 'should I buy X?', show how his own written rules would decide it.",
      "• Never promise profitability; say plainly when something is uncertain. ESMA (2018) found 74–89% of retail CFD accounts lose money.",
      "• Prefer his own journal numbers over general claims when he has them.",
      "• Stay on trading, markets, risk, psychology and this course.",
      "",
      "Mode — " + MODES[mode][0] + ": " + MODES[mode][1],
      "",
      "Where he is right now:",
      contextText(ctx)
    ].join("\n");
  }

  /* ---------- the drawer: write a prompt, copy it, paste it into Claude ---------- */
  const PRESETS = {
    orient: function () { const nx = P.next(); return "I'm about to start today's session: " + (nx ? P.itemLabel(nx) : "the programme") + ". In three or four sentences: what's the one idea I must walk away with, and what usually trips people up?"; },
    another: function () { return "Explain this lesson's big idea another way — a different everyday picture — then check I've got it."; },
    deeper: function () { return "Go deeper on this lesson: the part most people misunderstand, with one worked example using real numbers."; },
    analogy: function () { return "Give me a fresh analogy for this lesson's key idea, then show exactly where the analogy breaks down."; },
    example: function () { return "Walk me through one fully worked example of this lesson's idea, step by step, with real numbers."; },
    quiz: function () { return "Quiz me on this lesson — one question at a time."; },
    followup: function () { return "Ask me the follow-up question from my explanation feedback, then mark my answer."; },
    prereview: function () { return "Here's my Sunday review. Ask me three probing questions, one at a time — about consistency, rule-following, and what my numbers actually mean. Then give me one concrete instruction for next week."; }
  };
  const ctxLabel = function (ctx) {
    ctx = ctx || "";
    if (ctx.indexOf("lesson:") === 0) { const l = P.lesson(ctx.slice(7)); return l ? "Lesson · " + l.t : "Lesson"; }
    if (ctx.indexOf("review:") === 0) return "Sunday review · " + P.weekName(Number(ctx.slice(7)));
    if (ctx.indexOf("task:") === 0) { const t = COURSE.TASKS[ctx.slice(5)]; return t ? "Task · " + t.t : "Task"; }
    return { floor: "The Trading Floor", journal: "Your Journal", coach: "Coaching", today: "Today" }[ctx] || "General";
  };
  function currentCtx() {
    const v = APP.view.name;
    if (v === "lesson") return "lesson:" + APP.view.params.id;
    if (v === "review") return "review:" + APP.view.params.id;
    if (v === "floor" || v === "journal") return v;
    return "today";
  }
  /* The whole prompt: a briefing for Claude, then his question. */
  T.prompt = function (mode, ctx, question) {
    return "Please be my tutor for this conversation. My course app wrote this briefing for you:\n\n" + rules(mode, ctx) +
      "\n\n---\n\nMy first question: " + String(question || "").trim();
  };
  T.open = function (o) {
    o = o || {};
    const ctx = o.ctx || currentCtx();
    const mode = o.mode || (o.preset === "quiz" ? "examiner" : o.preset === "prereview" ? "coach" : APP.state.settings.tutorMode || "explain");
    if (o.thread && APP.threads[o.thread]) T.cur = U.clone(APP.threads[o.thread]);
    else T.cur = { ctx: ctx, mode: mode, title: ctxLabel(ctx), msgs: [] };
    const d = U.$("#drawer"); d.hidden = false; document.body.classList.add("drawer-open");
    drawDrawer();
    const i = U.$("#t-in");
    if (i) { i.value = o.text || (o.preset && PRESETS[o.preset] ? PRESETS[o.preset]() : ""); i.focus(); }
  };
  T.close = function () { const d = U.$("#drawer"); d.hidden = true; document.body.classList.remove("drawer-open"); const f = U.$("#fab"); if (f && !f.hidden) f.focus(); };
  function drawDrawer() {
    const th = T.cur; if (!th) return;
    U.$("#t-modes").innerHTML = Object.keys(MODES).map(function (k) { return "<button class='modeb" + (th.mode === k ? " on" : "") + "' data-act='tutorMode' data-m='" + k + "' aria-pressed='" + (th.mode === k) + "'>" + MODES[k][0] + "</button>"; }).join("");
    U.$("#t-ctx").textContent = "About: " + th.title;
    const box = U.$("#t-msgs");
    let h = "";
    if (th.msgs && th.msgs.length) h += "<div class='msg a hint'><p class='small'>A saved conversation from the earlier version of the app (read only).</p></div>" +
      th.msgs.map(function (m) { return "<div class='msg " + (m.r === "u" ? "u" : "a") + "'>" + (m.r === "u" ? "<p>" + esc(m.t).replace(/\n/g, "<br>") + "</p>" : U.md(m.t)) + "</div>"; }).join("");
    h += "<div class='msg a hint'><p><b>" + esc(MODES[th.mode][0]) + " mode.</b> " + esc(MODES[th.mode][1]) + "</p>" +
      "<ol class='small'><li>Type your question below (or leave it and ask in Claude).</li><li>Tap <b>Copy for Claude</b> — it copies a briefing about the course, where you are and how you learn, plus your question.</li><li>Open the Claude app, paste, send. It's free with a Claude account.</li></ol></div>";
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
  }

  ACT.tutorOpen = function () { T.open({}); };
  ACT.tutorAsk = function (el) { T.open({ ctx: el.dataset.ctx || currentCtx(), preset: el.dataset.preset }); };
  ACT.tutorClose = function () { T.close(); };
  ACT.tutorCopy = function () { const th = T.cur; if (!th) return; T.copy(T.prompt(th.mode, th.ctx, (U.$("#t-in") || {}).value)); };
  ACT.tutorMode = function (el) { if (!T.cur) return; T.cur.mode = el.dataset.m; APP.state.settings.tutorMode = el.dataset.m; STORE.commit(false); drawDrawer(); };
  ACT.tutorThread = function (el) { T.open({ thread: el.dataset.id }); };
  ACT.tutorDelThread = function (el) { if (!window.confirmTwice("th-" + el.dataset.id)) return; STORE.deleteDoc("threads", "tutor", el.dataset.id); render(false); };
  document.addEventListener("keydown", function (e) {
    if (e.target && e.target.id === "t-in" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ACT.tutorCopy(); }
    if (e.key === "Escape" && !U.$("#drawer").hidden) T.close();
  });

  /* ---------- ready-made prompts (Claude replies in plain words; he records his own mark) ---------- */
  T.explainPrompt = function (l, text) {
    return [
      "Please mark my 'explain it back' answer for a lesson in my trading course. Be fair, specific and honest; encouraging but never flattering. I learn best from plain-English explanations.",
      "", "Lesson: " + l.t, "Big idea: " + l.big, "The prompt I answered: " + l.ex.p,
      "Key points a complete explanation covers:", l.ex.r.map(function (r, k) { return (k + 1) + ". " + r; }).join("\n"),
      "Model explanation (reference only — my wording doesn't need to match): " + l.ex.m,
      "", "My explanation:", "\"\"\"", String(text).slice(0, 5000), "\"\"\"", "",
      "Reply in exactly this shape:",
      "Verdict: RIGHT, PARTIAL or BROKE (RIGHT = covers the key points with no errors; PARTIAL = mostly right but a point is missing or muddled; BROKE = a key misconception or a major gap)",
      "What I got right: up to 3 short points, quoting me",
      "Where it broke: the FIRST place my reasoning went wrong or a key idea is missing, quoting my words",
      "The fix: the corrected idea in 1–3 plain-English sentences",
      "Check yourself: one short question that tests my weakest point — then wait for my answer and mark it."
    ].join("\n");
  };
  T.drillsPrompt = function (l) {
    return [
      "Write 3 NEW practice questions for this lesson of my trading course, at the same level, testing understanding rather than trivia. If the lesson involves numbers, include at least one calculation that gives every number needed.",
      "", lessonText(l, true), "", "Questions I've already done (don't repeat them): " + l.q.map(function (q) { return q.q; }).join(" | "), "",
      "Number the questions. Put all the answers, each with a one-line working, at the very end under the heading 'Answers', so I can try first."
    ].join("\n");
  };
  /* Written gate answers after submitting: questions, rubrics, marking keys and his answers. */
  T.writtenPrompt = function (ex, items) {
    return [
      "Please give me examiner's feedback on my written answers from '" + ex.title + "' in my trading course. For each answer: which rubric points it clearly covers, which it misses, and the single most important improvement — 2–3 sentences, plain English. Mark strictly: one mark per rubric point, paraphrase is fine, length earns nothing.",
      ""
    ].concat(items.map(function (it, k) {
      return ["Question " + (k + 1) + " (" + it.q.marks + " marks): " + it.q.q, "Rubric:", it.q.rubric.map(function (r, j) { return (j + 1) + ". " + r; }).join("\n"),
        it.key ? "Marking key / context: " + it.key : "", "My answer:", "\"\"\"", (it.text || "(no answer)").slice(0, 8000), "\"\"\"", ""].join("\n");
    })).join("\n");
  };

  /* ---------- the Tutor page ---------- */
  VIEWS.tutor = {
    render: function () {
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Office hours · free</div><h1>The Tutor</h1><p class='lede'>Your tutor is Claude, in the free Claude app. This app writes the briefing — the course, where you are, how you like to learn, and the rule that nobody gives you trade signals — so all you add is your question.</p></header>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>HOW</span><h2>Three steps</h2></div><ol><li>Pick a mode below, or tap <b>Ask the tutor</b> on any page — the briefing then includes that lesson, review or journal.</li><li>Type your question and tap <b>Copy for Claude</b>.</li><li>Open the Claude app (or claude.ai), paste, send. A free Claude account is enough.</li></ol><div class='row wrap'>" + T.openClaudeLink() + "</div></section>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>MODES</span><h2>Four ways to learn with it</h2></div><div class='modes-grid'>" + Object.keys(MODES).map(function (k) { return "<div class='mode-card'><h3>" + esc(MODES[k][0]) + "</h3><p class='small'>" + esc(MODES[k][1]) + "</p><button class='btn sm' data-act='tutorStart' data-m='" + k + "'>Write a " + esc(MODES[k][0]) + " prompt</button></div>"; }).join("") + "</div></section>";
      const ths = Object.keys(APP.threads).map(function (k) { return APP.threads[k]; }).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
      if (ths.length) {
        h += "<section class='panel'><div class='sec-head'><span class='code'>HISTORY</span><h2>Saved conversations</h2></div><p class='small muted'>From the earlier version of the app. Your conversations in Claude are kept in the Claude app.</p>";
        h += "<div class='threads'>" + ths.slice(0, 40).map(function (t) { return "<div class='thread'><button class='linkish' data-act='tutorThread' data-id='" + esc(t.id) + "'><b>" + esc(t.title || "Conversation") + "</b><span class='small muted'>" + esc(MODES[t.mode] ? MODES[t.mode][0] : "") + " · " + (t.msgs ? t.msgs.length : 0) + " messages · " + esc(new Date(t.updatedAt || t.at || Date.now()).toLocaleDateString("en-ZA")) + "</span></button><button class='btn xs ghost' data-act='tutorDelThread' data-id='" + esc(t.id) + "'>Delete</button></div>"; }).join("") + "</div></section>";
      }
      return h + "<p class='small muted'>Nothing is sent anywhere until you paste it into Claude yourself. The app never calls a paid service.</p></div>";
    }
  };
  ACT.tutorStart = function (el) { T.open({ ctx: "coach", mode: el.dataset.m }); };

  /* ---------- "Copy for Claude" on lessons: the lesson and how he learns ---------- */
  const ABOUT_ME = "How I learn best: give me the big idea first, in plain English with an everyday analogy; then the detail; formulas last. A small diagram helps. Keep answers short, and end with one question that checks I could explain it to someone else. If you show code, use Java. Never give me trade signals or predictions.";
  T.claudeText = function (ctx) {
    const head = "I'm studying \"The Four-Month Rebuild\", my own two-hours-a-day trading course (1 Dec 2026 – 28 Mar 2027), built around the 1983 Turtle experiment: risk first, rules over predictions.";
    if (ctx && ctx.indexOf("lesson:") === 0) {
      const l = P.lesson(ctx.slice(7));
      if (l) return [head, ABOUT_ME, "Here is the lesson I'm on:\n" + lessonText(l, true), "My question: "].join("\n\n");
    }
    return [head, ABOUT_ME, "Context from my course app (it describes me in the third person):\n" + contextText(ctx), "My question: "].join("\n\n");
  };
  ACT.copyForClaude = function (el) {
    const ctx = el.dataset.ctx || (T.cur && T.cur.ctx) || currentCtx();
    U.copy(T.claudeText(ctx)).then(function (ok) { U.toast(ok ? "Copied — paste it into the Claude app and add your question." : "Couldn't copy here — your browser blocked the clipboard.", ok ? "" : "bad"); });
  };
})();
