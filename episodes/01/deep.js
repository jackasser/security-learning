(function () {
  "use strict";
  var E = window.Episode01;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function sim(host, userKey, editable, onOpen) {
    var u = E.users[userKey], box = el("div", "sim"), bar = el("div", "bar"), body = el("div", "body");
    var out = el("div");
    out.setAttribute("role", "status");
    function open(id) {
      var plain = !editable;
      var d = E.decide({ user: userKey, id: id }, {}), c = E.customers[id];
      var outside = d.ok && u.customers.indexOf(id) < 0;
      out.replaceChildren();
      var p = el("div", "path");
      p.append(
        el("div", "", "画面「" + id + "番をください」"),
        el("div", plain ? "" : "gate", plain ? "頼む" : "見てよい人かの確認なし"),
        el("div", "", "名簿の保管場所「" + (d.ok ? "返します" : "見つかりません") + "」"));
      out.append(p);
      if (d.ok) {
        var r = el("div", "rec" + (outside || !u.active ? " leak" : ""));
        r.append(el("p", "", id + "番 " + c.name + "（" + c.contact + "）"), el("p", "", "メモ: " + c.note));
        out.append(r);
        if (!u.active) out.append(el("p", "bad", outside ? "一覧にない顧客が見えました。" : "退職後なのに、昔の担当が見えました。"));
      } else out.append(el("p", "", d.reason + "、開けません。"));
      if (onOpen) onOpen(id, outside);
    }
    if (editable) {
      var f = el("form", "row"), lab = el("label"), inp = el("input"), b = el("button", "", "この番号を開く");
      inp.type = "number"; inp.min = 101; inp.max = 105; inp.value = 103; inp.required = true;
      b.type = "submit";
      lab.append("架空のURL /customers/ ", inp);
      f.append(lab, b);
      f.addEventListener("submit", function (e) { e.preventDefault(); open(Number(inp.value)); });
      bar.append(f);
    } else bar.append(el("span", "", "架空の顧客名簿"));
    body.append(el("div", "", "ログイン中: " + u.name + "さん" + (u.active ? "" : "（3か月前に退職）")));
    var row = el("div", "row");
    u.customers.forEach(function (id) {
      var b = el("button", "item", id + "番 " + E.customers[id].name);
      b.type = "button";
      b.addEventListener("click", function () { open(id); });
      row.append(b);
    });
    body.append(row, out);
    box.append(bar, body);
    host.append(box);
  }

  sim($("sim1"), "sato", false);
  var leaked = new Set();
  sim($("sim3"), "tanaka", true, function (id, outside) {
    if (outside) leaked.add(id);
    var done = leaked.size >= 3;
    $("goal").textContent = "一覧にない顧客: " + leaked.size + "件 / 3件" + (done ? "。3件とも見えてしまいました。サーバーは、見てよい人かを一度も確かめませんでした。" : "");
    $("goal").classList.toggle("bad", done);
  });

  [["who", "頼んだ人が、その顧客を見てよい人か", true, "そのとおりです。頼んだのが誰か、その人が見てよいかを、サーバーが確かめていません。"],
   ["num", "番号が101より大きいか", false, "番号の大きさを確かめても、見てよい人かどうかは分かりません。"],
   ["button", "画面のボタンが正しく並んでいるか", false, "並びを直しても、サーバーの返事は変わりません。"]].forEach(function (q) {
    var l = el("label", "opt"), i = el("input");
    i.type = "radio"; i.name = "quiz"; i.value = q[0];
    i.addEventListener("change", function () {
      $("quizOut").textContent = q[3];
      $("quizOut").className = "out " + (q[2] ? "good" : "bad");
    });
    l.append(i, el("span", "", q[1]));
    $("quiz").append(l);
  });

  var fixes = {};
  [["hide", "画面の一覧から、担当外の顧客を隠す（いまの画面はすでに隠しています）"],
   ["login", "ログインしているかをサーバーで確かめる"],
   ["stop", "退職した人のアカウントを止める"],
   ["owner", "その顧客の担当かをサーバーで確かめる"],
   ["log", "誰が何番を開いたかを記録する"],
   ["all", "名簿を全部止める"]].forEach(function (x) {
    var l = el("label", "opt"), i = el("input");
    i.type = "checkbox"; i.id = "fix-" + x[0];
    i.addEventListener("change", function () { fixes[x[0]] = i.checked; draw(); });
    l.append(i, el("span", "", x[1]));
    $("fixes").append(l);
  });
  function draw() {
    var rs = E.run(fixes);
    $("cases").replaceChildren();
    rs.forEach(function (r) {
      var d = el("div", "case " + (r.good ? "ok" : "no"));
      d.append(
        el("span", "", r.case.text),
        el("b", r.good ? "good" : "bad", r.result.ok ? (r.case.want ? "開ける（正しい）" : "開けてしまう") : (r.case.want ? "止まってしまう" : "止まる")),
        el("small", "", r.case.want ? (r.result.ok ? "担当者本人の仕事です。" : r.result.reason + "、仕事も止まります。") : r.result.reason + (r.result.ok ? "、中身が返ります。" : "、サーバーが断ります。")));
      $("cases").append(d);
    });
    var left = rs.filter(function (r) { return !r.good; }).length, o = $("fixOut");
    o.className = "out " + (left ? "bad" : "good");
    if (fixes.all) o.textContent = "攻撃は止まりましたが、佐藤さんの仕事も止まりました。被害の最中は止めることもありますが、直した後は仕事を続けられる形にします。";
    else if (left) o.textContent = "まだ" + left + "つの操作で、見えてはいけない情報が見えます。";
    else o.textContent = "3つの操作が止まり、佐藤さんの仕事は続けられます。" +
      (fixes.login ? "" : "担当の確認は「誰か」が分からないと通らないので、ログインしていない人も止まりました。") +
      (fixes.log ? "" : "次は記録も入れると、後から調べられます。");
  }
  draw();

  var fields = ["ツールの名前", "責任を持つ人の部署と役割（例: 営業課の課長）", "使う人の範囲（例: 営業課だけ）", "扱うデータの種類（例: 取引先の連絡先）", "ツールができること（例: 全顧客を読む、消す）", "つながる先（例: メール、会計ソフト）", "最後に更新した日", "止め方（例: 管理者が公開を止める）"];
  fields.forEach(function (t, n) {
    var l = el("label", "", t), i = el("input");
    i.type = "text"; i.id = "led" + n; i.autocomplete = "off";
    l.append(i);
    $("ledger").append(l);
  });
  $("copy").addEventListener("click", async function () {
    var s = fields.map(function (t, n) { return t + ": " + $("led" + n).value; }).join("\n");
    try {
      await navigator.clipboard.writeText(s);
      $("copyOut").textContent = "台帳をコピーしました。";
    } catch (e) {
      $("copyOut").textContent = "コピーできませんでした。各欄を選んで写してください。";
    }
  });
})();
