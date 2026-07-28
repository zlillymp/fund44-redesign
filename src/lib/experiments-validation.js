export const EXPERIMENT_SURFACES = Object.freeze([
  'nav',
  'cta',
  'funnel',
  'trust',
  'mobile',
]);

const EXPERIMENT_ID_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;

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

export function assertValidExperimentRegistry(registry) {
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
