// Builds the book's pages from the paginated Markdown. The markup lives in
// <template data-template="…"> elements in index.html; each function here picks
// a template and fills it with data. See fill() for how templates are filled.

import { slugger, type Book, type Page, type PageTitle } from './book.js';
import { plainText, type Block, type Directive, type Inline } from './markdown.js';

type InlineDirective = Extract<Inline, { type: 'directive' }>;

/** What a template is filled with: text and numbers for {{key}}, elements for <slot>. */
type Value = string | number | boolean | null | undefined | Node | Value[];
type Data = Record<string, Value>;

interface Context {
  book: Book;
  plate?: string;
  slug: (text: string) => string;
  /** Running "No. n" counter for :::work entries. */
  works: number;
}

export function renderBook(book: Book, root: HTMLElement, options: { plate?: string } = {}) {
  const ctx: Context = { book, plate: options.plate, slug: slugger(['cover', 'back', 'toc', ...book.pageOf.keys()]), works: 0 };
  root.append(...book.pages.map((page) => renderPage(page, ctx)));

  // Links that leave the site open in a new tab.
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="http:"], a[href^="https:"]')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
}

/** One page. The page-flip library pairs pages into spreads and positions them. */
function renderPage(page: Page, ctx: Context) {
  const isCover = page.kind === 'cover';
  const isBack = page.kind === 'back';
  const isContents = page.blocks.some((b) => b.type === 'directive' && b.name === 'contents');
  const numbered = page.kind === 'text' || page.kind === 'full';

  return fill('page', {
    kind: page.kind,
    id: isCover || isBack ? page.kind : `p${page.number}`,
    title: isCover ? 'Cover' : isBack ? 'Back cover' : page.title && plainText(page.title.content),
    // Covers are boards: the library turns them stiffly rather than curling them.
    density: isCover || isBack ? 'hard' : 'soft',
    isContents,
    contentsClass: isContents ? 'page--contents' : '',
    numbered,
    number: page.number,
    bodyClass: page.kind === 'text' ? 'prose' : '',
    body: isCover ? cover(page, ctx) : [page.title && scoreHeading(page.title, ctx), blocks(page.blocks, ctx)],
    plate: numbered && ctx.plate,
    isCover,
  });
}

function cover(page: Page, ctx: Context) {
  const { name, label, publisher, number } = page.attrs ?? {};
  return fill('cover', { name, label, publisher, number, text: blocks(page.blocks, ctx) });
}

function scoreHeading(title: PageTitle, ctx: Context) {
  const { subtitle, marking, composer } = title.attrs;
  return fill('score-heading', {
    h1: title.depth === 1,
    h2: title.depth === 2,
    id: title.id,
    title: inlines(title.content, ctx),
    subtitle,
    hasMeta: !!(marking || composer),
    marking,
    composer,
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
    return fill('contents', {
      groups: groups.map((group) =>
        fill('contents-group', {
          name: group.name,
          indented: !!group.name,
          entries: group.entries.map((e) => fill('contents-entry', { id: e.id, title: e.title, detail: e.detail, page: e.page })),
        }),
      ),
    });
  },

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

  figure: (node) =>
    fill('figure', {
      src: node.attrs.src,
      alt: node.attrs.alt ?? '',
      width: node.attrs.width ?? '100%',
      caption: node.attrs.caption,
    }),

  work: (node, ctx) => {
    const { title, role, year, href, label } = node.attrs;
    return fill('work', {
      number: ++ctx.works,
      title,
      role: [role, year].filter(Boolean).join(', '),
      body: blocks(node.children, ctx),
      href,
      label: label ?? 'Visit',
    });
  },

  links: (node, ctx) => fill('links', { body: blocks(node.children, ctx) }),
  staff: (node, ctx) => fill('staff', { marking: inlines(node.label, ctx) }),
  signature: (node, ctx) => fill('signature', { text: inlines(node.label, ctx) }),
  continued: (node, ctx) => fill('continued', { text: inlines(node.label, ctx) }),
};

const INLINES: Record<string, (node: InlineDirective, ctx: Context) => Node> = {
  download: (node, ctx) => fill('download', { href: node.attrs.href, label: inlines(node.label, ctx) }),
  sc: (node, ctx) => fill('sc', { text: inlines(node.label, ctx) }),
  pageref: (node, ctx) =>
    fill('pageref', {
      to: node.attrs.to,
      label: node.label.length ? [inlines(node.label, ctx), ', '] : [],
      page: ctx.book.pageOf.get(node.attrs.to) ?? '?',
    }),
};

function plate(kind: string, src: string, attrs: Record<string, string>) {
  return fill('plate', { kind, src, alt: attrs.alt ?? '', caption: attrs.caption });
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
