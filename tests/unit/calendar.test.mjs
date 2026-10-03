// The .ics export: one event per plan day, at the chosen SAST time, valid line folding.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, COURSE_FILES } from "./load.mjs";

const ctx = load(["platform.js", ...COURSE_FILES, "50-engine.js", "10-core.js", "75-calendar.js"]);
const ics = ctx.CALENDAR.build("18:30", "https://example.test/four-month-rebuild/", new Date("2026-10-03T10:00:00Z"));
const events = ics.split("BEGIN:VEVENT").slice(1);

test("one event for each of the 121 days, wrapped in a calendar", () => {
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.equal(events.length, 121);
  assert.equal(new Set(events.map((e) => e.match(/UID:(.*)\r\n/)[1])).size, 121, "unique UIDs");
});

test("day one is a 2-hour block at 18:30 SAST (16:30 UTC) with a reminder and a link", () => {
  const first = events[0];
  assert.match(first, /DTSTART:20261201T163000Z/);
  assert.match(first, /DTEND:20261201T183000Z/);
  assert.match(first, /TRIGGER:-PT15M/);
  assert.match(first.replace(/\r\n /g, ""), /https:\/\/example\.test\/four-month-rebuild\/#\/day\/0/);
});

test("rest days are all-day events; the final is on Sunday 28 March", () => {
  const xmas = events.find((e) => e.includes("rebuild-2026-12-25@"));
  assert.match(xmas, /DTSTART;VALUE=DATE:20261225/);
  assert.match(xmas, /DTEND;VALUE=DATE:20261226/);
  const final = events.find((e) => e.includes("rebuild-2027-03-28@"));
  assert.match(final.replace(/\r\n /g, ""), /SUMMARY:Rebuild · Review \+ /);
  assert.match(final, /DTSTART:20270328T163000Z/);
});

test("lines are folded to 75 octets and text is escaped", () => {
  for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, line);
  assert.doesNotMatch(ics.replace(/\r\n /g, ""), /DESCRIPTION:[^\r]*[^\\][,;]/, "commas and semicolons escaped in descriptions");
});

test("a bad time falls back to 18:00", () => {
  assert.match(ctx.CALENDAR.build("soon", "x/", new Date()), /DTSTART:20261201T160000Z/);
});
