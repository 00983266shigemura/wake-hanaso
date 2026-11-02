# わけを はなそう ── 手元の置き場に 記録（コミット）する（CCが使う。guard が vault の cwd で git add を止めるため、置き場を -C で名指しする）
#   使い方＝ zsh tools/commit.zsh "件名" ["本文"]
ROOT="${0:A:h:h}"
[[ -n "$1" ]] || { print "✕ 件名が要ります"; exit 1; }
MSG="$1"
[[ -n "$2" ]] && MSG="$1

$2"
MSG="$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
/usr/bin/git -C "$ROOT" add -A || exit 1
/usr/bin/git -C "$ROOT" commit -q -m "$MSG" || { print "✕ 記録できませんでした（変更なし？）"; exit 1; }
/usr/bin/git -C "$ROOT" log --oneline -1
/usr/bin/git -C "$ROOT" status --short | wc -l | tr -d ' ' | sed 's/^/未記録の変更=/'
