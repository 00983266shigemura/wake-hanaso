# -*- coding: utf-8 -*-
"""わけを はなそう ── index.html と offline.appcache を組み立てる唯一の道具。

src/template.html の <!--CORE_JS--> に src/core.js、<!--GEN_JS--> に src/gen.js、<!--UI_JS--> に src/ui.js を埋め込み、
index.html に書く。あわせて version.txt と core.js の APP_VERSION が一致するかを見て、
offline.appcache（端末にしまうファイルの一覧）を md5 入りで書き直す
（中身が変わるたびに一覧も変わる＝古い版が端末に残り続けない）。

使い方＝ python3 tools/build_app.py        終了コード 0=できた / 1=できなかった
"""
import hashlib
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PARTS = [('<!--CORE_JS-->', 'core.js'), ('<!--GEN_JS-->', 'gen.js'), ('<!--UI_JS-->', 'ui.js')]


def read(p):
    return io.open(p, encoding='utf-8').read()


def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()


def main():
    srcs = dict((name, read(os.path.join(ROOT, 'src', name))) for _, name in PARTS)
    tpl = read(os.path.join(ROOT, 'src', 'template.html'))
    m = re.search(r'^\s*WH\.APP_VERSION = (\d+);', srcs['core.js'], re.M)
    if not m:
        sys.exit('✕ src/core.js に APP_VERSION の行がありません')
    ver = int(m.group(1))
    vp = os.path.join(ROOT, 'version.txt')
    if not os.path.exists(vp):
        sys.exit('✕ version.txt がありません')
    raw = read(vp).strip()
    if not re.match(r'^\d+$', raw) or int(raw) != ver:
        sys.exit('✕ version.txt（%s）と APP_VERSION（%d）が一致しません' % (raw, ver))
    html = tpl
    for mark, name in PARTS:
        if '</script' in srcs[name]:
            sys.exit('✕ %s の中に </script が含まれています（埋め込むと壊れる）' % name)
        if tpl.count(mark) != 1:
            sys.exit('✕ template.html の埋め込み印 %s が1つではありません' % mark)
        html = html.replace(mark, srcs[name].rstrip('\n'))
    # ずかんの 絵が あるのに 大人の画面から 見る入口が 無ければ 止める（K20）
    if 'img/zukan/' in srcs['core.js'] and 'grown-zukan-all' not in tpl:
        sys.exit('✕ ずかんの絵があるのに、おとなのひと の画面に「ずかんの絵を全部見る」の入口がありません（K20）')
    out = os.path.join(ROOT, 'index.html')
    with io.open(out, 'w', encoding='utf-8', newline='\n') as fp:
        fp.write(html)
    icon = os.path.join(ROOT, 'icon.png')
    if not os.path.exists(icon):
        sys.exit('✕ icon.png がありません（python3 tools/make_icon.py で作る）')
    imgdir = os.path.join(ROOT, 'img')
    imgs = sorted(f for f in os.listdir(imgdir) if f.endswith('.png')) if os.path.isdir(imgdir) else []
    # 絵は 66枚（core.js の ITEMS と同じ数）
    n_items = srcs['core.js'].split('var ITEMS = [')[1].split('];')[0].count("{ id: '") if 'var ITEMS = [' in srcs['core.js'] else 0
    if len(imgs) != 66 or n_items != 66:
        sys.exit('✕ img/ の絵が 66枚ではありません（絵 %d枚・一覧 %d件）' % (len(imgs), n_items))
    zdir = os.path.join(ROOT, 'img', 'zukan')
    zimgs = sorted('zukan/' + f for f in os.listdir(zdir) if f.endswith('.png')) if os.path.isdir(zdir) else []
    n_z = len(re.findall(r"\['[a-z_]+', '[^']+'\]", srcs['core.js'].split('var ZUKAN_IMGS')[1].split('];')[0])) if 'var ZUKAN_IMGS' in srcs['core.js'] else 0
    if len(zimgs) != n_z:
        sys.exit('✕ img/zukan/ の絵（%d枚）と core.js の ZUKAN_IMGS（%d）が合いません' % (len(zimgs), n_z))
    imgs = imgs + zimgs
    manifest = (
        'CACHE MANIFEST\n'
        '# わけを はなそう はんすう %d\n'
        '# index.html md5 %s\n'
        '# icon.png md5 %s\n'
        '# img %d files md5 %s\n'
        '\nCACHE:\n./\nindex.html\nicon.png\n%s\n\nNETWORK:\n*\n'
    ) % (ver, md5(out), md5(icon), len(imgs), hashlib.md5(''.join(md5(os.path.join(imgdir, f)) for f in imgs).encode('utf-8')).hexdigest(), '\n'.join('img/' + f for f in imgs))
    with io.open(os.path.join(ROOT, 'offline.appcache'), 'w', encoding='utf-8', newline='\n') as fp:
        fp.write(manifest)
    print('できました ＝ index.html（%d バイト・はんすう %d・md5 %s）・offline.appcache' % (os.path.getsize(out), ver, md5(out)))


if __name__ == '__main__':
    main()
