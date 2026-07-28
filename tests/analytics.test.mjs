import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANALYTICS_ATTRIBUTION_KEY,
  ANALYTICS_FLOW_OUTCOME_PAGE_TYPE,
  ANALYTICS_FLOW_STEP_PAGE_TYPE,
  ANALYTICS_SESSION_KEY,
  assertNoAnalyticsPii,
  getSessionId,
  getTrackedEventsForTests,
  resetAnalyticsForTests,
  trackEligibilityOutcomeView,
  trackEligibilityStepView,
  trackRouteResolved,
  validateAnalyticsPayload,
} from '../src/lib/analytics.js';

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

function installBrowserEnv({
  pathname = '/',
  search = '',
  referrer = '',
} = {}) {
  const previousWindow = global.window;
  const previousDocument = global.document;
  const previousCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const storage = createStorage();

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
    },
  });

  global.document = {
    referrer,
    body: {},
  };

  global.window = {
    innerWidth: 1280,
    location: {
      pathname,
      search,
      origin: 'https://fund44.com',
    },
    sessionStorage: storage,
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
    history: {
      state: {},
      pushState() {},
      replaceState() {},
    },
  };

  return () => {
    global.window = previousWindow;
    global.document = previousDocument;
    if (previousCryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', previousCryptoDescriptor);
    } else {
      delete globalThis.crypto;
    }
  };
}

test('analytics payload validation rejects unknown events and properties', () => {
  assert.throws(
    () => validateAnalyticsPayload('unknown_event', {}),
    /Unknown analytics event/,
  );

  assert.throws(
    () => validateAnalyticsPayload('page_view', {
      event_version: 'v1',
      route_id: 'home',
      canonical_url: 'https://fund44.com/',
      page_type: 'home',
      template_id: 'home_page',
      content_id: 'page_home',
      content_version: '2026-07-26',
      eligibility_mode: 'none',
      device_class: 'desktop',
      session_id: 'session_1',
      environment: 'staging',
      entry_channel: 'direct',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      referrer_domain: '',
      experiment_ids: [],
      consent_state: 'staging_preview_only',
      is_entry: true,
      http_status: 200,
      route_family: 'home',
      unexpected_field: 'nope',
    }),
    /Unknown property "unexpected_field"/,
  );
});

test('analytics payload validation rejects missing required properties', () => {
  assert.throws(
    () => validateAnalyticsPayload('cta_click', {
      event_version: 'v1',
      route_id: 'home',
      canonical_url: 'https://fund44.com/',
      page_type: 'home',
      template_id: 'home_page',
      content_id: 'page_home',
      content_version: '2026-07-26',
      eligibility_mode: 'none',
      device_class: 'desktop',
      session_id: 'session_1',
      environment: 'staging',
      entry_channel: 'direct',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      referrer_domain: '',
      experiment_ids: [],
      consent_state: 'staging_preview_only',
      cta_id: 'preview_funding_paths',
      cta_label: 'Preview funding paths',
      cta_type: 'primary',
    }),
    /Missing required analytics property "cta_placement"/,
  );
});

test('PII guard rejects PII-shaped keys and values', () => {
  assert.throws(
    () => assertNoAnalyticsPii({ email: 'owner@example.com' }),
    /PII-like analytics key is not allowed/,
  );

  assert.throws(
    () => assertNoAnalyticsPii({ outcome_reason_code: 'owner@example.com' }),
    /PII-like analytics value is not allowed/,
  );
});

test('route resolution emits page_view, content_view, and 404_view with manifest-backed fields', () => {
  const restore = installBrowserEnv({
    pathname: '/financing',
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=test',
    referrer: 'https://www.google.com/search?q=fund44',
  });

  try {
    resetAnalyticsForTests();
    trackRouteResolved({ pathname: '/financing' });
    trackRouteResolved({ pathname: '/missing-route', referrerRouteId: 'financing' });

    const events = getTrackedEventsForTests();
    assert.equal(events.length, 4);

    const [pageView, contentView, missingPageView, notFoundView] = events;
    assert.equal(pageView.event_name, 'page_view');
    assert.equal(pageView.payload.route_id, 'financing');
    assert.equal(pageView.payload.page_type, 'financing_hub');
    assert.equal(pageView.payload.is_entry, true);
    assert.equal(pageView.payload.entry_channel, 'paid');
    assert.equal(pageView.payload.utm_source, 'google');
    assert.equal(pageView.payload.referrer_domain, 'www.google.com');

    assert.equal(contentView.event_name, 'content_view');
    assert.equal(contentView.payload.content_id, 'page_financing');
    assert.equal(contentView.payload.primary_topic, 'financing_options_overview');
    assert.equal(contentView.payload.freshness_state, 'review_pending');

    assert.equal(missingPageView.event_name, 'page_view');
    assert.equal(missingPageView.payload.route_id, 'not_found');
    assert.equal(missingPageView.payload.http_status, 404);

    assert.equal(notFoundView.event_name, '404_view');
    assert.equal(notFoundView.payload.requested_path, '/missing-route');
    assert.equal(notFoundView.payload.referring_route_id, 'financing');
  } finally {
    restore();
  }
});

test('flow analytics override page_type to funnel_step and funnel_outcome', () => {
  const restore = installBrowserEnv({ pathname: '/about' });

  try {
    resetAnalyticsForTests();

    trackEligibilityStepView({
      eligibilityMode: 'preview',
      stepId: 'use_of_funds',
      stepName: 'Use of funds',
      stepIndex: 2,
      stepCount: 6,
    });

    trackEligibilityOutcomeView({
      eligibilityMode: 'preview',
      outcomeCategory: 'qualified',
      outcomeReasonCode: 'operating_profile',
      recommendedNextStep: 'review_preview_paths',
    });

    const [stepView, outcomeView] = getTrackedEventsForTests();
    assert.equal(stepView.payload.page_type, ANALYTICS_FLOW_STEP_PAGE_TYPE);
    assert.equal(outcomeView.payload.page_type, ANALYTICS_FLOW_OUTCOME_PAGE_TYPE);
  } finally {
    restore();
  }
});

test('contextual funnel outcome CTA ids stay renderable for all route families', async () => {
  const { renderRouteToHtml } = await import('../src/pages/index.js');

  const routeExpectations = [
    ['working_capital', 'data-flow-context-kind="program"'],
    ['buy_a_business', 'data-flow-context-kind="use_case"'],
    ['franchise_businesses', 'data-flow-context-kind="industry"'],
    ['california_sba_loans', 'data-flow-context-kind="state"'],
  ];

  routeExpectations.forEach(([routeId, expectedContextMarker]) => {
    const html = renderRouteToHtml(({
      working_capital: '/working-capital',
      buy_a_business: '/use-cases/buy-a-business',
      franchise_businesses: '/industries/franchise-businesses',
      california_sba_loans: '/states/california-sba-loans',
    })[routeId]).html;
    assert.match(html, new RegExp(expectedContextMarker));
  });
});

test('session and attribution persist through sessionStorage', () => {
  const restore = installBrowserEnv({
    pathname: '/',
    search: '?utm_source=newsletter&utm_medium=email&utm_campaign=launch',
  });

  try {
    resetAnalyticsForTests();
    const sessionId = getSessionId();
    const storedSessionId = window.sessionStorage.getItem(ANALYTICS_SESSION_KEY);

    assert.equal(sessionId, '11111111-1111-4111-8111-111111111111');
    assert.equal(storedSessionId, sessionId);

    trackRouteResolved({ pathname: '/' });
    const attribution = JSON.parse(window.sessionStorage.getItem(ANALYTICS_ATTRIBUTION_KEY));

    assert.equal(attribution.utm_source, 'newsletter');
    assert.equal(attribution.utm_medium, 'email');
    assert.equal(attribution.entry_channel, 'email');
  } finally {
    restore();
  }
});
