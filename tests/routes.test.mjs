import test from 'node:test';
import assert from 'node:assert/strict';
import {
  absoluteUrlForPath,
  getBreadcrumbs,
  getRouteBySlug,
  hrefForRoute,
  hrefForSlug,
  normalizePathname,
  resolveLegacyHashPath,
  shouldHighlightRoute,
} from '../src/lib/routes.js';
import { getRouteInventory } from '../src/lib/route-inventory.js';
import { getContentById } from '../src/lib/content.js';

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

test('national financing launch routes are canonical clean-path entries', () => {
  const inventory = new Map(getRouteInventory().map((route) => [route.routeId, route]));

  ['term_loan', 'line_of_credit', 'equipment_financing'].forEach((routeId) => {
    const route = inventory.get(routeId);
    assert.ok(route, `missing route ${routeId}`);
    assert.equal(route.pageType, 'program_page');
    assert.equal(route.templateId, 'product_page');
    assert.equal(route.canonical, true);
    assert.equal(route.indexable, true);
  });
});

test('use-case launch routes are canonical clean-path entries', () => {
  const inventory = new Map(getRouteInventory().map((route) => [route.routeId, route]));

  [
    'buy_a_business',
    'owner_occupied_real_estate',
    'cash_flow_needs',
    'equipment_purchase',
    'business_expansion',
    'refinance_business_debt',
  ].forEach((routeId) => {
    const route = inventory.get(routeId);
    assert.ok(route, `missing route ${routeId}`);
    assert.equal(route.pageType, 'use_case');
    assert.equal(route.templateId, 'use_case_page');
    assert.equal(route.routeFamily, 'use_case');
    assert.equal(route.canonical, true);
    assert.equal(route.indexable, true);
  });
});

test('industry launch routes are canonical clean-path entries', () => {
  const inventory = new Map(getRouteInventory().map((route) => [route.routeId, route]));

  [
    'franchise_businesses',
    'trucking_companies',
    'construction_contractors',
  ].forEach((routeId) => {
    const route = inventory.get(routeId);
    assert.ok(route, `missing route ${routeId}`);
    assert.equal(route.pageType, 'industry');
    assert.equal(route.templateId, 'industry_page');
    assert.equal(route.routeFamily, 'industry');
    assert.equal(route.canonical, true);
    assert.equal(route.indexable, true);
  });
});

test('state launch routes are canonical clean-path entries', () => {
  const inventory = new Map(getRouteInventory().map((route) => [route.routeId, route]));

  [
    'california_sba_loans',
    'florida_sba_loans',
    'new_york_sba_loans',
  ].forEach((routeId) => {
    const route = inventory.get(routeId);
    assert.ok(route, `missing route ${routeId}`);
    assert.equal(route.pageType, 'state');
    assert.equal(route.templateId, 'state_page');
    assert.equal(route.routeFamily, 'state');
    assert.equal(route.canonical, true);
    assert.equal(route.indexable, true);
  });
});

test('article slugs map to manifest routes', () => {
  const route = getRouteBySlug('preparing-your-documents');
  assert.ok(route);
  assert.equal(route.routeId, 'resource_preparing_documents');
  assert.equal(absoluteUrlForPath(route.path), 'https://fund44.com/resources/preparing-your-documents');
});

test('structured content records remain bound to manifest route ids', () => {
  assert.equal(getContentById('page_sba_7a').routeId, 'sba_7a');
  assert.equal(getContentById('article_working_capital_vs_term_loan').routeId, 'resource_working_capital_vs_term_loan');
  assert.equal(getContentById('use_case_cash_flow_needs').routeId, 'cash_flow_needs');
  assert.equal(getContentById('industry_trucking_companies').routeId, 'trucking_companies');
  assert.equal(getContentById('state_florida_sba_loans').routeId, 'florida_sba_loans');
});
