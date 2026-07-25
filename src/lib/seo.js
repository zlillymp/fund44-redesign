// SEO / metadata manager — updates <head> per route, injects JSON-LD.
import { absoluteUrlForPath, routeSite } from './routes.js';

const SITE = routeSite.siteName;
const BASE = routeSite.baseUrl;

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

export function setMeta({ title, description, path = '/', jsonld = [] }) {
  const fullTitle = path === '/' ? `${title}` : `${title} · ${SITE}`;
  document.title = fullTitle;
  const canonical = absoluteUrlForPath(path);
  upsertMeta('name', 'description', description);
  upsertLink('canonical', canonical);
  // Open Graph
  upsertMeta('property', 'og:site_name', SITE);
  upsertMeta('property', 'og:type', path === '/' ? 'website' : 'article');
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:image', `${BASE}/og-image.png`);
  // Twitter
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', description);

  // JSON-LD — clear previous route-scoped scripts
  document.querySelectorAll('script[data-jsonld="route"]').forEach((s) => s.remove());
  jsonld.forEach((obj) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-jsonld', 'route');
    s.textContent = JSON.stringify(obj, null, 0);
    document.head.appendChild(s);
  });
}

// ---- JSON-LD builders ----
export const ld = {
  org: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fund44',
    url: BASE,
    description:
      'Fund44 is a small-business capital marketplace. Owners apply once and are matched to relevant financing paths from third-party lenders using embedded lending infrastructure.',
    slogan: 'One application. More ways to fund your business.',
    sameAs: ['https://faster-funding.com'],
  }),
  financialService: () => ({
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Fund44',
    url: BASE,
    description:
      'A capital marketplace that matches U.S. small-business owners to third-party financing options including SBA 7(a), SBA 504, business acquisition loans, term loans, lines of credit, equipment financing, and invoice factoring. Fund44 is not a lender.',
    areaServed: 'US',
    disambiguatingDescription:
      'Fund44 is not a lender or a bank. Financing is provided by third-party lenders; eligibility and terms vary by provider.',
  }),
  breadcrumb: (crumbs) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absoluteUrlForPath(c.path),
    })),
  }),
  faq: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  }),
  article: ({ title, description, path, date }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Organization', name: 'Fund44' },
    publisher: { '@type': 'Organization', name: 'Fund44' },
    mainEntityOfPage: absoluteUrlForPath(path),
  }),
};
