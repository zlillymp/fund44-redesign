# Fund44 Roadmap

Canonical source of truth for sequencing, task ownership, verification, and release gates for the Fund44 conversion and organic-growth redesign.

Keep this file aligned with [AGENTS.md](AGENTS.md) and [docs/measurement-plan.md](docs/measurement-plan.md). The shareable mirrors at `/home/user/workspace/fund44-roadmap.pplx.md` and `/home/user/workspace/fund44-agent-checklist.md` are copies, not the source of truth.

## Scope

- Marketing architecture, routing, and static generation.
- SEO, AEO, LLM crawlability, schema, sitemap, canonicals, OG, and content quality gates.
- Conversion UX, eligibility mode design, trust/disclosures, analytics, dashboards, and release readiness.
- Accessibility, mobile hardening, performance, deployment, security, testing, and operational governance.

## Baseline Snapshot

- Current app is a Vite vanilla-JS SPA with fragment routing in `src/main.js` and `#/...` links across `src/components/shell.js`, `src/components/ui.js`, `src/pages/*.js`, `public/sitemap.xml`, and `public/llms.txt`.
- Route metadata is injected at runtime by `src/lib/seo.js`, so route-specific `<title>`, canonical, OG, and JSON-LD are not guaranteed in the initial HTML response.
- Canonicals are emitted as clean URLs, while breadcrumbs, article schema, `llms.txt`, and `sitemap.xml` still use fragment URLs. That signal set is inconsistent.
- `src/lib/seo.js` references `/og-image.png`, but the asset does not exist in `public/`.
- `src/components/shell.js` uses a skip link to `#main`, which conflicts with the hash router.
- `src/pages/legal.js` still contains placeholder legal/contact content and preview flags.
- `src/components/flow.js` is preview-only and does not submit data anywhere.
- No CI, host config, test suite, analytics layer, monitoring config, or security-header config is present in the repository tree.
- Existing product/program/article copy is largely hardcoded in `src/pages/products.js` and `src/pages/resources.js`, which blocks scalable manifest-driven content work.

## Open Blockers

- Final production domain, `sameAs`/entity references, and attribution model are not yet confirmed.
- Hosting target and clean-URL behavior are not yet confirmed.
- Staging versus production indexing policy is not yet defined.
- Legal sign-off is missing for marketplace disclosures, privacy, terms, consent, and contact details.
- Verified trust assets are not yet centralized.
- Analytics, monitoring, and dashboard stack selections are not yet finalized.
- Live eligibility/application integration requirements and credentials are not yet available in this repo.

## Key Artifacts

- [ROADMAP.md](ROADMAP.md): this task ledger, dependency order, gates, and changelog.
- [AGENTS.md](AGENTS.md): operating protocol for future agents.
- [docs/measurement-plan.md](docs/measurement-plan.md): event taxonomy, funnel definitions, QA rules, and dashboard views.

## Execution Phases

1. Phase A: Governance and source-of-truth setup.
   Exit focus: approved claims/disclosures, verified entity/contact/legal inputs, measurement definitions.
2. Phase B: Crawlable architecture and release foundation.
   Exit focus: clean routes, structured content model, prerendered pages, aligned metadata/crawl files, accessibility/security baseline, core QA automation.
3. Phase C: Conversion system and trust foundation.
   Exit focus: navigation/CTA reset, preview/live eligibility modes, verified trust modules, instrumented funnel, release dashboard.
4. Phase D: Manifest-driven organic expansion.
   Exit focus: citation validation, internal-link graph, scalable page templates, national financing hubs, use-case, industry, and state launches with freshness controls.
5. Phase E: Optimization and controlled expansion.
   Exit focus: component governance, experimentation harness, contextual funnels, template regression breadth, and gated metro/programmatic expansion.

## Dependency Order

`F44-OPS-01` -> `F44-GOV-01` + `F44-MEA-01` -> `F44-ARCH-01` -> `F44-ARCH-02` -> `F44-SEO-01` -> `F44-SEO-02` + `F44-SEO-03` -> `F44-UX-01` + `F44-CNV-01` + `F44-TRUST-01` -> `F44-A11Y-01` + `F44-SEC-01` + `F44-MEA-02` + `F44-QA-01` -> `F44-SEO-04` + `F44-SEO-05` + `F44-CONT-01` -> `F44-CONT-02` + `F44-CONT-03` + `F44-CONT-04` + `F44-CONT-05` -> `F44-DSGN-01` + `F44-EXP-01` + `F44-CNV-02` + `F44-QA-02` -> `F44-CONT-06` + `F44-EXP-02`

## Milestone Exit Gates

- `M0` Operating system in place.
  Gate: `F44-OPS-01` complete and roadmap/agent protocol/measurement plan cross-linked.
- `M1` Crawlable launch foundation ready.
  Gate: `F44-GOV-01`, `F44-GOV-02`, `F44-MEA-01`, `F44-ARCH-01`, `F44-ARCH-02`, `F44-SEO-01`, `F44-SEO-02`, and `F44-SEO-03` complete.
- `M2` Conversion-ready release candidate.
  Gate: `F44-UX-01`, `F44-CNV-01`, `F44-TRUST-01`, `F44-A11Y-01`, `F44-SEC-01`, `F44-MEA-02`, and `F44-QA-01` complete.
- `M3` Organic scale v1 ready.
  Gate: `F44-SEO-04`, `F44-SEO-05`, `F44-CONT-01`, `F44-CONT-02`, `F44-CONT-03`, `F44-CONT-04`, and `F44-CONT-05` complete.
- `M4` Controlled optimization enabled.
  Gate: `F44-DSGN-01`, `F44-EXP-01`, `F44-CNV-02`, `F44-QA-02`, `F44-CONT-06`, and `F44-EXP-02` complete.

## KPI Watchlist

| KPI | Definition | Source | Baseline Status |
| --- | --- | --- | --- |
| North star | Qualified financing journeys: unique sessions/users reaching a live qualified or manual-review outcome and continuing to the next committed step. | `docs/measurement-plan.md` | Not yet instrumented |
| Crawlable landing coverage | Count of canonical, indexable landing pages published from the route/content manifest. | Route manifest + crawl files | Fragment-routed baseline only |
| Organic landing sessions | Non-branded organic sessions landing on canonical money/content pages. | Analytics | No baseline |
| Page-to-CTA rate | Share of landing sessions that click a primary CTA on a page type. | Analytics | No baseline |
| Funnel start rate | Share of eligible landing sessions that start preview or live eligibility. | Analytics | No baseline |
| Outcome mix | Distribution of preview, live qualified, manual-review, and not-fit outcomes. | Analytics | No baseline |
| Submission completion rate | Share of live starts that submit successfully. | Analytics/integration logs | No baseline |
| Trust interaction rate | Share of sessions that view or interact with verified trust modules before conversion. | Analytics | No baseline |
| Release health | CI pass rate, Lighthouse health, critical a11y defects, JS error-free sessions. | CI + monitoring | No baseline |
| Content freshness coverage | Share of canonical pages with current review metadata and no stale flags. | Content reports | No baseline |

## Now

- [x] `F44-OPS-01` `P0` Bootstrap the roadmap, agent protocol, and measurement-plan documents.
  Status: done
  Owner: Product ops
  Depends on: none
  Paths: `ROADMAP.md`, `AGENTS.md`, `docs/measurement-plan.md`
  Acceptance: repo-local operating docs exist, cross-reference each other, use stable task IDs, and provide enough context that future agents do not need to repeat discovery.
  Verify/Evidence: `test -f ROADMAP.md AGENTS.md docs/measurement-plan.md`; `rg -n 'ROADMAP.md|AGENTS.md|measurement-plan.md' ROADMAP.md AGENTS.md docs/measurement-plan.md`

- [x] `F44-GOV-01` `P0 BLOCKER` Create a claims register and centralized approved-disclosure source.
  Status: done
  Owner: Legal + Brand + Content ops
  Depends on: `F44-OPS-01`
  Paths: new `docs/claims-register.md`, new `docs/disclosures.md`, `src/pages/*.js`, `src/components/ui.js`, `src/components/flow.js`, `src/components/shell.js`, `public/llms.txt`
  Acceptance: every public claim, trust statement, and disclosure has an approved source, owner, scope, and allowed wording; preview/live variants are defined; unapproved claims are inventoried.
  Verify/Evidence: [docs/claims-register.md](docs/claims-register.md) and [docs/disclosures.md](docs/disclosures.md) updated with business-approved draft wording for the curated network, fit-over-fees explanation, and faster-process workflow copy; `git grep -n '75\\+ lender integrations\\|placeholder\\|Preview — legal review required' src public` reviewed against the register; business approval note recorded in changelog.

- [ ] `F44-GOV-02` `P0 BLOCKER` Finalize business identity, legal/contact copy, consent language, and attribution rules.
  Status: blocked - centralized legal/indexing configuration, conservative draft disclosures, and controlled TBD placeholders are implemented, but verified legal business name, mailing address, support email, support phone, final privacy/terms/consent/retention copy, verified `sameAs` references, and final production indexing approval remain external inputs; waiting on legal + operations + privacy + SEO
  Owner: Legal + Operations + SEO
  Depends on: `F44-OPS-01`, `F44-GOV-01`
  Paths: `src/pages/legal.js`, `src/pages/home.js`, `src/pages/about.js`, `src/pages/how-it-works.js`, `src/pages/resources.js`, `src/lib/seo.js`, `src/lib/routes.js`, new `src/lib/legal.js`, `src/components/shell.js`, `src/components/ui.js`, `public/humans.txt`, `public/llms.txt`, `index.html`, `vite.config.js`, `content/pages/home.json`, `content/pages/resources.json`, `content/articles/*.json`, new `docs/legal-launch-checklist.md`, new `scripts/validate-legal.mjs`, `tests/*.mjs`, `package.json`
  Acceptance: verified contact details replace placeholders; approved privacy/terms/consent copy is published or staging-gated; entity URLs and `sameAs` references are verified; staging/prod indexing rules are explicit.
  Verify/Evidence: `git grep -n 'placeholder|Preview — legal review required|faster-funding.com' src public index.html content`; `npm run validate:legal`; legal approval note linked in changelog.

- [x] `F44-MEA-01` `P0` Adopt the measurement taxonomy and north-star definitions from the measurement plan.
  Status: done
  Owner: Growth analytics
  Depends on: `F44-OPS-01`
  Paths: `docs/measurement-plan.md`, new `docs/dashboard-spec.md`, future analytics implementation files
  Acceptance: event names, required properties, KPI formulas, QA checklist, and dashboard views are ratified and treated as implementation requirements; no numeric targets are set before a clean baseline exists.
  Verify/Evidence: measurement plan approval note in changelog; `rg -n 'North Star|Event Catalog|Dashboard Views|Baseline then Target Workflow' docs/measurement-plan.md`

- [x] `F44-ARCH-01` `P0 BLOCKER` Create one route/content manifest and remove fragment URLs from the production model.
  Status: done
  Owner: Frontend platform
  Depends on: `F44-GOV-01`, `F44-MEA-01`
  Paths: `src/main.js`, `src/pages/index.js`, `src/components/shell.js`, `src/components/ui.js`, `src/pages/*.js`, `src/lib/seo.js`, `src/lib/svg.js`, `index.html`, `vite.config.js`, new `vercel.json`, `public/sitemap.xml`, `public/llms.txt`, new `src/lib/routes.js`, new `content/manifest.*`, new `scripts/validate-routes.mjs`, new `scripts/smoke-routes.mjs`, new `tests/routes.test.mjs`, `package.json`
  Acceptance: canonical routes, nav items, breadcrumbs, CTAs, crawl files, and analytics route IDs all come from one manifest; production URLs no longer use `#/`; skip links and in-page anchors are no longer coupled to routing.
  Verify/Evidence: [content/manifest.mjs](content/manifest.mjs) and [src/lib/routes.js](src/lib/routes.js) now define canonical paths, route IDs, nav, breadcrumbs, CTA destinations, sitemap/llms inventory inputs, and analytics route identifiers; `git grep -n '#/' src public index.html` returns no production hash-route matches; `npm run validate:routes`, `npm test`, `npm run build`, and `npm run smoke:routes` passed; route inventory attached in changelog.

- [x] `F44-ARCH-02` `P0` Move hardcoded articles and core program pages into structured content.
  Status: done
  Owner: Frontend platform + Content engineering
  Depends on: `F44-GOV-01`, `F44-ARCH-01`
  Paths: `src/pages/products.js`, `src/pages/resources.js`, `src/pages/home.js`, `src/pages/financing.js`, `src/components/ui.js`, `src/lib/seo.js`, new `content/**/*.json`, new `content/schema/*`, new `src/lib/content.js`, new `scripts/validate-content.mjs`, `tests/routes.test.mjs`, new `tests/content.test.mjs`, `package.json`, `ROADMAP.md`
  Acceptance: current product/program/article content is stored in structured files rather than large hardcoded template literals; schema supports standardized fields for quick answer, who it fits, when it may not fit, typical documents, how Fund44 fits, and common questions.
  Verify/Evidence: structured content now lives under `content/pages/*.json` and `content/articles/*.json`, wired through [src/lib/content.js](src/lib/content.js); inventory includes `page_home`, `page_financing`, `page_sba_7a`, `page_sba_504`, `page_business_acquisition`, `page_working_capital`, `page_resources`, `article_sba_7a_vs_504`, `article_preparing_your_documents`, and `article_working_capital_vs_term_loan`; `rg -n 'const ARTICLES|productPage\\(' src/pages` returns no matches; `npm run validate:content`, `npm run validate:routes`, `npm test`, and `npm run build` passed.

- [x] `F44-SEO-01` `P0 BLOCKER` Ship prerendered clean-path pages with build-time metadata.
  Status: done
  Owner: Frontend platform
  Depends on: `F44-ARCH-01`, `F44-ARCH-02`
  Paths: `index.html`, `vite.config.js`, `vercel.json`, `package.json`, `src/main.js`, `src/lib/seo.js`, `src/pages/*.js`, `scripts/smoke-routes.mjs`, new `scripts/prerender.mjs`, new `scripts/validate-prerender.mjs`, `tests/*.mjs`
  Acceptance: every canonical route emits HTML with final page copy and route-specific metadata in the initial response; deep-link refresh works on the chosen host; home, program, article, legal, and 404 pages are all prerendered.
  Verify/Evidence: `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm test`; `npm run build`; `npm run validate:prerender`; `find dist -path '*/index.html' | sort`; `npm run smoke:routes`

- [x] `F44-SEO-02` `P0 BLOCKER` Generate sitemap, robots, llms, canonicals, and attribution metadata from the same manifest.
  Status: done
  Owner: SEO + Frontend platform
  Depends on: `F44-ARCH-01`, `F44-SEO-01`
  Paths: `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`, `src/lib/seo.js`, new `scripts/generate-crawl-files.mjs`, new analytics route-attribution config
  Acceptance: crawl files and metadata are generated from one source; canonical, breadcrumb, OG URL, llms URLs, and analytics attribution agree; preview/staging can be `noindex` while production remains indexable.
  Verify/Evidence: crawl files and route attribution now generate from [src/lib/crawl.js](src/lib/crawl.js) via [scripts/generate-crawl-files.mjs](scripts/generate-crawl-files.mjs); generated inventory is `15` sitemap URLs, `12` llms entries, and `15` canonical/indexable attribution routes; `npm run validate:crawl`, `rg '#/' dist/sitemap.xml dist/robots.txt dist/llms.txt dist/route-attribution.json`, `rg 'canonical|og:url|application/ld\\+json' dist/resources/sba-7a-vs-504/index.html`, `npm run build`, `npm run validate:prerender`, and `npm run smoke:routes` passed with staging `Disallow: /` preserved while `F44-GOV-02` remains blocked.

- [ ] `F44-SEO-03` `P0` Replace placeholder trust/entity signals and add page-type schema coverage.
  Status: ready
  Owner: SEO + Brand + Frontend
  Depends on: `F44-GOV-01`, `F44-GOV-02`, `F44-SEO-01`
  Paths: `src/lib/seo.js`, `index.html`, `src/pages/*.js`, `public/`, new entity/trust asset files under `public/`
  Acceptance: each page type emits the right schema shape; verified logo/OG assets exist; entity/contact references are accurate; placeholder or unverified trust/entity signals are removed or replaced.
  Verify/Evidence: `test -f public/og-image.png`; schema validator evidence linked in changelog; `git grep -n 'sameAs|Organization|FinancialService' src/lib/seo.js`

- [x] `F44-UX-01` `P0` Reset navigation and CTA hierarchy for brand clarity and conversion intent.
  Status: done
  Owner: Product design + Frontend
  Depends on: `F44-GOV-01`, `F44-ARCH-01`
  Paths: `src/components/flow.js`, `src/components/shell.js`, `src/components/ui.js`, `src/main.js`, `src/pages/home.js`, `src/pages/financing.js`, `src/pages/products.js`, `src/pages/how-it-works.js`, `src/pages/about.js`, `src/pages/legal.js`, `src/lib/legal.js`, `src/lib/routes.js`, `src/lib/content.js`, new `src/lib/eligibility/*`, `content/manifest.*`, `content/pages/*.json`, new `tests/flow*.mjs`, existing `tests/*.mjs`, `package.json`, `ROADMAP.md`
  Acceptance: primary nav reflects the route manifest; CTA hierarchy clearly distinguishes explore, preview, live/apply, and contact intents; the eligibility flow uses an explicit state model with separate preview and live modes, stable step IDs, preserved entry/product context, recoverable validation, clear qualified/manual-review/not-fit outcomes, consent plus "what happens next" before contact capture, and safe refresh/back/close handling; live mode remains disabled or fails safely until approved backend/config and consent copy exist; touched flow surfaces meet keyboard/focus/reduced-motion basics without claiming broader accessibility completion.
  Verify/Evidence: UX review linked in changelog; updated CTA inventory and flow-state diagram attached to task notes; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm run validate:crawl`; `npm test`; `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`

- [ ] `F44-CNV-01` `P0 BLOCKER` Define preview/live eligibility modes and qualified/manual-review/not-fit outcomes.
  Status: blocked - `F44-GOV-02` remains blocked on external legal identity/contact/consent/attribution inputs, so preview/live mode rules and compliant qualified/manual-review/not-fit messaging cannot be finalized yet; waiting on `F44-GOV-02`
  Owner: Product + Frontend + Legal
  Depends on: `F44-GOV-01`, `F44-GOV-02`, `F44-UX-01`
  Paths: `src/components/flow.js`, `src/components/ui.js`, `src/pages/legal.js`, new `docs/eligibility-modes.md`, future integration modules under `src/lib/eligibility/*`
  Acceptance: preview and live modes have explicit rules, copy, consent boundaries, and next-step logic; qualified, manual-review, and not-fit outcomes are defined with compliant messaging and tracking semantics.
  Verify/Evidence: state diagram committed; scenario matrix for preview/live and all outcomes; changelog includes review sign-off.

- [ ] `F44-TRUST-01` `P0` Build verified trust-proof modules and retire placeholders.
  Status: ready
  Owner: Brand + Content ops + Frontend
  Depends on: `F44-GOV-01`, `F44-GOV-02`, `F44-UX-01`
  Paths: `src/components/ui.js`, `src/pages/home.js`, `src/pages/about.js`, `src/pages/how-it-works.js`, new `content/trust/*`
  Acceptance: any trust module shown on site is sourced from approved evidence with owner and freshness metadata; no placeholder or fabricated proof remains; trust modules can be measured consistently.
  Verify/Evidence: trust registry referenced in changelog; `git grep -n 'testimonial|2,400|168M|placeholder' src`

- [ ] `F44-A11Y-01` `P0` Harden mobile behavior and accessibility before launch.
  Status: ready
  Owner: Accessibility + Frontend
  Depends on: `F44-UX-01`, `F44-CNV-01`
  Paths: `src/components/shell.js`, `src/components/flow.js`, `src/main.js`, `src/styles.css`, `src/product.css`, future `tests/a11y/*`
  Acceptance: skip link no longer collides with routing; nav and dialog semantics are corrected; focus management, reduced motion, and mobile touch targets are validated; critical flows work keyboard-only and on narrow screens.
  Verify/Evidence: Playwright or manual accessibility checklist linked in changelog; `git grep -n 'href=\"#main\"|role=\"menu\"|aria-hidden' src`

- [ ] `F44-SEC-01` `P0` Add deployment security controls and harden form rendering.
  Status: ready
  Owner: Security + DevOps + Frontend
  Depends on: `F44-GOV-02`, `F44-CNV-01`
  Paths: host config such as `netlify.toml` or `vercel.json`, `index.html`, `src/components/flow.js`, `src/main.js`, future integration code
  Acceptance: CSP, HSTS, content-type, referrer, and permissions policies are configured for the chosen host; no client-side secrets are exposed; user-entered form values are rendered safely; consent boundaries are enforced.
  Verify/Evidence: `curl -I $STAGING_URL`; `git grep -n 'innerHTML|textContent' src/components/flow.js src/main.js`; security review linked in changelog.

- [ ] `F44-MEA-02` `P0` Implement analytics, dashboard plumbing, and event QA from the measurement plan.
  Status: ready
  Owner: Growth analytics + Frontend
  Depends on: `F44-MEA-01`, `F44-ARCH-01`, `F44-UX-01`, `F44-CNV-01`
  Paths: `src/main.js`, `src/components/shell.js`, `src/components/flow.js`, new `src/lib/analytics.js`, new `src/lib/monitoring.js`, new dashboard config/docs
  Acceptance: funnel events, required properties, attribution fields, and dashboard views from the measurement plan are implemented; no PII is emitted; event QA evidence exists for page, CTA, funnel, and outcome flows.
  Verify/Evidence: vendor debug output or staging screenshots; completed QA checklist from `docs/measurement-plan.md`.

- [ ] `F44-QA-01` `P0` Rebuild release-readiness automation and CI.
  Status: ready
  Owner: QA automation
  Depends on: `F44-SEO-01`, `F44-UX-01`, `F44-CNV-01`, `F44-MEA-02`
  Paths: `package.json`, new `playwright.config.*`, new `tests/**`, new `.github/workflows/*`, new Lighthouse config
  Acceptance: CI covers build, route smoke, canonical/title/schema checks, event smoke, accessibility smoke, mobile layout, console errors, 404 handling, and release evidence collection.
  Verify/Evidence: `npx playwright test`; CI run reference linked in changelog.

## Next

- [x] `F44-SEO-04` `P1` Create a citation registry and build validation for content integrity.
  Status: done
  Owner: SEO + Content engineering
  Depends on: `F44-GOV-01`, `F44-ARCH-02`
  Paths: new `content/citations.*`, new `scripts/validate-citations.mjs`, `content/**/*.json`, `content/schema/content-model.mjs`, `scripts/validate-content.mjs`, `docs/claims-register.md`, new `docs/citation-registry.md`, `tests/content.test.mjs`, new `tests/citations.test.mjs`, `package.json`, `ROADMAP.md`
  Acceptance: each claim-bearing content page references approved citation IDs or approved internal evidence; build fails on missing, expired, duplicate, or disallowed citations.
  Verify/Evidence: `npm run validate:citations`; citation validation report linked in changelog.

- [x] `F44-SEO-05` `P1` Generate an internal-link graph and enforce orphan checks.
  Status: done
  Owner: SEO + Frontend platform
  Depends on: `F44-ARCH-01`, `F44-ARCH-02`, `F44-SEO-01`
  Paths: `content/manifest.*`, new `src/lib/link-graph.js`, new `scripts/build-link-graph.mjs`, `scripts/validate-content.mjs`, `src/components/ui.js`, page templates, new `tests/link-graph.test.mjs`, new `docs/link-graph.md`, `package.json`, `ROADMAP.md`
  Acceptance: link graph output identifies hubs, spokes, orphaned pages, and missing cross-links; money pages cannot launch without required inbound/outbound links.
  Verify/Evidence: `npm run build:link-graph`; generated graph artifact linked in changelog.

- [ ] `F44-CONT-01` `P1` Standardize scalable page sections and content quality gates.
  Status: ready
  Owner: Content strategy + Content engineering
  Depends on: `F44-ARCH-02`, `F44-SEO-04`
  Paths: new `content/schema/*`, new `content/templates/*`, new `docs/content-quality-gates.md`, page templates
  Acceptance: financing, use-case, industry, and state pages all support the standard section set: Quick answer, Who it fits, When it may not fit, Typical documents, How Fund44 fits, and Common questions; each template enforces disclaimers, schema, and evidence fields.
  Verify/Evidence: `npm run validate:content`; template checklist linked in changelog.

- [ ] `F44-CONT-02` `P1` Launch national financing hubs from the approved manifest.
  Status: ready
  Owner: SEO content + Frontend
  Depends on: `F44-CONT-01`, `F44-SEO-05`, `F44-MEA-02`
  Paths: new `content/financing/*`, page templates, `content/manifest.*`
  Acceptance: approved national financing hub pages ship with canonical metadata, internal links, schema, citations, and measurement tags; each page passes the quality-gate template.
  Verify/Evidence: route inventory diff; content QA checklist; build artifact review.

- [ ] `F44-CONT-03` `P1` Launch use-case pages from the approved manifest.
  Status: ready
  Owner: SEO content + Frontend
  Depends on: `F44-CONT-01`, `F44-SEO-05`, `F44-MEA-02`
  Paths: new `content/use-cases/*`, page templates, `content/manifest.*`
  Acceptance: use-case pages cover approved search intents with standardized sections, citation support, internal links, and per-page measurement fields.
  Verify/Evidence: route inventory diff; content QA checklist; build artifact review.

- [ ] `F44-CONT-04` `P1` Launch industry pages from the approved manifest.
  Status: ready
  Owner: SEO content + Frontend
  Depends on: `F44-CONT-01`, `F44-SEO-05`, `F44-MEA-02`
  Paths: new `content/industries/*`, page templates, `content/manifest.*`
  Acceptance: industry pages only launch from approved intents and use the standardized template, citations, internal links, and disclosure rules.
  Verify/Evidence: route inventory diff; content QA checklist; build artifact review.

- [ ] `F44-CONT-05` `P1` Launch state pages from the approved manifest.
  Status: ready
  Owner: SEO content + Frontend
  Depends on: `F44-CONT-01`, `F44-SEO-05`, `F44-MEA-02`
  Paths: new `content/states/*`, page templates, `content/manifest.*`
  Acceptance: state pages ship only from approved manifest rows, keep national copy/disclosure standards, and add only state-specific facts that have evidence and freshness ownership.
  Verify/Evidence: route inventory diff; content QA checklist; build artifact review.

- [ ] `F44-CONT-06` `P1` Add freshness-review workflow and stale-content reporting.
  Status: ready
  Owner: Content ops
  Depends on: `F44-SEO-04`, `F44-CONT-01`
  Paths: new `docs/content-review.md`, `content/manifest.*`, `content/citations.*`, new `scripts/report-freshness.mjs`
  Acceptance: each canonical page has an owner, reviewed-at field, review trigger, and stale-status signal; stale content can be reported before release.
  Verify/Evidence: `npm run report:freshness`; stale-content report linked in changelog.

- [x] `F44-DSGN-01` `P1` Establish semantic token and component governance.
  Status: done
  Owner: Design systems + Frontend
  Depends on: `F44-UX-01`, `F44-SEO-05`
  Paths: `ROADMAP.md`, `src/styles.css`, `src/product.css`, `src/components/ui.js`, `src/components/shell.js`, `src/components/flow.js`, `src/lib/svg.js`, `src/pages/*.js`, new `docs/design-system.md`, new `scripts/validate-design-tokens.mjs`, new `tests/design-system.test.mjs`, `package.json`
  Acceptance: semantic tokens, CTA variants, disclosure patterns, trust-module slots, and content-section components are standardized so new templates do not fork visual logic. Shared public components consume semantic role tokens rather than raw presentation values, one-off colors and heavy default elevation are centralized or removed, and the design-system release gate documents component ownership plus token rules.
  Verify/Evidence: component inventory linked in changelog; token audit diff; `npm run validate:design`

- [ ] `F44-EXP-01` `P1` Build an experimentation harness with guardrails and exposure tracking.
  Status: ready
  Owner: Growth engineering + Analytics
  Depends on: `F44-MEA-02`, `F44-DSGN-01`
  Paths: new `src/lib/experiments.js`, new `docs/experiment-rules.md`, analytics layer, affected templates
  Acceptance: nav, CTA, funnel, trust, and mobile experiments can be configured with exposure events, kill switches, and guardrail metrics; no experiment bypasses disclosure or consent rules.
  Verify/Evidence: experiment QA checklist; sample exposure event evidence linked in changelog.

- [ ] `F44-CNV-02` `P1` Build contextual product funnels that preserve route intent.
  Status: ready
  Owner: Product + Frontend + Analytics
  Depends on: `F44-CNV-01`, `F44-MEA-02`, `F44-DSGN-01`
  Paths: page templates, `src/components/flow.js`, route manifest, analytics config
  Acceptance: product/context pages can pass route and intent into the funnel without breaking disclosure rules, attribution, or outcome handling; context-specific next steps are measurable.
  Verify/Evidence: scenario matrix linked in changelog; QA event evidence for at least one product-context path.

- [ ] `F44-QA-02` `P1` Expand regression automation for templates, trust modules, and funnel variants.
  Status: ready
  Owner: QA automation
  Depends on: `F44-QA-01`, `F44-DSGN-01`, `F44-CNV-02`
  Paths: `tests/**`, CI workflows, template fixtures/content manifests
  Acceptance: regression coverage extends beyond launch smoke checks to template variants, trust modules, funnel modes/outcomes, and canonical/content quality assertions for generated pages.
  Verify/Evidence: CI run reference linked in changelog; template regression matrix attached.

## Later

- [ ] `F44-CONT-07` `P2` Expand into metro and other programmatic combinations only from approved manifests and query evidence.
  Status: ready
  Owner: SEO strategy + Content ops
  Depends on: `F44-CONT-02`, `F44-CONT-03`, `F44-CONT-04`, `F44-CONT-05`, `F44-SEO-04`, `F44-SEO-05`
  Paths: new `content/metros/*`, approved manifests, query-evidence docs, page templates
  Acceptance: no metro/programmatic page launches without approved manifest rows, query evidence, required internal links, citations, freshness owner, and QA pass.
  Verify/Evidence: manifest approval reference; `npm run validate:content`; `npm run build:link-graph`

- [ ] `F44-EXP-02` `P2` Run controlled experiments on nav, CTA, funnel, trust, and mobile patterns.
  Status: ready
  Owner: Growth engineering + Analytics + Product
  Depends on: `F44-EXP-01`, `F44-CNV-02`, `F44-QA-02`
  Paths: experiment configs, dashboards, affected templates, experiment documentation
  Acceptance: every experiment has a hypothesis, primary KPI, safety metrics, rollback plan, and post-test summary; results update roadmap priorities instead of creating undocumented drift.
  Verify/Evidence: experiment brief and result summary linked in changelog; exposure and KPI evidence attached.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Clean-route migration slips while content and SEO work starts anyway. | Duplicated work and inconsistent crawl signals. | Do not start scale-content tasks before `F44-ARCH-01`, `F44-SEO-01`, and `F44-SEO-02` are complete. |
| Claims, trust proof, or legal copy ships without centralized approval. | Compliance risk and brand damage. | Complete `F44-GOV-01`, `F44-GOV-02`, and `F44-TRUST-01` before production indexing. |
| Measurement launches late or inconsistently. | No usable baseline; experimentation becomes noise. | Treat `F44-MEA-01` and `F44-MEA-02` as gating work, not a follow-up. |
| Programmatic content outpaces quality controls. | Thin content, orphan pages, and poor index quality. | Enforce `F44-SEO-04`, `F44-SEO-05`, `F44-CONT-01`, and `F44-CONT-06` before expansion. |
| Preview/live funnel logic forks or drifts by page context. | Broken attribution and unclear user journeys. | Centralize route intent, eligibility modes, and outcome handling through `F44-CNV-01` and `F44-CNV-02`. |
| Accessibility and security are postponed until late release stages. | Expensive rework and launch blockers. | Keep `F44-A11Y-01`, `F44-SEC-01`, and `F44-QA-01` in the Now tranche. |

## Change Log

| Date | Task ID | Summary | Tests or Evidence | PR / Commit / Ref |
| --- | --- | --- | --- | --- |
| 2026-07-26 | `F44-CNV-01` | Reviewed the live roadmap task definition before implementation and did not start application work because the source-of-truth task still covers preview/live eligibility mode rules, consent boundaries, and compliant qualified/manual-review/not-fit outcome messaging, not the already-completed nav/CTA reset work from `F44-UX-01`. Updated the task status to blocked so the roadmap matches reality: `F44-GOV-02` is still blocked on verified legal business identity/contact inputs, final privacy/terms/consent/retention language, verified `sameAs` references, and final production indexing approval, which are explicit prerequisites for final live-mode and compliant outcome definitions. | Verified current `main` roadmap text via `gh api repos/zlillymp/fund44-redesign/contents/ROADMAP.md?ref=main`; dependency review confirmed `F44-GOV-02` remains blocked; no app/code paths were changed because `AGENTS.md` forbids starting a task with incomplete dependencies. Validation rerun on the current branch: `npm ci`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm run validate:crawl`; `npm run validate:design`; `npm test`; `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`. | `branch:agent/f44-cnv-01` |
| 2026-07-26 | `F44-DSGN-01` | Established a semantic role-token layer in `src/styles.css` and `src/product.css`, documented the design-system contract in [docs/design-system.md](docs/design-system.md), reduced default public elevation from heavy shared shadows to hairline/surface depth, centralized validation/error/status roles, standardized CTA hierarchy (`btn-primary`, `btn-ghost`, `btn-on-dark`, `btn-link`), and refactored shared shell/UI/flow/page templates so public components consume shared semantic classes instead of repeated inline presentation. Component inventory covered the global shell (`src/components/shell.js`), shared UI modules plus product visualizations (`src/components/ui.js`), flow dialog states (`src/components/flow.js`), brand wordmark (`src/lib/svg.js`), and shared page templates that previously duplicated card/list/legal/CTA styling. | `npm ci`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm run validate:crawl`; `npm run validate:design`; `npm test` (`48/48`); `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`; token audit diff confirmed public-layer raw color literals were removed from `src/components/**`, `src/pages/**`, and `src/lib/svg.js`, with only dynamic inline visualization/progress positioning retained; `tests/design-system.test.mjs` passed and the new validator enforced semantic-token and static-inline-style release gates. | `branch:agent/f44-des-01` |
| 2026-07-26 | `F44-UX-01` | Replaced the ad hoc preview dialog with an explicit eligibility-flow state model under `src/lib/eligibility/*`, wired stable CTA/context metadata through shared CTA helpers and shell/page surfaces, added safe session-based resume behavior for refresh/back/close, inserted consent plus “what happens next” before any future contact-capture boundary, and split outcomes into explicit `qualified`, `manual_review`, and `not_fit` preview categories. Preview sequence is `mode_select -> use_of_funds -> funding_amount -> business_profile -> consent_review -> outcome`; live sequence preserves the same pre-contact steps but stops at `live_unavailable` because approved consent copy, backend submission handling, provider handoff logic, and live analytics/consent rules are still missing, so live mode remains safely disabled without falsely enabling submission. | `npm ci`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm run validate:crawl`; `npm test` (`45/45`); `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`; repo-local Markdown cross-reference check passed for `9` governance/roadmap docs; focused flow tests `tests/flow-model.test.mjs`, `tests/flow-storage.test.mjs`, and `tests/flow-trigger.test.mjs` passed. | `branch:agent/f44-ux-01` |
| 2026-07-26 | `F44-SEO-02` | Replaced hand-maintained crawl files with one manifest-backed generation pipeline: sitemap, robots, llms inventory, and route-attribution JSON now derive from the canonical route/content/legal helpers, the build writes those files into both `public/` and `dist/`, and staging indexing remains blocked unless `F44-GOV-02` explicitly approves production indexing. Generated inventory: sitemap routes `home`, `financing`, `sba_7a`, `sba_504`, `business_acquisition`, `working_capital`, `how_it_works`, `about`, `resources`, `resource_sba_7a_vs_504`, `resource_preparing_documents`, `resource_working_capital_vs_term_loan`, `privacy`, `terms`, `contact`; llms entries `sba_7a`, `sba_504`, `business_acquisition`, `working_capital`, `home`, `financing`, `how_it_works`, `about`, `resources`, `privacy`, `terms`, `contact`; attribution route inventory count `15`. | `npm ci`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm run validate:crawl`; `npm test` (`30/30`); `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`; `rg -n '#/' dist/sitemap.xml dist/robots.txt dist/llms.txt dist/route-attribution.json` returned no matches; `rg -n 'canonical|og:url|application/ld\\+json' dist/resources/sba-7a-vs-504/index.html` confirmed prerendered canonical/OG/schema agreement. | `branch:agent/f44-seo-02` |
| 2026-07-26 | `F44-SEO-05` | Added a manifest/content-driven internal-link graph plus accessible related-link modules across canonical templates, enforced hub/contextual/next-step minimums for indexable page types, and generated [docs/link-graph.md](docs/link-graph.md) showing `15` canonical routes, `14` hub links, `50` contextual links, `15` next-step links, and `0` orphans. | `npm ci`; `npm run build:link-graph`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm test` (`30/30`); `npm run build`; `npm run validate:prerender`; `npm run smoke:routes`. | `branch:agent/f44-seo-05` |
| 2026-07-26 | `F44-SEO-04` | Added a canonical citation registry plus citation validator, extended structured-content validation with claim-review metadata, updated all manifest-backed pages/articles with `claimIds`, `claimReview`, and `citationIds`, and narrowed unsupported structured copy so current content uses approved internal evidence only for governed Fund44 wording and external citations for product, program, editorial, and document-guidance claims. Citation-backed content inventory: `page_home`, `page_financing`, `page_sba_7a`, `page_sba_504`, `page_business_acquisition`, `page_working_capital`, `page_resources`, `article_sba_7a_vs_504`, `article_preparing_your_documents`, `article_working_capital_vs_term_loan`. | `npm ci`; `npm run validate:citations`; `npm run validate:content`; `npm run validate:routes`; `npm test` (`23/23`); `npm run build`; `npm run smoke:routes`; selected-doc markdown link check passed; governed-wording grep over `content/pages` and `content/articles` returned no disallowed public-copy matches. | `branch:agent/f44-seo-04` |
| 2026-07-26 | `F44-SEO-01` | Added a manifest-driven prerender pass that reuses the existing route/content/page-renderer stack to emit build-time HTML and metadata for every canonical route plus a dedicated 404. Initial HTML now includes visible page copy, route-specific `<title>`, description, canonical, Open Graph/Twitter tags, and route JSON-LD for home, program, article, legal, contact, and 404 outputs, while preserving staging `noindex` behavior from the legal config and SPA hydration/navigation after load. Generated route inventory: `/`, `/financing`, `/sba-7a`, `/sba-504`, `/business-acquisition`, `/working-capital`, `/how-it-works`, `/about`, `/resources`, `/resources/sba-7a-vs-504`, `/resources/preparing-your-documents`, `/resources/working-capital-vs-term-loan`, `/privacy`, `/terms`, `/contact`, `/404`; clean-url `.html` duplicates were emitted alongside `dist/*/index.html` for direct static serving under the selected Vercel model. | `npm ci`; `npm run validate:content`; `npm run validate:routes`; `npm run validate:legal`; `npm test` (`22/22`); `npm run build`; `npm run validate:prerender`; `find dist -path '*/index.html' | sort` showed all canonical routes plus `dist/404/index.html`; `npm run smoke:routes` passed for prerendered clean-path direct loads, hydration asset references, legacy hash migration fallback, and real 404 handling. | `branch:agent/f44-seo-01` |
| 2026-07-26 | `F44-ARCH-02` | Replaced hardcoded home, financing, program, resource-hub, and article copy with structured JSON content tied to route IDs/slugs; added a schema-backed validator plus content loader; preserved current page rendering while moving core fields into implementation-ready records for quick answer, fit/not-fit guidance, documents, Fund44 role, FAQs, disclosures, related IDs, and measurement metadata. Content inventory: `page_home`, `page_financing`, `page_sba_7a`, `page_sba_504`, `page_business_acquisition`, `page_working_capital`, `page_resources`, `article_sba_7a_vs_504`, `article_preparing_your_documents`, `article_working_capital_vs_term_loan`. | `npm ci`; `npm run validate:content`; `npm run validate:routes`; `npm test` (`14/14`); `npm run build`; `rg -n 'const ARTICLES|productPage\\(' src/pages` returned no matches. | `branch:agent/f44-arch-02` |
| 2026-07-26 | `F44-GOV-02` | Implemented the achievable governance slice: centralized legal/entity/indexing state in `src/lib/legal.js`, environment-driven noindex-vs-index behavior for staging/production, omission of unverified `sameAs`, controlled TBD identity/contact placeholders that cannot masquerade as final production data, a launch checklist, and conservative business-approved disclosure reuse across legal, footer, about, process, home, resources, `humans.txt`, and `llms.txt`. After rebasing onto `F44-ARCH-02`, governed public-copy updates that affect home/resources/article surfaces were migrated into `content/pages/*.json` and `content/articles/*.json` instead of restoring hardcoded renderer literals. The task remains blocked because verified legal business name, mailing address, support email, support phone, final privacy/terms/consent/retention language, verified `sameAs` references, and final production indexing approval are still external inputs. | `npm run validate:legal`; governed-surface grep for `75+`, `Lendflow`, `faster-funding.com`, preview-legal placeholder banner, exact-minute promises, blocked ranking/security claims, unsupported one-application/live-matching phrasing, and disallowed network-count paraphrases returned no matches; `tests/legal.test.mjs` locks staging noindex, TBD identity placeholders, empty `sameAs`, and approved wording reuse across manifest-backed content. | `branch:agent/f44-gov-02` |
| 2026-07-25 | `F44-GOV-01` | Marked approved claims/disclosure language as complete and corrected `F44-ARCH-01` to depend on `F44-GOV-01` plus `F44-MEA-01`, because route/content architecture can proceed before final legal identity/contact/privacy details. Preserved `F44-GOV-02` as an `M1` launch/indexing gate and for final legal/entity/contact/schema surfaces. | Markdown/link/dependency validation; reviewed `M1`, `F44-ARCH-01`, and downstream `F44-GOV-02` dependencies for compliance-gate preservation. | `branch:f44-gov-01-dependency-fix` |
| 2026-07-25 | `F44-ARCH-01` | Replaced the hash-router production model with one manifest-backed clean-route layer that now drives canonical paths, page mapping, nav items, breadcrumbs, CTA destinations, sitemap and llms inventory inputs, analytics route IDs, legacy `#/...` migration, and Vercel SPA rewrites for direct clean-path loads. Route inventory: `home / home / home_page / home`; `financing /financing / financing_hub / financing_hub`; `sba_7a /sba-7a / program_page / product_page`; `sba_504 /sba-504 / program_page / product_page`; `business_acquisition /business-acquisition / program_page / product_page`; `working_capital /working-capital / program_page / product_page`; `how_it_works /how-it-works / financing_hub / process_page`; `about /about / financing_hub / brand_page`; `resources /resources / article / resources_hub`; `resource_sba_7a_vs_504 /resources/sba-7a-vs-504 / article / editorial_article`; `resource_preparing_documents /resources/preparing-your-documents / article / editorial_article`; `resource_working_capital_vs_term_loan /resources/working-capital-vs-term-loan / article / editorial_article`; `privacy /privacy / legal / legal_page`; `terms /terms / legal / legal_page`; `contact /contact / contact / contact_page`; `not_found /404 / 404 / 404_page (non-canonical)`. | `npm ci`; `npm run validate:routes`; `npm test`; `npm run build`; `git grep -n '#/' src public index.html` returned no matches; `npm run smoke:routes` passed for clean-path direct loads and SPA fallback. Follow-up risks noted: route metadata is still injected at runtime until `F44-SEO-01`, sitemap/llms remain manually mirrored from the manifest until `F44-SEO-02`, and client-rendered 404/canonical handling still needs prerender and schema follow-up. | `branch:agent/f44-arch-01` |
| 2026-07-24 | `F44-OPS-01` | Bootstrapped the durable roadmap, agent protocol, and measurement plan; integrated technical audit plus organic/conversion conclusions; created shareable mirrors outside the repo. | Cross-reference validation, duplicate-task-ID check, and mirror file equality check. | `branch:f44-ops-01-roadmap-docs` |
| 2026-07-24 | `F44-MEA-01` | Ratified the measurement taxonomy as an implementation contract, clarified the north-star counting grain and KPI formulas, added an implementation-ready dashboard spec, and locked in privacy/baseline-before-target rules without setting numeric targets. | Markdown link-target check passed; section-header grep passed across roadmap, measurement, and dashboard docs; markdownlint passed with `MD013` disabled for repo-wide wrap style; `npm run build` passed. | `PR #3` |
| 2026-07-24 | `F44-GOV-01` | Claimed the task on `agent/f44-gov-01` and expanded the path list to include `src/components/shell.js` because the sitewide footer contains public marketplace, credit, timing, and preview disclosures that must be captured in the register. | Dependency check: `F44-OPS-01` is done; inventory surfaces identified in `src/pages/*.js`, `src/components/ui.js`, `src/components/flow.js`, `src/components/shell.js`, and `public/llms.txt`. | `branch:agent/f44-gov-01` |
| 2026-07-24 | `F44-GOV-01` | Added [docs/claims-register.md](docs/claims-register.md) and [docs/disclosures.md](docs/disclosures.md); inventoried public numeric, product, process, trust, timing, credit, lender-network, privacy/security, and marketplace/not-lender claims; centralized preview-versus-live disclosure drafts; blocked task completion because the repo contains no legal, business, partner, privacy, or security approval artifacts. | Register/disclosure diffs; grep review of lender-count, placeholder, and preview/legal-review strings in `src` and `public`; repo review found no approval source for `Lendflow`, `75+ lender integrations`, final privacy/legal copy, verified contact details, ranking/fairness claims, or security claims. | `PR #2`, `commit:5b8476a`, `branch:agent/f44-gov-01` |
| 2026-07-25 | `F44-GOV-01` | Applied business-approved public-draft wording for the curated 40-50 lender network, the Fund44 `44` origin story and operating sweet spot, `customer-service standards`, `fit over fees`, and a conservative faster-process workflow description; moved `F44-GOV-01` to done and kept `F44-GOV-02` blocked on legal/contact/entity inputs. | Business approval received on `2026-07-25`; [docs/claims-register.md](docs/claims-register.md) and [docs/disclosures.md](docs/disclosures.md) updated; `npm run build`, markdownlint, and markdown cross-reference checks rerun on this follow-up. | `branch:agent/f44-gov-01-business-approvals` |
