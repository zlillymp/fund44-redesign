export const standardSectionKeys = [
  'quickAnswer',
  'whoItFits',
  'whenItMayNotFit',
  'typicalDocuments',
  'howFund44Fits',
  'commonQuestions',
];

export const scalableEvidenceFieldKeys = [
  'claimIds',
  'claimReview',
  'citationIds',
  'disclosureIds',
  'intent',
  'measurement',
  'indexability',
];

export const scalableTemplateFieldRequirements = {
  financing_hub: [
    'matrixRows',
    'decisionCards',
    'sectionDisclosureHtml',
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
  use_case_page: [
    'sectionDisclosureHtml',
    'ctaBanner',
  ],
  industry_page: [
    'sectionDisclosureHtml',
    'ctaBanner',
  ],
  state_page: [
    'sectionDisclosureHtml',
    'ctaBanner',
  ],
};

export const scalableTemplateContracts = [
  {
    templateId: 'financing_hub',
    pageType: 'financing_hub',
    routeFamilies: ['financing_hub'],
    clusterId: 'national_financing',
    launchTask: 'F44-CONT-02',
    currentRouteIds: ['financing'],
    standardSections: standardSectionKeys,
    requiredFields: scalableTemplateFieldRequirements.financing_hub,
    evidenceFields: scalableEvidenceFieldKeys,
    notes: 'National financing overview and comparison hubs use the standard section set plus comparison matrix, decision cards, disclosure copy, and a CTA banner.',
  },
  {
    templateId: 'product_page',
    pageType: 'program_page',
    routeFamilies: ['financing_program'],
    clusterId: 'national_financing',
    launchTask: 'F44-CONT-02',
    currentRouteIds: ['sba_7a', 'sba_504', 'business_acquisition', 'working_capital'],
    standardSections: standardSectionKeys,
    requiredFields: scalableTemplateFieldRequirements.product_page,
    evidenceFields: scalableEvidenceFieldKeys,
    notes: 'Program pages cover SBA and other national financing paths and must carry the standard section set alongside at-a-glance specs, eligibility cards, disclosure copy, and a CTA banner.',
  },
  {
    templateId: 'use_case_page',
    pageType: 'use_case',
    routeFamilies: ['use_case'],
    clusterId: 'use_case',
    launchTask: 'F44-CONT-03',
    currentRouteIds: [],
    standardSections: standardSectionKeys,
    requiredFields: scalableTemplateFieldRequirements.use_case_page,
    evidenceFields: scalableEvidenceFieldKeys,
    notes: 'Use-case pages reuse the same section contract once approved intents are added to the manifest.',
  },
  {
    templateId: 'industry_page',
    pageType: 'industry',
    routeFamilies: ['industry'],
    clusterId: 'industry',
    launchTask: 'F44-CONT-04',
    currentRouteIds: [],
    standardSections: standardSectionKeys,
    requiredFields: scalableTemplateFieldRequirements.industry_page,
    evidenceFields: scalableEvidenceFieldKeys,
    notes: 'Industry pages reuse the same section contract once approved industry intents are launched.',
  },
  {
    templateId: 'state_page',
    pageType: 'state',
    routeFamilies: ['state'],
    clusterId: 'state',
    launchTask: 'F44-CONT-05',
    currentRouteIds: [],
    standardSections: standardSectionKeys,
    requiredFields: scalableTemplateFieldRequirements.state_page,
    evidenceFields: scalableEvidenceFieldKeys,
    notes: 'State pages reuse the same section contract while layering only evidence-backed state specifics in later tasks.',
  },
];

const contractByTemplateId = new Map(
  scalableTemplateContracts.map((contract) => [contract.templateId, contract]),
);

export function getScalableTemplateContract(templateId) {
  return contractByTemplateId.get(templateId) || null;
}

export function getScalableTemplateContracts() {
  return scalableTemplateContracts.slice();
}

export function isScalableTemplate(templateId) {
  return contractByTemplateId.has(templateId);
}
