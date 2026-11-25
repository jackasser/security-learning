// 監視画面の共通部品。第2話から使う。
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function btn(text, cls, fn) { var b = el("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function say(todo, why) { $("todo").textContent = todo; $("why").textContent = why; }
  function log(cls, head, body) {
    var li = el("li", cls);
    li.append(el("span", "", body));
    if (head) li.append(el("b", "", head));
    $("log").append(li);
    $("log").scrollTop = $("log").scrollHeight;
  }
  function screen(app, user) {
    var d = el("div", "appbar"), p = el("div", "pad");
    d.append(el("b", "", app), el("span", "", user));
    $("app").replaceChildren(d, p);
    return p;
  }
  function clear() {
    var old = $("app").querySelector(".alert");
    if (old) old.remove();
    $("browser").classList.remove("leak");
  }
  function alertBox(text, safe) {
    clear();
    var d = el("div", "alert" + (safe ? " safe" : ""), text);
    d.setAttribute("role", "alert");
    $("app").append(d);
    $("browser").classList.toggle("leak", !safe);
  }
  function table(head, rows) {
    var t = el("table", "list"), h = el("thead"), b = el("tbody"), r = el("tr");
    head.forEach(function (x) { var c = el("th", "", x); c.scope = "col"; r.append(c); });
    h.append(r);
    rows.forEach(function (row) { var q = el("tr"); row.forEach(function (x) { q.append(x instanceof Node ? x : el("td", "", x)); }); b.append(q); });
    t.append(h, b);
    return t;
  }
  function setCount(n) { $("count").textContent = n; $("count").parentNode.classList.toggle("leak", n > 0); }
  function ready(text) { $("next").hidden = false; $("next").textContent = text || "次へ進む"; }
  function copy(text, out) {
    return async function () {
      try { await navigator.clipboard.writeText(text); out.textContent = "コピーしました。"; }
      catch (e) { out.textContent = "コピーできませんでした。文章を選んで写してください。"; }
    };
  }
  function start(names, scenes) {
    var at = 0;
    names.forEach(function (n) { $("steps").append(el("li", "", n)); });
    function go(n) {
      clear(); at = n;
      $("next").hidden = true;
      $("steps").querySelectorAll("li").forEach(function (li, i) {
        li.className = i < n ? "done" : i === n ? "now" : "";
        if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      scenes[n]();
      if (n) { window.scrollTo(0, 0); $("todo").focus({ preventScroll: true }); }
    }
    $("next").addEventListener("click", function () { go(at + 1); });
    go(0);
  }
  window.Kit = { $: $, el: el, btn: btn, say: say, log: log, screen: screen, clear: clear, alertBox: alertBox, table: table, setCount: setCount, ready: ready, copy: copy, start: start };
})();
