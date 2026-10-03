// The tutor is free: it writes prompts for the Claude app and never calls a paid API.
import { test, expect, openApp, visit } from "./fixtures.mjs";

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // any request to Anthropic's API would mean the app can cost money: fail loudly
  page.__apiCalls = [];
  await page.route("https://api.anthropic.com/**", (route) => { page.__apiCalls.push(route.request().url()); route.abort(); });
});
test.afterEach(async ({ page }) => { expect(page.__apiCalls, "calls to the paid API").toEqual([]); });

const clipboard = async (page) => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"); // Windows clipboards use CRLF

test("Ask the tutor writes a briefing plus the question, ready for the Claude app", async ({ page }) => {
  await openApp(page);
  await visit(page, "lesson/o1/e");
  await page.locator("[data-act='tutorAsk'][data-preset='deeper']").click();
  await expect(page.locator("#drawer")).toBeVisible();
  await expect(page.locator("#t-ctx")).toHaveText("About: Lesson · The Bet");
  await expect(page.locator("#t-in")).toHaveValue(/Go deeper on this lesson/);
  await page.locator("[data-act='tutorMode'][data-m='socratic']").click();
  await page.fill("#t-in", "Why is a trade a bet?");
  await page.click("[data-act='tutorCopy']");
  await expect(page.locator("#toasts")).toContainText("paste it into the Claude app");
  const text = await clipboard(page);
  expect(text).toContain("Please be my tutor for this conversation.");
  expect(text).toContain("Mode — Socratic");
  expect(text).toContain("He is working on this Lesson 'The Bet'");
  expect(text).toContain("Never give trade signals");
  expect(text.trimEnd().endsWith("My first question: Why is a trade a bet?")).toBeTruthy();
  await expect(page.locator(".dnote a")).toHaveAttribute("href", "https://claude.ai/new");
  await page.keyboard.press("Escape");
  await expect(page.locator("#drawer")).toBeHidden();
});

test("explain-back: copy it for Claude to mark, then self-mark in the app", async ({ page }) => {
  await openApp(page);
  await visit(page, "lesson/o1/x");
  await expect(page.locator("[data-act='checkExplain']")).toHaveCount(0);
  const answer = "A trade is a bet that price moves my way, and every bet has a cost: the spread is paid first, before I can win anything.";
  await page.fill("#xb-o1", answer);
  await page.click("[data-act='copyExplain']");
  const text = await clipboard(page);
  expect(text).toContain(answer);
  expect(text).toContain("Verdict: RIGHT, PARTIAL or BROKE");
  expect(text).toContain("Key points a complete explanation covers:");

  await page.click("[data-act='selfMark']");
  await page.locator(".selfmark input[type=checkbox]").first().check();
  await page.click("[data-act='saveSelfMark']");
  expect(await page.evaluate(() => APP.state.lessons.o1.x && APP.state.lessons.o1.x.self)).toBe(true);
});

test("drills, the Sunday pre-review and tasks all go through the tutor drawer", async ({ page }) => {
  await openApp(page);
  await visit(page, "lesson/o1/d");
  await page.click("[data-act='copyDrills']");
  expect(await clipboard(page)).toContain("Write 3 NEW practice questions");

  await visit(page, "review/2");
  await page.click("[data-act='preReview']");
  await expect(page.locator("#t-ctx")).toContainText("Sunday review");
  await expect(page.locator("[data-act='tutorMode'][data-m='coach']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#t-in")).toHaveValue(/three probing questions/);
});

test("written gate answers: self-marked, then copied for an examiner's feedback", async ({ page }) => {
  await openApp(page);
  await visit(page, "exam/g3");
  await page.evaluate(() => ACT.startExam({ dataset: { id: "g3" } }));
  const box = page.locator("textarea[id^='wq-']").first();
  await box.fill("Risk 1% so a losing streak can't end the account; size from the stop distance.");
  await box.dispatchEvent("change");
  await page.click("#submitExamBtn");
  await expect(page.locator("[data-act='copyWritten']")).toBeVisible();
  await page.click("[data-act='copyWritten']");
  const text = await clipboard(page);
  expect(text).toContain("examiner's feedback");
  expect(text).toContain("Risk 1% so a losing streak");
  expect(text).toContain("Rubric:");
});

test("an API key saved by an earlier version is deleted on start-up", async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { PLATFORM.storage.set("rebuild.v3.ai", { key: "sk-ant-old" }); return PLATFORM.storage.flush(); });
  await page.reload();
  await page.waitForFunction(() => window.APP && APP.state);
  await page.evaluate(() => PLATFORM.storage.flush());
  const left = await page.evaluate(() => new Promise((res) => {
    const r = indexedDB.open("four-month-rebuild");
    r.onsuccess = () => { const g = r.result.transaction("kv").objectStore("kv").get("rebuild.v3.ai"); g.onsuccess = () => { r.result.close(); res(g.result === undefined); }; };
  }));
  expect(left).toBe(true);
  await visit(page, "record");
  await expect(page.locator("main")).not.toContainText("API key");
});

test("Copy for Claude puts the lesson and how he learns on the clipboard", async ({ page }) => {
  await openApp(page);
  await visit(page, "lesson/o1");
  await page.locator("[data-act='copyForClaude']").first().click();
  await expect(page.locator("#toasts")).toContainText("Copied — paste it into the Claude app");
  const text = await clipboard(page);
  expect(text).toContain("The Four-Month Rebuild");
  expect(text).toContain("Never give me trade signals");
  expect(text).toContain("Here is the lesson I'm on:\nLesson 'The Bet'");
  expect(text.trimEnd().endsWith("My question:")).toBeTruthy();
});
