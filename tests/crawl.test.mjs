import test from 'node:test';
import assert from 'node:assert/strict';

import { routeManifest } from '../content/manifest.mjs';
import {
  getCrawlInventory,
  renderLlmsTxt,
  renderRobotsTxt,
  renderRouteAttributionJson,
  renderSitemapXml,
} from '../src/lib/crawl.js';
import { indexingPolicy } from '../src/lib/legal.js';

test('crawl inventory coverage is deterministic and duplicate-free', () => {
  const inventory = getCrawlInventory();
  const expectedSitemapCount = routeManifest.routes.filter((route) => route.crawl?.canonical && route.crawl?.indexable && route.crawl?.sitemap).length;
  const expectedLlmsCount = routeManifest.routes.filter((route) => route.crawl?.llms).length;
  const expectedAttributionCount = routeManifest.routes.filter((route) => route.crawl?.canonical && route.crawl?.indexable).length;

  assert.equal(inventory.sitemapEntries.length, expectedSitemapCount);
  assert.equal(inventory.llmsEntries.length, expectedLlmsCount);
  assert.equal(inventory.routeAttribution.length, expectedAttributionCount);

  const sitemapLocs = inventory.sitemapEntries.map((entry) => entry.loc);
  const llmsLocs = inventory.llmsEntries.map((entry) => entry.loc);
  const attributionLocs = inventory.routeAttribution.map((entry) => entry.loc);

  assert.equal(new Set(sitemapLocs).size, sitemapLocs.length);
  assert.equal(new Set(llmsLocs).size, llmsLocs.length);
  assert.equal(new Set(attributionLocs).size, attributionLocs.length);

  [...sitemapLocs, ...llmsLocs, ...attributionLocs].forEach((loc) => {
    assert.match(loc, /^https:\/\/fund44\.com(\/.*)?$/);
    assert.doesNotMatch(loc, /#\//);
  });
});

test('sitemap and attribution only include canonical indexable routes', () => {
  const inventory = getCrawlInventory();
  const expectedRouteIds = routeManifest.routes
    .filter((route) => route.crawl?.canonical && route.crawl?.indexable && route.crawl?.sitemap)
    .map((route) => route.routeId)
    .sort();

  assert.deepEqual(inventory.sitemapEntries.map((entry) => entry.routeId).sort(), expectedRouteIds);
  assert.deepEqual(
    inventory.routeAttribution.map((entry) => entry.routeId).sort(),
    routeManifest.routes
      .filter((route) => route.crawl?.canonical && route.crawl?.indexable)
      .map((route) => route.routeId)
      .sort(),
  );
});

test('llms inventory follows manifest policy and excludes article routes flagged off', () => {
  const inventory = getCrawlInventory();
  const llmsAllowedRouteIds = routeManifest.routes
    .filter((route) => route.crawl?.llms)
    .map((route) => route.routeId);

  assert.deepEqual(
    inventory.llmsEntries.map((entry) => entry.routeId).sort(),
    llmsAllowedRouteIds.sort(),
  );
  assert.ok(!inventory.llmsEntries.some((entry) => entry.routeId === 'resource_sba_7a_vs_504'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'buy_a_business'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'cash_flow_needs'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'franchise_businesses'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'trucking_companies'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'construction_contractors'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'california_sba_loans'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'florida_sba_loans'));
  assert.ok(inventory.llmsEntries.some((entry) => entry.routeId === 'new_york_sba_loans'));
});

test('rendered crawl files are deterministic and respect staging noindex', () => {
  const sitemap = renderSitemapXml();
  const robots = renderRobotsTxt();
  const llms = renderLlmsTxt();
  const attribution = renderRouteAttributionJson();

  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.doesNotMatch(sitemap, /#\//);
  assert.doesNotMatch(llms, /#\//);
  assert.doesNotMatch(robots, /#\//);
  assert.doesNotMatch(attribution, /#\//);

  assert.equal(indexingPolicy.allowIndexing, false);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Disallow: \//);
  assert.doesNotMatch(robots, /Allow: \/\n\n# AI/);
  assert.match(llms, /## Financing paths covered/);
  assert.match(llms, /## Key pages/);

  const attributionData = JSON.parse(attribution);
  assert.equal(attributionData.indexingPolicy.allowIndexing, false);
  attributionData.routes.forEach((route) => {
    assert.equal(route.canonical, true);
    assert.equal(route.indexable, true);
  });
});
