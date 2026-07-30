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
import { initAnalyticsDestinations } from './lib/analytics/destinations/index.js';
import { initMonitoring } from './lib/monitoring.js';

const app = typeof document !== 'undefined' ? document.getElementById('app') : null;
let cleanupVisibilityEvents = () => {};
let lastResolvedRouteId = '';
let mobileMenuLastFocus = null;
let lastRenderLocationKey = null;

function getLocationKey() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scheduleFocus(target, attempts = 2) {
  if (!target) return;
  const tryFocus = () => {
    if (!target?.isConnected) return;
    focusWithoutScroll(target);
    if (document.activeElement !== target && attempts > 0) {
      window.setTimeout(() => scheduleFocus(target, attempts - 1), 32);
    }
  };

  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(tryFocus);
        return;
      }
      tryFocus();
    }, 0);
    return;
  }

  queueMicrotask(tryFocus);
}

function focusWithoutScroll(target) {
  target?.focus?.({ preventScroll: true });
}

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
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.dataset.skipLinkFocus = 'true';
    }
    focusWithoutScroll(target);
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
  const reduce = prefersReducedMotion();
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
    if (prefersReducedMotion()) {
      el.textContent = target;
      return;
    }
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
    if (prefersReducedMotion()) {
      el.style.width = `${el.dataset.fit}%`;
      return;
    }
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

function initDesktopNavPanels() {
  const navItems = [...document.querySelectorAll('.nav-item-has-panel')];
  if (!navItems.length) return;

  const setExpanded = (item, isExpanded) => {
    const trigger = item.querySelector('.nav-link[aria-controls]');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', String(isExpanded));
  };

  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => setExpanded(item, true));
    item.addEventListener('mouseleave', () => setExpanded(item, false));
    item.addEventListener('focusin', () => setExpanded(item, true));
    item.addEventListener('focusout', (event) => {
      if (item.contains(event.relatedTarget)) return;
      setExpanded(item, false);
    });
  });
}

// mobile menu
function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const opener = document.querySelector('[data-menu-open]');

  const focusableInMenu = () => [...menu.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute('hidden') && !element.closest('[hidden]'));

  const open = () => {
    mobileMenuLastFocus = document.activeElement;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    opener?.setAttribute('aria-expanded', 'true');
    const closeButton = menu.querySelector('[data-menu-close]');
    scheduleFocus(closeButton || focusableInMenu()[0]);
  };
  const close = () => {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    opener?.setAttribute('aria-expanded', 'false');
    focusWithoutScroll(mobileMenuLastFocus || opener);
    mobileMenuLastFocus = null;
  };
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-open]')) open();
    else if (e.target.closest('[data-menu-close]')) close();
    else if (e.target.closest('#mobileMenu a')) close();
    else if (e.target.closest('#mobileMenu [data-open-flow]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = focusableInMenu();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !menu.contains(active))) {
        e.preventDefault();
        focusWithoutScroll(last);
        return;
      }
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        focusWithoutScroll(first);
      }
    }
  });
}

// FAQ accordion
function initFaq() {
  const toggleFaq = (q) => {
    if (!q) return;
    const item = q.closest('.faq-item');
    const ans = item?.querySelector('.faq-a');
    if (!item || !ans) return;
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', String(open));
    ans.hidden = !open;
    ans.style.maxHeight = open ? `${ans.scrollHeight}px` : '0';
  };

  const trackFaqOpen = (q) => {
    trackFaqExpand({
      faqId: q.dataset.faqId || '',
      faqGroup: q.dataset.faqGroup || '',
      faqPosition: Number(q.dataset.faqPosition || '0'),
    });
  };

  document.body.addEventListener('click', (e) => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    const isOpening = q.getAttribute('aria-expanded') !== 'true';
    toggleFaq(q);
    if (isOpening) {
      trackFaqOpen(q);
    }
  });

  document.body.addEventListener('keydown', (e) => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const isOpening = q.getAttribute('aria-expanded') !== 'true';
      toggleFaq(q);
      if (isOpening) {
        trackFaqOpen(q);
      }
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
  lastRenderLocationKey = getLocationKey();
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
    if (href === '#main' || href === '#app') {
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
    if (getLocationKey() === lastRenderLocationKey) {
      return;
    }
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
  initAnalyticsDestinations();
  initMonitoring();
  initTheme();
  initHeaderScroll();
  initDesktopNavPanels();
  initMobileMenu();
  initFaq();
  initFlow();
  initNavigation();
  document.addEventListener('click', (event) => {
    const skipLink = event.target.closest('.skip-link');
    if (!skipLink) return;
    event.preventDefault();
    scrollToAnchor(skipLink.getAttribute('href'));
  });
  document.addEventListener('keydown', (event) => {
    const skipLink = event.target.closest('.skip-link');
    if (!skipLink) return;
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault();
    scrollToAnchor(skipLink.getAttribute('href'));
  });
  render({ preserveScroll: Boolean(window.location.hash) }).then(() => {
    if (window.location.hash) scrollToAnchor(window.location.hash);
  });
}

if (typeof window !== 'undefined' && app) {
  boot();
}
