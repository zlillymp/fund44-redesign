import { absoluteUrlForPath } from './routes.js';
import { routeIsFreshnessBlocked, routeIsFreshnessNoindexed } from './freshness-runtime.js';

const LEGAL_ENV = (globalThis?.__FUND44_LEGAL_ENV__ || import.meta.env?.VITE_FUND44_ENV || import.meta.env?.MODE || 'staging').toLowerCase();
const PRODUCTION_INDEXING_APPROVED = String(
  globalThis?.__FUND44_PRODUCTION_INDEXING_APPROVED__
  ?? import.meta.env?.VITE_FUND44_PRODUCTION_INDEXING_APPROVED
  ?? 'false'
).toLowerCase() === 'true';

export const legalEnv = LEGAL_ENV === 'production' ? 'production' : 'staging';
export const isProductionLegalEnv = legalEnv === 'production';
export const productionIndexingApproved = PRODUCTION_INDEXING_APPROVED;

export const indexingPolicy = {
  env: legalEnv,
  productionIndexingApproved,
  allowIndexing: Boolean(isProductionLegalEnv && productionIndexingApproved),
  metaRobots: isProductionLegalEnv && productionIndexingApproved ? 'index,follow' : 'noindex,nofollow',
  xRobots: isProductionLegalEnv && productionIndexingApproved ? 'index,follow' : 'noindex, nofollow',
  note: isProductionLegalEnv && productionIndexingApproved
    ? 'Production indexing is enabled because the legal launch gate has been approved.'
    : isProductionLegalEnv
      ? 'Production indexing remains off until final legal, privacy, consent, and entity approvals are complete, so robots metadata stays noindex.'
      : 'Staging and preview remain non-indexable until final legal, SEO, and launch approvals are complete.',
};

const verifiedEntity = {
  legalBusinessName: 'Fund44 LLC',
  mailingAddress: '5900 Balcones Dr, Suite 100, Austin, TX 78731',
  supportEmail: 'support@fund44.com',
  supportPhone: '512-547-1547',
  sameAs: [],
};

export const entityProfile = {
  brandName: 'Fund44',
  siteUrl: absoluteUrlForPath('/'),
  legalBusinessName: verifiedEntity.legalBusinessName,
  mailingAddress: verifiedEntity.mailingAddress,
  supportEmail: verifiedEntity.supportEmail,
  supportPhone: verifiedEntity.supportPhone,
  sameAs: verifiedEntity.sameAs,
  hasVerifiedIdentity: Boolean(
    verifiedEntity.legalBusinessName
    && verifiedEntity.mailingAddress
    && verifiedEntity.supportEmail
    && verifiedEntity.supportPhone
  ),
  hasVerifiedSameAs: verifiedEntity.sameAs.length > 0,
};

export const unresolvedIdentityLabels = {
  legalBusinessName: 'Legal business name',
  mailingAddress: 'Mailing address',
  supportEmail: 'Support email',
  supportPhone: 'Support phone',
};

export const unresolvedIdentityFields = Object.entries(unresolvedIdentityLabels)
  .filter(([key]) => !entityProfile[key])
  .map(([key, label]) => ({ key, label }));

export function placeholderValueFor(fieldKey) {
  switch (fieldKey) {
    case 'supportEmail':
      return '[support email pending verification]';
    case 'supportPhone':
      return '[support phone pending verification]';
    case 'mailingAddress':
      return '[mailing address pending verification]';
    case 'legalBusinessName':
      return '[legal business name pending verification]';
    default:
      return '[pending verification]';
  }
}

export function describeIdentityStatus(fieldKey) {
  const label = unresolvedIdentityLabels[fieldKey] || 'Identity field';
  return `${label} is still being verified and is intentionally withheld until it is confirmed.`;
}

export function identityDisplay(fieldKey) {
  const value = entityProfile[fieldKey];
  return {
    fieldKey,
    label: unresolvedIdentityLabels[fieldKey] || fieldKey,
    value: value || placeholderValueFor(fieldKey),
    verified: Boolean(value),
    status: value ? 'verified' : 'tbd',
    note: value ? `${unresolvedIdentityLabels[fieldKey] || fieldKey} is verified.` : describeIdentityStatus(fieldKey),
  };
}

export const disclosures = {
  marketplacePreview:
    'Fund44 is a small-business capital marketplace. Fund44 is not a lender or a bank. Financing is offered by third-party providers, and eligibility, availability, rates, and terms are determined by those providers.',
  noGuarantees:
    'Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount.',
  creditPreview:
    'Checking the preview uses information that does not affect your credit score because the current preview does not submit an application to a lender.',
  educational:
    'This content is general and educational in nature. It is not financial, legal, or tax advice. Program rules, eligibility, and provider requirements can change.',
  illustrative:
    'Illustrative example for demonstration only. Any paths, structures, amounts, fit scores, or timelines shown here are sample interface data and are not an offer, approval, or lender decision.',
  previewFlow:
    'Preview only. This flow shows sample results, does not create an application, and does not send your information to a lender or server in the current build.',
  previewPrivacy:
    'In the current preview, the information you enter stays in your browser and is used only to personalize the on-screen demo result.',
  networkStory:
    'Fund44 launched with 44 lenders. That number is behind the name and remains the operating sweet spot for the network. Today Fund44 curates a network that typically fluctuates between 40 and 50 lenders as it removes providers that fall short of its customer-service standards and adds providers that offer competitive terms, better tools, or new financing options. The network can change over time, and the paths shown in the experience may vary by business profile, financing need, geography, and current provider participation.',
  fitOverFees:
    'Fund44 is built around fit over fees. The experience explains why a path may fit based on the information provided, the stated financing need, and the product details available in the experience.',
  fasterProcess:
    'Fund44 is designed for a faster process, with routing explanations, one document checklist, document reuse where supported in the workflow, status tracking, and offer comparison when those steps are available in the experience. Exact timing, available paths, and workflow details can vary by provider and by business profile.',
  contactPlaceholder:
    'Fund44 LLC is the verified legal business name. Contact details and privacy policy guidelines are published on this site.',
  counselReview:
    'Business approved the conservative disclosure drafts currently used on this site. Formal counsel review is still recommended before broad production launch.',
};

export const liveEligibilityGate = {
  enabled: true,
  /** When false, the public eligibility modal hides Live application and starts in preview. */
  showModeChoice: false,
  leadWebhookUrl: 'https://n8n-latest-9uei.onrender.com/webhook/lead',
  applicationWebhookUrl: 'https://n8n-latest-9uei.onrender.com/webhook/application',
  summary:
    'Live application mode is enabled. Contact details are submitted to the Fund44 intake workflow after consent review.',
  missingInputs: [],
};

export const liveDisclosuresBlocked = {
  privacyConsent:
    'Mock privacy policy and consent guidelines are published. Final counsel sign-off will occur prior to production launch.',
  sameAs:
    'Verified sameAs entries are not available yet. The site must omit sameAs rather than invent or infer profiles.',
  liveEligibility:
    'Live application is enabled. Contact details are submitted to the Fund44 intake workflow for follow-up.',
};

export const legalApprovalChecklist = [
  {
    area: 'Identity',
    status: entityProfile.hasVerifiedIdentity ? 'verified' : 'blocked',
    detail: entityProfile.hasVerifiedIdentity
      ? 'Verified legal business identity and support details are configured.'
      : 'Legal business name, mailing address, support email, and support phone are still TBD and intentionally withheld.',
  },
  {
    area: 'Indexing',
    status: indexingPolicy.allowIndexing ? 'production-only' : 'staging-noindex',
    detail: indexingPolicy.note,
  },
  {
    area: 'sameAs',
    status: entityProfile.hasVerifiedSameAs ? 'verified' : 'blocked',
    detail: entityProfile.hasVerifiedSameAs
      ? 'Verified sameAs references are configured.'
      : liveDisclosuresBlocked.sameAs,
  },
  {
    area: 'Privacy and consent',
    status: 'approved-mock',
    detail: 'Comprehensive mock privacy policy, terms of service, and intake consent policies are published for staging and evaluation.',
  },
  {
    area: 'Security',
    status: 'in-progress',
    detail: 'Security headers and deployment controls are being configured for staging.',
  },
];

export function allowIndexingForRoute(route) {
  if (!route) return false;
  if (routeIsFreshnessBlocked(route.routeId) || routeIsFreshnessNoindexed(route.routeId)) {
    return false;
  }
  return Boolean(indexingPolicy.allowIndexing && route?.crawl?.indexable);
}

export function robotsForRoute(route) {
  return allowIndexingForRoute(route) ? 'index,follow' : 'noindex,nofollow';
}

export function humanReadableIndexingMode() {
  if (indexingPolicy.allowIndexing) {
    return 'production-indexable';
  }

  return indexingPolicy.env === 'production' ? 'production-noindex-blocked' : 'staging-noindex';
}
