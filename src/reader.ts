// Hands the pages to StPageFlip, which does the page turning (animation,
// dragging corners, swipes, one page at a time on narrow screens). This file
// connects it to the rest of the site: links, keys, toolbar, URL.

import { PageFlip } from 'page-flip';
import type { PageSize } from './layout.js';

// The page's proportions, and the sizes between which it scales with the window.
const PAGE = { width: 760, height: 1000, minWidth: 330, maxWidth: 1000 };

/** The size StPageFlip will give each page in `book` (see its Render.calculateBoundsRect). */
function pageSize(book: HTMLElement): PageSize {
  const width = Math.max(book.offsetWidth, PAGE.minWidth);
  // One page at a time when the book is narrower than two minWidth pages. The book is
  // at most 640px wide below the max-spread: breakpoint, so it's always one page there.
  const portrait = width < PAGE.minWidth * 2;
  const pageWidth = Math.min(portrait ? width : width / 2, PAGE.maxWidth);
  return { width: pageWidth, height: (pageWidth * PAGE.height) / PAGE.width, portrait };
}

/** Opens the book. `build` lays the pages out for a page size; it runs again whenever that changes. */
export function initReader(book: HTMLElement, build: (size: PageSize) => HTMLElement[]) {
  const frame = book.parentElement!;
  let size = pageSize(book);
  let pages = build(size);
  const pagerPages = document.querySelector<HTMLElement>('[data-pager-pages]');
  const pagerTotal = document.querySelector<HTMLElement>('[data-pager-total]');
  const announcer = document.querySelector<HTMLElement>('[data-announcer]');

  /** Index of the page that is, or contains, the element with this id. */
  const pageOf = (id: string) => (id ? pages.findIndex((page) => page.id === id || page.querySelector(`#${CSS.escape(id)}`)) : -1);
  const fromUrl = () => Math.max(0, pageOf(decodeURIComponent(location.hash.slice(1))));

  const flipbook = new PageFlip(book, {
    ...PAGE,
    size: 'stretch',
    minHeight: 395,
    maxHeight: 1316,
    showCover: true,
    usePortrait: true,
    startPage: fromUrl(),
    flippingTime: 300,
    maxShadowOpacity: 0.4,
    disableFlipByClick: false,
    mobileScrollSupport: true,
    showPageCorners: false,
  });
  flipbook.loadFromHTML(pages);

  /** The pages on view: a lone cover, a spread, or one page in portrait. */
  const visible = () => {
    const i = flipbook.getCurrentPageIndex();
    if (flipbook.getOrientation() === 'portrait' || i === 0) return [pages[i]];
    const left = i % 2 ? i : i - 1;
    return pages.slice(left, left + 2);
  };

  /** The id of the title nearest before `page` (or of the cover or back cover itself). */
  const placeOf = (page: HTMLElement) => {
    for (let i = pages.indexOf(page); i >= 0; i--) {
      const id = pages[i].querySelector('.score-title')?.id ?? (/^(cover|back)$/.test(pages[i].id) ? pages[i].id : undefined);
      if (id) return id;
    }
    return 'cover';
  };

  // A new page size fits a different amount of text on each page, so lay the
  // pages out again, then return to the same title.
  let resizing: ReturnType<typeof setTimeout>;
  addEventListener('resize', () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => {
      const next = pageSize(book);
      if (next.width === size.width && next.portrait === size.portrait) return;
      const place = placeOf(visible()[0]);
      size = next;
      pages = build(size);
      recordHistory = false;
      flipbook.updateFromHtml(pages);
      flipbook.turnToPage(Math.max(0, pageOf(place)));
      update();
    }, 250);
  });

  let recordHistory = false; // false while following the URL rather than setting it
  function update() {
    const shown = visible();
    const label = shown.map((p) => pages.indexOf(p) + 1).join('–');
    const title = shown.map((p) => p.dataset.title).find(Boolean) ?? `Page ${label}`;
    // The URL names the first titled page on view (/#biography), or the page itself (/#p5).
    const anchor = shown[0].id === 'cover' ? '' : (shown.map((p) => p.querySelector('.score-title')?.id).find(Boolean) ?? shown[0].id);

    if (pagerPages) pagerPages.textContent = label;
    if (pagerTotal) pagerTotal.textContent = String(pages.length);
    // How much of the book is still ahead, for the stack of page edges (.book::after in src/styles.css).
    const last = pages.indexOf(shown.at(-1)!);
    book.style.setProperty('--stack', String((pages.length - 1 - last) / (pages.length - 1)));
    if (announcer) announcer.textContent = `${title}, page ${label}`;
    // A closed book (front or back cover alone) is centred; see .book-frame in src/styles.css.
    const closed = shown.length === 1 && flipbook.getOrientation() === 'landscape';
    if (closed && shown[0].id === 'cover') frame.dataset.closed = 'front';
    else if (closed && shown[0].id === 'back') frame.dataset.closed = 'back';
    else delete frame.dataset.closed;
    const index = flipbook.getCurrentPageIndex();
    for (const b of document.querySelectorAll<HTMLButtonElement>('button[data-turn="prev"]')) b.disabled = index === 0;
    for (const b of document.querySelectorAll<HTMLButtonElement>('button[data-turn="next"]')) b.disabled = shown.includes(pages.at(-1)!);
    stopVideos(shown);

    // update() runs more than once per turn, so only add history when the page really changed.
    const url = anchor ? `#${anchor}` : location.pathname;
    if (recordHistory && url !== (location.hash || location.pathname)) history.pushState(null, '', url);
    recordHistory = true;
  }
  flipbook.on('init', update);
  flipbook.on('flip', update);
  flipbook.on('changeOrientation', update);
  // Slide the book open while the cover turns, not after. Only once it's really
  // turning: hovering a corner lifts it ('fold_corner'), and sliding then would
  // move the corner away from the mouse and back, over and over.
  flipbook.on('changeState', (e) => {
    if (e.data === 'read') update();
    else if (e.data === 'flipping') delete frame.dataset.closed;
  });

  const go = (index: number) => {
    if (index >= 0 && !visible().includes(pages[index])) flipbook.flip(index);
  };

  // In-page links (contents, cross-references) and the arrow buttons.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const control = (event.target as Element).closest<HTMLElement>('[data-turn], a[href^="#"]');
    if (!control) return;
    const turn = control.dataset.turn;
    if (turn === 'next') flipbook.flipNext();
    else if (turn === 'prev') flipbook.flipPrev();
    else {
      const index = pageOf(control.getAttribute('href')!.slice(1));
      if (index < 0) return;
      go(index);
    }
    event.preventDefault();
  });

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as Element).closest('input, textarea, select, [contenteditable]')) return;
    const actions: Record<string, () => void> = {
      ArrowRight: () => flipbook.flipNext(),
      PageDown: () => flipbook.flipNext(),
      ArrowLeft: () => flipbook.flipPrev(),
      PageUp: () => flipbook.flipPrev(),
      Home: () => go(0),
      End: () => go(pages.length - 1),
      c: () => go(pageOf('toc')),
      C: () => go(pageOf('toc')),
    };
    if (!actions[event.key]) return;
    event.preventDefault();
    actions[event.key]();
  });

  // Back/forward buttons and hand-edited hashes (both fire popstate): turn to
  // the page without adding history. The browser also scrolls to the id; undo that.
  addEventListener('popstate', () => {
    scrollTo(0, 0);
    const index = fromUrl();
    if (visible().includes(pages[index])) return;
    recordHistory = false;
    flipbook.flip(index);
  });
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
}

// Click-to-load YouTube players: only a thumbnail is fetched until the reader
// presses play.
export function initVideos() {
  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('.yt-play');
    const box = button?.closest<HTMLElement>('[data-yt]');
    if (!button || !box) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
    iframe.title = box.dataset.title ?? 'YouTube video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    button.hidden = true;
    box.append(iframe);
    iframe.focus();
  });
}

/** Stops any video playing on a page that has been turned away. */
function stopVideos(visible: HTMLElement[]) {
  for (const box of document.querySelectorAll<HTMLElement>('[data-yt]')) {
    if (visible.some((page) => page.contains(box))) continue;
    box.querySelector('iframe')?.remove();
    const button = box.querySelector<HTMLButtonElement>('.yt-play');
    if (button) button.hidden = false;
  }
}
