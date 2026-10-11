// Loads book.md, lays it out as pages, and opens the book.

import { parseBook } from './book.js';
import { BookError } from './markdown.js';
import { initReader, initVideos } from './reader.js';
import { fill, renderBook } from './render.js';

const root = document.querySelector<HTMLElement>('[data-book]')!;
const source = root.dataset.source ?? '/book.md';

try {
  const response = await fetch(source, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Couldn't load ${source} (${response.status})`);
  const book = parseBook(await response.text());

  renderBook(book, root, { plate: root.dataset.plate });
  const hasToc = book.toc.length > 0 && !!document.getElementById('toc');
  for (const el of document.querySelectorAll<HTMLElement>('[data-needs-toc]')) el.hidden = !hasToc;
  const total = document.querySelector('[data-pager-total]');
  if (total) total.textContent = String(book.pages.length);

  initReader(root);
  initVideos();
} catch (error) {
  console.error(error);
  const where = error instanceof BookError && error.line ? `${source}, line ${error.line}: ` : '';
  root.append(fill('book-error', { message: where + (error as Error).message }));
}
