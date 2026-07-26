# Fund44 Content Review Workflow

Freshness and re-review workflow for roadmap task `F44-CONT-06`. This document defines how structured content, citations, governance records, and generated crawl/LLM assets are reviewed without fabricating personal identities or approval dates that do not exist in the repository.

## Purpose

- Make freshness status deterministic from repository metadata.
- Keep review ownership explicit even while named reviewers remain blocked under `F44-GOV-02`.
- Surface stale or expired claim support before release.
- Allow stale claim-bearing content to be removed from indexable/crawlable inventories according to policy instead of silently remaining live.

## Freshness objects covered

- Structured canonical content records in `content/pages/*.json`, `content/financing/*.json`, `content/use-cases/*.json`, `content/industries/*.json`, and `content/articles/*.json`
- Citation registry entries in [content/citations.mjs](../content/citations.mjs)
- Governance/legal review records:
  - [docs/claims-register.md](./claims-register.md)
  - [docs/disclosures.md](./disclosures.md)
  - [docs/legal-launch-checklist.md](./legal-launch-checklist.md)
- Generated crawl and LLM assets:
  - `public/sitemap.xml`
  - `public/llms.txt`
  - `public/route-attribution.json`

## Required metadata

### Structured content records

Each canonical structured page or article must include:

- `contributors`
  - `authorId` / `authorPlaceholder`
  - `reviewerId` / `reviewerPlaceholder`
- `publishedDate`
- `reviewedDate`
- `freshness`
  - `ownerRole`
  - `reviewerRole`
  - `ownerState`
  - `reviewerState`
  - `reviewWindowDays`
  - `reviewTriggers`
  - `staleAction`
  - `expiredAction`
- `measurement.freshnessState`

### Citation registry entries

Each citation entry must include:

- `reviewedDate`
- `expiresDate`
- `freshness`
  - `ownerRole`
  - `reviewerRole`
  - `ownerState`
  - `reviewerState`
  - `reviewWindowDays`
  - `reviewTriggers`
  - `staleAction`
  - `expiredAction`

### Governance and generated assets

Governance/legal docs and generated crawl assets are tracked in [src/lib/freshness.js](../src/lib/freshness.js) as deterministic records with:

- `reviewedDate`
- `reviewWindowDays`
- `ownerRole`
- `reviewerRole`
- `ownerState`
- `reviewerState`
- `reviewTriggers`
- `staleAction`
- `expiredAction`

## Status model

Derived freshness states:

- `review_pending`
  - No real `reviewedDate` exists yet.
  - This is allowed while the repo is still building its first review baseline.
  - Release does not fail on `review_pending` alone.
- `current`
  - Reviewed and still outside the upcoming review window.
- `upcoming_review`
  - Reviewed, but due within the configured upcoming window.
  - Release does not fail, but the report must call it out.
- `stale`
  - Review window elapsed.
  - Policy action is typically `noindex`.
- `expired`
  - An evidence source or governed record exceeded an explicit expiry boundary.
  - Policy action is `block`.

## Policy actions

- `review`
  - Human follow-up required; release remains allowed.
- `noindex`
  - The content may render in staging/preview but must be removed from indexable route inventories, sitemap, llms exposure, and canonical indexing treatment until reviewed again.
- `block`
  - Release fails. This is reserved for expired citations, blocked governance records, or any canonical content whose dependent evidence is expired.

## Current live policy

- Structured content:
  - Review window: `90` days
  - Stale action: `noindex`
  - Expired action: `block`
- Citations:
  - Internal governed citations: `90` days
  - External citations: `180` days
  - Stale action: `noindex`
  - Expired action: `block`
- Governance/legal docs:
  - Review window: `30` days
  - Stale action: `noindex`
  - Expired action: `block`
- Generated crawl/LLM assets:
  - Review window: `30` days
  - Stale action: `noindex`
  - Expired action: `block`

## Monthly review procedure

Run this from the repo root:

```bash
npm run report:freshness
```

Then review, in order:

1. `artifacts/freshness/report.md`
2. `artifacts/freshness/report.json`
3. Any entries in `upcoming_review`, `stale`, or `expired`

For each flagged record:

1. Re-check the underlying content, citation, or governance source.
2. If nothing substantive changed, update only the appropriate `reviewedDate`.
3. If a citation changed materially, replace or amend the source before moving the review date forward.
4. If a governed claim/disclosure changed, update the governed source first, then refresh dependent content or generated assets.
5. Re-run:
   - `npm run validate:citations`
   - `npm run validate:content`
   - `npm run validate:freshness`
   - `npm run validate:crawl`
   - `npm run qa:release`

## Update triggers

Re-review is required before the normal monthly cycle when any of the following occurs:

- A public claim changes in [docs/claims-register.md](./claims-register.md)
- Approved disclosure wording changes in [docs/disclosures.md](./disclosures.md)
- A content page, article, route, or template changes
- A citation source redirects, disappears, expires, or changes scope
- Indexability, canonical routing, sitemap coverage, llms coverage, or route attribution changes
- Legal/privacy/consent/indexing status changes under `F44-GOV-02`

## Release behavior

- `review_pending` and `upcoming_review` are reportable but non-blocking.
- `stale` canonical content is removed from indexable route inventories through the freshness policy and will therefore disappear from sitemap/llms/route-attribution outputs until reviewed.
- `expired` citations or other `block` actions fail `npm run validate:freshness` and therefore fail `npm run qa:release`.

## Identity and reviewer constraints

- Do not fabricate named authors or reviewers.
- Use role-based owner/reviewer states such as `role_assigned_identity_tbd` until a real approved identity exists.
- Do not invent `publishedDate` or `reviewedDate` for content records that have not actually been reviewed.

## Commands

- `npm run report:freshness`
- `npm run validate:freshness`
- `npm run qa:release`
