import { icon } from '../lib/svg.js';
import { setMeta, ld } from '../lib/seo.js';
import { pageHero, ctaBanner, faqBlock, disclosure, eyebrow, answerBlock, featItem } from '../components/ui.js';

function productPage(cfg) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Financing', href: '/financing' }, { label: cfg.short, href: cfg.path }];
  setMeta({ title: cfg.title, description: cfg.desc, path: cfg.path, jsonld: [ld.breadcrumb(crumbs), ld.faq(cfg.faq)] });

  return `
  ${pageHero({ crumbs, eyebrow: cfg.eyebrow, title: cfg.h1, lead: cfg.lead })}

  <section class="section-tight wrap wrap-default">
    ${answerBlock(cfg.defTerm, cfg.def)}
  </section>

  <section class="section-tight wrap">
    <div class="feature-split">
      <div class="fs-text">
        ${eyebrow('When it fits')}
        <h2 class="h2 reveal mt-4">${cfg.useHeading}</h2>
        <ul role="list" class="mt-6 reveal" style="display:flex;flex-direction:column;gap:var(--space-4)">
          ${cfg.useCases.map((u) => `<li style="display:flex;gap:var(--space-3);align-items:flex-start"><span style="color:var(--accent-deep);flex-shrink:0;margin-top:2px">${icon.check}</span><span style="color:var(--ink-2)">${u}</span></li>`).join('')}
        </ul>
      </div>
      <div class="fs-viz">
        <div class="card reveal" style="background:var(--surface)">
          <div class="eyebrow" style="margin-bottom:var(--space-4)">At a glance</div>
          ${cfg.specs.map((s) => `<div style="display:flex;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--line);font-size:var(--text-sm)"><span class="muted">${s[0]}</span><b style="font-weight:600;text-align:right;max-width:60%">${s[1]}</b></div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="section-tight wrap">
    ${eyebrow('Eligibility considerations')}
    <h2 class="h2 reveal mt-4 mb-8">${cfg.eligHeading}</h2>
    <div class="grid g-3 reveal" data-stagger>
      ${cfg.elig.map((e) => featItem(e.ic, e.h, e.p)).map((f) => `<div class="card">${f}</div>`).join('')}
    </div>
    <div class="mt-8">${disclosure(cfg.disclosure)}</div>
  </section>

  ${ctaBanner(cfg.ctaHeading, cfg.ctaSub)}

  <section class="section wrap wrap-default">
    ${eyebrow(cfg.short + ' FAQ')}
    <h2 class="h2 reveal mt-4 mb-8">Questions about ${cfg.short}</h2>
    ${faqBlock(cfg.faq)}
  </section>
  `;
}

export function sba7a() {
  return productPage({
    short: 'SBA 7(a)',
    path: '/sba-7a',
    title: 'SBA 7(a) loans',
    desc: 'SBA 7(a) loans are flexible, longer-term small-business loans partially guaranteed by the U.S. Small Business Administration. Fund44 matches you to lenders offering 7(a) financing for acquisitions, working capital, and growth.',
    eyebrow: 'SBA 7(a)',
    h1: 'SBA 7(a) loans — flexible capital for growth.',
    lead: 'The SBA 7(a) program is one of the most versatile small-business loan types. Fund44 helps you see whether it fits your goal and connects you with lenders that offer it.',
    defTerm: 'An SBA 7(a) loan',
    def: 'is a small-business loan partially guaranteed by the U.S. Small Business Administration and issued by approved lenders. It can be used for working capital, business acquisition, equipment, refinancing, and more — typically with longer terms than conventional loans.',
    useHeading: 'A single loan type for many needs',
    useCases: [
      'Acquiring an existing business or buying out a partner',
      'Working capital to support operations and growth',
      'Purchasing equipment or making leasehold improvements',
      'Refinancing certain existing business debt',
      'Expansion into a new location or market',
    ],
    specs: [
      ['Program', 'SBA 7(a)'],
      ['Common uses', 'Acquisition, working capital, expansion'],
      ['Typical term', 'Longer-term (varies by use)'],
      ['Max amount', 'Up to $5M'],
      ['Guarantee', 'Partially SBA-guaranteed'],
      ['Issued by', 'SBA-approved third-party lenders'],
    ],
    eligHeading: 'What lenders typically look at',
    elig: [
      { ic: icon.building, h: 'For-profit U.S. business', p: 'The SBA program is for eligible for-profit businesses operating in the United States.' },
      { ic: icon.scale, h: 'Ability to repay', p: 'Lenders review cash flow, revenue, and the business plan behind the request.' },
      { ic: icon.shield, h: 'Owner background', p: 'Personal credit, experience, and a personal guarantee are commonly part of underwriting.' },
    ],
    disclosure: '<strong>Fund44 is not a lender or the SBA.</strong> SBA 7(a) eligibility and terms are determined by SBA-approved lenders and SBA program rules, not by Fund44. Requirements and availability vary. This page is educational and is not a commitment to lend.',
    ctaHeading: 'See if SBA 7(a) fits your plan.',
    ctaSub: 'Answer a few questions and preview whether 7(a) — or another path — is a strong match.',
    faq: [
      { q: 'What can an SBA 7(a) loan be used for?', a: 'Common uses include business acquisition, working capital, equipment, leasehold improvements, expansion, and refinancing certain business debt. Allowed uses are defined by SBA program rules and the lender.' },
      { q: 'How much can I borrow with an SBA 7(a) loan?', a: 'The SBA 7(a) program supports loans up to $5 million. The amount you may qualify for depends on your business profile and the lender’s underwriting.' },
      { q: 'Is a personal guarantee required?', a: 'Lenders commonly require a personal guarantee from owners with significant ownership. Specific requirements are set by each lender and SBA rules.' },
      { q: 'Does Fund44 issue SBA 7(a) loans?', a: 'No. Fund44 is a marketplace. It matches you with SBA-approved lenders in its network. Eligibility and terms are decided by those lenders.' },
    ],
  });
}

export function sba504() {
  return productPage({
    short: 'SBA 504',
    path: '/sba-504',
    title: 'SBA 504 loans',
    desc: 'SBA 504 loans provide long-term, fixed-asset financing for owner-occupied commercial real estate and major equipment. Fund44 connects you with lenders offering 504 financing.',
    eyebrow: 'SBA 504',
    h1: 'SBA 504 loans — for real estate and major assets.',
    lead: 'The SBA 504 program is designed for long-term investments in fixed assets like owner-occupied property and heavy equipment. Fund44 helps you see if it fits and routes you to lenders that offer it.',
    defTerm: 'An SBA 504 loan',
    def: 'is a long-term, fixed-asset financing program from the U.S. Small Business Administration, delivered through Certified Development Companies and lenders. It is typically used to buy, build, or improve owner-occupied commercial real estate or to purchase major equipment.',
    useHeading: 'Built for long-term fixed assets',
    useCases: [
      'Purchasing owner-occupied commercial real estate',
      'Constructing or renovating an existing facility',
      'Buying long-life, heavy equipment or machinery',
      'Financing significant capital improvements',
    ],
    specs: [
      ['Program', 'SBA 504'],
      ['Common uses', 'Owner-occupied real estate, major equipment'],
      ['Structure', 'Long-term, fixed-asset'],
      ['Occupancy', 'Owner-occupied requirement applies'],
      ['Delivered via', 'CDCs and approved lenders'],
      ['Issued by', 'Third-party lenders / CDCs'],
    ],
    eligHeading: 'What tends to matter for 504',
    elig: [
      { ic: icon.key, h: 'Owner-occupied use', p: 'The 504 program generally requires the business to occupy a qualifying share of the property.' },
      { ic: icon.building, h: 'Eligible fixed assets', p: 'Proceeds are directed to qualifying long-term assets such as real estate and heavy equipment.' },
      { ic: icon.scale, h: 'Repayment strength', p: 'Lenders assess business cash flow and project viability during underwriting.' },
    ],
    disclosure: '<strong>Fund44 is not a lender, a CDC, or the SBA.</strong> SBA 504 eligibility, occupancy rules, and terms are set by SBA program rules, CDCs, and approved lenders — not by Fund44. This page is educational only.',
    ctaHeading: 'Financing property or major equipment?',
    ctaSub: 'Preview whether SBA 504 or another path is the strongest fit for your project.',
    faq: [
      { q: 'What is the SBA 504 loan used for?', a: 'SBA 504 financing is generally used for owner-occupied commercial real estate, construction or renovation, and major long-life equipment. It is not typically used for working capital or inventory.' },
      { q: 'What is the difference between SBA 504 and 7(a)?', a: 'SBA 504 is focused on long-term fixed assets like real estate and heavy equipment, while SBA 7(a) is more flexible and can cover working capital, acquisition, and more. See our SBA 7(a) vs 504 guide in the learning hub.' },
      { q: 'Does 504 require owner occupancy?', a: 'Yes — the 504 program includes owner-occupancy requirements for real estate. The exact thresholds are defined by SBA program rules and your lender/CDC.' },
      { q: 'Does Fund44 issue SBA 504 loans?', a: 'No. Fund44 matches you with lenders and CDCs that offer 504 financing. Eligibility and terms are decided by those providers.' },
    ],
  });
}

export function acquisition() {
  return productPage({
    short: 'Business acquisition',
    path: '/business-acquisition',
    title: 'Business acquisition loans',
    desc: 'Business acquisition loans help you finance the purchase of an existing business or a partner buyout. Fund44 matches your deal to relevant lenders and structures, including SBA 7(a) acquisition financing.',
    eyebrow: 'Business acquisition',
    h1: 'Business acquisition financing — fund the deal.',
    lead: 'Buying a business, buying out a partner, or funding a transition takes a structure that fits the deal. Fund44 helps you find the paths that match your acquisition.',
    defTerm: 'A business acquisition loan',
    def: 'is financing used to purchase an existing business, buy out a partner, or fund an ownership transition. It is often structured through SBA 7(a) or conventional term financing, sometimes combined with seller financing.',
    useHeading: 'When acquisition financing fits',
    useCases: [
      'Buying an established, cash-flowing business',
      'Buying out a partner or shareholder',
      'Funding a management or family transition',
      'Combining lender financing with a seller note',
    ],
    specs: [
      ['Common structures', 'SBA 7(a), conventional term'],
      ['Typical use', 'Acquisition, partner buyout'],
      ['Deal inputs', 'Business financials, purchase terms'],
      ['May include', 'Seller financing component'],
      ['Amount', 'Sized to the transaction'],
      ['Issued by', 'Third-party lenders'],
    ],
    eligHeading: 'What lenders weigh on a deal',
    elig: [
      { ic: icon.building, h: 'Target business health', p: 'The cash flow and financials of the business being acquired are central to underwriting.' },
      { ic: icon.scale, h: 'Deal structure', p: 'Purchase price, down payment, and any seller financing all shape the options available.' },
      { ic: icon.shield, h: 'Buyer profile', p: 'Relevant experience, credit, and a personal guarantee are commonly reviewed.' },
    ],
    disclosure: '<strong>Fund44 is not a lender.</strong> Acquisition financing eligibility, structures, and terms are determined by third-party lenders and, where applicable, SBA rules. This page is educational and not a commitment to lend.',
    ctaHeading: 'Working on an acquisition?',
    ctaSub: 'Share the basics of your deal and preview the financing paths that fit it.',
    faq: [
      { q: 'How are business acquisitions typically financed?', a: 'Acquisitions are often funded through SBA 7(a) loans or conventional term loans, sometimes combined with seller financing and a buyer down payment. The right mix depends on the deal.' },
      { q: 'Can I use an SBA loan to buy a business?', a: 'Yes — SBA 7(a) is commonly used for business acquisitions and partner buyouts, subject to SBA rules and lender underwriting.' },
      { q: 'What documents will I need for an acquisition?', a: 'Lenders typically want the target business’s financials, the purchase agreement or letter of intent, your personal financial information, and a use-of-funds summary. Fund44 lets you upload these once.' },
      { q: 'Does Fund44 finance acquisitions directly?', a: 'No. Fund44 routes your deal to relevant third-party lenders. Eligibility, structure, and terms are decided by those lenders.' },
    ],
  });
}

export function workingCapital() {
  return productPage({
    short: 'Working capital',
    path: '/working-capital',
    title: 'Working capital & lines of credit',
    desc: 'Working capital financing — including business lines of credit, term loans, equipment financing, and invoice factoring — covers day-to-day cash flow and growth. Fund44 matches you to the right flexible option.',
    eyebrow: 'Working capital & lines of credit',
    h1: 'Working capital & lines of credit — stay flexible.',
    lead: 'For cash-flow gaps, seasonality, and near-term needs, flexible financing often fits better than a long-term loan. Fund44 surfaces the working-capital paths relevant to your business.',
    defTerm: 'Working capital financing',
    def: 'is short- to medium-term funding that covers day-to-day operating needs rather than long-term assets. It includes business lines of credit, term loans, equipment financing, and invoice factoring — each suited to different cash-flow situations.',
    useHeading: 'Flexible funding for operating needs',
    useCases: [
      'Smoothing seasonal or cyclical cash flow',
      'Covering payroll, inventory, or supplier costs',
      'Bridging the gap on outstanding invoices',
      'Financing equipment over its useful life',
      'Funding a specific, one-time growth project',
    ],
    specs: [
      ['Line of credit', 'Revolving, draw as needed'],
      ['Term loan', 'Fixed amount, fixed schedule'],
      ['Equipment financing', 'Secured by the equipment'],
      ['Invoice factoring', 'Advance against receivables'],
      ['Relative speed', 'Often faster than SBA'],
      ['Issued by', 'Third-party lenders'],
    ],
    eligHeading: 'What flexible lenders look at',
    elig: [
      { ic: icon.cash, h: 'Revenue & cash flow', p: 'Consistent revenue and healthy cash flow are the primary signals for most working-capital products.' },
      { ic: icon.clock, h: 'Time in business', p: 'Many flexible products favor businesses with an operating track record.' },
      { ic: icon.file, h: 'Recent statements', p: 'Bank statements and financials help lenders size the right facility.' },
    ],
    disclosure: '<strong>Fund44 is not a lender.</strong> Working-capital product availability, amounts, and terms are determined by third-party lenders and vary by provider. This page is educational only.',
    ctaHeading: 'Need flexible cash flow?',
    ctaSub: 'Preview lines of credit, term loans, and other working-capital paths matched to your business.',
    faq: [
      { q: 'What is the difference between a term loan and a line of credit?', a: 'A term loan gives you a fixed amount up front repaid on a set schedule — good for one-time needs. A line of credit lets you draw funds as needed up to a limit and repay as you go — good for recurring or unpredictable cash-flow gaps.' },
      { q: 'How fast is working-capital financing?', a: 'Flexible products are often faster than SBA loans, but timelines still vary by lender and your documentation. Fund44 does not guarantee any specific funding speed.' },
      { q: 'What is invoice factoring?', a: 'Invoice factoring advances a portion of your outstanding invoices so you get cash sooner, with the factor collecting from your customers. It suits businesses with slow-paying B2B receivables.' },
      { q: 'Does checking these options affect my credit?', a: 'Checking your initial options can use information that does not affect your credit score. A lender you choose to proceed with may later run a hard credit inquiry.' },
    ],
  });
}
