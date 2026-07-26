import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllContent, getContentById, getContentByRouteId, getIndustryPages, getProgramPages, getResourceHub, getUseCasePages } from '../src/lib/content.js';
import { getRouteBySlug, getRouteInventory } from '../src/lib/routes.js';

test('structured content inventory covers the planned route set', () => {
  const allContent = getAllContent();
  assert.equal(allContent.length, 22);
  assert.deepEqual(
    allContent.map((record) => record.id),
    [
      'page_home',
      'page_financing',
      'page_sba_7a',
      'page_sba_504',
      'page_business_acquisition',
      'page_working_capital',
      'page_term_loan',
      'page_line_of_credit',
      'page_equipment_financing',
      'use_case_buy_a_business',
      'use_case_owner_occupied_real_estate',
      'use_case_cash_flow_needs',
      'use_case_equipment_purchase',
      'use_case_business_expansion',
      'use_case_refinance_business_debt',
      'industry_franchise_businesses',
      'industry_trucking_companies',
      'industry_construction_contractors',
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

  assert.equal(programPages.length, 7);
  assert.deepEqual(programPages.map((page) => page.routeId), ['sba_7a', 'sba_504', 'business_acquisition', 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing']);
});

test('use-case pages remain discoverable through structured content', () => {
  const useCasePages = getUseCasePages();

  assert.equal(useCasePages.length, 6);
  assert.deepEqual(
    useCasePages.map((page) => page.routeId),
    [
      'buy_a_business',
      'owner_occupied_real_estate',
      'cash_flow_needs',
      'equipment_purchase',
      'business_expansion',
      'refinance_business_debt',
    ],
  );
});

test('industry pages remain discoverable through structured content', () => {
  const industryPages = getIndustryPages();

  assert.equal(industryPages.length, 3);
  assert.deepEqual(
    industryPages.map((page) => page.routeId),
    [
      'franchise_businesses',
      'trucking_companies',
      'construction_contractors',
    ],
  );
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

test('national financing launch pages have unique substantive intent and non-thin content blocks', () => {
  const routeIds = ['term_loan', 'line_of_credit', 'equipment_financing'];
  const pages = routeIds.map((routeId) => getContentByRouteId(routeId));

  assert.deepEqual(
    new Set(pages.map((page) => page.intent.primaryTopic)).size,
    pages.length,
  );
  assert.deepEqual(
    new Set(pages.map((page) => page.metaDescription)).size,
    pages.length,
  );

  pages.forEach((page) => {
    assert.ok(page.quickAnswer.definition.length > 80, `${page.routeId} quick answer should be substantive`);
    assert.ok(page.commonQuestions.length >= 4, `${page.routeId} should include at least 4 FAQs`);
    assert.ok(page.relatedIds.length >= 4, `${page.routeId} should include at least 4 related links`);
  });
});

test('use-case launch pages have unique substantive intent and real product/alternative comparisons', () => {
  const routeIds = [
    'buy_a_business',
    'owner_occupied_real_estate',
    'cash_flow_needs',
    'equipment_purchase',
    'business_expansion',
    'refinance_business_debt',
  ];
  const pages = routeIds.map((routeId) => getContentByRouteId(routeId));

  assert.equal(new Set(pages.map((page) => page.intent.primaryTopic)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.metaDescription)).size, pages.length);

  pages.forEach((page) => {
    assert.ok(page.quickAnswer.definition.length > 90, `${page.routeId} quick answer should be substantive`);
    assert.ok(page.bestFitProducts.length >= 2, `${page.routeId} should include best-fit products`);
    assert.ok(page.alternativePaths.length >= 2, `${page.routeId} should include alternative paths`);
    assert.ok(page.commonQuestions.length >= 4, `${page.routeId} should include at least 4 FAQs`);
    assert.ok(page.relatedIds.length >= 5, `${page.routeId} should include at least 5 related links`);
  });
});

test('industry launch pages have unique substantive intent and real underwriting/document differences', () => {
  const routeIds = [
    'franchise_businesses',
    'trucking_companies',
    'construction_contractors',
  ];
  const pages = routeIds.map((routeId) => getContentByRouteId(routeId));

  assert.equal(new Set(pages.map((page) => page.intent.primaryTopic)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.metaDescription)).size, pages.length);

  pages.forEach((page) => {
    assert.ok(page.quickAnswer.definition.length > 90, `${page.routeId} quick answer should be substantive`);
    assert.ok(page.bestFitProducts.length >= 3, `${page.routeId} should include best-fit products`);
    assert.ok(page.underwritingFocusCards.length >= 3, `${page.routeId} should include underwriting focus cards`);
    assert.ok(page.alternativePaths.length >= 3, `${page.routeId} should include alternative paths`);
    assert.ok(page.commonQuestions.length >= 4, `${page.routeId} should include at least 4 FAQs`);
    assert.ok(page.relatedIds.length >= 6, `${page.routeId} should include at least 6 related links`);
  });
});
