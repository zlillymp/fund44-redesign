import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, primaryCta, secondaryCta, ctaBanner, disclosure, faqBlock, matchDashboard, routingWaterfall, docChecklist, statusTimeline, offerComparison, chaosToPath, featItem } from '../components/ui.js';

const FAQ = [
  { q: 'Is Fund44 a lender?', a: 'No. Fund44 is a technology marketplace. Financing is offered by third-party lenders in our network. Eligibility, rates, and terms are set by each lender — not by Fund44.' },
  { q: 'What size funding does Fund44 help with?', a: 'Fund44 is built for U.S. small-business owners seeking roughly $50,000 to $5 million for acquisitions, owner-occupied real estate, working capital, equipment, expansion, or refinancing.' },
  { q: 'Does checking my options affect my credit?', a: 'Checking your initial options can use information that does not affect your credit score. If you choose to proceed with a specific lender, that lender may later perform a hard credit inquiry as part of its own underwriting.' },
  { q: 'What products can I be matched to?', a: 'Coverage can include SBA 7(a) and SBA 504 loans, business acquisition financing, conventional term loans, business lines of credit, equipment financing, and invoice factoring, depending on your profile and lender availability.' },
  { q: 'Do I have to apply separately with each lender?', a: 'No — that is the point of Fund44. You share your profile and documents once, and Fund44 routes them to relevant lenders so you can compare paths without starting over each time.' },
];

export function home() {
  setMeta({
    title: 'Fund44 — One application. More ways to fund your business.',
    description: 'Explore small-business financing from $50,000 to $5 million, including SBA loans, acquisition financing, term loans, and lines of credit.',
    path: '/',
    jsonld: [ld.org(), ld.financialService(), ld.faq(FAQ)],
  });

  return `
  <!-- HERO -->
  <section class="section" style="padding-top:clamp(2.5rem,6vw,5rem);position:relative;overflow:hidden">
    <div class="tex-dots" style="position:absolute;inset:0;opacity:.6;mask-image:linear-gradient(180deg,#000,transparent 78%)"></div>
    <div class="wrap" style="position:relative">
      ${eyebrow('$50K–$5M small-business financing')}
      <h1 class="h-hero reveal wt-split mt-6" style="max-width:16ch">
        One application. <b>More ways</b> to fund your business.
      </h1>
      <p class="lead reveal mt-6" style="font-size:var(--text-lg)">
        Explore SBA loans, acquisition financing, term loans, and lines of credit through one clear path — without researching and reapplying lender by lender.
      </p>
      <div class="wrap-btns reveal mt-8">
        ${primaryCta('Preview my funding paths')}
        ${secondaryCta('Compare financing options')}
      </div>
      <div class="hero-proof reveal mt-8" aria-label="Fund44 financing coverage">
        <span>${icon.building}<b>SBA + flexible capital</b></span>
        <span>${icon.layers}<b>75+ lender integrations</b></span>
        <span>${icon.route}<b>One application path</b></span>
      </div>

      <div class="reveal mt-12" style="position:relative">
        ${matchDashboard()}
      </div>
    </div>
  </section>

  <!-- CHAOS → PATH -->
  <section class="section-tight wrap">
    <div class="mb-8">
      ${eyebrow('The problem with shopping for capital')}
      <h2 class="h2 reveal mt-4" style="max-width:20ch">Funding a business shouldn't mean starting over five times.</h2>
      <p class="lead reveal mt-4">Every lender wants a slightly different application and its own documents. Fund44 turns that scramble into a single organized path.</p>
    </div>
    ${chaosToPath()}
  </section>

  <!-- DARK TRUST / EXPLANATION -->
  <section class="section inverted tex-grid" style="background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:44px 44px">
    <div class="wrap">
      <div class="feature-split">
        <div class="fs-text">
          ${eyebrow('How the match works')}
          <h2 class="h2 reveal mt-4" style="color:var(--on-dark)">Your profile, routed to the lenders that fit.</h2>
          <p class="lead reveal mt-4">Fund44 is built on embedded lending infrastructure. Your profile can be screened across 75+ lender integrations so relevant financing paths can be surfaced without a separate search for every lender.</p>
          <div class="feat-list reveal mt-8">
            ${featItem(icon.route, 'Single application, many routes', 'One borrower journey feeds every relevant product path.')}
            ${featItem(icon.layers, 'Lender & product routing', 'Profiles are matched against products that actually serve your size, use, and geography.')}
            ${featItem(icon.eye, 'Clear comparisons', 'See why each financing path may suit your use of funds, amount, and business profile.')}
          </div>
        </div>
        <div class="fs-viz">${routingWaterfall()}</div>
      </div>
    </div>
  </section>

  <!-- WARM PRODUCT PANEL: docs + status -->
  <section class="section wrap">
    <div class="mb-12">
      ${eyebrow('One organized experience')}
      <h2 class="h2 reveal mt-4" style="max-width:22ch">Upload once. Track everything. Compare in one place.</h2>
      <p class="lead reveal mt-4">From a shared document checklist to live status and side-by-side offers, Fund44 keeps the whole process in a single borrower portal.</p>
    </div>
    <div class="feature-split rev">
      <div class="fs-viz">${docChecklist()}</div>
      <div class="fs-text">
        <h3 class="h3 reveal">A borrower portal that keeps you organized</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">Documents are requested once and reused across relevant lenders. You always know what's needed, what's in, and what's next.</p>
        <div class="feat-list reveal mt-6">
          ${featItem(icon.file, 'Shared document checklist', 'Upload financial documents a single time instead of per lender.')}
          ${featItem(icon.clock, 'Live status tracking', 'A clear timeline from application to offers to next steps.')}
        </div>
      </div>
    </div>

    <div class="feature-split mt-12" style="margin-top:clamp(2rem,6vw,5rem)">
      <div class="fs-text">
        <h3 class="h3 reveal">Compare offers side by side</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">When offers come back, Fund44 lines them up so you can weigh structure and fit — not just chase the first yes.</p>
        <div class="feat-list reveal mt-6">
          ${featItem(icon.scale, 'Offer comparison', 'See structures next to each other with clear, plain-language framing.')}
          ${featItem(icon.shield, 'Decide with context', 'Understand what each path means before you proceed with any lender.')}
        </div>
      </div>
      <div class="fs-viz">${offerComparison()}</div>
    </div>
  </section>

  <!-- STATUS TIMELINE + disclosure -->
  <section class="section-tight wrap">
    <div class="feature-split rev" style="align-items:start">
      <div class="fs-viz">${statusTimeline()}</div>
      <div class="fs-text">
        ${eyebrow('What happens next')}
        <h3 class="h3 reveal mt-4">No black box. You always know the next step.</h3>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">From the moment you check your options to the moment you choose a lender, every stage is visible and explained in plain language.</p>
        <div class="mt-6">${disclosure('<strong>Fund44 is not a lender.</strong> Financing is offered by third-party providers, and eligibility and terms vary by provider. Checking initial options uses information that does not affect your credit; a lender may perform a hard inquiry later if you choose to proceed. Fund44 does not guarantee approval, funding, or any specific timeline.')}</div>
      </div>
    </div>
  </section>

  <!-- PRODUCTS GRID -->
  <section class="section wrap">
    <div class="mb-12">
      ${eyebrow('Financing paths')}
      <h2 class="h2 reveal mt-4">Built for real small-business needs</h2>
    </div>
    <div class="grid g-2 reveal" data-stagger>
      ${[
        ['SBA 7(a) loans', 'Flexible, longer-term capital for acquisitions, working capital, and growth.', '#/sba-7a', icon.building],
        ['SBA 504 loans', 'Long-term, fixed-asset financing for owner-occupied real estate and major equipment.', '#/sba-504', icon.key],
        ['Business acquisition', 'Structure financing to buy a business, buy out a partner, or fund a transition.', '#/business-acquisition', icon.route],
        ['Working capital & lines of credit', 'Flexible cash flow, term loans, equipment financing, and factoring.', '#/working-capital', icon.cash],
      ].map(([t,d,h,ic]) => `
        <a href="${h}" class="card card-hover" style="display:flex;flex-direction:column;gap:var(--space-4)">
          <span class="fi-mark" style="width:44px;height:44px">${ic}</span>
          <h3 class="h3" style="font-size:var(--text-lg)">${t}</h3>
          <p class="muted" style="font-size:var(--text-sm);flex:1">${d}</p>
          <span style="display:inline-flex;align-items:center;gap:.4rem;font-weight:600;font-size:var(--text-sm)" class="accent-text">Learn more ${icon.arrow}</span>
        </a>`).join('')}
    </div>
  </section>

  ${ctaBanner('See the paths that fit your business.', 'A few questions is all it takes to preview your options. Preview only — nothing is submitted to a lender.')}

  <!-- FAQ -->
  <section class="section wrap wrap-default">
    ${eyebrow('Common questions')}
    <h2 class="h2 reveal mt-4 mb-8">Answers, in plain language</h2>
    ${faqBlock(FAQ)}
  </section>
  `;
}
