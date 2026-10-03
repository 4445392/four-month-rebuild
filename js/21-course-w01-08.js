/* ============================================================
   TRD 101 · Market Mechanics (Units 1–4)
   TRD 102 · Price Structure (Units 5–8)
   ============================================================ */

COURSE.week({
  n: 1, mod: "101", t: "Ground Zero",
  aim: "Rebuild the vocabulary from nothing. Every risk calculation you'll ever make depends on these units being automatic.",
  L: [
    { id: "w01a", t: "What a Forex Trade Actually Is",
      big: "A currency pair is a ratio between two economies. Trading EUR/USD means buying one currency and selling the other at the same moment — so every move has two possible causes.",
      plain: "It's a seesaw with the euro on one side and the dollar on the other. The seesaw tips up if the euro gets heavier — or if the dollar gets lighter. From the middle you can't tell which; you have to look at each side.",
      dia: "seesaw",
      body: [
        "EUR/USD = 1.0850 means one euro costs 1.0850 US dollars. The first currency is the **base** (EUR); the second is the **quote** (USD). A price always says: how many units of the quote currency buy one unit of the base.",
        "**Long** EUR/USD = buy euros, sell dollars. You profit if the euro strengthens against the dollar. **Short** is the reverse — and in forex, shorting is exactly as easy as buying, because every trade is both at once.",
        "Because a pair is a ratio, a rise in EUR/USD can come from euro strength, dollar weakness, or both. It matters: if the dollar is falling against everything, EUR/USD, GBP/USD and AUD/USD all rise together. That's one dollar story, not three opportunities.",
        "The quick check is the **dollar index (DXY)**, which measures the dollar against a basket of major currencies. DXY falling while EUR/USD rises → mostly a dollar story. DXY flat while EUR/USD rises → a euro story.",
        "**Majors** have USD on one side (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD). **Crosses** don't (EUR/GBP, GBP/JPY, AUD/NZD). In your earlier notes you flagged AUD/NZD, NZD/USD and USD/CAD as unusually respectful of structure — in Unit 7 you'll test that belief with data instead of keeping it as a feeling."
      ],
      ex: { p: "Explain to someone who has never traded why EUR/USD going up doesn't necessarily mean 'the euro is strong'. Use the seesaw.",
        r: ["A pair is a ratio of two currencies (base over quote)", "A long trade buys the base and sells the quote simultaneously", "A rise can come from base strength OR quote weakness", "You check the other side (e.g., DXY) to know which"],
        m: "A currency pair is a seesaw: the price is how many dollars one euro costs. If EUR/USD rises, the euro side got heavier or the dollar side got lighter — the price alone can't say which. To find out, look at the dollar against other currencies, for example the dollar index. If the dollar is falling everywhere, it's a dollar story, not a euro one." },
      q: [
        { k: "mcq", q: "In GBP/JPY, which currency is the base?", o: ["GBP", "JPY", "USD", "It depends on the broker"], a: 0, w: "The first currency in the pair is always the base." },
        { k: "mcq", q: "EUR/USD, GBP/USD and AUD/USD all rise about 1% today while DXY falls about 1%. The most likely story is…", o: ["Three independent opportunities", "One dollar-weakness story", "European strength", "A data error"], a: 1, w: "When every USD pair moves together with DXY, the common factor is the dollar." },
        { k: "mcq", q: "You short USD/CAD. You profit if…", o: ["USD strengthens against CAD", "CAD strengthens against USD", "Both weaken equally", "Nothing moves"], a: 1, w: "Short USD/CAD = sell dollars, buy Canadian dollars. You gain if CAD strengthens (the price falls)." }
      ],
      yt: ["how currency pairs work base and quote currency explained simply", "what is the dollar index DXY explained"],
      src: ["conv", "claude"] },

    { id: "w01b", t: "The Units: Pips, Lots, Leverage, Margin",
      big: "Before you can control risk you need its units. A pip is the standard price step, a lot is how much currency you control, and pip value — money per pip — is what turns distance on a chart into money in your account.",
      plain: "A ruler is useless until you know whether it measures centimetres or kilometres. Pips are the marks on the ruler; lot size decides whether each mark is worth ten cents or ten dollars.",
      dia: "pipValue",
      body: [
        "For most pairs a **pip** is the fourth decimal: EUR/USD 1.0850 → 1.0851 is one pip. For JPY pairs it's the second decimal: USD/JPY 150.25 → 150.26 is one pip. Brokers show an extra digit (a 'point' or 'pipette', a tenth of a pip) — don't let it confuse your counting.",
        "A **lot** is a contract size: standard = 100,000 units of the base; mini = 10,000; micro = 1,000. On most platforms 0.01 lots = one micro lot.",
        "**Pip value** — derive it, don't memorise it:",
        "= Pip value (in the quote currency) = pip size × units",
        "EUR/USD, one standard lot: 0.0001 × 100,000 = 10 units of the quote currency (USD) → **$10 per pip**.",
        "When the quote currency isn't your account currency, convert. USD/JPY, one standard lot: 0.01 × 100,000 = ¥1,000 per pip; at 150.00 that's ¥1,000 ÷ 150 = **$6.67**. USD/CAD at 1.3500: 0.0001 × 100,000 = C$10 → C$10 ÷ 1.35 = **$7.41**.",
        "**Leverage** lets you control a big position with a small deposit; **margin** is that deposit. At 30:1 (the EU retail cap on major pairs since 2018), a $100,000 position needs about $3,333 of margin.",
        "> Leverage doesn't change the risk of a trade — position size and stop distance do. Leverage only changes how big a position you're *allowed* to open. That is how accounts blow up: high leverage permits sizes that your risk rules never should.",
        "**Free margin** = equity − used margin. If it runs out, the broker closes positions for you (margin call / stop-out)."
      ],
      ex: { p: "Explain, step by step, how you'd work out what one pip is worth on 0.10 lots of GBP/JPY in US dollars — without a calculator app.",
        r: ["Pip size for a JPY pair is 0.01", "0.10 lots = 10,000 units of the base", "Pip value = 0.01 × 10,000 = ¥100 per pip", "Convert yen to dollars by dividing by USD/JPY"],
        m: "GBP/JPY is quoted in yen, so a pip is 0.01. 0.10 lots is 10,000 pounds. Pip value in yen is 0.01 × 10,000 = ¥100. To get dollars, divide by the USD/JPY rate — at 150 that's about $0.67 per pip." },
      q: [
        { k: "num", q: "What is one pip worth on 0.5 standard lots of EUR/USD, in USD?", a: 5, tol: 0.001, u: "USD", w: "0.0001 × 50,000 = 5 USD per pip." },
        { k: "num", q: "USD/JPY is at 125.00. What is one pip worth on 1 standard lot, in USD? (2 decimals)", a: 8, tol: 0.01, u: "USD", w: "0.01 × 100,000 = ¥1,000; ¥1,000 ÷ 125 = $8.00." },
        { k: "mcq", q: "You raise leverage from 30:1 to 500:1 but keep the same lot size and stop. Your risk on the trade…", o: ["Rises about 17×", "Doesn't change — only the margin required changes", "Halves", "Disappears"], a: 1, w: "Risk = lots × stop distance × pip value. Leverage isn't in that equation." }
      ],
      yt: ["forex pip value and lot size explained step by step", "leverage vs margin explained simply forex"],
      src: ["conv", "math", "esma"] },

    { id: "w01c", t: "The Cost of Doing Business",
      big: "Every trade pays a toll — the spread, plus commission and overnight swap. The toll is charged per trade, so the more often you trade, the larger the share of your edge it eats.",
      plain: "It's a toll road. Drive to the next town once a week and the toll barely matters. Drive around the block forty times a day and the tolls cost more than the trips are worth.",
      dia: "costShare",
      body: [
        "The **spread** is the gap between the bid (where you can sell) and the ask (where you can buy). You buy at the ask and sell at the bid, so every round trip starts at a loss equal to the spread.",
        "**Commission** is a fee per lot on 'raw spread' accounts — check your broker's number. **Swap** (rollover) is the interest difference paid or earned for holding overnight. It's the carry trade in miniature; you'll meet it again in Unit 12.",
        "Why frequency matters: suppose the all-in cost is 1.2 pips. A 5-minute scalp aiming for 6 pips gives 20% of the target to costs. A daily-chart swing aiming for 150 pips gives under 1%. The same entry skill can win on the daily and lose on the 5-minute purely because of cost.",
        "Spreads aren't fixed. They widen when liquidity is thin — late Asia on European pairs, the minutes around big releases, the rollover around midnight server time. You'll measure this yourself on Thursday.",
        "Think about cost in **R** (your risk per trade — Unit 10): with a 10-pip stop and 1.2 pips of cost, every trade pays 0.12R before it starts. A system needs an expectancy above that just to break even.",
        "= Cost in R = cost in pips ÷ stop distance in pips"
      ],
      ex: { p: "Explain why the same strategy could be profitable on the 4H chart and unprofitable on the 5-minute chart, even with identical skill.",
        r: ["Costs are paid on every trade", "Smaller timeframes use smaller stops/targets, so cost is a bigger fraction", "More trades means more total cost", "Expresses cost relative to the stop/target (e.g., in R)"],
        m: "Every trade pays the spread and commission. On the 5-minute chart targets and stops are tiny, so a fixed cost of about a pip is a big slice of each trade, and you pay it many times a day. On the 4H chart the same cost is a tiny fraction of a much bigger stop and target. So the same entry skill can be profitable on the slower chart and unprofitable on the faster one." },
      q: [
        { k: "num", q: "Your stop is 8 pips and your all-in cost is 1.2 pips. What is the cost as a fraction of R? (2 decimals)", a: 0.15, tol: 0.005, u: "R", w: "1.2 ÷ 8 = 0.15R paid on every trade before it starts." },
        { k: "mcq", q: "When is the EUR/USD spread typically widest?", o: ["During the London–New York overlap", "Around high-impact news and in thin hours like late Asia or rollover", "On Tuesday mornings", "It never changes"], a: 1, w: "Spreads widen when liquidity thins out." },
        { k: "mcq", q: "Swap is best described as…", o: ["A broker penalty for losing trades", "The interest-rate difference for holding a position overnight", "The spread on exotic pairs", "A commission rebate"], a: 1, w: "Swap reflects the interest differential between the two currencies." }
      ],
      yt: ["forex spread commission and swap explained"],
      src: ["conv", "claude"] }
  ],
  P: { task: "Build your pip-value muscle memory and measure how spreads move through the day.",
    steps: [
      "Set up a clean TradingView chart with no indicators. Put EUR/USD next to the US Dollar Index (DXY) for the last month. Find three days EUR/USD rose and decide for each: euro strength or dollar weakness? One line each.",
      "Compute pip value by hand for EUR/USD, GBP/JPY and USD/CAD at 0.01, 0.1, 0.5 and 1.0 lots — twelve numbers. Check each one in the Position Size lab and count how many you got right first time.",
      "Over the next 24 hours, record the spread on six pairs — EUR/USD, GBP/USD, USD/JPY, GBP/JPY, AUD/NZD, USD/CAD — at three different hours (for example 08:00, 15:00 and 23:00 SAST; a minute each). Compute each pair's widest ÷ narrowest spread and write two sentences on why the biggest mover behaves that way."
    ],
    tools: ["lab:size", "tv"],
    num: [
      { k: "pipOk", l: "Pip values right on the first try (out of 12)", t: "number" },
      { k: "widest", l: "Pair whose spread moved most", t: "text" },
      { k: "ratio", l: "Its widest ÷ narrowest spread (e.g. 3.5)", t: "number" }
    ] },
  R: "Send your pip-value table and spread table. Tell me which pair's spread moved most across the day and why you think it did."
});

COURSE.week({
  n: 2, mod: "101", t: "The Other Side of Your Order",
  aim: "Know where your order physically goes, how your broker earns, and what a stop loss really is as an instruction.",
  L: [
    { id: "w02a", t: "The Five-Tier Hierarchy",
      big: "Forex has no central exchange. It's a network of dealers in tiers — central banks, big banks, institutions, corporates, then retail — and your order is filled against somebody's inventory.",
      plain: "It's a wholesale market with layers of middlemen. The farm sells to the wholesaler, the wholesaler to the shop, the shop to you. You pay the shop price and never see the farm.",
      dia: "hierarchy",
      body: [
        "**Tier 1 — central banks.** They set interest rates and occasionally intervene. They aren't trying to profit; they're meeting a legal mandate (Unit 13).",
        "**Tier 2 — the interbank market.** The biggest dealing banks quote each other through platforms like EBS and Reuters Matching. This is where the 'real' price forms.",
        "**Tier 3 — institutions.** Hedge funds, asset managers, pension funds and non-bank market makers, trading through prime brokers and electronic platforms.",
        "**Tier 4 — corporates.** Companies converting revenue and paying foreign suppliers. They trade because the business needs to, not to speculate — and their flows can be large and price-insensitive.",
        "**Tier 5 — retail.** You, through a broker. A small slice of total volume. You don't move the market; you ride it.",
        "> The practical consequence: much of the flow that moves price isn't reacting to charts. A company that must buy yen at month-end buys regardless of your pattern. That's why 'perfect' setups fail sometimes — and why you trade probabilities, never certainties."
      ],
      ex: { p: "Describe the five tiers and explain why 'the market ignored my perfect setup' is often not a mystery.",
        r: ["Names the tiers roughly in order (central banks → interbank → institutions → corporates → retail)", "Retail is a small share; much volume isn't speculative", "Some flows (e.g., corporate hedging) are price-insensitive", "Therefore setups are probabilities, not certainties"],
        m: "At the top are central banks, then the big dealing banks quoting each other, then institutions like hedge funds, then corporates, and retail traders at the bottom. Most of the volume comes from the higher tiers, and a lot of it — like a company paying its suppliers — doesn't care about chart patterns. So a perfect setup can fail simply because a big, price-insensitive flow went the other way. That's why a setup is a probability, not a promise." },
      q: [
        { k: "mcq", q: "Which tier is most likely to buy a currency regardless of its chart?", o: ["Retail traders", "Corporates hedging business flows", "Scalpers", "Pattern traders"], a: 1, w: "Corporate flows are driven by business needs, not charts." },
        { k: "mcq", q: "Where does the interbank price mainly form?", o: ["On your broker's server", "Among dealing banks on platforms like EBS and Reuters Matching", "On TradingView", "At the central bank"], a: 1, w: "Retail prices are derived from the interbank market." },
        { k: "mcq", q: "The practical lesson of the hierarchy for a retail trader is…", o: ["Retail moves the market at key levels", "You trade probabilities because much of the flow isn't reacting to charts", "Always trade against the banks", "Only trade when central banks speak"], a: 1, w: "It's why every rule you write is about probabilities and risk, not certainty." }
      ],
      yt: ["forex market structure interbank tiers explained"],
      src: ["conv"] },

    { id: "w02b", t: "How Your Broker Earns",
      big: "Your broker earns either by passing your order to the market and charging a fee (A-book), or by taking the other side itself (B-book). Neither is a conspiracy — but you should know which, because it shapes fills, spreads and incentives.",
      plain: "A travel agent either books your seat with the airline and takes a commission, or sells you seats it bought in bulk and profits if you pay more than it did. Both are legal. You'd still like to know which one you're talking to.",
      body: [
        "**A-book** (agency / straight-through processing): the broker routes your order to liquidity providers and earns a markup or commission. Whether you win doesn't affect it.",
        "**B-book** (market making): the broker takes the other side and keeps your trade in-house. If you lose, it gains. Brokers B-book most retail flow because most retail accounts lose: in 2018 the EU regulator ESMA reported that **74–89% of retail CFD accounts typically lose money**.",
        "**Hybrid** brokers do both: consistently profitable accounts are routed out; the rest stay in-house.",
        "A B-book doesn't mean prices are rigged against you — regulated brokers are supervised on execution. It does mean the business model depends on retail traders behaving like retail traders usually do: over-leveraged, over-trading, no stops. This entire programme is about not being that statistic.",
        "**Your job this week:** find your broker's order-execution policy and client agreement. Look for the words market maker, principal, STP, ECN, slippage and requotes. Then check its regulator: in South Africa a broker offering forex/CFDs must be an authorised financial services provider — confirm its FSP number on the FSCA's public register."
      ],
      ex: { p: "Explain A-book versus B-book, and use ESMA's statistic to explain why B-booking retail flow is usually profitable for brokers.",
        r: ["A-book routes orders to liquidity providers and earns a fee/markup", "B-book takes the other side of the client's trade", "Cites that most retail accounts lose (ESMA: 74–89%)", "Therefore the B-book profits on average; knowing the model helps you understand incentives"],
        m: "An A-book broker passes my trade to the market and earns a markup or commission, so it doesn't care if I win. A B-book broker takes the other side, so it profits when I lose. Because regulators found that 74–89% of retail CFD accounts lose money, taking the other side of retail flow is profitable on average — which is why brokers do it, and why I shouldn't trade like the average client." },
      q: [
        { k: "mcq", q: "A B-book broker profits most when you…", o: ["Win", "Lose", "Trade less", "Use tight spreads"], a: 1, w: "The broker holds the other side of your trade." },
        { k: "mcq", q: "ESMA's 2018 review found what share of retail CFD accounts typically lose money?", o: ["10–20%", "30–40%", "50–60%", "74–89%"], a: 3, w: "ESMA, 27 March 2018: 74–89% of retail accounts typically lose money." },
        { k: "mcq", q: "Where do you verify that a South African forex broker is authorised?", o: ["The broker's own website", "The FSCA's public register", "A YouTube review", "TradingView"], a: 1, w: "Always check the regulator's register, not the broker's own claims." }
      ],
      yt: ["A book vs B book broker explained", "market maker vs ECN broker explained"],
      src: ["esma", "conv"] },

    { id: "w02c", t: "Order Types, and the Truth About Stops",
      big: "A stop loss isn't a wall — it's an instruction to send a market order once price touches a level. Market orders fill at the best available price, which is why stops can fill worse than you set them.",
      plain: "Setting a stop is like telling a friend: 'If the concert ticket drops to R500, sell it for whatever you can get.' If buyers vanish and the next offer is R430, your friend sells at R430.",
      dia: "stopSlip",
      body: [
        "**Market order:** fill now at the best available price. Certain to fill, uncertain price.",
        "**Limit order:** fill at this price or better. Certain price, uncertain fill — used to buy below or sell above the market.",
        "**Stop order:** becomes a market order when price touches the level. Used for stop losses — and for breakout entries (a buy stop above the market). That's exactly how the Turtles entered: a buy stop one tick above the 20-day high.",
        "**Stop-limit:** becomes a limit order at the level. It controls price but may never fill — dangerous as a stop loss, because a gap straight through it leaves you in the losing trade.",
        "**Slippage** is the difference between your stop level and the fill. It's worst when liquidity is thin: around news, at the weekly open, in fast breaks. **Gaps** are the extreme case — if a pair closes Friday at 1.0850 and opens Monday at 1.0800, a stop at 1.0830 fills around 1.0800.",
        "> Your planned risk is a floor, not a ceiling. On volatile pairs, build a slippage allowance into your size, and don't hold tight stops through major releases."
      ],
      ex: { p: "Explain why a stop loss can fill worse than its level, and name two situations where that's most likely.",
        r: ["A stop triggers a market order at the level", "A market order fills at the best available price, which can be worse", "Thin liquidity — news, open/gaps, fast markets — causes slippage", "A stop-limit may not fill at all"],
        m: "A stop isn't a guaranteed exit. When price touches it, it becomes a market order, which takes the best price available at that moment. If there aren't enough buyers or sellers near my level — for example during a news release or when the market gaps at the weekly open — I get filled at a worse price. That's slippage." },
      q: [
        { k: "mcq", q: "The Turtles entered breakouts using which order type?", o: ["Limit orders below the market", "Buy stop orders just above the breakout level", "Market orders at the close", "Stop-limit orders"], a: 1, w: "A buy stop one tick above the 20-day (or 55-day) high." },
        { k: "mcq", q: "Your stop is at 1.0830. The market gaps from 1.0850 to 1.0800 at the open. Roughly where does a normal stop fill?", o: ["1.0830", "1.0850", "Around 1.0800", "It doesn't fill"], a: 2, w: "The stop triggers, but the first available price is around 1.0800." },
        { k: "mcq", q: "Why is a stop-limit dangerous as a stop loss?", o: ["It costs extra", "It may not fill if price gaps through, leaving you in the trade", "It fills too early", "It closes all positions"], a: 1, w: "A limit protects price at the cost of certainty — the wrong trade-off for a stop." }
      ],
      yt: ["stop loss slippage explained gap", "market order vs limit order vs stop order explained"],
      src: ["conv", "turtle"] }
  ],
  P: { task: "Lab drill — not strategy trading. Watch orders behave, and find out what kind of broker you actually use.",
    steps: [
      "Open a demo account with your broker (you'll use it on Day 3). Then sketch the five tiers on paper and draw the path your order takes from your phone to whoever fills it. Mark the step you can't see.",
      "Find your broker's execution policy and client agreement. Note its model (A-book, B-book, hybrid or unclear) and check its FSP number on the FSCA register. Write one line on what that model means for your fills.",
      "On demo, place market, limit and stop orders (a few of each) and screenshot one of each filling. Then place a stop just beyond a level in a quiet hour, and set up a second one for the next high-impact release on this week's calendar. Record requested versus filled price for both."
    ],
    tools: ["tv"],
    num: [
      { k: "slipQuiet", l: "Slippage in the quiet hour (pips)", t: "number" },
      { k: "slipNews", l: "Slippage around the release (pips)", t: "number" },
      { k: "model", l: "Your broker's model", t: "text" }
    ] },
  R: "Using your own two screenshots, explain why a stop can fill worse than its level, and name the two conditions that made it most likely."
});

COURSE.week({
  n: 3, mod: "101", t: "Sessions and the Clock",
  aim: "Produce your first real statistic with your own hands. This is the week the measuring habit starts.",
  L: [
    { id: "w03a", t: "The Three Sessions, in Your Time Zone",
      big: "The forex day is a relay between three financial centres — Asia, London and New York. Activity rises as each opens and peaks when London and New York overlap.",
      plain: "A shopping mall has an early shift with a few shoppers, a lunch rush, and one hour when the lunch crowd and the after-work crowd overlap. Prices move most when the most people are in the aisles.",
      dia: "sessionClock",
      body: [
        "In South African time (SAST, GMT+2), roughly:",
        "• **Asia (Tokyo):** about 02:00–11:00 all year (Japan has no daylight saving).",
        "• **London:** 09:00–18:00 in the European summer, 10:00–19:00 in the European winter.",
        "• **New York:** 14:00–23:00 in the US summer, 15:00–00:00 in the US winter.",
        "South Africa doesn't change its clocks, but Europe (last Sunday of March and of October) and the US (second Sunday of March, first Sunday of November) do. So your session times shift by an hour twice a year — and for a few weeks each spring and autumn, only one of them has shifted. Check the dates.",
        "The **London–New York overlap** (about 14:00–18:00 SAST in summer, 15:00–19:00 in winter) is the deepest, most active window of the day.",
        "Why it matters: a breakout in EUR/USD at 03:00 SAST happens in a thin market and fails more often than the same breakout at 15:00. When you slice your journal in Unit 18, session is usually one of the strongest variables of all."
      ],
      ex: { p: "Explain why the London–New York overlap tends to be the most active window, and why the same setup might behave differently at 03:00 SAST.",
        r: ["Two of the largest centres are open at once, so participation and liquidity peak", "Asian hours are thinner for European pairs", "A thin market means bigger moves from smaller orders, wider spreads, more false breaks", "Mentions that session times shift with European/US daylight saving"],
        m: "The overlap is when both London and New York — the two biggest centres — are trading, so there are the most participants and the most liquidity. At 03:00 SAST, European pairs are trading in a thin Asian market, so small orders move price more, spreads are wider, and breakouts fail more often. And because Europe and the US change their clocks but South Africa doesn't, the exact hours shift twice a year." },
      q: [
        { k: "mcq", q: "In the European summer, roughly what time (SAST) does London open?", o: ["08:00", "09:00", "10:00", "11:00"], a: 1, w: "08:00 London summer time (GMT+1) = 09:00 SAST." },
        { k: "mcq", q: "The highest-activity window of the forex day is usually…", o: ["The Asian open", "The London–New York overlap", "Friday's close", "Sunday's open"], a: 1, w: "Two major centres at once." },
        { k: "mcq", q: "Why should a South African trader re-check session times twice a year?", o: ["Brokers move their servers", "Europe and the US change clocks while South Africa doesn't", "Sessions rotate monthly", "Because of public holidays"], a: 1, w: "Daylight saving shifts London and New York by an hour relative to SAST." }
      ],
      yt: ["forex trading sessions explained London New York overlap"],
      src: ["conv"] },

    { id: "w03b", t: "Liquidity Is Depth, Not Volume",
      big: "Liquidity is how much size is waiting to trade near the current price. When that depth is thin, the same order pushes price further — which is why quiet hours range and busy hours expand.",
      plain: "Pour a bucket of water into a bath and the level barely moves. Pour the same bucket into a glass and it overflows. A deep market is a bath; a thin one is a glass.",
      dia: "orderBook",
      body: [
        "At any moment there are resting limit orders to buy below the price (**bids**) and to sell above it (**offers**). Together they form the order book; the size near the price is its **depth**.",
        "A market order eats through the book. If only 5 million euros are offered within a pip, a 20-million buy order fills at several worse prices, lifting the price as it goes. That's **price impact**.",
        "In a deep book (the London–NY overlap), large orders barely move price. In a thin book (late Asia for EUR/USD), modest orders cause outsized moves, spreads widen, and false breaks are common.",
        "The 'volume' on a retail forex chart is usually **tick volume** — the number of price changes — because spot FX has no central exchange reporting real traded size. It tracks activity; it isn't the true volume.",
        "> Judge every move in the context of liquidity. A spike in a thin hour is weak evidence. A sustained move through the overlap is strong evidence."
      ],
      ex: { p: "Explain liquidity to a friend using the bath and the glass, and say why a breakout in a thin hour is weaker evidence.",
        r: ["Liquidity = resting orders (depth) near the current price", "Market orders consume the book and move price (impact)", "Thin book → bigger moves from small orders, wider spreads, false breaks", "Retail forex volume is tick volume, not true traded size"],
        m: "Liquidity is how many orders are resting near the price. In a deep market, like the bath, a big order barely changes the price. In a thin market, like the glass, a small order spills over and moves price a lot. So a breakout during quiet hours can be caused by a few orders in an empty book, and it's more likely to fail than one that happens when the market is full." },
      q: [
        { k: "mcq", q: "'Liquidity' most precisely means…", o: ["The number of candles on the chart", "The size of resting orders near the current price", "How fast price moves", "The number of traders online"], a: 1, w: "Depth of the book near price." },
        { k: "mcq", q: "Tick volume on a forex chart measures…", o: ["Total euros traded", "The number of price changes", "Bank order flow", "Retail sentiment"], a: 1, w: "Spot FX has no central tape, so charts count ticks." },
        { k: "mcq", q: "A 40-pip spike at 03:00 SAST on EUR/USD should be treated as…", o: ["Strong evidence of a new trend", "Weaker evidence, because the book is thin", "A guaranteed reversal", "Irrelevant"], a: 1, w: "Thin books exaggerate moves." }
      ],
      yt: ["market depth order book liquidity explained", "tick volume forex explained"],
      src: ["conv"] },

    { id: "w03c", t: "Time-of-Day Tendencies",
      big: "Each session tends to leave a fingerprint — Asia builds a range, London often breaks it, New York continues or reverses it. These are tendencies with a probability, not laws — so you measure them instead of believing them.",
      plain: "Rush-hour traffic is 'usually' worst at 5 pm — but some days it's fine and some days it's 3 pm. A year of your own commute times beats anyone's opinion.",
      dia: "asianRange",
      body: [
        "**The Asian range:** during Asian hours, EUR and GBP pairs often trade in a narrow band. Its high and low become reference levels — and stop orders cluster just beyond them.",
        "**The London expansion:** as London opens, liquidity arrives and price often breaks one side of the Asian range. Sometimes it breaks one side, runs the stops, and reverses to break the other.",
        "**The New York window:** the US open and US data (usually 14:30 SAST in the US summer, 15:30 in winter) bring a second burst. New York can extend London's move or reverse it.",
        "**Friday afternoon:** positions are squared before the weekend; moves drift or snap back.",
        "> The point isn't to memorise these patterns. It's to see that they're hypotheses. On Thursday you'll count twenty days by hand and get a real frequency. That number — not a video — is what you're allowed to build rules on."
      ],
      ex: { p: "Describe the typical Asia → London → New York fingerprint, and explain why this course insists you measure it rather than trust it.",
        r: ["Asia tends to range; its high/low become reference levels with stops beyond", "London often breaks (or sweeps) one side", "New York extends or reverses", "Tendencies are probabilities; your own measured frequency is the basis for rules"],
        m: "Asia often builds a small range, and stops collect just outside it. When London opens, price often breaks one side of that range, sometimes sweeping it and reversing. New York then either extends London's move or reverses it. But these are only tendencies, so I measure how often they actually happen before I base any rule on them." },
      q: [
        { k: "mcq", q: "Why do stop orders often cluster just beyond the Asian range?", o: ["Brokers place them there", "Traders put stops beyond obvious highs and lows", "Regulation requires it", "Central banks ask for it"], a: 1, w: "Obvious levels attract stops." },
        { k: "mcq", q: "A 'tendency' in trading should be treated as…", o: ["A rule that always holds", "A probability you measure", "A myth", "A signal to trade immediately"], a: 1, w: "Measure it, then decide." },
        { k: "mcq", q: "Which is the best basis for a trading rule?", o: ["A popular YouTube claim", "A frequency you counted yourself over a decent sample", "One memorable trade", "A mentor's signal"], a: 1, w: "Your own data over a reasonable sample." }
      ],
      yt: ["asian range london breakout explained"],
      src: ["conv", "design"] }
  ],
  P: { task: "Measure how often London breaks the Asian range — your first number from your own hands.",
    steps: [
      "Before you look at any data, write down your guess: in what % of days does London break the Asian range on at least one side? Then open EUR/USD 1H in TradingView and mark the Asian range (01:00 SAST to the London open — 09:00 in European summer, 10:00 in winter) for the first 7 days.",
      "Continue to 20 consecutive trading days. For each day record whether London (open to close) broke above only, below only, both, or neither.",
      "Tabulate the four counts, convert to percentages, and compare with your guess. Record them below."
    ],
    tools: ["tv"],
    num: [
      { k: "guess", l: "Your guess before counting (% of days with any break)", t: "number" },
      { k: "above", l: "Above only (%)", t: "number" },
      { k: "below", l: "Below only (%)", t: "number" },
      { k: "both", l: "Both (%)", t: "number" },
      { k: "neither", l: "Neither (%)", t: "number" }
    ] },
  R: "Send your four percentages next to your guess. The gap between what you believed and what you counted is the lesson — tell me how big it was."
});

COURSE.week({
  n: 4, mod: "101", t: "Timeframes and Fractality",
  aim: "Understand what a candle hides, and why choosing a timeframe is a decision rather than a default.",
  L: [
    { id: "w04a", t: "What a Candle Actually Encodes",
      big: "A candle is four numbers — open, high, low, close — for a slice of time. It records where price went, not the order it went there, and that hidden path can contain the move that would have stopped you out.",
      plain: "A candle is a football score card that only shows the score at kick-off, the final score, and each side's biggest lead. You know the extremes, not the order of events.",
      dia: "candleHidden",
      body: [
        "The **body** runs from open to close; the **wicks** mark the extremes beyond it. A long lower wick means price went down and came back — sellers pushed, buyers absorbed.",
        "What a candle hides is the **sequence**. A 4H candle with a 30-pip range could have gone up first then down, or down first then up. If your stop sat 20 pips below the open, those two paths are the difference between a stopped-out trade and a winner.",
        "This is why higher-timeframe backtests can lie. When one candle contains both your stop and your target, the candle can't tell you which came first.",
        "= Rule: if a single candle touches both your stop and your target, count it as a LOSS — or drop to a lower timeframe to check.",
        "Candle patterns (hammers, engulfings) summarise a fight between buyers and sellers inside one period. They're information about the past, not signals by themselves. The simulator follows the same conservative logic: when the path inside a bar is ambiguous, it assumes the move nearest the open happened first."
      ],
      ex: { p: "Explain what a candle cannot tell you, and the backtesting rule for when one candle contains both your stop and your target.",
        r: ["A candle is OHLC — a summary of one period", "The path/sequence inside the candle is unknown", "Stop and target inside the same candle is ambiguous", "Conservative rule: count as a loss (or check a lower timeframe)"],
        m: "A candle only gives four numbers: open, high, low and close. It doesn't say whether the high or the low came first. So if a single candle reaches both my stop and my target, I can't know which was hit first. The honest backtesting rule is to count it as a loss, or zoom into a lower timeframe to see the real sequence." },
      q: [
        { k: "mcq", q: "A daily candle's range contains both your stop and your target. The conservative backtesting rule is…", o: ["Count it as a win", "Count it as a loss (or check a lower timeframe)", "Ignore the trade", "Count it as half a win"], a: 1, w: "Assume the worst unless you can prove otherwise." },
        { k: "mcq", q: "A long lower wick tells you…", o: ["Price closed at the low", "Price traded lower during the period and recovered", "Volume was low", "The next candle will be bullish"], a: 1, w: "Sellers pushed down; buyers pushed it back." },
        { k: "mcq", q: "Which information does a candle NOT contain?", o: ["The high", "The close", "The order in which the high and low were made", "The open"], a: 2, w: "The sequence is exactly what's lost." }
      ],
      yt: ["candlestick anatomy explained what candles hide"],
      src: ["conv", "design"] },

    { id: "w04b", t: "Fractality",
      big: "The same structural grammar — trends, pullbacks, ranges, breaks — repeats on every timeframe. A trend only exists relative to a timeframe, so a 5-minute uptrend can be a pullback inside a daily downtrend.",
      plain: "Zoom into a coastline and you see bays and headlands; zoom further and every bay has smaller bays. The pattern repeats at every scale — and 'this coast runs north' is only true at the zoom you picked.",
      dia: "fractalNest",
      body: [
        "Each higher-timeframe candle contains lower-timeframe candles: one daily = six 4H = twenty-four 1H. A pullback on the daily can be a complete trend on the 1H.",
        "A lot of retail losses come from this confusion: trading a lower-timeframe trend straight into a higher-timeframe trend or level. The 15-minute trader buying 'the uptrend' may be providing liquidity to the daily seller.",
        "The Turtles sidestepped the problem entirely: one timeframe (daily bars) and a mechanical definition of trend (20- and 55-day breakouts). That's a legitimate solution — pick your frame, let the rules decide, and stop arguing with other timeframes.",
        "> The higher timeframe sets the context; the lower timeframe times the entry. When they disagree, the higher one usually wins in the end — and in Unit 6 you'll measure by how much."
      ],
      ex: { p: "Explain why 'is EUR/USD in an uptrend?' has no answer until you name a timeframe.",
        r: ["Trends are relative to a timeframe", "Higher-timeframe candles contain lower-timeframe structure", "A lower-timeframe trend can be a higher-timeframe pullback", "Solution: pick a timeframe and define trend mechanically (e.g., Turtles)"],
        m: "Price structure repeats at every scale, so the same stretch of price can be an uptrend on the 15-minute chart and a small pullback inside a downtrend on the daily. Asking 'is it trending?' only makes sense once you say which timeframe. The Turtles solved it by committing to daily bars and a mechanical breakout definition of trend." },
      q: [
        { k: "mcq", q: "How many 1H candles make one 24-hour daily candle?", o: ["4", "6", "12", "24"], a: 3, w: "24 hours, 24 one-hour candles." },
        { k: "mcq", q: "The 15m is clearly rising while the daily is clearly falling. The 15m move is most likely…", o: ["A new daily uptrend", "A pullback within the daily downtrend", "Noise that can be ignored", "A signal to buy"], a: 1, w: "Lower-timeframe trends often live inside higher-timeframe pullbacks." },
        { k: "mcq", q: "How did the Turtles handle timeframe ambiguity?", o: ["Voted across many timeframes", "Committed to daily bars with mechanical breakout rules", "Only traded 5-minute charts", "Ignored trends"], a: 1, w: "One frame, mechanical rules." }
      ],
      yt: ["fractal nature of markets multiple timeframes explained"],
      src: ["turtle", "conv"] },

    { id: "w04c", t: "The Three-Screen Set",
      big: "Use three linked timeframes with three different jobs: the highest sets your bias, the middle finds the setup, the lowest times the entry. Pick one set and stop switching.",
      plain: "Driving in a new city: the country map tells you which direction, the city map which road, the street view when to turn. Using only street view, you'll turn confidently into the wrong suburb.",
      dia: "threeScreens",
      body: [
        "Common sets, roughly ×4–×6 apart:",
        "• **Swing:** Daily / 4H / 1H",
        "• **Intraday:** 4H / 1H / 15m",
        "• **Scalp:** 1H / 15m / 5m",
        "**Context screen:** trending or ranging, and where are the big levels? **Signal screen:** is my setup present? **Execution screen:** exactly where do I enter, and where does the stop go?",
        "Flipping timeframes until one agrees with you is confirmation bias wearing a disguise. Your written system (Unit 16) names one set; your journal records the signal timeframe of every trade, so in Unit 23 you can see which set you actually execute best.",
        "Given lectures, Nsimbini and driving, a slower set like Daily / 4H / 1H is the realistic place to start — but don't decide yet. Your data will."
      ],
      ex: { p: "Explain the three jobs in the three-screen set, and why flipping timeframes until one shows your idea is dangerous.",
        r: ["Highest TF = context/bias", "Middle TF = setup/signal", "Lowest TF = execution (entry and stop)", "Timeframe-hopping to find agreement is confirmation bias"],
        m: "The highest timeframe tells me the context — trend or range, and where the big levels are. The middle timeframe is where I look for my setup. The lowest is only for the exact entry and stop. If I keep switching timeframes until one agrees with what I already want to do, I'm just finding evidence for my opinion, which is confirmation bias." },
      q: [
        { k: "mcq", q: "In a Daily / 4H / 1H set, the 4H's job is…", o: ["Bias", "Finding the setup", "Precise entry timing", "Nothing"], a: 1, w: "The middle screen finds the setup." },
        { k: "mcq", q: "Switching timeframes until one shows your idea is…", o: ["Thorough analysis", "Confirmation bias", "Top-down analysis", "Required"], a: 1, w: "It feels like research but it's selecting evidence." },
        { k: "mcq", q: "Which set suits someone with limited screen time?", o: ["1m / 5m / 15m", "5m / 15m / 1H", "Daily / 4H / 1H", "Tick charts"], a: 2, w: "Slower timeframes need fewer, shorter checks." }
      ],
      yt: ["triple screen trading system timeframes explained"],
      src: ["conv"] }
  ],
  P: { task: "See fractality with your own eyes by drawing the same week on four timeframes.",
    steps: [
      "Pick five Daily candles of EUR/USD from last month. For each, open the 1H underneath it and write the path the Daily candle hid (for example: up 40 pips, down 70, closed up 10). Which candle hid a move that would have stopped out a 30-pip stop?",
      "Pick one recent week of EUR/USD and draw its structure — swing highs and lows by eye — on the Daily, 4H, 1H and 15m. Screenshot all four and annotate how each smaller structure nests inside the larger one.",
      "Hunt down one moment where the 15m was clearly bullish while the Daily was clearly bearish. Screenshot it and write what a trader on each timeframe believed at that moment. Then choose the three-screen set you'll use from now on."
    ],
    tools: ["tv", "floor"],
    num: [
      { k: "shots", l: "Screenshots completed (0–5)", t: "number" },
      { k: "conflict", l: "Date/time of your 15m-bullish / Daily-bearish moment", t: "text" }
    ] },
  R: "Send the nested screenshots. Describe what a trader on each of the four timeframes believed at the moment of conflict."
});

COURSE.week({
  n: 5, mod: "102", t: "Structure: Swings",
  aim: "Replace 'I can see the trend' with a definition that is mechanical — and therefore countable.",
  L: [
    { id: "w05a", t: "A Mechanical Swing Definition",
      big: "A swing high is a candle whose high is higher than the highs of the three candles on each side. A definition you can apply mechanically is what turns structure from an opinion into something you can count.",
      plain: "A mountain peak is 'a point higher than everything around it within a set distance'. Fix the distance and two surveyors mark the same peaks. Leave it vague and every hiker has their own list.",
      dia: "swingN3",
      body: [
        "= Swing high (N = 3): high[i] > the highs of candles i−3, i−2, i−1, and ≥ the highs of i+1, i+2, i+3",
        "A swing low is the mirror image using lows. **Ties:** if two candles share the same high, the first one counts and the second doesn't. Decide this once and never change it.",
        "Consequence: a swing is only **confirmed three candles later**. On the daily chart you only know a swing high existed three days after it formed. Your backtests must respect that delay — marking swings with hindsight is cheating, and it makes every structure-based system look better than it is.",
        "Why N = 3? It's a middle ground. N = 1 marks nearly every wiggle; N = 10 marks only major turns. The exact value matters less than never changing it mid-study, so your counts stay comparable.",
        "The Trading Floor's **Swings** overlay uses exactly this definition. Mark by hand first, then switch it on to check your work."
      ],
      ex: { p: "Define a swing high with N = 3 precisely enough that two people would mark identical points, and explain the confirmation delay.",
        r: ["High greater than the three candles before and at least the three after", "Swing low is the mirror with lows", "A tie rule (first one counts)", "Only confirmed after three more candles — no hindsight marking"],
        m: "A swing high is a candle whose high is above the highs of the three candles before it and not beaten by the three after it; a swing low is the same with lows. If two candles tie, the first counts. Because I need to see three candles after it, a swing is only confirmed three candles later, so in a backtest I can't use it before then." },
      q: [
        { k: "mcq", q: "With N = 3 on daily candles, when is a swing high confirmed?", o: ["The moment it forms", "After three more candles close without exceeding it", "At the end of the week", "Never"], a: 1, w: "You need the three right-hand candles." },
        { k: "mcq", q: "Why fix N and never change it mid-study?", o: ["Brokers require it", "So counts are comparable and not tuned by hindsight", "Higher N is always better", "Lower N is always better"], a: 1, w: "Changing definitions mid-study corrupts the data." },
        { k: "mcq", q: "Highs of seven consecutive candles: 1.10, 1.12, 1.13, 1.16, 1.14, 1.13, 1.11. Is the 1.16 candle a swing high with N = 3?", o: ["Yes", "No — not enough candles", "No — 1.13 appears twice", "Only on Mondays"], a: 0, w: "1.16 is above the three highs before it (1.10, 1.12, 1.13) and the three after (1.14, 1.13, 1.11)." }
      ],
      yt: ["swing high swing low fractal definition explained"],
      src: ["design", "conv"] },

    { id: "w05b", t: "The Only Testable Definition of Trend",
      big: "An uptrend is higher swing highs AND higher swing lows; a downtrend is lower highs AND lower lows; anything else is a range. That's the whole definition — and its value is that it can be checked.",
      plain: "Climbing stairs: each step is higher than the last, even though you pause on each one. When the steps stop getting higher, you're not climbing any more — however you feel about it.",
      dia: "trendStairs",
      body: [
        "= Uptrend: latest swing high > previous swing high AND latest swing low > previous swing low",
        "= Downtrend: latest swing high < previous swing high AND latest swing low < previous swing low",
        "Mixed (higher high but lower low, or lower high but higher low) = **range or transition**.",
        "The Turtles used an even simpler mechanical definition: a new 20-day (or 55-day) high means price is trending up enough to buy. That's the **Donchian channel** — the highest high and lowest low of the last N days.",
        "= Donchian upper(20) = highest high of the previous 20 bars · lower(20) = lowest low of the previous 20 bars",
        "Different definitions, same principle: mechanical, checkable, no opinions. Both will be wrong sometimes. The point isn't to be right; it's to be consistent, so that the statistics you gather mean something."
      ],
      ex: { p: "Give the swing-based definitions of uptrend, downtrend and range, and compare them with the Turtles' Donchian definition.",
        r: ["Uptrend = HH + HL; downtrend = LH + LL", "Mixed = range/transition", "Donchian: a new N-day high or low (e.g., 20 or 55)", "Both are mechanical and checkable; consistency is the point"],
        m: "An uptrend is when the latest swing high and swing low are both higher than the previous ones; a downtrend is when both are lower; anything mixed is a range. The Turtles used a simpler rule: price breaking the highest high or lowest low of the last 20 or 55 days. Both definitions are mechanical, so two people get the same answer and the statistics are consistent." },
      q: [
        { k: "mcq", q: "Swing highs 1.1000 then 1.1050. Swing lows 1.0900 then 1.0880. The structure is…", o: ["Uptrend", "Downtrend", "Range/transition (higher high but lower low)", "Impossible to say"], a: 2, w: "Mixed signals = not a trend by this definition." },
        { k: "mcq", q: "A 20-day Donchian upper band is…", o: ["The 20-day moving average", "The highest high of the last 20 bars", "The average true range", "The close 20 days ago"], a: 1, w: "Highest high over the lookback." },
        { k: "num", q: "The last five daily highs (oldest → newest): 1.0910, 1.0955, 1.0930, 1.0980, 1.0965. What is the 5-bar Donchian upper value?", a: 1.098, tol: 0.00001, w: "The highest of the five highs is 1.0980." }
      ],
      yt: ["higher highs higher lows trend definition explained", "Donchian channel explained turtle trading"],
      src: ["turtle", "design"] },

    { id: "w05c", t: "Recognising Range",
      big: "A range isn't the absence of a trend — it's a market state with its own behaviour: breakouts fail and extremes revert. Most losses come from using trend tactics inside ranges.",
      plain: "A ball bouncing between two walls. Throwing it harder at one wall doesn't send it through — it bounces back. Breakout tactics in a range are throwing the ball at the wall.",
      dia: "rangeBox",
      body: [
        "Tell-tale signs: swing highs roughly level and swing lows roughly level; breaks that snap straight back inside; heavily overlapping candles; a Donchian channel that goes flat.",
        "Range and trend call for opposite behaviour. In a trend you buy strength (breakouts) and hold. In a range, breakouts are traps — you fade the extremes or stand aside.",
        "A breakout system like the Turtles' **loses money in ranges by design.** It pays the cost of many small whipsaw losses to be present for the few enormous trends. In the Trading Floor you'll run the Turtle rules on a market that mostly ranges and watch that cost with your own eyes.",
        "> Standing aside is a position. 'No trade' is a legitimate output of a system."
      ],
      ex: { p: "Explain how you'd recognise a range, and why a breakout system loses money inside one.",
        r: ["Flat highs and lows / overlapping candles / flat channel", "Failed breaks that snap back", "Breakout systems get whipsawed in ranges but accept that cost to catch trends", "'No trade' is a valid decision"],
        m: "In a range the swing highs and lows line up roughly level, candles overlap, and breakouts quickly fall back inside. A breakout system buys every new high and sells every new low, so in a range it keeps getting whipsawed — lots of small losses. It accepts that cost because it needs to be in the market when a big trend finally starts. Sometimes the right decision is simply not to trade." },
      q: [
        { k: "mcq", q: "Which is a tell-tale sign of a range?", o: ["Higher highs and higher lows", "Breakouts that snap straight back inside", "A new 55-day high", "A rising Donchian channel"], a: 1, w: "Failed breaks are the signature of ranges." },
        { k: "mcq", q: "Why does a Turtle-style breakout system accept losing in ranges?", o: ["It can't detect them", "It pays small whipsaw losses to be present for rare big trends", "Ranges are rare", "It doesn't lose in ranges"], a: 1, w: "That's the trade-off of trend following." },
        { k: "mcq", q: "In a range, 'no trade' is…", o: ["A failure", "A legitimate system output", "Impossible", "Only for beginners"], a: 1, w: "Not trading is a decision too." }
      ],
      yt: ["how to identify ranging market vs trending market"],
      src: ["design", "turtle"] }
  ],
  P: { task: "Find out how much of the time a market actually trends — using the mechanical definition, not your eyes.",
    steps: [
      "Write your guess first: what % of the last six months was EUR/USD Daily trending? Then mark every swing high and low (N = 3) on the Daily for the first three months.",
      "Finish the six months. Segment the period into labelled blocks — uptrend, downtrend, range — and count the calendar days in each.",
      "Open the Trading Floor, turn on the Swings overlay on any market, and compare its marks with your method on a few swings. Record your percentages below."
    ],
    tools: ["tv", "floor"],
    num: [
      { k: "guess", l: "Your guess: % of time trending", t: "number" },
      { k: "trend", l: "Actual: % of time trending", t: "number" },
      { k: "range", l: "Actual: % of time ranging", t: "number" }
    ] },
  R: "Send your trending-versus-ranging percentages beside your guess. Almost everyone overestimates trending time — by how much did you?"
});

COURSE.week({
  n: 6, mod: "102", t: "Break of Structure and Change of Character",
  aim: "Get your own reliability number for the signal everyone teaches and almost nobody measures.",
  L: [
    { id: "w06a", t: "Break of Structure",
      big: "A break of structure (BOS) is price closing beyond the last swing point in the direction of the trend — the market confirming the trend is still alive.",
      plain: "A climber reaching a new ledge above the last one. Every new ledge says 'still climbing'.",
      dia: "bosChoch",
      body: [
        "= Uptrend BOS: a candle BODY closes above the most recent confirmed swing high (mirror for downtrends)",
        "**Body close versus wick:** a wick through the level that closes back inside isn't a BOS — it's a sweep (Unit 8). Choose your standard (body close) and apply it every single time, or your data is worthless.",
        "The Turtles' breakout is a cousin of BOS: price trading above the 20-day high. They entered with a stop order one tick above the level, so they were in on the **touch**, not the close. That's a different but equally mechanical choice — and every choice has a price: touch entries catch moves early but eat more false breaks; close entries avoid some false breaks but enter later and worse.",
        "In a trend, each BOS also moves the 'line in the sand' — the swing low that now protects the trend."
      ],
      ex: { p: "Explain what a break of structure is, why the course insists on a body close, and how the Turtles' entry differs.",
        r: ["BOS = close beyond the last swing point in the trend's direction", "Body close vs wick distinguishes a break from a sweep", "Turtles entered on the touch with a stop order above the 20-day high", "Trade-off: earlier entries vs more false breaks"],
        m: "A break of structure is when price closes beyond the last swing high in an uptrend (or low in a downtrend), confirming the trend continues. I need a body close, because a wick that pokes through and closes back inside is a sweep, not a break. The Turtles entered on the touch with a stop order, which gets in earlier but suffers more false breakouts." },
      q: [
        { k: "mcq", q: "In an uptrend, a candle wicks above the last swing high and closes back below it. By a body-close standard this is…", o: ["A BOS", "Not a BOS — possibly a sweep", "A change of character", "A range"], a: 1, w: "No body close, no break." },
        { k: "mcq", q: "The Turtles entered breakouts…", o: ["On a daily close beyond the level", "With a stop order as price traded through the level", "The day after the break", "With limit orders"], a: 1, w: "On the touch, via stop orders." },
        { k: "mcq", q: "A BOS in an uptrend confirms…", o: ["Reversal", "Continuation", "A range", "Nothing"], a: 1, w: "The trend is still alive." }
      ],
      yt: ["break of structure BOS explained market structure"],
      src: ["design", "turtle"] },

    { id: "w06b", t: "Change of Character",
      big: "A change of character (CHoCH) is the first break against the trend — in an uptrend, a close below the last higher low. It's the earliest honest evidence of reversal, and it's often wrong.",
      plain: "A climber who's been going up suddenly steps down below the last ledge. It might be the start of the descent — or just a slip before climbing on.",
      body: [
        "= Uptrend CHoCH: close below the most recent HIGHER LOW · Downtrend CHoCH: close above the most recent LOWER HIGH",
        "Its value is that it's **early**. Its cost is that it's **noisy** — plenty of CHoCHs are followed by the original trend resuming.",
        "The level that would trigger a CHoCH is always known in advance. In an uptrend, it's the last higher low — which is also the natural place for a long trade's stop: if price closes below it, the structure that justified the trade is gone.",
        "That's why this week you measure it: 30 instances, what happened next. A signal's reliability is a number, not a feeling."
      ],
      ex: { p: "Explain what a change of character is, why it's 'early but noisy', and why its level is a natural stop for a trend trade.",
        r: ["CHoCH = first close against the trend beyond the last HL (uptrend) or LH (downtrend)", "Early evidence of reversal", "Often followed by continuation (noisy)", "The same level is where the trade's structural justification disappears → stop"],
        m: "A change of character is the first time price closes against the trend beyond its last protective swing — below the last higher low in an uptrend. It's the earliest honest sign of a reversal, but it's often wrong and the trend resumes. That same level is a good stop for a trend trade, because once it breaks the structure I traded on no longer exists." },
      q: [
        { k: "mcq", q: "In an uptrend with its last higher low at 1.0820, which close is a CHoCH?", o: ["1.0850", "1.0830", "1.0815", "1.0900"], a: 2, w: "Only a close below 1.0820 changes the character." },
        { k: "mcq", q: "Why is a CHoCH called 'early but noisy'?", o: ["It appears late", "It's the first evidence of reversal and is often followed by continuation", "It never fails", "It needs volume to be valid"], a: 1, w: "Earliness costs reliability." },
        { k: "mcq", q: "In an uptrend, a natural structural stop for a long sits just below…", o: ["The last swing high", "The last higher low", "The 200-day average", "A round number above price"], a: 1, w: "Below the level whose break invalidates the idea." }
      ],
      yt: ["change of character CHoCH explained"],
      src: ["design"] },

    { id: "w06c", t: "The Higher-Timeframe Filter",
      big: "A signal that agrees with the higher timeframe is a different signal from one that fights it. Higher-timeframe agreement is often the single variable that turns a coin flip into an edge — and you're about to measure how much.",
      plain: "Swimming with the current versus against it. Same stroke, very different progress.",
      body: [
        "**Filter:** only count 4H CHoCH signals when the Daily structure points the same way — for example, a bearish 4H CHoCH while the Daily is in a downtrend (a pullback ending).",
        "Filters **reduce trade count** — fewer opportunities, smaller samples. A filter is only worth it if the improvement pays for what it removes. You'll decide from data, not from a rule of thumb.",
        "The Turtles' System 1 had a strange-sounding filter: **skip a 20-day breakout if the previous breakout was a winner** (with a 55-day 'failsafe' entry so a huge move isn't missed). It's in the rules because it improved results on Dennis's data. Every filter has to earn its place like that — with numbers."
      ],
      ex: { p: "Explain what a higher-timeframe filter does, what it costs, and how you'd decide whether it's worth using.",
        r: ["Only takes signals aligned with the higher-timeframe structure", "Cost: fewer trades / smaller samples", "Worth it only if measured improvement outweighs the cost", "Example: the Turtles' System 1 skip-after-winner filter earned its place with data"],
        m: "A filter only lets through the signals that agree with the bigger picture, like a 4H sell signal while the Daily is already falling. The cost is that I get fewer trades, so my samples are smaller. I should only keep a filter if my own data shows the filtered signals are clearly better — just as the Turtles kept their odd skip-after-a-winner rule because it tested better." },
      q: [
        { k: "mcq", q: "The main cost of adding a filter is…", o: ["Higher spreads", "Fewer trades and smaller samples", "More losses", "None"], a: 1, w: "Every filter trades quantity for quality." },
        { k: "mcq", q: "The Turtles' System 1 filter skipped a 20-day breakout when…", o: ["Volume was low", "The previous breakout was a winner", "It was a Friday", "N was high"], a: 1, w: "With a 55-day failsafe breakout so big moves aren't missed." },
        { k: "mcq", q: "A 4H bearish CHoCH 'agrees with the Daily' when the Daily is…", o: ["In an uptrend", "In a downtrend", "Ranging", "Closed"], a: 1, w: "Same direction on both frames." }
      ],
      yt: ["multiple timeframe analysis higher timeframe trend filter explained"],
      src: ["turtle", "design"] }
  ],
  P: { task: "Measure how reliable a change of character is — overall, and when the Daily agrees.",
    steps: [
      "Write your break-of-structure definition in one sentence (body close or wick — pick one and keep it). On two pairs (4H, last six months), use bar replay to mark the first 15 BOS, deciding each before you see what follows.",
      "Write your change-of-character definition in one sentence. On the same two pairs, find 30 CHoCH instances in bar replay. For each, record whether structure truly reversed (a full opposite BOS followed) or the original trend resumed.",
      "For each of your 30, record whether the Daily agreed with the signal. Compute reliability overall, with the Daily, and against it."
    ],
    tools: ["tv", "journal"],
    num: [
      { k: "all", l: "CHoCH reliability overall (%)", t: "number" },
      { k: "with", l: "…when the Daily agreed (%)", t: "number" },
      { k: "against", l: "…when the Daily disagreed (%)", t: "number" },
      { k: "n", l: "Sample size", t: "number" }
    ] },
  R: "Send all three reliability numbers and the sample size. The gap between 'with the Daily' and 'against the Daily' is one of the most useful numbers you'll produce this year — what was yours?"
});

COURSE.week({
  n: 7, mod: "102", t: "Levels and Why They Hold",
  aim: "Understand the mechanical reason levels work — then measure how quickly they wear out.",
  L: [
    { id: "w07a", t: "Why a Level Holds",
      big: "Levels hold because orders rest there — limit orders from people who want that price, and stop orders from people who'll be proven wrong there. A level is inventory, not memory.",
      plain: "A shelf restocked at the same price every week. Shoppers learn the price and queue there. The price 'holds' because people are waiting there with money — not because the shelf remembers anything.",
      dia: "levelInventory",
      body: [
        "At a previous turning point, three groups leave orders behind:",
        "• Traders who **missed** the move and want a second chance (limit orders).",
        "• Traders **trapped** on the wrong side who want out at breakeven (closing orders).",
        "• Traders whose **stops** sit just beyond the level.",
        "When price returns, those orders absorb the move — until they're used up. That's why levels tend to **weaken with repeated tests**: every touch consumes inventory.",
        "Round numbers (1.1000, 150.00) attract orders for the same reason. Your own observation about the 200, 500 and 800 pip levels is exactly this kind of hypothesis — and it deserves the same treatment: a count, not a conviction."
      ],
      ex: { p: "Explain why a support or resistance level holds, and why it tends to weaken each time it's tested.",
        r: ["Resting orders sit at the level (missed traders, trapped traders, stops)", "Those orders absorb price when it returns", "Each test consumes some of that inventory", "So levels weaken with touches — a hypothesis to measure"],
        m: "A level holds because orders are waiting there: people who missed the first move want in, people who were trapped want out at breakeven, and stops sit just beyond it. When price comes back, those orders soak up the move. Each time price returns, some of those orders get filled and disappear, so the level has less to hold it next time." },
      q: [
        { k: "mcq", q: "The main mechanical reason a level holds is…", o: ["The market remembers prices", "Resting orders absorb the move", "Indicators point to it", "Brokers defend it"], a: 1, w: "Inventory, not memory." },
        { k: "mcq", q: "Why do levels tend to weaken with repeated tests?", o: ["Traders forget them", "Each touch consumes the resting orders", "Volatility falls", "They never weaken"], a: 1, w: "Used-up inventory can't absorb the next push." },
        { k: "mcq", q: "Why do round numbers often act as levels?", o: ["They're mandated", "Orders cluster at memorable prices", "Central banks set them", "Charts are drawn in round numbers"], a: 1, w: "People like round numbers — so orders gather there." }
      ],
      yt: ["why support and resistance works order flow explained"],
      src: ["conv"] },

    { id: "w07b", t: "Zones, Not Lines",
      big: "Draw levels as zones — from the cluster of bodies to the wick extreme — because the orders behind a level are spread across a band of prices. A one-pixel line is false precision.",
      plain: "The queue at a stadium gate isn't one person wide; it's a crowd. Aim for the crowd, not for one person in it.",
      dia: "zone",
      body: [
        "Draw the zone from where candle **bodies** turned to where the **wick** extreme reached. That band is where the orders actually were.",
        "A thin line feels rigorous but costs you trades: price stops a few pips short, or pokes a few pips through, and a line-trader reads that as 'the level failed'.",
        "Zone width scales with volatility. A useful habit: express the zone width and the reaction size in units of **N** (the Turtles' daily volatility measure, Unit 9) so levels on quiet and wild pairs are comparable.",
        "Your stop never goes *inside* the zone — it goes beyond the far edge, where being wrong is actually proven."
      ],
      ex: { p: "Explain why levels should be zones, how you draw one, and where your stop belongs relative to it.",
        r: ["Orders are spread over a band of prices", "Zone = body cluster to wick extreme", "Lines create false 'failures' from a few pips of noise", "Stop goes beyond the far edge of the zone"],
        m: "The orders behind a level aren't stacked at one exact price — they're spread across a band. So I draw a zone from where the candle bodies turned to where the wick reached. A single line makes me think a level failed when price only overshot by a few pips. And my stop goes beyond the far edge of the zone, not inside it." },
      q: [
        { k: "mcq", q: "A zone is best drawn from…", o: ["The close to the open of one candle", "The body cluster to the wick extreme", "Round number to round number", "The 20-day high to the 20-day low"], a: 1, w: "Bodies show where most business was done; wicks show the extreme." },
        { k: "mcq", q: "Where does a stop belong for a trade off a support zone?", o: ["In the middle of the zone", "Just beyond the far edge of the zone", "Exactly on the line", "Above entry"], a: 1, w: "Beyond the point where the level is proven wrong." },
        { k: "mcq", q: "Measuring zone width in N (volatility units) helps because…", o: ["It looks professional", "It makes levels comparable across quiet and volatile pairs", "Brokers require it", "It removes losses"], a: 1, w: "A 30-pip zone means very different things on AUD/NZD and GBP/JPY." }
      ],
      yt: ["supply and demand zones how to draw correctly"],
      src: ["design", "turtle"] },

    { id: "w07c", t: "Scoring Level Quality",
      big: "Not all levels are equal. Score them on the same few criteria every time, so choosing a level becomes a rubric rather than a matter of taste.",
      plain: "Rating restaurants: stars for food, service, price and location add up to a score you can compare — instead of 'I just like that one'.",
      body: [
        "A simple 10-point rubric you can refine with data:",
        "• **Prior reactions** (0–3): how many clean turns from this zone?",
        "• **Recency** (0–2): recent levels carry more live inventory.",
        "• **Reaction size** (0–3): how far did price travel away, measured in N?",
        "• **Confluence** (0–2): does it line up with a round number, a session high/low, or a higher-timeframe level?",
        "Scores let you ask a real question later: *do 8/10 levels actually hold better than 4/10 levels?* If the answer is no, your rubric is decoration and you change it.",
        "> Any criterion you can't define precisely enough to score the same way twice doesn't belong in the rubric."
      ],
      ex: { p: "Describe your level-scoring rubric and explain how you'd find out whether it actually works.",
        r: ["Lists concrete criteria (reactions, recency, reaction size, confluence)", "Each criterion scored the same way every time", "Test: compare hold-rates of high vs low scores", "Change the rubric if scores don't predict anything"],
        m: "I score each level out of ten: prior reactions, how recent it is, how big the reactions were measured in N, and whether it lines up with things like round numbers or session highs. Then I check my data: if high-scoring levels don't hold better than low-scoring ones, the rubric is useless and I change it." },
      q: [
        { k: "mcq", q: "Why score levels with a fixed rubric?", o: ["To make charts prettier", "To make level choice consistent and testable", "Because brokers need it", "To trade more"], a: 1, w: "Consistency lets you test whether the scores mean anything." },
        { k: "mcq", q: "How do you know if your rubric works?", o: ["It feels right", "High-scoring levels hold measurably better than low-scoring ones in your data", "A YouTuber uses it", "It has many criteria"], a: 1, w: "The data decides." },
        { k: "mcq", q: "Which criterion does NOT belong in a rubric?", o: ["Number of prior reactions", "Reaction size in N", "'It looks strong to me'", "Confluence with a round number"], a: 2, w: "If you can't score it the same way twice, it isn't a criterion." }
      ],
      yt: ["how to rate support and resistance levels strength"],
      src: ["design"] }
  ],
  P: { task: "Test whether levels weaken with each touch — on the pairs you believe respect structure.",
    steps: [
      "On AUD/NZD 4H, find five levels price respected at least twice in the last six months. For each, write what orders probably rested there — limits from people who wanted that price, stops from people proven wrong there.",
      "On AUD/NZD, NZD/USD and USD/CAD (4H, last six months), mark 25 zones from body cluster to wick extreme. For each, record the reaction in pips on the first, second and third touch.",
      "Score every zone with your rubric. Average the reaction per touch — does it shrink with touches? Do high-scoring zones react more?"
    ],
    tools: ["tv", "journal"],
    num: [
      { k: "t1", l: "Average reaction, 1st touch (pips)", t: "number" },
      { k: "t2", l: "Average reaction, 2nd touch (pips)", t: "number" },
      { k: "t3", l: "Average reaction, 3rd touch (pips)", t: "number" },
      { k: "n", l: "Zones measured", t: "number" }
    ] },
  R: "Send your touch-decay table. Then tell me — using your table, not a video — whether you should be trading the first touch or the third."
});

COURSE.week({
  n: 8, mod: "102", t: "Liquidity and the Sweep",
  aim: "See the mechanism behind the move that kept stopping you out last time.",
  gate: "g1",
  L: [
    { id: "w08a", t: "Where Stops Live",
      big: "Stops cluster in predictable places — just beyond swing highs and lows, round numbers and session extremes. Large orders need that clustered liquidity to fill, so price is drawn toward it.",
      plain: "A big fishing boat goes where the fish school, not where one fish swims. Big orders go where the stops school.",
      dia: "stopPools",
      body: [
        "Above a swing high sit **buy stops**: short sellers' stop losses and breakout buyers' entry orders. Below a swing low sit **sell stops**.",
        "Now think like a large seller. To sell a lot without crushing the price, you need buyers. Where are buyers guaranteed to appear? Just above the obvious high, where all those buy stops trigger at once. So a push above a high can be exactly the moment a big seller fills.",
        "This isn't a conspiracy against you. It's the plumbing: liquidity is where the orders are, and orders are where people predictably put them.",
        "> The practical question isn't 'why did they hunt my stop?' It's 'why was my stop exactly where everyone else's was?'"
      ],
      ex: { p: "Explain where stops tend to cluster and why price is often drawn to those places.",
        r: ["Buy stops above swing highs; sell stops below swing lows (also round numbers, session extremes)", "Large orders need opposing liquidity to fill", "Triggered stops provide that liquidity", "It's mechanics, not targeting — so place stops thoughtfully"],
        m: "Stops gather just above swing highs and just below swing lows, and around round numbers and session highs and lows. A big trader who wants to sell needs lots of buyers, and when price pushes above an obvious high, all the buy stops there fire and provide those buyers. So price gets drawn toward those pools — not to punish me, but because that's where the liquidity is." },
      q: [
        { k: "mcq", q: "Just above a clear swing high you'll typically find…", o: ["Sell limit orders only", "Buy stops (short sellers' stops and breakout buys)", "Nothing", "Central bank orders"], a: 1, w: "Shorts protect themselves there; breakout traders enter there." },
        { k: "mcq", q: "Why might a big seller welcome a push above a swing high?", o: ["It raises the spread", "Triggered buy stops provide buyers to sell into", "It lowers volatility", "Brokers pay a bonus"], a: 1, w: "Liquidity to fill against." },
        { k: "mcq", q: "The better question after being swept is…", o: ["Who hunted me?", "Why was my stop where everyone else's was?", "Should I stop using stops?", "Which broker is cheating?"], a: 1, w: "It's about placement, not persecution." }
      ],
      yt: ["liquidity pools stop hunts explained order flow"],
      src: ["conv"] },

    { id: "w08b", t: "Sweep Versus Genuine Break",
      big: "A sweep pokes beyond a level, triggers the stops and closes back inside; a genuine break closes beyond and follows through. The evidence is in the close, the speed of the return, and what the next candles do.",
      plain: "A bouncer stepping outside the door and straight back in, versus actually leaving the building.",
      dia: "sweepBreak",
      body: [
        "Evidence for a **sweep**: a wick beyond the level but a close back inside; a fast return (within one to three candles); no follow-through.",
        "Evidence for a **genuine break**: a body close beyond the level; price holds beyond it; the next candles extend in the break direction.",
        "Write your own **two-condition test** now, before you look at any data — so the data can disagree with you. For example: 'A sweep is a wick beyond the swing point with a close back inside, AND price back inside within three candles.'",
        "This is also why Turtle-style touch entries suffer false breakouts: a stop order above the high gets filled by the sweep itself. That's the tax the Turtles accepted in exchange for never missing a real break."
      ],
      ex: { p: "Explain how to tell a sweep from a genuine break, and state your own two-condition test.",
        r: ["Sweep: wick beyond, close back inside, quick return, no follow-through", "Break: body close beyond, holds, extends", "States a precise two-condition test", "Links to why touch entries suffer false breakouts"],
        m: "A sweep goes through a level with a wick, triggers the stops, and closes back inside, usually returning within a few candles. A real break closes beyond the level and keeps going. My test: a wick beyond the swing point with a close back inside, and price back inside within three candles. Touch entries like the Turtles' get filled by sweeps, which is the cost of never missing a real breakout." },
      q: [
        { k: "mcq", q: "Which is stronger evidence of a sweep?", o: ["A body close beyond the level", "A wick beyond with a close back inside", "Three candles extending beyond", "Rising volume"], a: 1, w: "Closing back inside is the signature." },
        { k: "mcq", q: "Why write your sweep test before looking at data?", o: ["It's faster", "So the data can disagree with you instead of being bent to fit", "Brokers require it", "It isn't necessary"], a: 1, w: "Definitions written after seeing data get curve-fitted." },
        { k: "mcq", q: "Why do Turtle-style stop-order entries suffer from sweeps?", o: ["They use limit orders", "The sweep itself triggers the entry stop", "They trade too slowly", "They don't"], a: 1, w: "Entry on the touch = filled by the poke." }
      ],
      yt: ["liquidity sweep vs breakout how to tell the difference"],
      src: ["design", "turtle"] },

    { id: "w08c", t: "Imbalance and Fair Value Gaps",
      big: "When price moves so fast that one candle leaves a band of prices barely traded, that band — an imbalance or fair value gap — holds few resting orders, and price often returns to it.",
      plain: "An express train skips stations. The stations are still there, and the local train comes back later to serve them.",
      dia: "fvg",
      body: [
        "= Bullish FVG: candle 1's HIGH is below candle 3's LOW. The gap between them is the imbalance. (Mirror for bearish.)",
        "The middle candle moved so fast that almost no business was done in that band. Mechanically, it's a zone with thin resting orders — a vacuum price can travel through easily, which is why it often gets revisited.",
        "Often isn't always. Some gaps are filled within hours; some never are. So — as with everything in this module — you define it precisely and count.",
        "An honest note on vocabulary: 'fair value gap', 'order block', 'liquidity sweep' come from Smart Money Concepts and ICT. They're useful *descriptions* of liquidity behaviour. They are not access to institutional order flow, and they are not an edge until your own data says they are."
      ],
      ex: { p: "Define a bullish fair value gap precisely, explain why price often returns to it, and say what makes it an edge (or not).",
        r: ["Three-candle definition: candle 1 high below candle 3 low", "The band had little trading → few resting orders", "Price often revisits; not always", "Only an edge if your own counted data says so"],
        m: "A bullish fair value gap is when the high of the first candle is below the low of the third candle, leaving a band the middle candle skipped through. Very little trading happened there, so there are few orders to stop price when it comes back, and it often gets revisited. But 'often' isn't a rule — it only becomes an edge if my own counts show it." },
      q: [
        { k: "mcq", q: "A bullish FVG exists when…", o: ["Candle 1 low is above candle 3 high", "Candle 1 high is below candle 3 low", "Candle 2 is a doji", "Three candles close up"], a: 1, w: "The gap between candle 1's high and candle 3's low." },
        { k: "mcq", q: "Why is price often drawn back into an FVG?", o: ["Brokers close gaps", "The band has few resting orders, so price moves through it easily", "It's a rule", "Indicators point to it"], a: 1, w: "Thin inventory = easy travel." },
        { k: "mcq", q: "When does an SMC/ICT concept become an edge for you?", o: ["When it has a name", "When a famous trader uses it", "When your own counted data shows positive expectancy", "Never"], a: 2, w: "Names aren't edges. Data is." }
      ],
      yt: ["fair value gap imbalance explained"],
      src: ["design", "conv"] }
  ],
  P: { task: "Measure what happens after a sweep — then sit Gate 1.",
    steps: [
      "On two pairs (1H, last three months), mark 30 clear swing points. Beside each, note any round number or session high or low nearby — the places stops pile up.",
      "Write your two-condition sweep test. Go through your 30 points: which were swept (a wick beyond, then a close back inside within three candles)? For each sweep, record whether price then moved the other way by more than the sweep's own distance within 20 candles.",
      "Compute your sweep percentage and sample size. Then find ten fair value gaps on the same charts and count how many price came back to within 20 candles."
    ],
    tools: ["tv", "journal"],
    num: [
      { k: "rev", l: "Sweeps that reversed by more than their own distance (%)", t: "number" },
      { k: "n", l: "Sample size", t: "number" }
    ] },
  R: "Send your sweep percentage and sample size — then sit Gate 1: reading charts cold, with no indicators."
});
