import { icon } from '../lib/svg.js';
import { setMeta } from '../lib/seo.js';
import { getCtaDestination, hrefForRoute } from '../lib/routes.js';

export function notFound() {
  setMeta({
    title: 'Page not found',
    description: 'The page you were looking for could not be found. Explore Fund44 financing options instead.',
    path: hrefForRoute('not_found'),
  });
  return `
  <section class="section wrap center section-empty">
    <span class="eyebrow">Error 404</span>
    <h1 class="h1 mt-6 max-measure-hero">This path doesn't lead anywhere.</h1>
    <p class="lead mt-4 mx-auto">The page you were looking for isn't here — but your funding path might be.</p>
    <div class="wrap-btns mt-8 justify-center">
      <a class="btn btn-primary btn-lg" href="${getCtaDestination('back_home').href}">Back home ${icon.arrow}</a>
      <a class="btn btn-ghost btn-lg" href="${getCtaDestination('explore_financing').href}">Explore financing</a>
    </div>
  </section>`;
}
