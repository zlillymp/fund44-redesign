import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { getCanonicalRoutes } from '../src/lib/routes.js';

const root = new URL('../dist/', import.meta.url);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

async function serveFile(pathname) {
  const cleaned = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(root.pathname, cleaned);
  const fileInfo = await stat(candidate).catch(() => null);
  if (fileInfo?.isFile()) {
    return {
      status: 200,
      body: await readFile(candidate),
      type: mimeTypes[extname(candidate)] || 'application/octet-stream',
    };
  }

  return {
    status: 200,
    body: await readFile(new URL('index.html', root)),
    type: 'text/html; charset=utf-8',
  };
}

async function fetchText(url, options) {
  const response = await fetch(url, options);
  return {
    status: response.status,
    text: await response.text(),
    headers: response.headers,
    redirected: response.redirected,
    finalUrl: response.url,
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const asset = await serveFile(url.pathname.slice(1));
  res.writeHead(asset.status, { 'content-type': asset.type });
  res.end(asset.body);
});

await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));

try {
  const routes = getCanonicalRoutes().filter((route) => route.routeId !== 'not_found');

  for (const route of routes) {
    const response = await fetchText(`http://127.0.0.1:4173${route.path}`);
    if (response.status !== 200) {
      throw new Error(`Expected 200 for ${route.path}, got ${response.status}`);
    }
    if (!response.text.includes('<div id="app"></div>')) {
      throw new Error(`Expected SPA shell for ${route.path}`);
    }
  }

  const hashResponse = await fetchText('http://127.0.0.1:4173/#/financing');
  if (hashResponse.status !== 200) {
    throw new Error(`Expected 200 for legacy hash route, got ${hashResponse.status}`);
  }

  const entryResponse = await fetchText('http://127.0.0.1:4173/financing');
  const mainResponse = await fetchText('http://127.0.0.1:4173/');
  if (!entryResponse.text.includes('/assets/')) {
    throw new Error('Expected clean-path entry response to include built asset references.');
  }
  if (!mainResponse.text.includes('/assets/')) {
    throw new Error('Expected home entry response to include built asset references.');
  }

  console.log('Preview route smoke passed for clean-path direct loads and SPA fallback.');
} finally {
  server.close();
}
