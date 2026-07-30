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
  <section class="section-tight wrap wrap-default section-page-head">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      ${crumbs.map((c, i) => i === crumbs.length - 1 ? `<span aria-current="page">${c.label}</span>` : `<a href="${c.path}" data-link-context="breadcrumb" data-destination-route-id="${c.routeId || ''}">${c.label}</a><span class="sep">/</span>`).join('')}
    </nav>
    <h1 class="h1 reveal mt-6">${title}</h1>
    <div class="reveal mt-4 meta-row">
      <span class="legal-flag">${icon.info} ${indexingPolicy.allowIndexing ? 'Production-indexable legal mode' : 'Preview version — not final'}</span>
      <span class="muted text-body-sm">${updated ? 'Preview version updated 2026-07-26' : `Current mode: ${humanReadableIndexingMode()}`}</span>
    </div>
  </section>`;
}

const section = (h, body) => `
  <div class="reveal mt-10">
    <h2 class="title-xl mb-4">${h}</h2>
    <div class="section-copy-stack role-copy-default">${body}</div>
  </div>`;

export function privacy() {
  const crumbs = getBreadcrumbs('privacy');
  const linkModule = getLinkModuleForRoute('privacy');
  setMeta({
    title: 'Privacy policy (preview)',
    description: 'Preview privacy summary for Fund44. Current preview data stays in-browser, live sharing and retention terms remain blocked pending legal approval, and staging remains noindex.',
    path: hrefForRoute('privacy'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Privacy', true)}
  <section class="wrap wrap-default section-legal-body">
    ${disclosure(`<strong>Conservative disclosure draft.</strong> ${disclosures.counselReview} ${liveDisclosuresBlocked.privacyConsent}`, {
      disclosureId: 'privacy_page_draft_disclosure',
      disclosureContext: 'privacy_page',
    })}
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
      <ul class="list-plain">
        <li>Staging and preview remain non-indexable while privacy and consent approvals are incomplete.</li>
        <li>Unverified identity and contact fields are intentionally withheld instead of being guessed.</li>
        <li>SameAs profiles remain omitted until verified.</li>
      </ul>`)}
    ${section('Credit information', `
      <p>${disclosures.creditPreview}</p>
      <p>If a live provider handoff is introduced later, any provider-run inquiry language must be reviewed again with the final consent flow.</p>`)}
    ${section('What still needs approval', `
      <ul class="list-plain">
        ${legalApprovalChecklist
          .filter((item) => item.area === 'Privacy and consent' || item.area === 'Security' || item.area === 'Identity')
          .map((item) => `<li><strong>${item.area}:</strong> ${item.detail}</li>`)
          .join('')}
      </ul>`)}
    ${section('Contact', `<p>Privacy questions can be directed to our verified support channel. See our <a href="${hrefForRoute('contact')}" class="accent-text copy-accent-link">contact page</a> for details. ${disclosures.contactPlaceholder}</p>`)}
  </section>
  ${relatedLinksModule(linkModule)}`;
}

export function terms() {
  const crumbs = getBreadcrumbs('terms');
  const linkModule = getLinkModuleForRoute('terms');
  setMeta({
    title: 'Terms & disclosures (preview)',
    description: 'Fund44 marketplace, credit, identity, and staging-indexing disclosures in preview form. Conservative public wording is approved by business, while final legal and entity details remain blocked.',
    path: hrefForRoute('terms'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Terms & disclosures', true)}
  <section class="wrap wrap-default section-legal-body">
    ${disclosure(`<strong>Conservative disclosure draft.</strong> ${disclosures.counselReview} Final legal business identity, support details, consent flow, retention terms, and sameAs references remain blocked.`, {
      disclosureId: 'terms_page_draft_disclosure',
      disclosureContext: 'terms_page',
    })}
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
      <ul class="list-plain">
        ${unresolvedIdentityFields.map((field) => `<li>${describeField(field.key)}</li>`).join('')}
      </ul>`)}
    ${section('Contact', `<p>Questions about these terms will route through the verified support channel once those details are approved. Until then, our <a href="${hrefForRoute('contact')}" class="accent-text copy-accent-link">contact page</a> keeps every unresolved value visibly marked as TBD.</p>`)}
  </section>
  ${relatedLinksModule(linkModule)}`;
}

export function contact() {
  const crumbs = getBreadcrumbs('contact');
  const linkModule = getLinkModuleForRoute('contact');
  setMeta({
    title: 'Contact Fund44',
    description: 'Contact Fund44 LLC for small-business financing questions and support.',
    path: hrefForRoute('contact'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  const generalEmail = identityDisplay('supportEmail');
  const phone = identityDisplay('supportPhone');
  const address = identityDisplay('mailingAddress');
  const legalName = identityDisplay('legalBusinessName');

  return `
  ${legalHead(crumbs, 'Contact', false)}
  <section class="wrap wrap-default section-legal-body">
    ${disclosure(`<strong>Privacy notice.</strong> ${disclosures.contactPlaceholder}`, {
      disclosureId: 'contact_page_privacy_notice',
      disclosureContext: 'contact_page',
    })}
    <div class="grid g-2 reveal mt-8" data-stagger>
      <div class="card">
        <div class="eyebrow mb-4">Legal business name</div>
        <p class="text-meta">${legalName.value}</p>
        <p class="muted mt-4 text-body-sm">${legalName.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow mb-4">Mailing address</div>
        <p class="text-meta">${address.value}</p>
        <p class="muted mt-4 text-body-sm">${address.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow mb-4">Support email</div>
        <p class="text-meta"><a href="mailto:${generalEmail.value}" class="accent-text copy-accent-link">${generalEmail.value}</a></p>
        <p class="muted mt-4 text-body-sm">${generalEmail.note}</p>
      </div>
      <div class="card">
        <div class="eyebrow mb-4">Support phone</div>
        <p class="text-meta"><a href="tel:${phone.value.replace(/[^\d+]/g, '')}" class="accent-text copy-accent-link">${phone.value}</a></p>
        <p class="muted mt-4 text-body-sm">${phone.note}</p>
      </div>
    </div>
    <div class="mt-8 layout-center">
      <button
        class="btn btn-primary btn-lg"
        data-analytics-cta-id="preview_funding_paths"
        data-analytics-cta-label="Preview funding paths"
        data-analytics-cta-type="primary"
        data-analytics-cta-placement="contact_page_primary"
        data-open-flow
        data-cta-id="preview_funding_paths"
        data-start-surface="contact_page_primary"
        data-flow-mode="preview"
        data-flow-product-route-id="contact"
      >Preview funding paths ${icon.arrow}</button>
    </div>
  </section>
  ${relatedLinksModule(linkModule)}`;
}

function describeField(fieldKey) {
  return identityDisplay(fieldKey).note;
}
