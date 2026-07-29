import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ELIGIBILITY_MODES,
  FUNNEL_CONTEXT_KINDS,
  OUTCOME_CATEGORIES,
  STEP_IDS,
  advanceState,
  createInitialEligibilityState,
  deriveOutcome,
  getContextEntryPhrase,
  getCurrentSequence,
  getEntryContextSummary,
  getStepCount,
  restartState,
  selectMode,
  updateField,
} from '../src/lib/eligibility/model.js';

test('preview flow uses explicit stable step ids', () => {
  const state = selectMode(createInitialEligibilityState({ requestedMode: 'preview' }), ELIGIBILITY_MODES.preview);

  assert.deepEqual(getCurrentSequence(state), [
    STEP_IDS.modeSelect,
    STEP_IDS.useOfFunds,
    STEP_IDS.fundingAmount,
    STEP_IDS.businessProfile,
    STEP_IDS.consentReview,
    STEP_IDS.outcome,
  ]);
  assert.equal(getStepCount(state), 6);
});

test('live flow remains blocked but still preserves pre-contact steps', () => {
  const state = selectMode(createInitialEligibilityState({ requestedMode: 'live' }), ELIGIBILITY_MODES.live);

  assert.deepEqual(getCurrentSequence(state), [
    STEP_IDS.modeSelect,
    STEP_IDS.useOfFunds,
    STEP_IDS.fundingAmount,
    STEP_IDS.businessProfile,
    STEP_IDS.consentReview,
    STEP_IDS.liveUnavailable,
  ]);
  assert.equal(state.currentStepId, STEP_IDS.useOfFunds);
});

test('validation blocks advance until required fields are present', () => {
  let state = selectMode(createInitialEligibilityState(), ELIGIBILITY_MODES.preview);
  state = advanceState(state);

  assert.equal(state.currentStepId, STEP_IDS.useOfFunds);
  assert.equal(state.errors.use, 'Choose the financing goal you want to review.');
});

test('preview outcome uses advisory qualified bucket for operating profiles', () => {
  let state = selectMode(createInitialEligibilityState({ requestedMode: 'preview' }), ELIGIBILITY_MODES.preview);
  state = updateField(state, 'use', 'acquisition');
  state = updateField(state, 'amount', '$350k-$750k');
  state = updateField(state, 'tib', '2-5 years');
  state = updateField(state, 'revenue', '$500k-$1M');
  state = updateField(state, 'stateCode', 'CA');
  state = updateField(state, 'previewConsent', true);
  state = updateField(state, 'nextStepConsent', true);

  const outcome = deriveOutcome(state);

  assert.equal(outcome.outcomeCategory, OUTCOME_CATEGORIES.qualified);
  assert.equal(outcome.outcomeReasonCode, 'operating_profile');
  assert.ok(outcome.recommendations.some((item) => item.routeId === 'business_acquisition'));
});

test('early-stage profiles map to manual review without implying denial', () => {
  let state = selectMode(createInitialEligibilityState({ requestedMode: 'preview' }), ELIGIBILITY_MODES.preview);
  state = updateField(state, 'use', 'working');
  state = updateField(state, 'amount', '$150k-$350k');
  state = updateField(state, 'tib', 'Under 1 year');
  state = updateField(state, 'revenue', '$250k-$500k');
  state = updateField(state, 'stateCode', 'TX');

  const outcome = deriveOutcome(state);

  assert.equal(outcome.outcomeCategory, OUTCOME_CATEGORIES.manualReview);
  assert.equal(outcome.outcomeReasonCode, 'early_stage_profile');
  assert.equal(outcome.recommendedNextStep, 'review_docs_and_contact');
});

test('planning-stage profile maps to not-fit routing guidance', () => {
  let state = selectMode(createInitialEligibilityState({ requestedMode: 'preview' }), ELIGIBILITY_MODES.preview);
  state = updateField(state, 'use', 'expansion');
  state = updateField(state, 'amount', '$50k-$150k');
  state = updateField(state, 'tib', 'Still planning / pre-revenue');
  state = updateField(state, 'revenue', 'Under $100k');
  state = updateField(state, 'stateCode', 'NY');

  const outcome = deriveOutcome(state);

  assert.equal(outcome.outcomeCategory, OUTCOME_CATEGORIES.notFit);
  assert.equal(outcome.outcomeReasonCode, 'planning_stage');
  assert.ok(outcome.recommendations.some((item) => item.routeId === 'resources'));
});

test('restart keeps entry context but resets answers and mode selection state', () => {
  let state = selectMode(createInitialEligibilityState({
    requestedMode: 'preview',
    entryRouteId: 'working_capital',
    productContextRouteId: 'working_capital',
  }), ELIGIBILITY_MODES.preview);

  state = updateField(state, 'use', 'working');
  state = updateField(state, 'amount', '$150k-$350k');

  const reset = restartState(state);

  assert.equal(reset.currentStepId, STEP_IDS.modeSelect);
  assert.equal(reset.values.use, '');
  assert.equal(reset.values.amount, '');
  assert.equal(reset.context.entryRouteId, 'working_capital');
  assert.equal(reset.context.productContextRouteId, 'working_capital');
});

test('outcome recommendations preserve route-family context for program entries', () => {
  let state = selectMode(createInitialEligibilityState({
    requestedMode: 'preview',
    entryRouteId: 'working_capital',
    entryTitle: 'Working capital & lines of credit',
    entryRouteFamily: 'financing_program',
    productContextRouteId: 'working_capital',
    productContextTitle: 'Working capital & lines of credit',
    funnelContextKind: FUNNEL_CONTEXT_KINDS.program,
  }), ELIGIBILITY_MODES.preview);

  state = updateField(state, 'use', 'working');
  state = updateField(state, 'amount', '$150k-$350k');
  state = updateField(state, 'tib', '2-5 years');
  state = updateField(state, 'revenue', '$500k-$1M');
  state = updateField(state, 'stateCode', 'CA');

  const outcome = deriveOutcome(state);
  const entryContext = outcome.recommendations.find((item) => item.relation === 'entry_context');

  assert.equal(entryContext.routeId, 'working_capital');
  assert.equal(entryContext.contextKind, FUNNEL_CONTEXT_KINDS.program);
});

test('outcome recommendations preserve route-family context for use-case, industry, and state entries', () => {
  const cases = [
    ['buy_a_business', 'Financing to buy a business', FUNNEL_CONTEXT_KINDS.useCase],
    ['franchise_businesses', 'Financing for franchise businesses', FUNNEL_CONTEXT_KINDS.industry],
    ['california_sba_loans', 'California SBA loan resources', FUNNEL_CONTEXT_KINDS.state],
  ];

  for (const [routeId, title, contextKind] of cases) {
    let state = selectMode(createInitialEligibilityState({
      requestedMode: 'preview',
      entryRouteId: routeId,
      entryTitle: title,
      productContextRouteId: routeId,
      productContextTitle: title,
      funnelContextKind: contextKind,
    }), ELIGIBILITY_MODES.preview);

    state = updateField(state, 'use', 'acquisition');
    state = updateField(state, 'amount', '$350k-$750k');
    state = updateField(state, 'tib', '2-5 years');
    state = updateField(state, 'revenue', '$500k-$1M');
    state = updateField(state, 'stateCode', 'CA');

    const outcome = deriveOutcome(state);
    const entryContext = outcome.recommendations.find((item) => item.relation === 'entry_context');

    assert.equal(entryContext.routeId, routeId);
    assert.equal(entryContext.contextKind, contextKind);
  }
});

test('entry-context copy reads as one sentence regardless of source punctuation', () => {
  const state = createInitialEligibilityState({ requestedMode: 'preview' });
  state.context.entryTitle = 'Fund44 — More ways to fund your business.';

  const summary = getEntryContextSummary(state);

  assert.doesNotMatch(summary, /\.\./);
  assert.match(summary, /^Started from Fund44 — More ways to fund your business\. That /);
});

test('result-screen entry phrase names the source page with the right article', () => {
  assert.equal(getContextEntryPhrase(FUNNEL_CONTEXT_KINDS.generic), 'a general site page');
  assert.equal(getContextEntryPhrase(FUNNEL_CONTEXT_KINDS.program), 'a product page');
  assert.equal(getContextEntryPhrase(FUNNEL_CONTEXT_KINDS.industry), 'an industry page');
});
