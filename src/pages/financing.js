import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';

const CRUMBS = getBreadcrumbs('financing');

const FAQ = [
  { q: 'Which financing type is right for my business?', a: 'It depends on your use of funds, time in business, revenue, and how quickly you need capital. SBA loans suit longer-term needs and larger amounts; lines of credit suit ongoing cash-flow gaps; equipment and factoring solve specific needs. Fund44 matches your profile to the paths that fit.' },
  { q: 'Can I be matched to more than one option?', a: 'Yes. Most borrowers see several relevant paths. Fund44 surfaces them together so you can compare structure and fit rather than committing to the first product you find.' },
  { q: 'Are SBA loans always the best option?', a: 'Not always. SBA loans often offer favorable terms but involve more documentation and time. For urgent working-capital needs, a line of credit or term loan may fit better. The right answer depends on your situation.' },
];

const PRODUCTS = [
  { name: 'SBA 7(a)', use: 'Acquisition, working capital, expansion, refinance', term: 'Longer term', amount: 'Up to $5M', speed: 'Moderate', href: hrefForRoute('sba_7a') },
  { name: 'SBA 504', use: 'Owner-occupied real estate, major equipment', term: 'Long, fixed-asset', amount: 'Large projects', speed: 'Moderate', href: hrefForRoute('sba_504') },
  { name: 'Business acquisition', use: 'Buy a business or buy out a partner', term: 'Varies by structure', amount: 'Deal-sized', speed: 'Moderate', href: hrefForRoute('business_acquisition') },
  { name: 'Term loan', use: 'One-time investments, growth projects', term: 'Fixed, 1–7 yr', amount: 'Mid-range', speed: 'Faster', href: hrefForRoute('working_capital') },
  { name: 'Line of credit', use: 'Ongoing cash flow, seasonality', term: 'Revolving', amount: 'Flexible', speed: 'Faster', href: hrefForRoute('working_capital') },
  { name: 'Equipment financing', use: 'Purchase or finance equipment', term: 'Asset life', amount: 'Equipment cost', speed: 'Faster', href: hrefForRoute('working_capital') },
];

export function financing() {
  setMeta({
    title: 'Small-business financing options',
    description: 'Compare SBA 7(a), SBA 504, business acquisition loans, term loans, lines of credit, equipment financing and factoring. Fund44 matches you to the paths that fit — from a network of third-party lenders.',
    path: '/financing',
    jsonld: [ld.breadcrumb(CRUMBS), ld.faq(FAQ)],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'Financing overview',
    title: 'Every path to capital, in one place.',
    lead: 'Fund44 helps U.S. small-business owners find the right financing — from SBA loans to lines of credit — without applying separately to each lender. Start with your goal; we surface what fits.',
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock('Business financing', 'is capital a company borrows to fund operations, growth, acquisitions, or assets. It comes in many forms — SBA loans, term loans, lines of credit, equipment financing, and factoring — each suited to different needs, timelines, and business profiles.')}
  </section>

  <!-- COMPARISON MATRIX -->
  <section class="section-tight wrap">
    ${eyebrow('Comparison matrix')}
    <h2 class="h2 reveal mt-4 mb-8">Compare financing paths at a glance</h2>
    <div class="matrix reveal">
      <div class="matrix-scroll">
        <table>
          <thead><tr><th>Product</th><th>Best for</th><th>Structure</th><th>Amount</th><th>Relative speed</th><th></th></tr></thead>
          <tbody>
            ${PRODUCTS.map((p) => `
              <tr>
                <td>${p.name}</td>
                <td class="muted">${p.use}</td>
                <td class="muted">${p.term}</td>
                <td class="muted">${p.amount}</td>
                <td class="muted">${p.speed}</td>
                <td><a href="${p.href}" class="accent-text" style="font-weight:600;display:inline-flex;gap:.3rem;align-items:center;white-space:nowrap">View ${icon.arrow}</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <p class="muted mt-4" style="font-size:var(--text-xs);font-family:var(--font-mono)">Relative speed is a general guide only. Actual timelines, amounts, and terms are determined by individual lenders.</p>
  </section>

  <!-- DECISION HELPER -->
  <section class="section wrap">
    <div class="mb-8">
      ${eyebrow('Decision helper')}
      <h2 class="h2 reveal mt-4">Not sure where to start? Start with the goal.</h2>
      <p class="lead reveal mt-4">Pick what sounds closest to your situation — Fund44's matching does the rest.</p>
    </div>
    <div class="grid g-2 reveal" data-stagger>
      ${[
        ['I want to buy a business', 'Acquisition financing and SBA 7(a) are common starting points.', hrefForRoute('business_acquisition'), icon.route],
        ['I need to buy or refinance property', 'SBA 504 and SBA 7(a) are built for owner-occupied real estate.', hrefForRoute('sba_504'), icon.building],
        ['I need cash flow for operations', 'Lines of credit and short-term working capital fit recurring gaps.', hrefForRoute('working_capital'), icon.cash],
        ['I need equipment', 'Equipment financing or an SBA loan can spread the cost over its useful life.', hrefForRoute('working_capital'), icon.truck],
      ].map(([t,d,h,ic]) => `
        <a href="${h}" class="card card-hover" style="display:flex;gap:var(--space-4);align-items:flex-start">
          <span class="fi-mark" style="width:44px;height:44px;flex-shrink:0">${ic}</span>
          <div><h3 style="font-family:var(--font-display);font-size:var(--text-lg);font-weight:600;letter-spacing:-0.02em">${t}</h3><p class="muted mt-4" style="font-size:var(--text-sm);margin-top:.5rem">${d}</p></div>
        </a>`).join('')}
    </div>
    <div class="mt-8">${disclosure('<strong>Fund44 is not a lender.</strong> These are general starting points, not eligibility determinations. Financing is offered by third-party providers; eligibility and terms vary by provider.')}</div>
  </section>

  ${ctaBanner("Let's find the paths that fit.", 'Answer a few questions and preview the financing options relevant to your goal.')}

  <section class="section wrap wrap-default">
    ${eyebrow('Financing FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">Choosing between options</h2>
    ${faqBlock(FAQ)}
  </section>
  `;
}
