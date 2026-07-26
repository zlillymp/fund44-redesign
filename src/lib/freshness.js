import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { citationRegistry } from '../../content/citations.mjs';
import { routeManifest } from '../../content/manifest.mjs';
import { getAllContent } from './content.js';
import {
  DEFAULT_UPCOMING_WINDOW_DAYS,
  FRESHNESS_ACTIONS,
  FRESHNESS_STATES,
  FRESHNESS_TODAY,
  actionForState,
  addDays,
  deriveState,
  freshnessAnalyticsStateForRoute,
  routeIsFreshnessBlocked,
  routeIsFreshnessNoindexed,
} from './freshness-runtime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export const GOVERNANCE_RECORDS = Object.freeze([
  {
    id: 'claims_register',
    label: 'Claims register',
    type: 'governance',
    path: 'docs/claims-register.md',
    ownerRole: 'Legal + Brand + Content ops',
    reviewerRole: 'Legal',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-25',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Monthly governance review cadence',
      'Any public claim addition, retirement, or wording change',
      'Any legal or business approval affecting claim scope or safer replacements',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
  {
    id: 'disclosures',
    label: 'Disclosures',
    type: 'governance',
    path: 'docs/disclosures.md',
    ownerRole: 'Legal + Content ops',
    reviewerRole: 'Legal',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-25',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Monthly governance review cadence',
      'Any approved disclosure wording or preview/live boundary change',
      'Any privacy, consent, entity, or provider-policy change affecting reuse',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
  {
    id: 'legal_launch_checklist',
    label: 'Legal launch checklist',
    type: 'governance',
    path: 'docs/legal-launch-checklist.md',
    ownerRole: 'Legal + Operations + SEO',
    reviewerRole: 'Legal',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-26',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Monthly launch-readiness review cadence',
      'Any change to indexing, identity/contact, privacy, consent, or sameAs readiness',
      'Any production-launch approval or blocker change under F44-GOV-02',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
]);

export const GENERATED_ASSET_RECORDS = Object.freeze([
  {
    id: 'crawl_asset_sitemap',
    label: 'Sitemap',
    type: 'generated_asset',
    path: 'public/sitemap.xml',
    ownerRole: 'SEO platform',
    reviewerRole: 'SEO content',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-26',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Every content, route, or indexability change before release',
      'Monthly crawl-surface review cadence',
      'Any freshness policy change affecting indexable routes',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
  {
    id: 'crawl_asset_llms',
    label: 'LLMs inventory',
    type: 'generated_asset',
    path: 'public/llms.txt',
    ownerRole: 'SEO platform',
    reviewerRole: 'Content ops',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-26',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Every content, route, or governed-copy change before release',
      'Monthly crawl-surface review cadence',
      'Any freshness policy change affecting LLM-exposed routes',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
  {
    id: 'crawl_asset_route_attribution',
    label: 'Route attribution inventory',
    type: 'generated_asset',
    path: 'public/route-attribution.json',
    ownerRole: 'SEO platform',
    reviewerRole: 'Growth analytics',
    ownerState: 'role_assigned_identity_tbd',
    reviewerState: 'role_assigned_identity_tbd',
    reviewedDate: '2026-07-26',
    reviewWindowDays: 30,
    reviewTriggers: [
      'Every route, content, or analytics-route change before release',
      'Monthly crawl-surface review cadence',
      'Any freshness policy change affecting canonical/indexable inventory',
    ],
    staleAction: 'noindex',
    expiredAction: 'block',
  },
]);

function fileStatus(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return {
    exists: existsSync(absolutePath),
    absolutePath,
  };
}

function higherSeverityState(left, right) {
  const severity = {
    [FRESHNESS_STATES.REVIEW_PENDING]: 0,
    [FRESHNESS_STATES.CURRENT]: 1,
    [FRESHNESS_STATES.UPCOMING]: 2,
    [FRESHNESS_STATES.STALE]: 3,
    [FRESHNESS_STATES.EXPIRED]: 4,
  };

  return severity[left] >= severity[right] ? left : right;
}

function mergeActions(left, right) {
  const severity = {
    [FRESHNESS_ACTIONS.NONE]: 0,
    [FRESHNESS_ACTIONS.REVIEW]: 1,
    [FRESHNESS_ACTIONS.NOINDEX]: 2,
    [FRESHNESS_ACTIONS.BLOCK]: 3,
  };

  return severity[left] >= severity[right] ? left : right;
}

function mergeContentAndCitationState(contentState, citationState) {
  if (citationState === FRESHNESS_STATES.EXPIRED || citationState === FRESHNESS_STATES.STALE) {
    return citationState;
  }

  if (contentState === FRESHNESS_STATES.REVIEW_PENDING) {
    return FRESHNESS_STATES.REVIEW_PENDING;
  }

  if (citationState === FRESHNESS_STATES.UPCOMING && contentState === FRESHNESS_STATES.CURRENT) {
    return FRESHNESS_STATES.UPCOMING;
  }

  return higherSeverityState(contentState, citationState);
}

function buildCitationEntries({
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
} = {}) {
  return citationRegistry.map((citation) => {
    const freshness = citation.freshness || {};
    const dueDate = citation.reviewedDate ? addDays(citation.reviewedDate, freshness.reviewWindowDays || 0) : null;
    const derived = deriveState({
      reviewedDate: citation.reviewedDate,
      dueDate,
      expiresDate: citation.expiresDate,
      today,
      upcomingWindowDays,
    });

    return {
      id: citation.id,
      label: citation.title,
      type: 'citation',
      ownerRole: freshness.ownerRole || '',
      reviewerRole: freshness.reviewerRole || '',
      ownerState: freshness.ownerState || '',
      reviewerState: freshness.reviewerState || '',
      reviewedDate: citation.reviewedDate,
      dueDate,
      expiresDate: citation.expiresDate,
      reviewWindowDays: freshness.reviewWindowDays || null,
      reviewTriggers: freshness.reviewTriggers || [],
      state: derived.state,
      daysUntilDue: derived.daysUntilDue,
      action: actionForState({
        state: derived.state,
        staleAction: freshness.staleAction,
        expiredAction: freshness.expiredAction,
      }),
      allowedScopes: citation.allowedScopes.slice(),
      claimIds: citation.claimIds.slice(),
      citationType: citation.citationType,
      approvalStatus: citation.approvalStatus,
      sourceLabel: citation.sourceLabel,
      documentPath: citation.documentPath || null,
      url: citation.url || null,
    };
  });
}

function buildContentEntries({
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
  citations = null,
} = {}) {
  const citationEntries = citations || buildCitationEntries({ today, upcomingWindowDays });
  const citationsById = new Map(citationEntries.map((entry) => [entry.id, entry]));
  const routeById = new Map(routeManifest.routes.map((route) => [route.routeId, route]));

  return getAllContent().map((record) => {
    const freshness = record.freshness || {};
    const dueDate = record.reviewedDate ? addDays(record.reviewedDate, freshness.reviewWindowDays || 0) : null;
    const derived = deriveState({
      reviewedDate: record.reviewedDate,
      dueDate,
      today,
      upcomingWindowDays,
    });

    let worstCitationState = FRESHNESS_STATES.CURRENT;
    let citationAction = FRESHNESS_ACTIONS.NONE;
    for (const citationId of record.citationIds || []) {
      const citation = citationsById.get(citationId);
      if (!citation) continue;
      worstCitationState = higherSeverityState(worstCitationState, citation.state);
      citationAction = mergeActions(citationAction, citation.action);
    }

    const contentState = mergeContentAndCitationState(derived.state, worstCitationState);
    const contentAction = mergeActions(
      actionForState({
        state: derived.state,
        staleAction: freshness.staleAction,
        expiredAction: freshness.expiredAction,
      }),
      citationAction,
    );

    const route = routeById.get(record.routeId);
    const isCanonical = Boolean(route?.crawl?.canonical);

    return {
      id: record.id,
      label: record.title,
      routeId: record.routeId,
      path: route?.path || '',
      type: 'content',
      pageType: record.pageType,
      templateId: record.templateId,
      ownerRole: freshness.ownerRole || '',
      reviewerRole: freshness.reviewerRole || '',
      ownerState: freshness.ownerState || '',
      reviewerState: freshness.reviewerState || '',
      reviewedDate: record.reviewedDate,
      publishedDate: record.publishedDate,
      dueDate,
      daysUntilDue: derived.daysUntilDue,
      state: contentState,
      action: contentAction,
      reviewWindowDays: freshness.reviewWindowDays || null,
      reviewTriggers: freshness.reviewTriggers || [],
      citationIds: (record.citationIds || []).slice(),
      relatedClaimIds: (record.claimIds || []).slice(),
      currentFreshnessState: record.measurement?.freshnessState || '',
      canonical: isCanonical,
      indexable: Boolean(record.indexability?.indexable),
      policyNoindex: contentAction === FRESHNESS_ACTIONS.NOINDEX || contentAction === FRESHNESS_ACTIONS.BLOCK,
      policyBlocked: contentAction === FRESHNESS_ACTIONS.BLOCK,
    };
  });
}

function buildGovernanceEntries({
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
} = {}) {
  return GOVERNANCE_RECORDS.map((record) => {
    const dueDate = record.reviewedDate ? addDays(record.reviewedDate, record.reviewWindowDays) : null;
    const derived = deriveState({
      reviewedDate: record.reviewedDate,
      dueDate,
      today,
      upcomingWindowDays,
    });
    const file = fileStatus(record.path);

    return {
      ...record,
      dueDate,
      daysUntilDue: derived.daysUntilDue,
      state: derived.state,
      action: actionForState({
        state: derived.state,
        staleAction: record.staleAction,
        expiredAction: record.expiredAction,
      }),
      exists: file.exists,
    };
  });
}

function buildGeneratedAssetEntries({
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
} = {}) {
  return GENERATED_ASSET_RECORDS.map((record) => {
    const dueDate = record.reviewedDate ? addDays(record.reviewedDate, record.reviewWindowDays) : null;
    const derived = deriveState({
      reviewedDate: record.reviewedDate,
      dueDate,
      today,
      upcomingWindowDays,
    });
    const file = fileStatus(record.path);

    return {
      ...record,
      dueDate,
      daysUntilDue: derived.daysUntilDue,
      state: derived.state,
      action: actionForState({
        state: derived.state,
        staleAction: record.staleAction,
        expiredAction: record.expiredAction,
      }),
      exists: file.exists,
    };
  });
}

function summarizeBucket(entries) {
  return {
    total: entries.length,
    reviewPending: entries.filter((entry) => entry.state === FRESHNESS_STATES.REVIEW_PENDING).length,
    current: entries.filter((entry) => entry.state === FRESHNESS_STATES.CURRENT).length,
    upcoming: entries.filter((entry) => entry.state === FRESHNESS_STATES.UPCOMING).length,
    stale: entries.filter((entry) => entry.state === FRESHNESS_STATES.STALE).length,
    expired: entries.filter((entry) => entry.state === FRESHNESS_STATES.EXPIRED).length,
    noindex: entries.filter((entry) => entry.action === FRESHNESS_ACTIONS.NOINDEX).length,
    blocked: entries.filter((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK).length,
  };
}

export function getFreshnessReport({
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
} = {}) {
  const citations = buildCitationEntries({ today, upcomingWindowDays });
  const content = buildContentEntries({ today, upcomingWindowDays, citations });
  const governance = buildGovernanceEntries({ today, upcomingWindowDays });
  const generatedAssets = buildGeneratedAssetEntries({ today, upcomingWindowDays });

  const blockingEntries = [
    ...citations.filter((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK),
    ...content.filter((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK),
    ...governance.filter((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK),
    ...generatedAssets.filter((entry) => entry.action === FRESHNESS_ACTIONS.BLOCK),
  ];

  const noindexContent = content.filter((entry) => entry.action === FRESHNESS_ACTIONS.NOINDEX);

  return {
    generatedAt: `${today}T00:00:00Z`,
    today,
    upcomingWindowDays,
    content,
    citations,
    governance,
    generatedAssets,
    blockingEntries,
    noindexContent,
    summaries: {
      content: summarizeBucket(content),
      citations: summarizeBucket(citations),
      governance: summarizeBucket(governance),
      generatedAssets: summarizeBucket(generatedAssets),
    },
  };
}

export function getContentFreshnessByRouteId(routeId, options) {
  return getFreshnessReport(options).content.find((entry) => entry.routeId === routeId) || null;
}

export function getContentFreshnessByContentId(contentId, options) {
  return getFreshnessReport(options).content.find((entry) => entry.id === contentId) || null;
}

export function renderFreshnessMarkdown(report = getFreshnessReport()) {
  const lines = [
    '# Freshness Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Reference date: ${report.today}`,
    `- Upcoming review window: ${report.upcomingWindowDays} days`,
    '',
    '## Summary',
    '',
    '| Bucket | Total | Review pending | Current | Upcoming | Stale | Expired | Noindex | Blocked |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    `| Content | ${report.summaries.content.total} | ${report.summaries.content.reviewPending} | ${report.summaries.content.current} | ${report.summaries.content.upcoming} | ${report.summaries.content.stale} | ${report.summaries.content.expired} | ${report.summaries.content.noindex} | ${report.summaries.content.blocked} |`,
    `| Citations | ${report.summaries.citations.total} | ${report.summaries.citations.reviewPending} | ${report.summaries.citations.current} | ${report.summaries.citations.upcoming} | ${report.summaries.citations.stale} | ${report.summaries.citations.expired} | ${report.summaries.citations.noindex} | ${report.summaries.citations.blocked} |`,
    `| Governance | ${report.summaries.governance.total} | ${report.summaries.governance.reviewPending} | ${report.summaries.governance.current} | ${report.summaries.governance.upcoming} | ${report.summaries.governance.stale} | ${report.summaries.governance.expired} | ${report.summaries.governance.noindex} | ${report.summaries.governance.blocked} |`,
    `| Generated assets | ${report.summaries.generatedAssets.total} | ${report.summaries.generatedAssets.reviewPending} | ${report.summaries.generatedAssets.current} | ${report.summaries.generatedAssets.upcoming} | ${report.summaries.generatedAssets.stale} | ${report.summaries.generatedAssets.expired} | ${report.summaries.generatedAssets.noindex} | ${report.summaries.generatedAssets.blocked} |`,
    '',
    '## Blocking entries',
    '',
  ];

  if (!report.blockingEntries.length) {
    lines.push('- None');
  } else {
    report.blockingEntries.forEach((entry) => {
      lines.push(`- \`${entry.id}\` (${entry.type}) — state: \`${entry.state}\`, action: \`${entry.action}\``);
    });
  }

  lines.push('', '## Canonical content marked noindex by freshness policy', '');
  if (!report.noindexContent.length) {
    lines.push('- None');
  } else {
    report.noindexContent.forEach((entry) => {
      lines.push(`- \`${entry.routeId}\` ${entry.path} — state: \`${entry.state}\`, action: \`${entry.action}\``);
    });
  }

  return `${lines.join('\n')}\n`;
}

export function getClaimsRegisterReviewDate() {
  const text = readFileSync(path.join(repoRoot, 'docs/claims-register.md'), 'utf8');
  const matches = [...text.matchAll(/\|\s+`F44-[A-Z]+-\d+`\s+\|.*?\|\s+(\d{4}-\d{2}-\d{2})\s+\|/g)];
  if (!matches.length) return null;
  return matches.reduce((latest, match) => (match[1] > latest ? match[1] : latest), matches[0][1]);
}

export {
  DEFAULT_UPCOMING_WINDOW_DAYS,
  FRESHNESS_ACTIONS,
  FRESHNESS_STATES,
  FRESHNESS_TODAY,
  freshnessAnalyticsStateForRoute,
  routeIsFreshnessBlocked,
  routeIsFreshnessNoindexed,
};
