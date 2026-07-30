# Explorer 3 Handoff Report: Content & Link Graph Audit

**Task ID**: Milestone 3 Content & Link Graph Audit / `F44-SEO-05` & `F44-CONT-07`  
**Agent**: Explorer 3 (`explorer_linkgraph`)  
**Working Directory**: `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_linkgraph`  
**Date**: 2026-07-30  

---

## 1. Observation

1. **Link Graph Infrastructure (`src/lib/link-graph.js`)**:
   - `getHubRouteId(route)` maps routes to parent hubs: `product_page`, `use_case_page`, `industry_page`, `state_page` map to `'financing'` (lines 60-63). `editorial_article` maps to `'resources'` (line 59).
   - `getNextStepRouteId(route)` maps money pages to `'how_it_works'` (lines 72-76) and info pages to `'financing'` (line 78).
   - `getMinimumRequirements(route)` sets link thresholds per template: `product_page` `{hub:1, contextual:3, next:1}`, `use_case_page` `{hub:1, contextual:4, next:1}`, `industry_page` `{hub:1, contextual:5, next:1}`, `state_page` `{hub:1, contextual:6, next:1}` (lines 81-107).
   - `getStructuredContextualRouteIds(route)` extracts target route IDs from 9 structured content fields: `relatedIds`, `articleIds`, `productCardIds`, `matrixRows`, `decisionCards`, `bestFitProducts`, `alternativePaths`, `stateSupportCards`, `stateContextCards` (lines 109-160).
   - `validateLinkGraph(graph)` checks for duplicate edges, self-links, non-indexable target routes, relation counts below minimum, hub-link cycles via `detectHubCycles()`, and orphan routes with `inboundCount === 0` (excluding `home`) (lines 300-363).

2. **Validation Commands & Current Execution**:
   - `node scripts/build-link-graph.mjs` executed cleanly with stdout:
     `Built internal link graph.`  
     `routes: 30, hubLinks: 29, contextualLinks: 161, nextLinks: 30`
   - `docs/link-graph.md` generated with summary:
     `Indexable canonical routes: 30`, `Hub links: 29`, `Contextual links: 161`, `Next-step links: 30`, `Orphans detected: 0`.

3. **Content Schema & Route Manifest**:
   - `content/manifest.mjs` contains 30 indexable canonical routes plus `not_found`. Current states in manifest: `california_sba_loans`, `florida_sba_loans`, `new_york_sba_loans`.
   - Texas state page (`texas_sba_loans`) and 10 Texas metro pages (Houston, Dallas, Austin, San Antonio, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo) are planned under `F44-CONT-07` and `.agents/orchestrator/plan.md`.
   - `scripts/validate-content.mjs` line 391 calls `validateLinkGraph()`, automatically failing `npm run validate:content` if any orphan route or link graph defect exists.

---

## 2. Logic Chain

1. **Observation**: `validateLinkGraph()` fails if any indexable route has 0 inbound links or falls below minimum relation thresholds.
2. **Observation**: `scripts/validate-content.mjs` invokes `validateLinkGraph()`, meaning content validation depends directly on link graph integrity.
3. **Reasoning**: Adding 11 new canonical routes for Texas state and 10 Texas metros will immediately create 11 orphan routes unless inbound cross-links are added from existing hubs (`financing`, `resources`), state pages (`california`, `florida`, `new_york`), industry pages (`trucking`, `construction`, `franchise`), and sibling metro pages.
4. **Reasoning**: Updating `src/lib/link-graph.js` (`getHubRouteId`, `getNextStepRouteId`, `getMinimumRequirements`) to support `templateId === 'metro_page'` ensures new metro routes pass hub hierarchy and relation requirement checks.
5. **Conclusion**: A 5-phase cross-linking strategy (registering routes, updating link-graph functions, populating outbound links, establishing inbound links from state/hub/industry pages, and validating zero orphans) guarantees a 100% connected graph with strong topical clusters and zero validation errors.

---

## 3. Caveats

- **Content File Creation**: This explorer investigation is read-only. The actual JSON content creation for `content/states/texas.json` and 10 files in `content/metros/*.json` will be performed by implementer agents assigned to `F44-CONT-07`.
- **Legal Business Identity**: Contact details and author/reviewer fields in content JSON remain set to `"TBD under F44-GOV-02"` until final legal verification.

---

## 4. Conclusion

The Fund44 link graph architecture is robust, fully automated, and enforced at build time. To integrate Texas state and 10 Texas metro pages with 100% connectivity and zero orphans:
1. Update `src/lib/link-graph.js` to recognize `metro_page` template rules (`hub`: `texas_sba_loans`, `next`: `how_it_works`, `contextual`: >= 4).
2. Register the 11 new routes in `content/manifest.mjs`.
3. Add `"state_texas_sba_loans"` to `relatedIds` in `content/pages/financing.json`, `content/pages/resources.json`, and existing state files (`california.json`, `florida.json`, `new_york.json`).
4. Add all 10 Texas metro content IDs to `relatedIds` in `content/states/texas.json`.
5. Cross-link sibling Texas metros and relevant industry pages (`trucking_companies`, `construction_contractors`, `franchise_businesses`).
6. Run `npm run validate:content` and `npm run build:link-graph` to confirm 0 orphans and 0 errors.

---

## 5. Verification Method

### Verification Commands:
```bash
# 1. Validate all structured content records and link graph integrity
npm run validate:content

# 2. Rebuild link graph markdown report and check stdout table
node scripts/build-link-graph.mjs

# 3. Execute unit tests for link graph
npx node --test tests/link-graph.test.mjs

# 4. Verify release build and prerender outputs
npm run build
npm run validate:prerender
```

### Files to Inspect:
- `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_linkgraph/analysis.md`
- `docs/link-graph.md`
- `src/lib/link-graph.js`
- `content/manifest.mjs`

### Invalidation Conditions:
- `validateLinkGraph()` reports any orphan route (`inboundCount === 0`).
- `detectHubCycles()` detects a cycle among `hub` edges.
- `scripts/validate-content.mjs` exits with non-zero status.
