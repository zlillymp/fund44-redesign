import { liveEligibilityGate } from '../legal.js';

export const ELIGIBILITY_MODES = Object.freeze({
  preview: 'preview',
  live: 'live',
});

export const OUTCOME_CATEGORIES = Object.freeze({
  qualified: 'qualified',
  manualReview: 'manual_review',
  notFit: 'not_fit',
});

export const STEP_IDS = Object.freeze({
  modeSelect: 'mode_select',
  useOfFunds: 'use_of_funds',
  fundingAmount: 'funding_amount',
  businessProfile: 'business_profile',
  consentReview: 'consent_review',
  contactCapture: 'contact_capture',
  liveUnavailable: 'live_unavailable',
  outcome: 'outcome',
});

export const USE_OPTIONS = Object.freeze([
  {
    value: 'acquisition',
    label: 'Buy a business',
    description: 'Acquisition or partner buyout',
    recommendedRouteId: 'business_acquisition',
    relatedRouteIds: ['sba_7a', 'resources'],
  },
  {
    value: 'realestate',
    label: 'Owner-occupied real estate',
    description: 'Property purchase or refinance',
    recommendedRouteId: 'sba_504',
    relatedRouteIds: ['sba_7a', 'financing'],
  },
  {
    value: 'working',
    label: 'Working capital',
    description: 'Cash flow, seasonality, and operating needs',
    recommendedRouteId: 'working_capital',
    relatedRouteIds: ['financing', 'resources'],
  },
  {
    value: 'equipment',
    label: 'Equipment',
    description: 'Purchase or finance equipment',
    recommendedRouteId: 'working_capital',
    relatedRouteIds: ['sba_504', 'financing'],
  },
  {
    value: 'expansion',
    label: 'Expansion',
    description: 'New location or growth initiative',
    recommendedRouteId: 'sba_7a',
    relatedRouteIds: ['financing', 'resources'],
  },
  {
    value: 'refinance',
    label: 'Refinance debt',
    description: 'Restructure an existing obligation',
    recommendedRouteId: 'sba_7a',
    relatedRouteIds: ['working_capital', 'financing'],
  },
]);

export const AMOUNT_OPTIONS = Object.freeze([
  '$50k-$150k',
  '$150k-$350k',
  '$350k-$750k',
  '$750k-$1.5M',
  '$1.5M-$3M',
  '$3M-$5M',
]);

export const TIME_IN_BUSINESS_OPTIONS = Object.freeze([
  'Still planning / pre-revenue',
  'Under 1 year',
  '1-2 years',
  '2-5 years',
  '5+ years',
]);

export const REVENUE_OPTIONS = Object.freeze([
  'Under $100k',
  '$100k-$250k',
  '$250k-$500k',
  '$500k-$1M',
  '$1M-$5M',
  '$5M+',
]);

export const US_STATE_CODES = Object.freeze([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

export const FIELD_IDS = Object.freeze({
  mode: 'mode',
  use: 'use',
  amount: 'amount',
  tib: 'tib',
  revenue: 'revenue',
  stateCode: 'stateCode',
  previewConsent: 'previewConsent',
  nextStepConsent: 'nextStepConsent',
  contactName: 'contactName',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  businessName: 'businessName',
});

export const FUNNEL_CONTEXT_KINDS = Object.freeze({
  generic: 'generic',
  program: 'program',
  useCase: 'use_case',
  industry: 'industry',
  state: 'state',
  metro: 'metro',
});

export const ALLOWED_FUNNEL_CONTEXT_KINDS = new Set(Object.values(FUNNEL_CONTEXT_KINDS));

const ROUTE_FAMILY_TO_CONTEXT_KIND = Object.freeze({
  financing_program: FUNNEL_CONTEXT_KINDS.program,
  use_case: FUNNEL_CONTEXT_KINDS.useCase,
  industry: FUNNEL_CONTEXT_KINDS.industry,
  state: FUNNEL_CONTEXT_KINDS.state,
  metro: FUNNEL_CONTEXT_KINDS.metro,
});

export const PREVIEW_STEP_SEQUENCE = Object.freeze([
  STEP_IDS.modeSelect,
  STEP_IDS.useOfFunds,
  STEP_IDS.fundingAmount,
  STEP_IDS.businessProfile,
  STEP_IDS.consentReview,
  STEP_IDS.outcome,
]);

export const LIVE_INTENDED_STEP_SEQUENCE = Object.freeze([
  STEP_IDS.modeSelect,
  STEP_IDS.useOfFunds,
  STEP_IDS.fundingAmount,
  STEP_IDS.businessProfile,
  STEP_IDS.consentReview,
  STEP_IDS.contactCapture,
  STEP_IDS.outcome,
]);

export const LIVE_BLOCKED_SEQUENCE = Object.freeze([
  STEP_IDS.modeSelect,
  STEP_IDS.useOfFunds,
  STEP_IDS.fundingAmount,
  STEP_IDS.businessProfile,
  STEP_IDS.consentReview,
  STEP_IDS.liveUnavailable,
]);

const DEFAULT_VALUES = Object.freeze({
  use: '',
  amount: '',
  tib: '',
  revenue: '',
  stateCode: '',
  previewConsent: false,
  nextStepConsent: false,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  businessName: '',
});

const DEFAULT_CONTEXT = Object.freeze({
  requestedMode: '',
  activeMode: '',
  modeSource: 'ui',
  startSurface: 'unknown',
  startCtaId: 'unknown',
  entryRouteId: null,
  entryContentId: null,
  entryPath: '/',
  entryPageType: null,
  entryTitle: null,
  entryRouteFamily: null,
  productContextRouteId: null,
  productContextTitle: null,
  funnelContextKind: FUNNEL_CONTEXT_KINDS.generic,
});

export function normalizeMode(mode) {
  return mode === ELIGIBILITY_MODES.live ? ELIGIBILITY_MODES.live : mode === ELIGIBILITY_MODES.preview ? ELIGIBILITY_MODES.preview : '';
}

export function normalizeFunnelContextKind(value) {
  return ALLOWED_FUNNEL_CONTEXT_KINDS.has(value) ? value : FUNNEL_CONTEXT_KINDS.generic;
}

export function inferFunnelContextKind(routeFamily, fallback = FUNNEL_CONTEXT_KINDS.generic) {
  return ROUTE_FAMILY_TO_CONTEXT_KIND[routeFamily] || normalizeFunnelContextKind(fallback);
}

export function getContextKindLabel(kind) {
  switch (normalizeFunnelContextKind(kind)) {
    case FUNNEL_CONTEXT_KINDS.program:
      return 'product page';
    case FUNNEL_CONTEXT_KINDS.useCase:
      return 'use-case page';
    case FUNNEL_CONTEXT_KINDS.industry:
      return 'industry page';
    case FUNNEL_CONTEXT_KINDS.state:
      return 'state page';
    case FUNNEL_CONTEXT_KINDS.metro:
      return 'metro page';
    default:
      return 'page';
  }
}

export function getContextProofCopy(kind) {
  switch (normalizeFunnelContextKind(kind)) {
    case FUNNEL_CONTEXT_KINDS.program:
      return 'The preview keeps the product route you started from attached so the outcome can point back to the same financing comparison.';
    case FUNNEL_CONTEXT_KINDS.useCase:
      return 'The preview keeps the borrowing-intent page attached so the outcome stays grounded in the same use-case context.';
    case FUNNEL_CONTEXT_KINDS.industry:
      return 'The preview keeps the industry page attached so the outcome can preserve the same sector-specific comparison context.';
    case FUNNEL_CONTEXT_KINDS.state:
      return 'The preview keeps the state-resource page attached so the outcome can return you to the same local-support context when relevant.';
    case FUNNEL_CONTEXT_KINDS.metro:
      return 'The preview keeps the metro-resource page attached so the outcome can return you to the same local-support context when relevant.';
    default:
      return 'The preview keeps the opening page attached so the outcome can point back to the same route context.';
  }
}

export function getContextNextStepCopy(kind) {
  switch (normalizeFunnelContextKind(kind)) {
    case FUNNEL_CONTEXT_KINDS.program:
      return 'The outcome keeps the current financing route in view and can redirect to adjacent product comparisons when the selected goal points elsewhere.';
    case FUNNEL_CONTEXT_KINDS.useCase:
      return 'The outcome keeps the same borrower-goal context in view and can redirect to product pages that usually anchor that use case.';
    case FUNNEL_CONTEXT_KINDS.industry:
      return 'The outcome keeps the same industry context in view and can redirect to the product or document pages that usually matter next.';
    case FUNNEL_CONTEXT_KINDS.state:
      return 'The outcome keeps the same state-resource context in view and can redirect to the national financing or document pages that fit the next comparison.';
    case FUNNEL_CONTEXT_KINDS.metro:
      return 'The outcome keeps the same metro-resource context in view and can redirect to the national financing or document pages that fit the next comparison.';
    default:
      return 'The outcome can return to the page you started from and route you to the next approved comparison path.';
  }
}

export function getModeLabel(mode) {
  return mode === ELIGIBILITY_MODES.live ? 'Live application' : 'Preview';
}

export function getModeDescription(mode) {
  if (mode === ELIGIBILITY_MODES.live) {
    return 'Live application mode. Your information will be submitted to the Fund44 intake workflow for follow-up by our financing team.';
  }

  return 'See sample path categories in your browser without creating an application or sending data off the page.';
}

export function getModeSequence(mode, { includePlannedLive = false } = {}) {
  const normalizedMode = normalizeMode(mode);

  if (normalizedMode === ELIGIBILITY_MODES.live) {
    return includePlannedLive || liveEligibilityGate.enabled
      ? LIVE_INTENDED_STEP_SEQUENCE
      : LIVE_BLOCKED_SEQUENCE;
  }

  return PREVIEW_STEP_SEQUENCE;
}

export function isOutcomeStep(stepId) {
  return stepId === STEP_IDS.outcome || stepId === STEP_IDS.liveUnavailable;
}

export function getCurrentSequence(state, options) {
  return getModeSequence(state.context.activeMode || state.context.requestedMode, options);
}

export function createInitialEligibilityState(context = {}) {
  const requestedMode = normalizeMode(context.requestedMode);
  const hideLiveChoice = liveEligibilityGate.showModeChoice === false;
  const initialMode = requestedMode || (hideLiveChoice ? ELIGIBILITY_MODES.preview : '');
  const shouldSkipModeSelect = hideLiveChoice && initialMode === ELIGIBILITY_MODES.preview;

  return {
    currentStepId: shouldSkipModeSelect ? STEP_IDS.useOfFunds : STEP_IDS.modeSelect,
    completedStepIds: shouldSkipModeSelect ? [STEP_IDS.modeSelect] : [],
    values: { ...DEFAULT_VALUES },
    errors: {},
    context: {
      ...DEFAULT_CONTEXT,
      ...context,
      requestedMode: initialMode || requestedMode,
      activeMode: initialMode,
      modeSource: context.modeSource || (shouldSkipModeSelect ? 'cta' : 'ui'),
    },
    outcome: null,
    recovery: {
      resumed: false,
      piiDropped: false,
    },
  };
}

export function createResumedEligibilityState(snapshot = {}) {
  const state = {
    ...createInitialEligibilityState(snapshot.context || {}),
    ...snapshot,
    values: {
      ...DEFAULT_VALUES,
      ...(snapshot.values || {}),
    },
    errors: {},
    recovery: {
      resumed: true,
      piiDropped: true,
      ...(snapshot.recovery || {}),
    },
  };

  const sequence = getCurrentSequence(state);
  if (!sequence.includes(state.currentStepId)) {
    state.currentStepId = sequence[sequence.length - 1];
  }

  if (state.currentStepId === STEP_IDS.outcome) {
    state.outcome = deriveOutcome(state);
  }

  return state;
}

export function selectMode(state, mode, modeSource = 'dialog') {
  const nextMode = normalizeMode(mode);
  const nextState = {
    ...state,
    context: {
      ...state.context,
      activeMode: nextMode,
      requestedMode: state.context.requestedMode || nextMode,
      modeSource,
    },
    errors: {},
  };

  if (!nextMode) {
    return nextState;
  }

  if (nextMode === ELIGIBILITY_MODES.live && !liveEligibilityGate.enabled) {
    return {
      ...nextState,
      currentStepId: STEP_IDS.useOfFunds,
      completedStepIds: [...new Set([STEP_IDS.modeSelect])],
    };
  }

  return {
    ...nextState,
    currentStepId: STEP_IDS.useOfFunds,
    completedStepIds: [...new Set([STEP_IDS.modeSelect])],
  };
}

export function updateField(state, fieldId, value) {
  return {
    ...state,
    values: {
      ...state.values,
      [fieldId]: value,
    },
    errors: {
      ...state.errors,
      [fieldId]: undefined,
    },
  };
}

export function getStepIndex(state) {
  const sequence = getCurrentSequence(state);
  return Math.max(sequence.indexOf(state.currentStepId), 0);
}

export function getStepCount(state) {
  return getCurrentSequence(state).length;
}

export function getProgressPercent(state) {
  const sequence = getCurrentSequence(state);
  if (sequence.length <= 1) return 100;
  const index = getStepIndex(state);
  return Math.round((index / (sequence.length - 1)) * 100);
}

export function getUseOption(value) {
  return USE_OPTIONS.find((option) => option.value === value) || null;
}

export function getStepDefinition(stepId, state) {
  const activeMode = state.context.activeMode || state.context.requestedMode;

  switch (stepId) {
    case STEP_IDS.modeSelect:
      return {
        id: STEP_IDS.modeSelect,
        name: 'Mode selection',
        title: liveEligibilityGate.showModeChoice === false
          ? 'Start a funding-path preview.'
          : 'Choose how you want to start.',
        description: liveEligibilityGate.showModeChoice === false
          ? 'Preview shows sample results in your browser without creating an application or sending data off the page.'
          : 'Preview shows sample results without sending data. Live application submits your information to the Fund44 intake workflow.',
      };
    case STEP_IDS.useOfFunds:
      return {
        id: STEP_IDS.useOfFunds,
        name: 'Use of funds',
        title: 'What do you need financing for?',
        description: 'Pick the goal so the preview can keep the path comparison tied to your current intent.',
      };
    case STEP_IDS.fundingAmount:
      return {
        id: STEP_IDS.fundingAmount,
        name: 'Funding amount',
        title: 'How much are you looking for?',
        description: 'A range is enough for the preview. It helps keep the sample paths and next-step guidance grounded in your stated need.',
      };
    case STEP_IDS.businessProfile:
      return {
        id: STEP_IDS.businessProfile,
        name: 'Business profile',
        title: 'Tell us about the business.',
        description: 'These broad profile bands are used only to place the preview into a clear routing bucket. They are not lender approval rules.',
      };
    case STEP_IDS.consentReview:
      return {
        id: STEP_IDS.consentReview,
        name: 'Consent and next steps',
        title: activeMode === ELIGIBILITY_MODES.live ? 'Review the live submission boundary.' : 'Review the preview boundary before continuing.',
        description: activeMode === ELIGIBILITY_MODES.live
          ? 'In live mode, your contact details will be submitted to the Fund44 intake workflow after this step. Review the consent items below.'
          : 'The preview explains what the current build can and cannot do before you see an outcome.',
      };
    case STEP_IDS.contactCapture:
      return {
        id: STEP_IDS.contactCapture,
        name: 'Contact capture',
        title: 'Share your contact details.',
        description: 'Enter your information so the Fund44 team can follow up with relevant financing options.',
      };
    case STEP_IDS.liveUnavailable:
      return {
        id: STEP_IDS.liveUnavailable,
        name: 'Live mode unavailable',
        title: 'Live application is not available right now.',
        description: 'Preview remains available. Please try again later or contact us directly.',
      };
    case STEP_IDS.outcome:
      return {
        id: STEP_IDS.outcome,
        name: 'Outcome',
        title: 'Your routing preview',
        description: 'This category reflects the broad profile bands you selected. It is not a lender decision or approval.',
      };
    default:
      return null;
  }
}

export function validateStep(state) {
  const errors = {};

  switch (state.currentStepId) {
    case STEP_IDS.modeSelect:
      if (!normalizeMode(state.context.activeMode)) {
        errors[FIELD_IDS.mode] = 'Choose preview or live mode to continue.';
      }
      break;
    case STEP_IDS.useOfFunds:
      if (!state.values.use) {
        errors[FIELD_IDS.use] = 'Choose the financing goal you want to review.';
      }
      break;
    case STEP_IDS.fundingAmount:
      if (!state.values.amount) {
        errors[FIELD_IDS.amount] = 'Select the amount range that is closest to your request.';
      }
      break;
    case STEP_IDS.businessProfile:
      if (!state.values.tib) {
        errors[FIELD_IDS.tib] = 'Select time in business.';
      }
      if (!state.values.revenue) {
        errors[FIELD_IDS.revenue] = 'Select annual revenue.';
      }
      if (!state.values.stateCode) {
        errors[FIELD_IDS.stateCode] = 'Select the state where the business operates.';
      }
      break;
    case STEP_IDS.consentReview:
      if (!state.values.previewConsent) {
        errors[FIELD_IDS.previewConsent] = 'Confirm the preview or live boundary before continuing.';
      }
      if (!state.values.nextStepConsent) {
        errors[FIELD_IDS.nextStepConsent] = 'Confirm that you understand the next step for this build.';
      }
      break;
    case STEP_IDS.contactCapture:
      if (!state.values.contactName || state.values.contactName.trim().length < 2) {
        errors[FIELD_IDS.contactName] = 'Enter your full name.';
      }
      if (!state.values.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.values.contactEmail)) {
        errors[FIELD_IDS.contactEmail] = 'Enter a valid email address.';
      }
      if (!state.values.contactPhone || state.values.contactPhone.replace(/\D/g, '').length < 10) {
        errors[FIELD_IDS.contactPhone] = 'Enter a valid phone number.';
      }
      if (!state.values.businessName || state.values.businessName.trim().length < 2) {
        errors[FIELD_IDS.businessName] = 'Enter your business name.';
      }
      break;
    default:
      break;
  }

  return errors;
}

function nextStepIdFor(state) {
  if (state.currentStepId === STEP_IDS.modeSelect) {
    return STEP_IDS.useOfFunds;
  }

  if (state.currentStepId === STEP_IDS.useOfFunds) return STEP_IDS.fundingAmount;
  if (state.currentStepId === STEP_IDS.fundingAmount) return STEP_IDS.businessProfile;
  if (state.currentStepId === STEP_IDS.businessProfile) return STEP_IDS.consentReview;
  if (state.currentStepId === STEP_IDS.consentReview) {
    if (state.context.activeMode === ELIGIBILITY_MODES.live && !liveEligibilityGate.enabled) {
      return STEP_IDS.liveUnavailable;
    }

    if (state.context.activeMode === ELIGIBILITY_MODES.live && liveEligibilityGate.enabled) {
      return STEP_IDS.contactCapture;
    }

    return STEP_IDS.outcome;
  }
  if (state.currentStepId === STEP_IDS.contactCapture) return STEP_IDS.outcome;

  return state.currentStepId;
}

export function canGoBack(state) {
  return getStepIndex(state) > 0;
}

export function goBack(state) {
  const sequence = getCurrentSequence(state);
  const currentIndex = sequence.indexOf(state.currentStepId);
  const previousIndex = Math.max(0, currentIndex - 1);

  return {
    ...state,
    currentStepId: sequence[previousIndex],
    errors: {},
  };
}

export function advanceState(state) {
  const errors = validateStep(state);
  if (Object.keys(errors).length > 0) {
    return {
      ...state,
      errors,
    };
  }

  const nextStepId = nextStepIdFor(state);
  const completedStepIds = [...new Set([...state.completedStepIds, state.currentStepId])];
  const nextState = {
    ...state,
    currentStepId: nextStepId,
    completedStepIds,
    errors: {},
  };

  if (nextStepId === STEP_IDS.outcome) {
    return {
      ...nextState,
      outcome: deriveOutcome(nextState),
    };
  }

  return nextState;
}

export function restartState(state) {
  return createInitialEligibilityState({
    ...state.context,
    requestedMode: state.context.requestedMode || state.context.activeMode,
    activeMode: '',
    modeSource: state.context.modeSource,
  });
}

export function deriveProfileBucket(values) {
  if (values.tib === 'Still planning / pre-revenue') {
    return {
      outcomeCategory: OUTCOME_CATEGORIES.notFit,
      reasonCode: 'planning_stage',
    };
  }

  if (values.tib === 'Under 1 year' || values.revenue === 'Under $100k') {
    return {
      outcomeCategory: OUTCOME_CATEGORIES.manualReview,
      reasonCode: 'early_stage_profile',
    };
  }

  return {
    outcomeCategory: OUTCOME_CATEGORIES.qualified,
    reasonCode: 'operating_profile',
  };
}

export function getOutcomeCopy(outcomeCategory) {
  switch (outcomeCategory) {
    case OUTCOME_CATEGORIES.qualified:
      return {
        badge: 'Qualified preview',
        heading: 'A strong preview fit',
        summary: 'Your selected profile lines up with the current preview path review. That does not mean a lender has approved anything.',
        nextStep: 'review_preview_paths',
      };
    case OUTCOME_CATEGORIES.manualReview:
      return {
        badge: 'Manual review preview',
        heading: 'This needs more context',
        summary: 'The preview can still point to relevant paths, but the profile you selected is best treated as a manual-review bucket rather than a clean fit signal.',
        nextStep: 'review_docs_and_contact',
      };
    case OUTCOME_CATEGORIES.notFit:
      return {
        badge: 'Not-fit preview',
        heading: 'This does not look like a fit for the current flow',
        summary: 'The profile you selected is closer to planning-stage guidance than to an active operating-business path. That is not a lender decision; it simply means the preview should redirect you to earlier-stage education or support.',
        nextStep: 'explore_guidance',
      };
    default:
      return {
        badge: 'Preview outcome',
        heading: 'Preview outcome',
        summary: 'The preview reached an outcome state.',
        nextStep: 'review_preview_paths',
      };
  }
}

export function getOutcomeRecommendations(state, outcomeCategory) {
  const useOption = getUseOption(state.values.use);
  const recommendations = [];
  const contextKind = normalizeFunnelContextKind(state.context.funnelContextKind);

  if (state.context.productContextRouteId) {
    recommendations.push({
      routeId: state.context.productContextRouteId,
      label: state.context.productContextTitle || 'Return to the page you started from',
      relation: 'entry_context',
      contextKind,
    });
  } else if (state.context.entryRouteId && state.context.entryRouteId !== 'home') {
    recommendations.push({
      routeId: state.context.entryRouteId,
      label: state.context.entryTitle || 'Return to your starting page',
      relation: 'entry_context',
      contextKind,
    });
  }

  if (useOption?.recommendedRouteId) {
    recommendations.push({
      routeId: useOption.recommendedRouteId,
      label: useOption.label,
      relation: 'recommended_path',
      contextKind,
    });
  }

  (useOption?.relatedRouteIds || []).forEach((routeId) => {
    recommendations.push({
      routeId,
      label: routeId,
      relation: 'related_path',
      contextKind,
    });
  });

  if (outcomeCategory === OUTCOME_CATEGORIES.manualReview || outcomeCategory === OUTCOME_CATEGORIES.notFit) {
    recommendations.push({
      routeId: 'contact',
      label: 'Contact',
      relation: 'contact',
      contextKind,
    });
  }

  if (outcomeCategory === OUTCOME_CATEGORIES.notFit) {
    recommendations.push({
      routeId: 'resources',
      label: 'Resources',
      relation: 'guidance',
      contextKind,
    });
  } else {
    recommendations.push({
      routeId: 'financing',
      label: 'Financing overview',
      relation: 'compare',
      contextKind,
    });
  }

  return dedupeRecommendations(recommendations).slice(0, 4);
}

function dedupeRecommendations(recommendations) {
  const seen = new Set();
  return recommendations.filter((recommendation) => {
    if (!recommendation.routeId || seen.has(recommendation.routeId)) {
      return false;
    }
    seen.add(recommendation.routeId);
    return true;
  });
}

export function deriveOutcome(state) {
  const bucket = deriveProfileBucket(state.values);
  const copy = getOutcomeCopy(bucket.outcomeCategory);

  return {
    outcomeCategory: bucket.outcomeCategory,
    outcomeReasonCode: bucket.reasonCode,
    recommendedNextStep: copy.nextStep,
    badge: copy.badge,
    heading: copy.heading,
    summary: copy.summary,
    recommendations: getOutcomeRecommendations(state, bucket.outcomeCategory),
  };
}

export function getFieldError(state, fieldId) {
  return state.errors[fieldId] || '';
}

export function hasValidationErrors(state) {
  return Object.keys(state.errors).some((fieldId) => Boolean(state.errors[fieldId]));
}

export function getAnnouncement(state) {
  const definition = getStepDefinition(state.currentStepId, state);
  const label = definition?.title || 'Eligibility flow';

  if (state.currentStepId === STEP_IDS.outcome && state.outcome) {
    return `${state.outcome.badge}. ${state.outcome.heading}.`;
  }

  if (state.currentStepId === STEP_IDS.liveUnavailable) {
    return 'Live application is unavailable in the current build.';
  }

  return `Step ${getStepIndex(state) + 1} of ${getStepCount(state)}. ${label}`;
}

export function getEntryContextSummary(state) {
  const contextLabel = getContextKindLabel(state.context.funnelContextKind);
  const sourceTitle = state.context.productContextTitle || state.context.entryTitle;
  if (!sourceTitle) {
    return `No ${contextLabel} context was attached to this start.`;
  }

  return `Started from ${sourceTitle}. That ${contextLabel} context stays attached to the preview so the outcome can point back to the page that opened it.`;
}

export function getConsentChecklist(state) {
  if (state.context.activeMode === ELIGIBILITY_MODES.live) {
    return [
      'I authorize Fund44 LLC to collect my business profile and representative contact details for intake evaluation.',
      'I agree to receive communications regarding my financing request via support@fund44.com or 512-547-1547.',
      'I understand that Fund44 LLC is a capital marketplace and not a lender, and final credit terms are set by third-party providers.',
    ];
  }

  return [
    'I understand that this preview shows sample path categories only based on broad profile details.',
    'I understand that information in preview mode remains in my browser and does not create a lender application.',
  ];
}

export function getNextStepChecklist(state) {
  if (state.context.activeMode === ELIGIBILITY_MODES.live) {
    return [
      'Your business and contact details will be submitted to the Fund44 LLC intake workflow for evaluation by our financing team.',
      'Our team will evaluate your request against third-party provider guidelines to identify matching capital options.',
    ];
  }

  return [
    'After this step, the preview will place your answers into one of three routing buckets: qualified, manual review, or not fit.',
    'The outcome will point to pages or contact paths that fit the information you selected, without promising an approval or lender decision.',
    getContextNextStepCopy(state.context.funnelContextKind),
  ];
}
