import test from 'node:test';
import assert from 'node:assert/strict';
import {
  absoluteUrlForPath,
  getBreadcrumbs,
  getRouteBySlug,
  getRouteInventory,
  hrefForRoute,
  hrefForSlug,
  normalizePathname,
  resolveLegacyHashPath,
  shouldHighlightRoute,
} from '../src/lib/routes.js';

test('normalizePathname collapses trailing slash and index.html', () => {
  assert.equal(normalizePathname('/financing/'), '/financing');
  assert.equal(normalizePathname('/resources/index.html'), '/resources');
  assert.equal(normalizePathname('resources/sba-7a-vs-504'), '/resources/sba-7a-vs-504');
});

test('legacy hash routes resolve to clean paths', () => {
  assert.equal(resolveLegacyHashPath('#/financing'), '/financing');
  assert.equal(resolveLegacyHashPath('#/resources/sba-7a-vs-504'), '/resources/sba-7a-vs-504');
  assert.equal(resolveLegacyHashPath('#main'), null);
});

test('route helper returns canonical hrefs without fragments', () => {
  assert.equal(hrefForRoute('home'), '/');
  assert.equal(hrefForRoute('sba_504'), '/sba-504');
  assert.equal(hrefForSlug('working-capital-vs-term-loan'), '/resources/working-capital-vs-term-loan');
});

test('breadcrumb ancestry follows the manifest tree', () => {
  const crumbs = getBreadcrumbs('resource_sba_7a_vs_504');
  assert.deepEqual(crumbs.map((crumb) => crumb.path), ['/', '/resources', '/resources/sba-7a-vs-504']);
});

test('nav highlighting respects descendant routes', () => {
  assert.equal(shouldHighlightRoute('resource_sba_7a_vs_504', 'resources'), true);
  assert.equal(shouldHighlightRoute('sba_504', 'financing'), true);
  assert.equal(shouldHighlightRoute('about', 'resources'), false);
});

test('route inventory exposes manifest-backed analytics identifiers', () => {
  const inventory = getRouteInventory();
  const route = inventory.find((item) => item.routeId === 'contact');
  assert.ok(route);
  assert.equal(route.analyticsRouteId, 'contact');
  assert.equal(route.pageType, 'contact');
  assert.equal(route.canonical, true);
});

test('article slugs map to manifest routes', () => {
  const route = getRouteBySlug('preparing-your-documents');
  assert.ok(route);
  assert.equal(route.routeId, 'resource_preparing_documents');
  assert.equal(absoluteUrlForPath(route.path), 'https://fund44.com/resources/preparing-your-documents');
});
