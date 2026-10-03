/* ============================================================
   JOURNAL — every trade (TradingView backtests, Floor sessions,
   demo, live) in one log, with R computed for you, segments,
   the style diagnostic, and the evidence the gates check.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const SRC = { bt: "Backtest · TradingView", "bt-sim": "Backtest · Floor (real data)", demo: "Demo", live: "Live", sim: "Floor · synthetic" };
  const REAL = ["bt", "bt-sim", "demo", "live"];
  const JV = { tab: "log", filter: "real", set: "", seg: "sess", edit: null };

  /* ---------- sessions in SAST, daylight-saving aware ---------- */
  const lastSunday = function (y, m) { const d = new Date(y, m + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; };
  const nthSunday = function (y, m, n) { const d = new Date(y, m, 1); d.setDate(1 + ((7 - d.getDay()) % 7) + 7 * (n - 1)); return d; };
  function sessionOf(dateISO, hhmm) {
    if (!dateISO || !hhmm) return "";
    const d = U.parseISO(dateISO), y = d.getFullYear();
    const euS = d >= lastSunday(y, 2) && d < lastSunday(y, 9);
    const usS = d >= nthSunday(y, 2, 2) && d < nthSunday(y, 10, 1);
    const p = hhmm.split(":"), h = Number(p[0]) + Number(p[1] || 0) / 60;
    const lo = euS ? 9 : 10, lc = euS ? 18 : 19, no = usS ? 14 : 15, nc = usS ? 23 : 24;
    if (h >= 1 && h < lo) return "Asia";
    if (h >= lo && h < no) return "London";
    if (h >= no && h < lc) return "Overlap";
    if (h >= lc && h < nc) return "New York";
    return "Off-hours";
  }
  function computeR(t) {
    const e = parseFloat(t.entry), s = parseFloat(t.stop), x = parseFloat(t.exit);
    if (!isFinite(e) || !isFinite(s) || !isFinite(x) || e === s) return null;
    return t.dir === "S" ? (e - x) / (s - e) : (x - e) / (e - s);
  }

  /* ---------- queries & stats ---------- */
  const J = window.JOURNAL = {};
  J.computeR = computeR; J.sessionOf = sessionOf; // exposed for the unit tests
  J.all = function () { return Object.keys(APP.trades).map(function (k) { return APP.trades[k]; }).filter(function (t) { return t && isFinite(t.R); }); };
  J.list = function (f) {
    f = f || {};
    let arr = J.all();
    if (f.real) arr = arr.filter(function (t) { return REAL.indexOf(t.src) >= 0; });
    if (f.src) arr = arr.filter(function (t) { return f.src.indexOf(t.src) >= 0; });
    if (f.week !== undefined) arr = arr.filter(function (t) { return t.week === f.week; });
    if (f.set) arr = arr.filter(function (t) { return (t.set || "") === f.set; });
    return arr.sort(function (a, b) { return ((a.date || "") + (a.tin || "") + (a.createdAt || a.updatedAt || 0)).localeCompare((b.date || "") + (b.tin || "") + (b.createdAt || b.updatedAt || 0)); });
  };
  J.stats = function (list) {
    const st = ENGINE.stats(list);
    const judged = list.filter(function (t) { return t.rules === "Y" || t.rules === "N"; });
    st.adherence = judged.length ? judged.filter(function (t) { return t.rules === "Y"; }).length / judged.length : null;
    st.grades = { A: 0, B: 0, C: 0, none: 0 };
    list.forEach(function (t) { if (st.grades[t.grade] !== undefined) st.grades[t.grade]++; else st.grades.none++; });
    const eds = list.map(function (t) { return t.ed; }).filter(function (v) { return isFinite(v) && v > 0; });
    st.emotion = eds.length ? eds.reduce(function (a, b) { return a + b; }, 0) / eds.length : null;
    return st;
  };
  J.evidence = function (c) {
    const bt = J.list({ src: ["bt", "bt-sim"] }), demo = J.list({ src: ["demo"] });
    if (c.test === "btCount") return { ok: bt.length >= c.min, value: bt.length + " trades" };
    if (c.test === "btExpectancy") { const s = J.stats(bt); return { ok: bt.length > 0 && s.expectancy > c.min, value: bt.length ? U.fmtR(s.expectancy) : "no trades" }; }
    if (c.test === "twoSets") {
      const by = {}; bt.forEach(function (t) { const k = t.set || ""; if (!k) return; (by[k] = by[k] || []).push(t); });
      const good = Object.keys(by).filter(function (k) { return by[k].length >= 30 && ENGINE.stats(by[k]).expectancy > 0; });
      return { ok: good.length >= 2, value: good.length ? good.join(", ") : Object.keys(by).length + " set(s), none qualifying yet" };
    }
    if (c.test === "demoCount") return { ok: demo.length >= c.min, value: demo.length + " demo trades" };
    if (c.test === "demoGraded") { const g = demo.filter(function (t) { return t.grade === "A" || t.grade === "B" || t.grade === "C"; }).length; return { ok: demo.length > 0 && g === demo.length, value: g + " / " + demo.length + " graded" }; }
    if (c.test === "demoAdherence") { const s = J.stats(demo); return { ok: s.adherence !== null && s.adherence >= c.min, value: s.adherence === null ? "no data" : U.pct(s.adherence) }; }
    return { ok: false, value: "—" };
  };
  J.auditLine = function () {
    const part = function (label, src) { const l = J.list({ src: src }); if (!l.length) return label + ": none"; const s = J.stats(l); return label + ": n=" + l.length + ", expectancy " + U.fmtR(s.expectancy) + ", max DD " + s.maxDD.toFixed(1) + "R" + (s.adherence !== null ? ", adherence " + U.pct(s.adherence) : ""); };
    return [part("Backtests", ["bt", "bt-sim"]), part("Demo", ["demo"]), part("Live", ["live"])].join(" · ");
  };
  J.summaryForTutor = function () {
    const real = J.list({ real: true }), s = J.stats(real);
    const lines = ["Real-data trades: " + real.length + (real.length ? ", expectancy " + U.fmtR(s.expectancy) + ", win rate " + U.pct(s.winRate) + ", max DD " + s.maxDD.toFixed(1) + "R, adherence " + (s.adherence === null ? "n/a" : U.pct(s.adherence)) + ", grades A/B/C " + s.grades.A + "/" + s.grades.B + "/" + s.grades.C : "")];
    ["sess", "tf", "setup", "watched"].forEach(function (dim) { const seg = J.segments(real, dim).filter(function (r) { return r.n >= 3; }); if (seg.length) lines.push("By " + DIMS[dim] + ": " + seg.map(function (r) { return r.key + " n=" + r.n + " E=" + r.E.toFixed(2) + "R"; }).join("; ")); });
    const sim = J.list({ src: ["sim"] }); if (sim.length) { const ss = J.stats(sim); lines.push("Floor (synthetic) trades: " + sim.length + ", expectancy " + U.fmtR(ss.expectancy)); }
    const recent = real.slice(-8).map(function (t) { return (t.date || "") + " " + (t.pair || "") + " " + (t.dir || "") + " " + U.fmtR(t.R) + " rules " + (t.rules || "?") + " grade " + (t.grade || "?") + (t.note ? " — " + String(t.note).slice(0, 80) : ""); });
    if (recent.length) lines.push("Most recent: " + recent.join(" | "));
    return lines.join("\n");
  };
  const DIMS = { sess: "Session", pair: "Pair", setup: "Setup", tf: "Timeframe", wd: "Weekday", dir: "Direction", watched: "Watched?", grade: "Grade", set: "Test set", src: "Source", regime: "Regime (Floor)" };
  const keyOf = function (t, dim) {
    if (dim === "wd") { if (!t.date) return "—"; return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][U.parseISO(t.date).getDay()]; }
    if (dim === "watched") return t.watched === "U" ? "Unwatched" : t.watched === "W" ? "Watched" : "—";
    if (dim === "src") return SRC[t.src] || t.src;
    if (dim === "regime") return t.sim && t.sim.regime !== null && t.sim.regime !== undefined ? ENGINE.REGIMES[t.sim.regime] : "—";
    if (dim === "dir") return t.dir === "S" ? "Short" : "Long";
    const v = t[dim]; return v === undefined || v === null || v === "" ? "—" : String(v);
  };
  J.segments = function (list, dim) {
    const by = {}; list.forEach(function (t) { const k = keyOf(t, dim); (by[k] = by[k] || []).push(t); });
    return Object.keys(by).map(function (k) { const s = ENGINE.stats(by[k]); return { key: k, n: s.n, win: s.winRate, E: s.expectancy, tot: s.totalR, aw: s.avgWin, al: s.avgLoss }; }).sort(function (a, b) { return b.n - a.n; });
  };

  /* ---------- view ---------- */
  VIEWS.journal = {
    render: function (p) {
      if (p.id && ["log", "add", "segments", "style"].indexOf(p.id) >= 0) JV.tab = p.id;
      let h = "<div class='page'><header class='pagehead'><div class='eyebrow'>Logbook</div><h1>The Journal</h1><p class='lede'>Where, when, how, why — and what is making or losing you money. Every field exists because a later unit needs it.</p></header>";
      h += "<nav class='tabs wide'>" + [["log", "Log"], ["add", JV.edit ? "Edit trade" : "Log a trade"], ["segments", "Segments"], ["style", "Style diagnostic"]].map(function (t) { return "<a class='tab" + (JV.tab === t[0] ? " on" : "") + "' href='#/journal/" + t[0] + "'>" + t[1] + "</a>"; }).join("") + "</nav>";
      if (JV.tab === "add") h += formHTML();
      else if (JV.tab === "segments") h += segmentsHTML();
      else if (JV.tab === "style") h += styleHTML();
      else h += logHTML();
      return h + "</div>";
    }
  };
  function filtered() {
    const f = JV.filter;
    const src = f === "real" ? REAL : f === "bt" ? ["bt", "bt-sim"] : f === "demo" ? ["demo"] : f === "live" ? ["live"] : f === "sim" ? ["sim"] : null;
    return J.list({ src: src, set: JV.set || undefined });
  }
  function filterBar() {
    const sets = {}; J.all().forEach(function (t) { if (t.set) sets[t.set] = 1; });
    return "<div class='row wrap filters'>" + [["real", "All real data"], ["bt", "Backtests"], ["demo", "Demo"], ["live", "Live"], ["sim", "Floor · synthetic"], ["all", "Everything"]].map(function (f) { return "<button class='btn sm " + (JV.filter === f[0] ? "primary" : "ghost") + "' data-act='jFilter' data-f='" + f[0] + "'>" + f[1] + "</button>"; }).join("") +
      "<label class='fld inline'><span>Test set</span><select id='j-set' data-chg='jSet'><option value=''>All</option>" + Object.keys(sets).sort().map(function (s) { return "<option" + (JV.set === s ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") + "</select></label></div>";
  }
  function logHTML() {
    const list = filtered(), st = J.stats(list);
    let h = filterBar();
    h += "<section class='tiles'>" +
      "<div class='tile'><div class='label'>Trades</div><div class='val'>" + st.n + "</div><div class='sub'>win rate " + (st.n ? U.pct(st.winRate) : "—") + "</div></div>" +
      "<div class='tile'><div class='label'>Expectancy</div><div class='val " + (st.expectancy >= 0 ? "okt" : "badt") + "'>" + (st.n ? U.fmtR(st.expectancy) : "—") + "</div><div class='sub'>avg win " + (st.n ? st.avgWin.toFixed(2) : "—") + "R · avg loss " + (st.n ? st.avgLoss.toFixed(2) : "—") + "R</div></div>" +
      "<div class='tile'><div class='label'>Total · max drawdown</div><div class='val'>" + (st.n ? U.fmtR(st.totalR, 1) : "—") + "</div><div class='sub'>max drawdown " + (st.n ? st.maxDD.toFixed(1) + "R" : "—") + " · longest losing run " + st.longestLoss + "</div></div>" +
      "<div class='tile'><div class='label'>Adherence</div><div class='val'>" + (st.adherence === null ? "—" : U.pct(st.adherence)) + "</div><div class='sub'>grades A " + st.grades.A + " · B " + st.grades.B + " · C " + st.grades.C + "</div></div></section>";
    if (st.n) h += "<section class='panel two'>" + SVGC.line([{ values: st.curve, cls: "ser-acc", area: true, label: "Cumulative R" }], { w: 520, h: 200, fmt: function (v) { return v.toFixed(1) + "R"; }, unit: "R", label: "Cumulative R", x1: true, caption: "Cumulative R, trade by trade" }) + SVGC.hist(list.map(function (t) { return t.R; }), { w: 520, h: 200, caption: "Distribution of results in R" }) + "</section>";
    h += "<section class='panel'><div class='row wrap'><a class='btn primary' href='#/journal/add' data-act='jNew'>Log a trade</a><span class='muted small'>" + (st.n < 20 ? "Fewer than 20 trades: treat every number here as a rumour." : st.n < 100 ? "Under 100 trades: a win rate here is still about ±10 points either way." : "") + "</span></div>";
    if (!list.length) h += "<p class='muted'>No trades in this view yet.</p>";
    else {
      h += "<div class='tablewrap'><table class='tbl trades'><thead><tr><th>Date</th><th>Source</th><th>Pair</th><th>TF</th><th>Setup</th><th>Dir</th><th>R</th><th>Rules</th><th>Grade</th><th></th></tr></thead><tbody>";
      list.slice().reverse().slice(0, 200).forEach(function (t) {
        h += "<tr><td class='mono'>" + esc(t.date || "") + "</td><td class='small'>" + esc(SRC[t.src] || t.src) + (t.set ? " · " + esc(t.set) : "") + "</td><td>" + esc(t.pair || "") + "</td><td>" + esc(t.tf || "") + "</td><td class='small'>" + esc(t.setup || "") + "</td><td>" + esc(t.dir || "") + "</td>" +
          "<td class='num " + (t.R >= 0 ? "okt" : "badt") + "'>" + U.fmtR(t.R) + "</td><td>" + esc(t.rules || "·") + "</td><td>" + esc(t.grade || "·") + "</td><td class='acts'><button class='btn xs ghost' data-act='jEdit' data-id='" + esc(t.id) + "'>Edit</button><button class='btn xs ghost' data-act='jDel' data-id='" + esc(t.id) + "'>Delete</button></td></tr>";
      });
      h += "</tbody></table></div>";
    }
    return h + "</section>";
  }
  const blank = function () {
    const nx = P.next();
    return { id: null, src: P.passed("g4") ? "demo" : "bt", set: "", date: U.today(), tin: "", date2: "", tout: "", pair: "", tf: "4H", sess: "", setup: "", dir: "L", entry: "", stop: "", target: "", exit: "", risk: "", lots: "", R: "",
      rules: "", broke: "", grade: "", eb: "", ed: "", ea: "", watched: "", shot: "", note: "", week: P.currentUnit() };
  };
  function formHTML() {
    const t = JV.edit || (JV.draft = JV.draft || blank());
    const setups = {}; J.all().forEach(function (x) { if (x.setup) setups[x.setup] = 1; });
    const sel = function (id, label, k, opts) { return "<label class='fld'><span>" + esc(label) + "</span><select id='" + id + "' data-chg='jField' data-k='" + k + "'>" + opts.map(function (o) { return "<option value='" + esc(o[0]) + "'" + (String(t[k]) === String(o[0]) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></label>"; };
    const inp = function (id, label, k, type, extra) { return "<label class='fld'><span>" + esc(label) + "</span><input id='" + id + "' type='" + (type || "text") + "'" + (type === "number" ? " step='any'" : "") + " value='" + esc(t[k] === null || t[k] === undefined ? "" : t[k]) + "' data-chg='jField' data-k='" + k + "'" + (extra || "") + "></label>"; };
    const scale = function (label, k) { return "<div class='fld'><span>" + esc(label) + "</span><div class='seg small'>" + [1, 2, 3, 4, 5].map(function (v) { return "<button class='segb" + (Number(t[k]) === v ? " on" : "") + "' data-act='jScale' data-k='" + k + "' data-v='" + v + "'>" + v + "</button>"; }).join("") + "</div></div>"; };
    const Rauto = computeR(t);
    let h = "<section class='panel'><div class='sec-head'><span class='code'>" + (JV.edit ? "EDIT" : "NEW") + "</span><h2>" + (JV.edit ? "Edit trade" : "Log a trade") + "</h2></div>";
    if (t.src === "demo" && !P.passed("g4")) h += "<div class='banner locked'>Demo trading unlocks at Gate 4. You can log it, but it sits outside the programme until then.</div>";
    h += "<div class='formgrid'>";
    h += "<fieldset><legend>Where</legend>" + sel("tj-src", "Source", "src", [["bt", SRC.bt], ["bt-sim", SRC["bt-sim"]], ["demo", "Demo"], ["live", "Live"], ["sim", SRC.sim]]) + inp("tj-set", "Test set tag (e.g. v1-A)", "set") +
      inp("tj-pair", "Pair", "pair", "text", " placeholder='EUR/USD'") + sel("tj-tf", "Signal timeframe", "tf", [["D", "Daily"], ["4H", "4H"], ["1H", "1H"], ["15m", "15m"], ["5m", "5m"], ["other", "Other"]]) +
      "<label class='fld'><span>Setup name</span><input id='tj-setup' type='text' list='tj-setups' value='" + esc(t.setup) + "' data-chg='jField' data-k='setup'><datalist id='tj-setups'>" + Object.keys(setups).map(function (s) { return "<option value='" + esc(s) + "'>"; }).join("") + "</datalist></label></fieldset>";
    h += "<fieldset><legend>When</legend>" + inp("tj-date", "Entry date", "date", "date") + inp("tj-tin", "Entry time (SAST)", "tin", "time") + inp("tj-date2", "Exit date", "date2", "date") + inp("tj-tout", "Exit time (SAST)", "tout", "time") +
      sel("tj-sess", "Session (auto from entry time)", "sess", [["", "—"], ["Asia", "Asia"], ["London", "London"], ["Overlap", "London–NY overlap"], ["New York", "New York"], ["Off-hours", "Off-hours"]]) + "</fieldset>";
    h += "<fieldset><legend>How</legend><div class='seg'>" + ["L", "S"].map(function (d) { return "<button class='segb" + (t.dir === d ? " on" : "") + "' data-act='jDir' data-v='" + d + "'>" + (d === "L" ? "Long" : "Short") + "</button>"; }).join("") + "</div>" +
      inp("tj-entry", "Entry", "entry", "number") + inp("tj-stop", "Stop", "stop", "number") + inp("tj-target", "Target", "target", "number") + inp("tj-exit", "Exit", "exit", "number") +
      inp("tj-risk", "Risk %", "risk", "number") + inp("tj-lots", "Lots", "lots", "number") +
      "<label class='fld'><span>Outcome in R <b id='tj-Rhint' class='" + (Rauto === null ? "" : Rauto >= 0 ? "okt" : "badt") + "'>" + (Rauto !== null ? "auto: " + U.fmtR(Rauto) : "(enter entry, stop, exit — or type R)") + "</b></span><input id='tj-R' type='number' step='any' value='" + esc(t.R) + "' data-chg='jField' data-k='R' placeholder='" + (Rauto !== null ? Rauto.toFixed(2) : "") + "'></label></fieldset>";
    h += "<fieldset><legend>Why — and how you behaved</legend>" + sel("tj-rules", "Followed every rule?", "rules", [["", "—"], ["Y", "Yes"], ["N", "No"]]) + inp("tj-broke", "If no — which rule broke?", "broke") +
      sel("tj-grade", "Execution grade", "grade", [["", "—"], ["A", "A — clean"], ["B", "B — minor deviation"], ["C", "C — rule broken"]]) +
      scale("Emotion before (1 calm – 5 wired)", "eb") + scale("Emotion during", "ed") + scale("Emotion after", "ea") +
      sel("tj-w", "Watched the chart while in the trade?", "watched", [["", "—"], ["W", "Watched"], ["U", "Unwatched (alerts, platform closed)"]]) +
      inp("tj-shot", "Screenshot link", "shot", "url") + "<label class='fld full'><span>One line: what this trade taught me</span><textarea id='tj-note' rows='2' data-chg='jField' data-k='note'>" + esc(t.note) + "</textarea></label></fieldset>";
    h += "</div><div class='row wrap'><button class='btn primary' data-act='jSave'>" + (JV.edit ? "Save changes" : "Save trade") + "</button><button class='btn ghost' data-act='jCancel'>Cancel</button></div></section>";
    return h;
  }
  function segmentsHTML() {
    const list = filtered();
    let h = filterBar() + "<section class='panel'><div class='row wrap'>" + Object.keys(DIMS).map(function (d) { return "<button class='btn sm " + (JV.seg === d ? "primary" : "ghost") + "' data-act='jSeg' data-d='" + d + "'>" + esc(DIMS[d]) + "</button>"; }).join("") + "</div>";
    const seg = J.segments(list, JV.seg);
    if (!seg.length) return h + "<p class='muted'>No trades in this view yet.</p></section>";
    h += SVGC.bars(seg.slice(0, 12).map(function (r) { return { label: r.key.length > 10 ? r.key.slice(0, 9) + "…" : r.key, value: r.E, n: r.n, cls: r.n < 20 ? "bn" : (r.E >= 0 ? "bu" : "bd") }; }), { w: 560, h: 220, fmt: function (v) { return v.toFixed(2) + "R"; }, label: "Expectancy by " + DIMS[JV.seg], caption: "Expectancy by " + DIMS[JV.seg].toLowerCase() + ". Grey bars have fewer than 20 trades — hypotheses, not findings." });
    h += "<div class='tablewrap'><table class='tbl'><thead><tr><th>" + esc(DIMS[JV.seg]) + "</th><th>n</th><th>Win rate</th><th>Avg win</th><th>Avg loss</th><th>Expectancy</th><th>Total</th></tr></thead><tbody>" +
      seg.map(function (r) { return "<tr class='" + (r.n < 20 ? "thin" : "") + "'><td>" + esc(r.key) + "</td><td class='num'>" + r.n + "</td><td class='num'>" + U.pct(r.win) + "</td><td class='num'>" + r.aw.toFixed(2) + "R</td><td class='num'>" + r.al.toFixed(2) + "R</td><td class='num " + (r.E >= 0 ? "okt" : "badt") + "'>" + U.fmtR(r.E) + "</td><td class='num'>" + U.fmtR(r.tot, 1) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    return h + "<p class='small muted'>Watched vs Unwatched is the Unit 20 experiment. Regime only exists for Floor trades on synthetic markets.</p></section>";
  }
  function heldHours(t) {
    if (t.sim && t.heldUnit === "bars") return null;
    if (!t.date || !t.tin || !t.tout) return null;
    const a = new Date(t.date + "T" + t.tin), b = new Date((t.date2 || t.date) + "T" + t.tout);
    const hrs = (b - a) / 3600000; return isFinite(hrs) && hrs >= 0 ? hrs : null;
  }
  function styleHTML() {
    const list = J.list({ real: true });
    let h = "<section class='panel'><p class='lede'>Unit 23: four pictures from your own real-data trades. Write what each one says <em>before</em> you interpret it.</p>" + (list.length < 20 ? "<div class='banner locked'>Only " + list.length + " real-data trades so far. These pictures sharpen after about 50.</div>" : "") + "</section>";
    const buckets = [["< 1h", 0, 1], ["1–4h", 1, 4], ["4–24h", 4, 24], ["1–3 days", 24, 72], ["3–10 days", 72, 240], ["10+ days", 240, 1e9]];
    const hb = buckets.map(function (b) { const arr = list.filter(function (t) { const hh = heldHours(t); return hh !== null && hh >= b[1] && hh < b[2]; }); const s = ENGINE.stats(arr); return { label: b[0], value: s.expectancy, n: arr.length, cls: arr.length < 10 ? "bn" : undefined }; }).filter(function (b) { return b.n; });
    h += "<section class='panel'><div class='sec-head'><span class='code'>1</span><h2>Holding time vs result</h2></div>" + (hb.length ? SVGC.bars(hb, { w: 560, h: 200, fmt: function (v) { return v.toFixed(2) + "R"; }, label: "Expectancy by holding time" }) : "<p class='muted small'>Needs entry and exit dates and times.</p>") + "</section>";
    const sess = J.segments(list, "sess").filter(function (r) { return r.key !== "—"; });
    h += "<section class='panel'><div class='sec-head'><span class='code'>2</span><h2>Session vs result</h2></div>" + (sess.length ? SVGC.bars(sess.map(function (r) { return { label: r.key, value: r.E, n: r.n, cls: r.n < 10 ? "bn" : undefined }; }), { w: 560, h: 200, fmt: function (v) { return v.toFixed(2) + "R"; }, label: "Expectancy by session" }) : "<p class='muted small'>Needs entry times.</p>") + "</section>";
    const tfs = ["D", "4H", "1H", "15m", "5m"];
    const emo = tfs.map(function (tf) { const arr = list.filter(function (t) { return t.tf === tf && isFinite(t.ed) && t.ed > 0; }); return { label: tf, value: arr.length ? arr.reduce(function (a, t) { return a + t.ed; }, 0) / arr.length : 0, n: arr.length, cls: "bn" }; }).filter(function (b) { return b.n; });
    h += "<section class='panel'><div class='sec-head'><span class='code'>3</span><h2>Stress by timeframe</h2></div>" + (emo.length ? SVGC.bars(emo, { w: 560, h: 200, fmt: function (v) { return v.toFixed(1); }, label: "Average emotion-during score by timeframe", caption: "Average 'emotion during' score (1 calm – 5 wired). Higher = more stress." }) : "<p class='muted small'>Needs emotion scores.</p>") + "</section>";
    const grd = tfs.map(function (tf) { const arr = list.filter(function (t) { return t.tf === tf && t.grade; }); return { label: tf, value: arr.length ? 100 * arr.filter(function (t) { return t.grade === "A"; }).length / arr.length : 0, n: arr.length, cls: "bn" }; }).filter(function (b) { return b.n; });
    h += "<section class='panel'><div class='sec-head'><span class='code'>4</span><h2>Clean execution by timeframe</h2></div>" + (grd.length ? SVGC.bars(grd, { w: 560, h: 200, fmt: function (v) { return v.toFixed(0) + "%"; }, label: "Share of A-grade trades by timeframe", caption: "Share of trades graded A on each timeframe." }) : "<p class='muted small'>Needs execution grades.</p>") + "</section>";
    return h;
  }

  /* ---------- actions ---------- */
  ACT.jFilter = function (el) { JV.filter = el.dataset.f; render(false); };
  ACT.jSet = function (el) { JV.set = el.value; render(false); };
  ACT.jSeg = function (el) { JV.seg = el.dataset.d; render(false); };
  ACT.jNew = function () { JV.edit = null; JV.draft = blank(); go("journal", "add"); };
  ACT.jEdit = function (el) { JV.edit = U.clone(APP.trades[el.dataset.id]); go("journal", "add"); };
  ACT.jCancel = function () { JV.edit = null; JV.draft = null; go("journal", "log"); };
  ACT.jDel = function (el) { if (!window.confirmTwice("del-" + el.dataset.id)) return; STORE.deleteTrade(el.dataset.id); render(false); U.toast("Trade deleted."); };
  const cur = function () { return JV.edit || (JV.draft = JV.draft || blank()); };
  ACT.jField = function (el) {
    const t = cur(), k = el.dataset.k;
    t[k] = el.type === "number" ? (el.value === "" ? "" : parseFloat(el.value)) : el.value;
    if (k === "tin" || k === "date") { const s = sessionOf(t.date, t.tin); if (s) { t.sess = s; const se = U.$("#tj-sess"); if (se) se.value = s; } }
    if (["entry", "stop", "exit"].indexOf(k) >= 0) {
      const r = computeR(t), hint = U.$("#tj-Rhint"), inp = U.$("#tj-R");
      if (hint) { hint.textContent = r !== null ? "auto: " + U.fmtR(r) : "(enter entry, stop, exit — or type R)"; hint.className = r === null ? "" : (r >= 0 ? "okt" : "badt"); }
      if (inp) inp.placeholder = r !== null ? r.toFixed(2) : "";
    }
    if (k === "src") render(false);
  };
  ACT.jDir = function (el) { cur().dir = el.dataset.v; render(false); };
  ACT.jScale = function (el) { const t = cur(); t[el.dataset.k] = Number(el.dataset.v); render(false); };
  ACT.jSave = function () {
    U.$$("[data-chg='jField']").forEach(function (el) { const k = el.dataset.k, t = cur(); t[k] = el.type === "number" ? (el.value === "" ? "" : parseFloat(el.value)) : el.value; });
    const t = cur();
    let R = t.R === "" || t.R === undefined ? computeR(t) : parseFloat(t.R);
    if (R === null || !isFinite(R)) { U.toast("Enter entry, stop and exit — or type the outcome in R.", "bad"); return; }
    if (!t.pair) { U.toast("Which pair?", "bad"); return; }
    const doc = U.clone(t);
    doc.R = +R.toFixed(3);
    ["entry", "stop", "target", "exit", "risk", "lots"].forEach(function (k) { doc[k] = doc[k] === "" ? null : Number(doc[k]); });
    ["eb", "ed", "ea"].forEach(function (k) { doc[k] = doc[k] === "" ? null : Number(doc[k]); });
    if (!doc.sess) doc.sess = sessionOf(doc.date, doc.tin);
    doc.id = doc.id || U.uid("t");
    doc.createdAt = doc.createdAt || Date.now();
    STORE.saveTrade(doc);
    JV.edit = null; JV.draft = null;
    U.toast("Trade saved: " + U.fmtR(doc.R));
    go("journal", "log");
  };
})();
