// Parses book.md and lays it out as a bound score:
//
//   • page 1 is the cover, alone on the right;
//   • every `#` heading starts a new left-hand page, so it opens a spread
//     (a blank manuscript page fills the gap when needed);
//   • a `##` heading at the top of a page also titles that page;
//   • ::pagebreak continues on the next page;
//   • full-page directives (::score, ::plate) take a page to themselves;
//   • the back cover lands alone on a left-hand page.
//
// Page titles feed the table of contents, page numbers, and URLs.

import type { Heading, Root, RootContent, Text } from 'mdast';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkSmartypants from 'remark-smartypants';
import YAML from 'yaml';
import { fail, lookup } from './directives.ts';

export interface Meta {
  name: string;
  work?: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  plate?: string;
  sameAs?: string[];
}

export interface PageTitle {
  text: string;
  id: string;
  attrs: Record<string, string>;
}

declare module 'mdast' {
  interface HeadingData {
    /** Attributes written after a heading: `# Title {composer="…"}`. */
    attrs?: Record<string, string>;
    /** Set when this heading titles its page. */
    title?: PageTitle;
  }
}

export interface Page {
  kind: 'cover' | 'back' | 'text' | 'full' | 'blank';
  number: number;
  side: 'left' | 'right';
  nodes: RootContent[];
  title?: PageTitle;
}

export interface TocEntry {
  id: string;
  title: string;
  page: number;
  detail?: string;
  group?: string;
}

export interface Spread {
  left: Page | null;
  right: Page | null;
  /** Hash used in the URL while this spread is open. */
  anchor: string;
  mode: 'cover' | 'back' | 'open';
}

export interface Book {
  meta: Meta;
  pages: Page[];
  spreads: Spread[];
  toc: TocEntry[];
  /** Page number for every page title id, for :pageref. */
  pageOf: Map<string, number>;
}

export async function loadBook(source: string): Promise<Book> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkDirective)
    .use(headingAttributes)
    .use(remarkSmartypants);
  const tree = (await processor.run(processor.parse(source))) as Root;

  let meta: Meta | undefined;
  const pages: Page[] = [];
  const toc: TocEntry[] = [];
  const pageOf = new Map<string, number>();
  // Reserve ids the viewer uses itself.
  const slugger = new GithubSlugger();
  for (const reserved of ['cover', 'back', 'toc']) slugger.slug(reserved);

  let open: Page | null = null; // the page collecting body content
  let part: string | undefined;

  const addPage = (kind: Page['kind']) => {
    const number = pages.length + 1;
    const page: Page = { kind, number, side: number % 2 === 0 ? 'left' : 'right', nodes: [] };
    pages.push(page);
    return page;
  };
  // The next page must be a left-hand page: fill the facing right page if needed.
  const toLeftPage = () => {
    if (pages.length % 2 === 0) addPage('blank');
  };

  for (const node of tree.children) {
    if (node.type === 'yaml') {
      meta = YAML.parse(node.value) as Meta;
      continue;
    }

    if (node.type === 'containerDirective' || node.type === 'leafDirective') {
      const spec = lookup(node);
      if (node.name === 'cover') {
        if (pages.length) throw fail(node, ':::cover must come before everything else');
        addPage('cover').nodes = node.children;
        open = null;
        continue;
      }
      if (node.name === 'back') {
        toLeftPage();
        addPage('back').nodes = node.children;
        open = null;
        continue;
      }
      if (node.name === 'pagebreak') {
        open = null;
        continue;
      }
      if (node.name === 'part') {
        part = toString(node) || undefined;
        continue;
      }
      if (spec.role === 'page') {
        addPage('full').nodes = [node];
        open = null;
        continue;
      }
    }

    if (node.type === 'heading' && (node.depth === 1 || (node.depth === 2 && !open))) {
      if (node.depth === 1) toLeftPage();
      open = addPage('text');
      const attrs = node.data?.attrs ?? {};
      const text = toString(node).trim();
      const id = attrs.id ?? slugger.slug(text.replace(/\s/g, ' '));
      if (pageOf.has(id)) throw fail(node, `two pages share the id "${id}"; add {id=…} to one`);
      open.title = { text, id, attrs };
      node.data = { ...node.data, title: open.title };
      pageOf.set(id, open.number);
      if (attrs.toc !== 'false') toc.push({ id, title: text, page: open.number, detail: attrs.composer, group: part });
      open.nodes.push(node);
      continue;
    }

    open ??= addPage('text');
    open.nodes.push(node);
  }

  if (!meta?.name || !meta.title) throw new Error('book.md needs frontmatter with at least `name` and `title`');
  // Finish on a complete spread unless the book ends with its back cover.
  if (pages.length % 2 === 0 && pages.at(-1)?.kind !== 'back') addPage('blank');

  return { meta, pages, spreads: pairIntoSpreads(pages), toc, pageOf };
}

function pairIntoSpreads(pages: Page[]): Spread[] {
  const spreads: Spread[] = [];
  // Page 1 sits alone on the right; after that pages pair up even/odd.
  const groups: [Page | null, Page | null][] = [[null, pages[0] ?? null]];
  for (let i = 1; i < pages.length; i += 2) groups.push([pages[i], pages[i + 1] ?? null]);

  for (const [left, right] of groups) {
    const only = (left ?? right)!;
    const mode = !left && right?.kind === 'cover' ? 'cover' : !right && left?.kind === 'back' ? 'back' : 'open';
    const anchor =
      mode === 'cover' ? 'cover' : mode === 'back' ? 'back' : (left?.title?.id ?? right?.title?.id ?? `p${only.number}`);
    spreads.push({ left, right, anchor, mode });
  }
  return spreads;
}

/** Pulls trailing `{key="value" …}` off headings into `heading.data.attrs`. */
function headingAttributes() {
  return (tree: Root) => {
    const visit = (node: Root | RootContent) => {
      if (node.type === 'heading') extract(node);
      if ('children' in node) node.children.forEach(visit);
    };
    visit(tree);
  };
}

function extract(heading: Heading) {
  const last = heading.children.at(-1);
  if (last?.type !== 'text') return;
  const match = (last as Text).value.match(/\s*\{([^{}]*)\}\s*$/);
  if (!match) return;
  last.value = last.value.slice(0, match.index);
  const attrs: Record<string, string> = {};
  for (const m of match[1].matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g)) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? 'true';
  }
  heading.data = { ...heading.data, attrs };
}
