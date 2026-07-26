import { home } from './home.js';
import { financing } from './financing.js';
import { sba7a, sba504, acquisition, workingCapital, termLoan, lineOfCredit, equipmentFinancing } from './products.js';
import {
  buyBusinessUseCase,
  ownerOccupiedRealEstateUseCase,
  cashFlowNeedsUseCase,
  equipmentPurchaseUseCase,
  businessExpansionUseCase,
  refinanceBusinessDebtUseCase,
} from './use-cases.js';
import {
  franchiseBusinessesIndustry,
  truckingCompaniesIndustry,
  constructionContractorsIndustry,
} from './industries.js';
import {
  californiaStatePage,
  floridaStatePage,
  newYorkStatePage,
} from './states.js';
import { howItWorks } from './how-it-works.js';
import { about } from './about.js';
import { resources, article } from './resources.js';
import { privacy, terms, contact } from './legal.js';
import { notFound } from './not-found.js';
import { getRouteMatch } from '../lib/routes.js';

export const pageRenderers = {
  home,
  financing,
  sba7a,
  sba504,
  acquisition,
  workingCapital,
  termLoan,
  lineOfCredit,
  equipmentFinancing,
  buyBusinessUseCase,
  ownerOccupiedRealEstateUseCase,
  cashFlowNeedsUseCase,
  equipmentPurchaseUseCase,
  businessExpansionUseCase,
  refinanceBusinessDebtUseCase,
  franchiseBusinessesIndustry,
  truckingCompaniesIndustry,
  constructionContractorsIndustry,
  californiaStatePage,
  floridaStatePage,
  newYorkStatePage,
  howItWorks,
  about,
  resources,
  article,
  privacy,
  terms,
  contact,
  notFound,
};

function getRenderer(match) {
  const route = match.route;
  if (route.routeId === 'not_found') {
    return () => pageRenderers.notFound(match.requestedPath);
  }

  if (route.templateId === 'editorial_article' && route.slug) {
    return () => pageRenderers.article(route.slug);
  }
  const renderer = pageRenderers[route.pageKey];
  if (!renderer) {
    throw new Error(`No renderer registered for page key "${route.pageKey}"`);
  }
  return renderer;
}

export function renderRouteToHtml(pathname) {
  const match = getRouteMatch(pathname);
  const renderer = getRenderer(match);

  return {
    match,
    html: renderer(),
  };
}
