import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const publicLayerFiles = [
  'src/components/flow.js',
  'src/components/shell.js',
  'src/components/ui.js',
  'src/lib/svg.js',
  'src/pages/about.js',
  'src/pages/financing.js',
  'src/pages/home.js',
  'src/pages/how-it-works.js',
  'src/pages/legal.js',
  'src/pages/not-found.js',
  'src/pages/products.js',
  'src/pages/resources.js',
];

const styleFiles = [
  'src/styles.css',
  'src/product.css',
];

const errors = [];

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function fail(message) {
  errors.push(message);
}

const rawColorPattern = /#(?:[0-9A-Fa-f]{3,8})\b|rgba?\(/g;
const staticInlinePattern = /style="([^"]+)"/g;
const allowedInlineFragments = [
  /^width:\s*0;?$/i,
  /^width:\$\{progressPercent\}%;\s*$/i,
  /^top:\d+px;left:\d+px;--r:-?\d+deg;\s*$/i,
  /^position:absolute;top:\d+px;left:\d+px;\s*$/i,
];

for (const file of publicLayerFiles) {
  const content = read(file);

  const colorMatches = [...content.matchAll(rawColorPattern)];
  if (colorMatches.length > 0) {
    const uniqueMatches = [...new Set(colorMatches.map((match) => match[0]))];
    fail(`${file}: disallowed raw color usage in public layer (${uniqueMatches.join(', ')})`);
  }

  for (const match of content.matchAll(staticInlinePattern)) {
    const declaration = match[1].trim();
    const isAllowed = allowedInlineFragments.some((pattern) => pattern.test(declaration));
    if (!isAllowed) {
      fail(`${file}: disallowed static inline style "${declaration}"`);
    }
  }
}

const styles = read('src/styles.css');
const productStyles = read('src/product.css');

const requiredRoleTokens = [
  '--role-surface-base',
  '--role-surface-subtle',
  '--role-surface-inverse',
  '--role-text-primary',
  '--role-text-secondary',
  '--role-text-muted',
  '--role-line-subtle',
  '--role-line-strong',
  '--role-accent-fill',
  '--role-accent-fill-strong',
  '--role-status-error-line',
];

for (const token of requiredRoleTokens) {
  if (!styles.includes(token)) {
    fail(`src/styles.css: missing required semantic token ${token}`);
  }
}

const requiredButtonClasses = [
  '.btn-primary',
  '.btn-ghost',
  '.btn-on-dark',
  '.btn-link',
];

for (const selector of requiredButtonClasses) {
  if (!styles.includes(selector)) {
    fail(`src/styles.css: missing required CTA selector ${selector}`);
  }
}

const requiredSharedPatterns = [
  '.card-shell',
  '.cta-banner-actions',
  '.logo-wordmark',
  '.flow-note-left',
  '.fit-bar-fill',
];

for (const selector of requiredSharedPatterns) {
  if (!(styles.includes(selector) || productStyles.includes(selector))) {
    fail(`shared styles: missing required shared pattern ${selector}`);
  }
}

if (errors.length > 0) {
  console.error('Design token validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Design token validation passed.');
console.table([
  {
    publicLayerFiles: publicLayerFiles.length,
    styleFiles: styleFiles.length,
    roleTokensChecked: requiredRoleTokens.length,
    buttonSelectorsChecked: requiredButtonClasses.length,
  },
]);
