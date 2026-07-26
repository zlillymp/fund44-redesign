import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCanonicalRoutes, getRouteMatch } from '../src/lib/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const errors = [];

function fail(message) {
  errors.push(message);
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function htmlForRoute(routePath) {
  const directoryFile = routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.replace(/^\//, ''), 'index.html');

  return fs.readFile(directoryFile, 'utf8');
}

function extractLinks(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
}

function extractIds(html) {
  return new Set(
    [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
  );
}

function isExternalHref(href) {
  return /^(?:https?:|mailto:|tel:)/i.test(href);
}

function normalizeLocalHref(href) {
  const [pathPart, hash = ''] = href.split('#');
  const [pathname = '/', search = ''] = pathPart.split('?');

  return {
    pathname: pathname || '/',
    hash: hash ? `#${hash}` : '',
    search: search ? `?${search}` : '',
  };
}

async function validateInternalHref(routePath, href, currentIds) {
  const { pathname, hash } = normalizeLocalHref(href);
  const normalizedPath = pathname || routePath;

  if (href.startsWith('#')) {
    if (!hash || hash === '#/') {
      fail(`${routePath}: invalid in-page hash "${href}"`);
      return;
    }

    const targetId = href.slice(1);
    if (!currentIds.has(targetId)) {
      fail(`${routePath}: in-page anchor "${href}" does not resolve to a rendered id`);
    }
    return;
  }

  if (pathname.includes('#/')) {
    fail(`${routePath}: href "${href}" must not use legacy hash routing`);
    return;
  }

  const match = getRouteMatch(normalizedPath);
  if (match.isNotFound) {
    fail(`${routePath}: href "${href}" points to an unknown route`);
    return;
  }

  const cleanUrlFile = normalizedPath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, `${normalizedPath.replace(/^\//, '')}.html`);
  const routeIndexFile = normalizedPath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, normalizedPath.replace(/^\//, ''), 'index.html');

  const [cleanExists, routeExists] = await Promise.all([
    fileExists(cleanUrlFile),
    fileExists(routeIndexFile),
  ]);

  if (!cleanExists || !routeExists) {
    fail(`${routePath}: href "${href}" is missing built output (${path.relative(repoRoot, cleanUrlFile)} / ${path.relative(repoRoot, routeIndexFile)})`);
    return;
  }

  if (hash) {
    const html = await fs.readFile(routeIndexFile, 'utf8');
    const ids = extractIds(html);
    const anchorId = hash.slice(1);
    if (!ids.has(anchorId)) {
      fail(`${routePath}: href "${href}" points to missing anchor "${hash}" on ${normalizedPath}`);
    }
  }
}

const canonicalRoutes = getCanonicalRoutes();

for (const route of canonicalRoutes) {
  const html = await htmlForRoute(route.path).catch(() => null);
  if (!html) {
    fail(`${route.path}: missing prerendered HTML output`);
    continue;
  }

  const ids = extractIds(html);
  const hrefs = extractLinks(html);
  for (const href of hrefs) {
    if (!href || isExternalHref(href)) continue;
    await validateInternalHref(route.path, href, ids);
  }
}

const crawlFiles = [
  ['sitemap.xml', /#\//],
  ['robots.txt', /#\//],
  ['llms.txt', /#\//],
  ['route-attribution.json', /#\//],
];

for (const [fileName, pattern] of crawlFiles) {
  const file = path.join(distDir, fileName);
  const content = await fs.readFile(file, 'utf8').catch(() => null);
  if (!content) {
    fail(`dist/${fileName}: missing crawl artifact`);
    continue;
  }
  if (pattern.test(content)) {
    fail(`dist/${fileName}: contains legacy hash route output`);
  }
}

if (errors.length > 0) {
  console.error('Broken-link validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Broken-link validation passed for ${canonicalRoutes.length} canonical routes and crawl artifacts.`);
