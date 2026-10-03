// The installable app: manifest, service worker, and working with no connection.
import { test, expect, openApp, visit } from "./fixtures.mjs";

test.use({ serviceWorkers: "allow" });

test("the manifest is valid and its icons load", async ({ page, request }) => {
  const res = await request.get("manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m).toMatchObject({ name: "The Four-Month Rebuild", short_name: "Rebuild", start_url: "./", scope: "./", display: "standalone" });
  expect(m.icons.some((i) => i.purpose === "maskable" && i.sizes === "512x512")).toBeTruthy();
  for (const icon of m.icons) expect((await request.get(icon.src)).ok(), icon.src).toBeTruthy();
});

test("after one visit the app works offline", async ({ page, context }) => {
  await openApp(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await expect(page.locator("#update-toast"), "no 'Update ready' on the first install").toHaveCount(0);

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.APP && APP.state && document.querySelector("main h1"));
  for (const r of ["plan", "lesson/o1", "floor", "labs", "record"]) await visit(page, r);
  await expect(page.locator("main h1").first()).toHaveText("Your Record");
  await context.setOffline(false);
});
