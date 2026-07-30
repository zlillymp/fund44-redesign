## 2026-07-29T22:04:45Z
<USER_REQUEST>
You are Worker 2 for Fund44 Redesign Milestone 2: Legal Mocks (F44-GOV-02).
Your working directory is: /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_legal
Project root: /Users/mattlilly/Documents/Projects/fund44-redesign

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions & Workflow:
1. First, claim task F44-GOV-02 in /Users/mattlilly/Documents/Projects/fund44-redesign/ROADMAP.md by updating line "Status: blocked - ..." to "Status: in progress - agent/f44-gov-02". (Follow AGENTS.md protocol strictly).
2. Read /Users/mattlilly/Documents/Projects/fund44-redesign/.agents/explorer_legal/analysis.md and handoff.md for step-by-step instructions.
3. Update `src/lib/legal.js`, `src/pages/legal.js`, `src/lib/eligibility/model.js`, `src/components/flow.js`, `docs/disclosures.md`, `docs/claims-register.md`, and `docs/legal-launch-checklist.md`.
4. Draft comprehensive, realistic mock Privacy Policy, Terms of Service, and Intake Consent policies replacing draft/placeholder banners.
5. Strictly adhere to legal validation requirements in `scripts/validate-legal.mjs`:
   - Avoid all 13 blocked pattern regexes (e.g. "75+ lenders", "Lendflow", "takes a few minutes", "ranked by fit", "secure flow").
   - Maintain verified business entity details (`Fund44 LLC`, 5900 Balcones Dr, Austin TX 78731, support@fund44.com, 512-547-1547).
   - Keep `sameAs: []`.
   - Preserve staging `noindex,nofollow` posture (`indexingPolicy.allowIndexing = false`).
6. Run validation and build checks:
   - `npm run validate:legal`
   - `npm test`
   - `npm run build`
   - `npm run validate:prerender`
7. Once all checks pass, update `ROADMAP.md` for task F44-GOV-02:
   - Change `[ ]` to `[x]`
   - Change `Status: in progress - agent/f44-gov-02` to `Status: done`
   - Add row to `Change Log` table with Date, Task ID (`F44-GOV-02`), Summary, Tests or Evidence, and PR/Commit/Ref per AGENTS.md rules.
8. Write a complete handoff report to `/Users/mattlilly/Documents/Projects/fund44-redesign/.agents/worker_legal/handoff.md` and send a message reporting completion and test evidence.
</USER_REQUEST>
