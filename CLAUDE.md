# CLAUDE.md — Fund44 Redesign

Persistent operating instructions for Claude Code / Cursor sessions on this repo.
Read this file plus `EXECUTION_CHECKLIST.md` at session start. Do not re-derive project history.

## 1. Project goal

Ship a crawlable, conversion-focused marketing site for Fund44, a small-business
financing **marketplace (not a lender)**. Success metric is the north star in
`docs/measurement-plan.md`: *qualified financing journeys* — sessions reaching a live
`qualified` or `manual_review` outcome that continue to the next committed step.

Stack: Vite 8 + vanilla ES modules, no framework, clean URLs, build-time prerendering
to static HTML. 30 canonical routes + a 404 page. Deploy target is Vercel
(`vercel.json`, `cleanUrls: true`).

## 2. Source-of-truth hierarchy

When sources disagree, the higher entry wins.

1. **The code and generated build output.** Always authoritative for "is X done".
2. `ROADMAP.md` — task ledger: IDs, dependencies, acceptance criteria, changelog.
3. `AGENTS.md` — task-claiming, evidence, and collision protocol. Still binding.
4. `docs/measurement-plan.md` — analytics contract. Never rename an event without
   updating this file, `docs/dashboard-spec.md`, and the linked task together.
5. `docs/` specifics: `claims-register.md`, `disclosures.md`, `legal-launch-checklist.md`,
   `citation-registry.md`, `content-quality-gates.md`, `design-system.md`,
   `release-procedure.md`, `link-graph.md`, `content-review.md`.
6. `EXECUTION_CHECKLIST.md` — remaining-work view, graded by confidence.
7. **`HANDOFF.md` is stale.** It describes a hash-routed SPA with `base: './'`. The repo
   is clean-URL routed with `base: '/'`. Treat it as historical design rationale only.

### Verify before you trust a checklist

External status docs have already gone stale in this project. Two items previously
listed as launch-blocking defects (disclosure component collapsing to one character per
line; funding-preview modal stacking, focus trap, Escape) read as **already fixed** in
`src/product.css` and `src/components/flow.js`, with focus-trap/Escape/restore coverage in
`tests/a11y/accessibility-mobile.spec.mjs`. Before starting any item, open the cited files
and run the validator. If the repo contradicts a checklist claim, fix the checklist row
and say so in your report — do not re-implement work that already exists.

## 3. Non-negotiable constraints

- **Never invent facts.** No legal business name, mailing address, support email, phone,
  testimonials, lender names, rates, funding volumes, approval odds, or timelines that are
  not already approved in `docs/claims-register.md`. Missing values stay as the controlled
  TBD placeholders produced by `src/lib/legal.js`.
- **Marketplace, not a lender.** This framing and the required disclosures must survive
  every copy edit. Source disclosure text from `src/lib/legal.js` / `docs/disclosures.md`;
  never hand-write a new disclosure string.
- **Staging stays `noindex,nofollow`.** `vite.config.js` derives robots policy from
  `VITE_FUND44_ENV`. Do not flip to `index,follow` and do not loosen `public/robots.txt`
  until `F44-GOV-02` is approved.
- **No live submissions.** `src/components/flow.js` is preview-only and contains no
  network call. Do not add `fetch`, a form `action`, or any lead POST until a backend
  target and consent language are approved.
- **No PII in analytics.** Enums, booleans, and pre-bucketed ranges only. `npm run
  validate:analytics` rejects unknown events, unknown properties, and PII-shaped payloads.
- **No hardcoded design values.** Use semantic tokens from `src/styles.css`;
  `npm run validate:design` enforces this.
- **No new content outside the manifest.** Routes and content come from `content/manifest.mjs`
  and `content/**`, and crawl files are generated — never hand-edit `public/sitemap.xml`,
  `public/llms.txt`, or `public/route-attribution.json`.
- **No shadow roadmaps.** Update `ROADMAP.md` and `EXECUTION_CHECKLIST.md` rather than
  creating new tracking files.

## 4. Safe autonomy

Proceed without asking:

- Reading anything; running any command in section 7.
- Code, content, test, and doc changes inside one claimed task's `Paths:` line.
- Regenerating derived artifacts via the documented scripts.
- Committing to a task branch and opening a PR.

Stop and ask (section 10) before: anything that publishes, indexes, transmits user data,
or asserts an unverified fact.

## 5. Multi-agent orchestration

- One agent owns one `F44-*` task ID at a time. Set `Status: in progress - <agent>/<branch>`
  in `ROADMAP.md` **before** editing, per `AGENTS.md`.
- Branch naming already in use: `agent/f44-<task-id-lowercase>`.
- High-collision shared surfaces — sequence these, never parallelize:
  `ROADMAP.md`, `content/manifest.mjs`, `content/citations.mjs`, `src/lib/analytics.js`,
  `src/lib/routes.js`, `src/components/flow.js`, `src/components/ui.js`, generated
  `public/*` crawl files, and `scripts/run-release-gates.mjs` budgets.
- Safe to parallelize: distinct `content/<family>/*.json` records, distinct `src/pages/*.js`
  renderers, distinct `tests/*.test.mjs`, and docs-only edits.
- Use subagents for read-only investigation (locating code, auditing a claim) and keep
  writes on the main agent so the write set stays narrow and reviewable.
- Every completion or handoff appends a `Change Log` row in `ROADMAP.md` with date, task ID,
  summary, evidence, and branch/PR ref. Use the handoff template in `AGENTS.md`.

## 6. Token and context efficiency

`ROADMAP.md` is ~84 KB — **never read it whole.** Instead:

- `grep -nE "^- \[[ x]\] \`F44-" ROADMAP.md` for the task index.
- `sed -n '<line>,+10p' ROADMAP.md` to read one task block.
- The `## Next executable tasks` section (~line 337) is the remaining-work shortlist.
- The `## Change Log` table rows are very long; read at most the newest one or two.

Other rules: prefer `grep`/`glob` over reading whole files; read only the referenced range
of large sources (`src/components/flow.js` ~1050 lines, `src/lib/analytics.js` ~854);
do not paste command output into your response beyond the pass/fail line and the failing
excerpt; do not restate this file back to the user; delegate wide searches to a subagent so
raw results stay out of the main context.

## 7. Implementation workflow

1. Pick one task from `EXECUTION_CHECKLIST.md`; confirm its `Depends on:` line in `ROADMAP.md`.
2. Re-verify the current state in code before writing anything (section 2).
3. Claim it: set the `Status:` line.
4. `npm ci` once per environment.
5. Make the smallest coherent change set inside the task's paths.
6. Run the targeted validator, then the full gate.
7. Update `ROADMAP.md` status + changelog and the matching `EXECUTION_CHECKLIST.md` row.
8. Commit to `agent/f44-<task>` and open a PR. Never approve a PR.

### Validation commands (verified working in this repo, 2026-07-27)

| Command | Purpose |
| --- | --- |
| `npm ci` | Install (21 packages, fast) |
| `npm test` | Node test runner — **79/79 passing** |
| `npm run build` | Crawl-file generation → `vite build` → prerender; emits 30 routes + 404 |
| `npm run qa:release` | **The full gate.** Runs all 17 steps below in order; writes `artifacts/release-gates/` |
| `npm run validate:citations` `:content` `:routes` `:legal` `:crawl` `:design` `:freshness` `:analytics` `:workflows` | Pre-build validators; all pass |
| `npm run validate:prerender` `:links` `:performance` | Post-build validators; all pass |
| `npm run smoke:routes` | Route smoke over `dist/`; passes |
| `npm run test:a11y` | Playwright a11y/mobile, 15 tests — needs `npx playwright install --with-deps chromium` |
| `npm run test:release` | Playwright release smoke — same browser prerequisite |
| `npm run build:link-graph` / `npm run report:freshness` | Regenerate link graph / freshness report |
| `npm run dev` / `npm run preview` | Local dev / preview of `dist/` |

There is **no linter and no typechecker** in this repo — no ESLint, Prettier, or
TypeScript config exists. `npm run qa:release` is the equivalent gate. Do not add a
linter as a side effect of another task.

CI: `.github/workflows/release-gates.yml` runs `validate:workflows` then `qa:release` on
every pull request, on pinned Node 20 with SHA-pinned actions. Keep actions SHA-pinned.

Performance budgets in `scripts/run-release-gates.mjs` are ratcheted to the measured
baseline. If a change legitimately raises the footprint, raise the budget **in the same PR**
and state the old and new numbers in the changelog. Never silently disable a gate.

## 8. Deployment, analytics, and SEO rules

**Deployment.** Vercel, `cleanUrls: true`, `trailingSlash: false`. `vercel.json` currently
contains **no security headers** — that is `F44-SEC-01` and it is blocked on host choice.
Never deploy from an agent session, never add secrets or `.env` files to the repo, and never
read or echo credentials. Environment is driven by `VITE_FUND44_ENV` (`staging` default,
`production` flips robots to `index,follow`).

**Analytics.** `docs/measurement-plan.md` is the contract. Event names, shared required
properties, and KPI denominators are fixed; changing one means updating the plan, the
dashboard spec, `src/lib/analytics.js`, and the roadmap task together. Every event carries
`route_id`, `canonical_url`, `page_type`, `template_id`, `session_id`, `environment`,
`eligibility_mode`, and consent/experiment fields. Preview and live modes must remain
distinguishable. `environment` must cleanly separate staging from production.

**SEO / crawlability.** One manifest drives routes, breadcrumbs, canonicals, CTAs, crawl
files, and analytics attribution. Canonicals are clean absolute URLs — never fragments,
never tracking-parameter variants. Prerendered HTML must contain the title, description,
canonical, OG tags, and JSON-LD; `validate:prerender` enforces this. Every new page needs a
manifest entry, structured content, citations that pass `validate:citations`, inbound
internal links (zero orphans per `validate:links` and `docs/link-graph.md`), and freshness
metadata. Regenerate crawl files; do not hand-edit them.

## 9. Reporting format (required at end of every session)

```md
Task: <F44-ID or "audit">
Status: done | in progress | blocked
Summary: <2-4 sentences on what actually changed>
Verified before starting: <stale claims checked, and what the code showed>
Files changed: <paths>
Commands run: <command → pass/fail, with counts>
Gates: qa:release <pass/fail>; tests <n/n>; playwright <run | skipped + why>
Blockers: <flat list or none>
Next recommended step: <one action>
Ref: <branch / commit / PR>
```

Report honestly. "Not verified" and "could not run" are acceptable answers; a claim of
completion without a passing command or cited evidence is not.

## 10. Stop and ask

Stop, do not guess, and surface the question:

- Any legal business name, address, support email, support phone, or entity/`sameAs` value.
- Final privacy, terms, consent, retention, or user-rights copy.
- Enabling production indexing, or any change to robots/canonical host.
- Any testimonial, review, partner logo, lender name, outcome statistic, rate, or timeline
  not already in `docs/claims-register.md`.
- Choosing or wiring the live submission backend, or adding any outbound network call from
  the funnel.
- Deploying, rotating or adding secrets/env vars, or changing DNS/domain.
- Any change that would widen scope beyond the claimed task's `Paths:` line.
- A dependency listed as complete that the code shows is not, or vice versa.
