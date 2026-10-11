# tinocardenes.com
Alas this version of the website is a massive overhaul and greatly benefited from the recent advances of Anthropic. 
The PDF rendering scheme is inspired by Brian McFee's DSP book, and from my work with CMU's 15-322/622 class. 

The site is one Markdown file, [`site/book.md`](site/book.md), shown as a bound
music score: an Urtext-style cover, a table of contents, and two-page spreads
you turn like a book.

```
site/              everything Vercel serves
  index.html       the page shell: <head> metadata, toolbar, book container,
                   and the <template>s each part of a page is built from
  styles.css       compiled from src/styles.css (not committed)
  book.md          all the content
  images/ scores/  pictures and lead sheets (plus PDFs, …)
  favicon/         browser and home-screen icons, and site.webmanifest
                   (favicon.ico itself sits at the root of site/)
  js/              compiled from src/ (not committed)
src/               TypeScript, compiled into site/js/
  markdown.ts      a small Markdown + directive parser
  book.ts          the directive table, and splitting book.md into pages
  render.ts        fills index.html's templates with book.md's content
  layout.ts        flows text that doesn't fit onto more pages, adds blank
                   pages, and numbers them
  reader.ts        connects StPageFlip to links, keys, the URL and the toolbar
  page-flip.d.ts   types for the parts of StPageFlip we use
  main.ts          loads book.md and puts it together
  styles.css       Tailwind setup (colours, fonts), named classes for the
                   pages and anything that recurs, and book.md's own Markdown
scripts/
  dev.mjs          local server
  check-book.mjs   build-time check of book.md
```

The only dependencies are TypeScript and Tailwind CSS (its CLI, v4). Page turning (the animation, dragging a
corner, swiping, one page at a time on phones) is done by
[StPageFlip](https://github.com/Nodlik/StPageFlip), loaded from jsDelivr through
the import map in `index.html`. Pages are a fixed size and never scroll: text
that doesn't fit continues on the next page, split between lines. How much fits
depends on the window, so the pages are laid out again when it's resized.

```sh
pnpm install
pnpm dev      # http://localhost:4321; recompiles TS and CSS on save, refresh to see changes
pnpm build    # compiles TS and CSS, then checks book.md
```

Vercel runs `pnpm build` and serves `site/`. The build fails, naming the line,
if `book.md` uses an unknown directive, misses a required attribute, or points
to a file that isn't in `site/`.

Styling is split two ways. One-off layout and type (a margin, a font, a size)
is Tailwind classes on the templates in `index.html`. Anything that recurs, or
that changes with the kind of page, is a named class in `src/styles.css`:
`.page` and its kinds (`.page--cover`, `.page--blank`, …), `.tool` (toolbar
buttons), `.staff` and `.clef`, `.text-link`, `.plate`, `.video`, … That file
also sets the site's colours (`bg-paper`, `text-ink-soft`, …) and fonts
(`font-display`, `font-caps`, …), and styles the Markdown from `book.md` (plain
`<p>`, `<ul>`, `<em>`). There's no Tailwind Preflight, so elements keep the
browser's default styles.

Page titles, descriptions, and social-preview tags live in `index.html`. So
does `data-plate`, the plate number printed at the foot of every page.

## How Markdown becomes pages

| You write | You get |
| --- | --- |
| `# Title` | A new spread. The title opens a left-hand page, set like the head of a score. A blank manuscript page fills the gap if needed. |
| `## Title` at the top of a page | A titled page that doesn't start a new spread (e.g. the Preface facing the Contents). Elsewhere it's a subheading. |
| `::pagebreak` | Continue on the next page. |
| `::score` or `::plate{fill}` | Fills a page; after a section's text it lands on the facing page (unless the text ran onto a second page). A `::plate{fill}` straight after a page title shares that page instead. |
| Anything else | Flows onto the current page, and on to the next when the page is full. |

Page titles take attributes in braces:

```md
# Wave {subtitle="with the Tartan Quartet"}
```

`subtitle` sits under the title. `id` sets the link (`/#id`; defaults to the title).
`toc=false` leaves the page out of the contents.

Supported Markdown: headings, paragraphs, `-` lists, `---` rules, `*em*`,
`**strong**`, `[links](url)`, line breaks with a trailing `\`, entities like
`&nbsp;`, and `<!-- comments -->`. Quotes and dashes are typeset automatically.

## Directives

`:inline`, `::block`, `:::container … :::`. Quote values containing spaces or `=`.

| Directive | Purpose |
| --- | --- |
| `:::cover{name label publisher number}` … `:::` | Front cover, laid out like an Urtext edition. `name` large across the top, `label` in the left column, the body in the right column (first paragraph as the title, `---` for rules), `publisher` and `number` at the foot. Must come first. |
| `:::back` … `:::` | Back cover, alone on a left-hand page. Its body is centred; whatever follows a `---` goes at the foot, under a rule. |
| `::pagebreak` | Continue on the next page. |
| `::part[Recordings]` | Group the following titles. The contents lists the group as one line. |
| `::score{src}` | Full-page score or lead sheet (placeholder if no `src`). Optional `alt`, `caption`. |
| `::plate{src kind fill}` | A photo (`kind=portrait`, framed) or illustration (`kind=figure`, the default) in the text. With `fill`, it fills the rest of the page, centred and shrunk to fit. Optional `alt`, `caption`, `width` (e.g. `40%`). |
| `::contents` | The contents: every title outside a `::part`, each part once, and the back cover. |
| `:::incipits` … `:::` | A thematic index, one `::incipit` per line (below): number, title centred over the first line of music, page number. |
| `::incipit{to src}` | A line of `:::incipits`, linking to the page title with id `to`. `src` is the image of the first line of music (an empty staff without it). The title and composer come from that page; `::incipit[Title]{to composer}` overrides them. |
| `::youtube{id aspect}` | Click-to-play video. `aspect` is `16/9` (default), `4/3`, or `1/1`. |
| `:::work{title role year href label src}` … `:::` | A numbered catalogue entry, on a page of its own (the first shares the page with a title just before it). `src` is a picture filling the middle of the page, with `kind`, `alt` and `width` as on `::plate`; the body is its description; `href` and `label` make the link at the foot. |
| `:::links` … `:::` | A list of links set in a row at the foot of the page. |
| `::signature[…]` | A right-aligned sign-off. |
| `::continued[Works]` | The running head "Works (continued)". |
| `:download[label]{href}` | A link that downloads the file. |
| `:sc[text]` | Small capitals. |
| `:pageref{to}` | "p. 4", linked; with a label, "Biography, p. 4". |

### Adding a recording

```md
# Body and Soul {composer="Johnny Green"}

::youtube{id=XXXXXXXXXXX}

A sentence or two about the recording.

::score{src="/scores/body-and-soul.png"}
```

and, if it belongs in the thematic index, a line in `:::incipits`:

```md
::incipit{to=body-and-soul src=/scores/incipits/body-and-soul.png}
```

Incipit images are clipped to a 10:1 strip, anchored at the left edge, so
export one line of music at about that shape (say 2000 × 200 px) on a white or
transparent background. Anything taller is cropped top and bottom; anything
wider is cropped on the right.

### Adding a directive

Add its name and rules to `DIRECTIVES` in `src/book.ts`, its markup as a
`<template data-template="name">` in `index.html`, and a line to `BLOCKS` or
`INLINES` in `src/render.ts` that fills the template. In a template, `{{key}}`
is replaced by text, `<slot name="key">` by content from book.md, and
`data-if="key"` drops the element when `key` is empty (see the comment above
the templates).
