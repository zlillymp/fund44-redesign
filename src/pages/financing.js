import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock, relatedLinksModule, sectionListCard, sectionSummaryCard } from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId, hrefForRoute } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

const CRUMBS = getBreadcrumbs('financing');

export function financing() {
  const content = getContentById('page_financing');
  const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
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
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'financing_page_hero',
      productContextRouteId: content.routeId,
      productContextTitle: content.title,
    },
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Fit and caution')}
    <h2 class="h2 reveal mt-4 mb-8">Who this overview fits and when to go deeper</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${sectionListCard(content.whoItFits)}
      ${sectionListCard(content.whenItMayNotFit)}
    </div>
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
                <td><a href="${hrefForRoute(row.destinationRouteId)}" class="accent-text btn-link copy-accent-link-row nowrap" data-analytics-cta-id="compare_financing_matrix_row" data-analytics-cta-label="View ${row.name}" data-analytics-cta-type="inline" data-analytics-cta-placement="financing_matrix" data-destination-route-id="${row.destinationRouteId}" data-destination-content-id="${row.destinationRouteId}">View ${icon.arrow}</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <p class="muted mt-4 disclosure-copy">Relative speed is a general guide only. Actual timelines, amounts, and terms are determined by individual lenders.</p>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Prep and context')}
    <h2 class="h2 reveal mt-4 mb-8">Typical documents and how Fund44 fits</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${sectionListCard(content.typicalDocuments)}
      ${sectionSummaryCard(content.howFund44Fits)}
    </div>
  </section>

  <section class="section wrap">
    <div class="mb-8">
      ${eyebrow('Decision helper')}
      <h2 class="h2 reveal mt-4">Not sure where to start? Start with the goal.</h2>
      <p class="lead reveal mt-4">Pick what sounds closest to your situation — Fund44's matching does the rest.</p>
    </div>
    <div class="grid g-2 reveal" data-stagger>
      ${content.decisionCards.map((card) => `
        <a href="${hrefForRoute(card.destinationRouteId)}" class="card card-hover card-row" data-analytics-cta-id="decision_helper_link" data-analytics-cta-label="${card.title}" data-analytics-cta-type="inline" data-analytics-cta-placement="financing_decision_helper" data-destination-route-id="${card.destinationRouteId}">
          <span class="fi-mark fi-mark-lg">${icon[card.iconKey]}</span>
          <div>
            <h3 class="title-lg">${card.title}</h3>
            <p class="muted text-body-sm inline-note">${card.description}</p>
          </div>
        </a>
      `).join('')}
    </div>
    <div class="mt-8">${disclosure(content.sectionDisclosureHtml, {
      disclosureId: 'financing_decision_helper_disclosure',
      disclosureContext: 'financing_decision_helper',
    })}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'financing_cta_banner',
    productContextRouteId: content.routeId,
    productContextTitle: content.title,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow('Financing FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">Choosing between options</h2>
    ${faqBlock(faqItems, content.measurement.faqGroup)}
  </section>
  `;
}
