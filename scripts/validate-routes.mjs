import { routeManifest } from '../content/manifest.mjs';
import { getRouteInventory, getSitemapEntries, getLlmsEntries, hrefForRoute } from '../src/lib/routes.js';
import { getAllContent } from '../src/lib/content.js';

const errors = [];
const warnings = [];
const { routes, navigation } = routeManifest;
const contentByRouteId = new Map(getAllContent().map((record) => [record.routeId, record]));

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const routeIds = new Set();
const paths = new Set();
const legacyHashes = new Set();

for (const route of routes) {
  assert(route.routeId, 'Every route must have a routeId.');
  assert(route.path, `Route ${route.routeId} is missing a path.`);
  assert(route.pageKey, `Route ${route.routeId} is missing a pageKey.`);
  assert(route.analyticsRouteId, `Route ${route.routeId} is missing an analyticsRouteId.`);
  assert(route.pageType, `Route ${route.routeId} is missing a pageType.`);
  assert(route.templateId, `Route ${route.routeId} is missing a templateId.`);
  assert(route.routeFamily, `Route ${route.routeId} is missing a routeFamily.`);

  assert(!routeIds.has(route.routeId), `Duplicate routeId: ${route.routeId}`);
  routeIds.add(route.routeId);

  assert(!paths.has(route.path), `Duplicate path: ${route.path}`);
  paths.add(route.path);

  for (const legacyHash of route.legacyHashes || []) {
    assert(!legacyHashes.has(legacyHash), `Duplicate legacy hash mapping: ${legacyHash}`);
    legacyHashes.add(legacyHash);
    assert(legacyHash.startsWith('#/'), `Legacy hash should preserve old route shape: ${legacyHash}`);
  }

  if (route.parentRouteId) {
    assert(routes.some((candidate) => candidate.routeId === route.parentRouteId), `Unknown parentRouteId ${route.parentRouteId} on ${route.routeId}`);
  }

  if (route.slug) {
    assert(route.path.endsWith(`/${route.slug}`), `Slug ${route.slug} does not align with path ${route.path}`);
  }

  if (route.crawl?.canonical) {
    assert(route.path.startsWith('/'), `Canonical route ${route.routeId} must use an absolute path.`);
  }
}

for (const item of navigation.primary) {
  assert(routeIds.has(item.routeId), `Primary nav references unknown route ${item.routeId}`);
  for (const panelRouteId of item.panel || []) {
    assert(routeIds.has(panelRouteId), `Primary nav panel references unknown route ${panelRouteId}`);
  }
}

for (const item of navigation.mobile) {
  assert(routeIds.has(item.routeId), `Mobile nav references unknown route ${item.routeId}`);
}

for (const group of navigation.footer) {
  for (const routeId of group.items) {
    assert(routeIds.has(routeId), `Footer nav references unknown route ${routeId}`);
  }
}

const sitemapEntries = getSitemapEntries();
for (const entry of sitemapEntries) {
  assert(entry.loc.startsWith('https://fund44.com/'), `Sitemap entry ${entry.routeId} must use canonical absolute URLs.`);
  assert(!entry.loc.includes('#/'), `Sitemap entry ${entry.routeId} must not contain a hash URL.`);
}

for (const item of getLlmsEntries()) {
  assert(item.loc.startsWith('https://fund44.com/'), `llms entry ${item.routeId} must use canonical absolute URLs.`);
  assert(!item.loc.includes('#/'), `llms entry ${item.routeId} must not contain a hash URL.`);
  const route = routes.find((candidate) => candidate.routeId === item.routeId);
  assert(Boolean(route?.crawl?.llms), `llms entry ${item.routeId} must come from a route with crawl.llms=true.`);
}

for (const route of routes.filter((candidate) => candidate.contentId)) {
  const record = contentByRouteId.get(route.routeId);
  if (!record) continue;
  assert(record.indexability.canonical === Boolean(route.crawl?.canonical), `${route.routeId}: content canonical flag must align with manifest`);
  assert(record.indexability.indexable === Boolean(route.crawl?.indexable), `${route.routeId}: content indexable flag must align with manifest`);
  assert(record.indexability.sitemap === Boolean(route.crawl?.sitemap), `${route.routeId}: content sitemap flag must align with manifest`);
  assert(record.indexability.llms === Boolean(route.crawl?.llms), `${route.routeId}: content llms flag must align with manifest`);
}

const inventory = getRouteInventory();
assert(inventory.some((route) => route.routeId === 'home'), 'Route inventory must include home.');
assert(inventory.some((route) => route.routeId === 'not_found' && route.canonical === false), 'Route inventory must include non-canonical 404.');

const canonicalHrefs = routes.filter((route) => route.crawl?.canonical).map((route) => hrefForRoute(route.routeId));
if (canonicalHrefs.some((href) => href.includes('#/'))) {
  errors.push('Canonical hrefs must not contain fragment routes.');
}

if (warnings.length) {
  for (const warning of warnings) {
    console.warn(`WARN: ${warning}`);
  }
}

if (errors.length) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

console.log('Route manifest validation passed.');
console.table(inventory.map((route) => ({
  routeId: route.routeId,
  path: route.path,
  pageType: route.pageType,
  templateId: route.templateId,
  routeFamily: route.routeFamily,
  canonical: route.canonical,
  landing: route.landing,
})));
