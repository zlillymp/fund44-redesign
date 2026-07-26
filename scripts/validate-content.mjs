import { routeManifest } from '../content/manifest.mjs';
import { getAllContent } from '../src/lib/content.js';
import {
  allowedAudienceStages,
  allowedEvidenceScopes,
  allowedBlockTypes,
  allowedFreshnessActions,
  allowedFreshnessOwnerStates,
  allowedFreshnessStates,
  allowedFunnelRoles,
  baseRequiredFields,
  templateRequiredFields,
} from '../content/schema/content-model.mjs';
import { getContentFreshnessByContentId } from '../src/lib/freshness.js';
import {
  getScalableTemplateContract,
  getScalableTemplateContracts,
  standardSectionKeys,
} from '../content/schema/scalable-page-contract.mjs';
import { validateLinkGraph } from '../src/lib/link-graph.js';

const routes = routeManifest.routes;
const routeById = new Map(routes.map((route) => [route.routeId, route]));
const routeByContentId = new Map(routes.filter((route) => route.contentId).map((route) => [route.contentId, route]));
const routeBySlug = new Map(routes.filter((route) => route.slug).map((route) => [route.slug, route]));
const contentRecords = getAllContent();
const contentById = new Map(contentRecords.map((record) => [record.id, record]));

const errors = [];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertRequired(record, fieldName) {
  if (!(fieldName in record)) {
    fail(`${record.id}: missing required field "${fieldName}"`);
  }
}

function validateContributors(record) {
  const { contributors } = record;
  assert(typeof contributors === 'object' && contributors !== null, `${record.id}: contributors must be an object`);
  assert(
    (contributors.authorId !== null && contributors.authorId !== undefined) || contributors.authorPlaceholder,
    `${record.id}: contributors.authorId or contributors.authorPlaceholder is required`
  );
  assert(
    (contributors.reviewerId !== null && contributors.reviewerId !== undefined) || contributors.reviewerPlaceholder,
    `${record.id}: contributors.reviewerId or contributors.reviewerPlaceholder is required`
  );
}

function validateFreshness(record) {
  const { freshness } = record;
  assert(typeof freshness === 'object' && freshness !== null, `${record.id}: freshness must be an object`);
  assert(typeof freshness.reviewWindowDays === 'number' && freshness.reviewWindowDays > 0, `${record.id}: freshness.reviewWindowDays must be a positive number`);
  assert(Array.isArray(freshness.reviewTriggers), `${record.id}: freshness.reviewTriggers must be an array`);
  assert(freshness.reviewTriggers.length > 0, `${record.id}: freshness.reviewTriggers must include at least one trigger`);
  assert(typeof freshness.ownerRole === 'string' && freshness.ownerRole.length > 0, `${record.id}: freshness.ownerRole is required`);
  assert(typeof freshness.reviewerRole === 'string' && freshness.reviewerRole.length > 0, `${record.id}: freshness.reviewerRole is required`);
  assert(allowedFreshnessOwnerStates.has(freshness.ownerState), `${record.id}: freshness.ownerState is invalid`);
  assert(allowedFreshnessOwnerStates.has(freshness.reviewerState), `${record.id}: freshness.reviewerState is invalid`);
  assert(allowedFreshnessActions.has(freshness.staleAction), `${record.id}: freshness.staleAction is invalid`);
  assert(allowedFreshnessActions.has(freshness.expiredAction), `${record.id}: freshness.expiredAction is invalid`);
}

function validateQuickAnswer(record) {
  assert(record.quickAnswer?.term, `${record.id}: quickAnswer.term is required`);
  assert(record.quickAnswer?.definition, `${record.id}: quickAnswer.definition is required`);
}

function validateListSection(record, key) {
  const section = record[key];
  assert(typeof section === 'object' && section !== null, `${record.id}: ${key} must be an object`);
  assert(section?.heading, `${record.id}: ${key}.heading is required`);
  assert(Array.isArray(section?.items), `${record.id}: ${key}.items must be an array`);
  assert(section.items.length > 0, `${record.id}: ${key}.items must include at least one item`);
}

function validateHowFund44Fits(record) {
  const section = record.howFund44Fits;
  assert(typeof section === 'object' && section !== null, `${record.id}: howFund44Fits must be an object`);
  assert(section?.heading, `${record.id}: howFund44Fits.heading is required`);
  assert(section?.summary, `${record.id}: howFund44Fits.summary is required`);
  assert(Array.isArray(section?.bullets), `${record.id}: howFund44Fits.bullets must be an array`);
  assert(section.bullets.length > 0, `${record.id}: howFund44Fits.bullets must include at least one item`);
}

function validateQuestionGroup(record) {
  assert(Array.isArray(record.commonQuestions), `${record.id}: commonQuestions must be an array`);
  record.commonQuestions.forEach((item, index) => {
    assert(item.id, `${record.id}: commonQuestions[${index}].id is required`);
    assert(item.question, `${record.id}: commonQuestions[${index}].question is required`);
    assert(item.answer, `${record.id}: commonQuestions[${index}].answer is required`);
  });
}

function validateRouteCardGroup(record, fieldName) {
  const items = record[fieldName];
  assert(Array.isArray(items), `${record.id}: ${fieldName} must be an array`);
  assert(items.length > 0, `${record.id}: ${fieldName} must include at least one item`);

  const seenRouteIds = new Set();
  items.forEach((item, index) => {
    assert(item?.routeId, `${record.id}: ${fieldName}[${index}].routeId is required`);
    assert(routeById.has(item.routeId), `${record.id}: ${fieldName}[${index}] route "${item.routeId}" does not exist`);
    assert(item.routeId !== record.routeId, `${record.id}: ${fieldName}[${index}] must not point back to the current route`);
    assert(item?.title, `${record.id}: ${fieldName}[${index}].title is required`);
    assert(item?.description, `${record.id}: ${fieldName}[${index}].description is required`);
    assert(item?.iconKey, `${record.id}: ${fieldName}[${index}].iconKey is required`);
    assert(!seenRouteIds.has(item.routeId), `${record.id}: duplicate ${fieldName} route "${item.routeId}"`);
    seenRouteIds.add(item.routeId);
  });
}

function validateFeatureCardGroup(record, fieldName) {
  const items = record[fieldName];
  assert(Array.isArray(items), `${record.id}: ${fieldName} must be an array`);
  assert(items.length > 0, `${record.id}: ${fieldName} must include at least one item`);

  const seenIds = new Set();
  items.forEach((item, index) => {
    assert(item?.id, `${record.id}: ${fieldName}[${index}].id is required`);
    assert(typeof item?.title === 'string' && item.title.length > 0, `${record.id}: ${fieldName}[${index}].title is required`);
    assert(typeof item?.description === 'string' && item.description.length > 0, `${record.id}: ${fieldName}[${index}].description is required`);
    assert(item?.iconKey, `${record.id}: ${fieldName}[${index}].iconKey is required`);
    assert(!seenIds.has(item.id), `${record.id}: duplicate ${fieldName} id "${item.id}"`);
    seenIds.add(item.id);
  });
}

function validateStateSupportCardGroup(record, fieldName) {
  const items = record[fieldName];
  assert(Array.isArray(items), `${record.id}: ${fieldName} must be an array`);
  assert(items.length >= 3, `${record.id}: ${fieldName} must include at least three items`);

  const seenIds = new Set();
  items.forEach((item, index) => {
    assert(item?.id, `${record.id}: ${fieldName}[${index}].id is required`);
    assert(typeof item?.title === 'string' && item.title.length > 0, `${record.id}: ${fieldName}[${index}].title is required`);
    assert(typeof item?.description === 'string' && item.description.length > 0, `${record.id}: ${fieldName}[${index}].description is required`);
    assert(typeof item?.resourceLabel === 'string' && item.resourceLabel.length > 0, `${record.id}: ${fieldName}[${index}].resourceLabel is required`);
    assert(typeof item?.resourceUrl === 'string' && item.resourceUrl.startsWith('https://'), `${record.id}: ${fieldName}[${index}].resourceUrl must be an https URL`);
    assert(item?.iconKey, `${record.id}: ${fieldName}[${index}].iconKey is required`);
    if ('relatedRouteId' in item && item.relatedRouteId !== null && item.relatedRouteId !== undefined && item.relatedRouteId !== '') {
      assert(routeById.has(item.relatedRouteId), `${record.id}: ${fieldName}[${index}] relatedRouteId "${item.relatedRouteId}" does not exist`);
      assert(item.relatedRouteId !== record.routeId, `${record.id}: ${fieldName}[${index}] relatedRouteId must not point back to the current route`);
    }
    assert(!seenIds.has(item.id), `${record.id}: duplicate ${fieldName} id "${item.id}"`);
    seenIds.add(item.id);
  });
}

function validateStateContextCardGroup(record, fieldName) {
  const items = record[fieldName];
  assert(Array.isArray(items), `${record.id}: ${fieldName} must be an array`);
  assert(items.length >= 3, `${record.id}: ${fieldName} must include at least three items`);

  const seenIds = new Set();
  items.forEach((item, index) => {
    assert(item?.id, `${record.id}: ${fieldName}[${index}].id is required`);
    assert(typeof item?.title === 'string' && item.title.length > 0, `${record.id}: ${fieldName}[${index}].title is required`);
    assert(typeof item?.description === 'string' && item.description.length > 0, `${record.id}: ${fieldName}[${index}].description is required`);
    assert(item?.iconKey, `${record.id}: ${fieldName}[${index}].iconKey is required`);
    if ('relatedRouteId' in item && item.relatedRouteId !== null && item.relatedRouteId !== undefined && item.relatedRouteId !== '') {
      assert(routeById.has(item.relatedRouteId), `${record.id}: ${fieldName}[${index}] relatedRouteId "${item.relatedRouteId}" does not exist`);
      assert(item.relatedRouteId !== record.routeId, `${record.id}: ${fieldName}[${index}] relatedRouteId must not point back to the current route`);
    }
    assert(!seenIds.has(item.id), `${record.id}: duplicate ${fieldName} id "${item.id}"`);
    seenIds.add(item.id);
  });
}

function validateClaimReview(record) {
  assert(Array.isArray(record.claimIds), `${record.id}: claimIds must be an array`);
  const claimIds = new Set();
  record.claimIds.forEach((claimId, index) => {
    assert(typeof claimId === 'string' && claimId.length > 0, `${record.id}: claimIds[${index}] must be a non-empty string`);
    assert(!claimIds.has(claimId), `${record.id}: duplicate claim id "${claimId}"`);
    claimIds.add(claimId);
  });

  assert(typeof record.claimReview === 'object' && record.claimReview !== null, `${record.id}: claimReview must be an object`);
  assert(typeof record.claimReview?.requiresEvidence === 'boolean', `${record.id}: claimReview.requiresEvidence must be boolean`);
  assert(Array.isArray(record.claimReview?.evidenceScopes), `${record.id}: claimReview.evidenceScopes must be an array`);

  const evidenceScopes = new Set();
  record.claimReview.evidenceScopes.forEach((scope, index) => {
    assert(allowedEvidenceScopes.has(scope), `${record.id}: claimReview.evidenceScopes[${index}] has invalid scope "${scope}"`);
    assert(!evidenceScopes.has(scope), `${record.id}: duplicate evidence scope "${scope}"`);
    evidenceScopes.add(scope);
  });

  if (record.claimIds.length > 0) {
    assert(record.claimReview.requiresEvidence, `${record.id}: claim-bearing records must set claimReview.requiresEvidence to true`);
    assert(record.claimReview.evidenceScopes.length > 0, `${record.id}: claim-bearing records must declare at least one evidence scope`);
  }
}

function validateIndexability(record, route) {
  const keys = ['canonical', 'indexable', 'sitemap', 'llms', 'landing'];
  keys.forEach((key) => {
    assert(typeof record.indexability?.[key] === 'boolean', `${record.id}: indexability.${key} must be boolean`);
    assert(record.indexability?.[key] === Boolean(route.crawl?.[key]), `${record.id}: indexability.${key} must match route manifest`);
  });
  if (record.pageType === 'article' && record.templateId === 'editorial_article') {
    assert(record.indexability.llms === false, `${record.id}: editorial article llms flag must remain false to match current route policy`);
  }
}

function validateMeasurement(record, route) {
  const freshness = getContentFreshnessByContentId(record.id);
  assert(record.measurement?.routeFamily === route.routeFamily, `${record.id}: measurement.routeFamily must match route family`);
  assert(Array.isArray(record.measurement?.ctaIds) && record.measurement.ctaIds.length > 0, `${record.id}: measurement.ctaIds must be a non-empty array`);
  assert(record.measurement?.faqGroup, `${record.id}: measurement.faqGroup is required`);
  assert(allowedFreshnessStates.has(record.measurement?.freshnessState), `${record.id}: measurement.freshnessState is invalid`);
  assert(record.measurement?.freshnessState === freshness?.state, `${record.id}: measurement.freshnessState must match derived freshness state`);
  assert(allowedAudienceStages.has(record.intent?.audienceStage), `${record.id}: intent.audienceStage is invalid`);
  assert(allowedFunnelRoles.has(record.intent?.funnelRole), `${record.id}: intent.funnelRole is invalid`);
  assert(record.intent?.contentGroup, `${record.id}: intent.contentGroup is required`);
  assert(record.intent?.primaryTopic, `${record.id}: intent.primaryTopic is required`);
}

function validateBodyBlocks(record) {
  if (record.templateId !== 'editorial_article') return;
  assert(Array.isArray(record.bodyBlocks) && record.bodyBlocks.length > 0, `${record.id}: bodyBlocks must be a non-empty array`);
  record.bodyBlocks.forEach((block, index) => {
    assert(allowedBlockTypes.has(block.type), `${record.id}: bodyBlocks[${index}] has invalid type "${block.type}"`);
    if (block.type === 'heading') {
      assert(Number.isInteger(block.level), `${record.id}: bodyBlocks[${index}].level must be an integer`);
      assert(block.text, `${record.id}: bodyBlocks[${index}].text is required`);
    } else {
      assert(block.html, `${record.id}: bodyBlocks[${index}].html is required`);
    }
  });
}

function validateTemplateSpecific(record) {
  const required = templateRequiredFields[record.templateId] || [];
  required.forEach((fieldName) => assertRequired(record, fieldName));
}

function validateScalableTemplateContract(record, route) {
  const contract = getScalableTemplateContract(record.templateId);
  if (!contract) return;

  assert(record.pageType === contract.pageType, `${record.id}: pageType must match scalable template contract for ${record.templateId}`);
  assert(contract.routeFamilies.includes(route.routeFamily), `${record.id}: route family "${route.routeFamily}" is not allowed for scalable template ${record.templateId}`);

  standardSectionKeys.forEach((sectionKey) => assertRequired(record, sectionKey));
  validateListSection(record, 'whoItFits');
  validateListSection(record, 'whenItMayNotFit');
  validateListSection(record, 'typicalDocuments');
  validateHowFund44Fits(record);

  assert(record.sectionDisclosureHtml, `${record.id}: sectionDisclosureHtml is required for scalable template ${record.templateId}`);
  assert(Array.isArray(record.disclosureIds) && record.disclosureIds.length > 0, `${record.id}: disclosureIds must include at least one disclosure for scalable templates`);
  assert(Array.isArray(record.citationIds) && record.citationIds.length > 0, `${record.id}: citationIds must include at least one citation for scalable templates`);

  if (record.templateId === 'use_case_page') {
    validateRouteCardGroup(record, 'bestFitProducts');
    validateRouteCardGroup(record, 'alternativePaths');
  }

  if (record.templateId === 'industry_page') {
    assert(record.shortLabel, `${record.id}: shortLabel is required for industry pages`);
    assert(record.whoItFitsHeading, `${record.id}: whoItFitsHeading is required for industry pages`);
    assert(record.bestFitHeading, `${record.id}: bestFitHeading is required for industry pages`);
    assert(record.industryFocusHeading, `${record.id}: industryFocusHeading is required for industry pages`);
    validateRouteCardGroup(record, 'bestFitProducts');
    validateFeatureCardGroup(record, 'underwritingFocusCards');
    validateRouteCardGroup(record, 'alternativePaths');
  }

  if (record.templateId === 'state_page') {
    assert(record.shortLabel, `${record.id}: shortLabel is required for state pages`);
    assert(record.stateCode, `${record.id}: stateCode is required for state pages`);
    assert(record.whoItFitsHeading, `${record.id}: whoItFitsHeading is required for state pages`);
    assert(record.bestFitHeading, `${record.id}: bestFitHeading is required for state pages`);
    assert(record.stateSupportHeading, `${record.id}: stateSupportHeading is required for state pages`);
    assert(record.stateContextHeading, `${record.id}: stateContextHeading is required for state pages`);
    assert(record.alternativePathsHeading, `${record.id}: alternativePathsHeading is required for state pages`);
    validateRouteCardGroup(record, 'bestFitProducts');
    validateStateSupportCardGroup(record, 'stateSupportCards');
    validateStateContextCardGroup(record, 'stateContextCards');
    validateRouteCardGroup(record, 'alternativePaths');
  }
}

function validateRelationships(record) {
  assert(Array.isArray(record.relatedIds), `${record.id}: relatedIds must be an array`);
  record.relatedIds.forEach((relatedId) => {
    assert(contentById.has(relatedId), `${record.id}: related id "${relatedId}" does not exist`);
  });
  if (Array.isArray(record.productCardIds)) {
    record.productCardIds.forEach((contentId) => {
      assert(contentById.has(contentId), `${record.id}: product card id "${contentId}" does not exist`);
    });
  }
  if (Array.isArray(record.articleIds)) {
    record.articleIds.forEach((contentId) => {
      assert(contentById.has(contentId), `${record.id}: article id "${contentId}" does not exist`);
    });
  }
  if (Array.isArray(record.matrixRows)) {
    record.matrixRows.forEach((row, index) => {
      assert(routeById.has(row.destinationRouteId), `${record.id}: matrixRows[${index}] destinationRouteId "${row.destinationRouteId}" does not exist`);
    });
  }
  if (Array.isArray(record.decisionCards)) {
    record.decisionCards.forEach((card, index) => {
      assert(routeById.has(card.destinationRouteId), `${record.id}: decisionCards[${index}] destinationRouteId "${card.destinationRouteId}" does not exist`);
    });
  }
  assert(Array.isArray(record.disclosureIds), `${record.id}: disclosureIds must be an array`);
  assert(Array.isArray(record.citationIds), `${record.id}: citationIds must be an array`);
  const citationIds = new Set();
  record.citationIds.forEach((citationId, index) => {
    assert(typeof citationId === 'string' && citationId.length > 0, `${record.id}: citationIds[${index}] must be a non-empty string`);
    assert(!citationIds.has(citationId), `${record.id}: duplicate citation id "${citationId}"`);
    citationIds.add(citationId);
  });
}

function validateRouteBinding(record) {
  const route = routeById.get(record.routeId);
  assert(route, `${record.id}: route "${record.routeId}" not found in manifest`);
  if (!route) return null;

  assert(route.contentId === record.id, `${record.id}: manifest contentId mismatch for route "${record.routeId}"`);
  assert(route.pageType === record.pageType, `${record.id}: pageType must match route manifest`);
  assert(route.templateId === record.templateId, `${record.id}: templateId must match route manifest`);

  if (route.slug) {
    assert(route.slug === record.slug, `${record.id}: slug must match route manifest slug`);
  } else {
    const expectedSlug = route.path === '/' ? 'home' : route.path.slice(1);
    assert(record.slug === expectedSlug, `${record.id}: slug must align to route path "${route.path}"`);
  }

  return route;
}

const seenIds = new Set();
const seenSlugs = new Set();

contentRecords.forEach((record) => {
  baseRequiredFields.forEach((fieldName) => assertRequired(record, fieldName));

  if (seenIds.has(record.id)) fail(`Duplicate content id "${record.id}"`);
  seenIds.add(record.id);

  if (seenSlugs.has(record.slug)) fail(`Duplicate content slug "${record.slug}"`);
  seenSlugs.add(record.slug);

  const route = validateRouteBinding(record);
  validateTemplateSpecific(record);
  validateContributors(record);
  validateFreshness(record);
  validateQuickAnswer(record);
  validateQuestionGroup(record);
  validateClaimReview(record);
  validateRelationships(record);
  validateBodyBlocks(record);

  if (route) {
    validateScalableTemplateContract(record, route);
    validateIndexability(record, route);
    validateMeasurement(record, route);
  }
});

const scalableContracts = getScalableTemplateContracts();
const scalableTemplateIds = new Set(scalableContracts.map((contract) => contract.templateId));

['financing_hub', 'product_page', 'use_case_page', 'industry_page', 'state_page'].forEach((templateId) => {
  assert(scalableTemplateIds.has(templateId), `Missing scalable template contract for ${templateId}`);
});

if (errors.length > 0) {
  console.error('Structured content validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const linkGraphValidation = validateLinkGraph();
if (linkGraphValidation.errors.length > 0) {
  console.error('Structured content validation failed:\n');
  linkGraphValidation.errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const inventory = contentRecords.map((record) => ({
  id: record.id,
  routeId: record.routeId,
  slug: record.slug,
  pageType: record.pageType,
  templateId: record.templateId,
  indexable: record.indexability.indexable,
  contentGroup: record.intent.contentGroup,
}));

console.log('Structured content validation passed.');
console.table(inventory);
