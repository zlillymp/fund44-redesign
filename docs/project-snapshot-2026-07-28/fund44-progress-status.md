# Fund44 Project Status

Updated: July 27, 2026

This is the plain-English handoff for the Fund44 redesign. Future agents should still use `ROADMAP.md` in the repository as the task ledger and follow `AGENTS.md` before claiming work.

## Execution delegation checkpoint — July 27, 2026

Matt moved active implementation from Perplexity to a fresh Cursor/Claude Code session to reduce token usage and cost. Perplexity's role is now independent reviewer and completion auditor unless Matt explicitly asks it to implement work.

### Files provided to Claude Code

- `CLAUDE.md` was added to the local repository root as the persistent operating brief.
- `EXECUTION_CHECKLIST.md` was added to the local repository root as the prioritized, acceptance-tested work queue.
- Both files are currently untracked additions in `/Users/mattlilly/Projects/fund44-redesign`; no product source files were changed by Perplexity.
- The local checkout was clean on `main` and aligned with `origin/main` immediately before the handoff files were added.

### Assignment given to Claude Code

Claude Code should read `CLAUDE.md`, then execute `EXECUTION_CHECKLIST.md` in dependency and conversion-impact order. It may use parallel agents only for isolated work with non-overlapping files and must:

- inspect the actual repository before trusting older status claims;
- preserve the `F44-GOV-02` launch/indexing gate and never bypass missing legal, contact, consent, backend, or approval inputs;
- keep live submissions and production indexing blocked until their explicit gates are satisfied;
- keep analytics privacy-safe and free of PII;
- run the repository's verified validation commands after each bounded change;
- record changed files, commands, results, unresolved blockers, and manual checks at every handoff;
- avoid deployments, secret changes, destructive actions, or external writes without Matt's approval.

### Verified starting state for the delegated run

- `npm ci` passed.
- `npm test` passed all 79 tests.
- `npm run build` passed and generated 30 routes plus the 404 page.
- All nine pre-build validators passed.
- `validate:prerender`, link validation, performance validation, and route smoke checks passed.
- Playwright browser suites were not executed because Chromium binaries were absent. The delegated agent should run `npx playwright install --with-deps chromium` before relying on accessibility, geometry, screenshot, or release-smoke results.
- The previously reported disclosure-layout and modal semantics/interaction defects appear fixed in current source and tests. Claude should verify them visually and add regression coverage rather than blindly reimplementing them.
- Confirmed unresolved items include borrower-facing removal of internal jargon, a missing `/og-image.png`, missing production security headers, absent lint/typecheck tooling, stale `HANDOFF.md` routing details, and external governance/backend/host inputs.

### Perplexity review procedure when Matt returns

Perplexity should compare the resulting branch or commit against this checkpoint and the repository's `CLAUDE.md` and `EXECUTION_CHECKLIST.md`. The review must:

1. inspect the final Git diff and map every change to a checklist item;
2. verify that Claude did not weaken legal, indexing, privacy, consent, or live-submission gates;
3. rerun installation, tests, build, validators, and Playwright suites where supported;
4. manually inspect representative desktop and mobile routes, disclosure geometry, modal stacking/focus behavior, forms, SEO metadata, structured data, crawl files, analytics payloads, and 404 behavior;
5. distinguish completed work from claims that lack test or visual evidence;
6. identify regressions, skipped acceptance criteria, stale documentation, and remaining external blockers;
7. provide Matt with an approve/request-changes recommendation and a concise remaining-work list.

## Current position

- 28 pull requests have been merged into the redesign repository.
- The reviewed build is based on commit `c85c24f7276df2ec0dd52674b186be487627ee2f`.
- The staging build generates 30 canonical pages plus a dedicated 404 page.
- Staging intentionally remains `noindex,nofollow`.
- The site has a strong visual foundation, clear conversion hierarchy, structured content, and a scalable organic-search architecture.
- The site is not ready for a public production launch because the primary preview flow is broken and final legal/contact inputs are missing.

## Completed

### Project operating system

- [x] Created the durable roadmap with stable task IDs, dependencies, acceptance criteria, and release gates.
- [x] Created the agent protocol for claiming tasks, avoiding collisions, recording evidence, and handing off unfinished work.
- [x] Created the measurement plan and dashboard specification.
- [x] Defined the north-star metric as qualified financing journeys.
- [x] Established a privacy-safe event vocabulary that excludes personally identifiable information.

### Brand, claims, and messaging

- [x] Centralized approved claims and disclosures.
- [x] Added the Fund44 origin story: the network launched with 44 lenders.
- [x] Added approved language explaining that the curated network usually fluctuates between 40 and 50 lenders.
- [x] Added the policy that lenders may be removed for failing customer-service standards.
- [x] Added the policy that new lenders may be introduced when they offer competitive terms, better tools, or new financing options.
- [x] Added the “fit over fees” positioning.
- [x] Added conservative marketplace, not-a-lender, no-guarantee, timing, credit, and preview-only disclosures.

### Site architecture and SEO foundation

- [x] Replaced fragment/hash routing with clean URLs.
- [x] Created one route and content manifest for navigation, breadcrumbs, CTAs, canonicals, crawl files, and analytics attribution.
- [x] Moved core page and article copy into structured content files.
- [x] Added prerendering so page copy and metadata exist in the initial HTML.
- [x] Added route-specific titles, descriptions, canonicals, Open Graph metadata, and structured data.
- [x] Generated sitemap, robots, `llms.txt`, and route-attribution data from the same source.
- [x] Added a citation registry and automated citation validation.
- [x] Added an internal-link graph with orphan-page checks.
- [x] Added scalable content templates and content-quality gates.
- [x] Added national financing pages, use-case pages, industry pages, and state pages.
- [x] Current generated inventory contains 30 sitemap entries, 27 LLM entries, and 30 attribution routes.

### Conversion experience

- [x] Simplified navigation and established a clear primary CTA.
- [x] Built explicit preview and live eligibility modes.
- [x] Defined qualified, manual-review, and not-fit outcomes.
- [x] Preserved route and CTA context as users enter the funnel.
- [x] Added safe blocking for live submissions until legal, consent, and backend requirements are complete.
- [x] Added restart/resume handling and preview-only disclosure language.
- [x] Added FAQ, mobile navigation, theme switching, and responsive page layouts.

### Analytics and quality controls

- [x] Implemented vendor-neutral page, content, navigation, CTA, disclosure, trust, FAQ, 404, eligibility, outcome, and error events.
- [x] Added privacy-safe session and attribution handling.
- [x] Added analytics validation that rejects unknown events, properties, and PII-shaped payloads.
- [x] Added CI and release-readiness automation.
- [x] Added route, content, citation, legal, crawl, design-token, analytics, accessibility, mobile, prerender, broken-link, performance-budget, and release-smoke checks.
- [x] Added semantic design tokens and documented component governance.
- [x] Verified that the current production build completes successfully.

## Confirmed current-site defects

These must be fixed before launch.

- [ ] **Fix the shared disclosure component.** The information icon expands to nearly the full card width while the disclosure text collapses to zero width and renders one character per line.
- [ ] **Remove the resulting excess page height.** The broken component adds roughly 4,500 to 5,100 pixels of unusable vertical space on affected pages.
- [ ] **Fix every route using the disclosure component.** The issue was reproduced on the homepage and SBA pages at desktop and mobile widths.
- [ ] **Fix the funding-preview modal stacking.** Clicking the primary CTA displays a mostly blank panel while the real questions and choices remain behind it.
- [ ] **Restore modal interaction.** Modal choices and dismissal controls must be visibly and physically clickable.
- [ ] **Correct modal accessibility.** Add correct dialog semantics, move focus into the modal, trap focus, support Escape, and restore focus on close.
- [ ] **Add regression coverage for both defects.** Existing automated checks passed despite these visible failures, so the release suite needs screenshot or geometry assertions for these shared components.

## External launch blockers

These require verified business, legal, privacy, or operational input.

- [ ] Confirm the legal business name.
- [ ] Confirm the mailing address.
- [ ] Confirm the support email.
- [ ] Confirm the support phone number.
- [ ] Approve final privacy, terms, consent, sharing, retention, and user-rights language.
- [ ] Approve verified entity and `sameAs` references.
- [ ] Approve production indexing.
- [ ] Finalize security statements and deployment-security review.
- [ ] Provide verified trust assets such as testimonials, outcomes, partner proof, reviews, or other supportable evidence.
- [ ] Select and connect the live submission/backend/provider workflow.
- [ ] Define final lender handoff, consent, error, retry, and monitoring behavior.

## Customer-facing cleanup

- [ ] Remove internal ticket references such as `F44-GOV-02` from public pages.
- [ ] Remove customer-visible phrases such as “governance draft,” “production-noindex-blocked,” and “controlled TBD state.”
- [ ] Replace “Hub page,” “Related routes,” “Next step,” and “canonical program page” with natural borrower-facing language.
- [ ] Review page length after the disclosure defect is fixed and remove repetitive sections where they do not help conversion or search intent.
- [ ] Add approved trust proof closer to the first conversion decision.
- [ ] Complete final copyediting for consistency, clarity, and avoidance of internal implementation terminology.

## Remaining roadmap work

- [ ] `F44-GOV-02`: complete the external legal, identity, contact, consent, retention, entity, and indexing approvals.
- [ ] `F44-SEO-03`: finish verified entity, trust, logo, Open Graph, and page-type schema coverage after governance inputs are approved.
- [ ] `F44-TRUST-01`: build evidence-backed trust modules and remove placeholders.
- [ ] `F44-SEC-01`: add and verify deployment security headers, policies, rendering safety, and consent controls.
- [ ] `F44-CONT-06`: add freshness ownership, review dates, triggers, and stale-content reporting.
- [ ] `F44-CNV-02`: build contextual product funnels that preserve page and borrower intent.
- [ ] `F44-QA-02`: expand regression testing across templates, trust modules, disclosure components, modal states, and funnel variants.
- [ ] `F44-EXP-01`: build the experimentation framework with exposure tracking, kill switches, and guardrail metrics.
- [ ] `F44-EXP-02`: run controlled experiments only after the framework, contextual funnels, and regression coverage are complete.
- [ ] `F44-CONT-07`: consider metro and broader programmatic expansion only after quality, freshness, and query-evidence gates are operating.

## Experiment-framework status

- [ ] `F44-EXP-01` has not been completed.
- [ ] The Codex agent assigned to build the experiment framework failed without producing output.
- [ ] No work from that failed agent should be treated as implemented, tested, or ready to merge.
- [ ] Resume this task only after the two conversion-blocking visual defects are fixed or explicitly deprioritized.

## Recommended execution order

1. Fix the shared disclosure component.
2. Fix the funding-preview modal and its accessibility behavior.
3. Add regression tests that reproduce both failures.
4. Resolve legal identity, contact, privacy, consent, entity, and indexing inputs.
5. Replace internal staging and roadmap language on customer-facing pages.
6. Add verified trust assets and trust modules.
7. Complete deployment security and the real submission integration.
8. Run full desktop, mobile, keyboard, accessibility, route, metadata, and production-header QA.
9. Approve production indexing and launch.
10. Resume the experimentation framework, contextual funnels, and controlled optimization.

## Instructions for the next agent

- Read `ROADMAP.md` and `AGENTS.md` before doing anything.
- Work on one task ID at a time.
- Do not mark a task complete without tests or visual evidence.
- Treat the disclosure and modal defects as launch blockers.
- Do not enable indexing or live submissions while `F44-GOV-02` remains incomplete.
- Do not invent legal details, contact information, testimonials, lender outcomes, rates, or partner claims.
- Record every handoff, test result, pull request, and newly discovered blocker in the roadmap changelog.
