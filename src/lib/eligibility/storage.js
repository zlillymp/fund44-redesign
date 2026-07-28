import {
  ELIGIBILITY_MODES,
  FUNNEL_CONTEXT_KINDS,
  STEP_IDS,
  US_STATE_CODES,
  createResumedEligibilityState,
  normalizeFunnelContextKind,
  normalizeMode,
} from './model.js';
import { getRoute } from '../routes.js';
import { getContentByRouteId } from '../content.js';

const STORAGE_KEY = 'fund44:eligibility-flow:v1';
const HISTORY_KEY = 'fund44:eligibility-flow:history:v1';

function hasWindow() {
  return typeof window !== 'undefined';
}

function safeStorage() {
  if (!hasWindow()) return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function sanitizeContext(context = {}) {
  const allowedProductRouteId = (() => {
    try {
      return context.productContextRouteId ? getRoute(context.productContextRouteId).routeId : null;
    } catch {
      return null;
    }
  })();
  const safeProductContextTitle = (() => {
    if (!allowedProductRouteId) return null;
    try {
      return getContentByRouteId(allowedProductRouteId)?.title || getRoute(allowedProductRouteId)?.title || null;
    } catch {
      return null;
    }
  })();
  return {
    requestedMode: normalizeMode(context.requestedMode),
    activeMode: normalizeMode(context.activeMode),
    modeSource: String(context.modeSource || 'ui'),
    startSurface: String(context.startSurface || 'unknown'),
    startCtaId: String(context.startCtaId || 'unknown'),
    entryRouteId: context.entryRouteId || null,
    entryContentId: context.entryContentId || null,
    entryPath: context.entryPath || '/',
    entryPageType: context.entryPageType || null,
    entryTitle: typeof context.entryTitle === 'string' ? context.entryTitle : null,
    entryRouteFamily: typeof context.entryRouteFamily === 'string' ? context.entryRouteFamily : null,
    productContextRouteId: allowedProductRouteId,
    productContextTitle: safeProductContextTitle,
    funnelContextKind: normalizeFunnelContextKind(context.funnelContextKind || FUNNEL_CONTEXT_KINDS.generic),
  };
}

function sanitizeValues(values = {}) {
  const stateCode = US_STATE_CODES.includes(values.stateCode) ? values.stateCode : '';

  return {
    use: typeof values.use === 'string' ? values.use : '',
    amount: typeof values.amount === 'string' ? values.amount : '',
    tib: typeof values.tib === 'string' ? values.tib : '',
    revenue: typeof values.revenue === 'string' ? values.revenue : '',
    stateCode,
    previewConsent: values.previewConsent === true,
    nextStepConsent: values.nextStepConsent === true,
  };
}

function sanitizeStepId(stepId) {
  const allowed = new Set([
    STEP_IDS.modeSelect,
    STEP_IDS.useOfFunds,
    STEP_IDS.fundingAmount,
    STEP_IDS.businessProfile,
    STEP_IDS.consentReview,
    STEP_IDS.liveUnavailable,
    STEP_IDS.outcome,
  ]);

  return allowed.has(stepId) ? stepId : STEP_IDS.modeSelect;
}

export function serializeEligibilityState(state) {
  return {
    isOpen: state.isOpen === true,
    currentStepId: sanitizeStepId(state.currentStepId),
    completedStepIds: Array.isArray(state.completedStepIds)
      ? state.completedStepIds.map((stepId) => sanitizeStepId(stepId))
      : [],
    context: sanitizeContext(state.context),
    values: sanitizeValues(state.values),
    recovery: {
      resumed: false,
      piiDropped: true,
    },
  };
}

export function persistEligibilityState(state) {
  const storage = safeStorage();
  if (!storage) return;

  storage.setItem(STORAGE_KEY, JSON.stringify(serializeEligibilityState(state)));
}

export function clearEligibilityState() {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

export function readEligibilityState() {
  const storage = safeStorage();
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const state = createResumedEligibilityState({
      currentStepId: sanitizeStepId(parsed.currentStepId),
      completedStepIds: Array.isArray(parsed.completedStepIds)
        ? parsed.completedStepIds.map((stepId) => sanitizeStepId(stepId))
        : [],
      context: sanitizeContext(parsed.context),
      values: sanitizeValues(parsed.values),
      recovery: {
        resumed: true,
        piiDropped: true,
      },
    });
    return {
      state,
      isOpen: parsed.isOpen === true,
    };
  } catch {
    clearEligibilityState();
    return null;
  }
}

export function pushFlowHistoryState(isOpen) {
  if (!hasWindow() || !window.history?.pushState) return;

  const current = window.history.state || {};
  if (isOpen && !current[HISTORY_KEY]) {
    window.history.pushState({ ...current, [HISTORY_KEY]: true }, '', window.location.href);
  }
}

export function isFlowHistoryState(historyState) {
  return Boolean(historyState?.[HISTORY_KEY]);
}

export function replaceFlowHistoryState() {
  if (!hasWindow() || !window.history?.replaceState) return;

  const current = window.history.state || {};
  if (!current[HISTORY_KEY]) return;

  const nextState = { ...current };
  delete nextState[HISTORY_KEY];
  window.history.replaceState(nextState, '', window.location.href);
}

export function defaultRequestedMode(preferredMode) {
  const normalized = normalizeMode(preferredMode);
  if (normalized === ELIGIBILITY_MODES.live) {
    return ELIGIBILITY_MODES.live;
  }

  return ELIGIBILITY_MODES.preview;
}
