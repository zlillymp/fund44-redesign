import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { getLinkModuleForRoute } from '../src/lib/link-graph.js';
import {
  ELIGIBILITY_MODES,
  STEP_IDS,
  createInitialEligibilityState,
  selectMode,
} from '../src/lib/eligibility/model.js';
import { liveEligibilityGate } from '../src/lib/legal.js';
import { matchDashboard, statusTimeline, relatedLinksModule } from '../src/components/ui.js';
import { home } from '../src/pages/home.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('public preview starts past mode select when live choice is hidden', () => {
  assert.equal(liveEligibilityGate.showModeChoice, false);
  const state = createInitialEligibilityState({ requestedMode: 'preview' });
  assert.equal(state.context.activeMode, ELIGIBILITY_MODES.preview);
  assert.equal(state.currentStepId, STEP_IDS.useOfFunds);
  assert.ok(state.completedStepIds.includes(STEP_IDS.modeSelect));
});

test('live mode remains selectable programmatically for enabled intake', () => {
  const state = selectMode(createInitialEligibilityState({ requestedMode: 'live' }), ELIGIBILITY_MODES.live);
  assert.equal(state.context.activeMode, ELIGIBILITY_MODES.live);
  assert.equal(state.currentStepId, STEP_IDS.useOfFunds);
});

test('home related links omit empty Main financing guide group', () => {
  const module = getLinkModuleForRoute('home');
  assert.equal(module.groups.some((group) => group.relation === 'hub'), false);
  assert.ok(module.groups.every((group) => group.items.length > 0));
  const html = relatedLinksModule(module);
  assert.equal(html.includes('Main financing guide'), false);
});

test('homepage mockups use illustrative example framing', () => {
  const match = matchDashboard();
  const status = statusTimeline();
  assert.match(match, /match results · example/i);
  assert.match(match, /illustrative fit indicators/i);
  assert.match(status, /application status · example/i);
  assert.match(status, /Sample: Application submitted/);
});

test('disclosure CSS prevents zero-width character stacking', () => {
  const css = readFileSync(join(root, 'src/product.css'), 'utf8');
  assert.equal(css.includes('overflow-wrap:anywhere'), false);
  assert.match(css, /\.disclosure-bar p[\s\S]*?overflow-wrap:\s*break-word/);
  assert.match(css, /\.feature-split[\s\S]*?minmax\(0,\s*1fr\)/);
});

test('homepage primary CTA uses the canonical Preview funding paths label', () => {
  const html = home();
  assert.match(html, /Preview funding paths/);
  assert.equal(html.includes('Preview my funding paths'), false);
  assert.match(html, /Example borrower workflow/);
  assert.match(html, /Explain the fit/);
});
