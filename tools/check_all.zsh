# わけを はなそう ── 公開前の検査をまとめて回す（CCが使う。しげ用の台本は push.zsh）
#   1 組み立て  2 古い書き方  3 字の在庫・3b 子どもの画面の漢字・3c 書かない語・3d きろくの なまえ（K29）  4 ホーム画面の絵
#   5 自己点検（計算＋画面の部品＝無音の複製）＋既定の部品の検査（check_defaults）  6 iPad よこおきの 1がめん＋無音  8 きめこまかい画面  9 制限時間
# 終了コード 0=全部PASS / 1=どれか不合格
ROOT="${0:A:h:h}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DEFAULTS="/Users/shigemurasatoshi/dev/AI_Operating_Vault/30_generated/governance/cc_harness/kid_app/tools/check_defaults.py"
LOG="$ROOT/logs/check_$(date +%Y%m%d_%H%M%S).log"
FAILFILE="$ROOT/logs/.check_fail"
mkdir -p "$ROOT/logs"
rm -f "$FAILFILE"
{
print "== 1/9 組み立て =="
/usr/bin/python3 "$ROOT/tools/build_app.py" || touch "$FAILFILE"
print "== 2/9 古い書き方だけか（src/*.js・index.html） =="
/usr/bin/python3 "$ROOT/tools/check_es5.py" --selftest || touch "$FAILFILE"
/usr/bin/python3 "$ROOT/tools/check_es5.py" "$ROOT/src/core.js" "$ROOT/src/gen.js" "$ROOT/src/ui.js" "$ROOT/index.html" || touch "$FAILFILE"
print "== 3/9 字の在庫（絵文字なし） =="
/usr/bin/python3 "$ROOT/tools/check_chars.py" "$ROOT/index.html" "$ROOT/README.md" || touch "$FAILFILE"
print "== 3b/9 子どもの画面の漢字（おとなのひと の画面は除く） =="
/usr/bin/python3 "$ROOT/tools/check_kana.py" --selftest || touch "$FAILFILE"
/usr/bin/python3 "$ROOT/tools/check_kana.py" || touch "$FAILFILE"
print "== 3c/9 公開物の書かない語（受験校・日程・受験番号） =="
/usr/bin/python3 "$ROOT/tools/check_private.py" "$ROOT/index.html" "$ROOT/README.md" "$ROOT/offline.appcache" || touch "$FAILFILE"
print "== 3d/9 きろくの なまえ（K29）＝wake_ 以外の localStorage の なまえ 0件・clear 0件 =="
BADKEY=$(grep -n "Storage\.\(getItem\|setItem\|removeItem\)('" "$ROOT/src/"*.js | grep -v "('wake_" | wc -l | tr -d ' ')
CLEARN=$(grep -n "\.clear(" "$ROOT/src/"*.js | wc -l | tr -d ' ')
print "wake_ 以外の なまえ=$BADKEY・clear=$CLEARN"
[[ "$BADKEY" == "0" && "$CLEARN" == "0" ]] || touch "$FAILFILE"
print "== 4/9 ホーム画面の絵 =="
/usr/bin/python3 "$ROOT/tools/make_icon.py" --check || touch "$FAILFILE"
print "== 5/9 自己点検（ブラウザで実行・無音の複製で） =="
/usr/bin/python3 "$ROOT/tools/mkpage.py" --selftest || touch "$FAILFILE"
/usr/bin/python3 "$ROOT/tools/mkpage.py" || touch "$FAILFILE"
rm -rf "$ROOT/logs/img"; cp -R "$ROOT/img" "$ROOT/logs/img" || touch "$FAILFILE"   # 無音の複製から 絵が 見えるように（logs は git に載せない）
TMP="$ROOT/logs/selftest_dom.html"
"$CHROME" --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=30000 \
  --dump-dom "file://$ROOT/tools/test.html" > "$TMP" 2>/dev/null
RESULT=$(/usr/bin/python3 "$ROOT/tools/read_selftest.py" "$TMP")
print -r -- "$RESULT"
print -r -- "$RESULT" | head -1 | grep -q '^PASS=[0-9]* FAIL=0$' || touch "$FAILFILE"
print -r -- "$RESULT" > "$ROOT/logs/selftest_out.txt"
/usr/bin/python3 "$DEFAULTS" "$ROOT/logs/selftest_out.txt" || touch "$FAILFILE"
print "== 6/9 iPad よこおきで 1がめんに おさまるか（1024×640・ぜんぶの がめん・無音の複製で） =="
FIT=$("$CHROME" --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=60000 \
  --dump-dom "file://$ROOT/tools/fit_check.html#size=1024x640" 2>/dev/null | sed -n '/<pre id="out">/,/<\/pre>/p' | sed -e 's/<pre id="out">//' -e 's/<\/pre>//')
print -r -- "$FIT"
print -r -- "$FIT" | grep -qx 'FIT=PASS' || touch "$FAILFILE"
print "== 8/9 きめこまかい画面（dpr=2・iPad と同じ）で キャンバスが 育たないか（無音の複製で） =="
DPR=$("$CHROME" --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=20000 --window-size=1040,700 --force-device-scale-factor=2 \
  --dump-dom "file://$ROOT/tools/dpr_probe.html" 2>/dev/null | sed -n '/<pre id="out">/,/<\/pre>/p' | sed -e 's/<pre id="out">//' -e 's/<\/pre>//')
print -r -- "$DPR"
print -r -- "$DPR" | grep -qx 'DPR=PASS' || touch "$FAILFILE"
print "== 9/9 制限時間＝ぼうが 出て、じかんぎれで ヒント→こたえ、正解で 止まる。せんせいと は よんだよ の あと（無音の複製で） =="
TMR=$("$CHROME" --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=5000 --window-size=1040,700 \
  --dump-dom "file://$ROOT/tools/timer_check.html" 2>/dev/null | sed -n '/<pre id="out">/,/<\/pre>/p' | sed -e 's/<pre id="out">//' -e 's/<\/pre>//')
print -r -- "$TMR"
print -r -- "$TMR" | grep -qx 'TIMER=PASS' || touch "$FAILFILE"
if [[ -e "$FAILFILE" ]]; then print "== けっか: FAIL =="; else print "== けっか: PASS =="; fi
} 2>&1 | tee "$LOG"
if [[ -e "$FAILFILE" ]]; then rm -f "$FAILFILE"; exit 1; fi
exit 0
