# Legal Policy & Governance Analysis (F44-GOV-02)

**Explorer 2 Investigation Report**  
**Date**: 2026-07-30  
**Target Milestone**: Milestone 2: Legal Mocks (`F44-GOV-02`)  
**Project Root**: `/Users/mattlilly/Documents/Projects/fund44-redesign`  

---

## Executive Summary

This report provides a comprehensive codebase investigation for drafting realistic mock privacy, terms, and consent policies to complete task `F44-GOV-02`. Current codebase analysis reveals that central entity details (`Fund44 LLC`, Austin address, support email, and phone) are already verified in `src/lib/legal.js`, while privacy, terms, and consent surfaces currently display conservative "draft/preview" notices.

To transition `F44-GOV-02` from blocked draft status to complete mock legal governance, the implementation must replace the draft notices with complete, professional mock policies while strictly respecting:
1. **13 Blocked Pattern Regexes** enforced by `scripts/validate-legal.mjs` across 16 governed files.
2. **Staging `noindex,nofollow` Default** enforced by `src/lib/legal.js`, `scripts/validate-crawl-files.mjs`, and `tests/crawl.test.mjs`.
3. **Empty `sameAs` Requirement** (`sameAs: []`) until external entity links are verified.
4. **Centralized Disclosure Agreement** (`F44-DISC-01` through `F44-DISC-13`).

---

## 1. Governed Files & Codebase Requirements

The legal governance infrastructure spans the following key files:

| File Path | Role & Purpose | Key Elements / Code References |
|---|---|---|
| `src/lib/legal.js` | Centralized legal configuration & entity model | `LEGAL_ENV`, `indexingPolicy`, `verifiedEntity`, `entityProfile`, `disclosures`, `liveDisclosuresBlocked`, `legalApprovalChecklist` |
| `src/pages/legal.js` | Page view renderers for `/privacy`, `/terms`, `/contact` | Renders legal headers, draft disclosure banners, policy sections, contact cards |
| `src/lib/eligibility/model.js` | Flow state & consent checklist logic | `getConsentChecklist()`, `getNextStepChecklist()` for preview and live modes |
| `src/components/flow.js` | Flow UI modal & consent checkboxes | Step 5 `consentReview` renderer, data attributes, error messaging |
| `docs/disclosures.md` | Centralized disclosure wording register | Disclosures `F44-DISC-01` to `13` and blocked patterns `F44-DISC-B01` to `B06` |
| `docs/claims-register.md` | Audit inventory of public claims | Source status, allowed scope, and safer replacements for all claims |
| `docs/legal-launch-checklist.md` | Milestone 2 launch readiness checklist | Identity, privacy, terms, indexing, and security launch criteria |
| `scripts/validate-legal.mjs` | Repository-local legal validator | Validates entity profile, sameAs, and 13 blocked patterns across 16 governed files |
| `tests/legal.test.mjs` | Legal test suite | Tests staging noindex, verified identity fields, empty sameAs, disclosure matching |
| `tests/crawl.test.mjs` | Crawl & robots test suite | Enforces `Disallow: /` in staging mode for robots.txt and sitemap generation |

---

## 2. Analysis of Current Placeholders & Validation Rules

### A. Current Identity & Disclosure State
- **Entity Identity**: `verifiedEntity` in `src/lib/legal.js` contains verified identity data:
  - `legalBusinessName`: `'Fund44 LLC'`
  - `mailingAddress`: `'5900 Balcones Dr, Suite 100, Austin, TX 78731'`
  - `supportEmail`: `'support@fund44.com'`
  - `supportPhone`: `'512-547-1547'`
  - `sameAs`: `[]` (Must remain an empty array until social/external URLs are verified)
  - `unresolvedIdentityFields`: Evaluates to `[]` (0 missing fields).
- **Draft Banners**:
  - `src/pages/legal.js` currently wraps `/privacy` and `/terms` in top disclosure banners:
    - `"Conservative disclosure draft. Business approved the conservative disclosure drafts... Privacy and consent language is currently in draft form..."`
  - `legalApprovalChecklist` in `src/lib/legal.js` labels Privacy and consent as `status: 'draft'`.

### B. Exact Validation Assertions (`scripts/validate-legal.mjs`)
`scripts/validate-legal.mjs` inspects 16 governed files:
`src/pages/legal.js`, `src/pages/home.js`, `src/pages/about.js`, `src/pages/how-it-works.js`, `src/pages/resources.js`, `content/pages/home.json`, `content/pages/resources.json`, `content/articles/sba-7a-vs-504.json`, `content/articles/preparing-your-documents.json`, `content/articles/working-capital-vs-term-loan.json`, `src/components/shell.js`, `src/components/ui.js`, `src/lib/seo.js`, `public/llms.txt`, `public/humans.txt`, `index.html`.

It enforces:
1. **Entity Profile Complete**: `unresolvedIdentityFields.length === 0`.
2. **Empty `sameAs`**: `entityProfile.sameAs.length === 0`.
3. **13 Blocked String Patterns**:
   - `/75\+\s+lender integrations/i` (unsupported lender-count wording)
   - `/\bLendflow\b/i` (unverified public vendor naming)
   - `/faster-funding\.com/i` (legacy sameAs reference)
   - `/Preview — legal review required/i` (scattered preview-only banner)
   - `/takes a few minutes|it takes minutes|in a few minutes/i` (exact process-time promise)
   - `/no black box|opaque scoring|what pays us most|secure flow|secure experience/i` (blocked ranking/security claims)
   - `/\$50K-\$5M small-business financing/i` (unapproved financing-range eyebrow)
   - `/Curated 40-50 lender network/i` (paraphrased count badge outside approved copy)
   - `/One application, many routes/i` (strong one-application routes claim)
   - `/One borrower journey feeds every relevant product path/i` (unsupported universal routing claim)
   - `/share your profile and documents once/i` (unsupported single-share claim)
   - `/Apply once and get matched to relevant paths from a network of lenders/i` (unsupported live-matching CTA claim)
   - `/Continue with one shared flow/i` (unsupported shared-flow wording)

### C. Staging Noindex & Environment Rules (`tests/legal.test.mjs` & `tests/crawl.test.mjs`)
- `LEGAL_ENV` defaults to `'staging'`, `PRODUCTION_INDEXING_APPROVED` defaults to `false`.
- `indexingPolicy.allowIndexing` is `false`.
- Meta robots outputs `noindex,nofollow`.
- Generated `public/robots.txt` outputs `Disallow: /`.
- **Rule**: Updating legal policies to full mock versions must NOT flip `PRODUCTION_INDEXING_APPROVED` to `true` unless production indexing is explicitly authorized.

---

## 3. Blueprint for Realistic Mock Policies

To replace placeholder text with realistic mock privacy, terms, and consent policies for `F44-GOV-02`, the mock policies should be structured into formal sections that match standard financial marketplace standards:

### Privacy Policy Structure
1. **Scope & Overview**: Outlines how Fund44 LLC handles business and personal contact information submitted via the website or intake tools.
2. **Information Collected**:
   - *Business Information*: Company name, entity type, industry, annual revenue, time in business, requested financing amount, intended use of funds.
   - *Contact Information*: Representative name, business email address (`support@fund44.com`), telephone number, mailing address.
   - *Technical Data*: Browser type, IP address, device type, cookie preferences (in-browser session data).
3. **Use of Information**: Personalizing financing recommendations, communicating status, operating the intake workflow, complying with legal obligations.
4. **Information Sharing & Disclosures**:
   - *Curated Lender Network*: Shared with selected third-party financing providers (typically 40 to 50 providers) only after explicit borrower consent.
   - *Service Providers*: Infrastructure providers supporting intake workflows (e.g., embedded lending technology partners).
   - *Legal & Regulatory Compliance*: Disclosures required by law, subpoena, or regulatory authority.
5. **Data Security & Retention**: Technical and administrative safeguards; data retention schedules (e.g., 7 years for intake records, 90 days for incomplete inquiries).
6. **Borrower Rights & Choices**: Access, correction, opt-out of marketing, deletion requests via `support@fund44.com`.

### Terms of Service Structure
1. **Acceptance & Scope**: Terms governing use of the Fund44 marketplace website.
2. **Marketplace & Not-a-Lender Disclosure**: Centralized `F44-DISC-01` text ("Fund44 is a small-business capital marketplace. Fund44 is not a lender or a bank...").
3. **No Guarantees Disclaimer**: Centralized `F44-DISC-02` text ("Fund44 does not guarantee approval, funding, or any specific timeline, rate, or amount...").
4. **Credit Inquiry Notice**: Centralized `F44-DISC-03` text explaining soft vs. hard credit inquiries.
5. **Educational Content Disclaimer**: Centralized `F44-DISC-04` text regarding general educational information.
6. **Intellectual Property & Acceptable Use**: Permitted use of site materials, prohibited reverse engineering or scraping.
7. **Governing Law & Dispute Resolution**: State of Texas jurisdiction; Austin venue.

### Consent & Flow Disclosures
1. **Intake Consent**: Explicit acknowledgment before submitting intake forms.
2. **Lender Sharing Consent**: Explicit opt-in checkbox before transferring contact details to matched network providers.
3. **Communication Consent**: Consent to receive email and phone communications regarding financing requests from `support@fund44.com` / `512-547-1547`.

---

## 4. Step-by-Step Implementation Plan for Implementer Agent

When an implementer agent is assigned to execute `F44-GOV-02`:

1. **Step 1: Claim Task in `ROADMAP.md`**
   - Update `F44-GOV-02` status line to `in progress - implementer/f44-gov-02`.

2. **Step 2: Update Policy Content in `src/lib/legal.js` & `src/pages/legal.js`**
   - Draft comprehensive mock policy sections for `/privacy` and `/terms` replacing draft banners.
   - Preserve exact centralized disclosures (`disclosures.networkStory`, `disclosures.fitOverFees`, `disclosures.fasterProcess`, `disclosures.marketplacePreview`, etc.).
   - Update `legalApprovalChecklist` status in `src/lib/legal.js` from `'draft'` to `'approved-mock'` for Privacy, Terms, and Consent.

3. **Step 3: Refine Consent Checklists in `src/lib/eligibility/model.js`**
   - Update `getConsentChecklist()` and `getNextStepChecklist()` to provide clear, realistic mock consent statements for both preview and live modes.

4. **Step 4: Update Documentation Artifacts**
   - Update `docs/disclosures.md`, `docs/claims-register.md`, and `docs/legal-launch-checklist.md` to record completion of mock legal policy drafting.

5. **Step 5: Run Verification Suite & Update Roadmap**
   - Run `npm run validate:legal`
   - Run `npm run validate:crawl`
   - Run `npm test`
   - Run `npm run qa:release`
   - Update `ROADMAP.md` task status to `done` and add changelog entry.

---
