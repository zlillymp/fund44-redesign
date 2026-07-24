# Fund44 Centralized Disclosures

Central wording source for roadmap task `F44-GOV-01`. Reviewed on `2026-07-24`.

This file does not create approval by itself. It centralizes draft wording so pages can stop inventing variations. Each disclosure below must remain `Pending` until the required owner approves it. Where a disclosure depends on the current preview implementation, the preview and live variants are separated explicitly.

## Use rules

- Reuse these IDs in page copy, content manifests, future trust modules, and AI-facing files.
- Prefer exact reuse over paraphrase. If a page needs a materially different claim, add a new disclosure ID instead of freehanding it.
- `Preview` wording is for the current demo build only.
- `Live` wording is blocked until legal, operations, product, and partner approvals exist where noted.

## Status legend

- `Pending`: draft wording exists but no approval artifact is in the repo.
- `Blocked`: external legal, business, or partner verification is required before use.
- `Preview-verified`: wording is aligned with the current checked-in preview behavior, but still lacks legal sign-off.

## Core disclosures

### `F44-DISC-01` Marketplace and not-lender baseline

- Purpose: use anywhere Fund44 is described at a high level.
- Owner role: Legal + Brand + Operations
- Status: Pending
- Allowed scope:
  Preview: yes
  Live: blocked pending legal/entity approval
- Preview wording:

```text
Fund44 is a small-business capital marketplace. Fund44 is not a lender or a bank. Financing is offered by third-party providers, and eligibility, availability, rates, and terms are determined by those providers.
```

- Live wording:

```text
Blocked pending legal approval of final entity description and marketplace disclosure.
```

- Notes:
  Use this as the default source for footer, hero FAQ, legal, and AI-facing marketplace language.

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
  Live: pending product/legal review
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

### `F44-DISC-07` Preview privacy/data-use boundary

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
  Live: pending operations/legal approval
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

### `F44-DISC-B02` Lender-network count disclosure

- Purpose: using `75+ lender integrations` or any similar count.
- Owner role: Partner management + Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked unless a dated source and public-use approval exist
  Live: blocked unless a dated source and public-use approval exist
- Replacement:

```text
third-party lender network
```

### `F44-DISC-B03` Ranking/fairness disclosure

- Purpose: statements such as `fit over fees`, `ranked by fit`, or `not by what pays us most`.
- Owner role: Legal + Operations + Product + Brand
- Status: Blocked
- Allowed scope:
  Preview: blocked for public use without policy support
  Live: blocked for public use without policy support
- Replacement:

```text
We surface paths using the information provided in the experience.
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

### `F44-DISC-B05` Human specialist / operating-step claim

- Purpose: statements such as `a specialist confirms details`.
- Owner role: Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked
  Live: blocked until operating workflow is approved
- Replacement:

```text
additional details may be requested during the process
```

### `F44-DISC-B06` Track record / faster funding trust claim

- Purpose: statements about a prior track record or making funding faster.
- Owner role: Brand + Operations + Legal
- Status: Blocked
- Allowed scope:
  Preview: blocked without evidence
  Live: blocked without evidence
- Replacement:

```text
Retire until a verified company-history or performance evidence package exists.
```

## Minimum approvals needed before this file can become a live source of truth

1. Legal review of `F44-DISC-01` through `F44-DISC-10`.
2. Operations and partner-management approval for any public lender-network, product-coverage, or vendor-reference statements.
3. Product review of preview-versus-live state transitions for the funnel, privacy, and credit language.
4. Security review before any public use of security or data-protection claims beyond the narrow preview boundary now supported by code.
