import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, disclosure, relatedLinksModule } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';
import {
  disclosures,
  entityProfile,
  humanReadableIndexingMode,
  identityDisplay,
  indexingPolicy,
  legalApprovalChecklist,
  liveDisclosuresBlocked,
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
      <span class="legal-flag">${icon.info} Published mock legal policy</span>
      <span class="muted text-body-sm">${updated ? 'Updated 2026-07-30' : `Current mode: ${humanReadableIndexingMode()}`}</span>
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
    title: 'Privacy Policy',
    description: 'Privacy policy for Fund44 LLC. Learn how we handle, collect, use, and protect your business and personal information.',
    path: hrefForRoute('privacy'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Privacy Policy', true)}
  <section class="wrap wrap-default section-legal-body">
    ${disclosure(`<strong>Privacy Policy.</strong> This policy describes how Fund44 LLC collects, uses, and safeguards information submitted through our small-business capital marketplace.`, {
      disclosureId: 'privacy_page_notice',
      disclosureContext: 'privacy_page',
    })}
    ${section('Scope & Overview', `
      <p>Fund44 LLC ("Fund44", "we", "us", or "our"), located at ${entityProfile.mailingAddress}, operates a small-business capital marketplace. This Privacy Policy explains our data practices regarding information collected through our website, intake tools, and support channels (<a href="mailto:${entityProfile.supportEmail}" class="accent-text copy-accent-link">${entityProfile.supportEmail}</a> and <a href="tel:${entityProfile.supportPhone.replace(/[^\d+]/g, '')}" class="accent-text copy-accent-link">${entityProfile.supportPhone}</a>).</p>`)}
    ${section('Information We Collect', `
      <p>We collect information necessary to evaluate small-business financing requirements and deliver personalized marketplace path comparisons:</p>
      <ul>
        <li><strong>Business Profile Information:</strong> Company name, entity type, industry, annual revenue range, time in business, requested financing amount, and intended use of funds.</li>
        <li><strong>Representative & Contact Details:</strong> Representative name, job title, business email address, phone number, and physical mailing address.</li>
        <li><strong>Technical & Usage Data:</strong> Browser characteristics, IP address, device type, referrer URL, page interactions, and session preferences.</li>
      </ul>`)}
    ${section('How We Use Information', `
      <p>${disclosures.fitOverFees}</p>
      <p>We use collected data to assess eligibility, match inquiries with relevant financing options across our curated network, communicate intake status, operate our marketplace workflow, and fulfill legal and regulatory compliance obligations.</p>`)}
    ${section('Information Sharing & Third-Party Disclosures', `
      <p>${disclosures.marketplacePreview}</p>
      <p>${disclosures.networkStory}</p>
      <p>Information is shared with third-party financing providers only after explicit authorization. We may also disclose data to technical service providers under standard confidentiality terms or when required by court order or legal process.</p>`)}
    ${section('Data Security & Retention', `
      <p>Fund44 maintains technical and administrative safeguards to protect information against unauthorized access, loss, or disclosure. We retain completed intake records for up to 7 years to meet legal and regulatory obligations, while incomplete inquiries are purged after 90 days.</p>`)}
    ${section('Borrower Rights & Choices', `
      <p>You maintain rights regarding your personal and business data:</p>
      <ul class="list-plain">
        <li><strong>Access & Correction:</strong> Request access to or correction of your contact details by emailing <a href="mailto:${entityProfile.supportEmail}" class="accent-text copy-accent-link">${entityProfile.supportEmail}</a>.</li>
        <li><strong>Communication Preferences:</strong> Opt out of promotional email or phone updates at any time.</li>
        <li><strong>Data Deletion:</strong> Request deletion of non-essential records where retention is not required by law.</li>
      </ul>`)}
    ${section('Credit Information Disclosure', `
      <p>${disclosures.creditPreview}</p>
      <p>Checking initial options uses information that does not affect your credit score. If you choose to proceed with a specific financing provider, that provider may later perform a credit inquiry according to its own underwriting policies.</p>`)}
    ${section('Governance Status', `
      <ul class="list-plain">
        ${legalApprovalChecklist
          .map((item) => `<li><strong>${item.area}:</strong> ${item.detail}</li>`)
          .join('')}
      </ul>`)}
    ${section('Contact', `<p>Privacy inquiries can be submitted to Fund44 LLC at <a href="mailto:${entityProfile.supportEmail}" class="accent-text copy-accent-link">${entityProfile.supportEmail}</a> or by calling <a href="tel:${entityProfile.supportPhone.replace(/[^\d+]/g, '')}" class="accent-text copy-accent-link">${entityProfile.supportPhone}</a>. See our <a href="${hrefForRoute('contact')}" class="accent-text copy-accent-link">contact page</a> for full details.</p>`)}
  </section>
  ${relatedLinksModule(linkModule)}`;
}

export function terms() {
  const crumbs = getBreadcrumbs('terms');
  const linkModule = getLinkModuleForRoute('terms');
  setMeta({
    title: 'Terms of Service & Disclosures',
    description: 'Terms of Service and legal disclosures governing the use of Fund44 LLC small-business capital marketplace and tools.',
    path: hrefForRoute('terms'),
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Terms of Service', true)}
  <section class="wrap wrap-default section-legal-body">
    ${disclosure(`<strong>Terms & Disclosures.</strong> These terms govern your access to and use of Fund44 LLC services, marketplace tools, and educational resources.`, {
      disclosureId: 'terms_page_notice',
      disclosureContext: 'terms_page',
    })}
    ${section('Acceptance & Scope', `
      <p>These Terms of Service ("Terms") govern your use of the website and services provided by Fund44 LLC ("Fund44"), ${entityProfile.mailingAddress}. By accessing or using our marketplace tools, you agree to comply with these Terms and our Privacy Policy.</p>`)}
    ${section('Marketplace Disclosure', `
      <p>${disclosures.marketplacePreview}</p>
      <p>${disclosures.networkStory}</p>`)}
    ${section('Routing & Workflow Explanation', `
      <p>${disclosures.fitOverFees}</p>
      <p>${disclosures.fasterProcess}</p>`)}
    ${section('No Guarantees & Non-Binding Guidance', `
      <p>${disclosures.noGuarantees}</p>
      <p>${disclosures.illustrative}</p>`)}
    ${section('Credit Inquiry Disclosure', `
      <p>${disclosures.creditPreview}</p>
      <p>Fund44 does not perform credit-damaging initial inquiries. If you proceed with a third-party financing provider, that provider may conduct its own credit evaluation and underwriting steps.</p>`)}
    ${section('Educational Content Disclaimer', `
      <p>${disclosures.educational}</p>`)}
    ${section('Acceptable Use & Intellectual Property', `
      <p>All content, branding, code, and interface designs are the intellectual property of Fund44 LLC or its licensors. Users may not scrape, reverse engineer, modify, or redistribute website materials without prior written consent.</p>`)}
    ${section('Limitation of Liability', `
      <p>Fund44 LLC provides its marketplace and tools on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, Fund44 LLC disclaims all liability for indirect, incidental, special, or consequential damages resulting from site use or provider decisions.</p>`)}
    ${section('Governing Law & Jurisdiction', `
      <p>These Terms are governed by and construed in accordance with the laws of the State of Texas, without giving effect to conflicts of law principles. Any legal suit, action, or proceeding arising under these Terms shall be instituted exclusively in the state or federal courts located in Austin, Travis County, Texas.</p>`)}
    ${section('Contact Details', `<p>Questions regarding these Terms may be directed to Fund44 LLC at <a href="mailto:${entityProfile.supportEmail}" class="accent-text copy-accent-link">${entityProfile.supportEmail}</a> or by phone at <a href="tel:${entityProfile.supportPhone.replace(/[^\d+]/g, '')}" class="accent-text copy-accent-link">${entityProfile.supportPhone}</a>. Visit our <a href="${hrefForRoute('contact')}" class="accent-text copy-accent-link">contact page</a> for complete business details.</p>`)}
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
    ${disclosure(`<strong>Contact Privacy Notice.</strong> Information submitted via this page is used by Fund44 LLC to respond to your inquiry and support your financing request.`, {
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
