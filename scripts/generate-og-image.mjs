// Generates public/og-image.png (1200x630), the default social card referenced
// by src/lib/seo.js (DEFAULT_OG_IMAGE = `${BASE}/og-image.png`) on every route.
//
// Guardrails honored here:
// - Copy is reused verbatim from approved sources only: the site wordmark
//   (`site.siteName` in content/manifest.mjs, rendered like the header wordmark
//   in src/components/shell.js: `Fund<span class="logo-accent">44</span>`) and
//   the approved home hero title from content/pages/home.json (`hero.title`).
//   No other text, claims, rates, timelines, or outcomes appear in the image.
// - Colors and font stacks are parsed from the semantic design tokens in
//   src/styles.css at generation time (first occurrence = light theme :root),
//   with `var()` chains resolved. No invented palette values.
// - Self-contained render: inline CSS only, no network requests. Font tokens
//   fall back through their own declared stacks (system-ui) since the
//   Fontshare-hosted families are not fetched at build time.
//
// Re-runnable and deterministic for a given machine/browser: fixed viewport
// 1200x630 at deviceScaleFactor 1, static content, no animation, screenshot
// via the repo's installed Playwright chromium.
//
// Usage: node scripts/generate-og-image.mjs

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { routeManifest } from '../content/manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'src', 'styles.css');
const homeContentPath = path.join(repoRoot, 'content', 'pages', 'home.json');
const outputPath = path.join(repoRoot, 'public', 'og-image.png');

// ---- Parse design tokens from src/styles.css ------------------------------
// First occurrence of each custom property wins: the light-theme :root block
// appears before the dark-theme overrides in the file.
function parseTokens(css) {
  const tokens = new Map();
  const declarations = css.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g);
  for (const [, name, value] of declarations) {
    if (!tokens.has(name)) tokens.set(name, value.trim());
  }
  return tokens;
}

// Resolve simple `var(--x)` chains (e.g. --role-accent-text -> --accent-deep).
function resolveToken(tokens, name, depth = 0) {
  if (depth > 8) throw new Error(`Token chain too deep resolving ${name}`);
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`Token ${name} not found in src/styles.css`);
  const ref = value.match(/^var\((--[a-zA-Z0-9-]+)\)$/);
  return ref ? resolveToken(tokens, ref[1], depth + 1) : value;
}

const tokens = parseTokens(readFileSync(stylesPath, 'utf8'));

// Semantic tokens used by the card (light theme resolutions as of writing):
// --role-canvas -> --bg (#F6F5EF), --role-text-primary -> --ink (#10110F),
// --role-accent-text -> --accent-deep (#A6D019) as used by .logo-accent,
// --role-accent-fill -> --accent (#C4F135, Fund44 lime),
// --font-display ('Switzer', 'Satoshi', system-ui, sans-serif),
// --font-weight-semibold (600), --tracking-tight (-0.04em).
const canvas = resolveToken(tokens, '--role-canvas');
const textPrimary = resolveToken(tokens, '--role-text-primary');
const accentText = resolveToken(tokens, '--role-accent-text');
const accentFill = resolveToken(tokens, '--role-accent-fill');
const fontDisplay = resolveToken(tokens, '--font-display');
const weightSemibold = resolveToken(tokens, '--font-weight-semibold');
const trackingTight = resolveToken(tokens, '--tracking-tight');

// ---- Approved copy, verbatim -----------------------------------------------
const home = JSON.parse(readFileSync(homeContentPath, 'utf8'));
const heroTitleHtml = home.hero?.title;
if (!heroTitleHtml) throw new Error('content/pages/home.json hero.title is missing');

const siteName = routeManifest.site.siteName;
if (siteName !== 'Fund44') {
  throw new Error(`Unexpected siteName "${siteName}" — wordmark treatment assumes Fund44`);
}
// Mirror the header wordmark markup from src/components/shell.js:
// Fund<span class="logo-accent">44</span>
const wordmarkHtml = siteName.replace(/44$/, '<span class="logo-accent">44</span>');

// ---- Card template (inline CSS only, no external requests) -----------------
// Title treatment mirrors the site h1 (.h-hero in src/styles.css: display
// font, semibold, tight negative tracking); pixel sizes are card-local since
// the card is a fixed 1200x630 raster, not a fluid page.
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  .card {
    width: 1200px;
    height: 630px;
    background: ${canvas}; /* --role-canvas -> --bg */
    color: ${textPrimary}; /* --role-text-primary -> --ink */
    font-family: ${fontDisplay}; /* --font-display */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 76px 80px 88px;
    position: relative;
  }
  .wordmark {
    font-size: 54px;
    font-weight: ${weightSemibold}; /* --font-weight-semibold */
    letter-spacing: ${trackingTight}; /* --tracking-tight */
  }
  .logo-accent {
    color: ${accentText}; /* --role-accent-text -> --accent-deep */
  }
  .title {
    font-size: 96px;
    font-weight: ${weightSemibold}; /* --font-weight-semibold, mirrors .h-hero */
    letter-spacing: -0.045em; /* mirrors .h-hero letter-spacing */
    line-height: 1.02;
    max-width: 980px;
    text-wrap: balance;
  }
  .title b { font-weight: 700; }
  .accent-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 14px;
    background: ${accentFill}; /* --role-accent-fill -> --accent */
  }
</style>
</head>
<body>
  <div class="card">
    <div class="wordmark">${wordmarkHtml}</div>
    <h1 class="title">${heroTitleHtml}</h1>
    <div class="accent-bar"></div>
  </div>
</body>
</html>`;

// ---- Render and screenshot --------------------------------------------------
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: 'load' });
  const buffer = await page.screenshot({ path: outputPath, type: 'png' });
  console.log(
    `Wrote ${path.relative(repoRoot, outputPath)} (1200x630, ${(buffer.length / 1024).toFixed(1)} kB)`
  );
} finally {
  await browser.close();
}
