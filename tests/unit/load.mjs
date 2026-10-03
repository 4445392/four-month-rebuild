// Loads the app's classic scripts into a Node sandbox with just enough browser stubs
// for code that runs at load time (event listeners, localStorage). No DOM rendering.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const JS = new URL("../../js/", import.meta.url);
const noop = () => {};

export function load(files) {
  const store = new Map();
  const ctx = {
    console, setTimeout, clearTimeout, URL, TextEncoder, TextDecoder,
    document: { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [] },
    navigator: {},
    location: { hash: "", protocol: "http:" },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i], get length() { return store.size; } }
  };
  ctx.window = ctx;
  ctx.addEventListener = noop;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(readFileSync(new URL(f, JS), "utf8"), ctx, { filename: f });
  return ctx;
}

export const COURSE_FILES = ["20-course-meta.js", "21-course-w01-08.js", "22-course-w09-15.js", "23-course-w16-26.js", "24-exams.js", "25-plan.js"];
