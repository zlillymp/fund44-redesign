import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseDocument } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const workflowDir = path.join(repoRoot, '.github', 'workflows');

const errors = [];

function fail(message) {
  errors.push(message);
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

let workflowEntries = [];
try {
  workflowEntries = await fs.readdir(workflowDir);
} catch {
  fail('.github/workflows is missing');
}

const workflowFiles = workflowEntries
  .filter((file) => /\.ya?ml$/i.test(file))
  .sort();

if (!workflowFiles.length) {
  fail('No workflow YAML files found under .github/workflows');
}

const results = [];

for (const fileName of workflowFiles) {
  const filePath = path.join(workflowDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8').catch(() => null);
  if (!raw) {
    fail(`${fileName}: unable to read workflow`);
    continue;
  }

  const doc = parseDocument(raw);
  if (doc.errors.length > 0) {
    doc.errors.forEach((error) => fail(`${fileName}: YAML parse error: ${error.message}`));
    continue;
  }

  const workflow = doc.toJSON();
  const workflowName = workflow?.name;
  const triggers = workflow?.on;
  const permissions = workflow?.permissions;
  const jobs = workflow?.jobs;

  if (!workflowName) fail(`${fileName}: missing top-level name`);
  if (!triggers) fail(`${fileName}: missing top-level on trigger`);
  if (!permissions) fail(`${fileName}: missing top-level permissions`);
  if (!jobs || typeof jobs !== 'object' || !Object.keys(jobs).length) fail(`${fileName}: missing jobs`);

  if (permissions && JSON.stringify(permissions) !== JSON.stringify({ contents: 'read' })) {
    fail(`${fileName}: permissions must remain minimal and equal to { contents: read }`);
  }

  const triggerNames = ensureArray(
    typeof triggers === 'string'
      ? [triggers]
      : Array.isArray(triggers)
        ? triggers
        : Object.keys(triggers || {}),
  );
  if (!triggerNames.includes('pull_request')) {
    fail(`${fileName}: must run on pull_request`);
  }
  if (!triggerNames.includes('workflow_dispatch')) {
    fail(`${fileName}: must support workflow_dispatch`);
  }

  const jobEntries = Object.entries(jobs || {});
  let checkoutPinned = false;
  let setupNodePinned = false;
  let uploadArtifactPinned = false;

  for (const [jobId, job] of jobEntries) {
    if (!Array.isArray(job.steps) || !job.steps.length) {
      fail(`${fileName}:${jobId}: missing steps`);
      continue;
    }

    if (!job['runs-on']) {
      fail(`${fileName}:${jobId}: missing runs-on`);
    }

    for (const step of job.steps) {
      if (!step.uses) continue;

      if (/^actions\/checkout@/.test(step.uses)) {
        checkoutPinned = /^actions\/checkout@[0-9a-f]{40}$/i.test(step.uses);
        if (!checkoutPinned) {
          fail(`${fileName}:${jobId}: actions/checkout must be pinned by commit SHA`);
        }
      }

      if (/^actions\/setup-node@/.test(step.uses)) {
        setupNodePinned = /^actions\/setup-node@[0-9a-f]{40}$/i.test(step.uses);
        if (!setupNodePinned) {
          fail(`${fileName}:${jobId}: actions/setup-node must be pinned by commit SHA`);
        }
      }

      if (/^actions\/upload-artifact@/.test(step.uses)) {
        uploadArtifactPinned = /^actions\/upload-artifact@[0-9a-f]{40}$/i.test(step.uses);
        if (!uploadArtifactPinned) {
          fail(`${fileName}:${jobId}: actions/upload-artifact must be pinned by commit SHA`);
        }
      }
    }
  }

  if (!checkoutPinned) fail(`${fileName}: missing pinned actions/checkout usage`);
  if (!setupNodePinned) fail(`${fileName}: missing pinned actions/setup-node usage`);
  if (!uploadArtifactPinned) fail(`${fileName}: missing pinned actions/upload-artifact usage`);

  results.push({
    file: fileName,
    jobs: jobEntries.length,
    triggers: triggerNames.join(', '),
  });
}

if (errors.length > 0) {
  console.error('Workflow validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Workflow validation passed.');
console.table(results);
