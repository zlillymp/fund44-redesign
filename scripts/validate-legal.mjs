import { readFileSync } from 'node:fs';
import { entityProfile, indexingPolicy, unresolvedIdentityFields } from '../src/lib/legal.js';

const governedFiles = [
  'src/pages/legal.js',
  'src/pages/home.js',
  'src/pages/about.js',
  'src/pages/how-it-works.js',
  'src/pages/resources.js',
  'content/pages/home.json',
  'content/pages/resources.json',
  'content/articles/sba-7a-vs-504.json',
  'content/articles/preparing-your-documents.json',
  'content/articles/working-capital-vs-term-loan.json',
  'src/components/shell.js',
  'src/components/ui.js',
  'src/lib/seo.js',
  'public/llms.txt',
  'public/humans.txt',
  'index.html',
];

const blockedPatterns = [
  { pattern: /75\+\s+lender integrations/i, label: 'unsupported lender-count wording' },
  { pattern: /\bLendflow\b/i, label: 'unverified public vendor naming' },
  { pattern: /faster-funding\.com/i, label: 'legacy sameAs reference' },
  { pattern: /Preview — legal review required/i, label: 'scattered preview-only legal banner' },
  { pattern: /takes a few minutes|it takes minutes|in a few minutes/i, label: 'exact process-time promise' },
  { pattern: /no black box|opaque scoring|what pays us most|secure flow|secure experience/i, label: 'blocked governance/security/ranking claim' },
  { pattern: /\$50K-\$5M small-business financing/i, label: 'unapproved public financing-range eyebrow' },
  { pattern: /Curated 40-50 lender network/i, label: 'paraphrased network-count badge outside approved disclosure copy' },
  { pattern: /One application, many routes/i, label: 'strong one-application routes claim' },
  { pattern: /One borrower journey feeds every relevant product path/i, label: 'unsupported universal routing claim' },
  { pattern: /share your profile and documents once/i, label: 'unsupported single-share claim' },
  { pattern: /Apply once and get matched to relevant paths from a network of lenders/i, label: 'unsupported live-matching CTA claim' },
  { pattern: /Continue with one shared flow/i, label: 'unsupported shared-flow wording' },
];

const failures = [];

if (entityProfile.sameAs.length !== 0) {
  failures.push('sameAs must remain empty until verified.');
}

if (indexingPolicy.allowIndexing) {
  console.warn('Warning: indexing policy is in production mode. Ensure this is intentional for the current environment.');
}

if (unresolvedIdentityFields.length !== 4) {
  failures.push(`Expected the four unresolved identity fields to remain TBD, found ${unresolvedIdentityFields.length}.`);
}

for (const file of governedFiles) {
  const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  for (const { pattern, label } of blockedPatterns) {
    if (pattern.test(content)) {
      failures.push(`${file}: contains ${label}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Legal governance validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Legal governance validation passed.');
console.table([
  {
    env: indexingPolicy.env,
    allowIndexing: indexingPolicy.allowIndexing,
    unresolvedIdentityFields: unresolvedIdentityFields.length,
    verifiedSameAs: entityProfile.sameAs.length,
  },
]);
