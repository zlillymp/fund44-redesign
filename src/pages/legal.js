import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, disclosure, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';
import {
  disclosures,
  humanReadableIndexingMode,
  identityDisplay,
  indexingPolicy,
  legalApprovalChecklist,
  liveDisclosuresBlocked,
  unresolvedIdentityFields,
} from '../lib/legal.js';
import { getLinkModuleForRoute } from '../lib/link-graph.js';

function legalHead(crumbs, title, updated) {
  return `
  <section class="section-tight wrap wrap-default" style="padding-top:clamp(2rem,4vw,3.5rem)">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      ${crumbs.map((c, i) => i === crumbs.length - 1 ? `<span aria-current="page">${c.label}</span>` : `<a href="${c.path}">${c.label}</a><span class="sep">/</span>`).join('')}
    </nav>
    <h1 class="h1 reveal mt-6">${title}</h1>
    <div class="reveal mt-4" style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center">
      <span class="legal-flag">${icon.info} ${indexingPolicy.allowIndexing ? 'Production-indexable legal mode' : 'Staging / preview noindex legal mode'}</span>
      <span class="muted" style="font-size:var(--text-sm)">${updated ? 'Updated for the current governance draft on 2026-07-26' : `Current mode: ${humanReadableIndexingMode()}`}</span>
    </div>
  </section>`;
}

const section = (h, body) => `
  <div class="reveal" style="margin-top:var(--space-10)">
    <h2 style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:600;letter-spacing:-0.025em;margin-bottom:var(--space-4)">${h}</h2>
    <div style="color:var(--ink-2);display:flex;flex-direction:column;gap:var(--space-4)">${body}</div>
  </div>`;

export function privacy() {
  const crumbs = getBreadcrumbs('privacy');
  const linkModule = getLinkModuleForRoute('privacy');
  setMeta({
    title: 'Privacy — governance draft',
    description: 'Governance draft privacy summary for Fund44. Current preview data stays in-browser, live sharing and retention terms remain blocked pending legal approval, and staging remains noindex.',
    path: hrefForRoute('privacy'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Privacy', true)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    ${disclosure(`<strong>Conservative disclosure draft.</strong> ${disclosures.counselReview} ${liveDisclosuresBlocked.privacyConsent}`)}
    ${section('What we collect', `
      <p>${disclosures.previewPrivacy}</p>
      <p>The preview asks for limited business and contact inputs so the on-screen demo can be personalized. The exact live collection categories, sharing boundaries, retention periods, and consent steps are still pending approval.</p>`)}
    ${section('Why we collect it', `
      <p>${disclosures.fitOverFees}</p>
      <p>For the current preview build, the information is used only to tailor the sample on-screen result in your browser. It is not a published final privacy notice for any live submission workflow.</p>`)}
    ${section('How information is shared', `
      <p>${disclosures.marketplacePreview}</p>
      <p>${liveDisclosuresBlocked.privacyConsent}</p>`)}
    ${section('Your controls', `
      <p>Final user-rights procedures, contact methods for privacy requests, consent records, and retention handling are not approved yet. Those items remain blocked and must be finalized before launch.</p>
      <ul style="padding-left:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2)">
        <li>Staging and preview remain non-indexable while privacy and consent approvals are incomplete.</li>
        <li>Unverified identity and contact fields are intentionally withheld instead of being guessed.</li>
        <li>SameAs profiles remain omitted until verified.</li>
      </ul>`)}
    ${section('Credit information', `
      <p>${disclosures.creditPreview}</p>
      <p>If a live provider handoff is introduced later, any provider-run inquiry language must be reviewed again with the final consent flow.</p>`)}
    ${section('What still needs approval', `
      <ul style="padding-left:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2)">
        ${legalApprovalChecklist
          .filter((item) => item.area === 'Privacy and consent' || item.area === 'Security' || item.area === 'Identity')
          .map((item) => `<li><strong>${item.area}:</strong> ${item.detail}</li>`)
          .join('')}
      </ul>`)}
    ${section('Contact', `<p>Privacy questions will use the verified support channel once it exists. Until then, see the controlled placeholders on our <a href="${hrefForRoute('contact')}" class="accent-text" style="font-weight:600">contact page</a>. ${disclosures.contactPlaceholder}</p>`)}
  </section>
  ${relatedLinksModule(linkModule)}`;
}

export function terms() {
  const crumbs = getBreadcrumbs('terms');
  const linkModule = getLinkModuleForRoute('terms');
  setMeta({
    title: 'Terms & disclosures — governance draft',
    description: 'Fund44 marketplace, credit, identity, and staging-indexing disclosures in governance-draft form. Conservative public wording is approved by business, while final legal and entity details remain blocked.',
    path: hrefForRoute('terms'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Terms & disclosures', true)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    ${disclosure(`<strong>Conservative disclosure draft.</strong> ${disclosures.counselReview} Final legal business identity, support details, consent flow, retention terms, and sameAs references remain blocked.`)}
    ${section('Marketplace disclosure', `
      <p>${disclosures.marketplacePreview}</p>
      <p>${disclosures.networkStory}</p>`)}
    ${section('How paths are explained', `
      <p>${disclosures.fitOverFees}</p>
      <p>${disclosures.fasterProcess}</p>`)}
    ${section('No guarantees', `
      <p>${disclosures.noGuarantees}</p>
      <p>${disclosures.illustrative}</p>`)}
    ${section('Credit inquiries', `
      <p>${disclosures.creditPreview}</p>
      <p>If you later proceed with a provider in a live workflow, that provider may apply its own underwriting steps. Final provider-handoff language is still pending legal and product approval.</p>`)}
    ${section('Educational content', `
      <p>${disclosures.educational}</p>`)}
    ${section('Indexing and entity status', `
      <p><strong>Current indexing mode:</strong> ${humanReadableIndexingMode()}. ${indexingPolicy.note}</p>
      <p><strong>sameAs policy:</strong> ${liveDisclosuresBlocked.sameAs}</p>`)}
    ${section('Identity and contact status', `
      <ul style="padding-left:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2)">
        ${unresolvedIdentityFields.map((field) => `<li>${describeField(field.key)}</li>`).join('')}
      </ul>`)}
    ${section('Contact', `<p>Questions about these terms will route through the verified support channel once those details are approved. Until then, our <a href="${hrefForRoute('contact')}" class="accent-text" style="font-weight:600">contact page</a> keeps every unresolved value visibly marked as TBD.</p>`)}
  </section>
  ${relatedLinksModule(linkModule)}`;
}

export function contact() {
  const crumbs = getBreadcrumbs('contact');
  const linkModule = getLinkModuleForRoute('contact');
  setMeta({
    title: 'Contact Fund44',
    description: 'Fund44 contact and entity placeholders are intentionally controlled until legal business name, mailing address, support email, and support phone are verified.',
    path: hrefForRoute('contact'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  const generalEmail = identityDisplay('supportEmail');
  const phone = identityDisplay('supportPhone');
  const address = identityDisplay('mailingAddress');
  const legalName = identityDisplay('legalBusinessName');

  return `
  ${legalHead(crumbs, 'Contact', false)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    ${disclosure(`<strong>Controlled TBD state.</strong> ${disclosures.contactPlaceholder}`)}
    <p class="lead reveal">This page is designed to make unresolved identity and contact fields obvious. Nothing below should be mistaken for final production contact data.</p>
    <div class="grid g-2 reveal mt-8" data-stagger>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">Legal business name</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">${legalName.value}</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">${legalName.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">Mailing address</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">${address.value}</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">${address.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">Support email</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">${generalEmail.value}</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">${generalEmail.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">Support phone</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">${phone.value}</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">${phone.note}</p>
      </div>
    </div>
    <div class="card reveal mt-8">
      <div class="eyebrow" style="margin-bottom:var(--space-3)">What still blocks launch-ready contact publishing</div>
      <ul style="padding-left:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2)">
        <li>Verified legal business name</li>
        <li>Verified mailing address</li>
        <li>Verified support email</li>
        <li>Verified support phone</li>
        <li>Final privacy, consent, and retention language with the corresponding support workflows</li>
      </ul>
    </div>
    <div class="mt-8" style="text-align:center">
      <button class="btn btn-primary btn-lg" data-open-flow>Preview funding paths ${icon.arrow}</button>
    </div>
  </section>
  ${relatedLinksModule(linkModule)}`;
}

function describeField(fieldKey) {
  return identityDisplay(fieldKey).note;
}
