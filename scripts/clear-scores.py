# Makes the scores backgrounds transparent, so the music sits on the page's
# paper rather than on a photo of other paper.
#
#   python3 scripts/clear-scores.py [--lo 18] [--hi 110] file…
#
# Each file is relative to site/scores/ (e.g. wave_full.png, incipits/wave.png)
# and is replaced by a transparent .png of the same name: a .png is overwritten,
# a .jpg gets a .png beside it (point book.md at that). Keep the originals
# somewhere else if you may want to run it again with other --lo/--hi.
#
# Each pixel keeps the page's ink colour and gets an alpha from how much darker it
# is than the paper around it, measured locally so uneven light doesn't show up
# as grey. Darker than the paper by --lo or less: clear. By --hi or more: solid
# ink. Light pencil lands in between, faint.
#
# Needs Pillow: `brew install pillow` (or `pip install pillow` in a venv).

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

SCORES = Path('site/scores')
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
    dest = src.with_suffix('.png')
    out.save(dest, optimize=True)
    return dest


def main() -> None:
    parser = argparse.ArgumentParser(description='Make the backgrounds of images in site/scores/ transparent.')
    parser.add_argument('files', nargs='+', type=Path, help=f'images, relative to {SCORES}/')
    parser.add_argument('--lo', type=int, default=18, help='this much darker than the paper or less is clear')
    parser.add_argument('--hi', type=int, default=110, help='this much darker or more is solid ink')
    args = parser.parse_args()

    for file in args.files:
        src = SCORES / file
        if not src.is_file():
            parser.error(f'{src} not found')
        print(f'{src} → {clear(src, args.lo, args.hi)}')


if __name__ == '__main__':
    main()
