/* わけを はなそう ―― 1対1の 口頭試問（テスターと 向き合って、こたえて、わけを はなす）の れんしゅう
   （2012年の iPad・iOS 10.3.3 で動く書き方＝var と function だけ。絵文字なし。端末内保存は try で包む）
   このファイル＝土台（らんすう・絵の部品・絵の一覧・おと・きろく・ごほうび）。
   もんだいの型は src/gen.js、画面は src/ui.js。tools/build_app.py が index.html へ埋め込む。直すのは src/ だけ。 */
(function (global) {
  'use strict';

  var WH = {};
  /* このファイルを直したら この数字を +1 する。version.txt にも同じ数字を書く（build_app.py が照合する） */
  WH.APP_VERSION = 5;
  WH.SCHEMA = 1;
  /* 端末にしまう記録の名前は 全部 wake_ で始める（K29＝同じ公開先の 他のアプリの記録を 上書きしない） */
  WH.STORE_KEY = 'wake_hanaso_v1';
  WH.UPD_KEY = 'wake_upd';

  /* ================= いろ ================= */
  var COL = {
    ao: '#1f77d0', daidai: '#f0932b', murasaki: '#b45fd1', mizu: '#4fc3f7', ki: '#f6d32d',
    midori: '#3cb371', aka: '#e64a4a', sumi: '#1b1b1b', shiro: '#ffffff', usui: '#9aa3ab', kami: '#fffdf7',
    hai: '#c9cfd4', cha: '#8a5a2b', momo: '#f6b7c4'
  };
  WH.COL = COL;

  /* ================= らんすう（試験では たねを 固定できる） ================= */
  var rngState = null;
  function rnd() {
    if (rngState === null) { return Math.random(); }
    rngState = (rngState + 0x6D2B79F5) | 0;
    var t = rngState;
    t = Math.imul ? Math.imul(t ^ (t >>> 15), t | 1) : (((t ^ (t >>> 15)) * (t | 1)) | 0);
    t ^= t + (Math.imul ? Math.imul(t ^ (t >>> 7), t | 61) : (((t ^ (t >>> 7)) * (t | 61)) | 0));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  WH.seed = function (s) { rngState = (s === null || s === undefined) ? null : (s | 0); };
  function ri(n) { return Math.floor(rnd() * n); }
  function pick(arr) { return arr[ri(arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = ri(i + 1); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uniqNums(answer, count, lo, hi) {
    /* answer を含む count 個の ちがう数（lo〜hi）。近い数を まぜて まぎらわしく（K12） */
    var out = [answer], tries = 0, v;
    while (out.length < count && tries < 200) {
      tries++;
      v = answer + (ri(5) - 2);
      if (v < lo || v > hi || out.indexOf(v) >= 0) { continue; }
      out.push(v);
    }
    while (out.length < count) { v = lo + ri(hi - lo + 1); if (out.indexOf(v) < 0) { out.push(v); } }
    return shuffle(out);
  }
  WH.rnd = rnd; WH.ri = ri; WH.pick = pick; WH.shuffle = shuffle; WH.uniqNums = uniqNums;

  /* ================= 絵の 部品 ================= */
  function circle(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }
  function ellipse(ctx, x, y, rx, ry, fill, stroke, lw) {
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.restore();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }
  function poly(ctx, pts, fill, stroke, lw) {
    var i;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) { ctx.lineTo(pts[i][0], pts[i][1]); }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }
  function line(ctx, x1, y1, x2, y2, color, lw) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function text(ctx, s, x, y, px, color, align) {
    ctx.save(); ctx.font = 'bold ' + Math.round(px) + 'px sans-serif'; ctx.fillStyle = color || COL.sumi; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.restore();
  }
  /* かたち（○●△□×☆）を (0,0) まん中・半径 r で */
  var SHAPE_NAMES = { maru: 'しろまる', kuro: 'くろまる', sankaku: 'さんかく', shikaku: 'しかく', batsu: 'ばつ', hoshi: 'ほし' };
  WH.SHAPE_NAMES = SHAPE_NAMES;
  function drawShape(ctx, name, r, colorFill) {
    var i, p = [], a;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (name === 'maru') { circle(ctx, 0, 0, r, COL.shiro, COL.sumi, Math.max(2, r * 0.18)); }
    else if (name === 'kuro') { circle(ctx, 0, 0, r, colorFill || COL.sumi, COL.sumi, 2); }
    else if (name === 'sankaku') { poly(ctx, [[0, -r * 1.1], [r * 1.05, r * 0.8], [-r * 1.05, r * 0.8]], colorFill || COL.daidai, COL.sumi, Math.max(2, r * 0.14)); }
    else if (name === 'shikaku') { ctx.beginPath(); ctx.rect(-r * 0.9, -r * 0.9, r * 1.8, r * 1.8); ctx.fillStyle = colorFill || COL.mizu; ctx.fill(); ctx.strokeStyle = COL.sumi; ctx.lineWidth = Math.max(2, r * 0.14); ctx.stroke(); }
    else if (name === 'batsu') { ctx.strokeStyle = colorFill || COL.sumi; ctx.lineWidth = Math.max(2.5, r * 0.22); ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); }
    else if (name === 'hoshi') {
      for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; p.push([Math.cos(a) * (i % 2 ? r * 0.48 : r * 1.15), Math.sin(a) * (i % 2 ? r * 0.48 : r * 1.15)]); }
      poly(ctx, p, colorFill || COL.ki, COL.sumi, Math.max(2, r * 0.12));
    }
  }
  WH.draw = { circle: circle, ellipse: ellipse, poly: poly, line: line, roundRect: roundRect, text: text, shape: drawShape };

  function setupCanvas(canvas) {
    var css = canvas.clientWidth || parseInt(canvas.getAttribute('width'), 10) || 120, dpr = global.devicePixelRatio || 1, ctx, px = Math.round(css * dpr), h = canvas.clientHeight || parseInt(canvas.getAttribute('height'), 10) || css, py = Math.round(h * dpr);
    /* 見た目の大きさを CSS で固定してから 中の画素数を dpr 倍にする。固定しないと 描くたびに 2倍・4倍… と育つ（iPad で実測・2026-11-01） */
    if (!canvas.style.width) { canvas.style.width = css + 'px'; canvas.style.height = h + 'px'; }
    if (canvas.width !== px || canvas.height !== py) { canvas.width = px; canvas.height = py; }
    ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.scale(dpr, dpr);
    return { ctx: ctx, w: css, h: h };
  }
  WH.setupCanvas = setupCanvas;
  function paper(ctx, w, h, frame) {
    ctx.fillStyle = COL.kami; ctx.strokeStyle = frame || COL.sumi; ctx.lineWidth = Math.max(2, w * 0.012);
    roundRect(ctx, 1.5, 1.5, w - 3, h - 3, Math.min(w, h) * 0.06); ctx.fill(); ctx.stroke();
  }
  WH.paper = paper;

  /* ================= 絵の 一覧（img/<id>.png・66枚＝ちえの もり と 同じ絵）=================
     m＝音（しりとり に つかう）。季節・なかま・たべもの・いきもの・のりもの・もちもの の しるし */
  var ITEMS = [
    { id: 'sakura', name: 'さくら', m: ['さ', 'く', 'ら'], season: 'haru', plant: true },
    { id: 'tulip', name: 'ちゅーりっぷ', m: ['ちゅ', 'ー', 'り', 'っ', 'ぷ'], season: 'haru', plant: true },
    { id: 'koinobori', name: 'こいのぼり', m: ['こ', 'い', 'の', 'ぼ', 'り'], season: 'haru' },
    { id: 'tanpopo', name: 'たんぽぽ', m: ['た', 'ん', 'ぽ', 'ぽ'], season: 'haru', plant: true },
    { id: 'ichigo', name: 'いちご', m: ['い', 'ち', 'ご'], season: 'haru', food: true },
    { id: 'hinamatsuri', name: 'ひなにんぎょう', m: ['ひ', 'な', 'に', 'ん', 'ぎょ', 'う'], season: 'haru' },
    { id: 'suika', name: 'すいか', m: ['す', 'い', 'か'], season: 'natsu', food: true },
    { id: 'himawari', name: 'ひまわり', m: ['ひ', 'ま', 'わ', 'り'], season: 'natsu', plant: true },
    { id: 'semi', name: 'せみ', m: ['せ', 'み'], season: 'natsu', animal: true, cat: 'mushi' },
    { id: 'asagao', name: 'あさがお', m: ['あ', 'さ', 'が', 'お'], season: 'natsu', plant: true },
    { id: 'kakigori', name: 'かきごおり', m: ['か', 'き', 'ご', 'お', 'り'], season: 'natsu', food: true },
    { id: 'tanabata', name: 'たなばた', m: ['た', 'な', 'ば', 'た'], season: 'natsu' },
    { id: 'kaki', name: 'かき', m: ['か', 'き'], season: 'aki', food: true },
    { id: 'kuri', name: 'くり', m: ['く', 'り'], season: 'aki', food: true },
    { id: 'momiji', name: 'もみじ', m: ['も', 'み', 'じ'], season: 'aki', plant: true },
    { id: 'tonbo', name: 'とんぼ', m: ['と', 'ん', 'ぼ'], season: 'aki', animal: true, cat: 'mushi' },
    { id: 'otsukimi', name: 'おつきみ', m: ['お', 'つ', 'き', 'み'], season: 'aki' },
    { id: 'kosumosu', name: 'こすもす', m: ['こ', 'す', 'も', 'す'], season: 'aki', plant: true },
    { id: 'yukidaruma', name: 'ゆきだるま', m: ['ゆ', 'き', 'だ', 'る', 'ま'], season: 'fuyu' },
    { id: 'mikan', name: 'みかん', m: ['み', 'か', 'ん'], season: 'fuyu', food: true },
    { id: 'tsubaki', name: 'つばき', m: ['つ', 'ば', 'き'], season: 'fuyu', plant: true },
    { id: 'kagamimochi', name: 'かがみもち', m: ['か', 'が', 'み', 'も', 'ち'], season: 'fuyu', food: true },
    { id: 'setsubun', name: 'せつぶん', m: ['せ', 'つ', 'ぶ', 'ん'], season: 'fuyu' },
    { id: 'christmas_tree', name: 'くりすますつりー', m: ['く', 'り', 'す', 'ま', 'す', 'つ', 'り', 'ー'], season: 'fuyu' },
    { id: 'hato', name: 'はと', m: ['は', 'と'], cat: 'tori', animal: true },
    { id: 'karasu', name: 'からす', m: ['か', 'ら', 'す'], cat: 'tori', animal: true },
    { id: 'suzume', name: 'すずめ', m: ['す', 'ず', 'め'], cat: 'tori', animal: true },
    { id: 'kabutomushi', name: 'かぶとむし', m: ['か', 'ぶ', 'と', 'む', 'し'], cat: 'mushi', animal: true },
    { id: 'tentoumushi', name: 'てんとうむし', m: ['て', 'ん', 'と', 'う', 'む', 'し'], cat: 'mushi', animal: true },
    { id: 'kamakiri', name: 'かまきり', m: ['か', 'ま', 'き', 'り'], cat: 'mushi', animal: true },
    { id: 'tai', name: 'たい', m: ['た', 'い'], cat: 'sakana', animal: true },
    { id: 'kingyo', name: 'きんぎょ', m: ['き', 'ん', 'ぎょ'], cat: 'sakana', animal: true },
    { id: 'unagi', name: 'うなぎ', m: ['う', 'な', 'ぎ'], cat: 'sakana', animal: true },
    { id: 'tokage', name: 'とかげ', m: ['と', 'か', 'げ'], cat: 'hachu', animal: true },
    { id: 'kaeru', name: 'かえる', m: ['か', 'え', 'る'], cat: 'hachu', animal: true },
    { id: 'kame', name: 'かめ', m: ['か', 'め'], cat: 'hachu', animal: true },
    { id: 'inu', name: 'いぬ', m: ['い', 'ぬ'], cat: 'kemono', animal: true },
    { id: 'saru', name: 'さる', m: ['さ', 'る'], cat: 'kemono', animal: true },
    { id: 'zou', name: 'ぞう', m: ['ぞ', 'う'], cat: 'kemono', animal: true },
    { id: 'densha', name: 'でんしゃ', m: ['で', 'ん', 'しゃ'], cat: 'norimono', ride: true },
    { id: 'jitensha', name: 'じてんしゃ', m: ['じ', 'て', 'ん', 'しゃ'], cat: 'norimono', ride: true },
    { id: 'kuruma', name: 'くるま', m: ['く', 'る', 'ま'], cat: 'norimono', ride: true },
    { id: 'ringo', name: 'りんご', m: ['り', 'ん', 'ご'], food: true },
    { id: 'gorira', name: 'ごりら', m: ['ご', 'り', 'ら'], animal: true, cat: 'kemono' },
    { id: 'rappa', name: 'らっぱ', m: ['ら', 'っ', 'ぱ'], carry: true, gakki: true },
    { id: 'panda', name: 'ぱんだ', m: ['ぱ', 'ん', 'だ'], animal: true, cat: 'kemono' },
    { id: 'daikon', name: 'だいこん', m: ['だ', 'い', 'こ', 'ん'], food: true },
    { id: 'nezumi', name: 'ねずみ', m: ['ね', 'ず', 'み'], animal: true, cat: 'kemono' },
    { id: 'enpitsu', name: 'えんぴつ', m: ['え', 'ん', 'ぴ', 'つ'], carry: true, bunbogu: true },
    { id: 'hon', name: 'ほん', m: ['ほ', 'ん'], carry: true, bunbogu: true },
    { id: 'kasa', name: 'かさ', m: ['か', 'さ'], carry: true, ame: true },
    { id: 'tsukue', name: 'つくえ', m: ['つ', 'く', 'え'], kagu: true },
    { id: 'neko', name: 'ねこ', m: ['ね', 'こ'], animal: true, cat: 'kemono' },
    { id: 'kutsu', name: 'くつ', m: ['く', 'つ'], carry: true, kiru: true },
    { id: 'ki', name: 'き', m: ['き'], plant: true },
    { id: 'hana', name: 'はな', m: ['は', 'な'], plant: true },
    { id: 'tsumiki', name: 'つみき', m: ['つ', 'み', 'き'], carry: true, omocha: true },
    { id: 'boushi', name: 'ぼうし', m: ['ぼ', 'う', 'し'], carry: true, kiru: true },
    { id: 'tokei', name: 'とけい', m: ['と', 'け', 'い'], carry: true },
    { id: 'isu', name: 'いす', m: ['い', 'す'], kagu: true },
    { id: 'uchiwa', name: 'うちわ', m: ['う', 'ち', 'わ'], carry: true },
    { id: 'kuma', name: 'くま', m: ['く', 'ま'], animal: true, cat: 'kemono' },
    { id: 'banana', name: 'ばなな', m: ['ば', 'な', 'な'], food: true },
    { id: 'terebi', name: 'てれび', m: ['て', 'れ', 'び'], kagu: true },
    { id: 'hasami', name: 'はさみ', m: ['は', 'さ', 'み'], carry: true, bunbogu: true },
    { id: 'basu', name: 'ばす', m: ['ば', 'す'], ride: true, cat: 'norimono' }
  ];
  WH.ITEMS = ITEMS;
  var ITEM_BY_ID = {};
  (function () { var i; for (i = 0; i < ITEMS.length; i++) { ITEM_BY_ID[ITEMS[i].id] = ITEMS[i]; } })();
  WH.itemById = function (id) { return ITEM_BY_ID[id]; };
  WH.itemsWhere = function (fn) { var i, out = []; for (i = 0; i < ITEMS.length; i++) { if (fn(ITEMS[i])) { out.push(ITEMS[i]); } } return out; };
  WH.SEASON_NAME = { haru: 'はる', natsu: 'なつ', aki: 'あき', fuyu: 'ふゆ' };
  WH.CAT_NAME = { tori: 'とり', mushi: 'むし', sakana: 'さかな', hachu: 'かえるや かめの なかま', kemono: 'けもの', norimono: 'のりもの' };

  /* ================= おと（ファイルを使わず その場で つくる・ちえの もり と 同じ しくみ） ================= */
  var NOTE = { C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784.0, A5: 880.0, B5: 987.8,
    C6: 1046.5, D6: 1174.7, E6: 1318.5, F6: 1396.9, G6: 1568.0, A6: 1760.0, C7: 2093.0, E4: 329.6, G4: 392.0, A4: 440.0 };
  WH.NOTE = NOTE;
  var SOUNDS = {
    tap: [['A5', 0, 0.06, 0.35, 'triangle']],
    pick: [['E6', 0, 0.05, 0.3, 'triangle']],
    ok: [['C6', 0, 0.09, 0.6, 'square'], ['E6', 0.08, 0.09, 0.6, 'square'], ['G6', 0.16, 0.09, 0.6, 'square'], ['C7', 0.24, 0.28, 0.6, 'square'], ['G6', 0.24, 0.28, 0.35, 'triangle']],
    ok2: [['E6', 0, 0.09, 0.5, 'square'], ['A6', 0.09, 0.22, 0.5, 'square']],
    oshii: [['G5', 0, 0.12, 0.45, 'sine'], ['E5', 0.13, 0.2, 0.45, 'sine']],
    kotae: [['A4', 0, 0.16, 0.4, 'sine'], ['C5', 0.16, 0.16, 0.4, 'sine'], ['E5', 0.32, 0.26, 0.4, 'sine']],
    hanashi: [['C6', 0, 0.1, 0.45, 'triangle'], ['E6', 0.1, 0.2, 0.45, 'triangle']],
    round: [['C5', 0, 0.12, 0.55, 'square'], ['E5', 0.13, 0.12, 0.55, 'square'], ['G5', 0.26, 0.12, 0.55, 'square'], ['C6', 0.42, 0.55, 0.5, 'square'], ['E6', 0.42, 0.55, 0.35, 'triangle'], ['G5', 0.42, 0.55, 0.35, 'triangle']],
    perfect: [['C5', 0, 0.1, 0.55, 'square'], ['E5', 0.1, 0.1, 0.55, 'square'], ['G5', 0.2, 0.1, 0.55, 'square'], ['C6', 0.3, 0.1, 0.55, 'square'], ['E6', 0.4, 0.1, 0.55, 'square'], ['G6', 0.5, 0.1, 0.55, 'square'], ['C7', 0.62, 0.7, 0.5, 'square'], ['E6', 0.62, 0.7, 0.35, 'triangle'], ['G6', 0.62, 0.7, 0.35, 'triangle']],
    grow: [['G5', 0, 0.08, 0.45, 'triangle'], ['C6', 0.07, 0.08, 0.45, 'triangle'], ['E6', 0.14, 0.08, 0.45, 'triangle'], ['G6', 0.21, 0.08, 0.45, 'triangle'], ['C7', 0.28, 0.08, 0.45, 'triangle'], ['E6', 0.36, 0.08, 0.4, 'triangle'], ['G6', 0.43, 0.08, 0.4, 'triangle'], ['C7', 0.5, 0.45, 0.5, 'triangle']],
    combo: [['C6', 0, 0.07, 0.5, 'square'], ['E6', 0.07, 0.07, 0.5, 'square'], ['G6', 0.14, 0.07, 0.5, 'square'], ['C7', 0.21, 0.07, 0.5, 'square'], ['E6', 0.3, 0.2, 0.45, 'triangle'], ['G6', 0.3, 0.2, 0.45, 'triangle'], ['C7', 0.3, 0.3, 0.45, 'triangle']]
  };
  WH.SOUNDS = SOUNDS;
  var snd = { ctx: null, on: true, vol: 0.22, keep: null, voice: true };
  WH.snd = snd;
  function audioClass() { return global.AudioContext || global.webkitAudioContext || null; }
  /* 音の ない 短い WAV（8000Hz・16bit・0.25びょう）。消音スイッチ対策の ために ながしつづける */
  function silentWav() {
    var n = 2000, len = n * 2, h, i;
    function u32(v) { return String.fromCharCode(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255); }
    function u16(v) { return String.fromCharCode(v & 255, (v >> 8) & 255); }
    h = 'RIFF' + u32(36 + len) + 'WAVE' + 'fmt ' + u32(16) + u16(1) + u16(1) + u32(8000) + u32(16000) + u16(2) + u16(16) + 'data' + u32(len);
    for (i = 0; i < len; i++) { h += String.fromCharCode(0); }
    return 'data:audio/wav;base64,' + global.btoa(h);
  }
  WH.silentWav = silentWav;
  /* 音の しくみが 止まっていたら 起こしなおす（K4）。鳴らす 入口で 毎回 見る。失敗しても 止まらない */
  function wake(ctx) {
    var p;
    try {
      if (ctx && ctx.state && ctx.state !== 'running' && ctx.resume) {
        p = ctx.resume();
        if (p && typeof p.then === 'function') { p.then(function () {}, function () {}); }
        return true;
      }
    } catch (e) { /* 鳴らなくても つかえる */ }
    return false;
  }
  WH.wakeAudio = wake;
  snd.unlock = function () {
    var AC, b, src, a;
    try {
      if (!snd.keep && global.Audio) {
        a = new global.Audio(); a.src = silentWav(); a.loop = true;
        snd.keep = a;
      }
      if (snd.keep && snd.on && snd.keep.paused) { snd.keep.play(); }
    } catch (e0) { /* 鳴らなくても つかえる */ }
    try {
      if (!snd.ctx) {
        AC = audioClass(); if (!AC) { return false; }
        snd.ctx = new AC();
        b = snd.ctx.createBuffer(1, 1, 22050);
        src = snd.ctx.createBufferSource(); src.buffer = b; src.connect(snd.ctx.destination);
        if (src.start) { src.start(0); } else if (src.noteOn) { src.noteOn(0); }
      }
      wake(snd.ctx);
      return true;
    } catch (e) { return false; }
  };
  function tone(ctx, freq, at, dur, vol, type) {
    var o = ctx.createOscillator(), g = ctx.createGain(), peak = Math.max(0.0002, vol * snd.vol);
    o.type = type || 'triangle';
    o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(ctx.destination);
    if (o.start) { o.start(at); o.stop(at + dur + 0.03); } else { o.noteOn(at); o.noteOff(at + dur + 0.03); }
  }
  snd.play = function (name, delay) {
    var ctx = snd.ctx, seq = SOUNDS[name], t0, i, n;
    if (!snd.on || !ctx || !seq) { return false; }
    wake(ctx);
    try {
      t0 = ctx.currentTime + 0.01 + (delay || 0);
      for (i = 0; i < seq.length; i++) { n = seq[i]; tone(ctx, NOTE[n[0]], t0 + n[1], n[2], n[3], n[4]); }
      return true;
    } catch (e) { return false; }
  };
  snd.say = function (t) {
    var u;
    if (!snd.on || snd.voice === false) { return false; }
    try {
      if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) { return false; }
      global.speechSynthesis.cancel();
      u = new global.SpeechSynthesisUtterance(t);
      u.lang = 'ja-JP'; u.rate = 0.9;
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
  snd.hush = function () { try { if (global.speechSynthesis) { global.speechSynthesis.cancel(); } } catch (e) { /* なくても */ } };

  /* ================= きろく（端末内保存） ================= */
  WH.GENRE_IDS = [];   /* gen.js が うめる */
  function freshState() {
    var g = {}, i;
    for (i = 0; i < WH.GENRE_IDS.length; i++) { g[WH.GENRE_IDS[i]] = { level: 1, rounds: 0, q: 0, ok: 0, exp: 0 }; }
    return { schema: WH.SCHEMA, name: '', perRound: 5, mode: 'sensei', total: 0, cFruits: 0, cIndex: 0, zukan: [], lap: 0, g: g, mix: { rounds: 0, q: 0, ok: 0, exp: 0 } };
  }
  WH.freshState = freshState;
  function loadState() {
    var raw = null, s, i, k;
    try { raw = global.localStorage ? global.localStorage.getItem(WH.STORE_KEY) : null; } catch (e) { raw = null; }
    if (!raw) { return freshState(); }
    try { s = JSON.parse(raw); } catch (e2) { return freshState(); }
    if (!s || s.schema !== WH.SCHEMA) { return freshState(); }
    for (i = 0; i < WH.GENRE_IDS.length; i++) { k = WH.GENRE_IDS[i]; if (!s.g[k]) { s.g[k] = { level: 1, rounds: 0, q: 0, ok: 0, exp: 0 }; } }
    if (!s.mix) { s.mix = { rounds: 0, q: 0, ok: 0, exp: 0 }; }
    if (s.mode !== 'hitori' && s.mode !== 'sensei') { s.mode = 'sensei'; }
    if (!s.zukan) { s.zukan = []; }
    WH.cleanZukan(s);
    return s;
  }
  function saveState(s) { try { if (global.localStorage) { global.localStorage.setItem(WH.STORE_KEY, JSON.stringify(s)); } } catch (e) { /* 保存できなくても あそべる */ } }
  WH.loadState = loadState; WH.saveState = saveState;

  /* 1まわりの あとの レベルの 上げ下げ＝はじめて正解が 8わり以上なら 上へ・4わり以下なら 下へ（K10） */
  function nextLevel(level, firstOk, total) {
    if (total <= 0) { return level; }
    if (firstOk >= Math.ceil(total * 0.8) && level < 3) { return level + 1; }
    if (firstOk <= Math.floor(total * 0.4) && level > 1) { return level - 1; }
    return level;
  }
  WH.nextLevel = nextLevel;
  WH.LEVEL_NAME = { 1: 'やさしい', 2: 'ふつう', 3: 'むずかしい' };

  /* ================= ごほうび＝むしが そだつ（みのりを あつめると たまご→ようちゅう→さなぎ→せいちゅう。せいちゅうは ずかんへ） ================= */
  var GROW = [0, 6, 14, 24];
  WH.GROW = GROW;
  function stageOf(f) { if (f >= GROW[3]) { return 3; } if (f >= GROW[2]) { return 2; } if (f >= GROW[1]) { return 1; } return 0; }
  WH.stageOf = stageOf;
  WH.STAGE_NAME = ['たまご', 'ようちゅう', 'さなぎ', 'せいちゅう'];
  var PICS = [
    { id: 'tentoumushi', name: 'てんとうむし', draw: function (ctx) {
      line(ctx, -16, -6, -30, -14, COL.sumi, 2.5); line(ctx, -20, 6, -34, 8, COL.sumi, 2.5); line(ctx, -14, 18, -26, 28, COL.sumi, 2.5);
      line(ctx, 16, -6, 30, -14, COL.sumi, 2.5); line(ctx, 20, 6, 34, 8, COL.sumi, 2.5); line(ctx, 14, 18, 26, 28, COL.sumi, 2.5);
      circle(ctx, 0, 4, 23, COL.aka, COL.sumi, 2); circle(ctx, 0, -18, 10, COL.sumi); line(ctx, 0, -10, 0, 27, COL.sumi, 2);
      circle(ctx, -11, -2, 5.5, COL.sumi); circle(ctx, 10, 9, 5.5, COL.sumi); circle(ctx, -8, 16, 4.5, COL.sumi); circle(ctx, 11, -4, 4, COL.sumi);
    } },
    { id: 'kabutomushi', name: 'かぶとむし', draw: function (ctx) {
      line(ctx, -12, -2, -30, -12, COL.sumi, 3); line(ctx, -14, 8, -34, 12, COL.sumi, 3); line(ctx, -8, 18, -26, 30, COL.sumi, 3);
      line(ctx, 12, -2, 30, -12, COL.sumi, 3); line(ctx, 14, 8, 34, 12, COL.sumi, 3); line(ctx, 8, 18, 26, 30, COL.sumi, 3);
      ellipse(ctx, 0, 8, 20, 24, '#5a3b1e', COL.sumi, 2); line(ctx, 0, -10, 0, 30, COL.sumi, 1.5);
      ellipse(ctx, 0, -18, 12, 9, '#5a3b1e', COL.sumi, 2);
      line(ctx, 0, -24, 0, -40, COL.sumi, 4); line(ctx, 0, -40, -9, -48, COL.sumi, 3.5); line(ctx, 0, -40, 9, -48, COL.sumi, 3.5);
      circle(ctx, -5, -19, 1.8, COL.shiro); circle(ctx, 5, -19, 1.8, COL.shiro);
    } },
    { id: 'chou', name: 'ちょう', draw: function (ctx) {
      ellipse(ctx, -20, -10, 18, 15, COL.daidai, COL.sumi, 2); ellipse(ctx, 20, -10, 18, 15, COL.daidai, COL.sumi, 2);
      ellipse(ctx, -16, 14, 13, 11, COL.ki, COL.sumi, 2); ellipse(ctx, 16, 14, 13, 11, COL.ki, COL.sumi, 2);
      circle(ctx, -22, -10, 5, COL.shiro, COL.sumi, 1.5); circle(ctx, 22, -10, 5, COL.shiro, COL.sumi, 1.5);
      ellipse(ctx, 0, 2, 5, 22, COL.sumi); line(ctx, -2, -20, -10, -34, COL.sumi, 2); line(ctx, 2, -20, 10, -34, COL.sumi, 2);
    } }
  ];
  /* 4ひき目から＝絵（img/zukan/<id>.png・甲虫44種）。絵は 読めたら 描く。読めるまでは ？。ずかんは 虫だけ（v3＝しげ指示「虫以外は無くして」） */
  var ZUKAN_IMGS = [
    ['herakuresu_ookabuto', 'ヘラクレスオオカブト'], ['kookasasu_ookabuto', 'コーカサスオオカブト'], ['atorasu_ookabuto', 'アトラスオオカブト'], ['neputyuun_ookabuto', 'ネプチューンオオカブト'], ['satan_ookabuto', 'サタンオオカブト'],
    ['guranto_shirokabuto', 'グラントシロカブト'], ['gohonzuno_kabuto', 'ゴホンヅノカブト'], ['akuteon_zoukabuto', 'アクティオンゾウカブト'], ['kentaurusu_ookabuto', 'ケンタウルスオオカブト'], ['sai_kabuto', 'サイカブト'],
    ['nokogiri_kuwagata', 'ノコギリクワガタ'], ['ookuwagata', 'オオクワガタ'], ['miyama_kuwagata', 'ミヤマクワガタ'], ['kokuwagata', 'コクワガタ'], ['hirata_kuwagata', 'ヒラタクワガタ'],
    ['akaashi_kuwagata', 'アカアシクワガタ'], ['suji_kuwagata', 'スジクワガタ'], ['girafa_nokogiri', 'ギラファノコギリクワガタ'], ['nijiiro_kuwagata', 'ニジイロクワガタ'], ['tarandusu_ootsuya', 'タランドゥスオオツヤクワガタ'],
    ['parawan_oohirata', 'パラワンオオヒラタクワガタ'], ['sumatora_oohirata', 'スマトラオオヒラタクワガタ'], ['ougon_oni_kuwagata', 'オウゴンオニクワガタ'], ['erafusu_hosoaka', 'エラフスホソアカクワガタ'], ['mengata_kuwagata', 'メンガタクワガタ'],
    ['mandiburarisu_futamata', 'マンディブラリスフタマタクワガタ'], ['antaeusu_ookuwagata', 'アンタエウスオオクワガタ'], ['yooroppa_miyama', 'ヨーロッパミヤマクワガタ'], ['rakodaaru_tsuya', 'ラコダールツヤクワガタ'],
    ['goraiasu_ootsunohanamuguri', 'ゴライアスオオツノハナムグリ'], ['tenaga_kogane', 'テナガコガネ'], ['kanabun', 'カナブン'], ['yamato_tamamushi', 'ヤマトタマムシ'], ['gengorou', 'ゲンゴロウ'],
    ['genji_botaru', 'ゲンジボタル'], ['gomadara_kamikiri', 'ゴマダラカミキリ'], ['ruriboshi_kamikiri', 'ルリボシカミキリ'], ['oo_osamushi', 'オオオサムシ'], ['hanmyou', 'ハンミョウ'],
    ['midori_senchikogane', 'ミドリセンチコガネ'], ['daikoku_kogane', 'ダイコクコガネ'], ['sukarabe', 'スカラベ'], ['oozoumushi', 'オオゾウムシ'], ['mizusumashi', 'ミズスマシ']
  ];
  var ZIMG = {};
  WH.onImgReady = null;
  function zimg(id) {
    var im;
    if (!ZIMG[id]) {
      im = new global.Image();
      im.onload = function () { if (WH.onImgReady) { try { WH.onImgReady(id); } catch (e) { /* 描き直しは 任意 */ } } };
      im.src = 'img/zukan/' + id + '.png';
      ZIMG[id] = im;
    }
    return ZIMG[id];
  }
  WH.preloadZukan = function () { var i; for (i = 0; i < ZUKAN_IMGS.length; i++) { zimg(ZUKAN_IMGS[i][0]); } };
  function drawZukanImg(ctx, id) {
    var im = zimg(id);
    if (im.complete && im.naturalWidth > 0) { ctx.drawImage(im, -50, -50, 100, 100); }
    else { circle(ctx, 0, 0, 36, COL.kami, COL.sumi, 2.5); text(ctx, '?', 0, 2, 40, COL.sumi); }
  }
  (function () {
    var i;
    for (i = 0; i < ZUKAN_IMGS.length; i++) {
      PICS.push({ id: ZUKAN_IMGS[i][0], name: ZUKAN_IMGS[i][1], img: true, draw: (function (id) { return function (ctx) { drawZukanImg(ctx, id); }; })(ZUKAN_IMGS[i][0]) });
    }
  })();
  WH.ZUKAN_IMGS = ZUKAN_IMGS;
  WH.PICS = PICS;
  var PIC_BY_ID = {};
  (function () { var i; for (i = 0; i < PICS.length; i++) { PIC_BY_ID[PICS[i].id] = PICS[i]; } })();
  WH.picById = function (id) { return PIC_BY_ID[id]; };
  /* 端末に のこった 古い ずかんの きろく（さかな など＝v2 まで）を 外す。外した 数を かえす */
  function cleanZukan(s) {
    var i, out = [], n0;
    if (!s || !s.zukan || !s.zukan.length) { return 0; }
    n0 = s.zukan.length;
    for (i = 0; i < s.zukan.length; i++) { if (PIC_BY_ID[s.zukan[i]]) { out.push(s.zukan[i]); } }
    s.zukan = out;
    return n0 - out.length;
  }
  WH.cleanZukan = cleanZukan;

  function addFruits(s, n) {
    var events = [], before = stageOf(s.cFruits), after, id;
    s.total += n; s.cFruits += n;
    while (s.cFruits >= GROW[3]) {
      id = PICS[s.cIndex % PICS.length].id;
      s.zukan.push(id); events.push({ kind: 'visitor', id: id });
      s.cFruits -= GROW[3]; s.cIndex += 1;
      if (s.cIndex % PICS.length === 0) { s.lap += 1; events.push({ kind: 'lap', lap: s.lap }); }
      before = 0;
    }
    after = stageOf(s.cFruits);
    if (after > before) { events.push({ kind: 'stage', stage: after }); }
    return events;
  }
  WH.addFruits = addFruits;
  var RANKS = [[0, 'はなしの みならい'], [20, 'はなしの なかま'], [50, 'はなしの めいじん'], [100, 'はなしの はかせ'], [200, 'はなしの たつじん']];
  function rankOf(total) { var i, name = RANKS[0][1]; for (i = 0; i < RANKS.length; i++) { if (total >= RANKS[i][0]) { name = RANKS[i][1]; } } return name; }
  WH.rankOf = rankOf;
  function nextRankAt(total) { var i; for (i = 0; i < RANKS.length; i++) { if (total < RANKS[i][0]) { return RANKS[i][0]; } } return null; }
  WH.nextRankAt = nextRankAt;

  /* むし＝たまご → ようちゅう → さなぎ → せいちゅう（みのりの かず）。せいちゅうは ずかんの 絵（ちえの もり と 同じ そだち方） */
  function drawStage(ctx, size, stage, picId) {
    var s = size / 100;
    ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round';
    if (stage === 0) { ellipse(ctx, 0, 2, 24, 30, COL.kami, COL.sumi, 2.5); circle(ctx, -8, -6, 4, COL.ki); circle(ctx, 9, 4, 5, COL.ki); circle(ctx, -4, 16, 3.5, COL.ki); }
    else if (stage === 1) { circle(ctx, -24, 8, 9, COL.ki, COL.sumi, 2); circle(ctx, -10, 6, 10, COL.ki, COL.sumi, 2); circle(ctx, 5, 4, 10, COL.ki, COL.sumi, 2); circle(ctx, 22, 2, 12, COL.ki, COL.sumi, 2); circle(ctx, 26, -2, 2.2, COL.sumi); }
    else if (stage === 2) {
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(26, -6, 16, 24); ctx.quadraticCurveTo(0, 40, -16, 24); ctx.quadraticCurveTo(-26, -6, 0, -34); ctx.closePath();
      ctx.fillStyle = COL.daidai; ctx.fill(); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2.5; ctx.stroke();
      line(ctx, -10, -4, 10, -4, COL.sumi, 2); line(ctx, -12, 8, 12, 8, COL.sumi, 2); line(ctx, -8, 20, 8, 20, COL.sumi, 2); line(ctx, 0, -34, 0, -44, COL.sumi, 3);
    } else { PIC_BY_ID[picId].draw(ctx); }
    ctx.restore();
  }
  WH.drawStage = drawStage;
  function paintStage(canvas, stage, picId) {
    var c = setupCanvas(canvas);
    c.ctx.translate(c.w / 2, c.h / 2); drawStage(c.ctx, Math.min(c.w, c.h) * 0.9, stage, picId);
  }
  WH.paintStage = paintStage;
  function paintPic(canvas, picId) {
    var c = setupCanvas(canvas);
    c.ctx.translate(c.w / 2, c.h / 2); c.ctx.scale(Math.min(c.w, c.h) / 110, Math.min(c.w, c.h) / 110); PIC_BY_ID[picId].draw(c.ctx);
  }
  WH.paintPic = paintPic;

  /* ================= 子どもの 画面に 出さない ことば（K22）と 否定形の 約束（K24） ================= */
  WH.BAN_WORDS = ['てんさい', 'あたまがいい', 'よわい', 'にがて', 'すごすぎる', 'だめ', 'ばか', 'おそい', 'へた', 'しっぱい'];
  WH.banHits = function (s) { var i, out = [], t = String(s).replace(/\s+/g, ''); for (i = 0; i < WH.BAN_WORDS.length; i++) { if (t.indexOf(WH.BAN_WORDS[i]) >= 0) { out.push(WH.BAN_WORDS[i]); } } return out; };
  WH.negHits = function (s) { var m = String(s).match(/(しない|しないで|だめ|いけません|やめて|ちゃだめ)/g); return m ? m : []; };

  global.WH = WH;
})(typeof window !== 'undefined' ? window : this);
