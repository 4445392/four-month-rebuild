/* ============================================================
   PWA — service-worker registration, the "Update ready" toast,
   and install help (Android/desktop prompt, iPhone instructions).
   A waiting update only takes over when the student taps Reload,
   and never while an exam attempt is open.
   ============================================================ */
(function () {
  "use strict";
  const W = window.PWA = {
    prompt: null, installed: false, reg: null, waiting: null, wantReload: false,
    standalone: function () { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; },
    isIOS: function () { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); },
    canInstall: function () { return !!W.prompt; }
  };
  const inExam = function () { return !!(APP.ui.attempt && !APP.ui.attempt.submitted); };

  /* ---- install ---- */
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); W.prompt = e; window.softRender && window.softRender(); });
  window.addEventListener("appinstalled", function () { W.prompt = null; W.installed = true; U.toast("Installed. Open it from your home screen or app list."); window.softRender && window.softRender(); });
  W.install = async function () {
    const p = W.prompt; if (!p) return;
    W.prompt = null;
    p.prompt();
    try { await p.userChoice; } catch (e) { /* dismissed */ }
    window.softRender && window.softRender();
  };
  ACT.installApp = function () { W.install(); };

  /* ---- updates ---- */
  function updateToast() {
    const box = U.$("#toasts"); if (!box || U.$("#update-toast")) return;
    const el = document.createElement("div");
    el.className = "toast sticky"; el.id = "update-toast"; el.setAttribute("role", "status");
    el.innerHTML = "<span>Update ready</span><button class='btn sm' data-act='applyUpdate'>Reload</button>";
    box.appendChild(el);
  }
  ACT.applyUpdate = function () {
    if (inExam()) { U.toast("Finish or leave the exam first — the update will wait."); return; }
    const t = U.$("#update-toast"); if (t) t.remove();
    W.wantReload = true;
    if (W.waiting) W.waiting.postMessage("skipWaiting");
    else location.reload();
  };
  function watch(worker) {
    worker.addEventListener("statechange", function () {
      if (worker.state === "installed" && navigator.serviceWorker.controller) { W.waiting = worker; updateToast(); }
    });
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    let hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController) { hadController = true; return; } // first install claiming the page: not an update
      if (W.wantReload && !inExam()) location.reload();
      else if (!W.wantReload) { W.waiting = null; updateToast(); } // another tab updated; reload when convenient
    });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        W.reg = reg;
        if (reg.waiting && navigator.serviceWorker.controller) { W.waiting = reg.waiting; updateToast(); }
        if (reg.installing) watch(reg.installing);
        reg.addEventListener("updatefound", function () { if (reg.installing) watch(reg.installing); });
        // check for a new version when the app comes back to the foreground
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update().catch(function () { /* offline */ }); });
      }).catch(function (e) { console.warn("service worker", e); });
    });
  }

  /* ---- the Settings block (Record → Settings) ---- */
  W.settingsHTML = function () {
    let body;
    if (W.standalone() || W.installed) body = "<p class='small'>You're using the installed app. It works offline.</p>";
    else if (W.canInstall()) body = "<p class='small'>Install it like an app: its own icon, full screen, and it works offline.</p><div class='row'><button class='btn primary' data-act='installApp'>Install the app</button></div>";
    else if (W.isIOS()) body = "<p class='small'>On iPhone or iPad, in Safari: tap <b>Share</b> (the square with the arrow), then <b>Add to Home Screen</b>.</p>";
    else body = "<p class='small'>To install: in Chrome on Android, open the menu and choose <b>Install app</b>; in Chrome or Edge on a computer, use the install icon in the address bar. On iPhone, use Safari: <b>Share → Add to Home Screen</b>.</p>";
    return "<div class='field'><span>Install</span>" + body + "</div>";
  };
})();
