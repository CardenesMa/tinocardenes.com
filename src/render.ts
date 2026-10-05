// Turns the paginated book into one HTML document: a toolbar, the book of
// spreads, and the viewer script. Markdown inside each page goes through
// mdast-util-to-hast, with directives and score headings handled here.

import type { Element, ElementContent } from 'hast';
import type { Heading, Link } from 'mdast';
import { defaultHandlers, toHast, type Handlers, type State } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
import GithubSlugger from 'github-slugger';
import type { Book, Page, Spread } from './book.ts';
import { fail, lookup, staff, syntax, type DirectiveNode, type RenderContext } from './directives.ts';

export function renderDocument(book: Book, options: { publicDir: string; dev?: boolean }) {
  const ctx: RenderContext = { book, publicDir: options.publicDir, works: 0 };
  const slugger = new GithubSlugger();
  for (const id of [...book.pageOf.keys(), 'cover', 'back', 'toc']) slugger.slug(id);
  const handlers = makeHandlers(ctx, slugger);

  const spreads = book.spreads.map((spread, i) => renderSpread(spread, i, book, handlers));
  const { meta } = book;
  const pageCount = book.pages.length;
  const hasToc = book.pageOf.size > 0 && book.pages.some((p) => p.nodes.some(isDirective('contents')));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: meta.name,
    url: meta.url,
    image: meta.image && meta.url ? new URL(meta.image, meta.url).href : undefined,
    jobTitle: meta.jobTitle,
    description: meta.description,
    sameAs: meta.sameAs,
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
${meta.description ? `<meta name="description" content="${esc(meta.description)}">` : ''}
${meta.url ? `<link rel="canonical" href="${esc(meta.url)}">\n<meta property="og:url" content="${esc(meta.url)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(meta.title)}">
${meta.description ? `<meta property="og:description" content="${esc(meta.description)}">` : ''}
${jsonLd.image ? `<meta property="og:image" content="${esc(jsonLd.image)}">` : ''}
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#2b3d57">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.classList.add('js')</script>
<script type="module" src="/reader.js"></script>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
<header class="toolbar">
  <a class="toolbar-title" href="#cover">${esc(meta.name)}${meta.work ? ` <span>· ${esc(meta.work)}</span>` : ''}</a>
  <div class="pager">
    <button type="button" class="pager-btn" data-turn="prev" aria-label="Previous pages">‹</button>
    <span class="pager-label"><span data-pager-pages>1</span> / ${pageCount}</span>
    <button type="button" class="pager-btn" data-turn="next" aria-label="Next pages">›</button>
  </div>
  ${hasToc ? '<a class="toolbar-contents" href="#toc">Contents</a>' : ''}
</header>
<main class="desk">
  <button type="button" class="edge edge--prev" data-turn="prev" aria-label="Previous pages"></button>
  <button type="button" class="edge edge--next" data-turn="next" aria-label="Next pages"></button>
  <div class="book" data-book data-mode="${book.spreads[0]?.mode ?? 'open'}">
    ${hasToc ? '<a class="ribbon" href="#toc" title="Return to contents"><span class="visually-hidden">Return to contents</span></a>' : ''}
    ${spreads.join('\n')}
  </div>
  <p class="hint">Use ← → to turn pages${hasToc ? ' · <kbd>C</kbd> for contents' : ''}</p>
  <p class="visually-hidden" aria-live="polite" data-announcer></p>
</main>
<script>
  // Open straight to a linked spread (e.g. /#biography) before first paint.
  (function () {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    var spread = el && el.closest('[data-spread]');
    if (!spread) return;
    document.querySelector('.spread.is-current').classList.remove('is-current');
    spread.classList.add('is-current');
    document.querySelector('[data-book]').dataset.mode = spread.dataset.mode;
  })();
</script>
${options.dev ? DEV_RELOAD : ''}
</body>
</html>
`;
}

// Reloads on each rebuild, and after the dev server restarts.
const DEV_RELOAD = `<script>
  let dropped = false;
  const events = new EventSource('/__reload');
  events.onmessage = () => location.reload();
  events.onerror = () => (dropped = true);
  events.onopen = () => dropped && location.reload();
</script>`;

function renderSpread(spread: Spread, index: number, book: Book, handlers: Handlers) {
  const pages = [spread.left, spread.right].filter((p): p is Page => p !== null);
  const label = pages.map((p) => p.number).join('–');
  const title =
    spread.mode === 'cover' ? 'Cover' : spread.mode === 'back' ? 'Back cover' : (pages.find((p) => p.title)?.title?.text ?? `Pages ${label}`);
  const next = book.spreads[index + 1]?.anchor;

  const article = h(
    'article.spread',
    {
      className: [`spread--${spread.mode}`, index === 0 ? 'is-current' : ''].filter(Boolean),
      dataSpread: '',
      dataMode: spread.mode,
      dataAnchor: spread.anchor,
      dataPages: label,
      dataTitle: title,
      ariaLabel: `${title}, page ${label}`,
      tabIndex: -1,
    },
    [spread.left, spread.right].map((page, i) =>
      page ? renderPage(page, book, handlers, next) : h(`div.page.page--empty.page--${i ? 'right' : 'left'}`, { ariaHidden: 'true' }),
    ),
  );
  return toHtml(article, { allowDangerousHtml: true });
}

function renderPage(page: Page, book: Book, handlers: Handlers, next?: string): Element {
  const body = toHast({ type: 'root', children: page.nodes }, { handlers, allowDangerousHtml: true }) as { children: ElementContent[] };
  const numbered = page.kind === 'text' || page.kind === 'full';
  const isContents = page.nodes.some(isDirective('contents'));
  const id = page.kind === 'cover' ? 'cover' : page.kind === 'back' ? 'back' : `p${page.number}`;

  return h(
    'div.page',
    { id, className: [`page--${page.side}`, `page--${page.kind}`, isContents ? 'page--contents' : ''].filter(Boolean) },
    [
      isContents ? h('span.dog-ear', { ariaHidden: 'true' }) : [],
      numbered ? h('span.folio', { ariaLabel: `Page ${page.number}` }, String(page.number)) : [],
      h('div.page-body', { className: page.kind === 'text' ? ['prose'] : [] }, body.children),
      numbered && book.meta.plate ? h('span.plate-no', { ariaHidden: 'true' }, book.meta.plate) : [],
      page.kind === 'cover' && next ? h('a.cover-open', { href: `#${next}`, dataTurn: 'next' }, h('span.visually-hidden', 'Open')) : [],
    ],
  );
}

function makeHandlers(ctx: RenderContext, slugger: GithubSlugger): Handlers {
  const directive = (state: State, node: DirectiveNode, parent: { type: string } | undefined) => {
    const spec = lookup(node);
    // Full-page directives render as the only thing on their page, which is a root.
    if (spec.role === 'structural' || (spec.role === 'page' && parent?.type !== 'root')) {
      throw fail(node, `${syntax(node.type)}${node.name} only works at the top level of book.md, not inside another block`);
    }
    return spec.render!(node, state, ctx);
  };

  return {
    containerDirective: directive,
    leafDirective: directive,
    textDirective: directive,

    heading(state: State, node: Heading) {
      const title = node.data?.title;
      if (!title) {
        const element = defaultHandlers.heading(state, node);
        element.properties.id = node.data?.attrs?.id ?? slugger.slug(toText(element).replace(/\s/g, ' '));
        return element;
      }
      // A page title, set like the head of a score.
      const { subtitle, marking, composer } = title.attrs;
      return h('header.score-heading', [
        h(`h${node.depth}.score-title`, { id: title.id }, state.all(node)),
        subtitle ? h('p.score-subtitle', subtitle) : [],
        marking || composer ? h('div.score-meta', [h('span.score-marking', marking ?? ''), h('span.score-attribution', composer ?? '')]) : [],
        staff(),
      ]);
    },

    link(state: State, node: Link) {
      const element = defaultHandlers.link(state, node);
      if (/^https?:/.test(node.url)) Object.assign(element.properties, { target: '_blank', rel: 'noopener noreferrer' });
      return element;
    },
  };
}

function isDirective(name: string) {
  return (node: { type: string; name?: string }) =>
    (node.type === 'leafDirective' || node.type === 'containerDirective') && node.name === name;
}

function toText(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  return 'children' in node ? node.children.map(toText).join('') : '';
}

function esc(value: string) {
  return value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

