import { routeManifest } from '../../content/manifest.mjs';

const { site, routes, navigation, ctaDestinations } = routeManifest;

const routeById = new Map(routes.map((route) => [route.routeId, route]));
const routeByPath = new Map(routes.filter((route) => route.path && route.path !== '*').map((route) => [route.path, route]));
const routeByContentId = new Map(routes.filter((route) => route.contentId).map((route) => [route.contentId, route]));
const routeBySlug = new Map(routes.filter((route) => route.slug).map((route) => [route.slug, route]));
const legacyHashMap = new Map();
const LEGACY_HASH_PREFIX = '#'.concat('/');

routes.forEach((route) => {
  route.legacyHashes?.forEach((legacyHash) => {
    legacyHashMap.set(legacyHash, route.path);
  });
});

function ensureRoute(routeId) {
  const route = routeById.get(routeId);
  if (!route) {
    throw new Error(`Unknown route id: ${routeId}`);
  }
  return route;
}

function normalizeSearch(search = '') {
  if (!search) return '';
  return search.startsWith('?') ? search : `?${search}`;
}

export function normalizePathname(pathname = '/') {
  const raw = pathname || '/';
  const withoutIndex = raw.replace(/\/index\.html$/i, '/');
  const withLeadingSlash = withoutIndex.startsWith('/') ? withoutIndex : `/${withoutIndex}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  if (collapsed === '/') return '/';
  return collapsed.endsWith('/') ? collapsed.slice(0, -1) : collapsed;
}

export function absoluteUrlForPath(pathname = '/') {
  return `${site.baseUrl}${normalizePathname(pathname)}`;
}

export function getRoute(routeId) {
  return ensureRoute(routeId);
}

export function getAllRoutes() {
  return routes.slice();
}

export function getCanonicalRoutes() {
  return routes.filter((route) => route.crawl?.canonical);
}

export function getRouteByPath(pathname) {
  return routeByPath.get(normalizePathname(pathname)) || null;
}

export function getRouteByContentId(contentId) {
  return routeByContentId.get(contentId) || null;
}

export function getRouteBySlug(slug) {
  return routeBySlug.get(slug) || null;
}

export function getRouteMatch(pathname) {
  const normalizedPath = normalizePathname(pathname);
  const route = getRouteByPath(normalizedPath) || ensureRoute('not_found');
  return {
    route,
    requestedPath: normalizedPath,
    isNotFound: route.routeId === 'not_found',
  };
}

export function hrefForRoute(routeId, { hash = '', search = '' } = {}) {
  const route = ensureRoute(routeId);
  const normalizedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
  return `${route.path}${normalizeSearch(search)}${normalizedHash}`;
}

export function hrefForContentId(contentId, options) {
  const route = getRouteByContentId(contentId);
  if (!route) {
    throw new Error(`Unknown content id: ${contentId}`);
  }
  return hrefForRoute(route.routeId, options);
}

export function hrefForSlug(slug, options) {
  const route = getRouteBySlug(slug);
  if (!route) {
    throw new Error(`Unknown route slug: ${slug}`);
  }
  return hrefForRoute(route.routeId, options);
}

export function isLegacyHashRoute(hash = '') {
  return hash === LEGACY_HASH_PREFIX || hash.startsWith(LEGACY_HASH_PREFIX);
}

export function resolveLegacyHashPath(hash = '') {
  if (!isLegacyHashRoute(hash)) {
    return null;
  }

  if (legacyHashMap.has(hash)) {
    return legacyHashMap.get(hash);
  }

  return normalizePathname(hash.slice(1));
}

export function getBreadcrumbs(routeId) {
  const crumbs = [];
  let current = ensureRoute(routeId);

  while (current) {
    if (current.crawl?.canonical) {
      crumbs.unshift({
        routeId: current.routeId,
        label: current.breadcrumbLabel || current.title,
        path: current.path,
      });
    }
    current = current.parentRouteId ? ensureRoute(current.parentRouteId) : null;
  }

  return crumbs;
}

function descendantIds(rootRouteId) {
  const result = new Set([rootRouteId]);
  let changed = true;

  while (changed) {
    changed = false;
    routes.forEach((route) => {
      if (route.parentRouteId && result.has(route.parentRouteId) && !result.has(route.routeId)) {
        result.add(route.routeId);
        changed = true;
      }
    });
  }

  return result;
}

function navLink(routeId, label, extra = {}) {
  const route = ensureRoute(routeId);
  return {
    routeId,
    label: label || route.navLabel || route.title,
    href: hrefForRoute(routeId),
    path: route.path,
    ...extra,
  };
}

export function getPrimaryNavigation() {
  return navigation.primary.map((item) => ({
    ...navLink(item.routeId, item.label),
    activeRouteIds: [...descendantIds(item.routeId)],
    panel: item.panel ? item.panel.map((routeId) => {
      const route = ensureRoute(routeId);
      return navLink(routeId, route.panelLabel || route.title, {
        description: route.panelDescription || '',
      });
    }) : null,
  }));
}

export function getMobileNavigation() {
  return navigation.mobile.map((item) => ({
    ...navLink(item.routeId, item.label),
    className: item.className || '',
  }));
}

export function getFooterNavigation() {
  return navigation.footer.map((group) => ({
    heading: group.heading,
    items: group.items.map((routeId) => {
      const route = ensureRoute(routeId);
      return navLink(routeId, route.footerLabel || route.title);
    }),
  }));
}

export function getCtaDestination(ctaId) {
  const destination = ctaDestinations[ctaId];
  if (!destination) {
    throw new Error(`Unknown CTA destination id: ${ctaId}`);
  }
  return {
    ...destination,
    href: hrefForRoute(destination.routeId),
  };
}

export function getLlmsInventories() {
  const llmsRoutes = routes.filter((route) => route.crawl?.llms);
  return {
    financingPaths: llmsRoutes
      .filter((route) => route.routeFamily === 'financing_program')
      .map((route) => ({
        routeId: route.routeId,
        label: route.title,
        description: route.panelDescription || '',
        path: route.path,
      })),
    keyPages: llmsRoutes
      .filter((route) => route.routeFamily !== 'financing_program')
      .map((route) => ({
        routeId: route.routeId,
        label: route.title,
        path: route.path,
      })),
  };
}

export function shouldHighlightRoute(currentRouteId, navRouteId) {
  return descendantIds(navRouteId).has(currentRouteId);
}

export const routeSite = site;
