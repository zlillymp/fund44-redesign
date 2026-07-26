import { scalableTemplateFieldRequirements } from './scalable-page-contract.mjs';

export const baseRequiredFields = [
  'id',
  'routeId',
  'slug',
  'pageType',
  'templateId',
  'title',
  'metaTitle',
  'metaDescription',
  'summary',
  'contentVersion',
  'hero',
  'quickAnswer',
  'whoItFits',
  'whenItMayNotFit',
  'typicalDocuments',
  'howFund44Fits',
  'commonQuestions',
  'relatedIds',
  'contributors',
  'freshness',
  'publishedDate',
  'reviewedDate',
  'claimIds',
  'claimReview',
  'citationIds',
  'disclosureIds',
  'indexability',
  'intent',
  'measurement',
];

export const templateRequiredFields = {
  home_page: [
    'heroProofItems',
    'problem',
    'network',
    'workflow',
    'status',
    'productCardIds',
    'ctaBanner',
  ],
  resources_hub: [
    'ctaBanner',
  ],
  editorial_article: [
    'category',
    'readTimeMinutes',
    'thumbKey',
    'bodyBlocks',
    'sectionDisclosureHtml',
    'ctaBanner',
  ],
  ...scalableTemplateFieldRequirements,
};

export const allowedFreshnessStates = new Set(['review_pending', 'current', 'upcoming_review', 'stale', 'expired']);
export const allowedAudienceStages = new Set(['entry', 'consideration', 'comparison', 'education']);
export const allowedFunnelRoles = new Set(['entry', 'consideration', 'assist']);
export const allowedBlockTypes = new Set(['paragraph', 'heading', 'list', 'blockquote']);
export const allowedFreshnessOwnerStates = new Set(['role_assigned_identity_tbd', 'named_approved']);
export const allowedFreshnessActions = new Set(['none', 'review', 'noindex', 'block']);
export const allowedEvidenceScopes = new Set([
  'marketplace_disclosure',
  'network_story',
  'routing_explanation',
  'workflow_availability',
  'preview_notice',
  'credit_disclosure',
  'product_overview',
  'program_detail',
  'educational_editorial',
  'document_guidance',
]);

export const externalEvidenceRequiredScopes = new Set([
  'product_overview',
  'program_detail',
  'educational_editorial',
  'document_guidance',
]);

export const allowedCitationTypes = new Set([
  'internal_approved',
  'external_primary',
  'external_reference',
]);

export const allowedInternalApprovalStatuses = new Set([
  'business_approved_draft',
  'preview_verified',
]);
