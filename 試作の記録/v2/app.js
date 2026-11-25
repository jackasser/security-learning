(function () {
  "use strict";
  var E = window.Episode01, S = window.Story01, at = 0;
  var NS = "http://www.w3.org/2000/svg";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function btn(text, cls, fn) { var b = el("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function svg(parts) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 100 100"); s.setAttribute("aria-hidden", "true");
    parts.forEach(function (p) { var n = document.createElementNS(NS, p[0]); Object.keys(p[1]).forEach(function (k) { n.setAttribute(k, p[1][k]); }); s.append(n); });
    return s;
  }
  function person(c) { return svg([["circle", { cx: 50, cy: 28, r: 20, fill: c }], ["path", { d: "M12 100 Q12 54 50 54 Q88 54 88 100Z", fill: c }]]); }
  function desk() { return svg([["circle", { cx: 50, cy: 26, r: 17, fill: "#20406b" }], ["path", { d: "M22 78 Q22 48 50 48 Q78 48 78 78Z", fill: "#20406b" }], ["rect", { x: 4, y: 70, width: 92, height: 30, rx: 4, fill: "#8a6a3b" }]]); }
  function shelf() {
    var p = [["rect", { x: 6, y: 6, width: 88, height: 94, rx: 4, fill: "#8a6a3b" }]];
    [14, 45, 74].forEach(function (y, r) { [12, 39, 66].forEach(function (x, i) { p.push(["rect", { x: x, y: y, width: 22, height: 20, fill: (r + i) % 2 ? "#f1f4f0" : "#dfe7ef" }]); }); });
    return svg(p);
  }
  function fig(pic, name, note) { var d = el("div", "fig"); d.append(pic, name); if (note) d.append(el("small", "", note)); return d; }
  function finish(text, good) { $("result").textContent = text; $("result").className = "result " + (good ? "good" : "bad"); $("next").hidden = at === S.length - 1; }

  var draw = {
    ask: function (s) {
      var u = E.users[s.who];
      $("scene").append(fig(person(u.active ? "#23694a" : "#a32b41"), u.name + "さん", u.active ? "社員" : "辞めた人"), fig(desk(), "受付係", "情報の窓口"), fig(shelf(), "お客さんの情報"));
      var b = btn(s.button, "", function () {
        var d = E.decide({ user: s.who, id: s.id }, s.fixes || {}), c = E.customers[s.id];
        var fine = d.ok === s.want, no = d.gate === "stop" ? "今は社員ではないので、見せられません" : "受け持ちではないので、見せられません";
        b.hidden = true;
        $("scene").append(el("p", "say", u.name + "「" + s.id + "番を見せて」"),
          el("p", "say r " + (fine ? "fine" : "leak"), "受付係「" + (d.ok ? "どうぞ。" + c.name + "、" + c.note + "です" : no) + "」"));
        finish(s.after, fine);
        $("next").focus();
      });
      $("act").append(b);
    },
    map: function (s) {
      var d = el("div", "address"), p = el("p", "addr");
      p.append(s.url[0], el("b", "", s.url[1]));
      d.append(el("p", "", s.label), p);
      $("act").append(d, el("p", "text", s.after));
      $("next").hidden = false;
    },
    today: function (s) {
      var ol = el("ol", "asks");
      s.ask.forEach(function (t) { ol.append(el("li", "", t)); });
      var a = el("a", "", "もっと深く知る"); a.href = "deep.html";
      $("act").append(ol, btn("質問をコピーする", "", async function () {
        try { await navigator.clipboard.writeText(s.ask.join("\n")); $("result").textContent = "コピーしました。"; }
        catch (e) { $("result").textContent = "コピーできませんでした。文章を選んで写してください。"; }
      }), a);
    }
  };
  function go(n, focus) {
    at = n;
    var s = S[n];
    ["scene", "act"].forEach(function (id) { $(id).replaceChildren(); });
    $("result").textContent = ""; $("result").className = "result";
    $("step").textContent = (n + 1) + " / " + S.length;
    $("title").textContent = s.title; $("text").textContent = s.text;
    $("back").hidden = n === 0; $("next").hidden = true;
    draw[s.kind](s);
    if (focus) { window.scrollTo(0, 0); $("title").focus({ preventScroll: true }); }
  }
  $("next").addEventListener("click", function () { go(at + 1, true); });
  $("back").addEventListener("click", function () { go(at - 1, true); });
  go(0, false);
})();
