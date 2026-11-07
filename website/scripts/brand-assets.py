#!/usr/bin/env python3
"""Brand assets from the sticker thumbnail (DESIGN-REFERENCE §13).

Produces, under public/:
  assets/brand/sticker-mark.png      the IT'S DEEPER THAN CODE sticker, 900px wide, transparent background
  assets/brand/sticker-mark@2x.webp  same, 1800px wide
  apple-touch-icon.png               180px green disc with the sticker centred
  assets/og-image.jpg                1200x630 Open Graph card
Source: ~/Documents/Deeper Than Code Thumbnail Template.png (override with DTC_THUMB). Falls back to the
podcast cover in bigpoppacode.io if the template is missing.
"""
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
PUB = os.path.join(WEB, 'public')
BRAND = os.path.join(PUB, 'assets', 'brand')
FONTS = os.path.join(PUB, 'assets', 'fonts')
os.makedirs(BRAND, exist_ok=True)

CANDIDATES = [
    os.environ.get('DTC_THUMB', ''),
    os.path.expanduser('~/Documents/Deeper Than Code Thumbnail Template.png'),
    os.path.join(WEB, '..', '..', '..', 'bigpoppacode.io', 'public', 'images', 'deeper_than_code_podcast.png'),
]
SRC = next((p for p in CANDIDATES if p and os.path.exists(p)), None)
if not SRC:
    sys.exit('brand-assets: no thumbnail found')

BG = (8, 8, 10)
GREEN = (0, 168, 104)
GREEN_DEEP = (0, 120, 56)
RED = (240, 48, 56)
YELLOW = (232, 216, 0)
HEADING = (245, 242, 238)
MUTED = (138, 138, 148)


def near(p, q, t):
    return all(abs(a - b) < t for a, b in zip(p[:3], q))


def cut_sticker(src):
    im = Image.open(src).convert('RGB')
    W, H = im.size
    # The sticker lives in the left half, below the title banner.
    region = im.crop((0, int(H * 0.19), int(W * 0.53), int(H * 0.82)))
    px = region.load()
    w, h = region.size
    disc = (0, 126, 62)
    out = Image.new('RGBA', region.size, (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if near(p, (0, 0, 0), 14):
                continue  # page background
            if x > w * 0.72 and near(p, disc, 28):
                continue  # the thumbnail's green disc intruding from the right
            op[x, y] = (p[0], p[1], p[2], 255)
    # Keep only the largest connected opaque component (the sticker blob); drops disc-edge slivers.
    ap = out.load()
    seen = bytearray(w * h)
    best = None
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx] or not ap[sx, sy][3]:
                continue
            stack = [(sx, sy)]
            seen[sy * w + sx] = 1
            comp = []
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and ap[nx, ny][3]:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if best is None or len(comp) > len(best):
                best = comp
    keep = Image.new('L', (w, h), 0)
    kp = keep.load()
    for x, y in best:
        kp[x, y] = 255
    out.putalpha(keep)
    out = out.crop(out.getbbox())
    return out


def save_sticker(st):
    ratio = st.height / st.width
    s900 = st.resize((900, int(900 * ratio)), Image.LANCZOS)
    s900.save(os.path.join(BRAND, 'sticker-mark.png'), optimize=True)
    s1800 = st.resize((1800, int(1800 * ratio)), Image.LANCZOS)
    s1800.save(os.path.join(BRAND, 'sticker-mark@2x.webp'), quality=88, method=6)
    return s900


def disc_with_sticker(size, sticker, scale=0.78, rotate=-6):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((0, 0, size - 1, size - 1), fill=GREEN_DEEP + (255,))
    st = sticker.copy()
    tw = int(size * scale)
    st = st.resize((tw, int(tw * st.height / st.width)), Image.LANCZOS)
    st = st.rotate(rotate, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(st, ((size - st.width) // 2 - size // 40, (size - st.height) // 2 + size // 40))
    return img


def dotgrid(draw, x0, y0, w, h, step=22, r=1, cx=None, cy=None, fade=None):
    cx = cx if cx is not None else x0 + w / 2
    cy = cy if cy is not None else y0 + h / 2
    fade = fade or max(w, h) / 2
    for y in range(y0, y0 + h, step):
        for x in range(x0, x0 + w, step):
            dist = math.hypot(x - cx, y - cy)
            a = max(0.0, 1 - dist / fade)
            if a <= 0:
                continue
            v = int(8 + 60 * a)
            draw.ellipse((x - r, y - r, x + r, y + r), fill=(v + 8, v + 8, v + 10))


def font(name, size):
    p = os.path.join(FONTS, name)
    try:
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()


def og_image(sticker, pages):
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    dotgrid(d, 760, -40, 520, 420, cx=1100, cy=120, fade=330)
    # green lift behind the disc
    lift = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lift)
    for i in range(40, 0, -1):
        a = int(90 * (1 - i / 40) ** 2)
        rr = 180 + i * 6
        ld.ellipse((900 - rr, 315 - rr, 900 + rr, 315 + rr), fill=(0, 120, 56, a))
    img.paste(Image.alpha_composite(img.convert('RGBA'), lift).convert('RGB'))
    d = ImageDraw.Draw(img)
    # sticker left (the wordmark) 520px wide
    st = sticker.resize((520, int(520 * sticker.height / sticker.width)), Image.LANCZOS)
    img.paste(st, (72, (H - st.height) // 2 - 30), st)
    # signature + tagline
    f_sig = font('dm-sans-italic.woff2', 26) if os.path.exists(os.path.join(FONTS, 'dm-sans-italic.woff2')) else font('dm-sans.ttf', 26)
    try:
        f_sig = ImageFont.truetype(os.path.join(FONTS, 'dm-sans.ttf'), 26)
    except Exception:
        pass
    f_mono = font('jetbrains-mono-400.ttf', 18)
    d.line((72, 528, 120, 528), fill=RED, width=1)
    d.text((132, 514), '— the guide, by Big Poppa Code', font=f_sig, fill=RED)
    d.text((72, 566), f'THE GUIDE · {pages} PAGES · ALGORITHMS · DATA STRUCTURES · LANGUAGES · SYSTEMS', font=f_mono, fill=MUTED)
    # disc right
    disc = disc_with_sticker(360, sticker)
    img.paste(disc, (720, 135), disc)
    img.save(os.path.join(PUB, 'assets', 'og-image.jpg'), quality=88, optimize=True, progressive=True)


def apple_icon(sticker):
    disc = disc_with_sticker(180, sticker, scale=0.84, rotate=-6)
    base = Image.new('RGBA', (180, 180), BG + (255,))
    base.alpha_composite(disc)
    base.convert('RGB').save(os.path.join(PUB, 'apple-touch-icon.png'), optimize=True)


if __name__ == '__main__':
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 226
    sticker = cut_sticker(SRC)
    s900 = save_sticker(sticker)
    apple_icon(s900)
    og_image(s900, pages)
    print('brand-assets: ok', s900.size, 'from', SRC)
