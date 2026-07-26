import { getContentByRouteId } from '../content.js';
import { getRouteMatch } from '../routes.js';
import { defaultRequestedMode } from './storage.js';

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function flowTriggerAttributes({
  ctaId = 'preview_funding_paths',
  startSurface = 'inline',
  requestedMode = 'preview',
  productContextRouteId = '',
  productContextTitle = '',
} = {}) {
  const attributes = {
    'data-open-flow': '',
    'data-cta-id': ctaId,
    'data-start-surface': startSurface,
    'data-flow-mode': defaultRequestedMode(requestedMode),
  };

  if (productContextRouteId) {
    attributes['data-flow-product-route-id'] = productContextRouteId;
  }

  if (productContextTitle) {
    attributes['data-flow-product-title'] = productContextTitle;
  }

  return Object.entries(attributes)
    .map(([key, value]) => (value === '' ? key : `${key}="${escapeAttribute(value)}"`))
    .join(' ');
}

function tryGetContentTitle(routeId) {
  try {
    return getContentByRouteId(routeId)?.title || null;
  } catch {
    return null;
  }
}

export function buildFlowContextFromTrigger(trigger) {
  const match = getRouteMatch(window.location.pathname);
  const route = match.route;
  const currentContentTitle = route.contentId ? tryGetContentTitle(route.routeId) : null;
  const requestedMode = defaultRequestedMode(trigger?.dataset?.flowMode);
  const startCtaId = trigger?.dataset?.ctaId || `${requestedMode}_funding_paths`;
  const startSurface = trigger?.dataset?.startSurface || 'inline';
  const productContextRouteId = trigger?.dataset?.flowProductRouteId || (route.routeFamily === 'financing_program' ? route.routeId : null);
  const productContextTitle = trigger?.dataset?.flowProductTitle || (productContextRouteId ? tryGetContentTitle(productContextRouteId) : null);

  return {
    requestedMode,
    activeMode: requestedMode,
    modeSource: `cta:${startCtaId}`,
    startSurface,
    startCtaId,
    entryRouteId: route.routeId,
    entryContentId: route.contentId || null,
    entryPath: route.path,
    entryPageType: route.pageType,
    entryTitle: currentContentTitle || route.title || null,
    productContextRouteId,
    productContextTitle,
  };
}
