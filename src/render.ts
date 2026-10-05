// Builds the book's pages as DOM elements from the paginated Markdown, with
// directives rendered by the functions below.

import { slugger, type Book, type Page, type PageTitle } from './book.js';
import { plainText, type Block, type Directive, type Inline } from './markdown.js';

type InlineDirective = Extract<Inline, { type: 'directive' }>;
type Child = Node | string | null | undefined | false | Child[];
type Props = Record<string, string | number | boolean | undefined>;
type Staff = HTMLElement;

interface Context {
  book: Book;
  plate?: string;
  slug: (text: string) => string;
  /** Running "No. n" counter for :::work entries. */
  works: number;
}

/** Creates an element: h('p.note', { id: 'x' }, 'text', child, [more]). */
export function h(selector: string, props: Props = {}, ...children: Child[]): HTMLElement {
  const [tag, ...classes] = selector.split('.');
  const el = document.createElement(tag);
  if (classes.length) el.className = classes.join(' ');
  for (const [key, value] of Object.entries(props)) {
    if (value === true) el.setAttribute(key, '');
    else if (value !== undefined && value !== false) el.setAttribute(key, String(value));
  }
  const add = (child: Child) => {
    if (Array.isArray(child)) child.forEach(add);
    else if (child != null && child !== false) el.append(child);
  };
  children.forEach(add);
  return el;
}

export function renderBook(book: Book, root: HTMLElement, options: { plate?: string } = {}) {
  const ctx: Context = { book, plate: options.plate, slug: slugger(['cover', 'back', 'toc', ...book.pageOf.keys()]), works: 0 };
  root.append(...book.pages.map((page) => renderPage(page, ctx)));
}

/** One page. The page-flip library pairs pages into spreads and positions them. */
function renderPage(page: Page, ctx: Context) {
  const numbered = page.kind === 'text' || page.kind === 'full';
  const isContents = page.blocks.some((b) => b.type === 'directive' && b.name === 'contents');
  const id = page.kind === 'cover' || page.kind === 'back' ? page.kind : `p${page.number}`;
  const title = page.kind === 'cover' ? 'Cover' : page.kind === 'back' ? 'Back cover' : page.title && plainText(page.title.content);
  const body = page.kind === 'cover' ? cover(page, ctx) : [page.title && scoreHeading(page.title, page.title.attrs.marking ? staff() : undefined, ctx), blocks(page.blocks, ctx)];

  return h(
    `div.page.page--${page.kind}${isContents ? '.page--contents' : ''}`,
    // Covers are boards: the library turns them stiffly rather than curling them.
    { id, 'data-title': title, 'data-density': page.kind === 'cover' || page.kind === 'back' ? 'hard' : 'soft' },
    isContents && h('span.dog-ear', { 'aria-hidden': 'true' }),
    numbered && h('span.folio', { 'aria-label': `Page ${page.number}` }, String(page.number)),
    h(`div.page-body${page.kind === 'text' ? '.prose' : ''}`, {}, body),
    numbered && ctx.plate && h('span.plate-no', { 'aria-hidden': 'true' }, ctx.plate),
    page.kind === 'cover' && h('a.cover-open', { href: '#p2', 'data-turn': 'next' }, h('span.visually-hidden', {}, 'Open')),
  );
}

/** The front cover, laid out like an Urtext edition. */
function cover(page: Page, ctx: Context) {
  const { name, label, publisher, number } = page.attrs ?? {};
  return h(
    'div.cover',
    {},
    name && h('p.cover-name', {}, name),
    h(
      'div.cover-grid',
      {},
      h('p.cover-label', {}, label),
      h('div.cover-text', {}, blocks(page.blocks, ctx)),
      h(
        'div.cover-imprint',
        {},
        publisher && h('p.cover-publisher', {}, publisher, h('span.cover-mark', { 'aria-hidden': 'true' }, '𝄞')),
        h('p.cover-number', {}, number),
      ),
    ),
  );
}

/** A page title, set like the head of a score: title, subtitle, marking, composer, staff. */
function scoreHeading(title: PageTitle, staff: Staff | undefined, ctx: Context) {
  const { subtitle, marking, composer } = title.attrs;
  return h(
    'header.score-heading',
    {},
    h(`h${title.depth}.score-title`, { id: title.id }, inlines(title.content, ctx)),
    subtitle && h('p.score-subtitle', {}, subtitle),
    (marking || composer) && h('div.score-meta', {}, h('span.score-marking', {}, marking), h('span.score-attribution', {}, composer)),
    staff && staff,
  );
}

function blocks(nodes: Block[], ctx: Context): Node[] {
  return nodes.map((node) => {
    switch (node.type) {
      case 'heading':
        return h(`h${node.depth}`, { id: node.attrs.id ?? ctx.slug(plainText(node.children)) }, inlines(node.children, ctx));
      case 'paragraph':
        return h('p', {}, inlines(node.children, ctx));
      case 'list':
        return h('ul', {}, node.items.map((item) => h('li', {}, inlines(item, ctx))));
      case 'rule':
        return h('hr');
      case 'directive':
        return BLOCKS[node.name](node, ctx);
    }
  });
}

function inlines(nodes: Inline[], ctx: Context): Child[] {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'break':
        return h('br');
      case 'em':
      case 'strong':
        return h(node.type, {}, inlines(node.children, ctx));
      case 'link':
        return h('a', { href: node.href, ...external(node.href) }, inlines(node.children, ctx));
      case 'directive':
        return INLINES[node.name](node, ctx);
    }
  });
}

// ── Directives (each is checked against DIRECTIVES in book.ts first) ─────────

const BLOCKS: Record<string, (node: Directive, ctx: Context) => Node> = {
  score: (node) => plate('score', node.attrs.src ?? '/scores/placeholder.png', node.attrs),
  plate: (node) => plate(node.attrs.kind ?? 'figure', node.attrs.src, node.attrs),

  contents: (_node, ctx) => {
    // Consecutive entries in the same part share one group heading.
    const groups: { name?: string; entries: Book['toc'] }[] = [];
    for (const entry of ctx.book.toc) {
      const last = groups.at(-1);
      if (last && entry.group && last.name === entry.group) last.entries.push(entry);
      else groups.push({ name: entry.group, entries: [entry] });
    }
    return h(
      'nav.toc',
      { id: 'toc', 'aria-label': 'Table of contents' },
      groups.map((group) => [
        group.name && h('h3.toc-group', {}, group.name),
        h(
          `ol.toc-list${group.name ? '.toc-list--grouped' : ''}`,
          {},
          group.entries.map((e) =>
            h(
              'li',
              {},
              h(
                'a.toc-link',
                { href: `#${e.id}` },
                h('span.toc-title', {}, e.title, e.detail && h('span.toc-detail', {}, e.detail)),
                h('span.toc-leader', { 'aria-hidden': 'true' }),
                h('span.toc-page', {}, String(e.page)),
              ),
            ),
          ),
        ),
      ]),
    );
  },

  youtube: (node) => {
    const { id } = node.attrs;
    const [w, hgt] = (node.attrs.aspect ?? '16/9').split(/[/:]/).map(Number);
    const title = plainText(node.label) || 'YouTube video';
    return h(
      'figure.yt-figure',
      {},
      h(
        'div.yt',
        { style: `aspect-ratio: ${w} / ${hgt}; max-width: calc(60cqi * ${(w / hgt).toFixed(4)})`, 'data-yt': id, 'data-title': title },
        h(
          'button.yt-play',
          { type: 'button', 'aria-label': `Play ${title}` },
          h('img', { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: '', loading: 'lazy', decoding: 'async' }),
          h('span.yt-icon', { 'aria-hidden': 'true' }),
        ),
      ),
      h('figcaption', {}, h('a.small-link', { href: `https://www.youtube.com/watch?v=${id}`, ...external('https:') }, 'Watch on YouTube →')),
    );
  },

  figure: (node) =>
    h(
      'figure.figure',
      {},
      h('img', { src: node.attrs.src, alt: node.attrs.alt ?? '', loading: 'lazy', style: `width: ${node.attrs.width ?? '100%'}` }),
      node.attrs.caption && h('figcaption', {}, node.attrs.caption),
    ),

  work: (node, ctx) => {
    const { title, role, year, href, label } = node.attrs;
    return h(
      'section.work',
      {},
      h('h3.work-title', {}, h('span.work-no', {}, `No. ${++ctx.works}`), ' ', title),
      (role || year) && h('p.work-role', {}, [role, year].filter(Boolean).join(', ')),
      blocks(node.children, ctx),
      href && h('a.small-link', { href, ...external(href) }, `${label ?? 'Visit'} →`),
    );
  },

  links: (node, ctx) => h('nav.page-links', {}, blocks(node.children, ctx)),
  staff: (node, ctx) => h('div.staff-block', { 'aria-hidden': 'true' }, node.label.length > 0 && h('span.score-marking', {}, inlines(node.label, ctx)), staff()),
  signature: (node, ctx) => h('p.signature', {}, inlines(node.label, ctx)),
  continued: (node, ctx) => h('p.running-head', {}, inlines(node.label, ctx), ' (continued)'),
};

const INLINES: Record<string, (node: InlineDirective, ctx: Context) => Node> = {
  download: (node, ctx) => h('a', { href: node.attrs.href, download: true }, inlines(node.label, ctx)),
  sc: (node, ctx) => h('span.sc', {}, inlines(node.label, ctx)),
  pageref: (node, ctx) => {
    const page = ctx.book.pageOf.get(node.attrs.to);
    const text = node.label.length ? [inlines(node.label, ctx), `, p. ${page ?? '?'}`] : `p. ${page ?? '?'}`;
    return h('a', { href: `#${node.attrs.to}` }, text);
  },
};

function plate(kind: string, src: string, attrs: Record<string, string>) {
  return h(
    `figure.plate.plate--${kind}`,
    {},
    h('img', { src, alt: attrs.alt ?? '', loading: 'lazy', decoding: 'async' }),
    attrs.caption && h('figcaption', {}, attrs.caption),
  );
}

function staff() {
  return h('div.staff', { 'aria-hidden': 'true' }, h('span.staff-clef', {}, '𝄞'));
}

function external(href: string): Props {
  return /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
