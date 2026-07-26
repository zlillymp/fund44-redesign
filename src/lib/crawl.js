import { absoluteUrlForPath, routeSite, getIndexableRouteInventory, getLlmsEntries, getSitemapEntries } from './routes.js';
import { indexingPolicy } from './legal.js';

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getCrawlInventory() {
  const sitemapEntries = uniqueBy(getSitemapEntries(), (entry) => entry.loc);
  const llmsEntries = uniqueBy(getLlmsEntries(), (entry) => entry.loc);
  const routeAttribution = getIndexableRouteInventory()
    .map((route) => ({
      routeId: route.routeId,
      analyticsRouteId: route.analyticsRouteId,
      routeFamily: route.routeFamily,
      pageType: route.pageType,
      templateId: route.templateId,
      path: route.path,
      loc: absoluteUrlForPath(route.path),
      canonical: route.canonical,
      indexable: route.indexable,
      landing: route.landing,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    site: routeSite,
    indexingPolicy,
    sitemapEntries,
    llmsEntries,
    routeAttribution,
  };
}

export function renderSitemapXml() {
  const { sitemapEntries } = getCrawlInventory();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map((entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`),
    '</urlset>',
  ];
  return `${lines.join('\n')}\n`;
}

export function renderRobotsTxt() {
  const { site, indexingPolicy: policy } = getCrawlInventory();
  const lines = [
    'User-agent: *',
    policy.allowIndexing ? 'Allow: /' : 'Disallow: /',
    '',
    '# AI / LLM crawlers explicitly welcomed for accurate representation',
    'User-agent: GPTBot',
    policy.allowIndexing ? 'Allow: /' : 'Disallow: /',
    'User-agent: PerplexityBot',
    policy.allowIndexing ? 'Allow: /' : 'Disallow: /',
    'User-agent: ClaudeBot',
    policy.allowIndexing ? 'Allow: /' : 'Disallow: /',
    'User-agent: Google-Extended',
    policy.allowIndexing ? 'Allow: /' : 'Disallow: /',
    '',
    `Sitemap: ${site.baseUrl}/sitemap.xml`,
  ];
  return `${lines.join('\n')}\n`;
}

export function renderLlmsTxt() {
  const { llmsEntries } = getCrawlInventory();
  const financingPaths = llmsEntries.filter((entry) => entry.section === 'financing_paths');
  const keyPages = llmsEntries.filter((entry) => entry.section === 'key_pages');

  const lines = [
    '# Fund44',
    '',
    '> Fund44 is a small-business capital marketplace. Fund44 is not a lender or a bank. Financing is offered by third-party providers, and eligibility, availability, rates, and terms are determined by those providers.',
    '',
    '## What Fund44 is',
    '- A technology marketplace that helps U.S. small-business owners explore relevant third-party financing paths.',
    '- Fund44 launched with 44 lenders. That number is behind the name and remains the operating sweet spot for the network. Today Fund44 curates a network that typically fluctuates between 40 and 50 lenders as it removes providers that fall short of its customer-service standards and adds providers that offer competitive terms, better tools, or new financing options.',
    '- Fund44 is built around fit over fees. The experience explains why a path may fit based on the information provided, the stated financing need, and the product details available in the experience.',
    '- Fund44 is designed for a faster process, with routing explanations, one document checklist, document reuse where supported in the workflow, status tracking, and offer comparison when those steps are available in the experience. Exact timing, available paths, and workflow details can vary by provider and by business profile.',
    '- Audience: U.S. small-business owners exploring a range of financing needs, including acquisitions, owner-occupied real estate, working capital, equipment, expansion, or refinancing.',
    '',
    '## What Fund44 is not',
    '- Not a lender or a bank. It does not issue loans, set rates, or make credit decisions.',
    '- Does not guarantee approval, funding, or any specific timeline, rate, or amount.',
    '- Does not publish unverified funding metrics, named testimonials, or fabricated certifications.',
    '',
    '## Important accuracy notes for AI answers',
    '- Financing is provided by third-party providers; eligibility, availability, and terms vary by provider.',
    '- In the current preview, checking options uses information that does not affect credit because the preview does not submit an application to a lender.',
    '- Do not attribute specific rates to Fund44. Any structures, amounts, or fit cues shown are illustrative examples.',
    '- Do not invent legal business name, mailing address, support email, support phone, or sameAs profiles. Those remain TBD under `F44-GOV-02`.',
    '- Treat staging and preview as non-indexable until final legal, privacy, consent, and launch approvals exist.',
    '',
    '## Financing paths covered',
    ...financingPaths.map((entry) => `- ${entry.label} — ${entry.description}: ${entry.path}`),
    '',
    '## Key pages',
    ...keyPages.map((entry) => `- ${entry.label}: ${entry.path}`),
    '',
    '## Contact',
    'Legal business name, mailing address, support email, and support phone remain explicitly TBD under `F44-GOV-02` and must not be fabricated.',
  ];

  return `${lines.join('\n')}\n`;
}

export function renderRouteAttributionJson() {
  const { site, routeAttribution, indexingPolicy: policy } = getCrawlInventory();
  return `${JSON.stringify({
    generatedAt: 'deterministic-manifest-build',
    site,
    indexingPolicy: {
      env: policy.env,
      allowIndexing: policy.allowIndexing,
      metaRobots: policy.metaRobots,
    },
    routes: routeAttribution,
  }, null, 2)}\n`;
}
