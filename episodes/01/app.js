(function () {
  "use strict";
  var E = window.Episode01, ids = Object.keys(E.customers).map(Number), at = 0, leaked = new Set(), timer = null;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function btn(text, cls, fn) { var b = el("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; }

  var names = ["侵入", "書き換え", "大量流出", "防御", "点検"];
  names.forEach(function (n) { $("steps").append(el("li", "", n)); });

  function say(todo, why) { $("todo").textContent = todo; $("why").textContent = why; }
  function log(cls, head, body) {
    var li = el("li", cls);
    li.append(el("span", "", body), el("b", "", head));
    $("log").append(li);
    $("log").scrollTop = $("log").scrollHeight;
  }
  function setCount() { $("count").textContent = leaked.size; $("count").parentNode.classList.toggle("leak", leaked.size > 0); }
  function appbar(user) { var d = el("div", "appbar"); d.append(el("b", "", "顧客管理"), el("span", "", user || "ログインしていません")); return d; }
  function screen(user) { $("app").replaceChildren(appbar(user)); var p = el("div", "pad"); $("app").append(p); return p; }
  function addr(on) { $("num").disabled = $("open").disabled = !on; $("addr").classList.toggle("hot", on); }
  function alertBox(text, safe) { var d = el("div", "alert" + (safe ? " safe" : ""), text); d.setAttribute("role", "alert"); $("app").append(d); $("app").parentNode.classList.toggle("leak", !safe); }
  function clear() { $("app").parentNode.classList.remove("leak"); if (timer) { clearInterval(timer); timer = null; } }
  function ready(text) { $("next").hidden = false; $("next").textContent = text || "次へ進む"; $("next").focus({ preventScroll: true }); }
  function record(id) {
    var c = E.customers[id], t = el("table"), b = el("tbody");
    [["番号", id], ["会社", c.name], ["相手", c.contact], ["内容", c.note]].forEach(function (x) { var r = el("tr"), h = el("th", "", x[0]); h.scope = "row"; r.append(h, el("td", "", x[1])); b.append(r); });
    t.append(b);
    return t;
  }
  function list() {
    var p = screen("田中（退職済み）");
    p.append(el("p", "", "あなたの担当: 1件"), record(103));
    $("num").value = 103;
  }

  var scenes = [
    function () {
      say("田中さんのアカウントでログインする", "田中さんは3か月前に退職しました。でも、ログイン用のアカウントは消されていません。");
      addr(false); $("num").value = "";
      var p = screen(), f = el("div", "login");
      ["利用者: tanaka", "パスワード: ••••••••（在職中のもの）"].forEach(function (t) { f.append(el("div", "", t)); });
      f.append(btn("ログイン", "", function () {
        var d = E.decide({ user: "tanaka", id: 103 }, {});
        log("", "", "ログイン  利用者 = 田中");
        log(d.ok ? "leak" : "safe", d.ok ? "許可：退職者が入れた" : "拒否", "サーバーの返事");
        list(); leaked.add(103); setCount();
        alertBox("退職者がログインできました。103番のお客さんの情報が見えています。");
        ready();
      }));
      p.append(f);
    },
    function () {
      say("URLの 103 を 104 に書き換えて「開く」", "URLは、ページの場所を示す文字です。最後の数字が、お客さんの番号になっています。");
      list(); addr(true);
      if (matchMedia("(min-width:52.01rem)").matches) $("num").select();
    },
    function () {
      say("「全件を自動で取得」を押す", "番号は101から340まで。1つずつではなく、プログラムで順番に開かれたらどうなるでしょう。");
      addr(false);
      var p = screen("田中（退職済み）"), rows = el("div", "rows");
      rows.setAttribute("aria-hidden", "true");
      var b = btn("全件を自動で取得（見せかけ）", "danger", function () {
        b.disabled = true;
        var got = E.readable("tanaka", {}), i = 0;
        log("", "", "番号101から順に、次々と頼んでいます");
        function step() {
          for (var k = 0; k < 8 && i < got.length; k++, i++) {
            leaked.add(got[i]);
            rows.append(el("div", "", got[i] + "  " + E.customers[got[i]].name + "  " + E.customers[got[i]].note));
          }
          while (rows.childNodes.length > 8) rows.firstChild.remove();
          setCount();
          if (i >= got.length) {
            clear();
            log("leak", "許可：240件すべて渡した", "サーバーの返事 " + got.length + "回");
            alertBox("全顧客 " + got.length + "件の情報が流出しました。");
            ready("防御に回る");
          }
        }
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) while (i < got.length) step();
        else timer = setInterval(step, 70);
      });
      p.append(el("p", "", "体験用の表示です。実際の通信はしません。"), b, rows);
    },
    function () {
      say("2つの防御を入れて、もう一度攻撃する", "今度は守る側です。退職者が見られる件数を0件に、社員の佐藤さんは担当の2件だけにします。");
      addr(false); $("num").value = "";
      var p = screen("管理者"), f = {}, sw = el("div", "sw"), out = el("table");
      [["stop", "退職者のアカウントを止める", "ログインも、ログインしたままの画面も使えなくする"],
       ["owner", "見てよい人か、毎回サーバーで確かめる", "番号を変えられても、担当でなければ渡さない"]].forEach(function (x) {
        var l = el("label"), i = el("input"), s = el("span", "", x[1]);
        i.type = "checkbox"; i.id = "fix-" + x[0];
        s.append(el("small", "", x[2])); l.append(i, s); sw.append(l);
        i.addEventListener("change", function () { f[x[0]] = i.checked; draw(true); });
      });
      function draw(attack) {
        var t = E.readable("tanaka", f).length, s = E.readable("sato", f).length, b = el("tbody");
        [["退職した田中", t, t === 0], ["社員の佐藤", s, s === 2]].forEach(function (x) {
          var r = el("tr"), h = el("th", "", x[0]); h.scope = "row"; h.style.width = "8em";
          r.append(h, el("td", "num " + (x[2] ? "good" : "bad"), x[1] + "件"), el("td", "", x[2] ? "ねらいどおり" : "見えすぎ"));
          b.append(r);
        });
        out.replaceChildren(b);
        if (!attack) return;
        [["田中", "tanaka", 103], ["田中", "tanaka", 104], ["佐藤", "sato", 104], ["佐藤", "sato", 101]].forEach(function (q) {
          var d = E.decide({ user: q[1], id: q[2] }, f), want = q[1] === "sato" && q[2] === 101, fine = d.ok === want;
          log(fine ? "safe" : "leak", d.ok ? (want ? "許可：担当の仕事" : "許可：漏れている") : "拒否：" + (d.gate === "stop" ? "退職者" : "担当ではない"), "再攻撃  " + q[0] + " → " + q[2] + "番");
        });
        var old = $("app").querySelector(".alert"); if (old) old.remove();
        clear();
        if (t === 0 && s === 2) {
          alertBox("防御成功。攻撃は止まり、佐藤さんの仕事は続けられます。", true);
          ready();
        } else $("next").hidden = true;
      }
      p.append(sw, el("p", "", "見られる件数"), out);
      draw(false);
    },
    function () {
      say("会社のツールを点検する", "直しても、流出した240件は戻りません。だから、漏れる前に確かめます。");
      addr(false);
      var p = screen("点検の記録"), ol = el("ol", "report");
      var q = ["退職した人のアカウントは、その日に止めていますか。", "URLの番号を変えても、担当外の情報は出ませんか。", "誰が何を見たか、後から調べられますか。"];
      q.forEach(function (t) { ol.append(el("li", "", t)); });
      var o = el("p", ""); o.setAttribute("role", "status");
      p.append(el("h3", "", "ツールの管理者に聞く3つのこと"), ol, btn("3つの質問をコピー", "", async function () {
        try { await navigator.clipboard.writeText(q.join("\n")); o.textContent = "コピーしました。"; }
        catch (e) { o.textContent = "コピーできませんでした。文章を選んで写してください。"; }
      }), o);
    }
  ];

  $("addr").addEventListener("submit", function (e) {
    e.preventDefault();
    if (at !== 1) return;
    var id = Number($("num").value), d = E.decide({ user: "tanaka", id: id }, {});
    clear();
    log("", "", "GET /customers/" + (id || "?") + "  利用者 = 田中");
    if (!d.ok) {
      log("", "見つからない", "404");
      var p = screen("田中（退職済み）");
      p.append(el("p", "", "その番号のお客さんはいません。104を入れてみましょう。"));
      return;
    }
    if (id === 103) { list(); log("leak", "許可：退職者に渡した", "200 OK"); return; }
    leaked.add(id); setCount();
    screen("田中（退職済み）").append(record(id));
    log("leak", "許可：担当外の情報を渡した", "200 OK（成功）");
    alertBox("担当ではない" + id + "番の情報が見えました。サーバーは、見てよい人かを確かめていません。");
    ready();
  });
  function go(n) {
    clear(); at = n;
    $("next").hidden = true;
    $("steps").querySelectorAll("li").forEach(function (li, i) {
      li.className = i < n ? "done" : i === n ? "now" : "";
      if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    scenes[n]();
    if (n) { window.scrollTo(0, 0); if (n !== 1) $("todo").focus({ preventScroll: true }); }
  }
  $("next").addEventListener("click", function () { go(at + 1); });
  go(0);
})();
