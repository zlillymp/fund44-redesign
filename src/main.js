import './styles.css';
import './product.css';
import { header, footer } from './components/shell.js';
import { initFlow } from './components/flow.js';
import { renderRouteToHtml } from './pages/index.js';
import { isLegacyHashRoute, normalizePathname, resolveLegacyHashPath, shouldHighlightRoute } from './lib/routes.js';
import {
  instrumentVisibilityEvents,
  trackCtaClick,
  trackFaqExpand,
  trackInternalLinkClick,
  trackNavClick,
  trackRouteResolved,
  trackTrustModuleClick,
} from './lib/analytics.js';
import { initMonitoring } from './lib/monitoring.js';

const app = typeof document !== 'undefined' ? document.getElementById('app') : null;
let cleanupVisibilityEvents = () => {};
let lastResolvedRouteId = '';

function migrateLegacyHashRoute() {
  const { hash, search } = window.location;
  const legacyPath = resolveLegacyHashPath(hash);
  if (!legacyPath) return false;
  window.history.replaceState({}, '', `${legacyPath}${search}`);
  return true;
}

function shouldHandleLink(anchor) {
  if (!anchor) return false;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return false;
  if (href.startsWith('#')) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  return anchor.origin === window.location.origin;
}

function isSamePageAnchor(anchor) {
  const href = anchor.getAttribute('href');
  if (!href) return false;
  const url = new URL(href, window.location.origin);
  return url.pathname === window.location.pathname && Boolean(url.hash);
}

function scrollToAnchor(hash) {
  if (!hash) return false;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView();
  if (target instanceof HTMLElement) {
    target.focus({ preventScroll: true });
  }
  return true;
}

// theme toggle (system default, no localStorage)
function initTheme() {
  const root = document.documentElement;
  let mode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', mode);
  const paint = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((t) => {
      t.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
      t.innerHTML = mode === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
    });
  };
  paint();
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme-toggle]')) {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      paint();
    }
  });
}

// intersection observer reveals
let io;
function observeReveals() {
  if (io) io.disconnect();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal, .reveal-clip');
  if (reduce) { items.forEach((el) => el.classList.add('in')); return; }
  io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el, i) => { el.style.setProperty('--i', i % 8); io.observe(el); });
}

// count-up + fit bar animation for viz (factual interface data only)
function animateViz() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    const obs = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) {
          let v = 0; const step = Math.max(1, Math.round(target / 24));
          const t = setInterval(() => { v += step; if (v >= target) { v = target; clearInterval(t); } el.textContent = v; }, 30);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });
  document.querySelectorAll('[data-fit]').forEach((el) => {
    const obs = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { el.style.width = el.dataset.fit + '%'; obs.unobserve(el); } });
    }, { threshold: 0.4 });
    obs.observe(el);
  });
}

// header scroll state
function initHeaderScroll() {
  const h = document.getElementById('siteHeader');
  const onScroll = () => h?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// mobile menu
function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded','true'); };
  const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded','false'); };
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-open]')) open();
    else if (e.target.closest('[data-menu-close]')) close();
    else if (e.target.closest('#mobileMenu a')) close();
    else if (e.target.closest('#mobileMenu [data-open-flow]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) close(); });
}

// FAQ accordion
function initFaq() {
  document.body.addEventListener('click', (e) => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    const item = q.closest('.faq-item');
    const ans = item.querySelector('.faq-a');
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open);
    ans.style.maxHeight = open ? ans.scrollHeight + 'px' : '0';
    if (open) {
      trackFaqExpand({
        faqId: q.dataset.faqId || '',
        faqGroup: q.dataset.faqGroup || '',
        faqPosition: Number(q.dataset.faqPosition || '0'),
      });
    }
  });
}

function setActiveNav(currentRouteId) {
  document.querySelectorAll('[data-nav-route]').forEach((a) => {
    const target = a.dataset.navRoute;
    a.classList.toggle('active', shouldHighlightRoute(currentRouteId, target));
  });
}

async function render({ preserveScroll = false } = {}) {
  const { match, html } = renderRouteToHtml(window.location.pathname);
  app.innerHTML = html;
  if (!preserveScroll) {
    window.scrollTo(0, 0);
  }
  setActiveNav(match.route.routeId);
  observeReveals();
  animateViz();
  cleanupVisibilityEvents();
  cleanupVisibilityEvents = instrumentVisibilityEvents(document.body);
  trackRouteResolved({
    pathname: window.location.pathname,
    referrerRouteId: lastResolvedRouteId,
  });
  lastResolvedRouteId = match.route.routeId;
}

function navigate(href, { replace = false } = {}) {
  const url = new URL(href, window.location.origin);
  const nextPath = normalizePathname(url.pathname);
  const nextUrl = `${nextPath}${url.search}${url.hash}`;

  if (replace) {
    window.history.replaceState({}, '', nextUrl);
  } else {
    window.history.pushState({}, '', nextUrl);
  }

  if (url.hash) {
    render({ preserveScroll: true }).then(() => {
      if (!scrollToAnchor(url.hash)) {
        window.location.hash = url.hash;
      }
    });
    return;
  }

  render();
}

function initNavigation() {
  document.body.addEventListener('click', (event) => {
    const trustModuleAction = event.target.closest('[data-trust-module-id] a[href], [data-trust-module-id] button[data-trust-destination]');
    if (trustModuleAction) {
      const module = trustModuleAction.closest('[data-trust-module-id]');
      trackTrustModuleClick({
        trustModuleId: module?.dataset.trustModuleId || '',
        trustType: module?.dataset.trustType || '',
        destination: trustModuleAction.getAttribute('href') || trustModuleAction.dataset.trustDestination || '',
      });
    }

    const ctaButton = event.target.closest('button[data-analytics-cta-id]');
    if (ctaButton) {
      trackCtaClick({
        ctaId: ctaButton.dataset.analyticsCtaId || '',
        ctaLabel: ctaButton.dataset.analyticsCtaLabel || ctaButton.textContent?.trim() || '',
        ctaType: ctaButton.dataset.analyticsCtaType || 'primary',
        ctaPlacement: ctaButton.dataset.analyticsCtaPlacement || 'button',
        destinationRouteId: ctaButton.dataset.destinationRouteId || '',
        eligibilityMode: ctaButton.dataset.eligibilityMode || 'none',
      });
    }

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (href === '#main') {
      return;
    }

    if (isSamePageAnchor(anchor)) {
      event.preventDefault();
      scrollToAnchor(new URL(anchor.href).hash);
      return;
    }

    if (!shouldHandleLink(anchor)) return;

    const navSection = anchor.dataset.navSection || '';
    const navLabel = anchor.dataset.navLabel || anchor.textContent?.trim() || '';
    const destinationRouteId = anchor.dataset.destinationRouteId || '';
    const ctaId = anchor.dataset.analyticsCtaId || '';

    if (navSection) {
      trackNavClick({
        navSection,
        navLabel,
        destinationRouteId,
      });
    }

    if (ctaId) {
      trackCtaClick({
        ctaId,
        ctaLabel: anchor.dataset.analyticsCtaLabel || anchor.textContent?.trim() || '',
        ctaType: anchor.dataset.analyticsCtaType || 'inline',
        ctaPlacement: anchor.dataset.analyticsCtaPlacement || navSection || 'link',
        destinationRouteId,
        eligibilityMode: anchor.dataset.eligibilityMode || 'none',
      });
    }

    if (!ctaId && (anchor.dataset.linkContext || anchor.dataset.linkRelation || anchor.dataset.analyticsRouteId)) {
      trackInternalLinkClick({
        linkContext: anchor.dataset.linkContext || anchor.dataset.linkRelation || 'internal_link',
        destinationRouteId: destinationRouteId || anchor.dataset.analyticsRouteId || '',
        destinationContentId: anchor.dataset.destinationContentId || '',
      });
    }

    const url = new URL(anchor.href);
    const nextPath = normalizePathname(url.pathname);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    if (nextPath === window.location.pathname && !url.hash && url.search === window.location.search) {
      return;
    }
    navigate(anchor.href);
  });

  window.addEventListener('popstate', () => {
    render({ preserveScroll: Boolean(window.location.hash) }).then(() => {
      if (window.location.hash) scrollToAnchor(window.location.hash);
    });
  });
}

function boot() {
  if (isLegacyHashRoute(window.location.hash)) {
    migrateLegacyHashRoute();
  }

  document.getElementById('shell-header').innerHTML = header();
  document.getElementById('shell-footer').innerHTML = footer();
  initMonitoring();
  initTheme();
  initHeaderScroll();
  initMobileMenu();
  initFaq();
  initFlow();
  initNavigation();
  render({ preserveScroll: Boolean(window.location.hash) }).then(() => {
    if (window.location.hash) scrollToAnchor(window.location.hash);
  });
}

if (typeof window !== 'undefined' && app) {
  boot();
}
