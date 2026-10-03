// Accessibility and mobile: axe-core (WCAG 2.2 AA) on every kind of page in light and dark,
// on a laptop and a phone; no sideways scrolling on a phone; the theme switch; keyboard basics.
import { AxeBuilder } from "@axe-core/playwright";
import { test, expect, openApp, visit } from "./fixtures.mjs";

const PAGES = ["today", "plan", "course", "lesson/o1", "lesson/o1/x", "practical/1", "review/2", "exam/g1", "floor", "labs", "journal", "tutor", "record", "admission", "day/0"];
const VIEWPORTS = { laptop: { width: 1280, height: 800 }, phone: { width: 375, height: 812 } };

for (const scheme of ["light", "dark"]) {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${scheme}, ${name}`, () => {
      test.use({ colorScheme: scheme, viewport });
      test("no WCAG 2.2 AA violations and no sideways scrolling", async ({ page }) => {
        test.setTimeout(240_000); // 15 pages × an axe scan each
        await page.clock.setFixedTime(new Date("2026-12-01T18:00:00+02:00"));
        await openApp(page);
        const problems = [];
        for (const r of PAGES) {
          await visit(page, r);
          const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
          for (const v of res.violations) problems.push(`${r}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          if (overflow > 0) problems.push(`${r}: scrolls sideways by ${overflow}px`);
        }
        expect(problems).toEqual([]);
      });
    });
  }
}

test("the theme switch overrides the device and survives a reload", async ({ page }) => {
  await openApp(page, "#/record");
  const theme = () => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  expect(await theme()).toBeNull();
  await page.click("[data-act='setTheme'][data-v='dark']");
  expect(await theme()).toBe("dark");
  await expect(page.locator("[data-act='setTheme'][data-v='dark']")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.waitForFunction(() => window.APP && APP.state);
  expect(await theme()).toBe("dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(14, 20, 26)"); // --ground in dark
  await page.click("[data-act='setTheme'][data-v='system']");
  expect(await theme()).toBeNull();
});

test("keyboard: the skip link is first, and navigation moves focus to the page", async ({ page }) => {
  await openApp(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await visit(page, "plan");
  await expect(page.locator("#main")).toBeFocused();
});
