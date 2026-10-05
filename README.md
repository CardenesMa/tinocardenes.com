# tinocardenes.com

The whole site is one Markdown file, [`content/book.md`](content/book.md),
rendered as a bound music score: a cover, a table of contents, and two-page
spreads you turn like a book.

```sh
pnpm install
pnpm dev      # http://localhost:4321, rebuilds and reloads on save
pnpm build    # writes the static site to dist/
pnpm check    # type-check the build code
```

Vercel runs `pnpm build` and serves `dist/` (see `vercel.json`). Files in
`public/` are copied as-is and referenced by absolute path, e.g.
`/images/portrait.jpg`.

## How Markdown becomes pages

| You write | You get |
| --- | --- |
| `# Title` | A new spread. The title opens a left-hand page, set like the head of a score (title, staff, folio). A blank manuscript page fills the gap if the previous page was a left page. |
| `## Title` at the top of a page | A titled page that doesn't force a new spread (e.g. the Preface facing the Contents). Elsewhere `##` is an ordinary subheading. |
| `::pagebreak` | Continue on the next page. |
| `::score` or `::plate` | A page of its own. Put one after a section's text to fill the facing page. |
| Anything else | Flows onto the current page. Long text makes the page taller. |

Every page title appears in the contents with its page number unless you add
`toc=false`.

### Heading attributes

Add attributes in braces at the end of a page title:

```md
# Wave {composer="Antônio Carlos Jobim" subtitle="with the Tartan Quartet" marking="Bossa nova"}
```

| Attribute | Effect |
| --- | --- |
| `subtitle` | Italic line under the title |
| `marking` | Tempo marking, top left above the staff |
| `composer` | Attribution, top right above the staff; also shown in the contents |
| `id` | The page's link (`/#id`); defaults to the title, slugified |
| `toc=false` | Leave this page out of the contents |

## Directives

Syntax follows the [generic directives proposal](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444):
`:inline`, `::block`, `:::container … :::`. Quote attribute values containing
spaces or `=`. A misspelled directive, missing attribute, or missing file fails
the build with its line number.

### Structure

| Directive | Purpose |
| --- | --- |
| `:::cover` … `:::` | The front cover (solid blue). `##` is the name, `#` the title; the last paragraph sits at the foot. Must come first. |
| `:::back` … `:::` | The back cover, alone on a left-hand page. |
| `::pagebreak` | Continue on the next page. |
| `::part[Recordings]` | Groups the following page titles under a heading in the contents. |

### Full pages

| Directive | Purpose |
| --- | --- |
| `::score{src="/scores/wave.png"}` | An engraved score or lead sheet filling the page. White backgrounds blend into the paper. Omit `src` for the placeholder. Optional `alt`, `caption`. |
| `::plate{src="/images/x.jpg" kind=portrait}` | A full-page photograph (`kind=portrait`, framed) or illustration (`kind=figure`, the default). Optional `alt`, `caption`. |

### Blocks

| Directive | Purpose |
| --- | --- |
| `::contents` | The table of contents. The ribbon bookmark and the <kbd>C</kbd> key return here. |
| `::youtube{id=4eYuc9c5NaY aspect=1/1}` | A click-to-play video with a "Watch on YouTube" link. `aspect` is `16/9` (default), `4/3`, or `1/1`. |
| `::figure{src="/images/x.jpg" caption="…" width=60%}` | An image within the text. |
| `:::work{title="…" role="…" year=2025 href="…" label="…"}` … `:::` | A numbered catalogue entry (No. 1, No. 2, …). The body is its description. |
| `:::links` … `:::` | A Markdown list of links, set as a centred row at the foot of the page. |
| `::staff[Con spirito]` | A short staff with a clef, with an optional tempo marking. |
| `::signature[T. C. · Pittsburgh]` | A right-aligned sign-off. |
| `::continued[Works]` | The running head "Works (continued)". |

### Inline

| Directive | Purpose |
| --- | --- |
| `:download[Résumé (PDF)]{href="/resume.pdf"}` | A link that downloads the file. |
| `:sc[Correspondence]` | Small capitals. |
| `:pageref{to=biography}` | "p. 4", linked. With a label, `:pageref[Biography]{to=biography}` gives "Biography, p. 4". |

### Adding a recording

```md
# Body and Soul {composer="Johnny Green" marking="Ballad"}

::youtube{id=XXXXXXXXXXX}

A sentence or two about the recording.

::score{src="/scores/body-and-soul.png"}
```

Put it after the other recordings to keep it under the Recordings part.

## Code

| File | Role |
| --- | --- |
| `src/book.ts` | Parses `book.md` and paginates it into pages and spreads |
| `src/directives.ts` | Every directive: syntax, required attributes, rendering |
| `src/render.ts` | Writes the HTML document |
| `src/build.ts` | Build and dev-server entry point |
| `src/client/reader.ts` | In the browser: page turning, keys, swipe, history, videos |
| `src/client/styles.css` | All styling |

To add a directive, add an entry to `directives` in `src/directives.ts` and a
row to the tables above.
