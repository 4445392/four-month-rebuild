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
      "<div class='lbl store'>" + (APP.cap.dbMode === "synced" ? "Saved and synced" : APP.cap.dbMode === "connecting" ? "Connecting…" : "Saved on this device") + "</div>";
    const top = U.$("#topstanding");
    if (top) top.textContent = rank.name + " · " + cnt.done + "/" + cnt.total;
    const fab = U.$("#fab");
    if (fab) fab.hidden = !TUTOR.available() || !U.$("#drawer").hidden;
  };

  /* Capabilities come from PLATFORM (js/platform.js) under the same APP.cap names the
     claude.ai artifact used, so the rest of the app doesn't care where they come from. */
  async function boot() {
    PLATFORM.storage.onError = function (e) {
      U.toast("Couldn't save on this device" + (e && e.name === "QuotaExceededError" ? " — storage is full" : "") + ". Download a backup from Record → Settings.", "bad");
    };
    await PLATFORM.storage.ready();
    STORE.load();
    storageStatus(true);
    APP.view = APP.parseHash();
    APP.cap.downloads = { save: function (o) { PLATFORM.download(o.filename, o.data, o.type); return Promise.resolve(); } };
    window.render(true);
    PLATFORM.ai = window.AI_ANTHROPIC ? AI_ANTHROPIC.fromSettings() : null; // the tutor, if a key is saved
    const ai = PLATFORM.ai;
    if (ai) {
      APP.cap.sample = ai;
      try { const lim = await ai.limits(); APP.cap.tools = !!(lim && lim.tools); } catch (e) { APP.cap.tools = false; }
      window.softRender();
    }
    const sync = PLATFORM.sync; /* {db, uid} — not built yet */
    if (sync && sync.db && sync.uid) {
      APP.cap.db = sync.db; APP.cap.uid = sync.uid;
      try { await STORE.initDb(); } catch (e) { APP.cap.dbMode = "local"; }
    } else APP.cap.dbMode = "local";
    window.renderChrome();
  }
  /* Ask the browser not to clear our data under storage pressure (Chrome decides quietly; Firefox asks). */
  async function storageStatus(ask) {
    const S = PLATFORM.storage;
    try {
      let p = await S.persisted();
      if (p === false && ask) p = await S.persist();
      APP.cap.persisted = p;
      const est = await S.estimate();
      APP.cap.usage = est ? est.usage : null;
    } catch (e) { APP.cap.persisted = null; }
    if (APP.view && APP.view.name === "record") window.softRender();
  }
  window.storageStatus = storageStatus;
  const d = U.$("#drawer");
  if (d) new MutationObserver(function () { window.renderChrome(); }).observe(d, { attributes: true, attributeFilter: ["hidden"] });
  boot();
})();
