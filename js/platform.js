/* ============================================================
   PLATFORM — everything the app needs from the device, in one
   place. Loaded first; the rest of the app reads APP.cap.* (set
   in 99-boot.js) and PLATFORM.storage, never browser APIs for
   these directly.
   - storage: JSON key/value (localStorage for now; Phase 3 → IndexedDB)
   - download(filename, text, type): save a file
   - pickFile({accept}): open a file chooser → {name, text} or null
   - ai:   the tutor's sampler (Phase 4). null = no tutor.
   - sync: cloud sync (optional, later). null = this device only.
   ============================================================ */
(function () {
  "use strict";

  const storage = {
    get: function (key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    /* Returns false when the browser refuses (full, or storage blocked). */
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    remove: function (key) { try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ } }
  };

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.hidden = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  /* Must be called from a click handler (browsers only open the chooser on a user gesture). */
  function pickFile(opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      const input = document.createElement("input");
      input.type = "file";
      if (opts.accept) input.accept = opts.accept;
      input.hidden = true;
      document.body.appendChild(input);
      const done = function () { input.remove(); };
      input.addEventListener("cancel", function () { done(); resolve(null); });
      input.addEventListener("change", function () {
        const file = input.files && input.files[0];
        done();
        if (!file) { resolve(null); return; }
        file.text().then(function (text) { resolve({ name: file.name, size: file.size, text: text }); }, reject);
      });
      input.click();
    });
  }

  window.PLATFORM = { storage: storage, download: download, pickFile: pickFile, ai: null, sync: null };
})();
