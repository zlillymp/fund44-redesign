import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXPERIMENT_SURFACES,
  assignVariant,
  getActiveAssignments,
  getActiveExperimentIds,
  isExperimentActive,
  validateExperimentDefinition,
  __resetExperimentRegistryForTests,
  __setExperimentRegistryForTests,
} from '../src/lib/experiments.js';
import {
  getTrackedEventsForTests,
  resetAnalyticsForTests,
  trackExperimentExposure,
  trackRouteResolved,
} from '../src/lib/analytics.js';

const SAMPLE_EXPERIMENT = Object.freeze({
  experimentId: 'nav_cta_label_test',
  surface: 'nav',
  enabled: true,
  variants: [
    { variantId: 'control', weight: 1 },
    { variantId: 'treatment', weight: 1 },
  ],
  guardrailMetrics: ['error_free_session_rate'],
});

function withRegistry(registry, run) {
  __setExperimentRegistryForTests(registry);
  try {
    run();
  } finally {
    __resetExperimentRegistryForTests();
    delete globalThis.__FUND44_EXPERIMENTS_DISABLED__;
    delete globalThis.__FUND44_EXPERIMENT_KILLSWITCH__;
  }
}

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

function installBrowserEnv({ pathname = '/' } = {}) {
  const previousWindow = global.window;
  const previousDocument = global.document;
  const previousCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const storage = createStorage();

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      randomUUID: () => '22222222-2222-4222-8222-222222222222',
    },
  });

  global.document = {
    referrer: '',
    body: {},
  };

  global.window = {
    innerWidth: 1280,
    location: {
      pathname,
      search: '',
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

test('registry ships empty so no experiment runs by default', () => {
  assert.deepEqual(getActiveExperimentIds('session-a'), []);
  assert.equal(isExperimentActive('anything'), false);
});

test('experiment definitions are validated before they can run', () => {
  assert.deepEqual(validateExperimentDefinition(SAMPLE_EXPERIMENT), []);

  const badId = validateExperimentDefinition({ ...SAMPLE_EXPERIMENT, experimentId: 'Bad-Id' });
  assert.ok(badId.some((message) => message.includes('snake_case')));

  const badSurface = validateExperimentDefinition({ ...SAMPLE_EXPERIMENT, surface: 'homepage' });
  assert.ok(badSurface.some((message) => message.includes(EXPERIMENT_SURFACES.join(', '))));

  const oneVariant = validateExperimentDefinition({
    ...SAMPLE_EXPERIMENT,
    variants: [{ variantId: 'control', weight: 1 }],
  });
  assert.ok(oneVariant.some((message) => message.includes('at least a control')));

  const zeroWeights = validateExperimentDefinition({
    ...SAMPLE_EXPERIMENT,
    variants: [
      { variantId: 'control', weight: 0 },
      { variantId: 'treatment', weight: 0 },
    ],
  });
  assert.ok(zeroWeights.some((message) => message.includes('positive weight')));

  const noGuardrails = validateExperimentDefinition({ ...SAMPLE_EXPERIMENT, guardrailMetrics: [] });
  assert.ok(noGuardrails.some((message) => message.includes('guardrailMetrics')));

  assert.throws(
    () => __setExperimentRegistryForTests([{ ...SAMPLE_EXPERIMENT, experimentId: 'Bad-Id' }]),
    /snake_case/,
  );
});

test('assignment is deterministic per session and spreads across sessions', () => {
  const first = assignVariant(SAMPLE_EXPERIMENT, 'session-a');
  for (let repeat = 0; repeat < 25; repeat += 1) {
    assert.equal(assignVariant(SAMPLE_EXPERIMENT, 'session-a'), first);
  }

  const seen = new Set();
  for (let index = 0; index < 200; index += 1) {
    seen.add(assignVariant(SAMPLE_EXPERIMENT, `session-${index}`));
  }
  assert.deepEqual([...seen].sort(), ['control', 'treatment']);
});

test('zero-weight variants are never assigned', () => {
  const weighted = {
    ...SAMPLE_EXPERIMENT,
    variants: [
      { variantId: 'control', weight: 1 },
      { variantId: 'dead_variant', weight: 0 },
    ],
  };
  for (let index = 0; index < 100; index += 1) {
    assert.equal(assignVariant(weighted, `session-${index}`), 'control');
  }
});

test('kill switches remove experiments immediately', () => {
  withRegistry([SAMPLE_EXPERIMENT], () => {
    assert.deepEqual(getActiveExperimentIds('session-a'), ['nav_cta_label_test']);
    assert.equal(isExperimentActive('nav_cta_label_test'), true);

    globalThis.__FUND44_EXPERIMENT_KILLSWITCH__ = ['nav_cta_label_test'];
    assert.deepEqual(getActiveExperimentIds('session-a'), []);
    assert.equal(isExperimentActive('nav_cta_label_test'), false);

    delete globalThis.__FUND44_EXPERIMENT_KILLSWITCH__;
    globalThis.__FUND44_EXPERIMENTS_DISABLED__ = true;
    assert.deepEqual(getActiveExperimentIds('session-a'), []);
    assert.equal(isExperimentActive('nav_cta_label_test'), false);
  });
});

test('disabled registry entries never assign or activate', () => {
  withRegistry([{ ...SAMPLE_EXPERIMENT, enabled: false }], () => {
    assert.deepEqual(getActiveAssignments('session-a'), []);
    assert.equal(isExperimentActive('nav_cta_label_test'), false);
  });
});

test('active experiments flow into experiment_ids on every analytics event', () => {
  const restore = installBrowserEnv({ pathname: '/financing' });
  try {
    withRegistry([SAMPLE_EXPERIMENT], () => {
      resetAnalyticsForTests();
      trackRouteResolved({ pathname: '/financing' });

      const events = getTrackedEventsForTests();
      assert.ok(events.length >= 1);
      events.forEach((event) => {
        assert.deepEqual(event.payload.experiment_ids, ['nav_cta_label_test']);
      });
    });
  } finally {
    restore();
  }
});

test('experiment exposure emits for active experiments and refuses killed ones', () => {
  const restore = installBrowserEnv({ pathname: '/financing' });
  try {
    withRegistry([SAMPLE_EXPERIMENT], () => {
      resetAnalyticsForTests();

      const emitted = trackExperimentExposure({
        experimentId: 'nav_cta_label_test',
        variantId: 'control',
        surface: 'nav',
      });
      assert.equal(emitted, true);

      const events = getTrackedEventsForTests();
      const exposure = events.find((event) => event.event_name === 'experiment_exposure');
      assert.ok(exposure, 'expected an experiment_exposure event');
      assert.equal(exposure.payload.experiment_id, 'nav_cta_label_test');
      assert.equal(exposure.payload.variant_id, 'control');
      assert.equal(exposure.payload.surface, 'nav');
      assert.deepEqual(exposure.payload.experiment_ids, ['nav_cta_label_test']);

      globalThis.__FUND44_EXPERIMENT_KILLSWITCH__ = ['nav_cta_label_test'];
      const killedEmit = trackExperimentExposure({
        experimentId: 'nav_cta_label_test',
        variantId: 'control',
        surface: 'nav',
      });
      assert.equal(killedEmit, false);
      const exposures = getTrackedEventsForTests()
        .filter((event) => event.event_name === 'experiment_exposure');
      assert.equal(exposures.length, 1);
    });
  } finally {
    restore();
  }
});
