import { routeManifest } from '../content/manifest.mjs';
import { getAllContent } from '../src/lib/content.js';
import {
  allowedAudienceStages,
  allowedBlockTypes,
  allowedFreshnessStates,
  allowedFunnelRoles,
  baseRequiredFields,
  templateRequiredFields,
} from '../content/schema/content-model.mjs';

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

function validateQuickAnswer(record) {
  assert(record.quickAnswer?.term, `${record.id}: quickAnswer.term is required`);
  assert(record.quickAnswer?.definition, `${record.id}: quickAnswer.definition is required`);
}

function validateQuestionGroup(record) {
  assert(Array.isArray(record.commonQuestions), `${record.id}: commonQuestions must be an array`);
  record.commonQuestions.forEach((item, index) => {
    assert(item.id, `${record.id}: commonQuestions[${index}].id is required`);
    assert(item.question, `${record.id}: commonQuestions[${index}].question is required`);
    assert(item.answer, `${record.id}: commonQuestions[${index}].answer is required`);
  });
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
  assert(record.measurement?.routeFamily === route.routeFamily, `${record.id}: measurement.routeFamily must match route family`);
  assert(Array.isArray(record.measurement?.ctaIds) && record.measurement.ctaIds.length > 0, `${record.id}: measurement.ctaIds must be a non-empty array`);
  assert(record.measurement?.faqGroup, `${record.id}: measurement.faqGroup is required`);
  assert(allowedFreshnessStates.has(record.measurement?.freshnessState), `${record.id}: measurement.freshnessState is invalid`);
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

function validateRelationships(record) {
  assert(Array.isArray(record.relatedIds), `${record.id}: relatedIds must be an array`);
  record.relatedIds.forEach((relatedId) => {
    assert(contentById.has(relatedId), `${record.id}: related id "${relatedId}" does not exist`);
  });
  assert(Array.isArray(record.disclosureIds), `${record.id}: disclosureIds must be an array`);
  assert(Array.isArray(record.citationIds), `${record.id}: citationIds must be an array`);
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
  validateQuickAnswer(record);
  validateQuestionGroup(record);
  validateRelationships(record);
  validateBodyBlocks(record);

  if (route) {
    validateIndexability(record, route);
    validateMeasurement(record, route);
  }
});

if (errors.length > 0) {
  console.error('Structured content validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
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
