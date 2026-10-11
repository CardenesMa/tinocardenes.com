// Turns the pages as written into the pages of the book, at the size they'll be
// shown:
//
//   • text a little too long for its page has its lines set closer together;
//   • text that still doesn't fit flows onto a new page after it, splitting a
//     paragraph or list between lines if need be;
//   • a page that must open a spread (a `#` title, the back cover) gets a blank
//     manuscript page in front of it if it would otherwise land on the right;
//   • the book ends on a complete spread, unless it ends with its back cover;
//   • then pages are numbered, and so are the references to them.
//
// Pages are a fixed size whose text doesn't scale with them, so how much fits
// depends on the window. reader.ts runs this again when the page size changes.

import { blankPage, continuationPage } from './render.js';

/** The most a page's spacing is tightened (as a fraction of the usual) to avoid a new page. */
const MAX_SQUEEZE = 0.8;

export interface PageSize {
  width: number;
  height: number;
  portrait: boolean;
}

/** Lays out `written` at `size`, measuring each page in `host` (which must be in the document). */
export function paginate(written: HTMLElement[], size: PageSize, host: HTMLElement): HTMLElement[] {
  const ruler = document.createElement('div');
  ruler.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden';
  host.append(ruler);

  const pages: HTMLElement[] = [];
  const queue = [...written];
  for (let page; (page = queue.shift()); ) {
    // Left-hand pages are the even ones; the cover is page 1, on the right.
    if (page.dataset.left === 'true' && pages.length % 2 === 0) pages.push(blankPage());
    const side = size.portrait || pages.length % 2 === 0 ? '--right' : '--left';
    if (page.classList.contains('page--text')) {
      page.classList.add(side);
      page.style.cssText = `position:relative;width:${size.width}px;height:${size.height}px`;
      ruler.append(page);
      const rest = overflow(page);
      if (rest) queue.unshift(rest);
      page.classList.remove(side);
      page.style.cssText = '';
      page.remove();
    }
    pages.push(page);
  }
  if (pages.length % 2 === 0 && !pages.at(-1)!.classList.contains('page--back')) pages.push(blankPage());
  ruler.remove();

  number(pages);
  return pages;
}

/**
 * Fits what's on `page` onto it by setting the lines closer (--squeeze, see
 * .page-body), or else moves whatever doesn't fit onto a new page, and returns that page.
 */
function overflow(page: HTMLElement): HTMLElement | null {
  const body = page.querySelector<HTMLElement>('[data-body]')!;
  const limit = body.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom);
  const fits = () => ![...body.children].some((child) => child.getBoundingClientRect().bottom > limit + 0.5);
  if (fits()) return null;
  for (let squeeze = 0.98; squeeze >= MAX_SQUEEZE - 0.001; squeeze -= 0.02) {
    body.style.setProperty('--squeeze', squeeze.toFixed(2));
    if (fits()) return null;
  }
  body.style.removeProperty('--squeeze');

  const rest = cut(body, limit, true) ?? [];
  if (!rest.length) return null;
  const next = continuationPage(page);
  next.querySelector('[data-body]')!.append(...rest);
  return next;
}

/**
 * The children of `parent` (or parts of them) that reach below `limit`, removed
 * from it. On a page (`keep`) something has to stay, or the next page would
 * overflow the same way; elsewhere, null means none of `parent` fits, so it moves whole.
 */
function cut(parent: Element, limit: number, keep: boolean): Element[] | null {
  const children = [...parent.children];
  const i = children.findIndex((child) => child.getBoundingClientRect().bottom > limit + 0.5);
  if (i < 0) return [];

  const part = split(children[i], limit);
  if (part) return [part, ...remove(children.slice(i + 1))];

  // Move the whole child, keeping a heading with what follows it.
  let from = i;
  while (from > 0 && /^(H\d|HEADER)$/.test(children[from - 1].tagName)) from--;
  if (from === 0) {
    if (!keep) return null;
    from = i || 1;
  }
  return remove(children.slice(from));
}

/** Splits a paragraph between lines, a list between items, or a :::work between its parts. Returns the part that moves on. */
function split(el: Element, limit: number): Element | null {
  if (el.matches('p:not([class])')) return splitParagraph(el as HTMLElement, limit);
  // A work keeps its heading with its picture; its description and link can go on.
  if (el.matches('.work, .work > div')) {
    // The link at the foot doesn't go on alone: the end of the description goes with it.
    const link = el.lastElementChild;
    if (el.matches('.work') && link?.matches('a') && link.previousElementSibling!.getBoundingClientRect().bottom <= limit + 0.5) {
      limit -= link.getBoundingClientRect().height;
    }
    const parts = cut(el, limit, false);
    if (!parts?.length) return null;
    const rest = el.cloneNode(false) as Element;
    rest.append(...parts);
    return rest;
  }
  if (el.matches('ul, ol')) {
    const items = [...el.children];
    const i = items.findIndex((item) => item.getBoundingClientRect().bottom > limit + 0.5);
    if (i <= 0) return null; // not even the first item fits
    const rest = el.cloneNode(false) as Element;
    rest.removeAttribute('id');
    rest.append(...items.slice(i));
    return rest;
  }
  return null;
}

/** Splits before the first word whose line ends below `limit` (a hyphenated word moves whole). */
function splitParagraph(p: HTMLElement, limit: number): Element | null {
  // A letter's box is shorter than its line; the line reaches half the difference further down.
  const lineHeight = parseFloat(getComputedStyle(p).lineHeight);
  const range = document.createRange();
  const words = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  for (let node; (node = words.nextNode() as Text | null); ) {
    for (const word of node.data.matchAll(/\S+/g)) {
      const end = word.index + word[0].length;
      range.setStart(node, end - 1);
      range.setEnd(node, end);
      const letter = range.getBoundingClientRect();
      if ((letter.top + letter.bottom) / 2 + lineHeight / 2 <= limit + 0.5) continue;

      range.setStart(p, 0);
      range.setEnd(node, word.index);
      if (!range.toString().trim()) return null; // not even the first line fits
      range.setStart(node, word.index);
      range.setEnd(p, p.childNodes.length);
      const rest = p.cloneNode(false) as HTMLElement;
      rest.append(range.extractContents());
      // The first part's last line is a full line, so it's justified too.
      p.dataset.split = '';
      return rest;
    }
  }
  return null;
}

function remove(elements: Element[]) {
  for (const el of elements) el.remove();
  return elements;
}

/** Numbers the pages and fills in the references to them (contents, :pageref). */
function number(pages: HTMLElement[]) {
  const pageOf = new Map<string, number>();
  pages.forEach((page, i) => {
    const n = i + 1;
    if (!page.id) page.id = `p${n}`;
    pageOf.set(page.id, n);
    for (const el of page.querySelectorAll('[id]')) if (!pageOf.has(el.id)) pageOf.set(el.id, n);
    const label = page.querySelector('[data-page-number]');
    if (label) {
      label.textContent = String(n);
      label.setAttribute('aria-label', `Page ${n}`);
    }
  });
  for (const page of pages) {
    for (const ref of page.querySelectorAll<HTMLElement>('[data-page-of]')) {
      ref.textContent = String(pageOf.get(ref.dataset.pageOf!) ?? '?');
    }
  }
}
