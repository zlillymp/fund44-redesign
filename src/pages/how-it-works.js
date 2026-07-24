import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, routingWaterfall, docChecklist, statusTimeline, offerComparison, featItem } from '../components/ui.js';

const CRUMBS = [{ label: 'Home', href: '/' }, { label: 'How it works', href: '/how-it-works' }];

const FAQ = [
  { q: 'How long does the process take?', a: 'The initial options preview takes a few minutes. Full timelines depend on the product and the lenders you proceed with. Fund44 does not guarantee any specific funding speed.' },
  { q: 'Do I have to upload documents more than once?', a: 'No. Fund44 keeps a shared document checklist so you upload financial documents a single time and reuse them across relevant lenders.' },
  { q: 'What data does Fund44 collect?', a: 'Fund44 collects the business and contact details needed to match you with relevant lenders. In this preview, no data is sent externally. In the live product, you control what is shared. See our privacy page.' },
  { q: 'Will my credit be affected?', a: 'Checking your initial options can use information that does not affect your credit score. If you choose to proceed with a lender, that lender may later perform a hard credit inquiry.' },
];

const STEPS = [
  { n: '01', h: 'Answer a few questions', p: 'Tell us your use of funds, amount, time in business, revenue, and state. It takes minutes.', ic: icon.route },
  { n: '02', h: 'Get matched to paths', p: 'Your profile can be screened across 75+ lender integrations using business and product criteria.', ic: icon.layers },
  { n: '03', h: 'Upload documents once', p: 'A single shared checklist feeds every relevant lender. No re-submitting the same paperwork.', ic: icon.file },
  { n: '04', h: 'Compare & continue', p: 'Review offers side by side, understand each path, and continue with one secure flow.', ic: icon.scale },
];

export function howItWorks() {
  setMeta({
    title: 'How Fund44 works',
    description: 'See how Fund44 turns one application into matched financing paths: answer a few questions, get routed to relevant lenders, upload documents once, and compare offers in a single secure experience.',
    path: '/how-it-works',
    jsonld: [ld.breadcrumb(CRUMBS), ld.faq(FAQ)],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'How it works',
    title: 'From one application to matched offers.',
    lead: 'Fund44 runs on embedded lending infrastructure. Here is exactly what happens between “check my options” and choosing a lender — no black box.',
  })}

  <section class="section-tight wrap">
    <div class="grid g-4 reveal" data-stagger>
      ${STEPS.map((s) => `
        <div class="card" style="display:flex;flex-direction:column;gap:var(--space-4)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="fi-mark" style="width:40px;height:40px">${s.ic}</span>
            <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--faint)">${s.n}</span>
          </div>
          <h3 style="font-family:var(--font-display);font-size:var(--text-lg);font-weight:600;letter-spacing:-0.02em">${s.h}</h3>
          <p class="muted" style="font-size:var(--text-sm)">${s.p}</p>
        </div>`).join('')}
    </div>
  </section>

  <!-- Detailed: routing -->
  <section class="section inverted" style="background-image:linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px);background-size:44px 44px">
    <div class="wrap">
      <div class="feature-split">
        <div class="fs-text">
          ${eyebrow('Step 2 · in detail')}
          <h2 class="h2 reveal mt-4" style="color:var(--on-dark)">Routing that ranks by fit</h2>
          <p class="lead reveal mt-4">Your single application is normalized into a clean profile and screened against a network of 75+ lender integrations. Products that don't serve your size, geography, or use of funds are filtered out. What's left is surfaced and ranked by how well it fits your situation.</p>
          <div class="feat-list reveal mt-8">
            ${featItem(icon.route, 'Data-driven matching', 'Decision support screens your profile against relevant products automatically.')}
            ${featItem(icon.eye, 'You see the reasoning', 'Each surfaced path shows why it appears — no opaque scoring.')}
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
        <h2 class="h2 reveal mt-4">Upload once, reuse everywhere</h2>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">A shared borrower portal shows exactly what's needed and what's in. Documents flow to relevant lenders without you re-submitting the same files.</p>
      </div>
    </div>
    <div class="feature-split" style="margin-top:clamp(2rem,6vw,5rem)">
      <div class="fs-text">
        ${eyebrow('Step 4 · in detail')}
        <h2 class="h2 reveal mt-4">Track status and compare offers</h2>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">Follow your application through each stage, then weigh offers side by side with plain-language framing before you proceed with any lender.</p>
      </div>
      <div class="fs-viz">${statusTimeline()}</div>
    </div>
    <div class="reveal" style="margin-top:clamp(2rem,6vw,5rem)">${offerComparison()}</div>
  </section>

  <section class="section-tight wrap">
    ${disclosure('<strong>Fund44 is not a lender.</strong> Fund44 matches borrowers with third-party lenders and provides tools to apply, track, and compare. Eligibility, offers, and terms are determined by the lenders. Checking initial options uses information that does not affect your credit; a hard inquiry may occur later if you proceed. No approval, funding, or timeline is guaranteed.')}
  </section>

  ${ctaBanner('Ready to see your paths?', 'Start the eligibility preview — it takes a few minutes and shows sample results only.')}

  <section class="section wrap wrap-default">
    ${eyebrow('Process FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">How the process works</h2>
    ${faqBlock(FAQ)}
  </section>
  `;
}
