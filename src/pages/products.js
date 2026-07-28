import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock, featItem, relatedLinksModule, sectionListCard, sectionSummaryCard } from '../components/ui.js';
import { getBreadcrumbs, hrefForContentId } from '../lib/routes.js';
import { getContentById } from '../lib/content.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';
import { FUNNEL_CONTEXT_KINDS } from '../lib/eligibility/model.js';

function renderProgramPage(contentId) {
  const content = getContentById(contentId);
  const crumbs = getBreadcrumbs(content.routeId);
  const faqItems = content.commonQuestions.map((item) => ({ id: item.id, q: item.question, a: item.answer }));
  const linkModule = getLinkModuleForRoute(content.routeId);

  setMeta({
    title: content.metaTitle,
    description: content.metaDescription,
    path: hrefForContentId(content.id),
    jsonld: [ld.breadcrumb(crumbs), ld.faq(faqItems)],
  });

  return `
  ${pageHero({
    crumbs,
    eyebrow: content.hero.eyebrow,
    title: content.hero.title,
    lead: content.hero.lead,
    flowContext: {
      ctaId: 'preview_funding_paths',
      startSurface: 'program_page_hero',
      productContextRouteId: content.routeId,
      funnelContextKind: FUNNEL_CONTEXT_KINDS.program,
    },
  })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(content.quickAnswer.term, content.quickAnswer.definition)}
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Fit and caution')}
    <h2 class="h2 reveal mt-4 mb-8">${content.whoItFitsHeading}</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${sectionListCard(content.whoItFits)}
      ${sectionListCard(content.whenItMayNotFit)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Prep and context')}
    <h2 class="h2 reveal mt-4 mb-8">Typical documents and how Fund44 fits</h2>
    <div class="grid g-3 reveal" data-stagger>
      <div class="card card-shell info-grid-card">
        <div class="eyebrow mb-4">At a glance</div>
        ${content.glanceSpecs.map(([label, value]) => `
          <div class="section-row-rule">
            <span class="muted">${label}</span>
            <b class="value-stack">${value}</b>
          </div>
        `).join('')}
      </div>
      ${sectionListCard(content.typicalDocuments)}
      ${sectionSummaryCard(content.howFund44Fits)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Eligibility considerations')}
    <h2 class="h2 reveal mt-4 mb-8">${content.eligibilityHeading}</h2>
    <div class="grid g-3 reveal" data-stagger>
      ${content.eligibilityCards.map((card) => `<div class="card">${featItem(icon[card.iconKey], card.title, card.description)}</div>`).join('')}
    </div>
    <div class="mt-8">${disclosure(content.sectionDisclosureHtml, {
      disclosureId: `${content.routeId}_section_disclosure`,
      disclosureContext: `${content.routeId}_eligibility`,
    })}</div>
  </section>

  ${ctaBanner(content.ctaBanner.heading, content.ctaBanner.subheading, {
    ctaId: 'cta_banner_preview_funding_paths',
    startSurface: 'program_cta_banner',
    productContextRouteId: content.routeId,
    funnelContextKind: FUNNEL_CONTEXT_KINDS.program,
  })}

  ${relatedLinksModule(linkModule)}

  <section class="section wrap wrap-default">
    ${eyebrow(`${content.shortLabel} FAQ`)}
    <h2 class="h2 reveal mt-4 mb-8">Questions about ${content.shortLabel}</h2>
    ${faqBlock(faqItems, content.measurement.faqGroup)}
  </section>
  `;
}

export function sba7a() {
  return renderProgramPage('page_sba_7a');
}

export function sba504() {
  return renderProgramPage('page_sba_504');
}

export function acquisition() {
  return renderProgramPage('page_business_acquisition');
}

export function workingCapital() {
  return renderProgramPage('page_working_capital');
}

export function termLoan() {
  return renderProgramPage('page_term_loan');
}

export function lineOfCredit() {
  return renderProgramPage('page_line_of_credit');
}

export function equipmentFinancing() {
  return renderProgramPage('page_equipment_financing');
}
