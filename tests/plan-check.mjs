// Plan maths self-check: node tests/plan-check.mjs  → must print "NO PLAN ERRORS".
// Loads the content + plan scripts in a sandbox (no browser needed) and checks that
// every lesson, apply step and task is placed exactly once, dates are consecutive,
// weekdays line up, units run in order, every Sunday has a review and every gate
// comes after the last lesson of its module.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const js = new URL("../js/", import.meta.url);
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["20-course-meta.js", "21-course-w01-08.js", "22-course-w09-15.js", "23-course-w16-26.js", "24-exams.js", "25-plan.js"]) {
  vm.runInContext(readFileSync(new URL(f, js), "utf8"), ctx, { filename: f });
}
const C = ctx.COURSE, pl = C.PLAN, errs = [];
const day = (iso) => new Date(iso + "T00:00:00");

for (let i = 1; i < pl.days.length; i++) {
  if ((day(pl.days[i].date) - day(pl.days[i - 1].date)) / 864e5 !== 1) errs.push("date gap at " + pl.days[i].date);
}
pl.days.forEach((d) => { if ((day(d.date).getDay() + 6) % 7 !== d.dow) errs.push("weekday mismatch " + d.date); });

const lessons = C.ORIENTATION.map((o) => o.id);
C.weeks.forEach((w) => w.L.forEach((l) => lessons.push(l.id)));
const seen = {}, tasks = {};
pl.days.forEach((d) => [d.h1, d.h2].forEach((h) => {
  if (!h) return;
  if (h.type === "lesson") seen[h.id] = (seen[h.id] || 0) + 1;
  if (h.type === "task") { tasks[h.id] = (tasks[h.id] || 0) + 1; if (!C.TASKS[h.id]) errs.push("undefined task " + h.id); }
}));
lessons.forEach((id) => { if (seen[id] !== 1) errs.push(`lesson ${id} placed ${seen[id] || 0} times`); });
Object.keys(C.TASKS).forEach((id) => { if (tasks[id] !== 1) errs.push(`task ${id} placed ${tasks[id] || 0} times`); });
for (let n = 1; n <= 26; n++) for (let k = 0; k < 3; k++) {
  const c = pl.days.filter((d) => d.h2 && d.h2.type === "practical" && d.h2.week === n && d.h2.session === k).length;
  if (c !== 1) errs.push(`apply step ${n}/${k + 1} placed ${c} times`);
}
let last = 0;
pl.days.forEach((d) => {
  if (!d.unit) return;
  if (d.unit < last) errs.push("units out of order at " + d.date);
  last = d.unit;
  if (C.weeks[d.unit - 1].L[d.k].id !== d.h1.id) errs.push("lesson/day mismatch at " + d.date);
});
const modLast = {};
pl.days.forEach((d) => { if (d.unit) modLast[C.weeks[d.unit - 1].mod] = d.i; });
for (const g in pl.examDay) { const e = C.exams[g]; if (modLast[e.mod] > pl.examDay[g]) errs.push(`gate ${g} comes before module ${e.mod} ends`); }
pl.days.forEach((d) => { if (d.dow === 6 && d.kind !== "sunday") errs.push("Sunday without a review: " + d.date); });

const gates = Object.entries(pl.examDay).map(([g, i]) => `${g} ${pl.days[i].date}`).join(", ");
console.log(`${pl.days.length} days, ${pl.days[0].date} → ${pl.days[pl.days.length - 1].date}; gates: ${gates}`);
console.log(errs.length ? errs.join("\n") : "NO PLAN ERRORS");
process.exit(errs.length ? 1 : 0);
