import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderRouteToHtml } from '../src/pages/index.js';
import {
  ANALYTICS_CORE_EVENTS,
  ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
  ANALYTICS_FLOW_STEP_PAGE_TYPE,
  analyticsEventNames,
  analyticsEventSpec,
  sanitizeDestinationParams,
} from '../src/lib/analytics.js';
import { analyticsDestinationManifest } from '../src/lib/analytics/destinations/index.js';
import {
  GA4_CONSENT_DEFAULTS,
  GA4_MEASUREMENT_ID,
  GA4_PRODUCTION_HOSTS,
  isGa4DestinationEnabled,
} from '../src/lib/analytics/destinations/ga4.js';
import { getAllRoutes } from '../src/lib/routes.js';
import { getAllContent } from '../src/lib/content.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GA4_ADAPTER_PATH = 'src/lib/analytics/destinations/ga4.js';

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

const approvedDestinations = new Map([
  ['ga4', { vendor: 'google_analytics_4', propertyId: GA4_MEASUREMENT_ID }],
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
  assert(html.includes('data-flow-context-kind="use_case"'), `${routeId} must expose use-case funnel context markers`);
});

const industryRoutes = getAllContent()
  .filter((record) => record.templateId === 'industry_page')
  .map((record) => record.routeId);

industryRoutes.forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(html.includes('data-analytics-cta-id="industry_best_fit_link"'), `${routeId} must expose best-fit CTA tracking`);
  assert(html.includes('data-analytics-cta-id="industry_alternative_link"'), `${routeId} must expose alternative-path CTA tracking`);
  assert(html.includes('data-flow-context-kind="industry"'), `${routeId} must expose industry funnel context markers`);
});

const stateRoutes = getAllContent()
  .filter((record) => record.templateId === 'state_page')
  .map((record) => record.routeId);

stateRoutes.forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(html.includes('data-analytics-cta-id="state_best_fit_link"'), `${routeId} must expose best-fit CTA tracking`);
  assert(html.includes('data-analytics-cta-id="state_alternative_link"'), `${routeId} must expose alternative-path CTA tracking`);
  assert(html.includes('data-flow-context-kind="state"'), `${routeId} must expose state funnel context markers`);
});

['sba_7a', 'sba_504', 'business_acquisition', 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing'].forEach((routeId) => {
  const html = routeHtml.get(routeId) || '';
  assert(html.includes('data-flow-context-kind="program"'), `${routeId} must expose program funnel context markers`);
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

analyticsDestinationManifest.forEach((destination) => {
  const approved = approvedDestinations.get(destination.id);
  assert(Boolean(approved), `analytics destination "${destination.id}" is not on the approved destination allowlist`);
  if (!approved) return;

  assert(destination.vendor === approved.vendor, `destination "${destination.id}" vendor drifted from the approved vendor`);
  assert(destination.propertyId === approved.propertyId, `destination "${destination.id}" property id drifted from the approved property`);
  assert(destination.productionOnly === true, `destination "${destination.id}" must stay production-only`);
  assert(destination.consentDefault === 'denied', `destination "${destination.id}" must default consent to denied`);
  assert(destination.sendsVendorPageViews === false, `destination "${destination.id}" must leave SPA page_view to the analytics layer`);
});

assert(
  analyticsDestinationManifest.length === approvedDestinations.size,
  'analytics destination manifest drifted from the approved destination allowlist',
);

assert(
  GA4_PRODUCTION_HOSTS.join(',') === 'fund44.com,www.fund44.com',
  'GA4 destination host allowlist must stay limited to the production domains',
);

['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'].forEach((signal) => {
  assert(GA4_CONSENT_DEFAULTS[signal] === 'denied', `GA4 Consent Mode default "${signal}" must be denied`);
});
assert(GA4_CONSENT_DEFAULTS.wait_for_update === 500, 'GA4 Consent Mode defaults must keep wait_for_update at 500ms');

assert(
  isGa4DestinationEnabled({ environment: 'production', hostname: 'fund44.com' })
  && isGa4DestinationEnabled({ environment: 'production', hostname: 'www.fund44.com' }),
  'GA4 destination must load on the production domains',
);

[
  { environment: 'staging', hostname: 'fund44.com' },
  { environment: 'production', hostname: 'staging.fund44.com' },
  { environment: 'production', hostname: 'localhost' },
  { environment: 'preview', hostname: 'fund44.com' },
].forEach(({ environment, hostname }) => {
  assert(
    !isGa4DestinationEnabled({ environment, hostname }),
    `GA4 destination must stay disabled for environment "${environment}" on host "${hostname}"`,
  );
});

const scrubbed = sanitizeDestinationParams({
  route_id: 'home',
  cta_id: 'preview_funding_paths',
  email: 'owner@example.com',
  lender_id: 'LEND-1',
  application_id: 'APP-1',
  partner_reference_id: 'PRT-1',
  notes: 'free text',
});
assert(
  Object.keys(scrubbed).sort().join(',') === 'cta_id,route_id',
  'destination sanitization must strip PII keys and raw lender/application/partner reference IDs',
);

function collectSourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return /\.(js|mjs)$/.test(entry.name) ? [entryPath] : [];
  });
}

const vendorSurfaceFiles = [
  ...collectSourceFiles(path.join(repoRoot, 'src')),
  path.join(repoRoot, 'index.html'),
];

vendorSurfaceFiles.forEach((filePath) => {
  const relativePath = path.relative(repoRoot, filePath).split(path.sep).join('/');
  if (relativePath === GA4_ADAPTER_PATH) return;

  const source = fs.readFileSync(filePath, 'utf8');
  assert(
    !source.includes('gtag('),
    `${relativePath} must not call gtag() directly; route vendor calls through the analytics destination adapter`,
  );
  assert(
    !source.includes(GA4_MEASUREMENT_ID),
    `${relativePath} must not hardcode the GA4 measurement id; it belongs to ${GA4_ADAPTER_PATH}`,
  );
});

if (errors.length > 0) {
  console.error('Analytics validation failed:\n');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Analytics validation passed for ${analyticsEventNames.length} events, ${analyticsDestinationManifest.length} destination(s), and ${getAllRoutes().length} routes.`);
