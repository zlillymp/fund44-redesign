import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock, featItem, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

function renderListItems(items) {
  return items.map((item) => `
    <li style="display:flex;gap:var(--space-3);align-items:flex-start">
      <span style="color:var(--accent-deep);flex-shrink:0;margin-top:2px">${icon.check}</span>
      <span style="color:var(--ink-2)">${item}</span>
    </li>
  `).join('');
}

function renderProgramPage(contentId) {
  const content = getContentById(contentId);
  const crumbs = getBreadcrumbs(content.routeId);
  const faqItems = content.commonQuestions.map((item) => ({ q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(content.routeId);

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForContentId(content.id),
    jsonld: [ld.breadcrumb(crumbs), ld.faq(faqItems)],
  });

  return `
  ${pageHero({
    crumbs,
    eyebrow: content.hero.eyebrow,
    title: content.hero.title,
    lead: content.hero.lead,
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'program_page_hero',
      productContextRouteId: content.routeId,
      productContextTitle: content.title,
    },
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    <div class="feature-split">
      <div class="fs-text">
        ${eyebrow('When it fits')}
        <h2 class="h2 reveal mt-4">${content.whoItFitsHeading}</h2>
        <ul role="list" class="mt-6 reveal" style="display:flex;flex-direction:column;gap:var(--space-4)">
          ${renderListItems(content.whoItFits.items)}
        </ul>
      </div>
      <div class="fs-viz">
        <div class="card reveal" style="background:var(--surface)">
          <div class="eyebrow" style="margin-bottom:var(--space-4)">At a glance</div>
          ${content.glanceSpecs.map(([label, value]) => `
            <div style="display:flex;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--line);font-size:var(--text-sm)">
              <span class="muted">${label}</span>
              <b style="font-weight:600;text-align:right;max-width:60%">${value}</b>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Eligibility considerations')}
    <h2 class="h2 reveal mt-4 mb-8">${content.eligibilityHeading}</h2>
    <div class="grid g-3 reveal" data-stagger>
      ${content.eligibilityCards.map((card) => `<div class="card">${featItem(icon[card.iconKey], card.title, card.description)}</div>`).join('')}
    </div>
    <div class="mt-8">${disclosure(content.sectionDisclosureHtml)}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'program_cta_banner',
    productContextRouteId: content.routeId,
    productContextTitle: content.title,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow(`${content.shortLabel} FAQ`)}
    <h2 class="h2 reveal mt-4 mb-8">Questions about ${content.shortLabel}</h2>
    ${faqBlock(faqItems)}
  </section>
  `;
}

export function sba7a() {
  return renderProgramPage('page_sba_7a');
}

export function sba504() {
  return renderProgramPage('page_sba_504');
}

export function acquisition() {
  return renderProgramPage('page_business_acquisition');
}

export function workingCapital() {
  return renderProgramPage('page_working_capital');
}
