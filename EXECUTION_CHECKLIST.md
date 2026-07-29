# EXECUTION_CHECKLIST.md — Fund44 Remaining Work

Repository-grounded remaining-work list, ordered by dependency and conversion impact.
Companion to `CLAUDE.md`. `ROADMAP.md` remains the formal task ledger — update both.

**Audit basis:** worktree at commit `c85c24f`, audited 2026-07-27. Every "verified" claim
below was checked by running the command or reading the cited file, not by trusting a
prior status document. **Re-verified later the same day with Playwright chromium installed:**
`npm run qa:release` is green end-to-end — all 17 steps pass, including `test:a11y` and
`test:release` executing in real browsers (see §0 and §1).

Confidence legend:

- **[VERIFIED DONE]** — confirmed by a passing command or by reading the code.
- **[NEEDS VERIFICATION]** — plausibly done; the check is cheap; confirm before building on it.
- **[REMAINING]** — confirmed not done, or confirmed blocked.
- **[UNCERTAIN]** — could not be determined in this environment. Stated honestly, not assumed.

---

## 0. Audit results — what is actually true today

### Verified done (commands run 2026-07-27, this worktree)

- [VERIFIED DONE] `npm ci` installs cleanly (21 packages).
- [VERIFIED DONE] `npm test` → **79 pass / 0 fail**.
- [VERIFIED DONE] `npm run build` succeeds; prerenders **30 canonical routes + `/404`**.
- [VERIFIED DONE] All 9 pre-build validators pass: `citations`, `content`, `routes`, `legal`,
  `crawl`, `design`, `freshness`, `analytics`, `workflows`.
  (`validate:workflows` fails with `ERR_MODULE_NOT_FOUND: yaml` until `npm ci` is run — not a defect.)
- [VERIFIED DONE] All post-build gates pass: `validate:prerender`, `validate:links`,
  `validate:performance`, `smoke:routes`.
- [VERIFIED DONE] Staging indexing is correctly suppressed: built `<meta name="robots"
  content="noindex,nofollow">` and `dist/robots.txt` `Disallow: /`.
- [VERIFIED DONE] Funnel sends nothing anywhere — no `fetch`, `XMLHttpRequest`, or form
  `action` exists in `src/components/flow.js`. Preview-only is genuinely enforced.
- [VERIFIED DONE] CI (`.github/workflows/release-gates.yml`) runs `validate:workflows` +
  `qa:release` on every PR, Node 20, SHA-pinned actions.

### Two previously "launch-blocking" defects — CLOSED, not reproducible (2026-07-27)

Prior status docs listed these as the top two blockers. Settled this session in code **and**
in executed real-browser suites. **Do not re-implement.** No `ROADMAP.md` task row exists for
either claim (grep-verified) — they were status-doc artifacts only; the ledger record is the
changelog row on this session's PR.

- [VERIFIED DONE] **Disclosure component collapse — not reproducible.** Both guards present:
  `src/product.css:243` (`.disclosure-bar svg { flex-shrink:0 }`) and `:244`
  (`.disclosure-bar p { min-width:0; max-width:none; overflow-wrap:anywhere }`). Release smoke
  scrolls `footer_marketplace_disclosure` into view and passes on desktop + mobile chromium.
  Geometry is still not asserted by any test — that regression check stays with `F44-QA-02`.
- [VERIFIED DONE] **Funding-preview modal — working as specified.** `npm run test:a11y` executed
  with real chromium (11 passed / 4 intentional skips): the dialog test (role, aria-modal,
  focus trap, Escape, focus restore, validation announcements) passed on all three projects.
  `npm run test:release` (6/6) drives the full preview funnel on `/working-capital` through
  every step to a `manual_review` outcome — steps render and receive interaction; no blank layer.
- [VERIFIED DONE] **Blank-panel stacking symptom — not reproducible.** Structural: the panel
  (`.dialog`) is a *child* of `.dialog-backdrop` (`src/components/flow.js` `mount()`), so it
  always paints above the backdrop fill, and the backdrop is `visibility:hidden` until `.open`.
  Empirical: the release-smoke funnel test clicks panel controls at every step in real chromium
  on desktop and mobile — the panel is the effective hit-test target throughout. An explicit
  topmost-element assertion at the CTA click point remains `F44-QA-02` scope.
- [REMAINING] **Regression coverage for both defects.** No test asserts geometry, layout, or a
  screenshot for either component, so the suite cannot detect a recurrence. This belongs to
  `F44-QA-02`.
  *Acceptance:* a test that fails if the disclosure text box width drops below a threshold or
  the dialog panel is not the topmost hit-test target at the CTA click point.
  *Validation:* `npm run test:release`.

### Confirmed real and unresolved

- [REMAINING] **Internal jargon is in shipped HTML.** Measured in `dist/` after build:
  `Hub page`, `Related routes`, `Next step` each appear in **59** HTML files;
  `canonical program page` in **57**; `F44-GOV-02` in **6**; `governance draft` in **4**
  (including `<title>` on `/privacy` and `/terms`); `controlled TBD` in **4**.
  (`dist` emits both `x.html` and `x/index.html`, so 59 ≈ all 30 routes.)
- [REMAINING] **`/og-image.png` does not exist.** `src/lib/seo.js:8` references it; no PNG
  exists in `public/` or `dist/`. Every page ships a broken OG image reference.
- [REMAINING] **No security headers.** `vercel.json` contains only `cleanUrls` and
  `trailingSlash`.
- [REMAINING] **No linter or typechecker exists.** No ESLint/Prettier/TypeScript config in the
  repo. `qa:release` is the only gate. Treat "lint/typecheck" gates below as satisfied by
  `qa:release` unless the team decides to add tooling as its own task.
- [VERIFIED DONE] **Playwright suites now executed locally** (2026-07-27, after
  `npx playwright install --with-deps chromium`): `test:a11y` → 11 passed / 4 intentional
  project-guard skips (see §3); `test:release` → 6/6 passed on desktop + mobile chromium.
  Full `qa:release` re-run: `result: pass`, all 17 steps green,
  `artifacts/release-gates/summary.json` written with no failures.

---

## 1. Gate A — build, lint, typecheck, tests (do this first, every session)

- [ ] Run the full gate before and after any change set. (Standing rule — never check off.)
  *Scope:* whole repo. *Acceptance:* every step reports pass; `artifacts/release-gates/summary.json`
  written with no failures. *Validation:* `npm ci && npm run qa:release`.
  *Baseline 2026-07-27:* `npm ci` clean; `qa:release` → `result: pass`, 17/17 steps. (A first
  run failed only on missing chromium binaries — a race against the browser install, not a
  repo defect.)
- [x] Install browsers once so the two Playwright gates are real rather than skipped.
  **Done 2026-07-27:** `npx playwright install --with-deps chromium` → `test:a11y` resolves 15,
  executes 11 + 4 intentional project skips; `test:release` 6/6 passed.
  *Validation:* `npx playwright install --with-deps chromium && npm run test:a11y && npm run test:release`.
- [ ] If a change raises the build footprint, ratchet the budget in `scripts/run-release-gates.mjs`
  in the same PR and record old → new numbers in the `ROADMAP.md` changelog.
  *Acceptance:* `npm run validate:performance` passes with a documented budget change.
- [ ] Decide explicitly whether to adopt a linter/typechecker, or record that `qa:release` is the
  agreed substitute. *Acceptance:* one line in `docs/release-procedure.md`. Do not bolt tooling
  onto an unrelated task.

## 2. Highest conversion impact, executable now (no external input needed)

- [x] **Confirm or close the two defect claims above — DONE 2026-07-27.** Both closed as
  not-reproducible with executed-suite evidence; see §0. `ROADMAP.md` carries no row for these
  claims (grep-verified), so the ledger update is the changelog entry on this session's PR.
  Manual `/` + `/sba-7a` visual pass was not performed; recorded evidence is the executed
  suites plus the CSS/DOM reading, and geometry assertions remain `F44-QA-02` scope.
- [ ] **Remove internal jargon from customer-facing copy** (roadmap: customer-facing cleanup;
  overlaps `F44-GOV-02` for the legal-page titles).
  *Scope — emit sites audited 2026-07-27 (replaces grep discovery):*
  `src/lib/link-graph.js:229-231` — rendered group titles `Hub page` / `Related routes` /
  `Next step` (display-only; the `hub|contextual|next` relation keys and `link-group-*` id
  format are contracts — do not rename) — and `:11,13` route-description fallbacks
  ("governance-draft", "controlled TBD", "GOV-02"); `src/pages/legal.js:24-25,40,88-89,145`
  ("governance draft" in titles/meta, "Controlled TBD state." heading); `src/lib/legal.js:24,81,118,172`
  (rendered `F44-GOV-02`/`F44-SEC-01` sentences); `content/pages/financing.json:10`
  ("canonical program page" inside the summary value — rendered on 57 pages as the /financing
  link description). `F44-PROD-*`/`F44-DISC-*` claim keys render zero times — leave them.
  Check any replacement legal wording against `scripts/validate-legal.mjs` blocked patterns.
  *Acceptance:* section labels read as borrower-facing language; zero occurrences of
  `F44-[A-Z]+-[0-9]+`, `governance draft`, or `controlled TBD` in rendered HTML. Internal IDs
  may remain as data keys in `.mjs`/`.json` **so long as they are never rendered** — note that
  `F44-PROD-*` and `F44-DISC-*` are registry keys and already render zero times.
  *Validation:* `npm run build && grep -rc "F44-GOV-02\|governance draft\|Hub page\|Related routes\|canonical program page" dist --include=*.html | grep -v ':0' ` returns nothing.
- [x] **`F44-CNV-02` — delivered by PR #29 (adopted 2026-07-27; merge pending).** A prior
  agent session opened PR #29 ("Complete F44-CNV-02 contextual funnel intent handling",
  branch `agent/f44-cnv-02`) 90 minutes before this session started; the ledger never
  recorded it. Its CI `qa-release` gate is green and it coherently extends main's already
  contract-satisfying baseline (typed `FUNNEL_CONTEXT_KINDS`, route-id allowlisting,
  storage persistence, validator-enforced `data-flow-context-kind` markers). This session
  independently verified the baseline contract on main with a browser probe
  (`eligibility_start` carried `route_id=equipment_purchase`, `start_surface=use_case_page_hero`,
  `start_cta_id`, `mode_source`; outcome links led with `entry_context`) and posted the
  evidence + test-overlap analysis as a PR #29 comment. Duplicate closure branch withdrawn
  (kept locally as `local/f44-cnv-02-followup-tests`); the non-overlapping regression tests
  (outcome-category next steps, dedupe/cap, home fallback) go in a small follow-up PR after
  #29 merges. **Lesson recorded: check `git ls-remote` for open task branches/PRs before
  claiming a task — the ledger alone is not sufficient.**
- [x] **`F44-EXP-01` — DONE 2026-07-27, PR #32 (`agent/f44-exp-01`, merge pending).**
  Harness built on the taxonomy that already shipped with `F44-MEA-02` (no event/property
  changes): `src/lib/experiments.js` (frozen empty registry, definition validation,
  deterministic FNV-1a session bucketing, registry/per-experiment/global kill switches);
  `sharedFields()` now injects active assignments into `experiment_ids` on every event;
  `trackExperimentExposure` refuses killed/inactive experiments; `docs/experiment-rules.md`
  binds variants to consent/disclosure/claims/design governance with existing-KPI
  guardrails. Registry ships empty — zero runtime change until an entry is reviewed in.
  Tests 87/87 (8 new in `tests/experiments.test.mjs`); `validate:analytics` pass
  (24 events / 31 routes); `qa:release` 17/17.
- [ ] **`F44-QA-02` — regression breadth.** Sequence after `F44-CNV-02`.
  *Scope:* `tests/**`, template fixtures, release-gate maintenance.
  *Acceptance:* coverage for template variants, trust modules, funnel modes, plus the
  disclosure/modal geometry assertions above; also absorbs the deprecated Node 20 GitHub
  Action annotation on `.github/workflows/release-gates.yml`.
  *Validation:* `npm run qa:release` with the new tests executing.
- [ ] **`F44-CONT-07` — metro/programmatic expansion.** Executable but should wait for real
  query evidence and approved manifest rows. *Acceptance:* new routes pass content, citation,
  freshness, link-graph, and crawl gates with zero orphans.
  *Validation:* `npm run build:link-graph && npm run qa:release`.

## 3. Mobile UX

- [ ] Confirm mobile behavior at 375px on the funnel, nav, and disclosure surfaces.
  *Scope:* existing mobile projects in `playwright.config.mjs`; discover with
  `grep -n "projects" -A 20 playwright.config.mjs`.
  *Acceptance:* no horizontal overflow, tap targets ≥ 44px, mobile menu and bottom-sheet
  funnel usable, disclosure text not collapsed.
  *Validation:* `npm run test:a11y`; manual pass at 375px on `/`, `/sba-7a`, and a state page.
  *Status 2026-07-27:* automated mobile project (Pixel 5, 393px) is green — menu focus trap,
  funnel dialog, and CTA bounding-box checks all passed; the manual 375px pass is still owed.
- [x] [VERIFIED DONE] The 4 skips are intentional project guards, not disabled coverage
  (verified 2026-07-27): `tests/a11y/accessibility-mobile.spec.mjs:29`
  `test.skip(!isMobileProject(testInfo), 'mobile-specific coverage')` and `:76`
  `test.skip(!testInfo.project.name.includes('reduced-motion'), 'reduced-motion-only coverage')`.
  5 tests x 3 projects = 15 instances; non-matching projects skip by design, so
  `11 passed / 4 skipped` is the correct, complete result.

## 4. Forms and lead routing — BLOCKED

- [ ] **`F44-SEC-01` (partial) / live submission integration.** Blocked on host + backend/vendor
  choice and on `F44-GOV-02` consent language.
  *Scope:* `src/components/flow.js`, future integration module.
  *Acceptance:* live mode posts to the approved endpoint with consent captured, success/failure
  states, retry, and `application_submit_result` carrying `result` + `integration_target`.
  *Validation:* end-to-end submission against a staging endpoint.
  **Do not add any network call to the funnel before this is unblocked.**
- [ ] Define lender handoff, consent, error, retry, and monitoring behavior.
  *Acceptance:* written contract in `docs/` naming the provider and failure modes.
  *Blocker:* requires a vendor decision. Stop and ask.

## 5. Analytics

- [ ] Verify the implemented event surface still matches `docs/measurement-plan.md` after any
  funnel change. *Scope:* `src/lib/analytics.js`, `scripts/validate-analytics.mjs`.
  *Acceptance:* no unknown events/properties; no PII-shaped payloads; preview vs live
  distinguishable; `environment` separates staging from production.
  *Validation:* `npm run validate:analytics && npm test`.
- [REMAINING] **Environment dimension is polluted in default builds (found 2026-07-27 during
  CNV-02 QA).** `src/lib/legal.js:4` falls back to `import.meta.env.MODE`, which is always
  `production` under `vite build`, so a build without `VITE_FUND44_ENV` set emits
  `environment: "production"` on every analytics event while `consent_state` correctly says
  `staging_preview_only`. Robots/noindex and consent gating are unaffected
  (`allowIndexing` still requires explicit approval). Violates the §8 contract "environment
  must cleanly separate staging from production". Candidate fix is dropping the `MODE`
  fallback in `LEGAL_ENV` — one line — but it touches the legal/indexing module, so it needs
  an explicit owner decision rather than a drive-by edit. **Stop-and-ask filed; do not fix
  silently inside an unrelated task.**
- [ ] [REMAINING] Connect a real analytics destination and confirm events land.
  The layer is vendor-neutral; no vendor is wired. *Blocker:* stack selection is unconfirmed
  per `ROADMAP.md` open blockers. Stop and ask.
- [ ] [REMAINING] Baseline collection then targets — follow the "Baseline then Target Workflow"
  in `docs/measurement-plan.md`. Do not set numeric KPI targets before a clean baseline exists.

## 6. SEO, schema, crawlability

- [ ] **Generate `/og-image.png`** (1200×630) and place it in `public/`.
  *Acceptance:* asset exists, ships to `dist/`, and the OG URL resolves.
  *Validation:* `npm run build && ls dist/og-image.png`.
- [ ] **`F44-SEO-03`** — final entity, trust, logo, OG, and page-type schema coverage.
  *Scope:* `src/lib/seo.js`, `public/*`, page metadata.
  *Blocked by* `F44-GOV-02` (verified entity + `sameAs`). Do not publish entity claims early.
  *Validation:* `npm run validate:prerender && npm run validate:crawl`.
- [ ] Keep crawl outputs manifest-generated and consistent.
  *Acceptance:* sitemap/llms/attribution counts match the route inventory; zero orphans.
  *Validation:* `npm run build:link-graph && npm run validate:crawl && npm run validate:links`.
- [ ] **Production indexing flip — LAST STEP BEFORE LAUNCH.** Requires `F44-GOV-02` approval.
  *Scope:* `VITE_FUND44_ENV=production` at build time; confirm `public/robots.txt` policy.
  *Acceptance:* production HTML emits `index,follow`, canonical host is correct, robots allows
  crawling. *Validation:* `VITE_FUND44_ENV=production npm run build && grep -o '<meta name="robots"[^>]*>' dist/index.html`.
  **Stop and ask before running this against a real deploy.**

## 7. Accessibility and performance

- [ ] Keep the a11y suite green and extend it alongside `F44-CNV-02`.
  *Acceptance:* `test:a11y` passes; dialog semantics, focus order, skip link, reduced-motion,
  and keyboard paths covered. *Validation:* `npm run test:a11y`.
- [ ] Keep the performance gate honest.
  *Acceptance:* `validate:performance` passes at the current ratcheted baseline (largest JS,
  CSS, entry HTML, max prerendered page HTML, total assets).
  *Validation:* `npm run validate:performance`.
- [ ] [UNCERTAIN] No Lighthouse or real-device measurement exists in the repo — budgets are
  static asset-size checks only. If field performance matters for launch, that is new scope;
  raise it rather than assuming it is covered.

## 8. Deployment and environment validation

- [ ] **`F44-SEC-01`** — response security headers and policies.
  *Scope:* `vercel.json` (currently headerless) plus rendering-safety review of the funnel.
  *Acceptance:* CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame policy defined
  and verified against the chosen host. *Validation:* header inspection on a deployed staging
  URL. *Blocked* on host confirmation.
- [ ] Validate clean-URL behavior on the real host.
  *Acceptance:* `cleanUrls: true` + `trailingSlash: false` resolve every canonical route and
  the 404 correctly. *Validation:* `npm run smoke:routes` locally, then a live crawl of staging.
- [ ] Confirm the production domain and canonical host.
  *Blocker:* unconfirmed in `ROADMAP.md`. Canonicals currently assume a fixed base — verify
  with `grep -rn "BASE\|fund44.com" src/lib/seo.js src/lib/routes.js` before launch.
- [ ] Never commit secrets or `.env` files. Environment is `VITE_FUND44_ENV` only.
  *Acceptance:* `git status` clean of env files; no credentials in the repo.

## 9. External blockers — `F44-GOV-02` (gates launch, not code)

All require verified business/legal input. **Never invent these.**

- [ ] Legal business name · [ ] Mailing address · [ ] Support email · [ ] Support phone
- [ ] Final privacy, terms, consent, sharing, retention, and user-rights copy
- [ ] Verified entity and `sameAs` references
- [ ] Production indexing approval
- [ ] Security statements and deployment-security review sign-off
- [ ] **`F44-TRUST-01`** — verified trust assets (testimonials, outcomes, partner proof) and
  the trust modules that surface them near the first conversion decision.
  *Acceptance:* every claim traceable to `docs/claims-register.md` with an owner and review
  date; zero placeholders remaining. *Validation:* `npm run validate:legal && npm run validate:freshness`.

Until approved, `src/lib/legal.js` keeps controlled TBD placeholders. That is correct
behavior — do not "fix" it by inventing values.

## 10. Final launch QA (run in order, all must pass)

1. [ ] `npm ci && npm run qa:release` — every gate green, artifacts written.
2. [ ] Playwright a11y + release smoke executed with real browsers, zero failures.
3. [ ] Manual desktop + mobile pass: home, a program page, a use-case, an industry, a state
   page, an article, legal pages, contact, 404.
4. [ ] Full keyboard-only pass through nav, FAQ, and the funnel dialog.
5. [ ] Zero internal jargon in rendered HTML (grep from §2).
6. [ ] OG image resolves; per-route titles, descriptions, canonicals, and JSON-LD verified.
7. [ ] Sitemap, robots, `llms.txt`, and attribution counts match the route inventory.
8. [ ] Analytics QA checklist in `docs/measurement-plan.md` completed against live events.
9. [ ] Security headers verified on deployed staging.
10. [ ] `F44-GOV-02` fully approved and recorded in `docs/legal-launch-checklist.md`.
11. [ ] Live submission validated end-to-end, or the funnel is confirmed still preview-only
    with honest preview-only disclosure copy.
12. [ ] **Only then** flip indexing to production and monitor.

Do not check any box in §10 without a command result or a named reviewer.
