// A small Markdown parser covering what book.md uses:
//
//   # Headings {key="value"}        paragraphs, hard breaks (line ending in \)
//   - lists                         --- rules             <!-- comments -->
//   *em* _em_ **strong** [links](url)  &entities;  "smart quotes" -- dashes
//
// plus generic directives:
//
//   :name[label]{attrs}             inline
//   ::name[label]{attrs}            a block on its own line
//   :::name[label]{attrs} … :::     a container of blocks (may nest)
//
// It produces a plain tree and knows nothing about the DOM, so the deploy
// check can run it in Node.

export type Attrs = Record<string, string>;

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'em' | 'strong'; children: Inline[] }
  | { type: 'link'; href: string; children: Inline[] }
  | { type: 'break' }
  | { type: 'directive'; name: string; label: Inline[]; attrs: Attrs; line: number };

export type Block =
  | { type: 'heading'; depth: number; children: Inline[]; attrs: Attrs; line: number }
  | { type: 'paragraph'; children: Inline[]; line: number }
  | { type: 'list'; items: Inline[][]; line: number }
  | { type: 'rule'; line: number }
  | Directive;

export interface Directive {
  type: 'directive';
  kind: 'leaf' | 'container';
  name: string;
  label: Inline[];
  attrs: Attrs;
  children: Block[];
  line: number;
}

export class BookError extends Error {
  constructor(
    message: string,
    readonly line?: number,
  ) {
    super(message);
  }
}

const HEADING = /^(#{1,6})\s+(.*?)\s*$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const ITEM = /^\s*[-*+]\s+(.*)$/;
const CONTAINER = /^(:{3,})([a-z][\w-]*)(.*)$/i;
const LEAF = /^::([a-z][\w-]*)(.*)$/i;
const FENCE = /^:{3,}\s*$/;

export function parse(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;

  const startsBlock = (line: string) =>
    HEADING.test(line) || RULE.test(line) || ITEM.test(line) || LEAF.test(line) || CONTAINER.test(line) || FENCE.test(line);

  function blocks(container?: Directive): Block[] {
    const out: Block[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const number = i + 1;
      let m: RegExpMatchArray | null;

      if (!line.trim()) {
        i++;
      } else if (FENCE.test(line)) {
        if (!container) throw new BookError('closing ::: without an opening :::name', number);
        i++;
        return out;
      } else if (line.trimStart().startsWith('<!--')) {
        while (i < lines.length && !lines[i].includes('-->')) i++;
        i++;
      } else if ((m = line.match(CONTAINER))) {
        i++;
        const node: Directive = { type: 'directive', kind: 'container', name: m[2], ...suffix(m[3], number), children: [], line: number };
        node.children = blocks(node);
        out.push(node);
      } else if ((m = line.match(LEAF))) {
        i++;
        out.push({ type: 'directive', kind: 'leaf', name: m[1], ...suffix(m[2], number), children: [], line: number });
      } else if ((m = line.match(HEADING))) {
        i++;
        const [text, attrs] = trailingAttrs(m[2]);
        out.push({ type: 'heading', depth: m[1].length, children: inline(text, number), attrs, line: number });
      } else if (RULE.test(line)) {
        i++;
        out.push({ type: 'rule', line: number });
      } else if (ITEM.test(line)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].trim()) {
          const item = lines[i].match(ITEM);
          if (item) items.push(item[1]);
          else if (/^\s/.test(lines[i])) items[items.length - 1] += '\n' + lines[i].trim();
          else break;
          i++;
        }
        out.push({ type: 'list', items: items.map((text) => inline(text, number)), line: number });
      } else {
        const text: string[] = [];
        while (i < lines.length && lines[i].trim() && (text.length === 0 || !startsBlock(lines[i]))) text.push(lines[i++]);
        out.push({ type: 'paragraph', children: inline(text.join('\n'), number), line: number });
      }
    }
    if (container) throw new BookError(`:::${container.name} is never closed with :::`, container.line);
    return out;
  }

  return blocks();
}

/** Parses `[label]{attrs}` after a block directive's name; nothing else may follow. */
function suffix(rest: string, line: number) {
  let label: Inline[] = [];
  let attrs: Attrs = {};
  let k = 0;
  if (rest[k] === '[') {
    const end = closing(rest, k, '[', ']');
    if (end < 0) throw new BookError('unclosed [ in directive label', line);
    label = inline(rest.slice(k + 1, end), line);
    k = end + 1;
  }
  if (rest[k] === '{') {
    const end = rest.indexOf('}', k);
    if (end < 0) throw new BookError('unclosed { in directive attributes', line);
    attrs = parseAttrs(rest.slice(k + 1, end));
    k = end + 1;
  }
  if (rest.slice(k).trim()) throw new BookError(`unexpected "${rest.slice(k).trim()}" after directive`, line);
  return { label, attrs };
}

function trailingAttrs(text: string): [string, Attrs] {
  const m = text.match(/\s*\{([^{}]*)\}$/);
  return m ? [text.slice(0, m.index), parseAttrs(m[1])] : [text, {}];
}

function parseAttrs(text: string): Attrs {
  const attrs: Attrs = {};
  for (const m of text.matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g)) {
    attrs[m[1]] = decode(m[2] ?? m[3] ?? m[4] ?? 'true');
  }
  return attrs;
}

/** Index of the bracket closing the one at `start`, allowing nesting. */
function closing(text: string, start: number, open: string, close: string) {
  let depth = 0;
  for (let k = start; k < text.length; k++) {
    if (text[k] === '\\') k++;
    else if (text[k] === open) depth++;
    else if (text[k] === close && --depth === 0) return k;
  }
  return -1;
}

export function inline(text: string, line: number): Inline[] {
  const out: Inline[] = [];
  let buffer = '';
  let bufferStart = 0;
  const flush = (at: number) => {
    if (buffer) out.push({ type: 'text', value: typeset(decode(buffer), text[bufferStart - 1] ?? '') });
    buffer = '';
    bufferStart = at;
  };

  let k = 0;
  while (k < text.length) {
    const c = text[k];
    const rest = text.slice(k);
    let m: RegExpMatchArray | null;
    let found: ReturnType<typeof link>;

    if (c === '\\' && text[k + 1] === '\n') {
      flush(k + 2);
      out.push({ type: 'break' });
      k += 2;
    } else if (c === '\\' && k + 1 < text.length) {
      buffer += text[k + 1];
      k += 2;
    } else if (c === '\n') {
      buffer += ' ';
      k++;
    } else if (rest.startsWith('**') && (m = rest.match(/^\*\*(?=\S)([\s\S]*?\S)\*\*/))) {
      flush(k + m[0].length);
      out.push({ type: 'strong', children: inline(m[1], line) });
      k += m[0].length;
    } else if ((c === '*' || (c === '_' && !/\w/.test(text[k - 1] ?? ''))) && (m = rest.match(c === '*' ? /^\*(?=\S)([\s\S]*?\S)\*/ : /^_(?=\S)([\s\S]*?\S)_(?!\w)/))) {
      flush(k + m[0].length);
      out.push({ type: 'em', children: inline(m[1], line) });
      k += m[0].length;
    } else if (c === '[' && (found = link(text, k))) {
      flush(found.end);
      out.push({ type: 'link', href: found.href, children: inline(found.label, line) });
      k = found.end;
    } else if (c === ':' && !/\w/.test(text[k - 1] ?? '') && (m = rest.match(/^:([a-z][\w-]*)(?=[[{])/i))) {
      // Inline directives need a [label] or {attrs}, so "Note:this" stays text.
      flush(k);
      let end = k + m[0].length;
      let label: Inline[] = [];
      let attrs: Attrs = {};
      if (text[end] === '[') {
        const close = closing(text, end, '[', ']');
        if (close < 0) throw new BookError(`unclosed [ after :${m[1]}`, line);
        label = inline(text.slice(end + 1, close), line);
        end = close + 1;
      }
      if (text[end] === '{') {
        const close = text.indexOf('}', end);
        if (close < 0) throw new BookError(`unclosed { after :${m[1]}`, line);
        attrs = parseAttrs(text.slice(end + 1, close));
        end = close + 1;
      }
      out.push({ type: 'directive', name: m[1], label, attrs, line });
      k = end;
      bufferStart = end;
    } else {
      if (!buffer) bufferStart = k;
      buffer += c;
      k++;
    }
  }
  flush(k);
  return out;
}

/** A `[label](href)` link starting at `start`, if there is one. */
function link(text: string, start: number) {
  const close = closing(text, start, '[', ']');
  if (close < 0 || text[close + 1] !== '(') return null;
  const end = text.indexOf(')', close);
  if (end < 0) return null;
  return { label: text.slice(start + 1, close), href: text.slice(close + 2, end).trim(), end: end + 1 };
}

const ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", mdash: '—', ndash: '–', hellip: '…', shy: '­' };

function decode(text: string) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] === '#') return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return ENTITIES[name.toLowerCase()] ?? whole;
  });
}

/** Curly quotes, dashes and ellipses, as a typesetter would set them. */
function typeset(text: string, before: string) {
  let out = '';
  let prev = before;
  for (const c of text) {
    const opening = prev === '' || /[\s([{—–-]/.test(prev);
    out += c === '"' ? (opening ? '“' : '”') : c === "'" ? (opening ? '‘' : '’') : c;
    prev = c;
  }
  return out.replace(/---/g, '—').replace(/--/g, '–').replace(/\.\.\./g, '…');
}

/** The plain text of inline content, e.g. for ids and labels. */
export function plainText(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.type === 'text' ? n.value :
      n.type === 'break' ? ' ' :
        'children' in n ? plainText(n.children)
          : plainText(n.label)))
    .join('');
}
