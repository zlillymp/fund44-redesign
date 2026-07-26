import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMeta, serializeHead } from '../src/lib/seo.js';
import { renderRouteToHtml } from '../src/pages/index.js';
import { getCanonicalRoutes } from '../src/lib/routes.js';

test('renderRouteToHtml returns final copy for canonical routes', () => {
  const home = renderRouteToHtml('/');
  const financing = renderRouteToHtml('/financing');
  const sba7a = renderRouteToHtml('/sba-7a');
  const termLoan = renderRouteToHtml('/term-loan');
  const buyBusiness = renderRouteToHtml('/use-cases/buy-a-business');
  const cashFlowNeeds = renderRouteToHtml('/use-cases/cash-flow-needs');
  const truckingCompanies = renderRouteToHtml('/industries/trucking-companies');
  const article = renderRouteToHtml('/resources/sba-7a-vs-504');
  const notFound = renderRouteToHtml('/missing-route');

  assert.match(home.html, /Funding a business shouldn't mean starting over five times\./i);
  assert.match(financing.html, /Compare financing paths at a glance/i);
  assert.match(financing.html, /Who this overview fits/i);
  assert.match(financing.html, /Typical documents and how Fund44 fits/i);
  assert.match(sba7a.html, /When SBA 7\(a\) tends to fit/i);
  assert.match(sba7a.html, /Typical documents and how Fund44 fits/i);
  assert.match(termLoan.html, /When a term loan tends to fit/i);
  assert.match(termLoan.html, /Questions about Term loan/i);
  assert.match(buyBusiness.html, /The most common starting points when the goal is buying a business/i);
  assert.match(buyBusiness.html, /Compare these alternatives if the deal changes shape/i);
  assert.match(cashFlowNeeds.html, /The most common starting points for recurring operating needs/i);
  assert.match(cashFlowNeeds.html, /Questions about cash-flow needs/i);
  assert.match(truckingCompanies.html, /Common financing starting points for trucking companies/i);
  assert.match(truckingCompanies.html, /Trucking-specific underwriting and operating questions/i);
  assert.match(article.html, /SBA 7\(a\) vs SBA 504/i);
  assert.match(notFound.html, /This path doesn't lead anywhere\./i);
});

test('buildMeta and serializeHead emit route-specific metadata blocks', () => {
  const meta = buildMeta({
    title: 'Financing options for small businesses',
    description: 'Compare Fund44 financing paths with route-specific head tags.',
    path: '/financing',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Financing' }],
  });

  const head = serializeHead(meta);

  assert.match(head, /<title>Financing options for small businesses · Fund44<\/title>/);
  assert.match(head, /<link rel="canonical" href="https:\/\/fund44\.com\/financing"/);
  assert.match(head, /meta property="og:url" content="https:\/\/fund44\.com\/financing"/);
  assert.match(head, /meta property="og:type" content="website"/);
  assert.match(head, /application\/ld\+json/);
  assert.match(head, /noindex,nofollow/);
});

test('canonical route inventory remains prerenderable', () => {
  const routes = getCanonicalRoutes();
  assert.ok(routes.length >= 10);
  routes.forEach((route) => {
    const rendered = renderRouteToHtml(route.path);
    assert.equal(rendered.match.route.path, route.path);
    assert.ok(rendered.html.length > 100, `expected HTML body for ${route.path}`);
  });
});
