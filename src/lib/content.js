import homePage from '../../content/pages/home.json' with { type: 'json' };
import financingPage from '../../content/pages/financing.json' with { type: 'json' };
import sba7aPage from '../../content/pages/sba-7a.json' with { type: 'json' };
import sba504Page from '../../content/pages/sba-504.json' with { type: 'json' };
import acquisitionPage from '../../content/pages/business-acquisition.json' with { type: 'json' };
import workingCapitalPage from '../../content/pages/working-capital.json' with { type: 'json' };
import termLoanPage from '../../content/financing/term-loan.json' with { type: 'json' };
import lineOfCreditPage from '../../content/financing/line-of-credit.json' with { type: 'json' };
import equipmentFinancingPage from '../../content/financing/equipment-financing.json' with { type: 'json' };
import buyBusinessUseCase from '../../content/use-cases/buy-a-business.json' with { type: 'json' };
import ownerOccupiedRealEstateUseCase from '../../content/use-cases/owner-occupied-real-estate.json' with { type: 'json' };
import cashFlowNeedsUseCase from '../../content/use-cases/cash-flow-needs.json' with { type: 'json' };
import equipmentPurchaseUseCase from '../../content/use-cases/equipment-purchase.json' with { type: 'json' };
import businessExpansionUseCase from '../../content/use-cases/business-expansion.json' with { type: 'json' };
import refinanceBusinessDebtUseCase from '../../content/use-cases/refinance-business-debt.json' with { type: 'json' };
import franchiseBusinessesIndustry from '../../content/industries/franchise-businesses.json' with { type: 'json' };
import truckingCompaniesIndustry from '../../content/industries/trucking-companies.json' with { type: 'json' };
import constructionContractorsIndustry from '../../content/industries/construction-contractors.json' with { type: 'json' };
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
  termLoanPage,
  lineOfCreditPage,
  equipmentFinancingPage,
  buyBusinessUseCase,
  ownerOccupiedRealEstateUseCase,
  cashFlowNeedsUseCase,
  equipmentPurchaseUseCase,
  businessExpansionUseCase,
  refinanceBusinessDebtUseCase,
  franchiseBusinessesIndustry,
  truckingCompaniesIndustry,
  constructionContractorsIndustry,
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

export function getUseCasePages() {
  return records.filter((record) => record.templateId === 'use_case_page');
}

export function getIndustryPages() {
  return records.filter((record) => record.templateId === 'industry_page');
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
