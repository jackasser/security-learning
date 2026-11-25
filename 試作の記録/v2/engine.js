// 第1話の判定。画面も試験も、この関数だけを使う。
(function (root) {
  "use strict";
  var users = {
    sato: { name: "佐藤", active: true, customers: [101, 102] },
    tanaka: { name: "田中", active: false, customers: [103] }
  };
  var customers = {
    101: { name: "青葉文具店", contact: "森さん", note: "見積もり待ち" },
    102: { name: "みなと工房", contact: "原さん", note: "来月、担当者が交代" },
    103: { name: "つばき写真館", contact: "林さん", note: "まだ秘密の移転計画" },
    104: { name: "こだま食堂", contact: "西さん", note: "値引きの相談中" },
    105: { name: "ひより保育園", contact: "岡さん", note: "緊急連絡先あり" }
  };
  // fixes: login=ログインを確かめる, stop=退職者を止める, owner=担当かを確かめる
  // all=名簿全体を止める（正しい仕事も止まる）
  // hide（一覧を隠す）と log（記録する）は、読めるかどうかを変えない。
  function decide(req, fixes) {
    var f = fixes || {};
    var u = req.user ? users[req.user] : null;
    if (f.all) return { ok: false, gate: "all", reason: "名簿全体を止めているため" };
    if (f.login && !u) return { ok: false, gate: "login", reason: "ログインしていないため" };
    if (f.stop && u && !u.active) return { ok: false, gate: "stop", reason: "退職した人のアカウントのため" };
    if (f.owner && (!u || u.customers.indexOf(req.id) < 0))
      return { ok: false, gate: "owner", reason: "この顧客の担当と確かめられないため" };
    if (!customers[req.id]) return { ok: false, gate: "none", reason: "その番号の顧客はいないため" };
    if (f.owner && u && !u.active)
      return { ok: true, gate: null, reason: "昔の担当なので担当の確認は通り、退職者を止める確認がないため" };
    return { ok: true, gate: null, reason: "止める確認がないため" };
  }
  var cases = [
    { key: "normal", want: true, user: "sato", id: 101, text: "現役の佐藤さんが、担当の101番を開く" },
    { key: "other", want: false, user: "sato", id: 104, text: "現役の佐藤さんが、担当外の104番を開く" },
    { key: "retired", want: false, user: "tanaka", id: 103, text: "退職した田中さんが、昔の担当の103番を開く" },
    { key: "anon", want: false, user: null, id: 101, text: "ログインしていない人が、101番のURLを開く" }
  ];
  function run(fixes) {
    return cases.map(function (c) {
      var d = decide(c, fixes);
      return { case: c, result: d, good: d.ok === c.want };
    });
  }
  var api = { users: users, customers: customers, decide: decide, cases: cases, run: run };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Episode01 = api;
})(typeof window === "object" ? window : globalThis);
