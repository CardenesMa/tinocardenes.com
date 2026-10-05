// pnpm build  → renders content/book.md into dist/
// pnpm dev    → the same, then serves dist/ and rebuilds + reloads the browser on every save

import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, watch, writeFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { loadBook } from './book.ts';
import { BookError } from './directives.ts';
import { renderDocument } from './render.ts';

const root = path.resolve(import.meta.dirname, '..');
const paths = {
  book: path.join(root, 'content/book.md'),
  public: path.join(root, 'public'),
  client: path.join(root, 'src/client'),
  dist: path.join(root, 'dist'),
};
const dev = process.argv.includes('--dev');

async function build() {
  const started = performance.now();
  const book = await loadBook(readFileSync(paths.book, 'utf8'));
  const html = renderDocument(book, { publicDir: paths.public, dev });

  rmSync(paths.dist, { recursive: true, force: true });
  mkdirSync(paths.dist);
  cpSync(paths.public, paths.dist, { recursive: true });
  writeFileSync(path.join(paths.dist, 'index.html'), html);
  await esbuild.build({
    entryPoints: { reader: path.join(paths.client, 'reader.ts'), styles: path.join(paths.client, 'styles.css') },
    outdir: paths.dist,
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    format: 'esm',
    target: 'es2022',
    loader: { '.woff2': 'file', '.woff': 'file' },
    assetNames: 'fonts/[name]-[hash]',
    logLevel: 'warning',
  });

  console.log(`Built ${book.pages.length} pages in ${Math.round(performance.now() - started)} ms`);
}

function report(error: unknown) {
  if (error instanceof BookError) {
    const where = path.relative(process.cwd(), paths.book) + (error.line ? `:${error.line}` : '');
    console.error(`\n${where}  ${error.message}\n`);
  } else {
    console.error(error);
  }
}

if (!dev) {
  await build().catch((error) => {
    report(error);
    process.exit(1);
  });
} else {
  await build().catch(report);
  serve(Number(process.env.PORT ?? 4321));
}

function serve(port: number) {
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.map': 'application/json',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
  };
  const clients = new Set<ServerResponse>();

  createServer((req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (pathname === '/__reload') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    let file = path.join(paths.dist, decodeURIComponent(pathname));
    if (!file.startsWith(paths.dist)) return void res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) return void res.writeHead(404).end('Not found');
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`Serving http://localhost:${port}, rebuilding on save`));

  let timer: NodeJS.Timeout | undefined;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      build()
        .then(() => clients.forEach((client) => client.write('data: reload\n\n')))
        .catch(report);
    }, 80);
  };
  // Changes to the build code itself restart the process via `tsx watch` (see package.json).
  for (const dir of [path.dirname(paths.book), paths.public, paths.client]) {
    watch(dir, { recursive: true }, rebuild);
  }
}
