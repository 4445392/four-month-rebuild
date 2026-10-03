// The tutor client's pure helpers (the streaming and tool loop are tested in the browser, tests/e2e/tutor.spec.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load.mjs";

const { AI_ANTHROPIC: AI } = load(["platform.js", "ai-anthropic.js"]);
const plain = (v) => JSON.parse(JSON.stringify(v)); // objects from the sandbox have another realm's prototypes

test("parseJSON reads bare JSON, fenced JSON and JSON with chatter around it", () => {
  assert.deepEqual(plain(AI._parseJSON('{"verdict":"RIGHT"}')), { verdict: "RIGHT" });
  assert.deepEqual(plain(AI._parseJSON('```json\n{"a":1}\n```')), { a: 1 });
  assert.deepEqual(plain(AI._parseJSON('Here you go: [1,2,3] — done')), [1, 2, 3]);
  assert.throws(() => AI._parseJSON("no json here"), (e) => e.code === "invalid_json");
});

test("toMessages merges same-role turns, drops empty ones and starts with the user", () => {
  const m = plain(AI._toMessages([
    { role: "user", content: "rules" }, { role: "user", content: "question" },
    { role: "assistant", content: "" }, { role: "assistant", content: "answer" }
  ]));
  assert.deepEqual(m, [{ role: "user", content: "rules\n\nquestion" }, { role: "assistant", content: "answer" }]);
  assert.equal(plain(AI._toMessages([{ role: "assistant", content: "hi" }]))[0].role, "user");
});

test("echo keeps a turn unchanged, or keeps only text before a server-side fallback", () => {
  const turn = [{ type: "thinking", thinking: "", signature: "s" }, { type: "text", text: "a" }, { type: "tool_use", id: "t", name: "x", input: {} }];
  assert.deepEqual(plain(AI._echo(turn)), turn);
  const fell = [{ type: "thinking", signature: "s1" }, { type: "text", text: "partial" }, { type: "tool_use", id: "t1" },
    { type: "fallback", from: { model: "a" }, to: { model: "b" } }, { type: "thinking", signature: "s2" }, { type: "tool_use", id: "t2" }];
  // before the last fallback marker only text survives (and the marker goes); after it, everything echoes
  assert.deepEqual(plain(AI._echo(fell)).map((b) => b.type + ":" + (b.text || b.signature || b.id)), ["text:partial", "thinking:s2", "tool_use:t2"]);
});

test("model list: Opus 5.5 is the default and every model has a price", () => {
  assert.equal(AI.DEFAULT_MODEL, "claude-opus-5-5");
  for (const m of AI.MODELS) assert.equal(m.price.length, 4, m.id);
  assert.equal(AI.fromSettings(), null, "no key → no sampler");
});
