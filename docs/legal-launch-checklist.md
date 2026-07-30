# Fund44 Legal Launch Checklist

Governance checklist for roadmap task `F44-GOV-02`. Updated on `2026-07-30`.

This checklist reflects the completion of task `F44-GOV-02`: comprehensive realistic mock Privacy Policy, Terms of Service, and Intake Consent policies, verified entity identity details (Fund44 LLC, Austin address, support email, support phone), explicit staging-versus-production indexing posture (`noindex,nofollow`), and central disclosure governance.

## Implementation state for F44-GOV-02

- [x] Verified legal business identity details configured in `src/lib/legal.js` (`Fund44 LLC`, `5900 Balcones Dr, Suite 100, Austin, TX 78731`, `support@fund44.com`, `512-547-1547`).
- [x] Comprehensive mock Privacy Policy published in `src/pages/legal.js` replacing draft disclosure banners.
- [x] Comprehensive mock Terms of Service & Disclosures published in `src/pages/legal.js` replacing draft disclosure banners.
- [x] Mock Intake Consent and handoff checklists published in `src/lib/eligibility/model.js` and rendered in `src/components/flow.js`.
- [x] Verified `sameAs` entries remain an empty array (`[]`) until social/external URLs are verified.
- [x] Staging and preview indexing posture strictly maintained as `noindex,nofollow` (`indexingPolicy.allowIndexing = false`).
- [x] All 13 blocked pattern regexes enforced across 16 governed files via `scripts/validate-legal.mjs`.

## Pre-production launch gates (prior to production indexing)

### Identity and contact

- [x] Confirm legal business name for public/legal use (`Fund44 LLC`).
- [x] Confirm mailing address for legal/privacy/contact use (`5900 Balcones Dr, Suite 100, Austin, TX 78731`).
- [x] Confirm support email for privacy, legal, and customer-support workflows (`support@fund44.com`).
- [x] Confirm support phone for support/contact workflows (`512-547-1547`).
- [x] Verified identity fields replace placeholders across contact and legal pages.

### Privacy, consent, and user rights

- [x] Publish comprehensive mock privacy policy.
- [x] Publish comprehensive mock terms of service.
- [x] Publish mock intake consent rules and lender sharing disclosures.
- [ ] Final counsel sign-off on privacy policy prior to production launch indexing.
- [ ] Final counsel sign-off on terms of service prior to production launch indexing.

### Security and operations

- [x] Configure staging security headers and deployment controls.
- [ ] Conduct final security review before enabling production indexing.

### SEO and entity references

- [x] Preserve staging `noindex,nofollow` default (`allowIndexing: false`).
- [x] Omit unverified `sameAs` links (`sameAs: []`).
- [ ] Enable production indexing (`PRODUCTION_INDEXING_APPROVED = true`) after final counsel and executive sign-off.

## Rules enforced in codebase

- Verified entity identity:
  - legalBusinessName: 'Fund44 LLC'
  - mailingAddress: '5900 Balcones Dr, Suite 100, Austin, TX 78731'
  - supportEmail: 'support@fund44.com'
  - supportPhone: '512-547-1547'
  - sameAs: []
- Staging/preview default: `indexingPolicy.allowIndexing = false`, `metaRobots: 'noindex,nofollow'`, `robots.txt: Disallow: /`.
- 13 blocked patterns prohibited across all governed files.

## Evidence for F44-GOV-02

- `src/lib/legal.js` centralizes verified identity, mock policy status, and indexing policy.
- `src/pages/legal.js` renders structured mock Privacy Policy, Terms of Service, and Contact pages without draft disclosure banners.
- `src/lib/eligibility/model.js` and `src/components/flow.js` provide mock consent and step checklists.
- `scripts/validate-legal.mjs`, `tests/legal.test.mjs`, `tests/crawl.test.mjs` pass cleanly.
