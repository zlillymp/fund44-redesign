import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, routingWaterfall, docChecklist, statusTimeline, offerComparison, featItem, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';
import { disclosures } from '../lib/legal.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

const CRUMBS = getBreadcrumbs('how_it_works');

const FAQ = [
  { q: 'How long does the process take?', a: disclosures.fasterProcess },
  { q: 'Do I have to upload documents more than once?', a: 'Fund44 is designed around one document checklist and document reuse where supported in the workflow. Exact document steps can vary by provider and by business profile.' },
  { q: 'What data does Fund44 collect?', a: 'In the current preview, the information you enter stays in your browser and is used only to personalize the on-screen demo result. Final live privacy, sharing, retention, and consent language remains pending approval.' },
  { q: 'Will my credit be affected?', a: 'Checking your initial options can use information that does not affect your credit score. If you choose to proceed with a lender, that lender may later perform a hard credit inquiry.' },
];

const STEPS = [
  { n: '01', h: 'Answer a few questions', p: 'Share the business details the preview asks for so the on-screen result can be tailored to your situation.', ic: icon.route },
  { n: '02', h: 'Review relevant paths', p: 'See the paths the experience can explain based on your financing need, profile, and the product details available.', ic: icon.layers },
  { n: '03', h: 'Prepare documents', p: 'The workflow is designed around one document checklist and document reuse where supported.', ic: icon.file },
  { n: '04', h: 'Compare and continue', p: 'Status tracking and offer comparison can be available in the experience when those steps are supported.', ic: icon.scale },
];

export function howItWorks() {
  const linkModule = getLinkModuleForRoute('how_it_works');
  setMeta({
    title: 'How Fund44 works',
    description: 'See the conservative product-workflow draft for Fund44: routing explanations, one document checklist, document reuse where supported, status tracking, and offer comparison when available in the experience.',
    path: hrefForRoute('how_it_works'),
    jsonld: [ld.breadcrumb(CRUMBS), ld.faq(FAQ)],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'How it works',
    title: 'From one intake to clearer path review.',
    lead: 'Fund44 is designed for a faster process, with routing explanations, one document checklist, document reuse where supported in the workflow, status tracking, and offer comparison when those steps are available in the experience.',
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'how_it_works_hero',
      productContextRouteId: 'how_it_works',
    },
  })}

  <section class="section-tight wrap">
    <div class="grid g-4 reveal" data-stagger>
      ${STEPS.map((s) => `
        <div class="card card-stack">
          <div class="section-row-rule section-row-rule-plain">
            <span class="fi-mark fi-mark-md">${s.ic}</span>
            <span class="text-meta">${s.n}</span>
          </div>
          <h3 class="title-lg">${s.h}</h3>
          <p class="muted text-body-sm">${s.p}</p>
        </div>`).join('')}
    </div>
  </section>

  <!-- Detailed: routing -->
  <section class="section inverted section-grid-dark">
    <div class="wrap">
      <div class="feature-split">
        <div class="fs-text">
          ${eyebrow('Step 2 · in detail')}
          <h2 class="h2 reveal mt-4 role-title-on-dark">Routing explained in plain language</h2>
          <p class="lead reveal mt-4">${disclosures.fitOverFees}</p>
          <div class="feat-list reveal mt-8">
            ${featItem(icon.route, 'Curated network story', disclosures.networkStory)}
            ${featItem(icon.eye, 'Routing explanation', 'The experience explains why a path may fit based on the information provided and the product details available.')}
          </div>
        </div>
        <div class="fs-viz">${routingWaterfall()}</div>
      </div>
    </div>
  </section>

  <!-- Detailed: docs + status -->
  <section class="section wrap">
    <div class="feature-split rev">
      <div class="fs-viz">${docChecklist()}</div>
      <div class="fs-text">
        ${eyebrow('Step 3 · in detail')}
        <h2 class="h2 reveal mt-4">One document checklist, with reuse where supported</h2>
        <p class="lead reveal mt-4 text-body-base">${disclosures.fasterProcess}</p>
      </div>
    </div>
    <div class="feature-split section-gap-feature">
      <div class="fs-text">
        ${eyebrow('Step 4 · in detail')}
        <h2 class="h2 reveal mt-4">Track status and compare offers</h2>
        <p class="lead reveal mt-4 text-body-base">Status tracking and offer comparison can be available in the experience when those steps are supported. Exact timing, available paths, and workflow details can vary by provider and by business profile.</p>
      </div>
      <div class="fs-viz">${statusTimeline()}</div>
    </div>
    <div class="reveal section-gap-feature">${offerComparison()}</div>
  </section>

  <section class="section-tight wrap">
    ${disclosure(`<strong>Fund44 is not a lender.</strong> ${disclosures.marketplacePreview} ${disclosures.noGuarantees}`, {
      disclosureId: 'how_it_works_marketplace_disclosure',
      disclosureContext: 'how_it_works',
    })}
  </section>

  ${ctaBanner('Ready to see your paths?', disclosures.previewFlow, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'how_it_works_cta_banner',
    productContextRouteId: 'how_it_works',
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow('Process FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">How the process works</h2>
      ${faqBlock(FAQ, 'how_it_works_faq')}
  </section>
  `;
}
