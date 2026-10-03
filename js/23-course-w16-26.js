/* ============================================================
   TRD 301 · Systems & the Turtle Method (Units 16–18)
   TRD 302 · The Trader: Psychology as Procedure (Units 19–21)
   TRD 401 · Probation (Units 22–24)
   TRD 402 · Funding & Scaling (Units 25–26)
   ============================================================ */

COURSE.week({
  n: 16, mod: "301", t: "What an Edge Is, and the Complete System",
  aim: "Study a complete system rule by rule — then turn six phases of your own measurements into rules a stranger could execute.",
  L: [
    { id: "w16a", t: "What an Edge Actually Is",
      big: "An edge is a repeatable, identifiable condition under which outcomes are skewed in your favour. It's statistical, not predictive: you aren't forecasting, you're repeatedly taking a slightly favourable bet and letting sample size do the work.",
      plain: "An insurance company has no idea which house will burn down this year. It knows the rate across thousands of houses and prices every policy slightly in its favour.",
      body: [
        "Four things every real edge has:",
        "• **Identifiable** — you can say exactly when it's present (a written condition, not a feeling).",
        "• **Positive expectancy after costs** — measured in R over a meaningful sample.",
        "• **A reason** — a behavioural or structural explanation for why it should exist (e.g., trends persist because information and capital move slowly; stops cluster at obvious levels).",
        "• **Decay** — edges weaken as conditions change or as they get crowded. You monitor them; you don't marry them.",
        "An edge doesn't need you to be right about the next trade. It needs you to take the next hundred trades exactly the same way.",
        "> The Turtles' edge wasn't a prediction about any market. It was: 'trends are larger and more persistent than random noise, and we'll be in every one of them, sized so the losers can't hurt us.'"
      ],
      ex: { p: "Define an edge, list its four properties, and explain why an edge doesn't require predicting the next trade.",
        r: ["Repeatable condition with outcomes skewed in your favour (statistical)", "Identifiable, positive expectancy after costs, has a reason, decays", "Works through repetition over many trades", "Example (e.g., Turtle trend-following) without prediction"],
        m: "An edge is a condition I can identify in advance where, over many trades, the outcomes are skewed in my favour after costs. It needs a precise definition, positive expectancy measured in R, a reason it should exist, and monitoring because edges decay. It doesn't predict any single trade — like an insurer, it wins by taking the same slightly favourable bet many times." },
      q: [
        { k: "mcq", q: "An edge is best described as…", o: ["A reliable prediction of the next move", "A repeatable condition with outcomes skewed in your favour over many trades", "A high win rate", "A secret indicator"], a: 1, w: "Statistical, not predictive." },
        { k: "mcq", q: "Which is NOT a property of a real edge?", o: ["Positive expectancy after costs", "A reason it should exist", "It never decays", "It can be identified in advance"], a: 2, w: "All edges can decay." },
        { k: "mcq", q: "The Turtles' edge rested mainly on…", o: ["Predicting reversals", "Trends being larger and more persistent than noise, with losses kept small", "Insider information", "News trading"], a: 1, w: "Be in every trend; size so losers can't hurt." }
      ],
      yt: ["what is a trading edge explained statistics"],
      src: ["turtle", "design"] },

    { id: "w16b", t: "Unambiguous Rules and the Complete System",
      big: "Write every rule so precisely that a stranger reading your document would take exactly the trades you take. Ambiguity is where discretion hides — and discretion is where self-deception lives.",
      plain: "A written contract versus a verbal promise. When things go wrong, only the written terms protect you.",
      body: [
        "Your system document answers the Turtle framework's six questions plus this course's seventh:",
        "• **Markets** — which pairs, and why these.",
        "• **Position sizing** — risk % (≤1% at the stop), the formula, rounding.",
        "• **Entries** — the exact condition to look, and the exact trigger.",
        "• **Stops** — where, and the rule for moving them (if any).",
        "• **Exits** — how winners are closed.",
        "• **Tactics** — order types, what you do around news, gaps, and missed fills.",
        "• **When not to trade** — circuit breakers, correlation caps, news policy.",
        "**The stranger test.** 'Enter on strong momentum' fails — two readers disagree about 'strong'. 'Enter when a 4H candle body closes above the most recent confirmed N = 3 swing high while the Daily is in an uptrend' passes.",
        "> Every word that needs your judgement in the moment is a door your emotions will walk through."
      ],
      ex: { p: "List the seven components of your system document and turn one vague rule into an unambiguous one.",
        r: ["Markets, sizing, entries, stops, exits, tactics, when not to trade", "Explains the stranger test", "Rewrites a vague rule precisely (measurable terms, no judgement words)", "Links ambiguity to emotional decisions in the moment"],
        m: "My document covers markets, position sizing, entries, stops, exits, tactics and when not to trade. The test is whether a stranger reading it would take exactly my trades. 'Buy when momentum is strong' fails because 'strong' is a judgement. 'Buy when a 4H body closes above the last confirmed N = 3 swing high while the Daily is in an uptrend' passes, because anyone can check it." },
      q: [
        { k: "mcq", q: "Which rule passes the stranger test?", o: ["Enter when the setup looks clean", "Enter on a 4H body close above the last confirmed N = 3 swing high while the Daily is in an uptrend", "Enter when momentum is strong", "Enter when I feel confident"], a: 1, w: "Every term is measurable." },
        { k: "mcq", q: "The seventh component this course adds is…", o: ["Indicators", "When not to trade", "Social media", "Broker choice"], a: 1, w: "Imposed on the Turtles by the firm; self-imposed for you." },
        { k: "mcq", q: "Why is ambiguity dangerous?", o: ["It's slower", "It leaves decisions to be made emotionally in the moment", "Brokers reject ambiguous orders", "It isn't"], a: 1, w: "Discretion hides there." }
      ],
      yt: ["how to write a trading plan rules examples"],
      src: ["turtle", "design"] },

    { id: "w16c", t: "Case Study: The Turtle System, Rule by Rule",
      big: "The Turtle system is a complete, published, mechanical trend-following system: breakouts to enter, volatility to size, 2N to stop, channels to exit. Walking through it shows you what 'complete' looks like.",
      plain: "Before you design your own house, you walk through a finished one with the architect's plans in your hand.",
      dia: "turtleFlow",
      body: [
        "**Markets.** Liquid US futures: bonds, currencies, precious metals, energy, softs, stock indices. (Grains and meats were excluded.)",
        "**Sizing.** Unit = 1% of equity ÷ (N × dollars per point), so a 1N move ≈ 1% of the account.",
        "**Entries.** *System 1:* a 20-day breakout — but skip it if the previous breakout was a winner; if skipped, enter on a 55-day breakout instead (the 'failsafe'). *System 2:* a 55-day breakout, always taken.",
        "**Adding.** One more unit every ½N in the trade's favour, up to **4 units**.",
        "**Stops.** 2N from entry. When a unit is added, all stops move up to 2N from the newest unit.",
        "**Exits.** *System 1:* a 10-day low (for longs). *System 2:* a 20-day low. All units exit together.",
        "**Limits.** 4 units per market, 6 closely correlated, 10 loosely correlated, 12 in one direction.",
        "**Drawdown.** For each 10% drawdown, trade as if the account were 20% smaller.",
        "**What it feels like.** Most trades lose small. A few trades make the year. The published rules call the exits 'probably the single most difficult part' — you must watch big open profits shrink while waiting for the channel exit.",
        "> The Trading Floor runs these exact rules. This week you'll run them on six markets and discover which ones they suit — and how much of the profit came from just three trades."
      ],
      ex: { p: "Walk through the complete Turtle System 1 — markets, sizing, entry (with the filter), adds, stops, exits, limits — and name the part the rules say is hardest.",
        r: ["Unit sizing from N (1% per N)", "S1 20-day breakout with skip-after-winner filter and 55-day failsafe", "Adds every ½N up to 4 units; stops 2N from the newest unit", "S1 exits on a 10-day opposite breakout; limits 4/6/10/12", "Exits (watching profits shrink) are the hardest part"],
        m: "The Turtles traded liquid futures, sizing each unit so 1N equalled 1% of equity. System 1 entered on a 20-day breakout unless the previous breakout had been a winner, in which case it waited for a 55-day breakout. They added a unit every half N up to four, kept stops 2N from the latest unit, and exited everything on a 10-day breakout the other way. Limits capped units per market and per correlated group, and they cut size in drawdowns. The rules say exits are the hardest part, because you watch big profits shrink before the exit triggers." },
      q: [
        { k: "mcq", q: "Turtle System 1's entry filter says…", o: ["Take every 20-day breakout", "Skip a 20-day breakout if the previous breakout was a winner (and use the 55-day failsafe)", "Only trade on Mondays", "Wait for a pullback"], a: 1, w: "Filter plus failsafe." },
        { k: "num", q: "Gold breaks out at 310.00 with N = 2.50. At what price is the THIRD unit added? (2 decimals)", a: 312.5, tol: 0.001, w: "Units at 310.00, 311.25, 312.50, 313.75 — every ½N = 1.25." },
        { k: "mcq", q: "System 2 exits a long position on…", o: ["A 10-day low", "A 20-day low", "A 55-day low", "A 2R target"], a: 1, w: "S1 uses 10-day, S2 uses 20-day." }
      ],
      yt: ["turtle trading rules explained complete system", "donchian breakout turtle system 1 system 2"],
      src: ["turtle"] }
  ],
  P: { task: "Run the complete Turtle system on six markets, then write your own System v1.",
    steps: [
      "Trading Floor → Autopilot: run Turtle System 1 on all six markets. For each, note expectancy, max drawdown in R, longest losing streak and the share of profit from the top three trades. Reveal each market's DNA: which markets suit it, and why?",
      "Write System v1 — all seven components — built only from what your own data supported: your Unit 3 session number, Unit 6 filter, Unit 7 level decay, Unit 8 sweep number and Unit 15 correlation rule.",
      "Run System 2 on the same six markets and compare. Then re-read your v1 cold, mark every sentence that could be read two ways, and rewrite until none remain."
    ],
    tools: ["floor:auto", "journal"],
    num: [
      { k: "bestMkt", l: "Market where Turtle S1 did best (and its expectancy)", t: "text" },
      { k: "worstMkt", l: "Market where it did worst (and its expectancy)", t: "text" },
      { k: "top3", l: "Highest top-3 share of profit you saw (%)", t: "number" },
      { k: "rules", l: "Ambiguous sentences found and fixed in v1", t: "number" }
    ] },
  R: "Send System v1 and your Turtle autopilot table. I'll hunt for ambiguity, and for any rule your own data doesn't support."
});

COURSE.week({
  n: 17, mod: "301", t: "Backtesting Honestly",
  aim: "Learn the only backtesting method that produces a number you're entitled to believe.",
  L: [
    { id: "w17a", t: "Bar Replay, or Nothing",
      big: "Honest backtesting means replaying the chart one candle at a time from a start date you didn't pick for its outcome, and deciding before you see the next candle. Scrolling back through history spotting your setup isn't backtesting — it's confirmation bias with extra steps.",
      plain: "Reading a detective novel's last page first and then 'solving' the case. Of course you get it right.",
      body: [
        "**The method:** TradingView Bar Replay (or the Trading Floor, which replays blind). Choose the start date *before* looking at that stretch of chart. Advance one candle at a time. Every decision — enter, skip, exit — is made and logged before the next candle appears.",
        "**Why scrolling fails:** your eye jumps straight to the textbook examples. The ambiguous setups you would have taken and lost on never get counted. The result is an edge that exists only in hindsight.",
        "**Blind starts.** The Trading Floor picks a random start and hides dates, so you can't remember what happened next. When you import your own data, it's blind too.",
        "> A backtest you could have faked is worthless even if you didn't fake it — because you can't prove to yourself that you didn't."
      ],
      ex: { p: "Explain the difference between honest bar replay and scrolling back through a chart, and why the second overstates an edge.",
        r: ["Replay one candle at a time from a pre-chosen/blind start", "Decide and log before seeing the next candle", "Scrolling selects textbook examples and skips ambiguous losers", "Hindsight inflates the measured edge"],
        m: "Honest backtesting replays the chart one candle at a time from a start I didn't choose based on what happens next, and I log every decision before the next candle appears. Scrolling back lets my eye find the perfect examples and skip the messy ones I would have taken and lost on, so the edge looks much bigger than it really is." },
      q: [
        { k: "mcq", q: "Which is an honest backtest?", o: ["Scrolling back and marking clean setups", "Replaying bar by bar from a blind start, deciding before each new candle", "Using only trades you remember", "Asking a friend which trades worked"], a: 1, w: "Decide before you see." },
        { k: "mcq", q: "Scrolling-style backtests usually…", o: ["Understate the edge", "Overstate the edge", "Are accurate", "Only affect win rate"], a: 1, w: "They drop the ambiguous losers." },
        { k: "mcq", q: "Why does the Trading Floor hide dates?", o: ["To save space", "So you can't remember what happened next", "Because dates are fake", "It's a bug"], a: 1, w: "Memory is hindsight." }
      ],
      yt: ["tradingview bar replay backtesting how to"],
      src: ["design"] },

    { id: "w17b", t: "Sample Size and What You May Claim",
      big: "Thirty trades tell you almost nothing. A hundred give a rough estimate. Even at a hundred, the uncertainty on a win rate is about ten percentage points either way — so be humble about what your numbers prove.",
      plain: "Taste one spoon of a pot of soup and you know roughly how salty it is. Taste one grain of rice and you know nothing about the pot.",
      body: [
        "= 95% uncertainty on a win rate ≈ ± 1.96 × √( p × (1 − p) ÷ n )",
        "• **n = 30**, p = 50%: about **±18** points",
        "• **n = 100**: about **±10** points",
        "• **n = 300**: about **±6** points",
        "So a '58% win rate' from 100 trades honestly means 'somewhere between about 48% and 68%'. To halve the uncertainty you need **four times** as many trades.",
        "Expectancy is even noisier than win rate, because a few big winners swing it — which is exactly the trend-follower's situation.",
        "> Claim only what your sample supports. 'Positive over 100 trades, on two separate periods' is a claim. 'I've found the holy grail' after 25 trades is a story."
      ],
      ex: { p: "Explain why 30 trades prove almost nothing, and what a 58% win rate from 100 trades honestly tells you.",
        r: ["Uses the ±1.96√(p(1−p)/n) idea or equivalent", "30 trades ≈ ±18 points; 100 ≈ ±10", "58% at n = 100 means roughly 48–68%", "Quadruple the sample to halve the uncertainty; expectancy is noisier"],
        m: "Small samples are dominated by luck. The uncertainty on a win rate is about 1.96 times the square root of p(1 − p)/n: roughly ±18 points at 30 trades and ±10 at 100. So a 58% win rate over 100 trades could really be anywhere from about 48% to 68%. To halve that uncertainty I'd need four times as many trades, and expectancy is even noisier." },
      q: [
        { k: "num", q: "With 100 trades at a 50% win rate, the 95% uncertainty is about ± how many percentage points? (nearest whole number)", a: 10, tol: 0.6, u: "pts", w: "1.96 × √(0.25 ÷ 100) = 0.098 → about ±10 points." },
        { k: "num", q: "To halve the uncertainty you had with 100 trades, how many trades do you need?", a: 400, tol: 0.5, u: "trades", w: "Uncertainty shrinks with √n, so halving it needs 4 × 100 = 400." },
        { k: "mcq", q: "After 25 trades your expectancy is +0.8R. The honest claim is…", o: ["I've found a great edge", "Encouraging, but far too few trades to know", "The system is broken", "Double the risk"], a: 1, w: "Twenty-five trades is a rumour, not evidence." }
      ],
      yt: ["confidence interval explained intuition sample size", "law of large numbers explained"],
      src: ["math"] },

    { id: "w17c", t: "The Record",
      big: "A backtest is only as good as its log. Record the same fields for every trade — including a screenshot — so that three months from now you can audit yourself, slice the data, and trust what it says.",
      plain: "A scientist's lab notebook. An experiment nobody wrote down didn't happen.",
      body: [
        "Per trade: **date, pair, timeframe, session, setup name, direction, entry, stop, target, exit, outcome in R, rules followed (Y/N and which broke), and a screenshot link**. Your Journal tab has every field, computes R for you, and tags each trade with its **test set** (e.g., 'v1-A') so Gate 4 can check you tested on two separate periods.",
        "Fields that feel pointless now are the ones Unit 18 needs: session and setup name are what let you discover that your whole edge lives in one slice of the data.",
        "Screenshots matter because memory rewrites trades. In three months you'll 'remember' taking a textbook setup; the screenshot will show you took a marginal one.",
        "> Log at the moment of the decision, not at the end of the session. End-of-session logs are reconstructions."
      ],
      ex: { p: "List the fields you record for every backtest trade and explain why two of them — session and screenshot — matter so much later.",
        r: ["Lists the core fields (date, pair, TF, session, setup, direction, entry/stop/target/exit, R, rules followed, screenshot)", "Session/setup enable segmentation later", "Screenshots prevent memory from rewriting trades", "Log at the time of decision"],
        m: "For each trade I record date, pair, timeframe, session, setup name, direction, entry, stop, target, exit, the result in R, whether I followed the rules, and a screenshot. Session and setup matter because they let me later discover where my edge actually lives. Screenshots matter because my memory will rewrite trades — the picture won't. And I log as I go, not afterwards." },
      q: [
        { k: "mcq", q: "Why record the session for every trade?", o: ["It's required by brokers", "So you can later find out whether the edge lives in one session", "For decoration", "To compute pip value"], a: 1, w: "Session is often the strongest slice." },
        { k: "mcq", q: "When should a backtest trade be logged?", o: ["At the end of the week", "At the moment of the decision", "Only if it wins", "Never"], a: 1, w: "Later logs are reconstructions." },
        { k: "mcq", q: "What is a 'test set' tag for?", o: ["Colour coding", "Separating periods/versions so you can verify an edge on data it wasn't built on", "Tax purposes", "Nothing"], a: 1, w: "Gate 4 checks two periods." }
      ],
      yt: ["how to keep a trading journal backtesting spreadsheet"],
      src: ["design"] }
  ],
  P: { task: "Backtest System v1 honestly — 50 trades, bar by bar, no peeking.",
    steps: [
      "Tag this run 'v1-A'. In TradingView Bar Replay (or the Trading Floor with your own imported data), take the first 15 trades of System v1 — logging each in the Journal at the moment of decision.",
      "Continue to 35 trades. Keep every field complete, including screenshots.",
      "Reach 50 trades. Check the Journal's running expectancy. Record below."
    ],
    tools: ["journal", "floor", "tv"],
    num: [
      { k: "n", l: "Trades logged in v1-A", t: "number" },
      { k: "exp", l: "Running expectancy (R)", t: "number" }
    ] },
  R: "Send your 50-trade log summary and running expectancy. Tell me honestly whether any trade was decided after you'd already seen the next candle."
});

COURSE.week({
  n: 18, mod: "301", t: "Reading Your Own Results",
  aim: "Separate legitimate refinement from curve-fitting — the skill that decides whether your system survives contact with the future.",
  gate: "g4",
  L: [
    { id: "w18a", t: "The Full Statistical Picture",
      big: "No single number describes a system. You need the set — win rate, average win, average loss, expectancy, total R, maximum drawdown, longest losing streak and trade frequency — because any one alone will mislead you.",
      plain: "A doctor doesn't judge your health by your weight alone. The full panel tells the story; any single reading can fool you.",
      body: [
        "• **Win rate** and **average win / average loss** — together they give expectancy.",
        "• **Expectancy (R per trade)** — the edge.",
        "• **Total R** — expectancy × number of trades; frequency matters.",
        "• **Maximum drawdown (R)** — the deepest peak-to-trough fall of your cumulative R. Compare it with your Monte Carlo from Unit 11.",
        "• **Longest losing streak** — compare with the Streaks lab's expectation.",
        "• **Trades per week** — a +0.5R edge that fires twice a year is a hobby; one that fires twice a week is a business.",
        "• **Top-3 share** — how much of your total profit came from your three best trades. Trend systems often exceed 50%; that number is the case for never skipping a signal.",
        "The Journal and the Trading Floor compute all of these for you — your job is to read them together."
      ],
      ex: { p: "Name the eight statistics you read together and explain how two of them could mislead you if read alone.",
        r: ["Win rate, avg win, avg loss, expectancy, total R, max drawdown, longest losing streak, frequency (and top-3 share)", "Win rate alone misleads without win size", "Expectancy alone misleads without frequency/drawdown", "Compares drawdown/streaks with Monte Carlo/Streaks expectations"],
        m: "I read win rate, average win, average loss, expectancy, total R, maximum drawdown, longest losing streak and trades per week together, plus how much profit came from the top three trades. A high win rate alone can hide a negative expectancy if the losses are big. A good expectancy alone can hide a system that rarely trades or has drawdowns I couldn't survive. So I compare drawdown and streaks with what my Monte Carlo said to expect." },
      q: [
        { k: "mcq", q: "Expectancy +0.5R but only 4 trades a year. The problem is…", o: ["Negative edge", "Frequency — total R per year is tiny", "Win rate", "Nothing"], a: 1, w: "Edge × frequency = income." },
        { k: "mcq", q: "Maximum drawdown in R is…", o: ["The largest single loss", "The deepest peak-to-trough fall in cumulative R", "The number of losing trades", "The average loss"], a: 1, w: "Measured on the running total." },
        { k: "mcq", q: "A high 'top-3 share' tells you…", o: ["Your system is broken", "A few trades carry most of the profit — skipping signals is very costly", "Win rate is high", "Losses are big"], a: 1, w: "The Turtle lesson in one number." }
      ],
      yt: ["trading system performance metrics explained drawdown expectancy"],
      src: ["math"] },

    { id: "w18b", t: "Segment Everything",
      big: "Split your results by session, pair, day, market state and setup. Very often the whole edge lives in one slice and everything else is drag — and finding that is worth more than any new setup.",
      plain: "A shop that's losing money overall may be making all its profit on Saturdays and losing it on quiet Tuesdays. Close on Tuesdays and it's a good business.",
      body: [
        "Slice the log by: **session**, **pair**, **day of week**, **market state** (trend / range, by your Unit 5 definition), **setup**, **timeframe**, and — from Unit 19 — **watched vs unwatched** and **execution grade**.",
        "Look for slices with clearly positive expectancy **and** a decent sample, and slices that are clearly negative.",
        "Beware small slices: with many slices, some will look brilliant by pure luck. Treat a slice with fewer than about 20 trades as a hypothesis to test, not a finding.",
        "The Journal's **Segments** view does the slicing and warns you when a slice is too small to trust.",
        "> The Turtle autopilot shows the same idea at market level: the identical rules made money on some markets and lost on others. 'Which markets?' is a system decision, not an afterthought."
      ],
      ex: { p: "Explain why you segment results, which slices you use, and how you avoid fooling yourself with small slices.",
        r: ["Edge often concentrates in one slice (session/pair/state)", "Lists several slicing dimensions", "Small slices can look great by luck — treat <~20 trades as a hypothesis", "Segment findings become rules only with a reason and further testing"],
        m: "My overall results can hide a strong edge in one slice and losses everywhere else, so I split by session, pair, day, market state, setup and timeframe. The danger is that with lots of slices some look great by luck, so anything under about 20 trades is only a hypothesis to test on new data, and I need a reason for why that slice should be better." },
      q: [
        { k: "mcq", q: "A slice of 9 trades shows +1.4R expectancy. The right conclusion is…", o: ["A proven edge", "An interesting hypothesis to test on new data", "Trade only that slice with double size", "Ignore it forever"], a: 1, w: "Nine trades is noise-sized." },
        { k: "mcq", q: "Which is a useful segmentation dimension?", o: ["Session", "The colour of your chart", "Your mood the day before", "The weather"], a: 0, w: "Session often explains the most." },
        { k: "mcq", q: "The Turtle autopilot across six markets shows that…", o: ["Rules work everywhere", "Market selection is part of the system", "Markets don't matter", "Only System 2 works"], a: 1, w: "Same rules, different results by market." }
      ],
      yt: ["trading journal analysis segmenting results"],
      src: ["design", "turtle"] },

    { id: "w18c", t: "Refinement Versus Curve-Fitting",
      big: "A change to your system is legitimate if you can state a mechanical reason it should work. It's curve-fitting if you found it by trying settings until the number improved. The first survives on new data; the second almost never does.",
      plain: "Tailoring a suit to someone's body versus tailoring it to one photograph of them. The photo-fit suit looks perfect in that photo and fits nobody in real life.",
      body: [
        "**Legitimate:** 'I removed Asian-session trades, because the book is thin and my stops were being swept — and my Unit 3 and Unit 8 numbers support that.'",
        "**Curve-fitting:** 'I tried swing N = 2, 3, 4, 5 and 7, and a 17-period filter, and this combination gave the best backtest.'",
        "Tests for a change: **(1)** Can you explain the mechanism in one sentence? **(2)** Was the idea formed *before* you saw the result? **(3)** Does it survive on a period it wasn't built on?",
        "The rule for v2: **at most two changes**, each with a written mechanical justification — then test v2 on a *different* 12-month period from v1.",
        "> Every extra parameter is a new way to fit the past. Simple systems with few parameters are more likely to still work next year."
      ],
      ex: { p: "Explain the difference between refinement and curve-fitting, give an example of each, and state the three tests a change must pass.",
        r: ["Refinement has a mechanical reason; curve-fitting is found by optimising", "One example of each", "Tests: explainable mechanism, idea formed before result, survives out-of-sample", "Fewer parameters generalise better; limit to two changes"],
        m: "Refinement is a change with a real mechanical reason, like removing Asian-session trades because thin liquidity gets my stops swept. Curve-fitting is trying lots of settings until the backtest looks best — it fits the past and fails in the future. A change must be explainable in one sentence, thought of before I saw the result, and still work on a period it wasn't built on." },
      q: [
        { k: "mcq", q: "Which change is most likely curve-fitting?", o: ["Removing thin-session trades after seeing sweeps", "Testing 12 moving-average lengths and keeping the best one", "Adding a news policy after measuring slippage", "Capping correlated risk"], a: 1, w: "Optimising a parameter until it looks good." },
        { k: "mcq", q: "The strongest evidence a refinement is real is that it…", o: ["Improved the backtest it was found on", "Also improves results on a different period it wasn't built on", "Has a complicated formula", "A famous trader uses it"], a: 1, w: "Out-of-sample survival." },
        { k: "mcq", q: "Why limit v2 to two changes?", o: ["Laziness", "Each change adds a way to fit the past; fewer changes are easier to verify", "Brokers limit changes", "No reason"], a: 1, w: "Simplicity generalises." }
      ],
      yt: ["overfitting explained simply", "curve fitting trading strategy out of sample testing"],
      src: ["design", "math"] }
  ],
  P: { task: "Reach 100 honest trades, segment them, build v2 — and sit Gate 4, the demo unlock.",
    steps: [
      "Take System v1 toward 100+ honest trades (tag 'v1-A'). Then write down all eight numbers from the Journal: win rate, average win, average loss, expectancy, total R, max drawdown, longest losing streak, trades per week.",
      "Journal → Segments: write the three strongest and three weakest slices with their sample sizes. Mark any slice under 20 trades as a hypothesis, not a finding.",
      "Write System v2 with at most two changes, each with a one-sentence mechanical reason. Start backtesting v2 on a DIFFERENT 12-month period (tag 'v2-B'). The next three days are backtest days before Gate 4."
    ],
    tools: ["journal", "floor", "tv"],
    num: [
      { k: "nA", l: "Trades in v1-A", t: "number" },
      { k: "eA", l: "Expectancy v1-A (R)", t: "number" },
      { k: "eB", l: "Expectancy v2-B (R)", t: "number" },
      { k: "loses", l: "Conditions where your system loses (one line)", t: "text" }
    ] },
  R: "Send both periods' statistics and your 'where it loses' statement. Passing Gate 4 unlocks demo trading."
});

COURSE.week({
  n: 19, mod: "302", t: "Routines That Remove Decisions",
  aim: "You've read both Douglas books. This is where they become procedure — because under stress you don't rise to your intentions; you fall to your routines.",
  L: [
    { id: "w19a", t: "Why Stress Degrades Decisions",
      big: "Under stress your working memory narrows and you fall back on habit and impulse. The fix isn't more willpower — willpower is the thing that's failing. The fix is pre-commitment: decisions made in calm, executed mechanically under pressure.",
      plain: "Pilots don't improvise during an engine fire. They run the checklist they practised on the ground, because the fire is the worst possible moment to think.",
      body: [
        "Stress (money on the line, a fast-moving chart, a loss just taken) triggers a fight-or-flight response that narrows attention and favours quick, familiar actions over careful ones.",
        "That's why traders who 'know better' still move stops, add to losers and revenge trade: the knowledge lives in the calm part of the brain that stress switches down.",
        "The professional answer is to **move decisions out of the moment**: every decision you can make in advance — size, stop, exit, what to do if X — should be written down and executed, not reconsidered.",
        "> You told me you get stressed watching the chart and make careless decisions. That's not a character flaw. It's biology — and procedure is the treatment."
      ],
      ex: { p: "Explain why stress makes traders break rules they understand, and why pre-commitment beats willpower.",
        r: ["Stress narrows attention/working memory; habit and impulse take over", "Knowledge is least available exactly when needed", "Willpower is the failing resource", "Pre-commitment moves decisions to calm moments; execution becomes mechanical"],
        m: "When money is on the line and the chart is moving, stress narrows my attention and my brain falls back on quick habits and impulses. The careful knowledge I have is least available at that exact moment, so relying on willpower fails. Pre-commitment works because I make the decisions when I'm calm and only execute them under pressure." },
      q: [
        { k: "mcq", q: "Under acute stress, decision-making tends to…", o: ["Improve", "Narrow toward habit and impulse", "Become more analytical", "Stay the same"], a: 1, w: "Attention and working memory narrow." },
        { k: "mcq", q: "The most reliable fix for rule-breaking under stress is…", o: ["Stronger willpower", "Pre-committed decisions executed mechanically", "Trading more", "Ignoring emotions"], a: 1, w: "Checklists, not heroics." },
        { k: "mcq", q: "Why do pilots use checklists in emergencies?", o: ["They forget how to fly", "Stress makes improvised thinking unreliable", "Regulations only", "To slow down"], a: 1, w: "The emergency is the worst time to think." }
      ],
      yt: ["stress and decision making explained brain", "Mark Douglas trading in the zone summary"],
      src: ["design", "douglas"] },

    { id: "w19b", t: "The Pre-Trade Checklist",
      big: "Turn your system's seven components into physical tick-boxes. No trade is placed until every box is ticked. The friction isn't overhead — the friction is the mechanism.",
      plain: "A surgical team's checklist before the first cut: right patient, right side, right procedure. It feels silly — until it prevents the unthinkable.",
      body: [
        "Your checklist is your system document compressed into yes/no questions. For example:",
        "• Is this pair on my market list, and within my correlation cap?",
        "• Is my entry condition present exactly as written?",
        "• Is the stop placed where the idea is wrong (structurally)?",
        "• Is size calculated by formula, rounded down, ≤1% at the stop?",
        "• Is there a tier-one release in the next hour? (news policy)",
        "• Am I within today's and this week's loss limits?",
        "• Emotion score before the trade: 1–5. (If ≥4, stand down.)",
        "A trade with even one unticked box is not taken. From this week, **screenshot the completed checklist for every demo trade** — a trade without one counts as a rule breach whatever its outcome.",
        "The Trading Floor has a checklist mode that won't let you place an order until every box is ticked. Use it."
      ],
      ex: { p: "Describe your pre-trade checklist and explain why its friction is useful rather than wasteful.",
        r: ["Converts the system's components into yes/no items", "Includes sizing, stop placement, news, loss limits, emotion score", "Any unticked box = no trade", "Friction forces a calm check before an impulsive action"],
        m: "My checklist turns my system into yes/no questions: right market and within my correlation cap, entry condition exactly present, stop placed where the idea is wrong, size by formula and at most 1%, no big release coming, inside my loss limits, and my emotion score below 4. If any box isn't ticked, I don't trade. The friction is the point — it forces a calm check between the urge and the order." },
      q: [
        { k: "mcq", q: "One box on your checklist is unticked, but the setup looks great. You…", o: ["Take it at half size", "Don't take it", "Take it and tick later", "Ask a friend"], a: 1, w: "Any unticked box = no trade." },
        { k: "mcq", q: "From Unit 19, a demo trade with no checklist screenshot counts as…", o: ["Fine if it won", "A rule breach", "Half a trade", "Not recorded"], a: 1, w: "Process is measured, not assumed." },
        { k: "mcq", q: "Why does the checklist include an emotion score?", o: ["For fun", "So an elevated state (≥4) triggers standing down", "Brokers need it", "To compute size"], a: 1, w: "Your state is a risk factor." }
      ],
      yt: ["trading checklist example before entering a trade", "Atul Gawande checklist manifesto summary"],
      src: ["design"] },

    { id: "w19c", t: "The In-Trade Rule and the Chart Ban",
      big: "Once a trade is placed you may do exactly one thing: nothing — plus, at most, a stop move to breakeven at a level defined in advance. Then close the platform. Your named weakness is careless decisions while watching, so the fix is not watching.",
      plain: "You don't stand over a cake in the oven opening the door every minute. Every look lets the heat out. Set the timer and leave the kitchen.",
      body: [
        "**The in-trade rule:** after entry, the only permitted actions are the ones written in your system (a pre-defined breakeven move, a channel exit, the stop itself). Everything else — tightening, widening, closing early, adding outside the rules — is a breach.",
        "**The chart ban:** place the trade, set price alerts at your stop and target (or channel), close the platform, and go do something else. TradingView and most platforms will alert your phone.",
        "Every look at an open trade is an invitation to interfere. The Turtle exits — watching big open profits shrink to the channel exit — were called the hardest part of their rules for exactly this reason.",
        "From this week, tag every trade **watched** or **unwatched**. Unit 20 compares the two groups. It may be the most useful number you ever produce."
      ],
      ex: { p: "State your in-trade rule and your chart-ban protocol, and explain why not watching is the right fix for your specific weakness.",
        r: ["Only pre-defined actions allowed after entry", "Alerts at stop/target, platform closed", "Watching invites interference (stress → careless decisions)", "Tag watched/unwatched to measure the effect"],
        m: "Once I'm in, I only do what my rules already say — the stop, the exit, and a breakeven move at a level I chose in advance. Then I set alerts and close the platform. My weakness is making careless decisions when I watch the chart, so the simplest fix is to stop watching. I'll tag trades watched or unwatched to measure whether it helps." },
      q: [
        { k: "mcq", q: "Which in-trade action is allowed?", o: ["Widening the stop because it's close", "Closing early because you're nervous", "A breakeven move at a level defined before entry", "Adding because it looks strong"], a: 2, w: "Only pre-defined actions." },
        { k: "mcq", q: "The chart ban's protocol is…", o: ["Watch every tick", "Set alerts, close the platform, do something else", "Check every 5 minutes", "Use a smaller screen"], a: 1, w: "Remove the invitation to interfere." },
        { k: "mcq", q: "Why tag trades watched or unwatched?", o: ["For decoration", "To measure whether watching changes your results", "Brokers require it", "It changes R"], a: 1, w: "Unit 20 compares them." }
      ],
      yt: ["set and forget trading psychology"],
      src: ["design", "turtle"] }
  ],
  P: { task: "Demo trading begins — gated behind Gate 4 — with the checklist on every trade.",
    steps: [
      "Set up demo trading: account ready, price alerts working, and one fixed daily time for your routine (check signals, place orders, set alerts, close the platform). Write down your two stress tells — what you do when you're wired.",
      "Copy your system's components into your checklist (Record → Settings). Demo trade System v2 — at most two trades a day — with the checklist completed and screenshotted for every trade. Log each with source 'Demo'.",
      "Demo trade under the in-trade rule: place, set alerts at stop and target, close the platform. Tag every trade watched or unwatched. Compute your adherence so far."
    ],
    tools: ["journal", "floor"],
    num: [
      { k: "n", l: "Demo trades this week", t: "number" },
      { k: "adh", l: "Rule adherence (%)", t: "number" }
    ] },
  R: "Send your demo trades, checklists and first adherence percentage."
});

COURSE.week({
  n: 20, mod: "302", t: "Tilt and Circuit Breakers",
  aim: "Build the brakes nobody else is going to impose on you. That is the whole difference of the independent path.",
  L: [
    { id: "w20a", t: "The Failure Spiral",
      big: "Most accounts die the same way, in four stages: a loss, the urge to recover it, a size increase or a bent rule, and a bigger loss. It's recognisable at stage two and almost never at stage three.",
      plain: "Losing your footing on a slope. The moment to grab a branch is the first slip — by the third stumble you're rolling.",
      dia: "spiral",
      body: [
        "**Stage 1 — the loss.** Normal. Your system expects it.",
        "**Stage 2 — the urge.** 'I need to get that back.' Attention narrows to the account balance instead of the setup. *This is the last stage where you can still see yourself clearly.*",
        "**Stage 3 — the bend.** A bigger size 'just this once', a trade that half-meets the rules, a stop moved further away.",
        "**Stage 4 — the bigger loss.** Which restarts the loop at a larger size.",
        "Your task this week is to identify **your personal stage-2 tell**, in writing, before you need it. Common tells: checking the balance repeatedly, opening a new chart immediately after a loss, the thought 'this one's a sure thing', a sudden rush to trade before a session ends.",
        "> The spiral isn't a knowledge problem — you know it's wrong. It's a detection problem. Circuit breakers (next lesson) exist to stop it for you."
      ],
      ex: { p: "Describe the four stages of the failure spiral and your own stage-2 tell.",
        r: ["Loss → urge to recover → bend (size/rules) → bigger loss", "Stage 2 is the last clearly recognisable point", "Names a specific personal tell", "It's a detection problem addressed by pre-set breakers"],
        m: "The spiral goes: I take a normal loss; I feel the urge to win it back; I bend a rule or increase size; I take a bigger loss, and it repeats larger. Stage two is the last point where I can still see what's happening. My tell is checking my balance again and again straight after a loss and immediately looking for another trade. Because it's a detection problem, I rely on circuit breakers." },
      q: [
        { k: "mcq", q: "At which stage is the spiral last clearly recognisable?", o: ["Stage 1", "Stage 2 — the urge to recover", "Stage 3", "Stage 4"], a: 1, w: "After that you're already bending rules." },
        { k: "mcq", q: "Which is a typical stage-2 tell?", o: ["Following the checklist", "Checking the balance repeatedly after a loss", "Closing the platform", "Logging the trade"], a: 1, w: "Attention moves from process to money." },
        { k: "mcq", q: "The spiral is mainly a…", o: ["Knowledge problem", "Detection problem", "Broker problem", "Strategy problem"], a: 1, w: "You know better — you just don't notice in time." }
      ],
      yt: ["revenge trading psychology explained", "tilt poker trading explained"],
      src: ["design"] },

    { id: "w20b", t: "Circuit Breakers",
      big: "Write hard stops for yourself: a daily loss limit, a weekly limit, and a losing-streak stand-down. They aren't guidelines to weigh in the moment — they're pre-committed rules, dated and signed.",
      plain: "An electrical circuit breaker doesn't ask whether you really need the kettle on. When the current gets dangerous, it cuts the power.",
      body: [
        "Suggested starting breakers (tune them to your Monte Carlo):",
        "• **Daily:** −2R → stop trading for the day.",
        "• **Weekly:** −5R → stop trading for the week.",
        "• **Streak:** 3 consecutive losses → stop for the day.",
        "• **Drawdown:** a drawdown beyond your Monte Carlo 95th percentile → stop and review the system (Unit 26's rebuild trigger).",
        "Write them with a date. Treat a **breach of a breaker** as a more serious event than a losing week — a losing week is variance; a breached breaker is you disabling your own brakes.",
        "Institutional traders have a risk manager who enforces these. Prop traders have the firm's rules. You have a written page and your journal. That's why the page must be unambiguous."
      ],
      ex: { p: "State your circuit breakers precisely and explain why a breached breaker is worse than a losing week.",
        r: ["Daily, weekly, streak (and drawdown) limits with numbers", "Pre-committed and dated, not weighed in the moment", "A losing week is variance; a breach is disabling your brakes", "Independent traders have no external enforcer"],
        m: "My breakers: stop for the day at −2R or after three losses in a row, stop for the week at −5R, and stop to review the system if my drawdown goes beyond my Monte Carlo 95th percentile. They're written and dated. A losing week is just variance, but breaking a breaker means I switched off my own brakes — and as an independent trader nobody else will stop me." },
      q: [
        { k: "mcq", q: "You hit −2R by 10 am. Your daily breaker says…", o: ["Trade smaller", "Stop trading for the day", "One more trade to recover", "Switch pairs"], a: 1, w: "The breaker cuts the power." },
        { k: "mcq", q: "Which is more serious?", o: ["A losing week within your rules", "Breaching a circuit breaker", "They're equal", "Neither"], a: 1, w: "Variance vs disabling your brakes." },
        { k: "mcq", q: "Who enforces risk limits for an independent trader?", o: ["The broker", "A risk manager", "Only the trader, via written rules and the journal", "The regulator"], a: 2, w: "That's the independent path." }
      ],
      yt: ["daily loss limit trading rules explained"],
      src: ["design"] },

    { id: "w20c", t: "The Chart-Stress Protocol",
      big: "Your named failure mode gets its own protocol and its own measurement: place, alert, close, leave — then compare your results on watched trades with unwatched ones.",
      plain: "If sugar in the house makes you snack, you don't rely on willpower in front of the cupboard. You don't keep sugar in the house.",
      body: [
        "**Protocol:** (1) Pre-trade checklist. (2) Place entry, stop and target/exit orders. (3) Set alerts at those levels. (4) Close the platform. (5) Leave the room or switch to another task for at least an hour. (6) Check only at pre-set times, or when an alert fires.",
        "**Emotion scoring:** before, during and after every trade, score 1–5. It takes five seconds and gives Unit 23 the data it needs.",
        "**Measurement:** by the end of this week you'll have trades tagged watched and unwatched. The Journal's Segments view compares their expectancy and grades directly.",
        "> If unwatched trades do better — and for many traders they do — you'll have your own proof, which is worth more than any book."
      ],
      ex: { p: "Write out your six-step chart-stress protocol and explain how you'll know whether it works.",
        r: ["Checklist → orders → alerts → close platform → leave → check only at set times/alerts", "Emotion scores before/during/after", "Watched vs unwatched tags", "Compare expectancy/grades between groups in the Journal"],
        m: "Checklist, place all orders, set alerts, close the platform, leave for at least an hour, and only look at set times or when an alert fires. I score my emotions 1–5 before, during and after each trade. I'll know it works if my unwatched trades show better expectancy and grades than my watched ones in the Journal's segments." },
      q: [
        { k: "mcq", q: "After placing the trade and alerts, step 4 of the protocol is…", o: ["Watch the first 15 minutes", "Close the platform", "Open a second chart", "Check the news"], a: 1, w: "Remove the invitation." },
        { k: "mcq", q: "How will you know whether the chart ban helps you?", o: ["It will feel better", "Compare expectancy and grades of watched vs unwatched trades", "Ask the tutor", "Count screen time"], a: 1, w: "Your own numbers." },
        { k: "mcq", q: "Why score emotion before, during and after?", o: ["Brokers ask", "It feeds your style diagnostic and tilt detection", "It changes position size", "No reason"], a: 1, w: "Unit 23 uses it." }
      ],
      yt: ["how to stop watching charts trading anxiety"],
      src: ["design"] }
  ],
  P: { task: "Demo trade with circuit breakers armed, and measure watched versus unwatched.",
    steps: [
      "Write your own four-stage failure spiral and your stage-two tell — the specific thing you do when the urge to win it back arrives. Run your demo routine and score emotion before, during and after every trade.",
      "Write and date your circuit breakers (for example −2R a day, −5R a week, three losses in a row ends the day). Demo trade under them. Note every stage-two urge, acted on or not.",
      "Run the chart-stress protocol on every trade. Journal → Segments: compare watched versus unwatched expectancy and grades so far."
    ],
    tools: ["journal"],
    num: [
      { k: "watchedE", l: "Watched trades expectancy (R)", t: "number" },
      { k: "unwatchedE", l: "Unwatched trades expectancy (R)", t: "number" },
      { k: "breaches", l: "Circuit-breaker breaches this week", t: "number" }
    ] },
  R: "Send your watched versus unwatched comparison and your breaker record. That comparison may change how you trade permanently."
});

COURSE.week({
  n: 21, mod: "302", t: "The Probabilistic Mind, Made Measurable",
  aim: "Make process the scoreboard, so that a losing week can be a good week.",
  gate: "g5",
  L: [
    { id: "w21a", t: "Douglas, Converted into Behaviour",
      big: "Mark Douglas's core beliefs only help if they change what you do. Each one converts into a behaviour you can see — or not see — in your journal.",
      plain: "Knowing that exercise is good for you changes nothing. A gym session in your calendar at 8 am does.",
      body: [
        "Douglas's five fundamental beliefs, paraphrased, each with the behaviour that proves you hold it:",
        "• **Anything can happen.** → You never trade without a stop, and never skip it 'because this one is obvious'.",
        "• **You don't need to know what happens next to make money.** → You never wait for extra 'confirmation' your rules don't require.",
        "• **Wins and losses are randomly distributed for any edge.** → You never change size after a loss or a win.",
        "• **An edge is just a higher probability of one thing over another.** → You take every valid signal, including the one after three losses.",
        "• **Every moment in the market is unique.** → You never reference the last trade when deciding the next.",
        "> Your journal is the test. If it shows size changes after losses, skipped signals or moved stops, you don't yet hold the belief — whatever you think."
      ],
      ex: { p: "Pick three of Douglas's beliefs and show the specific journal behaviour that proves you hold each.",
        r: ["Accurately paraphrases three beliefs", "Links each to an observable behaviour", "Behaviours are checkable in the journal (size changes, skipped signals, stops)", "Belief is proven by behaviour, not by agreement"],
        m: "'Anything can happen' shows up as never trading without a stop. 'Wins and losses are randomly distributed' shows up as never changing size after a loss or a win. 'An edge is just a probability' shows up as taking every valid signal, even after three losses. If my journal shows skipped signals or size changes, I don't really hold those beliefs yet." },
      q: [
        { k: "mcq", q: "Which behaviour shows you believe 'wins and losses are randomly distributed'?", o: ["Doubling size after a loss", "Keeping size constant after wins and losses", "Skipping signals after losses", "Moving stops to avoid losses"], a: 1, w: "No outcome-based sizing." },
        { k: "mcq", q: "'You don't need to know what happens next' converts into…", o: ["Waiting for extra confirmation", "Acting on your rules without extra confirmation", "Predicting harder", "Watching more"], a: 1, w: "Rules are sufficient." },
        { k: "mcq", q: "The real test of whether you hold these beliefs is…", o: ["How strongly you agree with them", "What your journal shows you actually did", "How many books you've read", "Your win rate"], a: 1, w: "Behaviour, not belief." }
      ],
      yt: ["Mark Douglas five fundamental truths explained"],
      src: ["douglas"] },

    { id: "w21b", t: "Take Every Signal",
      big: "In a system where a handful of trades make the year, the skipped signal is disproportionately likely to be one of them. Skipping signals doesn't reduce risk — it removes the trades that pay for all the losers.",
      plain: "A fisherman who only casts when he 'feels' a big fish is there catches fewer big fish — the big ones don't announce themselves.",
      body: [
        "The published Turtle rules put it plainly: most of the profits in a given year might come from only two or three large winning trades, so a skipped or missed signal can greatly affect the year's returns.",
        "You've already measured this: the Trading Floor's autopilot shows each market's **top-3 share**. When it's above 100%, the three best trades earned *more* than the whole system's net profit — meaning every other trade combined lost money.",
        "The trades you're most tempted to skip are the ones after a losing streak, the ones that 'look weak', and the ones at inconvenient times. None of those is correlated with the outcome.",
        "Your process KPI for the week: **% of valid signals taken**. Not profit."
      ],
      ex: { p: "Explain why skipping signals is so costly in a trend-following style system, using the idea of a top-3 share.",
        r: ["A few large winners carry the profit", "Top-3 share can exceed 100% (the rest lose on net)", "Skipped signals are as likely to be the big winners as any other", "Measure % of valid signals taken as the KPI"],
        m: "In a trend-following system, most of the year's profit comes from a few huge trades — sometimes the top three trades earn more than the system's whole net profit. Since I can't know in advance which signal will be a big winner, skipping any signal risks skipping the trade that pays for all the losers. So I measure the percentage of valid signals I took, not my profit." },
      q: [
        { k: "mcq", q: "A system's top-3 share is 180%. This means…", o: ["The three best trades earned 180% of net profit — the rest lost money in total", "Win rate is 180%", "It's a data error", "Losses were small"], a: 0, w: "The rest of the trades netted a loss." },
        { k: "mcq", q: "The signal you most want to skip — right after three losses — is…", o: ["Less likely to win", "Just as likely to win as any other", "Guaranteed to win", "Always a loser"], a: 1, w: "Outcomes aren't linked to the previous streak." },
        { k: "mcq", q: "This week's process KPI is…", o: ["Profit", "% of valid signals taken", "Number of trades", "Win rate"], a: 1, w: "Process over outcome." }
      ],
      yt: ["why trend following needs every trade outliers"],
      src: ["turtle"] },

    { id: "w21c", t: "The Execution Grade",
      big: "Grade every trade on process alone — A clean, B minor deviation, C rule broken — regardless of whether it won. Over time, this is the only chart you keep that measures you rather than the market.",
      plain: "A driving instructor marks your driving, not whether you happened to reach the shop. You can arrive safely after running a red light — and you still fail.",
      body: [
        "• **A:** every rule followed exactly.",
        "• **B:** a minor, non-risk deviation (e.g., logged late, a slightly late entry within the rules).",
        "• **C:** a rule broken — size, stop, entry condition, breaker, checklist.",
        "A winning C is **more** dangerous than a losing A: the market just rewarded behaviour that will eventually hurt you.",
        "**Adherence %** = trades that followed every rule ÷ all trades. Your weekly scoreboard is adherence and grade distribution — not profit.",
        "> Gate 5 requires 90%+ adherence across at least 20 demo trades, each graded. Real money is gated behind process, not behind profit."
      ],
      ex: { p: "Explain the A/B/C grade, why a winning C is dangerous, and how adherence gates real money.",
        r: ["A = clean, B = minor deviation, C = rule broken", "Graded independently of outcome", "A winning C reinforces harmful behaviour", "Gate 5: ≥90% adherence over ≥20 graded demo trades"],
        m: "Each trade gets a process grade: A if I followed every rule, B for a small harmless slip, C if I broke a rule — whether it won or not. A winning C is dangerous because it teaches me that breaking rules pays. My scoreboard is my adherence percentage, and Gate 5 needs at least 90% over 20 or more graded demo trades before real money." },
      q: [
        { k: "mcq", q: "You moved your stop further away and the trade then won 3R. The grade is…", o: ["A", "B", "C", "Depends on profit"], a: 2, w: "A rule broken is a C, whatever the outcome." },
        { k: "num", q: "20 trades, 17 followed every rule. Adherence? (%)", a: 85, tol: 0.1, u: "%", w: "17 ÷ 20 = 85% — below the 90% gate." },
        { k: "mcq", q: "Gate 5 is passed on…", o: ["Profit", "90%+ adherence over 20+ graded demo trades", "Win rate", "Time served"], a: 1, w: "Process, not profit." }
      ],
      yt: ["process vs outcome trading grading trades"],
      src: ["design"] }
  ],
  P: { task: "Demo trade with every trade graded — and reach the 90% adherence floor for Gate 5.",
    steps: [
      "Write Douglas's five truths as five behaviours you'll check after every trade. Run your demo routine.",
      "Demo routine. Log every valid signal — taken or not — and compute your signals-taken percentage so far.",
      "Grade every demo trade since Unit 19 A, B or C — on process only, never outcome. Check your adherence and grade spread in the Journal. Gate 5 needs 20+ graded demo trades at 90%+ adherence."
    ],
    tools: ["journal"],
    num: [
      { k: "adh", l: "Adherence across all demo trades (%)", t: "number" },
      { k: "signals", l: "Valid signals taken (%)", t: "number" }
    ] },
  R: "Send your adherence, grade distribution and signals-taken percentage. Gate 5 gates real money behind process — not profit."
});

COURSE.week({
  n: 22, mod: "401", t: "Running It Properly",
  aim: "Close the gap between what your backtest promised and what your behaviour delivers.",
  L: [
    { id: "w22a", t: "Why Demo Differs from Backtest",
      big: "Your demo results will trail your backtest. Missed setups, hesitation, execution delay and an emotional load that backtesting never had all take a cut. The gap is real and measurable — so measure yours instead of assuming it's small.",
      plain: "Practice penalties in an empty stadium versus the World Cup final. Same kick, same goal, very different conversion rate.",
      body: [
        "Sources of the gap: signals missed because you were in a lecture or asleep; hesitation at the trigger; entering late or at a worse price; spread and slippage your backtest under-counted; and emotion.",
        "Measure it: **backtest expectancy − demo expectancy = your execution gap**, in R.",
        "Some gap is normal. A large gap is information: it tells you which part of your process to fix (availability, hesitation, cost assumptions) — or that your system needs a slower timeframe that suits your life (Unit 23)."
      ],
      ex: { p: "List the sources of the gap between backtest and demo results, and explain how you measure it.",
        r: ["Missed signals, hesitation, late entries, costs/slippage, emotion", "Gap = backtest expectancy − demo expectancy (R)", "Some gap is normal", "A large gap points to fixable process or timeframe issues"],
        m: "Demo trails backtest because I miss signals when I'm busy, hesitate, enter late, pay more in spread and slippage than I assumed, and feel real pressure. I measure the gap as backtest expectancy minus demo expectancy in R. Some gap is normal; a big one tells me which part of the process to fix or that I need a timeframe that suits my schedule better." },
      q: [
        { k: "num", q: "Backtest expectancy +0.35R; demo +0.10R. Execution gap in R?", a: 0.25, tol: 0.001, u: "R", w: "0.35 − 0.10 = 0.25R per trade." },
        { k: "mcq", q: "Which is NOT a typical source of the gap?", o: ["Missed signals", "Hesitation", "The system's rules changing by themselves", "Slippage"], a: 2, w: "Rules don't change unless you change them." },
        { k: "mcq", q: "A very large gap mostly caused by missed signals suggests…", o: ["Quit", "Your timeframe or schedule doesn't fit your life", "Trade more pairs", "Ignore it"], a: 1, w: "Unit 23 addresses exactly this." }
      ],
      yt: ["why live trading results differ from backtest"],
      src: ["design"] },

    { id: "w22b", t: "The Missed-Trade Log",
      big: "Record every valid signal you didn't take, and why. It's usually the largest hidden leak in a trader's results — and it's invisible unless you write it down.",
      plain: "A shop that only counts the customers who bought never learns how many walked out because the queue was too long.",
      body: [
        "For each missed signal: date/time, pair, why it was missed (asleep / busy / hesitated / skipped deliberately), and what it would have made in R.",
        "At week's end compute **expectancy if every valid signal had been taken** and compare it with your actual expectancy.",
        "If the missed trades were disproportionately winners — which, in a system with a high top-3 share, is common — you've found where your edge is leaking."
      ],
      ex: { p: "Explain what goes in a missed-trade log and what you learn by comparing it with your taken trades.",
        r: ["Records every valid signal not taken, with reason", "Includes hypothetical R", "Compare 'all signals' expectancy vs actual", "Reveals leaks (e.g., missed winners, deliberate skips)"],
        m: "Every valid signal I didn't take goes in the log: when, which pair, why I missed it, and what it would have made in R. Then I compare the expectancy of all signals with what I actually earned. If the missed ones included big winners, I know my edge is leaking through missed or skipped trades." },
      q: [
        { k: "mcq", q: "Why is the missed-trade leak 'hidden'?", o: ["Brokers hide it", "Missed trades never appear in a normal trade log", "It's small", "It isn't real"], a: 1, w: "You only see what you took." },
        { k: "mcq", q: "Which reason for a miss should worry you most?", o: ["Asleep during Asia", "Deliberately skipped a valid signal", "Platform outage", "Public holiday"], a: 1, w: "Deliberate skips are a rule breach." },
        { k: "mcq", q: "You compare…", o: ["Win rate with spread", "Expectancy of all valid signals with your actual expectancy", "Pairs with timeframes", "Nothing"], a: 1, w: "The gap is the leak." }
      ],
      yt: [],
      src: ["design"] },

    { id: "w22c", t: "The First Drawdown",
      big: "Your rules don't change during a drawdown. That sentence is the whole test — and everything in the last 21 units was preparation for the week you find out whether it's true of you.",
      plain: "Anyone can keep a diet on a good day. The diet is tested at 11 pm, in front of the fridge, after a bad one.",
      body: [
        "Check the drawdown against your expectations: is it inside your Monte Carlo 95th percentile and your expected losing streak? If yes, it's variance. Your job is to keep executing.",
        "If it's beyond your Monte Carlo worst case, that's the **rebuild trigger** (Unit 26): stop, review, test — calmly and on paper, not by improvising live.",
        "What not to do: change size, switch systems, add filters mid-streak, or 'take a break' that happens to skip the next signals.",
        "> The Turtle who followed the rules through the drawdown was the one who was there for the next big trend."
      ],
      ex: { p: "Describe exactly what you do — and don't do — during your first real drawdown.",
        r: ["Compare with Monte Carlo 95th percentile and expected streak", "Inside expectations → keep executing unchanged", "Beyond → rebuild trigger: stop and review offline", "Don't change size, switch systems, or add filters mid-streak"],
        m: "I compare the drawdown with my Monte Carlo 95th percentile and my expected losing streak. If it's inside those, it's normal variance and I keep executing exactly as written. If it's beyond my worst case, I stop and review the system on paper. What I don't do is change size, jump to a new system or add filters in the middle of the streak." },
      q: [
        { k: "mcq", q: "Your drawdown is 9R; your Monte Carlo 95th percentile is 14R. You…", o: ["Stop and rebuild", "Keep executing the rules unchanged", "Halve your risk immediately", "Switch systems"], a: 1, w: "Within expectations = variance." },
        { k: "mcq", q: "What is the rebuild trigger?", o: ["Any losing week", "A drawdown beyond your Monte Carlo worst case", "Three losses", "A bad feeling"], a: 1, w: "Defined in advance." },
        { k: "mcq", q: "Adding a new filter in the middle of a drawdown is…", o: ["Good adaptation", "Improvising under stress — against the rules", "Required", "Neutral"], a: 1, w: "Changes happen offline, tested." }
      ],
      yt: ["how professional traders handle drawdowns"],
      src: ["design", "turtle"] }
  ],
  P: { task: "Measure your execution gap and your missed-trade leak.",
    steps: [
      "Compare your demo expectancy so far with your v2-B backtest. Write down the gap and your best guess at its cause: missed setups, hesitation, delay or emotion.",
      "Start the missed-trade log: every valid signal you don't take, and why. Run your demo routine.",
      "Check your current drawdown in R against your Monte Carlo expectations. Compute the all-signals expectancy (taken plus missed)."
    ],
    tools: ["journal", "lab:mc"],
    num: [
      { k: "gap", l: "Execution gap (backtest − demo expectancy, R)", t: "number" },
      { k: "missed", l: "Valid signals missed this week", t: "number" },
      { k: "allE", l: "Expectancy if every signal had been taken (R)", t: "number" }
    ] },
  R: "Send taken versus missed. The size of that gap is your real opponent — and it isn't the market."
});

COURSE.week({
  n: 23, mod: "401", t: "The Style Diagnostic",
  aim: "Find out what kind of trader you are from evidence rather than preference. This is the week you asked for.",
  L: [
    { id: "w23a", t: "The Four Variables",
      big: "Four things decide your natural style: the screen time you genuinely have, how well you tolerate holding overnight, how your decisions hold up under time pressure, and where your own data says the edge is strongest.",
      plain: "Choosing a sport. You might love the idea of sprinting, but your body, your schedule and your results might say you're built for distance.",
      body: [
        "**1. Screen time actually available.** Not aspirational. With lectures, Nsimbini, driving and your other commitments, how many uninterrupted 30-minute windows exist in a real week? Scalping needs many; position trading needs almost none.",
        "**2. Overnight tolerance.** Measured by your emotion-during scores against holding time. If scores climb sharply beyond a certain holding period, that's your ceiling.",
        "**3. Decision quality under time pressure.** Measured by execution grade against timeframe. Where do your C grades cluster?",
        "**4. Where the edge is.** Expectancy by timeframe and session, from your own journal.",
        "> Your preference is the least important input. Your data is the most important."
      ],
      ex: { p: "Name the four variables of the style diagnostic and say how each is measured from your own data.",
        r: ["Available screen time (real schedule)", "Overnight tolerance via emotion scores vs holding time", "Decision quality via grade vs timeframe", "Edge location via expectancy by timeframe/session"],
        m: "The four variables are: how much uninterrupted screen time I really have; how I handle holding overnight, measured by my emotion scores against holding time; how good my decisions are under time pressure, measured by my grades on each timeframe; and where my journal shows the best expectancy by timeframe and session." },
      q: [
        { k: "mcq", q: "Which input matters LEAST in the diagnostic?", o: ["Screen time", "Your preference", "Grade by timeframe", "Expectancy by timeframe"], a: 1, w: "Data outranks preference." },
        { k: "mcq", q: "Overnight tolerance is measured by…", o: ["Guessing", "Emotion-during scores against holding time", "Win rate", "Account size"], a: 1, w: "Your own scores." },
        { k: "mcq", q: "Scalping mainly requires…", o: ["Little screen time", "Many uninterrupted screen windows and fast decisions", "Overnight holds", "Weekly charts"], a: 1, w: "It's time-hungry." }
      ],
      yt: ["scalping vs day trading vs swing trading which suits you"],
      src: ["design"] },

    { id: "w23b", t: "Score Yourself from Your Logs",
      big: "Draw four pictures from your own journal — holding time against outcome, time of day against outcome, emotion against timeframe, and grade against timeframe — and let them speak before you do.",
      plain: "A fitness tracker's weekly report often surprises people: they're sure they sleep eight hours and the data says six.",
      body: [
        "The Journal's **Style** view builds these for you from every trade since Unit 19 (and your backtests):",
        "• **Holding time vs R** — do longer holds pay you more or cost you more?",
        "• **Session vs R** — when does your edge actually appear?",
        "• **Emotion vs timeframe** — where is your stress highest?",
        "• **Grade vs timeframe** — where do you execute cleanly?",
        "Write down what each picture says **before** you interpret it. Surprises are the point."
      ],
      ex: { p: "Describe the four pictures you'll draw from your journal and what pattern in each would point to swing trading.",
        r: ["Holding time vs R", "Session vs R", "Emotion vs timeframe", "Grade vs timeframe", "Swing signs: longer holds pay, calmer and cleaner on higher timeframes"],
        m: "I'll plot holding time against R, session against R, emotion against timeframe, and grade against timeframe. If longer holds pay more, my stress is lower and my grades are cleaner on the 4H and Daily, and my edge appears regardless of session, that points toward swing trading." },
      q: [
        { k: "mcq", q: "Your C grades cluster on the 5m; A grades on the 4H. This suggests…", o: ["Scalping", "A slower timeframe suits your execution", "Nothing", "Trade more 5m"], a: 1, w: "Execution quality is a signal." },
        { k: "mcq", q: "Why write down what each picture says before interpreting?", o: ["For neatness", "To stop your preferences bending the evidence", "It's required", "To save time"], a: 1, w: "Observation before opinion." },
        { k: "mcq", q: "Emotion scores rise sharply for holds over 24 hours. That suggests…", o: ["Position trading", "An overnight-tolerance ceiling — intraday or short swing", "Scalping only", "Nothing"], a: 1, w: "Respect the ceiling or train it deliberately." }
      ],
      yt: [],
      src: ["design", "data"] },

    { id: "w23c", t: "Read the Verdict Honestly",
      big: "Scalping demands constant screen presence and fast decisions. Swing trading demands overnight tolerance and patience. Position trading demands conviction and the ability to ignore the chart for days. Your data decides — not your preference, and not my guess.",
      plain: "A career aptitude test is only useful if you accept the result that surprises you.",
      body: [
        "**Scalper:** many screen windows, thrives under time pressure, edge on low timeframes, costs matter enormously.",
        "**Intraday / short swing:** a few windows a day, 1H–4H signals, positions held hours to a couple of days.",
        "**Swing:** checks once or twice a day, 4H–Daily signals, holds days to weeks — the Turtles were here.",
        "**Position:** weekly-to-daily, few trades, holds weeks to months, heavily fundamentals-aware.",
        "Write a verdict with the four charts as evidence. The tutor will challenge it; if the evidence is thin, you go back and gather more before Unit 24.",
        "> Given your schedule, the honest prior is swing — but a prior is not a verdict. Your journal is."
      ],
      ex: { p: "Write a short style verdict for yourself with the evidence that supports it (or describe what evidence you'd need).",
        r: ["Names a style", "Cites evidence from at least three of the four variables", "Acknowledges gaps/thin evidence", "Shows willingness to accept a surprising result"],
        m: "My verdict is swing trading on the 4H and Daily. I have only a few free windows a day; my emotion scores stay calm on holds up to a few days; my C grades cluster on the 15m; and my expectancy is best on 4H signals. My sample on Daily signals is still small, so I'll keep collecting data." },
      q: [
        { k: "mcq", q: "Few screen windows, calm overnight, clean execution on 4H/Daily → the verdict is most likely…", o: ["Scalper", "Swing trader", "News trader", "No style"], a: 1, w: "Matches all four variables." },
        { k: "mcq", q: "The Turtles' style was closest to…", o: ["Scalping", "Swing/position trend-following on daily bars", "News trading", "High-frequency"], a: 1, w: "Daily bars, trends held for weeks." },
        { k: "mcq", q: "Your verdict contradicts what you hoped. You…", o: ["Ignore the data", "Accept it, or gather more evidence if the sample is thin", "Change the charts", "Quit"], a: 1, w: "That's what diagnosis means." }
      ],
      yt: ["types of traders explained position swing day scalping"],
      src: ["design", "turtle"] }
  ],
  P: { task: "Run the full style diagnostic on your own data and write your verdict.",
    steps: [
      "From your real calendar — lectures, the business, everything — list your uninterrupted 30-minute windows in a normal week. Run your demo routine.",
      "Journal → Style: screenshot the four pictures and write one plain sentence per picture on what it shows — before you interpret anything.",
      "Write your style verdict with its evidence: the four pictures plus your screen windows."
    ],
    tools: ["journal"],
    num: [
      { k: "verdict", l: "Your style verdict", t: "text" },
      { k: "windows", l: "Uninterrupted 30-min windows per week", t: "number" }
    ] },
  R: "Send your verdict with its evidence. I will challenge it — thin evidence means more data before Unit 24."
});

COURSE.week({
  n: 24, mod: "401", t: "System v3 — Fitted to You",
  aim: "Rebuild the system around the trader you turned out to be, not the one you imagined.",
  L: [
    { id: "w24a", t: "What Changes with Style",
      big: "When your style changes, six things move together: timeframe set, session, trade frequency, stop width, target distance, and how many pairs you can realistically watch. Changing only one of them is the usual mistake.",
      plain: "Moving from sprinting to distance running changes your shoes, your training, your diet and your pacing — not just the length of the race.",
      body: [
        "Moving to a slower style, for example: timeframes step up (Daily/4H/1H); session matters less; trades per week fall; stops widen (so size falls to keep 1% risk); targets extend; and you can follow more pairs because each needs less attention.",
        "Each change has knock-on effects on your statistics — wider stops mean smaller positions and fewer, larger R outcomes. Your Monte Carlo and streak expectations must be re-run for v3.",
        "> A style change is a new system. It needs a new backtest."
      ],
      ex: { p: "List the six things that change together when your style changes, and explain why v3 needs its own backtest.",
        r: ["Timeframe set, session, frequency, stop width, target distance, number of pairs", "Knock-on effects on size and statistics", "Monte Carlo/streak expectations must be re-run", "A style change is a new system → new backtest"],
        m: "When my style changes, my timeframes, sessions, trade frequency, stop width, target distance and the number of pairs I can watch all change together. Wider stops mean smaller positions, and the statistics shift, so my Monte Carlo and streak expectations have to be redone. It's effectively a new system, so it needs its own backtest." },
      q: [
        { k: "mcq", q: "Moving from intraday to swing, your stops widen. To keep 1% risk, position size…", o: ["Rises", "Falls", "Stays the same", "Doesn't matter"], a: 1, w: "Size = risk ÷ stop." },
        { k: "mcq", q: "After changing style you must…", o: ["Keep the old statistics", "Re-run your backtest, Monte Carlo and streak expectations", "Double risk", "Nothing"], a: 1, w: "New system, new evidence." },
        { k: "mcq", q: "The usual mistake when changing style is…", o: ["Changing everything", "Changing only one component", "Backtesting", "Journaling"], a: 1, w: "They move together." }
      ],
      yt: [],
      src: ["design"] },

    { id: "w24b", t: "Rewrite the Components",
      big: "Take System v2 and rewrite every one of the seven components for your diagnosed style. This is a rewrite, not an edit.",
      plain: "Renovating a house for a family of five isn't moving one wall — it's redrawing the plan.",
      body: [
        "Go through markets, sizing, entries, stops, exits, tactics and when-not-to-trade, one by one, asking: 'Does this still fit how I actually trade?'",
        "Keep everything your data supported; replace everything that was built for a style you don't have.",
        "Re-run the stranger test on every sentence.",
        "Tag the new backtest 'v3-C' and use a period you haven't tested on before."
      ],
      ex: { p: "Explain how you'll rewrite your system for your diagnosed style without curve-fitting it.",
        r: ["Component-by-component review", "Keep what data supported, replace style-mismatched parts", "Stranger test on every rule", "New, unused test period tagged v3-C"],
        m: "I'll go through all seven components and ask whether each fits how I actually trade. Anything my data supported stays; anything built for a style I don't have gets replaced. Every rule has to pass the stranger test again, and I'll backtest v3 on a period I've never used, tagged v3-C, so I'm not fitting it to data I've already seen." },
      q: [
        { k: "mcq", q: "The v3 backtest should use…", o: ["The same period as v1", "A period you haven't tested on before", "Only the best month", "No backtest"], a: 1, w: "Fresh data." },
        { k: "mcq", q: "Which components get reviewed?", o: ["Only entries", "All seven", "Only exits", "Only sizing"], a: 1, w: "It's a rewrite." },
        { k: "mcq", q: "A rule your data strongly supported, and that fits your style…", o: ["Must be replaced", "Stays", "Gets doubled", "Is irrelevant"], a: 1, w: "Keep what's proven and fits." }
      ],
      yt: [],
      src: ["design"] },

    { id: "w24c", t: "What Must Never Change",
      big: "Risk percentage, circuit breakers, checklist discipline and the journal are style-independent. Traders who change their risk rules when they change style aren't changing style — they're rationalising.",
      plain: "A pilot switching from small planes to jets learns new controls — but never drops the pre-flight checklist.",
      body: [
        "• **Risk:** ≤1% at the stop, by formula, rounded down.",
        "• **Circuit breakers:** daily, weekly, streak, drawdown.",
        "• **Checklist:** every trade, screenshotted.",
        "• **Journal:** every trade, every field, at the time.",
        "• **Correlation cap** and **news policy.**",
        "These are the chassis. Timeframes and setups are the bodywork you can swap."
      ],
      ex: { p: "List what must never change when your style changes, and explain why changing it is rationalising.",
        r: ["Risk ≤1% by formula", "Circuit breakers", "Checklist every trade", "Journal every trade", "Changing these under cover of a style change is rationalisation"],
        m: "My risk rule, my circuit breakers, my checklist, my journal, my correlation cap and my news policy don't change with style. They protect me whatever I trade. If I loosen them while 'changing style', I'm really just finding an excuse to take more risk." },
      q: [
        { k: "mcq", q: "Which may change with style?", o: ["Risk % ceiling", "Timeframe set", "Circuit breakers", "Journal"], a: 1, w: "Bodywork, not chassis." },
        { k: "mcq", q: "Raising risk to 3% 'because swing trades are rarer' is…", o: ["Adapting", "Rationalising", "Required", "Smart"], a: 1, w: "The chassis doesn't change." },
        { k: "mcq", q: "The checklist is…", o: ["Only for beginners", "Permanent, whatever the style", "Optional in swing trading", "Replaced by experience"], a: 1, w: "Pilots never drop it." }
      ],
      yt: [],
      src: ["design"] }
  ],
  P: { task: "Write System v3 for the trader you are, and confirm the edge survives on fresh data.",
    steps: [
      "List the six things your style verdict changes — timeframe set, session, frequency, stop width, target distance, number of pairs — and how each must move.",
      "Write System v3: all seven components rewritten for your style. Run the stranger test. Start the backtest on a period you haven't used (tag 'v3-C').",
      "Push v3-C toward 50 trades. Confirm your risk %, circuit breakers, checklist and journal are unchanged from v2. Compare v3 and v2 expectancy side by side."
    ],
    tools: ["journal", "floor", "tv"],
    num: [
      { k: "n", l: "Trades in v3-C", t: "number" },
      { k: "e", l: "Expectancy v3-C (R)", t: "number" }
    ] },
  R: "Send v3 and its 50-trade backtest, with expectancy side by side against v2."
});

COURSE.week({
  n: 25, mod: "402", t: "The Transition Protocol",
  aim: "Build the ladder to real money now, in calm, so the decision is already made before the emotion arrives.",
  L: [
    { id: "w25a", t: "Three Ways Live Differs",
      big: "Live trading differs from demo in three measurable ways: real slippage and spread, real swap, and a genuinely different emotional load. The first two are small. The third isn't — and it decides your first year.",
      plain: "Rehearsing a speech alone versus giving it to a full hall. The words are the same; your heart rate isn't.",
      body: [
        "**Execution costs:** demo fills are often cleaner than live fills. Expect a little more slippage, especially around news and at the open.",
        "**Swap:** real, and it compounds over long holds — include it in your R for swing trades.",
        "**Emotion:** real money reactivates every tendency you trained out on demo. Expect adherence to dip at first. That's why you start tiny.",
        "Keep logging emotion scores. Your first live weeks are a new dataset about yourself."
      ],
      ex: { p: "Explain the three ways live trading differs from demo and which one matters most.",
        r: ["Execution costs/slippage", "Swap", "Emotional load", "Emotion matters most → start small and keep measuring"],
        m: "Live trading adds real slippage and spread, real swap, and real emotion. The first two are small and measurable. The emotional load is the big one: real money brings back the habits I trained out on demo, so I start tiny and keep measuring my adherence and emotion scores." },
      q: [
        { k: "mcq", q: "Which difference usually matters most at first?", o: ["Swap", "Spread", "Emotional load", "Chart colours"], a: 2, w: "It's where adherence slips." },
        { k: "mcq", q: "Why keep logging emotion scores live?", o: ["It's a habit", "Live trading is a new dataset about yourself", "Brokers ask", "It changes spreads"], a: 1, w: "Measure the new conditions." },
        { k: "mcq", q: "Adherence dips in your first live weeks. This is…", o: ["Proof you can't trade", "Expected — the reason the ladder starts at 0.25%", "A reason to raise risk", "Impossible"], a: 1, w: "Anticipated and contained." }
      ],
      yt: ["demo vs live trading psychology differences"],
      src: ["design"] },

    { id: "w25b", t: "The Micro-Ladder",
      big: "Start live at 0.25% risk — not 1%. At that size you're buying data about your own behaviour, not chasing returns. Expect your first twenty live trades to be worse than demo; that gap is the price of the information.",
      plain: "Learning to swim in the shallow end. You can make every mistake and still stand up.",
      dia: "ladder",
      body: [
        "= Rungs: 0.25% → 0.50% → 0.75% → 1.00% risk per trade (1% is the ceiling, permanently)",
        "At 0.25%, a 10-trade losing streak costs about 2.5% of the account. You can survive every early mistake while you learn how you behave with real money.",
        "The ladder applies to demo trade counts too if capital isn't ready yet — so you arrive at live trading with the protocol already a habit.",
        "> The ladder isn't slow. It's the fastest route that doesn't pass through a blown account."
      ],
      ex: { p: "Explain the micro-ladder and why starting at 0.25% is faster in the long run.",
        r: ["Rungs 0.25 → 0.5 → 0.75 → 1% (ceiling)", "Small size = cheap data about live behaviour", "Early mistakes are survivable (e.g., 10 losses ≈ 2.5%)", "Avoiding a blown account is the real speed"],
        m: "I start live at 0.25% risk and climb 0.5%, 0.75%, then 1%, which is my permanent ceiling. At 0.25% even ten losses in a row cost only about 2.5%, so I can learn how I behave with real money without serious damage. It feels slow but it's faster than blowing the account and starting again." },
      q: [
        { k: "num", q: "At 0.25% risk, roughly what % of the account do 10 consecutive full losses cost? (1 decimal)", a: 2.5, tol: 0.1, u: "%", w: "1 − 0.9975¹⁰ ≈ 2.47% → about 2.5%." },
        { k: "mcq", q: "The ladder's permanent ceiling is…", o: ["2%", "1%", "5%", "No ceiling"], a: 1, w: "1% at the stop." },
        { k: "mcq", q: "No capital yet at Unit 25? The ladder…", o: ["Doesn't apply", "Applies to demo trade counts with the same rules", "Is skipped", "Waits a year"], a: 1, w: "Build the habit anyway." }
      ],
      yt: [],
      src: ["design", "math"] },

    { id: "w25c", t: "Advancement Rules",
      big: "You climb a rung only by process: twenty trades at 90%+ adherence. You fall a rung automatically on any adherence breach, and to the bottom on any circuit-breaker breach. No discretion in either direction.",
      plain: "Belt gradings in martial arts: you're promoted for demonstrated technique over time, not for winning one fight — and a serious rule break costs you the belt.",
      body: [
        "• **Promote:** 20 live trades at the current rung with ≥90% adherence → next rung.",
        "• **Demote one rung:** adherence below 90% across the last 20 trades.",
        "• **Demote to the bottom (0.25%):** any circuit-breaker breach.",
        "• **Never:** promotion because of profit, or a 'big opportunity'.",
        "The rules must be automatic. If you can argue with them in the moment, they're not rules."
      ],
      ex: { p: "State your promotion and demotion rules and explain why neither can depend on profit.",
        r: ["Promote after 20 trades at ≥90% adherence", "Demote one rung for adherence <90%", "Bottom rung after any breaker breach", "Profit and 'opportunity' never trigger promotion; rules are automatic"],
        m: "I move up a rung after 20 live trades with at least 90% adherence. I drop one rung if adherence falls below 90%, and straight back to 0.25% if I breach a circuit breaker. Profit never promotes me, because profit can come from breaking rules — and the rules must be automatic so I can't argue with them in the moment." },
      q: [
        { k: "mcq", q: "You made +8R in 12 trades at 0.25%. You…", o: ["Move up — you're profitable", "Stay until 20 trades at ≥90% adherence", "Jump to 1%", "Stop trading"], a: 1, w: "Process, not profit." },
        { k: "mcq", q: "You breach your daily loss limit at the 0.75% rung. You go to…", o: ["0.5%", "0.25%", "1%", "Stay"], a: 1, w: "Breaker breach = bottom rung." },
        { k: "mcq", q: "Why must the rules be automatic?", o: ["It's simpler", "If you can argue with them in the moment, emotion will win the argument", "Brokers require it", "No reason"], a: 1, w: "Pre-commitment again." }
      ],
      yt: [],
      src: ["design"] }
  ],
  P: { task: "Write your live transition document and take the first rung.",
    steps: [
      "List how live will differ for you in three measurable ways — slippage and spread, swap, emotion scores — and how you'll measure each.",
      "Write your ladder: 0.25% → 0.5% → 0.75% → 1%, the rand risk at each rung for your account, and twenty trades per rung.",
      "Write your promotion rules and your automatic demotion rules. If capital is ready, open the live account and place trade one at 0.25%; if not, continue on demo under the identical protocol. Log with source 'Live' or 'Demo'."
    ],
    tools: ["journal", "lab:size"],
    num: [
      { k: "rung", l: "Current rung (%)", t: "number" },
      { k: "live", l: "Live or demo?", t: "text" }
    ] },
  R: "Send the transition document. I'll look specifically at whether your demotion rules are automatic or discretionary. They must be automatic."
});

COURSE.week({
  n: 26, mod: "402", t: "The Scaling Plan and the Business",
  aim: "Leave month six holding a written plan for months seven to twelve — and an honest audit of these six.",
  gate: "final",
  L: [
    { id: "w26a", t: "Scale the Account, Not the Percentage",
      big: "Your risk percentage stays at 1% permanently. Growth comes from the account growing — not from risking more of it. Traders who raise the percentage to speed things up are reliably the ones who give it all back.",
      plain: "A tree grows by adding rings, not by being stretched.",
      body: [
        "At a fixed 1%, a growing account automatically risks more money per trade — that's the compounding, and it's enough.",
        "Raising the percentage changes the whole risk profile you simulated in Unit 11: at 2% your median drawdown roughly doubled; at 5% half the runs saw 50%.",
        "Adding capital (from savings or other income) is the legitimate way to scale faster. Adding risk % is not.",
        "> If your edge is real, time and a fixed percentage will prove it. If it isn't, a bigger percentage just gets you the answer faster — and more painfully."
      ],
      ex: { p: "Explain why you scale by growing the account rather than raising the risk percentage, with a number from your Unit 11 work.",
        r: ["Fixed % on a growing account already compounds", "Raising % changes the drawdown/ruin profile (cites Unit 11 numbers)", "Adding capital is the legitimate way to scale", "Bigger % only speeds up discovering a false edge"],
        m: "At a fixed 1%, the money I risk grows as the account grows, so compounding does the scaling. Raising the percentage changes the whole risk profile — in my Unit 11 simulation, moving from 1% to 2% roughly doubled the typical drawdown. If I want to scale faster I add capital, not risk." },
      q: [
        { k: "mcq", q: "The legitimate way to scale faster is…", o: ["Raise risk to 3%", "Add capital to the account", "Trade more pairs at once", "Skip the checklist"], a: 1, w: "Money in, not risk up." },
        { k: "mcq", q: "At a fixed 1%, as the account grows, the money risked per trade…", o: ["Stays the same", "Grows automatically", "Shrinks", "Resets monthly"], a: 1, w: "That's compounding." },
        { k: "mcq", q: "Raising risk from 1% to 2% mainly…", o: ["Doubles profits safely", "Roughly doubles typical drawdowns and raises ruin risk", "Has no effect", "Lowers drawdowns"], a: 1, w: "From your own Monte Carlo." }
      ],
      yt: ["position sizing compounding explained"],
      src: ["math"] },

    { id: "w26b", t: "Withdrawal Policy",
      big: "Decide now, in calm: what proportion of profits comes out, how often, and at what account level. A trading account without a withdrawal policy is a scoreboard — and scoreboards encourage behaviour that businesses punish.",
      plain: "A farmer who never harvests just watches the crop get eaten.",
      body: [
        "A simple policy: at each month-end where the account is above its previous high, withdraw a fixed share (e.g., 30%) of that month's profit; leave the rest to compound.",
        "Given your situation, a policy that routes withdrawals toward obligations first is worth writing down explicitly.",
        "Never withdraw to 'reset' after a loss, and never deposit to 'recover' one — both are the spiral in disguise.",
        "Record deposits and withdrawals separately so your performance statistics stay honest."
      ],
      ex: { p: "Write a withdrawal policy with a proportion, a frequency and a trigger, and explain why it matters.",
        r: ["Specifies proportion, frequency and trigger (e.g., new high at month-end)", "Keeps the rest compounding", "Forbids withdraw/deposit behaviour driven by losses", "Keeps performance records separate from cash flows"],
        m: "At each month-end where the account is above its previous high, I'll withdraw 30% of that month's profit and leave the rest to compound, sending withdrawals to my obligations first. I won't withdraw or deposit because of a loss. And I'll record cash flows separately so my performance numbers stay honest." },
      q: [
        { k: "mcq", q: "A sensible withdrawal trigger is…", o: ["After any losing week", "A month-end with the account above its previous high", "Whenever you feel like it", "Never"], a: 1, w: "Harvest from new highs." },
        { k: "mcq", q: "Depositing more money to 'win back' a loss is…", o: ["Smart", "The failure spiral in disguise", "Required", "Neutral"], a: 1, w: "Stage 3 behaviour." },
        { k: "mcq", q: "Why record deposits and withdrawals separately?", o: ["Tax only", "So performance statistics stay honest", "Brokers require it", "No reason"], a: 1, w: "Cash flow isn't performance." }
      ],
      yt: [],
      src: ["design"] },

    { id: "w26c", t: "Review Cadence and the Rebuild Trigger",
      big: "Set a rhythm of reviews — weekly statistics, monthly system review, quarterly strategy review — and define in advance the evidence that means your edge has decayed rather than that you're in normal variance.",
      plain: "A car has a service schedule and a warning light. You don't rebuild the engine because of one rattle — but you don't ignore the red light either.",
      body: [
        "• **Weekly:** adherence, grade spread, expectancy, breakers.",
        "• **Monthly:** segment review, missed-trade log, execution gap.",
        "• **Quarterly:** system review against its original evidence; market list; style check.",
        "**The rebuild trigger** (decided now, not mid-drawdown): a drawdown beyond your Monte Carlo worst case, or a statistically meaningful drop in expectancy over at least 50 trades. Either means: stop, return to backtesting, test calmly.",
        "Everything before that trigger is variance, and your only job is execution.",
        "> This is the Turtle method's final lesson. The rules don't need defending in the middle of a losing streak — they need a pre-agreed test for when they're truly broken."
      ],
      ex: { p: "Describe your review cadence and your rebuild trigger, and explain why the trigger must be decided in advance.",
        r: ["Weekly/monthly/quarterly reviews with contents", "Trigger: drawdown beyond Monte Carlo worst case or meaningful expectancy drop over a decent sample", "Before the trigger = variance → execute", "Deciding in advance prevents emotional abandonment mid-drawdown"],
        m: "Every week I check adherence, grades, expectancy and breakers; every month I review segments, missed trades and the execution gap; every quarter I review the whole system. My rebuild trigger is a drawdown beyond my Monte Carlo worst case, or a clear drop in expectancy over at least 50 trades. Until then it's variance and I just execute. I decide this now because in a drawdown I'd find reasons to quit that aren't real." },
      q: [
        { k: "mcq", q: "Which belongs in the weekly review?", o: ["Full system redesign", "Adherence, grades, expectancy, breakers", "Changing markets", "Nothing"], a: 1, w: "Quick process checks." },
        { k: "mcq", q: "Your drawdown is within your Monte Carlo 95th percentile. You…", o: ["Rebuild", "Keep executing — it's variance", "Stop for a month", "Double size"], a: 1, w: "Inside expectations." },
        { k: "mcq", q: "Why decide the rebuild trigger in advance?", o: ["Paperwork", "So you don't abandon a working system emotionally mid-drawdown", "Brokers ask", "No reason"], a: 1, w: "Pre-commitment, one last time." }
      ],
      yt: [],
      src: ["design", "turtle"] }
  ],
  P: { task: "Write the scaling plan and your plan for the next six months — then a revision week and the four-month audit.",
    steps: [
      "Write your scaling plan: risk fixed at 1%, how capital additions work, and what growth looks like at your expectancy.",
      "Write your withdrawal policy: what proportion comes out, how often, and at what account level.",
      "Write your review cadence and your rebuild trigger (a drawdown beyond your Monte Carlo worst case). Then draft your plan for the next six months: what you'll trade, the ladder, reviews, and one skill to deepen."
    ],
    tools: ["journal"],
    num: [
      { k: "finalE", l: "Six-month expectancy across real-data trades (R)", t: "number" },
      { k: "finalAdh", l: "Six-month adherence (%)", t: "number" }
    ] },
  R: "Send your scaling plan and your next-six-months plan. The four-month audit comes after the revision week — then we decide together what comes next."
});
