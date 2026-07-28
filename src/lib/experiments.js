/**
 * Experimentation harness — F44-EXP-01.
 *
 * Registry-driven, deterministic, and consent-safe. The registry ships EMPTY:
 * no experiment runs until an entry is added under the rules in
 * docs/experiment-rules.md. Assignment is a pure hash of experiment id +
 * session id, so a session always sees the same variant and no assignment
 * state needs to be stored or transmitted.
 *
 * This module must not import from src/lib/analytics.js (analytics imports
 * from here to inject `experiment_ids` into every event's shared fields).
 */

export { EXPERIMENT_SURFACES, validateExperimentDefinition, assertValidExperimentRegistry } from './experiments-validation.js';

export const EXPERIMENT_REGISTRY_OVERRIDE_KEY = '__FUND44_EXPERIMENT_REGISTRY_OVERRIDE__';

/**
 * Registry entry shape (see docs/experiment-rules.md for the authoring rules):
 * {
 *   experimentId: 'nav_cta_label_2026q3',   // snake_case, stable, enum-safe
 *   surface: 'nav',                          // one of EXPERIMENT_SURFACES
 *   enabled: false,                          // master flag; false = fully inert
 *   variants: [                              // >= 2, weights are integers >= 0
 *     { variantId: 'control', weight: 1 },
 *     { variantId: 'treatment', weight: 1 },
 *   ],
 *   guardrailMetrics: ['error_free_session_rate'], // KPI names from docs/dashboard-spec.md
 * }
 */
const EXPERIMENT_REGISTRY = Object.freeze([]);

function killSwitchedIds() {
  const raw = globalThis.__FUND44_EXPERIMENT_KILLSWITCH__;
  if (!raw) return new Set();
  if (raw instanceof Set) return raw;
  if (Array.isArray(raw)) return new Set(raw);
  return new Set([raw]);
}

function allExperimentsDisabled() {
  return globalThis.__FUND44_EXPERIMENTS_DISABLED__ === true;
}

function getActiveRegistry() {
  const override = globalThis[EXPERIMENT_REGISTRY_OVERRIDE_KEY];
  return Array.isArray(override) ? override : EXPERIMENT_REGISTRY;
}

export function isExperimentActive(experimentId) {
  if (allExperimentsDisabled()) return false;
  if (killSwitchedIds().has(experimentId)) return false;
  const definition = getActiveRegistry().find((entry) => entry.experimentId === experimentId);
  return Boolean(definition?.enabled);
}

/**
 * Deterministic 32-bit FNV-1a hash. Not cryptographic — it only needs to be
 * stable and evenly spread for bucketing.
 */
function hashString(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function assignVariant(definition, sessionId) {
  if (!definition || !sessionId) return null;
  const totalWeight = definition.variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (totalWeight <= 0) return null;

  const bucket = hashString(`${definition.experimentId}:${sessionId}`) % totalWeight;
  let cursor = 0;
  for (const variant of definition.variants) {
    cursor += variant.weight;
    if (bucket < cursor) return variant.variantId;
  }
  return definition.variants[definition.variants.length - 1].variantId;
}

export function getActiveAssignments(sessionId) {
  if (!sessionId || allExperimentsDisabled()) return [];
  const killed = killSwitchedIds();

  return getActiveRegistry()
    .filter((definition) => definition.enabled && !killed.has(definition.experimentId))
    .map((definition) => ({
      experimentId: definition.experimentId,
      variantId: assignVariant(definition, sessionId),
      surface: definition.surface,
    }))
    .filter((assignment) => Boolean(assignment.variantId));
}

export function getActiveExperimentIds(sessionId) {
  return getActiveAssignments(sessionId).map((assignment) => assignment.experimentId);
}
