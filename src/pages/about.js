import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, disclosure, eyebrow, chaosToPath, featItem, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';
import { disclosures } from '../lib/legal.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

const CRUMBS = getBreadcrumbs('about');

export function about() {
  const linkModule = getLinkModuleForRoute('about');
  setMeta({
    title: 'About Fund44 — why we built it',
    description: 'Fund44 is a small-business capital marketplace built to make financing paths easier to compare without inventing lender counts, guarantees, or unsupported workflow promises.',
    path: hrefForRoute('about'),
    jsonld: [ld.breadcrumb(CRUMBS), ld.org()],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'Why Fund44',
    title: 'Small-business capital, without the runaround.',
    lead: 'Fund44 exists for one reason: finding the right funding should not mean starting over for every lender. We turn a fragmented search into one clear, comparable path.',
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'about_page_hero',
      productContextRouteId: 'about',
      productContextTitle: 'About Fund44',
    },
  })}

  <section class="section-tight wrap">
    ${chaosToPath()}
  </section>

  <section class="section wrap">
    <div class="feature-split">
      <div class="fs-text">
        ${eyebrow('Our approach')}
        <h2 class="h2 reveal mt-4">Clarity and fit, not hype.</h2>
        <p class="lead reveal mt-4 text-body-base">${disclosures.fitOverFees}</p>
        <p class="lead reveal mt-4 text-body-base">${disclosures.networkStory}</p>
        <p class="lead reveal mt-4 text-body-base">${disclosures.fasterProcess}</p>
      </div>
      <div class="fs-viz">
        <div class="card reveal info-grid-card">
          <div class="eyebrow mb-6">What Fund44 is — and isn't</div>
          <div class="feat-list">
            ${featItem(icon.check, 'A capital marketplace', 'We match owners to relevant financing paths from third-party lenders.')}
            ${featItem(icon.check, 'One intake experience', 'The experience is designed to reduce repeated intake and make path comparisons easier to review.')}
            ${featItem(icon.check, 'Routing explanations', 'The experience explains why a path may fit based on the information provided and the product details available.')}
            ${featItem(icon.close, 'Not a lender', 'Fund44 does not issue loans or set rates. Lenders do.')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('What we value')}
    <h2 class="h2 reveal mt-4 mb-8">Principles we hold to</h2>
    <div class="grid g-3 reveal" data-stagger>
      ${[
        [icon.eye, 'Explain the path', 'We explain why a path may fit based on the information provided and the details available in the experience.'],
        [icon.scale, 'Fit over fees', disclosures.fitOverFees],
        [icon.shield, 'Controlled data boundaries', 'The current preview keeps entered information in-browser while final privacy, consent, and retention language remains under approval.'],
      ].map(([ic,h,p]) => `<div class="card">${featItem(ic,h,p)}</div>`).join('')}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Why the name matters')}
    <h2 class="h2 reveal mt-4 title-section">A curated lender network, not a volume story.</h2>
    <p class="lead reveal mt-4">${disclosures.networkStory}</p>
    <div class="mt-8">${disclosure(`<strong>Fund44 is not a lender.</strong> ${disclosures.noGuarantees} ${disclosures.illustrative}`)}</div>
  </section>

  ${ctaBanner('See what Fund44 can find for you.', disclosures.previewFlow, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'about_cta_banner',
    productContextRouteId: 'about',
    productContextTitle: 'About Fund44',
  })}

  ${relatedLinksModule(linkModule)}
  `;
}
