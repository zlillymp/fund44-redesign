# Master Execution Plan — Fund44 Redesign Roadmap Execution

## Objectives
1. **Texas Metro Expansion (F44-CONT-07)**:
   - Add new metro pages for 10 Texas cities: Houston, San Antonio, Dallas, Austin, Fort Worth, El Paso, Arlington, Corpus Christi, Plano, Laredo.
   - Define JSON content in `content/metros/*.json` (or appropriate path matching schema).
   - Update content manifest, route manifest, schema definitions as needed.
   - Add citations for local Texas SBA district offices & SBDC branches.
   - Verify routing, prerendering, link graph, and content validation.

2. **Legal Mocks (F44-GOV-02)**:
   - Draft realistic mock privacy, terms, and consent policies replacing placeholders.
   - Update content JSON / JS configurations (`src/lib/legal.js`, `src/pages/legal.js`, etc.).
   - Ensure compliant messaging and legal validation script (`validate:legal`) passes.

3. **Content & Link Graph Audit**:
   - Analyze content JSON files for SEO quality.
   - Insert internal cross-links across financing, use-case, industry, state, and new metro pages.
   - Run `build:link-graph` and ensure no orphan pages exist.

4. **Roadmap & Changelog Updates**:
   - Follow `AGENTS.md` protocol: update `ROADMAP.md` task statuses to `done` and check boxes (`[x]`).
   - Append detailed Change Log rows with date, task ID, summary, evidence, and PR/commit ref.

5. **Final Release Gate Verification**:
   - Run full release test suite: `npm run qa:release` (and sub-validators: `validate:content`, `validate:routes`, `validate:citations`, `validate:legal`, `build:link-graph`, `report:freshness`).

## Milestones & Execution Strategy

- **Milestone 1: Discovery & Exploration**:
  - Spawn Explorer to analyze content schemas, routing manifests, legal module structure, citations format, link graph requirements, and test suites.

- **Milestone 2: Texas Metro Expansion (F44-CONT-07)**:
  - Claim `F44-CONT-07` in `ROADMAP.md`.
  - Workers build JSON content for the 10 Texas cities, citations, manifest entries, routes, and renderers.
  - Reviewer & Challenger verify content quality, citations, link graph, and prerender.

- **Milestone 3: Legal Mocks (F44-GOV-02)**:
  - Claim `F44-GOV-02` in `ROADMAP.md`.
  - Workers update legal content JSON/JS, privacy, terms, consent policies, replacing preview placeholders.
  - Reviewer & Auditor verify compliance and `validate:legal`.

- **Milestone 4: Content & Link Graph Audit**:
  - Workers analyze all content files, enhance SEO copy, insert cross-links to ensure strong graph connectivity.
  - Run link graph build and orphan checks (`npm run build:link-graph`).

- **Milestone 5: Roadmap Update & Final Verification (Release Gates)**:
  - Workers update `ROADMAP.md` checking boxes, status lines, and appending changelog rows.
  - Run full release gates (`npm run qa:release`).
  - Forensic Auditor runs integrity checks.
