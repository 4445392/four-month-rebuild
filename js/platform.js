/* ============================================================
   PLATFORM — everything the app needs from the device, in one
   place. Loaded first; the rest of the app reads APP.cap.* (set
   in 99-boot.js) and PLATFORM.storage, never browser APIs for
   these directly.
   - storage: JSON key/value in IndexedDB (await storage.ready() once, then get/set)
   - download(filename, text, type): save a file
   - pickFile({accept}): open a file chooser → {name, text} or null
   - ai:   the tutor's sampler (Phase 4). null = no tutor.
   - sync: cloud sync (optional, later). null = this device only.
   ============================================================ */
(function () {
  "use strict";

  /* ---- storage: an in-memory copy of IndexedDB ----
     ready() loads every key once at boot, and moves old localStorage
     data across the first time. After that get() is synchronous from
     memory and set() writes through to IndexedDB straight away.
     Values are JSON copies, exactly as localStorage behaved. Where
     IndexedDB isn't available it falls back to localStorage. */
  const DB_NAME = "four-month-rebuild", OS = "kv", PREFIX = "rebuild.", MIGRATED = "rebuild.meta.migrated";
  const mem = Object.create(null);
  let db = null, backend = "starting", readyP = null, pending = null, chain = Promise.resolve(), last = Promise.resolve();
  const snap = function (v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); };
  const lsKeys = function () { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) out.push(k); } } catch (e) { /* blocked */ } return out; };
  const lsGet = function (k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : undefined; } catch (e) { return undefined; } };

  function open() {
    return new Promise(function (resolve, reject) {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(OS); };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
      r.onblocked = function () { reject(new Error("IndexedDB blocked")); };
    });
  }
  function tx(mode, fn) {
    return new Promise(function (resolve, reject) {
      const t = db.transaction(OS, mode);
      fn(t.objectStore(OS));
      t.oncomplete = function () { resolve(); };
      t.onerror = function () { reject(t.error); };
      t.onabort = function () { reject(t.error || new Error("transaction aborted")); };
    });
  }
  function report(e) { console.warn("storage", e); if (storage.onError) storage.onError(e); }
  function writeOut() {
    const batch = pending; pending = null;
    if (!batch) return Promise.resolve();
    if (backend === "localstorage") {
      Object.keys(batch).forEach(function (k) { if (batch[k] === undefined) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(batch[k])); });
      return Promise.resolve();
    }
    return tx("readwrite", function (st) { Object.keys(batch).forEach(function (k) { if (batch[k] === undefined) st.delete(k); else st.put(batch[k], k); }); });
  }
  function queue(k, v) {
    const first = !pending;
    pending = pending || {};
    pending[k] = v;
    if (!first) return;
    last = chain.then(function () { return storage.ready(); }).then(writeOut);
    last.catch(report);
    chain = last.catch(function () { /* keep going after a failed write */ });
  }

  const storage = {
    onError: null,
    backend: function () { return backend; },
    ready: function () {
      if (readyP) return readyP;
      readyP = (async function () {
        try {
          if (!window.indexedDB) throw new Error("IndexedDB not available");
          db = await open();
          await tx("readonly", function (st) {
            const c = st.openCursor();
            c.onsuccess = function () { const cur = c.result; if (cur) { if (!(cur.key in mem)) mem[cur.key] = cur.value; cur.continue(); } };
          });
          if (!mem[MIGRATED]) {
            /* one-time move from localStorage (Phases 1–2 and the starter kit kept everything there) */
            const keys = lsKeys(), moved = {};
            keys.forEach(function (k) { const v = lsGet(k); if (v !== undefined && !(k in mem)) { mem[k] = v; moved[k] = v; } });
            const marker = { at: Date.now(), keys: Object.keys(moved) };
            await tx("readwrite", function (st) { Object.keys(moved).forEach(function (k) { st.put(moved[k], k); }); st.put(marker, MIGRATED); });
            mem[MIGRATED] = marker;
            keys.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
          }
          backend = "indexeddb";
        } catch (e) {
          console.warn("IndexedDB unavailable — using localStorage", e);
          db = null; backend = "localstorage";
          lsKeys().forEach(function (k) { if (!(k in mem)) { const v = lsGet(k); if (v !== undefined) mem[k] = v; } });
        }
      })();
      return readyP;
    },
    get: function (key, fallback) { return key in mem && mem[key] !== undefined && mem[key] !== null ? snap(mem[key]) : fallback; },
    /* Updates memory at once and writes through in the background. Returns false only if the value can't be stored at all. */
    set: function (key, value) {
      let v; try { v = snap(value); } catch (e) { return false; }
      mem[key] = v; queue(key, v); return true;
    },
    remove: function (key) { delete mem[key]; queue(key, undefined); },
    /* Resolves when everything set so far is on disk; rejects if the latest write failed. */
    flush: function () { return last; },
    persisted: function () { return navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(null); },
    persist: function () { return navigator.storage && navigator.storage.persist ? navigator.storage.persist() : Promise.resolve(null); },
    estimate: function () { return navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve(null); }
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

  /* Light / dark / follow the system. A per-device preference kept in localStorage (not "rebuild.*",
     so it never moves into IndexedDB) because index.html applies it before the first paint. */
  const theme = {
    get: function () { try { const t = localStorage.getItem("fmr-theme"); return t === "light" || t === "dark" ? t : "system"; } catch (e) { return "system"; } },
    set: function (t) {
      try { if (t === "light" || t === "dark") localStorage.setItem("fmr-theme", t); else localStorage.removeItem("fmr-theme"); } catch (e) { /* storage blocked: applies until reload */ }
      if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    }
  };

  window.PLATFORM = { storage: storage, download: download, pickFile: pickFile, theme: theme, ai: null, sync: null };
})();
