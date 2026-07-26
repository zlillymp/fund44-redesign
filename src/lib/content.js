import homePage from '../../content/pages/home.json' with { type: 'json' };
import financingPage from '../../content/pages/financing.json' with { type: 'json' };
import sba7aPage from '../../content/pages/sba-7a.json' with { type: 'json' };
import sba504Page from '../../content/pages/sba-504.json' with { type: 'json' };
import acquisitionPage from '../../content/pages/business-acquisition.json' with { type: 'json' };
import workingCapitalPage from '../../content/pages/working-capital.json' with { type: 'json' };
import resourcesPage from '../../content/pages/resources.json' with { type: 'json' };
import articleSba7aVs504 from '../../content/articles/sba-7a-vs-504.json' with { type: 'json' };
import articlePreparingDocuments from '../../content/articles/preparing-your-documents.json' with { type: 'json' };
import articleWorkingCapitalVsTermLoan from '../../content/articles/working-capital-vs-term-loan.json' with { type: 'json' };

const records = [
  homePage,
  financingPage,
  sba7aPage,
  sba504Page,
  acquisitionPage,
  workingCapitalPage,
  resourcesPage,
  articleSba7aVs504,
  articlePreparingDocuments,
  articleWorkingCapitalVsTermLoan,
];

const contentById = new Map(records.map((record) => [record.id, record]));
const contentByRouteId = new Map(records.map((record) => [record.routeId, record]));
const contentBySlug = new Map(records.map((record) => [record.slug, record]));

function ensureRecord(message, value) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function getAllContent() {
  return records.slice();
}

export function getContentById(id) {
  return ensureRecord(`Unknown content id: ${id}`, contentById.get(id));
}

export function getContentByRouteId(routeId) {
  return ensureRecord(`Unknown content route id: ${routeId}`, contentByRouteId.get(routeId));
}

export function getContentBySlug(slug) {
  return ensureRecord(`Unknown content slug: ${slug}`, contentBySlug.get(slug));
}

export function getProgramPages() {
  return records.filter((record) => record.templateId === 'product_page');
}

export function getResourceHub() {
  return getContentById('page_resources');
}

export function getArticles() {
  return records.filter((record) => record.templateId === 'editorial_article');
}

export function getArticleBySlug(slug) {
  return getContentBySlug(slug);
}
