import { getContentByRouteId } from '../content.js';
import { getRoute, getRouteMatch } from '../routes.js';
import {
  FUNNEL_CONTEXT_KINDS,
  inferFunnelContextKind,
  normalizeFunnelContextKind,
} from './model.js';
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
  funnelContextKind = '',
} = {}) {
  const attributes = {
    'data-open-flow': '',
    'data-cta-id': ctaId,
    'data-start-surface': startSurface,
    'data-flow-mode': defaultRequestedMode(requestedMode),
  };
  const normalizedFunnelContextKind = normalizeFunnelContextKind(funnelContextKind);

  if (productContextRouteId) {
    attributes['data-flow-product-route-id'] = productContextRouteId;
  }

  if (normalizedFunnelContextKind !== FUNNEL_CONTEXT_KINDS.generic) {
    attributes['data-flow-context-kind'] = normalizedFunnelContextKind;
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

function tryGetRouteTitle(routeId) {
  try {
    return getRoute(routeId)?.title || null;
  } catch {
    return null;
  }
}

function tryGetAllowedRouteId(routeId) {
  if (!routeId) return null;
  try {
    return getRoute(routeId).routeId;
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
  const fallbackRouteFamilies = new Set(['financing_program', 'use_case', 'industry', 'state']);
  const requestedProductRouteId = trigger?.dataset?.flowProductRouteId
    || (fallbackRouteFamilies.has(route.routeFamily) ? route.routeId : null);
  const productContextRouteId = tryGetAllowedRouteId(requestedProductRouteId);
  const productContextTitle = productContextRouteId
    ? (tryGetContentTitle(productContextRouteId) || tryGetRouteTitle(productContextRouteId))
    : null;
  const explicitFunnelContextKind = normalizeFunnelContextKind(trigger?.dataset?.flowContextKind);
  const funnelContextKind = explicitFunnelContextKind !== FUNNEL_CONTEXT_KINDS.generic
    ? explicitFunnelContextKind
    : inferFunnelContextKind(route.routeFamily);

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
    entryRouteFamily: route.routeFamily || null,
    productContextRouteId,
    productContextTitle,
    funnelContextKind,
  };
}
