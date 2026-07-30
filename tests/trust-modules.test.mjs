import test from 'node:test';
import assert from 'node:assert/strict';

import { analyticsEventSpec } from '../src/lib/analytics.js';
import { footer, header } from '../src/components/shell.js';
import { getCanonicalRoutes } from '../src/lib/routes.js';
import { renderRouteToHtml } from '../src/pages/index.js';

const SHARED_ANALYTICS_FIELDS = new Set(analyticsEventSpec.trust_module_view.sharedFields);

function datasetAttributeFor(field) {
  return `data-${field.replaceAll('_', '-')}`;
}

function markupFieldsFor(eventName) {
  return analyticsEventSpec[eventName].requiredFields.filter((field) => !SHARED_ANALYTICS_FIELDS.has(field));
}

function blocksWithAttribute(html, attribute) {
  return [...html.matchAll(new RegExp(`<[a-z]+[^>]*\\s${attribute}="[^"]*"[^>]*>`, 'g'))].map((match) => match[0]);
}

function attributeValue(tag, attribute) {
  return tag.match(new RegExp(`${attribute}="([^"]*)"`))?.[1] ?? null;
}

function renderedSurfaces() {
  return getCanonicalRoutes().map((route) => ({
    routeId: route.routeId,
    html: renderRouteToHtml(route.path).html,
  }));
}

test('trust and disclosure analytics contracts still map onto data attributes', () => {
  assert.deepEqual(markupFieldsFor('trust_module_view'), ['trust_module_id', 'trust_type', 'evidence_source']);
  assert.deepEqual(markupFieldsFor('trust_module_click'), ['trust_module_id', 'trust_type', 'destination']);
  assert.deepEqual(markupFieldsFor('disclosure_view'), ['disclosure_id', 'disclosure_context', 'disclosure_version']);
});

test('every rendered trust module carries the attributes its view event requires', () => {
  const viewFields = markupFieldsFor('trust_module_view');
  let trustModuleCount = 0;

  for (const { routeId, html } of renderedSurfaces()) {
    for (const tag of blocksWithAttribute(html, 'data-trust-module-id')) {
      trustModuleCount += 1;
      for (const field of viewFields) {
        const attribute = datasetAttributeFor(field);
        const value = attributeValue(tag, attribute);
        assert.ok(value, `${routeId}: trust module is missing ${attribute}`);
        assert.notEqual(value.trim(), '', `${routeId}: trust module has an empty ${attribute}`);
      }
    }
  }

  assert.ok(trustModuleCount > 0, 'expected at least one trust module across canonical routes');
});

test('trust module ids stay unique per page and globally across canonical routes', () => {
  const globalIds = new Set();

  for (const { routeId, html } of renderedSurfaces()) {
    const ids = blocksWithAttribute(html, 'data-trust-module-id')
      .map((tag) => attributeValue(tag, 'data-trust-module-id'));

    assert.equal(new Set(ids).size, ids.length, `${routeId} repeats a trust module id`);

    for (const id of ids) {
      assert.ok(!globalIds.has(id), `trust module id ${id} is reused outside ${routeId}`);
      globalIds.add(id);
    }
  }

  assert.ok(globalIds.has('home_hero_proof'), 'home coverage trust module must remain instrumented');
});

test('trust modules expose an accessible name so the trust surface stays announceable', () => {
  for (const { routeId, html } of renderedSurfaces()) {
    for (const tag of blocksWithAttribute(html, 'data-trust-module-id')) {
      const id = attributeValue(tag, 'data-trust-module-id');
      assert.ok(
        /\saria-label(ledby)?="[^"]+"/.test(tag),
        `${routeId}: trust module ${id} needs aria-label or aria-labelledby`,
      );
    }
  }
});

test('every rendered disclosure carries the attributes its view event requires', () => {
  const viewFields = markupFieldsFor('disclosure_view');
  const versions = new Set();

  for (const { routeId, html } of [...renderedSurfaces(), { routeId: 'shell', html: `${header()}${footer()}` }]) {
    const ids = [];

    for (const tag of blocksWithAttribute(html, 'data-disclosure-id')) {
      for (const field of viewFields) {
        const attribute = datasetAttributeFor(field);
        const value = attributeValue(tag, attribute);
        assert.ok(value, `${routeId}: disclosure is missing ${attribute}`);
        assert.notEqual(value.trim(), '', `${routeId}: disclosure has an empty ${attribute}`);
      }

      ids.push(attributeValue(tag, 'data-disclosure-id'));
      versions.add(attributeValue(tag, 'data-disclosure-version'));
    }

    assert.equal(new Set(ids).size, ids.length, `${routeId} repeats a disclosure id`);
  }

  assert.equal(versions.size, 1, `disclosure versions must stay aligned, found ${[...versions].join(', ')}`);
});

test('every canonical route ships at least one disclosure across page and shell surfaces', () => {
  const shellHtml = `${header()}${footer()}`;

  for (const { routeId, html } of renderedSurfaces()) {
    const count = blocksWithAttribute(`${html}${shellHtml}`, 'data-disclosure-id').length;
    assert.ok(count > 0, `${routeId} must render at least one disclosure`);
  }
});

test('trust module ids never collide with disclosure ids', () => {
  const shellHtml = `${header()}${footer()}`;
  const trustIds = new Set();
  const disclosureIds = new Set();

  for (const { html } of [...renderedSurfaces(), { html: shellHtml }]) {
    blocksWithAttribute(html, 'data-trust-module-id')
      .forEach((tag) => trustIds.add(attributeValue(tag, 'data-trust-module-id')));
    blocksWithAttribute(html, 'data-disclosure-id')
      .forEach((tag) => disclosureIds.add(attributeValue(tag, 'data-disclosure-id')));
  }

  const collisions = [...trustIds].filter((id) => disclosureIds.has(id));
  assert.deepEqual(collisions, [], `ids shared between trust and disclosure surfaces: ${collisions.join(', ')}`);
});
