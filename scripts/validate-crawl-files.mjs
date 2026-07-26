import { readFileSync } from 'node:fs';

import {
  getCrawlInventory,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRouteAttributionJson,
  renderSitemapXml,
} from '../src/lib/crawl.js';

const inventory = getCrawlInventory();
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
const routeAttribution = readFileSync(new URL('../public/route-attribution.json', import.meta.url), 'utf8');

assert(sitemap === renderSitemapXml(), 'public/sitemap.xml does not match generated manifest output');
assert(robots === renderRobotsTxt(), 'public/robots.txt does not match generated manifest output');
assert(llms === renderLlmsTxt(), 'public/llms.txt does not match generated manifest output');
assert(routeAttribution === renderRouteAttributionJson(), 'public/route-attribution.json does not match generated manifest output');

assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap.xml is missing the sitemaps.org namespace');
assert(!sitemap.includes('#/'), 'sitemap.xml must not contain hash URLs');
assert(!robots.includes('#/'), 'robots.txt must not contain hash URLs');
assert(!llms.includes('#/'), 'llms.txt must not contain hash URLs');
assert(!routeAttribution.includes('#/'), 'route-attribution.json must not contain hash URLs');

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapLocs = new Set(sitemapLocs);
assert(sitemapLocs.length === uniqueSitemapLocs.size, 'sitemap.xml contains duplicate <loc> entries');
assert(sitemapLocs.length === inventory.sitemapEntries.length, 'sitemap.xml coverage does not match the manifest sitemap inventory');

for (const entry of inventory.sitemapEntries) {
  assert(sitemap.includes(entry.loc), `sitemap.xml is missing ${entry.loc}`);
}

for (const entry of inventory.llmsEntries) {
  assert(llms.includes(`: ${entry.path}`) || llms.includes(`- ${entry.label}: ${entry.path}`), `llms.txt is missing ${entry.path}`);
}

assert(
  inventory.indexingPolicy.allowIndexing ? robots.includes('Allow: /') : robots.includes('Disallow: /'),
  'robots.txt does not reflect the current indexing policy'
);

const routeAttributionData = JSON.parse(routeAttribution);
assert(Array.isArray(routeAttributionData.routes), 'route-attribution.json must expose a routes array');
assert(routeAttributionData.routes.length === inventory.routeAttribution.length, 'route-attribution.json coverage does not match manifest inventory');
for (const route of routeAttributionData.routes) {
  assert(route.canonical === true, `route-attribution.json includes non-canonical route ${route.routeId}`);
  assert(route.indexable === true, `route-attribution.json includes non-indexable route ${route.routeId}`);
}

if (errors.length > 0) {
  console.error('Crawl-file validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Crawl-file validation passed.');
console.table([
  {
    sitemapEntries: inventory.sitemapEntries.length,
    llmsEntries: inventory.llmsEntries.length,
    attributionRoutes: inventory.routeAttribution.length,
    indexingEnv: inventory.indexingPolicy.env,
    allowIndexing: inventory.indexingPolicy.allowIndexing,
  },
]);
