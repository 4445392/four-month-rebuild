/* ============================================================
   SVG CHARTS — small line / bar / histogram charts in R.
   Thin marks, hairline grid, emphasised endpoint, hover readout.
   ============================================================ */
(function () {
  "use strict";
  const esc = function (s) { return U.esc(s); };
  const nice = function (lo, hi, n) {
    const span = hi - lo || 1, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).filter(function (s) { return s >= raw; })[0] || 10 * mag;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  };
  let uid = 0;
  const SVGC = window.SVGC = {};

  /* series: [{values, cls, label}] — values indexed 0..n-1. opts: {w, h, fmt, xlabel, zero, band:{lo,hi,cls}, legend} */
  SVGC.line = function (series, opts) {
    opts = opts || {};
    const W = opts.w || 560, H = opts.h || 220, L = 52, R = 16, Tp = 14, B = 28;
    const all = [];
    series.forEach(function (s) { s.values.forEach(function (v) { if (isFinite(v)) all.push(v); }); });
    if (opts.band) { opts.band.lo.forEach(function (v) { if (isFinite(v)) all.push(v); }); opts.band.hi.forEach(function (v) { if (isFinite(v)) all.push(v); }); }
    if (opts.zero !== false) all.push(0);
    if (!all.length) return "<p class='muted small'>No data yet.</p>";
    let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const n = Math.max.apply(null, series.map(function (s) { return s.values.length; }));
    const x = function (i) { return L + (n <= 1 ? 0 : i * (W - L - R) / (n - 1)); };
    const y = function (v) { return Tp + (hi - v) * (H - Tp - B) / (hi - lo); };
    const fmt = opts.fmt || function (v) { return v.toFixed(1); };
    let s = "";
    nice(lo, hi, 5).forEach(function (t) { s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '" class="' + (Math.abs(t) < 1e-9 ? "gz" : "gl") + '"/><text x="' + (L - 6) + '" y="' + (y(t) + 4).toFixed(1) + '" class="ax" text-anchor="end">' + esc(fmt(t)) + "</text>"; });
    const xt = nice(0, Math.max(1, n - 1), 5);
    xt.forEach(function (t) { if (t <= n - 1) s += '<text x="' + x(t).toFixed(1) + '" y="' + (H - 10) + '" class="ax" text-anchor="middle">' + esc(opts.xfmt ? opts.xfmt(t) : String(Math.round(t + (opts.x1 ? 1 : 0)))) + "</text>"; });
    if (opts.band) {
      const up = opts.band.hi.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); });
      const dn = opts.band.lo.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).reverse();
      s += '<polygon points="' + up.concat(dn).join(" ") + '" class="' + (opts.band.cls || "bandw") + '"/>';
    }
    series.forEach(function (sr) {
      const pts = sr.values.map(function (v, i) { return isFinite(v) ? x(i).toFixed(1) + "," + y(v).toFixed(1) : null; }).filter(Boolean);
      if (!pts.length) return;
      if (sr.area) s += '<polygon points="' + x(0).toFixed(1) + "," + y(Math.max(lo, Math.min(hi, 0))).toFixed(1) + " " + pts.join(" ") + " " + x(sr.values.length - 1).toFixed(1) + "," + y(Math.max(lo, Math.min(hi, 0))).toFixed(1) + '" class="area ' + (sr.cls || "") + '"/>';
      s += '<polyline points="' + pts.join(" ") + '" class="ln ' + (sr.cls || "") + '" fill="none"/>';
      if (sr.dot !== false) { const k = sr.values.length - 1; s += '<circle cx="' + x(k).toFixed(1) + '" cy="' + y(sr.values[k]).toFixed(1) + '" r="4" class="end ' + (sr.cls || "") + '"/>'; }
    });
    const id = "lc" + (++uid);
    const data = { n: n, L: L, R: R, W: W, series: series.map(function (sr) { return { l: sr.label || "", v: sr.values.map(function (v) { return +(+v).toFixed(4); }) }; }), unit: opts.unit || "" };
    s += '<line class="lc-x" x1="0" x2="0" y1="' + Tp + '" y2="' + (H - B) + '" visibility="hidden"/>';
    s += '<rect class="lc-hit" x="' + L + '" y="' + Tp + '" width="' + (W - L - R) + '" height="' + (H - Tp - B) + "\" data-lc='" + esc(JSON.stringify(data)) + "'/>";
    let legend = "";
    if (series.length > 1) legend = "<div class='legend'>" + series.map(function (sr) { return "<span><i class='sw " + (sr.cls || "") + "'></i>" + esc(sr.label || "") + "</span>"; }).join("") + "</div>";
    return "<div class='svgc' id='" + id + "'>" + legend + '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label || "Line chart") + '">' + s + "</svg><div class='lc-tip' hidden></div>" + (opts.caption ? "<div class='cap'>" + esc(opts.caption) + "</div>" : "") + "</div>";
  };

  /* items: [{label, value, cls, n}] vertical bars around a zero baseline */
  SVGC.bars = function (items, opts) {
    opts = opts || {};
    const W = opts.w || 560, H = opts.h || 200, L = 46, R = 10, Tp = 18, B = 34;
    if (!items.length) return "<p class='muted small'>No data yet.</p>";
    let lo = Math.min(0, Math.min.apply(null, items.map(function (i) { return i.value; }))), hi = Math.max(0, Math.max.apply(null, items.map(function (i) { return i.value; })));
    if (hi - lo < 1e-9) hi = lo + 1;
    const pad = (hi - lo) * 0.12; hi += pad; if (lo < 0) lo -= pad;
    const y = function (v) { return Tp + (hi - v) * (H - Tp - B) / (hi - lo); };
    const band = (W - L - R) / items.length, bw = Math.min(24, band * 0.62);
    const fmt = opts.fmt || function (v) { return v.toFixed(2); };
    let s = "";
    nice(lo, hi, 4).forEach(function (t) { s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '" class="' + (Math.abs(t) < 1e-9 ? "gz" : "gl") + '"/><text x="' + (L - 6) + '" y="' + (y(t) + 4).toFixed(1) + '" class="ax" text-anchor="end">' + esc(fmt(t)) + "</text>"; });
    items.forEach(function (it, k) {
      const cx = L + band * (k + 0.5), v = it.value;
      const top = y(Math.max(0, v)), bot = y(Math.min(0, v)), hgt = Math.max(1.5, bot - top);
      const rx = Math.min(4, hgt / 2);
      s += '<g class="bar"><rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hgt.toFixed(1) + '" rx="' + rx.toFixed(1) + '" class="' + (it.cls || (v >= 0 ? "bu" : "bd")) + '"><title>' + esc(it.label + ": " + fmt(v) + (it.n !== undefined ? " (n = " + it.n + ")" : "")) + "</title></rect>";
      if (opts.values !== false && band > 30) s += '<text x="' + cx.toFixed(1) + '" y="' + (v >= 0 ? top - 5 : bot + 13).toFixed(1) + '" class="vl" text-anchor="middle">' + esc(fmt(v)) + "</text>";
      s += '<text x="' + cx.toFixed(1) + '" y="' + (H - 16) + '" class="ax" text-anchor="middle">' + esc(it.label) + "</text>";
      if (it.n !== undefined) s += '<text x="' + cx.toFixed(1) + '" y="' + (H - 3) + '" class="ax sm" text-anchor="middle">n=' + it.n + "</text>";
      s += "</g>";
    });
    return "<div class='svgc'>" + '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label || "Bar chart") + '">' + s + "</svg>" + (opts.caption ? "<div class='cap'>" + esc(opts.caption) + "</div>" : "") + "</div>";
  };

  /* R-multiple histogram, 0.5R bins */
  SVGC.hist = function (Rs, opts) {
    opts = opts || {};
    if (!Rs.length) return "<p class='muted small'>No trades yet.</p>";
    const lo = Math.max(-3, Math.floor(Math.min.apply(null, Rs) * 2) / 2), hi = Math.min(10, Math.ceil(Math.max.apply(null, Rs) * 2) / 2);
    const bins = [];
    for (let b = lo; b < hi || bins.length === 0; b += 0.5) bins.push({ from: b, to: b + 0.5, n: 0 });
    Rs.forEach(function (r) { const c = Math.max(lo, Math.min(hi - 0.0001, r)); const k = Math.min(bins.length - 1, Math.max(0, Math.floor((c - lo) / 0.5))); bins[k].n++; });
    const W = opts.w || 560, H = opts.h || 190, L = 34, R = 10, Tp = 16, B = 30;
    const mx = Math.max.apply(null, bins.map(function (b) { return b.n; }));
    const band = (W - L - R) / bins.length, bw = Math.max(2, Math.min(24, band - 2));
    const y = function (v) { return Tp + (mx - v) * (H - Tp - B) / (mx || 1); };
    let s = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" class="gz"/>';
    bins.forEach(function (b, k) {
      const cx = L + band * (k + 0.5), top = y(b.n);
      if (b.n) s += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (H - B - top).toFixed(1) + '" rx="' + Math.min(4, (H - B - top) / 2).toFixed(1) + '" class="' + (b.from >= 0 ? "bu" : "bd") + '"><title>' + b.from.toFixed(1) + "R to " + b.to.toFixed(1) + "R: " + b.n + " trade" + (b.n === 1 ? "" : "s") + "</title></rect>";
      if (Math.abs(b.from - Math.round(b.from)) < 1e-9) s += '<text x="' + (L + band * k).toFixed(1) + '" y="' + (H - 12) + '" class="ax" text-anchor="middle">' + (b.from > 0 ? "+" : "") + b.from + "R</text>";
    });
    const legend = "<div class='legend'><span><i class='sw bd'></i>losing trades</span><span><i class='sw bu'></i>winning trades</span></div>";
    return "<div class='svgc'>" + legend + '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Distribution of trade results in R">' + s + "</svg>" + (opts.caption ? "<div class='cap'>" + esc(opts.caption) + "</div>" : "") + "</div>";
  };

  /* hover readout for line charts */
  document.addEventListener("mousemove", function (e) {
    const hit = e.target.closest && e.target.closest(".lc-hit");
    U.$$(".svgc .lc-x").forEach(function (l) { if (!hit || !hit.closest(".svgc").contains(l)) l.setAttribute("visibility", "hidden"); });
    U.$$(".svgc .lc-tip").forEach(function (t) { if (!hit || !hit.closest(".svgc").contains(t)) t.hidden = true; });
    if (!hit) return;
    let d; try { d = JSON.parse(hit.getAttribute("data-lc")); } catch (err) { return; }
    const svg = hit.ownerSVGElement, box = svg.getBoundingClientRect();
    const vx = (e.clientX - box.left) * (d.W / box.width);
    const k = Math.max(0, Math.min(d.n - 1, Math.round((vx - d.L) / ((d.W - d.L - d.R) / Math.max(1, d.n - 1)))));
    const xx = d.L + (d.n <= 1 ? 0 : k * (d.W - d.L - d.R) / (d.n - 1));
    const wrap = hit.closest(".svgc"), line = wrap.querySelector(".lc-x"), tip = wrap.querySelector(".lc-tip");
    line.setAttribute("x1", xx); line.setAttribute("x2", xx); line.setAttribute("visibility", "visible");
    tip.hidden = false;
    tip.innerHTML = "<b>#" + (k + 1) + "</b> " + d.series.map(function (s) { const v = s.v[k]; return (s.l ? esc(s.l) + ": " : "") + (isFinite(v) ? v.toFixed(2) + d.unit : "—"); }).join(" · ");
    const px = (xx / d.W) * box.width;
    tip.style.left = Math.max(0, Math.min(box.width - 160, px + 10)) + "px";
  });
})();
