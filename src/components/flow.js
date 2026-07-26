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
  if (item.label && item.label !== item.routeId) return item.label;
  return routeLabel(item.routeId);
}

function matchedPathLabels() {
  const option = getUseOption(flowState.values.use);
  const useLabel = option?.label || 'Relevant financing path';

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

  return pathMap[flowState.values.use] || [useLabel, 'Financing overview', 'Resources'];
}

function renderModeCards() {
  const activeMode = flowState.context.activeMode;
  const previewSelected = activeMode === ELIGIBILITY_MODES.preview;
  const liveSelected = activeMode === ELIGIBILITY_MODES.live;

  return `
    <div class="field${getFieldError(flowState, FIELD_IDS.mode) ? ' err' : ''}">
      <div class="choice-grid choice-grid-stack" role="radiogroup" aria-label="Eligibility mode">
        <button
          type="button"
          class="choice choice-mode ${previewSelected ? 'sel' : ''}"
          data-mode-choice="${ELIGIBILITY_MODES.preview}"
          role="radio"
          aria-checked="${previewSelected}"
        >
          <b>${getModeLabel(ELIGIBILITY_MODES.preview)}</b>
          <span>${getModeDescription(ELIGIBILITY_MODES.preview)}</span>
        </button>
        <button
          type="button"
          class="choice choice-mode ${liveSelected ? 'sel' : ''}"
          data-mode-choice="${ELIGIBILITY_MODES.live}"
          role="radio"
          aria-checked="${liveSelected}"
        >
          <b>${getModeLabel(ELIGIBILITY_MODES.live)}</b>
          <span>${getModeDescription(ELIGIBILITY_MODES.live)}</span>
        </button>
      </div>
      <p class="field-err" data-err="${FIELD_IDS.mode}">${escapeHtml(getFieldError(flowState, FIELD_IDS.mode))}</p>
    </div>
  `;
}

function renderUseOptions() {
  return `
    <div class="field${getFieldError(flowState, FIELD_IDS.use) ? ' err' : ''}">
      <div class="choice-grid" role="radiogroup" aria-label="Use of funds">
        ${USE_OPTIONS.map((option) => `
          <button
            type="button"
            class="choice ${flowState.values.use === option.value ? 'sel' : ''}"
            data-choice="${FIELD_IDS.use}"
            data-val="${option.value}"
            role="radio"
            aria-checked="${flowState.values.use === option.value}"
          >
            <b>${escapeHtml(option.label)}</b>
            <span>${escapeHtml(option.description)}</span>
          </button>
        `).join('')}
      </div>
      <p class="field-err" data-err="${FIELD_IDS.use}">${escapeHtml(getFieldError(flowState, FIELD_IDS.use))}</p>
    </div>
  `;
}

function renderSelectField({ fieldId, label, hint = '', options, value, placeholder, errorId }) {
  return `
    <div class="field${getFieldError(flowState, errorId) ? ' err' : ''}">
      <label for="f-${fieldId}">${escapeHtml(label)}${hint ? ` <span class="hint">${escapeHtml(hint)}</span>` : ''}</label>
      <select class="select" id="f-${fieldId}" data-field="${fieldId}">
        <option value="">${escapeHtml(placeholder)}</option>
        ${options.map((option) => `
          <option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>
        `).join('')}
      </select>
      <p class="field-err" data-err="${errorId}">${escapeHtml(getFieldError(flowState, errorId))}</p>
    </div>
  `;
}

function renderConsentReview() {
  const consentItems = getConsentChecklist(flowState);
  const nextStepItems = getNextStepChecklist(flowState);

  return `
    <div class="field consent-card${getFieldError(flowState, FIELD_IDS.previewConsent) ? ' err' : ''}">
      <div class="eyebrow" style="margin-bottom:var(--space-3)">Current mode</div>
      <p class="muted" style="font-size:var(--text-sm)">${escapeHtml(getModeDescription(flowState.context.activeMode))}</p>
      <label class="check-option" for="f-preview-consent">
        <input
          id="f-preview-consent"
          type="checkbox"
          data-field="${FIELD_IDS.previewConsent}"
          ${flowState.values.previewConsent ? 'checked' : ''}
        />
        <span>I understand the current mode boundary.</span>
      </label>
      <ul role="list" class="checklist-list">
        ${consentItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p class="field-err" data-err="${FIELD_IDS.previewConsent}">${escapeHtml(getFieldError(flowState, FIELD_IDS.previewConsent))}</p>
    </div>

    <div class="field consent-card${getFieldError(flowState, FIELD_IDS.nextStepConsent) ? ' err' : ''}">
      <div class="eyebrow" style="margin-bottom:var(--space-3)">What happens next</div>
      <p class="muted" style="font-size:var(--text-sm)">${escapeHtml(getEntryContextSummary(flowState))}</p>
      <label class="check-option" for="f-next-step-consent">
        <input
          id="f-next-step-consent"
          type="checkbox"
          data-field="${FIELD_IDS.nextStepConsent}"
          ${flowState.values.nextStepConsent ? 'checked' : ''}
        />
        <span>I understand the next step in this build.</span>
      </label>
      <ul role="list" class="checklist-list">
        ${nextStepItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p class="field-err" data-err="${FIELD_IDS.nextStepConsent}">${escapeHtml(getFieldError(flowState, FIELD_IDS.nextStepConsent))}</p>
    </div>

    <div class="dialog-note dialog-note-inline">
      <strong>Preview and privacy boundary.</strong> ${escapeHtml(disclosures.previewFlow)} ${escapeHtml(disclosures.previewPrivacy)}
    </div>
  `;
}

function renderLiveUnavailable() {
  return `
    <div class="dialog-body">
      <div class="success-mark success-mark-muted">${icon.info}</div>
      <h2 class="step-title" id="flowDialogTitle" style="text-align:center">${escapeHtml(getStepDefinition(STEP_IDS.liveUnavailable, flowState).title)}</h2>
      <p class="step-why" style="text-align:center">${escapeHtml(liveEligibilityGate.summary)}</p>
      <div class="result-summary" style="text-align:left">
        <div class="eyebrow" style="margin-bottom:var(--space-4)">Exact blockers</div>
        ${liveEligibilityGate.missingInputs.map((item) => `<div class="result-path"><span class="rp-dot"></span>${escapeHtml(item)}</div>`).join('')}
      </div>
      <div class="dialog-note dialog-note-inline" style="padding:0;text-align:left">
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

  if (!outcome) {
    return '';
  }

  return `
    <div class="dialog-body" style="text-align:center">
      <div class="success-mark">${outcome.outcomeCategory === OUTCOME_CATEGORIES.notFit ? icon.close : icon.check}</div>
      <span class="tag">${escapeHtml(outcome.badge)}</span>
      <h2 class="step-title" id="flowDialogTitle" style="text-align:center;margin-top:var(--space-4)">${escapeHtml(outcome.heading)}</h2>
      <p class="step-why" style="text-align:center">${escapeHtml(outcome.summary)}</p>
      <div class="result-summary" style="text-align:left">
        <div class="rs-row"><span>Mode</span><b>${escapeHtml(getModeLabel(flowState.context.activeMode || ELIGIBILITY_MODES.preview))}</b></div>
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
          <a class="btn ${item.relation === 'contact' ? 'btn-ghost' : 'btn-primary'} btn-block" href="${hrefForRoute(item.routeId)}">
            ${escapeHtml(recommendationLabel(item))}
          </a>
        `).join('')}
      </div>
      <div class="dialog-note dialog-note-inline" style="padding:0;text-align:left">
        <strong>What this means.</strong> ${escapeHtml(disclosures.illustrative)} ${escapeHtml(disclosures.noGuarantees)}
      </div>
    </div>
    <div class="dialog-foot">
      <button class="btn btn-ghost" data-flow-restart>Start over</button>
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
    default:
      return '';
  }
}

function primaryButtonLabel(stepId) {
  if (stepId === STEP_IDS.modeSelect) return 'Continue';
  if (stepId === STEP_IDS.consentReview) return flowState.context.activeMode === ELIGIBILITY_MODES.live ? 'Review live availability' : 'See my preview';
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
        <button class="dialog-close" data-flow-close aria-label="Close">${icon.close}</button>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPercent}%"></div></div>
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
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'flowDialogTitle');
  backdrop.setAttribute('aria-describedby', 'flowDialogAnnouncement');
  backdrop.innerHTML = `
    <div class="dialog" id="flowDialog" tabindex="-1">
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
  const selector = [
    '[data-mode-choice]',
    '[data-choice]',
    '.dialog-close',
    '.select',
    'input[type="checkbox"]',
    '[data-flow-next]',
    'a.btn',
  ].join(', ');

  const target = backdrop.querySelector(selector);
  target?.focus();
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

  if (focus) {
    queueMicrotask(() => focusPrimaryInteractiveElement());
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

  lastFocus = document.activeElement;
  markOpenState(true);
  paint();
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!historyEntryActive && !isBootstrappingFromStorage) {
    pushFlowHistoryState(true);
    historyEntryActive = true;
  }
}

function closeFlow({ fromHistory = false } = {}) {
  if (!backdrop?.classList.contains('open')) return;

  backdrop.classList.remove('open');
  document.body.style.overflow = '';
  markOpenState(false);
  syncStorage();

  if (historyEntryActive && !fromHistory) {
    historyEntryActive = false;
    window.history.back();
  } else if (historyEntryActive && fromHistory) {
    historyEntryActive = false;
    replaceFlowHistoryState();
  }

  lastFocus?.focus?.();
}

function restartFlow() {
  flowState = restartState(flowState);
  paint();
}

function selectFlowMode(mode) {
  flowState = selectMode(flowState, mode);
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
  firstField?.focus();
  firstField?.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function next() {
  const candidate = advanceState(flowState);
  flowState = {
    ...candidate,
    isOpen: true,
  };
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

    if (event.key === 'Enter' && event.target.closest('[data-mode-choice]')) {
      event.preventDefault();
      selectFlowMode(event.target.closest('[data-mode-choice]').dataset.modeChoice);
    }
  });

  window.addEventListener('popstate', handleHistoryPop);
  resumeStoredFlowIfNeeded();
}

export function __resetFlowForTests() {
  clearEligibilityState();
  flowState = createInitialEligibilityState();
  historyEntryActive = false;
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
