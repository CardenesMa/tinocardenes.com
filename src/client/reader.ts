// Turns the stacked spreads into a book: one spread visible at a time,
// navigated by links, arrows, keyboard and swipe, with a page-turn animation
// on wide screens. Without JavaScript every spread simply stacks vertically.

const TURN_MS = 850;

const book = document.querySelector<HTMLElement>('[data-book]');
if (book) initReader(book);
initVideos();

function initReader(book: HTMLElement) {
  const spreads = [...book.querySelectorAll<HTMLElement>('[data-spread]')];
  const pagerPages = document.querySelector<HTMLElement>('[data-pager-pages]');
  const announcer = document.querySelector<HTMLElement>('[data-announcer]');
  const toc = document.getElementById('toc');
  const twoUp = matchMedia('(min-width: 860px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let current = Math.max(0, spreads.findIndex((s) => s.classList.contains('is-current')));
  let turning = false;
  // A request made mid-turn (e.g. pressing Back twice) runs once the page lands.
  let queued: { target: number; record: boolean } | null = null;

  /** Index of the spread containing the element with this id. */
  const spreadOf = (id: string) => {
    const spread = id ? document.getElementById(id)?.closest<HTMLElement>('[data-spread]') : null;
    return spread ? spreads.indexOf(spread) : -1;
  };

  function updateChrome() {
    const spread = spreads[current];
    book.dataset.mode = spread.dataset.mode;
    book.toggleAttribute('data-at-toc', !!toc && spread.contains(toc));
    if (pagerPages) pagerPages.textContent = spread.dataset.pages ?? '';
    for (const el of document.querySelectorAll<HTMLButtonElement>('button[data-turn="prev"]')) el.disabled = current === 0;
    for (const el of document.querySelectorAll<HTMLButtonElement>('button[data-turn="next"]')) el.disabled = current === spreads.length - 1;
    // Lazy images inside hidden spreads never load, so warm up the neighbours.
    for (const s of spreads.slice(Math.max(0, current - 1), current + 2)) {
      for (const img of s.querySelectorAll('img')) img.loading = 'eager';
    }
  }

  async function go(target: number, { record = true } = {}) {
    if (turning) {
      queued = { target, record };
      return;
    }
    if (target === current || target < 0 || target >= spreads.length) return;
    const from = spreads[current];
    const to = spreads[target];
    const direction = target > current ? 1 : -1;

    from.dispatchEvent(new CustomEvent('spread:leave', { bubbles: true }));
    turning = true;
    current = target;

    if (twoUp.matches && !reducedMotion.matches) {
      await turnPage(from, to, direction);
    } else {
      from.classList.remove('is-current');
      to.classList.add('is-current');
      updateChrome();
      if (!reducedMotion.matches) to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    }
    turning = false;

    if (record) history.pushState(null, '', to.dataset.anchor === 'cover' ? location.pathname : `#${to.dataset.anchor}`);
    if (book.getBoundingClientRect().top < 0) book.scrollIntoView({ block: 'start' });
    to.focus({ preventScroll: true });
    if (announcer) announcer.textContent = `${to.dataset.title}, page ${to.dataset.pages}`;

    if (queued) {
      const next = queued;
      queued = null;
      go(next.target, { record: next.record });
    }
  }

  // The page turn: the outgoing page is cloned onto a "leaf" that rotates
  // around the spine, revealing the incoming spread underneath. The leaf's
  // back face carries a clone of the incoming page it lands on.
  async function turnPage(from: HTMLElement, to: HTMLElement, direction: 1 | -1) {
    const [stillSide, leafSide] = direction === 1 ? (['left', 'right'] as const) : (['right', 'left'] as const);
    const page = (spread: HTMLElement, side: string) => spread.querySelector<HTMLElement>(`:scope > .page--${side}`);

    const overlay = el('div', 'turn');
    overlay.dataset.direction = direction === 1 ? 'next' : 'prev';
    const still = el('div', 'turn-still');
    still.append(face(page(from, stillSide)));
    const leaf = el('div', 'turn-leaf');
    const front = el('div', 'turn-face turn-front');
    front.append(face(page(from, leafSide)));
    const back = el('div', 'turn-face turn-back');
    back.append(face(page(to, stillSide)));
    leaf.append(front, back);
    overlay.append(still, leaf);

    // The leaf lands on this page, so keep it hidden until then (it would show
    // through when the still half is empty, as when opening the cover).
    const landing = page(to, stillSide);
    if (landing) landing.style.visibility = 'hidden';

    from.classList.remove('is-current');
    to.classList.add('is-current');
    updateChrome();
    book.append(overlay);

    const timing = { duration: TURN_MS, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' } as const;
    // Darken each face as it stands upright, as a lifted page catches less light.
    const shade = { ...timing, pseudoElement: '::before' };
    await Promise.all([
      leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${-180 * direction}deg)` }], timing).finished,
      front.animate([{ opacity: 0 }, { opacity: 0.6 }], { ...shade, easing: 'ease-in', duration: TURN_MS / 2 }).finished,
      back.animate([{ opacity: 0.6 }, { opacity: 0 }], { ...shade, easing: 'ease-out', delay: TURN_MS / 2, duration: TURN_MS / 2 }).finished,
    ]);
    if (landing) landing.style.visibility = '';
    overlay.remove();
  }

  function face(page: HTMLElement | null) {
    if (!page) return el('div', 'page page--empty');
    const copy = page.cloneNode(true) as HTMLElement;
    for (const node of copy.querySelectorAll('[id]')) node.removeAttribute('id');
    copy.removeAttribute('id');
    for (const node of copy.querySelectorAll('iframe')) node.remove();
    for (const node of copy.querySelectorAll<HTMLElement>('.yt-play')) node.hidden = false;
    for (const img of copy.querySelectorAll('img')) img.loading = 'eager';
    copy.inert = true;
    return copy;
  }

  // In-page links (contents, ribbon, cross-references) turn pages instead of jumping.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const control = (event.target as Element).closest<HTMLElement>('[data-turn], a[href^="#"]');
    if (!control) return;
    const turn = control.dataset.turn;
    const target = turn === 'next' ? current + 1 : turn === 'prev' ? current - 1 : spreadOf(control.getAttribute('href')!.slice(1));
    if (target < 0) return;
    event.preventDefault();
    go(target);
  });

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as Element).closest('input, textarea, select, iframe, [contenteditable]')) return;
    const keys: Record<string, () => number> = {
      ArrowRight: () => current + 1,
      PageDown: () => current + 1,
      ArrowLeft: () => current - 1,
      PageUp: () => current - 1,
      Home: () => 0,
      End: () => spreads.length - 1,
      c: () => spreadOf('toc'),
      C: () => spreadOf('toc'),
    };
    const next = keys[event.key]?.();
    if (next === undefined || next < 0) return;
    event.preventDefault();
    go(next);
  });

  let touchStart: { x: number; y: number } | null = null;
  book.addEventListener('touchstart', (e) => (touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }), { passive: true });
  book.addEventListener(
    'touchend',
    (e) => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  // Back/forward buttons and hand-edited hashes.
  const syncFromUrl = () => go(Math.max(0, spreadOf(decodeURIComponent(location.hash.slice(1)))), { record: false });
  addEventListener('popstate', syncFromUrl);
  addEventListener('hashchange', syncFromUrl);

  updateChrome();
}

// Click-to-load YouTube players: only a thumbnail is fetched until the reader
// presses play, and the player is torn down again when the page turns.
function initVideos() {
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

  document.addEventListener('spread:leave', (event) => {
    for (const box of (event.target as Element).querySelectorAll<HTMLElement>('[data-yt]')) {
      box.querySelector('iframe')?.remove();
      const button = box.querySelector<HTMLButtonElement>('.yt-play');
      if (button) button.hidden = false;
    }
  });
}

function el(tag: string, className: string) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}
