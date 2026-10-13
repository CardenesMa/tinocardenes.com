# Makes the scores backgrounds transparent, so the music sits on the page's
# paper rather than on a photo of other paper.
#
#   python3 scripts/clear-scores.py [--lo 18] [--hi 110] [--color] [--inc] file…
#
# Each file is looked for in site/scores/ (e.g. wave_full.png, incipits/wave.jpg),
# then from where you ran the script (e.g. ../site/images/promo.jpeg), and gets
# a transparent copy beside it with .inc.png in place of its extension
# (incipits/wave.inc.png): point book.md at that. The original is left alone, so
# you can run it again with other --lo/--hi.
#
# --inc adds every image in site/scores/incipits/ that doesn't have an .inc.png
# yet, so only new ones are done. Name a file to redo it.
#
# Each pixel keeps the page's ink colour and gets an alpha from how much darker it
# is than the paper around it, measured locally so uneven light doesn't show up
# as grey. Darker than the paper by --lo or less: clear. By --hi or more: solid
# ink. Light pencil lands in between, faint.
#
# --color keeps each pixel's own colour instead (for photos, or coloured ink);
# only the alpha is worked out as above.
#
# Needs Pillow: `brew install pillow` (or `pip install pillow` in a venv).

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

# From the repo, so the script runs from any directory.
SCORES = Path(__file__).resolve().parent.parent / 'site' / 'scores'
INCIPITS = SCORES / 'incipits'
IMAGES = ('.png', '.jpg', '.jpeg')
CLEARED = '.inc.png'
INK = (0x1C, 0x1B, 0x19)  # --color-ink in src/styles.css


def paper_level(gray: Image.Image) -> Image.Image:
    """The brightness of the paper under each pixel, with the ink taken out."""
    small = gray.reduce(4)
    # The brightest pixel nearby is paper (staff lines and stems are thinner than this).
    small = small.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
    return small.resize(gray.size, Image.Resampling.BILINEAR)


def cleared(src: Path) -> Path:
    """Where the transparent copy of src goes."""
    return src.with_name(src.stem + CLEARED)


def find(file: Path) -> Path:
    """file in site/scores/ if it's there, otherwise as given."""
    in_scores = SCORES / file
    return in_scores if in_scores.is_file() else file


def clear(src: Path, lo: int, hi: int, color: bool = False) -> Path:
    image = Image.open(src)
    # Anything already transparent counts as white paper.
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGBA')
        white = Image.new('RGBA', image.size, 'white')
        image = Image.alpha_composite(white, image)
    gray = image.convert('L')

    darkness = ImageChops.subtract(paper_level(gray), gray)
    alpha = darkness.point(lambda d: 0 if d <= lo else 255 if d >= hi else round((d - lo) * 255 / (hi - lo)))

    out = image.convert('RGBA') if color else Image.new('RGBA', gray.size, INK + (0,))
    out.putalpha(alpha)
    dest = cleared(src)
    out.save(dest, optimize=True)
    return dest


def main() -> None:
    parser = argparse.ArgumentParser(description='Make the backgrounds of images in site/scores/ transparent.')
    parser.add_argument('files', nargs='*', type=Path, help='images, in site/scores/ or relative to here')
    parser.add_argument('--lo', type=int, default=18, help='this much darker than the paper or less is clear')
    parser.add_argument('--hi', type=int, default=110, help='this much darker or more is solid ink')
    parser.add_argument('--color', action='store_true', help="keep the image's colours instead of using the ink colour")
    parser.add_argument('--inc', action='store_true', help=f'also do every image in {INCIPITS}/ without an {CLEARED}')
    args = parser.parse_args()

    files = list(args.files)
    if args.inc:
        files += sorted(
            f.relative_to(SCORES)
            for f in INCIPITS.iterdir()
            if f.suffix.lower() in IMAGES and not f.name.endswith(CLEARED) and not cleared(f).exists()
        )
        if not files:
            print(f'Every image in {INCIPITS}/ already has an {CLEARED}.')
            return
    if not files:
        parser.error('name some files, or pass --inc')

    for file in files:
        src = find(file)
        if not src.is_file():
            parser.error(f'{file} not found in {SCORES}/ or here')
        if src.name.endswith(CLEARED):
            parser.error(f'{src} is already a cleared copy; name the original instead')
        print(f'{src} → {clear(src, args.lo, args.hi, args.color)}')


if __name__ == '__main__':
    main()
