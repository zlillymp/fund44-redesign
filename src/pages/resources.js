import { icon, thumb } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, eyebrow, disclosure, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId, hrefForRoute, hrefForSlug } from '../lib/routes.js';
import { getArticles, getContentById, getResourceHub } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';
import { notFound } from './not-found.js';

const CRUMBS = getBreadcrumbs('resources');

function renderThumb(thumbKey) {
  return thumb[thumbKey] || thumb.grid;
}

function renderBodyBlocks(blocks) {
  return blocks.map((block) => {
    if (block.type === 'heading') {
      const level = Math.min(Math.max(block.level, 2), 6);
      return `<h${level}>${block.text}</h${level}>`;
    }
    return block.html;
  }).join('');
}

export function resources() {
  const hub = getResourceHub();
  const cards = hub.articleIds.map((contentId) => getContentById(contentId));
  const faqItems = hub.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(hub.routeId);

  setMeta({
    title: hub.metaTitle,
    description: hub.metaDescription,
    path: hrefForContentId(hub.id),
    jsonld: [ld.breadcrumb(CRUMBS)],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: hub.hero.eyebrow,
    title: hub.hero.title,
    lead: hub.hero.lead,
    cta: false,
  })}

  <section class="section-tight wrap">
    <div class="grid g-3 reveal" data-stagger>
      ${cards.map((article) => `
        <a href="${hrefForSlug(article.slug)}" class="card card-hover article-card" data-analytics-cta-id="resources_article_card" data-analytics-cta-label="${article.title}" data-analytics-cta-type="inline" data-analytics-cta-placement="resources_hub_cards" data-destination-route-id="${article.routeId}" data-destination-content-id="${article.id}">
          <div class="ac-thumb">${renderThumb(article.thumbKey)}</div>
          <div class="ac-cat">${article.category}</div>
          <h3>${article.title}</h3>
          <p>${article.metaDescription}</p>
          <div class="ac-meta">${article.readTimeMinutes} min read</div>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(hub.ctaBanner.heading, hub.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'resources_hub_cta_banner',
    productContextRouteId: hub.routeId,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow('Learning hub FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">Before you start comparing paths</h2>
    ${faqBlock(faqItems, hub.measurement.faqGroup)}
  </section>
  `;
}

export function article(slug) {
  const content = getArticles().find((item) => item.slug === slug);
  if (!content) return notFound(slug);

  const routeCrumbs = getBreadcrumbs(content.routeId);
  const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(content.routeId);

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForSlug(slug),
    jsonld: [
      ld.breadcrumb(routeCrumbs),
      ld.article({
        title: content.title,
        description: content.metaDescription,
        path: hrefForSlug(slug),
        date: content.publishedDate,
        reviewedDate: content.reviewedDate,
        authorName: content.contributors.authorId || null,
        reviewerName: content.contributors.reviewerId || null,
      }),
      ld.faq(faqItems),
    ],
  });

  const others = content.relatedIds
    .map((id) => getContentById(id))
    .filter((item) => item.templateId === 'editorial_article')
    .slice(0, 2);

  return `
  <section class="section-tight wrap section-page-head">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      <a href="${hrefForRoute('home')}" data-link-context="breadcrumb" data-destination-route-id="home">Home</a><span class="sep">/</span>
      <a href="${hrefForRoute('resources')}" data-link-context="breadcrumb" data-destination-route-id="resources">Resources</a><span class="sep">/</span>
      <span aria-current="page" class="article-crumb-current">${content.title}</span>
    </nav>
    <div class="mt-6"><span class="eyebrow reveal">${content.category}</span></div>
    <h1 class="h1 reveal mt-4 title-section">${content.title}</h1>
    <div class="ac-meta reveal mt-4 article-hero-meta">${content.readTimeMinutes} min read</div>
  </section>

  <section class="section-tight wrap wrap-default">
    <div class="ac-thumb reveal article-thumb-wide">${renderThumb(content.thumbKey)}</div>
    <article class="prose reveal mx-auto">${renderBodyBlocks(content.bodyBlocks)}</article>

    <div class="mt-12 copy-reading">${disclosure(content.sectionDisclosureHtml, {
      disclosureId: `${content.routeId}_section_disclosure`,
      disclosureContext: `${content.routeId}_article`,
    })}</div>

    <div class="mt-12 copy-reading">
      ${eyebrow('Questions')}
      <h2 class="h2 reveal mt-4 mb-8 title-xl">Related questions</h2>
      ${faqBlock(faqItems, content.measurement.faqGroup)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Keep reading')}
    <h2 class="h2 reveal mt-4 mb-8 title-xl">More from the learning hub</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${others.map((item) => `
        <a href="${hrefForContentId(item.id)}" class="card card-hover article-card" data-analytics-cta-id="article_keep_reading" data-analytics-cta-label="${item.title}" data-analytics-cta-type="inline" data-analytics-cta-placement="article_keep_reading" data-destination-route-id="${item.routeId}" data-destination-content-id="${item.id}">
          <div class="ac-cat">${item.category}</div>
          <h3>${item.title}</h3>
          <p>${item.metaDescription}</p>
          <span class="mt-4 accent-text btn-link article-link-row">Read ${icon.arrow}</span>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'article_cta_banner',
    productContextRouteId: content.routeId,
  })}

  ${relatedLinksModule(linkModule)}
  `;
}
