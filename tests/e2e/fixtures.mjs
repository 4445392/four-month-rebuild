// Shared test setup: every test fails if the page logs a console error or throws.
// One exception: the browser itself logs "Failed to load resource" for an API reply like
// 401 or 429. The app handles those (the tutor tests check that it does), so they're ignored.
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  errors: [async ({ page }, use) => {
    const errors = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const url = m.location().url || "";
      if (url.startsWith("https://api.anthropic.com/") && m.text().startsWith("Failed to load resource")) return;
      errors.push(`console: ${m.text()} (${url || "?"})`);
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await use(errors);
    expect(errors, "console errors").toEqual([]);
  }, { auto: true }]
});
export { expect };

/* Open the app and wait until boot has finished (storage loaded, first render done). */
export async function openApp(page, hash = "#/today") {
  await page.goto("index.html" + hash);
  await page.waitForFunction(() => window.APP && APP.state && document.querySelector("main h1"));
}

/* Go to a route inside the running app and wait for it to render. */
export async function visit(page, route) {
  await page.evaluate((r) => { location.hash = "#/" + r; }, route);
  const [name, id = "", sub = ""] = route.split("/");
  await page.waitForFunction(([n, i, s]) => APP.view.name === n && (APP.view.params.id || "") === i && (APP.view.params.sub || "") === s && document.querySelector("main h1"), [name, id, sub]);
}
