/* ============================================================
   GATES — five module exams at 80%, plus the final audit.
   Sections: chart (auto-generated chart reading), gen (randomised
   numeric), mcq (fixed), evidence (checked against the Journal),
   written (tutor-marked against a rubric; self-marked if the tutor
   is unavailable).
   ============================================================ */

/* ---------- Randomised numeric generators (used by Gate 2 and Labs → Math Drills) ---------- */
COURSE.GEN = (function () {
  const R = function (a, b, step) { const n = Math.round((a + Math.random() * (b - a)) / step) * step; return +n.toFixed(6); };
  const pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  const fmt = function (x, d) { return Number(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  return {
    sizeUSD: function () {
      const acct = pick([2000, 5000, 8000, 10000, 15000, 25000, 40000]);
      const risk = pick([0.25, 0.5, 1]);
      const stop = R(12, 80, 1);
      const lots = acct * risk / 100 / (stop * 10);
      return { k: "num", t: "Position size (USD-quoted)", q: "Account $" + fmt(acct, 0) + ", risk " + risk + "%, EUR/USD stop " + stop + " pips. How many lots? (3 decimals, before rounding down)",
        a: +lots.toFixed(3), tol: 0.0015, u: "lots", w: "$" + fmt(acct * risk / 100, 2) + " ÷ (" + stop + " × $10) = " + lots.toFixed(3) + " lots." };
    },
    sizeJPY: function () {
      const acct = pick([5000, 10000, 20000, 30000]);
      const risk = pick([0.5, 1]);
      const px = R(135, 160, 0.5);
      const stop = R(20, 90, 1);
      const pv = 1000 / px;
      const lots = acct * risk / 100 / (stop * pv);
      return { k: "num", t: "Position size (JPY-quoted)", q: "Account $" + fmt(acct, 0) + ", risk " + risk + "%, USD/JPY at " + px.toFixed(2) + ", stop " + stop + " pips. How many lots? (3 decimals)",
        a: +lots.toFixed(3), tol: 0.002, u: "lots", w: "Pip value per lot = ¥1,000 ÷ " + px.toFixed(2) + " = $" + pv.toFixed(3) + ". $" + fmt(acct * risk / 100, 2) + " ÷ (" + stop + " × $" + pv.toFixed(3) + ") = " + lots.toFixed(3) + " lots." };
    },
    pipJPY: function () {
      const px = R(120, 165, 0.25);
      const lots = pick([0.1, 0.5, 1, 2]);
      const v = lots * 1000 / px;
      return { k: "num", t: "Pip value conversion", q: "USD/JPY at " + px.toFixed(2) + ". What is one pip worth on " + lots + " lots, in USD? (2 decimals)",
        a: +v.toFixed(2), tol: 0.011, u: "USD", w: "0.01 × " + fmt(lots * 100000, 0) + " = ¥" + fmt(lots * 1000, 0) + "; ÷ " + px.toFixed(2) + " = $" + v.toFixed(2) + "." };
    },
    expectancy: function () {
      const w = R(25, 60, 1), aw = R(0.8, 4, 0.1), al = R(0.8, 1.2, 0.1);
      const e = w / 100 * aw - (1 - w / 100) * al;
      return { k: "num", t: "Expectancy", q: "Win rate " + w + "%, average win " + aw.toFixed(1) + "R, average loss " + al.toFixed(1) + "R. Expectancy in R? (2 decimals)",
        a: +e.toFixed(2), tol: 0.011, u: "R", w: (w / 100).toFixed(2) + " × " + aw.toFixed(1) + " − " + (1 - w / 100).toFixed(2) + " × " + al.toFixed(1) + " = " + e.toFixed(2) + "R." };
    },
    breakeven: function () {
      const r = pick([1.2, 1.5, 1.8, 2, 2.5, 3, 4, 5]);
      const b = 100 / (1 + r);
      return { k: "num", t: "Break-even win rate", q: "Average win " + r + "R, average loss 1R. Break-even win rate? (%, 1 decimal)",
        a: +b.toFixed(1), tol: 0.11, u: "%", w: "1 ÷ (1 + " + r + ") = " + b.toFixed(1) + "%." };
    },
    recovery: function () {
      const l = pick([15, 20, 30, 35, 40, 45, 60, 70]);
      const g = l / (100 - l) * 100;
      return { k: "num", t: "Recovery", q: "What gain is needed to recover from a " + l + "% drawdown? (%, 1 decimal)",
        a: +g.toFixed(1), tol: 0.11, u: "%", w: l / 100 + " ÷ " + (1 - l / 100).toFixed(2) + " = " + g.toFixed(1) + "%." };
    },
    nUpdate: function () {
      const pn = R(40, 120, 1), tr = R(20, 200, 1);
      const n = (19 * pn + tr) / 20;
      return { k: "num", t: "N update", q: "Previous N = " + pn + " pips, today's True Range = " + tr + " pips. New N? (2 decimals)",
        a: +n.toFixed(2), tol: 0.011, u: "pips", w: "(19 × " + pn + " + " + tr + ") ÷ 20 = " + n.toFixed(2) + "." };
    },
    unit: function () {
      const acct = pick([10000, 25000, 50000, 100000]);
      const n = R(40, 140, 1);
      const per = pick([0.5, 1]);
      const u = acct * per / 100 / (n * 10);
      return { k: "num", t: "Turtle unit", q: "Account $" + fmt(acct, 0) + ", EUR/USD N = " + n + " pips, $10 per pip per lot. Unit size at " + per + "% per N, in lots? (3 decimals)",
        a: +u.toFixed(3), tol: 0.0015, u: "lots", w: "$" + fmt(acct * per / 100, 2) + " ÷ (" + n + " × $10) = " + u.toFixed(3) + " lots." };
    },
    rLong: function () {
      const e = R(1.05, 1.35, 0.0001), s = R(15, 60, 1);
      const pips = Math.round(R(-1.2, 4.5, 0.1) * s);
      const x = pips / s;
      const stop = e - s / 10000, exit = e + pips / 10000;
      return { k: "num", t: "Outcome in R", q: "Long EUR/USD at " + e.toFixed(4) + ", stop " + stop.toFixed(4) + ", exit " + exit.toFixed(4) + ". Outcome in R? (2 decimals)",
        a: +x.toFixed(2), tol: 0.011, u: "R", w: "Risk " + s + " pips; result " + pips + " pips; " + pips + " ÷ " + s + " = " + x.toFixed(2) + "R." };
    },
    rShortSlip: function () {
      const e = R(1.2, 1.4, 0.0001), s = R(20, 50, 1), slip = R(3, 25, 1);
      const r = -(s + slip) / s;
      return { k: "num", t: "Outcome with slippage", q: "Short GBP/USD at " + e.toFixed(4) + " with the stop " + s + " pips away, but it fills " + slip + " pips beyond the stop. Outcome in R? (2 decimals)",
        a: +r.toFixed(2), tol: 0.011, u: "R", w: "−(" + s + " + " + slip + ") ÷ " + s + " = " + r.toFixed(2) + "R." };
    }
  };
})();

COURSE.exams.g1 = {
  id: "g1", mod: "102", week: 8, title: "Gate 1 — Read a Chart Cold", pass: 80,
  intro: "Three charts you've never seen, generated fresh, with no indicators. For each: name the state by the mechanical swing definition (N = 3), click the most recent confirmed swing high and swing low, and say which close would change the character. Then four concept questions and one written description.",
  sections: [
    { kind: "chart", n: 3 },
    { kind: "mcq", q: [
      { q: "Price wicks above the last swing high and closes back inside within two candles, with no follow-through. Most likely…", o: ["A genuine break of structure", "A liquidity sweep", "A fair value gap", "A change of character"], a: 1, w: "Wick beyond, close back inside, fast return." },
      { q: "A bullish fair value gap exists when…", o: ["Candle 1's high is below candle 3's low", "Candle 1's low is above candle 3's high", "Candle 2 is a doji", "Three candles close higher"], a: 0, w: "The gap between candle 1's high and candle 3's low." },
      { q: "Why do levels tend to weaken with repeated tests?", o: ["Traders forget them", "Each test consumes the resting orders", "Volatility always falls", "They don't"], a: 1, w: "Inventory gets used up." },
      { q: "In a downtrend, a change of character is…", o: ["A close below the last lower low", "A close above the most recent lower high", "Any green candle", "A new 20-day low"], a: 1, w: "The first break against the downtrend." }
    ] },
    { kind: "written", q: [
      { id: "g1w", marks: 4, chartRef: 0,
        q: "Describe Chart 1 as you would to a colleague: its state, where the liquidity sits above and below price, and exactly what would change its character.",
        rubric: ["States the correct market state for Chart 1", "Places buy-side liquidity just above the most recent swing high", "Places sell-side liquidity just below the most recent swing low", "States the correct change-of-character condition (or that none applies in a range)"],
        model: "Use the answer key shown after the chart section." }
    ] }
  ]
};

COURSE.exams.g2 = {
  id: "g2", mod: "201", week: 11, title: "Gate 2 — The Math Gate", pass: 80,
  intro: "The hard one. Ten fresh calculations (new numbers every attempt), four concept questions, and one written answer built from your own Monte Carlo. No system building and no demo trading until this is passed.",
  sections: [
    { kind: "gen", items: ["sizeUSD", "sizeJPY", "pipJPY", "expectancy", "breakeven", "recovery", "nUpdate", "unit", "rLong", "rShortSlip"] },
    { kind: "mcq", q: [
      { q: "A system with a 40% win rate takes 200 trades. The chance of at least one run of 7+ losses is about…", o: ["5%", "25%", "50%", "90%"], a: 3, w: "About 91%." },
      { q: "The worst drawdown in 1,000 simulated runs exceeds your backtest's worst because…", o: ["Simulations are pessimistic by design", "Your backtest is one ordering of outcomes; the simulation explores thousands", "Backtests exclude losses", "It doesn't"], a: 1, w: "One path versus the map of paths." },
      { q: "The dial that most directly controls your risk of ruin is…", o: ["Win rate", "Position size", "Timeframe", "Broker"], a: 1, w: "Size is always your choice." },
      { q: "The Turtles' drawdown rule was…", o: ["Double size to recover", "Trade as if the account were 20% smaller for each 10% drawdown", "Stop for a month after any loss", "Switch to System 2"], a: 1, w: "Risk shrinks faster than the account." }
    ] },
    { kind: "written", q: [
      { id: "g2w", marks: 6, usesNumbers: 11,
        q: "Using your own Monte Carlo numbers: (a) compare your risk of a 30% drawdown at 1% and at 2% risk, (b) explain why the worst simulated drawdown is deeper than anything in your backtest, and (c) state the losing streak your plan must be built to survive and how you arrived at it.",
        rubric: ["Quotes own simulated figures for 1% and 2% risk", "Correctly states that risk rises sharply with size", "Explains backtest = one path vs many simulated orderings", "Links deeper simulated drawdowns to the tails of that distribution", "States a specific streak length", "Justifies it from own win rate (Streaks lab / probability)"],
        model: "At 1% risk my simulation showed almost no chance of a 30% drawdown (well under 1%); at 2% it jumped to about 20%. My backtest is just one ordering of my trades — the simulation reshuffles them thousands of times, so it finds the unlucky orderings my backtest happened to avoid. At my 40% win rate the Streaks lab says the median longest losing streak over 200 trades is about 9 and the 90th percentile about 12, so my plan is built to survive 12 losses in a row." }
    ] }
  ]
};

COURSE.exams.g3 = {
  id: "g3", mod: "202", week: 15, title: "Gate 3 — Top-Down Bias", pass: 80,
  intro: "Eight concept questions, then the real test: a one-page fundamental and structural bias for a pair of your choice — including exactly what would prove you wrong.",
  sections: [
    { kind: "mcq", q: [
      { q: "Holding a higher-yielding currency funded by a lower-yielding one earns…", o: ["Nothing", "The interest differential (carry)", "The spread", "Commission rebates"], a: 1, w: "Carry." },
      { q: "A central bank hikes 0.25% when 0.50% was priced. The currency most likely…", o: ["Rises strongly", "Falls — a dovish surprise", "Doesn't move", "Moves randomly"], a: 1, w: "Relative to expectations, it's dovish." },
      { q: "The UK 2-year yield rises relative to the US 2-year. GBP/USD tends to…", o: ["Rise", "Fall", "Stay flat", "Gap"], a: 0, w: "The differential moved in the pound's favour." },
      { q: "The Fed's mandate is…", o: ["Price stability only", "Maximum employment and stable prices", "A strong dollar", "Growth"], a: 1, w: "The dual mandate." },
      { q: "The press conference often moves price more than the decision because…", o: ["More people watch", "The decision is priced; guidance about the future isn't", "Spreads tighten", "It's longer"], a: 1, w: "New information." },
      { q: "Actual CPI equals the forecast. The market reaction is typically…", o: ["Huge", "Small — no surprise", "Always negative", "Always positive"], a: 1, w: "No surprise, little repricing." },
      { q: "In a global risk-off panic, USD/ZAR usually…", o: ["Falls", "Rises", "Is unaffected", "Freezes"], a: 1, w: "The rand weakens." },
      { q: "COT positioning extremes are best used as…", o: ["Entry triggers", "A risk flag about crowding", "Guaranteed reversals", "Irrelevant"], a: 1, w: "Context, not timing." }
    ] },
    { kind: "written", q: [
      { id: "g3w", marks: 12,
        q: "Write a one-page bias for one major pair (say which, and today's date). Include: (1) the 2-year rate differential and its direction, (2) each central bank's stance versus what's priced, (3) calendar risk in the next two weeks, (4) COT positioning, (5) the structural picture on your context timeframe, and (6) — mandatory — what specific evidence would falsify this bias.",
        rubric: ["Rate differential stated with direction", "Differential linked correctly to the pair's direction", "Central bank stance described relative to market pricing (not absolute)", "Both central banks addressed", "Specific upcoming calendar risks named", "Explains how those releases could shift expectations", "COT positioning described", "Positioning interpreted as crowding/risk context, not timing", "Structural state on a named timeframe (swing definition)", "Key levels identified", "Falsification: specific, observable evidence that would prove the bias wrong", "Bias is internally consistent (fundamentals and structure reconciled or conflict acknowledged)"],
        model: "A strong answer names the pair and date, gives the 2-year spread and whether it's widening or narrowing, describes each bank relative to what futures price, lists the specific releases due, reads COT as crowding context, states the structure on the Daily by the swing definition with key levels, and ends with a concrete falsifier such as 'a Daily close above the last lower high at X, or a US CPI surprise above consensus'." }
    ] }
  ]
};

COURSE.exams.g4 = {
  id: "g4", mod: "301", week: 18, title: "Gate 4 — The Demo Unlock", pass: 80,
  intro: "Evidence first: your Journal is checked automatically for 100+ honest backtest trades, positive expectancy, and two separate test periods. Then six concept questions and a written account of when your system loses. Passing unlocks demo trading.",
  sections: [
    { kind: "evidence", checks: [
      { id: "bt100", marks: 2, label: "At least 100 backtest trades in the Journal", test: "btCount", min: 100 },
      { id: "btPos", marks: 2, label: "Positive expectancy across those backtest trades", test: "btExpectancy", min: 0 },
      { id: "twoSets", marks: 2, label: "At least two test sets (tags) with 30+ trades each, both positive", test: "twoSets" }
    ] },
    { kind: "mcq", q: [
      { q: "An edge is best described as…", o: ["A reliable forecast", "A repeatable condition where outcomes are skewed in your favour over many trades", "A high win rate", "A secret indicator"], a: 1, w: "Statistical, not predictive." },
      { q: "With 100 trades, the 95% uncertainty on a win rate is about…", o: ["±1 point", "±3 points", "±10 points", "±30 points"], a: 2, w: "≈ 1.96 × √(0.25/100)." },
      { q: "Which is most likely curve-fitting?", o: ["Removing thin-session trades after measuring sweeps", "Testing ten lookback lengths and keeping the best", "Adding a news policy", "Capping correlated risk"], a: 1, w: "Optimising until it looks good." },
      { q: "An honest backtest…", o: ["Scrolls back to find clean setups", "Replays bar by bar from a blind start, deciding before each candle", "Uses remembered trades", "Only counts winners"], a: 1, w: "Decide before you see." },
      { q: "A 12-trade slice shows +1.2R expectancy. It is…", o: ["Proven", "A hypothesis to test on new data", "A reason to double size", "Irrelevant"], a: 1, w: "Too small to trust." },
      { q: "A top-3 share of 150% means…", o: ["The three best trades earned more than the whole net profit", "Win rate is 150%", "An error", "Losses are small"], a: 0, w: "Everything else netted a loss." }
    ] },
    { kind: "written", q: [
      { id: "g4w", marks: 8,
        q: "Name the market conditions in which your system loses money, with evidence from your Journal (segments, sample sizes, expectancy), and explain what your system does about them — filter, reduce size, or accept the cost — and why.",
        rubric: ["Names specific losing conditions (e.g., session, state, pair)", "Cites segment expectancy figures", "Cites sample sizes and acknowledges small-sample limits", "Explains a plausible mechanism for why the system loses there", "States the system's response (filter/reduce/accept)", "Justifies the response mechanically, not by optimisation", "Notes the cost of the response (fewer trades etc.)", "Consistent with the written system document"],
        model: "For example: 'My system loses in ranges (Unit 5 definition): 38 trades, −0.31R, versus +0.44R over 71 trend trades. Breakout entries get swept in ranges. I accept the cost rather than add a range filter, because my filter test on v1-A didn't hold on v2-B and cut 40% of trades.'" }
    ] }
  ]
};

COURSE.exams.g5 = {
  id: "g5", mod: "302", week: 21, title: "Gate 5 — The Adherence Floor", pass: 80,
  intro: "Real money is gated behind process, not profit. Your Journal is checked for 20+ graded demo trades at 90%+ adherence. Then six questions and a written description of your brakes.",
  sections: [
    { kind: "evidence", checks: [
      { id: "demo20", marks: 2, label: "At least 20 demo trades in the Journal", test: "demoCount", min: 20 },
      { id: "graded", marks: 2, label: "Every demo trade has an execution grade", test: "demoGraded" },
      { id: "adh90", marks: 4, label: "Rule adherence of 90% or more across demo trades", test: "demoAdherence", min: 0.9 }
    ] },
    { kind: "mcq", q: [
      { q: "Under stress, the reliable fix for rule-breaking is…", o: ["More willpower", "Pre-committed decisions executed mechanically", "Trading more", "Ignoring the feeling"], a: 1, w: "Procedure." },
      { q: "One checklist box is unticked but the setup looks great. You…", o: ["Take it smaller", "Don't take it", "Take it and tick later", "Ask the tutor"], a: 1, w: "No exceptions." },
      { q: "Which in-trade action is allowed?", o: ["Widening a stop that's close", "Closing early out of nerves", "A breakeven move at a pre-defined level", "Adding outside the rules"], a: 2, w: "Only pre-defined actions." },
      { q: "The failure spiral is last clearly recognisable at…", o: ["The loss", "The urge to recover", "The bent rule", "The bigger loss"], a: 1, w: "Stage 2." },
      { q: "Which is more serious?", o: ["A losing week within the rules", "A circuit-breaker breach", "Equal", "Neither"], a: 1, w: "Variance vs disabled brakes." },
      { q: "A trade broke a rule and won 3R. Its grade is…", o: ["A", "B", "C", "Depends on profit"], a: 2, w: "Process only." }
    ] },
    { kind: "written", q: [
      { id: "g5w", marks: 6,
        q: "Describe your personal stage-2 tell, your written circuit breakers (with numbers), and your chart-stress protocol — and what your watched versus unwatched data showed.",
        rubric: ["Names a specific, personal stage-2 tell", "Lists circuit breakers with numbers", "Breakers are automatic, not discretionary", "Describes the chart-stress protocol steps", "Reports watched vs unwatched figures from own Journal", "Draws an honest conclusion from those figures"],
        model: "My tell is refreshing my balance and opening new charts right after a loss. Breakers: −2R daily, −5R weekly, three losses in a row ends the day, and a drawdown beyond my Monte Carlo 95th percentile triggers a review. Protocol: checklist, orders, alerts, close the platform, leave for an hour. Watched trades: −0.12R over 11; unwatched: +0.31R over 14 — small samples, but consistent with my weakness." }
    ] }
  ]
};

COURSE.exams.final = {
  id: "final", mod: "402", week: 26, title: "Final — The Four-Month Audit", pass: 80,
  intro: "Four written sections, marked by the tutor against your own Journal numbers (inserted automatically). This is the graduation audit — honest beats impressive.",
  sections: [
    { kind: "written", q: [
      { id: "fa1", marks: 5, withStats: true,
        q: "Your numbers: state your four-month expectancy, adherence, maximum drawdown and trade count by source (backtest, demo, live), and what they honestly mean.",
        rubric: ["Quotes expectancy by source", "Quotes adherence", "Quotes maximum drawdown", "Interprets sample sizes honestly", "Draws a sober conclusion"], model: "" },
      { id: "fa2", marks: 5,
        q: "Your style verdict, with the evidence from the four diagnostic variables, and how System v3 reflects it.",
        rubric: ["States a style", "Screen time evidence", "Emotion/holding-time evidence", "Grade/timeframe evidence", "Links to v3 components"], model: "" },
      { id: "fa3", marks: 5,
        q: "What you did right and what you did wrong over four months — with Journal evidence for each — and what you now know that you couldn't have known on Day 1.",
        rubric: ["At least two evidenced strengths", "At least two evidenced mistakes", "Specific Journal references", "Genuine new understanding named", "No excuses or blame-shifting"], model: "" },
      { id: "fa4", marks: 5,
        q: "Your scaling plan and your plan for the next six months: risk ceiling, ladder position, withdrawal policy, review cadence, rebuild trigger, and one skill to deepen.",
        rubric: ["Fixed 1% ceiling; scaling by capital not %", "Ladder position and rules", "Withdrawal policy with proportion/frequency/trigger", "Review cadence and a specific rebuild trigger", "A concrete development goal"], model: "" }
    ] }
  ]
};
