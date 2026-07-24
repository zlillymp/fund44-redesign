import { logo, logoMark, icon } from '../lib/svg.js';

export const NAV = [
  { label: 'Financing', href: '#/financing', panel: [
    { label: 'Financing overview', href: '#/financing', desc: 'All the paths in one place' },
    { label: 'SBA 7(a) loans', href: '#/sba-7a', desc: 'Flexible, longer-term capital' },
    { label: 'SBA 504 loans', href: '#/sba-504', desc: 'Real estate & major equipment' },
    { label: 'Business acquisition', href: '#/business-acquisition', desc: 'Buy a business or partner out' },
    { label: 'Working capital & lines', href: '#/working-capital', desc: 'Day-to-day cash flow' },
  ]},
  { label: 'How it works', href: '#/how-it-works' },
  { label: 'Resources', href: '#/resources' },
  { label: 'About', href: '#/about' },
];

export function header() {
  return `
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header" id="siteHeader">
    <div class="wrap nav">
      ${logo()}
      <nav class="nav-links" aria-label="Primary">
        ${NAV.map((n) => n.panel ? `
          <div class="nav-item">
            <a class="nav-link" href="${n.href}" data-nav="${n.href}">${n.label}</a>
            <div class="nav-panel" role="menu">
              ${n.panel.map((p) => `<a href="${p.href}" role="menuitem"><strong>${p.label}</strong><span>${p.desc}</span></a>`).join('')}
            </div>
          </div>` : `<a class="nav-link" href="${n.href}" data-nav="${n.href}">${n.label}</a>`).join('')}
      </nav>
      <div class="nav-right">
        <button class="theme-toggle" data-theme-toggle aria-label="Switch color theme"></button>
        <button class="btn btn-primary nav-cta-desktop" data-open-flow>Preview funding paths</button>
        <button class="menu-btn" data-menu-open aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <div class="wrap" style="padding-inline:0;display:flex;flex-direction:column;flex:1">
      <div class="mobile-menu-head">
        ${logo()}
        <button class="theme-toggle" data-menu-close aria-label="Close menu">${icon.close}</button>
      </div>
      <nav class="mobile-links" aria-label="Mobile">
        <a href="#/">Home</a>
        <a href="#/financing">Financing</a>
        <a href="#/sba-7a" class="sub">SBA 7(a) loans</a>
        <a href="#/sba-504" class="sub">SBA 504 loans</a>
        <a href="#/business-acquisition" class="sub">Business acquisition</a>
        <a href="#/working-capital" class="sub">Working capital & lines</a>
        <a href="#/how-it-works">How it works</a>
        <a href="#/resources">Resources</a>
        <a href="#/about">About</a>
      </nav>
      <div class="mobile-menu-cta">
        <button class="btn btn-primary btn-lg btn-block" data-open-flow>Preview funding paths ${icon.arrow}</button>
      </div>
    </div>
  </div>`;
}

export function footer() {
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="cta-banner" style="margin-bottom:var(--space-16)">
        <div class="tex-grid"></div>
        <div class="cta-banner-inner" style="display:flex;flex-wrap:wrap;gap:var(--space-6);justify-content:space-between;align-items:center">
          <div>
            <h2 class="h2" style="max-width:16ch">One application. More ways to fund your business.</h2>
            <p class="lead" style="margin-top:var(--space-4);color:var(--on-dark-muted)">Explore the financing paths Fund44 is designed to support before the live application launches.</p>
          </div>
          <div class="wrap-btns">
            <button class="btn btn-primary btn-lg" data-open-flow>Preview funding paths ${icon.arrow}</button>
            <a class="btn btn-on-dark btn-lg" href="#/financing" style="background:transparent;border-color:var(--on-dark-line);color:var(--on-dark)">Explore financing</a>
          </div>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-col">
          <a href="#/" class="logo" style="display:inline-flex;align-items:center;gap:.5rem;color:var(--on-dark)">
            ${logoMark(28)}
            <span style="font-family:var(--font-display);font-weight:600;font-size:1.25rem;letter-spacing:-0.04em">Fund<span style="color:var(--accent)">44</span></span>
          </a>
          <p style="margin-top:var(--space-4);font-size:var(--text-sm);color:var(--on-dark-muted);max-width:34ch">A small-business capital marketplace. Apply once; get matched to relevant financing paths from a network of third-party lenders.</p>
        </div>
        <div class="footer-col">
          <h4>Financing</h4>
          <ul role="list">
            <li><a href="#/sba-7a">SBA 7(a) loans</a></li>
            <li><a href="#/sba-504">SBA 504 loans</a></li>
            <li><a href="#/business-acquisition">Business acquisition</a></li>
            <li><a href="#/working-capital">Working capital & lines</a></li>
            <li><a href="#/financing">All financing</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul role="list">
            <li><a href="#/how-it-works">How it works</a></li>
            <li><a href="#/about">About Fund44</a></li>
            <li><a href="#/resources">Learning hub</a></li>
            <li><a href="#/resources/sba-7a-vs-504">SBA 7(a) vs 504</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <ul role="list">
            <li><a href="#/privacy">Privacy</a></li>
            <li><a href="#/terms">Terms & disclosures</a></li>
            <li><a href="#/contact">Contact</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-disclosure">
        <p><strong style="color:var(--on-dark)">Fund44 is not a lender or a bank.</strong> Fund44 is a technology marketplace that helps small-business owners find and compare financing options offered by third-party lenders. Financing is provided by those lenders. Eligibility, availability, rates, and terms vary by provider and are determined by each lender — not by Fund44.</p>
        <p>Checking your initial options may use information that does not affect your credit score. Lenders you choose to proceed with may later perform a hard credit inquiry as part of their own underwriting. Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount.</p>
        <p style="display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:center">
          <span>© ${new Date().getFullYear()} Fund44. Preview site.</span>
          <span style="font-family:var(--font-mono);border:1px dashed var(--on-dark-line);padding:.25rem .55rem;border-radius:6px;font-size:11px;letter-spacing:.05em;text-transform:uppercase">Preview — legal review required</span>
        </p>
      </div>
    </div>
  </footer>`;
}
