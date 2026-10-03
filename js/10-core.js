/* ============================================================
   CORE — utilities, store (localStorage + db sync), progress
   logic, router and the action registry.
   ============================================================ */
(function () {
  "use strict";

  const APP = window.APP = {
    state: null, trades: {}, writing: {}, threads: {},
    view: { name: "today", params: {} },
    cap: { db: null, sample: null, user: null, uid: null, downloads: null, tools: false, sampleBlocked: false, dbMode: "local", dbError: "" },
    ui: {}
  };

  /* ---------------- utilities ---------------- */
  const pad = function (n) { return (n < 10 ? "0" : "") + n; };
  const WDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const U = window.U = {
    $: function (s, r) { return (r || document).querySelector(s); },
    $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
    esc: function (s) {
      return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    inline: function (s) {
      return U.esc(s)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    },
    body: function (arr) {
      let html = "", list = null;
      const flush = function () { if (list) { html += "<ul class='blist'>" + list.map(function (x) { return "<li>" + U.inline(x) + "</li>"; }).join("") + "</ul>"; list = null; } };
      (arr || []).forEach(function (line) {
        if (line.indexOf("• ") === 0) { (list = list || []).push(line.slice(2)); return; }
        flush();
        if (line.indexOf("= ") === 0) html += "<div class='formula'>" + U.inline(line.slice(2)) + "</div>";
        else if (line.indexOf("> ") === 0) html += "<p class='callout'>" + U.inline(line.slice(2)) + "</p>";
        else html += "<p>" + U.inline(line) + "</p>";
      });
      flush();
      return html;
    },
    md: function (src) {
      const lines = String(src || "").replace(/\r/g, "").split("\n");
      let out = "", i = 0;
      const special = /^(```|\s*[-*•]\s+|\s*\d+[.)]\s+|#{1,6}\s|\s*\|.*\|\s*$)/;
      while (i < lines.length) {
        const ln = lines[i];
        if (/^```/.test(ln)) {
          const code = []; i++;
          while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
          i++;
          out += "<pre class='code'>" + U.esc(code.join("\n")) + "</pre>";
          continue;
        }
        if (/^\s*\|.*\|\s*$/.test(ln)) {
          const rows = [];
          while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
          const cells = rows.filter(function (r) { return !/^\s*\|[\s:|-]+\|\s*$/.test(r); }).map(function (r) { return r.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); }); });
          if (cells.length) {
            out += "<div class='tablewrap'><table class='tbl'><thead><tr>" + cells[0].map(function (c) { return "<th>" + U.inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
              cells.slice(1).map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + U.inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
          }
          continue;
        }
        if (/^#{1,6}\s/.test(ln)) { out += "<h5 class='md-h'>" + U.inline(ln.replace(/^#+\s*/, "")) + "</h5>"; i++; continue; }
        if (/^\s*[-*•]\s+/.test(ln)) {
          const items = [];
          while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, "")); i++; }
          out += "<ul>" + items.map(function (x) { return "<li>" + U.inline(x) + "</li>"; }).join("") + "</ul>";
          continue;
        }
        if (/^\s*\d+[.)]\s+/.test(ln)) {
          const items = [];
          while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, "")); i++; }
          out += "<ol>" + items.map(function (x) { return "<li>" + U.inline(x) + "</li>"; }).join("") + "</ol>";
          continue;
        }
        if (!ln.trim()) { i++; continue; }
        const para = [ln]; i++;
        while (i < lines.length && lines[i].trim() && !special.test(lines[i])) { para.push(lines[i]); i++; }
        out += "<p>" + U.inline(para.join(" ")) + "</p>";
      }
      return out;
    },
    fmtR: function (x, d) {
      if (x === null || x === undefined || !isFinite(x)) return "—";
      d = d === undefined ? 2 : d;
      return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d) + "R";
    },
    pct: function (x, d) { if (x === null || x === undefined || !isFinite(x)) return "—"; return (x * 100).toFixed(d || 0) + "%"; },
    num: function (x, d) { if (x === null || x === undefined || !isFinite(x)) return "—"; return Number(x).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); },
    money: function (x) { if (!isFinite(x)) return "—"; return (x < 0 ? "−$" : "$") + Math.abs(x).toLocaleString("en-US", { maximumFractionDigits: 0 }); },
    px: function (x, pip) { if (!isFinite(x)) return "—"; return x.toFixed(pip === 0.01 ? 3 : 5); },
    today: function () { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); },
    parseISO: function (iso) { const p = String(iso).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); },
    iso: function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); },
    addDays: function (iso, n) { const d = U.parseISO(iso); d.setDate(d.getDate() + n); return U.iso(d); },
    daysBetween: function (a, b) { return Math.round((U.parseISO(b) - U.parseISO(a)) / 86400000); },
    nextMonday: function (iso) { const d = U.parseISO(iso); const k = (8 - d.getDay()) % 7 || 7; d.setDate(d.getDate() + k); return U.iso(d); },
    longDate: function (iso) { if (!iso) return "—"; const d = U.parseISO(iso); return WDAY[d.getDay()] + " " + d.getDate() + " " + MONTH[d.getMonth()]; },
    shortDate: function (iso) { if (!iso) return "—"; const d = U.parseISO(iso); return d.getDate() + " " + MONTH[d.getMonth()].slice(0, 3); },
    niceDate: function (iso) { if (!iso) return "—"; const d = U.parseISO(iso); return WDAY[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MONTH[d.getMonth()].slice(0, 3); },
    uid: function (p) { return (p || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    clone: function (o) { return JSON.parse(JSON.stringify(o)); },
    debounce: function (fn, ms) { let t = null; return function () { const a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); }; },
    toast: function (msg, kind) {
      const box = U.$("#toasts"); if (!box) return;
      const el = document.createElement("div");
      el.className = "toast " + (kind || "");
      el.setAttribute("role", "status");
      el.textContent = msg;
      box.appendChild(el);
      setTimeout(function () { el.classList.add("out"); }, 3200);
      setTimeout(function () { el.remove(); }, 3800);
    },
    shuffle: function (a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; },
    srcTags: function (arr) {
      return (arr || []).map(function (k) { return "<span class='src'>" + U.esc(COURSE.SOURCES[k] || k) + "</span>"; }).join("");
    }
  };

  /* ---------------- store ---------------- */
  const LS = { state: "rebuild.v3.state", trades: "rebuild.v3.trades", writing: "rebuild.v3.writing", threads: "rebuild.v3.threads", legacy: "rebuild.progress.v1" };
  const DEFAULT_CHECKLIST = [
    "Pair is on my market list and inside my correlation cap",
    "Entry condition is present exactly as written",
    "Stop is where the idea is proven wrong",
    "Size by formula, rounded down, 1% or less at the stop",
    "No tier-one release in the next hour",
    "Inside today's and this week's loss limits",
    "Emotion score is 3 or lower"
  ];
  function freshState() {
    return {
      v: 4, plan: COURSE.PLAN.id, created: Date.now(), updatedAt: 0, startDate: COURSE.PLAN.start, name: "Sfundo",
      settings: { tutorMode: "explain", unitRisk: 0.005, checklist: DEFAULT_CHECKLIST.slice() },
      admission: { done: false, answers: {}, at: null, score: null },
      lessons: {}, practicals: {}, reviews: {}, exams: {}, activity: {}, tasks: {}, legacy: null,
      sim: { sessions: 0, bars: 0 }
    };
  }
  function normalise(s) {
    const f = freshState();
    const out = Object.assign(f, s || {});
    out.settings = Object.assign(freshState().settings, (s && s.settings) || {});
    if (!Array.isArray(out.settings.checklist) || !out.settings.checklist.length) out.settings.checklist = DEFAULT_CHECKLIST.slice();
    out.admission = Object.assign(freshState().admission, (s && s.admission) || {});
    ["lessons", "practicals", "reviews", "exams", "activity", "tasks"].forEach(function (k) { if (!out[k] || typeof out[k] !== "object") out[k] = {}; });
    if (!s || s.plan !== COURSE.PLAN.id) { out.plan = COURSE.PLAN.id; out.startDate = COURSE.PLAN.start; out.v = 4; }
    out.sim = Object.assign({ sessions: 0, bars: 0 }, out.sim || {});
    return out;
  }
  const readLS = function (k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const writeLS = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };

  const STORE = window.STORE = {
    DEFAULT_CHECKLIST: DEFAULT_CHECKLIST,
    load: function () {
      APP.state = normalise(readLS(LS.state, null));
      APP.trades = readLS(LS.trades, {}) || {};
      APP.writing = readLS(LS.writing, {}) || {};
      APP.threads = readLS(LS.threads, {}) || {};
      if (!APP.state.legacy) {
        const old = readLS(LS.legacy, null);
        if (old && typeof old === "object" && Object.keys(old).length) { APP.state.legacy = old; STORE.importLegacy(old); STORE.saveLocal(); }
      }
    },
    importLegacy: function (old) {
      Object.keys(old).forEach(function (k) {
        if (!old[k]) return;
        const m = /^(\d+)-(\d)$/.exec(k); if (!m) return;
        const w = +m[1], d = +m[2];
        const wk = COURSE.weeks[w - 1]; if (!wk) return;
        if (d <= 2) { const id = wk.L[d].id; APP.state.lessons[id] = Object.assign(APP.state.lessons[id] || {}, { done: Date.now(), legacy: true }); }
        else if (d <= 5) { const p = APP.state.practicals[w] = APP.state.practicals[w] || { sessions: [], notes: [], num: {} }; p.sessions[d - 3] = Date.now(); }
        else { APP.state.reviews[w] = Object.assign(APP.state.reviews[w] || {}, { done: Date.now(), legacy: true }); }
      });
    },
    saveLocal: function () { writeLS(LS.state, APP.state); },
    saveMap: function (name) { writeLS(LS[name], APP[name]); },
    commit: function (activity) {
      APP.state.updatedAt = Date.now();
      if (activity) { const t = U.today(); APP.state.activity[t] = (APP.state.activity[t] || 0) + 1; }
      STORE.saveLocal();
      STORE.schedulePush();
    },
    base: function () { return APP.cap.uid ? "data/users/" + APP.cap.uid : null; },
    pushing: false, pushAgain: false,
    schedulePush: U.debounce(function () { STORE.pushNow(); }, 1200),
    pushNow: async function () {
      const db = APP.cap.db, base = STORE.base();
      if (!db || !base || APP.cap.dbMode === "local") return;
      if (STORE.pushing) { STORE.pushAgain = true; return; }
      STORE.pushing = true;
      try { await db.doc(base + "/progress").set({ updatedAt: APP.state.updatedAt, state: U.clone(APP.state) }); }
      catch (e) { STORE.dbFail(e); }
      STORE.pushing = false;
      if (STORE.pushAgain) { STORE.pushAgain = false; STORE.pushNow(); }
    },
    dbFail: function (e) {
      console.warn("db", e);
      const code = e && e.code;
      if (code === "invalid_argument" || code === "not_granted" || code === "revoked" || code === "capability_disabled") {
        APP.cap.dbMode = "local"; APP.cap.dbError = code;
        if (window.renderChrome) window.renderChrome();
      } else if (code === "quota_exceeded") {
        U.toast("Cloud storage is full — new items are saved in this browser only.", "bad");
      }
    },
    docRef: function (coll, id) { return APP.cap.db.doc(STORE.base() + "/journal/" + coll + "/" + id); },
    saveDoc: function (mapName, coll, obj) {
      obj.updatedAt = Date.now();
      APP[mapName][obj.id] = obj;
      STORE.saveMap(mapName);
      if (APP.cap.db && STORE.base() && APP.cap.dbMode !== "local") STORE.docRef(coll, obj.id).set(U.clone(obj)).catch(STORE.dbFail);
    },
    deleteDoc: function (mapName, coll, id) {
      delete APP[mapName][id];
      STORE.saveMap(mapName);
      if (APP.cap.db && STORE.base() && APP.cap.dbMode !== "local") STORE.docRef(coll, id).delete().catch(STORE.dbFail);
    },
    saveTrade: function (t) { STORE.saveDoc("trades", "trades", t); const d = U.today(); APP.state.activity[d] = (APP.state.activity[d] || 0) + 1; STORE.commit(false); },
    deleteTrade: function (id) { STORE.deleteDoc("trades", "trades", id); },
    saveWriting: function (w) { STORE.saveDoc("writing", "writing", w); },
    saveThread: function (th) {
      STORE.saveDoc("threads", "tutor", th);
      const ids = Object.keys(APP.threads).sort(function (a, b) { return (APP.threads[a].updatedAt || 0) - (APP.threads[b].updatedAt || 0); });
      while (ids.length > 60) { STORE.deleteDoc("threads", "tutor", ids.shift()); }
    },
    initDb: async function () {
      const db = APP.cap.db, base = STORE.base();
      if (!db || !base) return;
      APP.cap.dbMode = "connecting";
      const ref = db.doc(base + "/progress");
      try {
        const snap = await ref.get();
        if (snap.exists) {
          const d = snap.data() || {};
          if ((d.updatedAt || 0) > (APP.state.updatedAt || 0) && d.state) {
            APP.state = normalise(U.clone(d.state)); STORE.saveLocal(); window.softRender && window.softRender();
          } else if ((APP.state.updatedAt || 0) > (d.updatedAt || 0)) { APP.cap.dbMode = "synced"; await STORE.pushNow(); }
        } else { APP.cap.dbMode = "synced"; if (APP.state.updatedAt) await STORE.pushNow(); }
        APP.cap.dbMode = "synced";
      } catch (e) { STORE.dbFail(e); if (APP.cap.dbMode !== "local") APP.cap.dbMode = "local"; window.renderChrome && window.renderChrome(); return; }
      ref.onSnapshot(function (s) {
        if (!s.exists || s.metadata.hasPendingWrites) return;
        const d = s.data() || {};
        if ((d.updatedAt || 0) > (APP.state.updatedAt || 0) && d.state) { APP.state = normalise(U.clone(d.state)); STORE.saveLocal(); window.softRender && window.softRender(); }
      }, function (e) { console.warn("progress listener", e); });
      STORE.syncCollection("trades", "trades");
      STORE.syncCollection("writing", "writing");
      STORE.syncCollection("threads", "tutor");
      window.renderChrome && window.renderChrome();
    },
    syncCollection: async function (mapName, coll) {
      const col = APP.cap.db.collection(STORE.base() + "/journal/" + coll);
      try {
        const snap = await col.get();
        const remote = {};
        snap.docs.forEach(function (d) { remote[d.id] = d.data(); });
        let changed = false;
        Object.keys(remote).forEach(function (id) {
          const r = remote[id], l = APP[mapName][id];
          if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)) { APP[mapName][id] = U.clone(r); changed = true; }
        });
        const localOnly = Object.keys(APP[mapName]).filter(function (id) { return !remote[id] || (APP[mapName][id].updatedAt || 0) > (remote[id].updatedAt || 0); });
        for (let k = 0; k < localOnly.length; k++) {
          try { await col.doc(localOnly[k]).set(U.clone(APP[mapName][localOnly[k]])); } catch (e) { STORE.dbFail(e); break; }
        }
        if (changed) { STORE.saveMap(mapName); window.softRender && window.softRender(); }
      } catch (e) { STORE.dbFail(e); return; }
      col.onSnapshot(function (snap) {
        let changed = false;
        snap.docChanges().forEach(function (ch) {
          const id = ch.doc.id;
          if (ch.type === "removed") { if (APP[mapName][id] && !ch.doc.metadata.hasPendingWrites) { delete APP[mapName][id]; changed = true; } return; }
          const r = ch.doc.data(), l = APP[mapName][id];
          if (!l || (r.updatedAt || 0) > (l.updatedAt || 0)) { APP[mapName][id] = U.clone(r); changed = true; }
        });
        if (changed) { STORE.saveMap(mapName); window.softRender && window.softRender(); }
      }, function (e) { console.warn(coll + " listener", e); });
    }
  };

  /* ---------------- progress logic ----------------
     The canonical sequence comes from COURSE.PLAN: day by day, hour 1
     then hour 2. "Next" is always the first unfinished item. */
  const GATE_FOR_MODULE = { "201": "g1", "202": "g2", "301": "g3", "302": "g4", "401": "g4", "402": "g5" };
  const P = window.P = {
    _items: null, _byDay: null,
    items: function () {
      if (P._items) return P._items;
      const out = [], byDay = {};
      COURSE.PLAN.days.forEach(function (d) {
        [d.h1, d.h2].forEach(function (h, hi) {
          if (!h) return;
          const it = Object.assign({}, h, { d: d.i, cw: d.cw, date: d.date, hour: hi + 1 });
          if (it.type === "lesson") { const l = P.lesson(it.id); it.mod = l.mod; it.week = l.week || 0; it.day = l.k === undefined ? -1 : l.k; }
          else if (it.type === "practical") { it.mod = P.week(it.week).mod; it.day = it.session; }
          else if (it.type === "task") { const t = COURSE.TASKS[it.id]; it.mod = t.mod; it.week = t.unit || 0; }
          else if (it.type === "exam") { const e = COURSE.exams[it.id]; it.mod = e.mod; it.week = e.week; }
          else { it.mod = "100"; it.week = 0; }
          it.idx = out.length;
          out.push(it);
          (byDay[d.i] = byDay[d.i] || []).push(it);
        });
      });
      P._items = out; P._byDay = byDay;
      return out;
    },
    dayItems: function (i) { P.items(); return P._byDay[i] || []; },
    lesson: function (id) { return COURSE.lessons[id] || COURSE.ORIENTATION.filter(function (o) { return o.id === id; })[0] || null; },
    week: function (n) { return COURSE.weeks[n - 1] || null; },
    module: function (key) { return COURSE.MODULES.filter(function (m) { return m.key === key; })[0] || null; },
    passed: function (id) { const e = APP.state.exams[id]; return !!(e && (e.passedAt || e.override)); },
    orientationDone: function () {
      return COURSE.ORIENTATION.every(function (o) { return APP.state.lessons[o.id] && APP.state.lessons[o.id].done; }) && APP.state.admission.done;
    },
    moduleUnlocked: function (key) {
      if (key === "100") return true;
      if (key === "101" || key === "102") return P.orientationDone();
      const g = GATE_FOR_MODULE[key];
      return P.orientationDone() && (!g || P.passed(g));
    },
    gateFor: function (key) { return GATE_FOR_MODULE[key] || null; },
    moduleLessons: function (key) {
      if (key === "100") return COURSE.ORIENTATION.map(function (o) { return o.id; });
      const ids = [];
      COURSE.weeks.forEach(function (w) { if (w.mod === key) w.L.forEach(function (l) { ids.push(l.id); }); });
      return ids;
    },
    examAvailable: function (id) {
      const ex = COURSE.exams[id]; if (!ex) return false;
      if (!P.moduleUnlocked(ex.mod)) return false;
      return P.moduleLessons(ex.mod).every(function (lid) { return APP.state.lessons[lid] && APP.state.lessons[lid].done; });
    },
    isDone: function (it) {
      const s = APP.state;
      if (it.type === "lesson") return !!(s.lessons[it.id] && s.lessons[it.id].done);
      if (it.type === "admission") return !!s.admission.done;
      if (it.type === "practical") { const p = s.practicals[it.week]; return !!(p && p.sessions && p.sessions[it.session]); }
      if (it.type === "task") return !!(s.tasks[it.id] && s.tasks[it.id].done);
      if (it.type === "review") { const r = s.reviews["c" + it.cw]; return !!(r && r.done); }
      if (it.type === "exam") return P.passed(it.id);
      return false;
    },
    isLocked: function (it) { return !P.moduleUnlocked(it.mod); },
    next: function () { const it = P.items(); for (let k = 0; k < it.length; k++) if (!P.isDone(it[k])) return it[k]; return null; },
    counts: function () { const it = P.items(); let d = 0; it.forEach(function (x) { if (P.isDone(x)) d++; }); return { done: d, total: it.length }; },
    dayStatus: function (day) {
      if (day.kind === "rest" || day.kind === "spare") return day.kind;
      const its = P.dayItems(day.i); if (!its.length) return "open";
      const n = its.filter(P.isDone).length;
      if (n === its.length) return "done";
      if (n > 0) return "part";
      return its.every(P.isLocked) ? "locked" : "open";
    },
    currentUnit: function () {
      const it = P.items(), nx = P.next();
      for (let j = nx ? nx.idx : it.length - 1; j >= 0; j--) if (it[j].week) return it[j].week;
      return 0;
    },
    rank: function () {
      if (!P.orientationDone()) return COURSE.RANKS[0];
      if (!P.passed("g4")) return COURSE.RANKS[1];
      if (!P.passed("g5")) return COURSE.RANKS[2];
      if (!P.passed("final")) return COURSE.RANKS[3];
      return COURSE.RANKS[4];
    },
    /* ---- calendar & pace ---- */
    todayIndex: function () {
      const days = COURSE.PLAN.days, t = U.today();
      if (t < days[0].date) return -1;
      if (COURSE.PLAN.byDate[t]) return COURSE.PLAN.byDate[t].i;
      for (let k = days.length - 1; k >= 0; k--) if (days[k].date <= t) return k;
      return -1;
    },
    working: function (a, b) {
      const days = COURSE.PLAN.days; let n = 0;
      for (let k = Math.max(0, a); k < Math.min(b, days.length); k++) if (days[k].kind === "study" || days[k].kind === "sunday") n++;
      return n;
    },
    pace: function () {
      const days = COURSE.PLAN.days, ti = P.todayIndex(), nx = P.next();
      if (ti < 0) return { started: false, toStart: U.daysBetween(U.today(), days[0].date) };
      if (!nx) return { started: true, finished: true, ti: ti };
      const ni = nx.d;
      const r = { started: true, ti: ti, ni: ni, behind: 0, ahead: 0, doneToday: false, today: days[ti], afterEnd: U.today() > COURSE.PLAN.end };
      if (ni < ti) r.behind = P.working(ni, ti);
      else if (ni > ti) { r.doneToday = true; r.ahead = P.working(ti + 1, ni); }
      if (r.behind) r.finish = U.addDays(COURSE.PLAN.finalDay, r.behind);
      return r;
    },
    streak: function () {
      let n = 0, d = U.today();
      if (!APP.state.activity[d]) d = U.addDays(d, -1);
      while (APP.state.activity[d]) { n++; d = U.addDays(d, -1); }
      return n;
    },
    simAccount: function () { const r = P.rank().key; return r === "funded" || r === "graduate" ? 1000000 : r === "probationer" ? 100000 : 10000; },
    planDay: function (i) { return COURSE.PLAN.days[i] || null; },
    lessonDayOf: function (id) { const i = COURSE.PLAN.lessonDay[id]; return i === undefined ? null : COURSE.PLAN.days[i]; },
    unitDayOf: function (n, k) { const a = COURSE.PLAN.unitDays[n]; return a && a[k] !== undefined ? COURSE.PLAN.days[a[k]] : null; },
    examDayOf: function (id) { const i = COURSE.PLAN.examDay[id]; return i === undefined ? null : COURSE.PLAN.days[i]; },
    reviewDayOf: function (cw) { const i = COURSE.PLAN.reviewDay[cw]; return i === undefined ? null : COURSE.PLAN.days[i]; },
    unitReviewWeek: function (n) { const a = COURSE.PLAN.unitDays[n]; return a ? COURSE.PLAN.days[a[2]].cw : null; },
    weekName: function (cw) { return cw === 0 ? "Orientation week" : cw >= 17 ? "Buffer days" : "Week " + cw; },
    dayEyebrow: function (day) { return P.weekName(day.cw) + " · " + U.longDate(day.date); },
    dayTitle: function (day) {
      if (day.kind === "rest") return "Rest day · " + day.label;
      if (day.kind === "spare") return "Buffer day";
      if (day.kind === "sunday") { const ex = day.h2 && COURSE.exams[day.h2.id]; return P.weekName(day.cw) + " review" + (ex ? " + " + ex.title.split(" — ")[0] : ""); }
      if (day.h1 && day.h1.type === "lesson") { const l = P.lesson(day.h1.id); return l ? l.t : day.h1.id; }
      if (day.h1 && day.h1.type === "admission") return "Admission";
      if (day.h1 && day.h1.type === "task") return COURSE.TASKS[day.h1.id].group;
      return "";
    },
    dayShort: function (day) {
      if (day.kind === "rest") return "Rest · " + day.label;
      if (day.kind === "spare") return "Buffer";
      if (day.kind === "sunday") { const ex = day.h2 && COURSE.exams[day.h2.id]; return ex ? "Review + " + ex.title.split(" — ")[0] : "Review"; }
      if (day.unit) return "U" + day.unit + " · " + P.lesson(day.h1.id).t;
      if (day.h1 && day.h1.type === "lesson") return P.lesson(day.h1.id).t;
      if (day.h1 && day.h1.type === "admission") return "Admission";
      if (day.h1 && day.h1.type === "task") return COURSE.TASKS[day.h1.id].group;
      return "";
    },
    itemLabel: function (it) {
      if (it.type === "lesson") { const l = P.lesson(it.id); return l ? l.t : it.id; }
      if (it.type === "admission") return "Admission questionnaire";
      if (it.type === "practical") { const w = P.week(it.week); return "Apply: " + (w ? w.t : "Unit " + it.week) + " (day " + (it.session + 1) + " of 3)"; }
      if (it.type === "task") { const t = COURSE.TASKS[it.id]; return t ? t.t : it.id; }
      if (it.type === "review") return P.weekName(it.cw) + " review";
      if (it.type === "exam") return COURSE.exams[it.id] ? COURSE.exams[it.id].title : it.id;
      return "";
    },
    itemHref: function (it) {
      if (it.type === "lesson") return "#/lesson/" + it.id;
      if (it.type === "admission") return "#/admission";
      if (it.type === "practical") return "#/practical/" + it.week + "/" + (it.session + 1);
      if (it.type === "task") return "#/day/" + it.d;
      if (it.type === "review") return "#/review/" + it.cw;
      if (it.type === "exam") return "#/exam/" + it.id;
      return "#/today";
    },
    DAYS: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  };

  /* ---------------- router & rendering ---------------- */
  const VIEWS = window.VIEWS = {};
  function parseHash() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    const parts = h.split("/");
    return { name: parts[0] || "today", params: { id: parts[1] ? decodeURIComponent(parts[1]) : undefined, sub: parts[2] ? decodeURIComponent(parts[2]) : undefined } };
  }
  window.go = function (name, id, sub) {
    const h = "#/" + name + (id !== undefined && id !== null ? "/" + encodeURIComponent(id) : "") + (sub !== undefined && sub !== null ? "/" + encodeURIComponent(sub) : "");
    if (location.hash === h) { APP.view = parseHash(); window.render(true); }
    else location.hash = h;
  };
  window.render = function (toTop) {
    const v = VIEWS[APP.view.name] || VIEWS.today;
    const main = U.$("#main");
    if (!main) return;
    if (APP.ui.lastView && APP.ui.lastView !== APP.view.name && VIEWS[APP.ui.lastView] && VIEWS[APP.ui.lastView].leave) {
      try { VIEWS[APP.ui.lastView].leave(); } catch (e) { console.error(e); }
    }
    APP.ui.lastView = APP.view.name;
    let html = "";
    try { html = v.render(APP.view.params || {}); }
    catch (e) { console.error(e); html = "<div class='panel bad'><h2>This page hit an error</h2><p>" + U.esc(e.message) + "</p><p><a href='#/today'>Back to Today</a></p></div>"; }
    main.innerHTML = html;
    APP.ui.pendingSoft = false;
    window.renderChrome();
    if (toTop) { try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
    try { if (v.after) v.after(APP.view.params || {}); } catch (e) { console.error(e); }
  };
  window.softRender = function () {
    const a = document.activeElement;
    if (a && (a.tagName === "TEXTAREA" || (a.tagName === "INPUT" && a.type !== "checkbox" && a.type !== "radio")) && U.$("#main").contains(a)) { APP.ui.pendingSoft = true; window.renderChrome(); return; }
    const v = VIEWS[APP.view.name];
    if (v && v.noSoft) { window.renderChrome(); return; }
    const y = window.scrollY;
    window.render(false);
    try { window.scrollTo(0, y); } catch (e) { /* ignore */ }
  };
  document.addEventListener("focusout", function () { if (APP.ui.pendingSoft) setTimeout(function () { if (APP.ui.pendingSoft) window.softRender(); }, 400); });
  window.addEventListener("hashchange", function () { APP.view = parseHash(); window.render(true); });
  APP.parseHash = parseHash;

  /* ---------------- actions ---------------- */
  const ACT = window.ACT = {};
  const run = function (f, el, e) { try { const r = f(el, e); if (r && r.catch) r.catch(function (err) { console.error(err); U.toast("That didn't work: " + (err && err.message || err), "bad"); }); } catch (err) { console.error(err); U.toast("That didn't work: " + err.message, "bad"); } };
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
    const f = ACT[el.dataset.act]; if (!f) return;
    e.preventDefault();
    run(f, el, e);
  });
  document.addEventListener("change", function (e) { const el = e.target.closest("[data-chg]"); if (el && ACT[el.dataset.chg]) run(ACT[el.dataset.chg], el, e); });
  document.addEventListener("input", function (e) { const el = e.target.closest("[data-inp]"); if (el && ACT[el.dataset.inp]) run(ACT[el.dataset.inp], el, e); });
  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    const v = VIEWS[APP.view.name];
    if (v && v.key) run(function () { v.key(e); }, null, e);
  });
})();
