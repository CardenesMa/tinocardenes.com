// Every directive book.md may use, in one place. Each entry says which
// syntax it takes (:inline, ::block, :::container), which attributes it
// requires, and how it renders. Unknown or misused directives fail the build
// with the line number, so typos never ship silently.

import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ElementContent } from 'hast';
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive';
import type { State } from 'mdast-util-to-hast';
import { toString } from 'mdast-util-to-string';
import { h } from 'hastscript';
import type { Book } from './book.ts';

export type DirectiveNode = ContainerDirective | LeafDirective | TextDirective;

export class BookError extends Error {
  constructor(
    message: string,
    readonly line?: number,
  ) {
    super(message);
  }
}

export interface RenderContext {
  book: Book;
  publicDir: string;
  /** Running "No. n" counter for :::work entries. */
  works: number;
}

interface Directive {
  type: DirectiveNode['type'];
  /**
   * `structural` directives shape the pagination and never render directly.
   * `page` directives fill a whole page on their own.
   */
  role?: 'structural' | 'page';
  required?: string[];
  render?: (node: DirectiveNode, state: State, ctx: RenderContext) => ElementContent | ElementContent[];
}

const PLACEHOLDER_SCORE = '/scores/placeholder.png';

export const directives: Record<string, Directive> = {
  // ── Structure ──────────────────────────────────────────────
  /** :::cover … ::: The front cover. Must come first. */
  cover: { type: 'containerDirective', role: 'structural' },
  /** :::back … ::: The back cover. Always lands on a left-hand page. */
  back: { type: 'containerDirective', role: 'structural' },
  /** ::pagebreak  Continue on the next page. */
  pagebreak: { type: 'leafDirective', role: 'structural' },
  /** ::part[Recordings]  Groups the following headings under a heading in the contents. */
  part: { type: 'leafDirective', role: 'structural' },

  // ── Full pages ─────────────────────────────────────────────
  /** ::score{src alt caption}  A full-page engraved score; a placeholder lead sheet if src is omitted. */
  score: {
    type: 'leafDirective',
    role: 'page',
    render: (node, _state, ctx) => plate(node, 'score', asset(node, attr(node, 'src') ?? PLACEHOLDER_SCORE, ctx)),
  },
  /** ::plate{src kind=portrait|figure alt caption}  A full-page photograph or illustration. */
  plate: {
    type: 'leafDirective',
    role: 'page',
    required: ['src'],
    render: (node, _state, ctx) => {
      const kind = attr(node, 'kind') ?? 'figure';
      if (kind !== 'portrait' && kind !== 'figure') throw fail(node, `kind must be "portrait" or "figure", not "${kind}"`);
      return plate(node, kind, asset(node, attr(node, 'src')!, ctx));
    },
  },

  // ── Blocks ─────────────────────────────────────────────────
  /** ::contents  The table of contents, built from page titles. */
  contents: { type: 'leafDirective', render: (_node, _state, ctx) => contents(ctx.book) },

  /** ::youtube{id aspect=16/9|4/3|1/1}  A click-to-play video. */
  youtube: {
    type: 'leafDirective',
    required: ['id'],
    render: (node) => {
      const id = attr(node, 'id')!;
      if (!/^[\w-]{11}$/.test(id)) throw fail(node, `"${id}" is not a YouTube video id (the 11 characters after watch?v=)`);
      const [w, hgt] = (attr(node, 'aspect') ?? '16/9').split(/[/:]/).map(Number);
      if (!w || !hgt) throw fail(node, 'aspect must look like 16/9');
      const title = toString(node) || 'YouTube video';
      return h('figure.yt-figure', [
        h(
          'div.yt',
          {
            style: `aspect-ratio: ${w} / ${hgt}; max-width: calc(60cqi * ${(w / hgt).toFixed(4)})`,
            dataYt: id,
            dataTitle: title,
          },
          h('button.yt-play', { type: 'button', ariaLabel: `Play ${title}` }, [
            h('img', { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: '', loading: 'lazy', decoding: 'async' }),
            h('span.yt-icon', { ariaHidden: 'true' }),
          ]),
        ),
        h('figcaption', h('a.small-link', external(`https://www.youtube.com/watch?v=${id}`), 'Watch on YouTube →')),
      ]);
    },
  },

  /** ::figure{src alt caption width=60%}  An image within the text. */
  figure: {
    type: 'leafDirective',
    required: ['src'],
    render: (node, _state, ctx) => {
      const caption = attr(node, 'caption');
      return h('figure.figure', [
        h('img', {
          src: asset(node, attr(node, 'src')!, ctx),
          alt: attr(node, 'alt') ?? '',
          loading: 'lazy',
          style: `width: ${attr(node, 'width') ?? '100%'}`,
        }),
        caption ? h('figcaption', caption) : [],
      ]);
    },
  },

  /** :::work{title role year href label} … :::  A numbered entry in a catalogue of works. */
  work: {
    type: 'containerDirective',
    required: ['title'],
    render: (node, state, ctx) => {
      const href = attr(node, 'href');
      const meta = [attr(node, 'role'), attr(node, 'year')].filter(Boolean).join(', ');
      return h('section.work', [
        h('h3.work-title', [h('span.work-no', `No. ${++ctx.works}`), ' ', attr(node, 'title')!]),
        meta ? h('p.work-role', meta) : [],
        ...state.all(node),
        href ? h('a.small-link', { href, ...external(href) }, `${attr(node, 'label') ?? 'Visit'} →`) : [],
      ]);
    },
  },

  /** :::links … :::  A list of links, set in a centred row of small capitals. */
  links: { type: 'containerDirective', render: (node, state) => h('nav.page-links', state.all(node)) },

  /** ::staff[Con spirito]  A short staff with a clef, with an optional tempo marking above. */
  staff: {
    type: 'leafDirective',
    render: (node) => h('div.staff-block', { ariaHidden: 'true' }, [label(node, 'span.score-marking'), staff()]),
  },

  /** ::signature[T. C. · Pittsburgh, 2026]  A right-aligned sign-off. */
  signature: { type: 'leafDirective', render: (node, state) => h('p.signature', state.all(node)) },

  /** ::continued[Works]  A running head for a section carried over from the previous page. */
  continued: { type: 'leafDirective', render: (node, state) => h('p.running-head', [...state.all(node), ' (continued)']) },

  // ── Inline ─────────────────────────────────────────────────
  /** :download[Résumé (PDF)]{href=/resume.pdf}  A link that downloads the file. */
  download: {
    type: 'textDirective',
    required: ['href'],
    render: (node, state, ctx) => h('a', { href: asset(node, attr(node, 'href')!, ctx), download: true }, state.all(node)),
  },
  /** :sc[Text]  Small capitals. */
  sc: { type: 'textDirective', render: (node, state) => h('span.sc', state.all(node)) },
  /** :pageref{to=biography}  The page number of a titled page, linked. With a label: "Biography, p. 4". */
  pageref: {
    type: 'textDirective',
    required: ['to'],
    render: (node, state, ctx) => {
      const to = attr(node, 'to')!;
      const page = ctx.book.pageOf.get(to);
      if (page === undefined) throw fail(node, `no page has the id "${to}"`);
      const text = node.children.length ? [...state.all(node), `, p. ${page}`] : [`p. ${page}`];
      return h('a', { href: `#${to}` }, text);
    },
  },
};

/** Looks up a directive, checking its syntax and required attributes. */
export function lookup(node: DirectiveNode): Directive {
  const spec = directives[node.name];
  const used = syntax(node.type) + node.name;
  if (!spec) throw fail(node, `unknown directive ${used}. Available: ${Object.keys(directives).join(', ')}`);
  if (spec.type !== node.type) throw fail(node, `${used} should be written ${syntax(spec.type)}${node.name}`);
  for (const name of spec.required ?? []) {
    if (!attr(node, name)) throw fail(node, `${used} needs ${name}="…"`);
  }
  return spec;
}

export function fail(node: { position?: { start: { line: number } } }, message: string) {
  return new BookError(message, node.position?.start.line);
}

export function attr(node: DirectiveNode, name: string) {
  return node.attributes?.[name] ?? undefined;
}

/** Checks that a site path like /images/x.jpg exists in public/. */
function asset(node: DirectiveNode, src: string, ctx: RenderContext) {
  if (src.startsWith('/') && !existsSync(path.join(ctx.publicDir, src))) throw fail(node, `${src} not found in public/`);
  return src;
}

export function syntax(type: DirectiveNode['type']) {
  return { textDirective: ':', leafDirective: '::', containerDirective: ':::' }[type];
}

function external(href: string) {
  return /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function label(node: DirectiveNode, selector: string) {
  const text = toString(node);
  return text ? h(selector, text) : [];
}

export function staff() {
  return h('div.staff', { ariaHidden: 'true' }, h('span.staff-clef', '𝄞'));
}

function plate(node: DirectiveNode, kind: string, src: string) {
  const caption = attr(node, 'caption');
  return h(`figure.plate.plate--${kind}`, [
    h('img', { src, alt: attr(node, 'alt') ?? '', loading: 'lazy', decoding: 'async' }),
    caption ? h('figcaption', caption) : [],
  ]);
}

function contents(book: Book) {
  // Consecutive entries in the same part share one group heading.
  const blocks: { group?: string; entries: Book['toc'] }[] = [];
  for (const entry of book.toc) {
    const last = blocks.at(-1);
    if (last && entry.group && last.group === entry.group) last.entries.push(entry);
    else blocks.push({ group: entry.group, entries: [entry] });
  }
  return h(
    'nav.toc',
    { id: 'toc', ariaLabel: 'Table of contents' },
    blocks.map((block) => [
      block.group ? h('h3.toc-group', block.group) : [],
      h(
        'ol',
        { className: block.group ? ['toc-list', 'toc-list--grouped'] : ['toc-list'] },
        block.entries.map((e) =>
          h(
            'li',
            h('a.toc-link', { href: `#${e.id}` }, [
              h('span.toc-title', [e.title, e.detail ? h('span.toc-detail', e.detail) : []]),
              h('span.toc-leader', { ariaHidden: 'true' }),
              h('span.toc-page', String(e.page)),
            ]),
          ),
        ),
      ),
    ]).flat(),
  );
}
