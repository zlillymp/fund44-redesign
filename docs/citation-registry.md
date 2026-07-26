# Fund44 Citation Registry

`F44-SEO-04` makes `content/citations.mjs` the source of truth for structured-content evidence. The registry exists so claim-bearing content records can cite either:

- approved internal evidence for governed Fund44-specific copy
- external primary or reference sources for product, program, and educational claims

## Registry rules

- Every claim-bearing content record must declare `claimIds`, `claimReview`, and `citationIds`.
- `claimIds` must map to IDs already tracked in [docs/claims-register.md](./claims-register.md).
- `citationIds` must resolve to entries in `content/citations.mjs`.
- Internal citations are limited to `business_approved_draft` or `preview_verified` evidence already centralized in [docs/disclosures.md](./disclosures.md).
- Product, program, editorial, and document-guidance scopes must include at least one external citation.
- Validation fails on missing, duplicate, expired, or scope-mismatched citations.

## Scope model

Use `claimReview.evidenceScopes` to tell the validator which evidence class applies:

- `network_story`, `routing_explanation`, `workflow_availability`, `preview_notice`, and `credit_disclosure` can use approved internal evidence.
- `product_overview`, `program_detail`, `educational_editorial`, and `document_guidance` must include external citations.
- `marketplace_disclosure` remains governed through the claims/disclosures docs, but no `F44-SEO-04` content record currently relies on it as approved internal evidence.

## Current inventory

| Citation ID | Type | Scope(s) | Source |
| --- | --- | --- | --- |
| `internal_disc_11_network_story` | Internal approved | `network_story` | `docs/disclosures.md` |
| `internal_disc_12_routing_explanation` | Internal approved | `routing_explanation` | `docs/disclosures.md` |
| `internal_disc_13_workflow` | Internal approved | `workflow_availability` | `docs/disclosures.md` |
| `internal_disc_03_preview_credit` | Internal approved | `credit_disclosure` | `docs/disclosures.md` |
| `internal_disc_06_preview_only` | Internal approved | `preview_notice` | `docs/disclosures.md` |
| `external_sba_loans_overview_2026_07_26` | External primary | `product_overview`, `educational_editorial` | SBA loans overview |
| `external_sba_7a_loans_2026_07_26` | External primary | `product_overview`, `program_detail`, `educational_editorial` | SBA 7(a) loans |
| `external_sba_504_loans_2026_07_26` | External primary | `product_overview`, `program_detail`, `educational_editorial` | SBA 504 loans |
| `external_sba_change_of_ownership_2026_07_26` | External primary | `product_overview`, `educational_editorial` | SBA loan-program improvements |
| `external_sba_buy_existing_business_2026_07_26` | External primary | `product_overview`, `educational_editorial`, `document_guidance` | SBA buy-an-existing-business guide |
| `external_wf_businessline_2026_07_26` | External reference | `product_overview`, `educational_editorial` | Wells Fargo BusinessLine |
| `external_chase_business_loans_2026_07_26` | External reference | `product_overview`, `educational_editorial` | Chase business loans |
| `external_wf_credit_application_2026_07_26` | External reference | `document_guidance`, `educational_editorial` | Wells Fargo credit-application guide |
| `external_wf_prepare_credit_2026_07_26` | External reference | `document_guidance`, `educational_editorial` | Wells Fargo pre-application checklist |

## Refresh workflow

1. Review the claim-bearing content record and confirm its `claimIds`.
2. Reuse an existing citation when the scope and claim coverage already match.
3. Add a new citation entry only when the current registry does not cover the claim cleanly.
4. Update `reviewedDate` whenever a source is rechecked; move `expiresDate` forward or replace stale sources before it lapses.
5. Run `npm run validate:citations` and `npm run validate:content` before opening or updating the PR.
