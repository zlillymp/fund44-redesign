import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { citationRegistry } from '../content/citations.mjs';
import { getAllContent } from '../src/lib/content.js';
import { validateCitationGraph } from '../scripts/validate-citations.mjs';

const claimRegisterText = readFileSync(new URL('../docs/claims-register.md', import.meta.url), 'utf8');
const fixtureFreshness = {
  ownerRole: 'SEO content',
  reviewerRole: 'Content ops',
  ownerState: 'role_assigned_identity_tbd',
  reviewerState: 'role_assigned_identity_tbd',
  reviewWindowDays: 180,
  reviewTriggers: ['Fixture review trigger'],
  staleAction: 'noindex',
  expiredAction: 'block',
};

test('current structured content passes citation validation', () => {
  const result = validateCitationGraph({
    contentRecords: getAllContent(),
    registry: citationRegistry,
    claimRegisterText,
  });

  assert.deepEqual(result.errors, []);
  citationRegistry.forEach((citation) => {
    assert.equal(typeof citation.freshness, 'object');
    assert.ok(citation.freshness.reviewWindowDays > 0);
    assert.ok(citation.freshness.reviewTriggers.length > 0);
  });
});

test('citation validation fails on missing, duplicate, and expired citations', () => {
  const result = validateCitationGraph({
    contentRecords: [
      {
        id: 'fixture_record',
        claimIds: ['F44-PROD-02'],
        claimReview: {
          requiresEvidence: true,
          evidenceScopes: ['program_detail'],
        },
        citationIds: ['fixture_expired', 'fixture_expired', 'missing_citation'],
      },
    ],
    registry: [
      {
        id: 'fixture_expired',
        citationType: 'external_primary',
        title: 'Expired fixture',
        sourceLabel: 'Fixture',
        url: 'https://example.com/expired',
        reviewedDate: '2026-01-01',
        expiresDate: '2026-01-31',
        approvalStatus: 'current_reviewed',
        freshness: fixtureFreshness,
        allowedScopes: ['program_detail'],
        claimIds: ['F44-PROD-02'],
      },
    ],
    claimRegisterText,
    today: '2026-07-26',
  });

  assert.ok(result.errors.some((error) => error.includes('citation expired on 2026-01-31')));
  assert.ok(result.errors.some((error) => error.includes('duplicate citation id "fixture_expired"')));
  assert.ok(result.errors.some((error) => error.includes('citation id "missing_citation" is not defined')));
});

test('citation validation requires an external source for product scopes and blocks disallowed internal scope use', () => {
  const result = validateCitationGraph({
    contentRecords: [
      {
        id: 'fixture_internal_only',
        claimIds: ['F44-PROD-05'],
        claimReview: {
          requiresEvidence: true,
          evidenceScopes: ['product_overview'],
        },
        citationIds: ['fixture_internal'],
      },
    ],
    registry: [
      {
        id: 'fixture_internal',
        citationType: 'internal_approved',
        title: 'Workflow-only disclosure',
        sourceLabel: 'docs/disclosures.md',
        documentPath: 'docs/disclosures.md',
        reviewedDate: '2026-07-25',
        expiresDate: null,
        approvalStatus: 'business_approved_draft',
        freshness: fixtureFreshness,
        allowedScopes: ['workflow_availability'],
        claimIds: ['F44-PROD-05'],
      },
    ],
    claimRegisterText,
  });

  assert.ok(result.errors.some((error) => error.includes('is disallowed for scopes [product_overview]')));
  assert.ok(result.errors.some((error) => error.includes('at least one external citation is required')));
});
