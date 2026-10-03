// The tutor against a stand-in for the Anthropic API (no real key, no cost).
import { test, expect, openApp, visit } from "./fixtures.mjs";

const sse = (events) => events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
const reply = (text, usage = { input_tokens: 1000, output_tokens: 1, cache_read_input_tokens: 800 }) => sse([
  { type: "message_start", message: { model: "claude-opus-5-5", usage } },
  { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } },
  { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "sig" } },
  { type: "content_block_stop", index: 0 },
  { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
  ...text.match(/.{1,12}/gs).map((t) => ({ type: "content_block_delta", index: 1, delta: { type: "text_delta", text: t } })),
  { type: "content_block_stop", index: 1 },
  { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 50 } },
  { type: "message_stop" }
]);

async function fakeApi(page, answers) {
  const seen = [];
  await page.route("https://api.anthropic.com/v1/models/**", (route) => {
    const ok = route.request().headers()["x-api-key"] === "sk-ant-test-key";
    route.fulfill(ok ? { status: 200, json: { id: "claude-opus-5-5", type: "model" } } : { status: 401, json: { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } } });
  });
  await page.route("https://api.anthropic.com/v1/messages", (route) => {
    seen.push({ headers: route.request().headers(), body: route.request().postDataJSON() });
    route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: reply(answers.shift() || "ok") });
  });
  return seen;
}

test("add a key, get explain-back feedback and a streamed answer, then remove the key", async ({ page }) => {
  const seen = await fakeApi(page, [
    JSON.stringify({ verdict: "PARTIAL", score: 3, right: ["calls it a bet"], broke: "leaves out the cost", fix: "Every trade pays the spread first.", followUp: "Who receives the spread?" }),
    "Expectancy is the **average R per trade**. Check: what is 0.3 × 3 − 0.7 × 1?"
  ]);
  await openApp(page, "#/record/tutor");

  // a wrong key is rejected and not saved
  await page.fill("#ai-key", "sk-ant-wrong");
  await page.click("[data-act='aiSave']");
  await expect(page.locator("#toasts")).toContainText("Your API key was rejected");
  expect(await page.evaluate(() => AI_ANTHROPIC.hasKey())).toBe(false);

  await page.fill("#ai-key", "sk-ant-test-key");
  await page.click("[data-act='aiSave']");
  await expect(page.locator("#toasts")).toContainText("Key works — the tutor is on.");
  await expect(page.locator("#tutor-settings")).toContainText("sk-ant-…-key");

  // explain-back marked by the tutor
  await visit(page, "lesson/o1/x");
  await page.fill("#xb-o1", "A trade is a bet that the price will move my way.");
  await page.click("[data-act='checkExplain']");
  await expect(page.locator("#xfb-o1")).toContainText("PARTIAL");
  await expect(page.locator("#xfb-o1")).toContainText("leaves out the cost");

  // the request carried the browser-access header, the API version and the right body
  const req = seen[0];
  expect(req.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
  expect(req.headers["anthropic-version"]).toBe("2023-06-01");
  expect(req.headers["x-api-key"]).toBe("sk-ant-test-key");
  expect(req.body).toMatchObject({ model: "claude-opus-5-5", stream: true, fallbacks: "default", output_config: { effort: "medium" } });
  expect(req.body.thinking).toBeUndefined();

  // a streamed answer in the drawer
  await page.evaluate(() => TUTOR.open({ fresh: true, ctx: "today" }));
  await page.fill("#t-in", "What is expectancy?");
  await page.press("#t-in", "Enter");
  await expect(page.locator("#t-msgs")).toContainText("average R per trade");
  expect(seen[1].body.system).toContain("You are the Tutor");
  await page.click("[data-act='tutorClose']");

  // usage is counted
  await visit(page, "record");
  await expect(page.locator("#tutor-settings")).toContainText("Claude Opus 5.5");
  await expect(page.locator("#tutor-settings")).toContainText("about $");

  // removing the key breaks nothing
  await page.click("[data-act='aiRemove']");
  await page.click("[data-act='aiRemove']");
  await expect(page.locator("#toasts")).toContainText("Key removed");
  await visit(page, "lesson/o1/x");
  await expect(page.locator("main")).toContainText("Add your key in Settings");
  await expect(page.locator("[data-act='checkExplain']")).toHaveCount(0);
  await visit(page, "tutor");
  await expect(page.locator("main")).toContainText("runs on your own Anthropic API key");
});

test("Copy for Claude puts the lesson and how he learns on the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openApp(page);
  await visit(page, "lesson/o1");
  await page.locator("[data-act='copyForClaude']").first().click();
  await expect(page.locator("#toasts")).toContainText("Copied — paste it into the Claude app");
  const text = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"); // Windows clipboards use CRLF
  expect(text).toContain("The Four-Month Rebuild");
  expect(text).toContain("Never give me trade signals");
  expect(text).toContain("Here is the lesson I'm on:\nLesson 'The Bet'");
  expect(text.trimEnd().endsWith("My question:")).toBeTruthy();

  // without a key, the tutor drawer offers the same
  await page.evaluate(() => TUTOR.open({ fresh: true, ctx: "lesson:o1" }));
  await expect(page.locator("#t-msgs [data-act='copyForClaude']")).toBeVisible();
});
