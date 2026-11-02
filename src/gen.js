/* わけを はなそう ―― もんだいの 型（作る・描く・ことば・自己点検）。古い Safari で動く書き方だけ。
   型（1対1の 口頭試問の 練習帳 20問と、公開されている 出題例 から）＝
     himo        ひも（むすびめを ほどくと どれが ながい）      … 練習帳1（未測量）
     kurabe      くらべる（のんだ ジュース・まめの やま・おおきい じゅん） … 練習帳2・3、出題例（長さ・水量・大小）
     shiso       シーソー（2ばんめに おもい・かるい）           … 練習帳4（推理）
     kazoe       かぞえる（いくつ・ちがい・おなじ かず）          … 練習帳7・8・9（数）
     wakeru      わける（ずつ・おなじ かずずつ・あまり）         … 練習帳10、出題例（おはじき・ドングリ）
     kazuhanashi かずの おはなし（ふえて へって いま いくつ）     … 練習帳11（数・聞き取り）
     nakama      なかま（はずれ・にている ところ・2つに わける）  … 練習帳5・6、出題例（分類＋理由）
     onajie      おなじ え（ほとんど おなじ 絵から 同じものを）   … 練習帳12（図形・細部）
     katachi     かたち（あわせる・きれない・わける せん・おりがみ） … 練習帳13・14・16・17・20、出題例（構成・折り）
     ana         あなに ぴったり（こうしの あなに あう もの）     … 練習帳15
     hanashi     おはなし（えで おはなし・しつもん・どっちが すき） … 出題例（お話作り・口頭質問）＝こたえの ない もんだい */
(function (global) {
  'use strict';
  var WH = global.WH, COL = WH.COL, D = WH.draw, rnd = WH.rnd, ri = WH.ri, pick = WH.pick, shuffle = WH.shuffle, uniqNums = WH.uniqNums;
  var itemsWhere = WH.itemsWhere, itemById = WH.itemById;
  var NAMES = ['はなこさん', 'たろうくん', 'ももちゃん', 'けんくん'];

  /* ================= 0 共通（順位・ふたつ きく） ================= */
  function orderDesc(vals) { var idx = [], i; for (i = 0; i < vals.length; i++) { idx.push(i); } idx.sort(function (a, b) { return vals[b] - vals[a]; }); return idx; }
  /* 問いの ことば → [上からの 順位, 下から 数えるか] */
  var ASK_RANK = { long: [0, false], second: [1, false], third: [2, false], fourth: [3, false], short: [0, true], secondshort: [1, true], thirdshort: [2, true],
    most: [0, false], least: [0, true], heavy: [0, false], light: [0, true], secondlight: [1, true] };
  var ASK_DEPTH = { long: 1, short: 1, most: 1, least: 1, heavy: 1, light: 1, second: 2, secondshort: 2, secondlight: 2, third: 3, thirdshort: 3, fourth: 4 };
  function rankAnswer(vals, ask) { var o = orderDesc(vals), r = ASK_RANK[ask]; return r[1] ? o[o.length - 1 - r[0]] : o[r[0]]; }
  /* ふたつ きく＝1回の 読みで ○ と △ を こたえる組（kind: 'pair'）。2つの こたえは かならず ちがう えらびし */
  function setPair(q, vals, a0, a1) {
    q.kind = 'pair'; q.answerIndex = -1; q.asks = 2;
    q.parts = [{ ask: a0, answerIndex: rankAnswer(vals, a0), mark: '○' }, { ask: a1, answerIndex: rankAnswer(vals, a1), mark: '△' }];
    q.depth = Math.max(ASK_DEPTH[a0], ASK_DEPTH[a1]);
    return q;
  }
  function setSingle(q, vals, ask) { q.ask = ask; q.answerIndex = rankAnswer(vals, ask); q.depth = ASK_DEPTH[ask]; q.asks = 1; return q; }
  function distinctFrom(lo, hi, n) { var a = [], v; for (v = lo; v <= hi; v++) { a.push(v); } return shuffle(a).slice(0, n); }
  function maxOf(a) { var m = a[0], i; for (i = 1; i < a.length; i++) { if (a[i] > m) { m = a[i]; } } return m; }
  function argMax(a) { var b = 0, i; for (i = 1; i < a.length; i++) { if (a[i] > a[b]) { b = i; } } return b; }
  WH.rankAnswer = rankAnswer; WH.ASK_DEPTH = ASK_DEPTH;

  /* ================= 1 ひも ================= */
  /* 解き方＝musubi むすびめ（多いほど ほどくと ながい）・magari まがった ひも（ます目の へんを 数える）・zure はしが ずれた ひも（ひだりの はしを そろえる）・tsunagi つないだ ぼう（ぼうの 本数） */
  var HIMO_LV = { 1: { n: 3, asks: ['long', 'short'] }, 2: { n: 4, asks: ['long', 'short', 'second'] }, 3: { n: 6, asks: ['long', 'short', 'second', 'secondshort', 'third', 'thirdshort'], pair: 0.6 } };
  var HIMO_COLS = 18, HIMO_ANG = [0, 30, 45, 60];
  /* 見た目の わな＝見た目（look）が いちばんの ものは、ほんとうに いちばん ながい ものでは ない */
  function himoTrap(len, look) { return look[argMax(len)] < maxOf(look); }
  WH.himoTrap = himoTrap;
  function magariPath(L) {
    var lo = Math.ceil((L + 1) / 2), H = lo + ri(Math.min(HIMO_COLS - 1, L) - lo + 1), v = L - H, gaps = [], s, y = ri(3), pts, gx = 0, dy;
    for (s = 1; s < H; s++) { gaps.push(s); }
    gaps = shuffle(gaps).slice(0, v);
    pts = [[0, y]];
    for (s = 1; s <= H; s++) {
      gx++; pts.push([gx, y]);
      if (gaps.indexOf(s) >= 0) { dy = y === 0 ? 1 : (y === 2 ? -1 : (rnd() < 0.5 ? -1 : 1)); y += dy; pts.push([gx, y]); }
    }
    return { pts: pts, H: H };
  }
  function pathLen(pts) { var i, n = 0; for (i = 1; i < pts.length; i++) { n += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); } return n; }
  WH.pathLen = pathLen;
  function makeHimo(level, sch) {
    var lv = HIMO_LV[level], n = lv.n, q = { g: 'himo', schema: sch, sub: sch, level: level, kind: 'choose', cType: 'wide', v: ri(2), nItems: n }, i, tries, len, look, p, found = false, knots, pos, st, ang, a;
    if (sch === 'musubi') {
      knots = shuffle([0, 1, 2, 3, 4, 5]).slice(0, n); pos = [];
      for (i = 0; i < n; i++) { pos.push(shuffle([0.18, 0.32, 0.46, 0.6, 0.74, 0.86]).slice(0, knots[i]).sort(function (x, y) { return x - y; })); }
      q.knots = knots; q.pos = pos; q.len = knots.slice(); found = true;
    } else {
      for (tries = 0; tries < 200 && !found; tries++) {
        look = [];
        if (sch === 'magari') {
          len = distinctFrom(8, 19, n); q.paths = [];
          for (i = 0; i < n; i++) { p = magariPath(len[i]); q.paths.push(p.pts); look.push(p.H); }
        } else if (sch === 'zure') {
          len = distinctFrom(4, 13, n); st = [];
          for (i = 0; i < n; i++) { st.push(ri(Math.min(7, HIMO_COLS - len[i]) + 1)); look.push(st[i] + len[i]); }
          q.st = st;
        } else {
          len = distinctFrom(2, 9, n); ang = [];
          for (i = 0; i < n; i++) { a = pick(HIMO_ANG); ang.push(a); look.push(len[i] * Math.cos(a * Math.PI / 180)); }
          q.ang = ang;
        }
        found = himoTrap(len, look);
      }
      q.len = len; q.look = look;
    }
    if (!found) { return null; }
    q.choices = q.len.slice();
    if (lv.pair && rnd() < lv.pair) { return setPair(q, q.len, pick(['long', 'short']), pick(['third', 'thirdshort'])); }
    return setSingle(q, q.len, pick(lv.asks));
  }
  function paintHimoChoice(canvas, q, i, hint) {
    var c = WH.setupCanvas(canvas), ctx = c.ctx, y = c.h / 2, x0 = 14, x1 = c.w - (hint ? 54 : 14), k, x, sch = q.schema || 'musubi', cell, y0, pts, s, a, xx, yy, nx, ny, dir;
    ctx.fillStyle = COL.kami; ctx.fillRect(0, 0, c.w, c.h);
    if (sch === 'musubi') {
      D.line(ctx, x0, y, x1, y, '#b08a5a', 7);
      for (k = 0; k < q.pos[i].length; k++) {
        x = x0 + (x1 - x0) * q.pos[i][k];
        D.circle(ctx, x, y - 6, 7, COL.kami, '#8a5a2b', 3); D.circle(ctx, x + 6, y + 4, 5, COL.kami, '#8a5a2b', 3);
      }
    } else {
      cell = Math.min((c.w - x0 - 54) / HIMO_COLS, (c.h - 12) / 2); y0 = (c.h - cell * 2) / 2;
      if (sch === 'magari' || sch === 'zure') {
        for (k = 0; k <= HIMO_COLS; k++) { D.line(ctx, x0 + k * cell, y0, x0 + k * cell, y0 + cell * 2, '#ddd6c4', 1); }
        if (sch === 'magari') { for (k = 0; k <= 2; k++) { D.line(ctx, x0, y0 + k * cell, x0 + HIMO_COLS * cell, y0 + k * cell, '#ddd6c4', 1); } }
      }
      if (sch === 'magari') {
        pts = q.paths[i];
        ctx.beginPath(); ctx.moveTo(x0 + pts[0][0] * cell, y0 + pts[0][1] * cell);
        for (k = 1; k < pts.length; k++) { ctx.lineTo(x0 + pts[k][0] * cell, y0 + pts[k][1] * cell); }
        ctx.strokeStyle = '#b08a5a'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
        D.circle(ctx, x0 + pts[0][0] * cell, y0 + pts[0][1] * cell, 4, '#8a5a2b'); D.circle(ctx, x0 + pts[pts.length - 1][0] * cell, y0 + pts[pts.length - 1][1] * cell, 4, '#8a5a2b');
      } else if (sch === 'zure') {
        D.line(ctx, x0 + q.st[i] * cell, y, x0 + (q.st[i] + q.len[i]) * cell, y, '#b08a5a', 7);
        D.circle(ctx, x0 + q.st[i] * cell, y, 4.5, '#8a5a2b'); D.circle(ctx, x0 + (q.st[i] + q.len[i]) * cell, y, 4.5, '#8a5a2b');
      } else {
        s = Math.min(30, (c.w - x0 - 60) / 9); a = q.ang[i] * Math.PI / 180; xx = x0 + 4; yy = y - s * Math.sin(a) / 2; dir = 1;
        for (k = 0; k < q.len[i]; k++) { nx = xx + s * Math.cos(a); ny = yy + dir * s * Math.sin(a); D.line(ctx, xx, yy, nx, ny, '#b08a5a', 6); D.circle(ctx, xx, yy, 3.5, COL.kami, '#8a5a2b', 2); xx = nx; yy = ny; dir = -dir; }
        D.circle(ctx, xx, yy, 3.5, COL.kami, '#8a5a2b', 2);
      }
    }
    if (hint) { D.text(ctx, String(q.len[i]), c.w - 26, y, 22, COL.daidai); }
  }
  /* ================= 2 くらべる ================= */
  /* 解き方＝cup のんだ量（のこりの 逆）・pile やまの たかさ・narabe 大きい じゅんに ならべる・taiou たいおう（多い じゅんと 大きい じゅんを あわせる）・gyaku 4ばんめ（反対から 数える） */
  var KURABE_LV = { 1: { n: 4, asks: ['most'] }, 2: { n: 5, asks: ['most', 'least'] }, 3: { n: 5, asks: ['most', 'least', 'second'] } };
  var KURABE_W = [0.12, 0.28, 0.44, 0.6, 0.76, 0.9];
  function makeKurabe(level, sch) {
    var lv = KURABE_LV[level], n = lv.n, vals, drunk, i, q = { g: 'kurabe', sub: sch, schema: sch, level: level, cType: 'canvas', v: ri(2) };
    if (sch === 'narabe') {
      vals = shuffle([0.5, 0.65, 0.8, 1.0]);
      q.vals = vals; q.kind = 'order'; q.choices = vals.slice(); q.answerOrder = orderDesc(vals); q.nItems = 4; q.depth = 1;
      return q;
    }
    if (sch === 'gyaku') {
      vals = shuffle([0.45, 0.58, 0.71, 0.85, 1.0]);
      q.vals = vals; q.kind = 'choose'; q.choices = vals.slice(); q.nItems = 5;
      return setSingle(q, vals, 'fourth');
    }
    if (sch === 'taiou') {
      n = level === 3 ? 5 : 4;
      q.vals = shuffle(KURABE_W).slice(0, n); q.box = shuffle([0.3, 0.45, 0.6, 0.75, 0.9]).slice(0, n);
      q.rank = level === 3 ? 2 + ri(3) : 1 + ri(2);   /* しるしの やまは おおい ほうから rank ばんめ */
      q.target = orderDesc(q.vals)[q.rank - 1];
      q.kind = 'choose'; q.choices = q.box.slice(); q.answerIndex = orderDesc(q.box)[q.rank - 1]; q.nItems = n; q.depth = q.rank;
      return q;
    }
    vals = shuffle(KURABE_W).slice(0, n);
    q.vals = vals; q.kind = 'choose'; q.choices = vals.slice(); q.nItems = n;
    if (sch === 'cup') { drunk = []; for (i = 0; i < n; i++) { drunk.push(1 - vals[i]); } q.cmp = drunk; } else { q.cmp = vals.slice(); }   /* のんだ 量＝のこりの 逆 */
    if (level === 3) { return setPair(q, q.cmp, pick(['most', 'second']), rnd() < 0.75 ? 'fourth' : 'third'); }
    return setSingle(q, q.cmp, pick(lv.asks));
  }
  function paintKurabeChoice(canvas, q, i, hint) {
    var c = WH.setupCanvas(canvas), w = c.w, h = c.h, v = q.vals[i], top, r, s, x, y;
    c.ctx.fillStyle = COL.kami; c.ctx.fillRect(0, 0, w, h);
    if (q.sub === 'cup') {
      top = h * 0.14;
      D.poly(c.ctx, [[w * 0.28, top], [w * 0.72, top], [w * 0.66, h * 0.9], [w * 0.34, h * 0.9]], COL.shiro, COL.sumi, 2.5);
      c.ctx.save(); c.ctx.beginPath(); c.ctx.moveTo(w * 0.28, top); c.ctx.lineTo(w * 0.72, top); c.ctx.lineTo(w * 0.66, h * 0.9); c.ctx.lineTo(w * 0.34, h * 0.9); c.ctx.closePath(); c.ctx.clip();
      c.ctx.fillStyle = COL.daidai; c.ctx.fillRect(0, h * 0.9 - (h * 0.76) * v, w, h);
      c.ctx.restore();
      D.line(c.ctx, w * 0.6, top - 10, w * 0.44, h * 0.84, '#ffffff', 6); D.line(c.ctx, w * 0.6, top - 10, w * 0.44, h * 0.84, COL.ao, 3);
      if (hint) { D.text(c.ctx, 'のこり', w / 2, h * 0.97 - 8, 12, COL.daidai); }
    } else if (q.sub === 'pile') {
      drawPile(c.ctx, w / 2, h * 0.78, w * 0.4, h, v);
    } else if (q.sub === 'taiou') {
      /* ます（きの はこ）＝おおきさで くらべる */
      s = Math.min(w, h) * (0.3 + 0.6 * q.box[i]); x = (w - s) / 2; y = (h - s) / 2 + 4;
      c.ctx.fillStyle = '#ecd3a0'; c.ctx.fillRect(x, y, s, s); c.ctx.strokeStyle = COL.sumi; c.ctx.lineWidth = 2.5; c.ctx.strokeRect(x, y, s, s);
      c.ctx.strokeStyle = '#b08a5a'; c.ctx.lineWidth = 2; c.ctx.strokeRect(x + s * 0.14, y + s * 0.14, s * 0.72, s * 0.72);
    } else {
      r = Math.min(w, h) * 0.4 * v;
      D.circle(c.ctx, w / 2, h / 2 + 4, r, COL.aka, COL.sumi, 2.5); D.line(c.ctx, w / 2, h / 2 + 4 - r, w / 2 + 4, h / 2 - r - 8, '#6a4a2a', 3);
    }
  }
  function drawPile(ctx, cx, cy, rw, h, v) {
    var r = h * 0.1 + h * 0.5 * v;
    D.ellipse(ctx, cx, cy, rw, h * 0.1, COL.shiro, COL.sumi, 2.5);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - rw * 1.2, 0, rw * 2.4, cy); ctx.clip();
    D.ellipse(ctx, cx, cy, rw * 0.9, r, '#c9b27a', COL.sumi, 2);
    ctx.restore();
    D.ellipse(ctx, cx, cy, rw, h * 0.1, null, COL.sumi, 2.5);
  }
  /* たいおう の おてほん＝まめの やまが ならぶ。しるしの やまを まるで かこむ。ヒント＝おおい じゅんの ばんごう */
  function paintKurabeStem(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), n = q.vals.length, step = (c.w - 12) / n, i, x, ord = orderDesc(q.vals), cy = c.h * 0.82;
    WH.paper(c.ctx, c.w, c.h);
    for (i = 0; i < n; i++) {
      x = 6 + step * (i + 0.5);
      drawPile(c.ctx, x, cy, step * 0.4, c.h * 0.95, q.vals[i]);
      if (i === q.target) { D.ellipse(c.ctx, x, cy - c.h * 0.25, step * 0.5, c.h * 0.42, null, COL.daidai, 4); }
      if (hint) { D.text(c.ctx, String(ord.indexOf(i) + 1), x, c.h * 0.12, 18, COL.daidai); }
    }
  }
  /* ================= 3 シーソー（ちえの もり と 同じ しくみ＋つりあい・おきかえ） ================= */
  /* 解き方＝kihon つながりで じゅんばんを きめる・tsuriai つりあった 台を ふくむ（まっすぐ＝おなじ おもさ。答えが 1つに 決まる 問いだけ）・okikae おきかえ（○ rこ と △ 1こ が つりあう とき） */
  var SHISO_KINDS = ['kuro', 'sankaku', 'shikaku', 'hoshi', 'maru'];
  var SHISO_LV = { 1: { items: 3, asks: ['heavy'] }, 2: { items: 4, asks: ['heavy', 'light'] }, 3: { items: 4, asks: ['heavy', 'light', 'second', 'secondlight'] } };
  var SHISO_PAIRS = [['heavy', 'secondlight'], ['second', 'light'], ['second', 'secondlight']];
  function uniqueAt(vals, ask) { var idx = rankAnswer(vals, ask), i, n = 0; for (i = 0; i < vals.length; i++) { if (vals[i] === vals[idx]) { n++; } } return n === 1; }
  function makeShiso(level, sch) {
    var lv = SHISO_LV[level], kinds, order, pairs = [], i, w = {}, vals = [], q, t, asks, valid = [], a, b, pp, choices;
    if (sch === 'okikae') { return makeOkikae(level); }
    kinds = shuffle(SHISO_KINDS).slice(0, lv.items); order = shuffle(kinds);
    for (i = 0; i < order.length; i++) { w[order[i]] = order.length - i; }
    if (sch === 'tsuriai') { t = ri(order.length - 1); w[order[t + 1]] = w[order[t]]; }   /* となりどうしの 1組だけ おなじ おもさ */
    for (i = 0; i < order.length - 1; i++) {
      a = order[i]; b = order[i + 1];
      pairs.push(rnd() < 0.5 ? { left: a, right: b, down: w[a] === w[b] ? 'eq' : 'left' } : { left: b, right: a, down: w[a] === w[b] ? 'eq' : 'right' });
    }
    pairs = shuffle(pairs);
    choices = shuffle(kinds);
    for (i = 0; i < choices.length; i++) { vals.push(w[choices[i]]); }
    q = { g: 'shiso', schema: sch, sub: sch, level: level, pairs: pairs, order: order, w: w, choices: choices, kind: 'choose', cType: 'shape', v: ri(2), nItems: kinds.length };
    if (sch === 'kihon' && level === 3) { pp = pick(SHISO_PAIRS); return setPair(q, vals, pp[0], pp[1]); }
    asks = sch === 'tsuriai' && level === 3 ? ['heavy', 'light', 'second', 'secondlight'] : lv.asks;
    for (i = 0; i < asks.length; i++) { if (uniqueAt(vals, asks[i])) { valid.push(asks[i]); } }
    if (!valid.length) { asks = ['heavy', 'light', 'second', 'secondlight']; for (i = 0; i < asks.length; i++) { if (uniqueAt(vals, asks[i])) { valid.push(asks[i]); } } }
    return setSingle(q, vals, pick(valid));
  }
  /* おきかえ＝うえの 台（A rこ と B 1こ が つりあう）を みて、したの 台が どう なるか。えらびし＝ひだりが さがる・つりあう・みぎが さがる */
  function makeOkikae(level) {
    var ks = shuffle(SHISO_KINDS), A = ks[0], B = ks[1], r = 2 + ri(2), rel = pick(['left', 'eq', 'right']), tries, x, y, L = 0, R = 0, ok = false, left, right, top, i, q, t;
    for (tries = 0; tries < 60 && !ok; tries++) {
      x = ri(2); y = 1 + ri(4); L = r + x; R = y;
      ok = (rel === 'left' && L > R) || (rel === 'eq' && L === R) || (rel === 'right' && L < R);
    }
    if (!ok) { return null; }
    left = [B]; for (i = 0; i < x; i++) { left.push(A); }
    right = []; for (i = 0; i < y; i++) { right.push(A); }
    top = { left: [], right: [B] }; for (i = 0; i < r; i++) { top.left.push(A); }
    if (rnd() < 0.5) { t = left; left = right; right = t; t = L; L = R; R = t; rel = rel === 'left' ? 'right' : (rel === 'right' ? 'left' : 'eq'); }
    if (rnd() < 0.5) { t = top.left; top.left = top.right; top.right = t; }
    q = { g: 'shiso', schema: 'okikae', sub: 'okikae', level: level, A: A, B: B, r: r, top: top, bot: { left: left, right: right }, unitsL: L, unitsR: R, rel: rel,
      kind: 'choose', cType: 'canvas', choices: ['left', 'eq', 'right'], nItems: 2, depth: 1, v: ri(2) };
    q.answerIndex = q.choices.indexOf(rel);
    return q;
  }
  WH.SHISO_REL_NAME = { left: 'ひだりが さがる', eq: 'つりあう', right: 'みぎが さがる' };
  /* 台 1つ＝まんなかの さんかく・いた・両はしに もの（2こずつ つむ）。dir＝1 ひだりが さがる／0 まっすぐ／−1 みぎが さがる */
  function drawBoard(ctx, cx, cy, half, dir, left, right, r, mark) {
    var dy = half * 0.2 * dir, k, sides = [left, right], s, x, sg, col, row;
    D.poly(ctx, [[cx, cy], [cx - r * 1.4, cy + r * 2.4], [cx + r * 1.4, cy + r * 2.4]], COL.hai, COL.sumi, 2);
    D.line(ctx, cx - half, cy + dy, cx + half, cy - dy, COL.sumi, 4);
    for (s = 0; s < 2; s++) {
      sg = s === 0 ? -1 : 1;
      for (k = 0; k < sides[s].length; k++) {
        col = k % 2; row = Math.floor(k / 2);
        x = cx + sg * (half * 0.84 - col * r * 2.3);
        ctx.save(); ctx.translate(x, cy + dy * (cx - x) / half - r * 1.25 - row * r * 2.3); D.shape(ctx, sides[s][k], r); ctx.restore();
      }
    }
    if (mark) { D.text(ctx, mark, cx, cy - r * 1.2, r * 2.2, COL.daidai); }
  }
  function paintShiso(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, p, rowH, cx = c.w / 2, half = c.w * 0.36, tilt = 0.2, cy, r, dx, dy;
    WH.paper(c.ctx, c.w, c.h);
    if (q.schema === 'okikae') {
      r = Math.min(c.w * 0.04, c.h * 0.045);
      drawBoard(c.ctx, cx, c.h * 0.3, half, 0, q.top.left, q.top.right, r, hint ? '＝' : '');
      D.line(c.ctx, 16, c.h * 0.5, c.w - 16, c.h * 0.5, COL.hai, 2);
      drawBoard(c.ctx, cx, c.h * 0.78, half, 0, q.bot.left, q.bot.right, r, '？');
      if (hint) { D.text(c.ctx, WH.SHAPE_NAMES[q.B] + ' 1こ ＝ ' + WH.SHAPE_NAMES[q.A] + ' ' + q.r + 'こ', cx, c.h * 0.08, 14, COL.daidai); }
      return;
    }
    rowH = c.h / q.pairs.length; r = Math.min(rowH * 0.22, c.w * 0.08);
    for (i = 0; i < q.pairs.length; i++) {
      p = q.pairs[i]; cy = rowH * (i + 0.62);
      D.poly(c.ctx, [[cx, cy - rowH * 0.02], [cx - rowH * 0.16, cy + rowH * 0.3], [cx + rowH * 0.16, cy + rowH * 0.3]], COL.hai, COL.sumi, 2);
      dy = p.down === 'eq' ? 0 : half * tilt * (p.down === 'left' ? 1 : -1);
      D.line(c.ctx, cx - half, cy + dy, cx + half, cy - dy, COL.sumi, 5);
      dx = half * 0.86;
      c.ctx.save(); c.ctx.translate(cx - dx, cy + dy * 0.86 - r * 1.3); D.shape(c.ctx, p.left, r); c.ctx.restore();
      c.ctx.save(); c.ctx.translate(cx + dx, cy - dy * 0.86 - r * 1.3); D.shape(c.ctx, p.right, r); c.ctx.restore();
      if (hint && p.down === 'eq') { D.text(c.ctx, '＝', cx, cy - rowH * 0.2, 22, COL.daidai); }
      else if (hint) { c.ctx.save(); c.ctx.translate(p.down === 'left' ? cx - dx : cx + dx, (p.down === 'left' ? cy + dy : cy - dy) * 0.86 + cy * 0.14 - r * 1.3); D.circle(c.ctx, 0, 0, r * 1.7, null, COL.daidai, 4); c.ctx.restore(); }
    }
  }
  function paintOkikaeChoice(canvas, q, i) {
    var c = WH.setupCanvas(canvas), rel = q.choices[i];
    WH.paper(c.ctx, c.w, c.h, COL.hai);
    drawBoard(c.ctx, c.w / 2, c.h * 0.58, c.w * 0.4, rel === 'left' ? 1 : (rel === 'right' ? -1 : 0), q.bot.left, q.bot.right, Math.min(c.w * 0.05, c.h * 0.065), '');
    D.text(c.ctx, WH.SHISO_REL_NAME[rel], c.w / 2, c.h - 12, 13, COL.sumi);
  }
  function paintShape(canvas, kind) { var c = WH.setupCanvas(canvas), r = Math.min(c.w, c.h) * 0.3; c.ctx.translate(c.w / 2, c.h / 2); D.shape(c.ctx, kind, r); }
  /* ================= 4 かぞえる ================= */
  var KAZOE_KINDS = ['kuro', 'maru', 'sankaku', 'batsu', 'shikaku', 'hoshi'];
  var KAZOE_LV = { 1: { total: [8, 10], target: [3, 6], kinds: 2, subs: ['count'] }, 2: { total: [12, 15], target: [5, 9], kinds: 3, subs: ['count', 'diff', 'same'] }, 3: { total: [16, 20], target: [8, 14], kinds: 3, subs: ['count', 'diff', 'same'] } };
  function scatter(total, cols, rows) {
    var spots = [], i, out = [], r, c;
    for (i = 0; i < cols * rows; i++) { spots.push(i); }
    spots = shuffle(spots).slice(0, total);
    for (i = 0; i < total; i++) { r = Math.floor(spots[i] / cols); c = spots[i] % cols; out.push({ x: (c + 0.5) / cols + (rnd() - 0.5) * 0.08, y: (r + 0.5) / rows + (rnd() - 0.5) * 0.08 }); }
    return out;
  }
  /* a と b を ふくむ count 個の ちがう数（近い数を まぜる）＝ふたつ きく の えらびし */
  function pairNums(a, b, count, lo, hi) {
    var out = [a, b], tries = 0, v;
    while (out.length < count && tries < 300) { tries++; v = (rnd() < 0.5 ? a : b) + (ri(5) - 2); if (v >= lo && v <= hi && out.indexOf(v) < 0) { out.push(v); } }
    while (out.length < count) { v = lo + ri(hi - lo + 1); if (out.indexOf(v) < 0) { out.push(v); } }
    return shuffle(out);
  }
  WH.pairNums = pairNums;
  function numPair(q, a, b) {
    q.kind = 'pair'; q.numeric = false; q.answerIndex = -1; q.asks = 2; q.depth = 1;
    q.parts = [{ ask: 'a', answerIndex: q.choices.indexOf(a), mark: '○' }, { ask: 'b', answerIndex: q.choices.indexOf(b), mark: '△' }];
    return q;
  }
  function makeKazoe(level, sch) {
    var lv = KAZOE_LV[level], sub = sch, total, target, kinds, items = [], i, k, kindList, a, b, q, n, counts, pts, k2, c1, c2;
    if (sub === 'count' && level === 3) {
      /* ふたつ きく＝3しゅの うち 2しゅを かぞえる（練習帳7） */
      total = 16 + ri(5); c1 = 5 + ri(6); c2 = 4 + ri(6);
      if (c2 === c1) { c2 = c1 - 1; }
      if (c1 + c2 > total - 2) { return null; }
      kindList = shuffle(KAZOE_KINDS); k = kindList[0]; k2 = kindList[1];
      pts = scatter(total, 5, 5);
      for (i = 0; i < total; i++) { items.push({ x: pts[i].x, y: pts[i].y, kind: i < c1 ? k : (i < c1 + c2 ? k2 : kindList[2 + ri(2)]) }); }
      q = { g: 'kazoe', sub: sub, schema: sub, level: level, items: shuffle(items), target: k, target2: k2, answer: c1, answer2: c2, choices: pairNums(c1, c2, 5, 1, 20), cType: 'num', v: ri(2), nItems: 3 };
      return numPair(q, c1, c2);
    }
    if (sub === 'count') {
      total = lv.total[0] + ri(lv.total[1] - lv.total[0] + 1);
      target = lv.target[0] + ri(lv.target[1] - lv.target[0] + 1);
      if (target > total - 2) { target = total - 2; }
      kindList = shuffle(KAZOE_KINDS); kinds = kindList.slice(0, lv.kinds + 1); k = kinds[0];
      pts = scatter(total, 5, 5);
      for (i = 0; i < total; i++) { items.push({ x: pts[i].x, y: pts[i].y, kind: i < target ? k : kinds[1 + ri(kinds.length - 1)] }); }
      items = shuffle(items);
      return { g: 'kazoe', sub: sub, level: level, items: items, target: k, answer: target, choices: uniqNums(target, 4, 1, 20), kind: 'choose', cType: 'num', numeric: true, v: ri(2) };
    }
    if (sub === 'diff') {
      k = pick(KAZOE_KINDS);
      a = 3 + ri(level === 3 ? 8 : 5); b = a + 1 + ri(level === 3 ? 4 : 3); if (b > 12) { b = 12; } if (b === a) { b = a + 1; }
      if (rnd() < 0.5) { n = a; a = b; b = n; }
      return { g: 'kazoe', sub: sub, level: level, kind: 'choose', target: k, left: a, right: b, ptsL: scatter(a, 4, 3), ptsR: scatter(b, 4, 3), answer: Math.abs(a - b), choices: uniqNums(Math.abs(a - b), 4, 1, 8), cType: 'num', numeric: true, v: ri(2) };
    }
    /* same＝ひだりと おなじ かずの はこを えらぶ（3つ） */
    k = pick(KAZOE_KINDS); n = (level === 3 ? 6 : 4) + ri(4);
    counts = shuffle([n, n + 1, n - 1, n + 2]).slice(0, 3); if (counts.indexOf(n) < 0) { counts[0] = n; counts = shuffle(counts); }
    q = { g: 'kazoe', sub: sub, level: level, kind: 'choose', target: k, left: n, ptsL: scatter(n, 4, 3), counts: counts, pts: [], choices: counts.slice(), answerIndex: counts.indexOf(n), cType: 'canvas', v: ri(2) };
    for (i = 0; i < 3; i++) { q.pts.push(scatter(counts[i], 4, 3)); }
    return q;
  }
  function paintDotsIn(ctx, pts, kind, w, h, r, hint) {
    var i;
    if (hint) { for (i = 1; i < 3; i++) { D.line(ctx, 6, h * i / 3, w - 6, h * i / 3, '#f3c98a', 2); } }
    for (i = 0; i < pts.length; i++) { ctx.save(); ctx.translate(pts[i].x * w, pts[i].y * h); D.shape(ctx, kind, r); ctx.restore(); }
  }
  function paintKazoeStem(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, r = Math.min(c.w, c.h) * 0.045, items, half;
    WH.paper(c.ctx, c.w, c.h);
    if (q.sub === 'count') {
      if (hint) { for (i = 1; i < 5; i++) { D.line(c.ctx, 8, c.h * i / 5, c.w - 8, c.h * i / 5, '#f3c98a', 2); } }
      items = q.items;
      for (i = 0; i < items.length; i++) { c.ctx.save(); c.ctx.translate(items[i].x * c.w, items[i].y * c.h); D.shape(c.ctx, items[i].kind, r); c.ctx.restore(); }
      return;
    }
    if (q.sub === 'diff') {
      half = c.w / 2;
      D.line(c.ctx, half, 8, half, c.h - 8, COL.usui, 2);
      c.ctx.save(); c.ctx.translate(0, 0); paintDotsIn(c.ctx, q.ptsL, q.target, half, c.h, r * 1.1, hint); c.ctx.restore();
      c.ctx.save(); c.ctx.translate(half, 0); paintDotsIn(c.ctx, q.ptsR, q.target, half, c.h, r * 1.1, hint); c.ctx.restore();
      if (hint) { D.text(c.ctx, String(q.left), half / 2, c.h - 14, 20, COL.daidai); D.text(c.ctx, String(q.right), half * 1.5, c.h - 14, 20, COL.daidai); }
      return;
    }
    paintDotsIn(c.ctx, q.ptsL, q.target, c.w, c.h, r * 1.4, hint);
    if (hint) { D.text(c.ctx, String(q.left), c.w - 20, c.h - 16, 20, COL.daidai); }
  }
  function paintKazoeChoice(canvas, q, i, hint) {
    var c = WH.setupCanvas(canvas);
    WH.paper(c.ctx, c.w, c.h, COL.hai);
    paintDotsIn(c.ctx, q.pts[i], q.target, c.w, c.h, Math.min(c.w, c.h) * 0.07, hint);
    if (hint) { D.text(c.ctx, String(q.counts[i]), c.w - 16, c.h - 14, 18, COL.daidai); }
  }

  /* ================= 5 わける ================= */
  var WAKERU_LV = { 1: { subs: ['zutsu'], people: [2, 3], each: [2, 2] }, 2: { subs: ['zutsu', 'hitoshiku'], people: [2, 4], each: [2, 3] }, 3: { subs: ['zutsu', 'hitoshiku', 'amari'], people: [3, 4], each: [2, 3] } };
  var WAKERU_ITEMS = ['ringo', 'ichigo', 'mikan', 'banana', 'kuri', 'kaki'];
  function makeWakeru(level, sch) {
    var lv = WAKERU_LV[level], sub = sch, n = lv.people[0] + ri(lv.people[1] - lv.people[0] + 1), e = lv.each[0] + ri(lv.each[1] - lv.each[0] + 1), it = pick(WAKERU_ITEMS), q, its, e2;
    if (sub === 'zutsu' && level === 3) {
      /* ふたつ きく＝2つの ものを それぞれ ずつ くばる（練習帳10＝2こずつ・3こずつ） */
      its = shuffle(WAKERU_ITEMS).slice(0, 2); e = 2 + ri(2); e2 = 5 - e;
      q = { g: 'wakeru', sub: sub, schema: sub, level: level, people: n, each: e, each2: e2, item: its[0], item2: its[1], answer: n * e, answer2: n * e2, total: n * e, cType: 'num', v: ri(2), nItems: 2 };
      q.choices = pairNums(q.answer, q.answer2, 5, 2, 16);
      return numPair(q, q.answer, q.answer2);
    }
    if (sub === 'zutsu') { q = { answer: n * e, total: n * e }; }
    else if (sub === 'hitoshiku') { q = { answer: e, total: n * e }; }
    else { q = { answer: 1 + ri(Math.min(3, n - 1)), total: 0 }; q.total = n + q.answer; }
    q.g = 'wakeru'; q.sub = sub; q.level = level; q.people = n; q.each = e; q.item = it; q.kind = 'choose'; q.cType = 'num'; q.numeric = true; q.v = ri(2);
    q.choices = uniqNums(q.answer, 4, sub === 'zutsu' ? 2 : 1, sub === 'zutsu' ? 16 : 9);
    return q;
  }
  function drawFace(ctx, x, y, r, k) {
    D.circle(ctx, x, y, r, '#fde8d0', COL.sumi, 2);
    if (k % 2) { D.ellipse(ctx, x, y - r * 0.55, r * 0.9, r * 0.45, '#5a3b1e'); }
    D.circle(ctx, x - r * 0.3, y - r * 0.1, r * 0.08, COL.sumi); D.circle(ctx, x + r * 0.3, y - r * 0.1, r * 0.08, COL.sumi);
    ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 0.35, Math.PI * 0.15, Math.PI * 0.85); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2; ctx.stroke();
  }
  function drawFruit(ctx, x, y, r, col) { D.circle(ctx, x, y, r, col || COL.aka, COL.sumi, 1.5); D.line(ctx, x, y - r, x + r * 0.3, y - r * 1.5, '#6a4a2a', 2); }
  function paintWakeru(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, j, n = q.people, fx, fy = c.h * 0.3, fr = Math.min(c.w / (n * 3.2), c.h * 0.14), step = c.w / n, r = fr * 0.32, cols;
    WH.paper(c.ctx, c.w, c.h);
    for (i = 0; i < n; i++) { fx = step * (i + 0.5); drawFace(c.ctx, fx, fy, fr, i); }
    if (q.sub === 'zutsu' && q.kind === 'pair') {
      if (hint) {
        for (i = 0; i < n; i++) {
          for (j = 0; j < q.each; j++) { drawFruit(c.ctx, step * (i + 0.5) + (j - (q.each - 1) / 2) * r * 2.6, fy + fr * 1.8, r); }
          for (j = 0; j < q.each2; j++) { drawFruit(c.ctx, step * (i + 0.5) + (j - (q.each2 - 1) / 2) * r * 2.6, fy + fr * 2.8, r, COL.daidai); }
        }
        D.text(c.ctx, '○ ' + q.each + 'こずつ・△ ' + q.each2 + 'こずつ', c.w / 2, c.h * 0.92, 15, COL.daidai);
      } else { D.text(c.ctx, n + 'にん', c.w / 2, c.h * 0.78, 18, COL.sumi); }
      return;
    }
    if (q.sub === 'zutsu') {
      if (hint) { for (i = 0; i < n; i++) { for (j = 0; j < q.each; j++) { drawFruit(c.ctx, step * (i + 0.5) + (j - (q.each - 1) / 2) * r * 2.6, fy + fr * 1.9, r); } } D.text(c.ctx, q.each + 'こずつ', c.w / 2, c.h * 0.88, 16, COL.daidai); }
      else { D.text(c.ctx, n + 'にん', c.w / 2, c.h * 0.78, 18, COL.sumi); }
      return;
    }
    /* hitoshiku・amari＝ぜんぶの みのりを 下に ならべる。ヒント＝ひとりずつ くばる 線 */
    cols = Math.min(q.total, 8);
    for (i = 0; i < q.total; i++) {
      fx = c.w * 0.5 + ((i % cols) - (cols - 1) / 2) * r * 2.8; fy = c.h * 0.66 + Math.floor(i / cols) * r * 2.8;
      drawFruit(c.ctx, fx, fy, r);
      if (hint && i < n * (q.sub === 'amari' ? 1 : q.each)) { D.line(c.ctx, fx, fy - r, step * ((i % n) + 0.5), c.h * 0.3 + fr, i < n ? COL.daidai : COL.mizu, 2); }
      if (hint && q.sub === 'amari' && i >= n) { D.circle(c.ctx, fx, fy, r * 1.8, null, COL.daidai, 3); }
    }
  }

  /* ================= 6 かずの おはなし ================= */
  /* 解き方＝fueteheru ふえて へる（1人の 数）・yaritori やりとり（あげる・もらう＝2人の 数）・kurabete くらべて いくつ おおい */
  var STORY_FOOD = ['ringo', 'mikan', 'banana', 'kuri', 'ichigo', 'kaki', 'daikon'];
  var STEP_WORDS = [['つくりました', 'もらいました', 'かってきました', 'ひろいました'], ['たべました', 'あげました', 'おとしました']];
  function makeKazuhanashi(level, sch) {
    var who = shuffle(NAMES), it = itemById(pick(STORY_FOOD)), a, steps = [], v, tries, b, cnt = level === 1 ? 1 : (level === 2 ? 2 : 3), i, ok, txt, q;
    if (sch === 'yaritori') { return makeYaritori(level, who, it); }
    if (sch === 'kurabete') { return makeKurabete(level, who, it); }
    for (tries = 0; tries < 50; tries++) {
      a = 2 + ri(5); v = a; steps = []; ok = true;
      for (i = 0; i < cnt; i++) {
        b = 2 + ri(level === 3 ? 5 : 4);
        if (i === 1 || (i === 0 && level === 1 && rnd() < 0.3)) { b = -b; }
        if (i === 2 && rnd() < 0.5) { b = -b; }
        v += b;
        if (v < 0 || v > 12) { ok = false; break; }
        steps.push(b);
      }
      if (ok && v !== a) { break; }
    }
    txt = who[0] + 'は、' + it.name + 'を ' + a + 'こ ' + pick(STEP_WORDS[0]) + '。';
    for (i = 0; i < steps.length; i++) {
      txt += (i === 0 ? who[1] : (i === 1 ? who[2] : who[3])) + 'が ' + Math.abs(steps[i]) + 'こ ' + (steps[i] > 0 ? pick(STEP_WORDS[0]).replace('きました', 'きてくれました') : pick(STEP_WORDS[1])) + '。';
    }
    q = { g: 'kazuhanashi', schema: 'fueteheru', sub: 'fueteheru', level: level, item: it.id, start: a, steps: steps, answer: v, story: txt, askName: it.name, kind: 'choose', cType: 'num', numeric: true, choices: uniqNums(v, 4, 0, 12), v: ri(2), nItems: 1 };
    return q;
  }
  /* やりとり＝ふたりの 数。あげた ほうは へり、もらった ほうは ふえる */
  function makeYaritori(level, who, it) {
    var st = [2 + ri(level === 3 ? 6 : 4), 2 + ri(4)], giver = ri(2), c, after, askWho = ri(2), give = rnd() < 0.5, story, q;
    c = 1 + ri(Math.min(level === 3 ? 4 : 3, st[giver] - 1));
    after = st.slice(); after[giver] -= c; after[1 - giver] += c;
    if (after[askWho] > 12) { return null; }
    story = who[0] + 'は ' + it.name + 'を ' + st[0] + 'こ、' + who[1] + 'は ' + st[1] + 'こ もって います。' +
      (give ? who[giver] + 'が ' + who[1 - giver] + 'に ' + c + 'こ あげました。' : who[1 - giver] + 'が ' + who[giver] + 'から ' + c + 'こ もらいました。');
    q = { g: 'kazuhanashi', schema: 'yaritori', sub: 'yaritori', level: level, item: it.id, who: [who[0], who[1]], st: st, giver: giver, give: c, after: after, askWho: askWho,
      answer: after[askWho], story: story, askName: who[askWho], kind: 'choose', cType: 'num', numeric: true, v: ri(2), nItems: 2 };
    q.choices = uniqNums(q.answer, 4, 0, 12);
    return q;
  }
  /* くらべて＝form 0 ちがいは いくつ／form 1「○○より dこ おおい」 */
  function makeKurabete(level, who, it) {
    var form = ri(2), a, b, d, q;
    if (form === 0) { a = 3 + ri(8); b = 2 + ri(8); if (a === b) { b = a - 1; } d = Math.abs(a - b); }
    else { b = 2 + ri(6); d = 1 + ri(level === 3 ? 4 : 3); a = b + d; }
    q = { g: 'kazuhanashi', schema: 'kurabete', sub: 'kurabete', level: level, item: it.id, who: [who[0], who[1]], form: form, a: a, b: b, d: d, kind: 'choose', cType: 'num', numeric: true, v: ri(2), nItems: 2 };
    if (form === 0) { q.story = who[0] + 'は ' + it.name + 'を ' + a + 'こ、' + who[1] + 'は ' + b + 'こ もって います。'; q.answer = d; }
    else { q.story = who[1] + 'は ' + it.name + 'を ' + b + 'こ もって います。' + who[0] + 'は ' + who[1] + 'より ' + d + 'こ おおく もって います。'; q.answer = a; q.askName = who[0]; }
    q.choices = uniqNums(q.answer, 4, 0, 12);
    return q;
  }
  function kazuTail(q, v) {
    if (q.schema === 'kurabete' && q.form === 0) { return v ? 'どちらが いくつ おおく もって いますか。おおい かずを こたえてね。' : 'ふたりの ちがいは いくつ？'; }
    if (q.schema === 'fueteheru') { return v ? 'いま、' + q.askName + 'は いくつ ありますか。' : 'いま ' + q.askName + 'は なんこ？'; }
    return v ? q.askName + 'は いま いくつ もって いますか。' : 'いま ' + q.askName + 'は なんこ？';
  }
  function drawRow(ctx, x0, y, n, r, col) { var i; for (i = 0; i < n; i++) { drawFruit(ctx, x0 + i * r * 2.4, y, r, col); } }
  function paintKazuhanashi(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, x, n, step, v, r, nameX = 62, x0 = 120;
    WH.paper(c.ctx, c.w, c.h);
    if (!hint) { D.text(c.ctx, 'よく きいてね', c.w / 2, c.h / 2, 22, COL.usui); return; }
    if (q.schema === 'yaritori') {
      /* 足場＝はじめの 数と、うつる むき（あとの 数は 見せない） */
      r = Math.min(10, (c.w - x0 - 16) / 12 / 2.4 * 2);
      for (i = 0; i < 2; i++) { D.text(c.ctx, q.who[i], nameX, c.h * (0.28 + i * 0.44), 14, COL.sumi); drawRow(c.ctx, x0, c.h * (0.28 + i * 0.44), q.st[i], r); }
      D.text(c.ctx, (q.giver === 0 ? '↓ ' : '↑ ') + q.give + 'こ うつる', c.w / 2 + 40, c.h * 0.5, 16, COL.daidai);
      return;
    }
    if (q.schema === 'kurabete') {
      /* 足場＝1こずつ ならべる（1たい1） */
      r = Math.min(10, (c.w - x0 - 16) / 12 / 2.4 * 2);
      if (q.form === 0) { for (i = 0; i < 2; i++) { D.text(c.ctx, q.who[i], nameX, c.h * (0.3 + i * 0.4), 14, COL.sumi); drawRow(c.ctx, x0, c.h * (0.3 + i * 0.4), i === 0 ? q.a : q.b, r); } }
      else {
        D.text(c.ctx, q.who[1], nameX, c.h * 0.3, 14, COL.sumi); drawRow(c.ctx, x0, c.h * 0.3, q.b, r);
        D.text(c.ctx, q.who[0], nameX, c.h * 0.7, 14, COL.sumi); drawRow(c.ctx, x0, c.h * 0.7, q.b, r);
        D.text(c.ctx, '＋' + q.d, x0 + q.b * r * 2.4 + 16, c.h * 0.7, 18, COL.daidai);
      }
      return;
    }
    n = q.steps.length + 1; step = c.w / n; v = q.start; r = Math.min(step * 0.09, c.h * 0.05);
    /* 足場＝ふえた・へった を 絵と 数で（1だんずつ） */
    for (i = 0; i < n; i++) {
      x = step * (i + 0.5);
      if (i > 0) { v += q.steps[i - 1]; D.text(c.ctx, (q.steps[i - 1] > 0 ? '+' : '−') + Math.abs(q.steps[i - 1]), x - step / 2, c.h * 0.2, 20, COL.daidai); }
      drawBalls(c.ctx, x, c.h * 0.55, v, r);
      D.text(c.ctx, String(v), x, c.h * 0.9, 18, COL.sumi);
    }
  }
  function drawBalls(ctx, x, y, n, r) {
    var i, perRow = 4, cx, cy;
    if (n === 0) { D.text(ctx, '0', x, y, r * 2.4, COL.usui); return; }
    for (i = 0; i < n; i++) {
      cx = x + ((i % perRow) - Math.min(n, perRow) / 2 + 0.5) * r * 2.3; cy = y + (Math.floor(i / perRow) - (Math.ceil(n / perRow) - 1) / 2) * r * 2.3;
      drawFruit(ctx, cx, cy, r);
    }
  }
  /* ================= 7 なかま ================= */
  var GROUPS = [
    { key: 'tabemono', name: 'たべもの', lv: 1, fn: function (it) { return !!it.food; } },
    { key: 'ikimono', name: 'いきもの', lv: 1, fn: function (it) { return !!it.animal; } },
    { key: 'norimono', name: 'のりもの', lv: 1, fn: function (it) { return !!it.ride; } },
    { key: 'hana', name: 'はなや き', lv: 2, fn: function (it) { return !!it.plant; } },
    { key: 'bunbogu', name: 'ぶんぼうぐ', lv: 2, fn: function (it) { return !!it.bunbogu; } },
    { key: 'kagu', name: 'いえの なかに ある もの', lv: 2, fn: function (it) { return !!it.kagu; } },
    { key: 'haru', name: 'はるの もの', lv: 2, fn: function (it) { return it.season === 'haru'; } },
    { key: 'natsu', name: 'なつの もの', lv: 2, fn: function (it) { return it.season === 'natsu'; } },
    { key: 'aki', name: 'あきの もの', lv: 2, fn: function (it) { return it.season === 'aki'; } },
    { key: 'fuyu', name: 'ふゆの もの', lv: 2, fn: function (it) { return it.season === 'fuyu'; } },
    { key: 'tori', name: 'とり', lv: 3, fn: function (it) { return it.cat === 'tori'; } },
    { key: 'mushi', name: 'むし', lv: 3, fn: function (it) { return it.cat === 'mushi'; } },
    { key: 'sakana', name: 'さかな', lv: 3, fn: function (it) { return it.cat === 'sakana'; } },
    { key: 'kemono', name: 'けもの', lv: 3, fn: function (it) { return it.cat === 'kemono'; } }
  ];
  WH.GROUPS = GROUPS;
  function groupsOf(it) { var i, out = []; for (i = 0; i < GROUPS.length; i++) { if (GROUPS[i].fn(it)) { out.push(GROUPS[i].key); } } return out; }
  function sharesGroup(a, b) { var ga = groupsOf(a), gb = groupsOf(b), i; for (i = 0; i < ga.length; i++) { if (gb.indexOf(ga[i]) >= 0) { return true; } } return false; }
  /* はずれに なれる えらびし（ほかの 3つが そろって 入り、その 1つだけ 入らない なかまが ある）の 一覧＝答えが 1つに 決まるかの 見分け */
  function validOdds(ids) {
    var j, k, gi, out = [], all, its = [];
    for (j = 0; j < ids.length; j++) { its.push(itemById(ids[j])); }
    for (j = 0; j < its.length; j++) {
      for (gi = 0; gi < GROUPS.length; gi++) {
        if (GROUPS[gi].fn(its[j])) { continue; }
        all = true; for (k = 0; k < its.length; k++) { if (k !== j && !GROUPS[gi].fn(its[k])) { all = false; } }
        if (all) { out.push(j); break; }
      }
    }
    return out;
  }
  WH.validOdds = validOdds;
  var SMALL_GROUPS = ['tori', 'mushi', 'sakana', 'kemono'];
  /* 解き方＝hazure 遠い はずれ・chikai ちかい はずれ（おなじ いきもの の なかの ちがう なかま）・niteiru にている ところ（こたえの ない）・wakeru2 6つを 3つずつ・wakeoo たくさん（8つ）を 4つずつ */
  function makeNakama(level, sch) {
    var sub = sch, tries, g, members, three, pool, odd, i, q, a, b, g2, m2, all, others, k, ok, ids;
    if (sub === 'hazure') {
      for (tries = 0; tries < 200; tries++) {
        g = pick(GROUPS); if (g.lv > level) { continue; }
        members = itemsWhere(g.fn); if (members.length < 3) { continue; }
        three = shuffle(members).slice(0, 3);
        /* はずれ＝その なかまでは なく、3つの だれとも ほかの なかまを 共有しない（答えが 1つに 決まる） */
        pool = itemsWhere(function (it) { var k2; if (g.fn(it)) { return false; } for (k2 = 0; k2 < 3; k2++) { if (sharesGroup(it, three[k2])) { return false; } } return true; });
        if (!pool.length) { continue; }
        odd = pick(pool);
        q = { g: 'nakama', sub: sub, schema: sub, level: level, group: g.key, groupName: g.name, kind: 'choose', cType: 'img' };
        q.choices = shuffle([three[0].id, three[1].id, three[2].id, odd.id]); q.answerIndex = q.choices.indexOf(odd.id); q.v = ri(2);
        return q;
      }
      return null;
    }
    if (sub === 'chikai') {
      /* ちかい はずれ＝4つとも いきもの。3つは とり（など）、はずれは べつの いきもの。答えが 1つに 決まる ものだけ */
      for (tries = 0; tries < 200; tries++) {
        g = GROUPS[0]; for (i = 0; i < GROUPS.length; i++) { if (GROUPS[i].key === pick(SMALL_GROUPS)) { g = GROUPS[i]; } }
        if (SMALL_GROUPS.indexOf(g.key) < 0) { continue; }
        members = itemsWhere(g.fn); three = shuffle(members).slice(0, 3);
        pool = itemsWhere(function (it) { return !!it.animal && !g.fn(it); });
        odd = pick(pool);
        ids = shuffle([three[0].id, three[1].id, three[2].id, odd.id]);
        k = validOdds(ids);
        if (k.length !== 1 || ids[k[0]] !== odd.id) { continue; }
        q = { g: 'nakama', sub: sub, schema: sub, level: level, group: g.key, groupName: g.name, bigName: 'いきもの', kind: 'choose', cType: 'img', choices: ids, answerIndex: k[0], v: ri(2) };
        return q;
      }
      return null;
    }
    if (sub === 'niteiru') {
      for (tries = 0; tries < 200; tries++) {
        a = pick(WH.ITEMS); b = pick(WH.ITEMS);
        if (a.id === b.id || !sharesGroup(a, b)) { continue; }
        q = { g: 'nakama', sub: sub, schema: sub, level: level, kind: 'open', cType: 'none', pair: [a.id, b.id], same: [], diff: [] };
        for (i = 0; i < GROUPS.length; i++) { if (GROUPS[i].fn(a) && GROUPS[i].fn(b)) { q.same.push(GROUPS[i].name); } else if (GROUPS[i].fn(a) !== GROUPS[i].fn(b)) { q.diff.push((GROUPS[i].fn(a) ? a.name : b.name) + ' だけ ' + GROUPS[i].name); } }
        q.v = ri(2);
        return q;
      }
      return null;
    }
    /* wakeru2＝6つを 3つずつ・wakeoo＝8つを 4つずつ 2つの なかまに（どちらの 組を えらんでも 正解） */
    k = sub === 'wakeoo' ? 6 : 3;
    for (tries = 0; tries < 400; tries++) {
      g = pick(GROUPS); g2 = pick(GROUPS); if (g.key === g2.key) { continue; }
      members = itemsWhere(function (it) { return g.fn(it) && !g2.fn(it); }); m2 = itemsWhere(function (it) { return g2.fn(it) && !g.fn(it); });
      if (members.length < k || m2.length < k) { continue; }
      three = shuffle(members).slice(0, k); others = shuffle(m2).slice(0, k);
      /* 組どうしが ほかの なかまを またいで 共有しない（2通り以外の 分け方が 出ない） */
      ok = true;
      for (i = 0; i < k; i++) { for (b = 0; b < k; b++) { if (sharesGroup(three[i], others[b])) { ok = false; } } }
      if (!ok) { continue; }
      all = []; for (i = 0; i < k; i++) { all.push(three[i].id); all.push(others[i].id); }
      all = shuffle(all);
      q = { g: 'nakama', sub: sub, schema: sub, level: level, kind: 'multi', need: k, cType: 'img', choices: all, groupA: g.name, groupB: g2.name, setA: [], setB: [], v: ri(2), nItems: k * 2 };
      for (i = 0; i < all.length; i++) { if (g.fn(itemById(all[i]))) { q.setA.push(i); } else { q.setB.push(i); } }
      q.answerSets = [q.setA, q.setB];
      return q;
    }
    return null;
  }
  /* ================= 8 おなじ え（ほとんど おなじ 絵） ================= */
  var FIGS = {
    ie: { attrs: { yane: 2, mado: 3, tobira: 2, entotsu: 2 }, names: { yane: 'やね', mado: 'まど', tobira: 'とびら', entotsu: 'えんとつ' } },
    roketto: { attrs: { mado: 3, hane: 2, shima: 3, honoo: 2 }, names: { mado: 'まど', hane: 'はね', shima: 'しましま', honoo: 'ひ' } },
    robotto: { attrs: { antena: 2, me: 2, botan: 3, ude: 2 }, names: { antena: 'あんてな', me: 'め', botan: 'ぼたん', ude: 'うで' } }
  };
  function figSig(a) { var k, s = []; for (k in a) { if (a.hasOwnProperty(k)) { s.push(k + a[k]); } } s.sort(); return s.join('|'); }
  /* 絵の ちがいだけで くらべる しるし（diffKey などの 印は 入れない） */
  function attrSig(fig, a) { var k, s = []; for (k in FIGS[fig].attrs) { if (FIGS[fig].attrs.hasOwnProperty(k)) { s.push(k + a[k]); } } return s.join('|'); }
  function attrDiff(fig, a, b) { var k, n = 0; for (k in FIGS[fig].attrs) { if (FIGS[fig].attrs.hasOwnProperty(k) && a[k] !== b[k]) { n++; } } return n; }
  WH.attrSig = attrSig; WH.attrDiff = attrDiff;
  /* 解き方＝onaji おなじ えを さがす・chigau 1つだけ ちがう えを さがす・muki むきが ちがう おなじ えを さがす（まわして くらべる） */
  function makeOnajie(level, sch) {
    var kind = pick(['ie', 'roketto', 'robotto']), f = FIGS[kind], base = {}, k, keys = [], n = level === 1 ? 3 : (level === 2 ? 4 : 5), cands = [], seen = {}, tries, w, ak, v, q, i, odd;
    for (k in f.attrs) { if (f.attrs.hasOwnProperty(k)) { keys.push(k); base[k] = ri(f.attrs[k]); } }
    if (sch === 'chigau') {
      ak = pick(keys); odd = {}; for (k = 0; k < keys.length; k++) { odd[keys[k]] = base[keys[k]]; }
      odd[ak] = (base[ak] + 1 + ri(f.attrs[ak] - 1)) % f.attrs[ak]; odd.diffKey = ak;
      for (i = 0; i < n - 1; i++) { w = {}; for (k = 0; k < keys.length; k++) { w[keys[k]] = base[keys[k]]; } cands.push(w); }
      cands = shuffle(cands.concat([odd]));
      return { g: 'onajie', schema: sch, sub: sch, level: level, fig: kind, base: base, odd: odd, choices: cands, answerIndex: cands.indexOf(odd), kind: 'choose', cType: 'canvas', v: ri(2), nItems: n };
    }
    seen[figSig(base)] = true;
    for (tries = 0; tries < 200 && cands.length < n - 1; tries++) {
      w = {}; for (k = 0; k < keys.length; k++) { w[keys[k]] = base[keys[k]]; }
      ak = pick(keys); v = (base[ak] + 1 + ri(f.attrs[ak] - 1)) % f.attrs[ak]; w[ak] = v; w.diffKey = ak;
      if (seen[figSig(w)]) { continue; }
      seen[figSig(w)] = true; cands.push(w);
    }
    if (cands.length < n - 1) { return null; }
    cands = shuffle([base].concat(cands));
    q = { g: 'onajie', schema: sch, sub: sch, level: level, fig: kind, base: base, choices: cands, answerIndex: cands.indexOf(base), kind: 'choose', cType: 'canvas', v: ri(2), nItems: n };
    if (sch === 'muki') { q.rots = []; for (i = 0; i < n; i++) { q.rots.push(1 + ri(3)); } }   /* みぎの えは ぜんぶ 90・180・270ど まわす */
    return q;
  }
  function drawFig(ctx, kind, a, s, markKey) {
    var i, x, y;
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (kind === 'ie') {
      D.poly(ctx, [[-s * 0.4, -s * 0.05], [s * 0.4, -s * 0.05], [s * 0.4, s * 0.42], [-s * 0.4, s * 0.42]], '#ffe6a8', COL.sumi, 2.5);
      if (a.yane === 0) { D.poly(ctx, [[-s * 0.46, -s * 0.05], [0, -s * 0.42], [s * 0.46, -s * 0.05]], COL.aka, COL.sumi, 2.5); }
      else { D.poly(ctx, [[-s * 0.46, -s * 0.05], [-s * 0.2, -s * 0.38], [s * 0.2, -s * 0.38], [s * 0.46, -s * 0.05]], COL.aka, COL.sumi, 2.5); }
      if (a.entotsu === 1) { ctx.fillStyle = COL.cha; ctx.fillRect(s * 0.18, -s * 0.36, s * 0.1, s * 0.16); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2; ctx.strokeRect(s * 0.18, -s * 0.36, s * 0.1, s * 0.16); }
      x = a.tobira === 0 ? -s * 0.3 : s * 0.12;
      ctx.fillStyle = COL.cha; ctx.fillRect(x, s * 0.14, s * 0.18, s * 0.28); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2; ctx.strokeRect(x, s * 0.14, s * 0.18, s * 0.28);
      for (i = 0; i <= a.mado; i++) { x = (a.tobira === 0 ? s * 0.02 : -s * 0.36) + i * s * 0.13; ctx.fillStyle = COL.mizu; ctx.fillRect(x, s * 0.04, s * 0.09, s * 0.09); ctx.strokeRect(x, s * 0.04, s * 0.09, s * 0.09); }
    } else if (kind === 'roketto') {
      D.poly(ctx, [[-s * 0.16, -s * 0.1], [0, -s * 0.46], [s * 0.16, -s * 0.1]], COL.aka, COL.sumi, 2.5);
      ctx.fillStyle = '#e8eef4'; ctx.fillRect(-s * 0.16, -s * 0.1, s * 0.32, s * 0.4); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2.5; ctx.strokeRect(-s * 0.16, -s * 0.1, s * 0.32, s * 0.4);
      for (i = 0; i < a.shima; i++) { D.line(ctx, -s * 0.16, s * 0.2 + i * s * 0.06, s * 0.16, s * 0.2 + i * s * 0.06, COL.ao, 3); }
      for (i = 0; i <= a.mado; i++) { D.circle(ctx, 0, -s * 0.02 + i * s * 0.1 - a.mado * s * 0.02, s * 0.035, COL.mizu, COL.sumi, 1.5); }
      if (a.hane === 0) { D.circle(ctx, -s * 0.22, s * 0.26, s * 0.07, COL.daidai, COL.sumi, 2); D.circle(ctx, s * 0.22, s * 0.26, s * 0.07, COL.daidai, COL.sumi, 2); }
      else { D.poly(ctx, [[-s * 0.16, s * 0.12], [-s * 0.3, s * 0.32], [-s * 0.16, s * 0.3]], COL.daidai, COL.sumi, 2); D.poly(ctx, [[s * 0.16, s * 0.12], [s * 0.3, s * 0.32], [s * 0.16, s * 0.3]], COL.daidai, COL.sumi, 2); }
      for (i = 0; i <= a.honoo; i++) { D.poly(ctx, [[-s * 0.06 + (i - a.honoo / 2) * s * 0.14, s * 0.3], [(i - a.honoo / 2) * s * 0.14, s * 0.46], [s * 0.06 + (i - a.honoo / 2) * s * 0.14, s * 0.3]], COL.ki, COL.daidai, 2); }
    } else {
      ctx.fillStyle = '#c9d6e2'; ctx.fillRect(-s * 0.22, -s * 0.36, s * 0.44, s * 0.3); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2.5; ctx.strokeRect(-s * 0.22, -s * 0.36, s * 0.44, s * 0.3);
      ctx.fillRect(-s * 0.28, -s * 0.02, s * 0.56, s * 0.42); ctx.strokeRect(-s * 0.28, -s * 0.02, s * 0.56, s * 0.42);
      if (a.antena === 1) { D.line(ctx, 0, -s * 0.36, 0, -s * 0.46, COL.sumi, 3); D.circle(ctx, 0, -s * 0.47, s * 0.03, COL.aka, COL.sumi, 1.5); }
      if (a.me === 0) { D.circle(ctx, 0, -s * 0.21, s * 0.06, COL.ki, COL.sumi, 2); } else { D.circle(ctx, -s * 0.1, -s * 0.21, s * 0.05, COL.ki, COL.sumi, 2); D.circle(ctx, s * 0.1, -s * 0.21, s * 0.05, COL.ki, COL.sumi, 2); }
      for (i = 0; i <= a.botan; i++) { D.circle(ctx, (i - a.botan / 2) * s * 0.12, s * 0.18, s * 0.035, COL.aka, COL.sumi, 1.5); }
      y = a.ude === 0 ? s * 0.08 : -s * 0.18;
      D.line(ctx, -s * 0.28, s * 0.06, -s * 0.42, y, COL.sumi, 5); D.line(ctx, s * 0.28, s * 0.06, s * 0.42, y, COL.sumi, 5);
    }
    if (markKey) {
      /* 足場＝ちがう ところに 輪 */
      if (kind === 'ie') { x = markKey === 'yane' ? 0 : (markKey === 'entotsu' ? s * 0.23 : (markKey === 'tobira' ? (a.tobira === 0 ? -s * 0.21 : s * 0.21) : (a.tobira === 0 ? s * 0.15 : -s * 0.2))); y = markKey === 'yane' ? -s * 0.24 : (markKey === 'entotsu' ? -s * 0.28 : (markKey === 'tobira' ? s * 0.28 : s * 0.08)); }
      else if (kind === 'roketto') { x = markKey === 'hane' ? -s * 0.24 : 0; y = markKey === 'mado' ? 0 : (markKey === 'shima' ? s * 0.24 : (markKey === 'hane' ? s * 0.26 : s * 0.4)); }
      else { x = markKey === 'ude' ? -s * 0.38 : 0; y = markKey === 'antena' ? -s * 0.42 : (markKey === 'me' ? -s * 0.21 : (markKey === 'botan' ? s * 0.18 : -s * 0.05)); }
      D.circle(ctx, x, y, s * 0.16, null, COL.daidai, 4);
    }
    ctx.restore();
  }
  function paintFig(canvas, q, a, markKey, rot) { var c = WH.setupCanvas(canvas), s = Math.min(c.w, c.h); WH.paper(c.ctx, c.w, c.h); c.ctx.translate(c.w / 2, c.h / 2); if (rot) { c.ctx.rotate(rot * Math.PI / 2); } drawFig(c.ctx, q.fig, a, s * (rot === 1 || rot === 3 ? 0.92 : 1), markKey); }

  /* ================= 9 かたち（ますの 集まり） ================= */
  function cellKey(r, c) { return r + ',' + c; }
  function normCells(cells) {
    var mr = 99, mc = 99, i, out = [];
    for (i = 0; i < cells.length; i++) { if (cells[i][0] < mr) { mr = cells[i][0]; } if (cells[i][1] < mc) { mc = cells[i][1]; } }
    for (i = 0; i < cells.length; i++) { out.push([cells[i][0] - mr, cells[i][1] - mc]); }
    out.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    return out;
  }
  function cellSig(cells) { var n = normCells(cells), s = [], i; for (i = 0; i < n.length; i++) { s.push(n[i][0] + ',' + n[i][1]); } return s.join('|'); }
  function rotCells(cells) { var i, out = []; for (i = 0; i < cells.length; i++) { out.push([cells[i][1], -cells[i][0]]); } return normCells(out); }
  function flipCells(cells) { var i, out = []; for (i = 0; i < cells.length; i++) { out.push([cells[i][0], -cells[i][1]]); } return normCells(out); }
  function congruent(a, b) {
    var k, x = normCells(a), sb = cellSig(b), f;
    if (a.length !== b.length) { return false; }
    for (k = 0; k < 4; k++) { if (cellSig(x) === sb) { return true; } f = flipCells(x); if (cellSig(f) === sb) { return true; } x = rotCells(x); }
    return false;
  }
  function connected(cells) {
    var set = {}, i, seen = {}, stack, cur, n = 0, d, nb, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    if (!cells.length) { return false; }
    for (i = 0; i < cells.length; i++) { set[cellKey(cells[i][0], cells[i][1])] = true; }
    stack = [cells[0]]; seen[cellKey(cells[0][0], cells[0][1])] = true;
    while (stack.length) { cur = stack.pop(); n++; for (d = 0; d < 4; d++) { nb = cellKey(cur[0] + DIRS[d][0], cur[1] + DIRS[d][1]); if (set[nb] && !seen[nb]) { seen[nb] = true; stack.push([cur[0] + DIRS[d][0], cur[1] + DIRS[d][1]]); } } }
    return n === cells.length;
  }
  /* 形を つながった k 個に 分ける（たね から 育てる・つながりを 確かめる） */
  function splitCells(cells, k) {
    var tries, i, j, owner, seeds, grown, cand, parts, ok, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]], idxOf = {}, d, nb, p;
    for (i = 0; i < cells.length; i++) { idxOf[cellKey(cells[i][0], cells[i][1])] = i; }
    for (tries = 0; tries < 200; tries++) {
      owner = []; for (i = 0; i < cells.length; i++) { owner.push(-1); }
      seeds = shuffle(cells.map(function (c, idx) { return idx; })).slice(0, k);
      for (i = 0; i < k; i++) { owner[seeds[i]] = i; }
      grown = k;
      while (grown < cells.length) {
        cand = [];
        for (i = 0; i < cells.length; i++) { if (owner[i] < 0) { continue; } for (d = 0; d < 4; d++) { nb = idxOf[cellKey(cells[i][0] + DIRS[d][0], cells[i][1] + DIRS[d][1])]; if (nb !== undefined && owner[nb] < 0) { cand.push([nb, owner[i]]); } } }
        if (!cand.length) { break; }
        p = pick(cand); owner[p[0]] = p[1]; grown++;
      }
      if (grown < cells.length) { continue; }
      parts = []; for (i = 0; i < k; i++) { parts.push([]); }
      for (i = 0; i < cells.length; i++) { parts[owner[i]].push(cells[i]); }
      ok = true; for (j = 0; j < k; j++) { if (parts[j].length < 1 || !connected(parts[j])) { ok = false; } }
      if (ok) { return parts; }
    }
    return null;
  }
  function rectCells(rows, cols) { var r, c, out = []; for (r = 0; r < rows; r++) { for (c = 0; c < cols; c++) { out.push([r, c]); } } return out; }
  function unionCells(a, b) { var out = a.slice(), i, seen = {}; for (i = 0; i < a.length; i++) { seen[cellKey(a[i][0], a[i][1])] = true; } for (i = 0; i < b.length; i++) { if (!seen[cellKey(b[i][0], b[i][1])]) { out.push(b[i]); } } return out; }
  function placedUnionIsTarget(a, b, target) {
    /* a は 元の位置、b を 上下左右に ずらして a と 重ならず 合わせて target に なるか（回さない） */
    var dr, dc, i, moved, u, tk = {}, ok, key;
    if (a.length + b.length !== target.length) { return false; }
    for (i = 0; i < target.length; i++) { tk[cellKey(target[i][0], target[i][1])] = true; }
    for (dr = -4; dr <= 4; dr++) {
      for (dc = -4; dc <= 4; dc++) {
        moved = []; ok = true;
        for (i = 0; i < b.length; i++) { key = cellKey(b[i][0] + dr, b[i][1] + dc); if (!tk[key]) { ok = false; break; } moved.push([b[i][0] + dr, b[i][1] + dc]); }
        if (!ok) { continue; }
        u = unionCells(a, moved);
        if (u.length === target.length) { return true; }
      }
    }
    return false;
  }
  function pairFills(a, b, target) {
    var na = normCells(a), tk = {}, i, dr, dc, moved, ok, key, ex = extent(target);
    for (i = 0; i < target.length; i++) { tk[cellKey(target[i][0], target[i][1])] = true; }
    if (a.length + b.length !== target.length) { return false; }
    for (dr = 0; dr < ex[0]; dr++) {
      for (dc = 0; dc < ex[1]; dc++) {
        moved = []; ok = true;
        for (i = 0; i < na.length; i++) { key = cellKey(na[i][0] + dr, na[i][1] + dc); if (!tk[key]) { ok = false; break; } moved.push([na[i][0] + dr, na[i][1] + dc]); }
        if (!ok) { continue; }
        if (placedUnionIsTarget(moved, b, target)) { return true; }
      }
    }
    return false;
  }
  function randomPoly(n) {
    var cells = [[0, 0]], tries, c, d, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]], nb, seen = { '0,0': true };
    for (tries = 0; tries < 200 && cells.length < n; tries++) { c = pick(cells); d = pick(DIRS); nb = [c[0] + d[0], c[1] + d[1]]; if (seen[cellKey(nb[0], nb[1])]) { continue; } seen[cellKey(nb[0], nb[1])] = true; cells.push(nb); }
    return normCells(cells);
  }
  var WAKE_PAT = [
    { key: 'r4', name: 'おなじ おおきさの ながしかく 4つ', lines: [[0, 0.25, 1, 0.25], [0, 0.5, 1, 0.5], [0, 0.75, 1, 0.75]] },
    { key: 's4', name: 'おなじ おおきさの ましかく 4つ', lines: [[0, 0.5, 1, 0.5], [0.5, 0, 0.5, 1]] },
    { key: 's2r2', name: 'ましかく 2つと ながしかく 2つ', lines: [[0.5, 0, 0.5, 1], [0, 0.5, 0.5, 0.5], [0.75, 0, 0.75, 1]] },
    { key: 't2', name: 'おなじ おおきさの さんかく 2つ', lines: [[0, 0, 1, 1]] },
    { key: 't4', name: 'おなじ おおきさの さんかく 4つ', lines: [[0, 0, 1, 1], [1, 0, 0, 1]] },
    { key: 't1s2', name: 'おおきい さんかく 1つと ちいさい さんかく 2つ', lines: [[0, 0, 1, 1], [1, 0, 0.5, 0.5]] },
    { key: 'r2', name: 'おなじ おおきさの ながしかく 2つ', lines: [[0.5, 0, 0.5, 1]] },
    { key: 'r3', name: 'おなじ おおきさの ながしかく 3つ', lines: [[0, 0.333, 1, 0.333], [0, 0.667, 1, 0.667]] }
  ];
  /* ななめの きりかた（三角を ふくむ）＝ましかくを せんで きった かけらの 組。かけらは 頂点（0〜1）で 持つ */
  var NANAME_PAT = [
    { key: 't2', name: 'おおきい さんかく 2つ', polys: [[[0, 0], [1, 0], [1, 1]], [[0, 0], [1, 1], [0, 1]]] },
    { key: 't4', name: 'ちいさい さんかく 4つ', polys: [[[0, 0], [1, 0], [0.5, 0.5]], [[1, 0], [1, 1], [0.5, 0.5]], [[1, 1], [0, 1], [0.5, 0.5]], [[0, 1], [0, 0], [0.5, 0.5]]] },
    { key: 't1s2', name: 'おおきい さんかく 1つと ちいさい さんかく 2つ', polys: [[[0, 0], [1, 1], [0, 1]], [[0, 0], [1, 0], [0.5, 0.5]], [[1, 0], [1, 1], [0.5, 0.5]]] },
    { key: 'r1t2', name: 'ながしかく 1つと さんかく 2つ', polys: [[[0, 0], [0.5, 0], [0.5, 1], [0, 1]], [[0.5, 0], [1, 0], [1, 1]], [[0.5, 0], [1, 1], [0.5, 1]]] },
    { key: 'kado', name: 'ちいさい さんかく 1つと かどが 5つの かたち', polys: [[[0.5, 0], [1, 0], [1, 0.5]], [[0, 0], [0.5, 0], [1, 0.5], [1, 1], [0, 1]]] },
    { key: 'tsuno', name: 'さんかく 1つと しかく 1つ', polys: [[[0, 0], [1, 0], [1, 0.5]], [[0, 0], [1, 0.5], [1, 1], [0, 1]]] },
    { key: 'yama', name: 'まんなかの さんかく 1つと はしの さんかく 2つ', polys: [[[0, 1], [0.5, 0], [1, 1]], [[0, 0], [0.5, 0], [0, 1]], [[0.5, 0], [1, 0], [1, 1]]] },
    { key: 'hoso4', name: 'ほそい さんかく 4つ', polys: [[[0, 0], [0.5, 1], [0, 1]], [[0, 0], [0.5, 0], [0.5, 1]], [[0.5, 0], [1, 0], [1, 1]], [[0.5, 0], [1, 1], [0.5, 1]]] }
  ];
  WH.NANAME_PAT = NANAME_PAT;
  /* かけらの しるし＝へんの ながさ（まわしても うらがえしても かわらない）。組の しるし＝かけらの しるしを ならべたもの */
  function polySig(p) { var i, s = [], a, b; for (i = 0; i < p.length; i++) { a = p[i]; b = p[(i + 1) % p.length]; s.push(Math.round(Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])) * 100)); } s.sort(function (x, y) { return x - y; }); return s.join(','); }
  function patSig(pat) { var i, s = []; for (i = 0; i < pat.polys.length; i++) { s.push(polySig(pat.polys[i])); } s.sort(); return s.join('/'); }
  function polyArea(p) { var i, a = 0, n = p.length; for (i = 0; i < n; i++) { a += p[i][0] * p[(i + 1) % n][1] - p[(i + 1) % n][0] * p[i][1]; } return Math.abs(a) / 2; }
  function hasTri(pat) { var i; for (i = 0; i < pat.polys.length; i++) { if (pat.polys[i].length === 3) { return true; } } return false; }
  WH.patSig = patSig; WH.polyArea = polyArea; WH.hasTri = hasTri;
  function rotN(cells, k) { var x = normCells(cells), i; for (i = 0; i < k; i++) { x = rotCells(x); } return x; }
  function congruentRot(a, b) { var k, sb = cellSig(b); if (a.length !== b.length) { return false; } for (k = 0; k < 4; k++) { if (cellSig(rotN(a, k)) === sb) { return true; } } return false; }
  /* まわして よい ときに 2つで target を うめられるか */
  function pairFillsRot(a, b, target) { var i, j; for (i = 0; i < 4; i++) { for (j = 0; j < 4; j++) { if (pairFills(rotN(a, i), rotN(b, j), target)) { return true; } } } return false; }
  WH.rotN = rotN; WH.pairFillsRot = pairFillsRot; WH.congruentRot = congruentRot;
  function makeKaiten(level) {
    var tries, target, parts, shown, wrongs, w, i, j, ok, cands, q;
    for (tries = 0; tries < 200; tries++) {
      target = normCells(pick([rectCells(3, 3), rectCells(2, 4), [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 1]]]));
      parts = splitCells(target, 2); if (!parts) { continue; }
      if (parts[0].length < 2 || parts[1].length < 2 || congruentRot(parts[0], parts[1])) { continue; }
      shown = [rotN(parts[0], 1 + ri(3)), rotN(parts[1], ri(4))];
      if (pairFills(shown[0], shown[1], target)) { continue; }   /* まわさないと うまらない＝まわして かんがえる 問題 */
      wrongs = [];
      for (i = 0; i < 80 && wrongs.length < 2; i++) {
        w = randomPoly(parts[wrongs.length % 2].length + (rnd() < 0.5 ? 0 : (rnd() < 0.5 ? 1 : -1)));
        if (w.length < 2) { continue; }
        ok = true;
        for (j = 0; j < 2; j++) { if (congruentRot(w, parts[j]) || pairFillsRot(parts[j], w, target)) { ok = false; } }
        for (j = 0; j < wrongs.length; j++) { if (congruentRot(w, wrongs[j]) || pairFillsRot(wrongs[j], w, target)) { ok = false; } }
        if (ok) { wrongs.push(rotN(w, ri(4))); }
      }
      if (wrongs.length < 2) { continue; }
      cands = shuffle([{ cells: shown[0], real: true }, { cells: shown[1], real: true }, { cells: wrongs[0], real: false }, { cells: wrongs[1], real: false }]);
      q = { g: 'katachi', sub: 'kaiten', schema: 'kaiten', level: level, target: target, kind: 'multi', need: 2, cType: 'canvas', choices: [], answerSet: [], v: ri(2) };
      for (i = 0; i < 4; i++) { q.choices.push(cands[i].cells); if (cands[i].real) { q.answerSet.push(i); } }
      q.answerSets = [q.answerSet];
      return q;
    }
    return null;
  }
  function makeNaname(level) {
    var pool = level === 3 ? NANAME_PAT : NANAME_PAT.slice(0, 5), pat = pick(pool), others = shuffle(NANAME_PAT.filter(function (p) { return p.key !== pat.key; })).slice(0, 3), cands = shuffle([pat].concat(others));
    return { g: 'katachi', sub: 'naname', schema: 'naname', level: level, pat: pat, kind: 'choose', cType: 'canvas', choices: cands, answerIndex: cands.indexOf(pat), v: ri(2) };
  }
  function drawPolys(ctx, polys, x0, y0, s, fills, gap) {
    var i, k, p, cx, cy, pts;
    for (i = 0; i < polys.length; i++) {
      p = polys[i]; cx = 0; cy = 0;
      for (k = 0; k < p.length; k++) { cx += p[k][0] / p.length; cy += p[k][1] / p.length; }
      pts = [];
      for (k = 0; k < p.length; k++) { pts.push([x0 + (p[k][0] + (cx - 0.5) * gap) * s, y0 + (p[k][1] + (cy - 0.5) * gap) * s]); }
      D.poly(ctx, pts, fills ? fills[i % fills.length] : null, COL.sumi, 2.5);
    }
  }
  var NANAME_FILLS = ['#9fd0f0', '#f6d32d', '#f6b7c4', '#c9e6b8'];
  /* 90どの まわる しるし＝丸の 4分の1の 矢印・先は 大きく（K14） */
  function drawTurnArrow(ctx, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI * 1.5, false); ctx.strokeStyle = COL.daidai; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();
    D.poly(ctx, [[x + r * 0.7, y - r], [x - r * 0.05, y - r - r * 0.6], [x - r * 0.05, y - r + r * 0.6]], COL.daidai, null);
  }
  /* 解き方＝awase あわせる・kirenai きれない かけら・wake わける せん・ori おりがみ・kaiten まわした かけら・naname ななめの きりかた */
  function makeKatachi(level, sch) {
    var sub = sch, tries, target, parts, pieces, wrongs, w, i, j, q, pat, cands, others, half, full, mirror, sets, seen, sig, left, k, cells;
    if (sub === 'kaiten') { return makeKaiten(level); }
    if (sub === 'naname') { return makeNaname(level); }
    if (sub === 'awase') {
      for (tries = 0; tries < 100; tries++) {
        target = level === 1 ? rectCells(2, 2) : (level === 2 ? rectCells(2, 3) : pick([rectCells(3, 3), rectCells(2, 4), [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 1]]]));
        parts = splitCells(target, 2); if (!parts) { continue; }
        if (level >= 2 && (parts[0].length < 2 || parts[1].length < 2)) { continue; }
        if (cellSig(parts[0]) === cellSig(parts[1])) { continue; }
        pieces = [parts[0], parts[1]]; wrongs = [];
        for (i = 0; i < 60 && wrongs.length < 2; i++) {
          w = randomPoly(pieces[wrongs.length % 2].length + (rnd() < 0.5 ? 0 : (rnd() < 0.5 ? 1 : -1)));
          if (w.length < 1) { continue; }
          ok = true;
          for (j = 0; j < pieces.length; j++) { if (cellSig(w) === cellSig(pieces[j]) || pairFills(pieces[j], w, target)) { ok = false; } }
          for (j = 0; j < wrongs.length; j++) { if (cellSig(w) === cellSig(wrongs[j]) || pairFills(wrongs[j], w, target)) { ok = false; } }
          if (ok) { wrongs.push(w); }
        }
        if (wrongs.length < 2) { continue; }
        cands = shuffle([{ cells: pieces[0], real: true }, { cells: pieces[1], real: true }, { cells: wrongs[0], real: false }, { cells: wrongs[1], real: false }]);
        q = { g: 'katachi', sub: sub, level: level, target: target, kind: 'multi', need: 2, cType: 'canvas', choices: [], answerSet: [], v: ri(2) };
        for (i = 0; i < 4; i++) { q.choices.push(cands[i].cells); if (cands[i].real) { q.answerSet.push(i); } }
        q.answerSets = [q.answerSet];
        return q;
      }
      return null;
    }
    if (sub === 'kirenai') {
      for (tries = 0; tries < 100; tries++) {
        target = level === 2 ? rectCells(2, 3) : pick([rectCells(3, 3), rectCells(2, 4)]);
        parts = splitCells(target, 3); if (!parts) { continue; }
        if (cellSig(parts[0]) === cellSig(parts[1]) || cellSig(parts[0]) === cellSig(parts[2]) || cellSig(parts[1]) === cellSig(parts[2])) { continue; }
        w = null;
        for (i = 0; i < 60 && !w; i++) {
          cells = randomPoly(parts[ri(3)].length);
          ok = true; for (j = 0; j < 3; j++) { if (congruent(cells, parts[j])) { ok = false; } }
          if (ok) { w = cells; }
        }
        if (!w) { continue; }
        cands = shuffle([{ cells: parts[0], fake: false }, { cells: parts[1], fake: false }, { cells: parts[2], fake: false }, { cells: w, fake: true }]);
        q = { g: 'katachi', sub: sub, level: level, target: target, parts: parts, kind: 'choose', cType: 'canvas', choices: [], v: ri(2) };
        for (i = 0; i < 4; i++) { q.choices.push(cands[i].cells); if (cands[i].fake) { q.answerIndex = i; } }
        return q;
      }
      return null;
    }
    if (sub === 'wake') {
      pat = pick(level === 2 ? WAKE_PAT.slice(0, 5) : WAKE_PAT);
      others = shuffle(WAKE_PAT.filter(function (p) { return p.key !== pat.key; })).slice(0, 3);
      cands = shuffle([pat].concat(others));
      q = { g: 'katachi', sub: sub, level: level, pat: pat, kind: 'choose', cType: 'canvas', choices: cands, answerIndex: cands.indexOf(pat), v: ri(2) };
      return q;
    }
    /* ori＝2つに おった かみ（ひだりの はんぶん）を きって ひらくと？ ます 4×3・おりめ は まんなか */
    for (tries = 0; tries < 100; tries++) {
      left = []; seen = {}; k = level === 1 ? 2 : (level === 2 ? 3 : 4);
      cells = [[0, 1], [1, 1], [2, 1]];   /* おりめに 接する ます から はじめる */
      left.push(pick(cells)); seen[cellKey(left[0][0], left[0][1])] = true;
      for (i = 0; i < 50 && left.length < k; i++) { w = pick(left); j = pick([[1, 0], [-1, 0], [0, -1], [0, 1]]); cells = [w[0] + j[0], w[1] + j[1]]; if (cells[0] < 0 || cells[0] > 2 || cells[1] < 0 || cells[1] > 1 || seen[cellKey(cells[0], cells[1])]) { continue; } seen[cellKey(cells[0], cells[1])] = true; left.push(cells); }
      if (left.length < k) { continue; }
      mirror = []; for (i = 0; i < left.length; i++) { mirror.push([left[i][0], 3 - left[i][1]]); }
      full = unionCells(left, mirror);
      /* まちがい＝うつさずに ずらした・上下に うつした・1ます ちがう はんぶんを うつした */
      sets = []; sig = {}; sig[cellSig(full)] = true;
      half = []; for (i = 0; i < left.length; i++) { half.push([left[i][0], left[i][1] + 2]); } cands = unionCells(left, half); if (!sig[cellSig(cands)] && cands.length === full.length) { sig[cellSig(cands)] = true; sets.push(cands); }
      half = []; for (i = 0; i < left.length; i++) { half.push([2 - left[i][0], left[i][1] + 2]); } cands = unionCells(left, half); if (!sig[cellSig(cands)] && cands.length === full.length) { sig[cellSig(cands)] = true; sets.push(cands); }
      for (i = 0; i < 40 && sets.length < 3; i++) {
        half = left.slice(0, left.length - 1); w = [ri(3), ri(2)]; if (seen[cellKey(w[0], w[1])]) { continue; } half.push(w);
        mirror = []; for (j = 0; j < half.length; j++) { mirror.push([half[j][0], 3 - half[j][1]]); }
        cands = unionCells(half, mirror);
        if (!sig[cellSig(cands)]) { sig[cellSig(cands)] = true; sets.push(cands); }
      }
      if (sets.length < 3) { continue; }
      cands = shuffle([full].concat(sets.slice(0, 3)));
      q = { g: 'katachi', sub: sub, level: level, left: left, full: full, kind: 'choose', cType: 'canvas', choices: cands, answerIndex: cands.indexOf(full), v: ri(2) };
      return q;
    }
    return null;
    var ok;
  }
  function drawCells(ctx, cells, x0, y0, cs, fill, grid) {
    var i, r, c;
    for (i = 0; i < cells.length; i++) { r = cells[i][0]; c = cells[i][1]; ctx.fillStyle = fill; ctx.fillRect(x0 + c * cs, y0 + r * cs, cs, cs); ctx.strokeStyle = COL.sumi; ctx.lineWidth = 2; ctx.strokeRect(x0 + c * cs, y0 + r * cs, cs, cs); }
    if (grid) { for (i = 0; i < grid.length; i++) { ctx.strokeStyle = COL.hai; ctx.lineWidth = 1; ctx.strokeRect(x0 + grid[i][1] * cs, y0 + grid[i][0] * cs, cs, cs); } }
  }
  function extent(cells) { var mr = 0, mc = 0, i, n = normCells(cells); for (i = 0; i < n.length; i++) { if (n[i][0] > mr) { mr = n[i][0]; } if (n[i][1] > mc) { mc = n[i][1]; } } return [mr + 1, mc + 1]; }
  function paintCellsFit(canvas, cells, fill, maxCell, grid, frame) {
    var c = WH.setupCanvas(canvas), ex = extent(grid || cells), cs = Math.min(maxCell || 40, (c.w - 16) / ex[1], (c.h - 16) / ex[0]), x0 = (c.w - cs * ex[1]) / 2, y0 = (c.h - cs * ex[0]) / 2;
    WH.paper(c.ctx, c.w, c.h, frame);
    if (grid) { drawCells(c.ctx, normCells(cells), x0, y0, cs, fill, normCells(grid)); } else { drawCells(c.ctx, normCells(cells), x0, y0, cs, fill, null); }
    return c;
  }
  function paintKatachiStem(canvas, q, hint) {
    var c, s, i, l;
    if (q.sub === 'awase' || q.sub === 'kaiten') { paintCellsFit(canvas, q.target, '#9fd0f0', 44); return; }
    if (q.sub === 'naname') { c = WH.setupCanvas(canvas); WH.paper(c.ctx, c.w, c.h); s = Math.min(c.w, c.h) * 0.72; drawPolys(c.ctx, q.pat.polys, (c.w - s) / 2, (c.h - s) / 2, s, hint ? NANAME_FILLS : ['#fff2b8'], 0); return; }
    if (q.sub === 'kirenai') {
      c = paintCellsFit(canvas, q.target, '#9fd0f0', 44);
      if (hint) {   /* 足場＝ほんとうの きりめ を てんせんで */
        s = Math.min(44, (c.w - 16) / extent(q.target)[1], (c.h - 16) / extent(q.target)[0]);
        for (i = 0; i < q.parts.length; i++) { drawCells(c.ctx, normCells(q.parts[i]).map(function (x) { return [x[0] + q.parts[i][0][0] - normCells(q.parts[i])[0][0], x[1]]; }), (c.w - s * extent(q.target)[1]) / 2, (c.h - s * extent(q.target)[0]) / 2, s, ['#9fd0f0', '#f6d32d', '#f6b7c4'][i], null); }
      }
      return;
    }
    if (q.sub === 'wake') { c = WH.setupCanvas(canvas); WH.paper(c.ctx, c.w, c.h); s = Math.min(c.w, c.h) * 0.7; c.ctx.strokeStyle = COL.sumi; c.ctx.lineWidth = 3; c.ctx.strokeRect((c.w - s) / 2, (c.h - s) / 2, s, s); D.text(c.ctx, q.pat.name, c.w / 2, c.h - 16, 14, COL.daidai); return; }
    /* ori＝おった かみ（ひだりの はんぶん）＋おりめ */
    c = WH.setupCanvas(canvas); WH.paper(c.ctx, c.w, c.h);
    s = Math.min(c.w / 4, c.h / 4); l = (c.w - s * 2) / 2;
    c.ctx.fillStyle = '#fff2b8'; c.ctx.fillRect(l, (c.h - s * 3) / 2, s * 2, s * 3); c.ctx.strokeStyle = COL.sumi; c.ctx.lineWidth = 2; c.ctx.strokeRect(l, (c.h - s * 3) / 2, s * 2, s * 3);
    drawCells(c.ctx, q.left, l, (c.h - s * 3) / 2, s, hint ? '#9fd0f0' : COL.hai, null);
    c.ctx.setLineDash && c.ctx.setLineDash([8, 6]); D.line(c.ctx, l + s * 2, (c.h - s * 3) / 2 - 8, l + s * 2, (c.h + s * 3) / 2 + 8, COL.ao, 4); c.ctx.setLineDash && c.ctx.setLineDash([]);
    if (hint) { c.ctx.globalAlpha = 0.35; drawCells(c.ctx, q.full.filter(function (x) { return x[1] >= 2; }), l, (c.h - s * 3) / 2, s, '#9fd0f0', null); c.ctx.globalAlpha = 1; }
  }
  function paintKatachiChoice(canvas, q, i, hint) {
    var c, s, k;
    if (q.sub === 'awase' || q.sub === 'kirenai') { paintCellsFit(canvas, q.choices[i], q.sub === 'awase' ? '#f6d32d' : '#9fd0f0', 34, null, COL.hai); return; }
    if (q.sub === 'kaiten') { c = paintCellsFit(canvas, q.choices[i], '#f6d32d', 30, null, COL.hai); if (hint) { drawTurnArrow(c.ctx, c.w - 20, 20, 11); } return; }
    if (q.sub === 'naname') { c = WH.setupCanvas(canvas); WH.paper(c.ctx, c.w, c.h, COL.hai); s = Math.min(c.w, c.h) * 0.62; drawPolys(c.ctx, q.choices[i].polys, (c.w - s) / 2, (c.h - s) / 2, s, NANAME_FILLS, 0.24); return; }
    if (q.sub === 'wake') {
      c = WH.setupCanvas(canvas); WH.paper(c.ctx, c.w, c.h, COL.hai); s = Math.min(c.w, c.h) * 0.72;
      c.ctx.save(); c.ctx.translate((c.w - s) / 2, (c.h - s) / 2);
      c.ctx.strokeStyle = COL.sumi; c.ctx.lineWidth = 3; c.ctx.strokeRect(0, 0, s, s);
      for (k = 0; k < q.choices[i].lines.length; k++) { D.line(c.ctx, q.choices[i].lines[k][0] * s, q.choices[i].lines[k][1] * s, q.choices[i].lines[k][2] * s, q.choices[i].lines[k][3] * s, COL.ao, 3); }
      c.ctx.restore(); return;
    }
    paintCellsFit(canvas, q.choices[i], '#9fd0f0', 30, rectCells(3, 4), COL.hai);
  }

  /* ================= 10 あなに ぴったり ================= */
  function anaSig(xs, ys, cx, cy, r) {
    var i, s = [];
    for (i = 0; i < xs.length; i++) { if (Math.abs(xs[i] - cx) < r) { s.push('v' + Math.round((xs[i] - cx) / r * 3)); } }
    for (i = 0; i < ys.length; i++) { if (Math.abs(ys[i] - cy) < r) { s.push('h' + Math.round((ys[i] - cy) / r * 3)); } }
    s.sort(); return s.join('|');
  }
  function makeAna(level) {
    var tries, xs, ys, r = 0.16, cx, cy, sig, cands, seen, i, q, c, n = level === 1 ? 2 : 3, lines;
    for (tries = 0; tries < 200; tries++) {
      xs = shuffle([0.2, 0.36, 0.52, 0.68, 0.84]).slice(0, n).sort(); ys = shuffle([0.22, 0.42, 0.62, 0.8]).slice(0, n).sort();
      cx = 0.2 + rnd() * 0.6; cy = 0.22 + rnd() * 0.56;
      sig = anaSig(xs, ys, cx, cy, r);
      if (sig === '' || sig.split('|').length < 2) { continue; }
      seen = {}; seen[sig] = true; cands = [];
      for (i = 0; i < 80 && cands.length < 3; i++) {
        c = { cx: 0.2 + rnd() * 0.6, cy: 0.22 + rnd() * 0.56, rot: level >= 2 && rnd() < 0.3 ? 1 : 0, mir: level === 3 && rnd() < 0.3 ? 1 : 0 };
        lines = anaLines(xs, ys, c, r);
        c.sig = lines.sig;
        if (seen[c.sig] || c.sig === '' || c.sig.split('|').length < 2) { continue; }
        seen[c.sig] = true; cands.push(c);
      }
      if (cands.length < 3) { continue; }
      cands = shuffle([{ cx: cx, cy: cy, rot: 0, mir: 0, sig: sig, right: true }].concat(cands));
      q = { g: 'ana', level: level, xs: xs, ys: ys, cx: cx, cy: cy, r: r, choices: cands, kind: 'choose', cType: 'canvas', v: ri(2) };
      for (i = 0; i < 4; i++) { if (cands[i].right) { q.answerIndex = i; } }
      return q;
    }
    return null;
  }
  /* あなの なかの 線＝まんなか からの ずれ（−1〜1）の 一覧。rot＝90度 まわす・mir＝左右 うらがえす */
  function anaLines(xs, ys, c, r) {
    var i, v = [], h = [], t, out = [], s = [];
    for (i = 0; i < xs.length; i++) { if (Math.abs(xs[i] - c.cx) < r) { v.push((xs[i] - c.cx) / r); } }
    for (i = 0; i < ys.length; i++) { if (Math.abs(ys[i] - c.cy) < r) { h.push((ys[i] - c.cy) / r); } }
    if (c.rot) { t = v; v = h.map(function (x) { return -x; }); h = t; }
    if (c.mir) { v = v.map(function (x) { return -x; }); }
    for (i = 0; i < v.length; i++) { out.push(['v', v[i]]); s.push('v' + Math.round(v[i] * 3)); }
    for (i = 0; i < h.length; i++) { out.push(['h', h[i]]); s.push('h' + Math.round(h[i] * 3)); }
    s.sort();
    return { lines: out, sig: s.join('|') };
  }
  function paintAnaStem(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, lw = Math.max(6, c.w * 0.03), R = q.r * c.w;
    WH.paper(c.ctx, c.w, c.h);
    for (i = 0; i < q.xs.length; i++) { D.line(c.ctx, q.xs[i] * c.w, 6, q.xs[i] * c.w, c.h - 6, COL.sumi, lw); }
    for (i = 0; i < q.ys.length; i++) { D.line(c.ctx, 6, q.ys[i] * c.h, c.w - 6, q.ys[i] * c.h, COL.sumi, lw); }
    D.circle(c.ctx, q.cx * c.w, q.cy * c.h, R, COL.kami, COL.sumi, 3);
    if (hint) {   /* 足場＝あなの ふちで せんが きれる ところに 印 */
      for (i = 0; i < q.xs.length; i++) { if (Math.abs(q.xs[i] - q.cx) < q.r) { D.circle(c.ctx, q.xs[i] * c.w, q.cy * c.h - Math.sqrt(R * R - Math.pow((q.xs[i] - q.cx) * c.w, 2)), 7, COL.daidai); D.circle(c.ctx, q.xs[i] * c.w, q.cy * c.h + Math.sqrt(R * R - Math.pow((q.xs[i] - q.cx) * c.w, 2)), 7, COL.daidai); } }
      for (i = 0; i < q.ys.length; i++) { if (Math.abs(q.ys[i] - q.cy) < q.r) { D.circle(c.ctx, q.cx * c.w - Math.sqrt(R * R - Math.pow((q.ys[i] - q.cy) * c.h, 2)), q.ys[i] * c.h, 7, COL.daidai); D.circle(c.ctx, q.cx * c.w + Math.sqrt(R * R - Math.pow((q.ys[i] - q.cy) * c.h, 2)), q.ys[i] * c.h, 7, COL.daidai); } }
    }
  }
  function paintAnaChoice(canvas, q, i) {
    var c = WH.setupCanvas(canvas), ch = q.choices[i], R = Math.min(c.w, c.h) * 0.42, k, ln = anaLines(q.xs, q.ys, ch, q.r).lines, lw = Math.max(5, R * 0.18);
    WH.paper(c.ctx, c.w, c.h, COL.hai);
    c.ctx.save(); c.ctx.beginPath(); c.ctx.arc(c.w / 2, c.h / 2, R, 0, Math.PI * 2); c.ctx.clip();
    for (k = 0; k < ln.length; k++) {
      if (ln[k][0] === 'v') { D.line(c.ctx, c.w / 2 + ln[k][1] * R, c.h / 2 - R - 4, c.w / 2 + ln[k][1] * R, c.h / 2 + R + 4, COL.sumi, lw); }
      else { D.line(c.ctx, c.w / 2 - R - 4, c.h / 2 + ln[k][1] * R, c.w / 2 + R + 4, c.h / 2 + ln[k][1] * R, COL.sumi, lw); }
    }
    c.ctx.restore();
    D.circle(c.ctx, c.w / 2, c.h / 2, R, null, COL.sumi, 3);
  }

  /* ================= 11 おはなし（こたえの ない もんだい＝せんせいと の ときだけ） ================= */
  var SHITSUMON = [
    { lv: 1, q: 'おなまえを おしえて ください', model: '「わたしの なまえは ○○ です」と、さいごまで いう' },
    { lv: 1, q: 'なんさい ですか', model: '「○さい です」と いう' },
    { lv: 1, q: 'きょうの あさごはんは なにを たべましたか', model: '「○○と ○○を たべました」' },
    { lv: 1, q: 'いちばん すきな あそびは なんですか。どうして すきですか', model: '「○○ です。どうして かと いうと、△△ だから です」' },
    { lv: 2, q: 'どうぶつえんに もって いく ものを 3つ いって ください', model: 'たとえば「おべんとう・すいとう・ぼうし です」' },
    { lv: 2, q: 'おともだちが ころんで ないて いたら、どう しますか', model: '「だいじょうぶ？ と こえを かけて、せんせいを よびます」' },
    { lv: 2, q: 'いま、ここまで どうやって きましたか', model: '「○○に のって、それから あるいて きました」' },
    { lv: 3, q: 'おままごとで、おなじ やくを やりたい こが ふたり いたら、どう しますか', model: '「じゅんばんに やろう、と いいます」「じゃんけんで きめます」' },
    { lv: 3, q: 'おともだちが どろんこに なって しまったら、どう しますか', model: '「いっしょに てを あらいに いきます」「せんせいに いいます」' },
    { lv: 3, q: 'たからものは なんですか。どうして たからもの なのですか', model: '「○○ です。△△ だから、たいせつ です」' }
  ];
  function makeHanashi(level, sch) {
    var subs = level === 1 ? ['shitsumon', 'docchi'] : (level === 2 ? ['shitsumon', 'docchi', 'tsukuru'] : ['shitsumon', 'tsukuru', 'tsukuru']), sub = sch || pick(subs), q, pool, a, b, c, its;
    if (sub === 'shitsumon') {
      pool = SHITSUMON.filter(function (s) { return s.lv <= level; });
      a = pick(pool);
      return { g: 'hanashi', sub: sub, level: level, kind: 'open', cType: 'none', ask: a.q, model: a.model, v: ri(2) };
    }
    if (sub === 'docchi') {
      its = shuffle(itemsWhere(function (it) { return !!it.food || !!it.animal || !!it.ride; })).slice(0, 2);
      return { g: 'hanashi', sub: sub, level: level, kind: 'open', cType: 'none', pics: [its[0].id, its[1].id], model: '「わたしは ' + its[0].name + ' が すき です。どうして かと いうと、△△ だから です」', v: ri(2) };
    }
    its = shuffle(WH.ITEMS); a = pick(itemsWhere(function (it) { return !!it.animal; })); b = pick(itemsWhere(function (it) { return !!it.food; })); c = pick(itemsWhere(function (it) { return !!it.ride || !!it.carry; }));
    q = { g: 'hanashi', sub: sub, level: level, kind: 'open', cType: 'none', pics: level === 2 ? [a.id, b.id] : [a.id, b.id, c.id], v: ri(2) };
    q.model = 'たとえば「ある ひ、' + a.name + ' が ' + b.name + ' を みつけました。' + (level === 3 ? c.name + ' に のせて（' + c.name + ' を もって）、' : '') + 'おうちに かえって、みんなで たべました。おしまい」';
    return q;
  }

  /* ================= 制限時間（秒）＝練習帳の〈時間〉を 1問あたりに ならした値。いちばん上の レベルが 本番の 水準（K11）
     ひも 40秒/2問→20・くらべる まめ20秒/問・ジュース1分/2問→20・シーソー 1分/2問→30・かぞえる 1分/2種→30（差は1分/6→10 なので 20に）
     わける 1分30秒/2問→45・かずの おはなし 2分/3問→40・なかま 1分/3部屋→20・おなじ え 40秒/3→15・かたち 1分〜2分/3〜6→20・あな 1分/5→15。おはなし は 時間なし */
  var TIME_SEC = {
    himo: { 1: 45, 2: 30, 3: 20 }, kurabe: { 1: 45, 2: 30, 3: 20 }, shiso: { 1: 45, 2: 35, 3: 30 }, kazoe: { 1: 45, 2: 30, 3: 20 },
    wakeru: { 1: 60, 2: 50, 3: 45 }, kazuhanashi: { 1: 60, 2: 50, 3: 40 }, nakama: { 1: 45, 2: 30, 3: 20 }, onajie: { 1: 40, 2: 25, 3: 15 },
    katachi: { 1: 45, 2: 30, 3: 20 }, ana: { 1: 40, 2: 25, 3: 15 }, hanashi: { 1: 0, 2: 0, 3: 0 }
  };
  /* ふたつ きく（1回の 読みで 2つ）の 組の 秒数＝練習帳の〈時間〉そのまま（1問あたりに ならさない・設計 5-2）
     ひも 40秒（練習帳1）・シーソー 60秒（4）・コップ 60秒（3）・まめ 40秒（2）・かぞえる 60秒（7）・わける 90秒（10） */
  var PAIR_SEC = { himo: 40, shiso: 60, cup: 60, pile: 40, kazoe: 60, wakeru: 90 };
  WH.TIME_SEC = TIME_SEC; WH.PAIR_SEC = PAIR_SEC;
  WH.timeFor = function (q) {
    var t = TIME_SEC[q.g];
    if (q.kind === 'open') { return 0; }
    if (q.kind === 'pair') { return PAIR_SEC[q.g === 'kurabe' ? q.schema : q.g] || 60; }
    return (t && t[q.level]) ? t[q.level] : 30;
  };

  var GENRES = [
    { id: 'himo', name: 'ひも', sub: 'どれが ながい？ ほどく・まがる・ずれる', make: makeHimo },
    { id: 'kurabe', name: 'くらべる', sub: 'のんだ りょう・やま・ます・じゅんばん', make: makeKurabe },
    { id: 'shiso', name: 'シーソー', sub: 'おもいのは？ つりあい・おきかえ', make: makeShiso },
    { id: 'kazoe', name: 'かぞえる', sub: 'いくつ・ちがい・おなじ かず', make: makeKazoe },
    { id: 'wakeru', name: 'わける', sub: 'ずつ・おなじ かずずつ・あまり', make: makeWakeru },
    { id: 'kazuhanashi', name: 'かずの おはなし', sub: 'ふえて へって・あげる もらう・くらべる', make: makeKazuhanashi },
    { id: 'nakama', name: 'なかま', sub: 'はずれは どれ？ どうして？', make: makeNakama },
    { id: 'onajie', name: 'おなじ え', sub: 'おなじ・ちがう・むきが ちがう', make: makeOnajie },
    { id: 'katachi', name: 'かたち', sub: 'あわせる・まわす・きる・おる', make: makeKatachi },
    { id: 'ana', name: 'あなに ぴったり', sub: 'あなに あう のは どれ？', make: makeAna },
    { id: 'hanashi', name: 'おはなし', sub: 'えで おはなし・しつもんに こたえる', make: makeHanashi, open: true }
  ];
  WH.GENRES = GENRES;
  var GENRE_BY_ID = {};
  (function () { var i; for (i = 0; i < GENRES.length; i++) { GENRE_BY_ID[GENRES[i].id] = GENRES[i]; WH.GENRE_IDS.push(GENRES[i].id); } })();
  WH.genreById = function (id) { return GENRE_BY_ID[id]; };

  /* 解き方の 一覧（レベルごと・重みは くりかえしで）。やさしい＝基本・ふつう＝基本＋1つ・むずかしい＝ぜんぶ を まぜる（設計 5-3） */
  var SCHEMA_LV = {
    himo: { 1: ['musubi'], 2: ['musubi', 'zure'], 3: ['musubi', 'magari', 'zure', 'tsunagi'] },
    kurabe: { 1: ['cup'], 2: ['cup', 'pile', 'taiou'], 3: ['cup', 'cup', 'pile', 'pile', 'narabe', 'taiou', 'gyaku'] },
    shiso: { 1: ['kihon'], 2: ['kihon', 'kihon', 'tsuriai'], 3: ['kihon', 'kihon', 'tsuriai', 'okikae'] },
    kazoe: { 1: ['count'], 2: ['count', 'diff', 'same'], 3: ['count', 'count', 'diff', 'same'] },
    wakeru: { 1: ['zutsu'], 2: ['zutsu', 'hitoshiku'], 3: ['zutsu', 'zutsu', 'hitoshiku', 'amari'] },
    kazuhanashi: { 1: ['fueteheru'], 2: ['fueteheru', 'yaritori'], 3: ['fueteheru', 'yaritori', 'kurabete'] },
    nakama: { 1: ['hazure'], 2: ['hazure', 'hazure', 'niteiru', 'wakeru2'], 3: ['hazure', 'chikai', 'chikai', 'niteiru', 'wakeoo'] },
    onajie: { 1: ['onaji'], 2: ['onaji', 'chigau'], 3: ['onaji', 'chigau', 'muki'] },
    katachi: { 1: ['awase', 'ori'], 2: ['awase', 'kirenai', 'wake', 'ori', 'naname'], 3: ['awase', 'kirenai', 'wake', 'ori', 'kaiten', 'naname'] },
    ana: { 1: ['ana'], 2: ['ana'], 3: ['ana'] },
    hanashi: { 1: ['shitsumon', 'docchi'], 2: ['shitsumon', 'docchi', 'tsukuru'], 3: ['shitsumon', 'tsukuru', 'tsukuru'] }
  };
  WH.SCHEMA_LV = SCHEMA_LV;
  function schemaCount(gid, level) { var l = SCHEMA_LV[gid][level], seen = {}, n = 0, i; for (i = 0; i < l.length; i++) { if (!seen[l[i]]) { seen[l[i]] = 1; n++; } } return n; }
  WH.schemaCount = schemaCount;
  function pickSchema(gid, level, avoid) {
    var l = SCHEMA_LV[gid][level], cand = [], i;
    for (i = 0; i < l.length; i++) { if (l[i] !== avoid) { cand.push(l[i]); } }
    return pick(cand.length ? cand : l);
  }
  /* avoid＝この 解き方 いがい（段4）・force＝この 解き方だけ（K23 の もう いちど） */
  function makeQuestion(gid, level, avoid, force) {
    var q = null, tries, g = GENRE_BY_ID[gid];
    for (tries = 0; tries < 12 && !q; tries++) { q = g.make(level, force || pickSchema(gid, level, avoid)); }
    if (!q) { q = makeKazoe(1, 'count'); }
    if (q.numeric) { q.answerIndex = q.choices.indexOf(q.answer); }
    annotate(q);
    return q;
  }
  WH.makeQuestion = makeQuestion;
  /* どの問題にも 解き方の名前（schema）・数（nItems）・順位の深さ（depth）・1回で答える数（asks）を 付ける＝本番基準表（bench.js）で 照らす */
  function annotate(q) {
    if (!q.schema) { q.schema = q.sub || q.g; }
    if (q.asks === undefined) { q.asks = q.kind === 'pair' ? 2 : 1; }
    if (q.nItems === undefined) { q.nItems = q.choices ? q.choices.length : (q.pair ? 2 : 0); }
    if (q.depth === undefined) { q.depth = (q.ask && ASK_DEPTH[q.ask]) ? ASK_DEPTH[q.ask] : 1; }
  }
  /* 本番基準の 照らし合わせ（設計 5-4）＝いちばん上を 型ごとに per 問 作り、列ごとに 数える */
  function benchStats(gid, per) {
    var b = WH.BENCH && WH.BENCH[gid], st = { gid: gid, per: per, maxN: 0, atN: 0, maxD: 0, atD: 0, two: 0, sch: {}, nsch: 0, manySeen: 0, manyBad: 0, bad: [] }, i, q;
    if (!b) { st.bad.push('ひょうに ない'); return st; }
    for (i = 0; i < per; i++) {
      q = makeQuestion(gid, 3);
      if (q.nItems > st.maxN) { st.maxN = q.nItems; }
      if (b.n && q.nItems >= b.n) { st.atN++; }
      if (q.depth > st.maxD) { st.maxD = q.depth; }
      if (b.depth && q.depth >= b.depth) { st.atD++; }
      if (q.asks >= 2) { st.two++; }
      if (!st.sch[q.schema]) { st.sch[q.schema] = 0; st.nsch++; }
      st.sch[q.schema]++;
      if (b.many && q.schema === b.many.schema) { st.manySeen++; if (q.nItems < b.many.n) { st.manyBad++; } }
    }
    if (b.n && !(st.maxN >= b.n && st.atN * 3 >= per)) { st.bad.push('n'); }
    if (b.depth && !(st.maxD >= b.depth && st.atD * 3 >= per)) { st.bad.push('depth'); }
    if (b.asks && !(st.two * 3 >= per)) { st.bad.push('asks'); }
    if (b.schemas && !(st.nsch >= b.schemas)) { st.bad.push('schemas'); }
    if (b.many && !(st.manySeen > 0 && st.manyBad === 0)) { st.bad.push('many'); }
    return st;
  }
  function benchLine(st) {
    var b = WH.BENCH[st.gid] || {}, s = st.gid, k, names = [];
    for (k in st.sch) { if (st.sch.hasOwnProperty(k)) { names.push(k + st.sch[k]); } }
    if (b.n) { s += ' かず ' + st.maxN + '/' + b.n + '（とどく ' + st.atN + '/' + st.per + '）'; }
    if (b.depth) { s += ' じゅんい ' + st.maxD + '/' + b.depth + '（とどく ' + st.atD + '/' + st.per + '）'; }
    if (b.asks) { s += ' ふたつ きく ' + st.two + '/' + st.per; }
    if (b.schemas) { s += ' ときかた ' + st.nsch + '/' + b.schemas + '（' + names.join(' ') + '）'; } else { s += ' ときかたは てらさない（' + (b.why || '') + '）'; }
    if (b.many) { s += ' ' + b.many.schema + '=' + b.many.n + 'こ（でた ' + st.manySeen + '・たりない ' + st.manyBad + '）'; }
    return s;
  }
  WH.benchStats = benchStats; WH.benchLine = benchLine;
  /* ひとりで（子が ひとりで タップ）の ときは、こたえの ない もんだい を 出さない */
  WH.makeFor = function (gid, level, mode, avoid, force) {
    var q, tries;
    for (tries = 0; tries < 30; tries++) { q = makeQuestion(gid, level, avoid, force); if (mode === 'sensei' || q.kind !== 'open') { return q; } }
    return makeQuestion('kazoe', level);
  };
  /* K23 の もう いちど＝同じ型・同じ レベル・同じ 解き方・同じ 形（ふたつ きく は 組ごと） */
  WH.makeLike = function (q, mode) {
    var nq = null, t;
    for (t = 0; t < 60; t++) { nq = WH.makeFor(q.g, q.level, mode, null, q.schema); if (nq.kind === q.kind && nq.schema === q.schema) { return nq; } }
    return nq;
  };
  WH.makeKind = function (gid, level, kind, schema) {
    var q, t;
    for (t = 0; t < 300; t++) { q = makeQuestion(gid, level, null, schema); if (q.kind === kind) { return q; } }
    return null;
  };
  /* 1まわりの 問題を 作る（段4＝解き方が 2つ以上の 型は、同じ型の 2問続きで 解き方を かえる） */
  WH.makeSeq = function (gids, levelOf, mode) {
    var qs = [], i, prev = null, lv, avoid, q;
    for (i = 0; i < gids.length; i++) {
      lv = levelOf(gids[i]);
      avoid = (prev && prev.g === gids[i] && schemaCount(gids[i], lv) >= 2) ? prev.schema : null;
      q = WH.makeFor(gids[i], lv, mode, avoid);
      qs.push(q); prev = q;
    }
    return qs;
  };
  /* 続けて 同じ 解き方の 数（もう いちど＝K23 は 数えない・解き方が 1つの 型は 数えない） */
  WH.repeatCount = function (qs) {
    var n = 0, prev = null, i, q;
    for (i = 0; i < qs.length; i++) {
      q = qs[i];
      if (q.retest) { continue; }
      if (prev && prev.g === q.g && schemaCount(q.g, q.level) >= 2 && prev.schema === q.schema) { n++; }
      prev = q;
    }
    return n;
  };

  /* ================= もんだい文（2とおりの いいまわし＝K31・よみあげ にも つかう） ================= */
  var HIMO_ADV = { long: 'いちばん ながく', short: 'いちばん みじかく', second: '2ばんめに ながく', secondshort: '2ばんめに みじかく', third: '3ばんめに ながく', thirdshort: '3ばんめに みじかく' };
  var HIMO_ADJ = { long: 'いちばん ながい', short: 'いちばん みじかい', second: '2ばんめに ながい', secondshort: '2ばんめに みじかい', third: '3ばんめに ながい', thirdshort: '3ばんめに みじかい' };
  var KURABE_T = { most: 'いちばん たくさん', least: 'いちばん すこし', second: '2ばんめに たくさん', third: '3ばんめに たくさん', fourth: '4ばんめに たくさん' };
  var SHISO_T = { heavy: 'いちばん おもい', light: 'いちばん かるい', second: '2ばんめに おもい', secondlight: '2ばんめに かるい' };
  var HIMO_PRE = {
    musubi: ['ほどくと ', 'むすびめを ほどいて まっすぐに のばすと、'], magari: ['まっすぐに すると ', 'ひもが ますの うえを まがって とおって います。まっすぐに のばすと、'],
    zure: ['はしが ずれて いるよ。', 'ひだりの はしが ずれて いる ひもです。'], tsunagi: ['つないだ ぼうで くらべてね。', 'おなじ ながさの ぼうを つないで あります。']
  };
  function himoQ(q, v) {
    var s = q.schema, noun = s === 'tsunagi' ? 'もの' : 'ひも', adv = s === 'musubi' || s === 'magari', W = adv ? HIMO_ADV : HIMO_ADJ, tail = adv ? ' なる ' : ' ';
    if (q.kind === 'pair') { return HIMO_PRE[s][v] + W[q.parts[0].ask] + tail + noun + 'に ○、' + W[q.parts[1].ask] + tail + noun + 'に △' + (v ? ' を つけてね' : ''); }
    return HIMO_PRE[s][v] + W[q.ask] + tail + noun + (v ? 'は どれですか' : 'は どれ？');
  }
  function questionText(q) {
    var v = q.v || 0, t, t0, t1, n1, n2;
    if (q.g === 'himo') { return himoQ(q, v); }
    if (q.g === 'kurabe') {
      if (q.kind === 'pair') {
        t0 = KURABE_T[q.parts[0].ask]; t1 = KURABE_T[q.parts[1].ask];
        if (q.sub === 'cup') { return v ? 'おなじだけ ジュースを もらって、のんだ あとの コップです。' + t0 + ' のんだ コップに ○、' + t1 + ' のんだ コップに △ を つけてね' : 'のんだ あとの コップです。' + t0 + ' のんだ コップに ○、' + t1 + ' のんだ コップに △'; }
        return v ? 'おさらに まめが のって います。' + t0 + ' のって いる おさらに ○、' + t1 + ' のって いる おさらに △ を つけてね' : t0 + ' まめが ある おさらに ○、' + t1 + ' まめが ある おさらに △';
      }
      if (q.sub === 'cup') { t = KURABE_T[q.ask]; return v ? 'みんなに おなじ おおきさの コップで おなじだけ ジュースを くばりました。のんだ あとの コップです。' + t + ' のんだ ひとの コップは どれ？' : 'おなじだけ ジュースを もらって、のんだ あとの コップです。' + t + ' のんだのは どの コップ？'; }
      if (q.sub === 'pile') { t = KURABE_T[q.ask]; return v ? 'おさらに まめが のって います。' + t + ' のって いる おさらは どれ？' : t + ' まめが ある おさらを えらんでね'; }
      if (q.sub === 'taiou') { return v ? 'ぜんぶの まめの やまを、おおい じゅんに おおきい ますへ 1つずつ いれます。まるで かこんだ やまが はいる ますは どれですか' : 'おおい やまほど おおきい ますに はいるよ。しるしの やまが ぴったり はいる ますは どれ？'; }
      if (q.sub === 'gyaku') { return v ? 'りんごが 5こ あります。おおきい ほうから かぞえて 4ばんめの りんごは どれですか' : '4ばんめに おおきい りんごは どれ？'; }
      return v ? 'りんごを おおきい じゅんに、ゆびで さして（タップして）ね' : 'いちばん おおきい りんごから じゅんばんに タップしてね';
    }
    if (q.g === 'shiso') {
      if (q.schema === 'okikae') { return v ? 'うえの シーソーは つりあって います。したの シーソーは どう なりますか' : 'うえの シーソーを みてね。したの シーソーは どっちに さがる？ つりあう かな？'; }
      if (q.kind === 'pair') { t0 = SHISO_T[q.parts[0].ask]; t1 = SHISO_T[q.parts[1].ask]; return v ? 'シーソーを みて、' + t0 + ' かたちに ○、' + t1 + ' かたちに △ を つけてね' : 'シーソーを みて ください。' + t0 + ' ものに ○、' + t1 + ' ものに △'; }
      t = SHISO_T[q.ask];
      if (q.schema === 'tsuriai') { return v ? 'シーソーを みて、' + t + ' かたちを えらんでね。まっすぐの シーソーは おなじ おもさ だよ' : 'まっすぐの シーソーは つりあって います。' + t + ' ものは どれですか'; }
      return v ? 'シーソーを みて、' + t + ' かたちを えらんでね' : 'シーソーを みて ください。' + t + ' ものは どれですか';
    }
    if (q.g === 'kazoe') {
      if (q.kind === 'pair') { n1 = WH.SHAPE_NAMES[q.target]; n2 = WH.SHAPE_NAMES[q.target2]; return v ? n1 + ' と ' + n2 + ' を かぞえます。' + n1 + ' の かずに ○、' + n2 + ' の かずに △ を つけてね' : n1 + ' は いくつ？ ○ で こたえてね。' + n2 + ' は いくつ？ △ で こたえてね'; }
      if (q.sub === 'count') { return v ? WH.SHAPE_NAMES[q.target] + ' は いくつ ありますか' : WH.SHAPE_NAMES[q.target] + ' を かぞえてね。いくつ？'; }
      if (q.sub === 'diff') { return v ? 'ひだりと みぎでは、どちらが いくつ おおい ですか。おおい かずを こたえてね' : 'おおい ほうは、いくつ おおい？'; }
      return v ? 'ひだりの おへやと おなじ かずの おへやを えらんでね' : 'ひだりと おなじ かずの はこは どれ？';
    }
    if (q.g === 'wakeru') {
      t = itemById(q.item).name;
      if (q.kind === 'pair') { t1 = itemById(q.item2).name; return v ? q.people + 'にんの こどもに、' + t + 'を ひとり ' + q.each + 'こずつ、' + t1 + 'を ひとり ' + q.each2 + 'こずつ あげます。' + t + 'の かずに ○、' + t1 + 'の かずに △ を つけてね' : t + 'を ' + q.each + 'こずつ、' + t1 + 'を ' + q.each2 + 'こずつ、' + q.people + 'にんに あげます。' + t + 'は ぜんぶで いくつ？ ○。' + t1 + 'は いくつ？ △'; }
      if (q.sub === 'zutsu') { return v ? q.people + 'にんの こどもに、' + t + 'を ひとり ' + q.each + 'こずつ あげるには、' + t + 'は いくつ あれば いいですか' : t + 'を ひとりに ' + q.each + 'こずつ、' + q.people + 'にんに あげます。ぜんぶで いくつ？'; }
      if (q.sub === 'hitoshiku') { return v ? t + 'が ' + q.total + 'こ あります。' + q.people + 'にんで おなじ かずずつ わけると、ひとり いくつに なりますか' : q.total + 'この ' + t + 'を ' + q.people + 'にんで おなじ かずずつ わけてね。ひとり いくつ？'; }
      return v ? t + 'が ' + q.total + 'こ あります。' + q.people + 'にんに 1こずつ くばると、いくつ あまりますか' : q.people + 'にんに 1こずつ くばります。あまる ' + t + 'は いくつ？';
    }
    if (q.g === 'kazuhanashi') { return q.story + kazuTail(q, v); }
    if (q.g === 'nakama') {
      if (q.sub === 'hazure') { return v ? 'この なかで ひとつだけ なかまはずれが あります。どれですか。どうして そう おもいましたか' : 'なかまはずれは どれ？ そのあと、わけも はなしてね'; }
      if (q.sub === 'chikai') { return v ? 'みんな いきもの です。その なかで ひとつだけ なかまはずれが あります。どれですか。どうして ですか' : 'いきものの なかの なかまはずれは どれ？ わけも はなしてね'; }
      if (q.sub === 'niteiru') { return (v ? 'ふたつの えの、にている ところと ちがう ところを、できるだけ たくさん いって ください' : 'この ふたつ、にている ところは？ ちがう ところは？ たくさん みつけてね'); }
      if (q.sub === 'wakeoo') { return v ? 'ここに ある ' + q.choices.length + 'こを 2つの なかまに わけます。ひとつの なかまを ' + q.need + 'こ タップしてね。そのあと、なんの なかまか はなしてね' : q.choices.length + 'こを 2つの なかまに わけてね。おなじ なかまの ' + q.need + 'こを タップ。なんの なかまかな？'; }
      return v ? 'ここに ある ものを 2つの なかまに わけます。ひとつの なかまを 3つ タップしてね。そのあと、なんの なかまか はなしてね' : '2つの なかまに わけてね。おなじ なかまの 3つを タップ。なんの なかまかな？';
    }
    if (q.g === 'onajie') {
      if (q.schema === 'chigau') { return v ? 'ひとつだけ ちがう えが あります。どれですか' : '1つだけ どこかが ちがう えは どれ？ よく みくらべてね'; }
      if (q.schema === 'muki') { return v ? 'ひだりの えと おなじ えを みぎから さがしてね。みぎの えは むきが ちがいます' : 'まわすと ひだりと そっくり おなじに なる えは どれ？'; }
      return v ? 'ひだりの えと、ぜんぶ おなじ えを みぎから さがしてね' : 'ひだりと そっくり おなじ えは どれ？ よく みくらべてね';
    }
    if (q.g === 'katachi') {
      if (q.sub === 'awase') { return v ? 'ひだりの かたちを つくるには、みぎの どれと どれを あわせれば いいですか。2つ えらんでね' : 'どれと どれを あわせると ひだりの かたちに なる？ 2つ タップ'; }
      if (q.sub === 'kaiten') { return v ? 'ひだりの かたちを つくるには、みぎの どれと どれを あわせれば いいですか。かけらは まわして つかえます。2つ えらんでね' : 'かけらを まわして いいよ。どれと どれで ひだりの かたちに なる？ 2つ タップ'; }
      if (q.sub === 'kirenai') { return v ? 'ひだりの かたちを 3つに きりました。この なかに 1つだけ、きっても できない かたちが あります。どれですか' : 'ひだりを 3つに きった かけら です。1つだけ ちがう かけらは どれ？'; }
      if (q.sub === 'wake') { return v ? 'ましかくを「' + q.pat.name + '」に わける せんは どれですか' : '「' + q.pat.name + '」に わけて いるのは どれ？'; }
      if (q.sub === 'naname') { return v ? 'ましかくの かみを せんの ところで ぜんぶ きります。できる かたちは どれですか' : 'せんで きると、どんな かたちが できる？'; }
      return v ? 'かみを 2つに おって、いろの ところを きって ひらくと、どんな かたちに なりますか' : 'おった かみを きって ひらいたら、どの かたち？';
    }
    if (q.g === 'ana') { return v ? 'あいて いる まるの なかに ぴったり はいる ものは どれですか' : 'あなに ぴったり あう ものを えらんでね'; }
    if (q.g === 'hanashi') {
      if (q.sub === 'shitsumon') { return q.ask; }
      if (q.sub === 'docchi') { return v ? 'どちらが すき ですか。どうして ですか' : 'どっちが すき？ どうして？'; }
      return v ? 'この えを つかって、おはなしを つくって ください' : 'この えで おはなしを つくってね。「ある ひ」から はじめよう';
    }
    return '';
  }
  WH.questionText = questionText;

  /* ================= 足場（1回目の まちがい＝やり方の ヒント・答えは 見せない） ================= */
  function figNames(q) { var k, s = []; for (k in FIGS[q.fig].names) { if (FIGS[q.fig].names.hasOwnProperty(k)) { s.push(FIGS[q.fig].names[k]); } } return s.join('・'); }
  function hintText(q) {
    if (q.g === 'himo') {
      if (q.schema === 'magari') { return 'まがって いても ながさは かわらないよ。ひもが とおる ますの へんを 1つずつ かぞえてね'; }
      if (q.schema === 'zure') { return 'ひだりの はしを そろえて くらべてね。ますを かぞえると わかるよ'; }
      if (q.schema === 'tsunagi') { return 'ぼうの かずを かぞえてね。どの ぼうも おなじ ながさだよ'; }
      return 'むすびめが おおい ほど、ほどくと ながく なるよ。むすびめの かずを かぞえてね';
    }
    if (q.g === 'kurabe') {
      if (q.sub === 'cup') { return 'のこりが すくない ほど、たくさん のんだよ。だいだいの たかさを くらべてね'; }
      if (q.sub === 'pile') { return 'やまの たかさを ならべて くらべてね'; }
      if (q.sub === 'taiou') { return 'やまを おおい じゅんに 1、2、3 と かぞえて、ますも おおきい じゅんに かぞえてね。おなじ ばんごうが あうよ'; }
      if (q.sub === 'gyaku') { return 'ちいさい ほうから かぞえると、2ばんめ だよ'; }
      return 'いちばん おおきいのを さがして、つぎに おおきいのを さがしてね';
    }
    if (q.g === 'shiso') {
      if (q.schema === 'okikae') { return WH.SHAPE_NAMES[q.B] + ' 1こは ' + WH.SHAPE_NAMES[q.A] + ' ' + q.r + 'こと おなじ おもさ。' + WH.SHAPE_NAMES[q.B] + 'を ' + WH.SHAPE_NAMES[q.A] + 'に おきかえて、りょうほうを ' + WH.SHAPE_NAMES[q.A] + 'の かずで かぞえてね'; }
      if (q.schema === 'tsuriai') { return 'まっすぐの シーソーは おなじ おもさ。さがって いる ほうが おもいよ。ぜんぶ つなげて ならべてね'; }
      return 'さがっている ほう（まるで かこんだ ほう）が おもいよ。ぜんぶの シーソーを つなげて かんがえてね';
    }
    if (q.g === 'kazoe') { if (q.sub === 'count') { return 'うえの だんから じゅんばんに、' + WH.SHAPE_NAMES[q.target] + ' だけを ゆびで さして かぞえてね'; } if (q.sub === 'diff') { return 'ひだりと みぎを 1こずつ ペアに して、あまった ぶんが ちがいだよ'; } return 'ひだりを かぞえて、おなじ かずの はこを さがしてね'; }
    if (q.g === 'wakeru') { if (q.sub === 'zutsu') { return 'ひとりに ' + q.each + 'こずつ。ゆびで くばりながら かぞえてね'; } if (q.sub === 'hitoshiku') { return 'ひとりに 1こずつ、じゅんばんに くばってね。なくなるまで'; } return 'ひとりに 1こずつ くばって、のこった ぶんが あまりだよ'; }
    if (q.g === 'kazuhanashi') {
      if (q.schema === 'yaritori') { return 'あげた ほうは へって、もらった ほうは ふえるよ。えを みながら かぞえてね'; }
      if (q.schema === 'kurabete') { return q.form === 0 ? 'ふたりの ぶんを 1こずつ ならべて、あまった ぶんが ちがいだよ' : '「より おおい」は、その かずに たして かぞえるよ。えを みてね'; }
      return 'はじめの かずから、ふえたら たして、へったら ひいてね。えを みながら 1つずつ';
    }
    if (q.g === 'nakama') {
      if (q.sub === 'chikai') { return 'みんな いきもの だね。とり・むし・さかな・けもの の どれかな？ と 1つずつ きいてね'; }
      if (q.sub === 'wakeru2' || q.sub === 'wakeoo') { return 'えを 1つずつ「なんの なかま？」と きいて、にている ものを あつめてね'; }
      return 'えを 1つずつ「なんの なかま？」と きいてみてね。3つは おなじ なかまだよ';
    }
    if (q.g === 'onajie') {
      if (q.schema === 'chigau') { return 'となりどうしを くらべてね。' + figNames(q) + ' を 1つずつ みよう'; }
      if (q.schema === 'muki') { return 'あたまの なかで えを まわして、' + figNames(q) + ' を 1つずつ くらべてね'; }
      return 'まるで かこんだ ところが ちがうよ。' + figNames(q) + ' を 1つずつ くらべてね';
    }
    if (q.g === 'katachi') {
      if (q.sub === 'awase') { return 'ますの かずを かぞえてね。2つで ぴったり うまる くみあわせを さがそう'; }
      if (q.sub === 'kaiten') { return 'かけらを あたまの なかで まわしてね（やじるしの むき）。ますの かずを かぞえて、2つで ぴったりに なる くみを さがそう'; }
      if (q.sub === 'kirenai') { return 'きりめを てんせんで みせたよ。かけらと 1つずつ くらべてね'; }
      if (q.sub === 'wake') { return 'せんで できた へやの かずと かたちを かぞえてね'; }
      if (q.sub === 'naname') { return 'せんで かこまれた へやに いろを ぬったよ。1つずつ かたちと かずを くらべてね'; }
      return 'おりめで ひらくと、おなじ かたちが はんたいがわにも できるよ';
    }
    if (q.g === 'ana') { return 'あなの ふちで せんが きれる ところに しるしを つけたよ。せんの むきと ばしょを あわせてね'; }
    return 'もういちど よく みてね';
  }
  WH.hintText = hintText;
  /* ふたつ きく の ヒント＝やり方＋ちがった しるし だけの 見かた（答えは 見せない） */
  function askHint(q, ask) {
    var r = ASK_RANK[ask], w, i, cnt = '';
    if (q.g === 'himo') { w = ['ながい', 'みじかい']; } else if (q.g === 'shiso') { w = ['おもい', 'かるい']; } else if (q.sub === 'cup') { w = ['たくさん のんだ', 'すこし のんだ']; } else { w = ['おおい', 'すくない']; }
    if (!r) { return ''; }
    if (r[0] === 0) { return 'いちばん ' + w[r[1] ? 1 : 0] + ' ものを さがしてね'; }
    for (i = 0; i <= r[0]; i++) { cnt += (i ? '、' : '') + (i + 1); }
    return w[r[1] ? 1 : 0] + ' ほうから ' + cnt + ' と ゆびで かぞえてね';
  }
  WH.pairHint = function (q, wrong) {
    var s = hintText(q), i, k, m;
    for (i = 0; i < wrong.length; i++) {
      k = wrong[i]; m = q.parts[k].mark;
      if (q.g === 'kazoe') { s += '。' + m + '＝' + WH.SHAPE_NAMES[k === 0 ? q.target : q.target2] + ' だけを かぞえてね'; }
      else if (q.g === 'wakeru') { s += '。' + m + '＝' + itemById(k === 0 ? q.item : q.item2).name + 'は ひとりに ' + (k === 0 ? q.each : q.each2) + 'こずつ'; }
      else { s += '。' + m + '＝' + askHint(q, q.parts[k].ask); }
    }
    return s;
  };
  /* 答えの わけ（解説＝おとなが 読んで あげる・子が まねして いえる 長さ） */
  function himoUnit(q, idx) {
    var v = q.len[idx];
    if (q.schema === 'magari') { return 'ますの へんが ' + v + 'こぶん'; }
    if (q.schema === 'zure') { return 'ながさが ' + v + 'ますぶん'; }
    if (q.schema === 'tsunagi') { return 'ぼうが ' + v + 'ほん'; }
    return 'むすびめが ' + v + 'こ';
  }
  var HIMO_TAIL = { musubi: 'ほどくと むすびめの ぶん ながく なるよ', magari: 'まがって いても ながさは おなじ', zure: 'ひだりの はしを そろえて くらべた', tsunagi: 'ぼうの かずが ながさ' };
  var CUP_W = { most: 'いちばん すくない', least: 'いちばん おおい', second: '2ばんめに すくない', third: '3ばんめに すくない', fourth: '4ばんめに すくない' };
  var PILE_W = { most: 'いちばん たかい', least: 'いちばん ひくい', second: '2ばんめに たかい', third: '3ばんめに たかい', fourth: '4ばんめに たかい' };
  function kurabeWhy(q, ask) { return q.sub === 'cup' ? 'のこりが ' + CUP_W[ask] + ' コップ' : 'やまが ' + PILE_W[ask] + ' おさら'; }
  function whyText(q) {
    var a, i, s, t, k;
    if (q.g === 'himo') {
      if (q.kind === 'pair') { return '○は ' + himoUnit(q, q.parts[0].answerIndex) + ' で ' + HIMO_ADJ[q.parts[0].ask] + '。△は ' + himoUnit(q, q.parts[1].answerIndex) + ' で ' + HIMO_ADJ[q.parts[1].ask] + '。' + HIMO_TAIL[q.schema]; }
      return himoUnit(q, q.answerIndex) + ' で ' + HIMO_ADJ[q.ask] + ' から。' + HIMO_TAIL[q.schema];
    }
    if (q.g === 'kurabe') {
      if (q.kind === 'pair') { return '○は ' + kurabeWhy(q, q.parts[0].ask) + '。△は ' + kurabeWhy(q, q.parts[1].ask) + '。' + (q.sub === 'cup' ? 'のこりが すくない ほど たくさん のんだ' : 'やまが たかい ほど たくさん'); }
      if (q.sub === 'cup') { return kurabeWhy(q, q.ask) + ' だから。のこりが すくない ほど たくさん のんだ'; }
      if (q.sub === 'pile') { return kurabeWhy(q, q.ask) + ' だから'; }
      if (q.sub === 'taiou') { return 'しるしの やまは おおい ほうから ' + q.rank + 'ばんめ。だから おおきい ほうから ' + q.rank + 'ばんめの ます'; }
      if (q.sub === 'gyaku') { return 'おおきい じゅんに 1、2、3、4。ちいさい ほうから なら 2ばんめの りんご'; }
      return 'おおきい じゅんに ならべると こう なるよ';
    }
    if (q.g === 'shiso') {
      if (q.schema === 'okikae') { return WH.SHAPE_NAMES[q.B] + ' 1こ ＝ ' + WH.SHAPE_NAMES[q.A] + ' ' + q.r + 'こ。ひだりは ' + WH.SHAPE_NAMES[q.A] + ' ' + q.unitsL + 'こぶん、みぎは ' + q.unitsR + 'こぶん。だから ' + WH.SHISO_REL_NAME[q.rel]; }
      s = []; for (i = 0; i < q.order.length; i++) { t = WH.SHAPE_NAMES[q.order[i]]; if (i > 0 && q.w[q.order[i]] === q.w[q.order[i - 1]]) { s[s.length - 1] += 'と ' + t + '（おなじ おもさ）'; } else { s.push(t); } }
      return 'おもい じゅんに ' + s.join('・') + ' だから';
    }
    if (q.g === 'kazoe') {
      if (q.kind === 'pair') { return WH.SHAPE_NAMES[q.target] + ' は ' + q.answer + 'こ、' + WH.SHAPE_NAMES[q.target2] + ' は ' + q.answer2 + 'こ あった'; }
      if (q.sub === 'count') { return WH.SHAPE_NAMES[q.target] + ' は ' + q.answer + 'こ あった'; } if (q.sub === 'diff') { return 'ひだりが ' + q.left + 'こ、みぎが ' + q.right + 'こ。ちがいは ' + q.answer + 'こ'; } return 'ひだりは ' + q.left + 'こ。おなじ ' + q.left + 'この はこが こたえ';
    }
    if (q.g === 'wakeru') {
      if (q.kind === 'pair') { return itemById(q.item).name + 'は ' + q.people + 'にんに ' + q.each + 'こずつで ' + q.answer + 'こ、' + itemById(q.item2).name + 'は ' + q.each2 + 'こずつで ' + q.answer2 + 'こ'; }
      if (q.sub === 'zutsu') { s = []; for (i = 0; i < q.people; i++) { s.push(q.each + 'こ'); } return s.join('、') + ' で ' + q.answer + 'こ'; } if (q.sub === 'hitoshiku') { return q.total + 'こを ' + q.people + 'にんに 1こずつ くばると、ひとり ' + q.answer + 'こ'; } return q.total + 'こ から ' + q.people + 'にんに 1こずつ あげると、' + q.answer + 'こ あまる';
    }
    if (q.g === 'kazuhanashi') {
      if (q.schema === 'yaritori') { k = q.askWho; return q.who[k] + 'は はじめ ' + q.st[k] + 'こ。' + q.give + 'こ ' + (k === q.giver ? 'へって ' : 'ふえて ') + q.answer + 'こ'; }
      if (q.schema === 'kurabete') { return q.form === 0 ? q.who[0] + ' ' + q.a + 'こ、' + q.who[1] + ' ' + q.b + 'こ。ちがいは ' + q.d + 'こ' : q.b + 'こより ' + q.d + 'こ おおい から ' + q.a + 'こ'; }
      s = 'はじめ ' + q.start; a = q.start; for (i = 0; i < q.steps.length; i++) { a += q.steps[i]; s += (q.steps[i] > 0 ? '、' + q.steps[i] + ' ふえて ' : '、' + (-q.steps[i]) + ' へって ') + a; } return s + '。だから ' + q.answer + 'こ';
    }
    if (q.g === 'nakama') {
      if (q.sub === 'hazure') { return 'ほかの 3つは みんな ' + q.groupName + '。' + itemById(q.choices[q.answerIndex]).name + ' だけ ちがう なかま'; }
      if (q.sub === 'chikai') { return 'ほかの 3つは みんな ' + q.groupName + '。' + itemById(q.choices[q.answerIndex]).name + ' も いきもの だけど、' + q.groupName + ' とは ちがう なかま'; }
      if (q.sub === 'niteiru') { return 'にている ところ＝' + (q.same.length ? q.same.join('・') : 'どちらも え') + '。ちがう ところ＝' + (q.diff.length ? q.diff.slice(0, 3).join('・') : 'いろ・かたち・つかいかた'); }
      return q.need + 'つは ' + q.groupA + '、のこりの ' + q.need + 'つは ' + q.groupB;
    }
    if (q.g === 'onajie') {
      if (q.schema === 'chigau') { return 'これだけ ' + FIGS[q.fig].names[q.odd.diffKey] + ' が ちがう。ほかの ' + (q.choices.length - 1) + 'つは ぜんぶ おなじ'; }
      if (q.schema === 'muki') { return 'まわすと ' + figNames(q) + ' が ぜんぶ おなじ なのは これだけ。ほかは どこか 1つ ちがう'; }
      return figNames(q) + ' など、ぜんぶ おなじ なのは これだけ。ほかは どこか 1つ ちがう';
    }
    if (q.g === 'katachi') {
      if (q.sub === 'awase') { return 'この 2つを あわせると、ますが ぴったり うまって ひだりの かたちに なる'; }
      if (q.sub === 'kaiten') { return 'この 2つを まわして あわせると、ますが ぴったり うまって ひだりの かたちに なる'; }
      if (q.sub === 'kirenai') { return 'ひだりを きった 3つの かけらは てんせんの とおり。これだけ どこにも ない かたち'; }
      if (q.sub === 'wake') { return 'この せんで わけると「' + q.pat.name + '」に なる'; }
      if (q.sub === 'naname') { return 'せんで きると「' + q.pat.name + '」が できる'; }
      return 'おりめで ひらくと、きった かたちが ひだりと みぎに おなじように できる';
    }
    if (q.g === 'ana') { return 'あなの ふちで きれて いる せんの むきと かずが、これだけ ぴったり あう'; }
    if (q.g === 'hanashi') { return q.model; }
    return '';
  }
  WH.whyText = whyText;
  /* わけを はなす ときの いいかたの かた（てつだって＝これを みせて まねして もらう） */
  function frameText(q) {
    if (q.kind === 'pair') { return '「○は ○○ だから これ、△は △△ だから これ です」'; }
    if (q.g === 'himo') {
      if (q.schema === 'magari') { return '「ますを かぞえたら ○こぶん で、いちばん ながい から です」'; }
      if (q.schema === 'zure') { return '「はしを そろえて くらべたら、これが いちばん ながい から です」'; }
      if (q.schema === 'tsunagi') { return '「ぼうが ○ほん で、いちばん おおい から です」'; }
      return '「むすびめが ○こで、いちばん おおい から です」';
    }
    if (q.g === 'kurabe') {
      if (q.sub === 'taiou') { return '「○ばんめに おおい やま だから、○ばんめに おおきい ます です」'; }
      if (q.sub === 'gyaku') { return '「ちいさい ほうから 2ばんめ だから、おおきい ほうから 4ばんめ です」'; }
      return q.sub === 'cup' ? '「のこりが いちばん すくない から、たくさん のんだ と おもいます」' : '「やまが いちばん たかい から です」';
    }
    if (q.g === 'shiso') {
      if (q.schema === 'okikae') { return '「' + WH.SHAPE_NAMES[q.B] + ' 1こは ' + WH.SHAPE_NAMES[q.A] + ' ' + q.r + 'こと おなじ だから、○○ です」'; }
      if (q.schema === 'tsuriai') { return '「まっすぐの シーソーは おなじ おもさ だから、これが ○○ です」'; }
      return '「さがって いる ほうが おもい から、これが いちばん おもい です」';
    }
    if (q.g === 'kazoe') { return '「じゅんばんに かぞえたら、○こ でした」'; }
    if (q.g === 'wakeru') { return '「ひとりに ○こずつ くばったら、ぜんぶで ○こ に なりました」'; }
    if (q.g === 'kazuhanashi') {
      if (q.schema === 'yaritori') { return '「はじめ ○こ で、○こ もらった から、○こ です」'; }
      if (q.schema === 'kurabete') { return '「ならべたら ○こ あまった から、○こ おおい です」'; }
      return '「はじめ ○こ で、○こ ふえて、○こ へった から、○こ です」';
    }
    if (q.g === 'nakama') { return (q.sub === 'hazure' || q.sub === 'chikai') ? '「ほかのは みんな ○○ だけど、これだけ △△ だから です」' : '「こっちの ' + (q.need || 3) + 'つは ○○の なかま、こっちは △△の なかま です」'; }
    if (q.g === 'onajie') {
      if (q.schema === 'chigau') { return '「ほかの えと くらべたら、これだけ ○○が ちがう から です」'; }
      if (q.schema === 'muki') { return '「まわして みたら、ぜんぶ おなじ だから です」'; }
      return '「やね も まど も とびら も、ぜんぶ おなじ だから です」';
    }
    if (q.g === 'katachi') {
      if (q.sub === 'kaiten') { return '「これを まわして ここに あわせると、ぴったり うまる から です」'; }
      if (q.sub === 'naname') { return '「せんで きると、さんかくが ○つ できる から です」'; }
      return '「ここと ここを あわせると、ぴったり おなじ かたちに なる から です」';
    }
    if (q.g === 'ana') { return '「あなの ところで せんが ○ほん、こう きれて いる から です」'; }
    if (q.g === 'hanashi') { return q.model; }
    return '「○○ だから です」';
  }
  WH.frameText = frameText;
  var PRAISE = ['よく みくらべたね', 'じゅんばんに みたね', 'さいごまで たしかめたね', 'おちついて えらべたね', 'ていねいに やったね', 'わけまで いえたね'];
  WH.praise = function () { return pick(PRAISE); };
  WH.WHY_ASK = ['どうして そう おもったの？', 'どうして それに したの？'];

  /* ================= 描く（画面から よぶ） ================= */
  WH.stemSize = function (q) {
    if (q.g === 'shiso') { return [340, 300]; }
    if (q.g === 'kazoe') { return [360, 280]; }
    if (q.g === 'wakeru' || q.g === 'kazuhanashi') { return [400, 240]; }
    if (q.g === 'ana') { return [320, 300]; }
    if (q.g === 'kurabe') { return [420, 160]; }
    if (q.g === 'katachi' && (q.sub === 'wake' || q.sub === 'naname')) { return [260, 240]; }
    if (q.g === 'katachi') { return [280, 260]; }
    if (q.g === 'onajie') { return [240, 240]; }
    return [300, 280];
  };
  WH.hasStem = function (q) {
    if (q.g === 'kurabe') { return q.sub === 'taiou'; }
    if (q.g === 'onajie') { return q.schema !== 'chigau'; }
    return q.g !== 'himo' && q.g !== 'nakama' && q.g !== 'hanashi';
  };
  WH.paintStem = function (q, canvas, hint) {
    if (q.g === 'shiso') { paintShiso(canvas, q, hint); }
    else if (q.g === 'kurabe') { paintKurabeStem(canvas, q, hint); }
    else if (q.g === 'kazoe') { paintKazoeStem(canvas, q, hint); }
    else if (q.g === 'wakeru') { paintWakeru(canvas, q, hint); }
    else if (q.g === 'kazuhanashi') { paintKazuhanashi(canvas, q, hint); }
    else if (q.g === 'onajie') { paintFig(canvas, q, q.base, null, 0); }
    else if (q.g === 'katachi') { paintKatachiStem(canvas, q, hint); }
    else if (q.g === 'ana') { paintAnaStem(canvas, q, hint); }
  };
  WH.choiceSize = function (q) {
    if (q.cType === 'wide') { return [380, q.choices.length >= 6 ? 40 : 46]; }   /* ひも 6ぽん＝すこし ひくく して 1がめんに おさめる */
    if (q.cType === 'shape') { return [110, 110]; }
    if (q.g === 'shiso') { return [150, 110]; }
    if (q.g === 'kurabe') { return [100, 130]; }
    if (q.g === 'kazoe') { return [150, 120]; }
    if (q.g === 'katachi' && q.sub === 'ori') { return [150, 116]; }
    if (q.g === 'onajie') { return [140, 140]; }
    return [140, 140];
  };
  WH.paintChoice = function (q, i, canvas, hint, pickedWrong) {
    if (q.g === 'himo') { paintHimoChoice(canvas, q, i, hint); }
    else if (q.g === 'kurabe') { paintKurabeChoice(canvas, q, i, hint); }
    else if (q.g === 'shiso') { if (q.schema === 'okikae') { paintOkikaeChoice(canvas, q, i); } else { paintShape(canvas, q.choices[i]); } }
    else if (q.g === 'kazoe') { paintKazoeChoice(canvas, q, i, hint); }
    else if (q.g === 'onajie') { paintFig(canvas, q, q.choices[i], (hint && pickedWrong === i && q.choices[i].diffKey) ? q.choices[i].diffKey : null, q.rots ? q.rots[i] : 0); }
    else if (q.g === 'katachi') { paintKatachiChoice(canvas, q, i, hint); }
    else if (q.g === 'ana') { paintAnaChoice(canvas, q, i); }
  };
  WH.cells = { sig: cellSig, congruent: congruent, connected: connected, union: unionCells, placedUnion: placedUnionIsTarget, pairFills: pairFills, norm: normCells };
  WH.anaLines = anaLines; WH.anaSig = anaSig; WH.figSig = figSig; WH.groupsOf = groupsOf; WH.SHITSUMON = SHITSUMON; WH.WAKE_PAT = WAKE_PAT;
  /* ================= 自己点検（計算の ぶぶん・tools/test.html から よぶ） ================= */
  WH.selfTest = function (doc) {
    var out = [], pass = 0, fail = 0;
    function ok(cond, label) { if (cond) { pass++; } else { fail++; out.push('FAIL ' + label); } }
    var g, lvl, i, j, k, q, n, s, seen, cnt, a, b, c, canvas, texts, hits, kk, allText = '', id, vals, schs, list, rep = 0, nRounds = 0, mode;
    var K12 = { onajie: 0, onajieBad: 0, trap: 0, trapBad: 0, odd: 0, oddBad: 0, rot: 0, rotBad: 0 }, K31 = { n: 0, same: 0 }, PAIRN = 0;
    WH.seed(4242);
    /* K10 本番基準（bench.js の 表）＝いちばん上を 型ごとに 200問。どれか 1つでも 足りない 型が あれば FAIL */
    for (g = 0; g < GENRES.length; g++) {
      s = benchStats(GENRES[g].id, 200);
      ok(s.bad.length === 0, 'K10 ほんばん きじゅん ' + benchLine(s) + ' たりない=' + s.bad.join(','));
      if (s.bad.length === 0) { out.push('K10 ほんばん きじゅん OK ' + benchLine(s)); }
    }
    /* T1 ますの 道具 */
    ok(cellSig([[0, 0], [0, 1]]) === cellSig([[3, 3], [3, 4]]), 'T1 ずらしても おなじ');
    ok(congruent([[0, 0], [0, 1], [1, 0]], [[0, 1], [1, 0], [1, 1]]), 'T1 まわしても おなじ（L）');
    ok(!congruent([[0, 0], [0, 1], [0, 2]], [[0, 0], [0, 1], [1, 1]]), 'T1 ちがう かたち');
    ok(connected([[0, 0], [0, 1], [1, 1]]) && !connected([[0, 0], [2, 2]]), 'T1 つながり');
    ok(placedUnionIsTarget([[0, 0], [0, 1]], [[0, 0], [0, 1]], rectCells(2, 2)) && !placedUnionIsTarget([[0, 0], [0, 1]], [[0, 0]], rectCells(2, 2)), 'T1 2つで うまる');
    ok(pathLen([[0, 0], [1, 0], [1, 1], [2, 1]]) === 3 && himoTrap([3, 5, 4], [6, 5, 4]) && !himoTrap([3, 5, 4], [3, 5, 4]), 'T1 ひもの ながさ と わな');
    ok(pairFillsRot([[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]], rectCells(2, 3)) && !pairFills([[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]], rectCells(2, 3)), 'T1 まわすと うまる・まわさないと うまらない');
    /* ふたつ きく の 組＝しるし・こたえが 2つ ちがう・こたえが 正しい・深さ */
    function vOf(qq) { var r = [], x; if (qq.g === 'himo') { return qq.len; } if (qq.g === 'kurabe') { return qq.cmp; } if (qq.g === 'shiso') { for (x = 0; x < qq.choices.length; x++) { r.push(qq.w[qq.choices[x]]); } return r; } return null; }
    function checkPair(qq) {
      var p = qq.parts, x, cn, vv = vOf(qq), sg = {};
      PAIRN++;
      ok(p && p.length === 2 && qq.asks === 2 && p[0].mark === '○' && p[1].mark === '△', 'T2 ' + qq.g + ' ふたつ きく の しるし');
      ok(p[0].answerIndex >= 0 && p[1].answerIndex >= 0 && p[0].answerIndex < qq.choices.length && p[1].answerIndex < qq.choices.length && p[0].answerIndex !== p[1].answerIndex, 'T2 ' + qq.g + ' ふたつ きく の こたえが 2つ ちがう');
      for (x = 0; x < qq.choices.length; x++) { cn = String(qq.choices[x]); ok(!sg[cn], 'T2 ' + qq.g + ' ふたつ きく えらびしに 同じ もの なし'); sg[cn] = true; }
      if (vv) {
        for (x = 0; x < 2; x++) { ok(rankAnswer(vv, p[x].ask) === p[x].answerIndex && uniqueAt(vv, p[x].ask), 'T2 ' + qq.g + ' ふたつ きく ' + p[x].mark + ' の こたえ'); }
        ok(qq.depth === Math.max(ASK_DEPTH[p[0].ask], ASK_DEPTH[p[1].ask]), 'T2 ' + qq.g + ' ふたつ きく の ふかさ');
      }
      if (qq.g === 'kazoe') { cn = [0, 0]; for (x = 0; x < qq.items.length; x++) { if (qq.items[x].kind === qq.target) { cn[0]++; } if (qq.items[x].kind === qq.target2) { cn[1]++; } } ok(qq.choices[p[0].answerIndex] === cn[0] && qq.choices[p[1].answerIndex] === cn[1] && cn[0] + cn[1] < qq.items.length, 'T2 kazoe ふたつ きく＝2しゅを かぞえる'); }
      if (qq.g === 'wakeru') { ok(qq.choices[p[0].answerIndex] === qq.people * qq.each && qq.choices[p[1].answerIndex] === qq.people * qq.each2 && qq.item !== qq.item2, 'T2 wakeru ふたつ きく＝2つの もの'); }
      if (qq.g === 'himo') { ok(qq.level !== 3 || qq.len.length === 6, 'T2 himo むずかしい は 6ぽん'); }
      ok(WH.timeFor(qq) === PAIR_SEC[qq.g === 'kurabe' ? qq.schema : qq.g], 'T2 ' + qq.g + ' ふたつ きく の びょうすう＝練習帳の〈時間〉');
    }
    /* T2 ぜんぶの 型・レベルで 200問＝正解が 1つ（または 決まった 組）・えらびしに 同じもの なし・型ごとの きまり */
    for (g = 0; g < GENRES.length; g++) {
      id = GENRES[g].id;
      for (lvl = 1; lvl <= 3; lvl++) {
        for (i = 0; i < 200; i++) {
          q = makeQuestion(id, lvl);
          ok(q && q.g === id, 'T2 ' + id + ' lv' + lvl + ' 作れる');
          if (!q) { continue; }
          ok(SCHEMA_LV[id][lvl].indexOf(q.schema) >= 0, 'T2 ' + id + ' lv' + lvl + ' ときかたが いちらんに ある ' + q.schema);
          texts = [questionText(q), hintText(q), whyText(q), frameText(q)];
          if (q.kind === 'pair') { texts.push(WH.pairHint(q, [0, 1])); }
          for (j = 0; j < texts.length; j++) { ok(typeof texts[j] === 'string' && texts[j].length > 3 && texts[j].indexOf('undefined') < 0 && texts[j].indexOf('NaN') < 0, 'T2 ' + q.g + ' ' + q.schema + ' 文が ある ' + j); allText += texts[j] + '\n'; }
          /* K31 いいまわし 2とおり（しつもん は こたえの ない 1つの 問い＝のぞく） */
          if (!(q.g === 'hanashi' && q.sub === 'shitsumon')) { K31.n++; a = q.v; q.v = 0; s = questionText(q); q.v = 1; if (s === questionText(q)) { K31.same++; out.push('FAIL K31 いいまわしが 1とおり ' + q.g + ' ' + q.schema); fail++; } q.v = a; }
          if (q.kind === 'open') { ok(q.g === 'hanashi' || q.g === 'nakama', 'T2 open は おはなし か なかま'); ok(WH.timeFor(q) === 0, 'T2 open は 時間なし'); continue; }
          ok(WH.timeFor(q) >= 15 && WH.timeFor(q) <= (q.kind === 'pair' ? 90 : 60), 'T2 ' + q.g + ' 時間 15〜60（ふたつ きく は 90 まで）');
          if (q.kind === 'pair') { checkPair(q); continue; }
          if (q.kind === 'multi') {
            ok(q.answerSets && q.answerSets.length >= 1 && q.answerSets[0].length === q.need, 'T2 ' + q.g + ' multi の こたえの 組');
            if (q.g === 'katachi') {
              /* 正しい 2つ だけが target を うめる（ほかの どの 2つも うめない）。まわした かけら は まわして よい */
              cnt = 0;
              for (j = 0; j < 4; j++) { for (k = j + 1; k < 4; k++) { if (q.sub === 'kaiten' ? pairFillsRot(q.choices[j], q.choices[k], normCells(q.target)) : pairFills(q.choices[j], q.choices[k], normCells(q.target))) { cnt++; } } }
              ok(cnt === 1, 'T2 katachi ' + q.sub + ' target を うめる 組は 1つ（' + cnt + '）');
              if (q.sub === 'kaiten') {
                K12.rot++;
                if (pairFills(q.choices[q.answerSet[0]], q.choices[q.answerSet[1]], normCells(q.target))) { K12.rotBad++; }
                ok(pairFillsRot(q.choices[q.answerSet[0]], q.choices[q.answerSet[1]], normCells(q.target)) && !pairFills(q.choices[q.answerSet[0]], q.choices[q.answerSet[1]], normCells(q.target)), 'T2 katachi kaiten こたえは まわすと うまる・まわさないと うまらない');
              } else { ok(pairFills(q.choices[q.answerSet[0]], q.choices[q.answerSet[1]], normCells(q.target)), 'T2 katachi awase こたえの 2つで うまる'); }
            }
            if (q.g === 'nakama') {
              ok(q.choices.length === q.need * 2 && (q.sub !== 'wakeoo' || q.choices.length >= WH.BENCH.nakama.many.n), 'T2 nakama ' + q.sub + ' かず ' + q.choices.length);
              for (j = 0; j < q.need; j++) { for (k = 0; k < q.need; k++) { ok(!sharesGroup(itemById(q.choices[q.setA[j]]), itemById(q.choices[q.setB[k]])), 'T2 nakama ' + q.sub + ' 2つの なかまが まざらない'); } }
            }
            continue;
          }
          if (q.kind === 'order') { ok(q.answerOrder.length === q.choices.length, 'T2 order'); for (j = 1; j < q.answerOrder.length; j++) { ok(q.vals[q.answerOrder[j - 1]] > q.vals[q.answerOrder[j]], 'T2 narabe おおきい じゅん'); } continue; }
          ok(q.choices.length >= 3 && q.choices.length <= (q.g === 'himo' ? 6 : 5), 'T2 ' + q.g + ' えらびし 3〜5（ひもは 6）=' + q.choices.length);
          ok(q.answerIndex >= 0 && q.answerIndex < q.choices.length, 'T2 ' + q.g + ' 正解が ある lv' + lvl);
          if (!(q.g === 'onajie' && q.schema === 'chigau')) {
            seen = {}; cnt = 0;
            for (j = 0; j < q.choices.length; j++) {
              if (q.g === 'onajie') { s = attrSig(q.fig, q.choices[j]); }
              else if (q.g === 'katachi' && (q.sub === 'wake' || q.sub === 'naname')) { s = q.choices[j].key; }
              else if (q.g === 'katachi') { s = cellSig(q.choices[j]); }
              else if (q.g === 'ana') { s = q.choices[j].sig; }
              else if (q.g === 'himo') { s = String(q.len[j]); }
              else { s = String(q.choices[j]); }
              if (seen[s]) { cnt++; } seen[s] = true;
            }
            ok(cnt === 0, 'T2 ' + q.g + ' 同じ えらびし なし lv' + lvl + (cnt ? ' ' + q.sub : ''));
          }
          if (q.g === 'himo') {
            ok(rankAnswer(q.len, q.ask) === q.answerIndex && q.depth === ASK_DEPTH[q.ask], 'T2 himo こたえ');
            if (lvl === 1) { ok(q.len.length === 3, 'T2 himo やさしい 3ぼん'); }
            if (lvl === 3) { ok(q.len.length === 6, 'T2 himo むずかしい 6ぽん'); }
          }
          if (q.g === 'kurabe' && (q.sub === 'cup' || q.sub === 'pile')) { ok(rankAnswer(q.cmp, q.ask) === q.answerIndex, 'T2 kurabe ' + q.sub + ' こたえ'); }
          if (q.g === 'kurabe' && q.sub === 'cup') { for (j = 0; j < q.choices.length; j++) { if (q.ask === 'most') { ok(q.vals[q.answerIndex] <= q.vals[j], 'T2 cup most＝のこり さいしょう'); } if (q.ask === 'least') { ok(q.vals[q.answerIndex] >= q.vals[j], 'T2 cup least'); } } }
          if (q.g === 'kurabe' && q.sub === 'taiou') { ok(orderDesc(q.vals).indexOf(q.target) === q.rank - 1 && orderDesc(q.box).indexOf(q.answerIndex) === q.rank - 1 && q.depth === q.rank, 'T2 kurabe taiou＝おなじ ばんごうの ます'); }
          if (q.g === 'kurabe' && q.sub === 'gyaku') { ok(orderDesc(q.vals).indexOf(q.answerIndex) === 3 && q.depth === 4 && q.vals.length === 5, 'T2 kurabe gyaku＝4ばんめ'); }
          if (q.g === 'shiso' && q.schema !== 'okikae') {
            vals = vOf(q);
            for (j = 0; j < q.pairs.length; j++) { a = q.w[q.pairs[j].left]; b = q.w[q.pairs[j].right]; ok(q.pairs[j].down === (a === b ? 'eq' : (a > b ? 'left' : 'right')), 'T2 shiso さがる側が おもい・まっすぐは おなじ'); }
            ok(rankAnswer(vals, q.ask) === q.answerIndex && uniqueAt(vals, q.ask), 'T2 shiso こたえが 1つに きまる');
            if (q.schema === 'tsuriai') { cnt = 0; for (j = 0; j < q.pairs.length; j++) { if (q.pairs[j].down === 'eq') { cnt++; } } ok(cnt === 1, 'T2 shiso tsuriai つりあった 台が 1つ'); }
          }
          if (q.g === 'shiso' && q.schema === 'okikae') {
            a = 0; b = 0; for (j = 0; j < q.bot.left.length; j++) { a += q.bot.left[j] === q.B ? q.r : 1; } for (j = 0; j < q.bot.right.length; j++) { b += q.bot.right[j] === q.B ? q.r : 1; }
            c = 0; n = 0; for (j = 0; j < q.top.left.length; j++) { c += q.top.left[j] === q.B ? q.r : 1; } for (j = 0; j < q.top.right.length; j++) { n += q.top.right[j] === q.B ? q.r : 1; }
            ok(c === n && a === q.unitsL && b === q.unitsR && q.choices[q.answerIndex] === (a === b ? 'eq' : (a > b ? 'left' : 'right')), 'T2 shiso okikae うえは つりあい・したの こたえ');
          }
          if (q.g === 'kazoe' && q.sub === 'count') { cnt = 0; for (j = 0; j < q.items.length; j++) { if (q.items[j].kind === q.target) { cnt++; } } ok(cnt === q.answer && q.choices[q.answerIndex] === cnt && cnt < q.items.length, 'T2 kazoe count'); }
          if (q.g === 'kazoe' && q.sub === 'diff') { ok(q.answer === Math.abs(q.left - q.right) && q.ptsL.length === q.left && q.ptsR.length === q.right, 'T2 kazoe diff'); }
          if (q.g === 'kazoe' && q.sub === 'same') { ok(q.counts[q.answerIndex] === q.left && q.pts[q.answerIndex].length === q.left, 'T2 kazoe same'); }
          if (q.g === 'wakeru') { if (q.sub === 'zutsu') { ok(q.answer === q.people * q.each, 'T2 wakeru zutsu'); } if (q.sub === 'hitoshiku') { ok(q.answer * q.people === q.total, 'T2 wakeru hitoshiku'); } if (q.sub === 'amari') { ok(q.total - q.people === q.answer && q.answer >= 1, 'T2 wakeru amari'); } }
          if (q.g === 'kazuhanashi') {
            if (q.schema === 'fueteheru') { a = q.start; for (j = 0; j < q.steps.length; j++) { a += q.steps[j]; } ok(a === q.answer && q.steps.length === lvl, 'T2 kazuhanashi fueteheru'); }
            if (q.schema === 'yaritori') { a = q.st.slice(); a[q.giver] -= q.give; a[1 - q.giver] += q.give; ok(a[q.askWho] === q.answer && a[0] >= 0 && a[1] >= 0 && q.give >= 1, 'T2 kazuhanashi yaritori'); }
            if (q.schema === 'kurabete') { ok(q.form === 0 ? q.answer === Math.abs(q.a - q.b) && q.a !== q.b : q.answer === q.b + q.d, 'T2 kazuhanashi kurabete'); }
            ok(q.answer >= 0 && q.answer <= 12 && q.choices[q.answerIndex] === q.answer, 'T2 kazuhanashi こたえ 0〜12');
            s = questionText(q); ok(s.indexOf('いくつ') > 0 || s.indexOf('なんこ') > 0, 'T2 kazuhanashi 文');
          }
          if (q.g === 'nakama' && (q.sub === 'hazure' || q.sub === 'chikai')) {
            cnt = 0; for (j = 0; j < 4; j++) { if (groupsOf(itemById(q.choices[j])).indexOf(q.group) >= 0) { cnt++; } }
            ok(cnt === 3 && groupsOf(itemById(q.choices[q.answerIndex])).indexOf(q.group) < 0, 'T2 nakama ' + q.sub + ' 3つが なかま・1つが はずれ');
            a = validOdds(q.choices); K12.odd++; if (a.length !== 1) { K12.oddBad++; }
            ok(a.length === 1 && a[0] === q.answerIndex, 'T2 nakama ' + q.sub + ' はずれに なれるのは 1つだけ（' + a.length + '）');
            if (q.sub === 'hazure') { for (j = 0; j < 4; j++) { if (j !== q.answerIndex) { ok(!sharesGroup(itemById(q.choices[j]), itemById(q.choices[q.answerIndex])), 'T2 nakama はずれは だれとも なかまを 共有しない'); } } }
            if (q.sub === 'chikai') { cnt = 0; for (j = 0; j < 4; j++) { if (itemById(q.choices[j]).animal) { cnt++; } } ok(cnt === 4, 'T2 nakama chikai 4つとも いきもの＝ちかい はずれ'); }
          }
          if (q.g === 'onajie') {
            ok(q.choices.length === (lvl === 1 ? 3 : (lvl === 2 ? 4 : 5)), 'T2 onajie かず');
            if (q.schema === 'chigau') {
              cnt = 0; for (j = 0; j < q.choices.length; j++) { if (attrSig(q.fig, q.choices[j]) !== attrSig(q.fig, q.base)) { cnt++; } }
              ok(cnt === 1 && attrSig(q.fig, q.choices[q.answerIndex]) !== attrSig(q.fig, q.base) && attrDiff(q.fig, q.choices[q.answerIndex], q.base) === 1, 'T2 onajie chigau ちがう えは 1つ・1か所だけ');
              K12.onajie++; if (attrDiff(q.fig, q.choices[q.answerIndex], q.base) !== 1) { K12.onajieBad++; }
            } else {
              cnt = 0; for (j = 0; j < q.choices.length; j++) { if (attrSig(q.fig, q.choices[j]) === attrSig(q.fig, q.base)) { cnt++; } }
              ok(cnt === 1 && attrSig(q.fig, q.choices[q.answerIndex]) === attrSig(q.fig, q.base), 'T2 onajie ' + q.schema + ' おなじ えは 1つ');
              for (j = 0; j < q.choices.length; j++) { if (j === q.answerIndex) { continue; } K12.onajie++; if (attrDiff(q.fig, q.choices[j], q.base) !== 1) { K12.onajieBad++; } ok(attrDiff(q.fig, q.choices[j], q.base) === 1, 'T2 onajie まちがいは 1か所だけ ちがう'); }
              if (q.schema === 'muki') { for (j = 0; j < q.choices.length; j++) { ok(q.rots[j] >= 1 && q.rots[j] <= 3, 'T2 onajie muki みぎの えは ぜんぶ まわして ある'); } }
            }
          }
          if (q.g === 'himo' && q.schema !== 'musubi') {
            K12.trap++; if (!himoTrap(q.len, q.look)) { K12.trapBad++; }
            ok(himoTrap(q.len, q.look), 'T2 himo ' + q.schema + ' 見た目の わな（いちばん のびて みえる ものは いちばん ながく ない）');
            if (q.schema === 'magari') { for (j = 0; j < q.len.length; j++) { ok(pathLen(q.paths[j]) === q.len[j], 'T2 himo magari ますの へんの かず＝ながさ'); } }
            if (q.schema === 'zure') { for (j = 0; j < q.len.length; j++) { ok(q.st[j] >= 0 && q.st[j] + q.len[j] <= HIMO_COLS, 'T2 himo zure ますに おさまる'); } }
          }
          if (q.g === 'katachi' && q.sub === 'naname') {
            seen = {}; for (j = 0; j < q.choices.length; j++) { s = patSig(q.choices[j]); ok(!seen[s], 'T2 katachi naname かけらの 組が ぜんぶ ちがう'); seen[s] = true; }
            a = 0; for (j = 0; j < q.pat.polys.length; j++) { a += polyArea(q.pat.polys[j]); }
            ok(hasTri(q.pat) && Math.abs(a - 1) < 0.001, 'T2 katachi naname さんかくを ふくむ・ましかく ぜんぶ');
          }
          if (q.g === 'katachi' && q.sub === 'kirenai') { for (j = 0; j < 4; j++) { if (j === q.answerIndex) { for (k = 0; k < 3; k++) { ok(!congruent(q.choices[j], q.parts[k]), 'T2 kirenai にせものは どの かけらとも ちがう'); } } } }
          if (q.g === 'katachi' && q.sub === 'ori') { s = {}; for (j = 0; j < q.full.length; j++) { s[cellKey(q.full[j][0], q.full[j][1])] = true; } for (j = 0; j < q.full.length; j++) { ok(!!s[cellKey(q.full[j][0], 3 - q.full[j][1])], 'T2 ori こたえは おりめで 左右対称'); } }
          if (q.g === 'ana') { ok(q.choices[q.answerIndex].sig === anaSig(q.xs, q.ys, q.cx, q.cy, q.r), 'T2 ana こたえ＝あなの 線'); }
        }
      }
    }
    ok(PAIRN > 0, 'T2 ふたつ きく が でた（' + PAIRN + '）');
    ok(K12.onajieBad === 0 && K12.trapBad === 0 && K12.oddBad === 0 && K12.rotBad === 0, 'K12 みわけ ' + K12.onajieBad + '・' + K12.trapBad + '・' + K12.oddBad + '・' + K12.rotBad);
    out.push('K12 ' + (K12.onajieBad + K12.trapBad + K12.oddBad + K12.rotBad === 0 ? 'OK' : 'NG') + ' みわけ＝おなじ えの まちがいは 1か所だけ ' + K12.onajie + '・ひもの 見た目の わな ' + K12.trap + '・はずれは 1つに きまる ' + K12.odd + '・まわさないと うまらない ' + K12.rot);
    ok(K31.same === 0, 'K31 いいまわし 2とおり（1とおり ' + K31.same + '/' + K31.n + '）');
    if (K31.same === 0) { out.push('K31 OK いいまわし 2とおり ' + K31.n + 'もん'); }
    /* 段4＝続けて 同じ 解き方を 出さない（解き方が 2つ以上の 型だけ・もう いちど は 数えない）。型ごと と まぜまぜ の 1まわり */
    for (mode = 0; mode < 2; mode++) {
      for (g = 0; g < GENRES.length; g++) {
        if (GENRES[g].open && mode === 1) { continue; }
        for (lvl = 1; lvl <= 3; lvl++) {
          for (i = 0; i < 30; i++) {
            list = []; for (j = 0; j < 8; j++) { list.push(GENRES[g].id); }
            rep += WH.repeatCount(WH.makeSeq(list, function () { return lvl; }, mode ? 'hitori' : 'sensei')); nRounds++;
          }
        }
      }
      for (i = 0; i < 60; i++) {
        list = []; for (j = 0; j < 8; j++) { list.push(pick(['himo', 'kurabe', 'shiso', 'katachi'])); }
        rep += WH.repeatCount(WH.makeSeq(list, function () { return 3; }, mode ? 'hitori' : 'sensei')); nRounds++;
      }
    }
    ok(rep === 0, 'K31 まぜまぜ つづけて おなじ ときかた 0けん（' + rep + '・' + nRounds + 'まわり）');
    a = makeQuestion('himo', 3, null, 'zure'); b = makeQuestion('himo', 3, null, 'zure'); c = makeQuestion('himo', 3, null, 'magari');
    n = WH.makeLike(a, 'sensei'); n.retest = true;
    ok(WH.repeatCount([a, b]) === 1, 'K31 わざと おなじ ときかたを 2もん つづけた ならびは 1けん（' + WH.repeatCount([a, b]) + '）＝けんさが きく');
    ok(WH.repeatCount([a, n, c]) === 0 && WH.repeatCount([a, n, b]) === 1 && n.schema === a.schema, 'K31 もう いちど（K23）は かぞえない');
    if (rep === 0) { out.push('K31 OK まぜまぜ つづけて おなじ ときかた 0けん（' + nRounds + 'まわり）・わざと つづけた ならびは 1けん'); }
    /* K23 もう いちど は 同じ 型・同じ 解き方・同じ 形（ふたつ きく は 組ごと） */
    a = WH.makeKind('himo', 3, 'pair'); b = WH.makeLike(a, 'hitori');
    ok(a && b && b.kind === 'pair' && b.schema === a.schema && b.g === 'himo' && b.level === 3, 'K23 ふたつ きく の もう いちど は 組で でる');
    /* T3 絵が ぜんぶ 描ける（例外なし）＝ぜんぶの 解き方・ふたつ きく も */
    if (doc && doc.createElement) {
      canvas = doc.createElement('canvas'); canvas.width = 200; canvas.height = 200; canvas.style.width = '200px'; canvas.style.height = '200px';
      for (g = 0; g < GENRES.length; g++) {
        for (lvl = 1; lvl <= 3; lvl++) {
          schs = SCHEMA_LV[GENRES[g].id][lvl];
          for (k = 0; k < schs.length; k++) {
            for (i = 0; i < 4; i++) {
              q = makeQuestion(GENRES[g].id, lvl, null, schs[k]);
              try {
                if (WH.hasStem(q)) { WH.paintStem(q, canvas, false); WH.paintStem(q, canvas, true); }
                if (q.kind !== 'open' && q.cType !== 'num' && q.cType !== 'img') { for (j = 0; j < q.choices.length; j++) { WH.paintChoice(q, j, canvas, false, -1); WH.paintChoice(q, j, canvas, true, j); } }
                ok(true, 'T3');
              } catch (e) { ok(false, 'T3 ' + q.g + ' ' + q.schema + ' lv' + lvl + ' ' + e); }
            }
          }
        }
      }
      for (i = 0; i < WH.PICS.length; i++) { try { WH.paintPic(canvas, WH.PICS[i].id); WH.paintStage(canvas, 3, WH.PICS[i].id); ok(true, 'T3 pic'); } catch (e2) { ok(false, 'T3 pic ' + WH.PICS[i].id + ' ' + e2); } }
      for (i = 0; i < 4; i++) { try { WH.paintStage(canvas, i, WH.PICS[0].id); ok(true, 'T3 stage'); } catch (e3) { ok(false, 'T3 tree ' + i + ' ' + e3); } }
    }
    /* T4 みのり・レベル・絵の 一覧 */
    s = WH.freshState();
    ok(WH.addFruits(s, 5).length === 0 && WH.stageOf(s.cFruits) === 0, 'T4 5こは たまご');
    ok(WH.addFruits(s, 1)[0].kind === 'stage', 'T4 6こで ようちゅう');
    WH.addFruits(s, 18); ok(s.zukan.length === 1 && s.zukan[0] === WH.PICS[0].id && s.cFruits === 0, 'T4 24こで せいちゅうが ずかんへ');
    ok(WH.STAGE_NAME.join(',') === 'たまご,ようちゅう,さなぎ,せいちゅう', 'T4 そだちの なまえ＝たまご ようちゅう さなぎ せいちゅう');
    (function () {
      var gone = ['sakana', 'katatsumuri', 'kotori', 'imomushi', 'kaeru'], k2, bad2 = 0, t = { zukan: ['sakana', 'tentoumushi', 'kaeru', 'herakuresu_ookabuto'] };
      for (k2 = 0; k2 < gone.length; k2++) { if (WH.picById(gone[k2])) { bad2++; } }
      ok(bad2 === 0 && WH.PICS.length === 3 + WH.ZUKAN_IMGS.length, 'T4 ずかんは 虫だけ（' + WH.PICS.length + 'ひき・虫いがい ' + bad2 + '）');
      ok(WH.cleanZukan(t) === 2 && t.zukan.join(',') === 'tentoumushi,herakuresu_ookabuto', 'T4 古い きろくの 虫いがい を 外す（' + t.zukan.join(',') + '）');
    })();
    ok(WH.nextLevel(1, 4, 5) === 2 && WH.nextLevel(3, 5, 5) === 3 && WH.nextLevel(2, 2, 5) === 1 && WH.nextLevel(1, 1, 5) === 1 && WH.nextLevel(2, 3, 5) === 2, 'T4 レベルの 上げ下げ');
    ok(WH.ITEMS.length === 66, 'T4 絵は 66');
    seen = {}; for (n = 0; n < WH.ITEMS.length; n++) { ok(!seen[WH.ITEMS[n].id], 'T4 id 重複 ' + WH.ITEMS[n].id); seen[WH.ITEMS[n].id] = true; }
    for (i = 0; i < GROUPS.length; i++) { ok(itemsWhere(GROUPS[i].fn).length >= 3, 'T4 なかま ' + GROUPS[i].key + ' は 3つ 以上'); }
    ok(WH.makeFor('hanashi', 2, 'hitori').kind !== 'open' && WH.makeFor('hanashi', 2, 'sensei').g === 'hanashi', 'T4 ひとりで は open を 出さない');
    /* T5 おと */
    (function () {
      var name, seq, bad = 0, types = { sine: 1, square: 1, triangle: 1 }, keep = WH.snd.ctx, nn;
      for (name in WH.SOUNDS) { if (!WH.SOUNDS.hasOwnProperty(name)) { continue; } seq = WH.SOUNDS[name]; for (i = 0; i < seq.length; i++) { nn = seq[i]; if (!WH.NOTE[nn[0]] || !(nn[1] >= 0) || !(nn[2] > 0) || !(nn[3] > 0 && nn[3] <= 1) || !types[nn[4]]) { bad++; } } }
      ok(bad === 0, 'T5 おとの ならび');
      WH.snd.ctx = null; ok(WH.snd.play('ok') === false, 'T5 おとの しくみが ない ときは ならさず とまらない'); WH.snd.ctx = keep;
    })();
    /* K4 音の 起こしなおし */
    (function () {
      var snd = WH.snd, keep = snd.ctx, keepOn = snd.on, called = 0, fake, r1, r2, r3, c1, c2, wav;
      function nop() {}
      function node() { return { type: '', frequency: { setValueAtTime: nop }, gain: { setValueAtTime: nop, linearRampToValueAtTime: nop, exponentialRampToValueAtTime: nop }, connect: nop, start: nop, stop: nop }; }
      fake = { state: 'suspended', currentTime: 0, destination: {}, createOscillator: node, createGain: node, resume: function () { called++; fake.state = 'running'; } };
      snd.on = true; snd.ctx = fake;
      r1 = snd.play('tap'); c1 = called;
      r2 = snd.play('tap'); c2 = called;
      fake.state = 'interrupted'; r3 = snd.play('ok');
      snd.ctx = keep; snd.on = keepOn;
      ok(r1 === true && c1 === 1, 'K4 とまった しくみで ならすと resume が よばれる');
      ok(r2 === true && c2 === 1, 'K4 うごいて いる ときは resume を よばない');
      ok(r3 === true && called === 2, 'K4 interrupted でも おこしなおす');
      fake = { state: 'suspended', resume: function () { throw new Error('x'); } };
      ok(WH.wakeAudio(fake) === false, 'K4 resume が しっぱい しても とまらない');
      wav = WH.silentWav();
      ok(wav.indexOf('data:audio/wav;base64,UklGR') === 0 && wav.length > 5000, 'K4 むおんの WAV が つくれる');
      out.push('K4 ' + (c1 === 1 && c2 === 1 && called === 2 ? 'OK' : 'NG') + ' おとの しくみが とまって いたら ならす まえに resume');
    })();
    /* K22 きんしご・K24 ひていけいの やくそく＝もんだい文・ヒント・わけ・いいかたの かた・ほめことば・しつもん の 全部 */
    for (i = 0; i < PRAISE.length; i++) { allText += PRAISE[i] + '\n'; }
    for (i = 0; i < SHITSUMON.length; i++) { allText += SHITSUMON[i].q + '\n' + SHITSUMON[i].model + '\n'; }
    for (i = 0; i < GENRES.length; i++) { allText += GENRES[i].name + ' ' + GENRES[i].sub + '\n'; }
    hits = WH.banHits(allText); ok(hits.length === 0, 'K22 きんしご ' + hits.join(','));
    out.push('K22 ' + (hits.length === 0 ? 'OK' : 'NG') + ' きんしご 0けん（' + allText.length + 'もじ を しらべた）');
    hits = WH.negHits(allText); ok(hits.length === 0, 'K24 ひていけい ' + hits.join(','));
    out.push('K24 ' + (hits.length === 0 ? 'OK' : 'NG') + ' ひていけいの やくそく 0けん');
    WH.seed(null);
    out.unshift('PASS=' + pass + ' FAIL=' + fail);
    return out;
  };
})(typeof window !== 'undefined' ? window : this);
