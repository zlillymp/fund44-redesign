import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, disclosure, eyebrow, chaosToPath, featItem } from '../components/ui.js';
import { getBreadcrumbs } from '../lib/routes.js';

const CRUMBS = getBreadcrumbs('about');

export function about() {
  setMeta({
    title: 'About Fund44 — why we built it',
    description: 'Fund44 is a small-business capital marketplace built to end the reapply-everywhere grind. Apply once, get matched to relevant financing paths from a network of third-party lenders, and continue in one place.',
    path: '/about',
    jsonld: [ld.breadcrumb(CRUMBS), ld.org()],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'Why Fund44',
    title: 'Small-business capital, without the runaround.',
    lead: 'Fund44 exists for one reason: finding the right funding should not mean starting over for every lender. We turn a fragmented search into one clear, comparable path.',
  })}

  <section class="section-tight wrap">
    ${chaosToPath()}
  </section>

  <section class="section wrap">
    <div class="feature-split">
      <div class="fs-text">
        ${eyebrow('Our approach')}
        <h2 class="h2 reveal mt-4">Clarity and fit, not hype.</h2>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">Most capital marketplaces optimize for volume. Fund44 optimizes for the match. We surface the paths that actually fit your goal, explain why, and let you compare before you commit — so you make a decision you understand.</p>
        <p class="lead reveal mt-4" style="font-size:var(--text-base)">Fund44 builds on Lendflow-powered embedded lending infrastructure: a single borrower journey, lender and product routing, a borrower portal, document upload, status tracking, offer comparison, and data-driven matching across a network of 75+ lender integrations.</p>
      </div>
      <div class="fs-viz">
        <div class="card reveal" style="background:var(--surface)">
          <div class="eyebrow" style="margin-bottom:var(--space-5)">What Fund44 is — and isn't</div>
          <div class="feat-list">
            ${featItem(icon.check, 'A capital marketplace', 'We match owners to relevant financing paths from third-party lenders.')}
            ${featItem(icon.check, 'One application, many routes', 'Apply once; we handle the routing and comparison.')}
            ${featItem(icon.check, 'Transparent by design', 'You see why each path appears and what happens next.')}
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
        [icon.eye, 'Transparency', 'We show the reasoning behind matches and never bury the fine print. You should understand every path before choosing.'],
        [icon.scale, 'Fit over fees', 'Paths are ranked by how well they fit your situation — not by what pays us most.'],
        [icon.shield, 'Respect for your data', 'We collect only what is needed to match you, and we are clear about how it is used.'],
      ].map(([ic,h,p]) => `<div class="card">${featItem(ic,h,p)}</div>`).join('')}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Built on a track record')}
    <h2 class="h2 reveal mt-4" style="max-width:22ch">The team behind faster small-business funding.</h2>
    <p class="lead reveal mt-4">Fund44 is the marketplace evolution of work in small-business lending, including SBA 7(a), SBA 504, business lines of credit, and term loans. The goal has stayed the same: connect owners with the capital that fits, faster.</p>
    <div class="mt-8">${disclosure('<strong>Fund44 is not a lender.</strong> Financing is offered by third-party providers; eligibility and terms vary by provider. Any figures on this site are illustrative or interface data only — we do not publish unverified funding claims.')}</div>
  </section>

  ${ctaBanner('See what Fund44 can find for you.', 'One application. More ways to fund your business. Preview your options now.')}
  `;
}
