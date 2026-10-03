/* ============================================================
   PRICE CHART — canvas candlesticks with overlays: Donchian
   channels, confirmed swings, position lines, pending orders,
   trade markers, level marks, regime band (after DNA reveal),
   hover readout, drag-to-pan, ctrl/pinch zoom, and pick-a-level.
   ============================================================ */
(function () {
  "use strict";
  const css = function (n, fb) { const v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || fb; };

  function PriceChart(canvas, opts) {
    opts = opts || {};
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.span = opts.span || 120; this.offset = 0;
    this.d = null; this.hover = null; this.pickCb = null; this.drag = null;
    const self = this;
    this.h = {
      move: function (e) { const r = self.cv.getBoundingClientRect(); self.hover = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (self.drag) { const dx = e.clientX - self.drag.x; const bars = Math.round(dx / Math.max(1, self.lay ? self.lay.bw : 6)); self.offset = Math.max(0, Math.min(self.maxOffset(), self.drag.off + bars)); }
        self.draw(); },
      leave: function () { self.hover = null; self.drag = null; self.draw(); },
      down: function (e) { if (self.pickCb) return; self.drag = { x: e.clientX, off: self.offset }; },
      up: function () { self.drag = null; },
      click: function (e) {
        if (!self.pickCb || !self.lay) return;
        const r = self.cv.getBoundingClientRect(); const yv = e.clientY - r.top;
        const px = self.lay.pAt(yv); const cb = self.pickCb; self.pickCb = null; self.cv.classList.remove("picking"); cb(px);
      },
      wheel: function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); self.zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15); }
    };
    canvas.addEventListener("pointermove", this.h.move);
    canvas.addEventListener("pointerleave", this.h.leave);
    canvas.addEventListener("pointerdown", this.h.down);
    window.addEventListener("pointerup", this.h.up);
    canvas.addEventListener("click", this.h.click);
    canvas.addEventListener("wheel", this.h.wheel, { passive: false });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(function () { self.draw(); }); this.ro.observe(canvas); }
  }
  PriceChart.prototype.destroy = function () {
    if (this.ro) this.ro.disconnect();
    this.cv.removeEventListener("pointermove", this.h.move); this.cv.removeEventListener("pointerleave", this.h.leave);
    this.cv.removeEventListener("pointerdown", this.h.down); window.removeEventListener("pointerup", this.h.up);
    this.cv.removeEventListener("click", this.h.click); this.cv.removeEventListener("wheel", this.h.wheel);
  };
  PriceChart.prototype.maxOffset = function () { return this.d ? Math.max(0, this.d.end - 30) : 0; };
  PriceChart.prototype.zoom = function (f) { this.span = Math.max(30, Math.min(400, Math.round(this.span * f))); this.draw(); };
  PriceChart.prototype.set = function (d) { this.d = d; if (d.resetView) this.offset = 0; this.draw(); };
  PriceChart.prototype.pick = function (cb) { this.pickCb = cb; this.cv.classList.add("picking"); };

  PriceChart.prototype.draw = function () {
    const d = this.d, cv = this.cv, ctx = this.ctx;
    if (!d || !d.M) return;
    const M = d.M, spec = M.spec, dig = spec.pip === 0.01 ? 3 : 5;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const col = {
      bg: css("--surface", "#fff"), grid: css("--chart-grid", "#e5e5e5"), axis: css("--ink-soft", "#888"), ink: css("--ink", "#111"), mid: css("--ink-mid", "#444"),
      up: css("--c-up", "#1baf7a"), dn: css("--c-down", "#eb6834"), blue: css("--c-blue", "#2a78d6"), acc: css("--brass-bright", "#b98a32"), chop: css("--c-chop", "#8f9aa5"), gate: css("--gate", "#8c3524")
    };
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    const regH = d.showRegimes && M.reg ? 10 : 0;
    const Lp = 6, Rp = 70, Tp = 26, Bp = 20 + regH;
    const end = Math.max(0, d.end - this.offset);
    const span = Math.min(this.span, end + 1);
    const first = Math.max(0, end - span + 1);
    const slots = span + 4;
    const pw = W - Lp - Rp, bw = pw / slots;
    let lo = Infinity, hi = -Infinity;
    for (let i = first; i <= end; i++) { if (M.l[i] < lo) lo = M.l[i]; if (M.h[i] > hi) hi = M.h[i]; }
    const ind = d.overlays && (d.overlays.entry || d.overlays.exit) ? ENGINE.indicators(M) : null;
    const chans = [];
    if (d.overlays && d.overlays.entry && ind) chans.push({ c: ind["dc" + d.overlays.entry], color: col.blue, w: 1.5 });
    if (d.overlays && d.overlays.exit && ind) chans.push({ c: ind["dc" + d.overlays.exit], color: col.axis, w: 1 });
    const extra = [];
    if (d.position) { extra.push(d.position.stop); if (d.position.target) extra.push(d.position.target); d.position.units.forEach(function (u) { extra.push(u.px); }); }
    (d.orders || []).forEach(function (o) { if (isFinite(o.px)) extra.push(o.px); });
    (d.marks || []).forEach(function (m) { if (isFinite(m.px)) extra.push(m.px); });
    extra.forEach(function (v) { if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } });
    chans.forEach(function (ch) { for (let i = first; i <= end; i++) { const a = ch.c.up[i], b = ch.c.lo[i]; if (isFinite(a) && a > hi) hi = a; if (isFinite(b) && b < lo) lo = b; } });
    if (!isFinite(lo)) return;
    const pad = (hi - lo) * 0.07 || spec.pip * 20; lo -= pad; hi += pad;
    const y = function (p) { return Tp + (hi - p) * (H - Tp - Bp) / (hi - lo); };
    const pAt = function (yy) { return hi - (yy - Tp) * (hi - lo) / (H - Tp - Bp); };
    const xOf = function (i) { return Lp + (i - first + 0.5) * bw; };
    this.lay = { bw: bw, pAt: pAt, first: first, end: end };
    // grid + axis
    const step = (function () { const raw = (hi - lo) / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))); return [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).filter(function (s) { return s >= raw; })[0]; })();
    ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      const yy = Math.round(y(v)) + 0.5;
      ctx.strokeStyle = col.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Lp, yy); ctx.lineTo(W - Rp, yy); ctx.stroke();
      ctx.fillStyle = col.axis; ctx.fillText(v.toFixed(dig), W - Rp + 6, yy);
    }
    // regime band
    if (regH) {
      const rc = [col.up, col.dn, col.blue, col.chop];
      for (let i = first; i <= end; i++) { ctx.fillStyle = rc[M.reg[i]] || col.chop; ctx.fillRect(xOf(i) - bw / 2, H - regH - 2, Math.ceil(bw), regH - 2); }
    }
    // channels
    chans.forEach(function (ch) {
      ["up", "lo"].forEach(function (k) {
        ctx.strokeStyle = ch.color; ctx.lineWidth = ch.w; ctx.beginPath(); let on = false;
        for (let i = first; i <= end + 1 && i < M.c.length + 1; i++) { const v = ch.c[k][Math.min(i, M.c.length - 1)]; if (!isFinite(v)) { on = false; continue; } const xx = Lp + (i - first) * bw; if (!on) { ctx.moveTo(xx, y(v)); on = true; } else ctx.lineTo(xx, y(v)); ctx.lineTo(xx + bw, y(v)); }
        ctx.stroke();
      });
    });
    // candles
    const bodyW = Math.max(1, Math.min(14, bw * 0.62));
    for (let i = first; i <= end; i++) {
      const o = M.o[i], h = M.h[i], l = M.l[i], c = M.c[i], up = c >= o, xx = xOf(i);
      ctx.strokeStyle = up ? col.up : col.dn; ctx.fillStyle = up ? col.up : col.dn; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(xx) + 0.5, y(h)); ctx.lineTo(Math.round(xx) + 0.5, y(l)); ctx.stroke();
      const top = y(Math.max(o, c)), bot = y(Math.min(o, c));
      ctx.fillRect(xx - bodyW / 2, top, bodyW, Math.max(1, bot - top));
    }
    // swings
    if (d.overlays && d.overlays.swings) {
      const sw = ENGINE.swings(M, 3, first, end);
      ctx.fillStyle = col.mid;
      sw.forEach(function (s) {
        const xx = xOf(s.i), yy = s.type === "H" ? y(s.px) - 7 : y(s.px) + 7;
        ctx.beginPath();
        if (s.type === "H") { ctx.moveTo(xx - 4, yy - 5); ctx.lineTo(xx + 4, yy - 5); ctx.lineTo(xx, yy); }
        else { ctx.moveTo(xx - 4, yy + 5); ctx.lineTo(xx + 4, yy + 5); ctx.lineTo(xx, yy); }
        ctx.closePath(); ctx.fill();
      });
    }
    // closed trades
    (d.trades || []).forEach(function (t) {
      if (t.exitIdx < first || t.entryIdx > end) return;
      const good = t.R > 0;
      ctx.strokeStyle = good ? col.up : col.dn; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xOf(Math.max(first, t.entryIdx)), y(t.entry)); ctx.lineTo(xOf(Math.min(end, t.exitIdx)), y(t.exit)); ctx.stroke(); ctx.setLineDash([]);
      if (t.entryIdx >= first) { ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(xOf(t.entryIdx), y(t.entry), 3.5, 0, 7); ctx.fill(); }
      if (t.exitIdx <= end) { ctx.fillStyle = good ? col.up : col.dn; ctx.strokeStyle = col.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xOf(t.exitIdx), y(t.exit), 4.5, 0, 7); ctx.fill(); ctx.stroke(); }
    });
    // axis tag helper
    const tag = function (p, text, color) {
      const yy = y(p); ctx.fillStyle = color; ctx.fillRect(W - Rp + 1, yy - 8, Rp - 2, 16);
      ctx.fillStyle = col.bg; ctx.fillText(text, W - Rp + 5, yy + 0.5);
    };
    const hline = function (p, color, dash, from, label) {
      const yy = Math.round(y(p)) + 0.5; ctx.strokeStyle = color; ctx.lineWidth = 1.25; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(from === undefined ? Lp : from, yy); ctx.lineTo(W - Rp, yy); ctx.stroke(); ctx.setLineDash([]);
      if (label) { ctx.fillStyle = color; ctx.textAlign = "right"; ctx.fillText(label, W - Rp - 4, yy - 8); ctx.textAlign = "left"; }
    };
    // marks
    (d.marks || []).forEach(function (m) { if (!isFinite(m.px)) return; const c = m.cls === "key" ? col.acc : m.cls === "pick" ? col.blue : col.mid; hline(m.px, c, m.cls === "pick" ? [5, 4] : [], undefined, m.label); tag(m.px, m.px.toFixed(dig), c); });
    // orders
    (d.orders || []).forEach(function (o) { if (!isFinite(o.px)) return; hline(o.px, col.mid, [2, 3], undefined, o.label); });
    // position
    if (d.position) {
      const p = d.position, from = xOf(Math.max(first, p.entryIdx));
      p.units.forEach(function (u, k) { hline(u.px, col.ink, [], from, k === p.units.length - 1 ? (p.dir > 0 ? "long" : "short") + " · " + p.units.length + " unit" + (p.units.length > 1 ? "s" : "") : ""); });
      hline(p.stop, col.dn, [6, 4], from, "stop"); tag(p.stop, p.stop.toFixed(dig), col.dn);
      if (p.target) { hline(p.target, col.up, [6, 4], from, "target"); tag(p.target, p.target.toFixed(dig), col.up); }
    }
    // last price tag
    const lc = M.c[end]; tag(lc, lc.toFixed(dig), M.c[end] >= M.o[end] ? col.up : col.dn);
    // x labels
    ctx.fillStyle = col.axis; ctx.textAlign = "center";
    const every = Math.max(1, Math.round(60 / bw));
    for (let i = first; i <= end; i++) {
      if ((i - first) % every !== 0) continue;
      const lab = !d.blind && M.d && M.d[i] ? String(M.d[i]).slice(0, 10) : (M.synthetic ? "Day " + (i + 1) : "Bar " + (i + 1));
      const tw = ctx.measureText(lab).width;
      if (xOf(i) - tw / 2 < Lp || xOf(i) + tw / 2 > W - Rp) continue;
      ctx.fillText(lab, xOf(i), H - regH - 9);
    }
    ctx.textAlign = "left";
    // hover crosshair + readout
    const hv = this.hover;
    if (hv && hv.x > Lp && hv.x < W - Rp && hv.y > Tp && hv.y < H - Bp) {
      const i = Math.max(first, Math.min(end, first + Math.floor((hv.x - Lp) / bw)));
      ctx.strokeStyle = col.axis; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(xOf(i)) + 0.5, Tp); ctx.lineTo(Math.round(xOf(i)) + 0.5, H - Bp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(Lp, Math.round(hv.y) + 0.5); ctx.lineTo(W - Rp, Math.round(hv.y) + 0.5); ctx.stroke(); ctx.setLineDash([]);
      tag(pAt(hv.y), pAt(hv.y).toFixed(dig), this.pickCb ? col.blue : col.mid);
      const N = ENGINE.indicators(M).N[i];
      const lab = (!d.blind && M.d && M.d[i] ? String(M.d[i]) : (M.synthetic ? "Day " + (i + 1) : "Bar " + (i + 1))) +
        "  O " + M.o[i].toFixed(dig) + "  H " + M.h[i].toFixed(dig) + "  L " + M.l[i].toFixed(dig) + "  C " + M.c[i].toFixed(dig) + (isFinite(N) ? "  N " + (N / spec.pip).toFixed(0) + "p" : "");
      ctx.fillStyle = col.ink; ctx.fillText(lab, Lp + 4, 12);
    } else {
      const N = ENGINE.indicators(M).N[end];
      ctx.fillStyle = col.mid;
      ctx.fillText((this.pickCb ? "Click the chart to pick a level  ·  " : "") + (isFinite(N) ? "N (20-day ATR) " + (N / spec.pip).toFixed(0) + " pips" : "") + (this.offset ? "   ·   viewing " + this.offset + " bars back (drag right to return)" : ""), Lp + 4, 12);
    }
    if (this.pickCb && hv) { ctx.strokeStyle = col.blue; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Lp, Math.round(hv.y) + 0.5); ctx.lineTo(W - Rp, Math.round(hv.y) + 0.5); ctx.stroke(); }
  };
  window.PriceChart = PriceChart;
})();
