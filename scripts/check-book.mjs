// Run after `tsc` on every build: parses site/book.md with the same code the
// browser uses and fails the deploy on a bad directive or a missing file.

import { existsSync, readFileSync } from 'node:fs';
import { parseBook } from '../site/js/book.js';

const file = 'site/book.md';
try {
  const book = parseBook(readFileSync(file, 'utf8'));
  // ensure that all required directives are there and not missing
  const missing = book.files.filter((f) => !existsSync(`site${f.path}`));
  for (const f of missing) console.error(`${file}:${f.line}  ${f.path} not found in site/`);
  if (missing.length) process.exit(1);
  console.log(`${file}: ${book.pages.length} pages before text flows on, ${book.toc.length} contents entries`);
} catch (error) {
  console.error(error.line ? `${file}:${error.line}  ${error.message}` : error);
  process.exit(1);
}
