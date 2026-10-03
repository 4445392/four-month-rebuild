// Browser tests. Locally they use the installed Microsoft Edge (no browser download);
// on GitHub Actions they use Playwright's Chromium (`npx playwright install chromium`).
import { defineConfig } from "@playwright/test";

const PORT = 4173;
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/`,
    channel: process.env.CI ? undefined : process.env.PW_CHANNEL || "msedge",
    timezoneId: "Africa/Johannesburg",
    locale: "en-ZA",
    serviceWorkers: "block", // the PWA spec turns it back on
    trace: "retain-on-failure"
  },
  webServer: {
    command: `node tools/serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI
  }
});
