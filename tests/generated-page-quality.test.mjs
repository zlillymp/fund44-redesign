import test from 'node:test';
import assert from 'node:assert/strict';

import { getSitemapEntries } from '../src/lib/route-inventory.js';
import { readLastMeta, serializeHead } from '../src/lib/seo.js';
import { absoluteUrlForPath, getCanonicalRoutes, routeSite } from '../src/lib/routes.js';
import { renderRouteToHtml } from '../src/pages/index.js';

const TITLE_SUFFIX = ` · ${routeSite.siteName}`;

function metaForRoute(routePath) {
  globalThis.__FUND44_LAST_META__ = null;
  const { html } = renderRouteToHtml(routePath);
  const meta = readLastMeta();
  assert.ok(meta, `${routePath} must publish route metadata while rendering`);
  return { html, meta };
}

function generatedPages() {
  return getCanonicalRoutes().map((route) => ({ route, ...metaForRoute(route.path) }));
}

test('every canonical route publishes a self-referencing absolute canonical', () => {
  for (const { route, meta } of generatedPages()) {
    const label = route.routeId;

    assert.equal(meta.canonical, absoluteUrlForPath(route.path), `${label} canonical must point at its own path`);
    assert.ok(meta.canonical.startsWith('https://'), `${label} canonical must be absolute https`);
    assert.doesNotMatch(meta.canonical, /[?#]/, `${label} canonical must not carry a query or fragment`);
    assert.equal(meta.openGraph.url, meta.canonical, `${label} og:url must match the canonical`);

    const { pathname } = new URL(meta.canonical);
    assert.equal(pathname === '/' || !pathname.endsWith('/'), true, `${label} canonical must not have a trailing slash`);
  }
});

test('canonicals stay unique across generated pages', () => {
  const canonicals = generatedPages().map(({ meta }) => meta.canonical);

  assert.equal(new Set(canonicals).size, canonicals.length, 'two canonical routes claim the same canonical URL');
});

test('generated pages keep the staging indexing posture', () => {
  for (const { route, meta, html } of [...generatedPages(), { route: { routeId: 'not_found' }, ...metaForRoute('/missing-route') }]) {
    assert.equal(meta.robots, 'noindex,nofollow', `${route.routeId} must stay noindex,nofollow while staging`);
    assert.match(serializeHead(meta), /<meta name="googlebot" content="noindex,nofollow" \/>/);
    assert.doesNotMatch(html, /<meta\s+name="robots"/, `${route.routeId} body must not emit a competing robots tag`);
  }
});

test('generated pages carry a distinct, correctly suffixed title', () => {
  const titles = [];

  for (const { route, meta } of generatedPages()) {
    const label = route.routeId;

    assert.ok(meta.title.trim().length > 0, `${label} must publish a title`);
    assert.ok(meta.title.length <= 70, `${label} title is ${meta.title.length} chars, over the 70 char budget`);
    assert.equal(meta.title, meta.title.trim(), `${label} title must not be padded with whitespace`);
    assert.equal(
      meta.title.endsWith(TITLE_SUFFIX),
      route.path !== '/',
      `${label} must ${route.path === '/' ? 'omit' : 'append'} the "${TITLE_SUFFIX.trim()}" suffix`,
    );
    assert.equal(meta.openGraph.title, meta.title, `${label} og:title must match the document title`);
    assert.equal(meta.twitter.title, meta.title, `${label} twitter:title must match the document title`);

    titles.push(meta.title);
  }

  assert.equal(new Set(titles).size, titles.length, 'two generated pages share the same title');
});

test('generated pages carry a distinct description within search-result bounds', () => {
  const descriptions = [];

  for (const { route, meta } of generatedPages()) {
    const label = route.routeId;

    assert.ok(meta.description.length >= 70, `${label} description is only ${meta.description.length} chars`);
    assert.ok(meta.description.length <= 280, `${label} description is ${meta.description.length} chars, over 280`);
    assert.equal(meta.description, meta.description.trim(), `${label} description must not be padded`);
    assert.equal(meta.openGraph.description, meta.description, `${label} og:description must match`);
    assert.equal(meta.twitter.description, meta.description, `${label} twitter:description must match`);

    descriptions.push(meta.description);
  }

  assert.equal(new Set(descriptions).size, descriptions.length, 'two generated pages share the same description');
});

test('generated pages share one social card contract', () => {
  const expectedImage = `${routeSite.baseUrl}/og-image.png`;

  for (const { route, meta } of generatedPages()) {
    const label = route.routeId;

    assert.equal(meta.openGraph.siteName, routeSite.siteName, `${label} must advertise the site name`);
    assert.equal(meta.openGraph.image, expectedImage, `${label} og:image must be the absolute shared card`);
    assert.equal(meta.twitter.image, expectedImage, `${label} twitter:image must be the absolute shared card`);
    assert.equal(meta.twitter.card, 'summary_large_image', `${label} must request a large social card`);
    assert.equal(
      meta.openGraph.type,
      route.pageType === 'article' && route.path !== '/' ? 'article' : 'website',
      `${label} og:type must follow its page type`,
    );
  }
});

test('generated pages emit serializable JSON-LD with a schema.org context', () => {
  let jsonldCount = 0;

  for (const { route, meta } of generatedPages()) {
    const label = route.routeId;
    assert.ok(Array.isArray(meta.jsonld), `${label} jsonld must be an array`);

    const types = [];
    for (const entry of meta.jsonld) {
      jsonldCount += 1;
      assert.equal(entry['@context'], 'https://schema.org', `${label} JSON-LD entry must declare the schema.org context`);
      assert.ok(entry['@type'], `${label} JSON-LD entry must declare an @type`);
      assert.doesNotThrow(() => JSON.parse(JSON.stringify(entry)), `${label} JSON-LD entry must serialize cleanly`);
      types.push(entry['@type']);
    }

    assert.equal(new Set(types).size, types.length, `${label} repeats a JSON-LD @type`);
  }

  assert.ok(jsonldCount > 0, 'expected structured data on generated pages');
});

test('breadcrumb structured data resolves to absolute in-site URLs', () => {
  for (const { route, meta } of generatedPages()) {
    const breadcrumb = meta.jsonld.find((entry) => entry['@type'] === 'BreadcrumbList');
    if (!breadcrumb) continue;

    const items = breadcrumb.itemListElement;
    assert.ok(items.length >= 2, `${route.routeId} breadcrumb needs a parent and a leaf`);
    assert.deepEqual(
      items.map((item) => item.position),
      items.map((_, index) => index + 1),
      `${route.routeId} breadcrumb positions must be sequential from 1`,
    );

    for (const item of items) {
      assert.ok(item.name?.trim(), `${route.routeId} breadcrumb item must be named`);
      assert.ok(item.item.startsWith(`${routeSite.baseUrl}/`), `${route.routeId} breadcrumb item must be an in-site URL`);
    }

    assert.equal(items.at(-1).item, meta.canonical, `${route.routeId} breadcrumb must end on its own canonical`);
  }
});

test('sitemap entries agree with the canonical metadata of the pages they advertise', () => {
  const canonicalByPath = new Map(generatedPages().map(({ route, meta }) => [route.path, meta.canonical]));
  const entries = getSitemapEntries();

  assert.ok(entries.length > 0, 'expected sitemap entries for the generated pages');

  for (const entry of entries) {
    assert.ok(canonicalByPath.has(entry.path), `sitemap advertises non-canonical path ${entry.path}`);
    assert.equal(entry.loc, canonicalByPath.get(entry.path), `sitemap loc for ${entry.routeId} must match its canonical`);
  }

  const locs = entries.map((entry) => entry.loc);
  assert.equal(new Set(locs).size, locs.length, 'sitemap repeats a location');
});
