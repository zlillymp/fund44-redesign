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

  const cleanUrlCandidate = join(root.pathname, `${cleaned}.html`);
  const cleanUrlInfo = await stat(cleanUrlCandidate).catch(() => null);
  if (cleanUrlInfo?.isFile()) {
    return {
      status: cleaned === '404' ? 404 : 200,
      body: await readFile(cleanUrlCandidate),
      type: 'text/html; charset=utf-8',
    };
  }

  const indexCandidate = join(root.pathname, cleaned, 'index.html');
  const indexInfo = await stat(indexCandidate).catch(() => null);
  if (indexInfo?.isFile()) {
    return {
      status: cleaned === '404' ? 404 : 200,
      body: await readFile(indexCandidate),
      type: 'text/html; charset=utf-8',
    };
  }

  const notFoundHtml = new URL('404.html', root);
  const notFoundInfo = await stat(notFoundHtml).catch(() => null);
  if (notFoundInfo?.isFile()) {
    return {
      status: 404,
      body: await readFile(notFoundHtml),
      type: 'text/html; charset=utf-8',
    };
  }

  return {
    status: 404,
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

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const routes = getCanonicalRoutes().filter((route) => route.routeId !== 'not_found');

  for (const route of routes) {
    const response = await fetchText(`${baseUrl}${route.path}`);
    if (response.status !== 200) {
      throw new Error(`Expected 200 for ${route.path}, got ${response.status}`);
    }
    if (!response.text.includes('<div id="app">')) {
      throw new Error(`Expected prerendered app shell for ${route.path}`);
    }
    if (!response.text.includes('<link rel="canonical"')) {
      throw new Error(`Expected route-specific metadata for ${route.path}`);
    }
  }

  const hashResponse = await fetchText(`${baseUrl}/#/financing`);
  if (hashResponse.status !== 200) {
    throw new Error(`Expected 200 for legacy hash route, got ${hashResponse.status}`);
  }

  const entryResponse = await fetchText(`${baseUrl}/financing`);
  const mainResponse = await fetchText(`${baseUrl}/`);
  if (!entryResponse.text.includes('/assets/')) {
    throw new Error('Expected clean-path entry response to include built asset references.');
  }
  if (!mainResponse.text.includes('/assets/')) {
    throw new Error('Expected home entry response to include built asset references.');
  }

  const notFoundResponse = await fetchText(`${baseUrl}/does-not-exist`);
  if (notFoundResponse.status !== 404) {
    throw new Error(`Expected 404 for unknown route, got ${notFoundResponse.status}`);
  }
  if (!notFoundResponse.text.includes("This path doesn't lead anywhere.")) {
    throw new Error('Expected prerendered 404 content for unknown route.');
  }

  console.log('Preview route smoke passed for prerendered clean-path direct loads, SPA hydration assets, and 404 handling.');
} finally {
  server.close();
}
