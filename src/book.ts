// Lays book.md out as a bound score:
//
//   • page 1 is the cover, alone on the right;
//   • every `#` heading starts a new left-hand page, so it opens a spread
//     (a blank manuscript page fills the gap when needed);
//   • a `##` heading at the top of a page also titles that page;
//   • ::pagebreak continues on the next page;
//   • full-page directives (::score, ::plate) take a page to themselves;
//   • the back cover lands alone on a left-hand page.
//
// It also checks every directive against the table below, so mistakes are
// reported with their line number. No DOM here: the deploy check runs it too.

import { BookError, parse, plainText, type Attrs, type Block, type Inline } from './markdown.js';

interface DirectiveSpec {
  kind: 'inline' | 'leaf' | 'container';
  /** `structural` shapes the pagination; `page` fills a page by itself. Both only at the top level. */
  role?: 'structural' | 'page';
  required?: string[];
  /** Attributes holding site paths (e.g. /images/x.jpg) that must exist. */
  files?: string[];
  check?: (attrs: Attrs) => string | undefined;
}

/** Every directive book.md may use. Rendering lives in render.ts under the same names. */
export const DIRECTIVES: Record<string, DirectiveSpec> = {
  cover: { kind: 'container', role: 'structural' },
  back: { kind: 'container', role: 'structural' },
  pagebreak: { kind: 'leaf', role: 'structural' },
  part: { kind: 'leaf', role: 'structural' },
  score: { kind: 'leaf', role: 'page', files: ['src'] },
  plate: {
    kind: 'leaf',
    role: 'page',
    required: ['src'],
    files: ['src'],
    check: (a) => (a.kind && a.kind !== 'portrait' && a.kind !== 'figure' ? 'kind must be "portrait" or "figure"' : undefined),
  },
  contents: { kind: 'leaf' },
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
  figure: { kind: 'leaf', required: ['src'], files: ['src'] },
  work: { kind: 'container', required: ['title'] },
  links: { kind: 'container' },
  staff: { kind: 'leaf' },
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
  number: number;
  blocks: Block[];
  title?: PageTitle;
  /** Attributes of the :::cover or :::back directive. */
  attrs?: Attrs;
}

export interface TocEntry {
  id: string;
  title: string;
  page: number;
  detail?: string;
  group?: string;
}

export interface Book {
  pages: Page[];
  toc: TocEntry[];
  /** Page number of each page title's id, for :pageref. */
  pageOf: Map<string, number>;
  /** Site paths referenced by directives, checked at deploy. */
  files: { path: string; line: number }[];
}

/** Ids the viewer uses itself. */
const RESERVED = ['cover', 'back', 'toc'];

export function parseBook(source: string): Book {
  const blocks = parse(source);
  const files: Book['files'] = [];
  validate(blocks, true, files);

  const pages: Page[] = [];
  const toc: TocEntry[] = [];
  const pageOf = new Map<string, number>();
  const slug = slugger(RESERVED);
  let open: Page | null = null; // the page collecting body content
  let part: string | undefined;

  const addPage = (kind: Page['kind']) => {
    const number = pages.length + 1;
    const page: Page = { kind, number, blocks: [] };
    pages.push(page);
    return page;
  };
  // The next page must be a left-hand page: fill the facing right page if needed.
  const toLeftPage = () => {
    if (pages.length % 2 === 0) addPage('blank');
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
          toLeftPage();
          Object.assign(addPage('back'), { blocks: block.children, attrs: block.attrs });
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
      if (block.depth === 1) toLeftPage();
      open = addPage('text');
      const text = plainText(block.children).trim();
      const id = block.attrs.id ?? slug(text);
      if (pageOf.has(id)) throw new BookError(`two pages share the id "${id}"; add {id=…} to one`, block.line);
      open.title = { id, depth: block.depth, content: block.children, attrs: block.attrs };
      pageOf.set(id, open.number);
      if (block.attrs.toc !== 'false') toc.push({ id, title: text, page: open.number, detail: block.attrs.composer, group: part });
      continue;
    }

    open ??= addPage('text');
    open.blocks.push(block);
  }

  // Finish on a complete spread unless the book ends with its back cover.
  if (pages.length % 2 === 0 && pages.at(-1)?.kind !== 'back') addPage('blank');

  return { pages, toc, pageOf, files };
}

/** Checks every directive's name, syntax, placement and attributes. */
function validate(blocks: Block[], topLevel: boolean, files: Book['files']) {
  const syntax = { inline: ':', leaf: '::', container: ':::' };
  const check = (name: string, kind: DirectiveSpec['kind'], attrs: Attrs, line: number) => {
    const spec = DIRECTIVES[name];
    const written = syntax[kind] + name;
    if (!spec) throw new BookError(`unknown directive ${written}. Available: ${Object.keys(DIRECTIVES).join(', ')}`, line);
    if (spec.kind !== kind) throw new BookError(`${written} should be written ${syntax[spec.kind]}${name}`, line);
    if (spec.role && !topLevel) throw new BookError(`${written} only works at the top level, not inside another block`, line);
    for (const attr of spec.required ?? []) if (!attrs[attr]) throw new BookError(`${written} needs ${attr}="…"`, line);
    const problem = spec.check?.(attrs);
    if (problem) throw new BookError(`${written}: ${problem}`, line);
    for (const attr of spec.files ?? []) if (attrs[attr]?.startsWith('/')) files.push({ path: attrs[attr], line });
  };
  const inlines = (nodes: Inline[], line: number) => {
    for (const n of nodes) {
      if (n.type === 'directive') {
        check(n.name, 'inline', n.attrs, n.line);
        inlines(n.label, line);
      } else if ('children' in n) inlines(n.children, line);
    }
  };

  for (const block of blocks) {
    if (block.type === 'directive') {
      check(block.name, block.kind, block.attrs, block.line);
      inlines(block.label, block.line);
      validate(block.children, false, files);
    } else if (block.type === 'heading' || block.type === 'paragraph') {
      inlines(block.children, block.line);
    } else if (block.type === 'list') {
      block.items.forEach((item) => inlines(item, block.line));
    }
  }
}

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

