const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const E = require("../episodes/02/engine.js");
const R = ["none", "all", "own"];
const all = [false, true].flatMap((rls) => R.flatMap((read) => R.map((write) => ({ rls, read, write }))));
test("第2話 全18通り: 安全なのは、制限が有効で両方とも本人だけのときに限る", () =>
  all.forEach((s) => assert.equal(E.safe(s), s.rls && s.read === "own" && s.write === "own")));
test("第2話 制限が切れていれば、決まりに関係なく180件", () =>
  all.filter((s) => !s.rls).forEach((s) => assert.deepEqual(Object.values(E.result(s)), [180, 180, 180, 180])));
test("第2話 有効で決まりがなければ、本人も0件", () =>
  assert.deepEqual(Object.values(E.result({ rls: true, read: "none", write: "none" })), [0, 0, 0, 0]));
const src = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
test("指示は1文30字まで、説明は2文まで・1文45字まで", () => ["episodes/01/app.js", "episodes/02/app.js"].forEach((f) => {
  const m = [...src(f).matchAll(/say\("([^"]+)", "([^"]+)"\)/g)];
  assert.equal(m.length, 5, f);
  m.forEach(([, a, b]) => {
    assert.ok(a.length <= 30, a);
    const s = b.split("。").filter(Boolean);
    assert.ok(s.length <= 2, b);
    s.forEach((x) => assert.ok(x.length <= 45, x));
  });
}));
test("第2話 通信の命令がなく、URLは .example だけ。会社名が正しい", () => {
  const t = src("episodes/02/app.js") + src("episodes/kit.js");
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage/.test(t));
  [...t.matchAll(/https?:\/\/([a-z.]+)/g)].forEach((m) => assert.ok(m[1].endsWith(".example"), m[1]));
  ["index.html", "episodes/02/index.html"].forEach((f) => assert.ok(src(f).includes("つむぎや株式会社"), f));
});
test("第2話の画面で「鍵」という言葉を使わない。接続コードは最初の場面で説明する", () => {
  const app = src("episodes/02/app.js");
  assert.ok(!(app + src("episodes/02/index.html")).includes("鍵"));
  assert.ok(app.indexOf("どのシステムからの頼みか") > 0 && app.indexOf("どのシステムからの頼みか") < app.indexOf("予約を全部読む"));
});
