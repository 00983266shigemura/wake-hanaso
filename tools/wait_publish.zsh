# わけを はなそう ── しげが push.zsh を実行し終わるのを待ち、ログの END 行と本番の照合値を出す（CCが背景で使う）
#   使い方＝ zsh tools/wait_publish.zsh [待つ秒数（既定1800）]
D="/Users/shigemurasatoshi/dev/wake-hanaso/logs"
LIMIT="${1:-1800}"
PAGES_URL="https://00983266shigemura.github.io/wake-hanaso/"
n0=$(ls "$D" 2>/dev/null | grep -c '^run_wake_.*\.log$')
t=0
while [ "$t" -lt "$LIMIT" ]; do
  n=$(ls "$D" 2>/dev/null | grep -c '^run_wake_.*\.log$')
  if [ "$n" -gt "$n0" ]; then
    f="$D/$(ls -t "$D" | grep '^run_wake_.*\.log$' | head -1)"
    if grep -q '^END run_id=' "$f"; then
      print "LOG=$f"
      grep '^END run_id=' "$f"
      grep -E '^(✓|✕)' "$f" | tail -12
      LOCAL=$(/sbin/md5 -q /Users/shigemurasatoshi/dev/wake-hanaso/index.html)
      LIVE=$(/usr/bin/curl -s -f "${PAGES_URL}index.html?cc=$(date +%s)" | /sbin/md5 -q)
      print "LOCAL_MD5=$LOCAL"
      print "LIVE_MD5=$LIVE"
      [ "$LOCAL" = "$LIVE" ] && print "LIVE_MATCH=yes" || print "LIVE_MATCH=no"
      # 全ファイル＝offline.appcache の CACHE 一覧（./ を除く）＋offline.appcache・version.txt を 本番と 照合（絵が1枚でも遅れると 通信なしで 開けなくなる）
      R=/Users/shigemurasatoshi/dev/wake-hanaso
      okn=0; ngn=0; ngl=""
      for f in $(sed -n '/^CACHE:/,/^NETWORK:/p' "$R/offline.appcache" | grep -v '^CACHE:\|^NETWORK:\|^\./\|^$') offline.appcache version.txt; do
        lm=$(/sbin/md5 -q "$R/$f" 2>/dev/null); vm=$(/usr/bin/curl -s -f "${PAGES_URL}${f}?cc=$(date +%s)" | /sbin/md5 -q)
        if [ -n "$lm" ] && [ "$lm" = "$vm" ]; then okn=$((okn + 1)); else ngn=$((ngn + 1)); ngl="$ngl $f"; fi
      done
      print "ALL_FILES ok=$okn ng=$ngn$ngl"
      exit 0
    fi
  fi
  sleep 5
  t=$((t + 5))
done
print "TIMEOUT_NO_RUN"
exit 1
