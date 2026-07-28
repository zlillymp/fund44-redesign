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

function renderUseCase(routeId) {
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
    contextProof: getContextProofCopy(FUNNEL_CONTEXT_KINDS.useCase),
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'use_case_page_hero',
      productContextRouteId: content.routeId,
      funnelContextKind: FUNNEL_CONTEXT_KINDS.useCase,
    },
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Best-fit products')}
    <h2 class="h2 reveal mt-4 mb-8">${content.bestFitHeading}</h2>
    ${renderRouteCards(content.routeId, content.bestFitProducts, {
      analyticsCtaId: 'use_case_best_fit_link',
      analyticsPlacement: 'use_case_best_fit',
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
      analyticsCtaId: 'use_case_alternative_link',
      analyticsPlacement: 'use_case_alternative',
      eyebrowLabel: 'Compare this if the goal shifts',
    })}
    <div class="mt-8">${disclosure(content.sectionDisclosureHtml, {
      disclosureId: `${content.routeId}_section_disclosure`,
      disclosureContext: `${content.routeId}_comparison`,
    })}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'use_case_cta_banner',
    productContextRouteId: content.routeId,
    funnelContextKind: FUNNEL_CONTEXT_KINDS.useCase,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow(`${content.shortLabel} FAQ`)}
    <h2 class="h2 reveal mt-4 mb-8">Questions about ${content.shortLabel}</h2>
    ${faqBlock(faqItems, content.measurement.faqGroup)}
  </section>
  `;
}

export function buyBusinessUseCase() {
  return renderUseCase('buy_a_business');
}

export function ownerOccupiedRealEstateUseCase() {
  return renderUseCase('owner_occupied_real_estate');
}

export function cashFlowNeedsUseCase() {
  return renderUseCase('cash_flow_needs');
}

export function equipmentPurchaseUseCase() {
  return renderUseCase('equipment_purchase');
}

export function businessExpansionUseCase() {
  return renderUseCase('business_expansion');
}

export function refinanceBusinessDebtUseCase() {
  return renderUseCase('refinance_business_debt');
}
