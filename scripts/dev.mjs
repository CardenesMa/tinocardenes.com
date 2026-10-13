// pnpm dev: recompiles the TypeScript and the Tailwind CSS on save and serves
// site/ at http://localhost:8000. Does incremental building but you have to reload the page to see changes

import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve('site');
const port = Number(process.env.PORT ?? 8000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

spawn('tsc', ['--watch', '--preserveWatchOutput'], { stdio: 'inherit' });
spawn('tailwindcss', ['-i', 'src/styles.css', '-o', 'site/styles.css', '--watch'], { stdio: 'inherit' });

// Super crude server that just sends literally the files requested 
createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end('Not found');
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving http://localhost:${port}`));
