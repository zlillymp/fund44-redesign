## 2026-07-30T07:31:02Z
You are Worker Final Release (teamwork_preview_worker).
Your working directory is /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_final_release
Your project root is /Users/mattlilly/Documents/Projects/fund44-redesign

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
Finalize Content & Link Graph Audit, update performance budgets in scripts/validate-performance-budgets.mjs to fit the 10 new Texas metro pages and legal content, run npm run qa:release until all release gates pass cleanly, and update ROADMAP.md task statuses, checkboxes, and changelog entries.

STEPS TO EXECUTE:
1. Content & Link Graph Audit:
   - Run `npm run build:link-graph` to build and validate the link graph.
   - Ensure all content files (including content/metros/*.json, state, financing, industry, use-case, and article files) are properly integrated with zero orphans.

2. Performance Budget Adjustments:
   - Run `npm run build` and `npm run validate:performance`.
   - Inspect dist asset sizes and identify which budget parameters (bundle_js_max_bytes, html_per_page_max_bytes, asset_total_max_bytes, etc.) were exceeded by the addition of 10 Texas metro pages and realistic legal content.
   - Update `scripts/validate-performance-budgets.mjs` with realistic, evidence-backed maxBytes ceilings and clear rationales reflecting the expanded route inventory and legal content.
   - Update any tests or scripts referencing performance budgets if needed.

3. Full Release Verification:
   - Execute each validation command to verify standalone components:
     * `npm run validate:content`
     * `npm run validate:routes`
     * `npm run validate:citations`
     * `npm run validate:legal`
     * `npm run validate:crawl`
     * `npm run validate:prerender`
     * `npm run validate:performance`
     * `npm run build:link-graph`
     * `npm test`
   - Execute `npm run qa:release` and verify that ALL release gates, validators, node tests, build, prerender, broken link, performance budget, and Playwright browser smoke tests pass cleanly with 0 errors.

4. ROADMAP.md & AGENTS.md Compliance:
   - Check `ROADMAP.md` for F44-CONT-07, F44-GOV-02, and Content Audit / F44-SEO-05.
   - Ensure checkboxes are `[x]`, `Status: done`, and new Change Log rows are appended with exact dates, task IDs, summaries, tests/evidence output, and refs (`branch:agent/f44-release`).

5. Output:
   - Write a detailed handoff report to `.agents/worker_final_release/handoff.md` summarizing all actions taken, verification command outputs, and file changes.
   - Send your handoff report to parent using send_message.
