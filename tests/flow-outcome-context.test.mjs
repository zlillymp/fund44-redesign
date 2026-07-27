import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OUTCOME_CATEGORIES,
  createInitialEligibilityState,
  getOutcomeRecommendations,
} from '../src/lib/eligibility/model.js';

function stateWith(context = {}, values = {}) {
  const state = createInitialEligibilityState(context);
  state.values = { ...state.values, ...values };
  return state;
}

test('outcome recommendations lead with the product context the visitor entered from', () => {
  const state = stateWith({
    entryRouteId: 'use_case_equipment_purchase',
    entryTitle: 'Equipment purchase financing',
    productContextRouteId: 'use_case_equipment_purchase',
    productContextTitle: 'Equipment purchase financing',
  }, { use: 'equipment' });

  const recommendations = getOutcomeRecommendations(state, OUTCOME_CATEGORIES.qualified);

  assert.equal(recommendations[0].relation, 'entry_context');
  assert.equal(recommendations[0].routeId, 'use_case_equipment_purchase');
  assert.equal(recommendations[0].label, 'Equipment purchase financing');
});

test('outcome recommendations fall back to the entry route when no product context exists', () => {
  const state = stateWith({
    entryRouteId: 'resources',
    entryTitle: 'Resources',
  }, { use: 'working' });

  const recommendations = getOutcomeRecommendations(state, OUTCOME_CATEGORIES.qualified);

  assert.equal(recommendations[0].relation, 'entry_context');
  assert.equal(recommendations[0].routeId, 'resources');
});

test('home entries produce no entry-context recommendation', () => {
  const state = stateWith({ entryRouteId: 'home' }, { use: 'working' });

  const recommendations = getOutcomeRecommendations(state, OUTCOME_CATEGORIES.qualified);

  assert.ok(recommendations.every((item) => item.relation !== 'entry_context'));
});

test('use-of-funds selection drives the recommended path', () => {
  const state = stateWith({ entryRouteId: 'home' }, { use: 'working' });

  const recommendations = getOutcomeRecommendations(state, OUTCOME_CATEGORIES.qualified);
  const recommended = recommendations.find((item) => item.relation === 'recommended_path');

  assert.equal(recommended?.routeId, 'working_capital');
});

test('outcome category adjusts the closing next steps', () => {
  const base = { entryRouteId: 'home' };

  const manualReview = getOutcomeRecommendations(
    stateWith(base, { use: 'working' }),
    OUTCOME_CATEGORIES.manualReview,
  );
  assert.ok(manualReview.some((item) => item.relation === 'contact'));

  // With no use-of-funds selection there is room for both closing items.
  const notFit = getOutcomeRecommendations(stateWith(base), OUTCOME_CATEGORIES.notFit);
  assert.ok(notFit.some((item) => item.relation === 'contact'));
  assert.ok(notFit.some((item) => item.relation === 'guidance' && item.routeId === 'resources'));

  // With a full selection the entry/recommended/related items win the four slots.
  const notFitFull = getOutcomeRecommendations(
    stateWith(base, { use: 'working' }),
    OUTCOME_CATEGORIES.notFit,
  );
  assert.ok(notFitFull.some((item) => item.relation === 'contact'));
  assert.ok(notFitFull.length <= 4);

  const qualified = getOutcomeRecommendations(
    stateWith(base, { use: 'acquisition' }),
    OUTCOME_CATEGORIES.qualified,
  );
  assert.ok(qualified.every((item) => item.relation !== 'contact'));
  assert.ok(qualified.some((item) => item.relation === 'compare' && item.routeId === 'financing'));
});

test('recommendations dedupe by route and never exceed four entries', () => {
  const state = stateWith({
    entryRouteId: 'working_capital',
    entryTitle: 'Working capital & lines of credit',
    productContextRouteId: 'working_capital',
    productContextTitle: 'Working capital & lines of credit',
  }, { use: 'working' });

  const recommendations = getOutcomeRecommendations(state, OUTCOME_CATEGORIES.manualReview);
  const routeIds = recommendations.map((item) => item.routeId);

  assert.equal(new Set(routeIds).size, routeIds.length);
  assert.ok(recommendations.length <= 4);
  assert.equal(routeIds.filter((routeId) => routeId === 'working_capital').length, 1);
});
