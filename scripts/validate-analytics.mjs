import { renderRouteToHtml } from '../src/pages/index.js';
import {
  ANALYTICS_CORE_EVENTS,
  ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
  ANALYTICS_FLOW_STEP_PAGE_TYPE,
  analyticsEventNames,
  analyticsEventSpec,
} from '../src/lib/analytics.js';
import { getAllRoutes } from '../src/lib/routes.js';
import { getAllContent } from '../src/lib/content.js';

const errors = [];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function extractAll(pattern, value) {
  return [...value.matchAll(pattern)].map((match) => match[1]);
}

const approvedEvents = new Set([
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
]);

const sharedFields = [
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

analyticsEventNames.forEach((eventName) => {
  assert(approvedEvents.has(eventName), `analytics spec contains unapproved event "${eventName}"`);
});

assert(analyticsEventNames.length === approvedEvents.size, 'analytics spec event count drifted from approved taxonomy');

Object.entries(analyticsEventSpec).forEach(([eventName, spec]) => {
  sharedFields.forEach((field) => {
    assert(spec.requiredFields.includes(field), `${eventName}: missing shared required field "${field}"`);
  });
});

assert(
  ANALYTICS_CORE_EVENTS.every((eventName) => analyticsEventSpec[eventName]),
  'core analytics events must remain present in the analytics spec',
);

assert(analyticsEventSpec.eligibility_step_view.allowedFields.includes('page_type'), 'eligibility_step_view must allow page_type override');
assert(analyticsEventSpec.eligibility_outcome_view.allowedFields.includes('page_type'), 'eligibility_outcome_view must allow page_type override');

const routeHtml = new Map(
  getAllRoutes().map((route) => [route.routeId, renderRouteToHtml(route.path).html]),
);

const homeHtml = routeHtml.get('home') || '';
assert(homeHtml.includes('data-trust-module-id="home_hero_proof"'), 'home route must expose trust-module tracking attributes');
assert(homeHtml.includes('data-analytics-cta-id="compare_financing_options"'), 'home route must expose the compare-financing CTA id');
assert(homeHtml.includes('data-analytics-cta-id="cta_banner_how_it_works"'), 'home route must expose the banner secondary CTA id');

const financingHtml = routeHtml.get('financing') || '';
assert(financingHtml.includes('data-analytics-cta-id="compare_financing_matrix_row"'), 'financing route must expose matrix-row CTA tracking');
assert(financingHtml.includes('data-analytics-cta-id="decision_helper_link"'), 'financing route must expose decision-helper CTA tracking');
assert(financingHtml.includes('data-disclosure-id="financing_decision_helper_disclosure"'), 'financing route must expose its disclosure tracking id');

const useCaseRoutes = getAllContent()
  .filter((record) => record.templateId === 'use_case_page')
  .map((record) => record.routeId);

useCaseRoutes.forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(html.includes('data-analytics-cta-id="use_case_best_fit_link"'), `${routeId} must expose best-fit CTA tracking`);
  assert(html.includes('data-analytics-cta-id="use_case_alternative_link"'), `${routeId} must expose alternative-path CTA tracking`);
});

const notFoundHtml = routeHtml.get('not_found') || '';
assert(notFoundHtml.includes('data-analytics-cta-id="back_home"'), '404 route must expose the back-home CTA id');
assert(notFoundHtml.includes('data-analytics-cta-id="explore_financing"'), '404 route must expose the financing CTA id');

const legalRoutes = ['privacy', 'terms', 'contact'];
legalRoutes.forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(/data-disclosure-id="/.test(html), `${routeId} route must expose disclosure tracking`);
});

const resourcesHtml = routeHtml.get('resources') || '';
assert(resourcesHtml.includes('data-analytics-cta-id="resources_article_card"'), 'resources hub must expose article card CTA tracking');

const articleRoutes = getAllContent()
  .filter((record) => record.templateId === 'editorial_article')
  .map((record) => record.routeId);

articleRoutes.forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(html.includes('data-analytics-cta-id="article_keep_reading"'), `${routeId} must expose keep-reading CTA tracking`);
});

const contentByRoute = new Map(getAllContent().map((record) => [record.routeId, record]));
contentByRoute.forEach((record, routeId) => {
  const html = routeHtml.get(routeId) || '';
  const faqGroup = record.measurement?.faqGroup;
  if (faqGroup) {
    assert(html.includes(`data-faq-group="${faqGroup}"`), `${routeId} must render faq group "${faqGroup}"`);
  }

  (record.measurement?.ctaIds || []).forEach((ctaId) => {
    assert(html.includes(`data-analytics-cta-id="${ctaId}"`), `${routeId} must render CTA id "${ctaId}"`);
  });
});

assert(ANALYTICS_FLOW_STEP_PAGE_TYPE === 'funnel_step', 'funnel step page_type override must remain stable');
assert(ANALYTICS_FLOW_OUTCOME_PAGE_TYPE === 'funnel_outcome', 'funnel outcome page_type override must remain stable');

if (errors.length > 0) {
  console.error('Analytics validation failed:\n');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Analytics validation passed for ${analyticsEventNames.length} events and ${getAllRoutes().length} routes.`);
