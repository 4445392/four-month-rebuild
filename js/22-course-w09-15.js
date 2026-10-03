/* ============================================================
   TRD 201 · Risk Mathematics (Units 9–11)
   TRD 202 · Macro & Fundamentals (Units 12–15)
   ============================================================ */

COURSE.week({
  n: 9, mod: "201", t: "Risk and Position Size",
  aim: "Make the size of every trade an output of arithmetic — permanently, without exception.",
  L: [
    { id: "w09a", t: "Fixed Fractional Risk",
      big: "Risk the same small percentage of your current account on every trade. Because the amount shrinks as the account shrinks, a losing streak becomes a slope you can climb back up — not a cliff.",
      plain: "A cyclist who eases off as the hill gets steeper still reaches the top. One who sprints at full power the whole way runs out of legs halfway up.",
      dia: "fixedFrac",
      body: [
        "= Risk per trade (money) = current account × risk %",
        "Ten losses in a row — which, as you'll see in Unit 11, will happen to you — leave you with:",
        "• at 1% risk: 0.99¹⁰ = **90.4%** of the account",
        "• at 2%: 0.98¹⁰ = **81.7%**",
        "• at 5%: 0.95¹⁰ = **59.9%**",
        "• at 10%: 0.90¹⁰ = **34.9%**",
        "The first is an annoyance. The last is a career-ending hole (Unit 11 shows why it's much harder to climb out of than it was to fall in).",
        "The Turtles sized so that one day's normal move (1N) was worth 1% of the account, with the stop at 2N — about 2% at risk per unit. This course's ceiling is **1% at the stop**, and you start lower: as an independent trader you have no firm's balance sheet behind you and no risk manager to stop you.",
        "> The point of fixed-fractional risk isn't to make money faster. It's to make it mathematically very hard to be knocked out before your edge has time to work."
      ],
      ex: { p: "Explain fixed-fractional risk, and show with numbers why 1% and 10% per trade are completely different jobs.",
        r: ["Risk a fixed % of the current account each trade", "Money at risk shrinks as the account shrinks", "Ten losses: ~90% left at 1% vs ~35% at 10%", "Purpose is survival long enough for the edge to work"],
        m: "Fixed-fractional risk means I always risk the same percentage of whatever my account is right now, so after losses I automatically risk less money. After ten losses in a row I'd still have about 90% of the account at 1% risk, but only about 35% at 10% risk. The first is recoverable; the second nearly ends the account. The point is to survive long enough for my edge to pay." },
      q: [
        { k: "num", q: "After 10 consecutive losses at 2% risk each, what percentage of your starting account remains? (1 decimal)", a: 81.7, tol: 0.1, u: "%", w: "0.98¹⁰ = 0.817 → 81.7%." },
        { k: "num", q: "A $20,000 account risking 1% per trade risks how many dollars on this trade?", a: 200, tol: 0.01, u: "USD", w: "$20,000 × 0.01 = $200." },
        { k: "mcq", q: "Why does fixed-fractional risk slow the damage of a losing streak?", o: ["It raises the win rate", "The money at risk shrinks as the account shrinks", "It widens the stop", "It removes losing trades"], a: 1, w: "Each loss is a percentage of a smaller number." }
      ],
      yt: ["fixed fractional position sizing explained", "why risk 1% per trade explained"],
      src: ["math", "turtle"] },

    { id: "w09b", t: "The Position-Size Formula: Stop First, Size Second",
      big: "Your stop goes where your trade idea is proven wrong. Only then do you calculate size, so that hitting that stop costs exactly your chosen risk. Size is the output of the stop — never the other way round.",
      plain: "A builder measures the gap before cutting the plank. Cutting the plank first and then forcing the gap to fit is how you get a crooked house.",
      dia: "sizeFlow",
      body: [
        "= Lots = (Account × Risk%) ÷ (Stop distance in pips × Pip value per lot)",
        "Derive it rather than memorise it. The numerator is the money you're willing to lose. The denominator is how much money one lot loses if the stop is hit. Divide one by the other and you get how many lots make those two equal.",
        "**Worked example.** $10,000 account, 1% risk = $100. EUR/USD stop 25 pips. Pip value per standard lot = $10. So one lot would lose 25 × $10 = $250 at the stop. Lots = $100 ÷ $250 = **0.40 lots**.",
        "**Why stop first?** If you choose 1 lot and then place a 10-pip stop 'so the loss is only $100', you've placed the stop where the arithmetic wanted — not where the market proves you wrong. Noise takes it out, and you call the market unfair.",
        "Always round **down** (0.437 → 0.43). Rounding up quietly raises your risk above your rule.",
        "The Position Size lab does this instantly — but you'll be examined on doing it by hand, because on the day your platform hides the calculator, the habit is all you have."
      ],
      ex: { p: "Walk through the position-size formula for a real example, and explain why the stop must be decided before the size.",
        r: ["Money at risk = account × risk %", "Loss per lot at the stop = stop pips × pip value", "Lots = money at risk ÷ loss per lot, rounded down", "Stop is placed where the idea is wrong first; size adapts"],
        m: "First I decide where the trade is proven wrong and put the stop there. Then: money at risk is account times risk percent — say $10,000 × 1% = $100. One lot would lose stop pips times pip value — 25 pips × $10 = $250. So I trade $100 ÷ $250 = 0.40 lots, rounding down. If I chose the size first, I'd end up putting the stop wherever the maths needed, which is usually inside the noise." },
      q: [
        { k: "num", q: "Account $5,000, risk 1%, EUR/USD stop 20 pips. How many lots? (2 decimals)", a: 0.25, tol: 0.001, u: "lots", w: "$50 ÷ (20 × $10) = 0.25 lots." },
        { k: "num", q: "Account $20,000, risk 0.5%, USD/JPY at 150.00, stop 40 pips. Pip value per lot ≈ $6.667. How many lots? (3 decimals)", a: 0.375, tol: 0.002, u: "lots", w: "$100 ÷ (40 × $6.667) = $100 ÷ $266.67 = 0.375 lots (trade 0.37)." },
        { k: "mcq", q: "Which order of decisions is correct?", o: ["Choose lot size, then place the stop to fit your risk", "Place the stop where the idea is wrong, then compute size", "Decide risk after entering", "Size by confidence"], a: 1, w: "Stop first, size second. Always." }
      ],
      yt: ["position size calculation forex step by step"],
      src: ["math", "claude"] },

    { id: "w09c", t: "Volatility: True Range, N, and the Turtle Unit",
      big: "The Turtles measured each market's normal daily movement — N, a smoothed average true range — and sized every position so a 1N move was worth 1% of the account. Different markets, same risk.",
      plain: "A tailor doesn't sell one shirt size to everyone. Measure the person (volatility), then cut to fit. A calm market gets a bigger position and a wild one a smaller one — so each carries the same risk.",
      dia: "trueRange",
      body: [
        "= True Range = max( High − Low , |High − Previous close| , |Previous close − Low| )",
        "True Range counts gaps as movement: if today opened far from yesterday's close, that jump is part of the day's range.",
        "= N = (19 × previous N + today's TR) ÷ 20      (start with the 20-day average of TR)",
        "That's a smoothed 20-day average true range — the Turtles' 'N'. The Trading Floor shows N on every bar.",
        "= Turtle unit = (1% of account) ÷ (N × dollars per point)",
        "In forex terms, 'dollars per point' = pip value per lot, and N is measured in pips. Example: $10,000 account, EUR/USD N = 70 pips, $10 per pip per lot → unit = $100 ÷ (70 × $10) = **0.14 lots**. A 1N move now changes the account by about 1%.",
        "The Turtles' stop sat at 2N, so each full unit risked about 2%. This course keeps you at **1% at the stop**: with a 2N stop, that's half a Turtle unit (0.5% per N). Same logic, gentler dial.",
        "> Volatility sizing is the reason a Turtle could trade coffee, bonds and yen in one portfolio: each position was built to move the account by the same amount on a normal day."
      ],
      ex: { p: "Explain what N measures, how the Turtles used it to size a unit, and how this course adapts the rule.",
        r: ["True Range includes gaps (max of three distances)", "N = smoothed 20-day average true range", "Unit = 1% of account ÷ (N × pip value) so 1N ≈ 1% of account", "Turtle stop at 2N ≈ 2% per unit; course uses 0.5% per N to keep 1% at the stop"],
        m: "True Range is the biggest of today's high minus low, or the distance from yesterday's close to today's high or low, so gaps count. N is a smoothed 20-day average of it — how much the market normally moves in a day. The Turtles sized a unit so that a 1N move equalled 1% of the account, and put the stop 2N away, risking about 2%. This course uses half that — 0.5% per N — so a 2N stop risks 1%." },
      q: [
        { k: "num", q: "Yesterday's close 1.1000. Today: high 1.1050, low 1.0980. True Range in pips?", a: 70, tol: 0.01, u: "pips", w: "max(70, 50, 20) = 70 pips." },
        { k: "num", q: "Previous N = 60 pips; today's TR = 100 pips. New N? (1 decimal)", a: 62, tol: 0.05, u: "pips", w: "(19 × 60 + 100) ÷ 20 = 1,240 ÷ 20 = 62." },
        { k: "num", q: "Account $50,000. N = 80 pips, $10 per pip per lot. One original Turtle unit (1% per N) in lots? (3 decimals)", a: 0.625, tol: 0.001, u: "lots", w: "$500 ÷ (80 × $10) = 0.625 lots." }
      ],
      yt: ["average true range ATR explained", "turtle trading position sizing N unit explained"],
      src: ["turtle", "math"] }
  ],
  P: { task: "Build a position-size calculator yourself — and prove it right by hand.",
    steps: [
      "Start an imaginary R10,000 account and lose ten trades in a row: once risking a fixed R200 per trade, once risking 2% of the current balance. Tabulate both balances after each loss. Which one can still climb back?",
      "Build a position-size calculator — a small Java class or a spreadsheet. Inputs: account, risk %, stop in pips, pip value. Output: lots, rounded down. Check it against 20 hand-calculated cases across three pairs (one of them a JPY pair).",
      "Do ten Turtle-unit cases using N instead of the stop. Then 20 questions in Labs → Math Drills without looking anything up. Record your first-try accuracy."
    ],
    tools: ["lab:size", "lab:drills"],
    num: [
      { k: "handOk", l: "Hand calculations matching your calculator (out of 30)", t: "number" },
      { k: "drill", l: "Math Drills first-try accuracy (%)", t: "number" }
    ] },
  R: "Send your calculator (code or sheet) and your drill accuracy. On Sunday the tutor will give you five cold cases — return the lot sizes with the working."
});

COURSE.week({
  n: 10, mod: "201", t: "R-Multiples and Expectancy",
  aim: "Stop thinking in rands. Start thinking in R — the only unit that survives a changing account.",
  L: [
    { id: "w10a", t: "What R Is",
      big: "R is the amount you risk on a trade. Every result is measured in multiples of it: a full stop-out is −1R, a win worth twice your risk is +2R. R makes every trade comparable, whatever the account size or pair.",
      plain: "Measuring runners in laps instead of metres lets you compare a school track with an Olympic one. R is the lap: it lets you compare a R500 trade with a R50,000 trade.",
      dia: "rScale",
      body: [
        "= 1R = entry − stop (for a long; mirror for a short)",
        "= Outcome in R = (exit − entry) ÷ (entry − stop)    for longs",
        "Long at 1.1000, stop 1.0970 (30 pips = 1R), exit 1.1075 (+75 pips) → **+2.5R**.",
        "Losses are usually **slightly worse than −1R** because of spread and slippage. That's normal and it's why you record realised R, not planned R.",
        "Record every trade in R, not in money. Your account will grow and shrink; your risk % may change on the ladder in Unit 25. R is the only yardstick that means the same thing in Unit 9 and Unit 26.",
        "> Planned R:R is a hope. Realised R is data."
      ],
      ex: { p: "Define R and show how you'd convert a trade's result into R. Why is R better than money for your journal?",
        r: ["R = initial risk per trade (entry to stop)", "Outcome R = result ÷ initial risk", "Losses can exceed −1R through slippage/costs", "R stays comparable as account size and risk % change"],
        m: "R is how much I risked — the distance from entry to stop. To express a result in R I divide what I made or lost by that initial risk: a 75-pip win with a 30-pip stop is +2.5R. Losses can be a bit worse than −1R because of spread and slippage. R is better than money because it stays comparable even when my account size or risk percentage changes." },
      q: [
        { k: "num", q: "Long at 1.1000, stop 1.0970, exit 1.1075. Outcome in R?", a: 2.5, tol: 0.01, u: "R", w: "Risk 30 pips; gain 75 pips; 75 ÷ 30 = 2.5R." },
        { k: "num", q: "Short at 1.2500 with a stop at 1.2540, but the stop fills at 1.2560 in a fast market. Outcome in R?", a: -1.5, tol: 0.01, u: "R", w: "Risk 40 pips; loss 60 pips; −60 ÷ 40 = −1.5R." },
        { k: "mcq", q: "Why record results in R rather than money?", o: ["It looks professional", "R stays comparable across account sizes, pairs and risk levels", "Brokers report in R", "It hides losses"], a: 1, w: "It's the only stable unit." }
      ],
      yt: ["R multiples trading explained Van Tharp"],
      src: ["math", "claude"] },

    { id: "w10b", t: "Expectancy",
      big: "Expectancy is the average R you make per trade across many trades. Positive means an edge; negative means no amount of discipline can save the system. It says nothing at all about the next trade.",
      plain: "A casino loses individual hands all night and still wins the month — because each bet carries a small edge and there are thousands of bets.",
      dia: "expectancyBar",
      body: [
        "= Expectancy (R per trade) = (Win% × Average win in R) − (Loss% × Average loss in R)",
        "**Worked example.** 40% winners averaging +2.5R, 60% losers averaging −1R: 0.40 × 2.5 − 0.60 × 1 = 1.0 − 0.6 = **+0.40R per trade**.",
        "Over 100 trades that's about +40R. At 1% risk per trade, +40R is very roughly +40% on the account (compounding shifts it a little either way).",
        "Expectancy is a property of the **system over many trades**, not of any single trade. A +0.4R system still produces losing weeks, losing months and long losing streaks (Unit 11).",
        "> Positive expectancy after costs is the entire definition of an edge. Everything else in this course — structure, fundamentals, psychology — exists to find it, measure it, or stop you from ruining it."
      ],
      ex: { p: "Define expectancy, compute it for an example, and explain why it says nothing about your next trade.",
        r: ["Formula: win% × avg win − loss% × avg loss (in R)", "Correct worked example", "Positive after costs = edge", "Describes the long run, not any single trade"],
        m: "Expectancy is the average R I make per trade: win rate times average win, minus loss rate times average loss. With 40% winners at 2.5R and 60% losers at 1R it's +0.4R per trade, so about +40R over 100 trades. It's a long-run average — any single trade can still lose, and there will be losing streaks." },
      q: [
        { k: "num", q: "Win rate 35%, average win 3R, average loss 1R. Expectancy in R? (2 decimals)", a: 0.4, tol: 0.005, u: "R", w: "0.35 × 3 − 0.65 × 1 = 1.05 − 0.65 = +0.40R." },
        { k: "num", q: "Win rate 55%, average win 0.8R, average loss 1R. Expectancy in R? (2 decimals)", a: -0.01, tol: 0.005, u: "R", w: "0.55 × 0.8 − 0.45 × 1 = 0.44 − 0.45 = −0.01R. A 55% win rate that loses money." },
        { k: "mcq", q: "Your system's expectancy is +0.3R. Your next trade will…", o: ["Make +0.3R", "Probably win", "Win or lose — expectancy describes the average over many trades", "Lose, because averages revert"], a: 2, w: "Expectancy is about the distribution, not the next draw." }
      ],
      yt: ["trading expectancy formula explained", "expected value explained intuition"],
      src: ["math", "claude"] },

    { id: "w10c", t: "The Win-Rate Trap",
      big: "Win rate on its own tells you nothing. What matters is win rate together with how big your wins are compared with your losses. The win rate you need just to break even is 1 ÷ (1 + R).",
      plain: "A shop that sells to only 3 of every 10 customers can be richer than one that sells to 9 of 10 — if the 3 buy furniture and the 9 buy chewing gum.",
      dia: "breakeven",
      body: [
        "= Break-even win rate = 1 ÷ (1 + average win in R)     (average loss = 1R)",
        "• 1R winners → need 50%",
        "• 1.5R → 40%",
        "• 2R → 33.3%",
        "• 3R → 25%",
        "• 5R → 16.7%",
        "Here's the trap exposed: a **30% win rate with 3R winners** and a **60% win rate with 1R winners** have *exactly the same* expectancy: +0.2R. And a 35% win rate at 3R (+0.40R) beats both. Win rate alone can't rank them.",
        "Trend-following systems like the Turtles' typically lose on well over half their trades. Their edge lives entirely in the size of the few big winners — which is why skipping signals is so expensive for them (Unit 21).",
        "Costs push the whole curve up: a system paying 0.12R per trade in costs needs a higher win rate or bigger wins to clear the same bar. The Expectancy lab lets you drag both dials and watch."
      ],
      ex: { p: "Explain why win rate alone can't tell you whether a system is good, using the break-even formula and one example.",
        r: ["Break-even win% = 1 / (1 + R)", "Profitability depends on win rate AND win size together", "Example where a low win-rate system equals or beats a high win-rate one", "Trend-following wins rarely but big"],
        m: "What matters is win rate combined with the size of the wins. The break-even win rate is 1 divided by (1 plus the average win in R), so with 3R winners I only need to win 25% of the time. A 30% win rate at 3R and a 60% win rate at 1R both make +0.2R per trade, so win rate alone can't rank them. Trend-following systems win less than half the time and still profit because the wins are big." },
      q: [
        { k: "num", q: "Break-even win rate for a system whose average win is 4R (average loss 1R)? (%)", a: 20, tol: 0.1, u: "%", w: "1 ÷ (1 + 4) = 0.20 = 20%." },
        { k: "num", q: "Break-even win rate for 1.5R average winners? (%)", a: 40, tol: 0.1, u: "%", w: "1 ÷ 2.5 = 40%." },
        { k: "mcq", q: "System A: 30% wins at 3R. System B: 60% wins at 1R (losses 1R). Which has the higher expectancy?", o: ["A", "B", "They're equal: both +0.2R", "Can't be computed"], a: 2, w: "A: 0.9 − 0.7 = 0.2. B: 0.6 − 0.4 = 0.2. Win rate alone told you nothing." }
      ],
      yt: ["win rate vs risk reward ratio explained break even"],
      src: ["math", "turtle"] }
  ],
  P: { task: "Put R and expectancy on your own earlier data — and look a negative number in the eye.",
    steps: [
      "Take your Unit 6 CHoCH instances. For each, assign an entry at the signal close, a structural stop beyond the protective swing, and a 2R target. Record each outcome in R.",
      "Do the same for your Unit 8 sweeps. Then compute win rate, average win, average loss and expectancy for both crude 'systems', and check them in the Expectancy lab.",
      "Build the break-even table yourself — 1 ÷ (1 + R) for R from 0.5 to 4 — and check it in the Expectancy lab. Mark where your two crude systems sit on it."
    ],
    tools: ["lab:expectancy", "journal"],
    num: [
      { k: "chochE", l: "CHoCH 'system' expectancy (R)", t: "number" },
      { k: "sweepE", l: "Sweep 'system' expectancy (R)", t: "number" }
    ] },
  R: "Send both expectancies. Then explain, mechanically, how a signal that's 'right' 55% of the time can still lose money."
});

COURSE.week({
  n: 11, mod: "201", t: "Drawdown, Variance, Ruin",
  aim: "Understand the force that kills accounts which genuinely had an edge. The most important unit of the course.",
  gate: "g2",
  L: [
    { id: "w11a", t: "Recovery Asymmetry",
      big: "Losses and gains aren't symmetrical. Lose 50% and you need +100% to get back. The deeper the hole, the steeper the climb — which is why risk management's first job is keeping holes shallow.",
      plain: "Fall one metre into a hole and you step out. Fall ten metres and you need a ladder, a rope and help.",
      dia: "recovery",
      body: [
        "= Gain needed to recover = L ÷ (1 − L)       (L = loss as a fraction)",
        "• −10% needs **+11.1%**",
        "• −20% needs **+25%**",
        "• −25% needs **+33.3%**",
        "• −50% needs **+100%**",
        "• −80% needs **+400%**",
        "The curve bends upward slowly, then turns almost vertical. Up to about −20% recovery is merely annoying; beyond −50% it's rarely achieved.",
        "The Turtles had a built-in brake: **for every 10% the account fell, they traded as if it were 20% smaller.** A $1,000,000 account down 10% was traded as $800,000; down another 10%, as $640,000. Risk shrank faster than the account — exactly when it was most dangerous."
      ],
      ex: { p: "Explain recovery asymmetry with numbers, and describe the Turtles' drawdown rule.",
        r: ["Required gain = L / (1 − L)", "Examples showing asymmetry (e.g., −50% needs +100%)", "Deep drawdowns become nearly unrecoverable", "Turtles cut notional account 20% per 10% drawdown"],
        m: "Losses and gains don't balance: after losing a fraction L, I need L ÷ (1 − L) to get back. Losing 10% needs 11%, but losing 50% needs 100% and losing 80% needs 400%. So deep drawdowns are almost impossible to recover from. The Turtles traded as if their account were 20% smaller for every 10% it had fallen, shrinking risk fast when it mattered." },
      q: [
        { k: "num", q: "What gain is needed to recover from a 40% drawdown? (%, 1 decimal)", a: 66.7, tol: 0.1, u: "%", w: "0.40 ÷ 0.60 = 0.667 → 66.7%." },
        { k: "num", q: "What gain is needed to recover from a 25% drawdown? (%, 1 decimal)", a: 33.3, tol: 0.1, u: "%", w: "0.25 ÷ 0.75 = 33.3%." },
        { k: "mcq", q: "The Turtles' drawdown rule was…", o: ["Double size to recover faster", "For every 10% drawdown, trade as if the account were 20% smaller", "Stop trading for a month", "Switch markets"], a: 1, w: "Risk shrinks faster than the account falls." }
      ],
      yt: ["drawdown recovery math explained"],
      src: ["math", "turtle"] },

    { id: "w11b", t: "Streaks Are Normal",
      big: "Long losing streaks are a mathematical certainty, even for a system with a real edge. At a 40% win rate, a run of seven losses somewhere in 200 trades happens about nine times out of ten.",
      plain: "Flip a fair coin 200 times and you'll almost certainly see six or seven heads in a row somewhere. Nobody thinks the coin is broken.",
      dia: "streaks",
      body: [
        "At a **40% win rate** (60% of trades lose) over **200 trades**, the chance of seeing at least one losing streak of:",
        "• 7 or more: about **91%**",
        "• 8 or more: about **75%**",
        "• 10 or more: about **38%**",
        "The typical longest losing streak in that setup is around **9 trades**, and one run in ten sees 12 or more.",
        "Why this matters psychologically: the moment most people abandon a system is the middle of a normal streak. They conclude 'it stopped working', switch to something new, and restart the clock on a fresh streak.",
        "> Your system document must state, in advance, the losing streak it is built to survive — so that when it arrives, it's an expected event, not a crisis. The Streaks lab computes it for your own win rate."
      ],
      ex: { p: "Explain why long losing streaks happen even to good systems, give a number, and say what you should decide in advance.",
        r: ["Each trade's outcome is independent; losses cluster by chance", "Gives a concrete probability (e.g., ~91% chance of 7+ in 200 trades at 40%)", "People abandon systems mid-streak", "Pre-commit to the streak length the plan must survive"],
        m: "Wins and losses arrive randomly, so long runs of losses happen by chance even with a real edge. With a 40% win rate over 200 trades there's roughly a 91% chance of at least seven losses in a row, and the longest streak is usually around nine. Most people quit in the middle of a normal streak, so I write down beforehand the streak my plan must survive." },
      q: [
        { k: "num", q: "Loss rate 60%. Probability that five specific consecutive trades are all losses? (%, 1 decimal)", a: 7.8, tol: 0.1, u: "%", w: "0.6⁵ = 0.0778 → 7.8%. Small for any given five — but 200 trades give it many chances to happen." },
        { k: "mcq", q: "A system with a 40% win rate: over 200 trades, a run of 7+ losses is…", o: ["Rare (about 1 in 50)", "Possible (about 1 in 4)", "Very likely (about 9 in 10)", "Impossible if the edge is real"], a: 2, w: "About 91%." },
        { k: "mcq", q: "After seven straight losses on a tested system, the right response is…", o: ["Switch systems", "Double size to recover", "Keep following the rules, and check the streak is within the range your plan expects", "Stop using stops"], a: 2, w: "Compare with the expected streak; don't improvise." }
      ],
      yt: ["losing streaks probability trading explained", "gamblers fallacy explained"],
      src: ["math"] },

    { id: "w11c", t: "Risk of Ruin",
      big: "Risk of ruin is the chance that ordinary bad luck pushes your account below the point where you can keep going. Position size is the dial that controls it — you can have a real edge and still go broke by sizing too large.",
      plain: "Crossing a river on stepping stones: your edge is how good your balance is; your position size is how far apart you put the stones. Excellent balance doesn't help if the stones are two metres apart.",
      dia: "mcFan",
      body: [
        "A **Monte Carlo simulation** replays your system thousands of times, reshuffling the order of wins and losses, to show the range of futures your edge could produce — not just the one path your backtest happened to follow.",
        "Take a system with a genuine edge: 40% winners averaging +2R (expectancy +0.2R), 200 trades, 5,000 simulated runs:",
        "• **1% risk:** median worst drawdown ≈ 12%; the worst 5% of runs ≈ 21%.",
        "• **2% risk:** median ≈ 23%; worst 5% ≈ 39%; about one run in five hits a 30% drawdown.",
        "• **5% risk:** median ≈ 50% — **half of all runs suffer a 50% drawdown**, despite the positive edge.",
        "Same edge, same trades, different stone spacing. The difference between a trader and an ex-trader is often nothing but the size dial.",
        "Your backtest is one path. The simulation is the whole map of paths you could have walked. That's why the worst simulated drawdown is always deeper than anything in your backtest — and why the simulation, not the backtest, sets your expectations.",
        "> In the Monte Carlo lab you'll run your own numbers. Gate 2 asks for your risk of ruin at 1% and 2%, from your own simulation."
      ],
      ex: { p: "Explain risk of ruin and Monte Carlo simulation, and why the worst simulated drawdown is deeper than your backtest's.",
        r: ["Risk of ruin = chance variance pushes you below a survivable level", "Position size is the main controllable dial", "Monte Carlo reshuffles outcomes to show many possible paths", "The backtest is one path; the simulation explores the tails, so its worst case is deeper"],
        m: "Risk of ruin is the chance that normal bad luck drives my account so low I can't continue. With the same edge, bigger position sizes make that chance much higher — at 5% risk, half of simulated runs had a 50% drawdown even with a positive edge. A Monte Carlo reshuffles the order of my wins and losses thousands of times. My backtest is just one of those orderings, so the simulation always finds worse paths than the one I happened to see." },
      q: [
        { k: "mcq", q: "In the simulation (40% winners at +2R, 200 trades), roughly what share of runs at 5% risk suffered a 50% drawdown?", o: ["Almost none", "About 1 in 10", "About half", "All of them"], a: 2, w: "About half — with a positive edge." },
        { k: "mcq", q: "Why does the worst Monte Carlo drawdown exceed your backtest's worst?", o: ["The simulation is broken", "Your backtest is one ordering; the simulation explores thousands", "Backtests ignore losses", "It doesn't"], a: 1, w: "One path versus the map of paths." },
        { k: "mcq", q: "The main dial controlling risk of ruin that's fully under your control is…", o: ["Win rate", "Position size", "Market volatility", "Your broker"], a: 1, w: "You can't choose your win rate day to day. You always choose your size." }
      ],
      yt: ["monte carlo simulation trading explained", "risk of ruin trading explained"],
      src: ["math"] }
  ],
  P: { task: "Run your own Monte Carlo — then sit Gate 2, the hard one.",
    steps: [
      "Recovery lab: find the gain needed to recover from 10%, 25%, 50% and 80% losses, and where the curve turns vertical. Write one sentence on what that means for your risk limit.",
      "Streaks lab at your Unit 10 win rate: find the median and 90th-percentile longest losing streak over 200 trades. That is the streak your plan must survive.",
      "Monte Carlo lab with your Unit 10 win rate and average win: run 0.5%, 1%, 2% and 5% risk. Record your risk of ruin at 1% and 2%, and your 95th-percentile drawdown."
    ],
    tools: ["lab:mc", "lab:streaks", "lab:recovery"],
    num: [
      { k: "ruin1", l: "Chance of a 30% drawdown at 1% risk (%)", t: "number" },
      { k: "ruin2", l: "Chance of a 30% drawdown at 2% risk (%)", t: "number" },
      { k: "dd95", l: "95th-percentile drawdown at 1% (%)", t: "number" },
      { k: "streak", l: "Losing streak your plan must survive", t: "number" }
    ] },
  R: "Send your four numbers. Gate 2 must be passed before any system building. This is the gate every blown account skipped."
});

COURSE.week({
  n: 12, mod: "202", t: "Rates: The Primary Driver",
  aim: "Understand the gravity that technical structure moves around.",
  L: [
    { id: "w12a", t: "Capital Follows Yield",
      big: "Money moves toward higher interest rates. Holding a currency that pays more than the one you borrowed earns you the difference every day — the carry — and over months that pull is the largest single force in forex.",
      plain: "Savers move their money to the bank offering the best interest rate. Currencies are the savings accounts of whole countries.",
      body: [
        "If country A's interest rate is 5% and country B's is 0.5%, holding A's currency funded by B's earns about 4.5% a year before any price change. That's the **carry trade**.",
        "Your platform shows it as **swap**: positive swap when you hold the higher-yielding currency, negative when you hold the lower-yielding one.",
        "Big pools of capital chase that yield, which gives higher-yielding currencies a persistent tailwind while conditions are calm.",
        "The catch: carry trades are crowded, and when fear arrives they unwind all at once. Traders describe carry as going **up the stairs and down the lift** — slow steady gains, then sudden sharp falls. You'll meet the fear side of this in Unit 15."
      ],
      ex: { p: "Explain the carry trade and why higher-yielding currencies attract capital — and what the catch is.",
        r: ["Interest differential earned by holding the higher-yielding currency", "Shows up as swap", "Capital chases yield → tailwind in calm times", "Crowded carry unwinds violently in risk-off ('stairs up, lift down')"],
        m: "If one currency pays much higher interest than another, holding it and funding it with the low-yield currency earns the difference every day — that's carry, and it shows up as positive swap. Lots of money chases that yield, which supports high-yield currencies in calm markets. But everyone is in the same trade, so when fear hits they all exit at once and it falls fast." },
      q: [
        { k: "num", q: "You hold a currency paying 7% funded by one paying 2%. Ignoring price moves, what's the approximate annual carry? (%)", a: 5, tol: 0.01, u: "%", w: "7% − 2% = 5%." },
        { k: "mcq", q: "On your platform, carry mainly shows up as…", o: ["The spread", "Swap", "Commission", "Margin"], a: 1, w: "Swap is the overnight interest differential." },
        { k: "mcq", q: "'Up the stairs, down the lift' describes…", o: ["Scalping", "Carry trades: slow gains, sudden unwinds", "Central bank policy", "Range trading"], a: 1, w: "Crowded carry exits all at once." }
      ],
      yt: ["carry trade explained simply", "interest rates and currency value explained"],
      src: ["conv"] },

    { id: "w12b", t: "Expectations, Not Levels",
      big: "Markets price the future. Today's interest rate is already in the price; what moves a currency is a change in what traders expect rates to be over the coming months and years.",
      plain: "House prices near a new school rise when the school is announced, not on the day it opens. By opening day, the good news is already in the price.",
      body: [
        "If everyone expects a central bank to cut rates twice this year, those cuts are already in the price. If it then cuts only once, the currency can **rise** on a rate cut — because the future turned out less dovish than expected.",
        "This is why 'buy the rumour, sell the fact' exists. By the time good news is confirmed, the trade has often already happened.",
        "The best market proxy for rate expectations is the **2-year government bond yield**: it moves with what traders think the central bank will do over the next couple of years.",
        "> Always ask 'compared with what was expected?' A number is never good or bad on its own."
      ],
      ex: { p: "Explain why a currency can rise when its central bank cuts rates.",
        r: ["Markets price expected future rates in advance", "Price moves on the change versus expectations", "A smaller-than-expected cut is a hawkish surprise", "2-year yields proxy rate expectations"],
        m: "The market already prices in what it expects the central bank to do. If it expected two cuts and the bank signals only one, the future looks less dovish than priced, so the currency can rise even on a cut. What matters is the change compared with expectations, which I can track through 2-year government bond yields." },
      q: [
        { k: "mcq", q: "The market expects a 0.50% cut; the bank cuts 0.25%. The currency most likely…", o: ["Falls, because rates were cut", "Rises, because the cut was smaller than priced", "Doesn't move", "Moves randomly"], a: 1, w: "A hawkish surprise relative to expectations." },
        { k: "mcq", q: "The best everyday proxy for market rate expectations is…", o: ["The 30-year yield", "The 2-year government bond yield", "The stock market", "Gold"], a: 1, w: "The 2-year tracks the expected policy path." },
        { k: "mcq", q: "'Buy the rumour, sell the fact' happens because…", o: ["Traders are irrational", "Expected news is priced before it's confirmed", "Brokers manipulate prices", "News is always wrong"], a: 1, w: "The move happens on the expectation." }
      ],
      yt: ["priced in explained market expectations interest rates", "two year treasury yield and fed expectations explained"],
      src: ["conv"] },

    { id: "w12c", t: "The Rate Differential",
      big: "A pair's fundamental direction is set by the gap between the two countries' expected interest rates. When that gap widens in favour of the base currency, the pair tends to rise — while the relationship is working.",
      plain: "Two magnets pulling a trolley in opposite directions. The trolley goes toward the stronger magnet, and what matters is the difference in strength — not either magnet alone.",
      dia: "differential",
      body: [
        "= Differential = base country's 2-year yield − quote country's 2-year yield",
        "For EUR/USD: German 2-year minus US 2-year. If the US 2-year rises while Germany's is flat, the differential moves against the euro, and EUR/USD tends to fall.",
        "On TradingView you can chart yields with symbols such as **US02Y** and **DE02Y**, and plot the spread between them as a single line.",
        "The relationship is strong over months and weak over days — and it **breaks** in crises (when safety beats yield) and around interventions. Knowing when it isn't working is as valuable as knowing when it is."
      ],
      ex: { p: "Explain how a rate differential gives a pair its fundamental direction, with EUR/USD as the example, and say when the relationship tends to break.",
        r: ["Differential = base 2Y − quote 2Y", "Widening in the base's favour → pair tends to rise", "EUR/USD: DE2Y − US2Y", "Breaks in crises/risk-off and interventions; works over months not days"],
        m: "Each currency is pulled by its expected interest rates, so a pair follows the gap between the two countries' 2-year yields. For EUR/USD that's the German 2-year minus the US 2-year: if US yields rise relative to German ones, EUR/USD tends to fall. It's a slow, months-long force, and it breaks down in crises when people care about safety more than yield." },
      q: [
        { k: "mcq", q: "US 2-year yield rises 0.30% while the German 2-year is flat. All else equal, EUR/USD tends to…", o: ["Rise", "Fall", "Stay flat", "Become more volatile only"], a: 1, w: "The differential moved in the dollar's favour." },
        { k: "mcq", q: "Over which horizon is the differential relationship strongest?", o: ["Minutes", "A few hours", "Weeks to months", "It's equally strong on all horizons"], a: 2, w: "Fundamentals are slow gravity." },
        { k: "mcq", q: "When does the yield relationship tend to break down?", o: ["In calm markets", "In crises when safety beats yield", "On Mondays", "Never"], a: 1, w: "Fear overrides yield." }
      ],
      yt: ["interest rate differential forex explained"],
      src: ["conv"] }
  ],
  P: { task: "See the rate differential against price with your own eyes — including where it fails.",
    steps: [
      "Look up today's policy rates for the Fed, ECB, BoE, BoJ, RBA and SARB (each bank's own website) and rank the currencies. Then check your broker's swap rates on four pairs: does the sign of each swap match the rate gap?",
      "Chart the US 2-year yield (US02Y) against the US policy rate (search 'USINTR' in TradingView) over three years. Mark where the 2-year moved months before the Fed did — that's expectations moving first.",
      "Chart the 2-year spread against the pair for EUR/USD (DE02Y vs US02Y), GBP/USD, USD/JPY and AUD/USD over two years. Mark where they move together and every clear breakdown, with your best theory for each."
    ],
    tools: ["tv"],
    num: [
      { k: "works", l: "Pairs where the relationship was clearly visible (0–4)", t: "number" },
      { k: "breaks", l: "Clear breakdowns you found", t: "number" }
    ] },
  R: "Send the four charts and your written read. Point at the breakdowns and give your best theory for each."
});

COURSE.week({
  n: 13, mod: "202", t: "Central Banks",
  aim: "Read a central bank the way the market reads it — not the way the headlines report it.",
  L: [
    { id: "w13a", t: "Mandates Determine Behaviour",
      big: "Each central bank has a legal job — its mandate — and it reacts to whatever threatens that job. Know the mandate and you know which data will move the currency.",
      plain: "A referee enforces the rules of their sport. You predict a referee's whistles from the rulebook, not from their mood.",
      body: [
        "• **US Federal Reserve:** a dual mandate — maximum employment and stable prices. So both inflation and jobs data move the dollar.",
        "• **European Central Bank:** price stability first, with a 2% inflation target.",
        "• **Bank of England:** a 2% inflation target set by the government.",
        "• **Bank of Japan:** a 2% price-stability target, and a long history of unusual policies to reach it.",
        "• **South African Reserve Bank:** inflation targeting. Its target has been under review in recent years, so check the current target on the SARB's own website rather than trusting an old number.",
        "> A bank only acts on what it's mandated to care about. That tells you which releases deserve your attention — and which are noise for that currency."
      ],
      ex: { p: "Explain what a central bank mandate is and how it tells you which data will move a currency. Use the Fed as your example.",
        r: ["Mandate = the bank's legal objective(s)", "The bank reacts to threats to its mandate", "Fed: dual mandate — employment and prices", "Therefore both inflation and jobs data move USD"],
        m: "A mandate is the job a central bank is legally required to do, and it reacts to whatever threatens that job. The Fed has two goals — maximum employment and stable prices — so both inflation reports and jobs reports can change what it does, and therefore move the dollar. A bank with an inflation-only mandate reacts mostly to inflation data." },
      q: [
        { k: "mcq", q: "The Fed's mandate is…", o: ["Price stability only", "Maximum employment and stable prices", "A fixed exchange rate", "Maximising growth"], a: 1, w: "The dual mandate." },
        { k: "mcq", q: "Which data matters most to a central bank with an inflation-only target?", o: ["Retail sentiment", "Inflation data", "Stock prices", "Weather"], a: 1, w: "It reacts to threats to its target." },
        { k: "mcq", q: "Why check the SARB's current inflation target on its own website?", o: ["It's secret", "It has been under review, so older sources may be out of date", "It changes daily", "It isn't published"], a: 1, w: "Always prefer primary sources for things that change." }
      ],
      yt: ["central bank mandates explained Fed dual mandate", "how central banks affect currencies explained"],
      src: ["conv"] },

    { id: "w13b", t: "Hawkish and Dovish Are Relative",
      big: "A decision is 'hawkish' or 'dovish' only relative to what was expected. A 0.50% hike when 0.75% was priced is dovish — and the currency can fall on a hike.",
      plain: "A pay rise of 5% feels great if you expected 2%, and insulting if you'd been promised 10%. Same number, opposite reaction.",
      body: [
        "**Hawkish** = tighter than expected (higher rates, sooner, or tougher talk). **Dovish** = looser than expected.",
        "Before any decision, find out what's priced. For the Fed, the public **CME FedWatch** tool converts futures prices into probabilities for each possible move. Other banks have similar market-implied pricing in overnight index swaps.",
        "Then read the decision against that expectation — not against the previous rate, and not against the headline.",
        "> A headline says 'Bank raises rates'. A trader asks 'by more or less than priced — and what did it say about next time?'"
      ],
      ex: { p: "Explain why 'hawkish' and 'dovish' are relative terms, and how you'd find out what was expected before a Fed decision.",
        r: ["Hawkish/dovish = tighter/looser than expected", "The same decision can be either depending on pricing", "Check market pricing first (e.g., CME FedWatch)", "React to the surprise, not the headline"],
        m: "Hawkish and dovish describe a decision compared with what the market expected, not in absolute terms. A 0.50% hike is dovish if 0.75% was priced. Before a Fed decision I'd check what's priced — for example with the CME FedWatch tool — and then judge the actual decision and guidance against that." },
      q: [
        { k: "mcq", q: "A 0.50% hike when 0.75% was fully priced is…", o: ["Hawkish", "Dovish", "Neutral", "Impossible"], a: 1, w: "Looser than expected." },
        { k: "mcq", q: "Which public tool shows market-implied probabilities for Fed moves?", o: ["TradingView Screener", "CME FedWatch", "The COT report", "The DXY"], a: 1, w: "Derived from fed funds futures." },
        { k: "mcq", q: "A headline says 'Bank cuts rates'. The first question to ask is…", o: ["Is the cut big?", "Was it more or less than priced, and what did they signal next?", "Is the governor popular?", "What did retail traders do?"], a: 1, w: "Always relative to expectations." }
      ],
      yt: ["hawkish vs dovish explained", "CME FedWatch tool explained"],
      src: ["conv"] },

    { id: "w13c", t: "Statement Versus Press Conference",
      big: "The rate decision is usually already priced; the forward guidance — in the statement and especially the press conference — is where the repricing happens. That's why the second move is often bigger than the first.",
      plain: "At a job interview the offer letter isn't the surprise — you'd been told the salary. The surprise is what the boss says afterwards about your future there.",
      body: [
        "Typical timings in SAST:",
        "• **Fed:** statement 2:00 pm New York time, press conference 2:30 pm → **20:00 / 20:30 SAST** in the US summer, **21:00 / 21:30** in the US winter.",
        "• **ECB:** decision 14:15 Frankfurt time, press conference 14:45 → **14:15 / 14:45 SAST** in the European summer, **15:15 / 15:45** in winter.",
        "• **Bank of England:** 12:00 London time → **13:00 SAST** in summer, **14:00** in winter.",
        "The first spike reacts to the decision and statement; the press conference moves price again as the governor answers questions about the future. The two moves can be in opposite directions.",
        "> Treat the first spike as noise. The information arrives in the second act."
      ],
      ex: { p: "Explain why the press conference often moves a currency more than the rate decision itself.",
        r: ["The decision is usually priced in advance", "Guidance about future policy changes expectations", "Press conference answers reveal the future path", "Two separate moves, possibly opposite"],
        m: "Markets usually know what the decision will be, so the decision itself is mostly priced. What they don't know is what the bank will do next. The governor's answers in the press conference reveal the future path, which changes expectations, so price often moves more then — sometimes in the opposite direction to the first spike." },
      q: [
        { k: "mcq", q: "Fed statements are released at 2:00 pm New York time. In the US summer that is…", o: ["18:00 SAST", "20:00 SAST", "21:00 SAST", "14:00 SAST"], a: 1, w: "New York summer time is GMT−4; SAST is GMT+2 — six hours ahead." },
        { k: "mcq", q: "Why is the press-conference move often larger than the decision move?", o: ["More traders are awake", "The decision is priced; guidance about the future isn't", "Spreads are tighter", "It isn't"], a: 1, w: "New information about the path." },
        { k: "mcq", q: "The best way to treat the first spike after a decision is…", o: ["Chase it", "As noise until the guidance is known", "Fade it automatically", "Double size"], a: 1, w: "Wait for the second act." }
      ],
      yt: ["FOMC press conference market reaction explained"],
      src: ["cftc", "conv"] }
  ],
  P: { task: "Separate the decision move from the guidance move on five real central bank meetings.",
    steps: [
      "From each bank's own website, write the mandate of the Fed, ECB, BoE and SARB in one line, and the data release each watches most. Then choose five past rate decisions to study (dates are on the banks' sites).",
      "For each of your five decisions, find what was expected beforehand (a news preview or a rate-futures summary). Label each decision hawkish or dovish relative to that expectation — not to the previous rate.",
      "Chart the 1H around each decision and around its press conference separately. Record the size and direction of each move as two events, then count how many had the bigger press-conference move."
    ],
    tools: ["tv"],
    num: [
      { k: "bigger", l: "Meetings where the press-conference move was larger (out of 5)", t: "number" },
      { k: "opposite", l: "Meetings where the two moves went opposite ways", t: "number" }
    ] },
  R: "Send your five paired records and the fraction where the press conference moved price more."
});

COURSE.week({
  n: 14, mod: "202", t: "The Data Calendar",
  aim: "Know which releases matter — and build your own evidence for why you probably shouldn't trade them.",
  L: [
    { id: "w14a", t: "Tier-One Releases",
      big: "The data that moves currencies is the data that moves interest-rate expectations: inflation, jobs, growth and business surveys. If a release can't change rate expectations, it's noise for you.",
      plain: "A doctor watches the vital signs that decide the treatment — pulse, temperature, blood pressure — not every number on the chart.",
      body: [
        "• **Inflation (CPI):** the most direct input into rate decisions.",
        "• **Employment (US non-farm payrolls, unemployment):** the Fed's other mandate. NFP usually comes out on the first Friday of the month at 8:30 am New York time — **14:30 SAST** in the US summer, **15:30** in winter.",
        "• **GDP:** growth, but backward-looking, so usually less market-moving than CPI or jobs.",
        "• **PMIs:** business surveys — early, forward-looking signals of activity.",
        "Every one of them matters through **one channel**: what it does to rate expectations. When you read a release, finish the sentence 'this makes the central bank more / less likely to…'. If you can't, it's noise.",
        "Use an economic calendar (TradingView has one) filtered to high impact, set to SAST."
      ],
      ex: { p: "Name the tier-one releases and explain the single channel through which all of them move currencies.",
        r: ["CPI, employment/NFP, GDP, PMI", "They matter through rate expectations", "Framing: 'makes the bank more/less likely to…'", "Uses a filtered calendar in local time"],
        m: "The big ones are inflation, jobs — especially US non-farm payrolls — GDP, and business surveys like PMIs. They all matter for the same reason: they change what the market expects the central bank to do with interest rates. If I can't say how a release makes the bank more or less likely to move rates, it's noise." },
      q: [
        { k: "mcq", q: "US non-farm payrolls in the US summer is usually released at…", o: ["08:30 SAST", "14:30 SAST", "20:00 SAST", "10:00 SAST"], a: 1, w: "8:30 am New York summer time = 14:30 SAST." },
        { k: "mcq", q: "All tier-one data moves currencies mainly through…", o: ["Retail sentiment", "Rate expectations", "Broker spreads", "Stock prices"], a: 1, w: "One channel." },
        { k: "mcq", q: "Why is GDP often less market-moving than CPI or jobs?", o: ["It's secret", "It's backward-looking and partly anticipated by earlier data", "It's released at night", "It isn't measured"], a: 1, w: "By the time GDP lands, surveys and jobs data have already hinted at it." }
      ],
      yt: ["most important economic indicators forex explained CPI NFP"],
      src: ["cftc", "conv"] },

    { id: "w14b", t: "The Surprise Is the Event",
      big: "Price moves on the gap between the actual number and the consensus forecast. No surprise means no repricing — however dramatic the headline looks.",
      plain: "A weather forecast of rain doesn't make anyone buy umbrellas when it rains. The surprise storm on a forecast sunny day does.",
      body: [
        "Every release has three numbers: **actual**, **forecast** (consensus) and **previous**. The tradeable content is actual versus forecast.",
        "CPI falling from 3.4% to 3.1% sounds dramatic. If 3.1% was the forecast, nothing new happened.",
        "Revisions matter too: a strong headline with a weak revision to last month can net out to nothing.",
        "> A number is never 'good' or 'bad'. It's above, in line with, or below what was expected."
      ],
      ex: { p: "Explain why a big change in a data series can produce no market move, using actual, forecast and previous.",
        r: ["Three numbers: actual, forecast, previous", "Price reacts to actual vs forecast", "In-line data = no surprise = little repricing", "Revisions can offset headlines"],
        m: "Each release has an actual number, a forecast and the previous number. Markets already price the forecast, so they react to the difference between actual and forecast. If inflation drops from 3.4% to 3.1% but 3.1% was expected, there's no surprise and little move. Revisions to last month can also cancel out the headline." },
      q: [
        { k: "mcq", q: "Forecast CPI 3.1%, actual 3.1%, previous 3.4%. Is there a surprise?", o: ["Yes, a big fall", "No — in line with forecast", "Yes, inflation rose", "Can't tell"], a: 1, w: "The change was expected." },
        { k: "mcq", q: "Forecast 180k jobs, actual 240k. This is…", o: ["In line", "A positive surprise", "A negative surprise", "Irrelevant"], a: 1, w: "Above consensus." },
        { k: "mcq", q: "Strong headline, weak revision to last month. The likely net effect…", o: ["Always strongly positive", "Can partly or fully cancel out", "Always negative", "No effect ever"], a: 1, w: "Read the whole release." }
      ],
      yt: ["actual vs forecast economic data market reaction explained"],
      src: ["conv"] },

    { id: "w14c", t: "News as Context, Not Entry",
      big: "Professionals use news to decide which direction has fundamental support, not as a trigger. At the release, spreads widen, slippage jumps, and the first move often reverses.",
      plain: "A pilot checks the weather to plan the route. They don't take off in the middle of the thunderstorm to prove the forecast right.",
      body: [
        "In the seconds around a tier-one release, liquidity providers pull their quotes. Spreads widen by multiples, stops slip badly, and prices can jump several pips between ticks.",
        "The first move is often a knee-jerk reaction that reverses once the full details and revisions are digested.",
        "Three professional policies: **(1)** be flat before tier-one releases; **(2)** hold through them only with wider stops and smaller size; **(3)** use the result as context for the next setups.",
        "The Turtles held through news: daily bars, 2N stops, modest size. Their answer to news risk was structural — position size and stop distance — not prediction.",
        "> Your system document must state a news policy. 'I'll see how I feel' is not a policy."
      ],
      ex: { p: "Explain why trading the release itself is dangerous, and describe the news policy you'll adopt.",
        r: ["Spreads widen, slippage, liquidity withdraws", "First moves often reverse", "News as directional context rather than entry", "States a concrete policy (flat, reduced size/wider stop, etc.)"],
        m: "At the moment of a big release, liquidity providers pull out, spreads blow out and stops slip, and the first move often reverses. So I use news to understand which direction the fundamentals support, not as an entry signal. My policy: no new positions in the 15 minutes before tier-one releases, and any open trade has a stop wide enough to survive the spike at a size that keeps risk within 1%." },
      q: [
        { k: "mcq", q: "What typically happens to spreads at a tier-one release?", o: ["They tighten", "They widen by multiples", "They're fixed", "They disappear"], a: 1, w: "Liquidity is pulled." },
        { k: "mcq", q: "How did the Turtles handle news risk?", o: ["Predicted releases", "Structurally: daily bars, 2N stops, modest size", "Only traded news", "Closed everything daily"], a: 1, w: "Size and stops, not forecasts." },
        { k: "mcq", q: "Which is a real news policy?", o: ["I'll see how I feel", "Flat 15 minutes before tier-one releases; existing trades keep full stops within 1% risk", "Trade every release", "Ignore the calendar"], a: 1, w: "Specific and checkable." }
      ],
      yt: ["trading the news risks spreads slippage explained"],
      src: ["turtle", "design"] }
  ],
  P: { task: "Measure how often the first move after CPI survives to the daily close.",
    steps: [
      "From an economic calendar, list next month's tier-one releases for USD and EUR (CPI, jobs, GDP, PMI) with SAST times. Then pick ten past CPI releases, USD and EUR, to study.",
      "For all ten: record the surprise (actual − forecast), the 15m move in the first hour, and the daily close relative to the pre-release price.",
      "Compute how often the first move survived to the daily close. Write your news policy with that number as its justification."
    ],
    tools: ["tv"],
    num: [
      { k: "persist", l: "Releases where the first-hour direction held to the daily close (%)", t: "number" },
      { k: "policy", l: "Your news policy in one line", t: "text" }
    ] },
  R: "Send the persistence percentage and your news policy, justified with your own number."
});

COURSE.week({
  n: 15, mod: "202", t: "Correlation and Positioning",
  aim: "Find the risk concept that has been hiding inside fundamentals all along.",
  gate: "g3",
  L: [
    { id: "w15a", t: "Risk-On and Risk-Off",
      big: "When fear rises, money runs to perceived safety — the US dollar, the yen, the Swiss franc — and away from riskier currencies like the Australian and New Zealand dollars and emerging-market currencies such as the rand.",
      plain: "In a storm, people leave the beach for the shelter. It doesn't matter how nice the beach is — they run for the roof.",
      body: [
        "**Risk-on:** calm, growing markets. Capital seeks yield: AUD, NZD and emerging currencies (including ZAR) tend to strengthen.",
        "**Risk-off:** fear. Capital seeks safety: USD, JPY and CHF tend to strengthen; carry trades unwind (Unit 12).",
        "For you, in Cape Town, this is personal: **USD/ZAR tends to rise in global panics** — the rand is treated as a risk currency.",
        "The relationship holds until the shock originates in the safe haven itself (for example a US-specific crisis can hit the dollar), which is exactly when blind reliance on it hurts most.",
        "Gauges to glance at: stock indices, volatility indices, gold, and the yen crosses."
      ],
      ex: { p: "Explain risk-on and risk-off and how they affect USD/ZAR — and when the pattern can break.",
        r: ["Risk-on → yield/risk currencies strengthen", "Risk-off → USD, JPY, CHF strengthen", "Rand is a risk currency → USD/ZAR rises in panics", "Can break when the shock starts in the safe haven"],
        m: "In calm markets investors chase yield, so currencies like the rand, AUD and NZD tend to strengthen. When fear hits, they run to safety in the dollar, yen and franc, so USD/ZAR usually rises in a global panic. The pattern can break when the crisis starts in a safe-haven country itself." },
      q: [
        { k: "mcq", q: "In a global risk-off panic, USD/ZAR usually…", o: ["Falls (rand strengthens)", "Rises (rand weakens)", "Stays flat", "Is unaffected"], a: 1, w: "The rand trades as a risk currency." },
        { k: "mcq", q: "Which is typically a safe-haven currency?", o: ["AUD", "JPY", "NZD", "ZAR"], a: 1, w: "Yen, franc and dollar." },
        { k: "mcq", q: "When is relying on safe-haven behaviour most dangerous?", o: ["In calm markets", "When the shock originates in the safe haven itself", "On Fridays", "Never"], a: 1, w: "The pattern can invert." }
      ],
      yt: ["risk on risk off currencies explained", "safe haven currencies explained"],
      src: ["conv"] },

    { id: "w15b", t: "Correlated Positions Are One Trade",
      big: "Two positions that move together are one bet at double size. Long EUR/USD plus long GBP/USD is a single short-dollar trade — and your careful 1% rule quietly becomes 2%.",
      plain: "Buying umbrellas from two different shops isn't diversification. If it doesn't rain, both purchases disappoint you together.",
      dia: "correlation",
      body: [
        "**Correlation** runs from −1 (always opposite) through 0 (unrelated) to +1 (always together). EUR/USD and GBP/USD often sit well above +0.7.",
        "If two positions are highly correlated, their losses arrive together. Two 1% trades become one 2% trade on the same idea.",
        "The Turtles capped this explicitly, in **units** (a unit ≈ 1N ≈ 1% of equity):",
        "• 4 units in any single market",
        "• 6 units across closely correlated markets",
        "• 10 units across loosely correlated markets",
        "• 12 units in one direction, long or short",
        "Your version: a written cap on **total** risk across correlated positions (for example, no more than 1.5% combined on the same currency exposure). The correlation matrix you build this week tells you which pairs count as 'the same exposure'."
      ],
      ex: { p: "Explain why two correlated positions are really one trade, and describe the Turtles' limits and your own rule.",
        r: ["Correlation measures co-movement (−1 to +1)", "Highly correlated positions lose together → combined risk", "Turtle limits: 4 single, 6 closely correlated, 10 loosely, 12 one direction", "States a personal cap on combined correlated risk"],
        m: "If two pairs usually move together, a position in each is really one bet at double the size — long EUR/USD and long GBP/USD are both short the dollar, so 1% plus 1% is effectively a 2% trade. The Turtles capped units: 4 in one market, 6 across closely correlated markets, 10 across loosely correlated ones, and 12 in one direction. My rule: no more than 1.5% total risk on positions that share the same currency exposure." },
      q: [
        { k: "mcq", q: "Long EUR/USD and long GBP/USD at 1% each (correlation about 0.8). Your real exposure is closer to…", o: ["Two independent 1% bets", "One roughly 2% short-dollar bet", "Zero, they hedge", "0.5%"], a: 1, w: "They win and lose together." },
        { k: "mcq", q: "The Turtles' unit limit across closely correlated markets was…", o: ["4", "6", "10", "12"], a: 1, w: "4 single, 6 closely correlated, 10 loosely, 12 one direction." },
        { k: "mcq", q: "A correlation of −0.9 between two pairs means…", o: ["They're unrelated", "They usually move in opposite directions", "They always move together", "One is broken"], a: 1, w: "Strong negative correlation." }
      ],
      yt: ["currency correlation explained risk", "correlation coefficient explained intuition"],
      src: ["turtle", "math"] },

    { id: "w15c", t: "Commitment of Traders",
      big: "The weekly COT report shows how large speculators are positioned in currency futures. Extremes matter because a crowded trade must unwind one day — it's context for risk, not a timing signal.",
      plain: "When everyone at the party is standing on one side of the boat, you don't know when it'll tip — but you know which way it will.",
      body: [
        "The US **CFTC** publishes the Commitment of Traders report every Friday at 3:30 pm New York time, showing positions as of the **previous Tuesday** — so it's always a few days old.",
        "Watch **non-commercial** (large speculator) net positions in currency futures. When they sit at multi-year extremes, the trade is crowded.",
        "Crowded trades can stay crowded for a long time. Positioning tells you where the pain would be if the story changes — not when it will change.",
        "Use it as a **risk flag**: in a trade aligned with an extreme crowd, consider a smaller size or tighter management, because the exits are narrow."
      ],
      ex: { p: "Explain what the COT report shows, why positioning extremes matter, and why COT is not a timing tool.",
        r: ["Weekly CFTC report, released Friday with Tuesday's data", "Large speculators' net positioning in currency futures", "Extremes = crowded trades that eventually unwind violently", "Context/risk flag, not a timing signal (can stay crowded a long time)"],
        m: "The COT report is published by the CFTC every Friday and shows futures positions as of the previous Tuesday. I look at how large speculators are positioned in each currency. When positioning is extreme, the trade is crowded and could unwind sharply if the story changes. But crowded trades can stay crowded for months, so COT tells me where the risk is, not when to trade." },
      q: [
        { k: "mcq", q: "COT data released on a Friday reflects positions as of…", o: ["That Friday", "The previous Tuesday", "The previous month-end", "Real time"], a: 1, w: "There's a built-in lag." },
        { k: "mcq", q: "Extreme speculative positioning is best used as…", o: ["An entry trigger", "A risk flag about crowding", "A guarantee of reversal", "Irrelevant"], a: 1, w: "Context, not timing." },
        { k: "mcq", q: "Why can't you time reversals with COT extremes?", o: ["The data is fake", "Crowded trades can stay crowded for a long time", "It's only about stocks", "It's released daily"], a: 1, w: "Extremes can persist." }
      ],
      yt: ["commitment of traders report explained forex"],
      src: ["cftc"] }
  ],
  P: { task: "Build your correlation matrix and write your correlation rule — then sit Gate 3.",
    steps: [
      "Export or note 12 months of daily closes for EUR/USD, GBP/USD, AUD/USD, USD/JPY, USD/CAD and USD/ZAR, and compute daily returns. Find one clear risk-off day and note how each pair moved.",
      "Compute the correlation matrix (spreadsheet CORREL or a small Java program). Mark every pair above +0.7 or below −0.7. Write your correlation rule: which pairs count as the same exposure, and your maximum combined risk on them.",
      "Read the latest Commitment of Traders data for euro and yen futures (the CFTC site or a summary). Note where large speculators' net position sits in its one-year range, and whether either looks crowded."
    ],
    tools: ["tv"],
    num: [
      { k: "highest", l: "Most correlated pair of pairs (e.g. EURUSD–GBPUSD 0.82)", t: "text" },
      { k: "cap", l: "Your maximum combined risk on correlated positions (%)", t: "number" }
    ] },
  R: "Send your matrix and rule. Then sit Gate 3: a full top-down bias for one pair — including what would prove you wrong."
});
