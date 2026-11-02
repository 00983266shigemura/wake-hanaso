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

  /* ================= 1 ひも ================= */
  var HIMO_LV = { 1: { n: 3, asks: ['long', 'short'] }, 2: { n: 4, asks: ['long', 'short', 'second'] }, 3: { n: 5, asks: ['long', 'short', 'second', 'secondshort'] } };
  function himoAnswer(knots, ask) {
    var idx = [], i;
    for (i = 0; i < knots.length; i++) { idx.push(i); }
    idx.sort(function (a, b) { return knots[b] - knots[a]; });   /* おおい じゅん＝ながい じゅん */
    if (ask === 'long') { return idx[0]; }
    if (ask === 'second') { return idx[1]; }
    if (ask === 'short') { return idx[idx.length - 1]; }
    return idx[idx.length - 2];
  }
  function makeHimo(level) {
    var lv = HIMO_LV[level], knots = shuffle([0, 1, 2, 3, 4, 5]).slice(0, lv.n), ask = pick(lv.asks), i, pos = [];
    for (i = 0; i < lv.n; i++) { pos.push(shuffle([0.18, 0.32, 0.46, 0.6, 0.74, 0.86]).slice(0, knots[i]).sort(function (a, b) { return a - b; })); }
    return { g: 'himo', level: level, knots: knots, pos: pos, ask: ask, choices: knots.slice(), answerIndex: himoAnswer(knots, ask), kind: 'choose', cType: 'wide', v: ri(2) };
  }
  function paintHimoChoice(canvas, q, i, hint) {
    var c = WH.setupCanvas(canvas), y = c.h / 2, x0 = 14, x1 = c.w - (hint ? 54 : 14), k, x;
    c.ctx.fillStyle = COL.kami; c.ctx.fillRect(0, 0, c.w, c.h);
    D.line(c.ctx, x0, y, x1, y, '#b08a5a', 7);
    for (k = 0; k < q.pos[i].length; k++) {
      x = x0 + (x1 - x0) * q.pos[i][k];
      D.circle(c.ctx, x, y - 6, 7, COL.kami, '#8a5a2b', 3); D.circle(c.ctx, x + 6, y + 4, 5, COL.kami, '#8a5a2b', 3);
    }
    if (hint) { D.text(c.ctx, String(q.knots[i]), c.w - 26, y, 22, COL.daidai); }
  }

  /* ================= 2 くらべる ================= */
  var KURABE_LV = { 1: { n: 4, subs: ['cup'], asks: ['most'] }, 2: { n: 5, subs: ['cup', 'pile'], asks: ['most', 'least'] }, 3: { n: 5, subs: ['cup', 'pile', 'narabe'], asks: ['most', 'least', 'second'] } };
  function orderDesc(vals) { var idx = [], i; for (i = 0; i < vals.length; i++) { idx.push(i); } idx.sort(function (a, b) { return vals[b] - vals[a]; }); return idx; }
  function makeKurabe(level) {
    var lv = KURABE_LV[level], sub = pick(lv.subs), n = lv.n, vals, ask, drunk, ord, q, i;
    if (sub === 'narabe') {
      vals = shuffle([0.5, 0.65, 0.8, 1.0]);
      return { g: 'kurabe', sub: sub, level: level, vals: vals, kind: 'order', choices: vals.slice(), answerOrder: orderDesc(vals), cType: 'canvas', v: ri(2) };
    }
    vals = shuffle([0.12, 0.28, 0.44, 0.6, 0.76, 0.9]).slice(0, n);
    ask = pick(lv.asks);
    if (sub === 'cup') {
      drunk = []; for (i = 0; i < n; i++) { drunk.push(1 - vals[i]); }   /* のんだ 量＝のこりの 逆 */
      ord = orderDesc(drunk);
    } else { ord = orderDesc(vals); }
    q = { g: 'kurabe', sub: sub, level: level, vals: vals, ask: ask, kind: 'choose', choices: vals.slice(), cType: 'canvas', v: ri(2) };
    q.answerIndex = ask === 'most' ? ord[0] : (ask === 'least' ? ord[n - 1] : ord[1]);
    return q;
  }
  function paintKurabeChoice(canvas, q, i, hint) {
    var c = WH.setupCanvas(canvas), w = c.w, h = c.h, v = q.vals[i], top, r;
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
      r = h * 0.22 + h * 0.3 * v;
      D.ellipse(c.ctx, w / 2, h * 0.78, w * 0.4, h * 0.1, COL.shiro, COL.sumi, 2.5);
      c.ctx.save(); c.ctx.beginPath(); c.ctx.rect(0, 0, w, h * 0.78); c.ctx.clip();
      D.ellipse(c.ctx, w / 2, h * 0.78, w * 0.36, r, '#c9b27a', COL.sumi, 2);
      c.ctx.restore();
      D.ellipse(c.ctx, w / 2, h * 0.78, w * 0.4, h * 0.1, null, COL.sumi, 2.5);
    } else {
      r = Math.min(w, h) * 0.4 * v;
      D.circle(c.ctx, w / 2, h / 2 + 4, r, COL.aka, COL.sumi, 2.5); D.line(c.ctx, w / 2, h / 2 + 4 - r, w / 2 + 4, h / 2 - r - 8, '#6a4a2a', 3);
    }
  }

  /* ================= 3 シーソー（ちえの もり と 同じ しくみ） ================= */
  var SHISO_KINDS = ['kuro', 'sankaku', 'shikaku', 'hoshi', 'maru'];
  var SHISO_LV = { 1: { items: 3, asks: ['heavy'] }, 2: { items: 4, asks: ['heavy', 'light'] }, 3: { items: 4, asks: ['heavy', 'light', 'second', 'secondlight'] } };
  function makeShiso(level) {
    var lv = SHISO_LV[level], kinds = shuffle(SHISO_KINDS).slice(0, lv.items), order = shuffle(kinds), pairs = [], i, ask, answer, choices;
    for (i = 0; i < order.length - 1; i++) {
      pairs.push(rnd() < 0.5 ? { left: order[i], right: order[i + 1], down: 'left' } : { left: order[i + 1], right: order[i], down: 'right' });
    }
    pairs = shuffle(pairs);
    ask = pick(lv.asks);
    answer = ask === 'heavy' ? order[0] : (ask === 'light' ? order[order.length - 1] : (ask === 'second' ? order[1] : order[order.length - 2]));
    choices = shuffle(kinds);
    return { g: 'shiso', level: level, pairs: pairs, order: order, ask: ask, choices: choices, answerIndex: choices.indexOf(answer), kind: 'choose', cType: 'shape', v: ri(2) };
  }
  function paintShiso(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, p, rowH = c.h / q.pairs.length, cx = c.w / 2, half = c.w * 0.36, tilt = 0.2, cy, r = Math.min(rowH * 0.22, c.w * 0.08), dx, dy;
    WH.paper(c.ctx, c.w, c.h);
    for (i = 0; i < q.pairs.length; i++) {
      p = q.pairs[i]; cy = rowH * (i + 0.62);
      D.poly(c.ctx, [[cx, cy - rowH * 0.02], [cx - rowH * 0.16, cy + rowH * 0.3], [cx + rowH * 0.16, cy + rowH * 0.3]], COL.hai, COL.sumi, 2);
      dy = half * tilt * (p.down === 'left' ? 1 : -1);
      D.line(c.ctx, cx - half, cy + dy, cx + half, cy - dy, COL.sumi, 5);
      dx = half * 0.86;
      c.ctx.save(); c.ctx.translate(cx - dx, cy + dy * 0.86 - r * 1.3); D.shape(c.ctx, p.left, r); c.ctx.restore();
      c.ctx.save(); c.ctx.translate(cx + dx, cy - dy * 0.86 - r * 1.3); D.shape(c.ctx, p.right, r); c.ctx.restore();
      if (hint) { c.ctx.save(); c.ctx.translate(p.down === 'left' ? cx - dx : cx + dx, (p.down === 'left' ? cy + dy : cy - dy) * 0.86 + cy * 0.14 - r * 1.3); D.circle(c.ctx, 0, 0, r * 1.7, null, COL.daidai, 4); c.ctx.restore(); }
    }
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
  function makeKazoe(level) {
    var lv = KAZOE_LV[level], sub = pick(lv.subs), total, target, kinds, items = [], i, k, kindList, a, b, q, n, counts, pts;
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
  function makeWakeru(level) {
    var lv = WAKERU_LV[level], sub = pick(lv.subs), n = lv.people[0] + ri(lv.people[1] - lv.people[0] + 1), e = lv.each[0] + ri(lv.each[1] - lv.each[0] + 1), it = pick(WAKERU_ITEMS), q;
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
  function drawFruit(ctx, x, y, r) { D.circle(ctx, x, y, r, COL.aka, COL.sumi, 1.5); D.line(ctx, x, y - r, x + r * 0.3, y - r * 1.5, '#6a4a2a', 2); }
  function paintWakeru(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, j, n = q.people, fx, fy = c.h * 0.3, fr = Math.min(c.w / (n * 3.2), c.h * 0.14), step = c.w / n, r = fr * 0.32, cols;
    WH.paper(c.ctx, c.w, c.h);
    for (i = 0; i < n; i++) { fx = step * (i + 0.5); drawFace(c.ctx, fx, fy, fr, i); }
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
  var STORY_FOOD = ['ringo', 'mikan', 'banana', 'kuri', 'ichigo', 'kaki', 'daikon'];
  var STEP_WORDS = [['つくりました', 'もらいました', 'かってきました', 'ひろいました'], ['たべました', 'あげました', 'おとしました']];
  function makeKazuhanashi(level) {
    var who = shuffle(NAMES), it = itemById(pick(STORY_FOOD)), a, steps = [], v, tries, b, cnt = level === 1 ? 1 : (level === 2 ? 2 : 3), i, ok, txt, q;
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
    txt += 'いま、' + it.name + 'は いくつ ありますか。';
    q = { g: 'kazuhanashi', level: level, item: it.id, start: a, steps: steps, answer: v, storyText: txt, kind: 'choose', cType: 'num', numeric: true, choices: uniqNums(v, 4, 0, 12), v: ri(2) };
    return q;
  }
  function paintKazuhanashi(canvas, q, hint) {
    var c = WH.setupCanvas(canvas), i, x, n = q.steps.length + 1, step = c.w / n, v = q.start, r = Math.min(step * 0.09, c.h * 0.05);
    WH.paper(c.ctx, c.w, c.h);
    if (!hint) { D.text(c.ctx, 'よく きいてね', c.w / 2, c.h / 2, 22, COL.usui); return; }
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
  function makeNakama(level) {
    var subs = level === 1 ? ['hazure'] : (level === 2 ? ['hazure', 'hazure', 'niteiru'] : ['hazure', 'niteiru', 'wakeru2']), sub = pick(subs), tries, g, members, three, pool, odd, i, q, a, b, g2, m2, six, others;
    if (sub === 'hazure') {
      for (tries = 0; tries < 200; tries++) {
        g = pick(GROUPS); if (g.lv > level) { continue; }
        members = itemsWhere(g.fn); if (members.length < 3) { continue; }
        three = shuffle(members).slice(0, 3);
        /* はずれ＝その なかまでは なく、3つの だれとも ほかの なかまを 共有しない（答えが 1つに 決まる） */
        pool = itemsWhere(function (it) { var k; if (g.fn(it)) { return false; } for (k = 0; k < 3; k++) { if (sharesGroup(it, three[k])) { return false; } } return true; });
        if (!pool.length) { continue; }
        /* むずかしい は 近い なかまから（とり の はずれ に むし など） */
        if (level === 3 && g.lv === 3) { others = itemsWhere(function (it) { return pool.indexOf(it) >= 0 && !!it.animal; }); if (others.length) { pool = others; } }
        odd = pick(pool);
        q = { g: 'nakama', sub: sub, level: level, group: g.key, groupName: g.name, kind: 'choose', cType: 'img' };
        q.choices = shuffle([three[0].id, three[1].id, three[2].id, odd.id]); q.answerIndex = q.choices.indexOf(odd.id); q.v = ri(2);
        return q;
      }
      return null;
    }
    if (sub === 'niteiru') {
      for (tries = 0; tries < 200; tries++) {
        a = pick(WH.ITEMS); b = pick(WH.ITEMS);
        if (a.id === b.id || !sharesGroup(a, b)) { continue; }
        q = { g: 'nakama', sub: sub, level: level, kind: 'open', cType: 'none', pair: [a.id, b.id], same: [], diff: [] };
        for (i = 0; i < GROUPS.length; i++) { if (GROUPS[i].fn(a) && GROUPS[i].fn(b)) { q.same.push(GROUPS[i].name); } else if (GROUPS[i].fn(a) !== GROUPS[i].fn(b)) { q.diff.push((GROUPS[i].fn(a) ? a.name : b.name) + ' だけ ' + GROUPS[i].name); } }
        q.v = ri(2);
        return q;
      }
      return null;
    }
    /* wakeru2＝6つを 2つの なかまに（どちらの 3つを えらんでも 正解） */
    for (tries = 0; tries < 300; tries++) {
      g = pick(GROUPS); g2 = pick(GROUPS); if (g.key === g2.key) { continue; }
      members = itemsWhere(function (it) { return g.fn(it) && !g2.fn(it); }); m2 = itemsWhere(function (it) { return g2.fn(it) && !g.fn(it); });
      if (members.length < 3 || m2.length < 3) { continue; }
      three = shuffle(members).slice(0, 3); others = shuffle(m2).slice(0, 3);
      /* 3つずつが ほかの なかまを またいで 共有しない（2通り以外の 分け方が 出ない） */
      ok = true;
      for (i = 0; i < 3; i++) { for (b = 0; b < 3; b++) { if (sharesGroup(three[i], others[b])) { ok = false; } } }
      if (!ok) { continue; }
      six = shuffle([three[0].id, three[1].id, three[2].id, others[0].id, others[1].id, others[2].id]);
      q = { g: 'nakama', sub: sub, level: level, kind: 'multi', need: 3, cType: 'img', choices: six, groupA: g.name, groupB: g2.name, setA: [], setB: [], v: ri(2) };
      for (i = 0; i < 6; i++) { if (g.fn(itemById(six[i]))) { q.setA.push(i); } else { q.setB.push(i); } }
      q.answerSets = [q.setA, q.setB];
      return q;
    }
    return null;
    var ok;
  }

  /* ================= 8 おなじ え（ほとんど おなじ 絵） ================= */
  var FIGS = {
    ie: { attrs: { yane: 2, mado: 3, tobira: 2, entotsu: 2 }, names: { yane: 'やね', mado: 'まど', tobira: 'とびら', entotsu: 'えんとつ' } },
    roketto: { attrs: { mado: 3, hane: 2, shima: 3, honoo: 2 }, names: { mado: 'まど', hane: 'はね', shima: 'しましま', honoo: 'ひ' } },
    robotto: { attrs: { antena: 2, me: 2, botan: 3, ude: 2 }, names: { antena: 'あんてな', me: 'め', botan: 'ぼたん', ude: 'うで' } }
  };
  function figSig(a) { var k, s = []; for (k in a) { if (a.hasOwnProperty(k)) { s.push(k + a[k]); } } s.sort(); return s.join('|'); }
  function makeOnajie(level) {
    var kind = pick(['ie', 'roketto', 'robotto']), f = FIGS[kind], base = {}, k, keys = [], n = level === 1 ? 3 : (level === 2 ? 4 : 5), cands = [], seen = {}, tries, w, ak, v, q;
    for (k in f.attrs) { if (f.attrs.hasOwnProperty(k)) { keys.push(k); base[k] = ri(f.attrs[k]); } }
    seen[figSig(base)] = true;
    for (tries = 0; tries < 200 && cands.length < n - 1; tries++) {
      w = {}; for (k = 0; k < keys.length; k++) { w[keys[k]] = base[keys[k]]; }
      ak = pick(keys); v = (base[ak] + 1 + ri(f.attrs[ak] - 1)) % f.attrs[ak]; w[ak] = v; w.diffKey = ak;
      if (level === 1 && ak === keys[0] && f.attrs[ak] === 2 && tries < 100 && cands.length > 0) { /* やさしい は ちがいを ばらけさせる */ }
      if (seen[figSig(w)]) { continue; }
      seen[figSig(w)] = true; cands.push(w);
    }
    if (cands.length < n - 1) { return null; }
    cands = shuffle([base].concat(cands));
    q = { g: 'onajie', level: level, fig: kind, base: base, choices: cands, answerIndex: cands.indexOf(base), kind: 'choose', cType: 'canvas', v: ri(2) };
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
  function paintFig(canvas, q, a, markKey) { var c = WH.setupCanvas(canvas), s = Math.min(c.w, c.h); WH.paper(c.ctx, c.w, c.h); c.ctx.translate(c.w / 2, c.h / 2); drawFig(c.ctx, q.fig, a, s, markKey); }

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
  function makeKatachi(level) {
    var subs = level === 1 ? ['awase', 'ori'] : ['awase', 'kirenai', 'wake', 'ori'], sub = pick(subs), tries, target, parts, pieces, wrongs, w, i, j, q, pat, cands, others, half, full, mirror, sets, seen, sig, left, k, cells;
    if (sub === 'awase') {
      for (tries = 0; tries < 100; tries++) {
        target = level === 1 ? rectCells(2, 2) : (level === 2 ? rectCells(2, 3) : pick([rectCells(3, 3), rectCells(2, 4), [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 1]]]));
        parts = splitCells(target, 2); if (!parts) { continue; }
        if (level >= 2 && (parts[0].length < 2 || parts[1].length < 2)) { continue; }
        pieces = [parts[0], parts[1]]; wrongs = [];
        for (i = 0; i < 60 && wrongs.length < 2; i++) {
          w = randomPoly(pieces[wrongs.length % 2].length + (rnd() < 0.5 ? 0 : (rnd() < 0.5 ? 1 : -1)));
          if (w.length < 1) { continue; }
          ok = true;
          for (j = 0; j < pieces.length; j++) { if (cellSig(w) === cellSig(pieces[j]) || placedUnionIsTarget(pieces[j], w, target)) { ok = false; } }
          for (j = 0; j < wrongs.length; j++) { if (cellSig(w) === cellSig(wrongs[j]) || placedUnionIsTarget(normCells(wrongs[j]), w, target)) { ok = false; } }
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
    if (q.sub === 'awase') { paintCellsFit(canvas, q.target, '#9fd0f0', 44); return; }
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
  function makeHanashi(level) {
    var subs = level === 1 ? ['shitsumon', 'docchi'] : (level === 2 ? ['shitsumon', 'docchi', 'tsukuru'] : ['shitsumon', 'tsukuru', 'tsukuru']), sub = pick(subs), q, pool, a, b, c, its;
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
  WH.TIME_SEC = TIME_SEC;
  WH.timeFor = function (q) { var t = TIME_SEC[q.g]; if (q.kind === 'open') { return 0; } return (t && t[q.level]) ? t[q.level] : 30; };

  var GENRES = [
    { id: 'himo', name: 'ひも', sub: 'ほどくと どれが ながい？', make: makeHimo },
    { id: 'kurabe', name: 'くらべる', sub: 'のんだ りょう・やまの たかさ', make: makeKurabe },
    { id: 'shiso', name: 'シーソー', sub: '2ばんめに おもいのは？', make: makeShiso },
    { id: 'kazoe', name: 'かぞえる', sub: 'いくつ・ちがい・おなじ かず', make: makeKazoe },
    { id: 'wakeru', name: 'わける', sub: 'ずつ・おなじ かずずつ・あまり', make: makeWakeru },
    { id: 'kazuhanashi', name: 'かずの おはなし', sub: 'ふえて へって、いま いくつ？', make: makeKazuhanashi },
    { id: 'nakama', name: 'なかま', sub: 'はずれは どれ？ どうして？', make: makeNakama },
    { id: 'onajie', name: 'おなじ え', sub: 'ぜんぶ おなじ えは どれ？', make: makeOnajie },
    { id: 'katachi', name: 'かたち', sub: 'あわせる・きる・おる', make: makeKatachi },
    { id: 'ana', name: 'あなに ぴったり', sub: 'あなに あう のは どれ？', make: makeAna },
    { id: 'hanashi', name: 'おはなし', sub: 'えで おはなし・しつもんに こたえる', make: makeHanashi, open: true }
  ];
  WH.GENRES = GENRES;
  var GENRE_BY_ID = {};
  (function () { var i; for (i = 0; i < GENRES.length; i++) { GENRE_BY_ID[GENRES[i].id] = GENRES[i]; WH.GENRE_IDS.push(GENRES[i].id); } })();
  WH.genreById = function (id) { return GENRE_BY_ID[id]; };

  function makeQuestion(gid, level) {
    var q = null, tries, g = GENRE_BY_ID[gid];
    for (tries = 0; tries < 8 && !q; tries++) { q = g.make(level); }
    if (!q) { q = makeKazoe(1); }
    if (q.numeric) { q.answerIndex = q.choices.indexOf(q.answer); }
    return q;
  }
  WH.makeQuestion = makeQuestion;
  /* ひとりで（子が ひとりで タップ）の ときは、こたえの ない もんだい を 出さない */
  WH.makeFor = function (gid, level, mode) {
    var q, tries;
    for (tries = 0; tries < 20; tries++) { q = makeQuestion(gid, level); if (mode === 'sensei' || q.kind !== 'open') { return q; } }
    return makeQuestion('kazoe', level);
  };

  /* ================= もんだい文（2とおりの いいまわし＝K31・よみあげ にも つかう） ================= */
  function ordinalAsk(ask) {
    if (ask === 'long') { return 'いちばん ながく'; } if (ask === 'short') { return 'いちばん みじかく'; } if (ask === 'second') { return '2ばんめに ながく'; } return '2ばんめに みじかく';
  }
  function questionText(q) {
    var v = q.v || 0, t;
    if (q.g === 'himo') { return v ? 'むすんで ある ところを ほどいて まっすぐに のばすと、どの ひもが ' + ordinalAsk(q.ask) + ' なりますか' : 'むすびめを ぜんぶ ほどくと、' + ordinalAsk(q.ask) + ' なる ひもは どれ？'; }
    if (q.g === 'kurabe') {
      if (q.sub === 'cup') { t = q.ask === 'most' ? 'いちばん たくさん' : (q.ask === 'least' ? 'いちばん すこし' : '2ばんめに たくさん'); return v ? 'みんなに おなじ おおきさの コップで おなじだけ ジュースを くばりました。のんだ あとの コップです。' + t + ' のんだ ひとの コップは どれ？' : 'おなじだけ ジュースを もらって、のんだ あとの コップです。' + t + ' のんだのは どの コップ？'; }
      if (q.sub === 'pile') { t = q.ask === 'most' ? 'いちばん たくさん' : (q.ask === 'least' ? 'いちばん すこし' : '2ばんめに たくさん'); return v ? 'おさらに まめが のって います。' + t + ' のって いる おさらは どれ？' : t + ' まめが ある おさらを えらんでね'; }
      return v ? 'りんごを おおきい じゅんに、ゆびで さして（タップして）ね' : 'いちばん おおきい りんごから じゅんばんに タップしてね';
    }
    if (q.g === 'shiso') { t = q.ask === 'heavy' ? 'いちばん おもい' : (q.ask === 'light' ? 'いちばん かるい' : (q.ask === 'second' ? '2ばんめに おもい' : '2ばんめに かるい')); return v ? 'シーソーを みて、' + t + ' かたちを えらんでね' : 'シーソーを みて ください。' + t + ' ものは どれですか'; }
    if (q.g === 'kazoe') {
      if (q.sub === 'count') { return v ? WH.SHAPE_NAMES[q.target] + ' は いくつ ありますか' : WH.SHAPE_NAMES[q.target] + ' を かぞえてね。いくつ？'; }
      if (q.sub === 'diff') { return v ? 'ひだりと みぎでは、どちらが いくつ おおい ですか。おおい かずを こたえてね' : 'おおい ほうは、いくつ おおい？'; }
      return v ? 'ひだりの おへやと おなじ かずの おへやを えらんでね' : 'ひだりと おなじ かずの はこは どれ？';
    }
    if (q.g === 'wakeru') {
      t = itemById(q.item).name;
      if (q.sub === 'zutsu') { return v ? q.people + 'にんの こどもに、' + t + 'を ひとり ' + q.each + 'こずつ あげるには、' + t + 'は いくつ あれば いいですか' : t + 'を ひとりに ' + q.each + 'こずつ、' + q.people + 'にんに あげます。ぜんぶで いくつ？'; }
      if (q.sub === 'hitoshiku') { return v ? t + 'が ' + q.total + 'こ あります。' + q.people + 'にんで おなじ かずずつ わけると、ひとり いくつに なりますか' : q.total + 'この ' + t + 'を ' + q.people + 'にんで おなじ かずずつ わけてね。ひとり いくつ？'; }
      return v ? t + 'が ' + q.total + 'こ あります。' + q.people + 'にんに 1こずつ くばると、いくつ あまりますか' : q.people + 'にんに 1こずつ くばります。あまる ' + t + 'は いくつ？';
    }
    if (q.g === 'kazuhanashi') { return q.storyText; }
    if (q.g === 'nakama') {
      if (q.sub === 'hazure') { return v ? 'この なかで ひとつだけ なかまはずれが あります。どれですか。どうして そう おもいましたか' : 'なかまはずれは どれ？ そのあと、わけも はなしてね'; }
      if (q.sub === 'niteiru') { return (v ? 'ふたつの えの、にている ところと ちがう ところを、できるだけ たくさん いって ください' : 'この ふたつ、にている ところは？ ちがう ところは？ たくさん みつけてね'); }
      return v ? 'ここに ある ものを 2つの なかまに わけます。ひとつの なかまを 3つ タップしてね。そのあと、なんの なかまか はなしてね' : '2つの なかまに わけてね。おなじ なかまの 3つを タップ。なんの なかまかな？';
    }
    if (q.g === 'onajie') { return v ? 'ひだりの えと、ぜんぶ おなじ えを みぎから さがしてね' : 'ひだりと そっくり おなじ えは どれ？ よく みくらべてね'; }
    if (q.g === 'katachi') {
      if (q.sub === 'awase') { return v ? 'ひだりの かたちを つくるには、みぎの どれと どれを あわせれば いいですか。2つ えらんでね' : 'どれと どれを あわせると ひだりの かたちに なる？ 2つ タップ'; }
      if (q.sub === 'kirenai') { return v ? 'ひだりの かたちを 3つに きりました。この なかに 1つだけ、きっても できない かたちが あります。どれですか' : 'ひだりを 3つに きった かけら です。1つだけ ちがう かけらは どれ？'; }
      if (q.sub === 'wake') { return v ? 'ましかくを「' + q.pat.name + '」に わける せんは どれですか' : '「' + q.pat.name + '」に わけて いるのは どれ？'; }
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
  function hintText(q) {
    if (q.g === 'himo') { return 'むすびめが おおい ほど、ほどくと ながく なるよ。むすびめの かずを かぞえてね'; }
    if (q.g === 'kurabe') { if (q.sub === 'cup') { return 'のこりが すくない ほど、たくさん のんだよ。だいだいの たかさを くらべてね'; } if (q.sub === 'pile') { return 'やまの たかさを ならべて くらべてね'; } return 'いちばん おおきいのを さがして、つぎに おおきいのを さがしてね'; }
    if (q.g === 'shiso') { return 'さがっている ほう（まるで かこんだ ほう）が おもいよ。ぜんぶの シーソーを つなげて かんがえてね'; }
    if (q.g === 'kazoe') { if (q.sub === 'count') { return 'うえの だんから じゅんばんに、' + WH.SHAPE_NAMES[q.target] + ' だけを ゆびで さして かぞえてね'; } if (q.sub === 'diff') { return 'ひだりと みぎを 1こずつ ペアに して、あまった ぶんが ちがいだよ'; } return 'ひだりを かぞえて、おなじ かずの はこを さがしてね'; }
    if (q.g === 'wakeru') { if (q.sub === 'zutsu') { return 'ひとりに ' + q.each + 'こずつ。ゆびで くばりながら かぞえてね'; } if (q.sub === 'hitoshiku') { return 'ひとりに 1こずつ、じゅんばんに くばってね。なくなるまで'; } return 'ひとりに 1こずつ くばって、のこった ぶんが あまりだよ'; }
    if (q.g === 'kazuhanashi') { return 'はじめの かずから、ふえたら たして、へったら ひいてね。えを みながら 1つずつ'; }
    if (q.g === 'nakama') { return 'えを 1つずつ「なんの なかま？」と きいてみてね。3つは おなじ なかまだよ'; }
    if (q.g === 'onajie') { return 'まるで かこんだ ところが ちがうよ。やね・まど・とびら を 1つずつ くらべてね'; }
    if (q.g === 'katachi') { if (q.sub === 'awase') { return 'ますの かずを かぞえてね。2つで ぴったり うまる くみあわせを さがそう'; } if (q.sub === 'kirenai') { return 'きりめを てんせんで みせたよ。かけらと 1つずつ くらべてね'; } if (q.sub === 'wake') { return 'せんで できた へやの かずと かたちを かぞえてね'; } return 'おりめで ひらくと、おなじ かたちが はんたいがわにも できるよ'; }
    if (q.g === 'ana') { return 'あなの ふちで せんが きれる ところに しるしを つけたよ。せんの むきと ばしょを あわせてね'; }
    return 'もういちど よく みてね';
  }
  WH.hintText = hintText;
  /* 答えの わけ（解説＝おとなが 読んで あげる・子が まねして いえる 長さ） */
  function whyText(q) {
    var a, i, s;
    if (q.g === 'himo') { a = q.knots[q.answerIndex]; return 'むすびめが ' + a + 'こ で ' + (q.ask === 'long' ? 'いちばん おおい' : (q.ask === 'short' ? 'いちばん すくない' : (q.ask === 'second' ? '2ばんめに おおい' : '2ばんめに すくない'))) + ' から。ほどくと むすびめの ぶん ながく なるよ'; }
    if (q.g === 'kurabe') { if (q.sub === 'cup') { return 'のこりが ' + (q.ask === 'most' ? 'いちばん すくない' : (q.ask === 'least' ? 'いちばん おおい' : '2ばんめに すくない')) + ' コップ だから。のこりが すくない ほど たくさん のんだ'; } if (q.sub === 'pile') { return 'やまが ' + (q.ask === 'most' ? 'いちばん たかい' : (q.ask === 'least' ? 'いちばん ひくい' : '2ばんめに たかい')) + ' から'; } return 'おおきい じゅんに ならべると こう なるよ'; }
    if (q.g === 'shiso') { s = []; for (i = 0; i < q.order.length; i++) { s.push(WH.SHAPE_NAMES[q.order[i]]); } return 'おもい じゅんに ' + s.join('・') + ' だから'; }
    if (q.g === 'kazoe') { if (q.sub === 'count') { return WH.SHAPE_NAMES[q.target] + ' は ' + q.answer + 'こ あった'; } if (q.sub === 'diff') { return 'ひだりが ' + q.left + 'こ、みぎが ' + q.right + 'こ。ちがいは ' + q.answer + 'こ'; } return 'ひだりは ' + q.left + 'こ。おなじ ' + q.left + 'この はこが こたえ'; }
    if (q.g === 'wakeru') { if (q.sub === 'zutsu') { s = []; for (i = 0; i < q.people; i++) { s.push(q.each + 'こ'); } return s.join('、') + ' で ' + q.answer + 'こ'; } if (q.sub === 'hitoshiku') { return q.total + 'こを ' + q.people + 'にんに 1こずつ くばると、ひとり ' + q.answer + 'こ'; } return q.total + 'こ から ' + q.people + 'にんに 1こずつ あげると、' + q.answer + 'こ あまる'; }
    if (q.g === 'kazuhanashi') { s = 'はじめ ' + q.start; a = q.start; for (i = 0; i < q.steps.length; i++) { a += q.steps[i]; s += (q.steps[i] > 0 ? '、' + q.steps[i] + ' ふえて ' : '、' + (-q.steps[i]) + ' へって ') + a; } return s + '。だから ' + q.answer + 'こ'; }
    if (q.g === 'nakama') { if (q.sub === 'hazure') { return 'ほかの 3つは みんな ' + q.groupName + '。' + itemById(q.choices[q.answerIndex]).name + ' だけ ちがう なかま'; } if (q.sub === 'niteiru') { return 'にている ところ＝' + (q.same.length ? q.same.join('・') : 'どちらも え') + '。ちがう ところ＝' + (q.diff.length ? q.diff.slice(0, 3).join('・') : 'いろ・かたち・つかいかた'); } return '3つは ' + q.groupA + '、のこりの 3つは ' + q.groupB; }
    if (q.g === 'onajie') { return 'やね・まど・とびら など、ぜんぶ おなじ なのは これだけ。ほかは どこか 1つ ちがう'; }
    if (q.g === 'katachi') { if (q.sub === 'awase') { return 'この 2つを あわせると、ますが ぴったり うまって ひだりの かたちに なる'; } if (q.sub === 'kirenai') { return 'ひだりを きった 3つの かけらは てんせんの とおり。これだけ どこにも ない かたち'; } if (q.sub === 'wake') { return 'この せんで わけると「' + q.pat.name + '」に なる'; } return 'おりめで ひらくと、きった かたちが ひだりと みぎに おなじように できる'; }
    if (q.g === 'ana') { return 'あなの ふちで きれて いる せんの むきと かずが、これだけ ぴったり あう'; }
    if (q.g === 'hanashi') { return q.model; }
    return '';
  }
  WH.whyText = whyText;
  /* わけを はなす ときの いいかたの かた（てつだって＝これを みせて まねして もらう） */
  function frameText(q) {
    if (q.g === 'himo') { return '「むすびめが ○こで、いちばん おおい から です」'; }
    if (q.g === 'kurabe') { return q.sub === 'cup' ? '「のこりが いちばん すくない から、たくさん のんだ と おもいます」' : '「やまが いちばん たかい から です」'; }
    if (q.g === 'shiso') { return '「さがって いる ほうが おもい から、これが いちばん おもい です」'; }
    if (q.g === 'kazoe') { return '「じゅんばんに かぞえたら、○こ でした」'; }
    if (q.g === 'wakeru') { return '「ひとりに ○こずつ くばったら、ぜんぶで ○こ に なりました」'; }
    if (q.g === 'kazuhanashi') { return '「はじめ ○こ で、○こ ふえて、○こ へった から、○こ です」'; }
    if (q.g === 'nakama') { return q.sub === 'hazure' ? '「ほかのは みんな ○○ だけど、これだけ △△ だから です」' : '「こっちの 3つは ○○の なかま、こっちは △△の なかま です」'; }
    if (q.g === 'onajie') { return '「やね も まど も とびら も、ぜんぶ おなじ だから です」'; }
    if (q.g === 'katachi') { return '「ここと ここを あわせると、ぴったり おなじ かたちに なる から です」'; }
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
    if (q.g === 'katachi' && q.sub === 'wake') { return [260, 240]; }
    if (q.g === 'katachi') { return [280, 260]; }
    if (q.g === 'onajie') { return [240, 240]; }
    return [300, 280];
  };
  WH.hasStem = function (q) { return q.g !== 'himo' && q.g !== 'kurabe' && q.g !== 'nakama' && q.g !== 'hanashi'; };
  WH.paintStem = function (q, canvas, hint) {
    if (q.g === 'shiso') { paintShiso(canvas, q, hint); }
    else if (q.g === 'kazoe') { paintKazoeStem(canvas, q, hint); }
    else if (q.g === 'wakeru') { paintWakeru(canvas, q, hint); }
    else if (q.g === 'kazuhanashi') { paintKazuhanashi(canvas, q, hint); }
    else if (q.g === 'onajie') { paintFig(canvas, q, q.base, null); }
    else if (q.g === 'katachi') { paintKatachiStem(canvas, q, hint); }
    else if (q.g === 'ana') { paintAnaStem(canvas, q, hint); }
  };
  WH.choiceSize = function (q) {
    if (q.cType === 'wide') { return [380, 46]; }
    if (q.cType === 'shape') { return [110, 110]; }
    if (q.g === 'kurabe') { return [100, 130]; }
    if (q.g === 'kazoe') { return [150, 120]; }
    if (q.g === 'katachi' && q.sub === 'ori') { return [150, 116]; }
    if (q.g === 'onajie') { return [140, 140]; }
    return [140, 140];
  };
  WH.paintChoice = function (q, i, canvas, hint, pickedWrong) {
    if (q.g === 'himo') { paintHimoChoice(canvas, q, i, hint); }
    else if (q.g === 'kurabe') { paintKurabeChoice(canvas, q, i, hint); }
    else if (q.g === 'shiso') { paintShape(canvas, q.choices[i]); }
    else if (q.g === 'kazoe') { paintKazoeChoice(canvas, q, i, hint); }
    else if (q.g === 'onajie') { paintFig(canvas, q, q.choices[i], (hint && pickedWrong === i && q.choices[i].diffKey) ? q.choices[i].diffKey : null); }
    else if (q.g === 'katachi') { paintKatachiChoice(canvas, q, i, hint); }
    else if (q.g === 'ana') { paintAnaChoice(canvas, q, i); }
  };
  WH.cells = { sig: cellSig, congruent: congruent, connected: connected, union: unionCells, placedUnion: placedUnionIsTarget, norm: normCells };
  WH.anaLines = anaLines; WH.anaSig = anaSig; WH.figSig = figSig; WH.groupsOf = groupsOf; WH.SHITSUMON = SHITSUMON; WH.WAKE_PAT = WAKE_PAT;

  /* ================= 自己点検（計算の ぶぶん・tools/test.html から よぶ） ================= */
  WH.selfTest = function (doc) {
    var out = [], pass = 0, fail = 0;
    function ok(cond, label) { if (cond) { pass++; } else { fail++; out.push('FAIL ' + label); } }
    var g, lvl, i, j, k, q, n, s, seen, cnt, a, b, canvas, texts, hits, kk, allText = '';
    WH.seed(4242);
    /* T1 ますの 道具 */
    ok(cellSig([[0, 0], [0, 1]]) === cellSig([[3, 3], [3, 4]]), 'T1 ずらしても おなじ');
    ok(congruent([[0, 0], [0, 1], [1, 0]], [[0, 1], [1, 0], [1, 1]]), 'T1 まわしても おなじ（L）');
    ok(!congruent([[0, 0], [0, 1], [0, 2]], [[0, 0], [0, 1], [1, 1]]), 'T1 ちがう かたち');
    ok(connected([[0, 0], [0, 1], [1, 1]]) && !connected([[0, 0], [2, 2]]), 'T1 つながり');
    ok(placedUnionIsTarget([[0, 0], [0, 1]], [[0, 0], [0, 1]], rectCells(2, 2)) && !placedUnionIsTarget([[0, 0], [0, 1]], [[0, 0]], rectCells(2, 2)), 'T1 2つで うまる');
    /* T2 ぜんぶの 型・レベルで 200問＝正解が 1つ（または 決まった 組）・えらびしに 同じもの なし・型ごとの きまり */
    for (g = 0; g < GENRES.length; g++) {
      for (lvl = 1; lvl <= 3; lvl++) {
        for (i = 0; i < 200; i++) {
          q = makeQuestion(GENRES[g].id, lvl);
          ok(q && q.g === GENRES[g].id, 'T2 ' + GENRES[g].id + ' lv' + lvl + ' 作れる');
          if (!q) { continue; }
          texts = [questionText(q), hintText(q), whyText(q), frameText(q)];
          for (j = 0; j < texts.length; j++) { ok(typeof texts[j] === 'string' && texts[j].length > 3, 'T2 ' + q.g + ' 文が ある ' + j); allText += texts[j] + '\n'; }
          if (q.kind === 'open') { ok(q.g === 'hanashi' || q.g === 'nakama', 'T2 open は おはなし か なかま'); ok(WH.timeFor(q) === 0, 'T2 open は 時間なし'); continue; }
          ok(WH.timeFor(q) >= 15 && WH.timeFor(q) <= 60, 'T2 ' + q.g + ' 時間 15〜60');
          if (q.kind === 'multi') {
            ok(q.answerSets && q.answerSets.length >= 1 && q.answerSets[0].length === q.need, 'T2 ' + q.g + ' multi の こたえの 組');
            if (q.g === 'katachi') {
              /* 正しい 2つ だけが target を うめる（ほかの どの 2つも うめない） */
              cnt = 0;
              for (j = 0; j < 4; j++) { for (k = j + 1; k < 4; k++) { if (placedUnionIsTarget(normCells(q.choices[j]), q.choices[k], normCells(q.target)) || placedUnionIsTarget(normCells(q.choices[k]), q.choices[j], normCells(q.target))) { cnt++; } } }
              ok(cnt === 1, 'T2 katachi awase target を うめる 組は 1つ（' + cnt + '）');
              ok(placedUnionIsTarget(normCells(q.choices[q.answerSet[0]]), q.choices[q.answerSet[1]], normCells(q.target)) || placedUnionIsTarget(normCells(q.choices[q.answerSet[1]]), q.choices[q.answerSet[0]], normCells(q.target)), 'T2 katachi awase こたえの 2つで うまる');
            }
            if (q.g === 'nakama') {
              for (j = 0; j < 3; j++) { for (k = 0; k < 3; k++) { ok(!sharesGroup(itemById(q.choices[q.setA[j]]), itemById(q.choices[q.setB[k]])), 'T2 nakama wakeru2 2つの なかまが まざらない'); } }
            }
            continue;
          }
          if (q.kind === 'order') { ok(q.answerOrder.length === q.choices.length, 'T2 order'); for (j = 1; j < q.answerOrder.length; j++) { ok(q.vals[q.answerOrder[j - 1]] > q.vals[q.answerOrder[j]], 'T2 narabe おおきい じゅん'); } continue; }
          ok(q.choices.length >= 3 && q.choices.length <= 5, 'T2 ' + q.g + ' えらびし 3〜5 =' + q.choices.length);
          ok(q.answerIndex >= 0 && q.answerIndex < q.choices.length, 'T2 ' + q.g + ' 正解が ある lv' + lvl);
          seen = {}; cnt = 0;
          for (j = 0; j < q.choices.length; j++) {
            if (q.g === 'onajie') { s = figSig(q.choices[j]); }
            else if (q.g === 'katachi' && q.sub !== 'wake') { s = cellSig(q.choices[j]); }
            else if (q.g === 'katachi') { s = q.choices[j].key; }
            else if (q.g === 'ana') { s = q.choices[j].sig; }
            else if (q.g === 'himo') { s = String(q.knots[j]); }
            else { s = String(q.choices[j]); }
            if (seen[s]) { cnt++; } seen[s] = true;
          }
          ok(cnt === 0, 'T2 ' + q.g + ' 同じ えらびし なし lv' + lvl + (cnt ? ' ' + q.sub : ''));
          if (q.g === 'himo') { ok(himoAnswer(q.knots, q.ask) === q.answerIndex, 'T2 himo こたえ'); if (lvl === 1) { ok(q.knots.length === 3, 'T2 himo やさしい 3ぼん'); } }
          if (q.g === 'kurabe' && q.sub === 'cup') { for (j = 0; j < q.choices.length; j++) { if (q.ask === 'most') { ok(q.vals[q.answerIndex] <= q.vals[j], 'T2 cup most＝のこり さいしょう'); } if (q.ask === 'least') { ok(q.vals[q.answerIndex] >= q.vals[j], 'T2 cup least'); } } }
          if (q.g === 'shiso') { for (j = 0; j < q.pairs.length; j++) { a = q.order.indexOf(q.pairs[j].left); b = q.order.indexOf(q.pairs[j].right); ok((a < b) === (q.pairs[j].down === 'left'), 'T2 shiso さがる側が おもい'); } }
          if (q.g === 'kazoe' && q.sub === 'count') { cnt = 0; for (j = 0; j < q.items.length; j++) { if (q.items[j].kind === q.target) { cnt++; } } ok(cnt === q.answer && q.choices[q.answerIndex] === cnt && cnt < q.items.length, 'T2 kazoe count'); if (lvl === 3) { ok(q.items.length >= 16, 'T2 kazoe むずかしい は 16こ 以上'); } }
          if (q.g === 'kazoe' && q.sub === 'diff') { ok(q.answer === Math.abs(q.left - q.right) && q.ptsL.length === q.left && q.ptsR.length === q.right, 'T2 kazoe diff'); }
          if (q.g === 'kazoe' && q.sub === 'same') { ok(q.counts[q.answerIndex] === q.left && q.pts[q.answerIndex].length === q.left, 'T2 kazoe same'); }
          if (q.g === 'wakeru') { if (q.sub === 'zutsu') { ok(q.answer === q.people * q.each, 'T2 wakeru zutsu'); } if (q.sub === 'hitoshiku') { ok(q.answer * q.people === q.total, 'T2 wakeru hitoshiku'); } if (q.sub === 'amari') { ok(q.total - q.people === q.answer && q.answer >= 1, 'T2 wakeru amari'); } }
          if (q.g === 'kazuhanashi') { a = q.start; for (j = 0; j < q.steps.length; j++) { a += q.steps[j]; } ok(a === q.answer && a >= 0 && a <= 12 && q.steps.length === lvl, 'T2 kazuhanashi'); ok(q.storyText.indexOf('いくつ') > 0, 'T2 kazuhanashi 文'); }
          if (q.g === 'nakama' && q.sub === 'hazure') {
            cnt = 0; for (j = 0; j < 4; j++) { if (groupsOf(itemById(q.choices[j])).indexOf(q.group) >= 0) { cnt++; } }
            ok(cnt === 3 && groupsOf(itemById(q.choices[q.answerIndex])).indexOf(q.group) < 0, 'T2 nakama 3つが なかま・1つが はずれ');
            for (j = 0; j < 4; j++) { if (j !== q.answerIndex) { ok(!sharesGroup(itemById(q.choices[j]), itemById(q.choices[q.answerIndex])), 'T2 nakama はずれは だれとも なかまを 共有しない'); } }
          }
          if (q.g === 'onajie') { cnt = 0; for (j = 0; j < q.choices.length; j++) { if (figSig(q.choices[j]) === figSig(q.base)) { cnt++; } } ok(cnt === 1, 'T2 onajie おなじ えは 1つ'); for (j = 0; j < q.choices.length; j++) { if (j === q.answerIndex) { continue; } cnt = 0; for (kk in q.base) { if (q.base.hasOwnProperty(kk) && q.base[kk] !== q.choices[j][kk]) { cnt++; } } ok(cnt === 1, 'T2 onajie まちがいは 1か所だけ ちがう'); } }
          if (q.g === 'katachi' && q.sub === 'kirenai') { for (j = 0; j < 4; j++) { if (j === q.answerIndex) { for (k = 0; k < 3; k++) { ok(!congruent(q.choices[j], q.parts[k]), 'T2 kirenai にせものは どの かけらとも ちがう'); } } } }
          if (q.g === 'katachi' && q.sub === 'ori') { s = {}; for (j = 0; j < q.full.length; j++) { s[cellKey(q.full[j][0], q.full[j][1])] = true; } for (j = 0; j < q.full.length; j++) { ok(!!s[cellKey(q.full[j][0], 3 - q.full[j][1])], 'T2 ori こたえは おりめで 左右対称'); } }
          if (q.g === 'ana') { ok(q.choices[q.answerIndex].sig === anaSig(q.xs, q.ys, q.cx, q.cy, q.r), 'T2 ana こたえ＝あなの 線'); }
        }
      }
    }
    /* T3 絵が ぜんぶ 描ける（例外なし） */
    if (doc && doc.createElement) {
      canvas = doc.createElement('canvas'); canvas.width = 200; canvas.height = 200; canvas.style.width = '200px'; canvas.style.height = '200px';
      for (g = 0; g < GENRES.length; g++) {
        for (lvl = 1; lvl <= 3; lvl++) {
          for (i = 0; i < 6; i++) {
            q = makeQuestion(GENRES[g].id, lvl);
            try {
              if (WH.hasStem(q)) { WH.paintStem(q, canvas, false); WH.paintStem(q, canvas, true); }
              if (q.kind !== 'open' && q.cType !== 'num' && q.cType !== 'img') { for (j = 0; j < q.choices.length; j++) { WH.paintChoice(q, j, canvas, true, j); } }
              ok(true, 'T3');
            } catch (e) { ok(false, 'T3 ' + q.g + ' ' + q.sub + ' lv' + lvl + ' ' + e); }
          }
        }
      }
      for (i = 0; i < WH.PICS.length; i++) { try { WH.paintPic(canvas, WH.PICS[i].id); WH.paintTree(canvas, 3, WH.PICS[i].id, 24); ok(true, 'T3 pic'); } catch (e2) { ok(false, 'T3 pic ' + WH.PICS[i].id + ' ' + e2); } }
      for (i = 0; i < 4; i++) { try { WH.paintTree(canvas, i, WH.PICS[0].id, i * 6); ok(true, 'T3 tree'); } catch (e3) { ok(false, 'T3 tree ' + i + ' ' + e3); } }
    }
    /* T4 みのり・レベル・絵の 一覧 */
    s = WH.freshState();
    ok(WH.addFruits(s, 5).length === 0 && WH.stageOf(s.cFruits) === 0, 'T4 5こは たね');
    ok(WH.addFruits(s, 1)[0].kind === 'stage', 'T4 6こで め');
    WH.addFruits(s, 18); ok(s.zukan.length === 1 && s.zukan[0] === WH.PICS[0].id && s.cFruits === 0, 'T4 24こで いきものが くる');
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
