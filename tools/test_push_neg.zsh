# わけを はなそう ── push.zsh の「止まる系」の発火試験（通信なし＝4/9 より前で止まる3通り）
#   (a) 未保存の変更がある → 1/9 で止まる
#   (b) 取り込みが途中 → 3/9 で止まる
#   (c) 公開先の登録が違う → 2/9 で止まる
#   (d) 記録の名義が公開用でない → 6/9 の送る直前で止まる（公開先は手元の空の置き場＝通信なし）
#   (e) 本番基準表（src/bench.js）の値を1つ上げた複製 → 1/9 の公開前の検査（check_all）で止まる。(e0) 上げない複製は検査を通る（対照）
#   試験用の複製を scratchpad に作り、環境変数で台本に差し替えて実行する。本物の repo には触れない。GitHub へは何も送らない。
# 終了コード 0=6通りとも想定どおり / 1=どれかが想定と違う
ROOT="/Users/shigemurasatoshi/dev/wake-hanaso"
WORK="${1:-/tmp/wh_push_neg_$$}"
mkdir -p "$WORK/logs"
bad=0
run_case() {
  local name="$1" expect="$2" dir="$3"
  local out
  out="$(KZ_REPO_DIR="$dir" KZ_LOG_DIR="$WORK/logs" KZ_GH=/usr/bin/false zsh "$ROOT/push.zsh" 2>&1)"
  local rc=$?
  if [[ $rc -eq 1 ]] && print -r -- "$out" | grep -q -- "$expect"; then
    print "✓ $name ＝ 想定どおり止まった（$expect）"
  else
    print "✕ $name ＝ 想定と違う（exit=$rc）"; print -r -- "$out" | tail -5; bad=1
  fi
  sleep 1
}
# (a)
rm -rf "$WORK/a"; git clone -q "$ROOT" "$WORK/a" && cp "$ROOT/icon.png" "$WORK/a/icon.png" && print "x" >> "$WORK/a/README.md"
run_case "(a) 未保存の変更" "未保存の直し" "$WORK/a"
# (b)
rm -rf "$WORK/b"; git clone -q "$ROOT" "$WORK/b" && cp "$ROOT/icon.png" "$WORK/b/icon.png" && git -C "$WORK/b" remote set-url origin "https://github.com/00983266shigemura/wake-hanaso.git" && mkdir -p "$WORK/b/.git/rebase-merge"
run_case "(b) 取り込みが途中" "取り込みが途中" "$WORK/b"
# (c)
rm -rf "$WORK/c"; git clone -q "$ROOT" "$WORK/c" && cp "$ROOT/icon.png" "$WORK/c/icon.png" && git -C "$WORK/c" remote set-url origin "https://github.com/someone-else/other.git"
run_case "(c) 公開先が違う" "台本の知っている場所" "$WORK/c"
# (d) 記録の名義が公開用でない → 6/9 の送る直前で止まる（公開先は手元の空の置き場＝通信なし・gh は常に成功の代役）
rm -rf "$WORK/d" "$WORK/d_origin"; git init -q --bare "$WORK/d_origin" && git clone -q "$ROOT" "$WORK/d" && cp "$ROOT/icon.png" "$WORK/d/icon.png" \
  && git -C "$WORK/d" remote set-url origin "$WORK/d_origin" \
  && git -C "$WORK/d" -c user.name="someone" -c user.email="someone@example.com" commit -q --allow-empty -m "test identity"
out="$(KZ_REPO_DIR="$WORK/d" KZ_LOG_DIR="$WORK/logs" KZ_GH=/usr/bin/true KZ_ORIGIN_URL="$WORK/d_origin" zsh "$ROOT/push.zsh" 2>&1)"; rc=$?
if [[ $rc -eq 1 ]] && print -r -- "$out" | grep -q -- "記録の名義" && [[ -z "$(git -C "$WORK/d_origin" branch --list main)" ]]; then
  print "✓ (d) 名義が公開用でない ＝ 想定どおり止まった（何も送っていない）"
else
  print "✕ (d) 名義が公開用でない ＝ 想定と違う（exit=$rc）"; print -r -- "$out" | tail -5; bad=1
fi
# (e) 本番基準表の値を 1つ 上げた 複製（ひも n 6→7）→ 1/9 の 公開前の検査（check_all）で 止まり、何も 送らない
#     (e0) 対照＝上げない 複製は 検査を 通り、4/9 で 止まる（gh は 常に 失敗の 代役・公開先は 手元の 空の 置き場）
for cs in e0 e; do
  rm -rf "$WORK/$cs" "$WORK/${cs}_origin"; git init -q --bare "$WORK/${cs}_origin" && git clone -q "$ROOT" "$WORK/$cs" && cp "$ROOT/icon.png" "$WORK/$cs/icon.png" \
    && git -C "$WORK/$cs" remote set-url origin "$WORK/${cs}_origin"
  if [[ "$cs" == "e" ]]; then
    sed -i '' 's/himo: { n: 6, depth: 3,/himo: { n: 7, depth: 3,/' "$WORK/e/src/bench.js"
    grep -q "himo: { n: 7, depth: 3," "$WORK/e/src/bench.js" || { print "✕ (e) 表の値を 上げられなかった"; bad=1; }
    git -C "$WORK/e" -c user.name="00983266shigemura" -c user.email="296550467+00983266shigemura@users.noreply.github.com" commit -q -am "test bench +1"
  fi
  out="$(KZ_REPO_DIR="$WORK/$cs" KZ_LOG_DIR="$WORK/logs" KZ_GH=/usr/bin/false KZ_ORIGIN_URL="$WORK/${cs}_origin" zsh "$ROOT/push.zsh" 2>&1)"; rc=$?
  sent="$(git -C "$WORK/${cs}_origin" branch --list main)"
  if [[ "$cs" == "e" ]]; then
    if [[ $rc -eq 1 ]] && print -r -- "$out" | grep -q -- "公開前の検査（check_all）が FAIL" && print -r -- "$out" | grep -q "FAIL K10 ほんばん きじゅん himo" && [[ -z "$sent" ]]; then
      print "✓ (e) 表の値を 1つ 上げた 複製 ＝ 公開前の検査で 止まった（何も送っていない）"; print -r -- "$out" | grep -E "FAIL K10|中止" | cut -c1-160
    else
      print "✕ (e) 想定と違う（exit=$rc）"; print -r -- "$out" | tail -8; bad=1
    fi
  else
    if [[ $rc -eq 1 ]] && print -r -- "$out" | grep -q -- "✓ 公開前の検査 PASS" && print -r -- "$out" | grep -q -- "置き場を作れませんでした" && [[ -z "$sent" ]]; then
      print "✓ (e0) 対照＝上げない 複製は 検査を 通り 4/9 で 止まった（何も送っていない）"
    else
      print "✕ (e0) 想定と違う（exit=$rc）"; print -r -- "$out" | tail -8; bad=1
    fi
  fi
  sleep 1
done
rm -rf "$WORK"
[[ $bad -eq 0 ]] && print "== けっか: PASS（6/6） ==" || print "== けっか: FAIL =="
exit $bad
