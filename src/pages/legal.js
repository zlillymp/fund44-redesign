import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { eyebrow, disclosure } from '../components/ui.js';
import { getBreadcrumbs, hrefForRoute } from '../lib/routes.js';

function legalHead(crumbs, title, updated) {
  return `
  <section class="section-tight wrap wrap-default" style="padding-top:clamp(2rem,4vw,3.5rem)">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      ${crumbs.map((c, i) => i === crumbs.length - 1 ? `<span aria-current="page">${c.label}</span>` : `<a href="${c.path}">${c.label}</a><span class="sep">/</span>`).join('')}
    </nav>
    <h1 class="h1 reveal mt-6">${title}</h1>
    <div class="reveal mt-4" style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center">
      <span class="legal-flag">${icon.info} Preview — legal review required</span>
      <span class="muted" style="font-size:var(--text-sm)">Last updated: placeholder</span>
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
  setMeta({
    title: 'Privacy — preview',
    description: 'How Fund44 approaches privacy: what information is collected to match you with lenders, how it is used, and the controls you have. Preview copy pending legal review.',
    path: '/privacy',
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Privacy', true)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    ${disclosure('<strong>This is placeholder preview copy.</strong> It describes intended privacy practices in plain language for demonstration and must be reviewed and finalized by qualified legal counsel before publication. It does not yet constitute a binding privacy policy.')}
    ${section('What we collect', `
      <p>To match you with relevant financing options, Fund44 collects the information you provide — such as your use of funds, desired amount, time in business, revenue range, state, and contact details — plus documents you choose to upload.</p>
      <p><strong>In this preview, no information is transmitted to any server or third party.</strong> The eligibility flow runs entirely in your browser and shows sample results only.</p>`)}
    ${section('Why we collect it', `
      <p>Business and financial details are used to screen your profile against relevant lender products and to surface paths that fit. Contact details are used to share your results and next steps.</p>`)}
    ${section('How information is shared', `
      <p>In the live product, information you submit may be shared with third-party lenders you are matched to, so they can evaluate your request. <strong>Fund44 is not a lender</strong> and does not make lending decisions. You control which lenders you choose to proceed with.</p>`)}
    ${section('Your controls', `
      <ul style="padding-left:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2)">
        <li>Choose what to share and which lenders to proceed with.</li>
        <li>Request access to, correction of, or deletion of your information.</li>
        <li>Opt out of non-essential communications.</li>
      </ul>
      <p>Specific rights and request procedures (including any applicable state privacy rights) will be finalized during legal review.</p>`)}
    ${section('Credit information', `
      <p>Checking your initial options can use information that does not affect your credit score. If you choose to proceed with a lender, that lender may perform a hard credit inquiry as part of its own underwriting.</p>`)}
    ${section('Contact', `<p>Privacy questions can be directed to the contact placeholder on our <a href="${hrefForRoute('contact')}" class="accent-text" style="font-weight:600">contact page</a> once verified contact details are added.</p>`)}
  </section>`;
}

export function terms() {
  const crumbs = getBreadcrumbs('terms');
  setMeta({
    title: 'Terms & disclosures — preview',
    description: 'Fund44 terms and marketplace disclosures in plain language. Fund44 is not a lender; financing is offered by third-party providers. Preview copy pending legal review.',
    path: '/terms',
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Terms & disclosures', true)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    ${disclosure('<strong>This is placeholder preview copy.</strong> These terms and disclosures are drafted in plain language for demonstration and require review and finalization by qualified legal counsel before they take effect. They are not yet a binding agreement.')}
    ${section('Marketplace disclosure', `
      <p><strong>Fund44 is not a lender or a bank.</strong> Fund44 is a technology marketplace that helps small-business owners find and compare financing options offered by third-party lenders. Financing is provided by those lenders.</p>
      <p><strong>Eligibility, availability, rates, and terms vary by provider</strong> and are determined by each lender — not by Fund44. Being matched to a path is not an offer, an approval, or a guarantee of funding.</p>`)}
    ${section('No guarantees', `
      <p>Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount. Any structures, amounts, or timelines shown on this site are illustrative or interface examples for demonstration only.</p>`)}
    ${section('Credit inquiries', `
      <p>Checking your initial options may use information that does not affect your credit score. Lenders you choose to proceed with may later perform a hard credit inquiry as part of their underwriting. Fund44 does not make "no credit impact" promises about a lender's own process.</p>`)}
    ${section('Educational content', `
      <p>Content on this site, including the learning hub, is general and educational. It is not financial, legal, or tax advice. Program rules (including SBA programs) and lender requirements change and are set by those entities.</p>`)}
    ${section('Preview status', `
      <p>This site is a preview build. Any figures, testimonials, or metrics are illustrative or interface data. Fund44 does not publish unverified funding claims, named testimonials, or fabricated certifications.</p>`)}
    ${section('Contact', `<p>Questions about these terms can be directed to the contact placeholder on our <a href="${hrefForRoute('contact')}" class="accent-text" style="font-weight:600">contact page</a> once verified contact details are added.</p>`)}
  </section>`;
}

export function contact() {
  const crumbs = getBreadcrumbs('contact');
  setMeta({
    title: 'Contact Fund44',
    description: 'Get in touch with Fund44. Contact details are placeholders in this preview build and will be added once verified.',
    path: '/contact',
    jsonld: [ld.breadcrumb(crumbs)],
  });

  return `
  ${legalHead(crumbs, 'Contact', false)}
  <section class="wrap wrap-default" style="padding-bottom:clamp(3rem,7vw,6rem)">
    <p class="lead reveal">We'd like to hear from you. Verified contact details will be added before launch — the entries below are clearly marked placeholders.</p>
    <div class="grid g-2 reveal mt-8" data-stagger>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">General</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">hello@[placeholder-domain]</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">Placeholder — not yet an active address.</p>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:var(--space-3)">Funding help</div>
        <p style="font-family:var(--font-mono);color:var(--muted)">apply@[placeholder-domain]</p>
        <p class="muted mt-4" style="font-size:var(--text-sm)">Placeholder — use the options preview to get started.</p>
      </div>
    </div>
    <div class="mt-8" style="text-align:center">
      <button class="btn btn-primary btn-lg" data-open-flow>Preview funding paths ${icon.arrow}</button>
    </div>
  </section>`;
}
