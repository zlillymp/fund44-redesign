import { logo, logoMark, icon } from '../lib/svg.js';
import { getCtaDestination, getFooterNavigation, getMobileNavigation, getPrimaryNavigation, hrefForRoute } from '../lib/routes.js';
import { disclosures, humanReadableIndexingMode } from '../lib/legal.js';

export function header() {
  const navItems = getPrimaryNavigation();
  const mobileItems = getMobileNavigation();
  return `
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header" id="siteHeader">
    <div class="wrap nav">
      ${logo()}
      <nav class="nav-links" aria-label="Primary">
        ${navItems.map((n) => n.panel ? `
          <div class="nav-item">
            <a class="nav-link" href="${n.href}" data-nav-route="${n.routeId}">${n.label}</a>
            <div class="nav-panel" role="menu">
              ${n.panel.map((p) => `<a href="${p.href}" role="menuitem"><strong>${p.label}</strong><span>${p.description}</span></a>`).join('')}
            </div>
          </div>` : `<a class="nav-link" href="${n.href}" data-nav-route="${n.routeId}">${n.label}</a>`).join('')}
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
        ${mobileItems.map((item) => `<a href="${item.href}"${item.className ? ` class="${item.className}"` : ''}>${item.label}</a>`).join('')}
      </nav>
      <div class="mobile-menu-cta">
        <button class="btn btn-primary btn-lg btn-block" data-open-flow>Preview funding paths ${icon.arrow}</button>
      </div>
    </div>
  </div>`;
}

export function footer() {
  const footerGroups = getFooterNavigation();
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
            <a class="btn btn-on-dark btn-lg" href="${getCtaDestination('explore_financing').href}" style="background:transparent;border-color:var(--on-dark-line);color:var(--on-dark)">Explore financing</a>
          </div>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-col">
          <a href="${hrefForRoute('home')}" class="logo" style="display:inline-flex;align-items:center;gap:.5rem;color:var(--on-dark)">
            ${logoMark(28)}
            <span style="font-family:var(--font-display);font-weight:600;font-size:1.25rem;letter-spacing:-0.04em">Fund<span style="color:var(--accent)">44</span></span>
          </a>
          <p style="margin-top:var(--space-4);font-size:var(--text-sm);color:var(--on-dark-muted);max-width:34ch">${disclosures.marketplacePreview}</p>
        </div>
        ${footerGroups.map((group) => `
          <div class="footer-col">
            <h4>${group.heading}</h4>
            <ul role="list">
              ${group.items.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="footer-disclosure">
        <p><strong style="color:var(--on-dark)">Marketplace disclosure.</strong> ${disclosures.marketplacePreview}</p>
        <p>${disclosures.networkStory}</p>
        <p>${disclosures.creditPreview} ${disclosures.noGuarantees}</p>
        <p style="display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:center">
          <span>© ${new Date().getFullYear()} Fund44. ${humanReadableIndexingMode()}.</span>
          <span style="font-family:var(--font-mono);border:1px dashed var(--on-dark-line);padding:.25rem .55rem;border-radius:6px;font-size:11px;letter-spacing:.05em;text-transform:uppercase">Counsel review still recommended</span>
        </p>
      </div>
    </div>
  </footer>`;
}
