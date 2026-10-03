/* ============================================================
   DIAGRAMS — inline SVG teaching figures. Colours come from the
   page's theme tokens through classes, so both themes work.
   Each figure makes one claim, stated in its caption.
   ============================================================ */
(function () {
  "use strict";
  const esc = function (s) { return U.esc(s); };
  const T = function (x, y, s, cls, a) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || "t") + '" text-anchor="' + (a || "start") + '">' + esc(s) + "</text>"; };
  const L = function (x1, y1, x2, y2, cls, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || "st") + '" ' + (extra || "") + "/>"; };
  const Rc = function (x, y, w, h, cls, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + (cls || "box") + '" rx="' + (rx === undefined ? 4 : rx) + '"/>'; };
  const Pl = function (pts, cls) { return '<polyline points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" class="' + (cls || "st") + '" fill="none"/>'; };
  const Ar = function (x1, y1, x2, y2, cls) { return L(x1, y1, x2, y2, (cls || "st") + " arw", 'marker-end="url(#dgA)"'); };
  const Bx = function (x, y, w, h, label, sub, cls) {
    return Rc(x, y, w, h, cls || "box") + T(x + w / 2, y + h / 2 + (sub ? -2 : 5), label, "tb", "middle") + (sub ? T(x + w / 2, y + h / 2 + 14, sub, "ts", "middle") : "");
  };
  const C = function (cx, cy, r, cls) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="' + (cls || "dot") + '"/>'; };
  const lin = function (d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) * (r1 - r0) / (d1 - d0); }; };
  const candle = function (x, o, h, l, c, w, y) {
    const up = c >= o;
    const top = y(Math.max(o, c)), bot = y(Math.min(o, c));
    return L(x, y(h), x, y(l), up ? "wu" : "wd") + '<rect x="' + (x - w / 2) + '" y="' + top + '" width="' + w + '" height="' + Math.max(1.5, bot - top) + '" class="' + (up ? "cu" : "cd") + '" rx="1"/>';
  };
  const DEFS = '<defs><marker id="dgA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mk"/></marker></defs>';
  const fig = function (w, h, inner, caption, cls) {
    return '<figure class="dg' + (cls ? " " + cls : "") + '"><svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(caption) + '">' + DEFS + inner + "</svg><figcaption>" + esc(caption) + "</figcaption></figure>";
  };
  const D = window.DIAG = {};

  D.turtleTimeline = function () {
    const ev = [["1983", "Ads in the WSJ, Barron's, IHT"], ["1,000+", "people apply"], ["23", "trainees, across two classes"], ["~2 weeks", "training, then real accounts"],
      ["~5 years", "reportedly ~$175M in aggregate"], ["1987–88", "Dennis himself loses heavily"], ["1990", "settles: didn't follow his own rules"]];
    let s = L(104, 16, 104, 16 + 6 * 32 + 8, "sg");
    ev.forEach(function (e, i) {
      const y = 22 + i * 32, warn = i >= 5;
      s += C(104, y, 6, warn ? "fdn ring" : "facc ring") + T(90, y + 4, e[0], "tb", "end") + T(118, y + 4, e[1], "tl");
    });
    return fig(480, 236, s, "The Turtle story: complete rules turned novices into traders — and failed their author when he stopped following them.");
  };

  D.sixComponents = function () {
    const names = [["Markets", "what"], ["Size", "how much"], ["Entries", "when in"], ["Stops", "loser out"], ["Exits", "winner out"], ["Tactics", "how"]];
    let s = Rc(8, 26, 464, 118, "frame", 8);
    names.forEach(function (n, i) {
      const x = 18 + i * 76;
      s += Bx(x, 46, 64, 44, n[0], null, "box") + T(x + 32, 108, n[1], "ts", "middle");
      if (i < 5) s += Ar(x + 64, 68, x + 76, 68);
    });
    s += T(240, 18, "The six Turtle components", "tb", "middle") + T(240, 136, "7 · When NOT to trade — the brakes you impose yourself", "ts", "middle");
    return fig(480, 152, s, "A complete system answers every decision in advance; the course adds a seventh: when to stop.");
  };

  D.weekRhythm = function () {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let s = "";
    days.forEach(function (d, i) {
      const x = 10 + i * 66;
      s += T(x + 30, 18, d, "tb", "middle");
      if (i < 6) s += Bx(x, 28, 60, 44, "Lesson", "hour 1", "box") + Ar(x + 30, 73, x + 30, 85) + Bx(x, 86, 60, 44, "Apply", "hour 2", "washa");
      else s += Bx(x, 28, 60, 44, "Review", "hour 1", "boxf") + Bx(x, 86, 60, 44, "Gate", "if due", "gatebox");
    });
    [[0, "Unit A · 3 days"], [3, "Unit B · 3 days"]].forEach(function (u) {
      const x1 = 10 + u[0] * 66, x2 = x1 + 3 * 66 - 6;
      s += L(x1, 142, x2, 142, "ss") + L(x1, 137, x1, 142, "ss") + L(x2, 137, x2, 142, "ss") + T((x1 + x2) / 2, 158, u[1], "ts", "middle");
    });
    return fig(480, 166, s, "Every day: learn it in hour 1, use it in hour 2. Three days make a unit, two units make a week — and Sunday is for the review, plus the gate when one is due.");
  };

  D.fourMonths = function () {
    const pl = COURSE.PLAN, n = pl.days.length;
    const x0 = 24, x1 = 700, step = (x1 - x0) / n, xs = function (i) { return x0 + (i + 0.5) * step; };
    const idxOf = function (iso) { const d = pl.byDate[iso]; return d ? d.i : null; };
    let s = "";
    [["2026-12-01", "December"], ["2027-01-01", "January"], ["2027-02-01", "February"], ["2027-03-01", "March"]].forEach(function (m) {
      const i = idxOf(m[0]) || 0, x = xs(i) - step / 2;
      s += L(x, 22, x, 62, "sg") + T(x + 4, 16, m[1], "tb");
    });
    const modOf = function (d) {
      let u = d.unit || 0;
      if (!u && d.h1 && d.h1.type === "task") u = COURSE.TASKS[d.h1.id].unit || 0;
      if (!u) return d.cw === 0 ? "100" : null;
      return COURSE.weeks[u - 1].mod;
    };
    const span = {};
    pl.days.forEach(function (d) { if (d.kind !== "study") return; const m = modOf(d); if (!m) return; span[m] = span[m] || [d.i, d.i]; span[m][0] = Math.min(span[m][0], d.i); span[m][1] = Math.max(span[m][1], d.i); });
    COURSE.MODULES.forEach(function (m, k) {
      const sp = span[m.key]; if (!sp) return;
      const xa = xs(sp[0]) - step / 2 + 1, xb = xs(sp[1]) + step / 2 - 1;
      s += Rc(xa, 28, Math.max(8, xb - xa), 30, k % 2 ? "box" : "washa", 3) + T((xa + xb) / 2, 47, m.key, "ts", "middle");
    });
    const rests = pl.days.filter(function (d) { return d.kind === "rest"; });
    rests.forEach(function (d) { s += L(xs(d.i), 28, xs(d.i), 58, "sdn dash"); });
    if (rests.length) s += T((xs(rests[0].i) + xs(rests[rests.length - 1].i)) / 2, 74, "rest days", "ts", "middle");
    Object.keys(pl.examDay).forEach(function (g) {
      const x = xs(pl.examDay[g]);
      s += '<polygon points="' + x + ',64 ' + (x + 7) + ',71 ' + x + ',78 ' + (x - 7) + ',71" class="gatebox"/>' + T(x, 94, g === "final" ? "Final" : "G" + g.slice(1), "tb", "middle");
    });
    const g4 = pl.examDay.g4, g5 = pl.examDay.g5, fin = pl.examDay.final;
    s += T(xs(g4 + 1), 112, "demo trading — only after Gate 4", "ts") + L(xs(g4 + 1), 118, xs(fin), 118, "sblue thick");
    s += L(xs(g5 + 1), 140, xs(fin), 140, "sacc thick") + T(xs(g5 + 1) - 8, 144, "real money — only after Gate 5", "ts", "end");
    const ti = idxOf(U.today());
    if (ti !== null) s += L(xs(ti), 22, xs(ti), 148, "st dash") + T(xs(ti), 162, "today", "tb", "middle");
    return fig(720, 168, s, "Four months at a glance: nine modules, five gates and a Final. Demo trading starts only after Gate 4; real money only after Gate 5.", "wide");
  };

  D.seesaw = function () {
    let s = Bx(16, 18, 180, 44, "Euro strengthens", null, "box") + Bx(16, 96, 180, 44, "Dollar weakens", null, "box") + Bx(284, 57, 180, 44, "EUR/USD rises", null, "washa");
    s += Ar(196, 42, 282, 72) + Ar(196, 118, 282, 88) + T(374, 128, "Which cause? Check DXY.", "ts", "middle");
    return fig(480, 150, s, "A pair is a ratio: one rise, two possible causes. The other side of the pair tells you which.");
  };

  D.pipValue = function () {
    let s = T(16, 14, "USD-quoted (EUR/USD)", "ts");
    s += Bx(16, 20, 96, 44, "0.0001", "pip size") + T(121, 47, "×", "tb", "middle") + Bx(130, 20, 100, 44, "100,000", "units") + T(239, 47, "=", "tb", "middle") + Bx(248, 20, 216, 44, "$10 per pip", "quote currency is USD", "washa");
    s += T(16, 92, "JPY-quoted (USD/JPY at 150)", "ts");
    s += Bx(16, 98, 96, 44, "0.01", "pip size") + T(121, 125, "×", "tb", "middle") + Bx(130, 98, 100, 44, "100,000", "units") + T(239, 125, "=", "tb", "middle") + Bx(248, 98, 90, 44, "¥1,000", "per pip") + T(356, 125, "÷150", "ts", "middle") + Bx(376, 98, 88, 44, "$6.67", "per pip", "washa");
    return fig(480, 152, s, "Pip value = pip size × units, in the quote currency — then converted to your account currency.");
  };

  D.costShare = function () {
    const rows = [["5m · 6-pip target", 20], ["1H · 25-pip target", 4.8], ["4H · 60-pip target", 2.0], ["Daily · 150-pip target", 0.8]];
    let s = "";
    const x0 = 196, sc = lin(0, 20, 0, 228);
    rows.forEach(function (r, i) {
      const y = 22 + i * 36;
      s += T(16, y + 14, r[0], "tl") + Rc(x0, y + 2, Math.max(3, sc(r[1])), 18, "fbar", 3) + T(x0 + sc(r[1]) + 8, y + 16, r[1] + "%", "tb");
    });
    s += L(x0, 16, x0, 164, "sg");
    return fig(480, 172, s, "The same 1.2-pip cost is a fifth of a 5-minute scalp's target and under 1% of a daily swing's.");
  };

  D.hierarchy = function () {
    const tiers = ["1 · Central banks", "2 · Interbank dealers (EBS, Reuters)", "3 · Institutions & funds", "4 · Corporates", "5 · Retail — you"];
    let s = "";
    tiers.forEach(function (t, i) {
      const y = 12 + i * 44;
      s += Rc(16, y, 300, 36, i === 4 ? "washa" : "box") + T(30, y + 23, t, "tl");
    });
    s += Ar(344, 204, 344, 86) + T(358, 116, "your order", "ts") + T(358, 133, "is filled against", "ts") + T(358, 150, "a dealer's", "ts") + T(358, 167, "inventory", "ts");
    return fig(480, 236, s, "Forex is a dealer network in tiers; a retail order is filled against somebody else's inventory.");
  };

  D.stopSlip = function () {
    const y = lin(1.0790, 1.0870, 176, 20);
    let s = Rc(136, 14, 50, 170, "washn", 0) + T(161, 196, "weekend gap", "ts", "middle");
    [[1.0852, 1.0861, 1.0846, 1.0856], [1.0856, 1.0864, 1.0848, 1.0850], [1.0850, 1.0858, 1.0845, 1.0851]].forEach(function (k, i) { s += candle(56 + i * 30, k[0], k[1], k[2], k[3], 14, y); });
    s += candle(214, 1.0800, 1.0814, 1.0794, 1.0809, 14, y);
    s += L(24, y(1.0830), 456, y(1.0830), "sdn dash") + T(456, y(1.0830) - 6, "stop 1.0830", "ts", "end");
    s += C(214, y(1.0800), 5, "fdn ring") + T(226, y(1.0800) + 16, "filled ≈ 1.0800", "tb");
    s += L(262, y(1.0830), 262, y(1.0800), "st") + L(256, y(1.0830), 268, y(1.0830), "st") + L(256, y(1.0800), 268, y(1.0800), "st") + T(274, y(1.0815) + 4, "30 pips of slippage", "ts");
    return fig(480, 204, s, "A stop is a market order that arms at a level: through a gap, it fills at the first price available.");
  };

  D.sessionClock = function () {
    const X = function (h) { return 96 + h * 15; };
    const block = function (top, title, rows, ov) {
      let s = T(96, top - 6, title, "tb") + Rc(X(ov[0]), top - 2, X(ov[1]) - X(ov[0]), 56, "washa", 3);
      rows.forEach(function (r, i) {
        const y = top + 4 + i * 17;
        s += T(88, y + 10, r[0], "ts", "end") + Rc(X(r[1]), y, X(r[2]) - X(r[1]), 11, "fsess", 3);
      });
      return s;
    };
    let s = block(24, "European / US summer", [["Asia", 2, 11], ["London", 9, 18], ["New York", 14, 23]], [14, 18]);
    s += block(110, "European / US winter", [["Asia", 2, 11], ["London", 10, 19], ["New York", 15, 24]], [15, 19]);
    [0, 3, 6, 9, 12, 15, 18, 21, 24].forEach(function (h) { s += L(X(h), 176, X(h), 180, "sg") + T(X(h), 194, (h < 10 ? "0" : "") + h, "ts", "middle"); });
    s += L(X(0), 176, X(24), 176, "sg") + T(96, 212, "hours, SAST (GMT+2) · shaded = London–New York overlap", "ts");
    return fig(480, 220, s, "In SAST the sessions shift an hour twice a year; the London–New York overlap is the deepest window of the day.");
  };

  D.orderBook = function () {
    const panel = function (x0, title, sizes, order, note) {
      let s = T(x0, 16, title, "tb");
      let left = order;
      sizes.forEach(function (sz, k) {
        const y = 92 - k * 16;
        const used = Math.max(0, Math.min(sz, left)); left -= used;
        s += T(x0 + 38, y + 10, "+" + (k + 1), "ts", "end") + Rc(x0 + 46, y, sz * 13, 11, "fbook", 2) + (used ? Rc(x0 + 46, y, used * 13, 11, "fused", 2) : "");
      });
      s += L(x0, 110, x0 + 200, 110, "st") + T(x0 + 200, 124, "price now", "ts", "end");
      [3, 4, 3, 5, 4].forEach(function (sz, k) { s += Rc(x0 + 46, 118 + k * 14, sz * 10, 9, "fbid", 2); });
      s += T(x0, 204, note, "ts");
      return s;
    };
    let s = panel(16, "Deep book", [8, 9, 7, 10, 8], 20, "20M buy lifts price 3 levels");
    s += panel(258, "Thin book", [2, 1, 3, 1, 2], 20, "20M buy clears 5+ levels");
    return fig(480, 212, s, "Liquidity is depth: the same market order moves a thin book much further than a deep one.");
  };

  D.asianRange = function () {
    const y = lin(-40, 70, 180, 16);
    const asia = [[0, 6, -5, 3], [3, 8, -2, -1], [-1, 5, -8, 2], [2, 9, -3, 7], [7, 10, 0, 1], [1, 4, -9, -6], [-6, 2, -9, 0], [0, 7, -4, 5]];
    const lon = [[5, 18, 3, 16], [16, 34, 14, 31], [31, 44, 26, 40], [40, 55, 36, 50]];
    let s = Rc(22, y(10) - 2, 212, y(-9) - y(10) + 4, "washa", 3) + T(128, y(-9) + 22, "Asian range", "ts", "middle");
    asia.forEach(function (k, i) { s += candle(36 + i * 26, k[0], k[1], k[2], k[3], 12, y); });
    lon.forEach(function (k, i) { s += candle(262 + i * 30, k[0], k[1], k[2], k[3], 14, y); });
    s += L(22, y(10), 460, y(10), "ss") + T(460, y(10) - 6, "Asian high", "ts", "end");
    s += Rc(236, y(14), 20, 8, "fstop", 2) + T(226, y(14) + 2, "stops", "ts", "end");
    s += Ar(360, y(20), 394, y(46)) + T(356, y(22), "London breaks it", "ts", "end");
    return fig(480, 196, s, "Asia builds a range; stops collect beyond it; London often breaks one side — a tendency you measure, not a law.");
  };

  D.candleHidden = function () {
    const y = lin(0, 100, 186, 22);
    let s = T(70, 16, "What the chart shows", "tb", "middle") + candle(70, 50, 80, 20, 60, 22, y);
    s += T(96, y(50) + 4, "open", "ts") + T(96, y(60) - 6, "close", "ts");
    const panel = function (x0, title, path, note) {
      const px = lin(0, 3, x0, x0 + 140);
      let t = T(x0 + 70, 16, title, "tb", "middle");
      t += L(x0, y(75), x0 + 150, y(75), "sup dash") + L(x0, y(30), x0 + 150, y(30), "sdn dash");
      t += Pl(path.map(function (v, i) { return [px(i), y(v)]; }), "st path");
      t += T(x0 + 70, 206, note, "ts", "middle");
      return t;
    };
    s += panel(160, "Path A", [50, 80, 20, 60], "target first → win");
    s += panel(318, "Path B", [50, 20, 80, 60], "stop first → loss");
    s += T(474, y(75) + 4, "target", "ts", "end") + T(474, y(30) + 4, "stop", "ts", "end");
    return fig(480, 214, s, "One candle, two possible paths: when stop and target sit inside the same bar, the candle can't say which came first.");
  };

  D.fractalNest = function () {
    const y = lin(10, 95, 190, 20);
    let s = T(70, 16, "1 Daily candle", "tb", "middle") + candle(70, 70, 85, 20, 30, 26, y);
    const k4 = [[70, 80, 68, 78], [78, 85, 76, 84], [84, 84, 58, 60], [60, 62, 38, 40], [40, 42, 20, 22], [22, 32, 21, 30]];
    s += T(320, 16, "= 6 four-hour candles", "tb", "middle");
    k4.forEach(function (k, i) { s += candle(212 + i * 42, k[0], k[1], k[2], k[3], 20, y); });
    s += L(88, y(85), 196, y(85), "sg dash") + L(88, y(20), 196, y(20), "sg dash");
    s += T(254, y(88), "a rally…", "ts", "middle") + T(380, y(52), "…then the fall", "ts", "middle");
    return fig(480, 200, s, "A bearish daily candle can contain a complete 4H rally: trend only exists relative to a timeframe.");
  };

  D.threeScreens = function () {
    const panels = [
      ["Daily · context", [[0, 20], [1, 60], [2, 40], [3, 85], [4, 65], [5, 110]], "bias: down"],
      ["4H · setup", [[0, 100], [1, 80], [2, 88], [3, 60], [4, 70], [5, 48]], "pullback into level"],
      ["1H · entry", [[0, 50], [1, 44], [2, 52], [3, 40], [4, 58], [5, 72]], "entry + stop"]
    ];
    let s = "";
    panels.forEach(function (p, i) {
      const x0 = 12 + i * 158, px = lin(0, 5, x0 + 10, x0 + 130), py = lin(0, 120, 34, 134);
      s += Rc(x0, 24, 140, 118, "box") + T(x0 + 70, 16, p[0], "tb", "middle") + Pl(p[1].map(function (q) { return [px(q[0]), py(q[1])]; }), "st path");
      if (i === 1) s += L(x0 + 8, py(52), x0 + 132, py(52), "sacc");
      if (i === 2) { s += C(px(3), py(40), 4, "facc ring") + L(px(3) - 12, py(64), x0 + 132, py(64), "sdn dash"); }
      s += T(x0 + 70, 160, p[2], "ts", "middle");
      if (i < 2) s += Ar(x0 + 142, 84, x0 + 156, 84);
    });
    return fig(480, 168, s, "Three screens, three jobs: the highest sets bias, the middle finds the setup, the lowest times the entry and the stop.");
  };

  D.swingN3 = function () {
    const y = lin(0, 100, 176, 26);
    const hs = [40, 55, 62, 85, 70, 64, 50];
    let s = "";
    hs.forEach(function (h, i) { const o = h - 16 - (i % 2) * 6, c = h - 8 + (i % 2) * 2; s += candle(56 + i * 58, o, h, h - 32, c, 18, y); });
    s += '<path d="M' + (56 + 3 * 58 - 7) + "," + (y(85) - 16) + " L" + (56 + 3 * 58 + 7) + "," + (y(85) - 16) + " L" + (56 + 3 * 58) + "," + (y(85) - 6) + ' z" class="facc"/>';
    s += L(42, 190, 186, 190, "st") + T(114, 206, "3 lower highs before", "ts", "middle");
    s += L(274, 190, 418, 190, "st") + T(346, 206, "3 highs after, none higher", "ts", "middle");
    s += T(228, y(85) - 24, "swing high", "tb", "middle") + T(418, y(50) - 30, "confirmed here", "ts", "middle") + Ar(418, y(50) - 24, 418, y(50) - 8, "sacc");
    return fig(480, 214, s, "A swing high (N = 3) beats the three highs on each side — and is only confirmed once the third candle after it closes.");
  };

  D.trendStairs = function () {
    const pts = [[20, 170], [90, 110], [140, 140], [210, 80], [260, 112], [330, 48], [380, 82], [450, 22]];
    const lab = [null, "H", "HL", "HH", "HL", "HH", "HL", "HH"];
    let s = "";
    const dc = [];
    for (let x = 20; x <= 460; x += 4) {
      let best = 999;
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k], b = pts[k + 1];
        for (let t = Math.max(a[0], x - 70); t <= Math.min(b[0], x); t += 2) { const yy = a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); if (yy < best) best = yy; }
      }
      if (best < 999) dc.push([x, best]);
    }
    s += Pl(dc, "sblue dcl") + T(460, 14, "Donchian upper (highest high of the lookback)", "ts", "end");
    s += Pl(pts, "st path");
    pts.forEach(function (p, i) { if (lab[i]) s += T(p[0], p[1] + (lab[i] === "HL" ? 18 : -8), lab[i], "tb", "middle"); });
    return fig(480, 196, s, "Uptrend = higher highs AND higher lows; the Turtles' simpler test is a new N-day high on the Donchian channel.");
  };

  D.rangeBox = function () {
    const pts = [[20, 120], [70, 64], [120, 136], [170, 66], [196, 44], [214, 70], [262, 134], [300, 156], [322, 128], [372, 66], [422, 132], [460, 100]];
    let s = L(20, 60, 460, 60, "ss") + L(20, 140, 460, 140, "ss") + Pl(pts, "st path");
    s += C(196, 44, 5, "ring hollow") + T(196, 32, "failed break", "ts", "middle") + C(300, 156, 5, "ring hollow") + T(300, 176, "failed break", "ts", "middle");
    s += T(462, 56, "range high", "ts", "end") + T(462, 154, "range low", "ts", "end");
    return fig(480, 186, s, "In a range, breaks snap back inside: breakout tactics that pay in trends bleed here.");
  };

  D.bosChoch = function () {
    const p = [[20, 196], [80, 132], [120, 160], [190, 96], [230, 130], [300, 60], [345, 100], [380, 74], [440, 160]];
    let s = L(80, 132, 180, 132, "sg dash") + L(190, 96, 290, 96, "sg dash") + L(345, 100, 440, 100, "sdn dash");
    s += Pl(p, "st path");
    s += T(160, 124, "BOS", "tb", "middle") + T(268, 88, "BOS", "tb", "middle") + T(120, 176, "HL", "ts", "middle") + T(230, 146, "HL", "ts", "middle") + T(345, 118, "last HL", "ts", "middle");
    s += C(408, 100, 5, "fdn ring") + T(414, 92, "CHoCH", "tb");
    return fig(480, 214, s, "Breaks above each high confirm the trend (BOS); the first close below the last higher low changes its character.");
  };

  D.levelInventory = function () {
    const zoneTop = 118, zoneBot = 136;
    let s = Rc(30, zoneTop, 430, zoneBot - zoneTop, "washa", 2) + T(36, zoneTop - 6, "support zone", "ts");
    s += Pl([[30, 40], [100, 124], [150, 56], [260, 126], [300, 84], [400, 128], [430, 176]], "st path");
    [0, 1, 2, 3].forEach(function (k) { s += Rc(88 + k * 7, zoneTop + 4, 5, 10, "fup", 1); });
    [0, 1].forEach(function (k) { s += Rc(252 + k * 7, zoneTop + 4, 5, 10, "fup", 1); });
    s += T(100, 164, "touch 1: many buy orders", "ts", "middle") + T(262, 164, "touch 2: fewer", "ts", "middle") + T(400, 196, "touch 3: none left → breaks", "ts", "middle");
    return fig(480, 204, s, "A level holds because orders rest there — and each touch uses some of them up.");
  };

  D.zone = function () {
    const y = lin(0, 100, 186, 20);
    const k = [[80, 86, 60, 64], [64, 68, 30, 34], [34, 44, 18, 40], [40, 62, 38, 58], [58, 60, 36, 40], [40, 42, 24, 38], [38, 56, 36, 52], [52, 70, 50, 66]];
    let s = Rc(24, y(40), 436, y(18) - y(40), "washa", 2);
    k.forEach(function (c, i) { s += candle(60 + i * 50, c[0], c[1], c[2], c[3], 18, y); });
    s += T(462, y(40) - 6, "body cluster", "ts", "end") + T(462, y(18) + 16, "wick extreme", "ts", "end");
    s += L(24, y(12), 460, y(12), "sdn dash") + T(24, y(12) + 16, "stop goes beyond the far edge", "ts");
    return fig(480, 212, s, "Draw levels as zones from the body cluster to the wick extreme; the stop belongs beyond the far edge.");
  };

  D.stopPools = function () {
    const p = [[20, 150], [90, 96], [160, 50], [230, 120], [320, 160], [390, 110], [440, 124]];
    let s = Rc(140, 30, 44, 12, "fstop", 3) + T(162, 24, "buy stops", "ts", "middle") + Rc(298, 168, 44, 12, "fstop", 3) + T(320, 196, "sell stops", "ts", "middle");
    s += Pl(p, "st path") + Ar(446, 118, 196, 40, "sacc") + T(330, 66, "price is drawn to liquidity", "ts", "middle");
    return fig(480, 204, s, "Stops pool just beyond obvious highs and lows; large orders need that liquidity, so price is drawn to it.");
  };

  D.sweepBreak = function () {
    const y = lin(0, 100, 188, 26);
    let s = "";
    const lvl = 70;
    [[16, "Sweep"], [250, "Break"]].forEach(function (pp) { s += T(pp[0] + 107, 16, pp[1], "tb", "middle") + L(pp[0], y(lvl), pp[0] + 214, y(lvl), "ss"); });
    [[40, 55, 36, 52], [52, 64, 48, 60], [60, 84, 56, 64], [64, 66, 44, 46], [46, 50, 30, 34]].forEach(function (c, i) { s += candle(40 + i * 40, c[0], c[1], c[2], c[3], 16, y); });
    [[40, 56, 38, 54], [54, 66, 50, 62], [62, 82, 60, 80], [80, 90, 72, 86], [86, 98, 80, 94]].forEach(function (c, i) { s += candle(274 + i * 40, c[0], c[1], c[2], c[3], 16, y); });
    s += T(123, 208, "wick through, close back inside", "ts", "middle") + T(357, 208, "body closes beyond, follows through", "ts", "middle");
    return fig(480, 214, s, "A sweep pokes through and closes back inside; a break closes beyond the level and keeps going.");
  };

  D.fvg = function () {
    const y = lin(0, 100, 186, 20);
    const k = [[20, 36, 15, 32], [32, 78, 30, 75], [75, 88, 58, 84], [84, 86, 66, 68], [68, 70, 44, 50], [50, 72, 48, 70]];
    let s = Rc(100, y(58), 360, y(36) - y(58), "washa", 2) + T(456, y(47) + 4, "imbalance", "ts", "end");
    k.forEach(function (c, i) { s += candle(120 + i * 60, c[0], c[1], c[2], c[3], 22, y); });
    s += T(120, y(36) - 8, "c1 high", "ts", "middle") + T(240, y(58) + 18, "c3 low", "ts", "middle") + T(420, y(44) + 22, "price returns", "ts", "middle");
    return fig(480, 200, s, "A fair value gap is the band between candle 1's high and candle 3's low — thin on orders, often revisited.");
  };

  D.fixedFrac = function () {
    const x = lin(0, 10, 60, 400), y = lin(30, 100, 186, 30);
    const risks = [[0.01, "q1", "1% → 90%"], [0.02, "q2", "2% → 82%"], [0.05, "q3", "5% → 60%"], [0.10, "q4", "10% → 35%"]];
    let s = "";
    [100, 80, 60, 40].forEach(function (v) { s += L(60, y(v), 400, y(v), "sg") + T(52, y(v) + 4, v + "%", "ts", "end"); });
    [0, 2, 4, 6, 8, 10].forEach(function (k) { s += T(x(k), 204, String(k), "ts", "middle"); });
    s += T(230, 220, "losses in a row", "ts", "middle");
    risks.forEach(function (r) {
      const pts = []; for (let k = 0; k <= 10; k++) pts.push([x(k), y(100 * Math.pow(1 - r[0], k))]);
      s += Pl(pts, "ser " + r[1]) + T(408, pts[10][1] + 4, r[2], "ts");
    });
    return fig(480, 226, s, "Ten losses at a fixed 1% leave 90% of the account; at 10% they leave 35%.");
  };

  D.sizeFlow = function () {
    let s = Bx(16, 18, 118, 48, "$10,000", "account") + T(144, 47, "×", "tb", "middle") + Bx(154, 18, 86, 48, "1%", "risk") + T(250, 47, "=", "tb", "middle") + Bx(260, 18, 204, 48, "$100", "money at risk", "washa");
    s += Bx(16, 104, 94, 48, "25 pips", "stop") + T(120, 133, "×", "tb", "middle") + Bx(130, 104, 96, 48, "$10", "per pip per lot") + T(236, 133, "=", "tb", "middle") + Bx(246, 104, 104, 48, "$250", "lost per lot");
    s += Ar(362, 66, 408, 102, "sacc") + Ar(350, 128, 376, 128) + Bx(378, 104, 86, 48, "0.40", "lots", "washa") + T(420, 172, "$100 ÷ $250", "ts", "middle");
    return fig(480, 180, s, "Stop first, then size: lots = money at risk ÷ money lost per lot at the stop.");
  };

  D.trueRange = function () {
    const panel = function (x0, title, pc, h, l, from, to, formula) {
      let s = T(x0 + 70, 16, title, "tb", "middle");
      s += L(x0 + 60, h, x0 + 60, l, "wu") + '<rect x="' + (x0 + 51) + '" y="' + (h + 12) + '" width="18" height="' + Math.max(4, l - h - 24) + '" class="cu" rx="1"/>';
      s += C(x0 + 26, pc, 5, "fink ring") + T(x0 + 20, pc + 4, "PC", "ts", "end");
      s += L(x0 + 100, from, x0 + 100, to, "sacc") + L(x0 + 94, from, x0 + 106, from, "sacc") + L(x0 + 94, to, x0 + 106, to, "sacc");
      s += T(x0 + 70, 190, formula, "ts", "middle");
      return s;
    };
    let s = panel(8, "No gap", 100, 40, 150, 40, 150, "TR = H − L");
    s += panel(164, "Gap up", 166, 34, 120, 34, 166, "TR = H − PC");
    s += panel(320, "Gap down", 34, 76, 164, 34, 164, "TR = PC − L");
    return fig(480, 200, s, "True Range is the largest of three distances, so overnight gaps count as movement. PC = previous close.");
  };

  D.rScale = function () {
    const x = lin(-1, 3, 60, 420);
    let s = L(x(-1), 70, x(0), 70, "sdn thick") + L(x(0), 70, x(2.5), 70, "sup thick") + L(x(2.5), 70, x(3), 70, "sg");
    [[-1, "−1R", "stop"], [0, "0", "entry"], [1, "+1R", ""], [2, "+2R", "target"], [3, "+3R", ""]].forEach(function (t) { s += L(x(t[0]), 62, x(t[0]), 78, "st") + T(x(t[0]), 52, t[1], "tb", "middle") + T(x(t[0]), 96, t[2], "ts", "middle"); });
    s += C(x(2.5), 70, 6, "facc ring") + T(x(2.5), 120, "exit at +2.5R", "tb", "middle");
    return fig(480, 132, s, "R measures every result in units of the initial risk: the stop is −1R by definition.");
  };

  D.expectancyBar = function () {
    const sc = lin(0, 100, 0, 250), x0 = 196;
    let s = T(16, 34, "40 wins × +2.5R", "tl") + Rc(x0, 20, sc(100), 20, "fup", 3) + T(x0 + sc(100) + 8, 35, "+100R", "tb");
    s += T(16, 76, "60 losses × −1R", "tl") + Rc(x0, 62, sc(60), 20, "fdn", 3) + T(x0 + sc(60) + 8, 77, "−60R", "tb");
    s += T(16, 118, "net over 100 trades", "tl") + Rc(x0, 104, sc(40), 20, "facc", 3) + T(x0 + sc(40) + 8, 119, "+40R = +0.40R per trade", "tb");
    return fig(480, 140, s, "Expectancy is the average R per trade: 40% winners at 2.5R and 60% losers at 1R net +0.40R.");
  };

  D.breakeven = function () {
    const x = lin(0.5, 5, 60, 440), y = lin(0, 70, 196, 20);
    const curve = []; for (let r = 0.5; r <= 5.0001; r += 0.05) curve.push([x(r), y(100 / (1 + r))]);
    let s = '<path d="M' + x(0.5) + "," + y(70) + " L" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L") + " L" + x(5) + "," + y(70) + ' z" class="washup"/>';
    s += '<path d="M' + x(0.5) + "," + y(0) + " L" + curve.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L") + " L" + x(5) + "," + y(0) + ' z" class="washdn"/>';
    [10, 30, 50, 70].forEach(function (v) { s += T(52, y(v) + 4, v + "%", "ts", "end"); });
    [1, 2, 3, 4, 5].forEach(function (r) { s += T(x(r), 214, r + "R", "ts", "middle"); });
    s += Pl(curve, "st thick");
    [[1, 50], [2, 33.3], [3, 25]].forEach(function (p) { s += C(x(p[0]), y(p[1]), 4, "fink ring") + T(x(p[0]) + 8, y(p[1]) - 6, p[1] + "%", "ts"); });
    s += C(x(3), y(30), 5, "facc ring") + T(x(3) + 10, y(30) - 8, "A: 30% at 3R", "tb") + C(x(1), y(60), 5, "facc ring") + T(x(1) + 10, y(60) + 4, "B: 60% at 1R", "tb");
    s += T(430, 40, "positive expectancy", "ts", "end") + T(430, 186, "negative expectancy", "ts", "end") + T(250, 230, "average win (R)", "ts", "middle");
    return fig(480, 236, s, "Break-even win rate = 1 ÷ (1 + R). A and B look opposite but have the same +0.2R expectancy.");
  };

  D.recovery = function () {
    const x = lin(0, 80, 60, 440), y = lin(0, 400, 196, 20);
    const curve = []; for (let l = 0; l <= 80.0001; l += 1) curve.push([x(l), y(100 * l / (100 - l))]);
    let s = "";
    [0, 100, 200, 300, 400].forEach(function (v) { s += L(60, y(v), 440, y(v), "sg") + T(52, y(v) + 4, v + "%", "ts", "end"); });
    [0, 20, 40, 60, 80].forEach(function (l) { s += T(x(l), 214, "−" + l + "%", "ts", "middle"); });
    s += Pl(curve, "sacc thick");
    [[10, 11.1], [25, 33.3], [50, 100], [80, 400]].forEach(function (p) { s += C(x(p[0]), y(p[1]), 4, "fink ring") + T(x(p[0]) - 8, y(p[1]) - 8, "+" + p[1] + "%", "tb", "end"); });
    s += T(250, 230, "drawdown", "ts", "middle");
    return fig(480, 236, s, "The gain needed to recover rises slowly, then almost vertically: −50% needs +100%, −80% needs +400%.");
  };

  D.streaks = function () {
    const pRun = function (n, k, q) {
      let dist = new Array(k).fill(0); dist[0] = 1; let abs = 0;
      for (let t = 0; t < n; t++) { const nd = new Array(k).fill(0); for (let r = 0; r < k; r++) { const p = dist[r]; if (!p) continue; nd[0] += p * (1 - q); if (r + 1 >= k) abs += p * q; else nd[r + 1] += p * q; } dist = nd; }
      return abs;
    };
    const ks = [5, 6, 7, 8, 9, 10, 11, 12];
    const y = lin(0, 1, 176, 30);
    let s = L(40, 176, 460, 176, "sg");
    ks.forEach(function (k, i) {
      const p = pRun(200, k, 0.6), xc = 64 + i * 52;
      s += Rc(xc - 12, y(p), 24, 176 - y(p), k === 7 ? "facc" : "fbar", 3) + T(xc, y(p) - 6, Math.round(p * 100) + "%", "tb", "middle") + T(xc, 194, k + "+", "ts", "middle");
    });
    s += T(250, 212, "losing streak length somewhere in 200 trades (40% win rate)", "ts", "middle");
    return fig(480, 218, s, "At a 40% win rate, a streak of 7+ losses somewhere in 200 trades happens about 9 times in 10.");
  };

  D.mcFan = function () {
    const rng = ENGINE.mulberry32(20260926);
    const panel = function (x0, risk, title) {
      const x = lin(0, 200, x0, x0 + 200), y = lin(0, 80, 40, 186);
      let s = T(x0 + 100, 22, title, "tb", "middle");
      [0, 20, 40, 60, 80].forEach(function (v) { s += L(x0, y(v), x0 + 200, y(v), "sg"); if (x0 < 100) s += T(x0 - 6, y(v) + 4, "−" + v + "%", "ts", "end"); });
      const worst = [];
      for (let r = 0; r < 30; r++) {
        let eq = 1, peak = 1, mdd = 0; const pts = [[x(0), y(0)]];
        for (let t = 1; t <= 200; t++) { eq *= rng() < 0.4 ? 1 + 2 * risk : 1 - risk; if (eq > peak) peak = eq; const dd = (1 - eq / peak) * 100; if (dd > mdd) mdd = dd; if (t % 4 === 0) pts.push([x(t), y(Math.min(80, dd))]); }
        worst.push(mdd); s += Pl(pts, "mcp");
      }
      worst.sort(function (a, b) { return a - b; });
      const med = worst[15];
      s += L(x0, y(Math.min(80, med)), x0 + 200, y(Math.min(80, med)), "sacc thick") + T(x0 + 200, y(Math.min(80, med)) + 16, "median worst ≈ " + Math.round(med) + "%", "tb", "end");
      return s;
    };
    let s = panel(56, 0.01, "1% risk per trade") + panel(270, 0.05, "5% risk per trade");
    s += T(250, 206, "30 simulated runs · same edge (40% wins at +2R) · distance below the peak", "ts", "middle");
    return fig(480, 212, s, "Same edge, same trades, different size: at 5% risk the typical run falls about half its value from the peak.");
  };

  D.differential = function () {
    const x = lin(0, 100, 30, 450);
    const spread = [], pair = [];
    for (let t = 0; t <= 100; t += 2) {
      const base = Math.sin(t / 14) * 18 + t * 0.3;
      spread.push([x(t), 70 - base]);
      const div = (t > 62 && t < 84) ? -(t - 62) * 2.2 * (84 - t) / 11 : 0;
      pair.push([x(t), 178 - base - div * 0.9]);
    }
    let s = Rc(x(62), 14, x(84) - x(62), 194, "washn", 0) + T((x(62) + x(84)) / 2, 206, "risk-off: link breaks", "ts", "middle");
    s += T(30, 16, "2-year spread (DE − US)", "tb") + Pl(spread, "sblue thick") + L(30, 96, 450, 96, "sg");
    s += T(30, 116, "EUR/USD", "tb") + Pl(pair, "st thick");
    return fig(480, 212, s, "Schematic: a pair tends to track its rate differential over months — until fear overrides yield.");
  };

  D.correlation = function () {
    let s = Bx(16, 16, 186, 46, "Long EUR/USD", "risk 1%") + Bx(16, 96, 186, 46, "Long GBP/USD", "risk 1%") + Bx(290, 56, 174, 46, "Short USD", "≈ 2% on one idea", "washa");
    s += Ar(202, 40, 288, 72) + Ar(202, 118, 288, 88) + T(246, 66, "ρ ≈ 0.8", "ts", "middle");
    return fig(480, 156, s, "Two highly correlated positions are one bet at double size.");
  };

  D.turtleFlow = function () {
    const N = 22;
    const p = [[16, 176], [60, 158], [100, 170], [140, 150], [160, 128], [186, 116], [210, 104], [232, 92], [270, 70], [300, 54], [330, 66], [360, 84], [390, 104], [412, 124], [440, 150]];
    let s = L(16, 136, 150, 136, "sblue") + T(18, 130, "20-day high", "ts");
    s += Pl([[250, 164], [300, 146], [360, 130], [412, 124], [460, 124]], "ss") + T(462, 118, "10-day low", "ts", "end");
    s += Pl([[150, 136 + 2 * N], [178, 136 + 2 * N], [178, 124 + 2 * N], [200, 124 + 2 * N], [200, 112 + 2 * N], [222, 112 + 2 * N], [222, 100 + 2 * N], [460, 100 + 2 * N]], "sdn dash") + T(462, 100 + 2 * N + 16, "stop: 2N below newest unit", "ts", "end");
    s += Pl(p, "st path");
    [[150, 136, "1"], [178, 124, "2"], [200, 112, "3"], [222, 100, "4"]].forEach(function (u) { s += C(u[0], u[1], 6, "facc ring") + T(u[0], u[1] - 10, u[2], "tb", "middle"); });
    s += T(186, 70, "units 2–4 every ½N", "ts", "middle") + C(412, 124, 6, "fdn ring") + T(398, 108, "exit all", "tb", "end");
    return fig(480, 212, s, "Turtle System 1: enter on the 20-day breakout, add every ½N up to 4 units, stops 2N below the newest unit, exit on the 10-day low.");
  };

  D.spiral = function () {
    const nodes = [[240, 34, "1 · Loss", "box"], [370, 110, "2 · Urge to recover", "washa"], [240, 186, "3 · Bend a rule", "box"], [110, 110, "4 · Bigger loss", "gatebox"]];
    let s = "";
    nodes.forEach(function (n) { s += Bx(n[0] - 76, n[1] - 18, 152, 36, n[2], null, n[3]); });
    s += Ar(318, 42, 384, 90) + Ar(360, 130, 312, 176) + Ar(166, 180, 104, 130) + Ar(104, 90, 164, 44);
    s += L(326, 150, 354, 142, "sdn thick") + T(410, 164, "breaker cuts here", "tb", "middle");
    s += T(370, 80, "last clear exit", "ts", "middle");
    return fig(480, 214, s, "The failure spiral: recognisable at stage 2, rarely at stage 3 — which is why breakers act for you.");
  };

  D.ladder = function () {
    const steps = [[20, 150, 96, 50, "0.25%"], [130, 116, 96, 84, "0.50%"], [240, 82, 96, 118, "0.75%"], [350, 48, 110, 152, "1.00% ceiling"]];
    let s = "";
    steps.forEach(function (st, i) { s += Rc(st[0], st[1], st[2], st[3], i === 3 ? "washa" : "box") + T(st[0] + st[2] / 2, st[1] + 22, st[4], "tb", "middle"); });
    s += Ar(96, 138, 150, 108, "sup") + Ar(206, 104, 260, 74, "sup") + Ar(316, 70, 370, 40, "sup") + T(240, 30, "up: 20 trades at ≥ 90% adherence", "ts", "middle");
    s += T(240, 216, "down one rung: adherence < 90% · breaker breach: back to 0.25%", "ts", "middle");
    return fig(480, 224, s, "The micro-ladder: you climb only on process, and fall automatically on any breach.");
  };

  D.render = function (key) { try { return D[key] ? D[key]() : ""; } catch (e) { console.error("diagram", key, e); return ""; } };
})();
