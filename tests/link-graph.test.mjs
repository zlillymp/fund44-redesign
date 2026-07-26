import test from 'node:test';
import assert from 'node:assert/strict';

import { getLinkGraph, getLinkModuleForRoute, validateLinkGraph } from '../src/lib/link-graph.js';

test('link graph covers every canonical indexable route without harmful validation errors', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);

  assert.equal(graph.nodes.length, 15);
  assert.equal(validation.errors.length, 0);
});

test('product pages expose hub, contextual, and next-step modules', () => {
  const module = getLinkModuleForRoute('sba_7a');
  const hub = module.groups.find((group) => group.relation === 'hub');
  const contextual = module.groups.find((group) => group.relation === 'contextual');
  const next = module.groups.find((group) => group.relation === 'next');

  assert.equal(hub.items.length, 1);
  assert.equal(hub.items[0].targetRouteId, 'financing');
  assert.ok(contextual.items.some((item) => item.targetRouteId === 'resource_sba_7a_vs_504'));
  assert.ok(contextual.items.some((item) => item.targetRouteId === 'sba_504'));
  assert.equal(next.items[0].targetRouteId, 'how_it_works');
});

test('article pages route visitors back to the hub and onward to related comparisons', () => {
  const module = getLinkModuleForRoute('resource_sba_7a_vs_504');
  const hub = module.groups.find((group) => group.relation === 'hub');
  const contextual = module.groups.find((group) => group.relation === 'contextual');
  const next = module.groups.find((group) => group.relation === 'next');

  assert.equal(hub.items[0].targetRouteId, 'resources');
  assert.ok(contextual.items.some((item) => item.targetRouteId === 'sba_7a'));
  assert.ok(contextual.items.some((item) => item.targetRouteId === 'sba_504'));
  assert.ok(contextual.items.some((item) => item.targetRouteId === 'resource_preparing_documents'));
  assert.equal(next.items[0].targetRouteId, 'financing');
});

test('no rendered link target is self-referential, duplicated, or non-indexable', () => {
  const graph = getLinkGraph();

  graph.modules.forEach((module) => {
    const seen = new Set();
    module.groups.forEach((group) => {
      group.items.forEach((item) => {
        assert.notEqual(item.targetRouteId, module.routeId);
        const key = `${item.targetRouteId}:${group.relation}`;
        assert.equal(seen.has(key), false, `duplicate relation link on ${module.routeId} -> ${key}`);
        seen.add(key);
      });
    });
  });
});
