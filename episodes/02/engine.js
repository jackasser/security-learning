// 第2話の判定。画面も試験も、この関数だけを使う。
(function (root) {
  "use strict";
  var rows = [], names = ["青木", "石川", "上田", "遠藤", "小川", "加藤"], memos = ["初診", "定期検診", "薬の相談", "検査の結果", "書類の受け取り"];
  for (var n = 1; n <= 180; n++) rows.push({ id: n, owner: n === 7 || n === 25 ? "kimura" : "other" + n, name: n === 7 || n === 25 ? "木村" : names[n % 6] + n, memo: memos[n % 5] });
  // who: null=ログインしていない人, "kimura"=木村さん本人
  // set.rls: 行ごとの制限。read / write: "none"=決まりなし, "all"=だれでも, "own"=本人だけ
  function decide(who, action, row, set) {
    if (!set.rls) return { ok: true, reason: "制限がない" };
    var rule = set[action] || "none";
    if (rule === "all") return { ok: true, reason: "決まりが「だれでも」" };
    if (rule === "own" && who && row.owner === who) return { ok: true, reason: "本人の行" };
    return { ok: false, reason: rule === "none" ? "決まりがないので全員を拒否" : "本人ではない" };
  }
  function count(who, action, set) { return rows.filter(function (r) { return decide(who, action, r, set).ok; }).length; }
  function result(set) {
    return { anonRead: count(null, "read", set), anonWrite: count(null, "write", set), ownRead: count("kimura", "read", set), ownWrite: count("kimura", "write", set) };
  }
  function safe(set) { var r = result(set); return r.anonRead === 0 && r.anonWrite === 0 && r.ownRead === 2 && r.ownWrite === 2; }
  var api = { rows: rows, decide: decide, count: count, result: result, safe: safe };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Episode02 = api;
})(typeof window === "object" ? window : globalThis);
