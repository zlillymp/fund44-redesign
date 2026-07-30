# Fund44 Centralized Disclosures

Central wording source for roadmap tasks `F44-GOV-01` and `F44-GOV-02`. Updated on `2026-07-30`.

This file centralizes approved and draft disclosure language so pages, manifests, and AI-facing files stop inventing variations. Under task `F44-GOV-02`, realistic mock privacy, terms, and consent policies have been drafted and published for staging and evaluation alongside verified entity identity details (Fund44 LLC, 5900 Balcones Dr, Suite 100, Austin, TX 78731, support@fund44.com, 512-547-1547). Formal counsel review remains recommended before broad production indexing.

## Use rules

- Reuse these IDs in page copy, content manifests, future trust modules, and AI-facing files.
- Prefer exact reuse over paraphrase. If a page needs a materially different claim, add a new disclosure ID instead of freehanding it.
- `Preview` wording is for the current demo build only.
- `Business-approved draft` wording may be used in conservative public or staging drafts based on the business approvals recorded above.
- `Blocked` wording must not be used publicly until the listed owner approvals exist.

## Status legend

- `Business-approved draft`: wording is approved by business for conservative public and staging draft use; formal counsel review is still recommended.
- `Pending`: draft wording exists but no final approval artifact is in the repo.
- `Blocked`: external legal, business, partner, privacy, or security verification is still required before use.
- `Preview-verified`: wording is aligned with the current checked-in preview behavior, but still lacks final legal sign-off.

## Core disclosures

### `F44-DISC-01` Marketplace and not-lender baseline

- Purpose: use anywhere Fund44 is described at a high level.
- Owner role: Legal + Brand + Operations
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: blocked pending legal and entity approval
- Preview wording:

```text
Fund44 is a small-business capital marketplace. Fund44 is not a lender or a bank. Financing is offered by third-party providers, and eligibility, availability, rates, and terms are determined by those providers.
```

- Live wording:

```text
Blocked pending legal approval of final entity description and marketplace disclosure.
```

- Notes:
  Use this as the default source for footer, hero FAQ, legal, and AI-facing marketplace language once legal review is complete.

### `F44-DISC-02` No guarantees

- Purpose: use anywhere timelines, approval, rate, or amount expectations could be inferred.
- Owner role: Legal
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: pending legal approval
- Preview wording:

```text
Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount.
```

- Live wording:

```text
Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount. Offers and terms, if any, are determined by the provider you choose to proceed with.
```

### `F44-DISC-03` Credit inquiry disclosure

- Purpose: use on funnel, footer, product pages, and legal pages where credit impact is discussed.
- Owner role: Legal + Product + Partner management
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: blocked until partner-process and consent review are complete
- Preview wording:

```text
Checking the preview uses information that does not affect your credit score because the current preview does not submit an application to a lender.
```

- Live wording:

```text
Checking initial options may use information that does not affect your credit score. If you choose to proceed with a provider, that provider may later perform a hard credit inquiry as part of its own underwriting.
```

- Notes:
  Do not use the live wording until the real submission flow and lender handoff are finalized.

### `F44-DISC-04` Educational-content disclaimer

- Purpose: use on articles, comparison pages, and product explainers.
- Owner role: Legal + Content ops
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: pending legal approval
- Preview wording:

```text
This content is general and educational in nature. It is not financial, legal, or tax advice. Program rules, eligibility, and provider requirements can change.
```

- Live wording:

```text
This content is general and educational in nature. It is not financial, legal, or tax advice. Program rules, eligibility, and provider requirements are set by the relevant agencies and providers and can change.
```

### `F44-DISC-05` Illustrative data and example structures

- Purpose: use near demo numbers, demo offers, sample timelines, sample match counts, and interface examples.
- Owner role: Legal + Product + Content ops
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: pending product and legal review
- Preview wording:

```text
Illustrative example for demonstration only. Any paths, structures, amounts, fit scores, or timelines shown here are sample interface data and are not an offer, approval, or lender decision.
```

- Live wording:

```text
If example structures are shown, they are illustrative only. Actual offers, amounts, and terms are determined by the provider.
```

### `F44-DISC-06` Preview-only product state

- Purpose: use on the preview flow, preview CTA areas, footer, and legal pages while the site remains a demo.
- Owner role: Legal + Product + Operations
- Status: Preview-verified
- Allowed scope:
  Preview: yes
  Live: no
- Preview wording:

```text
Preview only. This flow shows sample results, does not create an application, and does not send your information to a lender or server in the current build.
```

- Live wording:

```text
Do not use in live mode.
```

### `F44-DISC-07` Preview privacy and data-use boundary

- Purpose: use on the preview flow and preview privacy page.
- Owner role: Legal + Privacy owner + Product
- Status: Preview-verified
- Allowed scope:
  Preview: yes
  Live: no
- Preview wording:

```text
In the current preview, the information you enter stays in your browser and is used only to personalize the on-screen demo result.
```

- Live wording:

```text
Do not use in live mode. Replace with final privacy and consent language approved under F44-GOV-02.
```

### `F44-DISC-08` Live privacy and sharing boundary

- Purpose: future replacement for preview privacy wording once the live experience exists.
- Owner role: Legal + Privacy owner + Product + Operations
- Status: Blocked
- Allowed scope:
  Preview: no
  Live: blocked pending final policy and consent design
- Preview wording:

```text
Do not use in preview mode.
```

- Live wording:

```text
Blocked pending final privacy policy, consent flow, lender-sharing controls, retention rules, and verified contact details.
```

### `F44-DISC-09` Product and provider variability

- Purpose: use on product pages and financing comparison pages.
- Owner role: Legal + Operations + Content ops
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: pending operations and legal approval
- Preview wording:

```text
Product availability, amount ranges, timelines, and terms vary by provider and by business profile.
```

- Live wording:

```text
Product availability, amount ranges, timelines, and terms vary by provider, product, and business profile.
```

### `F44-DISC-10` Contact and legal placeholder state

- Purpose: use while verified contact details and final legal dates are still missing.
- Owner role: Legal + Operations
- Status: Preview-verified
- Allowed scope:
  Preview: yes
  Live: no
- Preview wording:

```text
Contact details and final legal copy are placeholders in this preview build and must be replaced with verified information before launch.
```

- Live wording:

```text
Do not use in live mode.
```

### `F44-DISC-11` Curated network story

- Purpose: use on network descriptions, about/home pages, FAQs, and AI-facing summaries where the lender-network story is explained.
- Owner role: Business + Brand + Operations
- Status: Business-approved draft
- Allowed scope:
  Preview: yes
  Live: yes for conservative public wording; formal counsel review remains recommended
- Preview wording:

```text
Fund44 launched with 44 lenders. That number is behind the name and remains the operating sweet spot for the network. Today Fund44 curates a network that typically fluctuates between 40 and 50 lenders as it removes providers that fall short of its customer-service standards and adds providers that offer competitive terms, better tools, or new financing options. The network can change over time, and the paths shown in the experience may vary by business profile, financing need, geography, and current provider participation.
```

- Live wording:

```text
Fund44 launched with 44 lenders. That number is behind the name and remains the operating sweet spot for the network. Today Fund44 curates a network that typically fluctuates between 40 and 50 lenders as it removes providers that fall short of its customer-service standards and adds providers that offer competitive terms, better tools, or new financing options. The network can change over time, and the paths shown in the experience may vary by business profile, financing need, geography, and current provider participation.
```

- Notes:
  Use `customer-service standards` exactly. Do not revert to `75+ lender integrations`, do not promise lender availability, and do not imply uniform lender conduct or outcomes.

### `F44-DISC-12` Fit-over-fees and routing explanation

- Purpose: use where Fund44 explains why a path may be shown and how fit language should be framed.
- Owner role: Business + Product + Brand
- Status: Business-approved draft
- Allowed scope:
  Preview: yes
  Live: yes for conservative public wording; formal counsel review remains recommended
- Preview wording:

```text
Fund44 is built around fit over fees. The experience explains why a path may fit based on the information provided, the stated financing need, and the product details available in the experience.
```

- Live wording:

```text
Fund44 is built around fit over fees. The experience explains why a path may fit based on the information provided, the stated financing need, and the product details available in the experience.
```

- Notes:
  Do not expand this into `ranked by fit`, `filtered out`, `no black box`, `no opaque scoring`, or `not by what pays us most` unless compensation and routing governance are documented separately.

### `F44-DISC-13` Faster process and workflow availability

- Purpose: use where the product workflow is described without promising a specific timeline or universal feature availability.
- Owner role: Business + Product + Operations
- Status: Business-approved draft
- Allowed scope:
  Preview: yes
  Live: yes for conservative public wording; formal counsel review remains recommended
- Preview wording:

```text
Fund44 is designed for a faster process, with routing explanations, one document checklist, document reuse where supported in the workflow, status tracking, and offer comparison when those steps are available in the experience. Exact timing, available paths, and workflow details can vary by provider and by business profile.
```

- Live wording:

```text
Fund44 is designed for a faster process, with routing explanations, one document checklist, document reuse where supported in the workflow, status tracking, and offer comparison when those steps are available in the experience. Exact timing, available paths, and workflow details can vary by provider and by business profile.
```

- Notes:
  Do not promise a specific number of minutes or days. Do not imply that every provider supports every step, or that status tracking, document reuse, and offer comparison are always available in every flow.

## Conditional or blocked claims that should not be reused without separate approval

### `F44-DISC-B01` Vendor-name disclosure

- Purpose: naming `Lendflow` publicly.
- Owner role: Partner management + Legal + Brand
- Status: Blocked
- Allowed scope:
  Preview: blocked unless partner approval exists
  Live: blocked unless partner approval exists
- Replacement:

```text
embedded lending infrastructure
```

### `F44-DISC-B02` Unsupported lender-count disclosure

- Purpose: using `75+ lender integrations` or any lender-count phrasing that conflicts with `F44-DISC-11`.
- Owner role: Partner management + Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked except for the exact curated-network wording in `F44-DISC-11`
  Live: blocked except for the exact curated-network wording in `F44-DISC-11`
- Replacement:

```text
Use F44-DISC-11.
```

### `F44-DISC-B03` Fairness, ranking, or compensation-governance disclosure

- Purpose: statements such as `ranked by fit`, `not by what pays us most`, or any other undisclosed compensation or ranking governance claim.
- Owner role: Legal + Operations + Product + Brand
- Status: Blocked
- Allowed scope:
  Preview: blocked except for the exact wording in `F44-DISC-12`
  Live: blocked except for the exact wording in `F44-DISC-12`
- Replacement:

```text
Use F44-DISC-12.
```

### `F44-DISC-B04` Security claim

- Purpose: words such as `secure flow` or `secure experience`.
- Owner role: Security + Legal + Product
- Status: Blocked
- Allowed scope:
  Preview: blocked
  Live: blocked until security review exists
- Replacement:

```text
single flow
```

### `F44-DISC-B05` Human specialist or operating-step claim

- Purpose: statements such as `a specialist confirms details`.
- Owner role: Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked
  Live: blocked until the operating workflow is approved
- Replacement:

```text
additional details may be requested during the process
```

### `F44-DISC-B06` Track record or performance disclosure

- Purpose: claims about a prior track record, guaranteed acceleration, or business-history/performance statements beyond the approved `44` origin story and conservative faster-process wording.
- Owner role: Brand + Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked except for the exact wording in `F44-DISC-11` and `F44-DISC-13`
  Live: blocked except for the exact wording in `F44-DISC-11` and `F44-DISC-13`
- Replacement:

```text
Use F44-DISC-11 and F44-DISC-13.
```

## Remaining follow-ups after `F44-GOV-01`

1. Formal counsel review of `F44-DISC-01` through `F44-DISC-13` remains recommended, even though business approved `F44-DISC-11` through `F44-DISC-13` for conservative public and staging draft use on `2026-07-25`.
2. `F44-GOV-02` still must supply the legal business name, business address, support email, support phone, final privacy and consent language, final terms and entity/contact copy, and verified `sameAs` and indexing rules.
3. Partner and legal approval is still required before naming `Lendflow` publicly or publishing vendor-specific attribution copy.
4. Security and privacy owners still need to approve any live-mode security, sharing, retention, and user-rights language beyond the current preview boundary.
