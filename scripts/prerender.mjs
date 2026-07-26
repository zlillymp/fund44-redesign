import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { header, footer } from '../src/components/shell.js';
import { renderLlmsTxt, renderRobotsTxt, renderRouteAttributionJson, renderSitemapXml } from '../src/lib/crawl.js';
import { getCanonicalRoutes, normalizePathname } from '../src/lib/routes.js';
import { readLastMeta, serializeHead } from '../src/lib/seo.js';
import { renderRouteToHtml } from '../src/pages/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const template = await fs.readFile(indexPath, 'utf8');

function outputHtmlPath(routePath) {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }

  const normalized = normalizePathname(routePath).replace(/^\//, '');
  return path.join(distDir, normalized, 'index.html');
}

function cleanUrlHtmlPath(routePath) {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }

  const normalized = normalizePathname(routePath).replace(/^\//, '');
  return path.join(distDir, `${normalized}.html`);
}

function updateHead(templateHtml, meta) {
  const nextHead = serializeHead(meta);
  return templateHtml.replace(
    /<!--fund44-route-head:start-->[\s\S]*?<!--fund44-route-head:end-->/,
    `<!--fund44-route-head:start-->\n    ${nextHead}\n    <!--fund44-route-head:end-->`
  );
}

function injectShell(templateHtml, bodyHtml) {
  return templateHtml
    .replace('<div id="shell-header"></div>', `<div id="shell-header">${header()}</div>`)
    .replace('<div id="app"></div>', `<div id="app">${bodyHtml}</div>`)
    .replace('<div id="shell-footer"></div>', `<div id="shell-footer">${footer()}</div>`);
}

async function writeRoute(routePath) {
  globalThis.__FUND44_LAST_META__ = null;
  const { html } = renderRouteToHtml(routePath);
  const meta = readLastMeta();

  if (!meta) {
    throw new Error(`Missing metadata after rendering ${routePath}`);
  }

  const outputPath = outputHtmlPath(routePath);
  const cleanOutputPath = cleanUrlHtmlPath(routePath);
  const withHead = updateHead(template, meta);
  const finalHtml = injectShell(withHead, html);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalHtml, 'utf8');
  if (cleanOutputPath !== outputPath) {
    await fs.mkdir(path.dirname(cleanOutputPath), { recursive: true });
    await fs.writeFile(cleanOutputPath, finalHtml, 'utf8');
  }

  return {
    path: routePath,
    file: path.relative(rootDir, outputPath),
    cleanUrlFile: path.relative(rootDir, cleanOutputPath),
    title: meta.title,
    canonical: meta.canonical,
  };
}

const routeSet = [
  ...getCanonicalRoutes().map((route) => route.path),
  '/404',
];

const uniqueRoutes = [...new Set(routeSet)];
const written = [];

for (const routePath of uniqueRoutes) {
  written.push(await writeRoute(routePath));
}

await fs.writeFile(path.join(distDir, 'sitemap.xml'), renderSitemapXml(), 'utf8');
await fs.writeFile(path.join(distDir, 'robots.txt'), renderRobotsTxt(), 'utf8');
await fs.writeFile(path.join(distDir, 'llms.txt'), renderLlmsTxt(), 'utf8');
await fs.writeFile(path.join(distDir, 'route-attribution.json'), renderRouteAttributionJson(), 'utf8');

console.log('Prerendered routes:');
console.table(written.map((entry) => ({
  path: entry.path,
  file: entry.file,
  cleanUrlFile: entry.cleanUrlFile,
  title: entry.title,
})));
