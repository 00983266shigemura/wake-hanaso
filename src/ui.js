/* わけを はなそう ―― 画面（ui.js・古い Safari で動く書き方だけ）
   2つの あそびかた＝
     ひとりで   … 子が じぶんで タップ。もんだい文は 画面に 出て、よみあげも できる
     せんせいと … おとなが テスター役。もんだい文は おとなが 1かい だけ よむ（よんだら 文は かくれる）。
                  子は たって、ゆびさし（おとなが かわりに タップ）か こえで こたえ、「どうして？」に わけを はなす。
                  おとなが「はなせた／てつだって／もうすこし」を おして きろくする。そのあと せいかいかどうかが 出る */
(function (global) {
  'use strict';
  var WH = global.WH, doc = global.document;
  var S = WH.loadState();          /* きろく */
  var G = null;                    /* いま あそんでいる 1まわり */
  var screen = 'home';

  function el(id) { return doc.getElementById(id); }
  function setText(node, t) { if (node) { node.textContent = t; } }
  function showEl(id, on) { var n = el(id); if (n) { n.style.display = on ? '' : 'none'; } }
  function show(id) {
    var ids = ['scr-home', 'scr-ready', 'scr-play', 'scr-result', 'scr-zukan', 'scr-grown'], i;
    for (i = 0; i < ids.length; i++) { el(ids[i]).style.display = (ids[i] === 'scr-' + id) ? 'block' : 'none'; }
    screen = id;
    if (id === 'home') { checkUpdate(); reloadIfIdle(); }
    global.scrollTo(0, 0);
  }
  function on(id, fn) { var n = el(id); if (n) { n.addEventListener('click', fn, false); } }
  function sizeCanvas(c, w, h) { c.style.width = w + 'px'; c.style.height = h + 'px'; c.setAttribute('width', String(w)); c.setAttribute('height', String(h)); }
  function hasCls(n, c) { return !!(n && n.className && (' ' + n.className + ' ').indexOf(' ' + c + ' ') >= 0); }
  function addCls(n, c) { if (!n || hasCls(n, c)) { return; } n.className = n.className ? n.className + ' ' + c : c; }
  function delCls(n, c) { if (!hasCls(n, c)) { return; } n.className = (' ' + n.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); }
  function sensei() { return S.mode === 'sensei'; }

  /* ================= はじめの がめん ================= */
  function renderHome() {
    var who = S.name ? S.name + ' の' : '', stage = WH.stageOf(S.cFruits), pic = WH.PICS[S.cIndex % WH.PICS.length];
    var next = WH.nextRankAt(S.total), need = WH.GROW[3] - S.cFruits, i, g, st, box = el('genre-list'), b;
    setText(el('home-rank'), who + ' ' + WH.rankOf(S.total));
    setText(el('home-fruits'), 'みのり ' + S.total + 'こ' + (next !== null ? '（つぎまで あと ' + (next - S.total) + 'こ）' : '（いちばん うえ！）'));
    setText(el('home-stage'), WH.STAGE_NAME[stage] + (stage === 3 ? '' : '（せいちゅうまで あと ' + need + 'こ）'));
    setText(el('home-creature'), stage >= 2 ? pic.name + ' に なるかな？' : 'なにに なるかな？');
    WH.paintStage(el('home-tree'), stage, pic.id);
    setText(el('home-zukan-count'), 'ずかん ' + S.zukan.length + 'ひき');
    setText(el('home-ver'), '（v' + WH.APP_VERSION + '）');
    el('mode-hitori').className = 'mbtn' + (sensei() ? '' : ' now');
    el('mode-sensei').className = 'mbtn' + (sensei() ? ' now' : '');
    setText(el('mode-note'), sensei() ? 'おとなが せんせい。もんだいは 1かい だけ よむよ。たって こたえて、わけを はなそう' : 'じぶんで タップして こたえよう。おわったら おうちの ひとに わけを はなそう');
    box.innerHTML = '';
    for (i = 0; i < WH.GENRES.length; i++) {
      g = WH.GENRES[i]; st = S.g[g.id];
      if (g.open && !sensei()) { continue; }
      b = doc.createElement('button'); b.className = 'gbtn g-' + g.id; b.setAttribute('data-g', g.id);
      b.innerHTML = '<b>' + g.name + '</b><span>' + g.sub + '</span><span class="rec">' + WH.LEVEL_NAME[st.level] + (st.rounds ? '・' + st.ok + '／' + st.q + (sensei() ? '・わけ ' + st.exp : '') : '') + '</span>';
      box.appendChild(b);
    }
    b = doc.createElement('button'); b.className = 'gbtn g-mix'; b.setAttribute('data-g', 'mix');
    b.innerHTML = '<b>まぜまぜ</b><span>いろいろな もんだいが つぎつぎ（ほんばんみたい）</span><span class="rec">' + (S.mix.rounds ? S.mix.ok + '／' + S.mix.q + ' せいかい' : '') + '</span>';
    box.appendChild(b);
  }

  /* ================= 1まわり ================= */
  function startRound(gid) {
    var i, qs = [], order = [], lv, ids = [];
    for (i = 0; i < WH.GENRES.length; i++) { if (!WH.GENRES[i].open || sensei()) { ids.push(WH.GENRES[i].id); } }
    if (gid === 'mix') {
      while (order.length < S.perRound) { order = order.concat(WH.shuffle(ids)); }
      for (i = 0; i < S.perRound; i++) { qs.push(WH.makeFor(order[i], S.g[order[i]].level, S.mode)); }
    } else {
      lv = S.g[gid].level;
      for (i = 0; i < S.perRound; i++) { qs.push(WH.makeFor(gid, lv, S.mode)); }
    }
    G = { gid: gid, qs: qs, idx: 0, ok: 0, firstOk: 0, firstOkMain: 0, exp: 0, fruits: 0, tries: 0, done: false, streak: 0, hint: false, planned: qs.length, picks: [], why: null, pending: null, read: false };
    if (sensei()) { renderReady(); show('ready'); return; }
    show('play');
    renderQuestion();
  }
  /* せんせいと＝はじめる まえの 3つの やくそく（たつ・1かいで きく・さいごまで いう） */
  function renderReady() {
    setText(el('ready-name'), (S.name ? S.name + '、' : '') + 'せんせいと れんしゅう');
    setText(el('ready-count'), G.qs.length + 'もん');
  }
  function beginFromReady() { show('play'); renderQuestion(); }

  /* ================= 制限時間（へっていく ぼう） ================= */
  var TM = { on: true, total: 0, left: 0, timer: null };
  function stopTimer() { if (TM.timer) { global.clearInterval(TM.timer); TM.timer = null; } }
  function paintTimer() {
    var bar = el('tbar'), r = TM.total > 0 ? TM.left / TM.total : 0;
    el('tbar-fill').style.width = Math.max(0, Math.min(100, r * 100)) + '%';
    setText(el('tbar-txt'), 'のこり ' + Math.ceil(TM.left) + ' びょう');
    bar.className = 'tbar' + (r <= 0.25 ? ' low' : (r <= 0.5 ? ' mid' : ''));
  }
  function startTimer(sec) {
    stopTimer();
    el('tbar').style.display = (TM.on && sec > 0) ? 'block' : 'none';
    if (!TM.on || !(sec > 0)) { return; }
    TM.total = sec; TM.left = sec; paintTimer();
    TM.timer = global.setInterval(function () {
      TM.left -= 0.25;
      if (TM.left <= 0) { TM.left = 0; paintTimer(); stopTimer(); onTimeout(); return; }
      paintTimer();
    }, 250);
  }
  /* じかんぎれ＝まちがい 1回と おなじ あつかい（1回目＝ヒント＋もう いちど／2回目＝こたえ）。ばつは ない */
  function onTimeout() {
    var q = G.qs[G.idx];
    if (!G || G.done || screen !== 'play' || G.why) { return; }
    G.tries++; G.streak = 0; G.wrongOnce = true;
    if (G.tries === 1) {
      WH.snd.play('oshii');
      giveHint(q, -1); ensureRetest(q);
      setText(el('msg'), 'じかんだよ！ ' + WH.hintText(q) + ' もう いちど');
      el('msg').className = 'msg warn';
      startTimer(WH.timeFor(q));
    } else {
      revealAnswer(q, 'じかんだよ。');
    }
  }

  /* ================= もんだいを 出す ================= */
  function imgTag(id, cls) { return '<img class="' + (cls || 'cimg') + '" src="img/' + id + '.png" alt="">'; }
  function renderQuestion() {
    var q = G.qs[G.idx], box = el('choices'), i, c, wrap, lab, g = WH.genreById(q.g), sz = WH.stemSize(q), stem = el('q-stem'), cs = WH.choiceSize(q), s;
    G.tries = 0; G.done = false; G.hint = false; G.picks = []; G.why = null; G.pending = null; G.read = false; G.wrongOnce = false; G.expNow = null;
    stopTimer(); WH.snd.hush();
    setText(el('play-genre'), g.name + '（' + WH.LEVEL_NAME[q.level] + '）' + (q.retest ? '・もう いちど' : ''));
    setText(el('play-no'), (G.idx + 1) + ' ／ ' + G.qs.length + ' もんめ');
    setText(el('play-mode'), sensei() ? 'せんせいと' : 'ひとりで');
    setText(el('q-text'), WH.questionText(q));
    showEl('why-box', false); showEl('frame-box', false);
    /* せんせいと＝もんだい文は おとなの おびに。子の ますには 出さない。よむ ボタンも 出さない */
    showEl('q-text', !sensei());
    showEl('say-btn', !sensei());
    showEl('sensei-box', sensei());
    if (sensei()) { setText(el('sensei-text'), WH.questionText(q)); showEl('sensei-text', true); showEl('sensei-read', true); showEl('sensei-again', false); setText(el('sensei-note'), 'おとなが 1かい だけ よむ → 「よんだよ」'); }
    /* おてほんの 絵 */
    if (WH.hasStem(q)) {
      stem.style.display = 'block'; el('q-stem-html').style.display = 'none';
      sizeCanvas(stem, sz[0], sz[1]);
      WH.paintStem(q, stem, false);
      showEl('q-box', true);
    } else if (q.g === 'nakama' && q.sub === 'niteiru') {
      stem.style.display = 'none'; el('q-stem-html').style.display = 'block'; el('q-stem-html').innerHTML = imgTag(q.pair[0], 'bigimg') + imgTag(q.pair[1], 'bigimg'); showEl('q-box', true);
    } else if (q.g === 'hanashi' && q.pics) {
      stem.style.display = 'none'; el('q-stem-html').style.display = 'block'; s = ''; for (i = 0; i < q.pics.length; i++) { s += imgTag(q.pics[i], q.pics.length === 3 ? 'midimg' : 'bigimg'); } el('q-stem-html').innerHTML = s; showEl('q-box', true);
    } else if (q.g === 'hanashi') {
      stem.style.display = 'none'; el('q-stem-html').style.display = 'block'; el('q-stem-html').innerHTML = '<div class="bigq">' + (sensei() ? '' : WH.questionText(q)) + '</div>'; showEl('q-box', !sensei());
    } else { showEl('q-box', !sensei()); stem.style.display = 'none'; el('q-stem-html').style.display = 'none'; }
    /* えらびし */
    box.innerHTML = ''; box.className = 'choices' + (q.cType === 'wide' ? ' wide' : '') + (q.g === 'nakama' && q.kind === 'multi' ? ' six' : '') + (el('q-box').style.display === 'none' ? ' full' : '') + (q.kind !== 'open' && q.choices.length >= 5 ? ' five' : '');
    if (q.kind !== 'open' && q.choices.length >= 5 && q.cType !== 'wide') { cs = [Math.round(cs[0] * 0.85), Math.round(cs[1] * 0.85)]; }
    showEl('open-box', q.kind === 'open');
    box.style.display = q.kind === 'open' ? 'none' : '';
    if (q.kind !== 'open') {
      for (i = 0; i < q.choices.length; i++) {
        wrap = doc.createElement('div'); wrap.className = 'choice' + (q.cType === 'num' ? ' choice-num' : (q.cType === 'shape' ? ' choice-shape' : (q.cType === 'img' ? ' choice-img' : (q.cType === 'wide' ? ' choice-wide' : ' choice-cv')))); wrap.setAttribute('data-i', String(i));
        if (q.cType === 'num') { wrap.innerHTML = '<div class="cnum">' + q.choices[i] + '</div>'; }
        else if (q.cType === 'img') { wrap.innerHTML = imgTag(q.choices[i]); }
        else { c = doc.createElement('canvas'); c.className = 'cv'; sizeCanvas(c, cs[0], cs[1]); wrap.appendChild(c); }
        lab = doc.createElement('div'); lab.className = 'mark'; wrap.appendChild(lab);
        box.appendChild(wrap);
      }
      paintChoices();
    }
    setText(el('msg'), q.kind === 'open' ? (sensei() ? 'こえに だして はなしてね。おわったら おとなが「はなし おわった」' : '') : (q.kind === 'multi' ? q.need + 'つ タップしてね' : (q.kind === 'order' ? 'おおきい じゅんに タップしてね' : 'どれかな？ ' + (sensei() ? 'ゆびで さしてね' : 'タップしてね'))));
    el('msg').className = 'msg';
    el('next-btn').style.display = 'none';
    el('tbar').style.display = 'none';
    if (!sensei()) { WH.snd.say(WH.questionText(q)); startTimer(WH.timeFor(q)); }
  }
  function paintChoices() {
    var q = G.qs[G.idx], nodes = choiceNodes(), i, cv;
    for (i = 0; i < nodes.length; i++) { cv = nodes[i].getElementsByTagName('canvas')[0]; if (cv) { WH.paintChoice(q, i, cv, G.hint, G.lastWrong); } }
  }
  function choiceNodes() { return el('choices').getElementsByClassName('choice'); }
  /* せんせい＝よんだよ（ここから 時間が はじまり、文は かくれる＝1かいで きく） */
  function senseiRead() {
    var q = G.qs[G.idx];
    G.read = true;
    showEl('sensei-text', false); showEl('sensei-read', false); showEl('sensei-again', true);
    setText(el('sensei-note'), 'こたえを まつ（ゆびさし＝おとなが かわりに タップ）');
    if (q.kind !== 'open') { startTimer(WH.timeFor(q)); }
  }
  function senseiAgain() { G.reread = (G.reread || 0) + 1; showEl('sensei-text', true); setText(el('sensei-note'), 'ほんばんは 1かい だけ。れんしゅう では もういちど（' + G.reread + 'かいめ）'); }

  /* ================= こたえる ================= */
  function onChoice(i) {
    var q = G.qs[G.idx], nodes = choiceNodes(), node = nodes[i], p, k;
    if (G.done || G.why || q.kind === 'open') { return; }
    if (q.kind === 'multi') {
      p = G.picks.indexOf(i);
      if (p >= 0) { G.picks.splice(p, 1); delCls(node, 'picked'); setText(node.getElementsByClassName('mark')[0], ''); }
      else { if (G.picks.length >= q.need) { return; } G.picks.push(i); addCls(node, 'picked'); setText(node.getElementsByClassName('mark')[0], '○'); WH.snd.play('pick'); }
      if (G.picks.length === q.need) { submit(G.picks.slice().sort(function (a, b) { return a - b; })); }
      return;
    }
    if (q.kind === 'order') {
      if (G.picks.indexOf(i) >= 0) { return; }
      G.picks.push(i); addCls(node, 'picked'); setText(node.getElementsByClassName('mark')[0], String(G.picks.length)); WH.snd.play('pick');
      if (G.picks.length === q.choices.length) { submit(G.picks.slice()); }
      return;
    }
    for (k = 0; k < nodes.length; k++) { delCls(nodes[k], 'picked'); }
    addCls(node, 'picked');
    submit(i);
  }
  function isRight(q, ans) {
    var i, k, set, okset;
    if (q.kind === 'choose') { return ans === q.answerIndex; }
    if (q.kind === 'order') { for (i = 0; i < ans.length; i++) { if (ans[i] !== q.answerOrder[i]) { return false; } } return true; }
    set = ans.join(',');
    for (k = 0; k < q.answerSets.length; k++) { okset = q.answerSets[k].slice().sort(function (a, b) { return a - b; }).join(','); if (okset === set) { return true; } }
    return false;
  }
  function submit(ans) {
    var q = G.qs[G.idx];
    stopTimer();
    /* せんせいと＝せいかいかどうかの まえに「どうして？」（1もんに 1かい） */
    if (sensei() && !G.whyDone) { G.pending = ans; showWhy(q); return; }
    evaluate(q, ans);
  }
  function clearPicks() {
    var nodes = choiceNodes(), k;
    for (k = 0; k < nodes.length; k++) { delCls(nodes[k], 'picked'); if (!hasCls(nodes[k], 'wrong') && !hasCls(nodes[k], 'right')) { setText(nodes[k].getElementsByClassName('mark')[0], ''); } }
    G.picks = [];
  }
  function evaluate(q, ans) {
    var nodes = choiceNodes(), i, wrongIdx = -1;
    if (isRight(q, ans)) {
      if (q.kind === 'choose') { addCls(nodes[ans], 'right'); setText(nodes[ans].getElementsByClassName('mark')[0], '✓ せいかい'); }
      else { for (i = 0; i < ans.length; i++) { addCls(nodes[ans[i]], 'right'); } }
      gotRight(q);
      return;
    }
    G.tries++; G.streak = 0; G.wrongOnce = true;
    if (q.kind === 'choose') { wrongIdx = ans; addCls(nodes[ans], 'wrong'); setText(nodes[ans].getElementsByClassName('mark')[0], '！ ちがう'); }
    else { clearPicks(); }
    if (G.tries === 1) {
      WH.snd.play('oshii');
      giveHint(q, wrongIdx); ensureRetest(q);
      setText(el('msg'), 'おしい！ ' + WH.hintText(q) + (q.kind === 'choose' ? '' : ' もう いちど えらんでね'));
      el('msg').className = 'msg warn';
      startTimer(WH.timeFor(q));
    } else {
      revealAnswer(q, '');
    }
  }
  /* 足場 1段目＝やり方の ヒント＋見る場所を 絵で しぼる（答えは 見せない） */
  function giveHint(q, wrongIdx) {
    G.hint = true; G.lastWrong = wrongIdx;
    if (WH.hasStem(q)) { WH.paintStem(q, el('q-stem'), true); }
    paintChoices();
    if (q.g === 'kazuhanashi' && !sensei()) { setText(el('q-text'), WH.questionText(q)); }
  }
  /* 足場 2段目＝解き方つきの 答え → もう いちど 同じ型の 問題が 2〜4問 あとに 出る（K23） */
  function revealAnswer(q, head) {
    var nodes = choiceNodes(), i, k;
    G.done = true; stopTimer();
    WH.snd.play('kotae');
    if (q.kind === 'choose') { addCls(nodes[q.answerIndex], 'right'); setText(nodes[q.answerIndex].getElementsByClassName('mark')[0], '✓ こたえ'); }
    else if (q.kind === 'order') { for (i = 0; i < q.answerOrder.length; i++) { addCls(nodes[q.answerOrder[i]], 'right'); setText(nodes[q.answerOrder[i]].getElementsByClassName('mark')[0], String(i + 1)); } }
    else { for (k = 0; k < q.answerSets[0].length; k++) { addCls(nodes[q.answerSets[0][k]], 'right'); setText(nodes[q.answerSets[0][k]].getElementsByClassName('mark')[0], '○'); } }
    ensureRetest(q);
    setText(el('msg'), head + 'こたえは これ。' + WH.whyText(q) + retestNote());
    el('msg').className = 'msg warn';
    el('next-btn').style.display = 'inline-block';
    afterQuestion(q, false);
  }
  function gotRight(q) {
    var fr = (G.tries === 0) ? 2 : 1, bonus = '';
    G.done = true; stopTimer();
    G.ok++; if (G.tries === 0) { G.firstOk++; G.streak++; if (!q.retest) { G.firstOkMain++; } } else { G.streak = 0; }
    if (G.streak >= 3) { fr += 1; bonus = '（3もん れんぞく！ ＋1）'; WH.snd.play('combo'); } else { WH.snd.play(G.tries === 0 ? 'ok' : 'ok2'); }
    if (G.expNow === 2) { fr += 1; bonus += '（わけを はなせた ＋1）'; }
    G.fruits += fr;
    setText(el('msg'), 'せいかい！ ' + (G.tries === 0 ? WH.praise() + '。' : 'なおせたね。') + 'みのり ' + fr + 'こ ' + bonus + retestNote());
    el('msg').className = 'msg good';
    el('next-btn').style.display = 'inline-block';
    afterQuestion(q, true);
  }
  function afterQuestion(q, right) {
    /* ひとりで＝おうちの ひとへの はし（K25） */
    if (!sensei() && right && G.tries === 0) { setText(el('msg'), el('msg').textContent + ' おうちの ひとに「どうして そう おもった？」を はなして みよう'); }
  }
  /* まちがえた もんだい は 2〜3問 あとに もう いちど（K23・同じ型・同じレベル・1問に つき 1回）。1回目の まちがい（じかんぎれ も）で 予定する */
  function ensureRetest(q) {
    var nq, at;
    if (q.retest || G.planRetested === G.idx) { return; }
    G.planRetested = G.idx;
    nq = WH.makeFor(q.g, q.level, S.mode); nq.retest = true;
    at = Math.min(G.qs.length, G.idx + 2 + WH.ri(2));
    G.qs.splice(at, 0, nq);
  }
  function retestNote() { return (G.planRetested === G.idx) ? ' あとで もう いちど おなじ もんだいが でるよ。' : ''; }

  /* ================= どうして？（せんせいと＝わけを はなす） ================= */
  function showWhy(q) {
    G.why = true;
    setText(el('why-ask'), WH.WHY_ASK[WH.ri(2)]);
    showEl('why-box', true); showEl('frame-box', false); showEl('why-said', false); showEl('why-btns', true); showEl('why-undo', q.kind !== 'open');
    setText(el('msg'), q.kind === 'open' ? 'はなせたかな？ おとなが えらんでね' : 'わけを はなしたら、おとなが えらんでね');
    el('msg').className = 'msg';
    WH.snd.play('hanashi');
  }
  /* おとなの 代理タップの やりなおし＝こたえを 取り消して えらびなおす（こたえた 回数には 数えない） */
  function undoWhy() {
    var q = G.qs[G.idx];
    if (!G.why || q.kind === 'open') { return; }
    G.why = false; G.pending = null; G.frameShown = false;
    showEl('why-box', false); showEl('frame-box', false);
    clearPicks();
    setText(el('msg'), 'もう いちど えらんでね'); el('msg').className = 'msg';
    if (G.read) { startTimer(WH.timeFor(q)); }
  }
  function rateWhy(exp) {
    var q = G.qs[G.idx];
    if (!G.why) { return; }
    if (exp === 1 && !G.frameShown) {
      /* てつだって＝いいかたの かたを 見せ、まねして いえたら 1 */
      G.frameShown = true;
      setText(el('frame-text'), WH.frameText(q));
      showEl('frame-box', true); showEl('why-btns', false); showEl('why-said', true);
      WH.snd.say(WH.frameText(q).replace(/[「」○△]/g, ''));
      return;
    }
    G.expNow = exp; G.frameShown = false;
    if (exp === 2) { G.exp++; }
    G.why = false; G.whyDone = true;
    showEl('why-box', false); showEl('frame-box', false);
    if (q.kind === 'open') {
      G.done = true; G.ok++; if (!q.retest) { G.firstOk++; G.firstOkMain++; }
      G.fruits += (exp === 2 ? 2 : (exp === 1 ? 1 : 0));
      setText(el('msg'), (exp === 2 ? 'よく はなせたね。みのり 2こ' : (exp === 1 ? 'かたを つかって いえたね。みのり 1こ' : 'つぎは かたを つかって みよう')) + '。たとえば：' + WH.whyText(q));
      el('msg').className = 'msg good';
      WH.snd.play(exp === 2 ? 'ok' : 'ok2');
      el('next-btn').style.display = 'inline-block';
      return;
    }
    evaluate(q, G.pending);
  }

  function onNext() {
    G.whyDone = false; G.frameShown = false; G.expNow = null;
    G.idx++;
    if (G.idx >= G.qs.length) { finishRound(); return; }
    renderQuestion();
  }

  /* ================= けっか ================= */
  var lastRes = null;
  function finishRound() {
    var events, i, lines = [], stars = '', visitor = null, st, newLv, gname;
    if (G.gid === 'mix') { st = S.mix; gname = 'まぜまぜ'; }
    else { st = S.g[G.gid]; gname = WH.genreById(G.gid).name; }
    st.rounds++; st.q += G.qs.length; st.ok += G.ok; st.exp = (st.exp || 0) + G.exp;
    if (G.gid !== 'mix') {
      newLv = WH.nextLevel(st.level, G.firstOkMain, G.planned);
      if (newLv > st.level) { lines.push(gname + ' が「' + WH.LEVEL_NAME[newLv] + '」に あがった！'); }
      if (newLv < st.level) { lines.push('つぎは「' + WH.LEVEL_NAME[newLv] + '」で れんしゅう'); }
      st.level = newLv;
    }
    events = WH.addFruits(S, G.fruits);
    WH.saveState(S);
    for (i = 0; i < G.qs.length; i++) { stars += (i < G.firstOk) ? '★' : (i < G.ok ? '☆' : '・'); }
    setText(el('res-title'), G.ok === G.qs.length ? 'ぜんぶ せいかい！' : 'おつかれさま！');
    setText(el('res-score'), gname + '：' + G.qs.length + 'もんちゅう ' + G.ok + 'もん せいかい' + (sensei() ? '・わけを はなせた ' + G.exp + 'もん' : ''));
    setText(el('res-stars'), stars);
    setText(el('res-fruits'), 'みのり ＋' + G.fruits + 'こ（ぜんぶで ' + S.total + 'こ）');
    for (i = 0; i < events.length; i++) {
      if (events[i].kind === 'stage') { lines.push(WH.STAGE_NAME[events[i].stage] + ' に なった！'); }
      if (events[i].kind === 'visitor') { visitor = events[i].id; lines.push(WH.picById(events[i].id).name + ' が うまれた！ ずかんに はいったよ'); }
      if (events[i].kind === 'lap') { lines.push('ぜんぶの むしが そろった！ ' + events[i].lap + 'しゅうめ'); }
    }
    WH.snd.play(G.ok === G.qs.length ? 'perfect' : 'round');
    if (visitor || events.length) { WH.snd.play('grow', G.ok === G.qs.length ? 1.5 : 1.1); }
    if (lines.length === 0) { lines.push(WH.STAGE_NAME[WH.stageOf(S.cFruits)] + ' が そだっているよ（せいちゅうまで あと ' + (WH.GROW[3] - S.cFruits) + 'こ）'); }
    setText(el('res-events'), lines.join(' ／ '));
    /* おとなへの ひとこと（K25）＝つぎに きく ことば */
    setText(el('res-bridge'), sensei() ? 'おとなの ひとへ：こたえが あっていても「どうして そう おもったの？」と ききましょう。かたは「ほかのは みんな ○○ だけど…」' : 'おうちの ひとに、1もんだけ「どうして そう おもった？」を はなして みよう');
    el('res-card').className = 'res' + (visitor ? ' born' : '');
    sizeCanvas(el('res-tree'), visitor ? 200 : 150, visitor ? 200 : 150);
    lastRes = visitor ? { stage: 3, id: visitor, pic: true } : { stage: WH.stageOf(S.cFruits), id: WH.PICS[S.cIndex % WH.PICS.length].id, pic: false };
    if (lastRes.pic) { WH.paintPic(el('res-tree'), lastRes.id); } else { WH.paintStage(el('res-tree'), lastRes.stage, lastRes.id); }
    stopTimer(); WH.snd.hush();
    show('result');
  }

  /* ================= ずかん（うまれた むし） ================= */
  var Z = { page: 0, per: 10, all: false };
  function renderZukan() {
    var box = el('zukan-list'), i, pic, card, c, got, cv, pages = Math.ceil(WH.PICS.length / Z.per), from, to;
    if (Z.page < 0) { Z.page = 0; } if (Z.page > pages - 1) { Z.page = pages - 1; }
    from = Z.page * Z.per; to = Math.min(WH.PICS.length, from + Z.per);
    box.innerHTML = '';
    for (i = from; i < to; i++) {
      pic = WH.PICS[i];
      got = 0; for (c = 0; c < S.zukan.length; c++) { if (S.zukan[c] === pic.id) { got++; } }
      if (Z.all && !got) { got = 1; }
      card = doc.createElement('div'); card.className = 'zcard' + (got ? '' : ' none');
      cv = doc.createElement('canvas'); sizeCanvas(cv, 120, 120); card.appendChild(cv);
      card.appendChild(doc.createElement('div')).textContent = got ? pic.name + (got > 1 ? ' ×' + got : '') : '？？？';
      box.appendChild(card);
      if (got) { WH.paintPic(cv, pic.id); } else { WH.paintStage(cv, 0, pic.id); }
    }
    setText(el('zukan-page'), (Z.page + 1) + ' ／ ' + pages + ' ページ（' + (Z.all ? 'ぜんぶ みる' : S.zukan.length + '／' + WH.PICS.length + ' ひき') + '）');
    el('zukan-prev').style.visibility = Z.page > 0 ? 'visible' : 'hidden';
    el('zukan-next').style.visibility = Z.page < pages - 1 ? 'visible' : 'hidden';
  }
  WH.onImgReady = function () {
    if (screen === 'zukan') { renderZukan(); }
    else if (screen === 'result' && lastRes && lastRes.pic) { WH.paintPic(el('res-tree'), lastRes.id); }
    else if (screen === 'home') { renderHome(); }
  };

  /* ================= おとなのひと ================= */
  function renderGrown() {
    var t = el('grown-table'), i, rows = '', g, st;
    el('grown-name').value = S.name || '';
    el('grown-per').value = String(S.perRound);
    el('grown-mode').value = S.mode;
    el('grown-snd').value = (S.sound === false) ? 'off' : 'on';
    el('grown-voice').value = (S.voice === false) ? 'off' : 'on';
    for (i = 0; i < WH.GENRES.length; i++) {
      g = WH.GENRES[i]; st = S.g[g.id];
      rows += '<tr><td>' + g.name + '</td><td>' + WH.LEVEL_NAME[st.level] + '</td><td>' + st.rounds + '</td><td>' + st.q + '</td><td>' + st.ok + '</td><td>' + (st.exp || 0) + '</td></tr>';
    }
    rows += '<tr><td>まぜまぜ</td><td>−</td><td>' + S.mix.rounds + '</td><td>' + S.mix.q + '</td><td>' + S.mix.ok + '</td><td>' + (S.mix.exp || 0) + '</td></tr>';
    t.innerHTML = '<tr><th>かた</th><th>レベル</th><th>かい</th><th>もん</th><th>せいかい</th><th>わけ</th></tr>' + rows;
    setText(el('grown-ver'), 'v' + WH.APP_VERSION + '・みのり ' + S.total + '・ずかん ' + S.zukan.length);
    el('reset-2').style.display = 'none';
  }
  var holdTimer = null;
  function holdStart() { holdTimer = global.setTimeout(function () { holdTimer = null; renderGrown(); show('grown'); }, 1200); }
  function holdEnd() { if (holdTimer) { global.clearTimeout(holdTimer); holdTimer = null; } }

  /* ================= 版の 取りなおし ================= */
  function tidyUrl() {
    if (!global.history || !global.history.replaceState) { return; }
    if (global.location.search.indexOf('v=') < 0) { return; }
    try { global.history.replaceState(null, '', global.location.pathname); } catch (e) { /* 見ためだけ */ }
  }
  function checkUpdate() {
    var x;
    if (!global.XMLHttpRequest) { return; }
    try { x = new global.XMLHttpRequest(); } catch (e) { return; }
    try { x.open('GET', 'version.txt?t=' + (new Date()).getTime(), true); } catch (e2) { return; }
    x.onreadystatechange = function () {
      var v, now, last = null, part;
      if (x.readyState !== 4 || x.status !== 200) { return; }
      v = parseInt(String(x.responseText).replace(/[^0-9]/g, ''), 10);
      now = (new Date()).getTime();
      if (!(v > WH.APP_VERSION)) { return; }
      try { last = global.sessionStorage.getItem(WH.UPD_KEY); } catch (e3) { /* 無くても進む */ }
      if (last) { part = String(last).split(':'); if (part[0] === String(v) && (now - parseInt(part[1], 10)) < 30000) { return; } }
      if (screen !== 'home') { return; }
      try { global.sessionStorage.setItem(WH.UPD_KEY, v + ':' + now); } catch (e4) { /* 無くても進む */ }
      global.location.replace('./?v=' + v);
    };
    try { x.send(null); } catch (e5) { /* 通信できなくても あそべる */ }
  }
  var cacheReady = false;
  function reloadIfIdle() { if (!cacheReady || screen !== 'home') { return; } cacheReady = false; global.location.reload(); }
  function watchCache() {
    var ac = global.applicationCache;
    if (!ac || !ac.addEventListener) { return; }
    ac.addEventListener('updateready', function () { try { ac.swapCache(); } catch (e) { /* つぎに */ } cacheReady = true; reloadIfIdle(); }, false);
  }

  /* ================= 押した 手ごたえ（K26） ================= */
  function inAdult(n) { var k = 0; while (n && k < 12) { if (n.id === 'scr-grown') { return true; } n = n.parentNode; k++; } return false; }
  function pressTarget(n) {
    var k = 0;
    while (n && k < 5) {
      if (n.tagName === 'BUTTON' || hasCls(n, 'choice')) {
        if (n.id === 'grown-btn' || inAdult(n)) { return null; }
        return n;
      }
      n = n.parentNode; k++;
    }
    return null;
  }
  var pressed = null;
  function pressOn(ev) { var n = pressTarget(ev.target); if (pressed && pressed !== n) { delCls(pressed, 'press'); } pressed = n; if (n) { addCls(n, 'press'); } }
  function pressOff() { if (pressed) { delCls(pressed, 'press'); pressed = null; } }
  function bindPress() {
    doc.addEventListener('touchstart', function (ev) { try { pressOn(ev); } catch (e) { /* 見た目だけ */ } }, false);
    doc.addEventListener('touchend', function () { try { pressOff(); } catch (e) { /* 見た目だけ */ } }, false);
    doc.addEventListener('touchcancel', function () { try { pressOff(); } catch (e) { /* 見た目だけ */ } }, false);
    doc.addEventListener('click', function () { try { pressOff(); } catch (e) { /* 見た目だけ */ } }, true);
    doc.addEventListener('gesturestart', function (ev) { ev.preventDefault(); }, false);
  }

  /* ================= 音の ためし（おとなのひと） ================= */
  function sndStatus() {
    var c = WH.snd.ctx, k = WH.snd.keep;
    return 'おと: ' + (c ? (c.state || 'ふめい') : 'なし') + '・むおんの ループ: ' + (k ? (k.paused ? 'とまっている' : 'あり') : 'なし');
  }
  function sndTest() {
    var was = WH.snd.on, okd;
    WH.snd.on = true; WH.snd.unlock();
    okd = WH.snd.play('ok');
    WH.snd.on = was;
    setText(el('grown-snd-res'), (okd ? 'ならしました（' : 'おとの しくみが つくれません（') + sndStatus() + '）');
    global.setTimeout(function () { setText(el('grown-snd-res'), (okd ? 'ならしました（' : 'おとの しくみが つくれません（') + sndStatus() + '）'); }, 500);
  }

  /* ================= 押したときの 受けとり ================= */
  function init() {
    var gb = el('grown-btn');
    el('genre-list').addEventListener('click', function (ev) {
      var t = ev.target, n = 0;
      while (t && n < 4) { if (t.getAttribute && t.getAttribute('data-g')) { startRound(t.getAttribute('data-g')); return; } t = t.parentNode; n++; }
    }, false);
    on('mode-hitori', function () { S.mode = 'hitori'; WH.saveState(S); renderHome(); });
    on('mode-sensei', function () { S.mode = 'sensei'; WH.saveState(S); renderHome(); });
    on('ready-go', beginFromReady);
    on('ready-back', function () { renderHome(); show('home'); });
    on('zukan-btn', function () { Z.page = 0; Z.all = false; renderZukan(); show('zukan'); });
    on('zukan-prev', function () { Z.page--; renderZukan(); });
    on('zukan-next', function () { Z.page++; renderZukan(); });
    on('grown-zukan-all', function () { Z.page = 0; Z.all = true; renderZukan(); show('zukan'); });
    WH.preloadZukan();
    on('zukan-back', function () { Z.all = false; renderHome(); show('home'); });
    on('play-back', function () { stopTimer(); WH.snd.hush(); renderHome(); show('home'); });
    on('next-btn', onNext);
    on('say-btn', function () { WH.snd.say(WH.questionText(G.qs[G.idx])); });
    on('sensei-read', senseiRead);
    on('sensei-again', senseiAgain);
    on('open-done', function () { var q = G.qs[G.idx]; if (G.done || G.why) { return; } stopTimer(); showWhy(q); });
    on('why-ok', function () { rateWhy(2); });
    on('why-help', function () { rateWhy(1); });
    on('why-no', function () { rateWhy(0); });
    on('why-said-ok', function () { rateWhy(1); });
    on('why-said-no', function () { rateWhy(0); });
    on('why-undo', undoWhy);
    on('res-again', function () { startRound(G.gid); });
    on('res-home', function () { renderHome(); show('home'); });
    el('choices').addEventListener('click', function (ev) {
      var t = ev.target, n = 0;
      while (t && n < 5) { if (t.getAttribute && t.getAttribute('data-i') !== null) { onChoice(parseInt(t.getAttribute('data-i'), 10)); return; } t = t.parentNode; n++; }
    }, false);
    gb.addEventListener('touchstart', function (ev) { ev.preventDefault(); holdStart(); }, false);
    gb.addEventListener('touchend', holdEnd, false); gb.addEventListener('touchcancel', holdEnd, false);
    gb.addEventListener('mousedown', holdStart, false); gb.addEventListener('mouseup', holdEnd, false); gb.addEventListener('mouseleave', holdEnd, false);
    on('grown-back', function () { renderHome(); show('home'); });
    on('grown-save', function () {
      S.name = String(el('grown-name').value || '').slice(0, 8);
      S.perRound = parseInt(el('grown-per').value, 10) === 8 ? 8 : 5;
      S.mode = el('grown-mode').value === 'hitori' ? 'hitori' : 'sensei';
      S.sound = el('grown-snd').value !== 'off'; S.voice = el('grown-voice').value !== 'off';
      WH.snd.on = S.sound; WH.snd.voice = S.voice;
      if (!S.sound && WH.snd.keep) { try { WH.snd.keep.pause(); } catch (e) { /* なくても */ } }
      WH.saveState(S); renderHome(); show('home');
    });
    on('reset-1', function () { el('reset-2').style.display = 'inline-block'; });
    on('reset-2', function () {
      var keep = { name: S.name, perRound: S.perRound, sound: S.sound, voice: S.voice, mode: S.mode };
      S = WH.freshState(); S.name = keep.name; S.perRound = keep.perRound; S.sound = keep.sound; S.voice = keep.voice; S.mode = keep.mode;
      WH.saveState(S); renderGrown(); setText(el('grown-ver'), 'きろくを けしました');
    });
    global.addEventListener('resize', function () {
      if (screen === 'play' && G) { if (WH.hasStem(G.qs[G.idx])) { WH.paintStem(G.qs[G.idx], el('q-stem'), G.hint); } paintChoices(); }
      if (screen === 'home') { renderHome(); }
    }, false);
    WH.snd.on = (S.sound !== false); WH.snd.voice = (S.voice !== false);
    on('grown-snd-test', sndTest);
    bindPress();
    doc.addEventListener('visibilitychange', function () { if (doc.hidden && WH.snd.keep) { try { WH.snd.keep.pause(); } catch (e) { /* つぎの タッチで もどる */ } } }, false);
    doc.addEventListener('touchend', function () { WH.snd.unlock(); }, false);
    doc.addEventListener('click', function (ev) { WH.snd.unlock(); if (ev.target && ev.target.tagName === 'BUTTON') { WH.snd.play('tap'); } }, false);
    tidyUrl();
    watchCache();
    renderHome();
    show('home');
  }
  /* 試験用＝画面を 直接 うごかす 入口 */
  WH.ui = { startRound: startRound, begin: beginFromReady, state: function () { return S; }, round: function () { return G; }, onChoice: onChoice, rateWhy: rateWhy, senseiRead: senseiRead,
    timer: function () { return TM; }, setTimer: function (on) { TM.on = !!on; if (!on) { stopTimer(); el('tbar').style.display = 'none'; } }, timeout: onTimeout, screen: function () { return screen; },
    setMode: function (m) { S.mode = m; }, selfTest: uiSelfTest };

  /* ================= 自己点検（画面の 部品・tools/test.html が 無音の複製の 中で よぶ） ================= */
  function fire(n, type) { var ev = doc.createEvent('Event'); ev.initEvent(type, true, true); n.dispatchEvent(ev); }
  function uiSelfTest() {
    var pass = 0, fail = 0, lines = [], i, n, all, targets = [], skipped = [], bad = [], nBtn = 0, nCard = 0, scr0, idx0, dur, band, raw, t1, t2, shown0, q, wrong, k, keysOk, at, planned, nodes;
    function ok(cond, label) { if (cond) { pass++; } else { fail++; lines.push('FAIL ' + label); } }
    function wrongIdx(qq) { var w = []; for (k = 0; k < qq.choices.length; k++) { if (k !== qq.answerIndex) { w.push(k); } } return w; }
    TM.on = false; stopTimer();
    WH.seed(11);
    /* K26 押した 手ごたえ＝子どもが 押す ボタン ぜんぶ＋えらぶ カード */
    S.mode = 'hitori'; renderHome(); show('home');
    S.g.himo.level = 1; startRound('himo');
    all = doc.getElementsByTagName('button');
    for (i = 0; i < all.length; i++) { if (pressTarget(all[i]) === all[i]) { targets.push(all[i]); nBtn++; } else { skipped.push(all[i].id || all[i].className); } }
    all = choiceNodes();
    for (i = 0; i < all.length; i++) { if (pressTarget(all[i]) === all[i]) { targets.push(all[i]); nCard++; } }
    scr0 = screen; idx0 = G.idx;
    for (i = 0; i < targets.length; i++) {
      n = targets[i];
      fire(n, 'touchstart'); t1 = hasCls(n, 'press');
      if (i === 0) { dur = String((global.getComputedStyle ? global.getComputedStyle(n, null) : n.style).transitionDuration || ''); }
      fire(n, 'touchend'); t2 = hasCls(n, 'press');
      if (!t1 || t2) { bad.push((n.id || n.className) + (t1 ? '' : ' つかない') + (t2 ? ' のこる' : '')); }
    }
    ok(targets.length >= 25 && nCard >= 2, 'K26 たいしょうの かず（ボタン ' + nBtn + '・カード ' + nCard + '）');
    ok(bad.length === 0, 'K26 touchstart で press・touchend で はずれる（だめ ' + bad.length + '）' + bad.join(' '));
    fire(targets[0], 'touchstart'); fire(targets[0], 'touchcancel'); ok(!hasCls(targets[0], 'press'), 'K26 touchcancel でも はずれる');
    fire(targets[0], 'touchstart'); fire(el('q-text'), 'click'); ok(!hasCls(targets[0], 'press'), 'K26 click でも はずれる');
    ok(dur.indexOf('0.05s') === 0, 'K26 おして 0.1びょう いないに かわる（transition ' + dur + '）');
    ok(pressTarget(el('grown-btn')) === null && pressTarget(el('grown-snd-test')) === null, 'K26 おとなの ながおし・おとなのひと の がめん には つけない');
    ok(screen === scr0 && G.idx === idx0 && !G.done, 'K26 touch だけでは しょりが はしらない');
    lines.push('K26 ' + (bad.length === 0 ? 'OK' : 'NG') + ' おした てごたえ ' + targets.length + 'こ（ボタン ' + nBtn + '・カード ' + nCard + '）・つけない ' + skipped.length + 'こ');
    /* K21 まちがえたときの 型（ひとりで）＝1回目 ヒント・2回目 こたえ。K23＝まちがえた もんだい が 2〜3問 あとに もう いちど */
    q = G.qs[G.idx]; wrong = wrongIdx(q); planned = G.qs.length;
    onChoice(wrong[0]);
    ok(G.tries === 1 && G.hint === true && !G.done && el('next-btn').style.display === 'none' && el('msg').textContent.indexOf('おしい') === 0, 'K21 1かいめ＝ヒント・まだ つぎへ は 出ない');
    ok(hasCls(choiceNodes()[wrong[0]], 'wrong') && el('msg').textContent.indexOf('✕') < 0, 'K21 ばつ の しるしは つかわない');
    at = -1; for (i = G.idx + 1; i < G.qs.length; i++) { if (G.qs[i].retest) { at = i; } }
    ok(G.qs.length === planned + 1 && at >= G.idx + 2 && at <= G.idx + 3 && G.qs[at].g === q.g && G.qs[at].level === q.level, 'K23 まちがえた もんだい が ' + (at - G.idx) + 'もん あとに もう いちど（同じ型・同じレベル）');
    onChoice(wrong[1]);
    ok(G.done === true && el('next-btn').style.display !== 'none' && el('msg').textContent.indexOf('こたえは これ') >= 0 && hasCls(choiceNodes()[q.answerIndex], 'right'), 'K21 2かいめ＝こたえと わけ を みせる');
    ok(G.qs.length === planned + 1, 'K23 もう いちど は 1もんに つき 1かい');
    lines.push('K21 OK 1かいめ ヒント・2かいめ こたえ（ばつ なし）');
    lines.push('K23 OK まちがえた もんだい は ' + (at - G.idx) + 'もん あとに もう いちど');
    /* せんせいと＝よんだら 文が かくれる・こたえの まえに「どうして？」・はなせた が きろくに のこる・open は おはなしだけ */
    onNext();
    S.mode = 'sensei'; S.g.nakama.level = 1; startRound('nakama');
    ok(screen === 'ready', 'せんせいと＝はじめる まえに やくそくの がめん');
    beginFromReady();
    q = G.qs[G.idx];
    ok(el('q-text').style.display === 'none' && el('sensei-box').style.display !== 'none' && el('sensei-text').style.display !== 'none' && el('say-btn').style.display === 'none', 'せんせいと＝もんだい文は おとなの おびだけ・よむ ボタン なし');
    senseiRead();
    ok(el('sensei-text').style.display === 'none' && G.read === true, 'せんせいと＝よんだよ で 文が かくれる（1かいで きく）');
    onChoice(wrongIdx(q)[0]);
    ok(G.why === true && el('why-box').style.display !== 'none' && !G.done, 'せんせいと＝せいかいの まえに「どうして？」');
    undoWhy();
    ok(G.why === false && G.pending === null && G.tries === 0 && el('why-box').style.display === 'none' && choiceNodes()[wrongIdx(q)[0]].className.indexOf('picked') < 0, 'やりなおし＝おとなの 代理タップを 取り消せる（こたえた 回数に 数えない）');
    onChoice(q.answerIndex);
    ok(G.why === true, 'やりなおしの あと もう いちど「どうして？」');
    rateWhy(1);
    ok(el('why-said-no').style.display !== 'none' || el('why-said').style.display !== 'none', 'てつだって の あとにも「もうすこし」の 出口が ある');
    ok(el('frame-box').style.display !== 'none' && G.why === true, 'てつだって＝いいかたの かたが 出る');
    rateWhy(1);
    ok(G.done === true && G.ok === 1 && G.expNow === 1, 'かたを つかって いえた＝1');
    onNext(); q = G.qs[G.idx]; senseiRead(); onChoice(q.answerIndex); rateWhy(2);
    ok(G.exp === 1 && G.done === true && el('msg').textContent.indexOf('わけを はなせた') >= 0, 'はなせた＝きろくに のこり みのり ＋1');
    /* おはなし（こたえの ない もんだい）＝せんせいと だけ */
    onNext(); startRound('hanashi'); beginFromReady(); q = G.qs[G.idx];
    ok(q.kind === 'open' && el('open-box').style.display !== 'none' && el('choices').style.display === 'none', 'おはなし＝えらびし なし・はなし おわった ボタン');
    el('open-done').click(); ok(G.why === true, 'おはなし＝はなし おわった → どうして？ の きろく');
    rateWhy(2); ok(G.done === true && G.fruits >= 2, 'おはなし＝はなせた で みのり');
    S.mode = 'hitori'; startRound('hanashi'); q = G.qs[G.idx]; ok(q.kind !== 'open', 'ひとりで＝おはなしの 型でも こたえの ある もんだい に なる');
    stopTimer(); renderHome(); show('home'); TM.on = true;
    /* K29 きろくの なまえ */
    keysOk = WH.STORE_KEY.indexOf('wake_') === 0 && WH.UPD_KEY.indexOf('wake_') === 0;
    ok(keysOk, 'K29 きろくの なまえが wake_ で はじまる');
    lines.push('K29 ' + (keysOk ? 'OK' : 'NG') + ' きろくの なまえ ' + WH.STORE_KEY + '・' + WH.UPD_KEY + '（clear は check_all が 0けん を みる）');
    /* K30 エラーの 帯 */
    band = el('err-band'); raw = el('err-2');
    shown0 = band ? band.style.display : 'なし';
    ok(!!band && shown0 === 'none', 'K30 ふだんは かくれている（' + shown0 + '）');
    if (band && typeof global.onerror === 'function') {
      global.onerror('K30 わざと おこした エラー', 'http://x/index.html?v=8', 123, 45);
      ok(band.style.display === 'block', 'K30 おびが でる');
      ok(band.textContent.indexOf('ごめんね') >= 0, 'K30 1ぎょうめ ごめんね');
      ok(raw.textContent.indexOf('K30 わざと おこした エラー') >= 0 && raw.textContent.indexOf('index.html 123:45') >= 0, 'K30 2ぎょうめ なまの エラー＋ぎょう');
      lines.push('K30 ' + (band.style.display === 'block' ? 'OK' : 'NG') + ' エラーの おび');
      fire(band, 'click');
      ok(band.style.display === 'none', 'K30 さわると きえる');
      band.setAttribute('data-n', '0'); raw.textContent = '';
    } else { ok(false, 'K30 window.onerror が ない'); }
    WH.seed(null);
    return { pass: pass, fail: fail, lines: lines };
  }

  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', init, false); } else { init(); }
})(window);
