import test from 'node:test';
import assert from 'node:assert/strict';

import { getLinkGraph, getLinkModuleForRoute, validateLinkGraph } from '../src/lib/link-graph.js';

test('link graph covers every canonical indexable route without harmful validation errors', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);

  assert.equal(graph.nodes.length, 41);
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

test('new national financing routes receive hub/contextual/next coverage and inbound links', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);
  const inbound = validation.inboundCounts;

  ['term_loan', 'line_of_credit', 'equipment_financing'].forEach((routeId) => {
    const module = getLinkModuleForRoute(routeId);
    const hub = module.groups.find((group) => group.relation === 'hub');
    const contextual = module.groups.find((group) => group.relation === 'contextual');
    const next = module.groups.find((group) => group.relation === 'next');

    assert.equal(hub.items[0].targetRouteId, 'financing');
    assert.ok(contextual.items.length >= 3);
    assert.equal(next.items[0].targetRouteId, 'how_it_works');
    assert.ok((inbound.get(routeId) || 0) > 0, `${routeId} should have at least one inbound link`);
  });
});

test('use-case routes receive hub/contextual/next coverage and inbound links', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);
  const inbound = validation.inboundCounts;

  [
    'buy_a_business',
    'owner_occupied_real_estate',
    'cash_flow_needs',
    'equipment_purchase',
    'business_expansion',
    'refinance_business_debt',
  ].forEach((routeId) => {
    const module = getLinkModuleForRoute(routeId);
    const hub = module.groups.find((group) => group.relation === 'hub');
    const contextual = module.groups.find((group) => group.relation === 'contextual');
    const next = module.groups.find((group) => group.relation === 'next');

    assert.equal(hub.items[0].targetRouteId, 'financing');
    assert.ok(contextual.items.length >= 4);
    assert.equal(next.items[0].targetRouteId, 'how_it_works');
    assert.ok((inbound.get(routeId) || 0) > 0, `${routeId} should have at least one inbound link`);
  });
});

test('industry routes receive hub/contextual/next coverage and inbound links', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);
  const inbound = validation.inboundCounts;

  [
    'franchise_businesses',
    'trucking_companies',
    'construction_contractors',
  ].forEach((routeId) => {
    const module = getLinkModuleForRoute(routeId);
    const hub = module.groups.find((group) => group.relation === 'hub');
    const contextual = module.groups.find((group) => group.relation === 'contextual');
    const next = module.groups.find((group) => group.relation === 'next');

    assert.equal(hub.items[0].targetRouteId, 'financing');
    assert.ok(contextual.items.length >= 5);
    assert.equal(next.items[0].targetRouteId, 'how_it_works');
    assert.ok((inbound.get(routeId) || 0) > 0, `${routeId} should have at least one inbound link`);
  });
});

test('state routes receive hub/contextual/next coverage and inbound links', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);
  const inbound = validation.inboundCounts;

  [
    'california_sba_loans',
    'florida_sba_loans',
    'new_york_sba_loans',
    'texas_sba_loans',
  ].forEach((routeId) => {
    const module = getLinkModuleForRoute(routeId);
    const hub = module.groups.find((group) => group.relation === 'hub');
    const contextual = module.groups.find((group) => group.relation === 'contextual');
    const next = module.groups.find((group) => group.relation === 'next');

    assert.equal(hub.items[0].targetRouteId, 'financing');
    assert.ok(contextual.items.length >= 6);
    assert.equal(next.items[0].targetRouteId, 'how_it_works');
    assert.ok((inbound.get(routeId) || 0) > 0, `${routeId} should have at least one inbound link`);
  });
});

test('metro routes receive hub/contextual/next coverage and inbound links', () => {
  const graph = getLinkGraph();
  const validation = validateLinkGraph(graph);
  const inbound = validation.inboundCounts;

  [
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
  ].forEach((routeId) => {
    const module = getLinkModuleForRoute(routeId);
    const hub = module.groups.find((group) => group.relation === 'hub');
    const contextual = module.groups.find((group) => group.relation === 'contextual');
    const next = module.groups.find((group) => group.relation === 'next');

    assert.equal(hub.items[0].targetRouteId, 'texas_sba_loans');
    assert.ok(contextual.items.length >= 4);
    assert.equal(next.items[0].targetRouteId, 'how_it_works');
    assert.ok((inbound.get(routeId) || 0) > 0, `${routeId} should have at least one inbound link`);
  });
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
