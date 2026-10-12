// Builds the book's pages from the paginated Markdown. The markup lives in
// <template data-template="…"> elements in index.html; each function here picks
// a template and fills it with data. See fill() for how templates are filled.
//
// Page numbers aren't known yet: layout.ts decides them once it has measured
// the text, and fills in every [data-page-number] and [data-page-of="id"].

import { isSet, slugger, type Book, type Page, type PageTitle } from './book.js';
import { plainText, type Block, type Directive, type Inline } from './markdown.js';

type InlineDirective = Extract<Inline, { type: 'directive' }>;

/** What a template is filled with: text and numbers for {{key}}, elements for <slot>. */
type Value = string | number | boolean | null | undefined | Node | Value[];
type Data = Record<string, Value>;

interface Context {
  book: Book;
  slug: (text: string) => string;
  /** Running "No. n" counter for :::work entries. */
  works: number;
}

/** The pages as book.md has them, before any text flows onto further pages. */
export function renderPages(book: Book, options: { plate?: string } = {}): HTMLElement[] {
  const ctx: Context = { book, slug: slugger(['cover', 'back', 'toc', ...book.ids]), works: 0 };
  return book.pages.map((page) => {
    const el = renderPage(page, ctx, options.plate);
    // Links that leave the site open in a new tab.
    for (const link of el.querySelectorAll<HTMLAnchorElement>('a[href^="http:"], a[href^="https:"]')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return el;
  });
}

/** One page. The page-flip library pairs pages into spreads and positions them. */
function renderPage(page: Page, ctx: Context, plate?: string) {
  const isCover = page.kind === 'cover';
  const isBack = page.kind === 'back';
  return pageShell(page.kind, {
    id: isCover || isBack ? page.kind : '',
    title: isCover ? 'Cover' : isBack ? 'Back cover' : page.title && plainText(page.title.content),
    left: page.left,
    isContents: page.blocks.some((b) => b.type === 'directive' && b.name === 'contents'),
    plate,
    body: isCover ? cover(page, ctx) : isBack ? back(page, ctx) : [page.title && scoreHeading(page.title, ctx), blocks(page.blocks, ctx)],
  });
}

/** An empty text page for what didn't fit on `page`. */
export function continuationPage(page: HTMLElement) {
  return pageShell('text', { plate: page.querySelector('.page-plate')?.textContent ?? undefined });
}

/** A page of blank manuscript paper, to bring the next page onto the left. */
export function blankPage() {
  return pageShell('blank', {});
}

function pageShell(
  kind: Page['kind'],
  { id = '', title, left = false, isContents = false, plate, body = [] }: { id?: string; title?: string; left?: boolean; isContents?: boolean; plate?: string; body?: Value },
) {
  const numbered = kind === 'text' || kind === 'full';
  const fragment = fill('page', {
    kind,
    contentsClass: isContents ? 'page--contents' : '',
    id,
    title,
    // Covers are boards: the library turns them stiffly rather than curling them.
    density: kind === 'cover' || kind === 'back' ? 'hard' : 'soft',
    left,
    isContents,
    numbered,
    bodyClass: kind === 'text' ? 'prose' : '',
    body,
    plate: numbered && plate,
    isCover: kind === 'cover',
  });
  return fragment.firstElementChild as HTMLElement;
}

function cover(page: Page, ctx: Context) {
  const { name, label, publisher, number } = page.attrs ?? {};
  return fill('cover', { name, label, publisher, number, text: blocks(page.blocks, ctx) });
}

/** :::back. Whatever follows a --- goes at the foot of the page. */
function back(page: Page, ctx: Context) {
  const rule = page.blocks.findIndex((b) => b.type === 'rule');
  const [main, foot] = rule < 0 ? [page.blocks, []] : [page.blocks.slice(0, rule), page.blocks.slice(rule + 1)];
  return fill('back', { main: blocks(main, ctx), foot: blocks(foot, ctx) });
}

function scoreHeading(title: PageTitle, ctx: Context) {
  const { subtitle } = title.attrs;
  return fill('score-heading', {
    h1: title.depth === 1,
    h2: title.depth === 2,
    id: title.id,
    title: inlines(title.content, ctx),
    subtitle,
  });
}

// ── Markdown ────────────────────────────────────────────────────────────────

function blocks(nodes: Block[], ctx: Context): Node[] {
  return nodes.map((node) => {
    switch (node.type) {
      case 'heading':
        return element(`h${node.depth}`, { id: node.attrs.id ?? ctx.slug(plainText(node.children)) }, inlines(node.children, ctx));
      case 'paragraph':
        return element('p', {}, inlines(node.children, ctx));
      case 'list':
        return element('ul', {}, node.items.map((item) => element('li', {}, inlines(item, ctx))));
      case 'rule':
        return element('hr');
      case 'directive':
        return BLOCKS[node.name](node, ctx);
    }
  });
}

function inlines(nodes: Inline[], ctx: Context): Value[] {
  return nodes.map((node) => {
    switch (node.type) {
      case 'text':
        return node.value;
      case 'break':
        return element('br');
      case 'em':
      case 'strong':
        return element(node.type, {}, inlines(node.children, ctx));
      case 'link':
        return element('a', { href: node.href }, inlines(node.children, ctx));
      case 'directive':
        return INLINES[node.name](node, ctx);
    }
  });
}

// ── Directives (each is checked against DIRECTIVES in book.ts first) ─────────

const BLOCKS: Record<string, (node: Directive, ctx: Context) => Node> = {
  score: (node) => plate('score', true, { ...node.attrs, src: node.attrs.src ?? '/scores/placeholder.png' }),
  plate: (node) => plate(node.attrs.kind ?? 'figure', isSet(node.attrs.fill), node.attrs),

  // The site map: every title outside a ::part, each part once (linking to its
  // first title), and the back cover.
  contents: (_node, ctx) => {
    const parts = new Set<string>();
    const entries: Value[] = [];
    for (const { id, title, detail, group } of ctx.book.toc) {
      if (!group) entries.push(fill('contents-entry', { id, title, detail }));
      else if (!parts.has(group)) {
        parts.add(group);
        entries.push(fill('contents-entry', { id, title: group, detail: undefined }));
      }
    }
    return fill('contents', { entries, hasBack: ctx.book.pages.some((p) => p.kind === 'back') });
  },

  // A thematic index: each ::incipit is a title over the first line of its music,
  // linking to its page. Title and composer come from that page unless given.
  incipits: (node, ctx) =>
    fill('incipits', {
      entries: (node.children as Directive[]).map(({ label, attrs: { to, src, composer } }, i) => {
        const page = ctx.book.toc.find((e) => e.id === to);
        return fill('incipit',
          {
            id: to,
            number: i + 1,
            title:
              plainText(label) || page?.title,
            detail: composer ?? page?.detail,
            src, noSrc: !src
          });
      }),
    }),

  youtube: (node) => {
    const [width, height] = (node.attrs.aspect ?? '16/9').split(/[/:]/).map(Number);
    return fill('youtube', {
      id: node.attrs.id,
      title: plainText(node.label) || 'YouTube video',
      width,
      height,
      ratio: (width / height).toFixed(4),
    });
  },

  // A page to itself; its picture fills the space the words leave.
  work: (node, ctx) => {
    const { title, role, year, href, label, src } = node.attrs;
    return fill('work', {
      number: ++ctx.works,
      title,
      role: [role, year].filter(Boolean).join(', '),
      image: src && plate(node.attrs.kind ?? 'figure', true, node.attrs),
      body: blocks(node.children, ctx),
      href,
      label: label ?? 'Visit',
    });
  },

  links: (node, ctx) => fill('links', { body: blocks(node.children, ctx) }),
  signature: (node, ctx) => fill('signature', { text: inlines(node.label, ctx) }),
  continued: (node, ctx) => fill('continued', { text: inlines(node.label, ctx) }),
};

const INLINES: Record<string, (node: InlineDirective, ctx: Context) => Node> = {
  download: (node, ctx) => fill('download', { href: node.attrs.href, label: inlines(node.label, ctx) }),
  sc: (node, ctx) => fill('sc', { text: inlines(node.label, ctx) }),
  pageref: (node, ctx) => fill('pageref', { to: node.attrs.to, label: node.label.length ? [inlines(node.label, ctx), ', '] : [] }),
};

/** How wide each kind of picture is set, unless the plate gives a width. */
const PLATE_WIDTHS: Record<string, string> = { score: '100%', portrait: '78%', figure: '55%' };

function plate(kind: string, fills: boolean, attrs: Record<string, string>) {
  return fill('plate', {
    kind,
    fill: fills,
    width: attrs.width ?? PLATE_WIDTHS[kind],
    src: attrs.src,
    alt: attrs.alt ?? '',
    caption: attrs.caption,
    // A plate in the text must have its height before layout.ts measures the page.
    loading: fills ? 'lazy' : 'eager',
  });
}

// ── Templates ───────────────────────────────────────────────────────────────

/**
 * Copies <template data-template="name"> from index.html and fills it with data:
 *   {{key}}            in text or an attribute becomes data.key as text (true/false for booleans);
 *   <slot name="key">  is replaced by data.key as elements;
 *   data-if="key"      keeps the element only when data.key is set (not empty, false or []);
 *   data-style="…"     becomes style="…".
 * Line breaks and indentation between tags are dropped. Every key the template
 * uses must be given, even if undefined, so a typo is reported rather than ignored.
 */
export function fill(name: string, data: Data): DocumentFragment {
  const template = document.querySelector<HTMLTemplateElement>(`template[data-template="${name}"]`);
  if (!template) throw new Error(`index.html has no <template data-template="${name}">`);
  // cloneNode (rather than importNode) keeps the copy inert while it's filled,
  // so an <img src="{{src}}"> isn't fetched before {{src}} is replaced.
  const fragment = template.content.cloneNode(true) as DocumentFragment;

  const get = (key: string) => {
    if (!(key in data)) throw new Error(`<template data-template="${name}"> uses "${key}", which render.ts doesn't give it`);
    return data[key];
  };
  const fillText = (text: string) => text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => asText(get(key)));

  for (const el of fragment.querySelectorAll('[data-if]')) {
    if (isEmpty(get(el.getAttribute('data-if')!))) el.remove();
    else el.removeAttribute('data-if');
  }

  for (const el of fragment.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (!attr.value.includes('{{')) continue;
      const value = fillText(attr.value);
      attr.value = attr.name === 'class' ? value.replace(/\s+/g, ' ').trim() : value;
    }
    const style = el.getAttribute('data-style');
    if (style !== null) {
      el.setAttribute('style', style);
      el.removeAttribute('data-style');
    }
  }

  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const text of texts) {
    if (/^\s*\n\s*$/.test(text.data)) text.remove();
    else text.data = fillText(text.data);
  }

  for (const slot of fragment.querySelectorAll('slot')) slot.replaceWith(...toNodes(get(slot.getAttribute('name')!)));

  return fragment;
}

/** A plain element for Markdown's own tags (p, em, a, …), which need no template. */
function element(tag: string, attrs: Record<string, string> = {}, children: Value = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  el.append(...toNodes(children));
  return el;
}

function isEmpty(value: Value): boolean {
  return value == null || value === false || value === '' || (Array.isArray(value) && value.every(isEmpty));
}

function asText(value: Value): string {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
}

function toNodes(value: Value): (Node | string)[] {
  if (Array.isArray(value)) return value.flatMap(toNodes);
  if (value instanceof Node) return [value];
  return typeof value === 'string' || typeof value === 'number' ? [String(value)] : [];
}
