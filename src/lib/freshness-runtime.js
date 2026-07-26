import { getAllContent } from './content.js';

export const FRESHNESS_TODAY = '2026-07-26';
export const DEFAULT_UPCOMING_WINDOW_DAYS = 30;

export const FRESHNESS_STATES = Object.freeze({
  REVIEW_PENDING: 'review_pending',
  CURRENT: 'current',
  UPCOMING: 'upcoming_review',
  STALE: 'stale',
  EXPIRED: 'expired',
});

export const FRESHNESS_ACTIONS = Object.freeze({
  NONE: 'none',
  REVIEW: 'review',
  NOINDEX: 'noindex',
  BLOCK: 'block',
});

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysUntil(targetDate, today = FRESHNESS_TODAY) {
  const target = Date.parse(`${targetDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  return Math.round((target - current) / 86_400_000);
}

function compareIsoDate(left, right) {
  return left.localeCompare(right);
}

export function deriveState({
  reviewedDate,
  dueDate,
  expiresDate = null,
  today = FRESHNESS_TODAY,
  upcomingWindowDays = DEFAULT_UPCOMING_WINDOW_DAYS,
}) {
  if (!reviewedDate) {
    return {
      state: FRESHNESS_STATES.REVIEW_PENDING,
      dueDate,
      daysUntilDue: dueDate ? daysUntil(dueDate, today) : null,
    };
  }

  if (expiresDate && compareIsoDate(expiresDate, today) < 0) {
    return {
      state: FRESHNESS_STATES.EXPIRED,
      dueDate,
      daysUntilDue: dueDate ? daysUntil(dueDate, today) : null,
    };
  }

  if (dueDate && compareIsoDate(dueDate, today) < 0) {
    return {
      state: FRESHNESS_STATES.STALE,
      dueDate,
      daysUntilDue: daysUntil(dueDate, today),
    };
  }

  if (dueDate && daysUntil(dueDate, today) <= upcomingWindowDays) {
    return {
      state: FRESHNESS_STATES.UPCOMING,
      dueDate,
      daysUntilDue: daysUntil(dueDate, today),
    };
  }

  return {
    state: FRESHNESS_STATES.CURRENT,
    dueDate,
    daysUntilDue: dueDate ? daysUntil(dueDate, today) : null,
  };
}

export function actionForState({ state, staleAction, expiredAction }) {
  if (state === FRESHNESS_STATES.EXPIRED) return expiredAction || FRESHNESS_ACTIONS.BLOCK;
  if (state === FRESHNESS_STATES.STALE) return staleAction || FRESHNESS_ACTIONS.NOINDEX;
  if (state === FRESHNESS_STATES.UPCOMING || state === FRESHNESS_STATES.REVIEW_PENDING) return FRESHNESS_ACTIONS.REVIEW;
  return FRESHNESS_ACTIONS.NONE;
}

function buildRuntimeEntry(record) {
  const state = record.measurement?.freshnessState || FRESHNESS_STATES.REVIEW_PENDING;
  const action = actionForState({
    state,
    staleAction: record.freshness?.staleAction,
    expiredAction: record.freshness?.expiredAction,
  });

  return {
    id: record.id,
    routeId: record.routeId,
    state,
    action,
    policyNoindex: action === FRESHNESS_ACTIONS.NOINDEX || action === FRESHNESS_ACTIONS.BLOCK,
    policyBlocked: action === FRESHNESS_ACTIONS.BLOCK,
  };
}

const runtimeEntries = getAllContent().map((record) => buildRuntimeEntry(record));
const runtimeByRouteId = new Map(runtimeEntries.map((entry) => [entry.routeId, entry]));
const runtimeByContentId = new Map(runtimeEntries.map((entry) => [entry.id, entry]));

export function getContentFreshnessByRouteId(routeId) {
  return runtimeByRouteId.get(routeId) || null;
}

export function getContentFreshnessByContentId(contentId) {
  return runtimeByContentId.get(contentId) || null;
}

export function routeIsFreshnessNoindexed(routeId) {
  return Boolean(getContentFreshnessByRouteId(routeId)?.policyNoindex);
}

export function routeIsFreshnessBlocked(routeId) {
  return Boolean(getContentFreshnessByRouteId(routeId)?.policyBlocked);
}

export function freshnessAnalyticsStateForRoute(routeId) {
  return getContentFreshnessByRouteId(routeId)?.state || FRESHNESS_STATES.REVIEW_PENDING;
}
