import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getFreshnessReport, renderFreshnessMarkdown } from '../src/lib/freshness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const artifactsDir = path.join(repoRoot, 'artifacts', 'freshness');

await mkdir(artifactsDir, { recursive: true });

const report = getFreshnessReport();
const jsonPath = path.join(artifactsDir, 'report.json');
const markdownPath = path.join(artifactsDir, 'report.md');

await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(markdownPath, renderFreshnessMarkdown(report), 'utf8');

console.log('Freshness report generated.');
console.table([
  {
    content: report.summaries.content.total,
    citations: report.summaries.citations.total,
    governance: report.summaries.governance.total,
    generatedAssets: report.summaries.generatedAssets.total,
    reviewPending: report.summaries.content.reviewPending + report.summaries.citations.reviewPending + report.summaries.governance.reviewPending + report.summaries.generatedAssets.reviewPending,
    upcoming: report.summaries.content.upcoming + report.summaries.citations.upcoming + report.summaries.governance.upcoming + report.summaries.generatedAssets.upcoming,
    stale: report.summaries.content.stale + report.summaries.citations.stale + report.summaries.governance.stale + report.summaries.generatedAssets.stale,
    expired: report.summaries.content.expired + report.summaries.citations.expired + report.summaries.governance.expired + report.summaries.generatedAssets.expired,
    noindex: report.noindexContent.length,
    blocked: report.blockingEntries.length,
  },
]);
console.log(`Artifacts written to ${path.relative(repoRoot, jsonPath)} and ${path.relative(repoRoot, markdownPath)}.`);
