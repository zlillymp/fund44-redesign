import test from 'node:test';
import assert from 'node:assert/strict';
import {
  disclosures,
  entityProfile,
  humanReadableIndexingMode,
  identityDisplay,
  indexingPolicy,
  robotsForRoute,
  unresolvedIdentityFields,
} from '../src/lib/legal.js';
import { getContentById } from '../src/lib/content.js';
import { getRoute } from '../src/lib/routes.js';
import { getContentFreshnessByRouteId } from '../src/lib/freshness.js';

test('staging defaults to noindex while approvals remain incomplete', () => {
  assert.equal(indexingPolicy.env, 'staging');
  assert.equal(indexingPolicy.productionIndexingApproved, false);
  assert.equal(indexingPolicy.allowIndexing, false);
  assert.equal(humanReadableIndexingMode(), 'staging-noindex');
  assert.equal(robotsForRoute(getRoute('home')), 'noindex,nofollow');
});

test('identity fields are verified with real business values', () => {
  assert.equal(entityProfile.hasVerifiedIdentity, true);
  assert.deepEqual(unresolvedIdentityFields, []);
  const supportEmail = identityDisplay('supportEmail');
  assert.equal(supportEmail.verified, true);
  assert.equal(supportEmail.value, 'support@fund44.com');
  const supportPhone = identityDisplay('supportPhone');
  assert.equal(supportPhone.verified, true);
  assert.equal(supportPhone.value, '512-547-1547');
  const legalName = identityDisplay('legalBusinessName');
  assert.equal(legalName.verified, true);
  assert.equal(legalName.value, 'Fund44 LLC');
  const mailingAddress = identityDisplay('mailingAddress');
  assert.equal(mailingAddress.verified, true);
  assert.match(mailingAddress.value, /5900 Balcones Dr/i);
});

test('sameAs remains omitted until verified', () => {
  assert.equal(entityProfile.hasVerifiedSameAs, false);
  assert.deepEqual(entityProfile.sameAs, []);
});

test('freshness policy does not suppress indexing for pending-first-review canonical routes', () => {
  const homeFreshness = getContentFreshnessByRouteId('home');
  assert.equal(homeFreshness.policyNoindex, false);
  assert.equal(homeFreshness.policyBlocked, false);
  assert.equal(robotsForRoute(getRoute('home')), 'noindex,nofollow');
});

test('approved conservative disclosure wording is centralized', () => {
  assert.match(disclosures.networkStory, /typically fluctuates between 40 and 50 lenders/);
  assert.match(disclosures.networkStory, /customer-service standards/);
  assert.match(disclosures.fitOverFees, /fit over fees/);
  assert.match(disclosures.fasterProcess, /faster process/);
  assert.doesNotMatch(disclosures.fasterProcess, /\bminutes?\b/i);
});

test('manifest-backed governed content reuses approved disclosure wording', () => {
  const home = getContentById('page_home');
  const resources = getContentById('page_resources');
  const articles = [
    getContentById('article_sba_7a_vs_504'),
    getContentById('article_preparing_your_documents'),
    getContentById('article_working_capital_vs_term_loan'),
  ];

  assert.equal(home.network.lead, disclosures.networkStory);
  assert.equal(home.workflow.lead, disclosures.fasterProcess);
  assert.equal(home.ctaBanner.subheading, disclosures.previewFlow);
  assert.match(home.status.disclosureHtml, /does not guarantee approval, funding, or any specific timeline, rate, or amount/i);
  assert.doesNotMatch(home.hero.eyebrow, /\$50K-\$5M/i);
  assert.doesNotMatch(home.heroProofItems.map((item) => item.label).join(' '), /Curated 40-50 lender network/i);
  assert.doesNotMatch(home.commonQuestions.map((item) => item.answer).join(' '), /share your profile and documents once/i);

  assert.equal(resources.ctaBanner.subheading, disclosures.fasterProcess);
  articles.forEach((article) => {
    assert.equal(article.ctaBanner.subheading, disclosures.fasterProcess);
    assert.doesNotMatch(article.ctaBanner.subheading, /Apply once and get matched to relevant paths from a network of lenders/i);
  });
});
