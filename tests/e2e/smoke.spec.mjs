// Opens every kind of route at fixed dates across the programme and fails on any console error.
import { test, expect, openApp, visit } from "./fixtures.mjs";

const DATES = {
  "2 Oct 2026 (before the start)": "2026-10-02T09:00:00+02:00",
  "1 Dec 2026 (day one)": "2026-12-01T18:00:00+02:00",
  "25 Dec 2026": "2026-12-25T18:00:00+02:00",
  "14 Mar 2027 (Gate 5)": "2027-03-14T18:00:00+02:00",
  "28 Mar 2027 (the Final)": "2027-03-28T18:00:00+02:00"
};

/* One of each view, with ids taken from the course itself. */
async function routes(page) {
  return page.evaluate(() => {
    const P = COURSE.PLAN, days = P.days, w1 = COURSE.weeks[0], wN = COURSE.weeks[COURSE.weeks.length - 1];
    const sundays = days.filter((d) => d.kind === "sunday").map((d) => d.cw);
    const out = ["today", "plan", "course", "admission", "floor", "labs", "journal", "tutor", "record", "record/tutor",
      "day/0", "day/" + Math.floor(days.length / 2), "day/" + (days.length - 1),
      "lesson/" + COURSE.ORIENTATION[0].id, "lesson/" + w1.L[0].id, "lesson/" + w1.L[0].id + "/x", "lesson/" + w1.L[0].id + "/d", "lesson/" + wN.L[2].id,
      "practical/" + w1.n, "practical/" + wN.n,
      "review/" + sundays[0], "review/" + sundays[sundays.length - 1]];
    Object.keys(COURSE.exams).forEach((id) => out.push("exam/" + id));
    return out;
  });
}

for (const [label, when] of Object.entries(DATES)) {
  test(`every view renders on ${label}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(when));
    await openApp(page);
    for (const r of await routes(page)) {
      await visit(page, r);
      await expect(page.locator("main h1").first(), r).not.toBeEmpty();
    }
  });
}

test("the countdown shows before 1 December", async ({ page }) => {
  await page.clock.setFixedTime(new Date(DATES["2 Oct 2026 (before the start)"]));
  await openApp(page);
  await expect(page.locator("main")).toContainText("Starts Tuesday 1 December 2026", { ignoreCase: true });
  await expect(page.locator("main h1").first()).toHaveText("60 days to go");
});

test("every lesson opens", async ({ page }) => {
  await page.clock.setFixedTime(new Date(DATES["1 Dec 2026 (day one)"]));
  await openApp(page);
  const ids = await page.evaluate(() => COURSE.ORIENTATION.map((l) => l.id).concat(...COURSE.weeks.map((w) => w.L.map((l) => l.id))));
  expect(ids.length).toBeGreaterThan(80);
  for (const id of ids) await visit(page, "lesson/" + id);
});

test("every plan day opens", async ({ page }) => {
  await page.clock.setFixedTime(new Date(DATES["25 Dec 2026"]));
  await openApp(page);
  const n = await page.evaluate(() => COURSE.PLAN.days.length);
  expect(n).toBe(121);
  for (let i = 0; i < n; i++) await visit(page, "day/" + i);
});
