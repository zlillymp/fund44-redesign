import { getAllContent, getContentById } from './content.js';
import { getAllRoutes, getRouteByContentId, hrefForRoute } from './routes.js';

const routes = getAllRoutes();
const routeById = new Map(routes.map((route) => [route.routeId, route]));
const contentByRouteId = new Map(getAllContent().map((record) => [record.routeId, record]));

const routeDescriptionFallbacks = {
  about: 'Learn why Fund44 was built and how it frames the marketplace in plain language.',
  how_it_works: 'See the step-by-step process, routing explanations, document flow, and comparison workflow.',
  privacy: 'Review the current governance-draft privacy summary and staging data-handling boundaries.',
  terms: 'Review the current marketplace, guarantee, credit, and disclosure language.',
  contact: 'See the controlled TBD contact and legal-identity placeholders while GOV-02 remains blocked.',
};

const contextualFallbackRouteIds = {
  home: ['about'],
  about: ['how_it_works', 'resources'],
  how_it_works: ['about', 'resources'],
  privacy: ['terms', 'contact'],
  terms: ['privacy', 'contact'],
  contact: ['privacy', 'terms'],
};

const exemptOrphanRouteIds = new Set(['home']);

function isIndexableRoute(route) {
  return Boolean(route?.crawl?.canonical && route?.crawl?.indexable);
}

function getIndexableRoutes() {
  return routes.filter((route) => isIndexableRoute(route));
}

function unique(items) {
  return [...new Set(items)];
}

function routeDescription(routeId) {
  const route = routeById.get(routeId);
  const content = contentByRouteId.get(routeId);

  if (content?.summary) return content.summary;
  if (route?.panelDescription) return route.panelDescription;
  if (routeDescriptionFallbacks[routeId]) return routeDescriptionFallbacks[routeId];
  return route?.title || '';
}

function resolveContentRouteId(contentId) {
  const route = getRouteByContentId(contentId);
  if (!route) {
    throw new Error(`Unknown content id in link graph: ${contentId}`);
  }
  return route.routeId;
}

function getHubRouteId(route) {
  if (route.routeId === 'home') return null;
  if (route.routeFamily === 'resources_article') return 'resources';
  if (route.templateId === 'product_page') return 'financing';
  if (route.templateId === 'use_case_page') return 'financing';
  if (route.templateId === 'industry_page') return 'financing';
  if (route.routeId === 'financing') return 'home';
  if (route.routeId === 'resources') return 'home';
  if (route.routeId === 'about' || route.routeId === 'how_it_works') return 'home';
  if (route.routeFamily === 'legal' || route.routeFamily === 'contact') return 'home';
  return route.parentRouteId || 'home';
}

function getNextStepRouteId(route) {
  if (route.routeId === 'home') return 'how_it_works';
  if (route.templateId === 'product_page') return 'how_it_works';
  if (route.templateId === 'use_case_page') return 'how_it_works';
  if (route.templateId === 'industry_page') return 'how_it_works';
  if (route.routeId === 'financing') return 'how_it_works';
  return 'financing';
}

function getMinimumRequirements(route) {
  if (route.routeId === 'home') {
    return { hub: 0, contextual: 4, next: 1 };
  }
  if (route.templateId === 'product_page') {
    return { hub: 1, contextual: 3, next: 1 };
  }
  if (route.templateId === 'use_case_page') {
    return { hub: 1, contextual: 4, next: 1 };
  }
  if (route.templateId === 'industry_page') {
    return { hub: 1, contextual: 5, next: 1 };
  }
  if (route.templateId === 'resources_hub') {
    return { hub: 1, contextual: 4, next: 1 };
  }
  if (route.templateId === 'editorial_article') {
    return { hub: 1, contextual: 3, next: 1 };
  }
  if (route.routeId === 'financing') {
    return { hub: 1, contextual: 4, next: 1 };
  }
  return { hub: 1, contextual: 2, next: 1 };
}

function getStructuredContextualRouteIds(route) {
  const record = contentByRouteId.get(route.routeId);
  if (!record) return [];

  const targetRouteIds = [];

  record.relatedIds?.forEach((contentId) => {
    targetRouteIds.push(resolveContentRouteId(contentId));
  });

  record.articleIds?.forEach((contentId) => {
    targetRouteIds.push(resolveContentRouteId(contentId));
  });

  record.productCardIds?.forEach((contentId) => {
    targetRouteIds.push(resolveContentRouteId(contentId));
  });

  record.matrixRows?.forEach((row) => {
    targetRouteIds.push(row.destinationRouteId);
  });

  record.decisionCards?.forEach((card) => {
    targetRouteIds.push(card.destinationRouteId);
  });

  record.bestFitProducts?.forEach((item) => {
    targetRouteIds.push(item.routeId);
  });

  record.alternativePaths?.forEach((item) => {
    targetRouteIds.push(item.routeId);
  });

  record.underwritingFocusCards?.forEach(() => {
    // no-op for route targets; cards are validated for substantive content elsewhere
  });

  return targetRouteIds;
}

function createLinkItem(sourceRouteId, targetRouteId, relation, moduleId) {
  const sourceRoute = routeById.get(sourceRouteId);
  const targetRoute = routeById.get(targetRouteId);

  if (!sourceRoute) {
    throw new Error(`Unknown source route id in link graph: ${sourceRouteId}`);
  }
  if (!targetRoute) {
    throw new Error(`Unknown target route id in link graph: ${targetRouteId}`);
  }

  return {
    sourceRouteId,
    sourceAnalyticsRouteId: sourceRoute.analyticsRouteId,
    targetRouteId,
    targetAnalyticsRouteId: targetRoute.analyticsRouteId,
    href: hrefForRoute(targetRouteId),
    label: contentByRouteId.get(targetRouteId)?.title || targetRoute.title,
    description: routeDescription(targetRouteId),
    relation,
    moduleId,
  };
}

function buildGroup(route, relation, title, rawTargetRouteIds) {
  const hubRouteId = getHubRouteId(route);
  const nextRouteId = getNextStepRouteId(route);
  const targetRouteIds = unique(rawTargetRouteIds)
    .filter(Boolean)
    .filter((targetRouteId) => targetRouteId !== route.routeId)
    .filter((targetRouteId) => routeById.has(targetRouteId))
    .filter((targetRouteId) => isIndexableRoute(routeById.get(targetRouteId)))
    .filter((targetRouteId) => {
      if (relation !== 'contextual') return true;
      return targetRouteId !== hubRouteId && targetRouteId !== nextRouteId;
    });

  return {
    relation,
    id: `link-group-${route.routeId}-${relation}`,
    title,
    items: targetRouteIds.map((targetRouteId) => createLinkItem(route.routeId, targetRouteId, relation, `${route.routeId}-${relation}`)),
  };
}

function getContextualRouteIds(route) {
  const structuredRouteIds = getStructuredContextualRouteIds(route);
  const fallbackRouteIds = contextualFallbackRouteIds[route.routeId] || [];
  return [...structuredRouteIds, ...fallbackRouteIds];
}

function sectionHeading(route) {
  if (route.templateId === 'product_page') return 'Compare related paths';
  if (route.templateId === 'use_case_page') return 'Compare related paths';
  if (route.templateId === 'industry_page') return 'Compare related paths';
  if (route.templateId === 'editorial_article' || route.templateId === 'resources_hub') return 'Keep exploring';
  if (route.routeFamily === 'legal' || route.routeFamily === 'contact') return 'Helpful next links';
  return 'Explore related routes';
}

export function getLinkModuleForRoute(routeId) {
  const route = routeById.get(routeId);
  if (!route || !isIndexableRoute(route)) {
    throw new Error(`Link modules require an indexable canonical route: ${routeId}`);
  }

  const hubGroup = buildGroup(route, 'hub', 'Hub page', [getHubRouteId(route)]);
  const contextualGroup = buildGroup(route, 'contextual', 'Related routes', getContextualRouteIds(route));
  const nextGroup = buildGroup(route, 'next', 'Next step', [getNextStepRouteId(route)]);

  return {
    routeId,
    eyebrow: route.templateId === 'editorial_article' ? 'Keep reading' : 'Keep exploring',
    heading: sectionHeading(route),
    groups: [hubGroup, contextualGroup, nextGroup],
  };
}

export function getLinkGraph() {
  const nodes = getIndexableRoutes().map((route) => ({
    routeId: route.routeId,
    analyticsRouteId: route.analyticsRouteId,
    title: contentByRouteId.get(route.routeId)?.title || route.title,
    path: route.path,
    templateId: route.templateId,
    pageType: route.pageType,
    routeFamily: route.routeFamily,
    requirements: getMinimumRequirements(route),
  }));

  const modules = nodes.map((node) => getLinkModuleForRoute(node.routeId));
  const edges = modules.flatMap((module) => module.groups.flatMap((group) => group.items.map((item) => ({
    sourceRouteId: item.sourceRouteId,
    sourceAnalyticsRouteId: item.sourceAnalyticsRouteId,
    targetRouteId: item.targetRouteId,
    targetAnalyticsRouteId: item.targetAnalyticsRouteId,
    relation: item.relation,
    href: item.href,
  }))));

  return { nodes, modules, edges };
}

function detectHubCycles(graph) {
  const hubAdjacency = new Map();
  graph.nodes.forEach((node) => {
    hubAdjacency.set(node.routeId, []);
  });
  graph.edges
    .filter((edge) => edge.relation === 'hub')
    .forEach((edge) => {
      hubAdjacency.get(edge.sourceRouteId)?.push(edge.targetRouteId);
    });

  const visiting = new Set();
  const visited = new Set();
  const cycles = [];

  function visit(routeId, path = []) {
    if (visiting.has(routeId)) {
      cycles.push([...path, routeId].join(' -> '));
      return;
    }
    if (visited.has(routeId)) return;

    visiting.add(routeId);
    for (const nextRouteId of hubAdjacency.get(routeId) || []) {
      visit(nextRouteId, [...path, routeId]);
    }
    visiting.delete(routeId);
    visited.add(routeId);
  }

  graph.nodes.forEach((node) => visit(node.routeId));
  return unique(cycles);
}

export function validateLinkGraph(graph = getLinkGraph()) {
  const errors = [];
  const edgeKeys = new Set();
  const inboundCounts = new Map(graph.nodes.map((node) => [node.routeId, 0]));

  graph.edges.forEach((edge) => {
    const key = `${edge.sourceRouteId}:${edge.targetRouteId}:${edge.relation}`;
    if (edgeKeys.has(key)) {
      errors.push(`Duplicate link edge ${key}`);
    }
    edgeKeys.add(key);

    if (edge.sourceRouteId === edge.targetRouteId) {
      errors.push(`Self-link detected on ${edge.sourceRouteId}`);
    }

    const targetRoute = routeById.get(edge.targetRouteId);
    if (!targetRoute) {
      errors.push(`Unknown target route ${edge.targetRouteId}`);
    } else if (!isIndexableRoute(targetRoute)) {
      errors.push(`Non-indexable target route ${edge.targetRouteId} used by ${edge.sourceRouteId}`);
    }

    inboundCounts.set(edge.targetRouteId, (inboundCounts.get(edge.targetRouteId) || 0) + 1);
  });

  graph.modules.forEach((module) => {
    const route = routeById.get(module.routeId);
    const requirements = getMinimumRequirements(route);
    const relationCounts = Object.fromEntries(module.groups.map((group) => [group.relation, group.items.length]));

    if ((relationCounts.hub || 0) < requirements.hub) {
      errors.push(`${module.routeId}: hub link count ${relationCounts.hub || 0} is below required minimum ${requirements.hub}`);
    }
    if ((relationCounts.contextual || 0) < requirements.contextual) {
      errors.push(`${module.routeId}: contextual link count ${relationCounts.contextual || 0} is below required minimum ${requirements.contextual}`);
    }
    if ((relationCounts.next || 0) < requirements.next) {
      errors.push(`${module.routeId}: next-step link count ${relationCounts.next || 0} is below required minimum ${requirements.next}`);
    }
  });

  for (const node of graph.nodes) {
    if (exemptOrphanRouteIds.has(node.routeId)) continue;
    if ((inboundCounts.get(node.routeId) || 0) === 0) {
      errors.push(`Orphan route detected: ${node.routeId}`);
    }
  }

  const hubCycles = detectHubCycles(graph);
  hubCycles.forEach((cycle) => {
    errors.push(`Harmful hub-link cycle detected: ${cycle}`);
  });

  return {
    errors,
    inboundCounts,
    relationCounts: {
      hub: graph.edges.filter((edge) => edge.relation === 'hub').length,
      contextual: graph.edges.filter((edge) => edge.relation === 'contextual').length,
      next: graph.edges.filter((edge) => edge.relation === 'next').length,
    },
  };
}

export function renderLinkGraphMarkdown(graph = getLinkGraph()) {
  const validation = validateLinkGraph(graph);
  const lines = [
    '# Internal Link Graph',
    '',
    'Generated from `content/manifest.mjs`, `src/lib/routes.js`, and structured content records. The graph below captures the SEO-05 hub, contextual, and next-step links rendered on canonical indexable routes.',
    '',
    '## Summary',
    '',
    `- Indexable canonical routes: ${graph.nodes.length}`,
    `- Hub links: ${validation.relationCounts.hub}`,
    `- Contextual links: ${validation.relationCounts.contextual}`,
    `- Next-step links: ${validation.relationCounts.next}`,
    `- Orphans detected: ${validation.errors.filter((error) => error.startsWith('Orphan')).length}`,
    '',
    '## Route Inventory',
    '',
    '| Route ID | Path | Hub | Contextual | Next | Inbound |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  graph.modules.forEach((module) => {
    const node = graph.nodes.find((entry) => entry.routeId === module.routeId);
    const relationCounts = Object.fromEntries(module.groups.map((group) => [group.relation, group.items.length]));
    lines.push(`| \`${module.routeId}\` | \`${node.path}\` | ${relationCounts.hub || 0} | ${relationCounts.contextual || 0} | ${relationCounts.next || 0} | ${validation.inboundCounts.get(module.routeId) || 0} |`);
  });

  graph.modules.forEach((module) => {
    lines.push('', `## ${module.routeId}`, '');
    module.groups.forEach((group) => {
      lines.push(`### ${group.title}`, '');
      group.items.forEach((item) => {
        lines.push(`- \`${item.targetRouteId}\` ${item.href} — ${item.description}`);
      });
      if (group.items.length === 0) {
        lines.push('- None');
      }
      lines.push('');
    });
  });

  return `${lines.join('\n')}\n`;
}
