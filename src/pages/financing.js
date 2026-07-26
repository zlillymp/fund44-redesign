import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId, hrefForRoute } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

const CRUMBS = getBreadcrumbs('financing');

export function financing() {
  const content = getContentById('page_financing');
  const faqItems = content.commonQuestions.map((item) => ({ q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(content.routeId);

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForContentId(content.id),
    jsonld: [ld.breadcrumb(CRUMBS), ld.faq(faqItems)],
  });

  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: content.hero.eyebrow,
    title: content.hero.title,
    lead: content.hero.lead,
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Comparison matrix')}
    <h2 class="h2 reveal mt-4 mb-8">Compare financing paths at a glance</h2>
    <div class="matrix reveal">
      <div class="matrix-scroll">
        <table>
          <thead><tr><th>Product</th><th>Best for</th><th>Structure</th><th>Amount</th><th>Relative speed</th><th></th></tr></thead>
          <tbody>
            ${content.matrixRows.map((row) => `
              <tr>
                <td>${row.name}</td>
                <td class="muted">${row.use}</td>
                <td class="muted">${row.structure}</td>
                <td class="muted">${row.amount}</td>
                <td class="muted">${row.speed}</td>
                <td><a href="${hrefForRoute(row.destinationRouteId)}" class="accent-text" style="font-weight:600;display:inline-flex;gap:.3rem;align-items:center;white-space:nowrap">View ${icon.arrow}</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <p class="muted mt-4" style="font-size:var(--text-xs);font-family:var(--font-mono)">Relative speed is a general guide only. Actual timelines, amounts, and terms are determined by individual lenders.</p>
  </section>

  <section class="section wrap">
    <div class="mb-8">
      ${eyebrow('Decision helper')}
      <h2 class="h2 reveal mt-4">Not sure where to start? Start with the goal.</h2>
      <p class="lead reveal mt-4">Pick what sounds closest to your situation — Fund44's matching does the rest.</p>
    </div>
    <div class="grid g-2 reveal" data-stagger>
      ${content.decisionCards.map((card) => `
        <a href="${hrefForRoute(card.destinationRouteId)}" class="card card-hover" style="display:flex;gap:var(--space-4);align-items:flex-start">
          <span class="fi-mark" style="width:44px;height:44px;flex-shrink:0">${icon[card.iconKey]}</span>
          <div>
            <h3 style="font-family:var(--font-display);font-size:var(--text-lg);font-weight:600;letter-spacing:-0.02em">${card.title}</h3>
            <p class="muted mt-4" style="font-size:var(--text-sm);margin-top:.5rem">${card.description}</p>
          </div>
        </a>
      `).join('')}
    </div>
    <div class="mt-8">${disclosure('<strong>Fund44 is not a lender.</strong> These are general starting points, not eligibility determinations. Financing is offered by third-party providers; eligibility and terms vary by provider.')}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading)}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow('Financing FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">Choosing between options</h2>
    ${faqBlock(faqItems)}
  </section>
  `;
}
