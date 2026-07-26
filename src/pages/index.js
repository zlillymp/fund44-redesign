import { home } from './home.js';
import { financing } from './financing.js';
import { sba7a, sba504, acquisition, workingCapital } from './products.js';
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

  if (route.slug) {
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
