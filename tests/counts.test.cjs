const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const E = require("../episodes/01/engine.js");
const n = (u, f) => E.readable(u, f).length;
test("顧客は240件", () => assert.equal(Object.keys(E.customers).length, 240));
test("件数は対策で 240 → 1 → 0、佐藤は 240 → 2 と変わる", () => {
  assert.deepEqual([n("tanaka", {}), n("sato", {})], [240, 240]);
  assert.deepEqual([n("tanaka", { owner: true }), n("sato", { owner: true })], [1, 2]);
  assert.deepEqual([n("tanaka", { stop: true }), n("sato", { stop: true })], [0, 240]);
  assert.deepEqual([n("tanaka", { stop: true, owner: true }), n("sato", { stop: true, owner: true })], [0, 2]);
});
test("教材の中のURLは .example だけで、通信の命令がない", () => {
  const dir = path.join(__dirname, "../episodes/01");
  const t = fs.readFileSync(path.join(dir, "app.js"), "utf8") + fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\/[a-z]/.test(t));
});
test("会社名は、つむぎや株式会社", () => {
  const root = path.join(__dirname, "..");
  const files = ["README.md", "計画.md", "episodes/01/index.html", "episodes/01/deep.html"];
  files.forEach((f) => {
    const t = fs.readFileSync(path.join(root, f), "utf8");
    assert.ok(t.includes("つむぎや株式会社"), f);
    assert.ok(!/[^つむぎ]や株式会社/.test(t.replaceAll("つむぎや株式会社", "")), f);
  });
});
