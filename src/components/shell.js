import { logo, logoMark, icon } from '../lib/svg.js';
import { getCtaDestination, getFooterNavigation, getMobileNavigation, getPrimaryNavigation, hrefForRoute } from '../lib/routes.js';
import { disclosures, humanReadableIndexingMode } from '../lib/legal.js';
import { flowTriggerAttributes } from '../lib/eligibility/trigger.js';

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
            <a class="nav-link" href="${n.href}" data-nav-route="${n.routeId}" data-nav-section="primary" data-nav-label="${n.label}" data-destination-route-id="${n.routeId}">${n.label}</a>
            <div class="nav-panel" role="menu">
              ${n.panel.map((p) => `<a href="${p.href}" role="menuitem" data-nav-section="primary_panel" data-nav-label="${p.label}" data-destination-route-id="${p.routeId}"><strong>${p.label}</strong><span>${p.description}</span></a>`).join('')}
            </div>
          </div>` : `<a class="nav-link" href="${n.href}" data-nav-route="${n.routeId}" data-nav-section="primary" data-nav-label="${n.label}" data-destination-route-id="${n.routeId}">${n.label}</a>`).join('')}
      </nav>
      <div class="nav-right">
        <button class="theme-toggle" data-theme-toggle aria-label="Switch color theme"></button>
        <button class="btn btn-primary nav-cta-desktop" data-analytics-cta-id="preview_funding_paths" data-analytics-cta-label="Preview funding paths" data-analytics-cta-type="primary" data-analytics-cta-placement="header_primary" ${flowTriggerAttributes({
          ctaId: 'preview_funding_paths',
          startSurface: 'header_primary',
        })}>Preview funding paths</button>
        <button class="menu-btn" data-menu-open aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <div class="wrap mobile-menu-wrap">
      <div class="mobile-menu-head">
        ${logo()}
        <button class="theme-toggle" data-menu-close aria-label="Close menu">${icon.close}</button>
      </div>
      <nav class="mobile-links" aria-label="Mobile">
        ${mobileItems.map((item) => `<a href="${item.href}" data-nav-section="mobile" data-nav-label="${item.label}" data-destination-route-id="${item.routeId}"${item.className ? ` class="${item.className}"` : ''}>${item.label}</a>`).join('')}
      </nav>
      <div class="mobile-menu-cta">
        <button class="btn btn-primary btn-lg btn-block" data-analytics-cta-id="preview_funding_paths" data-analytics-cta-label="Preview funding paths" data-analytics-cta-type="primary" data-analytics-cta-placement="mobile_menu_primary" ${flowTriggerAttributes({
          ctaId: 'preview_funding_paths',
          startSurface: 'mobile_menu_primary',
        })}>Preview funding paths ${icon.arrow}</button>
      </div>
    </div>
  </div>`;
}

export function footer() {
  const footerGroups = getFooterNavigation();
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="cta-banner footer-banner">
        <div class="tex-grid"></div>
        <div class="cta-banner-inner layout-spread">
          <div>
            <h2 class="h2 cta-banner-heading-compact">More ways to review funding paths.</h2>
            <p class="lead cta-banner-copy">Explore the financing paths Fund44 is designed to support before the live application launches.</p>
          </div>
          <div class="cta-banner-actions">
            <button class="btn btn-primary btn-lg" data-analytics-cta-id="cta_banner_preview_funding_paths" data-analytics-cta-label="Preview funding paths" data-analytics-cta-type="primary" data-analytics-cta-placement="footer_banner_primary" ${flowTriggerAttributes({
              ctaId: 'cta_banner_preview_funding_paths',
              startSurface: 'footer_banner_primary',
            })}>Preview funding paths ${icon.arrow}</button>
            <a class="btn btn-on-dark btn-lg" href="${getCtaDestination('explore_financing').href}" data-analytics-cta-id="explore_financing" data-analytics-cta-label="Explore financing" data-analytics-cta-type="secondary" data-analytics-cta-placement="footer_banner_secondary" data-destination-route-id="financing">Explore financing</a>
          </div>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-col">
          <a href="${hrefForRoute('home')}" class="logo on-dark footer-logo-lockup">
            ${logoMark(28)}
            <span class="logo-wordmark logo-wordmark-compact">Fund<span class="logo-accent">44</span></span>
          </a>
          <p class="footer-brand-copy">${disclosures.marketplacePreview}</p>
        </div>
        ${footerGroups.map((group) => `
          <div class="footer-col">
            <h4>${group.heading}</h4>
            <ul role="list">
              ${group.items.map((item) => `<li><a href="${item.href}" data-nav-section="footer" data-nav-label="${item.label}" data-destination-route-id="${item.routeId}">${item.label}</a></li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <div class="footer-disclosure">
        <p data-disclosure-id="footer_marketplace_disclosure" data-disclosure-context="footer" data-disclosure-version="2026-07-26.f44-mea-02"><strong class="footer-strong">Marketplace disclosure.</strong> ${disclosures.marketplacePreview}</p>
        <p data-disclosure-id="footer_network_story" data-disclosure-context="footer" data-disclosure-version="2026-07-26.f44-mea-02">${disclosures.networkStory}</p>
        <p data-disclosure-id="footer_credit_disclosure" data-disclosure-context="footer" data-disclosure-version="2026-07-26.f44-mea-02">${disclosures.creditPreview} ${disclosures.noGuarantees}</p>
        <p class="footer-label-row">
          <span>© ${new Date().getFullYear()} Fund44. ${humanReadableIndexingMode()}.</span>
          <span class="label-badge on-dark">Counsel review still recommended</span>
        </p>
      </div>
    </div>
  </footer>`;
}
