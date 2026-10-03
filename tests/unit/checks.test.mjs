// The repo's own self-checks, run as tests.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const run = (script, args = []) => execFileSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });

test("plan maths: tests/plan-check.mjs prints NO PLAN ERRORS", () => {
  const out = run("tests/plan-check.mjs");
  assert.match(out, /NO PLAN ERRORS/);
  assert.match(out, /^121 days, 2026-12-01/m);
});

test("service worker: every app file is precached and VERSION matches the files", () => {
  assert.match(run("tools/stamp-sw.mjs", ["--check"]), /sw\.js up to date/);
});
