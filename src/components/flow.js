import { icon } from '../lib/svg.js';

// Multi-step eligibility / demo flow. Preview-only — no data sent externally.
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

const state = {
  step: 0,
  data: { use: '', amount: '', tib: '', revenue: '', stateCode: '', name: '', email: '', business: '' },
};

const USE_OPTIONS = [
  ['acquisition', 'Buy a business', 'Acquisition or partner buyout'],
  ['realestate', 'Real estate', 'Owner-occupied property'],
  ['working', 'Working capital', 'Day-to-day cash flow'],
  ['equipment', 'Equipment', 'Purchase or finance equipment'],
  ['expansion', 'Expansion', 'New location or growth'],
  ['refinance', 'Refinance', 'Restructure existing debt'],
];

const STEPS = [
  {
    title: 'What do you need funding for?',
    why: "We use this to surface only the financing paths that fit your goal — not every product in the network.",
    render: () => `
      <div class="field">
        <div class="choice-grid" role="radiogroup" aria-label="Use of funds">
          ${USE_OPTIONS.map(([v, b, s]) => `
            <button type="button" class="choice ${state.data.use === v ? 'sel' : ''}" data-choice="use" data-val="${v}" role="radio" aria-checked="${state.data.use === v}">
              <b>${b}</b><span>${s}</span>
            </button>`).join('')}
        </div>
        <p class="field-err" data-err="use">Please choose what you need funding for.</p>
      </div>`,
    validate: () => (state.data.use ? null : { use: true }),
  },
  {
    title: 'How much are you looking for?',
    why: 'A rough range is fine. Fund44 works with owners seeking roughly $50k to $5M, and this helps route to lenders active in that band.',
    render: () => `
      <div class="field">
        <label for="f-amount">Desired amount <span class="hint">(USD, approximate)</span></label>
        <select class="select" id="f-amount" data-field="amount">
          <option value="">Select a range…</option>
          ${['$50k – $150k','$150k – $350k','$350k – $750k','$750k – $1.5M','$1.5M – $3M','$3M – $5M'].map((r) => `<option value="${r}" ${state.data.amount===r?'selected':''}>${r}</option>`).join('')}
        </select>
        <p class="field-err" data-err="amount">Please select an amount range.</p>
      </div>`,
    validate: () => (state.data.amount ? null : { amount: true }),
  },
  {
    title: 'Tell us about the business',
    why: 'Time in business and revenue are the two signals lenders weigh most when deciding which products a business qualifies for.',
    render: () => `
      <div class="field">
        <label for="f-tib">Time in business</label>
        <select class="select" id="f-tib" data-field="tib">
          <option value="">Select…</option>
          ${['Still planning / pre-revenue','Under 1 year','1 – 2 years','2 – 5 years','5+ years'].map((r) => `<option value="${r}" ${state.data.tib===r?'selected':''}>${r}</option>`).join('')}
        </select>
        <p class="field-err" data-err="tib">Please select time in business.</p>
      </div>
      <div class="field">
        <label for="f-rev">Annual revenue range</label>
        <select class="select" id="f-rev" data-field="revenue">
          <option value="">Select…</option>
          ${['Under $100k','$100k – $250k','$250k – $500k','$500k – $1M','$1M – $5M','$5M+'].map((r) => `<option value="${r}" ${state.data.revenue===r?'selected':''}>${r}</option>`).join('')}
        </select>
        <p class="field-err" data-err="revenue">Please select a revenue range.</p>
      </div>
      <div class="field">
        <label for="f-state">State of operation</label>
        <select class="select" id="f-state" data-field="stateCode">
          <option value="">Select…</option>
          ${US_STATES.map((s) => `<option value="${s}" ${state.data.stateCode===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <p class="field-err" data-err="stateCode">Please select your state.</p>
      </div>`,
    validate: () => {
      const e = {};
      if (!state.data.tib) e.tib = true;
      if (!state.data.revenue) e.revenue = true;
      if (!state.data.stateCode) e.stateCode = true;
      return Object.keys(e).length ? e : null;
    },
  },
  {
    title: 'A few final details for your preview',
    why: 'These details personalize the on-screen demo result only. Nothing is submitted to a lender or sent from your browser.',
    render: () => `
      <div class="field">
        <label for="f-name">Your name</label>
        <input class="input" id="f-name" type="text" autocomplete="name" data-field="name" value="${state.data.name}" placeholder="Jordan Rivera">
        <p class="field-err" data-err="name">Please enter your name.</p>
      </div>
      <div class="field">
        <label for="f-business">Business name</label>
        <input class="input" id="f-business" type="text" autocomplete="organization" data-field="business" value="${state.data.business}" placeholder="Rivera & Co.">
        <p class="field-err" data-err="business">Please enter your business name.</p>
      </div>
      <div class="field">
        <label for="f-email">Email <span class="hint">(preview only)</span></label>
        <input class="input" id="f-email" type="email" autocomplete="email" data-field="email" value="${state.data.email}" placeholder="you@business.com">
        <p class="field-err" data-err="email">Please enter a valid email address.</p>
      </div>`,
    validate: () => {
      const e = {};
      if (!state.data.name.trim()) e.name = true;
      if (!state.data.business.trim()) e.business = true;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.data.email)) e.email = true;
      return Object.keys(e).length ? e : null;
    },
  },
];

function matchedPaths() {
  const { use } = state.data;
  const base = {
    acquisition: ['SBA 7(a) — business acquisition', 'Conventional acquisition term loan', 'Seller-financed structure review'],
    realestate: ['SBA 504 — owner-occupied real estate', 'SBA 7(a) for real estate', 'Conventional commercial mortgage'],
    working: ['Business line of credit', 'Short-term working capital loan', 'Invoice factoring'],
    equipment: ['Equipment financing', 'SBA 7(a) for equipment', 'Business line of credit'],
    expansion: ['SBA 7(a) — expansion', 'Conventional term loan', 'Business line of credit'],
    refinance: ['SBA 7(a) debt refinance', 'Conventional term loan', 'Debt consolidation review'],
  };
  return base[use] || ['SBA 7(a) loan', 'Conventional term loan', 'Business line of credit'];
}

function successView() {
  const paths = matchedPaths();
  const d = state.data;
  return `
    <div class="dialog-body" style="text-align:center">
      <div class="success-mark">${icon.check}</div>
      <h2 class="step-title" style="text-align:center">Here's your preview</h2>
      <p class="step-why" style="text-align:center">Based on what you shared, these are the kinds of paths Fund44 would surface. This is a <strong>demo result</strong>, not an eligibility decision or an offer.</p>
      <div class="result-summary" style="text-align:left">
        <div class="rs-row"><span>Use of funds</span><b>${USE_OPTIONS.find((o)=>o[0]===d.use)?.[1] || '—'}</b></div>
        <div class="rs-row"><span>Amount</span><b>${d.amount}</b></div>
        <div class="rs-row"><span>Time in business</span><b>${d.tib}</b></div>
        <div class="rs-row"><span>Revenue</span><b>${d.revenue}</b></div>
        <div class="rs-row"><span>State</span><b>${d.stateCode}</b></div>
      </div>
      <div class="result-paths">
        ${paths.map((p) => `<div class="result-path"><span class="rp-dot"></span>${p}</div>`).join('')}
      </div>
      <p class="dialog-note" style="padding:0;text-align:left">
        <strong>What happens next in the real product:</strong> a specialist confirms details, you upload documents once, and Fund44 routes your profile to relevant third-party lenders. Fund44 is not a lender — eligibility and terms are decided by each provider. Checking options here uses no credit-affecting inquiry; a lender may run a hard inquiry later if you choose to proceed.
      </p>
    </div>
    <div class="dialog-foot">
      <button class="btn btn-ghost" data-flow-restart>Start over</button>
      <button class="btn btn-primary btn-block" data-flow-close>Done</button>
    </div>`;
}

function renderDialog() {
  const total = STEPS.length;
  if (state.step >= total) return successView();
  const s = STEPS[state.step];
  const pct = Math.round((state.step / total) * 100);
  return `
    <div class="dialog-head">
      <div class="dialog-head-row">
        <span class="tag">${icon.route} Eligibility preview</span>
        <button class="dialog-close" data-flow-close aria-label="Close">${icon.close}</button>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-label">Step ${state.step + 1} of ${total}</div>
    </div>
    <div class="dialog-body">
      <h2 class="step-title">${s.title}</h2>
      <p class="step-why">${s.why}</p>
      ${s.render()}
    </div>
    <div class="dialog-foot">
      ${state.step > 0 ? `<button class="btn btn-ghost" data-flow-back>Back</button>` : ''}
      <button class="btn btn-primary btn-block" data-flow-next>${state.step === total - 1 ? 'See my preview' : 'Continue'} ${icon.arrow}</button>
    </div>
    <p class="dialog-note"><strong>Preview & non-binding.</strong> This is a demonstration flow. Submitting shows sample results only — it does not create an application, is not an eligibility determination, and sends no data to any lender or server.</p>`;
}

let backdrop;
function mount() {
  backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Funding path preview');
  backdrop.innerHTML = `<div class="dialog" id="flowDialog"></div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
}

function paint() {
  const dlg = backdrop.querySelector('#flowDialog');
  dlg.innerHTML = renderDialog();
  dlg.scrollTop = 0;
}

let lastFocus = null;
export function openFlow() {
  if (!backdrop) mount();
  lastFocus = document.activeElement;
  paint();
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => backdrop.querySelector('.dialog-close, .choice, .select, .input, .btn-primary')?.focus(), 60);
}

function close() {
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function next() {
  const s = STEPS[state.step];
  // clear errors
  backdrop.querySelectorAll('.field.err').forEach((f) => f.classList.remove('err'));
  const errs = s.validate();
  if (errs) {
    Object.keys(errs).forEach((k) => {
      const err = backdrop.querySelector(`[data-err="${k}"]`);
      err?.closest('.field')?.classList.add('err');
    });
    backdrop.querySelector('.field.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  state.step += 1;
  paint();
}

export function initFlow() {
  // event delegation on body
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-flow]')) { e.preventDefault(); state.step = 0; openFlow(); return; }
    if (!backdrop) return;
    if (e.target.closest('[data-flow-close]')) return close();
    if (e.target.closest('[data-flow-back]')) { state.step = Math.max(0, state.step - 1); return paint(); }
    if (e.target.closest('[data-flow-next]')) return next();
    if (e.target.closest('[data-flow-restart]')) { state.step = 0; state.data = { use:'',amount:'',tib:'',revenue:'',stateCode:'',name:'',email:'',business:'' }; return paint(); }
    const choice = e.target.closest('[data-choice]');
    if (choice) {
      state.data[choice.dataset.choice] = choice.dataset.val;
      backdrop.querySelectorAll(`[data-choice="${choice.dataset.choice}"]`).forEach((c) => { c.classList.remove('sel'); c.setAttribute('aria-checked','false'); });
      choice.classList.add('sel'); choice.setAttribute('aria-checked','true');
      choice.closest('.field')?.classList.remove('err');
    }
  });
  document.body.addEventListener('input', (e) => {
    const f = e.target.closest('[data-field]');
    if (f) { state.data[f.dataset.field] = f.value; f.closest('.field')?.classList.remove('err'); }
  });
  document.body.addEventListener('keydown', (e) => {
    if (!backdrop?.classList.contains('open')) return;
    if (e.key === 'Escape') close();
  });
}
