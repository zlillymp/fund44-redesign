import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, primaryCta, secondaryCta, ctaBanner, disclosure, faqBlock, matchDashboard, routingWaterfall, docChecklist, statusTimeline, offerComparison, chaosToPath, featItem, relatedLinksModule } from '../components/ui.js';
import { hrefForContentId } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

function renderFeatureItems(items) {
  return items.map((item) => featItem(icon[item.iconKey], item.title, item.description)).join('');
}

export function home() {
  const content = getContentById('page_home');
  const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
  const productCards = content.productCardIds.map((id) => getContentById(id));
  const linkModule = getLinkModuleForRoute(content.routeId);

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForContentId(content.id),
    jsonld: [ld.org(), ld.financialService(), ld.faq(faqItems)],
  });

  return `
  <section class="section section-hero-home">
    <div class="tex-dots hero-dots-mask"></div>
    <div class="wrap hero-layer">
      ${eyebrow(content.hero.eyebrow)}
      <h1 class="h-hero reveal wt-split mt-6 max-measure-hero">
        ${content.hero.title}
      </h1>
      <p class="lead reveal mt-6 text-body-lg">
        ${content.hero.lead}
      </p>
      <div class="wrap-btns reveal mt-8">
        ${primaryCta('Preview funding paths', {
          ctaId: 'preview_funding_paths',
          startSurface: 'home_hero_primary',
        })}
        ${secondaryCta('Compare financing options', undefined, {
          ctaId: 'compare_financing_options',
          destinationKey: 'explore_financing',
          ctaPlacement: 'home_hero_secondary',
          destinationRouteId: 'financing',
        })}
      </div>
      <div class="hero-proof reveal mt-8" aria-label="Fund44 financing coverage" data-trust-module-id="home_hero_proof" data-trust-type="coverage" data-evidence-source="approved_content">
        ${content.heroProofItems.map((item) => `<span>${icon[item.iconKey]}<b>${item.label}</b></span>`).join('')}
      </div>

      <div class="reveal mt-12 hero-layer">
        ${matchDashboard()}
      </div>
    </div>
  </section>

  <section class="section-tight wrap">
    <div class="mb-8">
      ${eyebrow(content.problem.eyebrow)}
      <h2 class="h2 reveal mt-4 max-measure-problem">${content.problem.heading}</h2>
      <p class="lead reveal mt-4">${content.problem.lead}</p>
    </div>
    ${chaosToPath()}
  </section>

  <section class="section inverted tex-grid section-grid-dark">
    <div class="wrap">
      <div class="feature-split">
        <div class="fs-text">
          ${eyebrow(content.network.eyebrow)}
          <h2 class="h2 reveal mt-4 role-title-on-dark">${content.network.heading}</h2>
          <p class="lead reveal mt-4">${content.network.lead}</p>
          <div class="feat-list reveal mt-8">
            ${renderFeatureItems(content.network.featureItems)}
          </div>
        </div>
        <div class="fs-viz">${routingWaterfall()}</div>
      </div>
    </div>
  </section>

  <section class="section wrap">
    <div class="mb-12">
      ${eyebrow(content.workflow.eyebrow)}
      <h2 class="h2 reveal mt-4 title-section">${content.workflow.heading}</h2>
      <p class="lead reveal mt-4">${content.workflow.lead}</p>
    </div>
    <div class="feature-split rev">
      <div class="fs-viz">${docChecklist()}</div>
      <div class="fs-text">
        <h3 class="h3 reveal">${content.workflow.portalHeading}</h3>
        <p class="lead reveal mt-4 text-body-base">${content.workflow.portalLead}</p>
        <div class="feat-list reveal mt-6">
          ${renderFeatureItems(content.workflow.portalFeatures)}
        </div>
      </div>
    </div>

    <div class="feature-split mt-12 section-gap-feature">
      <div class="fs-text">
        <h3 class="h3 reveal">${content.workflow.comparisonHeading}</h3>
        <p class="lead reveal mt-4 text-body-base">${content.workflow.comparisonLead}</p>
        <div class="feat-list reveal mt-6">
          ${renderFeatureItems(content.workflow.comparisonFeatures)}
        </div>
      </div>
      <div class="fs-viz">${offerComparison()}</div>
    </div>
  </section>

  <section class="section-tight wrap">
    <div class="feature-split rev align-start">
      <div class="fs-viz">${statusTimeline()}</div>
      <div class="fs-text">
        ${eyebrow(content.status.eyebrow)}
        <h3 class="h3 reveal mt-4">${content.status.heading}</h3>
        <p class="lead reveal mt-4 text-body-base">${content.status.lead}</p>
        <div class="mt-6">${disclosure(content.status.disclosureHtml, {
          disclosureId: 'home_status_disclosure',
          disclosureContext: 'home_status',
        })}</div>
      </div>
    </div>
  </section>

  <section class="section wrap">
    <div class="mb-12">
      ${eyebrow('Financing paths')}
      <h2 class="h2 reveal mt-4">Built for real small-business needs</h2>
    </div>
    <div class="grid g-2 reveal" data-stagger>
      ${productCards.map((card) => `
        <a href="${hrefForContentId(card.id)}" class="card card-hover card-stack" data-link-context="home_product_cards" data-destination-route-id="${card.routeId}" data-destination-content-id="${card.id}">
          <span class="fi-mark fi-mark-lg">${icon[card.routeId === 'sba_7a' ? 'building' : card.routeId === 'sba_504' ? 'key' : card.routeId === 'business_acquisition' ? 'route' : 'cash']}</span>
          <h3 class="h3 title-lg">${card.title}</h3>
          <p class="muted text-body-sm grow">${card.summary}</p>
          <span class="accent-text btn-link">Learn more ${icon.arrow}</span>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'home_cta_banner',
    secondaryCtaId: 'cta_banner_how_it_works',
    secondaryCtaDestinationKey: 'learn_how_it_works',
    secondaryCtaRouteId: 'how_it_works',
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow('Common questions')}
    <h2 class="h2 reveal mt-4 mb-8">Answers, in plain language</h2>
    ${faqBlock(faqItems, content.measurement.faqGroup)}
  </section>
  `;
}
