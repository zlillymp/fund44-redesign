import { routeManifest } from '../../content/manifest.mjs';
import {
  absoluteUrlForPath,
  getCanonicalRoutes,
  getLlmsInventories,
} from './routes.js';
import { routeIsFreshnessBlocked, routeIsFreshnessNoindexed } from './freshness-runtime.js';

const { routes } = routeManifest;

export function getIndexableRoutes() {
  return getCanonicalRoutes().filter((route) => route.crawl?.indexable && !routeIsFreshnessNoindexed(route.routeId));
}

export function getLlmsEntries() {
  const inventory = getLlmsInventories();
  return [
    ...inventory.financingPaths.map((item) => ({
      ...item,
      section: 'financing_paths',
      loc: absoluteUrlForPath(item.path),
    })),
    ...inventory.keyPages.map((item) => ({
      ...item,
      section: 'key_pages',
      loc: absoluteUrlForPath(item.path),
    })),
  ].filter((entry) => !routeIsFreshnessNoindexed(entry.routeId));
}

export function getSitemapEntries() {
  return getCanonicalRoutes()
    .filter((route) => route.crawl?.sitemap && route.crawl?.indexable && !routeIsFreshnessNoindexed(route.routeId))
    .map((route) => ({
      routeId: route.routeId,
      path: route.path,
      loc: absoluteUrlForPath(route.path),
      changefreq: route.crawl.changefreq,
      priority: route.crawl.priority,
    }));
}

export function getRouteInventory() {
  return routes.map((route) => ({
    routeId: route.routeId,
    analyticsRouteId: route.analyticsRouteId,
    path: route.path,
    pageKey: route.pageKey,
    pageType: route.pageType,
    templateId: route.templateId,
    routeFamily: route.routeFamily,
    contentId: route.contentId || '',
    canonical: Boolean(route.crawl?.canonical),
    indexable: Boolean(route.crawl?.indexable) && !routeIsFreshnessNoindexed(route.routeId),
    freshnessBlocked: routeIsFreshnessBlocked(route.routeId),
    freshnessNoindex: routeIsFreshnessNoindexed(route.routeId),
    landing: Boolean(route.crawl?.landing),
  }));
}

export function getIndexableRouteInventory() {
  return getRouteInventory().filter((route) => route.canonical && route.indexable);
}
