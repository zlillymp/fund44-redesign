import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

test('design system doc records semantic token and release-gate guidance', () => {
  const doc = read('docs/design-system.md');

  assert.match(doc, /semantic role tokens/i);
  assert.match(doc, /CTA Hierarchy/i);
  assert.match(doc, /Component Ownership/i);
  assert.match(doc, /Validation Gate/i);
});

test('shared style layer defines semantic role tokens and CTA selectors', () => {
  const styles = read('src/styles.css');

  [
    '--role-surface-base',
    '--role-surface-subtle',
    '--role-surface-inverse',
    '--role-text-primary',
    '--role-line-subtle',
    '--role-accent-fill',
    '.btn-primary',
    '.btn-ghost',
    '.btn-on-dark',
    '.btn-link',
    '.card-shell',
    '.logo-wordmark',
  ].forEach((needle) => {
    assert.match(styles, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test('public shared component layer avoids raw colors and non-dynamic inline styles', () => {
  const files = [
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

  const allowedInlinePatterns = [
    /^width:\s*0;?$/i,
    /^width:\$\{progressPercent\}%;\s*$/i,
    /^top:\d+px;left:\d+px;--r:-?\d+deg;\s*$/i,
    /^position:absolute;top:\d+px;left:\d+px;\s*$/i,
  ];

  const rawColorPattern = /#(?:[0-9A-Fa-f]{3,8})\b|rgba?\(/g;
  const inlinePattern = /style="([^"]+)"/g;

  for (const file of files) {
    const content = read(file);
    assert.equal(rawColorPattern.test(content), false, `${file} should not contain raw color literals`);

    for (const match of content.matchAll(inlinePattern)) {
      const declaration = match[1].trim();
      const allowed = allowedInlinePatterns.some((pattern) => pattern.test(declaration));
      assert.equal(allowed, true, `${file} should not contain static inline style "${declaration}"`);
    }
  }
});
