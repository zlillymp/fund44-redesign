import { icon, thumb } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, eyebrow, disclosure } from '../components/ui.js';
import { getBreadcrumbs, getRouteBySlug, hrefForRoute, hrefForSlug } from '../lib/routes.js';
import { notFound } from './not-found.js';

const CRUMBS = getBreadcrumbs('resources');

export const ARTICLES = {
  'sba-7a-vs-504': {
    cat: 'SBA loans',
    title: 'SBA 7(a) vs SBA 504: which one fits your business?',
    desc: 'A plain-language comparison of the two most common SBA loan programs — what each is for, how they differ, and how to decide between them.',
    date: '2025-11-04', read: '7 min', thumb: thumb.grid,
    body: () => `
      <p class="lead" style="font-size:var(--text-lg)">The SBA 7(a) and SBA 504 programs are both popular, both partially backed by the U.S. Small Business Administration, and easy to confuse. The short version: <strong>7(a) is the flexible generalist; 504 is the fixed-asset specialist.</strong></p>
      <h2>What each program is for</h2>
      <p>The <strong>SBA 7(a)</strong> program is the SBA's most versatile loan type. It can fund business acquisition, working capital, equipment, refinancing, and expansion. Because it covers so many uses, it's often the starting point when a business isn't buying real estate.</p>
      <p>The <strong>SBA 504</strong> program is narrower and purpose-built. It finances long-term fixed assets — most commonly owner-occupied commercial real estate and major, long-life equipment. It is delivered through Certified Development Companies alongside a lender.</p>
      <h2>The core differences</h2>
      <ul>
        <li><strong>Use of funds:</strong> 7(a) is flexible; 504 is limited to qualifying fixed assets.</li>
        <li><strong>Real estate:</strong> 504 is designed for owner-occupied property and includes occupancy requirements; 7(a) can also fund real estate but is not limited to it.</li>
        <li><strong>Working capital:</strong> 7(a) can cover working capital; 504 generally cannot.</li>
        <li><strong>Structure:</strong> 504 involves a CDC and a lender; 7(a) is issued by a single approved lender.</li>
      </ul>
      <h2>How to decide</h2>
      <p>Ask what you're funding. If the answer is <strong>owner-occupied real estate or heavy equipment</strong>, SBA 504 is worth a serious look. If you need <strong>flexibility</strong> — acquisition, working capital, or a mix — SBA 7(a) is usually the better generalist. Many businesses evaluate both.</p>
      <blockquote>The right program follows the use of funds. Start with what you're buying, then match the tool to it.</blockquote>
      <h2>Where Fund44 fits</h2>
      <p>Rather than researching each program and applying separately, you can share your goal once and let Fund44 surface the SBA paths — and non-SBA alternatives — that fit your situation, ranked by fit.</p>`,
    faq: [
      { q: 'Can I use SBA 7(a) for real estate?', a: 'Yes, 7(a) can be used for real estate among many other uses, but SBA 504 is specifically designed for owner-occupied commercial real estate and major equipment.' },
      { q: 'Is 504 or 7(a) faster?', a: 'Timelines vary by lender and project. Neither is guaranteed faster; the right choice depends on your use of funds, not just speed.' },
    ],
  },
  'preparing-your-documents': {
    cat: 'Getting ready',
    title: 'The document checklist that speeds up small-business funding',
    desc: 'The financial documents lenders commonly ask for — and how preparing them once can make comparing options far faster.',
    date: '2025-10-21', read: '6 min', thumb: thumb.doc,
    body: () => `
      <p class="lead" style="font-size:var(--text-lg)">Most delays in business funding aren't about credit — they're about paperwork. Having your documents ready before you shop makes every conversation faster.</p>
      <h2>What lenders commonly request</h2>
      <ul>
        <li><strong>Business tax returns</strong> — typically the last two years.</li>
        <li><strong>Personal financial statement</strong> — for owners with significant ownership.</li>
        <li><strong>Bank statements</strong> — often the most recent six months.</li>
        <li><strong>Debt schedule</strong> — a summary of existing business obligations.</li>
        <li><strong>Use-of-funds summary</strong> — what you'll do with the capital.</li>
      </ul>
      <p>For acquisitions, add the target business's financials and a purchase agreement or letter of intent.</p>
      <h2>Why "once" matters</h2>
      <p>Traditionally, each lender wants its own copies in its own format. Prepare a clean set once and you remove the biggest source of friction. Fund44's shared document checklist takes this further — you upload a single time and reuse across relevant lenders.</p>
      <h2>A simple prep routine</h2>
      <ol>
        <li>Gather the five documents above in PDF.</li>
        <li>Write a two-paragraph use-of-funds summary.</li>
        <li>Note your desired amount and rough timeline.</li>
        <li>Check your options and see which paths fit.</li>
      </ol>`,
    faq: [
      { q: 'Do I need a business plan?', a: 'For some loan types and acquisitions, a plan or use-of-funds narrative helps. For flexible working-capital products, recent financials often matter more.' },
      { q: 'Does uploading documents to Fund44 trigger a credit check?', a: 'Checking initial options uses information that does not affect your credit score. A lender may run a hard inquiry later if you choose to proceed.' },
    ],
  },
  'working-capital-vs-term-loan': {
    cat: 'Financing basics',
    title: 'Line of credit or term loan? Matching the tool to the need',
    desc: 'When a revolving line of credit beats a term loan for cash flow — and when it doesn’t.',
    date: '2025-09-30', read: '5 min', thumb: thumb.bars,
    body: () => `
      <p class="lead" style="font-size:var(--text-lg)">A line of credit and a term loan solve different problems. Choosing the wrong one is a common — and avoidable — mistake.</p>
      <h2>Term loans: fixed and predictable</h2>
      <p>A <strong>term loan</strong> gives you a set amount up front, repaid on a fixed schedule. It's ideal for one-time investments with a clear cost — a renovation, an equipment purchase, a specific growth project.</p>
      <h2>Lines of credit: flexible and revolving</h2>
      <p>A <strong>line of credit</strong> lets you draw funds as needed up to a limit, repay, and draw again. It shines for recurring or unpredictable needs — seasonality, payroll timing, or bridging slow-paying invoices.</p>
      <h2>A quick rule of thumb</h2>
      <blockquote>Fund a one-time cost with a term loan. Fund an ongoing gap with a line of credit.</blockquote>
      <p>If you're not sure, that's exactly what a marketplace is for. Fund44 can surface both, so you can compare structure and fit rather than guessing.</p>`,
    faq: [
      { q: 'Can I have both a term loan and a line of credit?', a: 'Many businesses use both — a term loan for a project and a line of credit for cash-flow flexibility. Availability depends on the lender and your profile.' },
    ],
  },
};

export function resources() {
  setMeta({
    title: 'Learning hub — small-business funding resources',
    description: 'Plain-language guides on SBA loans, document prep, and choosing the right financing. Learn how business funding works and how Fund44 matches you to relevant paths.',
    path: '/resources',
    jsonld: [ld.breadcrumb(CRUMBS)],
  });

  const cards = Object.entries(ARTICLES);
  return `
  ${pageHero({
    crumbs: CRUMBS,
    eyebrow: 'Learning hub',
    title: 'Clear guides to funding your business.',
    lead: 'No jargon, no hype — just plain-language explanations of how small-business financing works and how to choose what fits.',
    cta: false,
  })}

  <section class="section-tight wrap">
    <div class="grid g-3 reveal" data-stagger>
      ${cards.map(([slug, a]) => `
        <a href="${hrefForSlug(slug)}" class="card card-hover article-card">
          <div class="ac-thumb">${a.thumb}</div>
          <div class="ac-cat">${a.cat}</div>
          <h3>${a.title}</h3>
          <p>${a.desc}</p>
          <div class="ac-meta">${a.read} read · ${new Date(a.date).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</div>
        </a>`).join('')}
    </div>
  </section>

  ${ctaBanner('Ready to move from reading to matching?', 'Preview the financing paths relevant to your business in a few minutes.')}
  `;
}

export function article(slug) {
  const a = ARTICLES[slug];
  if (!a) return notFound(slug);
  const route = getRouteBySlug(slug);
  const crumbs = route ? getBreadcrumbs(route.routeId) : CRUMBS;
  setMeta({
    title: a.title,
    description: a.desc,
    path: hrefForSlug(slug),
    jsonld: [ld.breadcrumb(crumbs), ld.article({ title: a.title, description: a.desc, path: hrefForSlug(slug), date: a.date }), ld.faq(a.faq)],
  });

  const others = Object.entries(ARTICLES).filter(([s]) => s !== slug).slice(0, 2);

  return `
  <section class="section-tight wrap" style="padding-top:clamp(2rem,4vw,3.5rem)">
    <nav class="breadcrumb reveal" aria-label="Breadcrumb">
      <a href="${hrefForRoute('home')}">Home</a><span class="sep">/</span>
      <a href="${hrefForRoute('resources')}">Resources</a><span class="sep">/</span>
      <span aria-current="page" style="max-width:40ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.title}</span>
    </nav>
    <div class="mt-6"><span class="eyebrow reveal">${a.cat}</span></div>
    <h1 class="h1 reveal mt-4" style="max-width:22ch">${a.title}</h1>
    <div class="ac-meta reveal mt-4" style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)">${a.read} read · ${new Date(a.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
  </section>

  <section class="section-tight wrap wrap-default">
    <div class="ac-thumb reveal" style="aspect-ratio:2/1;max-width:100%;margin-bottom:var(--space-10)">${a.thumb}</div>
    <article class="prose reveal mx-auto">${a.body()}</article>

    <div class="mt-12" style="max-width:68ch;margin-inline:auto">${disclosure('This article is educational and general in nature. It is not financial or legal advice. <strong>Fund44 is not a lender.</strong> Program rules, eligibility, and terms are set by the SBA and third-party lenders and can change.')}</div>

    <div class="mt-12" style="max-width:68ch;margin-inline:auto">
      ${eyebrow('Questions')}
      <h2 class="h2 reveal mt-4 mb-8" style="font-size:var(--text-xl)">Related questions</h2>
      ${faqBlock(a.faq)}
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Keep reading')}
    <h2 class="h2 reveal mt-4 mb-8" style="font-size:var(--text-xl)">More from the learning hub</h2>
    <div class="grid g-2 reveal" data-stagger>
      ${others.map(([s, o]) => `
        <a href="${hrefForSlug(s)}" class="card card-hover article-card">
          <div class="ac-cat">${o.cat}</div>
          <h3>${o.title}</h3>
          <p>${o.desc}</p>
          <span class="mt-4 accent-text" style="font-weight:600;font-size:var(--text-sm);display:inline-flex;gap:.4rem;align-items:center;margin-top:var(--space-4)">Read ${icon.arrow}</span>
        </a>`).join('')}
    </div>
  </section>

  ${ctaBanner('See your funding options.', 'Apply once and get matched to relevant paths from a network of lenders.')}
  `;
}
