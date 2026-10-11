// Loads book.md, lays it out as pages, and opens the book.

import { parseBook } from './book.js';
import { paginate } from './layout.js';
import { BookError } from './markdown.js';
import { initReader, initVideos } from './reader.js';
import { fill, renderPages } from './render.js';

const root = document.querySelector<HTMLElement>('[data-book]')!;
const source = root.dataset.source ?? '/book.md';

try {
  const response = await fetch(source, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Couldn't load ${source} (${response.status})`);
  const book = parseBook(await response.text());

  // How much text fits on a page depends on the fonts and on the height of
  // ::plate images, so have those before measuring.
  const plates = book.files.filter((f) => f.directive === 'plate');
  await Promise.all([
    document.fonts.ready,
    ...plates.map((f) => Object.assign(new Image(), { src: f.path }).decode().catch(() => {})),
  ]);

  initReader(root, (size) => paginate(renderPages(book, { plate: root.dataset.plate }), size, root.parentElement!));
  initVideos();
} catch (error) {
  console.error(error);
  const where = error instanceof BookError && error.line ? `${source}, line ${error.line}: ` : '';
  root.append(fill('book-error', { message: where + (error as Error).message }));
}
