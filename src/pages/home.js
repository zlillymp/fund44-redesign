import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, primaryCta, secondaryCta, ctaBanner, disclosure, faqBlock, matchDashboard, routingWaterfall, docChecklist, statusTimeline, offerComparison, chaosToPath, featItem } from '../components/ui.js';
import { hrefForContentId, hrefForRoute } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';

function renderFeatureItems(items) {
  return items.map((item) => featItem(icon[item.iconKey], item.title, item.description)).join('');
}

export function home() {
  const content = getContentById('page_home');
  const faqItems = content.commonQuestions.map((item) => ({ q: item.question, a: item.answer }));
  const productCards = content.productCardIds.map((id) => getContentById(id));

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForContentId(content.id),
    jsonld: [ld.org(), ld.financialService(), ld.faq(faqItems)],
  });

  return `
  <section class="section" style="padding-top:clamp(2.5rem,6vw,5rem);position:relative;overflow:hidden">
    <div class="tex-dots" style="position:absolute;inset:0;opacity:.6;mask-image:linear-gradient(180deg,#000,transparent 78%)"></div>
    <div class="wrap" style="position:relative">
      ${eyebrow(content.hero.eyebrow)}
      <h1 class="h-hero reveal wt-split mt-6" style="max-width:16ch">
        ${content.hero.title}
      </h1>
      <p class="lead reveal mt-6" style="font-size:var(--text-lg)">
        ${content.hero.lead}
      </p>
      <div class="wrap-btns reveal mt-8">
        ${primaryCta('Preview my funding paths')}
        ${secondaryCta('Compare financing options')}
      </div>
      <div class="hero-proof reveal mt-8" aria-label="Fund44 financing coverage">
        ${content.heroProofItems.map((item) => `<span>${icon[item.iconKey]}<b>${item.label}</b></span>`).join('')}
      </div>

      <div class="reveal mt-12" style="position:relative">
        ${matchDashboard()}
      </div>
    </div>
  </section>

  <section class="section-tight wrap">
    <div class="mb-8">
      ${eyebrow(content.problem.eyebrow)}
      <h2 class="h2 reveal mt-4" style="max-width:20ch">${content.problem.heading}</h2>
      <p class="lead reveal mt-4">${content.problem.lead}</p>
    </div>
    ${chaosToPath()}
  </section>

  <section class="section inverted tex-grid" style="background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:44px 44px">
    <div class="wrap">
      <div class="feature-split">
        <div class="fs-text">
          ${eyebrow(content.network.eyebrow)}
          <h2 class="h2 reveal mt-4" style="color:var(--on-dark)">${content.network.heading}</h2>
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
      <h2 class="h2 reveal mt-4" style="max-width:22ch">${content.workflow.heading}</h2>
      <p class="lead reveal mt-4">${content.workflow.lead}</p>
    </div>
    <div class="feature-split rev">
      <div class="fs-viz">${docChecklist()}</div>
      <div class="fs-text">
        <h3 class="h3 reveal">${content.workflow.portalHeading}</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">${content.workflow.portalLead}</p>
        <div class="feat-list reveal mt-6">
          ${renderFeatureItems(content.workflow.portalFeatures)}
        </div>
      </div>
    </div>

    <div class="feature-split mt-12" style="margin-top:clamp(2rem,6vw,5rem)">
      <div class="fs-text">
        <h3 class="h3 reveal">${content.workflow.comparisonHeading}</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">${content.workflow.comparisonLead}</p>
        <div class="feat-list reveal mt-6">
          ${renderFeatureItems(content.workflow.comparisonFeatures)}
        </div>
      </div>
      <div class="fs-viz">${offerComparison()}</div>
    </div>
  </section>

  <section class="section-tight wrap">
    <div class="feature-split rev" style="align-items:start">
      <div class="fs-viz">${statusTimeline()}</div>
      <div class="fs-text">
        ${eyebrow(content.status.eyebrow)}
        <h3 class="h3 reveal mt-4">${content.status.heading}</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">${content.status.lead}</p>
        <div class="mt-6">${disclosure('<strong>Fund44 is not a lender.</strong> Financing is offered by third-party providers, and eligibility and terms vary by provider. Checking initial options uses information that does not affect your credit; a lender may perform a hard inquiry later if you choose to proceed. Fund44 does not guarantee approval, funding, or any specific timeline.')}</div>
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
        <a href="${hrefForContentId(card.id)}" class="card card-hover" style="display:flex;flex-direction:column;gap:var(--space-4)">
          <span class="fi-mark" style="width:44px;height:44px">${icon[card.routeId === 'sba_7a' ? 'building' : card.routeId === 'sba_504' ? 'key' : card.routeId === 'business_acquisition' ? 'route' : 'cash']}</span>
          <h3 class="h3" style="font-size:var(--text-lg)">${card.title}</h3>
          <p class="muted" style="font-size:var(--text-sm);flex:1">${card.summary}</p>
          <span style="display:inline-flex;align-items:center;gap:.4rem;font-weight:600;font-size:var(--text-sm)" class="accent-text">Learn more ${icon.arrow}</span>
        </a>
      `).join('')}
    </div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading)}

  <section class="section wrap wrap-default">
    ${eyebrow('Common questions')}
    <h2 class="h2 reveal mt-4 mb-8">Answers, in plain language</h2>
    ${faqBlock(faqItems)}
  </section>
  `;
}
