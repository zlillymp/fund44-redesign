import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getLinkGraph, renderLinkGraphMarkdown, validateLinkGraph } from '../src/lib/link-graph.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

const graph = getLinkGraph();
const validation = validateLinkGraph(graph);

if (validation.errors.length > 0) {
  validation.errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}

await mkdir(docsDir, { recursive: true });
await writeFile(path.join(docsDir, 'link-graph.md'), renderLinkGraphMarkdown(graph), 'utf8');

console.log('Built internal link graph.');
console.table([
  {
    routes: graph.nodes.length,
    hubLinks: validation.relationCounts.hub,
    contextualLinks: validation.relationCounts.contextual,
    nextLinks: validation.relationCounts.next,
  },
]);
