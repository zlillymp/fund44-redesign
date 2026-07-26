import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFlowContextFromTrigger, flowTriggerAttributes } from '../src/lib/eligibility/trigger.js';

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

  global.window = previousWindow;
});
