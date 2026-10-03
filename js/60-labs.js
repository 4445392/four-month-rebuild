/* ============================================================
   LABS — interactive practicals: position size, expectancy,
   recovery, streaks, Monte Carlo, and randomised math drills.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const LABS = [
    ["size", "Position Size", "Stop first, size second — and the Turtle unit."],
    ["expectancy", "Expectancy", "Win rate × win size: where the edge actually lives."],
    ["recovery", "Recovery", "Why deep drawdowns are almost unrecoverable."],
    ["streaks", "Streaks", "The losing streak your plan must survive."],
    ["mc", "Monte Carlo", "Thousands of futures from one edge — and the size dial."],
    ["drills", "Math Drills", "Endless fresh calculations, marked instantly."]
  ];
  const L = window.LABSTATE = { size: { acct: 10000, risk: 1, quote: "USD", rate: 1, stop: 25, mode: "stop", N: 70 }, exp: { w: 40, aw: 2.5, al: 1, c: 0 }, rec: { dd: 30 }, str: { w: 40, n: 200, k: 7 },
    mc: { w: 40, aw: 2, al: 1, risk: 1, n: 200, runs: 2000, dd: 30 }, dr: { cat: "all", q: null, ans: null, ok: null, streak: 0, done: 0, right: 0 } };

  VIEWS.labs = {
    render: function (p) {
      const key = p.id || "size";
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Practicals</div><h1>Labs</h1><p class='lede'>Drag the dials and watch the numbers move. Everything here is exact arithmetic or simulation — no opinions.</p></header>";
      h += "<nav class='labnav'>" + LABS.map(function (l) { return "<a class='labtab" + (l[0] === key ? " on" : "") + "' href='#/labs/" + l[0] + "'><b>" + esc(l[1]) + "</b><span>" + esc(l[2]) + "</span></a>"; }).join("") + "</nav>";
      h += "<section class='panel lab' id='lab-body'>" + (LABVIEW[key] ? LABVIEW[key]() : "") + "</section>";
      return h + "</div>";
    }
  };
  const rerender = function (key) { const b = U.$("#lab-body"); if (b) b.innerHTML = LABVIEW[key](); };
  const slider = function (id, label, min, max, step, val, key, unit) {
    return "<label class='slider'><span>" + esc(label) + " <b id='" + id + "-v'>" + val + (unit || "") + "</b></span><input type='range' id='" + id + "' min='" + min + "' max='" + max + "' step='" + step + "' value='" + val + "' data-inp='labIn' data-lab='" + key + "' data-k='" + id.split("-")[1] + "' data-unit='" + (unit || "") + "'></label>";
  };
  const numIn = function (id, label, val, key, step) { return "<label class='fld'><span>" + esc(label) + "</span><input type='number' id='" + id + "' step='" + (step || "any") + "' value='" + val + "' data-chg='labIn' data-lab='" + key + "' data-k='" + id.split("-")[1] + "'></label>"; };
  ACT.labIn = function (el) {
    const lab = el.dataset.lab, k = el.dataset.k, v = el.type === "range" || el.type === "number" ? parseFloat(el.value) : el.value;
    const map = { size: L.size, expectancy: L.exp, recovery: L.rec, streaks: L.str, mc: L.mc };
    if (!map[lab]) return;
    if (typeof v === "string" || isFinite(v)) map[lab][k] = v;
    if (el.type === "range") {
      const o = U.$("#" + el.id + "-v"); if (o) o.textContent = el.value + (el.dataset.unit || "");
      if (lab === "mc") scheduleMC(); else outputs(lab);
      return;
    }
    if (lab === "size" && (k === "quote")) { rerender(lab); return; }
    outputs(lab);
  };
  const outputs = function (lab) { const o = U.$("#lab-out"); if (o && OUT[lab]) o.innerHTML = OUT[lab](); };
  const scheduleMC = U.debounce(function () { outputs("mc"); }, 220);

  const LABVIEW = {}, OUT = {};

  /* ----- Position size ----- */
  LABVIEW.size = function () {
    const s = L.size;
    let h = "<div class='labgrid'><div class='inputs'>";
    h += "<div class='seg'><button class='segb" + (s.mode === "stop" ? " on" : "") + "' data-act='labSet' data-lab='size' data-k='mode' data-v='stop'>Stop-based size</button><button class='segb" + (s.mode === "turtle" ? " on" : "") + "' data-act='labSet' data-lab='size' data-k='mode' data-v='turtle'>Turtle unit (N)</button></div>";
    h += numIn("sz-acct", "Account (USD)", s.acct, "size", 100) + numIn("sz-risk", s.mode === "stop" ? "Risk per trade (%)" : "Risk per N (%) — Turtles 1, course 0.5", s.risk, "size", 0.05);
    h += "<label class='fld'><span>Quote currency (the second in the pair)</span><select id='sz-quote' data-chg='labIn' data-lab='size' data-k='quote'>" + [["USD", "USD — e.g. EUR/USD, GBP/USD"], ["JPY", "JPY — e.g. USD/JPY, GBP/JPY"], ["OTHER", "Other — e.g. USD/CAD, EUR/GBP"]].map(function (o) { return "<option value='" + o[0] + "'" + (s.quote === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>";
    if (s.quote !== "USD") h += numIn("sz-rate", s.quote === "JPY" ? "USD/JPY rate (yen per dollar)" : "Quote currency per 1 USD (e.g. USD/CAD 1.35; for GBP use 1 ÷ GBP/USD)", s.rate, "size");
    h += s.mode === "stop" ? numIn("sz-stop", "Stop distance (pips)", s.stop, "size", 1) : numIn("sz-N", "N — 20-day average true range (pips)", s.N, "size", 1);
    return h + "</div><div class='outputs' id='lab-out'>" + OUT.size() + "</div></div>";
  };
  OUT.size = function () {
    const s = L.size;
    const pip = s.quote === "JPY" ? 0.01 : 0.0001;
    const rate = s.quote === "USD" ? 1 : (s.rate || 1);
    const pvQuote = pip * 100000, pv = pvQuote / rate;
    const risk = s.acct * s.risk / 100;
    const dist = s.mode === "stop" ? s.stop : 2 * s.N;
    const perLot = dist * pv;
    const raw = s.mode === "stop" ? risk / perLot : (s.acct * s.risk / 100) / (s.N * pv);
    if (!isFinite(raw) || raw <= 0) return "<p class='badt'>Enter positive numbers for every field.</p>";
    const lots = Math.floor(raw * 100 + 1e-9) / 100;
    const actual = lots * perLot;
    let h = "<div class='flow'>" +
      "<div class='fstep'><span>Money at risk</span><b>" + U.money(risk) + "</b><small>" + U.money(s.acct) + " × " + s.risk + "%</small></div>" +
      "<div class='fstep'><span>Pip value per lot</span><b>$" + pv.toFixed(2) + "</b><small>" + pip + " × 100,000 = " + pvQuote.toFixed(0) + " " + (s.quote === "OTHER" ? "quote units" : s.quote) + (rate !== 1 ? " ÷ " + rate : "") + "</small></div>" +
      "<div class='fstep'><span>" + (s.mode === "stop" ? "Lost per lot at the stop" : "Money per lot per 1N") + "</span><b>$" + (s.mode === "stop" ? perLot : s.N * pv).toFixed(2) + "</b><small>" + (s.mode === "stop" ? s.stop + " pips × $" + pv.toFixed(2) : s.N + " pips × $" + pv.toFixed(2)) + "</small></div>" +
      "<div class='fstep result'><span>Size</span><b>" + lots.toFixed(2) + " lots</b><small>" + raw.toFixed(4) + " → rounded down</small></div></div>";
    h += "<div class='kv'><div><span>Risk at the stop with " + lots.toFixed(2) + " lots</span><b>" + U.money(actual) + " (" + (100 * actual / s.acct).toFixed(2) + "%)</b></div>" +
      (s.mode === "turtle" ? "<div><span>Stop at 2N (" + (2 * s.N) + " pips) risks</span><b>" + (2 * s.risk).toFixed(2) + "% per unit</b></div><div><span>A full 4-unit position stopped after all adds</span><b>up to " + (5 * s.risk).toFixed(1) + "%</b></div>" : "") +
      "<div><span>One pip at this size is worth</span><b>$" + (lots * pv).toFixed(2) + "</b></div></div>";
    h += "<p class='small muted'>" + (s.mode === "stop" ? "Decide the stop from the chart first — then this is pure arithmetic. Always round down." : "A full Turtle pyramid stopped out after all four adds loses 5N per unit — 2.5× the first unit's 2N risk. That's why the course sizes at 0.5% per N.") + "</p>";
    return h;
  };
  ACT.labSet = function (el) { L.size[el.dataset.k] = el.dataset.v; if (el.dataset.k === "mode") L.size.risk = el.dataset.v === "turtle" ? 0.5 : 1; rerender("size"); };

  /* ----- Expectancy ----- */
  LABVIEW.expectancy = function () {
    const e = L.exp;
    return "<div class='labgrid'><div class='inputs'>" + slider("ex-w", "Win rate", 10, 90, 1, e.w, "expectancy", "%") + slider("ex-aw", "Average win", 0.5, 6, 0.1, e.aw, "expectancy", "R") +
      slider("ex-al", "Average loss", 0.5, 2, 0.05, e.al, "expectancy", "R") + slider("ex-c", "Costs per trade", 0, 0.3, 0.01, e.c, "expectancy", "R") + "</div><div class='outputs' id='lab-out'>" + OUT.expectancy() + "</div></div>";
  };
  OUT.expectancy = function () {
    const e = L.exp, w = e.w / 100;
    const E = w * e.aw - (1 - w) * e.al - e.c;
    const be = (e.al + e.c) / (e.aw + e.al);
    let h = "<div class='hero-num " + (E >= 0 ? "pos" : "neg") + "'>" + U.fmtR(E) + "<small>per trade</small></div>";
    h += "<div class='kv'><div><span>Per 100 trades</span><b>" + U.fmtR(100 * E, 0) + "</b></div><div><span>At 1% risk, roughly</span><b>" + (E >= 0 ? "+" : "−") + Math.abs(100 * E).toFixed(0) + "% (before compounding)</b></div><div><span>Break-even win rate here</span><b>" + (100 * be).toFixed(1) + "%</b></div></div>";
    h += beChart(e, w);
    return h + "<p class='small muted'>" + (E >= 0 ? "Above the curve: positive expectancy. " : "Below the curve: no discipline can rescue this system. ") + "Try 30% at 3R against 60% at 1R — identical expectancy, completely different experience.</p>";
  };
  function beChart(e, w) {
    const W = 460, H = 240, x = function (r) { return 50 + (r - 0.5) * (W - 70) / 5.5; }, y = function (p) { return 16 + (1 - p) * (H - 46); };
    const curve = []; for (let r = 0.5; r <= 6.0001; r += 0.05) curve.push([x(r), y(Math.min(1, (e.al + e.c) / (r + e.al)))]);
    let s = "<path d='M" + x(0.5) + "," + y(1) + " L" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L") + " L" + x(6) + "," + y(1) + " z' class='washup'/>";
    s += "<path d='M" + x(0.5) + "," + y(0) + " L" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L") + " L" + x(6) + "," + y(0) + " z' class='washdn'/>";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (p) { s += "<line x1='50' x2='" + (W - 20) + "' y1='" + y(p) + "' y2='" + y(p) + "' class='gl'/><text x='44' y='" + (y(p) + 4) + "' class='ax' text-anchor='end'>" + (p * 100) + "%</text>"; });
    [1, 2, 3, 4, 5, 6].forEach(function (r) { s += "<text x='" + x(r) + "' y='" + (H - 12) + "' class='ax' text-anchor='middle'>" + r + "R</text>"; });
    s += "<polyline points='" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + "' class='ln ser-ink' fill='none'/>";
    s += "<circle cx='" + x(Math.min(6, e.aw)) + "' cy='" + y(w) + "' r='6' class='end ser-acc'/>";
    s += "<text x='" + (W - 24) + "' y='34' class='ax' text-anchor='end'>positive expectancy</text><text x='" + (W - 24) + "' y='" + (H - 34) + "' class='ax' text-anchor='end'>negative expectancy</text>";
    return "<div class='svgc'><svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Break-even win rate curve with your system plotted'>" + s + "</svg><div class='cap'>Your system (dot) against the break-even curve for your average loss and costs. Win rate up the side, average win along the bottom.</div></div>";
  }

  /* ----- Recovery ----- */
  LABVIEW.recovery = function () {
    return "<div class='labgrid'><div class='inputs'>" + slider("rc-dd", "Drawdown", 1, 90, 1, L.rec.dd, "recovery", "%") + "</div><div class='outputs' id='lab-out'>" + OUT.recovery() + "</div></div>";
  };
  OUT.recovery = function () {
    const d = L.rec.dd / 100, g = d / (1 - d);
    let h = "<div class='hero-num neg'>+" + (100 * g).toFixed(1) + "%<small>gain needed to get back</small></div>";
    const trades = function (edge) { return Math.log(1 / (1 - d)) / Math.log(1 + edge); };
    h += "<div class='kv'><div><span>At +0.3R per trade and 1% risk (≈ +0.3% a trade)</span><b>≈ " + Math.ceil(trades(0.003)) + " trades to recover</b></div><div><span>At +0.3R and 2% risk</span><b>≈ " + Math.ceil(trades(0.006)) + " trades</b></div></div>";
    const W = 460, H = 220, x = function (l) { return 50 + l * (W - 70) / 90; }, y = function (v) { return 14 + (1 - Math.min(v, 9) / 9) * (H - 42); };
    const curve = []; for (let l = 0; l <= 90; l += 1) curve.push([x(l), y((l / 100) / (1 - l / 100))]);
    let s = "";
    [0, 1, 3, 5, 7, 9].forEach(function (v) { s += "<line x1='50' x2='" + (W - 20) + "' y1='" + y(v) + "' y2='" + y(v) + "' class='gl'/><text x='44' y='" + (y(v) + 4) + "' class='ax' text-anchor='end'>" + (v * 100) + "%</text>"; });
    [0, 20, 40, 60, 80].forEach(function (l) { s += "<text x='" + x(l) + "' y='" + (H - 10) + "' class='ax' text-anchor='middle'>−" + l + "%</text>"; });
    s += "<polyline points='" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + "' class='ln ser-acc' fill='none'/>";
    s += "<circle cx='" + x(L.rec.dd) + "' cy='" + y(g) + "' r='6' class='end ser-acc'/>";
    return h + "<div class='svgc'><svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Gain needed to recover from each drawdown'>" + s + "</svg><div class='cap'>Required gain = L ÷ (1 − L), drawdown along the bottom. The curve goes vertical — keep the holes shallow.</div></div>";
  };

  /* ----- Streaks ----- */
  function pRun(n, k, q) {
    let dist = new Array(k).fill(0); dist[0] = 1; let abs = 0;
    for (let t = 0; t < n; t++) { const nd = new Array(k).fill(0); for (let r = 0; r < k; r++) { const p = dist[r]; if (!p) continue; nd[0] += p * (1 - q); if (r + 1 >= k) abs += p * q; else nd[r + 1] += p * q; } dist = nd; }
    return abs;
  }
  LABVIEW.streaks = function () {
    const s = L.str;
    return "<div class='labgrid'><div class='inputs'>" + slider("st-w", "Win rate", 20, 80, 1, s.w, "streaks", "%") + slider("st-n", "Number of trades", 20, 500, 10, s.n, "streaks", "") + slider("st-k", "Losing streak length", 3, 20, 1, s.k, "streaks", "") + "</div><div class='outputs' id='lab-out'>" + OUT.streaks() + "</div></div>";
  };
  OUT.streaks = function () {
    const s = L.str, q = 1 - s.w / 100;
    const Pk = pRun(s.n, s.k, q);
    const rng = ENGINE.mulberry32(777 + s.w * 1000 + s.n);
    const longest = [];
    for (let r = 0; r < 3000; r++) { let best = 0, cur = 0; for (let t = 0; t < s.n; t++) { if (rng() < q) { cur++; if (cur > best) best = cur; } else cur = 0; } longest.push(best); }
    longest.sort(function (a, b) { return a - b; });
    const med = longest[1500], p90 = longest[2700], p99 = longest[2970];
    let h = "<div class='hero-num'>" + (100 * Pk).toFixed(1) + "%<small>chance of at least one run of " + s.k + "+ losses in " + s.n + " trades</small></div>";
    h += "<div class='kv'><div><span>Typical longest losing run</span><b>" + med + "</b></div><div><span>1 run in 10 sees</span><b>" + p90 + "+</b></div><div><span>1 run in 100 sees</span><b>" + p99 + "+</b></div></div>";
    const items = []; for (let k = 3; k <= Math.min(18, Math.max(12, p99 + 2)); k++) items.push({ label: k + "+", value: 100 * pRun(s.n, k, q), cls: k === s.k ? "ba" : "bn" });
    h += SVGC.bars(items, { w: 460, h: 200, fmt: function (v) { return v.toFixed(0) + "%"; }, label: "Chance of a losing streak of each length", caption: "Chance of at least one losing streak of each length (exact), with your chosen length highlighted." });
    return h + "<p class='small muted'>Write the 1-in-10 number into your system as the streak your plan must survive. When it arrives, it's an expected event — not a reason to quit.</p>";
  };

  /* ----- Monte Carlo ----- */
  function runMC(w, aw, al, risk, n, runs, ddCut, seed) {
    const rng = ENGINE.mulberry32(seed || 12345);
    const stride = Math.max(1, Math.floor(n / 100));
    const cols = []; for (let t = 0; t <= n; t += stride) cols.push(new Float64Array(runs));
    const mdds = new Float64Array(runs), finals = new Float64Array(runs);
    let hits = 0;
    for (let r = 0; r < runs; r++) {
      let eq = 1, peak = 1, mdd = 0; cols[0][r] = 1;
      for (let t = 1; t <= n; t++) {
        eq *= rng() < w ? 1 + risk * aw : 1 - risk * al;
        if (eq > peak) peak = eq; const dd = 1 - eq / peak; if (dd > mdd) mdd = dd;
        if (t % stride === 0 && cols[t / stride]) cols[t / stride][r] = eq;
      }
      mdds[r] = mdd; finals[r] = eq; if (mdd >= ddCut) hits++;
    }
    const sorted = function (arr) { return Array.prototype.slice.call(arr).sort(function (x, y) { return x - y; }); };
    const q = function (a, p) { return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
    const bands = { p5: [], p25: [], p50: [], p75: [], p95: [] };
    cols.forEach(function (c) { const a = sorted(c); bands.p5.push(100 * (q(a, 0.05) - 1)); bands.p25.push(100 * (q(a, 0.25) - 1)); bands.p50.push(100 * (q(a, 0.5) - 1)); bands.p75.push(100 * (q(a, 0.75) - 1)); bands.p95.push(100 * (q(a, 0.95) - 1)); });
    const sm = sorted(mdds), sf = sorted(finals);
    return { medDD: q(sm, 0.5), p95DD: q(sm, 0.95), worst: sm[sm.length - 1], pHit: hits / runs, medFinal: q(sf, 0.5), p5Final: q(sf, 0.05), bands: bands, stride: stride };
  }
  LABVIEW.mc = function () {
    const m = L.mc;
    return "<div class='labgrid'><div class='inputs'>" + slider("mc-w", "Win rate", 20, 80, 1, m.w, "mc", "%") + slider("mc-aw", "Average win", 0.5, 5, 0.1, m.aw, "mc", "R") + slider("mc-al", "Average loss", 0.5, 1.5, 0.05, m.al, "mc", "R") +
      slider("mc-risk", "Risk per trade", 0.25, 10, 0.25, m.risk, "mc", "%") + slider("mc-dd", "The drawdown you couldn't live with", 10, 60, 5, m.dd, "mc", "%") +
      "<p class='small muted'>" + m.runs.toLocaleString() + " runs of " + m.n + " trades each.</p></div><div class='outputs' id='lab-out'>" + OUT.mc() + "</div></div>";
  };
  OUT.mc = function () {
    const m = L.mc;
    const E = (m.w / 100) * m.aw - (1 - m.w / 100) * m.al;
    const r = runMC(m.w / 100, m.aw, m.al, m.risk / 100, m.n, m.runs, m.dd / 100, 4242);
    let h = "<div class='hero-num " + (r.pHit > 0.1 ? "neg" : "") + "'>" + (100 * r.pHit).toFixed(1) + "%<small>of futures hit a " + m.dd + "% drawdown · expectancy " + U.fmtR(E) + " per trade</small></div>";
    const sgn = function (x) { return (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(0) + "%"; };
    h += "<div class='kv'><div><span>Typical worst drawdown</span><b>" + (100 * r.medDD).toFixed(1) + "%</b></div><div><span>Worst 1 in 20</span><b>" + (100 * r.p95DD).toFixed(1) + "%</b></div><div><span>Worst of all runs</span><b>" + (100 * r.worst).toFixed(1) + "%</b></div>" +
      "<div><span>Median result</span><b>" + sgn((r.medFinal - 1) * 100) + "</b></div><div><span>Unlucky 1 in 20</span><b>" + sgn((r.p5Final - 1) * 100) + "</b></div></div>";
    h += SVGC.line([{ values: r.bands.p50, cls: "ser-acc", label: "Median" }, { values: r.bands.p5, cls: "ser-soft", label: "Unlucky 5%", dot: false }, { values: r.bands.p95, cls: "ser-soft2", label: "Lucky 5%", dot: false }],
      { w: 460, h: 220, fmt: function (v) { return v.toFixed(0) + "%"; }, unit: "%", band: { lo: r.bands.p25, hi: r.bands.p75, cls: "bandw" }, xfmt: function (t) { return String(Math.round(t * r.stride)); }, label: "Account change across simulated futures", caption: "Account change by trade number: median, middle 50% (shaded), and the lucky and unlucky 5%." });
    const rows = [0.5, 1, 2, 5].map(function (rk) { const x = runMC(m.w / 100, m.aw, m.al, rk / 100, m.n, 1200, m.dd / 100, 99); return "<tr" + (rk === m.risk ? " class='hl'" : "") + "><td class='num'>" + rk + "%</td><td class='num'>" + (100 * x.medDD).toFixed(0) + "%</td><td class='num'>" + (100 * x.p95DD).toFixed(0) + "%</td><td class='num'>" + (100 * x.pHit).toFixed(1) + "%</td><td class='num'>" + sgn((x.medFinal - 1) * 100) + "</td></tr>"; }).join("");
    h += "<div class='tablewrap' tabindex='0'><table class='tbl'><thead><tr><th>Risk</th><th>Typical worst DD</th><th>1-in-20 DD</th><th>Chance of " + m.dd + "% DD</th><th>Median result</th></tr></thead><tbody>" + rows + "</tbody></table></div>";
    return h + "<p class='small muted'>Same edge, same trades — only the size changes. Your backtest is one of these futures; plan for the unlucky ones.</p>";
  };

  /* ----- Math drills ----- */
  const CATS = [["all", "Everything"], ["size", "Position size"], ["r", "R and expectancy"], ["risk", "Recovery & break-even"], ["turtle", "N and units"]];
  const CATGEN = { size: ["sizeUSD", "sizeJPY", "pipJPY"], r: ["expectancy", "rLong", "rShortSlip"], risk: ["breakeven", "recovery"], turtle: ["nUpdate", "unit"] };
  LABVIEW.drills = function () {
    const d = L.dr;
    if (!d.q) newDrill();
    let h = "<div class='row wrap'>" + CATS.map(function (c) { return "<button class='btn sm " + (d.cat === c[0] ? "primary" : "ghost") + "' data-act='drillCat' data-c='" + c[0] + "'>" + esc(c[1]) + "</button>"; }).join("") + "</div>";
    h += "<div class='kv'><div><span>Answered</span><b>" + d.done + "</b></div><div><span>Right</span><b>" + d.right + "</b></div><div><span>Accuracy</span><b>" + (d.done ? U.pct(d.right / d.done) : "—") + "</b></div><div><span>Streak</span><b>" + d.streak + "</b></div></div>";
    const q = d.q;
    h += "<div class='q" + (d.ok === null ? "" : d.ok ? " right" : " wrong") + "'><div class='qq'><span class='qn'>" + esc(q.t) + "</span>" + esc(q.q) + "</div><div class='row'><input id='dr-ans' class='numin' type='number' step='any' value='" + esc(d.ans === null ? "" : d.ans) + "'" + (d.ok !== null ? " disabled" : "") + " aria-label='Your answer'>" + (q.u ? "<span class='unit'>" + esc(q.u) + "</span>" : "") +
      (d.ok === null ? "<button class='btn primary' data-act='drillCheck'>Check</button>" : "<button class='btn primary' data-act='drillNext'>Next question</button>") + "</div>" +
      (d.ok !== null ? "<div class='why'><b>" + (d.ok ? "Right." : "Answer: " + q.a) + "</b> " + esc(q.w) + "</div>" : "") + "</div>";
    return h + "<p class='small muted'>Week 9 asks for 20 of these at first-try accuracy. Press Enter to check.</p>";
  };
  function newDrill() { const d = L.dr; const pool = d.cat === "all" ? Object.keys(COURSE.GEN) : CATGEN[d.cat]; d.q = COURSE.GEN[pool[Math.floor(Math.random() * pool.length)]](); d.ans = null; d.ok = null; }
  ACT.drillCat = function (el) { L.dr.cat = el.dataset.c; newDrill(); rerender("drills"); };
  ACT.drillCheck = function () {
    const d = L.dr, v = parseFloat(U.$("#dr-ans").value); if (!isFinite(v)) { U.toast("Enter a number.", "bad"); return; }
    d.ans = v; d.ok = Math.abs(v - d.q.a) <= d.q.tol + 1e-9; d.done++; if (d.ok) { d.right++; d.streak++; } else d.streak = 0;
    rerender("drills"); const b = U.$("[data-act='drillNext']"); if (b) b.focus();
  };
  ACT.drillNext = function () { newDrill(); rerender("drills"); const i = U.$("#dr-ans"); if (i) i.focus(); };
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target && e.target.id === "dr-ans" && L.dr.ok === null) { e.preventDefault(); ACT.drillCheck(); } });
})();
