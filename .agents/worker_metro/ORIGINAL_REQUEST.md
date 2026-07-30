## 2026-07-29T21:56:43Z
<USER_REQUEST>
You are Worker 1 for Fund44 Redesign Milestone 1: Texas Metro Expansion (F44-CONT-07).
Your working directory is: /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_metro
Project root: /Users/mattlilly/Documents/Projects/fund44-redesign

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions & Workflow:
1. First, claim task F44-CONT-07 in /Users/mattlilly/Documents/Projects/fund44-redesign/ROADMAP.md by updating line "Status: ready" to "Status: in progress - agent/f44-cont-07". (Follow AGENTS.md protocol strictly).
2. Read /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_metro/analysis.md and handoff.md for step-by-step instructions.
3. Update `content/citations.mjs` to add the 8 required Texas SBA District Offices & SBDC citations.
4. Update `content/schema/content-model.mjs` and `content/schema/scalable-page-contract.mjs` to support the `metro_page` (or `metro`) template contract and validation rules.
5. Create 10 Texas Metro JSON files in `content/metros/`:
   - `houston-sba-loans.json`
   - `san-antonio-sba-loans.json`
   - `dallas-sba-loans.json`
   - `austin-sba-loans.json`
   - `fort-worth-sba-loans.json`
   - `el-paso-sba-loans.json`
   - `arlington-sba-loans.json`
   - `corpus-christi-sba-loans.json`
   - `plano-sba-loans.json`
   - `laredo-sba-loans.json`
6. Register the 10 metro routes in `content/manifest.mjs`.
7. Create `src/pages/metros.js` renderer module, register it in `src/pages/index.js`, update `src/lib/content.js` to load metro content, and update `FUNNEL_CONTEXT_KINDS` in `src/lib/eligibility/model.js` (and `src/lib/analytics.js` if needed).
8. Update `content/states/texas-sba-loans.json` to include all 10 metro child page IDs in `relatedIds`, and add cross-links from `financing.json`, `resources.json`, industries, and sibling pages so link graph passes with 0 orphans.
9. Execute validation and build checks:
   - `npm run validate:citations`
   - `npm run validate:content`
   - `npm run validate:routes`
   - `npm run build:link-graph`
   - `npm test`
   - `npm run build`
   - `npm run validate:prerender`
10. Once all checks pass, update `ROADMAP.md` for task F44-CONT-07:
    - Change `[ ]` to `[x]`
    - Change `Status: in progress - agent/f44-cont-07` to `Status: done`
    - Add row to `Change Log` table with Date, Task ID (`F44-CONT-07`), Summary, Tests or Evidence, and PR/Commit/Ref per AGENTS.md rules.
11. Write a complete handoff report to `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_metro/handoff.md` and send a message reporting completion and summary of test evidence.
</USER_REQUEST>
