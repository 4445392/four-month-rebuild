/* ============================================================
   SERVICE WORKER — offline-first.
   Precaches every app file under a versioned cache, serves
   same-origin GETs cache-first, and deletes old caches on
   activate. A new version waits until the page asks it to take
   over (the "Update ready" toast), so nothing reloads mid-exam.
   Paths are relative: the site lives under /four-month-rebuild/.

   VERSION is a hash of FILES, stamped by `node tools/stamp-sw.mjs`.
   Run it after changing any app file, and add new files to FILES.
   ============================================================ */
const VERSION = "f3f43c54dfca";
const CACHE = "rebuild-" + VERSION;
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/platform.js",
  "js/20-course-meta.js",
  "js/21-course-w01-08.js",
  "js/22-course-w09-15.js",
  "js/23-course-w16-26.js",
  "js/24-exams.js",
  "js/25-plan.js",
  "js/50-engine.js",
  "js/10-core.js",
  "js/30-diagrams.js",
  "js/54-svgcharts.js",
  "js/55-chart.js",
  "js/40-views.js",
  "js/56-floor.js",
  "js/60-labs.js",
  "js/65-journal.js",
  "js/70-tutor.js",
  "js/75-calendar.js",
  "js/78-export.js",
  "js/98-pwa.js",
  "js/99-boot.js",
  "fonts/bitter-latin-wght-normal.woff2",
  "fonts/source-sans-3-latin-wght-normal.woff2",
  "fonts/source-sans-3-latin-wght-italic.woff2",
  "fonts/ibm-plex-mono-latin-400-normal.woff2",
  "fonts/ibm-plex-mono-latin-500-normal.woff2",
  "fonts/ibm-plex-mono-latin-600-normal.woff2",
  "icons/icon.svg",
  "icons/icon-maskable.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); }));
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("rebuild-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("message", function (e) {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // e.g. the Anthropic API: never cached
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (req.mode === "navigate") return c.match("index.html").then(function (idx) { return idx || fetch(req); });
      return fetch(req).then(function (res) {
        if (res.ok && res.type === "basic") c.put(req, res.clone());
        return res;
      });
    });
  }));
});
