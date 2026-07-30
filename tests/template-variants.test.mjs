import test from 'node:test';
import assert from 'node:assert/strict';

import { getScalablePageTemplate } from '../content/templates/scalable-page-templates.mjs';
import { isScalableTemplate } from '../content/schema/scalable-page-contract.mjs';
import { getContentByRouteId } from '../src/lib/content.js';
import { getLinkModuleForRoute } from '../src/lib/link-graph.js';
import { getCanonicalRoutes } from '../src/lib/routes.js';
import { routesByFamily } from './helpers/route-matrix.mjs';
import { pageRenderers, renderRouteToHtml } from '../src/pages/index.js';

const SCALABLE_FAMILY_TEMPLATES = {
  financing_hub: 'financing_hub',
  financing_program: 'product_page',
  use_case: 'use_case_page',
  industry: 'industry_page',
  state: 'state_page',
  metro: 'metro_page',
};

const CONTEXT_KIND_BY_FAMILY = {
  financing_program: 'program',
  use_case: 'use_case',
  industry: 'industry',
  state: 'state',
  metro: 'metro',
};

function countOccurrences(html, pattern) {
  return (html.match(pattern) || []).length;
}

function attributeValues(html, attribute) {
  return [...html.matchAll(new RegExp(`${attribute}="([^"]*)"`, 'g'))].map((match) => match[1]);
}

test('every route family that maps to a scalable template has routes and a registered renderer', () => {
  const families = routesByFamily();

  for (const [routeFamily, templateId] of Object.entries(SCALABLE_FAMILY_TEMPLATES)) {
    const routes = families.get(routeFamily) || [];
    assert.ok(routes.length > 0, `route family ${routeFamily} has no routes`);
    assert.ok(isScalableTemplate(templateId), `${templateId} is not a scalable template`);
    assert.ok(getScalablePageTemplate(templateId), `missing template definition for ${templateId}`);

    for (const route of routes) {
      assert.equal(
        route.templateId,
        templateId,
        `route ${route.routeId} in family ${routeFamily} uses unexpected template ${route.templateId}`,
      );
      assert.ok(
        typeof pageRenderers[route.pageKey] === 'function',
        `no renderer registered for page key ${route.pageKey}`,
      );
    }
  }
});

test('scalable template variants render every contracted section block', () => {
  const families = routesByFamily();
  const variantFamilies = ['financing_program', 'use_case', 'industry', 'state', 'metro'];

  for (const routeFamily of variantFamilies) {
    for (const route of families.get(routeFamily)) {
      const { html } = renderRouteToHtml(route.path);
      const content = getContentByRouteId(route.routeId);
      const label = `${routeFamily}:${route.routeId}`;

      assert.equal(countOccurrences(html, /<h1/g), 1, `${label} must render exactly one h1`);
      assert.ok(html.includes('aria-label="Breadcrumb"'), `${label} must render breadcrumbs`);
      assert.ok(html.includes('>Quick answer<'), `${label} must render the quick-answer block`);
      assert.ok(html.includes(content.quickAnswer.term), `${label} must render the quick-answer term`);
      assert.ok(html.includes(content.whoItFits.heading), `${label} must render the who-it-fits heading`);
      assert.ok(html.includes(content.whenItMayNotFit.heading), `${label} must render the when-it-may-not-fit heading`);
      assert.ok(html.includes(content.typicalDocuments.heading), `${label} must render the typical-documents heading`);
      assert.ok(html.includes(content.howFund44Fits.heading), `${label} must render the how-Fund44-fits heading`);
      assert.ok(html.includes('Typical documents and how Fund44 fits'), `${label} must render the prep-and-context section`);
      assert.ok(html.includes('class="faq reveal"'), `${label} must render the FAQ block`);
      assert.ok(html.includes('class="cta-banner reveal"'), `${label} must render the mid-page CTA banner`);
      assert.ok(
        html.includes(getLinkModuleForRoute(route.routeId).heading),
        `${label} must render the related-links module`,
      );
      assert.ok(
        html.includes(`data-disclosure-id="${route.routeId}_section_disclosure"`),
        `${label} must render its section disclosure`,
      );
    }
  }
});

test('scalable template variants keep contracted sections in the documented reading order', () => {
  const families = routesByFamily();

  for (const routeFamily of ['financing_program', 'use_case', 'industry', 'state', 'metro']) {
    for (const route of families.get(routeFamily)) {
      const { html } = renderRouteToHtml(route.path);
      const content = getContentByRouteId(route.routeId);
      const label = `${routeFamily}:${route.routeId}`;

      const breadcrumbAt = html.indexOf('aria-label="Breadcrumb"');
      const quickAnswerAt = html.indexOf('>Quick answer<');
      const fitAt = html.indexOf(content.whoItFits.heading);
      const documentsAt = html.indexOf('Typical documents and how Fund44 fits');
      const disclosureAt = html.indexOf(`data-disclosure-id="${route.routeId}_section_disclosure"`);
      const bannerAt = html.indexOf('class="cta-banner reveal"');
      const relatedLinksAt = html.indexOf(getLinkModuleForRoute(route.routeId).heading);
      const faqAt = html.indexOf('class="faq reveal"');

      assert.ok(breadcrumbAt >= 0 && breadcrumbAt < quickAnswerAt, `${label}: breadcrumbs must open the page`);
      assert.ok(quickAnswerAt < fitAt, `${label}: quick answer must precede fit sections`);
      assert.ok(fitAt < documentsAt, `${label}: fit sections must precede documents and how-we-fit`);
      assert.ok(documentsAt < disclosureAt, `${label}: documents must precede the comparison disclosure`);
      assert.ok(disclosureAt < bannerAt, `${label}: comparison disclosure must precede the funnel CTA banner`);
      assert.ok(bannerAt < relatedLinksAt, `${label}: funnel CTA banner must precede related links`);
      assert.ok(relatedLinksAt < faqAt, `${label}: related links must precede the FAQ block`);
    }
  }
});

test('scalable template variants attach their own route family to every funnel CTA', () => {
  const families = routesByFamily();

  for (const [routeFamily, expectedKind] of Object.entries(CONTEXT_KIND_BY_FAMILY)) {
    for (const route of families.get(routeFamily)) {
      const { html } = renderRouteToHtml(route.path);
      const label = `${routeFamily}:${route.routeId}`;

      const contextKinds = new Set(attributeValues(html, 'data-flow-context-kind'));
      const productRouteIds = new Set(attributeValues(html, 'data-flow-product-route-id'));
      const flowTriggerCount = countOccurrences(html, /data-open-flow/g);

      assert.ok(flowTriggerCount >= 2, `${label} must expose hero and banner funnel triggers`);
      assert.deepEqual([...contextKinds], [expectedKind], `${label} must only advertise its own funnel context kind`);
      assert.deepEqual([...productRouteIds], [route.routeId], `${label} must only advertise its own product context route`);
      assert.equal(
        countOccurrences(html, /data-flow-context-kind=/g),
        flowTriggerCount,
        `${label} must attach a context kind to every funnel trigger`,
      );
    }
  }
});

test('scalable template variants render FAQ entries with unique ids bound to the measurement group', () => {
  const families = routesByFamily();

  for (const routeFamily of ['financing_program', 'use_case', 'industry', 'state', 'metro']) {
    for (const route of families.get(routeFamily)) {
      const { html } = renderRouteToHtml(route.path);
      const content = getContentByRouteId(route.routeId);
      const label = `${routeFamily}:${route.routeId}`;

      const faqIds = attributeValues(html, 'data-faq-id');
      const faqGroups = new Set(attributeValues(html, 'data-faq-group'));

      assert.equal(faqIds.length, content.commonQuestions.length, `${label} must render every common question`);
      assert.equal(new Set(faqIds).size, faqIds.length, `${label} must keep FAQ ids unique`);
      assert.deepEqual([...faqGroups], [content.measurement.faqGroup], `${label} must bind FAQs to one measurement group`);
    }
  }
});

test('no generated page leaks unresolved template placeholders', () => {
  for (const route of getCanonicalRoutes()) {
    const { html } = renderRouteToHtml(route.path);
    const label = route.routeId;

    assert.doesNotMatch(html, /\$\{/, `${label} leaks an unresolved template expression`);
    assert.doesNotMatch(html, /\bundefined\b/, `${label} leaks an undefined value`);
    assert.doesNotMatch(html, /\[object Object\]/, `${label} leaks a stringified object`);
    assert.doesNotMatch(html, /\bNaN\b/, `${label} leaks a NaN value`);
    assert.doesNotMatch(html, />\s*null\s*</, `${label} leaks a null value`);
  }
});
