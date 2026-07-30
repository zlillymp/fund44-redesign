import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import {
  pageHero,
  ctaBanner,
  faqBlock,
  disclosure,
  eyebrow,
  answerBlock,
  relatedLinksModule,
  sectionListCard,
  sectionSummaryCard,
  featItem,
} from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId, hrefForRoute } from '../lib/routes.js';
import { getContentByRouteId } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';
import { FUNNEL_CONTEXT_KINDS, getContextProofCopy } from '../lib/eligibility/model.js';

function renderRouteCards(routeId, items, { analyticsCtaId, analyticsPlacement, eyebrowLabel }) {
  return `
    <div class="grid g-3 reveal" data-stagger>
      ${items.map((item) => `
        <a
          href="${hrefForRoute(item.routeId)}"
          class="card card-hover card-stack"
          data-analytics-cta-id="${analyticsCtaId}"
          data-analytics-cta-label="${item.title}"
          data-analytics-cta-type="inline"
          data-analytics-cta-placement="${analyticsPlacement}"
          data-destination-route-id="${item.routeId}"
          data-link-context="${routeId}:${analyticsPlacement}"
        >
          <span class="fi-mark fi-mark-lg">${icon[item.iconKey] || icon.route}</span>
          <span class="eyebrow mt-4">${eyebrowLabel}</span>
          <h3 class="h3 title-lg mt-4">${item.title}</h3>
          <p class="muted text-body-sm grow">${item.description}</p>
          <span class="accent-text btn-link mt-6">Open this path ${icon.arrow}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function renderSupportCards(routeId, items, { analyticsPlacement, eyebrowLabel }) {
  return `
    <div class="grid g-3 reveal" data-stagger>
      ${items.map((item) => `
        <article class="card card-stack">
          <div class="feat-item">
            <span class="fi-mark fi-mark-lg">${icon[item.iconKey] || icon.route}</span>
            <div>
              <span class="eyebrow">${eyebrowLabel}</span>
              <h3 class="title-lg mt-4">${item.title}</h3>
              <p class="muted text-body-sm mt-4">${item.description}</p>
            </div>
          </div>
          <div class="wrap-btns mt-6">
            <a
              href="${item.resourceUrl}"
              class="accent-text btn-link copy-accent-link-row"
              target="_blank"
              rel="noreferrer"
            >${item.resourceLabel} ${icon.arrow}</a>
            ${item.relatedRouteId ? `
              <a
                href="${hrefForRoute(item.relatedRouteId)}"
                class="accent-text btn-link copy-accent-link-row"
                data-link-context="${routeId}:${analyticsPlacement}:related_route"
                data-destination-route-id="${item.relatedRouteId}"
              >Related Fund44 path ${icon.arrow}</a>
            ` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderContextCards(items) {
  return `
    <div class="grid g-3 reveal" data-stagger>
      ${items.map((item) => `<div class="card">${featItem(icon[item.iconKey] || icon.route, item.title, item.description)}</div>`).join('')}
    </div>
  `;
}

function renderState(routeId) {
  const content = getContentByRouteId(routeId);
  const crumbs = getBreadcrumbs(routeId);
  const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(routeId);

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
    contextProof: getContextProofCopy(FUNNEL_CONTEXT_KINDS.state),
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'state_page_hero',
      productContextRouteId: content.routeId,
      funnelContextKind: FUNNEL_CONTEXT_KINDS.state,
    },
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Best-fit products')}
    <h2 class="h2 reveal mt-4 mb-8">${content.bestFitHeading}</h2>
    ${renderRouteCards(content.routeId, content.bestFitProducts, {
      analyticsCtaId: 'state_best_fit_link',
      analyticsPlacement: 'state_best_fit',
      eyebrowLabel: 'Common first comparison',
    })}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Fit and caution')}
    <h2 class="h2 reveal mt-4 mb-8">${content.whoItFitsHeading}</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${sectionListCard(content.whoItFits)}
      ${sectionListCard(content.whenItMayNotFit)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('State support resources')}
    <h2 class="h2 reveal mt-4 mb-8">${content.stateSupportHeading}</h2>
    ${renderSupportCards(content.routeId, content.stateSupportCards, {
      analyticsPlacement: 'state_support_resources',
      eyebrowLabel: 'Official or partner resource',
    })}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('State context')}
    <h2 class="h2 reveal mt-4 mb-8">${content.stateContextHeading}</h2>
    ${renderContextCards(content.stateContextCards)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Prep and context')}
    <h2 class="h2 reveal mt-4 mb-8">Typical documents and how Fund44 fits</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${sectionListCard(content.typicalDocuments)}
      ${sectionSummaryCard(content.howFund44Fits)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Alternatives to compare')}
    <h2 class="h2 reveal mt-4 mb-8">${content.alternativePathsHeading}</h2>
    ${renderRouteCards(content.routeId, content.alternativePaths, {
      analyticsCtaId: 'state_alternative_link',
      analyticsPlacement: 'state_alternative',
      eyebrowLabel: 'Compare this if the need shifts',
    })}
    <div class="mt-8">${disclosure(content.sectionDisclosureHtml, {
      disclosureId: `${content.routeId}_section_disclosure`,
      disclosureContext: `${content.routeId}_comparison`,
    })}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'state_cta_banner',
    productContextRouteId: content.routeId,
    funnelContextKind: FUNNEL_CONTEXT_KINDS.state,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow(`${content.shortLabel} FAQ`)}
    <h2 class="h2 reveal mt-4 mb-8">Questions about ${content.shortLabel}</h2>
    ${faqBlock(faqItems, content.measurement.faqGroup)}
  </section>
  `;
}

export function californiaStatePage() {
  return renderState('california_sba_loans');
}

export function floridaStatePage() {
  return renderState('florida_sba_loans');
}

export function newYorkStatePage() {
  return renderState('new_york_sba_loans');
}

export function texasStatePage() {
  return renderState('texas_sba_loans');
}
