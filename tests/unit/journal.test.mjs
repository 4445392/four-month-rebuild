// Journal statistics: ENGINE.stats (the numbers every chart and gate uses) and JOURNAL's
// own additions (adherence, grades, emotion, R from prices, the SAST session clock).
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, COURSE_FILES } from "./load.mjs";

const ctx = load(["platform.js", ...COURSE_FILES, "50-engine.js", "10-core.js", "65-journal.js"]);
const { ENGINE, JOURNAL } = ctx;
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg ?? ""} ${a} ≠ ${b}`);

test("ENGINE.stats on a known sequence of R", () => {
  const s = ENGINE.stats([2, -1, -1, 3, -1]);
  assert.equal(s.n, 5);
  close(s.winRate, 0.4, "win rate");
  close(s.avgWin, 2.5, "avg win");
  close(s.avgLoss, 1, "avg loss");
  close(s.expectancy, 0.4, "expectancy");
  close(s.totalR, 2, "total");
  assert.deepEqual([...s.curve], [2, 1, 0, 3, 2]);
  close(s.maxDD, 2, "max drawdown (2R peak to 0R)");
  assert.equal(s.longestLoss, 2);
  close(s.pf, 5 / 3, "profit factor");
  assert.equal(s.best, 3);
  assert.equal(s.worst, -1);
  close(s.top3Share, 2.5, "top-3 share (3 + 2 + 0) / 2");
});

test("ENGINE.stats accepts trade objects, skips non-numbers, and handles no trades", () => {
  const s = ENGINE.stats([{ R: 1 }, { R: NaN }, { R: -0.5 }, { R: "x" }]);
  assert.equal(s.n, 2);
  close(s.expectancy, 0.25);
  const e = ENGINE.stats([]);
  assert.equal(e.n, 0);
  assert.equal(e.expectancy, 0);
  assert.equal(e.pf, null);
});

test("30% wins at 3R and 60% wins at 1R both have +0.2R expectancy (neither beats the other)", () => {
  const a = ENGINE.stats([3, 3, 3, -1, -1, -1, -1, -1, -1, -1]);
  const b = ENGINE.stats([1, 1, 1, 1, 1, 1, -1, -1, -1, -1]);
  close(a.expectancy, 0.2);
  close(b.expectancy, 0.2);
});

test("JOURNAL.stats adds adherence, grades and average emotion", () => {
  const s = JOURNAL.stats([
    { R: 1, rules: "Y", grade: "A", ed: 2 },
    { R: -1, rules: "N", grade: "C", ed: 4 },
    { R: 2, rules: "Y", grade: "A" },
    { R: -1, grade: "Z", ed: 0 }
  ]);
  close(s.adherence, 2 / 3, "adherence counts only judged trades");
  assert.equal(s.grades.A, 2);
  assert.equal(s.grades.C, 1);
  assert.equal(s.grades.none, 1);
  close(s.emotion, 3, "emotion ignores missing and zero scores");
  assert.equal(JOURNAL.stats([{ R: 1 }]).adherence, null);
});

test("JOURNAL.computeR from entry, stop and exit, long and short", () => {
  close(JOURNAL.computeR({ dir: "L", entry: "1.1000", stop: "1.0950", exit: "1.1100" }), 2, "long +2R");
  close(JOURNAL.computeR({ dir: "S", entry: "1.1000", stop: "1.1050", exit: "1.0900" }), 2, "short +2R");
  close(JOURNAL.computeR({ dir: "L", entry: 100, stop: 90, exit: 90 }), -1, "stopped out");
  assert.equal(JOURNAL.computeR({ dir: "L", entry: 1, stop: 1, exit: 2 }), null);
  assert.equal(JOURNAL.computeR({ dir: "L", entry: "", stop: 1, exit: 2 }), null);
});

test("JOURNAL.sessionOf uses SAST and follows European and US daylight saving", () => {
  // Winter (no DST anywhere): London opens 10:00 SAST, New York 15:00
  assert.equal(JOURNAL.sessionOf("2027-01-15", "09:30"), "Asia");
  assert.equal(JOURNAL.sessionOf("2027-01-15", "10:30"), "London");
  assert.equal(JOURNAL.sessionOf("2027-01-15", "15:30"), "Overlap");
  assert.equal(JOURNAL.sessionOf("2027-01-15", "20:00"), "New York");
  assert.equal(JOURNAL.sessionOf("2027-01-15", "00:30"), "Off-hours");
  // Summer: London opens 09:00, New York 14:00
  assert.equal(JOURNAL.sessionOf("2026-07-15", "09:30"), "London");
  assert.equal(JOURNAL.sessionOf("2026-07-15", "14:30"), "Overlap");
  // Mid-March gap: US already on DST, Europe not yet
  assert.equal(JOURNAL.sessionOf("2027-03-20", "14:30"), "Overlap");
  assert.equal(JOURNAL.sessionOf("2027-03-20", "09:30"), "Asia");
  assert.equal(JOURNAL.sessionOf("", "10:00"), "");
});
