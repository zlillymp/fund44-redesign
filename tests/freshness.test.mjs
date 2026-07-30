import test from 'node:test';
import assert from 'node:assert/strict';

import { getFreshnessReport, getContentFreshnessByRouteId, FRESHNESS_ACTIONS, FRESHNESS_STATES } from '../src/lib/freshness.js';
import { getSitemapEntries, getLlmsEntries, getIndexableRouteInventory } from '../src/lib/route-inventory.js';

test('freshness report covers content, citations, governance records, and generated assets', () => {
  const report = getFreshnessReport();

  assert.equal(report.content.length, 36);
  assert.equal(report.citations.length, 53);
  assert.equal(report.governance.length, 3);
  assert.equal(report.generatedAssets.length, 3);
  assert.equal(report.blockingEntries.length, 0);
});

test('current repo baseline keeps canonical content pending first review without blocking release', () => {
  const home = getContentFreshnessByRouteId('home');
  const financing = getContentFreshnessByRouteId('financing');

  assert.equal(home.state, FRESHNESS_STATES.REVIEW_PENDING);
  assert.equal(home.action, FRESHNESS_ACTIONS.REVIEW);
  assert.equal(financing.state, FRESHNESS_STATES.REVIEW_PENDING);
  assert.equal(financing.policyNoindex, false);
  assert.equal(financing.policyBlocked, false);
});

test('indexable route inventories stay intact while content is pending first review', () => {
  assert.equal(getSitemapEntries().length, 41);
  assert.equal(getLlmsEntries().length, 38);
  assert.equal(getIndexableRouteInventory().length, 41);
});

test('freshness report flags stale citations as noindex and expired citations as block', () => {
  const staleReport = getFreshnessReport({ today: '2027-01-30' });
  const expiredReport = getFreshnessReport({ today: '2027-08-01' });

  assert.ok(staleReport.citations.some((entry) => entry.action === FRESHNESS_ACTIONS.NOINDEX));
  assert.ok(staleReport.content.some((entry) => entry.action === FRESHNESS_ACTIONS.NOINDEX));
  assert.ok(expiredReport.citations.some((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK));
  assert.ok(expiredReport.content.some((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK));
});
