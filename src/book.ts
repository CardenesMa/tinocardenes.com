// Splits book.md into pages, the way a bound score is set:
//
//   • page 1 is the cover, alone on the right;
//   • every `#` heading starts a new left-hand page, so it opens a spread;
//   • a `##` heading at the top of a page also titles that page;
//   • ::pagebreak continues on the next page;
//   • ::score takes a page to itself;
//   • ::plate{fill} and :::work fill the rest of a page: each starts a new one
//     unless the page so far is only a title, and what follows goes on the next;
//   • the back cover lands alone on a left-hand page.
//
// These are the pages as written. Text too long for its page flows onto more
// pages, and blank manuscript pages fill the gaps before left-hand pages; both
// happen in layout.ts, which can measure the text. Page numbers come from there too.
//
// It also checks every directive against the table below, so mistakes are
// reported with their line number. No DOM here: the deploy check runs it too.

import { BookError, parse, plainText, type Attrs, type Block, type Directive, type Inline } from './markdown.js';

interface DirectiveSpec {
  kind: 'inline' | 'leaf' | 'container';
  /** `structural` shapes the pagination; `page` fills a page by itself. Both only at the top level. */
  role?: 'structural' | 'page';
  required?: string[];
  /** Attributes holding site paths (e.g. /images/x.jpg) that must exist. */
  files?: string[];
  check?: (attrs: Attrs) => string | undefined;
  /** The container this directive must be in, or the only directive a container holds. */
  inside?: string;
  holds?: string;
}

/** Every directive book.md may use. Rendering lives in render.ts under the same names. */
export const DIRECTIVES: Record<string, DirectiveSpec> = {
  cover: { kind: 'container', role: 'structural' },
  back: { kind: 'container', role: 'structural' },
  pagebreak: { kind: 'leaf', role: 'structural' },
  part: { kind: 'leaf', role: 'structural' },
  score: { kind: 'leaf', role: 'page', files: ['src'] },
  plate: { kind: 'leaf', required: ['src'], files: ['src'], check: (a) => checkKind(a.kind) },
  contents: { kind: 'leaf' },
  incipits: { kind: 'container', holds: 'incipit' },
  incipit: { kind: 'leaf', inside: 'incipits', required: ['to'], files: ['src'] },
  youtube: {
    kind: 'leaf',
    required: ['id'],
    check: (a) =>
      !/^[\w-]{11}$/.test(a.id)
        ? `"${a.id}" is not a YouTube video id (the 11 characters after watch?v=)`
        : a.aspect && !/^\d+[/:]\d+$/.test(a.aspect)
          ? 'aspect must look like 16/9'
          : undefined,
  },
  work: { kind: 'container', required: ['title'], files: ['src'], check: (a) => checkKind(a.kind) },
  links: { kind: 'container' },
  signature: { kind: 'leaf' },
  continued: { kind: 'leaf' },
  download: { kind: 'inline', required: ['href'], files: ['href'] },
  sc: { kind: 'inline' },
  pageref: { kind: 'inline', required: ['to'] },
};

export interface PageTitle {
  id: string;
  depth: number;
  content: Inline[];
  attrs: Attrs;
}

export interface Page {
  kind: 'cover' | 'back' | 'text' | 'full' | 'blank';
  /** Must be a left-hand page (it opens a spread). */
  left: boolean;
  blocks: Block[];
  title?: PageTitle;
  /** Attributes of the :::cover or :::back directive. */
  attrs?: Attrs;
}

export interface TocEntry {
  id: string;
  title: string;
  detail?: string;
  /** The ::part it's in. */
  group?: string;
}

export interface Book {
  pages: Page[];
  toc: TocEntry[];
  /** Every page title's id, for :pageref. */
  ids: Set<string>;
  /** Site paths referenced by book.md, checked at deploy. */
  files: { path: string; line: number; directive: string }[];
}

/** Ids the viewer uses itself. */
const RESERVED = ['cover', 'back', 'toc'];

export function parseBook(source: string): Book {
  const blocks = parse(source);
  const files: Book['files'] = [];
  validate(blocks, true, files);

  const pages: Page[] = [];
  const toc: TocEntry[] = [];
  const ids = new Set<string>();
  const slug = slugger(RESERVED);
  let open: Page | null = null; // the page collecting body content
  let part: string | undefined;

  const addPage = (kind: Page['kind'], left = false) => {
    const page: Page = { kind, left, blocks: [] };
    pages.push(page);
    return page;
  };

  for (const block of blocks) {
    if (block.type === 'directive' && DIRECTIVES[block.name].role) {
      open = null;
      switch (block.name) {
        case 'cover':
          if (pages.length) throw new BookError(':::cover must come before everything else', block.line);
          Object.assign(addPage('cover'), { blocks: block.children, attrs: block.attrs });
          break;
        case 'back':
          Object.assign(addPage('back', true), { blocks: block.children, attrs: block.attrs });
          break;
        case 'part':
          part = plainText(block.label) || undefined;
          break;
        case 'pagebreak':
          break;
        default: // a full-page directive
          addPage('full').blocks = [block];
      }
      continue;
    }

    if (block.type === 'heading' && (block.depth === 1 || (block.depth === 2 && !open))) {
      open = addPage('text', block.depth === 1);
      const text = plainText(block.children).trim();
      const { composer } = block.attrs;
      const id = block.attrs.id ?? slug(text);
      if (ids.has(id)) throw new BookError(`two pages share the id "${id}"; add {id=…} to one`, block.line);
      open.title = { id, depth: block.depth, content: block.children, attrs: block.attrs };
      ids.add(id);
      if (block.attrs.toc !== 'false') toc.push({ id, title: text, detail: composer, group: part });
      continue;
    }

    const fills = block.type === 'directive' && (block.name === 'work' || (block.name === 'plate' && isSet(block.attrs.fill)));
    if (fills && open?.blocks.length) open = null;
    open ??= addPage('text');
    open.blocks.push(block);
    if (fills) open = null;
  }

  // Each ::incipit links to a page title, and takes its title from there unless it has its own.
  const incipits = (nodes: Block[]): Directive[] =>
    nodes.flatMap((b) => (b.type !== 'directive' ? [] : b.name === 'incipit' ? [b] : incipits(b.children)));
  for (const { attrs, label, line } of incipits(blocks)) {
    if (!ids.has(attrs.to)) throw new BookError(`::incipit: no page title has the id "${attrs.to}"`, line);
    if (!label.length && !toc.some((e) => e.id === attrs.to)) throw new BookError(`::incipit: "${attrs.to}" isn't in the contents, so give it a title: ::incipit[Title]{to=${attrs.to}}`, line);
  }

  return { pages, toc, ids, files };
}

/** Checks every directive's name, syntax, placement and attributes. */
function validate(blocks: Block[], topLevel: boolean, files: Book['files'], parent?: string) {
  const syntax = { inline: ':', leaf: '::', container: ':::' };
  const check = (name: string, kind: DirectiveSpec['kind'], attrs: Attrs, line: number) => {
    const spec = DIRECTIVES[name];
    const written = syntax[kind] + name;
    if (!spec) throw new BookError(`unknown directive ${written}. Available: ${Object.keys(DIRECTIVES).join(', ')}`, line);
    if (spec.kind !== kind) throw new BookError(`${written} should be written ${syntax[spec.kind]}${name}`, line);
    if (spec.role && !topLevel) throw new BookError(`${written} only works at the top level, not inside another block`, line);
    if (spec.inside && parent !== spec.inside) throw new BookError(`${written} only works inside :::${spec.inside}`, line);
    for (const attr of spec.required ?? []) if (!attrs[attr]) throw new BookError(`${written} needs ${attr}="…"`, line);
    const problem = spec.check?.(attrs);
    if (problem) throw new BookError(`${written}: ${problem}`, line);
    for (const attr of spec.files ?? []) if (attrs[attr]?.startsWith('/')) files.push({ path: attrs[attr], line, directive: name });
  };
  const inlines = (nodes: Inline[], line: number) => {
    for (const n of nodes) {
      if (n.type === 'directive') {
        check(n.name, 'inline', n.attrs, n.line);
        inlines(n.label, line);
      } else if ('children' in n) inlines(n.children, line);
    }
  };

  const holds = parent && DIRECTIVES[parent].holds;
  for (const block of blocks) {
    if (holds && (block.type !== 'directive' || block.name !== holds)) {
      throw new BookError(`:::${parent} holds only ::${holds} lines`, block.line);
    }
    if (block.type === 'directive') {
      check(block.name, block.kind, block.attrs, block.line);
      inlines(block.label, block.line);
      validate(block.children, false, files, block.name);
    } else if (block.type === 'heading' || block.type === 'paragraph') {
      inlines(block.children, block.line);
    } else if (block.type === 'list') {
      block.items.forEach((item) => inlines(item, block.line));
    }
  }
}

/** The kinds of picture a ::plate or :::work can show. */
function checkKind(kind: string | undefined) {
  return kind && kind !== 'portrait' && kind !== 'figure' ? 'kind must be "portrait" or "figure"' : undefined;
}

/** A flag attribute: `{fill}` or `{fill=true}`, but not `{fill=false}`. */
export const isSet = (value: string | undefined) => value !== undefined && value !== 'false';

/** URL-safe ids from text, numbered when repeated: "Wave", "Wave" → wave, wave-1. */
export function slugger(taken: string[] = []) {
  const seen = new Map<string, number>(taken.map((t) => [t, 1]));
  return (text: string) => {
    const base =
      text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}

