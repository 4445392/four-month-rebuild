/* ============================================================
   PLAN — the four-month calendar.
   Tue 1 Dec 2026 → Wed 31 Mar 2027, two hours a day.
   Mon–Sat: hour 1 is a lesson, hour 2 applies that same lesson.
   Sunday: the review, plus a gate exam when one is due.
   Rest days: 25 Dec and 1 Jan. Buffer days: 29–31 Mar.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- special days (not unit days) ----------
     t: title · text: what to do · tools: links shown with it
     mod: module that unlocks it · unit: the unit it belongs with
     tutor: optional prompt that opens the tutor in a mode */
  const ROUTINE = "Your daily routine on demo — or live, if you're on the ladder: check for signals at your fixed time, tick the checklist, place orders with alerts, close the platform. Journal everything, including the signals you didn't take.";
  COURSE.TASKS = {
    /* Week 0 — orientation */
    o1x: { mod: "100", unit: 0, group: "Orientation", t: "Same rules, six markets", tools: ["floor:auto"],
      text: "Trading Floor → Autopilot: run Turtle System 1 on all six markets. Write down each market's expectancy and its worst drawdown in R. Same rules, six different results — write one sentence on why that might be." },
    o2x: { mod: "100", unit: 0, group: "Orientation", t: "Your first attempt, as a system", tools: [],
      text: "Write your first attempt at trading as a system, using the seven questions from today's lesson: markets, size, entries, stops, exits, tactics, and when you stop. Beside each, write how you really decided it — in advance, or in the moment. Keep it: you'll compare it with your System v1 in Unit 16." },
    o3x: { mod: "100", unit: 0, group: "Orientation", t: "Set up your desk", tools: ["tv", "floor", "journal"],
      text: "Create a free TradingView account and save a clean chart with no indicators. Block two hours a day in your calendar from Mon 7 Dec to Sun 28 Mar. Then tour the Trading Floor, the Labs and the Journal, and log one Floor trade in the Journal so you've seen the whole loop once." },
    admx: { mod: "100", unit: 0, group: "Orientation", t: "Turtle mode: don't interfere", tools: ["floor"],
      text: "Trading Floor → choose Turtle System 1 mode and play a full session. The rules place every order; your only job is not to interfere. Count your overrides — the Floor logs every one." },
    w0a: { mod: "100", unit: 0, group: "Orientation", t: "Read the original rules", tools: ["turtlepdf"],
      text: "Read the opening of the original Turtle rules (Curtis Faith's free PDF): the introduction and the section on a complete trading system. Underline every sentence that says the rules only work if they're followed." },
    w0b: { mod: "100", unit: 0, group: "Orientation", t: "Turtle mode, zero overrides", tools: ["floor"],
      text: "Play a second Turtle-mode session and aim for zero overrides. Compare with yesterday: overrides, expectancy, and how it felt to sit through the losing trades." },

    /* Weeks 3–4 — holiday practice (around 25 Dec and 1 Jan) */
    h1a: { mod: "101", unit: 5, group: "Holiday practice", t: "Explain it cold", tools: [],
      tutor: { mode: "socratic", units: [1, 2, 3, 4, 5], prompt: "I'm revising Units 1–5 with no notes. Ask me to explain their big ideas one at a time, Socratic style — push on anything vague before moving on." },
      text: "No notes: explain the big ideas of Units 1–5 to the tutor in Socratic mode, or write them out on a blank page. Then redo every drill question you got wrong the first time." },
    h1b: { mod: "102", unit: 5, group: "Holiday practice", t: "Swing-marking reps", tools: ["floor"],
      text: "Trading Floor, any market, with the Swings overlay off: step through 100 bars marking swing highs and lows (N = 3) on paper. Then turn the overlay on and score yourself." },
    h2a: { mod: "101", unit: 5, group: "Holiday practice", t: "Catch-up", tools: [],
      text: "Finish anything still open from Weeks 1–3 — lessons, apply steps, Almanac numbers. Nothing open? Draw the trend definition from memory and check it against Unit 5." },
    h2b: { mod: "102", unit: 5, group: "Holiday practice", t: "Grow your sample", tools: ["tv"],
      text: "Bar replay: label another three months of EUR/USD Daily as uptrend, downtrend or range with your Unit 5 method, and add the days to your count. Bigger samples, steadier numbers." },
    h3a: { mod: "102", unit: 6, group: "Holiday practice", t: "Examiner mode: Units 4–6", tools: [],
      tutor: { mode: "examiner", units: [4, 5, 6], prompt: "Test me on Units 4–6, one question at a time. Don't give me the answer until I've tried." },
      text: "Ask the tutor, in Examiner mode, to test you on Units 4–6 one question at a time. Don't look anything up. Write down the idea that felt weakest." },
    h3b: { mod: "102", unit: 6, group: "Holiday practice", t: "Fifteen more CHoCH", tools: ["tv", "journal"],
      text: "Bar replay: add 15 change-of-character instances to your Unit 6 sample, for 45 in total. Recompute your three reliability numbers — did they hold?" },
    h4a: { mod: "101", unit: 6, group: "Holiday practice", t: "Catch-up and preview", tools: [],
      text: "Finish anything still open from Weeks 1–4. Then read just the big ideas of Units 7 and 8 — a preview, not a lesson." },
    h4b: { mod: "100", unit: 6, group: "Holiday practice", t: "Turtle mode, System 2", tools: ["floor"],
      text: "Trading Floor → Turtle System 2 mode: a full session with zero overrides. Note the longest losing streak you sat through, in trades and in R." },

    /* Week 7 — Gate 2 preparation */
    p2a: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Math drills, cold", tools: ["lab:drills"],
      text: "Labs → Math Drills: 20 questions with no notes. Record your first-try accuracy, then redo every miss by hand." },
    p2b: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Ten fresh size cases", tools: ["lab:size"],
      text: "Ten new position-size cases — include two JPY pairs and two Turtle-unit cases. Check each one in the Position Size lab." },
    p2c: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Examiner mode: TRD 201", tools: [],
      tutor: { mode: "examiner", units: [9, 10, 11], prompt: "Gate 2 is on Sunday. Test me on Units 9–11 like an examiner — calculations and concepts, one question at a time." },
      text: "Ask the tutor, in Examiner mode, to test you on Units 9–11. No looking things up — note every question you couldn't answer." },
    p2d: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Draft your Gate 2 answers", tools: ["lab:mc", "lab:streaks"],
      text: "Re-run the Monte Carlo with your own numbers, then draft the three Gate 2 answers: your risk of ruin at 1% and 2%, why the simulated worst drawdown is worse than anything in your backtest, and the losing streak your plan must survive." },
    p2e: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Explain back the hardest three", tools: [],
      text: "Pick the three TRD 201 lessons you found hardest. Explain each one again from a blank page, then compare with the model answer." },
    p2f: { mod: "201", unit: 11, group: "Gate 2 prep", t: "Watch a good system lose", tools: ["floor:auto"],
      text: "Trading Floor → Autopilot on a market where the Turtle rules made money. Find its worst drawdown in R and count how many losses in a row you'd have had to sit through." },

    /* Week 11 — backtest days before Gate 4 */
    b1a: { mod: "301", unit: 18, group: "Backtest day", t: "v1-A to 100 trades", tools: ["tv", "floor", "journal"],
      text: "If System v1 isn't at 100+ honest trades yet (tag 'v1-A'), finish it — bar by bar, no peeking. Already there? Check every trade has every field and a screenshot." },
    b1b: { mod: "301", unit: 18, group: "Backtest day", t: "Audit your log", tools: ["journal"],
      text: "Re-read your 'v1-A' trades in the Journal. Fix missing fields, and mark any trade you decided after seeing the next candle — leave it out, and say so on Sunday." },
    b2a: { mod: "301", unit: 18, group: "Backtest day", t: "v2-B: the first 15 trades", tools: ["tv", "floor", "journal"],
      text: "Backtest System v2 on a different 12-month period (tag 'v2-B'). Log each trade at the moment of decision." },
    b2b: { mod: "301", unit: 18, group: "Backtest day", t: "v2-B: toward 30 trades", tools: ["tv", "floor", "journal"],
      text: "Continue v2-B. Gate 4 needs two test sets of 30+ trades, each with positive expectancy." },
    b3a: { mod: "301", unit: 18, group: "Backtest day", t: "v2-B: finish and compare", tools: ["journal"],
      text: "Bring v2-B to 30+ trades and compare it with v1-A: expectancy, max drawdown, longest losing streak." },
    b3b: { mod: "301", unit: 18, group: "Backtest day", t: "Where your system loses", tools: ["journal", "gate:g4"],
      text: "Write the market conditions in which your system loses money, with numbers from your Journal. Then open Gate 4 and check its evidence panel before Sunday." },

    /* Week 16 — revision week before the Final */
    r1a: { mod: "402", unit: 26, group: "Revision week", t: "Retrieval: TRD 101–102", tools: [],
      text: "Pick the two TRD 101–102 lessons you remember least. Explain each one back from a blank page, then redo its drill." },
    r1b: { mod: "402", unit: 26, group: "Revision week", t: "Run your routine", tools: ["journal"], text: ROUTINE },
    r2a: { mod: "402", unit: 26, group: "Revision week", t: "Retrieval: TRD 201", tools: ["lab:drills"],
      text: "Explain back the two TRD 201 lessons you remember least, then do 20 Math Drills cold." },
    r2b: { mod: "402", unit: 26, group: "Revision week", t: "Run your routine", tools: ["journal"], text: ROUTINE },
    r3a: { mod: "402", unit: 26, group: "Revision week", t: "Retrieval: TRD 202", tools: [],
      text: "Explain back two TRD 202 lessons from a blank page. Then write a one-paragraph bias for a pair you trade — including what would prove it wrong." },
    r3b: { mod: "402", unit: 26, group: "Revision week", t: "Run your routine", tools: ["journal"], text: ROUTINE },
    r4a: { mod: "402", unit: 26, group: "Revision week", t: "Retrieval: TRD 301", tools: [],
      text: "Re-read your current system cold. Fix any sentence a stranger could read two ways. Then explain back 'What an Edge Actually Is'." },
    r4b: { mod: "402", unit: 26, group: "Revision week", t: "Run your routine", tools: ["journal"], text: ROUTINE },
    r5a: { mod: "402", unit: 26, group: "Revision week", t: "Retrieval: TRD 302 and 401", tools: ["journal"],
      text: "Explain back two lessons from TRD 302–401. Then compare your watched-versus-unwatched numbers now with your Unit 20 numbers." },
    r5b: { mod: "402", unit: 26, group: "Revision week", t: "Run your routine", tools: ["journal"], text: ROUTINE },
    r6a: { mod: "402", unit: 26, group: "Revision week", t: "Your beliefs, then and now", tools: ["admission"],
      text: "Open the admission answers you gave in orientation week. Write which beliefs changed in four months — and which ones haven't yet." },
    r6b: { mod: "402", unit: 26, group: "Revision week", t: "Draft the audit", tools: ["journal"],
      text: "Draft your four-month audit: expectancy, adherence, your style verdict, and one thing right and one thing wrong — each with Journal evidence. Tomorrow you sit the Final." }
  };

  /* ---------- the week templates (Mon … Sun) ----------
     ["U", unit, k]  unit day k: lesson k, then apply step k
     ["L", id, task] orientation lesson, then a task
     ["A", task]     admission questionnaire, then a task
     ["T", a, b]     two tasks
     ["R", label]    rest day
     ["S", exam]     Sunday review (+ gate exam)
     ["X"]           buffer day */
  const U3 = function (n) { return [["U", n, 0], ["U", n, 1], ["U", n, 2]]; };
  const WEEKS = [
    [null, ["L", "o1", "o1x"], ["L", "o2", "o2x"], ["L", "o3", "o3x"], ["A", "admx"], ["T", "w0a", "w0b"], ["S", null]],
    U3(1).concat(U3(2), [["S", null]]),
    U3(3).concat(U3(4), [["S", null]]),
    U3(5).concat([["T", "h1a", "h1b"], ["R", "Christmas Day"], ["T", "h2a", "h2b"], ["S", null]]),
    U3(6).concat([["T", "h3a", "h3b"], ["R", "New Year's Day"], ["T", "h4a", "h4b"], ["S", null]]),
    U3(7).concat(U3(8), [["S", "g1"]]),
    U3(9).concat(U3(10), [["S", null]]),
    U3(11).concat([["T", "p2a", "p2b"], ["T", "p2c", "p2d"], ["T", "p2e", "p2f"], ["S", "g2"]]),
    U3(12).concat(U3(13), [["S", null]]),
    U3(14).concat(U3(15), [["S", "g3"]]),
    U3(16).concat(U3(17), [["S", null]]),
    U3(18).concat([["T", "b1a", "b1b"], ["T", "b2a", "b2b"], ["T", "b3a", "b3b"], ["S", "g4"]]),
    U3(19).concat(U3(20), [["S", null]]),
    U3(21).concat(U3(22), [["S", null]]),
    U3(23).concat(U3(24), [["S", "g5"]]),
    U3(25).concat(U3(26), [["S", null]]),
    [["T", "r1a", "r1b"], ["T", "r2a", "r2b"], ["T", "r3a", "r3b"], ["T", "r4a", "r4b"], ["T", "r5a", "r5b"], ["T", "r6a", "r6b"], ["S", "final"]],
    [["X"], ["X"], ["X"], null, null, null, null]
  ];

  /* ---------- build the day list ---------- */
  const pad = function (n) { return (n < 10 ? "0" : "") + n; };
  const isoOf = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const MONDAY0 = new Date(2026, 10, 30); // Mon 30 Nov 2026 — the Monday of Week 0
  const plan = COURSE.PLAN = {
    id: "4m-2026-12-01",
    name: "The Four-Month Rebuild",
    start: "2026-12-01", week1: "2026-12-07", finalDay: "2027-03-28", end: "2027-03-31",
    weeksCount: 17,
    days: [], byDate: {}, unitDays: {}, examDay: {}, lessonDay: {}, reviewDay: {}, taskDay: {}
  };
  WEEKS.forEach(function (tpl, cw) {
    tpl.forEach(function (spec, dow) {
      if (!spec) return;
      const dt = new Date(MONDAY0.getFullYear(), MONDAY0.getMonth(), MONDAY0.getDate() + cw * 7 + dow);
      const day = { i: plan.days.length, date: isoOf(dt), cw: cw, dow: dow, kind: "study", h1: null, h2: null, label: "" };
      const kind = spec[0];
      if (kind === "U") {
        const w = COURSE.weeks[spec[1] - 1];
        day.h1 = { type: "lesson", id: w.L[spec[2]].id };
        day.h2 = { type: "practical", week: spec[1], session: spec[2] };
        day.unit = spec[1]; day.k = spec[2];
        (plan.unitDays[spec[1]] = plan.unitDays[spec[1]] || [])[spec[2]] = day.i;
        plan.lessonDay[day.h1.id] = day.i;
      } else if (kind === "L") {
        day.h1 = { type: "lesson", id: spec[1] }; day.h2 = { type: "task", id: spec[2] };
        plan.lessonDay[spec[1]] = day.i; plan.taskDay[spec[2]] = day.i;
      } else if (kind === "A") {
        day.h1 = { type: "admission" }; day.h2 = { type: "task", id: spec[1] };
        plan.taskDay[spec[1]] = day.i; plan.admissionDay = day.i;
      } else if (kind === "T") {
        day.h1 = { type: "task", id: spec[1] }; day.h2 = { type: "task", id: spec[2] };
        plan.taskDay[spec[1]] = day.i; plan.taskDay[spec[2]] = day.i;
      } else if (kind === "R") {
        day.kind = "rest"; day.label = spec[1];
      } else if (kind === "S") {
        day.kind = "sunday";
        day.h1 = { type: "review", cw: cw };
        if (spec[1]) { day.h2 = { type: "exam", id: spec[1] }; plan.examDay[spec[1]] = day.i; }
        plan.reviewDay[cw] = day.i;
      } else if (kind === "X") {
        day.kind = "spare"; day.label = "Buffer day";
      }
      plan.days.push(day);
      plan.byDate[day.date] = day;
    });
  });
  plan.weekDays = function (cw) { return plan.days.filter(function (d) { return d.cw === cw; }); };
})();
