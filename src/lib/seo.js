// SEO / metadata manager — updates <head> per route, injects JSON-LD.
import { absoluteUrlForPath, getRouteByPath, routeSite } from './routes.js';
import { entityProfile, robotsForRoute } from './legal.js';

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

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

export function setMeta({ title, description, path = '/', robots, jsonld = [] }) {
  const fullTitle = path === '/' ? `${title}` : `${title} · ${SITE}`;
  document.title = fullTitle;
  const canonical = absoluteUrlForPath(path);
  const route = getRouteByPath(path);
  const resolvedRobots = robots || robotsForRoute(route);
  upsertMeta('name', 'description', description);
  upsertLink('canonical', canonical);
  upsertMeta('name', 'robots', resolvedRobots);
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
  if (resolvedRobots.startsWith('noindex')) {
    upsertMeta('name', 'googlebot', 'noindex,nofollow');
  } else {
    removeMeta('name', 'googlebot');
  }

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
      'Fund44 is a small-business capital marketplace that curates third-party financing paths for small-business owners.',
    slogan: 'One application. More ways to fund your business.',
    ...(entityProfile.hasVerifiedSameAs ? { sameAs: entityProfile.sameAs } : {}),
  }),
  financialService: () => ({
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Fund44',
    url: BASE,
    description:
      'A capital marketplace that helps small-business owners review third-party financing paths. Fund44 is not a lender.',
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
  article: ({ title, description, path, date, reviewedDate, authorName, reviewerName }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(date ? { datePublished: date } : {}),
    ...(reviewedDate || date ? { dateModified: reviewedDate || date } : {}),
    ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
    ...(reviewerName ? { editor: { '@type': 'Person', name: reviewerName } } : {}),
    mainEntityOfPage: absoluteUrlForPath(path),
  }),
};

export function routeRobots(route) {
  return robotsForRoute(route);
}
