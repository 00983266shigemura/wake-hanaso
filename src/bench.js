/* わけを はなそう ―― 本番基準表（いちばん上＝むずかしい の 下限）。gen.js とは別のファイル＝表を下げる変更が 別の差分として 見える。
   出どころ＝出版社の 類題集（練習帳）20問の 紙面の 数と 問い方（設計 juken_wake_hanaso_kaizen_20261103 第1節・5-3）。
   列＝
     n       数（くらべる 物の かず）          … いちばん上 200問の 最大値が これ以上、かつ これに 届く問が 3分の1 以上
     depth   順位の深さ（3ばんめ＝3）         … 同じ
     asks    1回の 読みで 答える数            … 2つの 組が 3分の1 以上
     schemas 解き方の数                       … 出た 解き方の 種類が これ以上
     many    ある 解き方で 必ず出す 数         … その 解き方の 問は 全部 これ以上（画面に 入る 最大へ 下げた所）
   null＝その列は 照らさない（why に わけ）。自己点検（gen.js の WH.selfTest・K10）が この表で 照らし、足りなければ FAIL。 */
(function (global) {
  'use strict';
  var WH = global.WH;
  WH.BENCH = {
    himo: { n: 6, depth: 3, asks: 2, schemas: 4, src: '練習帳1（6本・いちばん ながい○と 3ばんめに みじかい△を 1回で・40秒）' },
    kurabe: { n: 5, depth: 4, asks: 2, schemas: 4, src: '練習帳2（豆5皿と升5つ・対応）・3（コップ5つ・1番目○と4番目△）' },
    shiso: { n: 4, depth: 2, asks: 2, schemas: 3, src: '練習帳4（4匹・3台・2番目に重い○と2番目に軽い△）' },
    kazoe: { n: null, depth: null, asks: 2, schemas: 3, src: '練習帳7（3種のうち2種を数える）・8・9' },
    wakeru: { n: null, depth: null, asks: 2, schemas: 3, src: '練習帳10（4人に2こずつ・3こずつを2問）' },
    kazuhanashi: { n: null, depth: null, asks: null, schemas: 3, src: '練習帳11（数3つ・ふえて へる）' },
    nakama: { n: null, depth: null, asks: null, schemas: 4, src: '練習帳5（11こを自分で2つに分ける）・6（4つ×3部屋・はずれは近い仲間）',
      many: { schema: 'wakeoo', n: 11, why: '練習帳5は11こ。iPad 横（1024×640）に 12こ（6こ ずつ 2つの なかま）が 入ることを 1がめんの 検査で 確かめた＝下げずに 12こで 出す（11こは 2つに 同じ数で 分けられないため 12こ）' } },
    onajie: { n: 5, depth: null, asks: null, schemas: 3, src: '練習帳12（細部が1か所ずつ違う 絵から）' },
    katachi: { n: null, depth: null, asks: null, schemas: 5, src: '練習帳13・14・16・17・20（ハート・星・曲線・回したかけら・ななめの切り方）' },
    ana: { n: null, depth: null, asks: null, schemas: null, src: '練習帳15', why: '練習帳15は形が1つ（穴3つ・候補5つ）＝解き方の数を外す' },
    hanashi: { n: null, depth: null, asks: null, schemas: null, src: '出題例（お話作り・口頭質問）', why: '正解のない問い＝解き方の数を外す' }
  };
  WH.BENCH_COLS = ['n', 'depth', 'asks', 'schemas'];
})(typeof window !== 'undefined' ? window : this);
