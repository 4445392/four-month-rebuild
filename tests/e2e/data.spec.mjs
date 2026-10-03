// Your data: download a backup, start from empty storage, restore it — and restore an old claude.ai export.
import { writeFileSync } from "node:fs";
import { test, expect, openApp, visit } from "./fixtures.mjs";

async function seed(page) {
  await page.evaluate(() => {
    APP.state.name = "Round Trip";
    APP.state.lessons.o1 = { done: Date.now(), x: "right" };
    APP.state.reviews.c2 = { right: "showed up", wrong: "late twice", done: Date.now() };
    STORE.commit(true);
    STORE.saveTrade({ id: "tr-1", src: "bt", pair: "EURUSD", dir: "L", entry: 1.1, stop: 1.095, exit: 1.11, R: 2, rules: "Y", date: "2026-12-02" });
    STORE.saveWriting({ id: "x-o1", text: "A trade is a bet with a known cost." });
    STORE.saveThread({ id: "th-1", ctx: "today", mode: "explain", title: "Test", msgs: [{ r: "u", t: "hi" }], at: Date.now() });
    return PLATFORM.storage.flush();
  });
}
const snapshot = (page) => page.evaluate(() => ({
  name: APP.state.name, o1: !!(APP.state.lessons.o1 && APP.state.lessons.o1.done), review: APP.state.reviews.c2 && APP.state.reviews.c2.wrong,
  trades: Object.keys(APP.trades), writing: Object.keys(APP.writing), threads: Object.keys(APP.threads), backend: PLATFORM.storage.backend()
}));

test("download → clear site data → restore brings everything back", async ({ page, browser }, info) => {
  await openApp(page, "#/record");
  await seed(page);
  const before = await snapshot(page);
  expect(before.backend).toBe("indexeddb");

  const [download] = await Promise.all([page.waitForEvent("download"), page.click("[data-act='exportData']")]);
  expect(download.suggestedFilename()).toMatch(/^four-month-rebuild-\d{4}-\d{2}-\d{2}\.json$/);
  const file = info.outputPath("backup.json");
  await download.saveAs(file);
  await expect(page.locator("main")).toContainText(/Last backup: .*today/);

  // a fresh context is a browser with no site data
  const fresh = await browser.newContext({ serviceWorkers: "block" });
  const p2 = await fresh.newPage();
  const errors = [];
  p2.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await openApp(p2, "#/record");
  expect((await snapshot(p2)).trades).toEqual([]);

  const [chooser] = await Promise.all([p2.waitForEvent("filechooser"), p2.click("[data-act='restoreData']")]);
  await chooser.setFiles(file);
  const box = p2.locator("#restore-confirm");
  await expect(box).toContainText("Trades");
  await expect(box).toContainText("replaces everything on this device");
  await p2.click("[data-act='restoreConfirm']");
  await expect(p2.locator("#toasts")).toContainText("Backup restored.");

  await p2.reload();
  await p2.waitForFunction(() => window.APP && APP.state && document.querySelector("main h1"));
  const after = await snapshot(p2);
  expect(after).toEqual(before);
  expect(errors).toEqual([]);
  await fresh.close();
});

test("an old claude.ai export ({exported, state, trades, writing}) restores", async ({ page }, info) => {
  const file = info.outputPath("claude-ai-export.json");
  writeFileSync(file, JSON.stringify({
    exported: "2026-11-20T10:00:00.000Z",
    state: { v: 4, plan: "old-artifact-plan", name: "Sfundo", lessons: { o1: { done: 1763632800000 } }, exams: { g1: { attempts: 1, best: 72 } } },
    trades: { a: { id: "a", src: "bt", R: 1.5 } },
    writing: { "x-o1": { id: "x-o1", text: "old answer" } }
  }));
  await openApp(page, "#/record");
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("[data-act='restoreData']")]);
  await chooser.setFiles(file);
  await expect(page.locator("#restore-confirm")).toContainText("Gates attempted");
  await page.click("[data-act='restoreConfirm']");
  await expect(page.locator("#toasts")).toContainText("Backup restored.");
  const s = await page.evaluate(() => ({ plan: APP.state.plan, o1: !!APP.state.lessons.o1.done, best: APP.state.exams.g1.best, trades: Object.keys(APP.trades), threads: Object.keys(APP.threads) }));
  expect(s).toEqual({ plan: await page.evaluate(() => COURSE.PLAN.id), o1: true, best: 72, trades: ["a"], threads: [] });
});

test("a file that isn't a backup is refused and changes nothing", async ({ page }, info) => {
  const file = info.outputPath("not-a-backup.json");
  writeFileSync(file, JSON.stringify({ hello: "world" }));
  await openApp(page, "#/record");
  await seed(page);
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.click("[data-act='restoreData']")]);
  await chooser.setFiles(file);
  await expect(page.locator("#toasts")).toContainText("doesn't contain any course progress");
  await expect(page.locator("#restore-confirm")).toHaveCount(0);
  expect((await snapshot(page)).trades).toEqual(["tr-1"]);
});

test("the Sunday review offers this week's backup", async ({ page }) => {
  await openApp(page);
  await visit(page, "review/2");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("[data-act='weekBackup']")]);
  expect(download.suggestedFilename()).toMatch(/^four-month-rebuild-week-2-/);
});

test("the plan downloads as a calendar at the chosen time", async ({ page }) => {
  await openApp(page);
  await visit(page, "plan");
  await page.fill("#cal-time", "07:00");
  await page.dispatchEvent("#cal-time", "change");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("[data-act='calExport']")]);
  expect(download.suggestedFilename()).toBe("four-month-rebuild-plan.ics");
  const text = await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
  expect(text.split("BEGIN:VEVENT").length - 1).toBe(121);
  expect(text).toContain("DTSTART:20261201T050000Z");
  expect(await page.evaluate(() => APP.state.settings.studyTime)).toBe("07:00");
});
