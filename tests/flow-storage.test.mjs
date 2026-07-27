import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ELIGIBILITY_MODES,
  STEP_IDS,
  createInitialEligibilityState,
  selectMode,
  updateField,
} from '../src/lib/eligibility/model.js';
import {
  createResumedEligibilityState,
} from '../src/lib/eligibility/model.js';
import {
  serializeEligibilityState,
} from '../src/lib/eligibility/storage.js';

test('serialized flow state excludes contact-style fields and keeps only minimal preview answers', () => {
  let state = selectMode(createInitialEligibilityState({
    requestedMode: 'preview',
    entryRouteId: 'home',
    productContextRouteId: 'working_capital',
    productContextTitle: 'Injected title should be replaced',
    funnelContextKind: 'program',
  }), ELIGIBILITY_MODES.preview);

  state = updateField(state, 'use', 'working');
  state = updateField(state, 'amount', '$150k-$350k');
  state = updateField(state, 'tib', '2-5 years');
  state = updateField(state, 'revenue', '$500k-$1M');
  state = updateField(state, 'stateCode', 'CA');
  state = updateField(state, 'previewConsent', true);
  state = updateField(state, 'nextStepConsent', true);

  const snapshot = serializeEligibilityState({
    ...state,
    isOpen: true,
  });

  assert.equal(snapshot.isOpen, true);
  assert.deepEqual(Object.keys(snapshot.values).sort(), [
    'amount',
    'nextStepConsent',
    'previewConsent',
    'revenue',
    'stateCode',
    'tib',
    'use',
  ]);
  assert.equal(snapshot.context.entryRouteId, 'home');
  assert.equal(snapshot.context.productContextRouteId, 'working_capital');
  assert.equal(snapshot.context.productContextTitle, 'Working capital & lines of credit');
  assert.equal(snapshot.context.funnelContextKind, 'program');
});

test('resumed state marks recovery and clamps unknown step ids', () => {
  const resumed = createResumedEligibilityState({
    currentStepId: 'unknown_step',
    context: {
      requestedMode: 'preview',
      activeMode: 'preview',
      entryRouteId: 'home',
    },
    values: {
      use: 'working',
      stateCode: 'CA',
    },
  });

  assert.equal(resumed.currentStepId, STEP_IDS.outcome);
  assert.equal(resumed.recovery.resumed, true);
  assert.equal(resumed.recovery.piiDropped, true);
  assert.equal(resumed.values.use, 'working');
  assert.equal(resumed.values.stateCode, 'CA');
});

test('serialized flow state drops invalid persisted context values and keeps generic fallback', () => {
  const snapshot = serializeEligibilityState({
    ...createInitialEligibilityState({
      requestedMode: 'preview',
      entryRouteId: 'contact',
      productContextRouteId: 'not_a_real_route',
      productContextTitle: 'Injected free text',
      funnelContextKind: 'not_allowed',
    }),
    isOpen: true,
  });

  assert.equal(snapshot.context.productContextRouteId, null);
  assert.equal(snapshot.context.productContextTitle, null);
  assert.equal(snapshot.context.funnelContextKind, 'generic');
});
