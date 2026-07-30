# Original User Request

## 2026-07-30T02:53:46Z

Execute a three-phase project roadmap: (1) expand into all major and medium Texas metro markets (F44-CONT-07), (2) draft realistic mock legal and compliance documents to unblock F44-GOV-02, and (3) perform an automated content and link-graph audit across all content JSON files. 

Working directory: /Users/mattlilly/Documents/Projects/fund44-redesign
Integrity mode: development

## Requirements

### R1. Texas Metro Expansion (F44-CONT-07)
Add new metro pages for all large and medium cities in Texas (e.g., Houston, San Antonio, Dallas, Austin, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo). Define the required JSON content for each, update the content manifest and schema, insert citations for the respective local Texas SBA district offices and SBDC branches, and ensure the routing can render the new pages.

### R2. Legal Mocks (F44-GOV-02)
Draft realistic mock privacy, terms, and consent policies to replace the current placeholders and unblock task F44-GOV-02. You must update the relevant content JSON files or JS configuration where the legal copy is injected.

### R3. Content & Link Graph Audit
Analyze all current content JSON files, tighten the copy for SEO, and automatically identify and insert optimal internal cross-links (e.g. related IDs or inline citations). Modify the files in-place and ensure no orphans remain.

### R4. Roadmap Execution & Status Updates
For all three phases, you must fully execute the work, run the test suites to ensure correctness, and update `ROADMAP.md` (checking the boxes, updating statuses to "done", and appending to the changelog).

## Acceptance Criteria

### Execution & Verification
- [ ] Metro Expansion: `npm run validate:content`, `npm run validate:routes`, and `npm run validate:citations` pass after adding the Texas metro cities.
- [ ] Legal Mocks: `npm run validate:legal` passes without hitting placeholder or draft flags.
- [ ] Content Audit: `npm run build:link-graph` passes with 0 orphans and updated cross-links.
- [ ] Roadmap: The changelog in `ROADMAP.md` is updated with three new rows (one for each task), and their statuses are set to `done`.
- [ ] Release Gates: The full release suite (`npm run qa:release`) passes successfully at the end of the run.

## 2026-07-30T02:30:11Z

Resumed session:
- Texas Metro Expansion (F44-CONT-07) and Legal Mocks (F44-GOV-02) code implementation and unit tests are complete in the codebase.
- `npm run qa:release` failed on `validate:performance` because performance budgets in `scripts/validate-performance-budgets.mjs` were exceeded due to the new 10 Texas metro pages and legal content (bundle_js_max_bytes, html_per_page_max_bytes, etc.).
- Content & Link Graph Audit (Phase 4), performance budget updates/optimizations, and complete Release Verification (Phase 5) must be finalized.
- Dispatch worker/reviewer subagents to update performance budgets / optimize build assets, execute Content & Link Graph Audit, ensure zero orphans, and run `npm run qa:release` until ALL release gates pass cleanly.
- Ensure `ROADMAP.md` checkboxes, statuses ("done"), and changelog rows are updated for all three tasks (F44-CONT-07, F44-GOV-02, and Content Audit / F44-SEO-05 / F44-CONT-07).
- Report completion to Sentinel when all release gates pass cleanly.

