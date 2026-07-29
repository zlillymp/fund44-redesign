# Fund44 Progress Update - July 28, 2026

As of: July 28, 2026. This update treats `ROADMAP.md` in the archived `main` snapshot at `e56085bd45e41840f1eccb7c620f022d940829cd` as canonical. The uploaded historical files were used only for reconciliation. Material drift exists in older status docs and in some historical summary sections inside `ROADMAP.md` itself: older files still show `F44-CONT-06`, `F44-EXP-01`, and `F44-CNV-02` as unfinished; the historical measurement-plan mirror still uses pre-normalization `experiment_exposure` wording; the earlier `F44-SEO-02` evidence still reflects pre-expansion crawl counts; and the `Next executable tasks` section is stale because it still mentions `F44-EXP-01` after later completion. Current task blocks plus the July 26-28 changelog entries are the source of truth.

## 1. Executive summary and launch/readiness assessment

The archived `main` snapshot is a release-verified staging build, not a production-launch-ready build. Core platform work, structured content migration, prerendering, analytics plumbing, accessibility hardening, release automation, organic content expansion, freshness controls, semantic design governance, experimentation infrastructure, and contextual funnels are all in place. The site also now ships the borrower-facing jargon cleanup and a generated OG image asset.

Milestone status is mixed but clear. `M0` is complete. `M3` is complete. `M1` is still blocked by `F44-GOV-02` and `F44-SEO-03`. `M2` is still blocked by `F44-TRUST-01` and `F44-SEC-01`. `M4` is not complete because `F44-QA-02` and `F44-EXP-02` remain open. The highest-value remaining autonomous engineering task is now `F44-QA-02`, and the highest-value external gate is still `F44-GOV-02`.

Readiness assessment: strong engineering foundation, strong release evidence, not ready for production indexing or public launch. Staging should remain `noindex,nofollow` until verified legal/business identity inputs, final consent/privacy language, final entity references, trust proof, host/security decisions, and live submission boundaries are explicitly resolved.

## 2. Verified baseline

| Item | Verified current baseline |
| --- | --- |
| Archived `main` SHA | `e56085bd45e41840f1eccb7c620f022d940829cd` |
| Final batch deployment | https://vercel.com/zlillymps-projects/fund44-redesign/H4CdtSRE2puzfN4unngkn3ryCKox |
| Deployment/indexing posture | Staging configuration remains non-indexable; generated route attribution shows `env=staging`, `allowIndexing=false`, `metaRobots=noindex,nofollow` |
| Late merged PRs included in snapshot | `#29`, `#30`, `#31`, `#32` |
| Release gate | `qa:release` `17/17` passed |
| Node test suite | `npm test` `94` passed / `0` failed |
| Playwright accessibility/mobile | `11` passed / `4` intentional skips |
| Playwright release smoke | `6` passed |
| Prerender inventory | `30` canonical routes plus dedicated `404` |
| Link validation | `30` routes plus crawl artifacts |
| Crawl inventory | `30` sitemap routes, `27` `llms` entries, `30` attribution routes |
| Internal link graph | `30` canonical routes, `29` hub links, `161` contextual links, `30` next-step links, `0` orphans |

Intermediate changelog rows in `ROADMAP.md` show lower route counts and smaller test totals because they were recorded before the final state/use-case/industry/content/funnel/experiment merges. The figures above are the final verified baseline for the archived July 28 snapshot.

### Performance budgets

| Budget | Actual KiB | Budget KiB | Headroom KiB | Status |
| --- | ---: | ---: | ---: | --- |
| Largest JS bundle | 351.1 | 351.6 | 0.5 | Tight |
| Largest CSS bundle | 43.1 | 48.8 | 5.7 | Acceptable |
| Entry HTML | 64.1 | 65.4 | 1.3 | Tight |
| Max prerendered page HTML | 71.2 | 71.3 | 0.1 | Critical headroom |
| Total JS/CSS assets | 394.1 | 395.5 | 1.4 | Tight |

Tight-headroom warning: the snapshot passes all five budgets, but four of the five are effectively at the ceiling. The worst case is per-page HTML with only `0.1 KiB` headroom. Any additional shared copy, template markup, or bundled code should assume a paired budget review and a likely need to trim elsewhere.

## 3. Everything completed so far

### Canonical status by milestone/domain

| Domain | Complete | Partial / enabling only | Still open |
| --- | --- | --- | --- |
| Operating system and governance | `F44-OPS-01`, `F44-GOV-01`, `F44-MEA-01` | `F44-GOV-02` has centralized legal/indexing configuration, controlled TBD placeholders, legal checklist coverage, and July 28 borrower-facing jargon normalization, but the task remains blocked | `F44-GOV-02` |
| Crawlable architecture and release foundation | `F44-ARCH-01`, `F44-ARCH-02`, `F44-SEO-01`, `F44-SEO-02`, `F44-UX-01`, `F44-CNV-01`, `F44-A11Y-01`, `F44-MEA-02`, `F44-QA-01` | `F44-SEO-03` has a valid enabling OG image asset on `main`, but the task remains blocked pending final entity/contact/schema inputs | `F44-SEO-03`, `F44-TRUST-01`, `F44-SEC-01` |
| Organic scale and content operations | `F44-SEO-04`, `F44-SEO-05`, `F44-CONT-01`, `F44-CONT-02`, `F44-CONT-03`, `F44-CONT-04`, `F44-CONT-05`, `F44-CONT-06` | None | `F44-CONT-07` |
| Optimization foundation | `F44-DSGN-01`, `F44-EXP-01`, `F44-CNV-02` | None | `F44-QA-02`, `F44-EXP-02` |

### What the completed work now covers

| Completed area | Exact task IDs | What is now in place |
| --- | --- | --- |
| Governance and measurement contracts | `F44-OPS-01`, `F44-GOV-01`, `F44-MEA-01` | Canonical roadmap/agent protocol, claims/disclosures register, measurement plan, and dashboard specification |
| Clean-route platform | `F44-ARCH-01`, `F44-ARCH-02`, `F44-SEO-01`, `F44-SEO-02` | Manifest-backed clean URLs, structured content model, prerendered route HTML, generated crawl files, consistent canonical metadata |
| Conversion and release foundation | `F44-UX-01`, `F44-CNV-01`, `F44-A11Y-01`, `F44-MEA-02`, `F44-QA-01` | Reset CTA hierarchy, explicit preview/live funnel model, accessibility/mobile hardening, vendor-neutral analytics layer, and deterministic release gates |
| Organic scale launch | `F44-SEO-04`, `F44-SEO-05`, `F44-CONT-01`, `F44-CONT-02`, `F44-CONT-03`, `F44-CONT-04`, `F44-CONT-05`, `F44-CONT-06` | Citation registry, internal-link graph, scalable content contracts, financing/use-case/industry/state launches, and freshness reporting |
| Optimization groundwork | `F44-DSGN-01`, `F44-EXP-01`, `F44-CNV-02` | Semantic design tokens, experimentation harness with empty frozen registry, and contextual funnels that preserve route intent |

### Superseded historical status claims

| Historical claim | Canonical July 28 status |
| --- | --- |
| Older status docs still list `F44-CONT-06` as remaining work | `F44-CONT-06` is done |
| Older status docs still list `F44-EXP-01` as incomplete / failed | `F44-EXP-01` is done |
| Older status docs still list `F44-CNV-02` as remaining work | `F44-CNV-02` is done |
| Historical roadmap/status text describes `F44-QA-02` as blocked on contextual funnels | `F44-QA-02` is now `ready`; its prerequisites are satisfied |
| Historical `F44-SEO-03`, `F44-TRUST-01`, and `F44-SEC-01` wording treated them as more immediately executable | Current task blocks mark all three as blocked on external approvals or host/vendor decisions |
| Historical progress notes describe disclosure/modal defects as launch blockers | Those defects are not carried as open canonical roadmap tasks in the July 28 snapshot; current roadmap and current source/test evidence supersede that older note |

## 4. July 28 update

| PR | Merge commit | July 28 impact | Canonical task effect |
| --- | --- | --- | --- |
| `#29` `F44-CNV-02` | `8d0d7f4cae6bfbb0bdab1ed5212d05b389fe5327` | Fixed the review-identified contextual CTA bug so shared header/mobile/footer shell CTAs preserve program/use-case/industry/state route family instead of collapsing to generic context | `F44-CNV-02` remains done; this closes the contextual CTA correctness issue and leaves `F44-QA-02` fully unblocked |
| `#32` `F44-EXP-01` | `82441b53c158ff5aad0d535affda9d7c478f3966` | Merged the experimentation harness and the July 28 normalization that aligns `experiment_exposure` semantics to visible-variant exposure, not mere bucketing | `F44-EXP-01` is done; no runtime experiment is active because the shipped registry is empty |
| `#31` jargon cleanup | `373e643cc425a1c6309cd56cc195022cfc8f1d3c` | Removed internal roadmap/ticket terminology from borrower-facing copy | Normalized into the still-blocked `F44-GOV-02` surface; useful cleanup, not proof that `F44-GOV-02` is complete |
| `#30` OG image | `e56085bd45e41840f1eccb7c620f022d940829cd` | Added generated `public/og-image.png` and the generator script used to produce it | Normalized into the still-blocked `F44-SEO-03` surface; valid enabling asset, not completion of `F44-SEO-03` |

Two late-batch conflicts are resolved in this snapshot:

1. Contextual CTA routing is corrected. Shared shell CTA entry points now preserve route intent instead of overriding context with generic markers.
2. Combined performance pressure from the late PR batch was reconciled without failing release gates. The merged snapshot still fits all budgets, but only with extremely tight headroom on JS, entry HTML, per-page HTML, and total assets.

## 5. Canonical remaining work from current `ROADMAP.md`

The table below follows the current task blocks, not the stale `Next executable tasks` summary that still mentions `F44-EXP-01`.

| ID | Status | Priority | Dependencies / blockers | Concrete acceptance outcome | Recommended next action |
| --- | --- | --- | --- | --- | --- |
| `F44-GOV-02` | Blocked | `P0` | Depends on `F44-OPS-01`, `F44-GOV-01`; blocked on verified legal business name, mailing address, support email, support phone, final privacy/terms/consent/retention copy, verified `sameAs`, and production indexing approval | Verified contact details replace placeholders; approved privacy/terms/consent copy is published or staging-gated; entity URLs and `sameAs` are verified; staging/prod indexing rules are explicit | Gather the missing legal/ops/privacy/SEO approvals as one package, then update governed surfaces and rerun `npm run validate:legal` |
| `F44-SEO-03` | Blocked | `P0` | Depends on `F44-GOV-01`, `F44-GOV-02`, `F44-SEO-01`; blocked by unresolved entity/contact/schema approvals under `F44-GOV-02` | Correct page-type schema coverage; verified entity/contact references; placeholder or unverified trust/entity signals removed; verified logo/OG assets in place | After `F44-GOV-02` inputs land, update `src/lib/seo.js` and related page/public assets, then validate schema/entity output; keep treating the existing OG image as enabling work only |
| `F44-TRUST-01` | Blocked | `P0` | Depends on `F44-GOV-01`, `F44-GOV-02`, `F44-UX-01`; blocked on approved trust proof assets plus owner/freshness metadata | Every trust module is sourced from approved evidence with owner/freshness metadata; placeholders and fabricated proof are removed; trust modules are measurable | Collect approved public proof assets first, then implement a governed `content/trust/*` surface and wire analytics consistently |
| `F44-SEC-01` | Blocked | `P0` | Depends on `F44-GOV-02`, `F44-CNV-01`; blocked on production host choice, live submission target, and backend/vendor handoff | CSP/HSTS/content-type/referrer/permissions policies configured for the chosen host; safe rendering of user input; no client-side secrets; consent boundaries enforced | Choose the production host and live submission boundary first, then implement headers/form-boundary validation against a real staging target |
| `F44-QA-02` | Ready | `P1` | Depends on `F44-QA-01`, `F44-DSGN-01`, `F44-CNV-02`; all three are done | Regression coverage expands beyond launch smoke to template variants, trust modules, funnel modes/outcomes, and canonical/content quality assertions for generated pages | Claim this next. Extend `tests/**` and CI with template/funnel/trust regression matrices, and absorb the noted GitHub Node 20 workflow-runtime maintenance while already in the workflows/test surface |
| `F44-CONT-07` | Ready | `P2` | Depends on `F44-CONT-02`, `F44-CONT-03`, `F44-CONT-04`, `F44-CONT-05`, `F44-SEO-04`, `F44-SEO-05`; dependencies are met, but scope still assumes approved metro/programmatic manifest rows and query evidence | No metro/programmatic page launches without approved manifests, query evidence, required internal links, citations, freshness owner, and QA pass | Leave this behind `F44-QA-02` and the launch gates unless approved metro rows/query evidence are already prepared |
| `F44-EXP-02` | Blocked | `P2` | Depends on `F44-EXP-01`, `F44-CNV-02`, `F44-QA-02`; also blocked on baseline traffic and clean KPI reads | Each experiment has hypothesis, KPI, guardrails, rollback plan, and summary; results feed roadmap priorities instead of undocumented drift | Finish `F44-QA-02`, establish clean production KPI baselines, then run the first tightly scoped experiment |

### Defects and decisions without task IDs

Do not invent roadmap tasks for these. They should either be explicitly assigned later or handled as decisions.

| Item | Current status | Recommendation |
| --- | --- | --- |
| `src/lib/legal.js` analytics-environment fallback defect | Known pre-existing defect. `import.meta.env.MODE` fallback can mislabel analytics environment as `production` in default builds while robots/consent remain staged | Keep separate from the roadmap tasks above unless a task ID is explicitly assigned; address before production data collection |

## 6. External decisions and inputs Matt must provide

These are separate from autonomous engineering work and are still the main reason launch gates remain open.

| External input / decision | Why it is needed | What it unblocks |
| --- | --- | --- |
| Verified legal business name, mailing address, support email, support phone | Replaces controlled TBD placeholders on legal/contact/entity surfaces | `F44-GOV-02`, then `F44-SEO-03`, `F44-TRUST-01` |
| Approved privacy, terms, consent, sharing, retention, and user-rights language | Finalizes governed legal surfaces and live consent boundaries | `F44-GOV-02`, `F44-SEC-01`, live-launch gating |
| Verified `sameAs` / entity references and final public entity description | Required for final schema/entity output | `F44-GOV-02`, `F44-SEO-03` |
| Explicit production indexing approval | Required before leaving staging `noindex,nofollow` posture | `F44-GOV-02`, `F44-SEO-03`, production launch |
| Verified public trust proof assets with freshness ownership | Required to replace placeholders with real trust modules | `F44-TRUST-01` |
| Production domain and host choice | Needed for final canonical/entity/host/security behavior | `F44-GOV-02`, `F44-SEO-03`, `F44-SEC-01` |
| Live submission/backend/provider choice and handoff behavior | Needed for live application boundaries, security review, retry/error behavior, and operational ownership | `F44-SEC-01`, practical live-launch readiness |
| Analytics / monitoring / dashboard stack selection, if a specific external sink is desired | Current repo is vendor-neutral and instrumented, but the roadmap still notes that stack selection is an open operational choice | Production measurement operations; not a blocker to `F44-QA-02`, but still an unresolved deployment decision |

## 7. Recommended next execution sequence

1. Execute `F44-QA-02` next. It is the clearest high-value unblocked engineering task and is now fully unblocked because `F44-QA-01`, `F44-DSGN-01`, and `F44-CNV-02` are all done.
2. In parallel, close the `F44-GOV-02` approval package. This is the highest-value external gate and the key prerequisite for production indexing and final legal/entity surfaces.
3. Immediately after `F44-GOV-02` inputs exist, execute `F44-SEO-03`. The OG image work is already in place as enabling work, so this becomes a focused schema/entity cleanup pass.
4. Execute `F44-TRUST-01` once approved proof assets and owner/freshness metadata exist.
5. Execute `F44-SEC-01` once production host and live submission/vendor boundaries are chosen.
6. Keep `F44-CONT-07` behind the launch gates unless approved metro/programmatic manifest rows and query evidence are already available.
7. Keep `F44-EXP-02` last. It should not start until `F44-QA-02` is done and production baselines are trustworthy.

Production gates in plain language:

- To close `M1`, finish `F44-GOV-02` and `F44-SEO-03`.
- To close `M2`, finish `F44-TRUST-01` and `F44-SEC-01`.
- `M3` is already complete.
- To close `M4`, finish `F44-QA-02` and later `F44-EXP-02`.

## 8. Risks and watch items

| Risk / watch item | Current signal | Watch action |
| --- | --- | --- |
| Tight performance budgets | JS headroom `0.5 KiB`, entry HTML `1.3 KiB`, max page HTML `0.1 KiB`, total assets `1.4 KiB` | Treat every shared copy/template/code change as budget-sensitive; revalidate performance on every merge |
| Analytics environment correctness | Known untracked fallback defect can label analytics environment as `production` while legal/indexing posture remains staged | Assign and fix before production data collection |
| Governance inputs remain the main launch blocker | `F44-GOV-02` is still blocked on identity/contact/legal/indexing approvals | Keep staging non-indexable and do not describe the site as launch-ready |
| Host/backend/vendor dependency chain | `F44-SEC-01` cannot finish without production host and live submission boundary | Resolve operations choices before starting the final security hardening pass |
| Trust proof still absent | `F44-TRUST-01` is blocked on verified public proof assets | Do not backfill fabricated testimonials/outcome claims |
| Intentional test skips remain visible | Accessibility evidence is `11` passed / `4` intentional skips | Keep them visible in release evidence and explicitly accept or resolve them before production launch |
| Experimentation depends on real baseline traffic | `F44-EXP-02` is still downstream of both regression coverage and clean KPI baselines | Do not run live experiments early just because the harness exists |

## 9. Repository, PR, and deployment links

Repository:

- https://github.com/zlillymp/fund44-redesign
- https://github.com/zlillymp/fund44-redesign/commit/e56085bd45e41840f1eccb7c620f022d940829cd

Verified late merged PRs:

- https://github.com/zlillymp/fund44-redesign/pull/29
- https://github.com/zlillymp/fund44-redesign/pull/30
- https://github.com/zlillymp/fund44-redesign/pull/31
- https://github.com/zlillymp/fund44-redesign/pull/32

Verified deployment:

- https://vercel.com/zlillymps-projects/fund44-redesign/H4CdtSRE2puzfN4unngkn3ryCKox

### Handoff checklist

- [ ] Use current task blocks and the July 26-28 changelog in `ROADMAP.md` as canonical; do not rely on stale historical mirrors where they conflict.
- [ ] Keep staging `noindex,nofollow` until `F44-GOV-02` explicitly closes and production indexing is approved.
- [ ] Do not mark `F44-GOV-02` done because jargon cleanup landed; the task is still blocked on verified legal/business inputs.
- [ ] Do not mark `F44-SEO-03` done because `public/og-image.png` exists; the task is still blocked on final entity/contact/schema work.
- [ ] Claim `F44-QA-02` next if engineering continues without waiting on external approvals.
- [ ] Create a real roadmap task before fixing the analytics-environment fallback defect.
- [ ] Re-run the full release gate after any change that touches templates, analytics, crawl outputs, legal surfaces, or performance-sensitive markup.

## 10. Immediate next actions checklist

- [ ] Matt: provide legal business name, mailing address, support email, and support phone.
- [ ] Matt: approve final privacy, terms, consent, sharing, retention, and user-rights language.
- [ ] Matt: confirm final production indexing approval, production domain, and any public `sameAs` references.
- [ ] Matt: choose the production host and live submission/backend/provider boundary.
- [ ] Engineering: claim `F44-QA-02` and expand regression coverage across templates, trust modules, and funnel variants.
- [ ] Engineering: add a dedicated roadmap task for the analytics-environment fallback defect before production telemetry goes live.
- [ ] After approvals land: execute `F44-SEO-03`, then `F44-TRUST-01`, then `F44-SEC-01`.
