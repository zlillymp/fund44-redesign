import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFlowContextFromTrigger, flowTriggerAttributes } from '../src/lib/eligibility/trigger.js';
import { FUNNEL_CONTEXT_KINDS } from '../src/lib/eligibility/model.js';

test('flow trigger attributes carry stable CTA metadata', () => {
  const attrs = flowTriggerAttributes({
    ctaId: 'preview_funding_paths',
    startSurface: 'program_page_hero',
    requestedMode: 'preview',
    productContextRouteId: 'working_capital',
    productContextTitle: 'Working capital & lines of credit',
  });

  assert.match(attrs, /data-open-flow/);
  assert.match(attrs, /data-cta-id="preview_funding_paths"/);
  assert.match(attrs, /data-start-surface="program_page_hero"/);
  assert.match(attrs, /data-flow-mode="preview"/);
  assert.match(attrs, /data-flow-product-route-id="working_capital"/);
  assert.match(attrs, /data-flow-context-kind="generic"/);
  assert.doesNotMatch(attrs, /data-flow-product-title=/);
});

test('trigger context preserves route and product context from the opening surface', () => {
  const previousWindow = global.window;

  global.window = {
    location: {
      pathname: '/working-capital',
    },
  };

  const trigger = {
    dataset: {
      ctaId: 'cta_banner_preview_funding_paths',
      startSurface: 'program_cta_banner',
      flowMode: 'preview',
      flowProductRouteId: 'working_capital',
      flowProductTitle: 'Working capital & lines of credit',
    },
  };

  const context = buildFlowContextFromTrigger(trigger);

  assert.equal(context.startCtaId, 'cta_banner_preview_funding_paths');
  assert.equal(context.startSurface, 'program_cta_banner');
  assert.equal(context.entryRouteId, 'working_capital');
  assert.equal(context.productContextRouteId, 'working_capital');
  assert.equal(context.productContextTitle, 'Working capital & lines of credit');
  assert.equal(context.funnelContextKind, FUNNEL_CONTEXT_KINDS.program);

  global.window = previousWindow;
});

test('trigger context infers route-family funnel context for use-case, industry, and state pages', () => {
  const previousWindow = global.window;

  const cases = [
    ['/use-cases/buy-a-business', FUNNEL_CONTEXT_KINDS.useCase, 'buy_a_business'],
    ['/industries/franchise-businesses', FUNNEL_CONTEXT_KINDS.industry, 'franchise_businesses'],
    ['/states/california-sba-loans', FUNNEL_CONTEXT_KINDS.state, 'california_sba_loans'],
  ];

  try {
    for (const [pathname, kind, routeId] of cases) {
      global.window = { location: { pathname } };
      const context = buildFlowContextFromTrigger({ dataset: { ctaId: 'preview_funding_paths', startSurface: 'page_hero', flowMode: 'preview' } });
      assert.equal(context.entryRouteId, routeId);
      assert.equal(context.productContextRouteId, routeId);
      assert.equal(context.funnelContextKind, kind);
    }
  } finally {
    global.window = previousWindow;
  }
});

test('trigger context falls back safely when DOM route context is invalid or generic', () => {
  const previousWindow = global.window;

  global.window = {
    location: {
      pathname: '/contact',
    },
  };

  const context = buildFlowContextFromTrigger({
    dataset: {
      ctaId: 'preview_funding_paths',
      startSurface: 'contact_page_primary',
      flowMode: 'preview',
      flowProductRouteId: 'not_a_real_route',
      flowProductTitle: 'Injected title should be ignored',
      flowContextKind: 'not_allowed',
    },
  });

  assert.equal(context.entryRouteId, 'contact');
  assert.equal(context.productContextRouteId, null);
  assert.equal(context.productContextTitle, null);
  assert.equal(context.funnelContextKind, FUNNEL_CONTEXT_KINDS.generic);

  global.window = previousWindow;
});
