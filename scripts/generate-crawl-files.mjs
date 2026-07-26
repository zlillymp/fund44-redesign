import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getCrawlInventory,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRouteAttributionJson,
  renderSitemapXml,
} from '../src/lib/crawl.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

const outputs = [
  { relativePath: 'sitemap.xml', contents: renderSitemapXml() },
  { relativePath: 'robots.txt', contents: renderRobotsTxt() },
  { relativePath: 'llms.txt', contents: renderLlmsTxt() },
  { relativePath: 'route-attribution.json', contents: renderRouteAttributionJson() },
];

for (const baseDir of [publicDir, distDir]) {
  await mkdir(baseDir, { recursive: true });
  for (const output of outputs) {
    await writeFile(path.join(baseDir, output.relativePath), output.contents, 'utf8');
  }
}

const inventory = getCrawlInventory();

console.log('Generated crawl files from route/content manifests.');
console.table([
  {
    sitemapEntries: inventory.sitemapEntries.length,
    llmsEntries: inventory.llmsEntries.length,
    attributionRoutes: inventory.routeAttribution.length,
    indexingEnv: inventory.indexingPolicy.env,
    allowIndexing: inventory.indexingPolicy.allowIndexing,
  },
]);
