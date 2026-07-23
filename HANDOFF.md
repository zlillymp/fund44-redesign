# Fund44 Redesign — Project Handoff

## Project
- **Path:** `/home/user/workspace/fund44-redesign`
- **Framework:** Vite 5 (vanilla JS + ES modules, no framework). Hash-routed SPA. `base: './'` so it works from any deploy path/iframe.
- **Build:** `npm install && npm run build` → static output in `dist/`. Deploy `dist/` (do NOT deploy; main agent will).
- **Preview locally:** `npx serve dist -l 3000 --single`

## Why vanilla (not React template)
Chosen for full control over inline SVG product visualizations, hand-authored per-route SEO/JSON-LD, custom CSS textures, and a tiny bundle (JS 26KB gzip, CSS 6.4KB gzip). No localStorage used anywhere (theme is in-memory, system default).

## Key files
- `index.html` — shell, font loading (Switzer + Satoshi via Fontshare, IBM Plex Mono via Google), base WebSite JSON-LD, favicon link.
- `src/main.js` — router, theme toggle, IntersectionObserver reveals, count-up/fit-bar viz animation, header scroll, mobile menu, FAQ accordion.
- `src/styles.css` — design tokens, light/dark themes, layout, nav/footer, buttons, cards, matrix, FAQ, reveals.
- `src/product.css` — all product-visualization styles + multi-step form dialog + prose/article styles.
- `src/lib/svg.js` — custom Fund44 logo mark (routing/matching motif), icon set, article thumbnail SVGs.
- `src/lib/seo.js` — `setMeta()` (title/desc/canonical/OG/Twitter) + JSON-LD builders (Organization, FinancialService, BreadcrumbList, FAQPage, Article).
- `src/components/shell.js` — header (sticky nav + dropdown), full-screen mobile menu, footer (nav + disclosures + final CTA).
- `src/components/ui.js` — shared sections, all 6 product visualizations, page hero, answer/step/FAQ blocks, CTA banner, disclosure bar.
- `src/components/flow.js` — 4-step eligibility/demo flow: use of funds → amount → business details → contact → success. Inline validation, back/next, progress, success summary + tailored matched paths. **Preview-only; sends no data anywhere.**
- `src/pages/*.js` — one module per route.
- `public/` — `favicon.svg`, `robots.txt`, `llms.txt`, `humans.txt`, `sitemap.xml`.

## Routes (hash-based)
`/` Home · `/financing` · `/sba-7a` · `/sba-504` · `/business-acquisition` · `/working-capital` · `/how-it-works` · `/about` · `/resources` · `/resources/:slug` (3 articles) · `/privacy` · `/terms` · `/contact` · `*` 404.

## Product visualizations (all HTML/CSS/SVG, no device frames, animate subtly)
Funding-match dashboard (count-up + fit bars), lender-routing waterfall (with filtered-out state), document checklist, status timeline, offer comparison, and the "chaos → one organized path" diagram.

## Design decisions
- **Palette:** warm off-white `#F6F5EF`, near-black `#10110F`, dark inversion `#0E0F0D`. Single accent lime `#C4F135` / deep `#A6D019` (distinct from Ramp), restricted mainly to CTAs and interface highlights.
- **Type:** Switzer (display, tight tracking, weight-split headings) + Satoshi (body) + IBM Plex Mono (data/eyebrows).
- **Texture:** dot-matrix + underwriting-grid (`.tex-dots` / `.tex-grid`), not decorative blobs.
- **Logo:** custom inline SVG — two routing lanes rising through a decision node, splitting toward two lime capital destinations; legible at 24px; adapts to dark mode via `currentColor`.
- **Motion:** IO opacity/clip reveals, count-up only for interface data (match count, fit %), hover states, full `prefers-reduced-motion` fallback (all content visible).
- **Dark/light:** system default + manual toggle, no persistence.

## Content / compliance decisions
- Fund44 positioned as a **marketplace, not a lender**, everywhere. Plain-language disclosure in footer, every product page, financing/how-it-works, and the flow.
- Credit language softened: "checking initial options may use info that does not affect credit; lenders may perform a hard inquiry later."
- **No** unverified metrics ("2,400+ funded", "$168M+"), **no** named testimonials, **no** fake logo walls, **no** specific rates, **no** guaranteed approval/speed. Illustrative interface figures are labeled as such.
- Lendflow capabilities referenced accurately (single application, routing, borrower portal, doc upload, status, offer comparison, data-driven matching, 75+ lender integrations).
- Legal pages carry visible "Preview — legal review required" flags; copy is plain-language placeholder, not fabricated legal promises.

## SEO / GEO / AEO
- Per-route unique title, meta description, canonical, OG + Twitter tags.
- JSON-LD: Organization + FinancialService (with "not a lender" disambiguation) on home/about; BreadcrumbList on interior pages; FAQPage on home/financing/products/how-it-works/articles; Article on article pages.
- `llms.txt` (accuracy notes for LLMs), `robots.txt` (AI crawlers allowed), `sitemap.xml`, `humans.txt`.
- Content structured for answer extraction: quick-answer definition blocks, comparison matrix, decision helper, process steps, FAQ.

## Tests run (Playwright, Chromium)
- 16 routes: **0 horizontal overflow, 0 console/page errors, unique titles** — at 1280px.
- Full eligibility flow end-to-end: step validation (empty step, invalid email blocked with inline errors), back/next, progress, success state with tailored matched paths.
- Dark mode toggle, mobile 375px (home, full-screen menu, bottom-sheet form), comparison matrix, article prose.
- Accessibility: skip link is first focusable; Escape closes dialog; visible focus rings; reduced-motion shows all content (0 hidden reveals).
- Negative checks: no clipped headings, no tiny tap targets (min 44–46px), no missing dark-mode styles found.

## Known placeholders / integration points
- **Eligibility flow** is preview/demo only — wire `flow.js` success handler to the real Fund44/Lendflow embedded application to go live.
- **Contact details** are marked placeholders (`[placeholder-domain]`); add verified email/phone before launch.
- **Legal copy** (privacy, terms) is placeholder pending counsel review.
- **OG image** referenced at `/og-image.png` — not yet generated; add a 1200×630 asset.
- Canonical/sitemap URLs use `https://fund44.com`; update if the production domain differs.

## Conventions for follow-up edits
- Add a page: create `src/pages/foo.js` exporting a function returning an HTML string, call `setMeta({...})` inside it, register in `src/pages/index.js`, add to nav in `src/components/shell.js` and to `sitemap.xml`.
- Add an article: append to the `ARTICLES` map in `src/pages/resources.js`.
- All spacing/type/color use CSS custom properties from `styles.css` — never hardcode.
- Reusable UI comes from `src/components/ui.js`; product viz are functions there too.
- Reveal-on-scroll: add class `reveal` (or `reveal-clip`); IO wires it automatically on render.
- In-page anchors: use JS scroll, NOT `href="#..."` (hash router would intercept).
