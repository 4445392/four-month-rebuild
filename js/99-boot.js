/* ============================================================
   BOOT — chrome, capabilities, first render.
   ============================================================ */
(function () {
  "use strict";
  const esc = U.esc;
  const NAV = [["today", "Today", "The next thing to do"], ["plan", "Plan", "Every day, 1 Dec → 28 Mar"], ["course", "Course", "Nine modules, 26 units"], ["floor", "Trading Floor", "Bar-replay simulator"], ["labs", "Labs", "Calculators & simulations"], ["journal", "Journal", "Every trade, sliced"], ["tutor", "Tutor", "Office hours"], ["record", "Record", "Transcript & settings"]];
  const TABS = [["today", "Today"], ["plan", "Plan"], ["course", "Course"], ["floor", "Floor"], ["labs", "Labs"], ["journal", "Journal"], ["record", "Record"]];
  const navKey = function () {
    const v = APP.view.name;
    if (v === "day") return "plan";
    if (v === "lesson" || v === "practical" || v === "review" || v === "exam" || v === "admission") return "course";
    return v;
  };
  window.renderChrome = function () {
    const cur = navKey(), rank = P.rank(), cnt = P.counts();
    const nav = U.$("#rail-nav");
    if (nav) nav.innerHTML = NAV.map(function (n) { return "<a class='navi" + (cur === n[0] ? " on" : "") + "' href='#/" + n[0] + "'" + (cur === n[0] ? " aria-current='page'" : "") + "><b>" + esc(n[1]) + "</b><span>" + esc(n[2]) + "</span></a>"; }).join("");
    const tb = U.$("#tabbar");
    if (tb) tb.innerHTML = TABS.map(function (n) { return "<a class='tabi" + (cur === n[0] ? " on" : "") + "' href='#/" + n[0] + "'>" + esc(n[1]) + "</a>"; }).join("");
    const st = U.$("#rail-standing");
    if (st) st.innerHTML = "<div class='lbl'>Standing</div><div class='rnk'>" + esc(rank.name) + "</div><div class='meter dark'><span style='width:" + (100 * cnt.done / cnt.total).toFixed(1) + "%'></span></div><div class='lbl'>" + cnt.done + " / " + cnt.total + " hours · streak " + P.streak() + "</div>" +
      "<div class='lbl store'>" + (APP.cap.dbMode === "synced" ? "Saved to your private cloud" : APP.cap.dbMode === "connecting" ? "Connecting…" : "Saved in this browser") + "</div>";
    const top = U.$("#topstanding");
    if (top) top.textContent = rank.name + " · " + cnt.done + "/" + cnt.total;
    const fab = U.$("#fab");
    if (fab) fab.hidden = !TUTOR.available() || !U.$("#drawer").hidden;
  };

  async function boot() {
    STORE.load();
    APP.view = APP.parseHash();
    window.render(true);
    const C = window.claude;
    if (!C || typeof C.use !== "function") { APP.cap.dbMode = "local"; window.renderChrome(); return; }
    C.use("sample").then(async function (s) {
      if (s) {
        APP.cap.sample = s;
        try { const lim = await s.limits(); APP.cap.tools = !!(lim && lim.tools); } catch (e) { APP.cap.tools = false; }
        window.softRender();
      }
      window.renderChrome();
    }).catch(function () { window.renderChrome(); });
    C.use("downloads").then(function (d) { APP.cap.downloads = d; }).catch(function () { /* absent */ });
    try {
      const pair = await Promise.all([C.use("db"), C.use("user")]);
      const db = pair[0], user = pair[1];
      if (db && user) {
        const id = await user.id();
        if (id) { APP.cap.db = db; APP.cap.user = user; APP.cap.uid = id; await STORE.initDb(); }
        else APP.cap.dbMode = "local";
      } else APP.cap.dbMode = "local";
    } catch (e) { APP.cap.dbMode = "local"; }
    window.renderChrome();
  }
  const d = U.$("#drawer");
  if (d) new MutationObserver(function () { window.renderChrome(); }).observe(d, { attributes: true, attributeFilter: ["hidden"] });
  boot();
})();
