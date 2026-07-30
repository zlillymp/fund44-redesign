import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCanonicalRoutes } from '../src/lib/routes.js';
import { getContentById } from '../src/lib/content.js';
import { escapeHtml } from '../src/lib/seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function routeOutputPath(routePath) {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }

  return path.join(distDir, routePath.replace(/^\//, ''), 'index.html');
}

function cleanUrlFilePath(routePath) {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }

  return path.join(distDir, `${routePath.replace(/^\//, '')}.html`);
}

function expectIncludes(html, needle, context, failures) {
  if (!html.includes(needle)) {
    failures.push(`${context} missing "${needle}"`);
  }
}

const failures = [];
const canonicalRoutes = getCanonicalRoutes();
const expectedCopyByPath = new Map([
  ['/about', 'Small-business capital, without the runaround.'],
  ['/how-it-works', 'From one intake to clearer path review.'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms & disclosures'],
  ['/contact', 'Fund44 LLC'],
]);

for (const route of canonicalRoutes) {
  const file = routeOutputPath(route.path);
  const html = await fs.readFile(file, 'utf8').catch(() => null);

  if (!html) {
    failures.push(`Missing prerendered file for ${route.path}: ${path.relative(rootDir, file)}`);
    continue;
  }

  expectIncludes(html, '<div id="app">', route.path, failures);
  expectIncludes(html, '<div id="shell-header">', route.path, failures);
  expectIncludes(html, '<div id="shell-footer">', route.path, failures);
  expectIncludes(html, '<title>', route.path, failures);
  expectIncludes(html, '<link rel="canonical"', route.path, failures);
  expectIncludes(html, 'application/ld+json', route.path, failures);
  expectIncludes(html, '<meta property="og:title"', route.path, failures);
  expectIncludes(html, '<meta name="twitter:title"', route.path, failures);

  const cleanUrlHtml = await fs.readFile(cleanUrlFilePath(route.path), 'utf8').catch(() => null);
  if (!cleanUrlHtml) {
    failures.push(`Missing clean-url HTML duplicate for ${route.path}`);
  }

  try {
    const content = getContentById(route.contentId);
    expectIncludes(html, escapeHtml(content.metaTitle), route.path, failures);
    expectIncludes(html, escapeHtml(content.metaDescription), route.path, failures);
    expectIncludes(html, escapeHtml(content.title), route.path, failures);
  } catch {
    const expectedCopy = expectedCopyByPath.get(route.path);
    if (expectedCopy) {
      expectIncludes(html, expectedCopy, route.path, failures);
    }
  }
}

const notFoundFile = path.join(distDir, '404', 'index.html');
const notFoundHtml = await fs.readFile(notFoundFile, 'utf8').catch(() => null);
if (!notFoundHtml) {
  failures.push('Missing prerendered 404 route at dist/404/index.html');
} else {
  expectIncludes(notFoundHtml, "This path doesn't lead anywhere.", '/404', failures);
  expectIncludes(notFoundHtml, '<title>Page not found', '/404', failures);
}

const standalone404 = path.join(distDir, '404.html');
const standalone404Html = await fs.readFile(standalone404, 'utf8').catch(() => null);
if (!standalone404Html) {
  failures.push('Missing dist/404.html output for host-level 404 serving.');
}

if (failures.length) {
  failures.forEach((failure) => console.error(`ERROR: ${failure}`));
  process.exit(1);
}

console.log(`Prerender validation passed for ${canonicalRoutes.length} canonical routes plus 404.`);
