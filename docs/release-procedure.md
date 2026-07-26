# Fund44 Release Procedure

Release procedure and launch gate for roadmap task `F44-QA-01`. Updated on `2026-07-26`.

This document defines the repository-local release gate and the GitHub Actions workflow that must pass before a branch is considered release-ready. It does not authorize production launch on its own. `F44-GOV-02` remains a separate production blocker.

## Purpose

- Run one deterministic release gate locally and in CI.
- Catch regressions in structured content, routing, legal/indexing controls, crawl outputs, analytics instrumentation, design-token usage, prerendering, broken links, performance budgets, route smoke, and browser accessibility/mobile behavior.
- Catch stale or expired content/citation/governance freshness states before release.
- Produce actionable logs and artifacts instead of a pass/fail only result.

## Local release gate

Run these commands from the repo root:

```bash
npm ci
npm run validate:workflows
npm run qa:release
```

`npm run qa:release` executes this release sequence:

1. `npm run validate:citations`
2. `npm run validate:content`
3. `npm run validate:routes`
4. `npm run validate:legal`
5. `npm run validate:crawl`
6. `npm run validate:design`
7. `npm run validate:freshness`
8. `npm run validate:analytics`
9. `npm run validate:workflows`
10. `npm test`
11. `npm run build`
12. `npm run validate:prerender`
13. `npm run validate:links`
14. `npm run validate:performance`
15. `npm run smoke:routes`
16. `npm run test:a11y`
17. `npm run test:release`

## Release artifacts

Release-gate output is written to:

- `artifacts/release-gates/summary.json`
- `artifacts/release-gates/summary.md`
- `artifacts/release-gates/*.log`
- `playwright-report/a11y`
- `playwright-report/release`
- `test-results/a11y`
- `test-results/release`

If a gate fails, inspect the matching `artifacts/release-gates/<step>.log` file first.

## What each gate covers

- Citation/content/route/legal/crawl/design/analytics validators:
  - existing repository contracts that keep manifests, structured content, governed wording, crawl assets, semantic tokens, and analytics taxonomy coherent
- Freshness validation:
  - deterministic review-window, stale/noindex, and expired/block checks across structured content, citations, governance records, and generated crawl/LLM assets
- Workflow validation:
  - YAML parseability, required triggers, minimal permissions, and pinned GitHub Action SHAs
- Unit tests:
  - node-based route/content/legal/analytics/design/link-graph/prerender behavior
- Build and prerender validation:
  - built HTML, metadata, canonical/schema output, and 404 output
- Broken-link validation:
  - internal route targets, rendered in-page anchors, clean URL outputs, and hash-route regression checks across built pages and crawl artifacts
- Performance-budget validation:
  - conservative technical budgets for built JS, CSS, per-page HTML, and aggregate static asset weight
- Route smoke:
  - direct clean-path loading, hydration asset presence, legacy hash migration, and real 404 serving
- Playwright accessibility/mobile checks:
  - skip link, mobile menu, dialog focus management, validation announcement behavior, reduced motion, responsive CTA reachability
- Playwright release smoke:
  - prerendered metadata, canonical/schema presence, analytics queue smoke, direct route loads, FAQ interactions, console/page error checks, and 404 behavior

## GitHub Actions gate

The repository CI workflow runs on:

- `pull_request`
- `workflow_dispatch`

It uses:

- minimal top-level permissions: `contents: read`
- pinned `actions/checkout`
- pinned `actions/setup-node`
- pinned `actions/upload-artifact`

The workflow installs dependencies, installs the Playwright Chromium browser, runs `npm run qa:release`, and uploads the release logs plus Playwright reports.

## Production launch gate

Passing CI means the branch is technically release-ready for preview/staging. It does not mean production indexing or launch is approved.

Production remains blocked until `F44-GOV-02` provides all of the following:

- verified legal business name
- verified mailing address
- verified support email
- verified support phone
- approved privacy, consent, sharing, and retention language
- verified `sameAs` references if any are to be published
- explicit production indexing approval

Until those approvals exist:

- staging and preview stay `noindex,nofollow`
- production indexing must remain disabled in configuration
- controlled TBD identity placeholders must remain visible where applicable

## Release checklist

- [ ] Branch is scoped to one roadmap task.
- [ ] `ROADMAP.md` status and changelog reflect real verification evidence.
- [ ] `npm run validate:workflows` passes.
- [ ] `npm run qa:release` passes.
- [ ] `npm run report:freshness` has been reviewed when content, citations, governance docs, or crawl assets changed.
- [ ] CI release-gate workflow passes on the PR.
- [ ] Preview smoke checks and route behavior are correct.
- [ ] No production-indexing toggle or legal/entity fabrication was introduced.
- [ ] If launch is being considered, `F44-GOV-02` approvals are present and verified separately.
