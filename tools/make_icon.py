# -*- coding: utf-8 -*-
"""わけを はなそう ── ホーム画面の絵（icon.png）を作る唯一の道具（つよくなるオセロ・ちえの もり と同じ型）。

絵の中身＝だいだいの地に、白い ふきだし（はなす）と、その中の みどりの 木（みのりの 赤い まる 3つ）＝「はなすと きが そだつ」が 一目で分かる。文字は入れない。
大きさ＝180×180。透明を持たない（RGB）＝iOS 10 は透明部分を黒で塗るため。
色は src/template.html と同じ名札（--daidai / --ao / --midori / --aka）。

使い方＝ python3 tools/make_icon.py          ← icon.png を作り直す
         python3 tools/make_icon.py --check  ← 作らずに、今ある icon.png を見るだけ
終了コード＝0（できた）/ 1（できなかった）
"""
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT = os.path.join(REPO, 'icon.png')

SIZE = 180
SS = 8
DAIDAI = (0xf0, 0x93, 0x2b)
SHIRO = (0xff, 0xfd, 0xf7)
SUMI = (0x1b, 0x1b, 0x1b)
MIDORI = (0x3c, 0xb3, 0x71)
HAPPA = (0x8f, 0xd1, 0x6a)
MIKI = (0x8a, 0x5a, 0x2b)
AKA = (0xe6, 0x4a, 0x4a)
AO = (0x1f, 0x77, 0xd0)


def draw():
    n = SIZE * SS
    im = Image.new('RGB', (n, n), DAIDAI)
    d = ImageDraw.Draw(im)
    lw = int(n * 0.014)
    # 白い ふきだし（まるい 角＋左下の しっぽ）
    x0, y0, x1, y1 = n * 0.1, n * 0.12, n * 0.9, n * 0.74
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(n * 0.16), fill=SHIRO, outline=SUMI, width=lw)
    d.polygon([(n * 0.26, y1 - lw), (n * 0.2, n * 0.92), (n * 0.44, y1 - lw)], fill=SHIRO, outline=SUMI)
    d.polygon([(n * 0.27, y1 - lw * 2), (n * 0.22, n * 0.885), (n * 0.42, y1 - lw * 2)], fill=SHIRO)
    d.line([(n * 0.26, y1), (n * 0.2, n * 0.92)], fill=SUMI, width=lw)
    d.line([(n * 0.2, n * 0.92), (n * 0.44, y1)], fill=SUMI, width=lw)
    # 木（みき＋はっぱ 3つ＋みのり 3つ）
    cx, cy = n * 0.5, n * 0.46
    tw = n * 0.07
    d.rectangle([cx - tw / 2, cy, cx + tw / 2, cy + n * 0.22], fill=MIKI, outline=SUMI, width=int(lw * 0.6))
    for (ox, oy, r) in ((-0.15, -0.04, 0.13), (0.15, -0.04, 0.13), (0.0, -0.16, 0.15)):
        d.ellipse([cx + ox * n - r * n, cy + oy * n - r * n, cx + ox * n + r * n, cy + oy * n + r * n], fill=HAPPA, outline=SUMI, width=int(lw * 0.7))
    for (ox, oy) in ((-0.17, -0.02), (0.14, -0.08), (0.02, -0.2)):
        rr = n * 0.035
        d.ellipse([cx + ox * n - rr, cy + oy * n - rr, cx + ox * n + rr, cy + oy * n + rr], fill=AKA, outline=SUMI, width=int(lw * 0.5))
    # 右上に 青い まる（こたえの しるし）
    rr = n * 0.05
    d.ellipse([n * 0.76 - rr, n * 0.22 - rr, n * 0.76 + rr, n * 0.22 + rr], outline=AO, width=int(n * 0.022))
    return im.resize((SIZE, SIZE), Image.LANCZOS)


def look(path):
    if not os.path.exists(path):
        return '絵がありません＝' + path
    try:
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            if im.size != (SIZE, SIZE):
                return '大きさが %s＝%d×%d でなければなりません' % (im.size, SIZE, SIZE)
            if im.mode != 'RGB':
                return '色の持ち方が %s＝RGB（透明なし）でなければなりません' % im.mode
    except Exception as e:
        return 'こわれています＝' + str(e)
    return ''


def main():
    if '--check' in sys.argv:
        bad = look(OUT)
        if bad:
            sys.exit('✕ ' + bad)
        print('✓ %s ＝ %d×%d・透明なし・こわれていない（%d バイト）' % (OUT, SIZE, SIZE, os.path.getsize(OUT)))
        return
    im = draw()
    im.save(OUT, 'PNG', optimize=True)
    bad = look(OUT)
    if bad:
        sys.exit('書きましたが確かめに落ちました＝' + bad)
    print('できました ＝ %s（%d×%d・%d バイト）' % (OUT, SIZE, SIZE, os.path.getsize(OUT)))


if __name__ == '__main__':
    main()
