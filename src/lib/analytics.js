import { getRouteMatch, absoluteUrlForPath } from './routes.js';
import { getContentByRouteId } from './content.js';
import { freshnessAnalyticsStateForRoute } from './freshness-runtime.js';
import { indexingPolicy } from './legal.js';
import { getActiveExperimentIds, isExperimentActive } from './experiments.js';

export const ANALYTICS_EVENT_VERSION = '2026-07-26.f44-mea-02';
export const ANALYTICS_DEBUG_GLOBAL = '__FUND44_ANALYTICS_DEBUG__';
export const ANALYTICS_QUEUE_GLOBAL = '__FUND44_ANALYTICS_QUEUE__';
export const ANALYTICS_TEST_SINK_GLOBAL = '__FUND44_ANALYTICS_TEST_SINK__';
export const ANALYTICS_SINK_EVENT = 'fund44:analytics-event';
export const ANALYTICS_SESSION_KEY = 'fund44:analytics-session:v1';
export const ANALYTICS_ATTRIBUTION_KEY = 'fund44:analytics-attribution:v1';
export const ANALYTICS_FLOW_STEP_PAGE_TYPE = 'funnel_step';
export const ANALYTICS_FLOW_OUTCOME_PAGE_TYPE = 'funnel_outcome';

const EVENT_NAMES = [
  'page_view',
  'content_view',
  'nav_click',
  'cta_click',
  'internal_link_click',
  'trust_module_view',
  'trust_module_click',
  'disclosure_view',
  'faq_expand',
  '404_view',
  'eligibility_mode_view',
  'eligibility_start',
  'eligibility_step_view',
  'eligibility_step_complete',
  'eligibility_validation_error',
  'eligibility_outcome_view',
  'application_start',
  'application_submit_attempt',
  'application_submit_result',
  'contact_request_submit',
  'experiment_exposure',
  'js_error',
  'performance_budget_result',
  'a11y_check_result',
];

export const EVENT_SET = new Set(EVENT_NAMES);
export const analyticsEventNames = Object.freeze(EVENT_NAMES.slice());
export const ANALYTICS_CORE_EVENTS = Object.freeze([
  'page_view',
  'cta_click',
  'eligibility_start',
  'eligibility_outcome_view',
  'application_start',
  'application_submit_result',
  'contact_request_submit',
  'trust_module_view',
  'disclosure_view',
]);

const SHARED_FIELDS = [
  'event_version',
  'route_id',
  'canonical_url',
  'page_type',
  'template_id',
  'content_id',
  'content_version',
  'eligibility_mode',
  'device_class',
  'session_id',
  'environment',
  'entry_channel',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'referrer_domain',
  'experiment_ids',
  'consent_state',
];

const EVENT_SPECIFIC_FIELDS = {
  page_view: ['is_entry', 'http_status', 'route_family'],
  content_view: ['content_group', 'primary_topic', 'freshness_state'],
  nav_click: ['nav_section', 'nav_label', 'destination_route_id'],
  cta_click: ['cta_id', 'cta_label', 'cta_type', 'cta_placement', 'destination_route_id'],
  internal_link_click: ['link_context', 'destination_route_id', 'destination_content_id'],
  trust_module_view: ['trust_module_id', 'trust_type', 'evidence_source'],
  trust_module_click: ['trust_module_id', 'trust_type', 'destination'],
  disclosure_view: ['disclosure_id', 'disclosure_context', 'disclosure_version'],
  faq_expand: ['faq_id', 'faq_group', 'faq_position'],
  '404_view': ['requested_path', 'referring_route_id'],
  eligibility_mode_view: ['mode_source', 'eligible_next_actions'],
  eligibility_start: ['start_surface', 'start_cta_id', 'mode_source'],
  eligibility_step_view: ['step_id', 'step_name', 'step_index', 'step_count'],
  eligibility_step_complete: ['step_id', 'step_name', 'step_index'],
  eligibility_validation_error: ['step_id', 'field_ids', 'error_type'],
  eligibility_outcome_view: ['outcome_category', 'outcome_reason_code', 'recommended_next_step'],
  application_start: ['source_outcome', 'application_mode', 'start_surface'],
  application_submit_attempt: ['step_id', 'attempt_number'],
  application_submit_result: ['result', 'failure_reason_code', 'integration_target'],
  contact_request_submit: ['request_type', 'source_outcome'],
  experiment_exposure: ['experiment_id', 'variant_id', 'surface'],
  js_error: ['error_name', 'error_source', 'is_fatal'],
  performance_budget_result: ['budget_name', 'result'],
  a11y_check_result: ['suite_name', 'result', 'defect_count'],
};

const REQUIRED_EVENT_FIELDS = {
  page_view: ['is_entry', 'http_status', 'route_family'],
  content_view: ['content_group', 'primary_topic', 'freshness_state'],
  nav_click: ['nav_section', 'nav_label', 'destination_route_id'],
  cta_click: ['cta_id', 'cta_label', 'cta_type', 'cta_placement', 'destination_route_id'],
  internal_link_click: ['link_context', 'destination_route_id', 'destination_content_id'],
  trust_module_view: ['trust_module_id', 'trust_type', 'evidence_source'],
  trust_module_click: ['trust_module_id', 'trust_type', 'destination'],
  disclosure_view: ['disclosure_id', 'disclosure_context', 'disclosure_version'],
  faq_expand: ['faq_id', 'faq_group', 'faq_position'],
  '404_view': ['requested_path'],
  eligibility_mode_view: ['mode_source', 'eligible_next_actions'],
  eligibility_start: ['start_surface', 'start_cta_id', 'mode_source'],
  eligibility_step_view: ['step_id', 'step_name', 'step_index', 'step_count'],
  eligibility_step_complete: ['step_id', 'step_name', 'step_index'],
  eligibility_validation_error: ['step_id', 'field_ids', 'error_type'],
  eligibility_outcome_view: ['outcome_category', 'outcome_reason_code', 'recommended_next_step'],
  application_start: ['source_outcome', 'application_mode', 'start_surface'],
  application_submit_attempt: ['step_id', 'attempt_number'],
  application_submit_result: ['result', 'integration_target'],
  contact_request_submit: ['request_type', 'source_outcome'],
  experiment_exposure: ['experiment_id', 'variant_id', 'surface'],
  js_error: ['error_name', 'error_source', 'is_fatal'],
  performance_budget_result: ['budget_name', 'result'],
  a11y_check_result: ['suite_name', 'result', 'defect_count'],
};

const SHARED_FIELD_SET = new Set(SHARED_FIELDS);
const FIELD_SPEC_BY_EVENT = Object.fromEntries(
  Object.entries(EVENT_SPECIFIC_FIELDS).map(([eventName, fields]) => [
    eventName,
    new Set([...SHARED_FIELDS, ...fields]),
  ]),
);

const DISALLOWED_KEY_PATTERNS = [
  /email/i,
  /phone/i,
  /first_?name/i,
  /last_?name/i,
  /\bname\b/i,
  /company/i,
  /business/i,
  /address/i,
  /street/i,
  /city/i,
  /zip/i,
  /postal/i,
  /ssn/i,
  /ein/i,
  /dob/i,
  /document/i,
  /message/i,
  /notes?/i,
  /comment/i,
  /free_?text/i,
];

// Raw vendor/partner reference IDs are allowed inside Fund44 but must never reach a
// third-party destination (measurement plan: Privacy and PII Restrictions).
const RAW_REFERENCE_KEY_PATTERN =
  /(lender|application|partner|provider|offer|lead|submission|customer|account|user|external|reference|raw)_?(id|ref)/i;

function hasWindow() {
  return typeof window !== 'undefined';
}

function safeSessionStorage() {
  if (!hasWindow()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function safeQueue() {
  if (!hasWindow()) return [];
  const existing = window[ANALYTICS_QUEUE_GLOBAL];
  if (Array.isArray(existing)) return existing;
  window[ANALYTICS_QUEUE_GLOBAL] = [];
  return window[ANALYTICS_QUEUE_GLOBAL];
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function readPersistedSessionId() {
  const storage = safeSessionStorage();
  if (!storage) return null;
  try {
    return storage.getItem(ANALYTICS_SESSION_KEY);
  } catch {
    return null;
  }
}

function writePersistedSessionId(sessionId) {
  const storage = safeSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(ANALYTICS_SESSION_KEY, sessionId);
  } catch {
    // ignore storage failures and keep runtime session in memory
  }
}

function readPersistedAttribution() {
  const storage = safeSessionStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(ANALYTICS_ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePersistedAttribution(attribution) {
  const storage = safeSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(ANALYTICS_ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // ignore storage failures
  }
}

let inMemorySessionId = null;
let inMemoryAttribution = null;

export function getSessionId() {
  if (inMemorySessionId) return inMemorySessionId;
  const persisted = readPersistedSessionId();
  if (persisted) {
    inMemorySessionId = persisted;
    return inMemorySessionId;
  }
  inMemorySessionId = createSessionId();
  writePersistedSessionId(inMemorySessionId);
  return inMemorySessionId;
}

function currentEnvironment() {
  return indexingPolicy?.env || import.meta.env?.MODE || 'staging';
}

function currentConsentState() {
  return indexingPolicy.allowIndexing ? 'granted' : 'staging_preview_only';
}

function classifyDevice(viewportWidth) {
  if (viewportWidth < 768) return 'mobile';
  if (viewportWidth < 1024) return 'tablet';
  return 'desktop';
}

function currentDeviceClass() {
  if (!hasWindow()) return 'desktop';
  return classifyDevice(window.innerWidth || 1280);
}

function toEntryChannel({ referrerDomain, utmMedium } = {}) {
  if (utmMedium) {
    const medium = String(utmMedium).toLowerCase();
    if (medium.includes('email')) return 'email';
    if (['cpc', 'ppc', 'paid', 'paid_social', 'display'].some((token) => medium.includes(token))) return 'paid';
  }

  if (!referrerDomain) return 'direct';
  if (/google|bing|yahoo|duckduckgo|baidu/i.test(referrerDomain)) return 'organic';
  return 'referral';
}

function parseUrlSearch(search) {
  const params = new URLSearchParams(search || '');
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
  };
}

function parseReferrerDomain() {
  if (!hasWindow() || !document.referrer) return '';
  try {
    return new URL(document.referrer).hostname || '';
  } catch {
    return '';
  }
}

function initialAttribution() {
  const utm = parseUrlSearch(hasWindow() ? window.location.search : '');
  const referrer_domain = parseReferrerDomain();
  return {
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    referrer_domain,
    entry_channel: toEntryChannel({ referrerDomain: referrer_domain, utmMedium: utm.utm_medium }),
  };
}

function getAttributionContext() {
  if (inMemoryAttribution) return inMemoryAttribution;
  const persisted = readPersistedAttribution();
  if (persisted) {
    inMemoryAttribution = persisted;
    return inMemoryAttribution;
  }

  inMemoryAttribution = initialAttribution();
  writePersistedAttribution(inMemoryAttribution);
  return inMemoryAttribution;
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeEligibilityMode(value) {
  if (value === 'preview' || value === 'live') return value;
  return 'none';
}

function readContentRecord(route) {
  if (!route?.contentId) return null;
  try {
    return getContentByRouteId(route.routeId);
  } catch {
    return null;
  }
}

function contextForPath(pathname, overrides = {}) {
  const match = getRouteMatch(pathname || (hasWindow() ? window.location.pathname : '/'));
  const route = overrides.route || match.route;
  const content = overrides.content === undefined ? readContentRecord(route) : overrides.content;

  return {
    route,
    content,
    requestedPath: match.requestedPath,
    isNotFound: match.isNotFound,
  };
}

function sharedFields(context = {}, overrides = {}) {
  const route = context.route || getRouteMatch('/').route;
  const content = context.content || null;
  const attribution = getAttributionContext();

  return {
    event_version: ANALYTICS_EVENT_VERSION,
    route_id: route.routeId,
    canonical_url: absoluteUrlForPath(route.path),
    page_type: overrides.page_type || (route.pageType === '404' ? '404' : route.pageType),
    template_id: overrides.template_id || route.templateId,
    content_id: overrides.content_id ?? (content?.id || ''),
    content_version: overrides.content_version ?? (content?.contentVersion || ''),
    eligibility_mode: normalizeEligibilityMode(overrides.eligibility_mode),
    device_class: currentDeviceClass(),
    session_id: getSessionId(),
    environment: currentEnvironment(),
    entry_channel: overrides.entry_channel || attribution.entry_channel,
    utm_source: overrides.utm_source ?? attribution.utm_source,
    utm_medium: overrides.utm_medium ?? attribution.utm_medium,
    utm_campaign: overrides.utm_campaign ?? attribution.utm_campaign,
    referrer_domain: overrides.referrer_domain ?? attribution.referrer_domain,
    experiment_ids: Array.isArray(overrides.experiment_ids)
      ? overrides.experiment_ids.slice()
      : getActiveExperimentIds(getSessionId()),
    consent_state: overrides.consent_state || currentConsentState(),
  };
}

function valueLooksLikePii(value) {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return false;
    if (normalized.includes('@')) return true;
    const digitsOnly = normalized.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15 && /^[+\d\s().-]+$/.test(normalized)) return true;
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(normalized)) return true;
    if (/\b\d{2}-\d{7}\b/.test(normalized)) return true;
    if (normalized.length > 140) return true;
  }

  return false;
}

function assertNoPiiShapedKeys(payload) {
  Object.entries(payload).forEach(([key, value]) => {
    if (DISALLOWED_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      throw new Error(`PII-like analytics key is not allowed: ${key}`);
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (valueLooksLikePii(item)) {
          throw new Error(`PII-like analytics array value is not allowed for key: ${key}`);
        }
      });
      return;
    }

    if (valueLooksLikePii(value)) {
      throw new Error(`PII-like analytics value is not allowed for key: ${key}`);
    }
  });
}

function assertKnownEvent(eventName) {
  if (!EVENT_SET.has(eventName)) {
    throw new Error(`Unknown analytics event: ${eventName}`);
  }
}

function assertAllowedProperties(eventName, payload) {
  const allowed = FIELD_SPEC_BY_EVENT[eventName];
  Object.keys(payload).forEach((key) => {
    if (!allowed.has(key)) {
      throw new Error(`Unknown property "${key}" for analytics event "${eventName}"`);
    }
  });
}

function assertRequiredProperties(eventName, payload) {
  SHARED_FIELDS.forEach((field) => {
    if (!(field in payload)) {
      throw new Error(`Missing shared analytics property "${field}" for "${eventName}"`);
    }
  });

  REQUIRED_EVENT_FIELDS[eventName].forEach((field) => {
    if (!(field in payload)) {
      throw new Error(`Missing required analytics property "${field}" for "${eventName}"`);
    }
  });
}

export function validateAnalyticsPayload(eventName, payload) {
  assertKnownEvent(eventName);
  assertAllowedProperties(eventName, payload);
  assertRequiredProperties(eventName, payload);
  assertNoPiiShapedKeys(payload);
}

export function assertNoAnalyticsPii(payload) {
  assertNoPiiShapedKeys(payload);
}

function keyIsDestinationSafe(key) {
  return !DISALLOWED_KEY_PATTERNS.some((pattern) => pattern.test(key))
    && !RAW_REFERENCE_KEY_PATTERN.test(key);
}

export function sanitizeDestinationParams(params = {}) {
  const safe = {};

  Object.entries(params).forEach(([key, value]) => {
    if (!keyIsDestinationSafe(key)) return;

    if (Array.isArray(value)) {
      if (value.some((item) => valueLooksLikePii(item))) return;
      safe[key] = value.slice();
      return;
    }

    if (valueLooksLikePii(value)) return;
    safe[key] = value;
  });

  return safe;
}

export function analyticsEnvironment() {
  return currentEnvironment();
}

export function analyticsConsentGranted() {
  return currentConsentState() === 'granted';
}

const destinations = [];

export function registerAnalyticsDestination(destination) {
  if (!destination || typeof destination.send !== 'function' || !destination.id) {
    throw new Error('Analytics destination must expose an id and a send(eventName, payload) method');
  }

  if (destinations.some((registered) => registered.id === destination.id)) {
    return false;
  }

  destinations.push(destination);
  return true;
}

export function getRegisteredDestinationIds() {
  return destinations.map((destination) => destination.id);
}

function fanOutToDestinations(eventName, payload) {
  destinations.forEach((destination) => {
    try {
      destination.send(eventName, payload);
    } catch (error) {
      // A failing third-party tag must never break first-party funnel instrumentation.
      if (hasWindow() && window[ANALYTICS_DEBUG_GLOBAL] === true) {
        console.warn(`[fund44 analytics] destination "${destination.id}" failed`, error);
      }
    }
  });
}

function sinkEvent(record) {
  const queue = safeQueue();
  queue.push(record);

  if (hasWindow() && typeof window[ANALYTICS_TEST_SINK_GLOBAL] === 'function') {
    window[ANALYTICS_TEST_SINK_GLOBAL](record);
  }

  if (hasWindow()) {
    if (typeof window.dispatchEvent === 'function') {
      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent(ANALYTICS_SINK_EVENT, { detail: record }));
      } else {
        window.dispatchEvent({ type: ANALYTICS_SINK_EVENT, detail: record });
      }
    }
    if (window[ANALYTICS_DEBUG_GLOBAL] === true) {
      console.info('[fund44 analytics]', record);
    }
  }
}

function emit(eventName, payload) {
  validateAnalyticsPayload(eventName, payload);
  sinkEvent({
    event_name: eventName,
    payload,
    recorded_at: new Date().toISOString(),
  });
  fanOutToDestinations(eventName, payload);
}

export function trackEvent(eventName, eventFields = {}, contextOverrides = {}) {
  const context = contextForPath(contextOverrides.pathname, contextOverrides);
  const payload = {
    ...sharedFields(context, eventFields),
    ...eventFields,
  };

  emit(eventName, payload);
  return payload;
}

function currentRouteContext() {
  return contextForPath(hasWindow() ? window.location.pathname : '/');
}

let entryRouteId = null;
let entryTracked = false;

function pageHttpStatus(route) {
  return route.routeId === 'not_found' ? 404 : 200;
}

export function resetAnalyticsForTests() {
  entryRouteId = null;
  entryTracked = false;
  inMemorySessionId = null;
  inMemoryAttribution = null;
  destinations.length = 0;
  if (hasWindow()) {
    window[ANALYTICS_QUEUE_GLOBAL] = [];
    delete window[ANALYTICS_TEST_SINK_GLOBAL];
  }
}

export function getTrackedEventsForTests() {
  return safeQueue().slice();
}

export function trackRouteResolved({ pathname, referrerRouteId = null } = {}) {
  const context = contextForPath(pathname);
  const { route, content, requestedPath, isNotFound } = context;
  const isEntry = !entryTracked;

  if (isEntry) {
    entryRouteId = route.routeId;
    entryTracked = true;
  }

  trackEvent('page_view', {
    is_entry: isEntry,
    http_status: pageHttpStatus(route),
    route_family: route.routeFamily,
    eligibility_mode: 'none',
  }, context);

  if (content) {
    trackEvent('content_view', {
      content_group: content.intent?.contentGroup || '',
      primary_topic: content.intent?.primaryTopic || '',
      freshness_state: freshnessAnalyticsStateForRoute(route.routeId),
      eligibility_mode: 'none',
    }, context);
  }

  if (isNotFound) {
    trackEvent('404_view', {
      requested_path: requestedPath,
      referring_route_id: referrerRouteId || entryRouteId || '',
      eligibility_mode: 'none',
    }, context);
  }
}

function ensureVisibilityObserver(callback) {
  if (!hasWindow() || typeof IntersectionObserver === 'undefined') {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => callback(entry));
  }, { threshold: 0.4 });
}

export function instrumentVisibilityEvents(root = document) {
  if (!hasWindow() || !root) return () => {};

  const observed = new WeakSet();
  const disclosureObserver = ensureVisibilityObserver((entry) => {
    if (!entry.isIntersecting || observed.has(entry.target)) return;
    observed.add(entry.target);
    const el = entry.target;
    trackEvent('disclosure_view', {
      disclosure_id: el.dataset.disclosureId || 'generic_disclosure',
      disclosure_context: el.dataset.disclosureContext || currentRouteContext().route.routeId,
      disclosure_version: el.dataset.disclosureVersion || ANALYTICS_EVENT_VERSION,
      eligibility_mode: normalizeEligibilityMode(el.dataset.eligibilityMode),
    });
  });

  const trustObserver = ensureVisibilityObserver((entry) => {
    if (!entry.isIntersecting || observed.has(entry.target)) return;
    observed.add(entry.target);
    const el = entry.target;
    trackEvent('trust_module_view', {
      trust_module_id: el.dataset.trustModuleId || 'unknown_trust_module',
      trust_type: el.dataset.trustType || 'evidence',
      evidence_source: el.dataset.evidenceSource || 'approved_content',
      eligibility_mode: 'none',
    });
  });

  root.querySelectorAll('[data-disclosure-id]').forEach((el) => disclosureObserver?.observe(el));
  root.querySelectorAll('[data-trust-module-id]').forEach((el) => trustObserver?.observe(el));

  return () => {
    disclosureObserver?.disconnect();
    trustObserver?.disconnect();
  };
}

export function trackNavClick({ navSection, navLabel, destinationRouteId }) {
  trackEvent('nav_click', {
    nav_section: safeString(navSection),
    nav_label: safeString(navLabel),
    destination_route_id: safeString(destinationRouteId),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackCtaClick({
  ctaId,
  ctaLabel,
  ctaType,
  ctaPlacement,
  destinationRouteId,
  eligibilityMode = 'none',
}) {
  trackEvent('cta_click', {
    cta_id: safeString(ctaId),
    cta_label: safeString(ctaLabel),
    cta_type: safeString(ctaType),
    cta_placement: safeString(ctaPlacement),
    destination_route_id: safeString(destinationRouteId),
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, currentRouteContext());
}

export function trackInternalLinkClick({
  linkContext,
  destinationRouteId,
  destinationContentId = '',
}) {
  trackEvent('internal_link_click', {
    link_context: safeString(linkContext),
    destination_route_id: safeString(destinationRouteId),
    destination_content_id: safeString(destinationContentId),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackTrustModuleClick({
  trustModuleId,
  trustType,
  destination = '',
}) {
  trackEvent('trust_module_click', {
    trust_module_id: safeString(trustModuleId),
    trust_type: safeString(trustType),
    destination: safeString(destination),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackFaqExpand({ faqId, faqGroup, faqPosition }) {
  trackEvent('faq_expand', {
    faq_id: safeString(faqId),
    faq_group: safeString(faqGroup),
    faq_position: Number(faqPosition),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackEligibilityModeView({
  eligibilityMode,
  modeSource,
  eligibleNextActions,
  routeContext,
}) {
  trackEvent('eligibility_mode_view', {
    mode_source: safeString(modeSource),
    eligible_next_actions: Array.isArray(eligibleNextActions) ? eligibleNextActions.slice() : [],
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackEligibilityStart({
  eligibilityMode,
  startSurface,
  startCtaId,
  modeSource,
  routeContext,
}) {
  trackEvent('eligibility_start', {
    start_surface: safeString(startSurface),
    start_cta_id: safeString(startCtaId),
    mode_source: safeString(modeSource),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackEligibilityStepView({
  eligibilityMode,
  stepId,
  stepName,
  stepIndex,
  stepCount,
  routeContext,
}) {
  trackEvent('eligibility_step_view', {
    step_id: safeString(stepId),
    step_name: safeString(stepName),
    step_index: Number(stepIndex),
    step_count: Number(stepCount),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackEligibilityStepComplete({
  eligibilityMode,
  stepId,
  stepName,
  stepIndex,
  routeContext,
}) {
  trackEvent('eligibility_step_complete', {
    step_id: safeString(stepId),
    step_name: safeString(stepName),
    step_index: Number(stepIndex),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackEligibilityValidationError({
  eligibilityMode,
  stepId,
  fieldIds,
  errorType = 'validation_block',
  routeContext,
}) {
  trackEvent('eligibility_validation_error', {
    step_id: safeString(stepId),
    field_ids: Array.isArray(fieldIds) ? fieldIds.slice() : [],
    error_type: safeString(errorType),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackEligibilityOutcomeView({
  eligibilityMode,
  outcomeCategory,
  outcomeReasonCode,
  recommendedNextStep,
  routeContext,
}) {
  trackEvent('eligibility_outcome_view', {
    outcome_category: safeString(outcomeCategory),
    outcome_reason_code: safeString(outcomeReasonCode),
    recommended_next_step: safeString(recommendedNextStep),
    page_type: ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackApplicationStart({
  sourceOutcome,
  applicationMode,
  startSurface,
  routeContext,
}) {
  trackEvent('application_start', {
    source_outcome: safeString(sourceOutcome),
    application_mode: safeString(applicationMode),
    start_surface: safeString(startSurface),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(applicationMode),
  }, routeContext || currentRouteContext());
}

export function trackApplicationSubmitAttempt({
  eligibilityMode,
  stepId,
  attemptNumber,
  routeContext,
}) {
  trackEvent('application_submit_attempt', {
    step_id: safeString(stepId),
    attempt_number: Number(attemptNumber),
    page_type: ANALYTICS_FLOW_STEP_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackApplicationSubmitResult({
  eligibilityMode,
  result,
  failureReasonCode = '',
  integrationTarget,
  routeContext,
}) {
  trackEvent('application_submit_result', {
    result: safeString(result),
    failure_reason_code: safeString(failureReasonCode),
    integration_target: safeString(integrationTarget),
    page_type: ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackContactRequestSubmit({
  requestType,
  sourceOutcome,
  eligibilityMode,
  routeContext,
}) {
  trackEvent('contact_request_submit', {
    request_type: safeString(requestType),
    source_outcome: safeString(sourceOutcome),
    page_type: ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
    eligibility_mode: normalizeEligibilityMode(eligibilityMode),
  }, routeContext || currentRouteContext());
}

export function trackPerformanceBudgetResult({ budgetName, result }) {
  trackEvent('performance_budget_result', {
    budget_name: safeString(budgetName),
    result: safeString(result),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackA11yCheckResult({ suiteName, result, defectCount }) {
  trackEvent('a11y_check_result', {
    suite_name: safeString(suiteName),
    result: safeString(result),
    defect_count: Number(defectCount),
    eligibility_mode: 'none',
  }, currentRouteContext());
}

export function trackExperimentExposure({ experimentId, variantId, surface }) {
  // A killed or disabled experiment must stop emitting exposures immediately,
  // regardless of what the caller believes is active.
  if (!isExperimentActive(experimentId)) return false;

  trackEvent('experiment_exposure', {
    experiment_id: safeString(experimentId),
    variant_id: safeString(variantId),
    surface: safeString(surface),
    eligibility_mode: 'none',
  }, currentRouteContext());
  return true;
}

export const analyticsEventSpec = Object.freeze(
  Object.fromEntries(
    EVENT_NAMES.map((eventName) => [
      eventName,
      {
        sharedFields: SHARED_FIELDS.slice(),
        allowedFields: [...FIELD_SPEC_BY_EVENT[eventName]],
        requiredFields: [...SHARED_FIELDS, ...REQUIRED_EVENT_FIELDS[eventName]],
      },
    ]),
  ),
);
