# tinocardenes.com

The site is a single page laid out as a printed score: a cover, a table of
contents, then two-page spreads you turn like a book. Built with
[Astro](https://astro.build) as a static site; Vercel deploys it with no
configuration.

## Running locally

Requires Node 22.12 or newer.

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output in dist/
pnpm check      # type-check
```

## Editing content

All content is Markdown with typed frontmatter (schemas in
`src/content.config.ts`). A typo in a field name or a missing image fails the
build with a message pointing at the file.

| What | Where |
| --- | --- |
| Name, email, socials, cover text | `src/site.ts` |
| Preface, Biography, SonicScore | `src/content/sections/*.md` |
| Works catalogue entries | `src/content/works/*.md` (sorted by `order`) |
| Recordings (one spread each) | `src/content/recordings/*.md` (sorted by `order`) |
| Order of the book | `OUTLINE` in `src/lib/book.ts` |
| Downloadable PDFs and photo | `public/` |

Page numbers and the table of contents are computed from the outline, so they
update on their own.

### Adding a recording

Create `src/content/recordings/<slug>.md`:

```md
---
title: Body and Soul
attribution: Johnny Green        # printed top right, like a composer credit
subtitle: Live at the Vlahakis   # optional, italic under the title
marking: Ballad                  # optional, tempo marking top left
order: 9                         # position among the recordings
youtubeId: dQw4w9WgXcQ           # the 11 characters after watch?v=
aspect: 16/9                     # 16/9, 4/3, or 1/1
leadSheet: ../../assets/scores/body-and-soul.png   # optional
---

A sentence or two of notes about the recording.
```

The slug becomes its link: `tinocardenes.com/#body-and-soul`.

### Lead sheets and score images

Put PNGs in `src/assets/scores/` and point to them with `leadSheet:` (recordings)
or `plate:` (sections). Without one, a placeholder page is shown. White
backgrounds blend into the paper colour automatically, and images are resized
and converted to WebP at build time, so full-resolution scans are fine.

## How it works

- `src/lib/book.ts` builds the list of spreads and numbers the pages.
- `src/pages/index.astro` renders every spread into one HTML page, so all text
  is crawlable and the site still reads top-to-bottom with JavaScript off.
- `src/scripts/reader.ts` shows one spread at a time and handles links, arrow
  keys, swipes, browser history, and the page-turn animation.
- The ribbon bookmark (and the <kbd>C</kbd> key) always returns to the contents.
- Old URLs (`/projects`, `/media`, `/sonicscore`) redirect via `vercel.json`.
