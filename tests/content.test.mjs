import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllContent, getContentById, getContentByRouteId, getProgramPages, getResourceHub } from '../src/lib/content.js';
import { getRouteBySlug, getRouteInventory } from '../src/lib/routes.js';

test('structured content inventory covers the planned route set', () => {
  const allContent = getAllContent();
  assert.equal(allContent.length, 10);
  assert.deepEqual(
    allContent.map((record) => record.id),
    [
      'page_home',
      'page_financing',
      'page_sba_7a',
      'page_sba_504',
      'page_business_acquisition',
      'page_working_capital',
      'page_resources',
      'article_sba_7a_vs_504',
      'article_preparing_your_documents',
      'article_working_capital_vs_term_loan',
    ]
  );
});

test('route ids and slugs map cleanly between manifest and structured content', () => {
  const article = getContentById('article_preparing_your_documents');
  const route = getRouteBySlug(article.slug);

  assert.ok(route);
  assert.equal(route.routeId, article.routeId);
  assert.equal(route.contentId, article.id);
  assert.equal(route.templateId, article.templateId);
});

test('financing program pages remain discoverable through structured content', () => {
  const programPages = getProgramPages();

  assert.equal(programPages.length, 4);
  assert.deepEqual(programPages.map((page) => page.routeId), ['sba_7a', 'sba_504', 'business_acquisition', 'working_capital']);
});

test('resource hub article inventory points to structured editorial records', () => {
  const hub = getResourceHub();
  const articleTitles = hub.articleIds.map((id) => getContentById(id).title);

  assert.deepEqual(articleTitles, [
    'SBA 7(a) vs SBA 504: which one fits your business?',
    'The document checklist that speeds up small-business funding',
    'Line of credit or term loan? Matching the tool to the need',
  ]);
});

test('measurement metadata stays aligned with manifest dimensions', () => {
  const routeInventory = new Map(getRouteInventory().map((route) => [route.routeId, route]));
  const content = getAllContent();

  content.forEach((record) => {
    const route = routeInventory.get(record.routeId);
    assert.ok(route, `missing route for ${record.id}`);
    assert.equal(record.pageType, route.pageType);
    assert.equal(record.templateId, route.templateId);
    assert.equal(record.measurement.routeFamily, route.routeFamily);
  });
});

test('route-based content lookup resolves the home and financing records', () => {
  assert.equal(getContentByRouteId('home').id, 'page_home');
  assert.equal(getContentByRouteId('financing').id, 'page_financing');
});

test('claim-bearing content records declare evidence scopes and citation ids', () => {
  const content = getAllContent();

  content.forEach((record) => {
    assert.ok(Array.isArray(record.claimIds), `${record.id} is missing claimIds`);
    assert.equal(typeof record.claimReview, 'object', `${record.id} is missing claimReview`);
    assert.ok(Array.isArray(record.citationIds), `${record.id} is missing citationIds`);

    if (record.claimIds.length > 0) {
      assert.equal(record.claimReview.requiresEvidence, true, `${record.id} should require evidence`);
      assert.ok(record.claimReview.evidenceScopes.length > 0, `${record.id} should declare evidence scopes`);
      assert.ok(record.citationIds.length > 0, `${record.id} should reference at least one citation`);
    }
  });
});
