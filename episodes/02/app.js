(function () {
  "use strict";
  var K = window.Kit, E = window.Episode02, el = K.el, OFF = { rls: false, read: "none", write: "none" };
  function url(t) { K.$("url").textContent = "https://clinic.example/" + t; }
  function rowCells(r) { return ["" + r.id, r.name, r.memo]; }

  K.start(["予約", "読み取り", "消去", "防御", "点検"], [
    function () {
      K.say("木村さんとして、自分の予約を見る", "予約は、データベース（情報を表で保管する場所）にあります。木村さんの予約は2件です。");
      url("my");
      var p = K.screen("予約システム", "木村");
      var b = K.btn("自分の予約を見る", "", function () {
        b.hidden = true;
        K.log("", "", "読む 予約の表  条件: 木村の行  接続コードつき");
        p.append(K.table(["番号", "名前", "用件"], E.rows.filter(function (r) { return r.owner === "kimura"; }).map(rowCells)),
          el("p", "key", "ページに入っている接続コード: demo-public-0000"),
          K.table(["データベースに伝えるもの", "分かること"], [["接続コード", "どのシステムからの頼みか"], ["ログイン", "頼んだのは誰か"]]));
        K.log("safe", "許可：2件", "データベースの返事");
        K.alertBox("接続コードは、ページを開いた人なら誰でも見られます。これだけでは、頼んだのが誰かは分かりません。", true);
        K.ready();
      });
      p.append(b);
    },
    function () {
      K.say("ログインせずに「予約を全部読む」を押す", "使うのは接続コードだけです。体験用なので、実在のシステムでは試しません。");
      url("data/reservations");
      var p = K.screen("データベースへ直接", "ログインしていません");
      var b = K.btn("予約を全部読む（見せかけ）", "danger", function () {
        b.disabled = true;
        var got = E.rows.filter(function (r) { return E.decide(null, "read", r, OFF).ok; });
        K.log("", "", "読む 予約の表  条件: なし  接続コードつき");
        K.log("leak", "許可：" + got.length + "件すべて", "データベースの返事");
        p.append(K.table(["番号", "名前", "用件"], got.slice(0, 5).map(rowCells)), el("p", "", "ほか " + (got.length - 5) + "件"));
        K.setCount(got.length);
        K.alertBox("全員の予約が読めました。原因は、データベースに「誰がどの行を読めるか」の決まりがないことです。");
        K.ready();
      });
      p.append(b);
    },
    function () {
      K.say("他人の予約を1件、取り消してみる", "読めるだけでしょうか。消せるかも確かめます。");
      url("data/reservations");
      var p = K.screen("データベースへ直接", "ログインしていません"), r = E.rows[0];
      p.append(K.table(["番号", "名前", "用件"], [rowCells(r)]));
      var b = K.btn(r.name + "さんの予約を取り消す（見せかけ）", "danger", function () {
        b.disabled = true;
        var d = E.decide(null, "write", r, OFF);
        K.log("", "", "消す 予約の表  番号 = " + r.id + "  接続コードつき");
        K.log(d.ok ? "leak" : "safe", d.ok ? "許可：他人の予約が消えた" : "拒否", "データベースの返事");
        p.querySelector("tbody").replaceChildren();
        K.alertBox("予約が消えました。本人は、病院に着くまで気づかないかもしれません。");
        K.ready("防御に回る");
      });
      p.append(b);
    },
    function () {
      K.say("他人は0件、木村さんは2件にする", "ログインした人と予約した人が同じか、データベースが確かめるようにします。");
      url("admin/rules");
      var p = K.screen("データベースの設定", "管理者"), set = { rls: false, read: "none", write: "none" }, out = el("div"), sw = el("div", "sw"), fs = [];
      var l = el("label"), i = el("input"), s = el("span", "", "行ごとの制限を有効にする");
      i.type = "checkbox"; i.id = "rls";
      s.append(el("small", "", "最初に入れる。行は、表の横1行（予約1件）のこと"));
      l.append(i, s); sw.append(l);
      i.addEventListener("change", function () { set.rls = i.checked; draw(true); });
      p.append(sw);
      [["read", "読んでよい人"], ["write", "変える・消すことができる人"]].forEach(function (x) {
        var f = el("fieldset", "set");
        f.append(el("legend", "", x[1]));
        [["none", "決まりなし"], ["all", "だれでも"], ["own", "予約した本人だけ"]].forEach(function (o) {
          var lab = el("label"), r = el("input");
          r.type = "radio"; r.name = x[0]; r.id = x[0] + "-" + o[0]; r.checked = o[0] === "none";
          r.addEventListener("change", function () { set[x[0]] = o[0]; draw(true); });
          lab.append(r, o[1]); f.append(lab);
        });
        fs.push(f); p.append(f);
      });
      p.append(out);
      function cell(n, good) { return el("td", "num " + (n === good ? "good" : "bad"), n + "件"); }
      function draw(attack) {
        fs.forEach(function (f) { f.disabled = !set.rls; });
        var r = E.result(set);
        out.replaceChildren(K.table(["使う人", "読める", "消せる"], [["ログインなし", cell(r.anonRead, 0), cell(r.anonWrite, 0)], ["木村さん本人", cell(r.ownRead, 2), cell(r.ownWrite, 2)]]));
        if (!attack) return;
        K.clear();
        K.log(r.anonRead ? "leak" : "safe", r.anonRead ? "読めた：" + r.anonRead + "件" : "読めた：0件", "もう一度試す  ログインなしで読む");
        K.log(r.anonWrite ? "leak" : "safe", r.anonWrite ? "消せた：" + r.anonWrite + "件" : "消せた：0件", "もう一度試す  ログインなしで消す");
        K.log(r.ownRead === 2 && r.ownWrite === 2 ? "safe" : "leak", "読める " + r.ownRead + "件 / 消せる " + r.ownWrite + "件", "木村さん本人");
        K.$("next").hidden = true;
        if (E.safe(set)) { K.alertBox("防御成功。他人は0件、木村さんは自分の2件だけ使えます。", true); K.ready(); }
        else if (!set.rls) K.alertBox("制限が切れています。決まりを書いても効きません。");
        else if (r.anonRead || r.anonWrite) K.alertBox("制限を有効にしても、「だれでも」では漏れます。");
        else if (r.ownRead < 2 || r.ownWrite < 2) K.alertBox("攻撃は止まりました。でも、木村さん本人も" + (r.ownRead < 2 && r.ownWrite < 2 ? "読む・消すの両方ができません。" : r.ownRead < 2 ? "まだ読めません。" : "まだ取り消せません。"));
      }
      draw(false);
    },
    function () {
      K.say("会社のツールを点検する", "直しても、読まれた180件は戻りません。だから、公開する前に確かめます。");
      url("check");
      var p = K.screen("点検の記録", ""), ol = el("ol", "report"), o = el("p");
      var q = ["どの表にも、誰がどの行を使えるかの決まりがありますか。", "ログインなしと、別の人の試験用アカウントで、読むことと変えることを両方試しましたか。", "公開する前に、誰がその2つを確かめますか。"];
      o.setAttribute("role", "status");
      q.forEach(function (t) { ol.append(el("li", "", t)); });
      p.append(el("h3", "", "ツールの管理者に聞く3つのこと（自分で試すのは許可を取ってから）"), ol, K.btn("3つの質問をコピー", "", K.copy(q.join("\n"), o)), o);
    }
  ]);
})();
