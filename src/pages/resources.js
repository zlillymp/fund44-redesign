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
        <a href="${hrefForSlug(article.slug)}" class="card card-hover article-card">
          <div class="ac-thumb">${renderThumb(article.thumbKey)}</div>
          <div class="ac-cat">${article.category}</div>
          <h3>${article.title}</h3>
          <p>${article.metaDescription}</p>
          <div class="ac-meta">${article.readTimeMinutes} min read</div>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(hub.ctaBanner.heading, hub.ctaBanner.subheading)}

  ${relatedLinksModule(linkModule)}
  `;
}

export function article(slug) {
  const content = getArticles().find((item) => item.slug === slug);
  if (!content) return notFound(slug);

  const routeCrumbs = getBreadcrumbs(content.routeId);
  const faqItems = content.commonQuestions.map((item) => ({ q: item.question, a: item.answer }));
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
  <section class="section-tight wrap" style="padding-top:clamp(2rem,4vw,3.5rem)">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      <a href="${hrefForRoute('home')}">Home</a><span class="sep">/</span>
      <a href="${hrefForRoute('resources')}">Resources</a><span class="sep">/</span>
      <span aria-current="page" style="max-width:40ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${content.title}</span>
    </nav>
    <div class="mt-6"><span class="eyebrow reveal">${content.category}</span></div>
    <h1 class="h1 reveal mt-4" style="max-width:22ch">${content.title}</h1>
    <div class="ac-meta reveal mt-4" style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)">${content.readTimeMinutes} min read</div>
  </section>

  <section class="section-tight wrap wrap-default">
    <div class="ac-thumb reveal" style="aspect-ratio:2/1;max-width:100%;margin-bottom:var(--space-10)">${renderThumb(content.thumbKey)}</div>
    <article class="prose reveal mx-auto">${renderBodyBlocks(content.bodyBlocks)}</article>

    <div class="mt-12" style="max-width:68ch;margin-inline:auto">${disclosure(content.sectionDisclosureHtml)}</div>

    <div class="mt-12" style="max-width:68ch;margin-inline:auto">
      ${eyebrow('Questions')}
      <h2 class="h2 reveal mt-4 mb-8" style="font-size:var(--text-xl)">Related questions</h2>
      ${faqBlock(faqItems)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Keep reading')}
    <h2 class="h2 reveal mt-4 mb-8" style="font-size:var(--text-xl)">More from the learning hub</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${others.map((item) => `
        <a href="${hrefForContentId(item.id)}" class="card card-hover article-card">
          <div class="ac-cat">${item.category}</div>
          <h3>${item.title}</h3>
          <p>${item.metaDescription}</p>
          <span class="mt-4 accent-text" style="font-weight:600;font-size:var(--text-sm);display:inline-flex;gap:.4rem;align-items:center;margin-top:var(--space-4)">Read ${icon.arrow}</span>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading)}

  ${relatedLinksModule(linkModule)}
  `;
}
