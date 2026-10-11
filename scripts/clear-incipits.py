# Makes the incipits' backgrounds transparent, so the music sits on the page's
# paper rather than on a photo of other paper.
#
#   python3 scripts/clear-incipits.py [--lo 18] [--hi 110] [files…]
#
# Reads the originals in design/incipits/ (any image Pillow opens: .png, .jpg, …)
# and writes site/scores/incipits/<name>.png. Re-run it with other --lo/--hi to
# taste; the originals are never touched.
#
# Each pixel keeps the page's ink colour and gets an alpha from how much darker it
# is than the paper around it. The paper's own level is measured locally, so
# uneven light across a photo (a shadow at one end) doesn't show up as grey.
# Darker than the paper by --lo or less: clear. By --hi or more: solid ink.
# Light pencil lands in between, faint.
#
# Needs Pillow: `brew install pillow` (or `pip install pillow` in a venv).

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ORIGINALS = Path('design/incipits')
OUT = Path('site/scores/incipits')
INK = (0x1C, 0x1B, 0x19)  # --color-ink in src/styles.css


def paper_level(gray: Image.Image) -> Image.Image:
    """The brightness of the paper under each pixel, with the ink taken out."""
    small = gray.reduce(4)
    # The brightest pixel nearby is paper (staff lines and stems are thinner than this).
    small = small.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    return small.resize(gray.size, Image.Resampling.BILINEAR)


def clear(src: Path, lo: int, hi: int) -> Path:
    image = Image.open(src)
    # Anything already transparent counts as white paper.
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGBA')
        white = Image.new('RGBA', image.size, 'white')
        image = Image.alpha_composite(white, image)
    gray = image.convert('L')

    darkness = ImageChops.subtract(paper_level(gray), gray)
    alpha = darkness.point(lambda d: 0 if d <= lo else 255 if d >= hi else round((d - lo) * 255 / (hi - lo)))

    out = Image.new('RGBA', gray.size, INK + (0,))
    out.putalpha(alpha)
    dest = OUT / f'{src.stem}.png'
    out.save(dest, optimize=True)
    return dest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='*', type=Path, help=f'default: everything in {ORIGINALS}/')
    parser.add_argument('--lo', type=int, default=18, help='this much darker than the paper or less is clear')
    parser.add_argument('--hi', type=int, default=110, help='this much darker or more is solid ink')
    args = parser.parse_args()

    files = args.files or sorted(p for p in ORIGINALS.iterdir() if not p.name.startswith('.'))
    OUT.mkdir(parents=True, exist_ok=True)
    for src in files:
        print(f'{src} → {clear(src, args.lo, args.hi)}')


if __name__ == '__main__':
    main()
