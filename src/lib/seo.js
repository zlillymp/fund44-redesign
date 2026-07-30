// SEO / metadata manager — updates <head> per route, injects JSON-LD, and
// exposes a serializable snapshot for build-time prerendering.
import { absoluteUrlForPath, getRouteByPath, routeSite } from './routes.js';
import { entityProfile, robotsForRoute } from './legal.js';

const SITE = routeSite.siteName;
const BASE = routeSite.baseUrl;
const DEFAULT_OG_IMAGE = `${BASE}/og-image.png`;

function inferOgType(route, path) {
  if (path === '/') return 'website';
  return route?.pageType === 'article' ? 'article' : 'website';
}

function routeMetadata({
  title,
  description,
  path = '/',
  robots,
  jsonld = [],
}) {
  const fullTitle = path === '/' ? `${title}` : `${title} · ${SITE}`;
  const canonical = absoluteUrlForPath(path);
  const route = getRouteByPath(path);
  const resolvedRobots = robots || robotsForRoute(route);

  return {
    title: fullTitle,
    description,
    canonical,
    robots: resolvedRobots,
    openGraph: {
      siteName: SITE,
      type: inferOgType(route, path),
      title: fullTitle,
      description,
      url: canonical,
      image: DEFAULT_OG_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      image: DEFAULT_OG_IMAGE,
    },
    jsonld,
  };
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function applyMetadataToDocument(meta) {
  document.title = meta.title;
  upsertMeta('name', 'description', meta.description);
  upsertLink('canonical', meta.canonical);
  upsertMeta('name', 'robots', meta.robots);

  upsertMeta('property', 'og:site_name', meta.openGraph.siteName);
  upsertMeta('property', 'og:type', meta.openGraph.type);
  upsertMeta('property', 'og:title', meta.openGraph.title);
  upsertMeta('property', 'og:description', meta.openGraph.description);
  upsertMeta('property', 'og:url', meta.openGraph.url);
  upsertMeta('property', 'og:image', meta.openGraph.image);

  upsertMeta('name', 'twitter:card', meta.twitter.card);
  upsertMeta('name', 'twitter:title', meta.twitter.title);
  upsertMeta('name', 'twitter:description', meta.twitter.description);
  upsertMeta('name', 'twitter:image', meta.twitter.image);

  if (meta.robots.startsWith('noindex')) {
    upsertMeta('name', 'googlebot', 'noindex,nofollow');
  } else {
    removeMeta('name', 'googlebot');
  }

  document.querySelectorAll('script[data-jsonld="route"]').forEach((s) => s.remove());
  meta.jsonld.forEach((obj) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-jsonld', 'route');
    s.textContent = JSON.stringify(obj, null, 0);
    document.head.appendChild(s);
  });
}

export function buildMeta(input) {
  return routeMetadata(input);
}

export function setMeta(input) {
  const meta = routeMetadata(input);

  if (typeof document !== 'undefined') {
    applyMetadataToDocument(meta);
    document.documentElement.dataset.routeTitle = meta.title;
  }

  globalThis.__FUND44_LAST_META__ = meta;
  return meta;
}

export function readLastMeta() {
  return globalThis.__FUND44_LAST_META__ || null;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function serializeHead(meta) {
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
  ];

  if (meta.robots.startsWith('noindex')) {
    head.push('<meta name="googlebot" content="noindex,nofollow" />');
  }

  head.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`);
  head.push(`<meta property="og:site_name" content="${escapeHtml(meta.openGraph.siteName)}" />`);
  head.push(`<meta property="og:type" content="${escapeHtml(meta.openGraph.type)}" />`);
  head.push(`<meta property="og:title" content="${escapeHtml(meta.openGraph.title)}" />`);
  head.push(`<meta property="og:description" content="${escapeHtml(meta.openGraph.description)}" />`);
  head.push(`<meta property="og:url" content="${escapeHtml(meta.openGraph.url)}" />`);
  head.push(`<meta property="og:image" content="${escapeHtml(meta.openGraph.image)}" />`);
  head.push(`<meta name="twitter:card" content="${escapeHtml(meta.twitter.card)}" />`);
  head.push(`<meta name="twitter:title" content="${escapeHtml(meta.twitter.title)}" />`);
  head.push(`<meta name="twitter:description" content="${escapeHtml(meta.twitter.description)}" />`);
  head.push(`<meta name="twitter:image" content="${escapeHtml(meta.twitter.image)}" />`);

  meta.jsonld.forEach((obj) => {
    head.push(
      `<script type="application/ld+json" data-jsonld="route">${JSON.stringify(obj)}</script>`
    );
  });

  return head.join('\n    ');
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
    ...(entityProfile.legalBusinessName ? { legalName: entityProfile.legalBusinessName } : {}),
    ...(entityProfile.supportPhone ? { telephone: entityProfile.supportPhone } : {}),
    ...(entityProfile.supportEmail ? { email: entityProfile.supportEmail } : {}),
    ...(entityProfile.mailingAddress ? { address: {
      '@type': 'PostalAddress',
      streetAddress: '5900 Balcones Dr, Suite 100',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78731',
      addressCountry: 'US',
    } } : {}),
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
