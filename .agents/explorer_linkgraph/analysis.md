# Content JSON & Link Graph Audit Analysis

**Project**: Fund44 Redesign — Milestone 3: Content & Link Graph Audit  
**Agent**: Explorer 3 (`explorer_linkgraph`)  
**Working Directory**: `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_linkgraph`  
**Date**: 2026-07-30  

---

## 1. Executive Summary

This report provides a comprehensive codebase investigation of Fund44's structured content JSON architecture, internal link graph validation mechanism, and the requirements for expanding the graph to include **Texas state (`texas_sba_loans`)** and **10 Texas metro pages** (Houston, Dallas, Austin, San Antonio, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo).

### Key Findings:
1. **Current Graph Baseline**: 30 canonical indexable routes, 29 hub links, 161 contextual links, 30 next-step links, and **0 orphans**.
2. **Link Extraction Mechanics**: `src/lib/link-graph.js` extracts outbound contextual links from 9 structured content fields (`relatedIds`, `articleIds`, `productCardIds`, `matrixRows`, `decisionCards`, `bestFitProducts`, `alternativePaths`, `stateSupportCards`, `stateContextCards`). Content IDs in `relatedIds`, `articleIds`, and `productCardIds` are dynamically mapped to route IDs via `resolveContentRouteId()`.
3. **Graph Validation Rules**: `validateLinkGraph()` enforces minimum relation counts per template, detects duplicate edges, self-links, non-indexable target links, hub-link cycles (via depth-first cycle detection), and **orphan routes** (routes with 0 inbound edges, excluding `home`).
4. **Texas State & Metro Topology**:
   - **Texas State Hub** (`/states/texas-sba-loans`) links to `financing` as its hub, `how_it_works` as next step, and contextual links to national products, articles, sibling state pages, and all 10 Texas metro child pages.
   - **10 Texas Metro Pages** (`/metros/<city>-sba-loans`) link to `texas_sba_loans` as their hub, `how_it_works` as next step, and contextual links to relevant product pages, use-cases/industries, practical articles, and sibling Texas metro pages.
   - **Zero-Orphan Guarantee**: Adding all 10 metro content IDs to the Texas state page's `relatedIds` array, plus cross-linking from `financing.json`, `resources.json`, existing state pages (`california`, `florida`, `new_york`), industry pages (`trucking`, `construction`, `franchise`), and sibling metros guarantees that every new page receives 2–5+ inbound edges.

---

## 2. Link Graph System Architecture

The internal link graph system consists of three core components:

### A. Link Extraction & Module Building (`src/lib/link-graph.js`)
For each canonical indexable route, `getLinkModuleForRoute(routeId)` constructs three link groups:
- **`hub`**: Navigation upward to the topical parent hub.
  - `home` -> `null`
  - `editorial_article` (`resources_article`) -> `resources`
  - `product_page`, `use_case_page`, `industry_page`, `state_page` -> `financing`
  - `financing`, `resources`, `about`, `how_it_works`, `legal`, `contact` -> `home`
- **`contextual`**: Topical cross-links extracted from structured JSON fields.
- **`next`**: Conversion funnel / process next step.
  - Money pages (`product_page`, `use_case_page`, `industry_page`, `state_page`, `financing`) -> `how_it_works`
  - Information pages (`resources`, `article`) -> `financing`

### B. Validation Rules (`validateLinkGraph`)
The graph validator checks the following constraints:
1. **Duplicate Edges**: `sourceRouteId:targetRouteId:relation` must be unique across the entire graph.
2. **Self-Links**: `sourceRouteId !== targetRouteId`.
3. **Indexable Targets**: Every target route must exist in `routeManifest` and have `crawl.canonical === true && crawl.indexable === true`.
4. **Minimum Link Requirements**:
   - `home`: `{ hub: 0, contextual: 4, next: 1 }`
   - `product_page`: `{ hub: 1, contextual: 3, next: 1 }`
   - `use_case_page`: `{ hub: 1, contextual: 4, next: 1 }`
   - `industry_page`: `{ hub: 1, contextual: 5, next: 1 }`
   - `state_page`: `{ hub: 1, contextual: 6, next: 1 }`
   - `resources_hub`: `{ hub: 1, contextual: 4, next: 1 }`
   - `editorial_article`: `{ hub: 1, contextual: 3, next: 1 }`
   - `financing`: `{ hub: 1, contextual: 4, next: 1 }`
   - Fallback: `{ hub: 1, contextual: 2, next: 1 }`
5. **Orphan Checks**: Every indexable route must have `inboundCount > 0`. Only `home` is in `exemptOrphanRouteIds`.
6. **Hub Cycle Detection**: `detectHubCycles()` performs depth-first traversal on `hub` relation edges. Any cycle (e.g. `A -> B -> A`) raises a validation error.

### C. Build & Validation Automation (`build-link-graph.mjs` & `validate-content.mjs`)
- `scripts/build-link-graph.mjs`: Runs `validateLinkGraph()`. If errors exist, prints error messages and exits with status 1. Otherwise writes `docs/link-graph.md`.
- `scripts/validate-content.mjs`: Invokes `validateLinkGraph()` at the end of structured content validation. `npm run validate:content` fails if any orphan or link graph defect exists.

---

## 3. Structured Content Link Definitions (`content/**/*.json`)

Internal links are declared declaratively inside content JSON files using specific schema arrays:

| Field Name | Item Format | Resolution Method in `link-graph.js` |
| --- | --- | --- |
| `relatedIds` | Array of content IDs (`"page_sba_7a"`, `"state_california_sba_loans"`) | `resolveContentRouteId(contentId)` -> `routeId` |
| `articleIds` | Array of content IDs | `resolveContentRouteId(contentId)` -> `routeId` |
| `productCardIds` | Array of content IDs | `resolveContentRouteId(contentId)` -> `routeId` |
| `matrixRows` | Array of objects with `.destinationRouteId` | `.destinationRouteId` used directly |
| `decisionCards` | Array of objects with `.destinationRouteId` | `.destinationRouteId` used directly |
| `bestFitProducts` | Array of objects with `.routeId` | `.routeId` used directly |
| `alternativePaths` | Array of objects with `.routeId` | `.routeId` used directly |
| `stateSupportCards` | Array of objects with `.relatedRouteId` | `.relatedRouteId` used directly |
| `stateContextCards` | Array of objects with `.relatedRouteId` | `.relatedRouteId` used directly |

---

## 4. Texas State & Metro Expansion Linking Strategy (F44-CONT-07)

To launch the **Texas State Page (`texas_sba_loans`)** and **10 Texas Metro Pages** with zero orphans and strong topical clusters, follow this cross-linking topology:

### A. Routes to Add (11 New Indexable Canonical Routes):
1. `/states/texas-sba-loans` (`texas_sba_loans` / `state_texas_sba_loans`)
2. `/metros/houston-sba-loans` (`houston_sba_loans` / `metro_houston_sba_loans`)
3. `/metros/dallas-sba-loans` (`dallas_sba_loans` / `metro_dallas_sba_loans`)
4. `/metros/austin-sba-loans` (`austin_sba_loans` / `metro_austin_sba_loans`)
5. `/metros/san-antonio-sba-loans` (`san_antonio_sba_loans` / `metro_san_antonio_sba_loans`)
6. `/metros/fort-worth-sba-loans` (`fort_worth_sba_loans` / `metro_fort_worth_sba_loans`)
7. `/metros/el-paso-sba-loans` (`el_paso_sba_loans` / `metro_el_paso_sba_loans`)
8. `/metros/arlington-sba-loans` (`arlington_sba_loans` / `metro_arlington_sba_loans`)
9. `/metros/corpus-christi-sba-loans` (`corpus_christi_sba_loans` / `metro_corpus_christi_sba_loans`)
10. `/metros/plano-sba-loans` (`plano_sba_loans` / `metro_plano_sba_loans`)
11. `/metros/laredo-sba-loans` (`laredo_sba_loans` / `metro_laredo_sba_loans`)

### B. Outbound and Inbound Connectivity Plan:

```
[Financing Hub /financing] <---> [Texas State Hub /states/texas-sba-loans]
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
 [Houston Metro]                   [Dallas Metro]                    [Austin Metro]
  - Sibling: San Antonio, Corpus    - Sibling: Fort Worth, Plano      - Sibling: San Antonio, Dallas
  - Industry: Construction          - Industry: Trucking, Franchise   - Industry: Construction
  - Outbound: SBA 7(a), 504         - Outbound: 7(a), Acquisition     - Outbound: 7(a), Working Cap
        |                                 |                                 |
 [San Antonio Metro]               [Fort Worth Metro]               [San Antonio Metro]
        |                                 |                                 |
 [Corpus Christi Metro]            [Arlington & Plano Metros]        [El Paso & Laredo Metros]
```

#### Detailed Inbound Links Matrix (Guaranteeing Zero Orphans):
- **Texas State Hub (`texas_sba_loans`)**:
  - Inbound from: `financing`, `resources`, `california_sba_loans`, `florida_sba_loans`, `new_york_sba_loans`, and all 10 Texas Metro pages (via hub edge).
  - Outbound to: `financing` (hub), `how_it_works` (next), national products (`sba_7a`, `sba_504`, `business_acquisition`), articles (`resource_preparing_documents`, `resource_sba_7a_vs_504`), sibling state pages, and all 10 Texas Metro content IDs in `relatedIds`.
- **Houston (`houston_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `construction_contractors`, `dallas_sba_loans`, `san_antonio_sba_loans`.
- **Dallas (`dallas_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `trucking_companies`, `buy_a_business`, `fort_worth_sba_loans`, `plano_sba_loans`.
- **Austin (`austin_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `construction_contractors`, `san_antonio_sba_loans`, `dallas_sba_loans`.
- **San Antonio (`san_antonio_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `austin_sba_loans`, `houston_sba_loans`, `corpus_christi_sba_loans`.
- **Fort Worth (`fort_worth_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `dallas_sba_loans`, `arlington_sba_loans`.
- **El Paso (`el_paso_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `laredo_sba_loans`, `san_antonio_sba_loans`.
- **Arlington (`arlington_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `fort_worth_sba_loans`, `dallas_sba_loans`, `franchise_businesses`.
- **Corpus Christi (`corpus_christi_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `san_antonio_sba_loans`, `houston_sba_loans`.
- **Plano (`plano_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `dallas_sba_loans`, `franchise_businesses`.
- **Laredo (`laredo_sba_loans`)**:
  - Inbound from: `texas_sba_loans`, `trucking_companies`, `el_paso_sba_loans`, `san_antonio_sba_loans`.

---

## 5. Codebase Modifications Required

To implement the Texas metro expansion and update the link graph:

1. **`src/lib/link-graph.js`**:
   - Update `getHubRouteId(route)`:
     ```javascript
     if (route.templateId === 'state_page') return 'financing';
     if (route.templateId === 'metro_page') return route.parentRouteId || 'texas_sba_loans';
     ```
   - Update `getNextStepRouteId(route)`:
     ```javascript
     if (route.templateId === 'metro_page') return 'how_it_works';
     ```
   - Update `getMinimumRequirements(route)`:
     ```javascript
     if (route.templateId === 'metro_page') {
       return { hub: 1, contextual: 4, next: 1 };
     }
     ```
   - Ensure `getStructuredContextualRouteIds(route)` handles `metroSupportCards` and `metroContextCards` if defined on metro JSON files.

2. **`content/manifest.mjs`**:
   - Add route entry for `texas_sba_loans` under state routes.
   - Add 10 route entries for Texas metro routes (`houston_sba_loans`, `dallas_sba_loans`, etc.).
   - Add Texas state and metro routes to `navigation.primary` / `navigation.mobile` / `navigation.footer` as appropriate.

3. **`content/pages/financing.json` & `content/pages/resources.json`**:
   - Append `"state_texas_sba_loans"` to `relatedIds`.

4. **`content/states/california.json`, `florida.json`, `new_york.json`**:
   - Append `"state_texas_sba_loans"` to `relatedIds`.

5. **`content/industries/*.json` & `content/use-cases/*.json`**:
   - Add relevant Texas metro content IDs to `relatedIds` in `trucking-companies.json`, `construction-contractors.json`, `franchise-businesses.json`, and `buy-a-business.json`.

6. **Content JSON Files**:
   - Create `content/states/texas.json` conforming to `state_page` template contract.
   - Create 10 files in `content/metros/*.json` (e.g. `houston.json`, `dallas.json`, etc.) conforming to `metro_page` or `state_page` template contract.

---

## 6. Verification Method & Commands

To independently verify the link graph and content integrity after implementation:

```bash
# 1. Validate structured content schemas and link graph rules
npm run validate:content

# 2. Build internal link graph markdown documentation
npm run build:link-graph

# 3. Run link graph test suite
npx node --test tests/link-graph.test.mjs

# 4. Verify prerender and clean path generation
npm run build
npm run validate:prerender
```

### Invalidation Conditions:
- `validateLinkGraph()` reports any error (orphan route, hub cycle, self-link, non-indexable link, or below minimum requirement).
- `docs/link-graph.md` shows `Orphans detected > 0`.
- Any missing route ID or content ID in `content/manifest.mjs` or `content/states/texas.json`.
