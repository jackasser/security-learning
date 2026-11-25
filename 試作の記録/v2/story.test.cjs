const test = require("node:test");
const assert = require("node:assert");
const S = require("../episodes/01/story.js");
const E = require("../episodes/01/engine.js");
const sentences = (t) => t.split("。").filter(Boolean);
test("本文は2文まで、1文は40字まで", () => S.forEach((s) => {
  [s.text, s.after].filter(Boolean).forEach((t) => {
    assert.ok(sentences(t).length <= 2, t);
    sentences(t).forEach((x) => assert.ok(x.length <= 40, x));
  });
}));
test("画面は7つまで", () => assert.ok(S.length <= 7));
test("サーバーという言葉は、6画面目より前に出さない", () =>
  assert.ok(!JSON.stringify(S.slice(0, 5)).includes("サーバー")));
test("各画面の結果が、お話のとおりになる", () =>
  assert.deepEqual(S.filter((s) => s.kind === "ask").map((s) => E.decide({ user: s.who, id: s.id }, s.fixes).ok),
    [true, true, false, true, false]));
test("一度に増やす確認は1つだけ", () => {
  const n = S.filter((s) => s.kind === "ask").map((s) => Object.keys(s.fixes || {}).length);
  n.slice(1).forEach((x, i) => assert.ok(x - n[i] <= 1));
});
test("最後の確認を入れても、101番は見られる", () =>
  assert.ok(E.decide({ user: "sato", id: 101 }, { stop: true, owner: true }).ok));
