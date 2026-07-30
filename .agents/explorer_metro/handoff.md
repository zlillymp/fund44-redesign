# Handoff Report: Texas Metro Expansion Architecture (F44-CONT-07)

**Task ID**: F44-CONT-07  
**Working Directory**: `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro`  
**Report File**: `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro/analysis.md`  
**Author**: Explorer 1  
**Date**: 2026-07-30  

---

## 1. Observation

Direct observations from codebase inspection of `/Users/mattlilly/Documents/Projects/fund44-redesign`:

1. **Existing Scalable Page Contract Pattern**:
   - `content/schema/content-model.mjs`: `baseRequiredFields` (lines 3-33) defines 30 mandatory content fields across all records.
   - `content/schema/scalable-page-contract.mjs`: `scalableTemplateFieldRequirements` (lines 20-73) and `scalableTemplateContracts` (lines 75-147) govern `financing_hub`, `product_page`, `use_case_page`, `industry_page`, and `state_page`.
   - `content/states/california.json` (256 lines): Demonstrates state-level support card structure (`stateSupportCards`), regional context cards (`stateContextCards`), citation bindings (`citationIds`), and intent/measurement metadata.

2. **Routing & Content Loading**:
   - `content/manifest.mjs` (607 lines): Defines canonical routes in `routeManifest.routes` and navigation trees (`navigation.primary`, `navigation.mobile`, `navigation.footer`).
   - `src/lib/routes.js` (229 lines): Builds lookup maps (`routeById`, `routeByPath`, `routeBySlug`, `routeByContentId`) and exports navigation builders.
   - `src/lib/content.js` (129 lines): Statically imports content JSON files using ESM JSON imports (`import ... from '...' with { type: 'json' }`) and registers them in `rawRecords`.
   - `src/pages/index.js` (86 lines): Maps route `pageKey` properties to functions in `pageRenderers`.
   - `src/pages/states.js` (205 lines): Implements `renderState(routeId)` helper for state page rendering.

3. **Citations & Governance**:
   - `content/citations.mjs` (617 lines): Stores `citationRegistry` containing internal approved disclosures and external primary citations for federal SBA programs, FMCSA, FTC, and state-level SBA district offices (California, Florida, New York).
   - `scripts/validate-citations.mjs` (274 lines): Gating script asserting citation validity, non-expiry, allowed scope matching, and claim ID coverage against `docs/claims-register.md`.

4. **Link Graph, Crawl & Prerender Automation**:
   - `src/lib/link-graph.js` (408 lines): Validates internal link graph (`getLinkGraph()`, `getLinkModuleForRoute()`), requiring hub, contextual, and next-step links while prohibiting orphan routes.
   - `src/lib/eligibility/model.js` (812 lines): Defines `FUNNEL_CONTEXT_KINDS` (`generic`, `program`, `useCase`, `industry`, `state`).
   - `scripts/prerender.mjs` (104 lines): Automatically iterates over all canonical routes returned by `getCanonicalRoutes()` and emits static HTML to `dist/`.

5. **Current Verification State**:
   - `npm run validate:content` returned 0 errors across 25 existing content records.
   - `npm test` returned 125/125 passing tests.

---

## 2. Logic Chain

1. **Observation**: State pages (`california_sba_loans`, `florida_sba_loans`, `new_york_sba_loans`) use `templateId: 'state_page'`, `pageType: 'state'`, `routeFamily: 'state'`, and render via `src/pages/states.js`.
2. **Reasoning**: Metro pages represent the next level of regional granularity (Metropolitan Statistical Areas in Texas). Defining a dedicated `metro_page` template (or extending `state_page` patterns) allows city-level SBA district offices (Houston, DFW, San Antonio, El Paso) and regional SBDC networks (UH, Dallas College, UTSA, EPCC, Del Mar, Collin, TAMIU) to be linked with national product explainers without duplicating template rendering logic.
3. **Observation**: `scripts/validate-citations.mjs` requires every claim-bearing content record to reference valid external primary citations covering its claims and evidence scopes (`product_overview`, `program_detail`, `educational_editorial`, `document_guidance`).
4. **Reasoning**: All 10 Texas metro pages must reference registered external primary citations for Texas SBA district offices, regional SBDC networks, and state small business portals in `content/citations.mjs`.
5. **Observation**: `scripts/prerender.mjs` calls `getCanonicalRoutes()`, which reads `routeManifest.routes` from `content/manifest.mjs`.
6. **Reasoning**: Adding the 10 Texas metro routes to `content/manifest.mjs` with `crawl: { canonical: true, indexable: true, sitemap: true, llms: true, landing: true }` guarantees that `scripts/prerender.mjs`, `src/lib/crawl.js`, and `scripts/generate-crawl-files.mjs` will automatically pick them up and generate clean-path prerendered HTML, sitemap entries, and LLMS entries without extra build scripting.
7. **Conclusion**: The codebase requirements for F44-CONT-07 are fully mapped, deterministic, and follow existing established patterns without architectural drift.

---

## 3. Caveats

1. **External Legal/Entity Placeholders**: Under `F44-GOV-02`, legal business entity name, contact phone/email, and sameAs references remain placeholder identity values (`TBD under F44-GOV-02`). Metro pages must preserve these placeholder disclaimers.
2. **Live Application Mode**: Live mode submission remains disabled until backend handoff exists. All CTA buttons on metro pages must trigger preview mode eligibility flows with `funnelContextKind: 'metro'`.
3. **Query Evidence Inputs**: As specified in `ROADMAP.md` task F44-CONT-07, content copy in metro JSON files must align with approved search intents and verified SBA district/SBDC details.

---

## 4. Conclusion

Fund44's architecture is fully prepared for the launch of the 10 Texas Metro pages under task **F44-CONT-07**.

The detailed technical analysis, schema contracts, citation entries, JSON structures, loader updates, and step-by-step implementation plan are documented in:
`/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro/analysis.md`

---

## 5. Verification Method

To independently verify the investigation findings:

1. **Inspect Analysis Report**:
   `view_file` on `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro/analysis.md`

2. **Run Existing Validation Suite Baseline**:
   - `npm run validate:content`
   - `npm run validate:routes`
   - `npm run validate:citations`
   - `npm test`

3. **Invalidation Conditions**:
   - Any failure of `validate-content.mjs`, `validate-routes.mjs`, or `validate-citations.mjs`.
   - Any missing citation ID when adding Texas metro JSON files.
   - Any orphan route detected during `build:link-graph`.
