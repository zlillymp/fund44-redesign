import { icon } from '../lib/svg.js';
import { setMeta } from '../lib/seo.js';

export function notFound() {
  setMeta({
    title: 'Page not found',
    description: 'The page you were looking for could not be found. Explore Fund44 financing options instead.',
    path: '/404',
  });
  return `
  <section class="section wrap center" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center;align-items:center">
    <span class="eyebrow">Error 404</span>
    <h1 class="h1 mt-6" style="max-width:16ch">This path doesn't lead anywhere.</h1>
    <p class="lead mt-4" style="margin-inline:auto">The page you were looking for isn't here — but your funding path might be.</p>
    <div class="wrap-btns mt-8" style="justify-content:center">
      <a class="btn btn-primary btn-lg" href="#/">Back home ${icon.arrow}</a>
      <a class="btn btn-ghost btn-lg" href="#/financing">Explore financing</a>
    </div>
  </section>`;
}
