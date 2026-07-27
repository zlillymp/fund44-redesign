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

export const EXPERIMENT_SURFACES = Object.freeze([
  'nav',
  'cta',
  'funnel',
  'trust',
  'mobile',
]);

const EXPERIMENT_ID_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;

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

let activeRegistry = EXPERIMENT_REGISTRY;

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

export function validateExperimentDefinition(definition) {
  const errors = [];
  if (!definition || typeof definition !== 'object') {
    return ['experiment definition must be an object'];
  }

  if (!EXPERIMENT_ID_PATTERN.test(definition.experimentId || '')) {
    errors.push(`experimentId "${definition.experimentId}" must be snake_case (3-64 chars)`);
  }
  if (!EXPERIMENT_SURFACES.includes(definition.surface)) {
    errors.push(`surface "${definition.surface}" must be one of: ${EXPERIMENT_SURFACES.join(', ')}`);
  }
  if (typeof definition.enabled !== 'boolean') {
    errors.push('enabled must be an explicit boolean');
  }

  const variants = Array.isArray(definition.variants) ? definition.variants : [];
  if (variants.length < 2) {
    errors.push('variants must contain at least a control and one treatment');
  }
  variants.forEach((variant) => {
    if (!EXPERIMENT_ID_PATTERN.test(variant?.variantId || '')) {
      errors.push(`variantId "${variant?.variantId}" must be snake_case (3-64 chars)`);
    }
    if (!Number.isInteger(variant?.weight) || variant.weight < 0) {
      errors.push(`variant "${variant?.variantId}" weight must be a non-negative integer`);
    }
  });
  if (variants.length && variants.reduce((sum, variant) => sum + (variant?.weight || 0), 0) <= 0) {
    errors.push('at least one variant must carry a positive weight');
  }
  if (!Array.isArray(definition.guardrailMetrics) || definition.guardrailMetrics.length === 0) {
    errors.push('guardrailMetrics must name at least one KPI from docs/dashboard-spec.md');
  }

  return errors;
}

function assertValidRegistry(registry) {
  registry.forEach((definition) => {
    const errors = validateExperimentDefinition(definition);
    if (errors.length) {
      throw new Error(`invalid experiment "${definition?.experimentId}": ${errors.join('; ')}`);
    }
  });
  const ids = registry.map((definition) => definition.experimentId);
  if (new Set(ids).size !== ids.length) {
    throw new Error('experiment registry contains duplicate experimentId values');
  }
}

assertValidRegistry(activeRegistry);

export function isExperimentActive(experimentId) {
  if (allExperimentsDisabled()) return false;
  if (killSwitchedIds().has(experimentId)) return false;
  const definition = activeRegistry.find((entry) => entry.experimentId === experimentId);
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

  return activeRegistry
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

export function getExperimentDefinition(experimentId) {
  return activeRegistry.find((entry) => entry.experimentId === experimentId) || null;
}

export function __setExperimentRegistryForTests(registry) {
  assertValidRegistry(registry);
  activeRegistry = registry;
}

export function __resetExperimentRegistryForTests() {
  activeRegistry = EXPERIMENT_REGISTRY;
}
