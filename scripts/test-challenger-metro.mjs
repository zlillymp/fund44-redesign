import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCanonicalRoutes, getRouteMatch } from '../src/lib/routes.js';
import { getContentById, getAllContent } from '../src/lib/content.js';
import { citationRegistry, getCitationById } from '../content/citations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const TEXAS_STATE_ROUTE_ID = 'texas_sba_loans';
const TEXAS_METRO_ROUTE_IDS = [
  'houston_sba_loans',
  'san_antonio_sba_loans',
  'dallas_sba_loans',
  'austin_sba_loans',
  'fort_worth_sba_loans',
  'el_paso_sba_loans',
  'arlington_sba_loans',
  'corpus_christi_sba_loans',
  'plano_sba_loans',
  'laredo_sba_loans',
];

const ALL_TEXAS_ROUTE_IDS = [TEXAS_STATE_ROUTE_ID, ...TEXAS_METRO_ROUTE_IDS];

const failures = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(message);
  }
}

async function runChallengerAudit() {
  console.log('=== STARTING EMPIRICAL CHALLENGER METRO AUDIT (F44-CONT-07) ===\n');

  const canonicalRoutes = getCanonicalRoutes();
  const canonicalRouteMap = new Map(canonicalRoutes.map((r) => [r.routeId, r]));

  // 1. Verify Roster
  console.log('1. Verifying Texas State & Metro Route Roster...');
  for (const routeId of ALL_TEXAS_ROUTE_IDS) {
    const route = canonicalRouteMap.get(routeId);
    assert(route !== undefined, `Route ID ${routeId} is missing from canonical route inventory!`);
    if (route) {
      assert(route.crawl?.indexable === true, `Route ${routeId} (${route.path}) crawl.indexable is not true!`);
    }
  }

  // 2. Prerender HTML Output Audit for Texas Routes
  console.log('2. Auditing Prerendered HTML Output for 11 Texas Routes...');
  const titles = new Set();

  for (const routeId of ALL_TEXAS_ROUTE_IDS) {
    const route = canonicalRouteMap.get(routeId);
    if (!route) continue;

    const dirHtmlPath = path.join(distDir, route.path.replace(/^\//, ''), 'index.html');
    const cleanHtmlPath = path.join(distDir, `${route.path.replace(/^\//, '')}.html`);

    const dirHtml = await fs.readFile(dirHtmlPath, 'utf8').catch(() => null);
    const cleanHtml = await fs.readFile(cleanHtmlPath, 'utf8').catch(() => null);

    assert(dirHtml !== null, `Missing directory index HTML at ${dirHtmlPath}`);
    assert(cleanHtml !== null, `Missing clean URL HTML at ${cleanHtmlPath}`);

    if (dirHtml && cleanHtml) {
      assert(
        dirHtml === cleanHtml,
        `Mismatch between index.html and .html clean URL prerender for ${route.path}`
      );
    }

    if (!dirHtml) continue;

    // Check App Shell & Prerender completeness
    assert(dirHtml.includes('<div id="app">'), `${route.path} missing <div id="app">`);
    assert(!dirHtml.includes('<div id="app"></div>'), `${route.path} has empty app container (unrendered SSR!)`);
    assert(dirHtml.includes('<div id="shell-header">'), `${route.path} missing shell header`);
    assert(dirHtml.includes('<div id="shell-footer">'), `${route.path} missing shell footer`);

    // Check for leaked placeholders / undefined
    assert(!dirHtml.includes('undefined'), `${route.path} contains string "undefined"`);
    assert(!dirHtml.includes('null'), `${route.path} contains string "null" in visible output`);
    assert(!dirHtml.includes('[object Object]'), `${route.path} contains "[object Object]"`);
    assert(!dirHtml.includes('NaN'), `${route.path} contains "NaN"`);
    assert(!/\{\{[^}]+\}\}/.test(dirHtml), `${route.path} leaks mustache template placeholders {{...}}`);

    // Title tag
    const titleMatch = dirHtml.match(/<title>([^<]+)<\/title>/);
    assert(titleMatch !== null, `${route.path} missing <title> tag`);
    if (titleMatch) {
      const titleText = titleMatch[1];
      assert(titleText.trim().length > 0, `${route.path} title tag is empty`);
      assert(titleText.endsWith(' · Fund44'), `${route.path} title tag does not end with ' · Fund44'`);
      assert(!titles.has(titleText), `${route.path} duplicate title tag: "${titleText}"`);
      titles.add(titleText);
    }

    // Meta description
    const descMatch = dirHtml.match(/<meta name="description" content="([^"]+)"/);
    assert(descMatch !== null, `${route.path} missing meta description`);
    if (descMatch) {
      assert(descMatch[1].trim().length > 10, `${route.path} meta description is too short`);
    }

    // Canonical tag
    const canonicalMatch = dirHtml.match(/<link rel="canonical" href="([^"]+)"/);
    assert(canonicalMatch !== null, `${route.path} missing canonical link tag`);
    if (canonicalMatch) {
      const expectedCanonical = `https://fund44.com${route.path}`;
      assert(
        canonicalMatch[1] === expectedCanonical,
        `${route.path} canonical URL mismatch: got "${canonicalMatch[1]}", expected "${expectedCanonical}"`
      );
    }

    // OpenGraph and Twitter meta tags
    assert(dirHtml.includes('<meta property="og:title"'), `${route.path} missing og:title`);
    assert(dirHtml.includes('<meta property="og:description"'), `${route.path} missing og:description`);
    assert(dirHtml.includes('<meta property="og:url"'), `${route.path} missing og:url`);
    assert(dirHtml.includes('<meta name="twitter:title"'), `${route.path} missing twitter:title`);

    // JSON-LD Schema
    const jsonLdMatches = [...dirHtml.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    assert(jsonLdMatches.length > 0, `${route.path} has no JSON-LD schema scripts`);

    for (const match of jsonLdMatches) {
      try {
        const schema = JSON.parse(match[1]);
        assert(schema['@context'] === 'https://schema.org', `${route.path} JSON-LD context is not https://schema.org`);
        assert(schema['@type'] !== undefined, `${route.path} JSON-LD missing @type`);
      } catch (err) {
        failures.push(`${route.path} JSON-LD parse error: ${err.message}`);
      }
    }
  }

  // 3. Citations & Local SBA / SBDC Office Audit
  console.log('3. Auditing Local SBA District Offices & SBDC Citations for Texas...');
  const citationMap = new Map(citationRegistry.map((c) => [c.id, c]));

  for (const routeId of ALL_TEXAS_ROUTE_IDS) {
    const route = canonicalRouteMap.get(routeId);
    if (!route) continue;

    const content = getContentById(route.contentId);
    assert(content !== undefined, `Content missing for ${route.contentId}`);
    if (!content) continue;

    // Verify citationIds
    assert(Array.isArray(content.citationIds), `${routeId} content missing citationIds array`);
    if (Array.isArray(content.citationIds)) {
      for (const citId of content.citationIds) {
        assert(citationMap.has(citId), `${routeId} references unknown citationId "${citId}"`);
        const cit = citationMap.get(citId);
        if (cit) {
          assert(cit.url && cit.url.startsWith('https://'), `Citation "${citId}" URL is missing or not HTTPS`);
          assert(cit.title && cit.title.length > 0, `Citation "${citId}" missing title`);
        }
      }
    }

    // Verify local support cards / state support cards
    const supportCards = content.localSupportCards || content.stateSupportCards || [];
    assert(supportCards.length >= 3, `${routeId} support cards count is ${supportCards.length}, expected at least 3`);

    for (const card of supportCards) {
      assert(card.id !== undefined, `${routeId} support card missing id`);
      assert(card.title && card.title.length > 0, `${routeId} support card missing title`);
      assert(card.resourceUrl && card.resourceUrl.startsWith('https://'), `${routeId} support card "${card.id}" resourceUrl missing or not HTTPS`);
      assert(card.description && card.description.length > 0, `${routeId} support card "${card.id}" missing description`);
    }
  }

  // 4. Link Graph & Inbound / Outbound Link Audit
  console.log('4. Auditing Internal Link Graph & Checking for Orphan Pages...');
  const routeHtmlMap = new Map();
  for (const route of canonicalRoutes) {
    const file = path.join(distDir, route.path.replace(/^\//, ''), 'index.html');
    const html = await fs.readFile(file, 'utf8').catch(() => null);
    if (html) {
      routeHtmlMap.set(route.path, html);
    }
  }

  const inboundLinkCounts = new Map(canonicalRoutes.map((r) => [r.path, 0]));

  for (const [sourcePath, html] of routeHtmlMap.entries()) {
    const hrefMatches = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefMatches) {
      if (href.startsWith('/') && !href.startsWith('//')) {
        const cleanPath = href.split('#')[0].split('?')[0];
        if (inboundLinkCounts.has(cleanPath)) {
          if (cleanPath !== sourcePath) {
            inboundLinkCounts.set(cleanPath, inboundLinkCounts.get(cleanPath) + 1);
          }
        }
      }
    }
  }

  // Check Texas routes inbound links
  const texasStateRoute = canonicalRouteMap.get(TEXAS_STATE_ROUTE_ID);
  const stateInbound = inboundLinkCounts.get(texasStateRoute.path) || 0;
  console.log(`- Texas State Hub (${texasStateRoute.path}) inbound link count: ${stateInbound}`);
  assert(stateInbound > 0, `Texas State Hub (${texasStateRoute.path}) is an orphan page (0 inbound internal links)!`);

  for (const routeId of TEXAS_METRO_ROUTE_IDS) {
    const metroRoute = canonicalRouteMap.get(routeId);
    if (!metroRoute) continue;
    const inbound = inboundLinkCounts.get(metroRoute.path) || 0;
    console.log(`- Metro (${metroRoute.path}) inbound link count: ${inbound}`);
    assert(inbound > 0, `Metro route ${metroRoute.path} is an orphan page (0 inbound internal links)!`);
  }

  // Check overall orphan pages across all 41 routes
  for (const [routePath, count] of inboundLinkCounts.entries()) {
    if (count === 0 && routePath !== '/') {
      failures.push(`ORPHAN PAGE DETECTED: Route ${routePath} has 0 inbound internal links!`);
    }
  }

  // Verify Texas State Hub links to all 10 Metro Pages
  const stateHtml = routeHtmlMap.get(texasStateRoute.path);
  assert(stateHtml !== undefined, 'Texas State Hub HTML missing');
  if (stateHtml) {
    for (const routeId of TEXAS_METRO_ROUTE_IDS) {
      const metroRoute = canonicalRouteMap.get(routeId);
      if (metroRoute) {
        assert(
          stateHtml.includes(metroRoute.path),
          `Texas State Hub HTML missing cross-link to metro route ${metroRoute.path}`
        );
      }
    }
  }

  // 5. Crawl Files Audit (sitemap.xml, llms.txt, robots.txt)
  console.log('5. Auditing Crawl Assets (sitemap.xml, llms.txt, robots.txt)...');
  const sitemapXml = await fs.readFile(path.join(distDir, 'sitemap.xml'), 'utf8').catch(() => null);
  const llmsTxt = await fs.readFile(path.join(distDir, 'llms.txt'), 'utf8').catch(() => null);
  const robotsTxt = await fs.readFile(path.join(distDir, 'robots.txt'), 'utf8').catch(() => null);

  assert(sitemapXml !== null, 'sitemap.xml missing in dist/');
  assert(llmsTxt !== null, 'llms.txt missing in dist/');
  assert(robotsTxt !== null, 'robots.txt missing in dist/');

  if (sitemapXml) {
    for (const routeId of ALL_TEXAS_ROUTE_IDS) {
      const route = canonicalRouteMap.get(routeId);
      if (route) {
        const expectedLoc = `<loc>https://fund44.com${route.path}</loc>`;
        assert(sitemapXml.includes(expectedLoc), `sitemap.xml missing entry ${expectedLoc}`);
      }
    }
  }

  if (llmsTxt) {
    for (const routeId of ALL_TEXAS_ROUTE_IDS) {
      const route = canonicalRouteMap.get(routeId);
      if (route) {
        assert(llmsTxt.includes(route.path), `llms.txt missing route entry for ${route.path}`);
      }
    }
  }

  if (robotsTxt) {
    assert(robotsTxt.includes('Sitemap: https://fund44.com/sitemap.xml'), 'robots.txt missing Sitemap directive');
  }

  // Summary
  console.log('\n=== EMPIRICAL CHALLENGER METRO AUDIT RESULTS ===');
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (failures.length > 0) {
    console.error('\nFAILURES FOUND:');
    failures.forEach((f, i) => console.error(` [FAIL ${i + 1}] ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL EMPIRICAL CHALLENGER CHECKS PASSED CLEANLY! ZERO BUGS DETECTED.');
  }
}

runChallengerAudit().catch((err) => {
  console.error('Unhandled error in challenger audit:', err);
  process.exit(1);
});
