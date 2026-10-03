/* ============================================================
   COURSE — structure, orientation and admission.
   Lessons follow the student's own SEED method:
   Simplify (big idea + plain English) → Expand (detail) →
   Explain back (tutor-checked) → Drill (questions).
   body markup: "= " formula · "• " bullet · "> " callout · **bold** · `code`
   ============================================================ */
window.COURSE = {
  weeks: [],
  lessons: {},
  exams: {},
  week: function (w) {
    this.weeks.push(w);
    w.L.forEach(function (l, k) { l.week = w.n; l.k = k; l.day = "Day " + (k + 1); l.mod = w.mod; window.COURSE.lessons[l.id] = l; });
  }
};

COURSE.SOURCES = {
  conv: "Market convention",
  turtle: "Turtle rules · Faith (2003)",
  hist: "Historical record",
  esma: "ESMA (2018)",
  math: "Derived math",
  claude: "Claude's worked example",
  design: "Course design",
  douglas: "Douglas, paraphrased",
  data: "Your own data",
  cftc: "CFTC / central-bank schedules"
};

COURSE.MODULES = [
  { code: "TRD 100", key: "100", title: "Orientation: The Turtle Bet", weeks: [0], credits: 2,
    blurb: "The 1983 experiment this programme is modelled on, what a complete trading system is, and how the next four months work." },
  { code: "TRD 101", key: "101", title: "Market Mechanics", weeks: [1, 2, 3, 4], credits: 12, prereq: "TRD 100",
    blurb: "The units, the plumbing and the clock. Everything you'll ever calculate depends on these being automatic." },
  { code: "TRD 102", key: "102", title: "Price Structure", weeks: [5, 6, 7, 8], credits: 12, prereq: "TRD 101", gate: "g1",
    blurb: "Replace chart opinions with mechanical definitions: swings, trend, breaks, levels and liquidity." },
  { code: "TRD 201", key: "201", title: "Risk Mathematics", weeks: [9, 10, 11], credits: 12, prereq: "TRD 102 + Gate 1", gate: "g2",
    blurb: "Position size, volatility, R, expectancy, streaks and ruin. The module that decides who is still trading in two years." },
  { code: "TRD 202", key: "202", title: "Macro & Fundamentals", weeks: [12, 13, 14, 15], credits: 12, prereq: "TRD 201 + Gate 2", gate: "g3",
    blurb: "Rates, central banks, data surprises, correlation and positioning — the gravity that structure moves around." },
  { code: "TRD 301", key: "301", title: "Systems & the Turtle Method", weeks: [16, 17, 18], credits: 16, prereq: "TRD 202 + Gate 3", gate: "g4",
    blurb: "What an edge is, the complete Turtle system as a case study, honest backtesting, and reading your own results." },
  { code: "TRD 302", key: "302", title: "The Trader: Psychology as Procedure", weeks: [19, 20, 21], credits: 12, prereq: "TRD 301 + Gate 4", gate: "g5",
    blurb: "Douglas converted into checklists, circuit breakers and a process scoreboard. Demo trading begins." },
  { code: "TRD 401", key: "401", title: "Probation: Who You Actually Are", weeks: [22, 23, 24], credits: 12, prereq: "TRD 302 (runs alongside demo trading; Gate 5 comes at its end)",
    blurb: "Close the gap between backtest and behaviour, diagnose your natural style from evidence, and refit your system." },
  { code: "TRD 402", key: "402", title: "Funding & Scaling", weeks: [25, 26], credits: 10, prereq: "TRD 401 + Gate 5", gate: "final",
    blurb: "The ladder to real money, the scaling plan, a revision week, and the four-month audit that ends the programme." }
];

COURSE.RANKS = [
  { key: "applicant", name: "Applicant", need: "Finish Orientation and the admission questionnaire" },
  { key: "trainee", name: "Trainee", need: "Pass Gate 4 to become a Probationer" },
  { key: "probationer", name: "Probationer", need: "Pass Gate 5 to be funded" },
  { key: "funded", name: "Funded Turtle", need: "Complete the four-month audit" },
  { key: "graduate", name: "Graduate", need: "" }
];

/* ---------- ORIENTATION (TRD 100) ---------- */
COURSE.ORIENTATION = [
  { id: "o1", mod: "100", week: 0, day: "Day 0", t: "The Bet",
    big: "In 1983 two famous traders bet on whether trading could be taught. It could — to ordinary people who were given complete rules and who followed them. That is the entire premise of this course.",
    plain: "Think of flight school. Nobody is born a pilot. Pilots are made by checklists, simulator hours and a logbook — and when a trained pilot crashes, it's usually because a checklist was skipped, not because a lesson was missing.",
    dia: "turtleTimeline",
    body: [
      "Richard Dennis was one of the most successful commodity traders in Chicago. His friend and fellow trader William Eckhardt believed great traders are born with something that can't be taught. Dennis believed the opposite. To settle it, they ran an experiment.",
      "Dennis placed ads in the **Wall Street Journal**, **Barron's** and the **International Herald Tribune**. Over a thousand people applied. He chose 23 — 21 men and two women — across two classes, many with no trading background at all. He trained them for about two weeks, had them trade small accounts, then gave them real money to trade under his rules.",
      "They became known as the **Turtles** — the story usually told is that Dennis had visited a turtle farm in Singapore and said he would grow traders the way they grew turtles there. By the time the programme ended roughly five years later, the Turtles had reportedly earned about $175 million in aggregate. (Figures vary by source; some put it lower. Treat any single number with care.)",
      "Now the part that matters most for you. The rules were later published — you can read them free today. Yet very few people who read them ever make money with them. And Dennis himself lost heavily in 1987–88, withdrew from managing client money in 1988, and in 1990 his firm settled investor complaints that he had failed to follow his own rules.",
      "> The rules were never the secret. Following them — every signal, through every losing streak — was.",
      "This course runs the same experiment on you. You'll get a complete rulebook to study (the Turtles'), then build your own from your own measurements. And you'll be tested not only on whether you understand your rules, but on whether your journal proves you follow them."
    ],
    ex: { p: "Explain the Turtle experiment to a friend in four or five sentences: what was bet, what happened, and what the real lesson was.",
      r: ["Names the bet: can trading be taught (Dennis) vs traders are born (Eckhardt)", "Ordinary recruits with complete rules and brief training became profitable", "The rules alone aren't enough — most readers don't follow them, and Dennis struggled when he departed from them", "Concludes that disciplined, consistent rule-following is what makes a system work"],
      m: "Richard Dennis bet his friend William Eckhardt that trading could be taught. He recruited 23 mostly inexperienced people, trained them for about two weeks on a complete set of rules, and funded them — and as a group they reportedly made large profits. But the rules were later published and most people who read them still don't profit, and Dennis himself lost heavily when he didn't follow his own rules. So the lesson is that a complete system only works if you follow it consistently, especially through losing streaks." },
    q: [
      { k: "mcq", q: "What was Dennis and Eckhardt's bet about?", o: ["Whether trend-following beats buy-and-hold", "Whether successful trading can be taught", "Whether futures are riskier than stocks", "Whether news or charts matter more"], a: 1, w: "Dennis thought trading could be taught; Eckhardt thought it was innate. The Turtles were the test." },
      { k: "mcq", q: "The Turtle rules are free to read today. The most important reason most readers don't profit from them is…", o: ["The rules only worked in the 1980s", "People don't follow them consistently through drawdowns and losing streaks", "They need a $1 million account", "They require insider information"], a: 1, w: "The published rules themselves stress that consistency and discipline are the key; most traders abandon or edit the rules during losing periods." },
      { k: "mcq", q: "What happened to Richard Dennis himself in 1987–90, according to reports?", o: ["He retired with record profits", "He lost heavily, and his firm later settled complaints that he hadn't followed his own rules", "He was banned from trading for life", "He published the rules to sell books"], a: 1, w: "Reportedly about $50 million was lost in 1987–88, and in 1990 his firm settled investor complaints about not following his own rules." }
    ],
    yt: ["Turtle traders experiment Richard Dennis story explained", "Curtis Faith Way of the Turtle interview"],
    src: ["hist"] },

  { id: "o2", mod: "100", week: 0, day: "Day 0", t: "What a Complete System Is",
    big: "A complete trading system answers every decision you'll ever face in a trade — before the trade exists. Whatever you leave unanswered, your emotions will answer for you, live, with money on the line.",
    plain: "A recipe that says 'add some salt and cook until done' isn't a recipe — it's a hope. A real recipe gives amounts, temperatures and times, so two cooks following it make the same dish.",
    dia: "sixComponents",
    body: [
      "The published Turtle rules frame a complete system as the answers to six questions:",
      "• **Markets** — what do you trade?",
      "• **Position sizing** — how much?",
      "• **Entries** — when do you get in?",
      "• **Stops** — when do you get out of a losing position?",
      "• **Exits** — when do you get out of a winning position?",
      "• **Tactics** — how exactly do you place the orders?",
      "Most retail traders have one of the six: an entry. They have a setup they like, and everything else — size, stop, exit — gets decided in the moment. That's why two traders can use 'the same strategy' and get opposite results. They don't share a strategy. They share an entry and improvise the other five.",
      "This course adds a seventh question. The Turtles had it imposed on them by Dennis's firm; as an independent trader you must impose it on yourself: **when do you stop trading?** Daily loss limits, losing-streak stand-downs, drawdown rules.",
      "> Your capstone in Unit 16 is writing all seven answers so precisely that a stranger reading your document would take exactly the trades you take."
    ],
    ex: { p: "Name the six components of a complete system (plus the course's seventh) and explain why 'I have a great entry setup' is not a system.",
      r: ["Names markets, position sizing, entries, stops, exits, tactics", "Adds the seventh: when to stop trading (limits/stand-downs)", "Explains an entry is only one of six decisions", "Explains that undecided components get decided emotionally in the moment, so results diverge"],
      m: "A complete system answers: which markets, how much to trade, when to enter, when to exit a loser (stops), when to exit a winner, and how to place the orders — plus, in this course, when to stop trading altogether. A great entry answers only one of those questions. Everything left open gets decided in the moment, under pressure, which is why two people with the same entry can get opposite results." },
    q: [
      { k: "mcq", q: "Which is NOT one of the six components in the Turtle framework?", o: ["Position sizing", "Stops", "Market predictions", "Tactics"], a: 2, w: "A system never needs a prediction. It needs rules for markets, size, entries, stops, exits and tactics." },
      { k: "mcq", q: "In the Turtle framework, 'Exits' means…", o: ["When to get out of a losing position", "When to get out of a winning position", "How to place orders", "When to stop trading for the day"], a: 1, w: "Stops handle losers; exits handle winners. Keeping them separate forces you to decide both in advance." },
      { k: "mcq", q: "Two traders use the same entry pattern; one profits and one doesn't. The most likely reason is…", o: ["Luck", "They differ in the other components — size, stops, exits, tactics", "The pattern only works on certain days", "One has a better broker"], a: 1, w: "Sharing an entry isn't sharing a system. The other five components drive most of the difference in results." }
    ],
    yt: ["complete trading system components position sizing entries stops exits explained"],
    src: ["turtle", "design"] },

  { id: "o3", mod: "100", week: 0, day: "Day 0", t: "How This Programme Works",
    big: "Two hours a day: learn one idea, then use it on real price the same day. Every unit ends with a number you produced yourself, and five hard gates stop you moving on until you can prove the last module.",
    plain: "It's a university course with a lab attached. Lectures teach, the lab measures, exams certify — except the lab is the market's own history, and the external examiner is your journal.",
    dia: ["weekRhythm", "fourMonths"],
    body: [
      "**The day.** Two hours, Monday to Saturday. **Hour 1** is one lesson. **Hour 2** applies that same lesson — bar replay, a lab or the Trading Floor — so you see the idea working on price the same day it's taught. Three days make a **unit**; two units make a week.",
      "**Sunday** is your review: you compile the week, answer the tutor's questions, and send it to me. On gate weeks, Sunday also has the gate exam.",
      "**The lesson.** Each follows SEED: **Simplify** (the big idea and an everyday picture), **Expand** (the detail), **Explain back** (you write it in your own words; the tutor marks it RIGHT / PARTIAL / BROKE and shows you where your reasoning broke), **Drill** (questions with worked answers).",
      "**The apply hour.** Real historical price in TradingView Bar Replay, a lab, or the Trading Floor simulator. A unit's three apply hours build one measurement that ends in a number — a frequency, a percentage, an expectancy — and it goes into your **Almanac**, the record of what *you* have measured about markets.",
      "**The gates.** Five module exams at 80%, sat on Sundays, plus the Final. You can read ahead, but you can't do the next module's work until the gate is passed. There's an honest override: it's logged on your record, in red, forever.",
      "**Ranks.** Applicant → Trainee (after this orientation) → Probationer (Gate 4 — demo trading unlocks) → Funded Turtle (Gate 5) → Graduate (the four-month audit).",
      "**The tutor.** Ask anything, any time. It knows the course and — when you ask — your own journal numbers. It runs on your Claude usage.",
      "**The calendar.** Orientation starts Tue 1 Dec 2026, Week 1 starts Mon 7 Dec, and the Final is on Sun 28 Mar 2027. Rest days: 25 December and 1 January. Three buffer days (29–31 Mar) catch any slip. The Plan page shows every day.",
      "**What this can and cannot do.** Two hours a day for four months is about 220 hours. That is enough to make you **competent with a tested system** and a risk framework you can defend. It is not enough to make you a master — mastery is measured in years and thousands of trades. Anyone who promises otherwise is selling something, and you have already paid that tuition once.",
      "**Built against the five things that broke your first attempt:**",
      "• **Jumped from concept to concept** → a strict prerequisite chain. Unit 11 is impossible without Unit 9, and five gates physically stop you skipping.",
      "• **A mentor who gave signals, not education** → nobody gives you a signal here, the tutor included. Every unit you produce your own statistic from your own chart.",
      "• **Long videos, lost interest** → one lesson a day, then an hour using it with your own hands. Learning and doing happen on the same day.",
      "• **No tracking — didn't know what worked** → the journal from Day 1. The journal is the product; trades are just how you fill it.",
      "• **Stress at the chart, careless decisions** → the Unit 20 experiment: your watched versus unwatched trades, compared in R, so you see the cost in numbers.",
      "> Understanding is not a checkpoint. Evidence is. You move on when the unit's number exists — written down, produced by you.",
      "> If you fall behind, you don't restart and you don't skip. The Today page always shows the exact next thing. Consistency beats intensity."
    ],
    ex: { p: "In your own words: what are the four SEED steps, what goes into your Almanac, and what must be true before you're allowed to demo trade?",
      r: ["Simplify, Expand, Explain back, Drill — in order", "The Almanac holds the numbers produced by each unit's apply hours", "Demo unlocks at Gate 4 (late February): 100+ honest backtested trades, positive expectancy, and knowing when the system loses"],
      m: "SEED is Simplify (the big idea), Expand (the detail), Explain back (writing it in my own words for the tutor to check), then Drill (questions). Each unit's apply hours produce a number from my own backtesting, and those numbers form my Almanac. Demo trading only unlocks at Gate 4, after 100 or more honest backtested trades with positive expectancy and a written account of when my system loses." },
    q: [
      { k: "mcq", q: "What unlocks demo trading?", o: ["Finishing Unit 8", "Passing Gate 4: 100+ honest backtested trades with positive expectancy, and naming when your system loses", "Making a profit in the simulator", "Asking the tutor"], a: 1, w: "Demo is gated on evidence of an edge, not on time served." },
      { k: "mcq", q: "What is the pass mark on a gate exam?", o: ["50%", "65%", "80%", "100%"], a: 2, w: "80% — the same hard-gate standard you chose for your STA221 War Room." },
      { k: "mcq", q: "You miss four days. What does the programme tell you to do?", o: ["Restart from Day 1", "Skip ahead to stay on the calendar", "Resume exactly where you stopped — the Today page shows it", "Take the rest of the week off"], a: 2, w: "Skipping creates gaps that break later modules; restarting punishes you. Resume." }
    ],
    yt: [],
    src: ["design"] }
];

/* ---------- ADMISSION QUESTIONNAIRE (in the spirit of the Turtle application; written for this course) ---------- */
COURSE.ADMISSION = [
  { s: "A good trading system should be right most of the time.", a: false, w: "Win rate isn't edge. Trend-following systems like the Turtles' typically lose on more than half their trades and still profit, because the winners are much larger than the losers.", fix: "TRD 201 · The win-rate trap" },
  { s: "After three losses in a row, a win is more likely.", a: false, w: "That's the gambler's fallacy. With a real edge, each trade's odds are unchanged by the last one — which is exactly why long losing streaks happen to good systems.", fix: "TRD 201 · Streaks are normal" },
  { s: "Position size should depend on how confident you feel about the setup.", a: false, w: "Size is an output of arithmetic: account × risk % ÷ stop distance. Confidence is not an input — confident traders are the ones who blow up.", fix: "TRD 201 · The position-size formula" },
  { s: "It's fine to skip a system signal if the chart looks weak.", a: false, w: "The published Turtle rules warn that a year's profits can come from just two or three trades. Skipped signals are where those trades hide.", fix: "TRD 302 · Take every signal" },
  { s: "A stop loss is guaranteed to fill at its price.", a: false, w: "A stop becomes a market order when touched and fills at the best available price — which in a gap can be far worse.", fix: "TRD 101 · Order types" },
  { s: "If a strategy made money over the last 20 trades, it probably has an edge.", a: false, w: "Twenty trades can't separate skill from luck. With 100 trades the uncertainty on a win rate is still about ±10 percentage points.", fix: "TRD 301 · Sample size" },
  { s: "A losing trade that followed every rule was a good trade.", a: true, w: "Process is what you control; outcomes are distributed randomly around your edge. A rule-perfect loss is a good trade. A rule-breaking win is a dangerous one.", fix: "TRD 302 · The execution grade" },
  { s: "High-impact news releases are the best time to trade because the moves are biggest.", a: false, w: "Spreads widen by multiples, slippage jumps and first moves often reverse. Professionals use news for context, not entries.", fix: "TRD 202 · News as context" },
  { s: "When price spikes through my stop and reverses, the market is targeting me personally.", a: false, w: "Stops cluster in predictable places and large orders need that liquidity to fill. It's mechanics, not a vendetta.", fix: "TRD 102 · Where stops live" },
  { s: "To make money you need to predict where price is going next.", a: false, w: "You need a positive expectancy repeated over many trades. The casino doesn't predict the next hand.", fix: "TRD 301 · What an edge is" },
  { s: "Risking 10% on a trade is acceptable if the setup is excellent.", a: false, w: "At 10% per trade, even a system with a real edge suffers roughly an 80% median drawdown over 200 trades in simulation. Excellence doesn't survive that.", fix: "TRD 201 · Risk of ruin" },
  { s: "Being long EUR/USD and long GBP/USD at the same time is diversification.", a: false, w: "Both are short-dollar positions that usually move together — one bet at double size.", fix: "TRD 202 · Correlated positions are one trade" }
];
