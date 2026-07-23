// Fund44 — inline SVG library. Logo communicates routing/matching → a path to capital.

// Logo mark: a "44" abstracted as two converging routing paths meeting at a node.
export const logoMark = (size = 28) => `
<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="f44-mark">
  <rect x="1" y="1" width="30" height="30" rx="8" stroke="currentColor" stroke-width="1.6"/>
  <path d="M9 22V13.5L15 22V9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 22V13.5L25 22V9" stroke="var(--accent-deep, currentColor)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="15" cy="9" r="2" fill="var(--accent, currentColor)"/>
  <circle cx="25" cy="9" r="2" fill="var(--accent, currentColor)"/>
</svg>`;

export const logo = () => `
<a href="#/" class="logo" aria-label="Fund44 home" style="display:inline-flex;align-items:center;gap:.55rem;color:var(--ink)">
  ${logoMark(30)}
  <span style="font-family:var(--font-display);font-weight:600;font-size:1.35rem;letter-spacing:-0.04em">Fund<span style="color:var(--accent-deep)">44</span></span>
</a>`;

export const icon = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M6 16V8a4 4 0 0 1 4-4h4M18 8v8a4 4 0 0 1-4 4h-4"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10M5 7l14-2M5 7 2 13a4 4 0 0 0 6 0L5 7zM19 5l3 6a4 4 0 0 1-6 0l3-6z"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M17 21V9h2a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2"/></svg>`,
  cash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3M20 17h1a1 1 0 0 0 1-1v-3.34a1 1 0 0 0-.3-.7L18 8h-4v9h1"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>`,
  key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8M17 7l2 2M15 9l2 2"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

// decorative article thumbnail generators (data-themed, no stock photos)
export const thumb = {
  waterfall: `<svg viewBox="0 0 320 180" preserveAspectRatio="none"><rect width="320" height="180" fill="var(--surface-2)"/>
    <g stroke="var(--line-strong)" stroke-width="1.5" fill="none">
      <path d="M40 40h90M40 70h90M40 100h90M40 130h90"/>
      <path d="M130 40c40 0 40 50 80 50M130 70c40 0 40 20 80 20M130 100c40 0 40-10 80-10M130 130c40 0 40-40 80-40"/>
    </g>
    <circle cx="210" cy="90" r="8" fill="var(--accent)"/>
    <g fill="var(--accent-deep)"><circle cx="40" cy="40" r="4"/><circle cx="40" cy="70" r="4"/><circle cx="40" cy="100" r="4"/><circle cx="40" cy="130" r="4"/></g></svg>`,
  grid: `<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="var(--surface-2)"/>
    <g stroke="var(--line-strong)" stroke-width="1"><path d="M0 45h320M0 90h320M0 135h320M80 0v180M160 0v180M240 0v180"/></g>
    <rect x="88" y="53" width="64" height="24" rx="4" fill="var(--accent)"/>
    <rect x="168" y="98" width="64" height="24" rx="4" fill="var(--ink)" opacity=".15"/>
    <rect x="8" y="98" width="64" height="24" rx="4" fill="var(--ink)" opacity=".1"/></svg>`,
  bars: `<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="var(--surface-2)"/>
    <g fill="var(--ink)" opacity=".14"><rect x="40" y="90" width="34" height="60"/><rect x="100" y="60" width="34" height="90"/><rect x="220" y="70" width="34" height="80"/></g>
    <rect x="160" y="40" width="34" height="110" fill="var(--accent)"/>
    <path d="M20 150h280" stroke="var(--line-strong)" stroke-width="1.5"/></svg>`,
  doc: `<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="var(--surface-2)"/>
    <rect x="110" y="30" width="100" height="120" rx="6" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="1.5"/>
    <g stroke="var(--line-strong)" stroke-width="3" stroke-linecap="round"><path d="M126 60h68M126 78h68M126 96h44"/></g>
    <circle cx="180" cy="120" r="12" fill="var(--accent)"/>
    <path d="M175 120l4 4 7-8" stroke="var(--accent-ink)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  timeline: `<svg viewBox="0 0 320 180"><rect width="320" height="180" fill="var(--surface-2)"/>
    <path d="M40 90h240" stroke="var(--line-strong)" stroke-width="2"/>
    <path d="M40 90h150" stroke="var(--accent-deep)" stroke-width="2"/>
    <g><circle cx="40" cy="90" r="7" fill="var(--accent)"/><circle cx="115" cy="90" r="7" fill="var(--accent)"/><circle cx="190" cy="90" r="7" fill="var(--ink)"/><circle cx="265" cy="90" r="7" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="2"/></g></svg>`,
};
