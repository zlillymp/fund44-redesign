import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getRegisteredDestinationIds,
  getTrackedEventsForTests,
  registerAnalyticsDestination,
  resetAnalyticsForTests,
  sanitizeDestinationParams,
  trackRouteResolved,
} from '../src/lib/analytics.js';
import {
  GA4_CONSENT_DEFAULTS,
  GA4_DESTINATION_ID,
  GA4_MEASUREMENT_ID,
  createGa4Destination,
  ga4ScriptSrc,
  isGa4DestinationEnabled,
} from '../src/lib/analytics/destinations/ga4.js';
import { initAnalyticsDestinations } from '../src/lib/analytics/destinations/index.js';

function createFakeDom({ hostname = 'fund44.com', pathname = '/' } = {}) {
  const scripts = [];
  const head = {
    appendChild(node) {
      scripts.push(node);
      return node;
    },
  };

  const doc = {
    referrer: '',
    head,
    body: {},
    createElement() {
      return {};
    },
    querySelector(selector) {
      const match = /script\[src="(.+)"\]/.exec(selector);
      if (!match) return null;
      return scripts.find((script) => script.src === match[1]) || null;
    },
  };

  const storage = new Map();
  const win = {
    innerWidth: 1280,
    location: { hostname, pathname, search: '', origin: `https://${hostname}` },
    sessionStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
  };

  return { win, doc, scripts };
}

function dataLayerCalls(win) {
  return (win.dataLayer || []).map((entry) => Array.from(entry));
}

function callsOfType(win, command) {
  return dataLayerCalls(win).filter((call) => call[0] === command);
}

test('GA4 destination is a no-op outside the production host allowlist', () => {
  const nonProductionCases = [
    { environment: 'staging', hostname: 'fund44.com' },
    { environment: 'production', hostname: 'staging.fund44.com' },
    { environment: 'production', hostname: 'fund44-redesign.vercel.app' },
    { environment: 'production', hostname: 'localhost' },
  ];

  nonProductionCases.forEach(({ environment, hostname }) => {
    assert.equal(isGa4DestinationEnabled({ environment, hostname }), false);

    const { win, doc, scripts } = createFakeDom({ hostname });
    const destination = createGa4Destination({ environment, hostname, windowRef: win, documentRef: doc });

    assert.equal(destination.enabled, false);
    assert.equal(destination.load(), false);
    assert.equal(destination.send('page_view', { route_id: 'home' }), false);
    assert.equal(destination.updateConsent({ analyticsGranted: true }), false);
    assert.equal(scripts.length, 0);
    assert.equal(win.dataLayer, undefined);
  });
});

test('GA4 destination injects gtag.js exactly once across repeated init calls', () => {
  const { win, doc, scripts } = createFakeDom();

  try {
    resetAnalyticsForTests();
    global.window = win;
    global.document = doc;

    initAnalyticsDestinations({
      environment: 'production',
      hostname: 'fund44.com',
      windowRef: win,
      documentRef: doc,
    });
    initAnalyticsDestinations({
      environment: 'production',
      hostname: 'fund44.com',
      windowRef: win,
      documentRef: doc,
    });

    assert.deepEqual(getRegisteredDestinationIds(), [GA4_DESTINATION_ID]);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, ga4ScriptSrc(GA4_MEASUREMENT_ID));
    assert.equal(scripts[0].async, true);
    assert.equal(callsOfType(win, 'config').length, 1);
    assert.equal(callsOfType(win, 'js').length, 1);
  } finally {
    resetAnalyticsForTests();
    delete global.window;
    delete global.document;
  }
});

test('GA4 destination sets denied Consent Mode v2 defaults before the config call', () => {
  const { win, doc } = createFakeDom();
  const destination = createGa4Destination({
    environment: 'production',
    hostname: 'www.fund44.com',
    windowRef: win,
    documentRef: doc,
  });

  destination.load();

  const commands = dataLayerCalls(win).map((call) => `${call[0]}:${call[1]}`);
  assert.equal(commands[0], 'consent:default');
  assert.ok(commands.indexOf('consent:default') < commands.findIndex((command) => command.startsWith('config:')));

  const [, , defaults] = callsOfType(win, 'consent')[0];
  assert.deepEqual(defaults, { ...GA4_CONSENT_DEFAULTS });
  assert.equal(defaults.analytics_storage, 'denied');
  assert.equal(defaults.ad_storage, 'denied');
  assert.equal(defaults.ad_user_data, 'denied');
  assert.equal(defaults.ad_personalization, 'denied');
  assert.equal(defaults.wait_for_update, 500);

  // No consent signal was supplied, so nothing is upgraded to granted.
  assert.equal(callsOfType(win, 'consent').length, 1);
});

test('GA4 config disables vendor page views so the layer owns SPA page_view', () => {
  const { win, doc } = createFakeDom({ pathname: '/financing' });

  try {
    resetAnalyticsForTests();
    global.window = win;
    global.document = doc;

    const destination = createGa4Destination({
      environment: 'production',
      hostname: 'fund44.com',
      windowRef: win,
      documentRef: doc,
    });
    registerAnalyticsDestination(destination);

    assert.equal(destination.load(), true);

    const [, measurementId, configParams] = callsOfType(win, 'config')[0];
    assert.equal(measurementId, GA4_MEASUREMENT_ID);
    assert.equal(configParams.send_page_view, false);

    trackRouteResolved({ pathname: '/financing' });

    const layerEvents = getTrackedEventsForTests().map((record) => record.event_name);
    assert.ok(layerEvents.includes('page_view'));

    const forwarded = dataLayerCalls(win).filter((call) => call[0] === 'event');
    assert.equal(forwarded[0][1], 'page_view');
    assert.equal(forwarded[0][2].route_id, 'financing');
    assert.equal(typeof forwarded[0][2].experiment_ids, 'string');
  } finally {
    resetAnalyticsForTests();
    delete global.window;
    delete global.document;
  }
});

test('GA4 destination strips PII and raw reference IDs before forwarding', () => {
  const { win, doc } = createFakeDom();
  const destination = createGa4Destination({
    environment: 'production',
    hostname: 'fund44.com',
    windowRef: win,
    documentRef: doc,
  });

  destination.send('cta_click', {
    route_id: 'home',
    cta_id: 'preview_funding_paths',
    email: 'owner@example.com',
    business_name: 'Example LLC',
    lender_id: 'LEND-4471',
    application_id: 'APP-99213',
    partner_reference_id: 'PRT-1',
    outcome_reason_code: 'owner@example.com',
    notes: 'free text the user typed',
    experiment_ids: ['exp_a', 'exp_b'],
  });

  const [, eventName, params] = dataLayerCalls(win).find((call) => call[0] === 'event');
  assert.equal(eventName, 'cta_click');
  assert.deepEqual(Object.keys(params).sort(), ['cta_id', 'experiment_ids', 'route_id']);
  assert.equal(params.experiment_ids, 'exp_a,exp_b');
});

test('destination sanitization hook is shared with the analytics layer PII rules', () => {
  const sanitized = sanitizeDestinationParams({
    route_id: 'home',
    session_id: 'session_abc',
    lender_ref: 'LEND-1',
    provider_id: 'PRV-1',
    user_id: 'U-1',
    phone: '415-555-0134',
    step_id: 'use_of_funds',
  });

  assert.deepEqual(sanitized, {
    route_id: 'home',
    session_id: 'session_abc',
    step_id: 'use_of_funds',
  });
});

test('updateConsent only grants storage after the layer reports consent', () => {
  const { win, doc } = createFakeDom();
  const destination = createGa4Destination({
    environment: 'production',
    hostname: 'fund44.com',
    consent: { analyticsGranted: false, adsGranted: false },
    windowRef: win,
    documentRef: doc,
  });

  destination.load();
  assert.equal(callsOfType(win, 'consent').length, 1);

  assert.equal(destination.updateConsent({ analyticsGranted: true, adsGranted: false }), true);
  const update = callsOfType(win, 'consent')[1];
  assert.equal(update[1], 'update');
  assert.deepEqual(update[2], {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
});
