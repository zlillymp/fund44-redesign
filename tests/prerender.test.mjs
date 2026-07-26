import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMeta, serializeHead } from '../src/lib/seo.js';
import { renderRouteToHtml } from '../src/pages/index.js';
import { getCanonicalRoutes } from '../src/lib/routes.js';

test('renderRouteToHtml returns final copy for canonical routes', () => {
  const home = renderRouteToHtml('/');
  const financing = renderRouteToHtml('/financing');
  const article = renderRouteToHtml('/resources/sba-7a-vs-504');
  const notFound = renderRouteToHtml('/missing-route');

  assert.match(home.html, /One application\./i);
  assert.match(financing.html, /Compare financing paths at a glance/i);
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
