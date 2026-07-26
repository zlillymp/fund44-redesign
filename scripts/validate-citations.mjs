import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { citationRegistry } from '../content/citations.mjs';
import { getAllContent } from '../src/lib/content.js';
import {
  allowedCitationTypes,
  allowedEvidenceScopes,
  allowedInternalApprovalStatuses,
  externalEvidenceRequiredScopes,
} from '../content/schema/content-model.mjs';

const TODAY = '2026-07-26';
const CLAIM_ID_PATTERN = /`(F44-[A-Z]+-\d+)`/g;
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function compareIsoDate(left, right) {
  return left.localeCompare(right);
}

function loadClaimIdsFromRegister(claimRegisterText) {
  const ids = new Set();
  for (const match of claimRegisterText.matchAll(CLAIM_ID_PATTERN)) {
    ids.add(match[1]);
  }
  return ids;
}

function isExternalCitation(citation) {
  return citation.citationType.startsWith('external_');
}

export function validateCitationGraph({
  contentRecords = getAllContent(),
  registry = citationRegistry,
  claimRegisterText = readFileSync(resolve(repoRoot, 'docs/claims-register.md'), 'utf8'),
  today = TODAY,
} = {}) {
  const errors = [];
  const knownClaimIds = loadClaimIdsFromRegister(claimRegisterText);
  const registryIds = new Set();
  const registryById = new Map();

  function fail(message) {
    errors.push(message);
  }

  for (const citation of registry) {
    if (registryIds.has(citation.id)) {
      fail(`Duplicate citation id "${citation.id}" in registry`);
      continue;
    }
    registryIds.add(citation.id);
    registryById.set(citation.id, citation);

    if (!allowedCitationTypes.has(citation.citationType)) {
      fail(`${citation.id}: citationType "${citation.citationType}" is invalid`);
    }

    if (!citation.title) {
      fail(`${citation.id}: title is required`);
    }

    if (!citation.sourceLabel) {
      fail(`${citation.id}: sourceLabel is required`);
    }

    if (!citation.reviewedDate || !/^\d{4}-\d{2}-\d{2}$/.test(citation.reviewedDate)) {
      fail(`${citation.id}: reviewedDate must be YYYY-MM-DD`);
    }

    if (citation.expiresDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(citation.expiresDate)) {
      fail(`${citation.id}: expiresDate must be YYYY-MM-DD or null`);
    }

    if (citation.expiresDate && compareIsoDate(citation.expiresDate, today) < 0) {
      fail(`${citation.id}: citation expired on ${citation.expiresDate}`);
    }

    if (!Array.isArray(citation.allowedScopes) || citation.allowedScopes.length === 0) {
      fail(`${citation.id}: allowedScopes must be a non-empty array`);
    } else {
      const scopes = new Set();
      citation.allowedScopes.forEach((scope, index) => {
        if (!allowedEvidenceScopes.has(scope)) {
          fail(`${citation.id}: allowedScopes[${index}] "${scope}" is invalid`);
        }
        if (scopes.has(scope)) {
          fail(`${citation.id}: duplicate allowed scope "${scope}"`);
        }
        scopes.add(scope);
      });
    }

    if (!Array.isArray(citation.claimIds) || citation.claimIds.length === 0) {
      fail(`${citation.id}: claimIds must be a non-empty array`);
    } else {
      const claimIds = new Set();
      citation.claimIds.forEach((claimId, index) => {
        if (typeof claimId !== 'string' || claimId.length === 0) {
          fail(`${citation.id}: claimIds[${index}] must be a non-empty string`);
          return;
        }
        if (claimIds.has(claimId)) {
          fail(`${citation.id}: duplicate claim id "${claimId}"`);
        }
        claimIds.add(claimId);
        if (!knownClaimIds.has(claimId)) {
          fail(`${citation.id}: claim id "${claimId}" is not defined in docs/claims-register.md`);
        }
      });
    }

    if (citation.citationType === 'internal_approved') {
      if (!allowedInternalApprovalStatuses.has(citation.approvalStatus)) {
        fail(`${citation.id}: internal approvalStatus "${citation.approvalStatus}" is invalid`);
      }
      if (!citation.documentPath) {
        fail(`${citation.id}: documentPath is required for internal citations`);
      } else if (!existsSync(resolve(repoRoot, citation.documentPath))) {
        fail(`${citation.id}: documentPath "${citation.documentPath}" does not exist`);
      }
    } else if (!citation.url || !citation.url.startsWith('https://')) {
      fail(`${citation.id}: url must be an https URL`);
    }
  }

  for (const record of contentRecords) {
    if (!Array.isArray(record.claimIds) || !Array.isArray(record.citationIds)) {
      fail(`${record.id}: claimIds and citationIds must be arrays before citation validation runs`);
      continue;
    }

    const claimIds = new Set();
    record.claimIds.forEach((claimId, index) => {
      if (typeof claimId !== 'string' || claimId.length === 0) {
        fail(`${record.id}: claimIds[${index}] must be a non-empty string`);
        return;
      }
      if (claimIds.has(claimId)) {
        fail(`${record.id}: duplicate claim id "${claimId}"`);
      }
      claimIds.add(claimId);
      if (!knownClaimIds.has(claimId)) {
        fail(`${record.id}: claim id "${claimId}" is not defined in docs/claims-register.md`);
      }
    });

    const citationIds = new Set();
    record.citationIds.forEach((citationId, index) => {
      if (typeof citationId !== 'string' || citationId.length === 0) {
        fail(`${record.id}: citationIds[${index}] must be a non-empty string`);
        return;
      }
      if (citationIds.has(citationId)) {
        fail(`${record.id}: duplicate citation id "${citationId}"`);
      }
      citationIds.add(citationId);
    });

    if (record.claimIds.length > 0 && record.citationIds.length === 0) {
      fail(`${record.id}: claim-bearing record must reference at least one citation id`);
      continue;
    }

    const citedClaimCoverage = new Set();
    let hasRequiredExternalEvidence = false;

    for (const citationId of record.citationIds) {
      const citation = registryById.get(citationId);
      if (!citation) {
        fail(`${record.id}: citation id "${citationId}" is not defined in content/citations.mjs`);
        continue;
      }

      const scopeMatch = citation.allowedScopes.some((scope) => record.claimReview.evidenceScopes.includes(scope));
      if (!scopeMatch) {
        fail(
          `${record.id}: citation "${citationId}" is disallowed for scopes [${record.claimReview.evidenceScopes.join(', ')}]`
        );
      }

      citation.claimIds.forEach((claimId) => citedClaimCoverage.add(claimId));

      if (
        isExternalCitation(citation) &&
        citation.allowedScopes.some((scope) => record.claimReview.evidenceScopes.includes(scope) && externalEvidenceRequiredScopes.has(scope))
      ) {
        hasRequiredExternalEvidence = true;
      }
    }

    record.claimIds.forEach((claimId) => {
      if (!citedClaimCoverage.has(claimId)) {
        fail(`${record.id}: claim "${claimId}" is not covered by any referenced citation`);
      }
    });

    if (
      record.claimReview.evidenceScopes.some((scope) => externalEvidenceRequiredScopes.has(scope)) &&
      !hasRequiredExternalEvidence
    ) {
      fail(`${record.id}: at least one external citation is required for scopes [${record.claimReview.evidenceScopes.join(', ')}]`);
    }
  }

  const inventory = contentRecords.map((record) => ({
    id: record.id,
    claims: record.claimIds.length,
    citations: record.citationIds.length,
    scopes: record.claimReview.evidenceScopes.join(', '),
  }));

  return {
    errors,
    inventory,
    citationInventory: registry.map((citation) => ({
      id: citation.id,
      citationType: citation.citationType,
      approvalStatus: citation.approvalStatus,
      scopes: citation.allowedScopes.join(', '),
      claimCount: citation.claimIds.length,
    })),
  };
}

const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const result = validateCitationGraph();

  if (result.errors.length > 0) {
    console.error('Citation validation failed:\n');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('Citation validation passed.');
  console.table(result.inventory);
  console.table(result.citationInventory);
}
