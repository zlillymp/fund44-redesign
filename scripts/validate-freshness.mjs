import { getFreshnessReport, FRESHNESS_ACTIONS } from '../src/lib/freshness.js';

const report = getFreshnessReport();
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

for (const entry of report.governance) {
  if (!entry.exists) {
    fail(`${entry.id}: required governance file "${entry.path}" is missing`);
  }
}

for (const entry of report.generatedAssets) {
  if (!entry.exists) {
    fail(`${entry.id}: required generated asset "${entry.path}" is missing`);
  }
}

for (const entry of report.content) {
  if (!entry.ownerRole || !entry.reviewerRole) {
    fail(`${entry.id}: content freshness owner/reviewer roles are required`);
  }
  if (!entry.reviewWindowDays) {
    fail(`${entry.id}: content freshness review window is required`);
  }
  if (!Array.isArray(entry.reviewTriggers) || entry.reviewTriggers.length === 0) {
    fail(`${entry.id}: content freshness review triggers are required`);
  }

  if (entry.currentFreshnessState !== entry.state) {
    fail(`${entry.id}: measurement.freshnessState "${entry.currentFreshnessState}" must match derived freshness state "${entry.state}"`);
  }

  if (entry.canonical && entry.action === FRESHNESS_ACTIONS.BLOCK) {
    fail(`${entry.id}: canonical content is blocked by freshness policy`);
  }

  if (entry.canonical && entry.action === FRESHNESS_ACTIONS.NOINDEX && !entry.policyNoindex) {
    fail(`${entry.id}: canonical noindex action must be reflected in policyNoindex`);
  }
}

for (const entry of report.citations) {
  if (!entry.ownerRole || !entry.reviewerRole) {
    fail(`${entry.id}: citation freshness owner/reviewer roles are required`);
  }
  if (!entry.reviewWindowDays) {
    fail(`${entry.id}: citation freshness review window is required`);
  }
  if (!Array.isArray(entry.reviewTriggers) || entry.reviewTriggers.length === 0) {
    fail(`${entry.id}: citation freshness review triggers are required`);
  }
  if (entry.action === FRESHNESS_ACTIONS.BLOCK) {
    fail(`${entry.id}: citation is blocked by freshness policy`);
  }
  if (entry.action === FRESHNESS_ACTIONS.NOINDEX) {
    warn(`${entry.id}: citation is stale and forces dependent content to noindex until reviewed`);
  }
}

if (warnings.length) {
  warnings.forEach((message) => console.warn(`WARN: ${message}`));
}

if (errors.length) {
  console.error('Freshness validation failed:\n');
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('Freshness validation passed.');
console.table([
  {
    content: report.summaries.content.total,
    citations: report.summaries.citations.total,
    governance: report.summaries.governance.total,
    generatedAssets: report.summaries.generatedAssets.total,
    reviewPending: report.summaries.content.reviewPending + report.summaries.citations.reviewPending + report.summaries.governance.reviewPending + report.summaries.generatedAssets.reviewPending,
    upcoming: report.summaries.content.upcoming + report.summaries.citations.upcoming + report.summaries.governance.upcoming + report.summaries.generatedAssets.upcoming,
    stale: report.summaries.content.stale + report.summaries.citations.stale + report.summaries.governance.stale + report.summaries.generatedAssets.stale,
    expired: report.summaries.content.expired + report.summaries.citations.expired + report.summaries.governance.expired + report.summaries.generatedAssets.expired,
    noindex: report.noindexContent.length,
    blocked: report.blockingEntries.length,
  },
]);
