/* ============================================================
   SIM ENGINE — pure logic, no DOM.
   Synthetic markets with hidden regimes, indicators (TR, N, Donchian,
   swings), an OHLC path broker, the Turtle rules engine, and stats.
   Shared by the Trading Floor, the Labs and the Gate 1 chart exam.
   ============================================================ */
(function (root) {
  "use strict";

  /* ---------- RNG ---------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function Rng(seed) {
    const u = mulberry32(seed);
    let spare = null;
    const r = {
      u: u,
      n: function () {
        if (spare !== null) { const s0 = spare; spare = null; return s0; }
        let x, y, s;
        do { x = u() * 2 - 1; y = u() * 2 - 1; s = x * x + y * y; } while (s >= 1 || s === 0);
        const m = Math.sqrt(-2 * Math.log(s) / s);
        spare = y * m;
        return x * m;
      },
      t: function (nu) {
        let chi = 0;
        for (let i = 0; i < nu; i++) { const z = r.n(); chi += z * z; }
        const t = r.n() / Math.sqrt(chi / nu);
        return t / Math.sqrt(nu / (nu - 2));
      },
      pick: function (w) {
        let s = 0; for (let i = 0; i < w.length; i++) s += w[i];
        let x = u() * s;
        for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return i; }
        return w.length - 1;
      }
    };
    return r;
  }

  /* ---------- Market DNA ----------
     Regimes: 0 Uptrend, 1 Downtrend, 2 Range, 3 Chop.
     vol = baseline daily volatility (fraction). k = trend drift in units of vol.
     w = regime weights, dur = mean regime lengths (bars). */
  const REGIMES = ["Uptrend", "Downtrend", "Range", "Chop"];

  const SPECS = [
    { id: "A", code: "MKT-A", seed: 1062, start: 1.3200, pip: 0.0001, quote: "USD", spread: 1.0,
      vol: 0.0052, k: 0.10, trendVol: 0.9, rangeVol: 0.8, chopVol: 1.25, theta: 0.05, chopTheta: 0.03,
      w: [0.36, 0.36, 0.18, 0.10], dur: [80, 80, 35, 25], nu: 5, shockP: 0.008, shockMin: 2, shockMax: 3.5,
      dna: "The Trender", story: "Long, persistent trends with short pauses. Breakout systems earn their keep here — and still suffer long losing streaks on the way." },
    { id: "B", code: "MKT-B", seed: 1003, start: 1.0850, pip: 0.0001, quote: "USD", spread: 1.6,
      vol: 0.0036, k: 0.08, trendVol: 0.9, rangeVol: 0.85, chopVol: 1.3, theta: 0.03, chopTheta: 0.035,
      w: [0.20, 0.20, 0.46, 0.14], dur: [35, 35, 80, 30], nu: 5, shockP: 0.006, shockMin: 2, shockMax: 3,
      dna: "The Ranger", story: "Mostly ranges that drift back to the middle. Breakouts fail again and again; this is where trend-followers bleed." },
    { id: "C", code: "MKT-C", seed: 1005, start: 1.1000, pip: 0.0001, quote: "USD", spread: 1.0,
      vol: 0.0046, k: 0.09, trendVol: 0.9, rangeVol: 0.85, chopVol: 1.3, theta: 0.05, chopTheta: 0.03,
      w: [0.27, 0.27, 0.30, 0.16], dur: [55, 55, 50, 30], nu: 5, shockP: 0.01, shockMin: 2, shockMax: 3.5,
      dna: "The Mixed Market", story: "Trends, ranges and chop in realistic proportions — closest to a major pair. The edge here is thin, and almost all of it sits in a handful of trades." },
    { id: "D", code: "MKT-D", seed: 1010, start: 152.00, pip: 0.01, quote: "JPY", spread: 2.5,
      vol: 0.0070, k: 0.09, trendVol: 0.95, rangeVol: 0.9, chopVol: 1.5, theta: 0.045, chopTheta: 0.025,
      w: [0.29, 0.29, 0.22, 0.20], dur: [60, 60, 40, 35], nu: 4, shockP: 0.02, shockMin: 2.5, shockMax: 4.5,
      dna: "The Wild One", story: "High volatility, fat tails and frequent shocks, quoted in yen. Few wins, huge ones — and position size must shrink or the swings take you out." },
    { id: "E", code: "MKT-E", seed: 1003, start: 1.2000, pip: 0.0001, quote: "USD", spread: 1.2,
      vol: 0.0027, k: 0.07, trendVol: 0.9, rangeVol: 0.85, chopVol: 1.2, theta: 0.05, chopTheta: 0.03,
      w: [0.18, 0.18, 0.50, 0.14], dur: [40, 40, 75, 30], nu: 5, shockP: 0.004, shockMin: 2, shockMax: 3,
      bigShockAt: 0.71, bigShockSize: -26,
      dna: "Quiet, then the Shock", story: "Years of sleepy ranges, then one day the floor disappears — a gap straight through every stop. A stop is a request, not a guarantee." },
    { id: "F", code: "MKT-F", seed: 1000, start: 1.5000, pip: 0.0001, quote: "USD", spread: 1.2,
      vol: 0.0049, k: 0.11, trendVol: 0.9, rangeVol: 0.8, chopVol: 1.3, theta: 0.05, chopTheta: 0.03,
      w: [0.36, 0.36, 0.18, 0.10], dur: [85, 85, 30, 22], nu: 5, shockP: 0.008, shockMin: 2, shockMax: 3.5,
      phases: [ { to: 0.5 }, { to: 1.0, w: [0.12, 0.12, 0.58, 0.18], dur: [30, 30, 85, 30] } ],
      dna: "The Regime Shift", story: "Trends beautifully for the first half, then turns into a range-bound grind. An edge that worked stops working — and nothing announces it." }
  ];

  function genMarket(spec, seed, n) {
    n = n || 1600;
    seed = (seed === undefined || seed === null) ? spec.seed : seed;
    const R = Rng(seed);
    const o = new Array(n), h = new Array(n), l = new Array(n), c = new Array(n), reg = new Array(n);
    const base = spec.vol;
    const ga = 0.06, gb = 0.9, omega = base * base * (1 - ga - gb);
    let s2 = base * base, eps = 0;
    let logP = Math.log(spec.start), anchor = logP, prevClose = spec.start;
    const phaseOf = function (frac) {
      if (!spec.phases) return { w: spec.w, dur: spec.dur };
      for (let i = 0; i < spec.phases.length; i++) {
        const p = spec.phases[i];
        if (frac < p.to) return { w: p.w || spec.w, dur: p.dur || spec.dur };
      }
      const last = spec.phases[spec.phases.length - 1];
      return { w: last.w || spec.w, dur: last.dur || spec.dur };
    };
    const durFor = function (rg, P) {
      const m = P.dur[rg];
      const d = Math.round((-Math.log(1 - R.u()) - Math.log(1 - R.u())) * m / 2);
      return Math.max(6, d);
    };
    let P0 = phaseOf(0);
    let regime = R.pick(P0.w);
    let left = durFor(regime, P0);
    const bigIdx = spec.bigShockAt ? Math.floor(spec.bigShockAt * n) : -1;
    const digits = spec.pip === 0.01 ? 3 : 5;
    const rnd = function (x) { const f = Math.pow(10, digits); return Math.round(x * f) / f; };
    for (let i = 0; i < n; i++) {
      const P = phaseOf(i / n);
      if (left <= 0) {
        const w = P.w.slice(); w[regime] = 0;
        regime = R.pick(w);
        left = durFor(regime, P);
        if (regime === 2 || regime === 3) anchor = logP;
      }
      left--;
      s2 = omega + ga * eps * eps + gb * s2;
      const vm = regime === 3 ? spec.chopVol : regime === 2 ? spec.rangeVol : spec.trendVol;
      const vol = Math.sqrt(s2) * vm;
      let drift = 0;
      if (regime === 0) drift = spec.k * vol;
      else if (regime === 1) drift = -spec.k * vol;
      else if (regime === 2) drift = -spec.theta * (logP - anchor);
      else drift = -spec.chopTheta * (logP - anchor);
      const z = R.t(spec.nu || 5);
      let shock = 0;
      if (R.u() < spec.shockP) shock = (R.u() < 0.5 ? -1 : 1) * (spec.shockMin + R.u() * (spec.shockMax - spec.shockMin)) * base;
      let gapR = R.n() * ((i % 5) === 0 ? 0.2 : 0.03) * vol;
      if (i === bigIdx) { gapR += spec.bigShockSize * base * 0.75; shock += spec.bigShockSize * base * 0.25; }
      const ret = drift + vol * z + shock;
      eps = (vol * z + shock) / vm;
      const open = prevClose * Math.exp(gapR);
      const close = open * Math.exp(ret);
      const x = Math.log(close / open);
      const sd = vol * 0.95;
      const M = (x + Math.sqrt(x * x - 2 * sd * sd * Math.log(1 - R.u()))) / 2;
      const m = (x - Math.sqrt(x * x - 2 * sd * sd * Math.log(1 - R.u()))) / 2;
      o[i] = rnd(open); c[i] = rnd(close);
      h[i] = rnd(Math.max(open * Math.exp(M), o[i], c[i]));
      l[i] = rnd(Math.min(open * Math.exp(m), o[i], c[i]));
      reg[i] = regime;
      prevClose = c[i];
      logP = Math.log(c[i]);
    }
    return { o: o, h: h, l: l, c: c, reg: reg, n: n, spec: spec, seed: seed, synthetic: true };
  }

  /* ---------- Indicators ---------- */
  function trueRangeN(M) {
    const n = M.c.length, TR = new Array(n).fill(NaN), N = new Array(n).fill(NaN);
    for (let i = 1; i < n; i++) {
      TR[i] = Math.max(M.h[i] - M.l[i], Math.abs(M.h[i] - M.c[i - 1]), Math.abs(M.c[i - 1] - M.l[i]));
    }
    if (n > 21) {
      let s = 0;
      for (let i = 1; i <= 20; i++) s += TR[i];
      N[20] = s / 20;
      for (let i = 21; i < n; i++) N[i] = (19 * N[i - 1] + TR[i]) / 20;
    }
    return { TR: TR, N: N };
  }
  /* up[i] / lo[i] = highest high / lowest low of the `len` bars BEFORE bar i (known before bar i opens) */
  function donchian(M, len) {
    const n = M.c.length, up = new Array(n).fill(NaN), lo = new Array(n).fill(NaN);
    for (let i = len; i < n; i++) {
      let mx = -Infinity, mn = Infinity;
      for (let j = i - len; j < i; j++) { if (M.h[j] > mx) mx = M.h[j]; if (M.l[j] < mn) mn = M.l[j]; }
      up[i] = mx; lo[i] = mn;
    }
    return { up: up, lo: lo };
  }
  function indicators(M) {
    if (M._ind) return M._ind;
    const tn = trueRangeN(M);
    M._ind = { TR: tn.TR, N: tn.N, dc10: donchian(M, 10), dc20: donchian(M, 20), dc55: donchian(M, 55) };
    return M._ind;
  }
  /* Swing points with k candles each side; only swings confirmed by bar `upTo` (i + k <= upTo). Ties: first wins. */
  function swings(M, k, from, upTo) {
    k = k || 3;
    const out = [];
    const lo = Math.max(k, from || 0), hi = Math.min(upTo, M.c.length - 1) - k;
    for (let i = lo; i <= hi; i++) {
      let isH = true, isL = true;
      for (let j = 1; j <= k; j++) {
        if (!(M.h[i] > M.h[i - j]) || !(M.h[i] >= M.h[i + j])) isH = false;
        if (!(M.l[i] < M.l[i - j]) || !(M.l[i] <= M.l[i + j])) isL = false;
        if (!isH && !isL) break;
      }
      if (isH) out.push({ i: i, px: M.h[i], type: "H" });
      if (isL) out.push({ i: i, px: M.l[i], type: "L" });
    }
    return out;
  }
  function analyzeStructure(M, end, lookback) {
    lookback = lookback || 120;
    const sw = swings(M, 3, end - lookback, end);
    const H = sw.filter(function (s) { return s.type === "H"; });
    const L = sw.filter(function (s) { return s.type === "L"; });
    if (H.length < 2 || L.length < 2) return null;
    const h2 = H[H.length - 1], h1 = H[H.length - 2], l2 = L[L.length - 1], l1 = L[L.length - 2];
    let state = "Range";
    if (h2.px > h1.px && l2.px > l1.px) state = "Uptrend";
    else if (h2.px < h1.px && l2.px < l1.px) state = "Downtrend";
    const px = M.c[end];
    const choch = state === "Uptrend" ? l2 : state === "Downtrend" ? h2 : null;
    return { state: state, h1: h1, h2: h2, l1: l1, l2: l2, choch: choch, px: px, swings: sw };
  }

  /* ---------- Money ---------- */
  function pipValue(spec, price) { return spec.quote === "JPY" ? spec.pip * 100000 / price : spec.pip * 100000; }
  function roundLots(x) { return Math.max(0.01, Math.floor(x * 100 + 1e-9) / 100); }
  function pnlUSD(spec, lots, entry, exit, dir) {
    const q = lots * 100000 * (exit - entry) * dir;
    return spec.quote === "JPY" ? q / exit : q;
  }

  /* ---------- OHLC path broker ----------
     Walks o → (h|l) → (l|h) → c. Orders: {side:'buy'|'sell', type:'stop'|'limit', px, ...}.
     getOrders() is re-read after every fill so a fill can create or move orders mid-bar. */
  function trig0(od, p) {
    if (od.type === "stop") return od.side === "buy" ? p >= od.px : p <= od.px;
    return od.side === "buy" ? p <= od.px : p >= od.px;
  }
  function walkBar(o, h, l, c, getOrders, fill) {
    for (let g = 0; g < 8; g++) {
      const os = getOrders();
      let hit = null;
      for (let k = 0; k < os.length; k++) if (trig0(os[k], o)) { hit = os[k]; break; }
      if (!hit) break;
      fill(hit, o, true);
    }
    const pts = Math.abs(o - h) <= Math.abs(o - l) ? [h, l, c] : [l, h, c];
    let a = o;
    for (let s = 0; s < 3; s++) {
      const b = pts[s];
      for (let g = 0; g < 12; g++) {
        const os = getOrders();
        let best = null, bestD = Infinity;
        for (let k = 0; k < os.length; k++) {
          const od = os[k];
          let ok = false;
          if (b > a) ok = ((od.side === "buy" && od.type === "stop") || (od.side === "sell" && od.type === "limit")) && od.px > a && od.px <= b;
          else if (b < a) ok = ((od.side === "sell" && od.type === "stop") || (od.side === "buy" && od.type === "limit")) && od.px < a && od.px >= b;
          if (ok) { const d = Math.abs(od.px - a); if (d < bestD) { bestD = d; best = od; } }
        }
        if (!best) break;
        fill(best, best.px, false);
        a = best.px;
      }
      a = b;
    }
  }

  /* ---------- Turtle rules engine ----------
     opt: { sys:1|2, riskPerN (0.01 original, 0.005 course), equity0, start, end, adds, filter } */
  function runTurtle(M, opt) {
    opt = opt || {};
    const spec = M.spec, n = M.c.length, ind = indicators(M);
    const sys = opt.sys === 2 ? 2 : 1;
    const EN = sys === 1 ? ind.dc20 : ind.dc55, EX = sys === 1 ? ind.dc10 : ind.dc20, FS = ind.dc55, N = ind.N;
    const hs = spec.spread * spec.pip / 2, tick = spec.pip / 10;
    const riskPerN = opt.riskPerN || 0.005;
    const maxUnits = opt.adds === false ? 1 : 4;
    const useFilter = sys === 1 && opt.filter !== false;
    let equity = opt.equity0 || 100000;
    const start = Math.max(opt.start || 56, 56), end = Math.min(opt.end === undefined ? n - 1 : opt.end, n - 1);
    let pos = null, shadow = null, lastWin = false, exitedThisBar = false;
    const trades = [], skipped = [];
    let i = start, n0 = 0;
    const realOrders = function () {
      if (!pos) {
        if (exitedThisBar) return [];
        const ch = (useFilter && lastWin) ? FS : EN;
        return [
          { side: "buy", type: "stop", px: ch.up[i] + tick, tag: "entry", dir: 1, fs: useFilter && lastWin },
          { side: "sell", type: "stop", px: ch.lo[i] - tick, tag: "entry", dir: -1, fs: useFilter && lastWin }
        ];
      }
      const out = [];
      if (pos.dir === 1) {
        if (pos.units.length < maxUnits) out.push({ side: "buy", type: "stop", px: pos.lastPx + 0.5 * pos.n0, tag: "add" });
        const ex = EX.lo[i] - tick;
        out.push({ side: "sell", type: "stop", px: Math.max(pos.stop, ex), tag: pos.stop >= ex ? "2N stop" : "channel exit" });
      } else {
        if (pos.units.length < maxUnits) out.push({ side: "sell", type: "stop", px: pos.lastPx - 0.5 * pos.n0, tag: "add" });
        const ex = EX.up[i] + tick;
        out.push({ side: "buy", type: "stop", px: Math.min(pos.stop, ex), tag: pos.stop <= ex ? "2N stop" : "channel exit" });
      }
      return out;
    };
    const realFill = function (od, px, gap) {
      const f = od.side === "buy" ? px + hs : px - hs;
      if (od.tag === "entry") {
        const lots = roundLots(riskPerN * equity / ((n0 / spec.pip) * pipValue(spec, f)));
        pos = { dir: od.dir, n0: n0, units: [{ px: f, lots: lots }], lastPx: f, stop: f - od.dir * 2 * n0,
          entryIdx: i, R1: lots * (2 * n0 / spec.pip) * pipValue(spec, f), failsafe: !!od.fs, gapEntry: gap };
      } else if (od.tag === "add") {
        pos.units.push({ px: f, lots: pos.units[0].lots });
        pos.lastPx = f;
        pos.stop = f - pos.dir * 2 * pos.n0;
      } else {
        let pnl = 0;
        for (let k = 0; k < pos.units.length; k++) pnl += pnlUSD(spec, pos.units[k].lots, pos.units[k].px, f, pos.dir);
        equity += pnl;
        trades.push({ dir: pos.dir, entryIdx: pos.entryIdx, exitIdx: i, entry: pos.units[0].px, exit: f, units: pos.units.length,
          R: pnl / pos.R1, pnl: pnl, how: od.tag, gap: gap, failsafe: pos.failsafe, reg: M.reg ? M.reg[pos.entryIdx] : null, n0: pos.n0 });
        pos = null;
        exitedThisBar = true;
      }
    };
    const shadowOrders = function () {
      if (!useFilter) return [];
      if (!shadow) return [
        { side: "buy", type: "stop", px: EN.up[i] + tick, tag: "sentry", dir: 1 },
        { side: "sell", type: "stop", px: EN.lo[i] - tick, tag: "sentry", dir: -1 }
      ];
      if (shadow.dir === 1) return [{ side: "sell", type: "stop", px: Math.max(shadow.stop, EX.lo[i] - tick), tag: "sexit" }];
      return [{ side: "buy", type: "stop", px: Math.min(shadow.stop, EX.up[i] + tick), tag: "sexit" }];
    };
    let shadowExited = false;
    const shadowFill = function (od, px) {
      if (od.tag === "sentry") {
        if (shadowExited) return;
        if (!pos && lastWin) skipped.push({ i: i, dir: od.dir, px: px });
        shadow = { dir: od.dir, px: px, stop: px - od.dir * 2 * n0 };
      } else {
        lastWin = (px - shadow.px) * shadow.dir > 0;
        shadow = null;
        shadowExited = true;
      }
    };
    const shadowOrdersGuarded = function () { return shadowExited && !shadow ? [] : shadowOrders(); };
    for (i = start; i <= end; i++) {
      n0 = N[i - 1];
      if (!(n0 > 0) || isNaN(EN.up[i]) || isNaN(FS.up[i])) continue;
      exitedThisBar = false; shadowExited = false;
      if (useFilter) walkBar(M.o[i], M.h[i], M.l[i], M.c[i], shadowOrdersGuarded, shadowFill);
      walkBar(M.o[i], M.h[i], M.l[i], M.c[i], realOrders, realFill);
    }
    if (pos) {
      const f = M.c[end];
      let pnl = 0;
      for (let k = 0; k < pos.units.length; k++) pnl += pnlUSD(spec, pos.units[k].lots, pos.units[k].px, f, pos.dir);
      trades.push({ dir: pos.dir, entryIdx: pos.entryIdx, exitIdx: end, entry: pos.units[0].px, exit: f, units: pos.units.length,
        R: pnl / pos.R1, pnl: pnl, how: "open at end", reg: M.reg ? M.reg[pos.entryIdx] : null, open: true, n0: pos.n0 });
      equity += pnl;
    }
    return { trades: trades, skipped: skipped, equity: equity, equity0: opt.equity0 || 100000, sys: sys, start: start, end: end };
  }

  /* ---------- Stats (all in R) ---------- */
  function stats(list) {
    const Rs = [];
    for (let k = 0; k < list.length; k++) { const r = typeof list[k] === "number" ? list[k] : list[k].R; if (isFinite(r)) Rs.push(r); }
    const n = Rs.length;
    const out = { n: n, winRate: 0, avgWin: 0, avgLoss: 0, expectancy: 0, totalR: 0, maxDD: 0, longestLoss: 0, top3Share: null, pf: null, best: 0, worst: 0, curve: [] };
    if (!n) return out;
    let sum = 0, gw = 0, gl = 0, nw = 0, nl = 0, cum = 0, peak = 0, mdd = 0, st = 0, mst = 0;
    for (let k = 0; k < n; k++) {
      const r = Rs[k];
      sum += r;
      if (r > 0) { gw += r; nw++; st = 0; } else { gl += -r; nl++; st++; if (st > mst) mst = st; }
      cum += r; out.curve.push(cum);
      if (cum > peak) peak = cum;
      if (peak - cum > mdd) mdd = peak - cum;
    }
    const sorted = Rs.slice().sort(function (a, b) { return b - a; });
    let top3 = 0; for (let k = 0; k < Math.min(3, n); k++) top3 += Math.max(0, sorted[k]);
    out.winRate = nw / n; out.avgWin = nw ? gw / nw : 0; out.avgLoss = nl ? gl / nl : 0;
    out.expectancy = sum / n; out.totalR = sum; out.maxDD = mdd; out.longestLoss = mst;
    out.top3Share = sum > 0 ? top3 / sum : null; out.pf = gl > 0 ? gw / gl : null;
    out.best = sorted[0]; out.worst = sorted[n - 1];
    return out;
  }

  /* ---------- CSV import (real data the student brings) ---------- */
  function parseCSV(text) {
    const lines = text.replace(/\r/g, "").split("\n").filter(function (s) { return s.trim().length; });
    if (lines.length < 30) throw new Error("Need at least 30 rows of data.");
    const delim = [",", ";", "\t"].sort(function (a, b) { return lines[0].split(b).length - lines[0].split(a).length; })[0];
    let head = lines[0].split(delim).map(function (s) { return s.trim().toLowerCase().replace(/[<>"]/g, ""); });
    let hasHead = head.some(function (s) { return /open|high|low|close|date|time/.test(s); });
    const idx = function (re, fallback) { const j = head.findIndex(function (s) { return re.test(s); }); return j >= 0 ? j : fallback; };
    let iD = idx(/date|time|timestamp/, 0), iT = head.findIndex(function (s) { return s === "time"; });
    if (iT === iD) iT = -1;
    let iO = idx(/^open|^o$/, 1), iH = idx(/^high|^h$/, 2), iL = idx(/^low|^l$/, 3), iC = idx(/^close|^c$/, 4);
    if (!hasHead) { iD = 0; iT = -1; iO = 1; iH = 2; iL = 3; iC = 4; }
    const o = [], h = [], l = [], c = [], d = [];
    for (let k = hasHead ? 1 : 0; k < lines.length; k++) {
      const p = lines[k].split(delim);
      const O = parseFloat(p[iO]), H = parseFloat(p[iH]), L = parseFloat(p[iL]), C = parseFloat(p[iC]);
      if (!isFinite(O) || !isFinite(H) || !isFinite(L) || !isFinite(C)) continue;
      o.push(O); h.push(Math.max(H, O, C)); l.push(Math.min(L, O, C)); c.push(C);
      d.push(((p[iD] || "") + (iT >= 0 ? " " + (p[iT] || "") : "")).trim());
    }
    if (c.length < 30) throw new Error("Couldn't read enough rows — expected Date, Open, High, Low, Close columns.");
    if (d.length > 1 && d[0] > d[d.length - 1] && /^\d{4}/.test(d[0])) { o.reverse(); h.reverse(); l.reverse(); c.reverse(); d.reverse(); }
    return { o: o, h: h, l: l, c: c, d: d };
  }
  function importedMarket(parsed, name) {
    const mid = parsed.c[Math.floor(parsed.c.length / 2)];
    const jpy = mid > 20;
    const spec = { id: "IMP", code: "IMPORTED", start: parsed.c[0], pip: jpy ? 0.01 : 0.0001, quote: jpy ? "JPY" : "USD",
      spread: jpy ? 2 : 1.2, dna: name || "Imported data", story: "Real price data you imported. No hidden DNA — this is the market itself." };
    return { o: parsed.o, h: parsed.h, l: parsed.l, c: parsed.c, d: parsed.d, reg: null, n: parsed.c.length, spec: spec, seed: 0, synthetic: false, name: name };
  }

  const API = { mulberry32: mulberry32, Rng: Rng, REGIMES: REGIMES, SPECS: SPECS, genMarket: genMarket, trueRangeN: trueRangeN,
    donchian: donchian, indicators: indicators, swings: swings, analyzeStructure: analyzeStructure, pipValue: pipValue,
    roundLots: roundLots, pnlUSD: pnlUSD, walkBar: walkBar, runTurtle: runTurtle, stats: stats, parseCSV: parseCSV, importedMarket: importedMarket };
  root.ENGINE = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
