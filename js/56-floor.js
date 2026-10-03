/* ============================================================
   TRADING FLOOR — blind bar-replay simulator on synthetic markets
   with hidden DNA (or the student's imported real data).
   Free mode: you place orders, sized by formula.
   Turtle mode: the published rules place every order; your only
   job is not to interfere — every override is counted.
   Autopilot: the Turtle rules across a whole market (or all six).
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const LS_SESS = "rebuild.v3.floor", LS_IMP = "rebuild.v3.import";
  const FL = window.FLOOR = {
    sess: null, M: null, chart: null, tab: "ticket", auto: null, autoAll: null, revealAll: false, timer: null, lastClosed: null,
    ticket: { side: 1, type: "market", entry: "", stop: "", target: "", risk: 0.5, checks: {} },
    ov: { ch: true, sw: false }, checklistMode: false
  };
  const readLS = function (k) { return PLATFORM.storage.get(k, null); };
  const writeLS = function (k, v) { return PLATFORM.storage.set(k, v); };
  const specById = function (id) { return ENGINE.SPECS.filter(function (s) { return s.id === id; })[0]; };
  const loadImport = function () { return readLS(LS_IMP); };

  function buildMarket(sess) {
    if (sess.mkId === "IMP") { const imp = loadImport(); if (!imp) return null; const M = ENGINE.importedMarket(imp, imp.name); M.tf = imp.tf || ""; return M; }
    const spec = specById(sess.specId || sess.mkId) || ENGINE.SPECS[0];
    return ENGINE.genMarket(spec, sess.seed);
  }
  const mkLabel = function (sess, M) {
    if (!sess) return "";
    if (sess.mkId === "IMP") return (M && M.name) || "Imported data";
    if (sess.mkId === "RND" && !sess.revealed) return "Mystery market";
    return (M ? M.spec.code : sess.mkId) + (sess.revealed || FL.revealAll ? " · " + (M ? M.spec.dna : "") : "");
  };

  /* ---------------- session lifecycle ---------------- */
  function newSession(mkId, mode) {
    stopPlay();
    let specId = mkId, seed;
    if (mkId === "RND") { const sp = ENGINE.SPECS[Math.floor(Math.random() * ENGINE.SPECS.length)]; specId = sp.id; seed = Math.floor(Math.random() * 1e9); }
    else if (mkId !== "IMP") seed = specById(mkId).seed;
    const sess = { mkId: mkId, specId: specId, seed: seed, mode: mode, created: Date.now(), orders: [], pos: null, closed: [], devs: 0, events: 0, standAside: false,
      shadow: null, lastWin: false, revealed: false, done: false, setTag: FL.sess ? FL.sess.setTag || "" : "" };
    const M = buildMarket(sess);
    if (!M) { U.toast("No imported data yet — import a CSV first (Session tab).", "bad"); return; }
    const len = Math.min(250, M.n - 80);
    const minStart = Math.min(M.n - len - 1, 120);
    sess.start = minStart + Math.floor(Math.random() * Math.max(1, M.n - len - minStart));
    sess.end = sess.start; sess.stopAt = Math.min(M.n - 1, sess.start + len);
    sess.equity0 = P.simAccount(); sess.equity = sess.equity0;
    FL.sess = sess; FL.M = M; FL.lastClosed = null; FL.tab = mode === "free" ? "ticket" : "position";
    APP.state.sim.sessions = (APP.state.sim.sessions || 0) + 1; STORE.commit(false);
    saveSess();
    render(false);
  }
  function saveSess() { if (FL.sess) writeLS(LS_SESS, FL.sess); }
  function restore() {
    if (FL.sess) return;
    const s = readLS(LS_SESS);
    if (!s || s.done) { if (s) { FL.sess = s; FL.M = buildMarket(s); } return; }
    const M = buildMarket(s); if (!M) return;
    FL.sess = s; FL.M = M;
  }
  function stopPlay() { if (FL.timer) { clearInterval(FL.timer); FL.timer = null; } }

  /* ---------------- broker ---------------- */
  const halfSpread = function (M) { return M.spec.spread * M.spec.pip / 2; };
  function journalTrade(t) {
    const S = FL.sess, M = FL.M;
    const nx = P.next();
    const doc = { id: U.uid("t"), src: M.synthetic ? "sim" : "bt-sim", set: S.setTag || "", date: U.today(), barDate: M.d ? M.d[t.entryIdx] || null : null,
      pair: M.synthetic ? M.spec.code : (M.name || "Imported"), tf: M.synthetic ? "D" : (M.tf || ""), sess: "", setup: S.mode === "free" ? (S.setup || "Floor: free") : "Turtle S" + (S.mode === "s2" ? 2 : 1),
      dir: t.dir > 0 ? "L" : "S", entry: +t.entry.toFixed(6), stop: +t.initStop.toFixed(6), target: t.target ? +t.target.toFixed(6) : null, exit: +t.exit.toFixed(6),
      risk: t.riskPct, lots: t.lots, R: +t.R.toFixed(3), rules: t.dev ? "N" : (S.mode === "free" ? "" : "Y"), broke: t.dev ? t.devWhat || "Overrode the rules" : "", grade: t.dev ? "C" : (S.mode === "free" ? "" : "A"),
      eb: null, ed: null, ea: null, watched: "W", shot: "", note: "", held: t.exitIdx - t.entryIdx, heldUnit: "bars", week: P.currentUnit(),
      sim: { market: M.spec.code, seed: S.seed || 0, entryIdx: t.entryIdx, exitIdx: t.exitIdx, regime: M.reg ? M.reg[t.entryIdx] : null, mode: S.mode, units: t.units, how: t.how } };
    STORE.saveTrade(doc);
    t.jid = doc.id;
  }
  function closePos(f, i, how, dev, devWhat) {
    const S = FL.sess, M = FL.M, p = S.pos; if (!p) return;
    let pnl = 0; p.units.forEach(function (u) { pnl += ENGINE.pnlUSD(M.spec, u.lots, u.px, f, p.dir); });
    S.equity += pnl;
    const t = { dir: p.dir, entryIdx: p.entryIdx, exitIdx: i, entry: p.units[0].px, exit: f, initStop: p.initStop, target: p.target, lots: p.units[0].lots, units: p.units.length,
      riskPct: p.riskPct, R: pnl / p.R1, pnl: pnl, how: how, dev: !!(dev || p.dev), devWhat: devWhat || p.devWhat || "" };
    S.closed.push(t); S.pos = null; FL.lastClosed = t;
    if (S.mode !== "free") S.events++;
    journalTrade(t);
  }
  function openPos(dir, f, i, lots, stop, target, R1, riskPct, gap, n0) {
    FL.sess.pos = { dir: dir, units: [{ px: f, lots: lots }], lastPx: f, stop: stop, initStop: stop, target: target || null, entryIdx: i, R1: R1, riskPct: riskPct, gap: !!gap, n0: n0 || 0 };
  }

  /* free mode */
  function freeStep(i) {
    const S = FL.sess, M = FL.M, hs = halfSpread(M), o = M.o[i];
    let exited = false;
    if (S.pos && S.pos.closeNext) { closePos(S.pos.dir > 0 ? o - hs : o + hs, i, "closed by you at the open"); exited = true; }
    const mkt = S.orders.filter(function (x) { return x.type === "market"; })[0];
    if (mkt && !S.pos && !exited) {
      const dir = mkt.side === "buy" ? 1 : -1, f = dir > 0 ? o + hs : o - hs;
      openPos(dir, f, i, mkt.lots, mkt.stop, mkt.target, mkt.planned, mkt.riskPct, false);
      S.orders = [];
    }
    const getOrders = function () {
      if (S.pos) {
        const p = S.pos, side = p.dir > 0 ? "sell" : "buy";
        const out = [{ side: side, type: "stop", px: p.stop, tag: "stop" }];
        if (p.target) out.push({ side: side, type: "limit", px: p.target, tag: "target" });
        return out;
      }
      if (exited) return [];
      return S.orders.filter(function (x) { return x.type !== "market"; }).map(function (x) { return { side: x.side, type: x.type, px: x.px, tag: "entry", ord: x }; });
    };
    ENGINE.walkBar(M.o[i], M.h[i], M.l[i], M.c[i], getOrders, function (od, px, gap) {
      if (od.tag === "entry") {
        const x = od.ord, dir = x.side === "buy" ? 1 : -1, f = dir > 0 ? px + hs : px - hs;
        openPos(dir, f, i, x.lots, x.stop, x.target, x.planned, x.riskPct, gap);
        S.orders = [];
      } else {
        const f = od.side === "buy" ? px + hs : px - hs;
        closePos(f, i, od.tag === "stop" ? (gap ? "stop — filled through a gap" : "stop") : "target");
        exited = true;
      }
    });
  }

  /* turtle mode — mirrors ENGINE.runTurtle, one bar at a time, with overrides counted */
  function turtleStep(i) {
    const S = FL.sess, M = FL.M, spec = M.spec, ind = ENGINE.indicators(M);
    const sys = S.mode === "s2" ? 2 : 1;
    const EN = sys === 1 ? ind.dc20 : ind.dc55, EX = sys === 1 ? ind.dc10 : ind.dc20, FS = ind.dc55;
    const n0 = ind.N[i - 1];
    if (!(n0 > 0) || !isFinite(EN.up[i]) || !isFinite(FS.up[i])) return;
    const hs = halfSpread(M), tick = spec.pip / 10, riskPerN = APP.state.settings.unitRisk || 0.005;
    const useFilter = sys === 1;
    let exited = false, sExited = false;
    if (S.pos && S.pos.closeNext) { closePos(S.pos.dir > 0 ? M.o[i] - hs : M.o[i] + hs, i, "closed by you at the open", true, "Closed early, overriding the exit rule"); S.devs++; exited = true; }
    if (useFilter) {
      ENGINE.walkBar(M.o[i], M.h[i], M.l[i], M.c[i], function () {
        if (sExited && !S.shadow) return [];
        if (!S.shadow) return [{ side: "buy", type: "stop", px: EN.up[i] + tick, tag: "sentry", dir: 1 }, { side: "sell", type: "stop", px: EN.lo[i] - tick, tag: "sentry", dir: -1 }];
        if (S.shadow.dir === 1) return [{ side: "sell", type: "stop", px: Math.max(S.shadow.stop, EX.lo[i] - tick), tag: "sexit" }];
        return [{ side: "buy", type: "stop", px: Math.min(S.shadow.stop, EX.up[i] + tick), tag: "sexit" }];
      }, function (od, px) {
        if (od.tag === "sentry") { if (sExited) return; S.shadow = { dir: od.dir, px: px, stop: px - od.dir * 2 * n0 }; }
        else { S.lastWin = (px - S.shadow.px) * S.shadow.dir > 0; S.shadow = null; sExited = true; }
      });
    }
    const entryCh = (useFilter && S.lastWin) ? FS : EN;
    if (!S.pos && !exited && S.standAside) {
      if (M.h[i] >= entryCh.up[i] + tick || M.l[i] <= entryCh.lo[i] - tick) { S.devs++; S.missed = (S.missed || 0) + 1; U.toast("You stood aside through a valid signal — counted as an override.", "bad"); }
      return;
    }
    ENGINE.walkBar(M.o[i], M.h[i], M.l[i], M.c[i], function () {
      if (!S.pos) {
        if (exited) return [];
        return [{ side: "buy", type: "stop", px: entryCh.up[i] + tick, tag: "entry", dir: 1 }, { side: "sell", type: "stop", px: entryCh.lo[i] - tick, tag: "entry", dir: -1 }];
      }
      const p = S.pos, out = [];
      if (p.dir === 1) {
        if (p.units.length < 4) out.push({ side: "buy", type: "stop", px: p.lastPx + 0.5 * p.n0, tag: "add" });
        const ex = EX.lo[i] - tick; out.push({ side: "sell", type: "stop", px: Math.max(p.stop, ex), tag: p.stop >= ex ? "2N stop" : "channel exit" });
      } else {
        if (p.units.length < 4) out.push({ side: "sell", type: "stop", px: p.lastPx - 0.5 * p.n0, tag: "add" });
        const ex = EX.up[i] + tick; out.push({ side: "buy", type: "stop", px: Math.min(p.stop, ex), tag: p.stop <= ex ? "2N stop" : "channel exit" });
      }
      return out;
    }, function (od, px, gap) {
      const f = od.side === "buy" ? px + hs : px - hs;
      if (od.tag === "entry") {
        const lots = ENGINE.roundLots(riskPerN * S.equity / ((n0 / spec.pip) * ENGINE.pipValue(spec, f)));
        const R1 = lots * (2 * n0 / spec.pip) * ENGINE.pipValue(spec, f);
        openPos(od.dir, f, i, lots, f - od.dir * 2 * n0, null, R1, riskPerN * 200, gap, n0);
        S.events++;
      } else if (od.tag === "add") {
        const p = S.pos; p.units.push({ px: f, lots: p.units[0].lots }); p.lastPx = f; p.stop = f - p.dir * 2 * p.n0; S.events++;
      } else { closePos(f, i, od.tag + (gap ? " (through a gap)" : "")); exited = true; }
    });
  }

  function step(nSteps) {
    const S = FL.sess; if (!S || S.done) return;
    for (let k = 0; k < (nSteps || 1); k++) {
      if (S.end >= S.stopAt) { endSession(); return; }
      const i = S.end + 1;
      S.end = i;
      if (S.mode === "free") freeStep(i); else turtleStep(i);
      APP.state.sim.bars = (APP.state.sim.bars || 0) + 1;
      if (FL.lastClosed && FL.lastClosed.exitIdx === i && S.mode === "free") { stopPlay(); FL.tab = "session"; break; }
    }
    if (S.end >= S.stopAt) { endSession(); return; }
    saveSess(); refresh();
  }
  function endSession() {
    const S = FL.sess, M = FL.M; stopPlay();
    if (S.pos) { const f = M.c[S.end]; closePos(f, S.end, "session end"); }
    S.done = true; S.orders = []; FL.tab = "session";
    STORE.commit(true); saveSess(); render(false);
    U.toast("Session over. Reveal the market's DNA in the Session tab.");
  }

  /* ---------------- stats ---------------- */
  function sessStats() {
    const S = FL.sess; if (!S) return null;
    const st = ENGINE.stats(S.closed);
    st.adherence = S.mode === "free" ? null : (S.events + S.devs ? S.events / (S.events + S.devs) : 1);
    return st;
  }

  /* ---------------- rendering ---------------- */
  VIEWS.floor = {
    noSoft: true,
    render: function (p) {
      restore();
      if (p && p.id === "auto") FL.tab = "auto";
      const S = FL.sess, M = FL.M;
      let h = "<div class='page floor'><header class='pagehead slim'><div class='eyebrow'>Simulator</div><h1>The Trading Floor</h1></header>";
      h += "<div class='toolbar'>" +
        "<label class='fld'><span>Market</span><select id='fl-mk'>" + ENGINE.SPECS.map(function (s) { return "<option value='" + s.id + "'" + (S && S.mkId === s.id ? " selected" : "") + ">" + s.code + (FL.revealAll ? " · " + esc(s.dna) : "") + "</option>"; }).join("") +
        "<option value='RND'" + (S && S.mkId === "RND" ? " selected" : "") + ">Mystery market (random DNA)</option><option value='IMP'" + (S && S.mkId === "IMP" ? " selected" : "") + ">Your imported data</option></select></label>" +
        "<label class='fld'><span>Mode</span><select id='fl-mode'><option value='free'" + (S && S.mode === "free" ? " selected" : "") + ">Free — you place the orders</option><option value='s1'" + (S && S.mode === "s1" ? " selected" : "") + ">Turtle System 1 — rules place them</option><option value='s2'" + (S && S.mode === "s2" ? " selected" : "") + ">Turtle System 2 — rules place them</option></select></label>" +
        "<button class='btn primary' data-act='flNew'>" + (S ? "New session" : "Start a session") + "</button>" +
        "<span class='acct' id='fl-acct'>" + acctHTML() + "</span></div>";
      if (!S || !M) {
        h += "<section class='panel'><h2>How the Floor works</h2><div class='prose'>" + U.body([
          "Each session drops you at a **random point** in a market and hides the dates, so you can't remember what happened next. You advance **one bar at a time** and decide before you see the next one — exactly the backtesting method from Unit 17.",
          "The six markets are synthetic, each built with hidden **DNA** — how often it trends, ranges or chops, how volatile it is, how fat its tails are. After a session you can reveal the DNA and see *why* your results came out the way they did.",
          "**Free mode:** you place orders; size is computed from your risk % and stop, the way Unit 9 teaches. **Turtle mode:** the published Turtle rules place every order themselves; your only job is not to interfere. Every override is counted against your adherence.",
          "**Autopilot** runs the Turtle rules across a whole market — or all six — in a second, so you can see what a complete system's results actually look like: long losing streaks, a few enormous winners.",
          "Every closed trade is saved to your Journal automatically. Import your own real price data (CSV from MT4/MT5, HistData or Dukascopy) and the Floor becomes a blind backtesting machine for real markets."
        ]) + "</div></section>";
        h += autoPanelHTML();
        return h + "</div>";
      }
      h += "<div class='floorgrid'><div class='chartcol'><div class='chartbar'><span class='mono small'>" + esc(mkLabel(S, M)) + " · " + (S.mode === "free" ? "Free" : "Turtle S" + (S.mode === "s2" ? 2 : 1)) + " · dates hidden</span><span class='sp'></span>" +
        "<label class='tog'><input type='checkbox' id='fl-ch' data-chg='flOv' data-k='ch'" + (FL.ov.ch ? " checked" : "") + "> Channels</label><label class='tog'><input type='checkbox' id='fl-sw' data-chg='flOv' data-k='sw'" + (FL.ov.sw ? " checked" : "") + "> Swings</label>" +
        "<button class='btn xs ghost' data-act='flZoom' data-f='1.25' aria-label='Zoom out'>−</button><button class='btn xs ghost' data-act='flZoom' data-f='0.8' aria-label='Zoom in'>+</button></div>" +
        "<canvas id='fl-canvas' class='pricecanvas big'></canvas>" +
        "<div class='replaybar'><button class='btn primary' data-act='flStep' data-n='1'" + (S.done ? " disabled" : "") + ">Next bar →</button><button class='btn' data-act='flStep' data-n='5'" + (S.done ? " disabled" : "") + ">+5</button>" +
        "<button class='btn ghost' data-act='flPlay'" + (S.done ? " disabled" : "") + " id='fl-play'>" + (FL.timer ? "Pause" : "Play") + "</button><span class='mono small' id='fl-status'>" + statusText() + "</span><span class='sp'></span>" +
        (S.done ? "" : "<button class='btn ghost' data-act='flEnd'>End session</button>") + "</div>" +
        "<div class='signalbar' id='fl-signal'>" + signalHTML() + "</div></div>" +
        "<aside class='sidecol'><nav class='tabs' role='tablist'>" + [["ticket", S.mode === "free" ? "Ticket" : "Rules"], ["position", "Position"], ["session", "Session"], ["auto", "Autopilot"]].map(function (t) { return "<button role='tab' class='tab" + (FL.tab === t[0] ? " on" : "") + "' data-act='flTab' data-t='" + t[0] + "'>" + t[1] + "</button>"; }).join("") + "</nav>" +
        "<div id='fl-side'>" + sideHTML() + "</div></aside></div>";
      h += "<p class='muted small'>Keys: → or N = next bar · P = play/pause · drag the chart to look back · Ctrl+scroll or pinch to zoom.</p>";
      return h + "</div>";
    },
    after: function () {
      const cv = U.$("#fl-canvas");
      if (FL.chart) { FL.chart.destroy(); FL.chart = null; }
      if (cv && FL.M) { FL.chart = new PriceChart(cv, { span: 120 }); drawChart(true); }
    },
    leave: function () { stopPlay(); if (FL.chart) { FL.chart.destroy(); FL.chart = null; } },
    key: function (e) {
      if (!FL.sess || FL.sess.done) return;
      if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") { e.preventDefault(); step(1); }
      else if (e.key === "p" || e.key === "P") { e.preventDefault(); ACT.flPlay(); }
    }
  };
  function acctHTML() {
    const S = FL.sess; if (!S) return "Allocation " + U.money(P.simAccount()) + " (simulated)";
    const ch = (S.equity - S.equity0) / S.equity0;
    return "Equity " + U.money(S.equity) + " <b class='" + (ch >= 0 ? "okt" : "badt") + "'>" + (ch >= 0 ? "+" : "") + (ch * 100).toFixed(2) + "%</b>";
  }
  function statusText() { const S = FL.sess; if (!S) return ""; return "Bar " + (S.end - S.start) + " / " + (S.stopAt - S.start) + (S.done ? " · session over" : ""); }
  function signalHTML() {
    const S = FL.sess, M = FL.M; if (!S || S.done) return S && S.done ? "Session complete — open the Session tab." : "";
    const ind = ENGINE.indicators(M), i = S.end + 1, spec = M.spec, dig = spec.pip === 0.01 ? 3 : 5;
    if (i >= M.n) return "";
    const N = ind.N[S.end];
    if (S.mode === "free") return "N " + (N / spec.pip).toFixed(0) + " pips · 2N = " + (2 * N / spec.pip).toFixed(0) + " pips · 20-day high " + (ind.dc20.up[i] || 0).toFixed(dig) + " · 20-day low " + (ind.dc20.lo[i] || 0).toFixed(dig);
    const sys = S.mode === "s2" ? 2 : 1, EN = sys === 1 ? ind.dc20 : ind.dc55, EX = sys === 1 ? ind.dc10 : ind.dc20;
    if (S.pos) {
      const p = S.pos, ex = p.dir > 0 ? EX.lo[i] : EX.up[i];
      return "Rules for the next bar: " + (p.units.length < 4 ? "add unit " + (p.units.length + 1) + " at " + (p.lastPx + p.dir * 0.5 * p.n0).toFixed(dig) + " · " : "") + "stop " + p.stop.toFixed(dig) + " · exit on " + (sys === 1 ? "10" : "20") + "-day " + (p.dir > 0 ? "low " : "high ") + ex.toFixed(dig);
    }
    const ch = sys === 1 && S.lastWin ? ind.dc55 : EN;
    return (S.standAside ? "<b class='badt'>Standing aside</b> · " : "") + "Rules for the next bar: buy stop " + (ch.up[i]).toFixed(dig) + " · sell stop " + (ch.lo[i]).toFixed(dig) + (sys === 1 && S.lastWin ? " (last breakout won → 55-day failsafe)" : "") + " · N " + (N / spec.pip).toFixed(0) + " pips";
  }
  function sideHTML() {
    const S = FL.sess, M = FL.M;
    if (FL.tab === "auto") return autoPanelHTML();
    if (FL.tab === "session") return sessionHTML();
    if (FL.tab === "position") return positionHTML();
    if (S.mode !== "free") return rulesHTML();
    return ticketHTML();
  }
  function rulesHTML() {
    const S = FL.sess, sys = S.mode === "s2" ? 2 : 1;
    return "<div class='pane'><h3>Turtle System " + sys + " is trading</h3><div class='prose small'>" + U.body([
      "**Entry:** stop orders one tick beyond the " + (sys === 1 ? "20-day" : "55-day") + " high and low" + (sys === 1 ? " — skipped if the last breakout won, in which case the 55-day failsafe is used." : "."),
      "**Size:** one unit = " + (APP.state.settings.unitRisk * 100) + "% of equity per N. **Adds:** every ½N, up to 4 units. **Stop:** 2N from the newest unit.",
      "**Exit:** the " + (sys === 1 ? "10-day" : "20-day") + " opposite breakout, all units together.",
      "Your job is to advance bars and **not interfere**. You can — but every override is counted, exactly as it would be in your journal."
    ]) + "</div><div class='row wrap'><button class='btn " + (S.standAside ? "primary" : "ghost") + "' data-act='flStand'>" + (S.standAside ? "Stop standing aside" : "Stand aside (skip signals)") + "</button></div>" +
      "<div class='kv'><div><span>Rule events</span><b>" + S.events + "</b></div><div><span>Your overrides</span><b class='" + (S.devs ? "badt" : "") + "'>" + S.devs + "</b></div><div><span>Adherence</span><b>" + U.pct(S.events + S.devs ? S.events / (S.events + S.devs) : 1) + "</b></div></div></div>";
  }
  function ticketHTML() {
    const S = FL.sess, M = FL.M, T = FL.ticket, spec = M.spec, dig = spec.pip === 0.01 ? 3 : 5;
    if (S.done) return "<div class='pane'><p>The session is over. Start a new one to place orders.</p></div>";
    if (S.pos) return "<div class='pane'><p>You have an open position — manage it in the Position tab. One position at a time.</p></div>";
    const calc = ticketCalc();
    let h = "<div class='pane ticket'><div class='seg'><button class='segb" + (T.side > 0 ? " on buy" : "") + "' data-act='flSide' data-v='1'>Buy</button><button class='segb" + (T.side < 0 ? " on sell" : "") + "' data-act='flSide' data-v='-1'>Sell</button></div>" +
      "<label class='fld'><span>Entry</span><select id='tk-type' data-chg='flTk' data-k='type'><option value='market'" + (T.type === "market" ? " selected" : "") + ">Market — next bar's open</option><option value='stop'" + (T.type === "stop" ? " selected" : "") + ">Stop order (breakout)</option><option value='limit'" + (T.type === "limit" ? " selected" : "") + ">Limit order (pullback)</option></select></label>" +
      (T.type !== "market" ? "<label class='fld'><span>Entry price</span><input id='tk-entry' type='number' step='any' value='" + esc(T.entry) + "' data-chg='flTk' data-k='entry'></label>" : "") +
      "<label class='fld'><span>Stop (where the idea is wrong)</span><div class='row'><input id='tk-stop' type='number' step='any' value='" + esc(T.stop) + "' data-chg='flTk' data-k='stop'><button class='btn xs ghost' data-act='flStop2N'>2N</button><button class='btn xs ghost' data-act='flStopSwing'>Swing</button></div></label>" +
      "<label class='fld'><span>Target (optional)</span><div class='row'><input id='tk-target' type='number' step='any' value='" + esc(T.target) + "' data-chg='flTk' data-k='target'><button class='btn xs ghost' data-act='flTarget2R'>2R</button></div></label>" +
      "<label class='fld'><span>Risk per trade</span><select id='tk-risk' data-chg='flTk' data-k='risk'>" + [0.25, 0.5, 0.75, 1].map(function (r) { return "<option value='" + r + "'" + (T.risk === r ? " selected" : "") + ">" + r + "%</option>"; }).join("") + "</select></label>" +
      "<label class='fld'><span>Setup name (for your journal)</span><input id='tk-setup' type='text' value='" + esc(S.setup || "") + "' data-chg='flSetup' placeholder='e.g. 4H BOS continuation'></label>";
    h += "<div class='calc'>" + (calc.err ? "<span class='badt'>" + esc(calc.err) + "</span>" : "Stop distance <b>" + calc.pips.toFixed(1) + " pips</b> · risk <b>" + U.money(calc.risk) + "</b> · size <b>" + calc.lots.toFixed(2) + " lots</b>" + (calc.rr ? " · planned <b>" + calc.rr.toFixed(1) + "R</b>" : "") + "<div class='muted small'>" + U.money(calc.risk) + " ÷ (" + calc.pips.toFixed(1) + " × " + U.money(calc.pv).replace("$", "$") + " per pip per lot) = " + calc.raw.toFixed(3) + " → rounded down</div>") + "</div>";
    h += "<label class='tog'><input type='checkbox' id='tk-cm' data-chg='flCheckMode'" + (FL.checklistMode ? " checked" : "") + "> Require my pre-trade checklist</label>";
    let allTicked = true;
    if (FL.checklistMode) {
      h += "<div class='checklist'>" + APP.state.settings.checklist.map(function (c, k) { const on = !!T.checks[k]; if (!on) allTicked = false; return "<label class='check'><input type='checkbox' id='tk-c" + k + "' data-chg='flCheck' data-k='" + k + "'" + (on ? " checked" : "") + "> <span>" + esc(c) + "</span></label>"; }).join("") + "</div>";
    }
    h += "<button class='btn primary block' data-act='flPlace'" + (calc.err || (FL.checklistMode && !allTicked) ? " disabled" : "") + ">" + (T.side > 0 ? "Buy" : "Sell") + " " + (calc.err ? "" : calc.lots.toFixed(2) + " lots ") + (T.type === "market" ? "at next open" : "on a " + T.type + " at " + esc(T.entry)) + "</button>";
    if (S.orders.length) h += "<div class='pending'><div class='label'>Pending</div>" + S.orders.map(function (o) { return "<div class='row'><span class='mono small'>" + o.side + " " + o.type + (o.type !== "market" ? " @ " + o.px.toFixed(dig) : "") + " · " + o.lots.toFixed(2) + " lots · stop " + o.stop.toFixed(dig) + "</span><button class='btn xs ghost' data-act='flCancel'>Cancel</button></div>"; }).join("") + "</div>";
    return h + "</div>";
  }
  function ticketCalc() {
    const S = FL.sess, M = FL.M, T = FL.ticket, spec = M.spec;
    const ref = T.type === "market" ? M.c[S.end] : parseFloat(T.entry);
    const stop = parseFloat(T.stop), target = parseFloat(T.target);
    if (!isFinite(ref)) return { err: "Enter an entry price." };
    if (!isFinite(stop)) return { err: "Enter a stop — where your idea is proven wrong." };
    if ((T.side > 0 && stop >= ref) || (T.side < 0 && stop <= ref)) return { err: "The stop must be " + (T.side > 0 ? "below" : "above") + " the entry." };
    if (isFinite(target) && ((T.side > 0 && target <= ref) || (T.side < 0 && target >= ref))) return { err: "The target must be " + (T.side > 0 ? "above" : "below") + " the entry." };
    if (T.type === "stop" && ((T.side > 0 && ref <= M.c[S.end]) || (T.side < 0 && ref >= M.c[S.end]))) return { err: "A " + (T.side > 0 ? "buy" : "sell") + " stop sits " + (T.side > 0 ? "above" : "below") + " the current price." };
    if (T.type === "limit" && ((T.side > 0 && ref >= M.c[S.end]) || (T.side < 0 && ref <= M.c[S.end]))) return { err: "A " + (T.side > 0 ? "buy" : "sell") + " limit sits " + (T.side > 0 ? "below" : "above") + " the current price." };
    const pips = Math.abs(ref - stop) / spec.pip, pv = ENGINE.pipValue(spec, ref), risk = S.equity * T.risk / 100;
    const raw = risk / (pips * pv), lots = ENGINE.roundLots(raw);
    return { pips: pips, pv: pv, risk: risk, raw: raw, lots: lots, ref: ref, stop: stop, target: isFinite(target) ? target : null, rr: isFinite(target) ? Math.abs(target - ref) / Math.abs(ref - stop) : null };
  }
  function positionHTML() {
    const S = FL.sess, M = FL.M, p = S.pos, spec = M.spec, dig = spec.pip === 0.01 ? 3 : 5;
    if (!p) return "<div class='pane'><p class='muted'>No open position." + (S.mode === "free" ? " Use the Ticket tab to place an order." : " The rules will enter on the next breakout.") + "</p></div>";
    const px = M.c[S.end];
    let pnl = 0; p.units.forEach(function (u) { pnl += ENGINE.pnlUSD(spec, u.lots, u.px, px, p.dir); });
    const R = pnl / p.R1;
    let h = "<div class='pane'><h3>" + (p.dir > 0 ? "Long" : "Short") + " · " + p.units.length + " unit" + (p.units.length > 1 ? "s" : "") + " × " + p.units[0].lots.toFixed(2) + " lots</h3><div class='kv'>" +
      "<div><span>Open result</span><b class='" + (R >= 0 ? "okt" : "badt") + "'>" + U.fmtR(R) + "</b></div><div><span>Money</span><b>" + U.money(pnl) + "</b></div>" +
      "<div><span>Entry</span><b class='mono'>" + p.units[0].px.toFixed(dig) + "</b></div><div><span>Stop</span><b class='mono'>" + p.stop.toFixed(dig) + "</b></div>" +
      (p.target ? "<div><span>Target</span><b class='mono'>" + p.target.toFixed(dig) + "</b></div>" : "") + "<div><span>Bars held</span><b>" + (S.end - p.entryIdx) + "</b></div></div>";
    if (S.mode === "free") h += "<div class='row wrap'><button class='btn' data-act='flBE'>Move stop to breakeven</button><button class='btn ghost' data-act='flCloseNext'" + (p.closeNext ? " disabled" : "") + ">" + (p.closeNext ? "Closing at next open" : "Close at next open") + "</button></div><p class='muted small'>Only moves your written rules allow count as clean. The in-trade rule (Unit 19): do nothing you didn't decide before entry.</p>";
    else h += "<div class='row wrap'><button class='btn ghost' data-act='flCloseNext'" + (p.closeNext ? " disabled" : "") + ">" + (p.closeNext ? "Closing at next open (override)" : "Close early (override)") + "</button></div><p class='muted small'>The published rules call the exits 'probably the single most difficult part' — watching open profit shrink while waiting for the channel exit.</p>";
    return h + "</div>";
  }
  function sessionHTML() {
    const S = FL.sess, M = FL.M, st = sessStats();
    let h = "<div class='pane'>";
    if (FL.lastClosed && S.mode === "free" && FL.lastClosed.jid && APP.trades[FL.lastClosed.jid]) {
      const t = FL.lastClosed, doc = APP.trades[t.jid];
      h += "<div class='gradecard'><div class='label'>Last trade: " + U.fmtR(t.R) + " · " + esc(t.how) + "</div><div class='row wrap'><span class='small'>Followed every rule?</span>" + ["Y", "N"].map(function (v) { return "<button class='btn xs" + (doc.rules === v ? " primary" : " ghost") + "' data-act='flGrade' data-f='rules' data-v='" + v + "'>" + (v === "Y" ? "Yes" : "No") + "</button>"; }).join("") + "</div>" +
        "<div class='row wrap'><span class='small'>Execution grade</span>" + ["A", "B", "C"].map(function (v) { return "<button class='btn xs" + (doc.grade === v ? " primary" : " ghost") + "' data-act='flGrade' data-f='grade' data-v='" + v + "'>" + v + "</button>"; }).join("") + "</div>" +
        "<div class='row wrap'><span class='small'>Emotion during (1–5)</span>" + [1, 2, 3, 4, 5].map(function (v) { return "<button class='btn xs" + (doc.ed === v ? " primary" : " ghost") + "' data-act='flGrade' data-f='ed' data-v='" + v + "'>" + v + "</button>"; }).join("") + "</div></div>";
    }
    h += "<div class='kv'><div><span>Trades</span><b>" + st.n + "</b></div><div><span>Expectancy</span><b>" + (st.n ? U.fmtR(st.expectancy) : "—") + "</b></div><div><span>Win rate</span><b>" + (st.n ? U.pct(st.winRate) : "—") + "</b></div>" +
      "<div><span>Total</span><b>" + (st.n ? U.fmtR(st.totalR, 1) : "—") + "</b></div><div><span>Max drawdown</span><b>" + (st.n ? st.maxDD.toFixed(1) + "R" : "—") + "</b></div><div><span>Longest losing run</span><b>" + st.longestLoss + "</b></div>" +
      (st.adherence !== null ? "<div><span>Adherence</span><b>" + U.pct(st.adherence) + "</b></div>" : "") + "</div>";
    if (st.n) h += SVGC.line([{ values: st.curve, cls: "ser-acc", area: true, label: "Cumulative R" }], { w: 420, h: 170, fmt: function (v) { return v.toFixed(1) + "R"; }, unit: "R", label: "Cumulative R this session", x1: true });
    if (st.n >= 3) h += SVGC.hist(S.closed.map(function (t) { return t.R; }), { w: 420, h: 150 });
    h += "<label class='fld'><span>Tag these trades (test set, e.g. v1-A)</span><input id='fl-tag' type='text' value='" + esc(S.setTag || "") + "' data-chg='flTag'></label>";
    if (M.reg) {
      if (!S.revealed) h += "<button class='btn " + (S.done ? "primary" : "ghost") + " block' data-act='flReveal'>Reveal this market's DNA" + (S.done ? "" : " (ends blind mode)") + "</button>";
      else h += dnaHTML(M, S.closed);
    }
    h += importHTML();
    return h + "</div>";
  }
  function dnaHTML(M, trades) {
    const cnt = [0, 0, 0, 0]; M.reg.forEach(function (r) { cnt[r]++; });
    let h = "<div class='dna'><div class='label'>Market DNA · " + esc(M.spec.code) + "</div><h4>" + esc(M.spec.dna) + "</h4><p class='small'>" + esc(M.spec.story) + "</p>" +
      "<div class='regbar'>" + cnt.map(function (c, k) { return c ? "<span class='rg r" + k + "' style='flex:" + c + "'>" + ENGINE.REGIMES[k] + " " + Math.round(100 * c / M.n) + "%</span>" : ""; }).join("") + "</div>";
    if (trades && trades.length) {
      const by = [[], [], [], []]; trades.forEach(function (t) { if (M.reg[t.entryIdx] !== undefined) by[M.reg[t.entryIdx]].push(t.R); });
      h += SVGC.bars(by.map(function (arr, k) { return { label: ENGINE.REGIMES[k], value: arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0, n: arr.length }; }).filter(function (b) { return b.n; }), { w: 420, h: 170, fmt: function (v) { return v.toFixed(2) + "R"; }, label: "Expectancy by regime at entry", caption: "Your expectancy by the regime you entered in. The chart now shows the regime band under the candles." });
    }
    return h + "</div>";
  }
  function importHTML() {
    const imp = loadImport();
    return "<details class='import'><summary>Import your own real data (CSV)</summary><p class='small'>Export daily or hourly bars from MT4/MT5 (History Center → Export), HistData.com or Dukascopy. Columns: date, open, high, low, close (a time column is fine). The most recent 6,000 rows are kept in this browser.</p>" +
      "<label class='fld'><span>Name (e.g. EURUSD)</span><input id='imp-name' type='text' value='" + esc(imp ? imp.name : "") + "'></label><label class='fld'><span>Timeframe (e.g. D, H4, H1)</span><input id='imp-tf' type='text' value='" + esc(imp ? imp.tf : "") + "'></label>" +
      "<label class='fld'><span>CSV file</span><input id='imp-file' type='file' accept='.csv,.txt,text/csv' data-chg='flImport'></label>" + (imp ? "<p class='small'>Loaded: <b>" + esc(imp.name) + "</b> · " + imp.c.length + " bars. Choose 'Your imported data' as the market.</p>" : "") + "</details>";
  }

  /* ---------------- autopilot ---------------- */
  function autoPanelHTML() {
    const S = FL.sess, M = FL.M;
    let h = "<div class='pane'><h3>Turtle Autopilot</h3><p class='small muted'>The complete published rules, run across a whole market's history in one go — every signal taken, nothing skipped, unit size " + (APP.state.settings.unitRisk * 100) + "% per N.</p><div class='row wrap'>" +
      (M ? "<button class='btn' data-act='flAuto' data-sys='1'>System 1 on " + esc(S && S.mkId === "RND" && !S.revealed ? "this mystery market" : M.spec.code) + "</button><button class='btn' data-act='flAuto' data-sys='2'>System 2</button>" : "") +
      "<button class='btn primary' data-act='flAutoAll'>Both systems on all six markets</button></div>";
    const a = FL.auto;
    if (a && M && a.key === autoKey()) {
      const st = a.stats;
      h += "<div class='kv'><div><span>Trades</span><b>" + st.n + "</b></div><div><span>Win rate</span><b>" + U.pct(st.winRate) + "</b></div><div><span>Expectancy</span><b>" + U.fmtR(st.expectancy) + "</b></div><div><span>Total</span><b>" + U.fmtR(st.totalR, 1) + "</b></div>" +
        "<div><span>Max drawdown</span><b>" + st.maxDD.toFixed(1) + "R</b></div><div><span>Longest losing run</span><b>" + st.longestLoss + "</b></div><div><span>Avg win / loss</span><b>" + st.avgWin.toFixed(2) + " / " + st.avgLoss.toFixed(2) + "R</b></div><div><span>Top-3 share of profit</span><b>" + (st.top3Share === null ? "n/a (net loss)" : U.pct(st.top3Share)) + "</b></div></div>";
      h += SVGC.line([{ values: st.curve, cls: "ser-acc", area: true, label: "Cumulative R" }], { w: 420, h: 180, fmt: function (v) { return v.toFixed(0) + "R"; }, unit: "R", label: "Turtle System " + a.sys + " cumulative R", x1: true, caption: "System " + a.sys + " · cumulative R, trade by trade" });
      h += SVGC.hist(a.trades.map(function (t) { return t.R; }), { w: 420, h: 150, caption: "Most trades lose a little; a few win a lot." });
      if (st.top3Share !== null) h += "<p class='callout small'>The three best trades produced " + U.pct(st.top3Share) + " of the net profit. Skip the wrong three signals and the whole system goes negative.</p>";
      else h += "<p class='callout small'>The rules lost money here. Same rules, different market — market selection is part of the system.</p>";
    }
    if (FL.autoAll) {
      h += "<div class='tablewrap'><table class='tbl'><thead><tr><th>Market</th><th>S1</th><th>S1 DD</th><th>S2</th>" + (FL.revealAll ? "<th>DNA</th>" : "") + "</tr></thead><tbody>" +
        FL.autoAll.map(function (r) { return "<tr><td class='mono'>" + esc(r.code) + "</td><td class='num " + (r.s1.expectancy >= 0 ? "okt" : "badt") + "'>" + U.fmtR(r.s1.expectancy) + "</td><td class='num'>" + r.s1.maxDD.toFixed(0) + "R</td><td class='num " + (r.s2.expectancy >= 0 ? "okt" : "badt") + "'>" + U.fmtR(r.s2.expectancy) + "</td>" + (FL.revealAll ? "<td class='small'>" + esc(r.dna) + "</td>" : "") + "</tr>"; }).join("") +
        "</tbody></table></div>" + (FL.revealAll ? "" : "<button class='btn ghost' data-act='flRevealAll'>Reveal all six DNAs</button>") +
        "<p class='small muted'>S1/S2 = expectancy per trade; DD = max drawdown. Identical rules, six different results. Which DNA suits a breakout system — and which one would you never trade it on?</p>";
    }
    return h + "</div>";
  }
  const autoKey = function () { const S = FL.sess; return S ? S.mkId + ":" + (S.seed || 0) : ""; };
  ACT.flAuto = function (el) {
    const M = FL.M; if (!M) return;
    const sys = Number(el.dataset.sys);
    const r = ENGINE.runTurtle(M, { sys: sys, riskPerN: APP.state.settings.unitRisk, equity0: 100000 });
    FL.auto = { key: autoKey(), sys: sys, trades: r.trades, stats: ENGINE.stats(r.trades) };
    FL.tab = "auto"; refresh();
  };
  ACT.flAutoAll = function () {
    FL.autoAll = ENGINE.SPECS.map(function (sp) {
      const M = ENGINE.genMarket(sp);
      return { code: sp.code, dna: sp.dna, s1: ENGINE.stats(ENGINE.runTurtle(M, { sys: 1, riskPerN: APP.state.settings.unitRisk }).trades), s2: ENGINE.stats(ENGINE.runTurtle(M, { sys: 2, riskPerN: APP.state.settings.unitRisk }).trades) };
    });
    FL.tab = "auto";
    if (FL.sess) refresh(); else render(false);
  };
  ACT.flRevealAll = function () { FL.revealAll = true; if (FL.sess) refresh(); else render(false); };

  /* ---------------- refresh ---------------- */
  function drawChart(reset) {
    const S = FL.sess, M = FL.M; if (!FL.chart || !S || !M) return;
    const sys = S.mode === "s2" ? 2 : 1;
    const orders = [];
    const dig = M.spec.pip === 0.01 ? 3 : 5;
    S.orders.forEach(function (o) { if (o.type !== "market") orders.push({ px: o.px, label: o.side + " " + o.type }); });
    FL.chart.set({ M: M, end: S.end, blind: true, resetView: !!reset,
      overlays: { entry: FL.ov.ch ? (S.mode === "free" ? 20 : (sys === 1 ? (S.lastWin && !S.pos ? 55 : 20) : 55)) : 0, exit: FL.ov.ch && S.mode !== "free" ? (sys === 1 ? 10 : 20) : 0, swings: FL.ov.sw },
      trades: S.closed, position: S.pos, orders: orders, showRegimes: S.revealed && !!M.reg });
    void dig;
  }
  function refresh() {
    if (APP.view.name !== "floor") return;
    const side = U.$("#fl-side"); if (side) side.innerHTML = sideHTML();
    const s = U.$("#fl-status"); if (s) s.textContent = statusText();
    const g = U.$("#fl-signal"); if (g) g.innerHTML = signalHTML();
    const a = U.$("#fl-acct"); if (a) a.innerHTML = acctHTML();
    U.$$(".floor .tabs .tab").forEach(function (b) { b.classList.toggle("on", b.dataset.t === FL.tab); });
    const pl = U.$("#fl-play"); if (pl) pl.textContent = FL.timer ? "Pause" : "Play";
    drawChart(false);
  }
  FL.refresh = refresh;

  /* ---------------- actions ---------------- */
  ACT.flNew = function () { newSession(U.$("#fl-mk").value, U.$("#fl-mode").value); };
  ACT.flStep = function (el) { step(Number(el.dataset.n) || 1); };
  ACT.flPlay = function () {
    if (FL.timer) { stopPlay(); refresh(); return; }
    if (!FL.sess || FL.sess.done) return;
    FL.timer = setInterval(function () { if (!FL.sess || FL.sess.done || APP.view.name !== "floor") { stopPlay(); return; } step(1); }, 450);
    refresh();
  };
  ACT.flEnd = function () { if (!window.confirmTwice("endsess")) return; endSession(); };
  ACT.flTab = function (el) { FL.tab = el.dataset.t; refresh(); };
  ACT.flOv = function (el) { FL.ov[el.dataset.k] = el.checked; drawChart(false); };
  ACT.flZoom = function (el) { if (FL.chart) FL.chart.zoom(parseFloat(el.dataset.f)); };
  ACT.flSide = function (el) { FL.ticket.side = Number(el.dataset.v); refresh(); };
  ACT.flTk = function (el) { const k = el.dataset.k; FL.ticket[k] = k === "risk" ? parseFloat(el.value) : el.value; refresh(); };
  ACT.flSetup = function (el) { if (FL.sess) { FL.sess.setup = el.value; saveSess(); } };
  ACT.flTag = function (el) { if (FL.sess) { FL.sess.setTag = el.value.trim(); saveSess(); U.toast("New trades will be tagged '" + FL.sess.setTag + "'."); } };
  ACT.flCheckMode = function (el) { FL.checklistMode = el.checked; FL.ticket.checks = {}; refresh(); };
  ACT.flCheck = function (el) { FL.ticket.checks[el.dataset.k] = el.checked; refresh(); };
  ACT.flStop2N = function () {
    const S = FL.sess, M = FL.M, T = FL.ticket, N = ENGINE.indicators(M).N[S.end];
    const ref = T.type === "market" ? M.c[S.end] : parseFloat(T.entry); if (!isFinite(ref) || !isFinite(N)) return;
    T.stop = (ref - T.side * 2 * N).toFixed(M.spec.pip === 0.01 ? 3 : 5); refresh();
  };
  ACT.flStopSwing = function () {
    const S = FL.sess, M = FL.M, T = FL.ticket;
    const sw = ENGINE.swings(M, 3, Math.max(0, S.end - 120), S.end).filter(function (s) { return T.side > 0 ? s.type === "L" : s.type === "H"; });
    if (!sw.length) { U.toast("No confirmed swing in view.", "bad"); return; }
    const last = sw[sw.length - 1], buf = M.spec.pip * 3;
    T.stop = (T.side > 0 ? last.px - buf : last.px + buf).toFixed(M.spec.pip === 0.01 ? 3 : 5); refresh();
  };
  ACT.flTarget2R = function () {
    const S = FL.sess, M = FL.M, T = FL.ticket;
    const ref = T.type === "market" ? M.c[S.end] : parseFloat(T.entry), stop = parseFloat(T.stop);
    if (!isFinite(ref) || !isFinite(stop)) { U.toast("Set the entry and stop first.", "bad"); return; }
    T.target = (ref + 2 * (ref - stop)).toFixed(M.spec.pip === 0.01 ? 3 : 5); refresh();
  };
  ACT.flPlace = function () {
    const S = FL.sess, T = FL.ticket, c = ticketCalc();
    if (c.err) { U.toast(c.err, "bad"); return; }
    S.orders = [{ side: T.side > 0 ? "buy" : "sell", type: T.type, px: T.type === "market" ? null : c.ref, stop: c.stop, target: c.target, lots: c.lots, riskPct: T.risk, planned: S.equity * T.risk / 100 }];
    T.checks = {}; FL.tab = "ticket"; saveSess(); refresh();
    U.toast(T.type === "market" ? "Order placed — fills at the next bar's open." : "Order working. Advance bars to see if it triggers.");
  };
  ACT.flCancel = function () { FL.sess.orders = []; saveSess(); refresh(); };
  ACT.flBE = function () { const p = FL.sess.pos; if (!p) return; p.stop = p.units[0].px; saveSess(); refresh(); U.toast("Stop moved to breakeven."); };
  ACT.flCloseNext = function () { const p = FL.sess.pos; if (!p) return; p.closeNext = true; if (FL.sess.mode !== "free") { p.dev = true; p.devWhat = "Closed early, overriding the exit rule"; } saveSess(); refresh(); };
  ACT.flStand = function () { FL.sess.standAside = !FL.sess.standAside; saveSess(); refresh(); };
  ACT.flReveal = function () { if (!FL.sess.done && !window.confirmTwice("reveal")) return; FL.sess.revealed = true; saveSess(); refresh(); };
  ACT.flGrade = function (el) {
    const t = FL.lastClosed; if (!t || !t.jid || !APP.trades[t.jid]) return;
    const doc = U.clone(APP.trades[t.jid]);
    doc[el.dataset.f] = el.dataset.f === "ed" ? Number(el.dataset.v) : el.dataset.v;
    if (el.dataset.f === "rules" && el.dataset.v === "N" && !doc.grade) doc.grade = "C";
    STORE.saveTrade(doc); refresh();
  };
  ACT.flImport = function (el) {
    const file = el.files && el.files[0]; if (!file) return;
    const name = (U.$("#imp-name").value || file.name.replace(/\.[^.]+$/, "")).trim(), tf = (U.$("#imp-tf").value || "").trim();
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const p = ENGINE.parseCSV(String(reader.result));
        const keep = 6000, k0 = Math.max(0, p.c.length - keep);
        const imp = { name: name, tf: tf, o: p.o.slice(k0), h: p.h.slice(k0), l: p.l.slice(k0), c: p.c.slice(k0), d: p.d.slice(k0) };
        if (imp.c.length < 200) throw new Error("Need at least 200 bars for a session.");
        if (!writeLS(LS_IMP, imp)) throw new Error("That file couldn't be stored.");
        PLATFORM.storage.flush().then(function () { U.toast("Imported " + imp.c.length + " bars of " + name + "."); }, function () { U.toast("This browser wouldn't save that much data — it will be gone after a reload. Try a shorter file.", "bad"); });
        const mk = U.$("#fl-mk"); if (mk) mk.value = "IMP";
        refresh();
      } catch (e) { U.toast(e.message, "bad"); }
    };
    reader.readAsText(file);
  };
})();
