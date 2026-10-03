/* ============================================================
   AI (Anthropic) — the tutor's sampler on the student's own API
   key, calling the Messages API straight from the browser with
   fetch (no SDK: the app has no build step and ships no CDN code).
   Implements the sampler contract in CLAUDE.md:
     sample(turns, {onText, signal, tools, system}) → {text, truncated}
     sample.json(prompt, opts) → parsed JSON
     sample.limits() → {tools: true}
   Errors reject with {code, message, text?} using the codes that
   TUTOR.errorText understands.
   Settings (key, model, monthly usage) live in PLATFORM.storage
   under "rebuild.v3.ai" — on this device only, never in backups.
   ============================================================ */
(function () {
  "use strict";
  const API = "https://api.anthropic.com/v1/";
  const KEY = "rebuild.v3.ai";
  /* $ per million tokens: input, output, cache write (5-minute), cache read. Used only for the "about $" estimate. */
  const MODELS = [
    { id: "claude-opus-5-5", name: "Claude Opus 5.5", note: "the best teacher", price: [4, 20, 5, 0.2], effort: true, fallbacks: true },
    { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", note: "quicker, half the price", price: [2, 10, 2.5, 0.2], effort: true, fallbacks: true },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", note: "cheapest, simpler answers", price: [1, 5, 1.25, 0.1], effort: false, fallbacks: false }
  ];
  /* models a refused request can be re-run on server-side (fallbacks: "default") */
  const OTHER_PRICES = { "claude-opus-4-8": [5, 25, 6.25, 0.5], "claude-opus-5": [5, 25, 6.25, 0.5] };
  const DEFAULT_MODEL = "claude-opus-5-5";
  const MAX_TOOL_ROUNDS = 8;

  const modelInfo = function (id) { return MODELS.filter(function (m) { return m.id === id; })[0] || null; };
  const priceOf = function (id) { const m = modelInfo(id); return m ? m.price : OTHER_PRICES[id] || MODELS[0].price; };
  const settings = function () { return PLATFORM.storage.get(KEY, {}) || {}; };
  const saveSettings = function (s) { PLATFORM.storage.set(KEY, s); };
  const month = function () { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() < 9 ? "0" : "") + (d.getMonth() + 1); };

  function headers(key, beta) {
    const h = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
    if (beta) h["anthropic-beta"] = beta;
    return h;
  }

  /* ---------- errors → the tutor's codes ---------- */
  function apiError(status, body, text) {
    const t = body && body.error && body.error.type, msg = (body && body.error && body.error.message) || "";
    let code = "api_error";
    if (status === 401 || t === "authentication_error") code = "bad_key";
    else if (status === 402 || t === "billing_error") code = "billing";
    else if (status === 403 || t === "permission_error") code = "forbidden";
    else if (status === 404 || t === "not_found_error") code = "model_unavailable";
    else if (status === 413 || t === "request_too_large" || /prompt is too long/i.test(msg)) code = "prompt_too_large";
    else if (status === 429 || t === "rate_limit_error") code = "rate_limited";
    else if (status === 529 || t === "overloaded_error" || status >= 500 || t === "api_error") code = "overloaded";
    else if (status === 400 || t === "invalid_request_error") code = "bad_request";
    const e = { code: code, status: status, message: msg || ("HTTP " + status) };
    if (text) e.text = text;
    return e;
  }
  function wrap(err, text) {
    if (err && err.name === "AbortError") return { code: "cancelled", message: "Stopped.", text: text }; // DOMException: its numeric .code isn't ours
    if (err && typeof err.code === "string") { if (text && !err.text) err.text = text; return err; }
    return { code: "offline", message: String(err && err.message || err), text: text }; // fetch TypeError: no connection
  }

  /* ---------- usage bookkeeping (from the API's own numbers) ---------- */
  function record(model, u) {
    if (!u) return;
    const s = settings(), m = month();
    s.usage = s.usage || {};
    const mon = s.usage[m] = s.usage[m] || {};
    const add = function (id, x) {
      const r = mon[id] = mon[id] || { req: 0, in: 0, out: 0, cw: 0, cr: 0 };
      r.req += 1; r.in += x.input_tokens || 0; r.out += x.output_tokens || 0;
      r.cw += x.cache_creation_input_tokens || 0; r.cr += x.cache_read_input_tokens || 0;
    };
    if (Array.isArray(u.iterations) && u.iterations.length) u.iterations.forEach(function (it) { add(it.model || model, it); });
    else add(model, u);
    saveSettings(s);
  }
  function cost(id, r) { const p = priceOf(id); return (r.in * p[0] + r.out * p[1] + r.cw * p[2] + r.cr * p[3]) / 1e6; }

  /* ---------- one streamed request ---------- */
  async function stream(cfg, body, onDelta) {
    const info = modelInfo(body.model);
    const beta = info && info.fallbacks ? "server-side-fallback-2026-07-01" : "";
    if (beta) body.fallbacks = "default"; // a classifier refusal is re-run on Anthropic's recommended model
    body.stream = true;
    const res = await fetch(API + "messages", { method: "POST", headers: headers(cfg.key, beta), body: JSON.stringify(body), signal: cfg.signal });
    if (!res.ok) { let j = null; try { j = await res.json(); } catch (e) { /* not JSON */ } throw apiError(res.status, j); }

    const blocks = [], partial = {};
    let model = body.model, usage = {}, stop = null, stopDetails = null, buf = "";
    const reader = res.body.getReader(), dec = new TextDecoder();
    const handle = function (ev) {
      switch (ev.type) {
        case "message_start":
          model = ev.message.model || model; usage = Object.assign({}, ev.message.usage || {}); break;
        case "content_block_start":
          blocks[ev.index] = Object.assign({}, ev.content_block);
          if (ev.content_block.type === "tool_use") partial[ev.index] = "";
          break;
        case "content_block_delta": {
          const b = blocks[ev.index], d = ev.delta;
          if (d.type === "text_delta") { b.text = (b.text || "") + d.text; onDelta(d.text); }
          else if (d.type === "input_json_delta") partial[ev.index] += d.partial_json;
          else if (d.type === "thinking_delta") b.thinking = (b.thinking || "") + d.thinking;
          else if (d.type === "signature_delta") b.signature = (b.signature || "") + d.signature;
          break;
        }
        case "content_block_stop":
          if (ev.index in partial) {
            const raw = partial[ev.index];
            try { blocks[ev.index].input = raw ? JSON.parse(raw) : {}; } catch (e) { blocks[ev.index].input = {}; blocks[ev.index].badInput = true; }
            delete partial[ev.index];
          }
          break;
        case "message_delta":
          if (ev.delta) { stop = ev.delta.stop_reason || stop; stopDetails = ev.delta.stop_details || stopDetails; }
          if (ev.usage) Object.keys(ev.usage).forEach(function (k) { if (ev.usage[k] !== null && ev.usage[k] !== undefined) usage[k] = ev.usage[k]; });
          break;
        case "error":
          throw apiError(0, ev);
      }
    };
    try {
      for (;;) {
        const r = await reader.read();
        if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        let cut;
        while ((cut = buf.search(/\r?\n\r?\n/)) >= 0) {
          const chunk = buf.slice(0, cut); buf = buf.slice(cut).replace(/^\r?\n\r?\n/, "");
          const data = chunk.split(/\r?\n/).filter(function (l) { return l.indexOf("data:") === 0; }).map(function (l) { return l.slice(5).trim(); }).join("\n");
          if (data) handle(JSON.parse(data));
        }
      }
    } finally { record(model, usage); }
    return { blocks: blocks.filter(Boolean), stop: stop, stopDetails: stopDetails, model: model };
  }

  /* Echo an assistant turn back for the next tool round: unchanged, except that after a
     server-side fallback the blocks before the last `fallback` marker that the new model
     can't use (thinking, tool calls, unknown internal blocks) are left out. */
  function echo(blocks) {
    let cut = -1;
    blocks.forEach(function (b, i) { if (b.type === "fallback") cut = i; });
    return blocks.filter(function (b, i) {
      if (i > cut) return true;
      return b.type === "text";
    });
  }

  function toApiTools(tools) {
    return (tools || []).map(function (t) {
      return { name: t.name, description: t.description || "", input_schema: t.inputSchema || { type: "object", properties: {} }, eager_input_streaming: true };
    });
  }
  /* Inputs stream unvalidated (eager_input_streaming), so check them against the schema before running. */
  function validInput(tool, input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return false;
    const s = tool.inputSchema || {}, props = s.properties || {};
    return (s.required || []).every(function (k) { return input[k] !== undefined && (!props[k] || !props[k].type || typeof input[k] === props[k].type); });
  }
  /* Consecutive turns with the same role become one message (the tutor's history can start with two user turns). */
  function toMessages(turns) {
    const out = [];
    turns.forEach(function (t) {
      const role = t.role === "assistant" ? "assistant" : "user", text = String(t.content || "");
      if (!text.trim()) return;
      const last = out[out.length - 1];
      if (last && last.role === role) last.content += "\n\n" + text;
      else out.push({ role: role, content: text });
    });
    if (out.length && out[0].role !== "user") out.unshift({ role: "user", content: "(continuing)" });
    return out;
  }

  function create(cfg) {
    async function run(messages, opts, maxTokens) {
      opts = opts || {};
      const info = modelInfo(cfg.model);
      const tools = opts.tools && opts.tools.length ? opts.tools : null;
      const body = { model: cfg.model, max_tokens: maxTokens, messages: messages, cache_control: { type: "ephemeral" } };
      if (opts.system) body.system = opts.system;
      if (info && info.effort) body.output_config = { effort: opts.effort || "medium" };
      if (tools) body.tools = toApiTools(tools);
      let text = "";
      const onDelta = function (d) { text += d; if (opts.onText) opts.onText({ text: text, delta: d }); };
      const call = Object.assign({}, cfg, { signal: opts.signal });
      try {
        for (let round = 0; ; round++) {
          const r = await stream(call, Object.assign({}, body, { messages: messages.slice() }), onDelta);
          if (r.stop === "refusal") throw { code: "refused", message: (r.stopDetails && r.stopDetails.explanation) || "The model declined.", text: text };
          const calls = r.blocks.filter(function (b) { return b.type === "tool_use"; });
          if (r.stop !== "tool_use" || !calls.length || !tools || round >= MAX_TOOL_ROUNDS) return { text: text, truncated: r.stop === "max_tokens" };
          const kept = echo(r.blocks);
          messages.push({ role: "assistant", content: kept.map(function (b) { const c = Object.assign({}, b); delete c.badInput; return c; }) });
          const results = await Promise.all(kept.filter(function (b) { return b.type === "tool_use"; }).map(async function (b) {
            const tool = tools.filter(function (t) { return t.name === b.name; })[0];
            try {
              if (!tool) throw new Error("Unknown tool: " + b.name);
              if (b.badInput || !validInput(tool, b.input)) throw new Error("INVALID_JSON: the input didn't match the tool's schema");
              const out = await tool.execute(b.input);
              return { type: "tool_result", tool_use_id: b.id, content: typeof out === "string" ? out : JSON.stringify(out) };
            } catch (e) { return { type: "tool_result", tool_use_id: b.id, content: String(e && e.message || e), is_error: true }; }
          }));
          messages.push({ role: "user", content: results });
          if (text && !/\n\n$/.test(text)) onDelta("\n\n");
        }
      } catch (e) { throw wrap(e, text); }
    }
    const sample = function (turns, opts) { return run(toMessages(turns), opts, 32000); };
    sample.json = async function (prompt, opts) {
      const r = await run([{ role: "user", content: String(prompt) }], { signal: opts && opts.signal, system: "Reply with the JSON only — no prose and no code fences." }, 16000);
      return parseJSON(r.text);
    };
    sample.limits = function () { return Promise.resolve({ tools: true }); };
    sample.model = cfg.model;
    return sample;
  }
  function parseJSON(text) {
    const t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    try { return JSON.parse(t); } catch (e) { /* look for the outermost object or array */ }
    const a = t.search(/[[{]/), z = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (a >= 0 && z > a) { try { return JSON.parse(t.slice(a, z + 1)); } catch (e) { /* fall through */ } }
    throw { code: "invalid_json", message: "Couldn't read the tutor's answer as JSON.", text: text };
  }

  /* ---------- the public face ---------- */
  window.AI_ANTHROPIC = {
    MODELS: MODELS,
    DEFAULT_MODEL: DEFAULT_MODEL,
    settings: settings,
    hasKey: function () { return !!settings().key; },
    model: function () { const m = settings().model; return modelInfo(m) ? m : DEFAULT_MODEL; },
    /* the sampler for PLATFORM.ai, or null without a key */
    fromSettings: function () { const s = settings(); return s.key ? create({ key: s.key, model: modelInfo(s.model) ? s.model : DEFAULT_MODEL }) : null; },
    setKey: function (key) { const s = settings(); if (key) s.key = key; else delete s.key; saveSettings(s); return PLATFORM.storage.flush(); },
    setModel: function (id) { const s = settings(); s.model = modelInfo(id) ? id : DEFAULT_MODEL; saveSettings(s); },
    masked: function () { const k = settings().key || ""; return k ? k.slice(0, 7) + "…" + k.slice(-4) : ""; },
    /* Free check: asks for the chosen model's details. 200 → the key works and can use that model. */
    test: async function (key, model) {
      try {
        const res = await fetch(API + "models/" + encodeURIComponent(model || DEFAULT_MODEL), { headers: headers(key) });
        if (res.ok) return { ok: true };
        let j = null; try { j = await res.json(); } catch (e) { /* not JSON */ }
        return { ok: false, error: apiError(res.status, j) };
      } catch (e) { return { ok: false, error: wrap(e) }; }
    },
    /* this month's usage: [{id, name, req, in, out, cw, cr, cost}] and the total cost */
    monthUsage: function () {
      const mon = ((settings().usage || {})[month()]) || {};
      const rows = Object.keys(mon).map(function (id) { const r = mon[id], mi = modelInfo(id); return Object.assign({ id: id, name: mi ? mi.name : id, cost: cost(id, r) }, r); });
      return { month: month(), rows: rows, cost: rows.reduce(function (a, r) { return a + r.cost; }, 0) };
    },
    _parseJSON: parseJSON, _toMessages: toMessages, _echo: echo
  };
})();
