import './styles.css';
import './product.css';
import { header, footer } from './components/shell.js';
import { initFlow } from './components/flow.js';
import { routes } from './pages/index.js';

const app = document.getElementById('app');

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  // exact match first
  if (routes[hash]) return { fn: routes[hash], param: null };
  // dynamic: /resources/:slug
  const m = hash.match(/^\/resources\/(.+)$/);
  if (m && routes['/resources/:slug']) return { fn: routes['/resources/:slug'], param: m[1] };
  return { fn: routes['*'], param: hash };
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
  });
}

function setActiveNav() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const target = a.dataset.nav.replace(/^#/, '');
    a.classList.toggle('active', target === hash || (target !== '/' && hash.startsWith(target)));
  });
}

async function render() {
  const { fn, param } = currentRoute();
  const html = fn(param);
  app.innerHTML = html;
  window.scrollTo(0, 0);
  setActiveNav();
  observeReveals();
  animateViz();
}

function boot() {
  document.getElementById('shell-header').innerHTML = header();
  document.getElementById('shell-footer').innerHTML = footer();
  initTheme();
  initHeaderScroll();
  initMobileMenu();
  initFaq();
  initFlow();
  window.addEventListener('hashchange', render);
  render();
}

boot();
