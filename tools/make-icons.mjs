// Makes the app icons from one shape list: icons/icon.svg (the master), icons/icon-maskable.svg,
// and the PNGs the manifest and iOS need. No dependencies — a tiny rasteriser for rounded
// rectangles and a PNG encoder on node:zlib.
//   node tools/make-icons.mjs
// The mark: four brass bars rising on ink — four months, each built on the last.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

const INK = "#152029", BRASS = "#B98A32", BRASS_HI = "#E0B868";
const bars = (k) => {
  // k = scale around the centre (maskable icons keep the art inside the 80% safe circle)
  const w = 56, gap = 21.33, x0 = 112, base = 384, hs = [72, 128, 184, 240];
  return hs.map((h, i) => {
    const r = { x: x0 + i * (w + gap), y: base - h, w, h, rx: 10, fill: i === 3 ? BRASS_HI : BRASS };
    return { x: 256 + (r.x - 256) * k, y: 256 + (r.y - 256) * k, w: r.w * k, h: r.h * k, rx: r.rx * k, fill: r.fill };
  });
};
const shapes = (maskable) => [{ x: 0, y: 0, w: 512, h: 512, rx: maskable ? 0 : 104, fill: INK }, ...bars(maskable ? 0.82 : 1)];

function svg(maskable) {
  const rects = shapes(maskable).map((s) => `<rect x="${+s.x.toFixed(2)}" y="${+s.y.toFixed(2)}" width="${+s.w.toFixed(2)}" height="${+s.h.toFixed(2)}" rx="${+s.rx.toFixed(2)}" fill="${s.fill}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n  <title>The Four-Month Rebuild</title>\n  ${rects.join("\n  ")}\n</svg>\n`;
}

// signed distance to a rounded rectangle (negative inside)
function sdRound(px, py, s) {
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2, r = Math.min(s.rx, s.w / 2, s.h / 2);
  const qx = Math.abs(px - cx) - (s.w / 2 - r), qy = Math.abs(py - cy) - (s.h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function raster(size, maskable) {
  const list = shapes(maskable), scale = 512 / size, SS = 4, px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const X = (x + (sx + 0.5) / SS) * scale, Y = (y + (sy + 0.5) / SS) * scale;
      let col = null;
      for (const s of list) if (sdRound(X, Y, s) <= 0) col = s.fill; // painter's order: last hit wins
      if (col) { const c = rgb(col); r += c[0]; g += c[1]; b += c[2]; a += 1; }
    }
    const o = (y * size + x) * 4, n = SS * SS;
    if (a) { px[o] = Math.round(r / a); px[o + 1] = Math.round(g / a); px[o + 2] = Math.round(b / a); }
    px[o + 3] = Math.round((255 * a) / n);
  }
  return png(size, px);
}

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const byte of buf) c = CRC[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const out = new URL("../icons/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("icon.svg", out), svg(false));
writeFileSync(new URL("icon-maskable.svg", out), svg(true));
writeFileSync(new URL("icon-192.png", out), raster(192, false));
writeFileSync(new URL("icon-512.png", out), raster(512, false));
writeFileSync(new URL("icon-maskable-512.png", out), raster(512, true));
writeFileSync(new URL("apple-touch-icon.png", out), raster(180, true)); // iOS rounds the corners itself
console.log("icons written");
