# tinocardenes.com
Alas this version of the website is a massive overhaul and greatly benefited from the recent advances of Anthropic. 
The PDF rendering scheme is inspired by Brian McFee's DSP book, and from my work with CMU's 15-322/622 class. 

The site is one Markdown file, [`site/book.md`](site/book.md), shown as a bound
music score: an Urtext-style cover, a table of contents, and two-page spreads
you turn like a book.

```
site/              everything Vercel serves
  index.html       the page shell: <head> metadata, toolbar, book container,
                   and the <template>s each part of a page is built from,
                   styled with Tailwind classes
  styles.css       compiled from src/styles.css (not committed)
  book.md          all the content
  images/ scores/  pictures and lead sheets (plus PDFs, favicon, …)
  js/              compiled from src/ (not committed)
src/               TypeScript, compiled into site/js/
  markdown.ts      a small Markdown + directive parser
  book.ts          the directive table and pagination
  render.ts        fills index.html's templates with book.md's content
  reader.ts        connects StPageFlip to links, keys, the URL and the toolbar
  page-flip.d.ts   types for the parts of StPageFlip we use
  main.ts          loads book.md and puts it together
  styles.css       Tailwind setup: theme colours and fonts, page variants,
                   drawn details, and styles for book.md's own Markdown
scripts/
  dev.mjs          local server
  check-book.mjs   build-time check of book.md
```

The only dependencies are TypeScript and Tailwind CSS (its CLI, v4). Page turning (the animation, dragging a
corner, swiping, one page at a time on phones) is done by
[StPageFlip](https://github.com/Nodlik/StPageFlip), loaded from jsDelivr through
the import map in `index.html`. Pages are a fixed size, so text that doesn't
fit scrolls within its page.

```sh
pnpm install
pnpm dev      # http://localhost:4321; recompiles TS and CSS on save, refresh to see changes
pnpm build    # compiles TS and CSS, then checks book.md
```

Vercel runs `pnpm build` and serves `site/`. The build fails, naming the line,
if `book.md` uses an unknown directive, misses a required attribute, or points
to a file that isn't in `site/`.

Styling is Tailwind classes on the elements in `index.html`, mostly on the
templates. `src/styles.css` adds the site's colours (`bg-paper`, `text-ink-soft`,
…) and fonts (`font-display`, `font-caps`, …), variants for styling by page
(`cover-page:`, `left-page:`, …), and the CSS that can't be inline: Markdown
from `book.md` (plain `<p>`, `<ul>`, `<em>`) and drawn details like the staff.
There's no Tailwind Preflight, so elements keep the browser's default styles.

Page titles, descriptions, and social-preview tags live in `index.html`. So
does `data-plate`, the plate number printed at the foot of every page.

## How Markdown becomes pages

| You write | You get |
| --- | --- |
| `# Title` | A new spread. The title opens a left-hand page, set like the head of a score. A blank manuscript page fills the gap if needed. |
| `## Title` at the top of a page | A titled page that doesn't start a new spread (e.g. the Preface facing the Contents). Elsewhere it's a subheading. |
| `::pagebreak` | Continue on the next page. |
| `::score` or `::plate` | A page of its own; after a section's text it lands on the facing page. |
| Anything else | Flows onto the current page. |

Page titles take attributes in braces:

```md
# Wave {composer="Antônio Carlos Jobim" subtitle="with the Tartan Quartet" marking="Bossa nova"}
```

`subtitle` sits under the title, `marking` top left, `composer` top right (and
in the contents). `id` sets the link (`/#id`; defaults to the title).
`toc=false` leaves the page out of the contents.

Supported Markdown: headings, paragraphs, `-` lists, `---` rules, `*em*`,
`**strong**`, `[links](url)`, line breaks with a trailing `\`, entities like
`&nbsp;`, and `<!-- comments -->`. Quotes and dashes are typeset automatically.

## Directives

`:inline`, `::block`, `:::container … :::`. Quote values containing spaces or `=`.

| Directive | Purpose |
| --- | --- |
| `:::cover{name label publisher number}` … `:::` | Front cover, laid out like an Urtext edition. `name` large across the top, `label` in the left column, the body in the right column (first paragraph as the title, `---` for rules), `publisher` and `number` at the foot. Must come first. |
| `:::back` … `:::` | Back cover, alone on a left-hand page. |
| `::pagebreak` | Continue on the next page. |
| `::part[Recordings]` | Group the following titles under a heading in the contents. |
| `::score{src}` | Full-page score or lead sheet (placeholder if no `src`). Optional `alt`, `caption`. |
| `::plate{src kind}` | Full-page photo (`kind=portrait`, framed) or illustration (`kind=figure`). Optional `alt`, `caption`. |
| `::contents` | The table of contents.
| `::youtube{id aspect}` | Click-to-play video. `aspect` is `16/9` (default), `4/3`, or `1/1`. |
| `::figure{src caption width}` | An image within the text. |
| `:::work{title role year href label}` … `:::` | A numbered catalogue entry; the body is its description. |
| `:::links` … `:::` | A list of links set in a row at the foot of the page. |
| `::staff[Con spirito]` | A short staff with a clef and optional tempo marking. |
| `::signature[…]` | A right-aligned sign-off. |
| `::continued[Works]` | The running head "Works (continued)". |
| `:download[label]{href}` | A link that downloads the file. |
| `:sc[text]` | Small capitals. |
| `:pageref{to}` | "p. 4", linked; with a label, "Biography, p. 4". |

### Adding a recording

```md
# Body and Soul {composer="Johnny Green" marking="Ballad"}

::youtube{id=XXXXXXXXXXX}

A sentence or two about the recording.

::score{src="/scores/body-and-soul.png"}
```

### Adding a directive

Add its name and rules to `DIRECTIVES` in `src/book.ts`, its markup as a
`<template data-template="name">` in `index.html`, and a line to `BLOCKS` or
`INLINES` in `src/render.ts` that fills the template. In a template, `{{key}}`
is replaced by text, `<slot name="key">` by content from book.md, and
`data-if="key"` drops the element when `key` is empty (see the comment above
the templates).
