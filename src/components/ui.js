import { icon } from '../lib/svg.js';
import { getCtaDestination, hrefForRoute } from '../lib/routes.js';
import { flowTriggerAttributes } from '../lib/eligibility/trigger.js';

// ---------- Shared section pieces ----------
export const eyebrow = (t) => `<span class="eyebrow reveal">${t}</span>`;

function escapeAttribute(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export const breadcrumb = (crumbs) => `
  <nav class="breadcrumb reveal" aria-label="Breadcrumb">
    ${crumbs.map((c, i) => i === crumbs.length - 1
      ? `<span aria-current="page">${c.label}</span>`
      : `<a href="${c.path}" data-link-context="breadcrumb" data-destination-route-id="${c.routeId || ''}">${c.label}</a><span class="sep">/</span>`).join('')}
  </nav>`;

export const primaryCta = (
  label = 'Preview my funding paths',
  {
    ctaId = 'preview_funding_paths',
    startSurface = 'page_hero_primary',
    requestedMode = 'preview',
    productContextRouteId = '',
    productContextTitle = '',
    funnelContextKind = 'generic',
  } = {},
) =>
  `<button class="btn btn-primary btn-lg" data-analytics-cta-id="${escapeAttribute(ctaId)}" data-analytics-cta-label="${escapeAttribute(label)}" data-analytics-cta-type="primary" data-analytics-cta-placement="${escapeAttribute(startSurface)}" ${flowTriggerAttributes({
    ctaId,
    startSurface,
    requestedMode,
    productContextRouteId,
    productContextTitle,
    funnelContextKind,
  })}>${label} ${icon.arrow}</button>`;

export const secondaryCta = (
  label = 'Explore financing',
  href = getCtaDestination('explore_financing').href,
  {
    ctaId = 'explore_financing',
    destinationKey = 'explore_financing',
    ctaType = 'secondary',
    ctaPlacement = 'page_hero_secondary',
    destinationRouteId = 'financing',
  } = {},
) =>
  `<a class="btn btn-ghost btn-lg" href="${escapeAttribute(href || getCtaDestination(destinationKey).href)}" data-analytics-cta-id="${escapeAttribute(ctaId)}" data-analytics-cta-label="${escapeAttribute(label)}" data-analytics-cta-type="${escapeAttribute(ctaType)}" data-analytics-cta-placement="${escapeAttribute(ctaPlacement)}" data-destination-route-id="${escapeAttribute(destinationRouteId)}">${label}</a>`;

// mid-page CTA banner
export const ctaBanner = (
  heading,
  sub,
  {
    ctaId = 'cta_banner_preview_funding_paths',
    startSurface = 'cta_banner_primary',
    requestedMode = 'preview',
    productContextRouteId = '',
    productContextTitle = '',
    funnelContextKind = 'generic',
    secondaryCtaId = 'cta_banner_how_it_works',
    secondaryCtaLabel = 'How it works',
    secondaryCtaDestinationKey = 'learn_how_it_works',
    secondaryCtaRouteId = 'how_it_works',
  } = {},
) => `
<section class="section-tight wrap">
  <div class="cta-banner reveal">
    <div class="tex-grid"></div>
    <div class="cta-banner-inner layout-spread">
      <div>
        <h2 class="h2 cta-banner-heading">${heading}</h2>
        <p class="lead cta-banner-copy">${sub}</p>
      </div>
      <div class="cta-banner-actions">
        <button class="btn btn-primary btn-lg" data-analytics-cta-id="${escapeAttribute(ctaId)}" data-analytics-cta-label="Preview funding paths" data-analytics-cta-type="primary" data-analytics-cta-placement="${escapeAttribute(startSurface)}" ${flowTriggerAttributes({
          ctaId,
          startSurface,
          requestedMode,
          productContextRouteId,
          productContextTitle,
          funnelContextKind,
        })}>Preview funding paths ${icon.arrow}</button>
        <a class="btn btn-on-dark btn-lg" href="${getCtaDestination(secondaryCtaDestinationKey).href}" data-analytics-cta-id="${escapeAttribute(secondaryCtaId)}" data-analytics-cta-label="${escapeAttribute(secondaryCtaLabel)}" data-analytics-cta-type="secondary" data-analytics-cta-placement="cta_banner_secondary" data-destination-route-id="${escapeAttribute(secondaryCtaRouteId)}">${secondaryCtaLabel}</a>
      </div>
    </div>
  </div>
</section>`;

// disclosure bar
export const disclosure = (
  text,
  {
    disclosureId = 'generic_disclosure',
    disclosureContext = 'page',
    disclosureVersion = '2026-07-26.f44-mea-02',
    eligibilityMode = 'none',
  } = {},
) => `
<div class="disclosure-bar reveal" data-disclosure-id="${escapeAttribute(disclosureId)}" data-disclosure-context="${escapeAttribute(disclosureContext)}" data-disclosure-version="${escapeAttribute(disclosureVersion)}" data-eligibility-mode="${escapeAttribute(eligibilityMode)}">
  ${icon.info}
  <p>${text}</p>
</div>`;

function renderSectionListItems(items = []) {
  return items.map((item) => `
    <li class="list-check">
      <span class="list-check-mark">${icon.check}</span>
      <span class="list-check-copy">${item}</span>
    </li>
  `).join('');
}

export const sectionListCard = ({ heading, items = [], summary = '' }) => `
<div class="card card-shell">
  <h3 class="title-lg">${heading}</h3>
  ${summary ? `<p class="muted text-body-sm inline-note mt-4">${summary}</p>` : ''}
  <ul role="list" class="section-card-list mt-6">
    ${renderSectionListItems(items)}
  </ul>
</div>`;

export const sectionSummaryCard = ({ heading, summary, bullets = [] }) => `
<div class="card card-shell">
  <h3 class="title-lg">${heading}</h3>
  <p class="muted text-body-sm inline-note mt-4">${summary}</p>
  <ul role="list" class="section-card-list mt-6">
    ${renderSectionListItems(bullets)}
  </ul>
</div>`;

// FAQ block (also returns items for JSON-LD upstream)
export const faqBlock = (items, faqGroup = 'faq_group') => `
<div class="faq reveal">
  ${items.map((it, index) => {
    const faqId = escapeAttribute(it.id || `${faqGroup}_${index + 1}`);
    const idBase = `faq-${escapeAttribute(faqGroup)}-${faqId}`;
    const answerId = `${idBase}-answer`;
    const questionId = `${idBase}-question`;
    return `
    <div class="faq-item">
      <button class="faq-q" id="${questionId}" aria-expanded="false" aria-controls="${answerId}" data-faq-id="${faqId}" data-faq-group="${escapeAttribute(faqGroup)}" data-faq-position="${index + 1}">
        <span>${it.q}</span>
        <span class="chev" aria-hidden="true">${icon.plus}</span>
      </button>
      <div class="faq-a" id="${answerId}" role="region" aria-labelledby="${questionId}" hidden>
        <div class="faq-a-inner">${it.a}</div>
      </div>
    </div>`;
  }).join('')}
</div>`;

// ---------- PRODUCT VISUALIZATIONS ----------

// 1. Funding match dashboard
export const matchDashboard = () => `
<div class="panel reveal" data-viz="match">
  <div class="panel-bar"><span class="panel-dots"><i></i><i></i><i></i></span><span class="panel-title">fund44 · match results</span></div>
  <div class="panel-body">
    <div class="match-head">
      <div>
        <div class="match-count"><span data-count="4">0</span><small>illustrative paths found</small></div>
      </div>
      <span class="tag">Use of funds · Acquisition</span>
    </div>
    <div class="match-list">
      ${[
        ['SBA 7(a) — Acquisition','$50k–$5M · up to 10 yr', 92],
        ['Conventional term loan','$100k–$1M · 3–7 yr', 78],
        ['SBA 504','Owner-occupied real estate', 64],
        ['Business line of credit','Revolving working capital', 51],
      ].map(([n,m,p]) => `
        <div class="match-row">
          <div><div class="mr-name">${n}</div><div class="mr-meta">${m}</div></div>
          <div class="match-fit"><span class="fit-bar"><i class="fit-bar-fill" style="width:0" data-fit="${p}"></i></span><span class="fit-pct">${p}%</span></div>
        </div>`).join('')}
    </div>
  </div>
</div>`;

// 2. Lender routing waterfall
export const routingWaterfall = () => `
<div class="panel reveal" data-viz="waterfall">
  <div class="panel-bar"><span class="panel-dots"><i></i><i></i><i></i></span><span class="panel-title">routing engine · lender network</span></div>
  <div class="panel-body">
    <div class="waterfall">
      <div class="wf-stage"><div class="wf-node on">01</div><div class="wf-label"><b>One intake experience</b><span>Borrower profile normalized</span></div></div>
      <div class="wf-stage"><div class="wf-line wf-line-offset"></div></div>
      <div class="wf-stage"><div class="wf-node on">02</div><div class="wf-label"><b>Product routing</b><span>Explained from the curated network and available product details</span></div><span class="wf-badge">curated</span></div>
      <div class="wf-stage"><div class="wf-line wf-line-offset"></div></div>
      <div class="wf-stage"><div class="wf-node pass">✕</div><div class="wf-label"><b>Not every path is shown</b><span>Availability can vary by provider and by business profile</span></div><span class="wf-badge">varies</span></div>
      <div class="wf-stage"><div class="wf-node on">03</div><div class="wf-label"><b>Relevant paths surfaced</b><span>Explained from the information provided and the product details available</span></div><span class="wf-badge match">sample</span></div>
    </div>
  </div>
</div>`;

// 3. Document checklist
export const docChecklist = () => `
<div class="panel reveal" data-viz="checklist">
  <div class="panel-bar"><span class="panel-dots"><i></i><i></i><i></i></span><span class="panel-title">document checklist</span></div>
  <div class="panel-body">
    <div class="checklist">
      ${[
        ['Business tax returns (2 yr)','Uploaded',true],
        ['Personal financial statement','Uploaded',true],
        ['Bank statements (6 mo)','Uploaded',true],
        ['Debt schedule','Requested',false],
        ['Use-of-funds summary','Requested',false],
      ].map(([n,s,d]) => `
        <div class="check-row ${d?'done':''}">
          <span class="check-box">${icon.check}</span>
          <span class="check-name">${n}</span>
          <span class="check-status">${s}</span>
        </div>`).join('')}
    </div>
  </div>
</div>`;

// 4. Status timeline
export const statusTimeline = () => `
<div class="panel reveal" data-viz="timeline">
  <div class="panel-bar"><span class="panel-dots"><i></i><i></i><i></i></span><span class="panel-title">application status</span></div>
  <div class="panel-body">
    <div class="timeline">
      ${[
        ['Application submitted','Complete','done'],
        ['Matched to lenders','4 paths surfaced','done'],
        ['Documents in review','With 2 lenders','active'],
        ['Offers returned','Compare side by side',''],
        ['Choose & continue','Proceed with one lender',''],
      ].map(([b,s,cls],i,arr) => `
        <div class="tl-step ${cls}">
          <div class="tl-marker"><span class="tl-dot"></span>${i<arr.length-1?'<span class="tl-rail"></span>':''}</div>
          <div class="tl-body"><b>${b}</b><span>${s}</span></div>
        </div>`).join('')}
    </div>
  </div>
</div>`;

// 5. Offer comparison
export const offerComparison = () => `
<div class="panel reveal" data-viz="offers">
  <div class="panel-bar"><span class="panel-dots"><i></i><i></i><i></i></span><span class="panel-title">compare offers · illustrative</span></div>
  <div class="panel-body">
    <div class="offers">
      <div class="offer-card">
        <div class="offer-type">Term loan</div><div class="offer-amt">$250k</div>
        <div class="offer-line"><span>Structure</span><b>5-yr amortizing</b></div>
        <div class="offer-line"><span>Payment</span><b>Monthly</b></div>
        <div class="offer-line"><span>Fit</span><b>Good</b></div>
      </div>
      <div class="offer-card best">
        <span class="offer-flag">Strong fit</span>
        <div class="offer-type">SBA 7(a)</div><div class="offer-amt">$300k</div>
        <div class="offer-line"><span>Structure</span><b>10-yr</b></div>
        <div class="offer-line"><span>Payment</span><b>Monthly</b></div>
        <div class="offer-line"><span>Fit</span><b>Strong</b></div>
      </div>
      <div class="offer-card">
        <div class="offer-type">Line of credit</div><div class="offer-amt">$100k</div>
        <div class="offer-line"><span>Structure</span><b>Revolving</b></div>
        <div class="offer-line"><span>Payment</span><b>On draw</b></div>
        <div class="offer-line"><span>Fit</span><b>Flexible</b></div>
      </div>
    </div>
    <p class="muted disclosure-copy">Illustrative structures for demonstration. Actual offers, amounts, and terms are set by lenders.</p>
  </div>
</div>`;

// 6. Chaos → path diagram
export const chaosToPath = () => `
<div class="chaos-wrap reveal">
  <div class="chaos-box tex-dots">
    <span class="text-meta chaos-label">Before Fund44</span>
    <span class="chaos-note" style="top:48px;left:20px;--r:-4deg;">Lender A — reapply</span>
    <span class="chaos-note" style="top:96px;left:120px;--r:3deg;">Lender B — new docs</span>
    <span class="chaos-note" style="top:150px;left:30px;--r:-2deg;">Broker calls</span>
    <span class="chaos-note" style="top:60px;left:150px;--r:5deg;">Bank C — declined</span>
    <span class="chaos-note" style="top:190px;left:110px;--r:-6deg;">Spreadsheet #4</span>
    <span class="chaos-note" style="top:120px;left:24px;--r:2deg;">Which fits?</span>
  </div>
  <div class="chaos-arrow">${icon.arrow}</div>
  <div class="path-box">
    <span class="text-label accent-text">With Fund44</span>
    <div class="path-step"><span class="pnum">1</span> Answer a few questions once</div>
    <div class="path-step"><span class="pnum">2</span> See paths based on your profile</div>
    <div class="path-step"><span class="pnum">3</span> Use one document checklist</div>
    <div class="path-step"><span class="pnum">4</span> Compare offers side by side</div>
    <div class="path-step"><span class="pnum">5</span> Continue with one guided flow</div>
  </div>
</div>`;

// feature list item
export const featItem = (ic, h, p) => `
<div class="feat-item"><span class="fi-mark">${ic}</span><div><h4>${h}</h4><p>${p}</p></div></div>`;

// interior page hero with breadcrumb
export const pageHero = ({
  crumbs,
  eyebrow: eb,
  title,
  lead,
  cta = true,
  flowContext = {},
}) => `
<section class="section-tight wrap section-page-head">
  ${breadcrumb(crumbs)}
  <div class="mt-6">${eb ? `<span class="eyebrow reveal">${eb}</span>` : ''}</div>
  <h1 class="h1 reveal mt-4 title-page">${title}</h1>
  <p class="lead reveal mt-6">${lead}</p>
  ${cta ? `<div class="wrap-btns reveal mt-8">${primaryCta('Preview funding paths', flowContext)}${secondaryCta()}</div>` : ''}
</section>`;

// definition / "what is" answer block for AEO
export const answerBlock = (term, def) => `
<div class="card card-shell reveal">
  <div class="eyebrow mb-4">Quick answer</div>
  <p class="text-body-lg role-title-default copy-leading"><strong>${term}</strong> ${def}</p>
</div>`;

// simple 3-step process
export const stepRow = (steps) => `
<div class="grid g-4 reveal" data-stagger>
  ${steps.map((s, i) => `
    <div class="card card-stack-compact">
      <span class="text-meta">0${i + 1}</span>
      <h3 class="title-lg">${s.h}</h3>
      <p class="muted text-body-sm">${s.p}</p>
    </div>`).join('')}
</div>`;

export const relatedLinksModule = ({ eyebrow: eb, heading, groups }) => `
<section class="section-tight wrap">
  ${eyebrow(eb)}
  <h2 class="h2 reveal mt-4 mb-8 title-xl">${heading}</h2>
  <div class="grid g-3 reveal" data-stagger>
    ${groups.map((group) => `
      <section class="card" aria-labelledby="${group.id}">
        <h3 id="${group.id}" class="title-lg">${group.title}</h3>
        <ul role="list" class="section-card-list mt-6">
          ${group.items.map((item) => `
            <li>
              <a href="${item.href}" class="accent-text btn-link copy-accent-link-row" data-link-relation="${item.relation}" data-analytics-route-id="${item.targetAnalyticsRouteId}" data-link-context="related_links:${group.id}" data-destination-route-id="${item.targetRouteId || item.targetAnalyticsRouteId || ''}">${item.label} ${icon.arrow}</a>
              <p class="muted text-body-sm inline-note">${item.description}</p>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('')}
  </div>
</section>`;
