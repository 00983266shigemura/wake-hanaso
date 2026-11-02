# わけを はなそう ── 画面の撮影（CCが目で確かめる用・無音の複製で）。使い方＝ zsh tools/shots.zsh [tag…]
#   tag＝home / play<型> / hint<型> / ans<型> / story<型> / result<型> / zukan（fit_check.html の meas の名前）
#   解き方ごと＝ sch_<型>_<解き方>[_p＝ふたつ きく][_s＝せんせいと][_h＝ヒント|_a＝こたえ|_w＝どうして]（いちばん上のレベル）
#   置き場＝ 環境変数 SHOT_DIR（無ければ logs/）
ROOT="/Users/shigemurasatoshi/dev/wake-hanaso"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="${SHOT_DIR:-$ROOT/logs}"
mkdir -p "$OUT"
[[ $# -ge 1 ]] || set -- home playkisetsu playkotoba storyohanashi playohanashi hintkisetsu resultkisetsu
/usr/bin/python3 "$ROOT/tools/mkpage.py" > /dev/null || exit 1
rm -rf "$ROOT/logs/img"; cp -R "$ROOT/img" "$ROOT/logs/img"   # 無音の複製（logs/）から 絵が 見えるように
for t in "$@"; do
  TMR=""; [[ "$t" == timer* ]] && { TMR="&timer=1"; t="${t#timer}"; }
  "$CHROME" --headless=new --disable-gpu --no-sandbox --allow-file-access-from-files --virtual-time-budget=20000 --window-size=1024,700 --hide-scrollbars \
    --screenshot="$OUT/shot_$t.png" "file://$ROOT/tools/fit_check.html#size=1024x640&shot=$t$TMR" > /dev/null 2>&1
  [[ -s "$OUT/shot_$t.png" ]] && print "✓ $t → $OUT/shot_$t.png" || print "✕ $t"
done
