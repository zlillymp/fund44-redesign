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
  'publishedDate',
  'reviewedDate',
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
  financing_hub: [
    'matrixRows',
    'decisionCards',
    'ctaBanner',
  ],
  resources_hub: [
    'ctaBanner',
  ],
  product_page: [
    'shortLabel',
    'glanceSpecs',
    'whoItFitsHeading',
    'eligibilityHeading',
    'eligibilityCards',
    'sectionDisclosureHtml',
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
};

export const allowedFreshnessStates = new Set(['review_pending', 'published', 'reviewed']);
export const allowedAudienceStages = new Set(['entry', 'consideration', 'comparison', 'education']);
export const allowedFunnelRoles = new Set(['entry', 'consideration', 'assist']);
export const allowedBlockTypes = new Set(['paragraph', 'heading', 'list', 'blockquote']);
