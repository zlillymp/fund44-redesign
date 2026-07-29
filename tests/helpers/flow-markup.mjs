import { renderRouteToHtml } from '../../src/pages/index.js';

function camelCase(attributeName) {
  return attributeName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseDataset(tag) {
  const dataset = {};
  for (const [, name, value] of tag.matchAll(/data-([a-z0-9-]+)(?:="([^"]*)")?/g)) {
    dataset[camelCase(name)] = value ?? '';
  }
  return dataset;
}

export function flowTriggersOnRoute(routePath) {
  const { html } = renderRouteToHtml(routePath);
  return [...html.matchAll(/<button[^>]*\sdata-open-flow[^>]*>/g)]
    .map((match) => ({ dataset: parseDataset(match[0]) }));
}
