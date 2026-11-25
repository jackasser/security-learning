// かんたん版の文章。文の数と長さは tests/story.test.cjs が確かめる。
(function (root) {
  "use strict";
  var story = [
    { kind: "ask", who: "sato", id: 101, want: true, title: "番号を言うと、お客さんの情報を見せてくれます",
      text: "あなたは社員の佐藤さんです。自分が受け持つ101番のお客さんを見ましょう。",
      button: "「101番を見せて」と言う", after: "見られました。正しい使い方です。" },
    { kind: "ask", who: "tanaka", id: 103, want: false, title: "会社を辞めた田中さんも、頼んでみます",
      text: "田中さんは、3か月前に会社を辞めました。",
      button: "「103番を見せて」と言う", after: "辞めたのに、見られました。情報が漏れています。" },
    { kind: "ask", who: "tanaka", id: 103, want: false, fixes: { stop: true }, title: "受付係に、1つ確認を教えます",
      text: "「今も社員ですか」と確かめるようにします。",
      button: "確認を教えて、もう一度頼む", after: "止まりました。1つ目の穴がふさがりました。" },
    { kind: "ask", who: "sato", id: 104, want: false, fixes: { stop: true }, title: "でも、穴はもう1つあります",
      text: "佐藤さんは社員です。受け持っていない104番を頼んでみましょう。",
      button: "「104番を見せて」と言う", after: "社員なら、関係のない情報まで見られました。" },
    { kind: "ask", who: "sato", id: 104, want: false, fixes: { stop: true, owner: true }, title: "確認を、もう1つ教えます",
      text: "「あなたが受け持つお客さんですか」と確かめるようにします。",
      button: "確認を教えて、もう一度頼む", after: "止まりました。101番は、これまでどおり見られます。" },
    { kind: "map", title: "パソコンの中でも、同じことが起きます",
      text: "番号が、ページの住所に入っていることがあります。確認がないと、数字を変えるだけで見えます。",
      url: ["架空の会社/お客さん/", "101"], label: "ページの住所（URL）の例",
      after: "受付係の役をするのは「サーバー」という裏側のコンピューターです。" },
    { kind: "today", title: "会社のツールについて、管理する人に聞きましょう",
      text: "自分で数字を変えて試すのは、許可をもらってからです。",
      ask: ["辞めた人は、もう情報を見られませんか。", "数字を変えても、関係のない情報は見えませんか。", "その2つを、実際に試しましたか。"] }
  ];
  if (typeof module === "object" && module.exports) module.exports = story;
  else root.Story01 = story;
})(typeof window === "object" ? window : globalThis);
