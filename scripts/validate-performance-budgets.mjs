import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const budgets = [
  {
    name: 'bundle_js_max_bytes',
    pattern: /^assets\/.+\.js$/,
    maxBytes: 360_000,
    kind: 'largest-match',
    rationale: 'Keep the single shipped JS entry under a conservative ceiling after the first state-resource cluster added three prerendered, manifest-backed pages and their shared structured-content inventory.',
  },
  {
    name: 'bundle_css_max_bytes',
    pattern: /^assets\/.+\.css$/,
    maxBytes: 50_000,
    kind: 'largest-match',
    rationale: 'Keep the shared stylesheet under a conservative post-baseline ceiling.',
  },
  {
    name: 'html_entry_max_bytes',
    pattern: /^index\.html$/,
    maxBytes: 67_000,
    kind: 'largest-match',
    rationale: 'Keep the home prerendered entry within a measured ceiling after the state-resource cluster expanded shared nav, footer, crawl, and manifest-backed route inventory.',
  },
  {
    name: 'html_per_page_max_bytes',
    pattern: /\.html$/,
    maxBytes: 73_000,
    kind: 'all-matches',
    rationale: 'Prevent individual prerendered pages from growing well beyond the measured state-launch footprint while allowing evidence-backed local-resource sections and prerendered related-link modules.',
  },
  {
    name: 'asset_total_max_bytes',
    pattern: /^assets\//,
    maxBytes: 405_000,
    kind: 'sum-matches',
    rationale: 'Keep the aggregate shipped JS/CSS bundle volume bounded in CI after the first state-resource cluster raised the shared manifest-backed baseline.',
  },
];

const errors = [];

function fail(message) {
  errors.push(message);
}

async function walk(dir, root = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(filePath, root));
      continue;
    }

    const stat = await fs.stat(filePath);
    files.push({
      file: path.relative(root, filePath).replaceAll(path.sep, '/'),
      bytes: stat.size,
    });
  }
  return files;
}

const files = await walk(distDir).catch(() => null);
if (!files) {
  console.error('Performance validation failed:\n- dist/ is missing. Run the build first.');
  process.exit(1);
}

const results = [];

for (const budget of budgets) {
  const matches = files.filter((file) => budget.pattern.test(file.file));
  if (!matches.length) {
    fail(`${budget.name}: no files matched ${budget.pattern}`);
    continue;
  }

  if (budget.kind === 'largest-match') {
    const largest = matches.reduce((max, file) => (file.bytes > max.bytes ? file : max), matches[0]);
    const passed = largest.bytes <= budget.maxBytes;
    results.push({
      budget: budget.name,
      targetKb: (budget.maxBytes / 1024).toFixed(1),
      actualKb: (largest.bytes / 1024).toFixed(1),
      file: largest.file,
      result: passed ? 'pass' : 'fail',
    });
    if (!passed) {
      fail(`${budget.name}: ${largest.file} is ${(largest.bytes / 1024).toFixed(1)} kB, exceeds ${(budget.maxBytes / 1024).toFixed(1)} kB`);
    }
    continue;
  }

  if (budget.kind === 'all-matches') {
    const overages = matches.filter((file) => file.bytes > budget.maxBytes);
    results.push({
      budget: budget.name,
      targetKb: (budget.maxBytes / 1024).toFixed(1),
      actualKb: overages.length ? (Math.max(...overages.map((file) => file.bytes)) / 1024).toFixed(1) : (Math.max(...matches.map((file) => file.bytes)) / 1024).toFixed(1),
      file: overages[0]?.file || `${matches.length} files checked`,
      result: overages.length ? 'fail' : 'pass',
    });
    overages.forEach((file) => {
      fail(`${budget.name}: ${file.file} is ${(file.bytes / 1024).toFixed(1)} kB, exceeds ${(budget.maxBytes / 1024).toFixed(1)} kB`);
    });
    continue;
  }

  if (budget.kind === 'sum-matches') {
    const total = matches.reduce((sum, file) => sum + file.bytes, 0);
    const passed = total <= budget.maxBytes;
    results.push({
      budget: budget.name,
      targetKb: (budget.maxBytes / 1024).toFixed(1),
      actualKb: (total / 1024).toFixed(1),
      file: `${matches.length} files`,
      result: passed ? 'pass' : 'fail',
    });
    if (!passed) {
      fail(`${budget.name}: matched files total ${(total / 1024).toFixed(1)} kB, exceeds ${(budget.maxBytes / 1024).toFixed(1)} kB`);
    }
  }
}

if (errors.length > 0) {
  console.error('Performance budget validation failed:\n');
  console.table(results);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Performance budget validation passed.');
console.table(results);
