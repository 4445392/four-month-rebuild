/* ============================================================
   TUTOR — office hours with Claude via APP.cap.sample (PLATFORM.ai,
   js/ai-anthropic.js on the student's own API key).
   Modes: Explain (patient lecturer), Socratic, Examiner, Coach.
   Also marks explain-backs (RIGHT / PARTIAL / BROKE) and written
   exam answers against their rubrics, and writes extra drills.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const MODES = {
    explain: ["Explain", "Teach patiently, like a great university lecturer who never rushes: build the intuition step by step, anticipate where he'll get confused, use one strong everyday analogy and one worked example with real numbers, then ask one check-question."],
    socratic: ["Socratic", "Don't hand over the answer. Ask ONE guiding question at a time that leads him toward it. If he's stuck twice, give a hint. When he gets there, confirm it and summarise the idea in two lines."],
    examiner: ["Examiner", "Quiz him. One question at a time, mixing concept and calculation, matched to what he has studied so far. Wait for his answer, mark it (right / partly / wrong) with a one-line reason, keep a running score, then ask the next question."],
    coach: ["Coach", "Be a demanding but fair trading coach in the spirit of Richard Dennis: process before outcomes, evidence before feelings. Use his journal numbers. Call out rule-breaking plainly and constructively, and ask about consistency — his named weaknesses are discipline, consistency, and making careless decisions while watching charts."]
  };
  const T = window.TUTOR = { cur: null, ctl: null, busy: false };
  T.available = function () { return !!APP.cap.sample && !APP.cap.sampleBlocked; };
  T.noKeyText = "The tutor runs on your own Anthropic API key. Until you add one in Record → Settings, explain-backs and written answers are self-marked.";
  T.keyButton = function (cls) { return "<a class='btn " + (cls || "ghost") + "' href='#/record/tutor'>Add your key in Settings</a>"; };
  T.errorText = function (e) {
    const c = e && e.code;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].indexOf(c) >= 0) { APP.cap.sampleBlocked = true; setTimeout(function () { window.renderChrome(); }, 0); return "The tutor isn't available here (permission wasn't given)."; }
    if (c === "rate_limited") return "The tutor is busy or you've hit a usage limit — try again in a minute.";
    if (c === "bad_key") return "Your API key was rejected — check it in Record → Settings → Tutor.";
    if (c === "billing") return "Your Anthropic account needs credit — check Billing in the Anthropic Console.";
    if (c === "forbidden") return "Your API key isn't allowed to do that — check its workspace in the Anthropic Console.";
    if (c === "model_unavailable") return "Your key can't use that model — pick another in Record → Settings → Tutor.";
    if (c === "overloaded") return "Anthropic's servers are busy right now — try again in a minute.";
    if (c === "offline") return "No connection — the tutor needs the internet. Everything else works offline.";
    if (c === "bad_request") return "The tutor couldn't handle that request — try rephrasing, or start a new conversation.";
    if (c === "refused") return "The tutor declined that one — try rephrasing.";
    if (c === "session_expired") return "Sign in again to use the tutor.";
    if (c === "prompt_too_large") return "That was too long for the tutor — try something shorter.";
    if (c === "invalid_json") return "The tutor's answer couldn't be read — try again.";
    if (c === "cancelled") return "Stopped.";
    if (c === "tools_unavailable") { APP.cap.tools = false; return "Try that again."; }
    return "Connection hiccup — try again.";
  };

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
      "You are the Tutor inside \"The Four-Month Rebuild\", a private trading programme modelled on the 1983 Turtle experiment: two hours a day from 1 December 2026 to 28 March 2027. Monday to Saturday, hour 1 is a lesson and hour 2 applies that same lesson to real price (bar replay, labs or the Trading Floor); Sunday is his weekly review, plus a gate exam when one is due. 26 units of three days each, nine modules. You are talking with " + name + ".",
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

  /* ---------- tools the tutor may call ---------- */
  function tools() {
    return [
      { name: "get_lesson", description: "Returns the full text of one course lesson by its id (e.g. 'w09b', 'o1'). Use when he asks about a lesson other than the one in context.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
        execute: function (inp) { const l = P.lesson(String(inp.id || "")); if (!l) throw new Error("No lesson with that id"); return lessonText(l, true).slice(0, 6000); } },
      { name: "search_course", description: "Finds lessons whose title or content mention the query. Returns up to 8 {id, title, week, module}.", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
        execute: function (inp) {
          const q = String(inp.query || "").toLowerCase().split(/\s+/).filter(Boolean); const out = [];
          const all = COURSE.ORIENTATION.slice(); COURSE.weeks.forEach(function (w) { w.L.forEach(function (l) { all.push(l); }); });
          all.forEach(function (l) { const hay = (l.t + " " + l.big + " " + l.body.join(" ")).toLowerCase(); const sc = q.filter(function (w) { return hay.indexOf(w) >= 0; }).length; if (sc) out.push({ id: l.id, title: l.t, week: l.week, module: (P.module(l.mod) || {}).code, score: sc }); });
          return out.sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
        } },
      { name: "get_my_journal", description: "Returns a summary of his trading journal: overall statistics, segments by session/timeframe/setup/watched, and his most recent trades.", execute: function () { return window.JOURNAL ? JOURNAL.summaryForTutor() : "No journal."; } },
      { name: "get_my_progress", description: "Returns his standing, sessions completed, gate results and the numbers he has measured in practicals.", execute: function () { return progressText(); } }
    ];
  }

  /* ---------- drawer ---------- */
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
  T.open = function (o) {
    o = o || {};
    const ctx = o.ctx || currentCtx();
    const mode = o.mode || (o.preset === "quiz" ? "examiner" : o.preset === "prereview" ? "coach" : APP.state.settings.tutorMode || "explain");
    if (o.thread) T.cur = U.clone(APP.threads[o.thread]);
    else if (!T.cur || T.cur.ctx !== ctx || o.fresh) T.cur = { id: U.uid("th"), ctx: ctx, mode: mode, title: ctxLabel(ctx), msgs: [], at: Date.now() };
    if (o.mode || o.preset) T.cur.mode = mode;
    const d = U.$("#drawer"); d.hidden = false; document.body.classList.add("drawer-open");
    drawDrawer();
    if (o.text && T.available()) T.send(o.text);
    else if (o.preset && PRESETS[o.preset] && T.available()) T.send(PRESETS[o.preset]());
    else { const i = U.$("#t-in"); if (i) i.focus(); }
  };
  T.close = function () { const d = U.$("#drawer"); d.hidden = true; document.body.classList.remove("drawer-open"); };
  function drawDrawer() {
    const th = T.cur; if (!th) return;
    U.$("#t-modes").innerHTML = Object.keys(MODES).map(function (k) { return "<button class='modeb" + (th.mode === k ? " on" : "") + "' data-act='tutorMode' data-m='" + k + "'>" + MODES[k][0] + "</button>"; }).join("");
    U.$("#t-ctx").textContent = "About: " + th.title;
    const box = U.$("#t-msgs");
    if (!T.available()) { box.innerHTML = "<div class='msg a'><p>" + esc(APP.cap.sampleBlocked ? "The tutor can't be used right now. Everything else in the programme works, and explain-backs and written answers can be self-marked." : T.noKeyText) + "</p>" + (APP.cap.sampleBlocked ? "" : "<p>" + T.keyButton("sm") + "</p>") + "<p class='small'>Or ask Claude in the Claude app instead: <button class='btn xs ghost' data-act='copyForClaude'>Copy for Claude</button></p></div>"; }
    else if (!th.msgs.length) box.innerHTML = "<div class='msg a hint'><p><b>" + esc(MODES[th.mode][0]) + " mode.</b> " + esc(MODES[th.mode][1]) + "</p><p class='small'>Ask anything about the course, markets, risk or your own journal. The tutor won't give trade signals.</p></div>";
    else box.innerHTML = th.msgs.map(function (m) { return "<div class='msg " + (m.r === "u" ? "u" : "a") + "'>" + (m.r === "u" ? "<p>" + esc(m.t).replace(/\n/g, "<br>") + "</p>" : U.md(m.t)) + "</div>"; }).join("");
    box.scrollTop = box.scrollHeight;
    const busy = T.busy;
    U.$("#t-send").hidden = busy; U.$("#t-stop").hidden = !busy;
    U.$("#t-in").disabled = !T.available();
  }
  T.send = async function (text) {
    text = String(text || "").trim(); if (!text || T.busy || !T.available()) return;
    const th = T.cur;
    th.msgs.push({ r: "u", t: text }); th.at = Date.now();
    if (th.msgs.length === 1) th.title = ctxLabel(th.ctx) + " · " + text.slice(0, 48);
    const box = U.$("#t-msgs");
    drawDrawer();
    const bubble = document.createElement("div"); bubble.className = "msg a"; bubble.innerHTML = "<p class='thinking'>Thinking…</p>"; box.appendChild(bubble); box.scrollTop = box.scrollHeight;
    const turns = [];
    th.msgs.slice(-16).forEach(function (m) { turns.push({ role: m.r === "u" ? "user" : "assistant", content: String(m.t).slice(0, 6000) }); });
    T.busy = true; T.ctl = new AbortController(); U.$("#t-send").hidden = true; U.$("#t-stop").hidden = false;
    let final = "";
    const opts = { system: rules(th.mode, th.ctx), signal: T.ctl.signal, onText: function (u) { final = u.text; bubble.innerHTML = U.md(u.text); box.scrollTop = box.scrollHeight; } };
    if (APP.cap.tools) opts.tools = tools(); else opts.cache = false;
    try {
      const res = await APP.cap.sample(turns, opts);
      final = res.text;
      if (res.truncated) final += "\n\n*(Cut short — ask for the rest.)*";
    } catch (e) {
      final = (e && e.text) ? e.text + "\n\n*(" + T.errorText(e) + ")*" : "*" + T.errorText(e) + "*";
    }
    T.busy = false; T.ctl = null;
    th.msgs.push({ r: "a", t: final });
    if (th.msgs.length > 40) th.msgs = th.msgs.slice(-40);
    STORE.saveThread(U.clone(th));
    drawDrawer();
  };

  ACT.tutorOpen = function () { T.open({}); };
  ACT.tutorAsk = function (el) { T.open({ ctx: el.dataset.ctx || currentCtx(), preset: el.dataset.preset }); };
  ACT.tutorClose = function () { T.close(); };
  ACT.tutorSend = function () { const i = U.$("#t-in"); const v = i.value; i.value = ""; T.send(v); };
  ACT.tutorStop = function () { if (T.ctl) T.ctl.abort(); };
  ACT.tutorMode = function (el) { if (!T.cur) return; T.cur.mode = el.dataset.m; APP.state.settings.tutorMode = el.dataset.m; STORE.commit(false); drawDrawer(); };
  ACT.tutorNew = function () { T.open({ fresh: true, ctx: "today" }); };
  ACT.tutorThread = function (el) { T.open({ thread: el.dataset.id }); };
  ACT.tutorDelThread = function (el) { if (!window.confirmTwice("th-" + el.dataset.id)) return; STORE.deleteDoc("threads", "tutor", el.dataset.id); render(false); };
  document.addEventListener("keydown", function (e) { if (e.target && e.target.id === "t-in" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ACT.tutorSend(); } if (e.key === "Escape" && !U.$("#drawer").hidden) T.close(); });

  /* ---------- structured calls ---------- */
  T.gradeExplain = async function (l, text) {
    const prompt = [
      "You are marking a student's 'explain it back' answer in a trading course. Be fair, specific and honest; encouraging but never flattering. The student is " + (APP.state.name || "the student") + ", who learns best from plain-English explanations.",
      "", "Lesson: " + l.t, "Big idea: " + l.big, "Prompt he answered: " + l.ex.p,
      "Key points a complete explanation covers:", l.ex.r.map(function (r, k) { return (k + 1) + ". " + r; }).join("\n"),
      "Model explanation (reference only — wording need not match): " + l.ex.m,
      "", "His explanation:", "\"\"\"", text.slice(0, 5000), "\"\"\"", "",
      "Return ONLY a JSON object:",
      "{\"verdict\":\"RIGHT\"|\"PARTIAL\"|\"BROKE\",\"score\":0-5,\"right\":[up to 3 short strings — what he got right, quoting or paraphrasing him],\"broke\":\"the FIRST place his reasoning went wrong or a key idea is missing, quoting his words where possible; empty string if nothing broke\",\"fix\":\"the corrected idea in 1-3 plain-English sentences; empty if RIGHT\",\"followUp\":\"one short question that tests whether he now understands the weakest point\"}",
      "RIGHT = covers the key points with no errors. PARTIAL = mostly right but a point is missing or muddled. BROKE = a key misconception or a major gap."
    ].join("\n");
    const r = await APP.cap.sample.json(prompt, {});
    const v = String(r && r.verdict || "").toUpperCase();
    return { verdict: ["RIGHT", "PARTIAL", "BROKE"].indexOf(v) >= 0 ? v : "PARTIAL", score: Math.max(0, Math.min(5, Math.round(Number(r && r.score) || 0))),
      right: Array.isArray(r && r.right) ? r.right.slice(0, 3).map(String) : [], broke: String(r && r.broke || ""), fix: String(r && r.fix || ""), followUp: String(r && r.followUp || "") };
  };
  T.gradeWritten = async function (q, text, key) {
    const prompt = [
      "You are the examiner for a gate exam in a trading course. Mark this answer strictly against the rubric: one mark per rubric point, up to " + q.marks + " marks. Award a point only if the answer clearly and correctly covers it; paraphrase is fine. Do not reward length.",
      "", "Question: " + q.q, "Rubric:", q.rubric.map(function (r, k) { return (k + 1) + ". " + r; }).join("\n"),
      key ? "Marking key / context: " + key : "",
      "", "Answer:", "\"\"\"", text.slice(0, 8000), "\"\"\"", "",
      "Return ONLY a JSON object: {\"marks\": integer 0-" + q.marks + ", \"hit\": [numbers of rubric points covered], \"missed\": [short strings naming each rubric point missed], \"comment\": \"2-3 sentences: what was strong, and the single most important improvement\"}"
    ].join("\n");
    const r = await APP.cap.sample.json(prompt, { cache: false });
    const hit = Array.isArray(r && r.hit) ? r.hit.map(Number).filter(function (n) { return n >= 1 && n <= q.rubric.length; }) : [];
    let marks = Math.round(Number(r && r.marks));
    if (!isFinite(marks)) marks = hit.length;
    return { marks: Math.max(0, Math.min(q.marks, marks)), hit: hit, missed: Array.isArray(r && r.missed) ? r.missed.map(String).slice(0, 12) : [], comment: String(r && r.comment || "") };
  };
  T.genDrills = async function (l) {
    const prompt = [
      "Write 3 NEW practice questions for this lesson of a trading course, at the same level, testing understanding rather than trivia. If the lesson involves numbers, include at least one calculation.",
      "", lessonText(l, true), "", "Existing questions (don't repeat them): " + l.q.map(function (q) { return q.q; }).join(" | "), "",
      "Return ONLY a JSON array of exactly 3 objects, each either",
      "{\"k\":\"mcq\",\"q\":\"question\",\"o\":[\"option\",\"option\",\"option\",\"option\"],\"a\":index of the correct option,\"w\":\"one-sentence explanation\"}",
      "or",
      "{\"k\":\"num\",\"q\":\"question containing every number needed\",\"a\":number,\"tol\":acceptable absolute error,\"u\":\"unit\",\"w\":\"one-sentence worked answer\"}"
    ].join("\n");
    const arr = await APP.cap.sample.json(prompt, { cache: false });
    if (!Array.isArray(arr)) throw { code: "invalid_json" };
    const out = arr.filter(function (q) {
      if (!q || !q.q) return false;
      if (q.k === "mcq") return Array.isArray(q.o) && q.o.length >= 2 && Number(q.a) >= 0 && Number(q.a) < q.o.length;
      return q.k === "num" && isFinite(Number(q.a));
    }).slice(0, 3).map(function (q) { return q.k === "mcq" ? { k: "mcq", q: String(q.q), o: q.o.map(String), a: Number(q.a), w: String(q.w || "") } : { k: "num", q: String(q.q), a: Number(q.a), tol: isFinite(Number(q.tol)) ? Math.abs(Number(q.tol)) : Math.abs(Number(q.a)) * 0.01 + 1e-9, u: String(q.u || ""), w: String(q.w || "") }; });
    if (!out.length) throw { code: "invalid_json" };
    return out;
  };

  /* ---------- the Tutor page ---------- */
  VIEWS.tutor = {
    render: function () {
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Office hours</div><h1>The Tutor</h1><p class='lede'>Ask anything — about a lesson, a calculation, your journal, or why you keep breaking a rule. It knows the course and, when you ask, your own numbers. It won't give trade signals.</p></header>";
      if (!T.available()) h += "<div class='banner locked'>" + esc(APP.cap.sampleBlocked ? "The tutor can't be used right now. Explain-backs and written answers are self-marked in the meantime." : T.noKeyText) + (APP.cap.sampleBlocked ? "" : "<div class='row'>" + T.keyButton("primary") + "</div>") + "</div>";
      h += "<section class='panel'><div class='sec-head'><span class='code'>MODES</span><h2>Four ways to learn with it</h2></div><div class='modes-grid'>" + Object.keys(MODES).map(function (k) { return "<div class='mode-card'><h3>" + esc(MODES[k][0]) + "</h3><p class='small'>" + esc(MODES[k][1]) + "</p><button class='btn sm' data-act='tutorStart' data-m='" + k + "'" + (T.available() ? "" : " disabled") + ">Start in " + esc(MODES[k][0]) + " mode</button></div>"; }).join("") + "</div></section>";
      const ths = Object.keys(APP.threads).map(function (k) { return APP.threads[k]; }).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
      h += "<section class='panel'><div class='sec-head'><span class='code'>HISTORY</span><h2>Past conversations</h2></div>";
      if (!ths.length) h += "<p class='muted'>None yet.</p>";
      else h += "<div class='threads'>" + ths.slice(0, 40).map(function (t) { return "<div class='thread'><button class='linkish' data-act='tutorThread' data-id='" + esc(t.id) + "'><b>" + esc(t.title || "Conversation") + "</b><span class='small muted'>" + esc(MODES[t.mode] ? MODES[t.mode][0] : "") + " · " + (t.msgs ? t.msgs.length : 0) + " messages · " + esc(new Date(t.updatedAt || t.at || Date.now()).toLocaleDateString("en-ZA")) + "</span></button><button class='btn xs ghost' data-act='tutorDelThread' data-id='" + esc(t.id) + "'>Delete</button></div>"; }).join("") + "</div>";
      return h + "</section><p class='small muted'>Conversations are saved on this device with your progress." + (T.available() ? " The tutor uses " + esc(AI_ANTHROPIC.MODELS.filter(function (m) { return m.id === AI_ANTHROPIC.model(); })[0].name) + " on your API key." : "") + "</p></div>";
    }
  };
  ACT.tutorStart = function (el) { T.open({ fresh: true, ctx: "coach", mode: el.dataset.m }); };

  /* ---------- "Copy for Claude": the same context, ready to paste into the Claude app ---------- */
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

  /* ---------- Record → Settings → Tutor (API key, model, usage) ---------- */
  const AI = window.AI_ANTHROPIC;
  /* Switch the tutor on or off to match the saved key. */
  T.applyKey = function () {
    PLATFORM.ai = AI.fromSettings();
    APP.cap.sample = PLATFORM.ai; APP.cap.tools = !!PLATFORM.ai; APP.cap.sampleBlocked = false;
    window.renderChrome(); window.softRender();
  };
  const fmtN = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e4 ? Math.round(n / 1e3) + "k" : String(n); };
  T.settingsHTML = function () {
    const has = AI.hasKey(), cur = AI.model(), use = AI.monthUsage();
    let h = "<section class='panel' id='tutor-settings'><div class='sec-head'><span class='code'>TUTOR</span><h2>The tutor's API key</h2></div>" +
      "<p>The tutor runs on your own Anthropic API key. <b>It's billed to your Anthropic API account, separately from any Claude subscription</b> — set a monthly spend limit in the Anthropic Console before you start.</p><div class='form'>";
    if (has) h += "<div class='field'><span>API key</span><p class='small'>Saved on this device: <code>" + esc(AI.masked()) + "</code></p><div class='row wrap'><button class='btn' data-act='aiTest'>Test key</button><button class='btn ghost' data-act='aiRemove'>Remove key…</button></div></div>";
    else h += "<label class='field'><span>API key (starts with sk-ant-)</span><input id='ai-key' type='password' autocomplete='off' spellcheck='false' placeholder='sk-ant-…'></label><div class='row'><button class='btn primary' data-act='aiSave'>Save and test</button></div>";
    h += "<label class='field'><span>Model</span><select id='ai-model' data-chg='aiModel'>" + AI.MODELS.map(function (m) { return "<option value='" + m.id + "'" + (m.id === cur ? " selected" : "") + ">" + esc(m.name + " — " + m.note + " ($" + m.price[0] + " in / $" + m.price[1] + " out per million tokens)") + "</option>"; }).join("") + "</select></label></div>";
    h += "<p class='small'><b>This month:</b> ";
    if (!use.rows.length) h += "no tutor use yet.</p>";
    else h += "about $" + use.cost.toFixed(2) + " (an estimate from the API's token counts — the Anthropic Console has the exact bill).</p><div class='tablewrap' tabindex='0'><table class='tbl'><thead><tr><th>Model</th><th>Requests</th><th>Input</th><th>Cached</th><th>Output</th><th>About</th></tr></thead><tbody>" +
      use.rows.map(function (r) { return "<tr><td>" + esc(r.name) + "</td><td class='num'>" + r.req + "</td><td class='num'>" + fmtN(r.in + r.cw) + "</td><td class='num'>" + fmtN(r.cr) + "</td><td class='num'>" + fmtN(r.out) + "</td><td class='num'>$" + r.cost.toFixed(2) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    return h + "<p class='small muted'>Your key is stored only in this browser on this device. It is never put in backups and is only ever sent to api.anthropic.com. If the tutor declines a request, it is re-run once on Anthropic's recommended fallback model.</p></section>";
  };
  ACT.aiSave = async function () {
    const inp = U.$("#ai-key"), key = (inp && inp.value || "").trim();
    if (!key) { U.toast("Paste your API key first.", "bad"); return; }
    U.toast("Checking your key…");
    const r = await AI.test(key, AI.model());
    if (!r.ok && r.error.code !== "offline") { U.toast(T.errorText(r.error), "bad"); return; }
    await AI.setKey(key); T.applyKey();
    U.toast(r.ok ? "Key works — the tutor is on." : "Saved, but it couldn't be checked offline. Test it when you're back online.");
  };
  ACT.aiTest = async function () {
    const r = await AI.test(AI.settings().key, AI.model());
    U.toast(r.ok ? "Your key works with " + AI.MODELS.filter(function (m) { return m.id === AI.model(); })[0].name + "." : T.errorText(r.error), r.ok ? "" : "bad");
  };
  ACT.aiRemove = async function () {
    if (!window.confirmTwice("ai-remove")) return;
    await AI.setKey(null); T.applyKey(); U.toast("Key removed. Self-marking is back on.");
  };
  ACT.aiModel = function (el) { AI.setModel(el.value); T.applyKey(); U.toast("The tutor now uses " + el.options[el.selectedIndex].text.split(" — ")[0] + "."); };
})();
