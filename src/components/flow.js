import { icon } from '../lib/svg.js';
import { getContentByRouteId } from '../lib/content.js';
import { getRoute, getRouteMatch, hrefForRoute } from '../lib/routes.js';
import {
  disclosures,
  liveDisclosuresBlocked,
  liveEligibilityGate,
} from '../lib/legal.js';
import {
  AMOUNT_OPTIONS,
  ELIGIBILITY_MODES,
  FIELD_IDS,
  FUNNEL_CONTEXT_KINDS,
  OUTCOME_CATEGORIES,
  REVENUE_OPTIONS,
  STEP_IDS,
  TIME_IN_BUSINESS_OPTIONS,
  US_STATE_CODES,
  USE_OPTIONS,
  advanceState,
  canGoBack,
  createInitialEligibilityState,
  getAnnouncement,
  getConsentChecklist,
  getContextEntryPhrase,
  getContextKindLabel,
  getContextProofCopy,
  getCurrentSequence,
  getEntryContextSummary,
  getFieldError,
  getModeDescription,
  getModeLabel,
  getNextStepChecklist,
  getProgressPercent,
  getStepCount,
  getStepDefinition,
  getStepIndex,
  getUseOption,
  goBack,
  restartState,
  selectMode,
  updateField,
  validateStep,
} from '../lib/eligibility/model.js';
import {
  trackApplicationStart,
  trackApplicationSubmitAttempt,
  trackApplicationSubmitResult,
  trackContactRequestSubmit,
  trackEligibilityModeView,
  trackEligibilityOutcomeView,
  trackEligibilityStart,
  trackEligibilityStepComplete,
  trackEligibilityStepView,
  trackEligibilityValidationError,
} from '../lib/analytics.js';
import { submitLead, submitApplication } from '../lib/submit.js';
import {
  clearEligibilityState,
  isFlowHistoryState,
  persistEligibilityState,
  pushFlowHistoryState,
  readEligibilityState,
  replaceFlowHistoryState,
} from '../lib/eligibility/storage.js';
import { buildFlowContextFromTrigger } from '../lib/eligibility/trigger.js';

const FLOW_TITLE_BY_MODE = {
  [ELIGIBILITY_MODES.preview]: 'Funding path preview',
  [ELIGIBILITY_MODES.live]: 'Funding path intake',
};

let flowState = createInitialEligibilityState();
let backdrop;
let lastFocus = null;
let historyEntryActive = false;
let isBootstrappingFromStorage = false;
let trackedFlowKey = null;
let trackedStepViewKey = null;
let trackedOutcomeKey = null;
let previouslyFocusedInsideFlow = null;

function currentEligibilityMode(state = flowState) {
  return state.context.activeMode || state.context.requestedMode || ELIGIBILITY_MODES.preview;
}

function currentFlowKey() {
  return [
    flowState.context.entryRouteId || 'unknown_route',
    flowState.context.startSurface || 'unknown_surface',
    flowState.context.startCtaId || 'unknown_cta',
    currentEligibilityMode(flowState),
  ].join('::');
}

function stepDefinitionForState(state = flowState) {
  return getStepDefinition(state.currentStepId, state);
}

function currentStepViewKey() {
  const definition = stepDefinitionForState();
  return [currentFlowKey(), definition?.id || 'unknown_step'].join('::');
}

function currentOutcomeKey() {
  const outcome = flowState.outcome;
  if (!outcome) return null;
  return [
    currentFlowKey(),
    outcome.outcomeCategory || 'unknown_outcome',
    outcome.outcomeReasonCode || 'unknown_reason',
  ].join('::');
}

function resetTrackedFlowEvents() {
  trackedFlowKey = null;
  trackedStepViewKey = null;
  trackedOutcomeKey = null;
}

function contactRequestTypeForOutcome(outcomeCategory) {
  if (outcomeCategory === OUTCOME_CATEGORIES.notFit) {
    return 'not_fit_contact_request';
  }

  return 'manual_review_contact_request';
}

function maybeTrackFlowLifecycle() {
  if (!flowState.isOpen) return;

  const flowKey = currentFlowKey();
  if (trackedFlowKey !== flowKey) {
    trackedFlowKey = flowKey;
    trackedStepViewKey = null;
    trackedOutcomeKey = null;

    trackEligibilityModeView({
      eligibilityMode: currentEligibilityMode(),
      modeSource: flowState.context.modeSource || 'ui',
      eligibleNextActions: getCurrentSequence(flowState)
        .filter((stepId) => stepId !== STEP_IDS.modeSelect)
        .slice(0, 3),
    });

    trackEligibilityStart({
      eligibilityMode: currentEligibilityMode(),
      startSurface: flowState.context.startSurface || 'unknown',
      startCtaId: flowState.context.startCtaId || 'unknown',
      modeSource: flowState.context.modeSource || 'ui',
    });
  }

  const definition = stepDefinitionForState();
  const stepViewKey = currentStepViewKey();
  if (definition && trackedStepViewKey !== stepViewKey) {
    trackedStepViewKey = stepViewKey;
    trackEligibilityStepView({
      eligibilityMode: currentEligibilityMode(),
      stepId: definition.id,
      stepName: definition.name,
      stepIndex: getStepIndex(flowState) + 1,
      stepCount: getStepCount(flowState),
    });
  }

  if (flowState.currentStepId === STEP_IDS.outcome && flowState.outcome) {
    const outcomeKey = currentOutcomeKey();
    if (outcomeKey && trackedOutcomeKey !== outcomeKey) {
      trackedOutcomeKey = outcomeKey;
      trackEligibilityOutcomeView({
        eligibilityMode: currentEligibilityMode(),
        outcomeCategory: flowState.outcome.outcomeCategory,
        outcomeReasonCode: flowState.outcome.outcomeReasonCode,
        recommendedNextStep: flowState.outcome.recommendedNextStep,
      });
    }
  }
}

function flowRecommendationCtaId(item) {
  switch (item?.relation) {
    case 'contact':
      return 'contact_after_manual_review';
    case 'compare':
      return 'compare_financing_after_outcome';
    case 'entry_context':
      switch (item?.contextKind) {
        case FUNNEL_CONTEXT_KINDS.program:
          return 'return_to_program_context';
        case FUNNEL_CONTEXT_KINDS.useCase:
          return 'return_to_use_case_context';
        case FUNNEL_CONTEXT_KINDS.industry:
          return 'return_to_industry_context';
        case FUNNEL_CONTEXT_KINDS.state:
          return 'return_to_state_context';
        default:
          return 'return_to_entry_context';
      }
    case 'recommended_path':
      return 'recommended_path_after_outcome';
    case 'guidance':
      return 'guidance_after_not_fit';
    case 'related_path':
      return 'related_path_after_outcome';
    default:
      return 'outcome_next_step';
  }
}

function queueFocus(target, attempts = 2) {
  if (!target) return;
  const tryFocus = () => {
    if (!target?.isConnected) return;
    focusElementWithoutScroll(target);
    if (document.activeElement !== target && attempts > 0) {
      window.setTimeout(() => queueFocus(target, attempts - 1), 32);
    }
  };

  window.setTimeout(() => {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(tryFocus);
      return;
    }
    tryFocus();
  }, 0);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function modeTagLabel() {
  const mode = flowState.context.activeMode || flowState.context.requestedMode || ELIGIBILITY_MODES.preview;
  return mode === ELIGIBILITY_MODES.live ? 'Eligibility live mode' : 'Eligibility preview';
}

function contextTagLabel() {
  return `${getContextKindLabel(flowState.context.funnelContextKind)} context`;
}

function routeLabel(routeId) {
  try {
    return getContentByRouteId(routeId)?.title || routeId;
  } catch {
    try {
      return getRoute(routeId)?.title || routeId;
    } catch {
      return routeId;
    }
  }
}

function recommendationLabel(item) {
  if (!item?.routeId) return '';
  if (item.relation === 'entry_context') {
    switch (item.contextKind) {
      case FUNNEL_CONTEXT_KINDS.program:
        return item.label || 'Return to this financing page';
      case FUNNEL_CONTEXT_KINDS.useCase:
        return item.label || 'Return to this use-case page';
      case FUNNEL_CONTEXT_KINDS.industry:
        return item.label || 'Return to this industry page';
      case FUNNEL_CONTEXT_KINDS.state:
        return item.label || 'Return to this state page';
      default:
        return item.label || 'Return to your starting page';
    }
  }
  if (item.label && item.label !== item.routeId) return item.label;
  return routeLabel(item.routeId);
}

function matchedPathLabels() {
  const option = getUseOption(flowState.values.use);
  const useLabel = option?.label || 'Relevant financing path';
  const contextKind = flowState.context.funnelContextKind;

  const pathMap = {
    acquisition: [
      'Business acquisition financing',
      'SBA 7(a) comparison',
      'Document-prep guidance for acquisitions',
    ],
    realestate: [
      'SBA 504 overview',
      'SBA 7(a) real-estate comparison',
      'Financing overview',
    ],
    working: [
      'Working-capital paths',
      'Line-of-credit comparison',
      'Document-prep guidance',
    ],
    equipment: [
      'Equipment and working-capital comparison',
      'SBA 504 fixed-asset path',
      'Financing overview',
    ],
    expansion: [
      'SBA 7(a) growth path',
      'Financing overview',
      'Document-prep guidance',
    ],
    refinance: [
      'SBA 7(a) refinance comparison',
      'Working-capital comparison',
      'Financing overview',
    ],
  };

  const contextSpecific = {
    [FUNNEL_CONTEXT_KINDS.program]: 'Return to the product page that opened this preview',
    [FUNNEL_CONTEXT_KINDS.useCase]: 'Keep the borrower-goal comparison tied to the use-case page that opened this preview',
    [FUNNEL_CONTEXT_KINDS.industry]: 'Keep the next step tied to the industry-specific comparison page that opened this preview',
    [FUNNEL_CONTEXT_KINDS.state]: 'Keep the next step tied to the state-resource page that opened this preview',
  };

  return [
    ...(pathMap[flowState.values.use] || [useLabel, 'Financing overview']),
    contextSpecific[contextKind] || 'Return to the page that opened this preview',
  ].slice(0, 3);
}

function renderModeCards() {
  const activeMode = flowState.context.activeMode;
  const previewSelected = activeMode === ELIGIBILITY_MODES.preview;
  const liveSelected = activeMode === ELIGIBILITY_MODES.live;
  const error = getFieldError(flowState, FIELD_IDS.mode);
  const errorId = `${FIELD_IDS.mode}-error`;
  const showLiveChoice = liveEligibilityGate.showModeChoice !== false;

  return `
    <div class="field${error ? ' err' : ''}">
      <div class="choice-grid ${showLiveChoice ? 'choice-grid-stack' : ''}" role="radiogroup" aria-label="Eligibility mode">
        <button
          type="button"
          class="choice choice-mode ${previewSelected ? 'sel' : ''}"
          data-mode-choice="${ELIGIBILITY_MODES.preview}"
          role="radio"
          aria-checked="${previewSelected}"
          aria-describedby="${error ? errorId : ''}"
        >
          <b>${getModeLabel(ELIGIBILITY_MODES.preview)}</b>
          <span>${getModeDescription(ELIGIBILITY_MODES.preview)}</span>
        </button>
        ${showLiveChoice ? `
        <button
          type="button"
          class="choice choice-mode ${liveSelected ? 'sel' : ''}"
          data-mode-choice="${ELIGIBILITY_MODES.live}"
          role="radio"
          aria-checked="${liveSelected}"
          aria-describedby="${error ? errorId : ''}"
        >
          <b>${getModeLabel(ELIGIBILITY_MODES.live)}</b>
          <span>${getModeDescription(ELIGIBILITY_MODES.live)}</span>
        </button>` : ''}
      </div>
      <p class="field-err" id="${errorId}" data-err="${FIELD_IDS.mode}">${escapeHtml(error)}</p>
    </div>
  `;
}

function renderUseOptions() {
  const error = getFieldError(flowState, FIELD_IDS.use);
  const errorId = `${FIELD_IDS.use}-error`;
  return `
    <div class="field${error ? ' err' : ''}">
      <div class="choice-grid" role="radiogroup" aria-label="Use of funds">
        ${USE_OPTIONS.map((option) => `
          <button
            type="button"
            class="choice ${flowState.values.use === option.value ? 'sel' : ''}"
            data-choice="${FIELD_IDS.use}"
            data-val="${option.value}"
            role="radio"
            aria-checked="${flowState.values.use === option.value}"
            aria-describedby="${error ? errorId : ''}"
          >
            <b>${escapeHtml(option.label)}</b>
            <span>${escapeHtml(option.description)}</span>
          </button>
        `).join('')}
      </div>
      <p class="field-err" id="${errorId}" data-err="${FIELD_IDS.use}">${escapeHtml(error)}</p>
    </div>
  `;
}

function renderSelectField({ fieldId, label, hint = '', options, value, placeholder, errorId }) {
  const error = getFieldError(flowState, errorId);
  const hintId = hint ? `f-${fieldId}-hint` : '';
  const errorMessageId = `f-${fieldId}-error`;
  const describedBy = [hintId, error ? errorMessageId : ''].filter(Boolean).join(' ');
  return `
    <div class="field${error ? ' err' : ''}">
      <label for="f-${fieldId}">${escapeHtml(label)}${hint ? ` <span class="hint" id="${hintId}">${escapeHtml(hint)}</span>` : ''}</label>
      <select
        class="select"
        id="f-${fieldId}"
        data-field="${fieldId}"
        aria-invalid="${error ? 'true' : 'false'}"
        ${describedBy ? `aria-describedby="${describedBy}"` : ''}
      >
        <option value="">${escapeHtml(placeholder)}</option>
        ${options.map((option) => `
          <option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>
        `).join('')}
      </select>
      <p class="field-err" id="${errorMessageId}" data-err="${errorId}">${escapeHtml(error)}</p>
    </div>
  `;
}

function renderConsentReview() {
  const consentItems = getConsentChecklist(flowState);
  const nextStepItems = getNextStepChecklist(flowState);
  const previewError = getFieldError(flowState, FIELD_IDS.previewConsent);
  const previewErrorId = `${FIELD_IDS.previewConsent}-error`;
  const nextStepError = getFieldError(flowState, FIELD_IDS.nextStepConsent);
  const nextStepErrorId = `${FIELD_IDS.nextStepConsent}-error`;

  return `
    <div class="field consent-card${previewError ? ' err' : ''}">
      <div class="eyebrow mb-4">Current mode</div>
      <p class="muted text-body-sm">${escapeHtml(getModeDescription(flowState.context.activeMode))}</p>
      <label class="check-option" for="f-preview-consent">
        <input
          id="f-preview-consent"
          type="checkbox"
          data-field="${FIELD_IDS.previewConsent}"
          ${flowState.values.previewConsent ? 'checked' : ''}
          aria-invalid="${previewError ? 'true' : 'false'}"
          aria-describedby="preview-consent-items${previewError ? ` ${previewErrorId}` : ''}"
        />
        <span>I understand the current mode boundary.</span>
      </label>
      <ul role="list" class="checklist-list" id="preview-consent-items">
        ${consentItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p class="field-err" id="${previewErrorId}" data-err="${FIELD_IDS.previewConsent}">${escapeHtml(previewError)}</p>
    </div>

    <div class="field consent-card${nextStepError ? ' err' : ''}">
      <div class="eyebrow mb-4">What happens next</div>
      <p class="muted text-body-sm">${escapeHtml(getEntryContextSummary(flowState))}</p>
      <p class="muted text-body-sm mt-4">${escapeHtml(getContextProofCopy(flowState.context.funnelContextKind))}</p>
      <label class="check-option" for="f-next-step-consent">
        <input
          id="f-next-step-consent"
          type="checkbox"
          data-field="${FIELD_IDS.nextStepConsent}"
          ${flowState.values.nextStepConsent ? 'checked' : ''}
          aria-invalid="${nextStepError ? 'true' : 'false'}"
          aria-describedby="next-step-items${nextStepError ? ` ${nextStepErrorId}` : ''}"
        />
        <span>I understand the next step in this build.</span>
      </label>
      <ul role="list" class="checklist-list" id="next-step-items">
        ${nextStepItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p class="field-err" id="${nextStepErrorId}" data-err="${FIELD_IDS.nextStepConsent}">${escapeHtml(nextStepError)}</p>
    </div>

    <div class="dialog-note dialog-note-inline" id="flowConsentBoundaryNote">
      <strong>Preview and privacy boundary.</strong> ${escapeHtml(disclosures.previewFlow)} ${escapeHtml(disclosures.previewPrivacy)}
    </div>
  `;
}

function renderLiveUnavailable() {
  return `
    <div class="dialog-body">
      <div class="success-mark success-mark-muted">${icon.info}</div>
      <h2 class="step-title flow-center" id="flowDialogTitle">${escapeHtml(getStepDefinition(STEP_IDS.liveUnavailable, flowState).title)}</h2>
      <p class="step-why flow-center">${escapeHtml(liveEligibilityGate.summary)}</p>
      <div class="result-summary layout-left">
        <div class="eyebrow mb-6">Exact blockers</div>
        ${liveEligibilityGate.missingInputs.map((item) => `<div class="result-path"><span class="rp-dot"></span>${escapeHtml(item)}</div>`).join('')}
      </div>
      <div class="dialog-note dialog-note-inline flow-note-left">
        <strong>Current safe action.</strong> ${escapeHtml(liveDisclosuresBlocked.liveEligibility)}
      </div>
    </div>
    <div class="dialog-foot">
      <button class="btn btn-ghost" data-flow-restart>Choose another mode</button>
      <button class="btn btn-primary btn-block" data-flow-close>Close</button>
    </div>
  `;
}

function renderOutcomeView() {
  const outcome = flowState.outcome;
  const selectedUse = getUseOption(flowState.values.use);
  const resultPaths = matchedPathLabels();
  const entryPhrase = getContextEntryPhrase(flowState.context.funnelContextKind);

  if (!outcome) {
    return '';
  }

  return `
    <div class="dialog-body flow-center">
      <div class="success-mark">${outcome.outcomeCategory === OUTCOME_CATEGORIES.notFit ? icon.close : icon.check}</div>
      <span class="tag">${escapeHtml(outcome.badge)}</span>
      <h2 class="step-title mt-4" id="flowDialogTitle">${escapeHtml(outcome.heading)}</h2>
      <p class="step-why">${escapeHtml(outcome.summary)}</p>
      <p class="muted text-body-sm flow-center mt-4">Started from ${escapeHtml(entryPhrase)}. The recommendations below keep that route intent attached to the next step.</p>
      <div class="result-summary layout-left">
        <div class="rs-row"><span>Mode</span><b>${escapeHtml(getModeLabel(flowState.context.activeMode || ELIGIBILITY_MODES.preview))}</b></div>
        <div class="rs-row"><span>Entry context</span><b>${escapeHtml(flowState.context.productContextTitle || flowState.context.entryTitle || 'Generic preview entry')}</b></div>
        <div class="rs-row"><span>Use of funds</span><b>${escapeHtml(selectedUse?.label || 'Not selected')}</b></div>
        <div class="rs-row"><span>Amount</span><b>${escapeHtml(flowState.values.amount || 'Not selected')}</b></div>
        <div class="rs-row"><span>Time in business</span><b>${escapeHtml(flowState.values.tib || 'Not selected')}</b></div>
        <div class="rs-row"><span>Revenue</span><b>${escapeHtml(flowState.values.revenue || 'Not selected')}</b></div>
        <div class="rs-row"><span>State</span><b>${escapeHtml(flowState.values.stateCode || 'Not selected')}</b></div>
      </div>
      <div class="result-paths">
        ${resultPaths.map((path) => `<div class="result-path"><span class="rp-dot"></span>${escapeHtml(path)}</div>`).join('')}
      </div>
      <div class="outcome-actions">
        ${outcome.recommendations.map((item) => `
          <a
            class="btn ${item.relation === 'contact' ? 'btn-ghost' : 'btn-primary'} btn-block"
            href="${hrefForRoute(item.routeId)}"
            data-analytics-cta-id="${escapeHtml(flowRecommendationCtaId(item))}"
            data-analytics-cta-label="${escapeHtml(recommendationLabel(item))}"
            data-analytics-cta-type="${item.relation === 'contact' ? 'secondary' : 'primary'}"
            data-analytics-cta-placement="eligibility_outcome"
            data-destination-route-id="${escapeHtml(item.routeId)}"
            data-eligibility-mode="${escapeHtml(currentEligibilityMode())}"
            data-flow-outcome-relation="${escapeHtml(item.relation || '')}"
          >
            ${escapeHtml(recommendationLabel(item))}
          </a>
        `).join('')}
        ${(outcome.outcomeCategory === OUTCOME_CATEGORIES.qualified || outcome.outcomeCategory === OUTCOME_CATEGORIES.manualReview) && currentEligibilityMode() === ELIGIBILITY_MODES.preview ? `
          <button
            class="btn btn-primary btn-block"
            data-flow-contact-capture
            data-analytics-cta-id="get_matched"
            data-analytics-cta-label="Get matched"
            data-analytics-cta-type="primary"
            data-analytics-cta-placement="eligibility_outcome"
          >Get matched ${icon.arrow}</button>
        ` : ''}
      </div>
      <div class="dialog-note dialog-note-inline flow-note-left">
        <strong>What this means.</strong> ${escapeHtml(disclosures.illustrative)} ${escapeHtml(disclosures.noGuarantees)}
      </div>
    </div>
    <div class="dialog-foot">
      <button class="btn btn-ghost" data-flow-restart>Start over</button>
      <button class="btn btn-primary btn-block" data-flow-close>Done</button>
    </div>
  `;
}

function renderContactCapture() {
  const nameError = getFieldError(flowState, FIELD_IDS.contactName);
  const emailError = getFieldError(flowState, FIELD_IDS.contactEmail);
  const phoneError = getFieldError(flowState, FIELD_IDS.contactPhone);
  const businessNameError = getFieldError(flowState, FIELD_IDS.businessName);

  const isLive = currentEligibilityMode() === ELIGIBILITY_MODES.live;
  const submitLabel = isLive ? 'Submit application' : 'Get matched';

  return `
    <div class="field${nameError ? ' err' : ''}">
      <label for="f-contactName">Your name</label>
      <input
        class="select"
        id="f-contactName"
        type="text"
        data-field="${FIELD_IDS.contactName}"
        value="${escapeHtml(flowState.values.contactName || '')}"
        aria-invalid="${nameError ? 'true' : 'false'}"
        autocomplete="name"
      />
      <p class="field-err">${escapeHtml(nameError)}</p>
    </div>
    <div class="field${emailError ? ' err' : ''}">
      <label for="f-contactEmail">Email address</label>
      <input
        class="select"
        id="f-contactEmail"
        type="email"
        data-field="${FIELD_IDS.contactEmail}"
        value="${escapeHtml(flowState.values.contactEmail || '')}"
        aria-invalid="${emailError ? 'true' : 'false'}"
        autocomplete="email"
      />
      <p class="field-err">${escapeHtml(emailError)}</p>
    </div>
    <div class="field${phoneError ? ' err' : ''}">
      <label for="f-contactPhone">Phone number</label>
      <input
        class="select"
        id="f-contactPhone"
        type="tel"
        data-field="${FIELD_IDS.contactPhone}"
        value="${escapeHtml(flowState.values.contactPhone || '')}"
        aria-invalid="${phoneError ? 'true' : 'false'}"
        autocomplete="tel"
      />
      <p class="field-err">${escapeHtml(phoneError)}</p>
    </div>
    <div class="field${businessNameError ? ' err' : ''}">
      <label for="f-businessName">Business name</label>
      <input
        class="select"
        id="f-businessName"
        type="text"
        data-field="${FIELD_IDS.businessName}"
        value="${escapeHtml(flowState.values.businessName || '')}"
        aria-invalid="${businessNameError ? 'true' : 'false'}"
        autocomplete="organization"
      />
      <p class="field-err">${escapeHtml(businessNameError)}</p>
    </div>
    <input type="hidden" data-flow-submit-label="${escapeHtml(submitLabel)}" />
  `;
}

let submissionResult = null;

function renderSubmissionResult() {
  if (!submissionResult) return '';
  const isSuccess = submissionResult.ok;
  return `
    <div class="dialog-body flow-center">
      <div class="success-mark${isSuccess ? '' : ' success-mark-muted'}">${isSuccess ? icon.check : icon.close}</div>
      <h2 class="step-title mt-4" id="flowDialogTitle">${isSuccess ? 'Thank you' : 'Submission failed'}</h2>
      <p class="step-why">${escapeHtml(
        isSuccess
          ? 'Your information has been submitted. A Fund44 team member will reach out to you shortly.'
          : submissionResult.error || 'Something went wrong. Please try again or contact us directly.',
      )}</p>
      <div class="dialog-note dialog-note-inline flow-note-left">
        <strong>What happens next.</strong> ${escapeHtml(disclosures.noGuarantees)}
      </div>
    </div>
    <div class="dialog-foot">
      <button class="btn btn-primary btn-block" data-flow-close>Done</button>
    </div>
  `;
}

function renderStepFields(stepId) {
  switch (stepId) {
    case STEP_IDS.modeSelect:
      return renderModeCards();
    case STEP_IDS.useOfFunds:
      return renderUseOptions();
    case STEP_IDS.fundingAmount:
      return renderSelectField({
        fieldId: FIELD_IDS.amount,
        label: 'Desired amount',
        hint: '(USD, approximate)',
        options: AMOUNT_OPTIONS,
        value: flowState.values.amount,
        placeholder: 'Select a range...',
        errorId: FIELD_IDS.amount,
      });
    case STEP_IDS.businessProfile:
      return `
        ${renderSelectField({
          fieldId: FIELD_IDS.tib,
          label: 'Time in business',
          options: TIME_IN_BUSINESS_OPTIONS,
          value: flowState.values.tib,
          placeholder: 'Select time in business...',
          errorId: FIELD_IDS.tib,
        })}
        ${renderSelectField({
          fieldId: FIELD_IDS.revenue,
          label: 'Annual revenue range',
          options: REVENUE_OPTIONS,
          value: flowState.values.revenue,
          placeholder: 'Select revenue...',
          errorId: FIELD_IDS.revenue,
        })}
        ${renderSelectField({
          fieldId: FIELD_IDS.stateCode,
          label: 'State of operation',
          options: US_STATE_CODES,
          value: flowState.values.stateCode,
          placeholder: 'Select state...',
          errorId: FIELD_IDS.stateCode,
        })}
      `;
    case STEP_IDS.consentReview:
      return renderConsentReview();
    case STEP_IDS.contactCapture:
      return renderContactCapture();
    default:
      return '';
  }
}

function primaryButtonLabel(stepId) {
  if (stepId === STEP_IDS.modeSelect) return 'Continue';
  if (stepId === STEP_IDS.consentReview) return flowState.context.activeMode === ELIGIBILITY_MODES.live ? 'Review live availability' : 'See my preview';
  if (stepId === STEP_IDS.contactCapture) {
    const isLive = currentEligibilityMode() === ELIGIBILITY_MODES.live;
    return isLive ? 'Submit application' : 'Get matched';
  }
  return 'Continue';
}

function renderDialogFrame(definition) {
  const progressPercent = getProgressPercent(flowState);
  const stepIndex = getStepIndex(flowState) + 1;
  const stepCount = getStepCount(flowState);
  const note = flowState.context.activeMode === ELIGIBILITY_MODES.live
    ? liveDisclosuresBlocked.liveEligibility
    : disclosures.previewFlow;

  return `
    <div class="dialog-head">
      <div class="dialog-head-row">
        <span class="tag">${icon.route} ${escapeHtml(modeTagLabel())}</span>
        <span class="tag">${icon.info} ${escapeHtml(contextTagLabel())}</span>
        <button class="dialog-close" data-flow-close aria-label="Close">${icon.close}</button>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPercent}%;"></div></div>
      <div class="progress-label">Step ${stepIndex} of ${stepCount} · ${escapeHtml(definition.id)}</div>
    </div>
    <div class="dialog-body">
      <h2 class="step-title" id="flowDialogTitle">${escapeHtml(definition.title)}</h2>
      <p class="step-why">${escapeHtml(definition.description)}</p>
      ${renderStepFields(definition.id)}
    </div>
    <div class="dialog-foot">
      ${canGoBack(flowState) ? '<button class="btn btn-ghost" data-flow-back>Back</button>' : ''}
      <button class="btn btn-primary btn-block" data-flow-next>${primaryButtonLabel(definition.id)} ${icon.arrow}</button>
    </div>
    <p class="dialog-note"><strong>Current build notice.</strong> ${escapeHtml(note)}</p>
  `;
}

function renderDialog() {
  if (submissionResult) {
    return renderSubmissionResult();
  }

  if (flowState.currentStepId === STEP_IDS.liveUnavailable) {
    return renderLiveUnavailable();
  }

  if (flowState.currentStepId === STEP_IDS.outcome) {
    return renderOutcomeView();
  }

  const definition = getStepDefinition(flowState.currentStepId, flowState);
  return renderDialogFrame(definition);
}

function mount() {
  backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <div class="dialog" id="flowDialog" role="dialog" aria-modal="true" aria-labelledby="flowDialogTitle" aria-describedby="flowDialogAnnouncement" tabindex="-1">
      <p class="sr-only" id="flowDialogAnnouncement" aria-live="polite"></p>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      closeFlow();
    }
  });
}

function focusPrimaryInteractiveElement() {
  const selectors = [
    '[data-mode-choice]',
    '[data-choice]',
    '.select',
    'input[type="checkbox"]',
    '[data-flow-next]',
    '.dialog-close',
    'a.btn',
  ];

  const target = selectors
    .map((selector) => backdrop.querySelector(selector))
    .find(Boolean);
  previouslyFocusedInsideFlow = target || null;
  queueFocus(target);
}

function getFocusableElements(root = backdrop) {
  if (!root) return [];
  return [...root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute('hidden') && !element.closest('[hidden]'));
}

function focusElementWithoutScroll(target) {
  target?.focus?.({ preventScroll: true });
}

function shouldReduceMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function syncStorage() {
  if (flowState.isOpen) {
    persistEligibilityState(flowState);
    return;
  }

  persistEligibilityState(flowState);
}

function paint({ focus = true } = {}) {
  const dialog = backdrop.querySelector('#flowDialog');
  dialog.innerHTML = `
    <p class="sr-only" id="flowDialogAnnouncement" aria-live="polite">${escapeHtml(getAnnouncement(flowState))}</p>
    ${renderDialog()}
  `;
  dialog.scrollTop = 0;
  dialog.setAttribute('aria-label', FLOW_TITLE_BY_MODE[flowState.context.activeMode] || FLOW_TITLE_BY_MODE.preview);
  syncStorage();
  maybeTrackFlowLifecycle();

  if (focus) {
    queueMicrotask(focusPrimaryInteractiveElement);
  }
}

function markOpenState(isOpen) {
  flowState = {
    ...flowState,
    isOpen,
  };
}

function openFlow(trigger = null, { resume = false } = {}) {
  if (!backdrop) mount();

  if (!resume) {
    const currentRouteId = getRouteMatch(window.location.pathname).route.routeId;
    const snapshot = readEligibilityState();
    const canResumeClosedState = Boolean(
      snapshot?.state
      && snapshot.isOpen === false
      && ![STEP_IDS.outcome, STEP_IDS.liveUnavailable].includes(snapshot.state.currentStepId)
      && snapshot.state.context.entryRouteId === currentRouteId
    );

    if (canResumeClosedState) {
      flowState = {
        ...snapshot.state,
        isOpen: true,
      };
    } else {
      const context = trigger ? buildFlowContextFromTrigger(trigger) : {};
      flowState = createInitialEligibilityState(context);
    }
  }

  lastFocus = trigger || document.activeElement;
  previouslyFocusedInsideFlow = null;
  markOpenState(true);
  paint();
  backdrop.classList.add('open');
  backdrop.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';

  if (!historyEntryActive && !isBootstrappingFromStorage) {
    pushFlowHistoryState(true);
    historyEntryActive = true;
  }
}

function closeFlow({ fromHistory = false } = {}) {
  if (!backdrop?.classList.contains('open')) return;
  const returnFocusTarget = lastFocus;

  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  markOpenState(false);
  submissionResult = null;
  syncStorage();

  if (historyEntryActive && !fromHistory) {
    historyEntryActive = false;
    window.history.back();
  } else if (historyEntryActive && fromHistory) {
    historyEntryActive = false;
    replaceFlowHistoryState();
  }

  queueFocus(returnFocusTarget);
  previouslyFocusedInsideFlow = null;
  resetTrackedFlowEvents();
}

async function handleContactSubmission() {
  const isLive = currentEligibilityMode() === ELIGIBILITY_MODES.live;
  const contactFields = {
    contactName: flowState.values.contactName || '',
    contactEmail: flowState.values.contactEmail || '',
    contactPhone: flowState.values.contactPhone || '',
    businessName: flowState.values.businessName || '',
  };

  trackApplicationSubmitAttempt({
    eligibilityMode: currentEligibilityMode(),
    stepId: STEP_IDS.contactCapture,
    attemptNumber: 1,
  });

  const dialog = backdrop?.querySelector('#flowDialog');
  if (dialog) {
    dialog.innerHTML = `
      <p class="sr-only" id="flowDialogAnnouncement" aria-live="polite">Submitting your information...</p>
      <div class="dialog-body flow-center">
        <div class="step-title">Submitting...</div>
        <p class="step-why">Please wait while we submit your information.</p>
      </div>
    `;
  }

  const result = isLive
    ? await submitApplication(flowState, contactFields)
    : await submitLead(flowState, contactFields);

  submissionResult = result;

  trackApplicationSubmitResult({
    eligibilityMode: currentEligibilityMode(),
    result: result.ok ? 'success' : 'failed',
    failureReasonCode: result.ok ? '' : (result.error || 'unknown'),
    integrationTarget: isLive ? 'application_webhook' : 'lead_webhook',
  });

  if (result.ok) {
    trackContactRequestSubmit({
      requestType: isLive ? 'application' : 'lead',
      sourceOutcome: flowState.outcome?.outcomeCategory || '',
      eligibilityMode: currentEligibilityMode(),
    });
  }

  paint();
}

function restartFlow() {
  flowState = restartState(flowState);
  submissionResult = null;
  resetTrackedFlowEvents();
  paint();
}

function selectFlowMode(mode) {
  const previousState = flowState;
  const previousDefinition = stepDefinitionForState(previousState);
  flowState = selectMode(flowState, mode);
  if (previousDefinition?.id === STEP_IDS.modeSelect) {
    trackEligibilityStepComplete({
      eligibilityMode: currentEligibilityMode(flowState),
      stepId: previousDefinition.id,
      stepName: previousDefinition.name,
      stepIndex: getStepIndex(previousState) + 1,
    });
  }
  if (flowState.currentStepId === STEP_IDS.liveUnavailable) {
    markOpenState(true);
  }
  paint();
}

function handleChoice(choice) {
  const fieldId = choice.dataset.choice;
  const value = choice.dataset.val;
  flowState = updateField(flowState, fieldId, value);
  paint({ focus: false });
}

function normalizeFieldValue(field, value) {
  if (field.type === 'checkbox') {
    return field.checked;
  }

  return value;
}

function handleFieldInput(field) {
  const fieldId = field.dataset.field;
  if (!fieldId) return;
  flowState = updateField(flowState, fieldId, normalizeFieldValue(field, field.value));
  syncStorage();
}

function focusFirstError() {
  const firstField = backdrop.querySelector('.field.err .choice, .field.err .select, .field.err input, .field.err button');
  focusElementWithoutScroll(firstField);
  firstField?.closest('.field')?.scrollIntoView({ behavior: shouldReduceMotion() ? 'auto' : 'smooth', block: 'center' });
}

function next() {
  const previousState = flowState;
  const previousDefinition = stepDefinitionForState(previousState);
  const errors = validateStep(previousState);
  if (Object.keys(errors).length > 0) {
    flowState = {
      ...previousState,
      errors,
      isOpen: true,
    };
    trackEligibilityValidationError({
      eligibilityMode: currentEligibilityMode(),
      stepId: previousState.currentStepId,
      fieldIds: Object.keys(errors),
      errorType: 'validation_block',
    });
    paint({ focus: false });
    focusFirstError();
    return;
  }

  if (previousState.currentStepId === STEP_IDS.contactCapture) {
    handleContactSubmission();
    return;
  }

  const candidate = advanceState(flowState);
  flowState = {
    ...candidate,
    isOpen: true,
  };
  if (previousDefinition) {
    trackEligibilityStepComplete({
      eligibilityMode: currentEligibilityMode(flowState),
      stepId: previousDefinition.id,
      stepName: previousDefinition.name,
      stepIndex: getStepIndex(previousState) + 1,
    });
  }

  if (flowState.currentStepId === STEP_IDS.liveUnavailable) {
    trackApplicationStart({
      sourceOutcome: 'live_mode_unavailable',
      applicationMode: ELIGIBILITY_MODES.live,
      startSurface: flowState.context.startSurface || 'unknown',
    });
    trackApplicationSubmitAttempt({
      eligibilityMode: ELIGIBILITY_MODES.live,
      stepId: STEP_IDS.liveUnavailable,
      attemptNumber: 1,
    });
    trackApplicationSubmitResult({
      eligibilityMode: ELIGIBILITY_MODES.live,
      result: 'blocked',
      failureReasonCode: 'live_mode_unavailable',
      integrationTarget: 'none',
    });
  }

  paint({ focus: !Object.keys(flowState.errors).length });

  if (Object.keys(flowState.errors).length) {
    focusFirstError();
  }
}

function back() {
  flowState = {
    ...goBack(flowState),
    isOpen: true,
  };
  paint();
}

function resumeStoredFlowIfNeeded() {
  const snapshot = readEligibilityState();
  if (!snapshot?.isOpen || !snapshot.state) {
    return;
  }

  isBootstrappingFromStorage = true;
  flowState = {
    ...snapshot.state,
    isOpen: true,
  };
  openFlow(null, { resume: true });
  isBootstrappingFromStorage = false;
}

function handleHistoryPop(event) {
  if (backdrop?.classList.contains('open') && isFlowHistoryState(event.state)) {
    historyEntryActive = true;
    return;
  }

  if (backdrop?.classList.contains('open')) {
    closeFlow({ fromHistory: true });
  }
}

export function initFlow() {
  document.body.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-flow]');
    if (trigger) {
      event.preventDefault();
      openFlow(trigger);
      return;
    }

    if (!backdrop) return;
    const dialogLink = event.target.closest('.dialog a[href]');
    if (dialogLink) {
      if (dialogLink.dataset.flowOutcomeRelation === 'contact') {
        trackContactRequestSubmit({
          requestType: contactRequestTypeForOutcome(flowState.outcome?.outcomeCategory),
          sourceOutcome: flowState.outcome?.outcomeCategory || '',
          eligibilityMode: currentEligibilityMode(),
        });
      }
      closeFlow();
      return;
    }
    if (event.target.closest('[data-flow-close]')) {
      closeFlow();
      return;
    }
    if (event.target.closest('[data-flow-back]')) {
      back();
      return;
    }
    if (event.target.closest('[data-flow-next]')) {
      next();
      return;
    }
    if (event.target.closest('[data-flow-restart]')) {
      restartFlow();
      return;
    }

    if (event.target.closest('[data-flow-contact-capture]')) {
      flowState = {
        ...flowState,
        currentStepId: STEP_IDS.contactCapture,
        completedStepIds: [...new Set([...flowState.completedStepIds, STEP_IDS.outcome])],
        errors: {},
      };
      paint();
      return;
    }

    const modeChoice = event.target.closest('[data-mode-choice]');
    if (modeChoice) {
      selectFlowMode(modeChoice.dataset.modeChoice);
      return;
    }

    const choice = event.target.closest('[data-choice]');
    if (choice) {
      handleChoice(choice);
    }
  });

  document.body.addEventListener('input', (event) => {
    const field = event.target.closest('[data-field]');
    if (!field || !backdrop?.classList.contains('open')) return;
    handleFieldInput(field);
  });

  document.body.addEventListener('change', (event) => {
    const field = event.target.closest('[data-field]');
    if (!field || !backdrop?.classList.contains('open')) return;
    handleFieldInput(field);
    paint({ focus: false });
  });

  document.body.addEventListener('keydown', (event) => {
    if (!backdrop?.classList.contains('open')) return;

    if (event.key === 'Escape') {
      closeFlow();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements(backdrop);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !backdrop.contains(active))) {
        event.preventDefault();
        focusElementWithoutScroll(last);
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        focusElementWithoutScroll(first);
      }
    }

    if (event.key === 'Enter' && event.target.closest('[data-mode-choice]')) {
      event.preventDefault();
      selectFlowMode(event.target.closest('[data-mode-choice]').dataset.modeChoice);
      return;
    }

    if ((event.key === ' ' || event.key === 'Spacebar') && event.target.closest('[data-mode-choice], [data-choice]')) {
      event.preventDefault();
      const choice = event.target.closest('[data-mode-choice], [data-choice]');
      if (choice?.dataset.modeChoice) {
        selectFlowMode(choice.dataset.modeChoice);
      } else if (choice?.dataset.choice) {
        handleChoice(choice);
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      const current = event.target.closest('[data-mode-choice], [data-choice]');
      if (!current) return;
      const fieldSelector = current.hasAttribute('data-mode-choice')
        ? '[data-mode-choice]'
        : `[data-choice="${current.dataset.choice}"]`;
      const choices = [...backdrop.querySelectorAll(fieldSelector)];
      if (!choices.length) return;
      const currentIndex = choices.indexOf(current);
      if (currentIndex === -1) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + choices.length) % choices.length;
      const target = choices[nextIndex];
      focusElementWithoutScroll(target);
      if (target.dataset.modeChoice) {
        selectFlowMode(target.dataset.modeChoice);
      } else {
        handleChoice(target);
      }
    }
  });

  window.addEventListener('popstate', handleHistoryPop);
  resumeStoredFlowIfNeeded();
}

export function __resetFlowForTests() {
  clearEligibilityState();
  flowState = createInitialEligibilityState();
  historyEntryActive = false;
  submissionResult = null;
  resetTrackedFlowEvents();
  if (backdrop?.isConnected) {
    backdrop.remove();
  }
  backdrop = null;
}

export function __getFlowStateForTests() {
  return flowState;
}

export function __validateCurrentStepForTests(state = flowState) {
  return validateStep(state);
}

export function __openFlowForTests(context = {}) {
  flowState = createInitialEligibilityState(context);
  markOpenState(true);
  return flowState;
}
