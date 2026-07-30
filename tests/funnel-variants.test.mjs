import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ELIGIBILITY_MODES,
  FUNNEL_CONTEXT_KINDS,
  LIVE_INTENDED_STEP_SEQUENCE,
  OUTCOME_CATEGORIES,
  PREVIEW_STEP_SEQUENCE,
  STEP_IDS,
  advanceState,
  createInitialEligibilityState,
  getModeSequence,
  selectMode,
  updateField,
} from '../src/lib/eligibility/model.js';
import { buildFlowContextFromTrigger } from '../src/lib/eligibility/trigger.js';
import { getRoute, hrefForRoute } from '../src/lib/routes.js';
import { familyExemplars, routesInFamily } from './helpers/route-matrix.mjs';
import { flowTriggersOnRoute } from './helpers/flow-markup.mjs';

const CONTEXT_KIND_BY_FAMILY = {
  financing_program: FUNNEL_CONTEXT_KINDS.program,
  use_case: FUNNEL_CONTEXT_KINDS.useCase,
  industry: FUNNEL_CONTEXT_KINDS.industry,
  state: FUNNEL_CONTEXT_KINDS.state,
};

const VARIANT_FAMILIES = Object.keys(CONTEXT_KIND_BY_FAMILY);

const PROFILES = {
  [OUTCOME_CATEGORIES.qualified]: { tib: '2-5 years', revenue: '$500k-$1M' },
  [OUTCOME_CATEGORIES.manualReview]: { tib: 'Under 1 year', revenue: '$250k-$500k' },
  [OUTCOME_CATEGORIES.notFit]: { tib: 'Still planning / pre-revenue', revenue: 'Under $100k' },
};

function withPathname(pathname, run) {
  const previousWindow = global.window;
  global.window = { location: { pathname } };
  try {
    return run();
  } finally {
    global.window = previousWindow;
  }
}

function answerThrough(state, profile) {
  let next = updateField(state, 'use', 'working');
  next = updateField(next, 'amount', '$150k-$350k');
  next = updateField(next, 'tib', profile.tib);
  next = updateField(next, 'revenue', profile.revenue);
  next = updateField(next, 'stateCode', 'CA');
  next = updateField(next, 'previewConsent', true);
  next = updateField(next, 'nextStepConsent', true);
  return next;
}

function walkToTerminalStep(context, mode) {
  let state = selectMode(createInitialEligibilityState(context), mode);
  state = answerThrough(state, PROFILES[OUTCOME_CATEGORIES.qualified]);

  const visited = [state.currentStepId];
  for (let guard = 0; guard < 10; guard += 1) {
    const next = advanceState(state);
    if (next.currentStepId === state.currentStepId) break;
    state = next;
    visited.push(state.currentStepId);
  }

  return { state, visited };
}

test('preview mode advances through every declared step and only attaches an outcome at the end', () => {
  const { state, visited } = walkToTerminalStep({ requestedMode: 'preview' }, ELIGIBILITY_MODES.preview);

  assert.deepEqual(visited, PREVIEW_STEP_SEQUENCE.slice(1));
  assert.equal(state.currentStepId, STEP_IDS.outcome);
  assert.ok(state.outcome, 'outcome payload must be attached on the outcome step');
  assert.equal(state.outcome.outcomeCategory, OUTCOME_CATEGORIES.qualified);
  assert.ok(!visited.includes(STEP_IDS.contactCapture), 'preview mode must never request contact details');
});

test('live mode reaches contact capture step when live mode is enabled', () => {
  const { state, visited } = walkToTerminalStep({ requestedMode: 'live' }, ELIGIBILITY_MODES.live);

  assert.equal(state.currentStepId, STEP_IDS.contactCapture);
  assert.ok(visited.includes(STEP_IDS.contactCapture), 'enabled live mode must reach contact capture');
  assert.ok(visited.includes(STEP_IDS.consentReview), 'live mode must complete consent review before contact capture');
});

test('planned live sequence keeps consent ahead of contact capture', () => {
  const planned = getModeSequence(ELIGIBILITY_MODES.live, { includePlannedLive: true });

  assert.deepEqual(planned, LIVE_INTENDED_STEP_SEQUENCE);
  assert.ok(
    planned.indexOf(STEP_IDS.consentReview) < planned.indexOf(STEP_IDS.contactCapture),
    'consent review must precede contact capture in the planned live sequence',
  );
  assert.ok(!planned.includes(STEP_IDS.liveUnavailable));
});

test('unknown requested modes fall back to the preview sequence', () => {
  const state = createInitialEligibilityState({ requestedMode: 'turbo' });

  // Invalid modes normalize away; with live choice hidden, public entry defaults to preview.
  assert.equal(state.context.requestedMode, 'preview');
  assert.equal(state.context.activeMode, 'preview');
  assert.deepEqual(getModeSequence(state.context.requestedMode), PREVIEW_STEP_SEQUENCE);
});

test('contextual CTAs on every template variant resolve to their own route family', () => {
  for (const routeFamily of VARIANT_FAMILIES) {
    const expectedKind = CONTEXT_KIND_BY_FAMILY[routeFamily];

    for (const route of routesInFamily(routeFamily)) {
      const triggers = flowTriggersOnRoute(route.path);
      assert.ok(triggers.length >= 2, `${route.routeId} must render hero and banner funnel triggers`);

      for (const trigger of triggers) {
        const context = withPathname(route.path, () => buildFlowContextFromTrigger(trigger));

        assert.equal(context.entryRouteId, route.routeId, `${route.routeId}: entry route must be preserved`);
        assert.equal(context.entryRouteFamily, routeFamily, `${route.routeId}: entry route family must be preserved`);
        assert.equal(context.productContextRouteId, route.routeId, `${route.routeId}: product context must stay on-page`);
        assert.equal(context.funnelContextKind, expectedKind, `${route.routeId}: funnel context kind must match the family`);
        assert.equal(context.requestedMode, ELIGIBILITY_MODES.preview, `${route.routeId}: CTAs must request preview mode`);
      }
    }
  }
});

test('markup context markers win when the visited path cannot imply a route family', () => {
  for (const route of familyExemplars(VARIANT_FAMILIES)) {
    for (const trigger of flowTriggersOnRoute(route.path)) {
      const context = withPathname('/contact', () => buildFlowContextFromTrigger(trigger));

      assert.equal(context.entryRouteId, 'contact');
      assert.equal(context.productContextRouteId, route.routeId, `${route.routeId}: markup product context must survive`);
      assert.equal(
        context.funnelContextKind,
        CONTEXT_KIND_BY_FAMILY[route.routeFamily],
        `${route.routeId}: markup funnel context kind must survive`,
      );
    }
  }
});

test('generic surfaces never fabricate a product context for the funnel', () => {
  for (const routeFamily of ['home', 'resources_hub', 'legal', 'contact', 'brand']) {
    for (const route of routesInFamily(routeFamily)) {
      const context = withPathname(route.path, () => buildFlowContextFromTrigger({
        dataset: { ctaId: 'preview_funding_paths', startSurface: 'header_primary', flowMode: 'preview' },
      }));

      assert.equal(context.productContextRouteId, null, `${route.routeId} must not claim a product context`);
      assert.equal(context.productContextTitle, null, `${route.routeId} must not claim a product context title`);
      assert.equal(context.funnelContextKind, FUNNEL_CONTEXT_KINDS.generic, `${route.routeId} must stay generic`);
    }
  }
});

test('outcome routing preserves the entry route family for every variant and outcome category', () => {
  for (const route of familyExemplars(VARIANT_FAMILIES)) {
    const expectedKind = CONTEXT_KIND_BY_FAMILY[route.routeFamily];
    const [trigger] = flowTriggersOnRoute(route.path);
    const context = withPathname(route.path, () => buildFlowContextFromTrigger(trigger));

    for (const [outcomeCategory, profile] of Object.entries(PROFILES)) {
      let state = selectMode(createInitialEligibilityState(context), ELIGIBILITY_MODES.preview);
      state = answerThrough(state, profile);
      for (let guard = 0; guard < 10 && state.currentStepId !== STEP_IDS.outcome; guard += 1) {
        state = advanceState(state);
      }

      const label = `${route.routeId}/${outcomeCategory}`;
      assert.equal(state.currentStepId, STEP_IDS.outcome, `${label} must reach the outcome step`);
      assert.equal(state.outcome.outcomeCategory, outcomeCategory, `${label} must land in the expected bucket`);

      const entryContext = state.outcome.recommendations.find((item) => item.relation === 'entry_context');
      assert.ok(entryContext, `${label} must offer a route back to the entry context`);
      assert.equal(entryContext.routeId, route.routeId, `${label} must return to the entry route`);
      assert.equal(
        getRoute(entryContext.routeId).routeFamily,
        route.routeFamily,
        `${label} must keep the entry route family`,
      );

      for (const recommendation of state.outcome.recommendations) {
        assert.equal(recommendation.contextKind, expectedKind, `${label} recommendation lost its funnel context kind`);
        assert.doesNotThrow(
          () => getRoute(recommendation.routeId),
          `${label} recommends unknown route ${recommendation.routeId}`,
        );
        assert.equal(
          hrefForRoute(recommendation.routeId),
          getRoute(recommendation.routeId).path,
          `${label} recommendation href must match the canonical route path`,
        );
      }
    }
  }
});

test('outcome recommendations stay deduplicated and capped for every outcome category', () => {
  for (const [outcomeCategory, profile] of Object.entries(PROFILES)) {
    let state = selectMode(createInitialEligibilityState({
      requestedMode: 'preview',
      entryRouteId: 'working_capital',
      entryRouteFamily: 'financing_program',
      productContextRouteId: 'working_capital',
      funnelContextKind: FUNNEL_CONTEXT_KINDS.program,
    }), ELIGIBILITY_MODES.preview);
    state = answerThrough(state, profile);
    for (let guard = 0; guard < 10 && state.currentStepId !== STEP_IDS.outcome; guard += 1) {
      state = advanceState(state);
    }

    const routeIds = state.outcome.recommendations.map((item) => item.routeId);
    assert.ok(routeIds.length > 0 && routeIds.length <= 4, `${outcomeCategory} must offer 1-4 next steps`);
    assert.equal(new Set(routeIds).size, routeIds.length, `${outcomeCategory} must not repeat a route`);

    assert.ok(
      routeIds.includes('financing') || routeIds.includes('resources'),
      `${outcomeCategory} must offer a comparison or guidance route`,
    );
    assert.equal(
      routeIds.includes('contact'),
      outcomeCategory !== OUTCOME_CATEGORIES.qualified,
      `${outcomeCategory} must only offer contact for manual-review and not-fit buckets`,
    );
  }
});
