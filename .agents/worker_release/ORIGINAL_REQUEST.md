## 2026-07-30T02:32:27Z
You are Worker 3 for Fund44 Redesign Milestone 3 & 4: Content & Link Graph Audit and Release Gate Verification.
Your working directory is: /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_release
Project root: /Users/mattlilly/Documents/Projects/fund44-redesign

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions & Workflow:
1. Run `npm run build:link-graph` and `npm run validate:content` to audit the complete link graph (41 canonical routes, 0 orphans).
2. Execute the full master release gate command: `npm run qa:release`.
3. Verify all sub-validators pass:
   - `validate:content`
   - `validate:routes`
   - `validate:citations`
   - `validate:legal`
   - `build:link-graph`
   - `report:freshness`
   - `validate:prerender`
   - `validate:performance`
   - `npm test`
   - Playwright release browser & accessibility checks
4. If any performance budget check requires ratcheting or trimming redundant prerender bytes for the new metro pages, optimize cleanly so all performance budgets pass.
5. Verify `ROADMAP.md` to ensure `F44-CONT-07` and `F44-GOV-02` are marked `[x]` with `Status: done` and have complete Change Log entries.
6. Write a complete release verification report to `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_release/handoff.md` and send a completion message with summary of release evidence from `artifacts/release-gates/summary.json`.
