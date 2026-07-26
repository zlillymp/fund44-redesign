# Fund44 Content Quality Gates

This document is the implementation contract for `F44-CONT-01`. It standardizes the section set and validation gates that current and future scalable landing-page families must use before new routes launch from the manifest.

`F44-CONT-01` does **not** launch new national, use-case, industry, or state routes. It standardizes the existing financing/SBA cluster and defines the reusable contract that `F44-CONT-02` through `F44-CONT-05` must follow.

## Scope

- Current standardized cluster in this task:
  - `financing` (`financing_hub`)
  - `sba_7a`, `sba_504`, `business_acquisition`, `working_capital` (`product_page`)
- Future scalable families covered by the same contract:
  - `use_case_page` in `F44-CONT-03`
  - `industry_page` in `F44-CONT-04`
  - `state_page` in `F44-CONT-05`

## Standard Section Set

Every scalable financing-style landing page must support these sections in structured content:

1. `quickAnswer`
2. `whoItFits`
3. `whenItMayNotFit`
4. `typicalDocuments`
5. `howFund44Fits`
6. `commonQuestions`

These sections are required because they keep landing pages consistent across national financing, future use-case, industry, and state launches.

## Template Inventory

The source of truth for scalable template families lives in:

- [content/schema/scalable-page-contract.mjs](../content/schema/scalable-page-contract.mjs)
- [content/templates/scalable-page-templates.mjs](../content/templates/scalable-page-templates.mjs)

Current contract coverage:

- `financing_hub`
  - Page type: `financing_hub`
  - Current route(s): `financing`
  - Later launch task for new national routes: `F44-CONT-02`
- `product_page`
  - Page type: `program_page`
  - Current route(s): `sba_7a`, `sba_504`, `business_acquisition`, `working_capital`
  - Later launch task for new national routes: `F44-CONT-02`
- `use_case_page`
  - Page type: `use_case`
  - Later launch task: `F44-CONT-03`
- `industry_page`
  - Page type: `industry`
  - Later launch task: `F44-CONT-04`
- `state_page`
  - Page type: `state`
  - Later launch task: `F44-CONT-05`

## Required Quality Gates

Every scalable landing-page record must include:

- Standard section fields:
  - `quickAnswer`
  - `whoItFits`
  - `whenItMayNotFit`
  - `typicalDocuments`
  - `howFund44Fits`
  - `commonQuestions`
- Disclosure and evidence fields:
  - `sectionDisclosureHtml`
  - `claimIds`
  - `claimReview`
  - `citationIds`
  - `disclosureIds`
- Publishing and measurement fields:
  - `contributors`
  - `publishedDate`
  - `reviewedDate`
  - `intent`
  - `measurement`
  - `indexability`
- Route/manifest alignment:
  - `routeId`
  - `slug`
  - `pageType`
  - `templateId`

## Content Rules

- Use only approved Fund44 claims and disclosure wording from [docs/claims-register.md](./claims-register.md) and [docs/disclosures.md](./disclosures.md).
- Use current authoritative citations already registered in [content/citations.mjs](../content/citations.mjs) unless a later task explicitly expands the registry.
- Do not fabricate:
  - legal identity
  - authors
  - reviewers
  - publish/review dates
  - rates
  - timelines
  - guarantees
  - provider availability
- Keep `howFund44Fits` explanatory. It should describe the role of the page or experience without implying lender decisions or guaranteed outcomes.

## Rendering Rules

- Financing hubs and program pages must visibly render the standard section set, not just store it in JSON.
- Disclosure copy must come from structured content for scalable landing pages rather than page-local literals.
- Related links must remain manifest-backed and pass the internal-link graph gates.
- FAQ output must continue to support prerendered FAQ schema through the existing page renderers.

## Validation Gates

`F44-CONT-01` relies on these repo-local checks:

- `npm run validate:content`
- `npm run validate:citations`
- `npm run validate:routes`
- `npm run validate:crawl`
- `npm run validate:legal`
- `npm test`
- `npm run build`
- `npm run validate:prerender`
- `npm run smoke:routes`

## Launch Boundaries

- `F44-CONT-01` standardizes the template family and current financing/SBA routes.
- `F44-CONT-02` launches additional national financing hubs from approved manifest rows.
- `F44-CONT-03` launches use-case routes.
- `F44-CONT-04` launches industry routes.
- `F44-CONT-05` launches state routes.

Do not add new scalable routes under this task unless the roadmap task changes first.
