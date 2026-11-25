const test = require("node:test");
const assert = require("node:assert");
const E = require("../episodes/01/engine.js");

const keys = ["hide", "login", "stop", "owner", "log", "all"];
const all = [...Array(64).keys()].map((n) => Object.fromEntries(keys.map((k, i) => [k, !!((n >> i) & 1)])));
const ok = (f) => Object.fromEntries(E.run(f).map((r) => [r.case.key, r.result.ok]));

test("修正前は4つとも開ける", () =>
  assert.deepEqual(ok({}), { normal: true, other: true, retired: true, anon: true }));
test("全64通り: 正しい利用は「全部止める」以外で止まらない", () => all.forEach((f) => assert.equal(ok(f).normal, !f.all)));
test("全64通り: 一覧を隠す・記録するは結果を変えない", () =>
  all.forEach((f) => assert.deepEqual(ok(f), ok({ ...f, hide: false, log: false }))));
test("全64通り: 目標を満たすのは stop と owner の両方があるときだけ", () =>
  all.forEach((f) => assert.equal(E.run(f).every((r) => r.good), f.stop && f.owner && !f.all)));
test("対策1つずつの効き方", () => {
  assert.deepEqual(ok({ login: true }), { normal: true, other: true, retired: true, anon: false });
  assert.deepEqual(ok({ stop: true }), { normal: true, other: true, retired: false, anon: true });
  assert.deepEqual(ok({ owner: true }), { normal: true, other: false, retired: true, anon: false });
});
test("存在しない番号は開けない", () => assert.equal(E.decide({ user: "sato", id: 999 }, {}).ok, false));
